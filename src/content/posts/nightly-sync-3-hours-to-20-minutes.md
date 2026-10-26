---
title: "From 3.5 hours to 20 minutes: rewriting a nightly SKU sync"
summary: The batch job nobody wanted to touch. A story about profiling before guessing, concurrency with a budget, and why idempotency is the feature that lets you go fast.
date: 2025-09-14
tags: [Java, Performance, Concurrency, Data Pipelines]
---

Every company has a batch job like this one. It runs at night, it has run at night for years, and it has grown from "quick" to "finishes before people arrive, usually". Ours was at Zivame, India's largest lingerie platform, where a catalogue is not just products but every size, cup and colour variant of each. The job synced the full SKU catalogue between the commerce platform and the warehouse systems. It took three and a half hours, and on bad nights it was still running when the morning traffic began.

We got it down to twenty minutes. Not with a rewrite in a faster language or a bigger machine, but with three changes that I now reach for on almost every slow pipeline.

## First, find out where the time actually goes

I had a theory before I profiled. The theory was wrong. I assumed the database was slow. In fact the database was mostly idle, waiting on us.

A quick pass with a sampling profiler and some timing logs showed the shape of the problem:

- **~70%** of wall-clock time was spent waiting on HTTP calls to the warehouse API, one SKU at a time.
- **~20%** was serialising and deserialising payloads we did not need all of.
- **~10%** was actual database work.

The job was sequential, I/O bound, and doing one thing at a time. Nothing about it was compute-limited. This is the most common shape of slow batch job I have ever encountered, and the fix is always the same: stop waiting in a line.

## Concurrency, with a budget

The naive version of "add concurrency" is to throw every SKU onto a thread pool and let the warehouse API deal with it. That is how you take down the warehouse API. The version that works has a budget.

```java
var limiter  = new Semaphore(32);              // never more than 32 in flight
var executor = Executors.newVirtualThreadPerTaskExecutor();

List<Future<SyncResult>> results = new ArrayList<>();
for (List<Sku> batch : partition(skus, 100)) {   // 100 SKUs per request
    results.add(executor.submit(() -> {
        limiter.acquire();
        try {
            return warehouse.upsertBatch(batch);
        } finally {
            limiter.release();
        }
    }));
}
```

Two things are happening here. We **batch** SKUs into groups of a hundred because the warehouse API supported bulk upserts that nobody had ever used, so one round trip replaced a hundred. Then we **bound the concurrency** with a semaphore so that the number of in-flight requests is a number we chose, not a number that emerges from how many cores we happen to have.

Finding the right budget was empirical. We started at eight, watched the warehouse API's latency, and raised it until the p99 started to climb. Thirty-two was the knee.

## Idempotency is what lets you retry

Concurrency introduces failure modes that the sequential job never had. A batch times out halfway. A worker dies. The same batch gets submitted twice because of a retry.

The old job dealt with this by not dealing with it: if it failed, someone ran it again from the start in the morning, and three and a half hours became seven. The new job could not afford that, so every upsert carried an idempotency key derived from the SKU and the sync run ID, and the warehouse side treated a repeated key as a no-op.

Once writes were idempotent, retries became safe, and safe retries meant we could be aggressive: short timeouts, immediate retry with backoff, move on. The job stopped having a long tail.

## Stop moving data you do not need

The remaining win was dull. The sync pulled full SKU records, including description text and image URLs, when the warehouse only cared about identifiers, quantities and locations. Trimming the projection cut payload size by about 80% and took serialisation off the profile entirely.

## The result

| | Before | After |
|---|---|---|
| Wall-clock time | ~3.5 hours | ~20 minutes |
| API calls | ~180,000 | ~1,800 |
| Failure recovery | Re-run from scratch | Resume, idempotent |

The twenty minutes was the number people remembered. The idempotency was the change that mattered. It is what let us run the sync more than once a day, which quietly fixed a class of stock-level bugs that had nothing to do with speed.

## The checklist I now use

1. Profile first. Your theory is probably wrong and it is cheap to find out.
2. If it is I/O bound, batch and parallelise. Bound the parallelism explicitly.
3. Make every write idempotent before you make anything fast.
4. Move only the fields you need.
5. Measure the downstream system's latency while you tune, not just your own throughput.

None of this is clever. That is rather the point.
