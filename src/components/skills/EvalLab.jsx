import React, { useMemo, useState } from 'react'
import { Link } from 'react-router'

/* An illustrative sample: ten generated outputs for "turn this prompt into a Segment function".
   `good` is the human label, which an eval set would hold. Everything else is what a check can observe. */
const CASES = [
    { id: 1,  note: 'Maps signup to "User Registered" and forwards it',        parses: true,  known: true,  long: false, judge: 5, good: true },
    { id: 2,  note: 'Drops events with no userId, keeps the rest',              parses: true,  known: true,  long: false, judge: 4, good: true },
    { id: 3,  note: 'Missing closing brace, will not compile',                  parses: false, known: true,  long: false, judge: 2, good: false },
    { id: 4,  note: 'Calls a helper that does not exist in the runtime',        parses: true,  known: false, long: false, judge: 4, good: false },
    { id: 5,  note: 'Correct, but 400 lines for a three-line job',              parses: true,  known: true,  long: true,  judge: 3, good: false },
    { id: 6,  note: 'Compiles, but reverses the filter condition',              parses: true,  known: true,  long: false, judge: 2, good: false },
    { id: 7,  note: 'Compiles and reads well, but drops every second event',    parses: true,  known: true,  long: false, judge: 4, good: false },
    { id: 8,  note: 'Plain and correct, and the judge is merely lukewarm',      parses: true,  known: true,  long: false, judge: 3, good: true },
    { id: 9,  note: 'Renames fields exactly as asked, with a clear comment',    parses: true,  known: true,  long: false, judge: 5, good: true },
    { id: 10, note: 'Uses a sandboxed Node API the runtime has blocked',        parses: true,  known: false, long: false, judge: 5, good: false },
]

export default function EvalLab() {
    const [det, setDet] = useState(false)
    const [useJudge, setUseJudge] = useState(false)
    const [threshold, setThreshold] = useState(4)

    const rows = useMemo(() => CASES.map(c => {
        const reasons = []
        if (det) {
            if (!c.parses) reasons.push('does not parse')
            if (!c.known) reasons.push('unknown API')
            if (c.long) reasons.push('too long')
        }
        if (useJudge && c.judge < threshold) reasons.push(`judge ${c.judge} < ${threshold}`)
        return { ...c, blocked: reasons.length > 0, reasons }
    }), [det, useJudge, threshold])

    const shippedBad = rows.filter(r => !r.blocked && !r.good).length
    const blockedGood = rows.filter(r => r.blocked && r.good).length
    const caught = rows.filter(r => r.blocked && !r.good).length
    const totalBad = CASES.filter(c => !c.good).length

    return (
        <div className="lab">
            <div className="lab__controls">
                <label className={`toggle${det ? ' toggle--on' : ''}`}>
                    <input type="checkbox" checked={det} onChange={e => setDet(e.target.checked)} />
                    <span className="toggle__box" /> <b>Deterministic checks</b><small>parses · known APIs · length</small>
                </label>
                <label className={`toggle${useJudge ? ' toggle--on' : ''}`}>
                    <input type="checkbox" checked={useJudge} onChange={e => setUseJudge(e.target.checked)} />
                    <span className="toggle__box" /> <b>LLM judge</b><small>blocks anything scored under the bar</small>
                </label>
                <label className={`lab__slider${useJudge ? '' : ' is-off'}`}>
                    Judge bar: <b>{threshold}</b> / 5
                    <input type="range" min="1" max="5" step="1" value={threshold} disabled={!useJudge} onChange={e => setThreshold(+e.target.value)} />
                </label>
            </div>

            <div className="lab__grid">
                <ul className="lab__cases">
                    {rows.map(r => (
                        <li key={r.id} className={`case-row${r.blocked ? ' is-blocked' : ' is-shipped'}${r.good ? '' : ' is-bad'}`}>
                            <span className="case-row__state">{r.blocked ? 'blocked' : 'ships'}</span>
                            <span className="case-row__note">{r.note}</span>
                            <span className="case-row__tag">{r.good ? 'good' : 'bad'}</span>
                            <span className="case-row__why">{r.blocked ? r.reasons.join(' · ') : ''}</span>
                        </li>
                    ))}
                </ul>

                <div className="lab__score">
                    <div className="meter">
                        <div className="meter__num meter__num--bad">{shippedBad}</div>
                        <div className="meter__label">bad outputs shipped</div>
                        <div className="meter__bar"><i style={{ width: `${(shippedBad / totalBad) * 100}%` }} /></div>
                        <small>{caught} of {totalBad} bad outputs caught</small>
                    </div>
                    <div className="meter">
                        <div className="meter__num">{blockedGood}</div>
                        <div className="meter__label">good outputs blocked</div>
                        <small>The cost of a strict bar.</small>
                    </div>
                    <p className="lab__read">
                        {!det && !useJudge && 'No gate: everything ships. This is how most prompt changes go out.'}
                        {det && !useJudge && 'Free checks catch the broken and the hallucinated. The subtly wrong still ships.'}
                        {!det && useJudge && 'A judge alone is fooled by confident, plausible code, and cannot see runtime rules.'}
                        {det && useJudge && (shippedBad > 0
                            ? 'Even layered, one subtle bug slips through. That is the case you add to the eval set.'
                            : 'Everything bad is caught. Raise the bar further and watch good outputs get blocked.')}
                    </p>
                    <Link to="/blog/evals-are-the-product" className="textlink">How I structure evals →</Link>
                </div>
            </div>
            <p className="lab__note">Illustrative sample of ten outputs, not production data.</p>
        </div>
    )
}
