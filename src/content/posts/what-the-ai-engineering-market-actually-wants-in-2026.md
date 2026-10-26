---
title: What the AI engineering market actually wants in 2026
summary: I read a lot of job postings and hiring reports this autumn to recalibrate my own stack. The signal is clear and a little humbling: agents, retrieval, evals and shipping to real infrastructure, with model hosting and fine-tuning further down than the hype suggests.
date: 2026-10-20
tags: [AI, Career, Agents, Evals, Engineering Practice]
---

Every couple of years I do an uncomfortable exercise: ignore what I enjoy working on and read what the market is actually asking for. This autumn I went through job postings, several hiring-trend reports, and the protocol announcements of the last twelve months. Here is what I found, and what I changed about my own focus because of it.

## The consistent signals

**Agents are the job.** The most repeated requirement across postings for AI or LLM engineering roles is building agentic systems: tool-using, multi-step, stateful. One sample of live postings had "AI agents" appearing in roughly a fifth of them, on par with PyTorch, which would have been unthinkable two years ago. Framework names vary (LangGraph is the one I see most, alongside the Agent Development Kit, CrewAI, Pydantic AI), but the skill is the same: designing a loop that calls tools, keeps state, and fails safely.

**Retrieval is table stakes.** RAG shows up in a large share of postings, but as an expectation rather than a differentiator. Everyone can wire a vector store. Fewer people can explain why their retrieval is bad, which brings me to the next point.

**Evaluation is the differentiator.** Several reports said the same thing in different words: evals are the skill candidates most often cannot demonstrate, and so the one that most reliably separates applicants. Being able to say "here is the labelled set, here is the judge, here is the agreement score, here is the CI gate" is rare. I wrote up [how I do it](/blog/evals-are-the-product).

**Shipping still matters most.** Python is in the large majority of postings. PyTorch has clearly passed TensorFlow. But right behind the ML tooling are AWS, Kubernetes, Docker, and often Java or Go. These roles ship to real systems, and the people hiring for them want someone who has run things in production. That matched my experience: the hard part of the Copilot was never the model.

## The protocol layer that formed this year

Something that did not exist as a hiring signal a year ago: fluency with the agent protocols that have standardised since late 2025.

- **MCP** for agent-to-tool. Mentioned in postings now, mostly as "agents that use tools, increasingly via MCP".
- **A2A** for agent-to-agent delegation.
- **AG-UI** for streaming agent runs to a user interface, which reached a stable 1.0 on 30 September 2026. [My notes](/blog/ag-ui-the-protocol-between-agents-and-your-frontend).
- **A2UI**, Google's protocol for agents to describe UI as data that the client renders natively, open-sourced in December 2025 and approaching 1.0. [My notes](/blog/a2ui-when-the-agent-builds-the-interface).

Nobody is listing "A2UI" as a requirement yet. But "has built an agent that renders real UI and handles human approval mid-run" is exactly what the senior postings describe, and these protocols are how that gets built without reinventing the wiring.

## The signals that were weaker than I expected

**Fine-tuning.** It appears, but lower than the discourse suggests, and usually in the specific form of "LoRA on an open-weight model for a narrow task". The decision framing I use is [here](/blog/fine-tune-retrieve-or-prompt). Most teams are better served by retrieval plus evals.

**Self-hosting and serving.** Knowing vLLM, SageMaker, or GPU economics is valued in platform roles and almost absent from product-facing ones. Hosted APIs got cheap and good enough that most product teams no longer run their own models, and the ones that do have a dedicated platform team for it. I spent a good chunk of last year on this and I would not centre a profile on it now.

**Framework trivia.** Postings ask for LangGraph or similar by name, but interviews ask about failure modes, state, and cost. The framework is a proxy.

## What I changed

I reorganised my own stack description around the layers that postings actually describe: agents and their protocols, retrieval, evals, and the infrastructure to run all of it. I moved model hosting from a headline to a footnote. And I started writing about generative UI, because the gap between "agent returns text" and "agent drives a real interface" is where the interesting product work is right now.

## For anyone recalibrating

1. Build one agent end to end, with tools, state, interrupts and a UI. Use the protocols rather than custom wiring.
2. Put an eval set under it and be able to show the numbers.
3. Keep your infrastructure skills sharp. They are the reason you get to ship the agent.
4. Learn fine-tuning well enough to know when not to.
5. Do the uncomfortable market read every couple of years. It is cheaper than being surprised.

Sources I leaned on, for the curious: hiring reports from [Remote AI](https://remoteai.io/articles/ai-skills-in-demand), [365 Data Science](https://365datascience.com/career-advice/career-guides/ai-engineer-job-outlook-2025/), [Second Talent](https://www.secondtalent.com/resources/most-in-demand-ai-engineering-skills-and-salary-ranges/) and [Axial Search](https://axialsearch.com/insights/ai-engineering-careers); the [AG-UI 1.0 announcement](https://www.copilotkit.ai/blog/ag-ui-1.0); the [A2UI repository](https://github.com/google/A2UI); and a stack of postings I will not link because they will be gone by the time you read this.
