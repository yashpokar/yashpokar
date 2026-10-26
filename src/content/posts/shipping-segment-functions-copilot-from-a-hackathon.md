---
title: Shipping an AI copilot from a hackathon to production
summary: Segment's Functions Copilot started as a two-day hackathon demo that turned plain English into working code. Getting it in front of customers meant RAG, evals, guardrails, and letting go of the parts that only worked on stage.
date: 2026-01-18
tags: [AI, LLMs, RAG, LangGraph, Product]
featured: true
---

Segment Functions are small pieces of JavaScript that customers write to transform or route their event data. They are powerful and, for non-engineers, a wall. During a company hackathon a few of us built a demo that let you describe what you wanted in English and get a working function back. It won. Then the real work started.

This post is about the gap between a demo that wins a hackathon and a feature that ships to customers. Most of what I learned about building with LLMs in production I learned in that gap.

## What the demo got right

The demo was a single prompt with a lot of context stuffed into it: the Functions API reference, a few example functions, and the user's request. GPT-4 did the rest. For the three examples we showed on stage, it was magic.

The thing it got right was the **shape of the interaction**. Users did not want a chat window. They wanted to type an intent, see code appear in the editor they already used, and edit it. We kept that exact interaction all the way to launch. Everything underneath it changed.

## What broke immediately

The moment we gave it to internal users with real requests, three things fell apart:

1. **Hallucinated APIs.** The model would confidently call helper functions that did not exist in the Functions runtime, or use a Node API that we had sandboxed away.
2. **Context that did not fit.** The full API reference plus the customer's existing function plus their source schema did not fit in the prompt, and truncating it made the hallucinations worse.
3. **No way to know if it was getting better.** We would tweak the prompt, it would fix one case and break another, and nobody could say whether the change was net positive.

## Retrieval instead of stuffing

The fix for the first two problems was the same: stop putting everything in the prompt and start retrieving what was relevant. We chunked the Functions documentation, the runtime's type definitions, and a curated library of known-good functions, embedded them, and at request time pulled the handful of chunks that matched the user's intent.

```python
def build_context(intent: str, k: int = 6) -> list[Chunk]:
    query = embed(intent)
    docs  = store.search(query, k=k, filter={"kind": "doc"})
    exs   = store.search(query, k=3, filter={"kind": "example"})
    # Always include the runtime's hard constraints, regardless of similarity.
    return [RUNTIME_CONSTRAINTS, *docs, *exs]
```

That last line matters. Some context should not be subject to retrieval. The list of what the sandbox does and does not allow went in every single time, because the cost of leaving it out was a function that would not run.

Hallucinated APIs dropped sharply, not to zero. For the remainder we added a cheap static check: parse the generated code, walk the identifiers, and flag anything that was not in the runtime's known surface. If the check failed, we fed the error back to the model and asked for a fix. One retry caught most of it.

## From a prompt to a graph

By this point the "one prompt" was a sequence: classify the intent, retrieve, generate, validate, maybe repair, then explain the result to the user. Managing that as nested function calls got ugly fast, so we moved it to [LangGraph](https://langchain-ai.github.io/langgraph/), where each step was a node and the retry loop was an explicit edge.

The big win was not elegance. It was **observability**. Every run produced a trace of which nodes fired, what they retrieved, and where they failed. When a customer reported a bad result, we could replay it. When we changed a prompt, we could diff the traces.

## Evals, or how we stopped arguing

The third problem, not knowing if changes helped, was the one that nearly stalled the project. The answer was an evaluation set: a few hundred real intents, each paired with a function that a human had verified as correct, plus a scoring harness that ran the generated code against sample events and compared the output.

Once that existed, prompt changes became pull requests with a number attached. "This improves the pass rate from 71% to 78% and regresses two cases, here they are." Arguments about whether a change felt better ended.

If you are building anything on an LLM and you do not have an eval set, you do not have a product yet. You have a demo.

## Guardrails that customers never see

A few things we added that nobody notices, which is the point:

- **Secret detection** on the input. If a user pasted an API key into their request, we refused to send it to the model.
- **Output size limits** and a timeout on the generated function's test run, so a model that produced an infinite loop could not take down the sandbox.
- **A visible "AI generated, review before deploying" state** on the function. Not a guardrail in the technical sense, but the honest one.

## The wiring nobody budgets for

The part of the project I underestimated most was not the model. It was the layer between the agent and the editor: streaming tokens into the right place, showing tool-call progress, keeping the editor's draft and the agent's state in sync, and pausing for a person to approve before anything deployed. We built all of it by hand over a WebSocket. It worked, and it was the least reusable code in the system.

That layer is now what [AG-UI](/blog/ag-ui-the-protocol-between-agents-and-your-frontend) standardises, with human-in-the-loop interrupts as a first-class event. If I were starting the Copilot today it is the first dependency I would add.

## What I would keep

Keep the interaction simple and the pipeline complex, not the other way round. Retrieve, do not stuff. Validate outputs with real code, not more prompting. Build the eval set before you build the second feature. And ship the honest version, the one that says "review this", rather than the magic one that only works on stage.
