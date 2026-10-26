---
title: "A2UI: when the agent builds the interface"
summary: Google's A2UI lets an agent describe a UI as data and have your app render it with trusted native components. No generated HTML, no eval. How the format works, where it fits next to AG-UI and A2A, and what I would build with it.
date: 2026-09-12
tags: [AI, Agents, A2UI, Generative UI, Frontend]
---

Generative UI has been promised for a while and mostly delivered as "the model writes some HTML and we hope". That is a security problem, an accessibility problem, and a design-system problem all at once. [A2UI](https://github.com/google/A2UI), the Agent-to-User Interface protocol Google open-sourced in December 2025, takes the other route: the agent sends a declarative description of the interface, and the client renders it with components it already trusts.

I spent a weekend with it. It is early (v0.9.1 is the current production release and the 1.0 spec is a release candidate), but the design is sound and it slots neatly into the protocol stack that has formed around agents.

## The core idea

An A2UI message is JSON describing a UI as a **flat list of components that reference each other by ID**, plus a data model those components bind to. Flat, not nested, on purpose: a flat adjacency list is easy for a language model to emit incrementally and easy to patch, so the agent can stream a UI into existence and then modify it as the conversation continues, rather than regenerating the whole tree.

The shape, simplified:

```json
{
  "surface": "main",
  "components": [
    { "id": "root",   "type": "Card",      "children": ["title", "amount", "actions"] },
    { "id": "title",  "type": "Text",      "props": { "text": "Approve invoice #4821?" } },
    { "id": "amount", "type": "TextField", "props": { "label": "Amount", "bind": "/invoice/amount" } },
    { "id": "actions","type": "Row",       "children": ["ok", "no"] },
    { "id": "ok",     "type": "Button",    "props": { "label": "Approve", "action": "approve" } },
    { "id": "no",     "type": "Button",    "props": { "label": "Reject",  "action": "reject" } }
  ],
  "data": { "invoice": { "amount": 1840.00 } }
}
```

That is illustrative rather than copied from the spec, but the ingredients are the real ones: component catalog, ID references, data binding, actions that flow back to the agent.

## The security model is the feature

The agent can only ask for components in a **catalog the client controls**. Card, Button, TextField, Row, and whatever you register. It cannot ship JavaScript, it cannot ship HTML, it cannot reach outside the catalog. If you need to embed something risky, you wrap it in what the project calls a smart wrapper with its own sandboxing policy, and the agent still only sees a component name.

This is the first generative UI approach I have seen that a security review would pass without a fight. It also means the output automatically uses your design system, because the renderer is yours.

## Renderers

Clients exist for the web as Lit web components, Angular and React (`@a2ui/react`), for Flutter through the GenUI SDK, and for SwiftUI. Jetpack Compose is on the roadmap. The renderer is a small piece of code: walk the component list, resolve IDs, map types to your components, bind data, wire actions.

## Where it fits

The agent protocol landscape has settled into layers, and A2UI is the top one:

| Layer | Protocol | Question it answers |
|---|---|---|
| Agent to tool | MCP | How does the agent call things? |
| Agent to agent | A2A | How do agents delegate to each other? |
| Agent to user | AG-UI | How does a run stream to a client? |
| What the user sees | A2UI | What does the agent want rendered? |

A2UI is transport-agnostic. It can ride on A2A, and it integrates with [AG-UI](/blog/ag-ui-the-protocol-between-agents-and-your-frontend), where the natural pattern is an AG-UI run that emits A2UI payloads as custom or tool-result events. The project even ships a scaffolding CLI for exactly that combination.

## What I would build with it

**Approval flows.** Any agent that needs a human decision mid-run. Instead of "reply yes or no", the agent renders a form with the actual fields it is unsure about. Combined with AG-UI interrupts this is a complete pattern.

**Admin surfaces that do not exist yet.** Internal tools are where generative UI pays off first, because the catalog can be small and the users are forgiving.

**Structured results.** A data question answered as a table with sortable columns and a chart, rendered natively, rather than a markdown blob.

## Where I would be careful

- It is a public preview. Expect the spec to move before 1.0 ships.
- A flat component list is model-friendly but reviewer-hostile. Log the rendered tree, not just the JSON.
- Keep the catalog small at first. Every component you expose is a new way for the model to produce something odd.
- Evals apply here too. "Did the agent render a reasonable UI for this intent" is a judgeable question, and you should judge it.

The honest summary: A2UI is not finished, but it is the first generative UI design that respects the browser, the design system and the security team at the same time. I would prototype on it today and plan to track the spec.
