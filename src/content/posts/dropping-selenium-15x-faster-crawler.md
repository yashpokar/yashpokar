---
title: Dropping Selenium made our crawler 15× faster
summary: Headless browsers are the easy answer to scraping and almost never the right one. How we replaced a Selenium fleet with request-level crawling on Scrapy and AWS, and what it taught me about hidden cost.
date: 2025-03-09
tags: [Python, Scraping, AWS, Performance]
featured: true
---

Every scraping project I have seen starts the same way. Someone opens a product page, notices the price only appears after JavaScript runs, and reaches for a headless browser. It works on the first day. Six months later you own a fleet of Chrome instances that eat four gigabytes of RAM each, fall over on a schedule, and crawl at the speed of a human with a slow connection.

That was the state of the pipeline I inherited at my first job. We were tracking SKUs across dozens of e-commerce sites for a monetisation product, and the Selenium layer had quietly become the bottleneck for the whole company. This post is about how we removed it and what changed.

## The browser is not the data source

The key realisation is boring but important: the browser is not where the data lives. The browser is a client. It fetches HTML, then fires off a handful of XHR or fetch calls to JSON endpoints, then paints the result. When you drive a browser to scrape, you are paying for the painting step and throwing it away.

So the first thing we did for every target site was open the network tab and watch what the page itself requested. In most cases one of three things was true:

1. **The data was already in the HTML**, embedded as a JSON blob in a `<script>` tag for hydration. No JavaScript needed at all.
2. **The data came from a clean JSON API** that we could call directly with the same headers the page used.
3. **The data was rendered server-side on a mobile or AMP variant** of the page that the desktop site hid from us.

Only a small minority of sites genuinely required executing JavaScript, and for those we kept a tiny, isolated browser pool instead of a fleet.

## What the new pipeline looked like

We rebuilt on [Scrapy](https://scrapy.org), which is still my favourite piece of Python infrastructure for this job. Each target got a spider that knew how to turn a product URL into the one or two HTTP requests that actually carried the data.

```python
class ProductSpider(scrapy.Spider):
    name = "retailer"
    custom_settings = {
        "CONCURRENT_REQUESTS_PER_DOMAIN": 8,
        "AUTOTHROTTLE_ENABLED": True,
        "RETRY_HTTP_CODES": [429, 500, 502, 503],
    }

    def parse(self, response):
        # Data is hydrated from an inline JSON blob — no browser needed.
        state = response.css("script#__NEXT_DATA__::text").get()
        product = json.loads(state)["props"]["pageProps"]["product"]
        yield {
            "sku":   product["sku"],
            "price": product["offers"]["price"],
            "stock": product["offers"]["availability"],
        }
```

Spiders ran as containers on AWS. URLs to crawl went onto a Kafka topic, workers pulled from it, and results landed on another topic that downstream services consumed. Redis handled per-domain rate limits so that scaling workers up never meant hammering a single retailer harder.

## The numbers

| | Before (Selenium) | After (Scrapy) |
|---|---|---|
| Pages per worker per minute | ~4 | ~60 |
| Memory per worker | 3–4 GB | ~150 MB |
| Full catalogue refresh | ~15 hours | ~1 hour |

The headline figure was a roughly 15× throughput improvement, but the memory number mattered more operationally. We went from a handful of large, fragile instances to many small, disposable ones. A worker crashing became a non-event.

## What I would tell past me

**Spend the first day in the network tab.** The hour you invest reverse-engineering a site's API pays back every single crawl afterward.

**Treat the browser as the fallback, never the default.** Isolate it, cap it, and make it ashamed of itself.

**Design for being blocked.** Rotate user agents, respect `Retry-After`, back off exponentially. Being polite is cheaper than being banned.

**Measure the cost per page, not just the speed.** The fastest crawler in the world is useless if the AWS bill makes it the most expensive line item in the company. Ours dropped along with the RAM.

This was the project that taught me to distrust the first tool that works. The headless browser was never wrong, exactly. It was just solving a different problem from the one we had.
