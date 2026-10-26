---
title: "Fine-tune, retrieve, or just prompt? A decision I keep re-making"
summary: The question comes up on every LLM project and the answer keeps changing with the models. The rule I use now, when LoRA earns its keep, and why the eval set has to exist before any of it.
date: 2026-06-07
tags: [AI, Fine-tuning, RAG, LLMs]
---

Every few months someone on a project asks whether we should fine-tune. Usually the prompt has grown to three screens of instructions and examples, the model still occasionally ignores one of them, and fine-tuning feels like the grown-up answer. Sometimes it is. More often it is a way of avoiding the labelled-data work that would have fixed the prompt.

Here is the rule I have settled on, and the places where I have been wrong.

## The one question

**Are you giving the model knowledge, or teaching it a behaviour?**

- Knowledge changes. Prices, docs, schemas, a customer's own data. Knowledge belongs in retrieval, because weights go stale the day after you train them and retrieval does not.
- Behaviour is stable. A house style. A strict output format. A policy about what to refuse. A domain's vocabulary. Behaviour is what fine-tuning is for, because it is what prompts struggle to hold consistently under pressure.

Prompting is where you always start, because it is free and the iteration loop is minutes. The decision is about what to do when prompting stops being enough.

## Signs the prompt has outgrown itself

- You keep adding few-shot examples and each one fixes a case and breaks another.
- The system prompt is now most of your token budget, and latency and cost show it.
- The model follows the format 97% of the time, and the 3% is what pages your on-call.
- You need a smaller, cheaper model to hit a latency or cost target and it cannot follow the long prompt at all.

That last one is the strongest signal. A small model fine-tuned on a narrow task often beats a large model prompted into it, at a fraction of the cost per call. At high volume on a narrow task, that gap pays for the training many times over. At low volume it never does.

## What fine-tuning looks like in practice now

For most teams it means **LoRA or QLoRA on an open-weight model**, not full fine-tuning. Low-rank adapters train a small number of extra parameters, so a 7–8B model fits comfortably on a single modern GPU and the adapter is a few hundred megabytes you can version like any other artifact. QLoRA quantises the base model to get the same job done on a consumer card at a small quality cost.

The training recipe is less important than the data. A few thousand high-quality examples of the exact behaviour, cleaned, deduplicated, and representative of production inputs, beats a hundred thousand scraped ones.

```yaml
# the shape of a LoRA run; the numbers are starting points, not gospel
base_model: open-weight-8b-instruct
adapter:
  type: lora
  r: 16
  alpha: 32
  dropout: 0.05
  target_modules: [q_proj, k_proj, v_proj, o_proj]
train:
  epochs: 2
  lr: 2e-4
  examples: 4200
eval:
  holdout: 15%          # never train on it
  compare_against: base # the fine-tune must beat the un-tuned model
```

## The mistake I made

The first time I fine-tuned, I did it to fix knowledge. The model kept getting a product's API details wrong, so I trained it on the docs. It got them right for three weeks, then the API changed and the model was confidently wrong in a way that was now baked in. Retrieval would have fixed it in one deploy. Lesson learned, expensively.

## The hybrid that usually wins

In practice the systems I am proudest of do both: a model tuned (or just well prompted) for the behaviour, with retrieval supplying the facts and citations at request time. The tuning makes the model reliable about *how* it answers; retrieval makes it right about *what*.

## Before any of it: the eval set

You cannot make this decision without an eval set, because the decision is empirical. Hold out 10–20% of your examples, run the base model with your best prompt, run the fine-tune, run the retrieval variant, and compare on the same set. If the fine-tune does not beat the prompted base model on held-out data, you have not earned the operational cost of owning a model.

I wrote about [how I structure those evals](/blog/evals-are-the-product). Build that first. The fine-tuning question usually answers itself once the numbers exist.

## Short version

1. Prompt first. Always.
2. Facts go in retrieval. Behaviour goes in weights.
3. Fine-tune when a small model needs to do a narrow job reliably at volume.
4. LoRA, few thousand clean examples, held-out eval, beat the base model or do not ship.
5. Most good systems do both.
