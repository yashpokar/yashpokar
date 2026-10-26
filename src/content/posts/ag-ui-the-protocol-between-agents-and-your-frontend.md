---
title: "AG-UI: the missing protocol between your agent and your frontend"
summary: Every team that ships an agent ends up hand-rolling the same streaming, tool-call and state-sync plumbing to the browser. AG-UI 1.0 standardises it. What the protocol actually is, what the event stream looks like, and why I'd adopt it over a bespoke WebSocket.
date: 2026-10-05
tags: [AI, Agents, AG-UI, Frontend, Protocols]
featured: true
---

When we shipped Segment's Functions Copilot, the backend was the interesting part on paper: retrieval, a LangGraph agent, an eval harness. In practice a surprising share of the engineering went into the boring layer between the agent and the browser. Streaming tokens. Showing "calling tool…" states. Keeping the editor's state and the agent's state from drifting apart. Letting a person approve something mid-run.

We wrote all of that by hand, over a WebSocket, with our own message shapes. So did everyone else. [AG-UI](https://docs.ag-ui.com), the Agent-User Interaction protocol from the CopilotKit team, is the attempt to stop everyone doing that. Version 1.0 landed on 30 September 2026 with a frozen spec and JSON Schema, and after reading it twice I think it is the right abstraction.

## What it is, in one paragraph

AG-UI is an event protocol. An agent run is a stream of typed events from backend to client, sent over ordinary web transport (Server-Sent Events is the common choice, WebSockets work too). The client reduces that stream into UI state. That is the whole idea. It does not care which agent framework you use, which model, or which frontend. Adapters exist for LangGraph, CrewAI, Mastra, Pydantic AI, the Agent Development Kit and others, and the 1.0 SDKs for TypeScript, Python and .NET are generated from the same schema.

## The events you will actually use

The spec groups events into a handful of families. The ones that cover 90% of real apps:

**Lifecycle.** `RunStarted`, `RunFinished`, `RunError`, with `StepStarted` and `StepFinished` for multi-step agents. Your UI's loading and error states hang off these.

**Text.** `TextMessageStart`, `TextMessageContent`, `TextMessageEnd`. Content events carry deltas, so you render tokens as they arrive. There is a `TextMessageChunk` convenience event that expands to all three for simple cases.

**Tool calls.** `ToolCallStart`, `ToolCallArgs`, `ToolCallEnd`, `ToolCallResult`. Args stream too, which is what lets a UI show a form filling itself in before the tool actually runs.

**State.** `StateSnapshot` replaces the client's copy of shared state wholesale. `StateDelta` carries JSON Patch operations (RFC 6902) applied in order. If the client thinks it has drifted it can ask for a fresh snapshot. This is the part I wish we had had: a defined, bidirectional notion of "the state both sides agree on".

**Reasoning, subagents, custom.** `Reasoning*` events for models that expose thinking, `Subagent*` events so a parent run can surface child runs, and a `Custom` event with a `name` and `value` for whatever your app needs that the spec does not cover.

## What the wire looks like

A minimal Python agent that streams a reply and one tool call:

```python
from ag_ui.core import (
    RunStartedEvent, TextMessageStartEvent, TextMessageContentEvent,
    TextMessageEndEvent, ToolCallStartEvent, ToolCallArgsEvent,
    ToolCallEndEvent, StateDeltaEvent, RunFinishedEvent,
)

async def run(input, emit):
    await emit(RunStartedEvent(thread_id=input.thread_id, run_id=input.run_id))

    await emit(ToolCallStartEvent(tool_call_id="t1", tool_call_name="lookup_schema"))
    await emit(ToolCallArgsEvent(tool_call_id="t1", delta='{"source": "web"}'))
    await emit(ToolCallEndEvent(tool_call_id="t1"))

    # the UI learns about shared state through patches, not prose
    await emit(StateDeltaEvent(delta=[
        {"op": "replace", "path": "/draft/status", "value": "ready"},
    ]))

    await emit(TextMessageStartEvent(message_id="m1", role="assistant"))
    for token in generate_tokens(input):
        await emit(TextMessageContentEvent(message_id="m1", delta=token))
    await emit(TextMessageEndEvent(message_id="m1"))

    await emit(RunFinishedEvent(thread_id=input.thread_id, run_id=input.run_id))
```

On the client the shape is a reducer: subscribe to the stream, switch on event type, update local state. CopilotKit ships React hooks that do this for you, but the point of a protocol is that you do not have to use them.

## What 1.0 added that matters

Three additions make it production-shaped rather than demo-shaped:

1. **Interrupts.** A run can pause and hand control to a person, who approves, edits or rejects, and the run resumes. Human-in-the-loop is a first-class concept, not a custom event.
2. **Subagents.** Multi-agent systems can surface nested runs in the UI without flattening everything into one transcript.
3. **Multimodal tool results and token usage.** Tools can return images and files, and the client can see cost as it accrues.

## Why not just keep the custom WebSocket?

Because the custom WebSocket is a liability you do not notice until the second product. Ours worked for one editor. The moment another team wanted the same agent inside a different surface, every assumption about message shapes leaked. A protocol with a schema means the agent is a service with a contract, the same way a REST API is.

It also composes with the other protocols that have settled over the last year. MCP handles agent-to-tool. A2A handles agent-to-agent. AG-UI handles agent-to-user. And Google's A2UI, which I cover in [the next post](/blog/a2ui-when-the-agent-builds-the-interface), handles what the user sees when the agent wants to render more than text. AG-UI is the stream; A2UI can be the payload on it.

## Where I would be careful

- The spec is stable but the ecosystem is young. Adapters vary in how completely they implement state sync.
- Streaming tool arguments as deltas is powerful and easy to render badly. Buffer until the JSON parses, or show a skeleton.
- Treat `StateDelta` like any other eventually-consistent system: idempotent patches, and a snapshot fallback you actually test.

If you are starting an agent-backed feature today, I would reach for AG-UI on day one and spend the saved weeks on evals.
