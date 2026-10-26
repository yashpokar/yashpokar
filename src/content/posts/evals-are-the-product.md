---
title: "Evals are the product: how I ship LLM features without guessing"
summary: The feature is not the prompt. It is the eval set that tells you the prompt still works. A layered approach I now use on every LLM project: deterministic checks, calibrated judges, pre-merge gates, and sampled production traces.
date: 2026-08-16
tags: [AI, Evals, LLMs, Engineering Practice]
featured: true
---

The project that taught me this was the Functions Copilot. We had a prompt, it produced plausible code, and for weeks every change was argued on vibes. Someone would tweak the system prompt, try their three favourite examples, and declare it better. Then a customer would hit a case that had quietly regressed.

The thing that ended the arguing was not a better model. It was a few hundred labelled examples and a script that ran them. Since then I have come to think of the eval set as the product, and the prompt as an implementation detail that the eval set lets me change safely.

Here is the shape I now use, from cheapest to most expensive.

## Layer 1: deterministic checks

Before any model judges anything, check what can be checked with code. Does the output parse? Does the generated function compile? Does it call only APIs that exist? Does the JSON match the schema? Is the length within bounds? Did it leak the system prompt?

These are free, fast, and catch a startling share of failures. For the Copilot, a static pass over the generated code that flagged unknown identifiers caught most hallucinated APIs before a human or a judge ever saw them.

```python
def deterministic_checks(output: str, runtime: RuntimeSurface) -> list[str]:
    problems = []
    try:
        tree = parse(output)
    except SyntaxError as e:
        return [f"syntax: {e}"]
    for name in identifiers(tree):
        if name not in runtime.known:
            problems.append(f"unknown identifier: {name}")
    if len(output) > runtime.max_chars:
        problems.append("too long")
    return problems
```

Run these on every generation, in production, not just in tests. They are your guardrails too.

## Layer 2: an LLM judge, calibrated

For the qualitative questions, use a model as the judge: did this answer the user's intent, is it faithful to the retrieved context, is the tone right. The important word is **calibrated**. A judge is a model, and models drift, so:

- **Build a human-labelled set first.** A few hundred examples graded by people who understand the domain. Yes, this is the expensive step. It is also the whole point.
- **Measure agreement.** Compare the judge's grades to the human labels. Cohen's kappa is the usual yardstick; the field talks about 0.6 as acceptable and 0.8 as strong. Below that, fix the rubric before you trust the judge.
- **Control the known biases.** Judges prefer longer answers, prefer the first option in a pair, and prefer outputs from their own model family. Alternate order in pairwise comparisons, cap length, and avoid judging a model with itself where you can.
- **Re-calibrate on a schedule.** When the judge model is upgraded, rerun agreement. Silent judge drift is the most insidious failure in this whole stack.

## Layer 3: pre-merge gates

Every prompt change, retrieval change, or model swap runs the full offline suite in CI and reports a number. "This takes pass rate from 71% to 78% and regresses these two cases" is a pull request description that ends arguments. A change that improves the aggregate but regresses a protected subset (say, a specific customer's schema) should fail the gate.

Treat the eval set like a test suite: it lives in the repo, it has owners, and every production incident adds a case.

## Layer 4: online evals on sampled traces

Offline sets go stale because users do things you did not anticipate. So sample production traces, run the judge on them asynchronously, and track the score as a time series. Not everything; a few percent is usually enough to see a regression. Treat judge cost as its own line item and tune the sampling rate against it.

When online scores drop and offline scores did not, you have found a gap in your eval set. Promote the failing traces into it.

## What this changes about how you work

- **Model upgrades stop being scary.** Swap the model, run the suite, read the number. We moved between models in a week on the knowledge base project because the harness already existed.
- **Prompt engineering becomes engineering.** Changes have a measured effect, and you can bisect regressions.
- **Product conversations get concrete.** "Is it good enough to ship?" becomes "it passes 84% of the launch set, here are the 16%". Product can look at the 16% and decide.

## The uncomfortable part

None of this is clever. It is labelled data and discipline, which is exactly why teams skip it. The model vendors will keep telling you the new model is better. Your eval set is the only thing in the room that can tell you whether it is better *for you*.

If you have an LLM feature in production and no eval set, you do not have a product yet. You have a demo that has not failed loudly enough.
