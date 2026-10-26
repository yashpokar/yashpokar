import React, { useEffect, useRef, useState } from 'react'

/*
 * A scripted agent run that uses AG-UI's event vocabulary (RunStarted, ToolCall*, StateDelta, TextMessage*, Custom, RunFinished).
 * No backend: it simulates the stream so you can see how events become UI, state and an approval step.
 */
const PART1 = [
    [0,   'RunStarted',       'thread t_81 · run r_1'],
    [350, 'StepStarted',      'retrieve'],
    [450, 'ToolCallStart',    'lookup_invoice'],
    [250, 'ToolCallArgs',     '{"id":4821}'],
    [250, 'ToolCallEnd',      'lookup_invoice'],
    [500, 'ToolCallResult',   '{"vendor":"Acme Cloud","amount":1840,"currency":"INR","gst_match":true}'],
    [250, 'StateDelta',       'add /invoice', { op: 'add', path: '/invoice', value: { id: 4821, vendor: 'Acme Cloud', amount: 1840, gst_match: true } }],
    [250, 'StateDelta',       'add /status',  { op: 'add', path: '/status', value: 'awaiting_approval' }],
    [300, 'StepFinished',     'retrieve'],
    [300, 'TextMessageStart', 'assistant'],
    ...'Invoice 4821 from Acme Cloud matches the GST filing. I will not pay it until you approve.'.split(' ').map(w => [70, 'TextMessageContent', w + ' ']),
    [200, 'TextMessageEnd',   'assistant'],
    [250, 'Custom',           'approval_requested · render card'],
]
const PART2 = [
    [0,   'StateDelta',       'replace /status', { op: 'replace', path: '/status', value: 'approved' }],
    [350, 'TextMessageStart', 'assistant'],
    ...'Approved. Payment queued, and the evidence is attached to the record.'.split(' ').map(w => [70, 'TextMessageContent', w + ' ']),
    [200, 'TextMessageEnd',   'assistant'],
    [250, 'RunFinished',      'thread t_81 · run r_1'],
]
const KIND = { Run: 'run', Step: 'run', Tool: 'tool', Stat: 'state', Text: 'text', Cust: 'custom' }
const kind = n => KIND[n.slice(0, 4)] || 'run'

const setPtr = (obj, path, value) => {
    const keys = path.split('/').filter(Boolean); const out = { ...obj }; let cur = out
    keys.slice(0, -1).forEach(k => { cur[k] = { ...cur[k] }; cur = cur[k] })
    cur[keys.at(-1)] = value; return out
}

export default function AgentPlayground() {
    const [log, setLog] = useState([])
    const [state, setState] = useState({})
    const [text, setText] = useState('')
    const [tool, setTool] = useState(null)
    const [phase, setPhase] = useState('idle')   // idle | running | approval | finishing | done
    const timers = useRef([])
    const logEnd = useRef(null)

    useEffect(() => () => timers.current.forEach(clearTimeout), [])
    useEffect(() => { const el = logEnd.current; if (el) el.parentElement.scrollTop = el.parentElement.scrollHeight }, [log])

    const play = (script, onDone) => {
        let t = 0
        script.forEach(([d, name, detail, patch]) => {
            t += d
            timers.current.push(setTimeout(() => {
                setLog(l => [...l, { name, detail, id: l.length }])
                if (name === 'TextMessageContent') setText(x => x + detail)
                if (name === 'TextMessageStart') setText('')
                if (name === 'ToolCallStart') setTool({ name: detail, done: false })
                if (name === 'ToolCallEnd') setTool(x => x && { ...x, done: true })
                if (patch) setState(s => setPtr(s, patch.path, patch.value))
            }, t))
        })
        timers.current.push(setTimeout(onDone, t + 80))
    }

    const run = () => {
        timers.current.forEach(clearTimeout); timers.current = []
        setLog([]); setState({}); setText(''); setTool(null); setPhase('running')
        play(PART1, () => setPhase('approval'))
    }
    const decide = ok => {
        if (!ok) { setLog(l => [...l, { name: 'RunFinished', detail: 'rejected by user', id: l.length }]); setState(s => setPtr(s, '/status', 'rejected')); setPhase('done'); return }
        setPhase('finishing'); play(PART2, () => setPhase('done'))
    }
    const inv = state.invoice
    const status = state.status

    return (
        <div className="play">
            <div className="play__bar">
                <span>Simulated run · AG-UI event vocabulary · no backend</span>
                <button type="button" className="btn btn--primary" onClick={run} disabled={phase === 'running' || phase === 'finishing'}>
                    <span className="btn__bg" />{phase === 'idle' ? 'Run the agent' : phase === 'done' ? 'Run again' : 'Running…'}
                </button>
            </div>

            <div className="play__grid">
                <div className="play__col">
                    <div className="play__label">Event stream</div>
                    <div className="play__log">
                        {log.length === 0 && <p className="play__empty">Press run. Each line is one typed event arriving over the stream.</p>}
                        {log.map(e => (
                            <div key={e.id} className={`ev ev--${kind(e.name)}`}><b>{e.name}</b><span>{e.detail}</span></div>
                        ))}
                        <i ref={logEnd} />
                    </div>
                </div>

                <div className="play__col">
                    <div className="play__label">Shared state <small>(JSON Patch applied)</small></div>
                    <pre className="play__state">{Object.keys(state).length ? JSON.stringify(state, null, 2) : '{}'}</pre>
                </div>

                <div className="play__col">
                    <div className="play__label">What the user sees</div>
                    <div className="play__ui">
                        {tool && <div className={`pill${tool.done ? ' pill--done' : ''}`}>{tool.done ? '✓' : '…'} {tool.name}</div>}
                        {text && <p className="bubble">{text}</p>}
                        {inv && (
                            <div className="a2card">
                                <div className="a2card__title">Approve invoice #{inv.id}?</div>
                                <div className="a2card__row"><span>Vendor</span><b>{inv.vendor}</b></div>
                                <div className="a2card__row"><span>Amount</span><b>₹{inv.amount.toLocaleString('en-IN')}</b></div>
                                <div className="a2card__row"><span>GST filing</span><b>{inv.gst_match ? 'matched' : 'mismatch'}</b></div>
                                <div className="a2card__row"><span>Status</span><b className={`st st--${status}`}>{String(status).replace('_', ' ')}</b></div>
                                {phase === 'approval' && (
                                    <div className="a2card__act">
                                        <button type="button" className="btn btn--primary" onClick={() => decide(true)}><span className="btn__bg" />Approve</button>
                                        <button type="button" className="btn btn--ghost" onClick={() => decide(false)}>Reject</button>
                                    </div>
                                )}
                            </div>
                        )}
                        {phase === 'idle' && <p className="play__empty">The agent’s tool calls, message and an approval card will appear here.</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}
