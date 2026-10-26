/* "When X, I reach for Y, because Z" — each grounded in a post on this site. */
export default [
    { when: 'A batch job is too slow', pick: 'Profile, then batch, bound the concurrency, make writes idempotent', why: 'The job is almost always I/O bound and waiting in a line. Safe retries are what let you go fast.', post: 'nightly-sync-3-hours-to-20-minutes' },
    { when: 'Scraping a site that needs JavaScript', pick: 'The network tab before a browser', why: 'The data usually arrives as embedded JSON or an API call. Driving Chrome pays for painting you throw away.', post: 'dropping-selenium-15x-faster-crawler' },
    { when: 'The infrastructure bill is too high', pick: 'Stateless services on Kubernetes with spot capacity', why: 'Fast start, graceful shutdown and disruption budgets turn reclaimed nodes into background noise.', post: 'cutting-infra-cost-60-percent-spot-kubernetes' },
    { when: 'The model needs to know facts', pick: 'Retrieval, not weights', why: 'Facts change. Weights freeze them the day you train. Retrieval fixes it in one deploy.', post: 'fine-tune-retrieve-or-prompt' },
    { when: 'The model needs to behave consistently', pick: 'Prompt first, then a small LoRA fine-tune', why: 'Behaviour is stable and prompts struggle to hold it. Only fine-tune once held-out evals say it beats the base model.', post: 'fine-tune-retrieve-or-prompt' },
    { when: 'A prompt or model change is about to ship', pick: 'An eval gate in CI', why: 'Deterministic checks first, a calibrated judge second, sampled production traces after. It ends the argument with a number.', post: 'evals-are-the-product' },
    { when: 'An agent has to talk to a frontend', pick: 'AG-UI, not a bespoke WebSocket', why: 'A schema and a defined event stream make the agent a service with a contract, reusable across surfaces.', post: 'ag-ui-the-protocol-between-agents-and-your-frontend' },
    { when: 'An agent needs more than text on screen', pick: 'A2UI with a small, trusted component catalog', why: 'The agent sends data, never code, and your design system does the rendering.', post: 'a2ui-when-the-agent-builds-the-interface' },
    { when: 'Automation touches money', pick: 'Evidence on every value and a human approval', why: 'A reconciliation you cannot audit is a liability. Show the exception list, not the whole pile.', post: 'the-favour-that-became-a-revenue-line' },
]
