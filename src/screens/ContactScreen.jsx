import React, { useEffect, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import useReveal from '../hooks/useReveal'

const EMAIL = 'hello@yashpokar.com'
const reasons = [
    ['A hard problem', 'Throughput, cost, correctness or an agent that has to behave. Send the constraints, not the pitch.'],
    ['An AI feature to ship', 'Retrieval, agents, evals, and the interface that puts them in front of users.'],
    ['Talking shop', 'Agent protocols, generative UI, running things on spot capacity. Always up for it.'],
]
const links = [
    ['GitHub', 'github.com/yashpokar', 'https://github.com/yashpokar'],
    ['LinkedIn', 'linkedin.com/in/yashpokar', 'https://linkedin.com/in/yashpokar'],
    ['X', '@yashpokar', 'https://twitter.com/yashpokar'],
    ['Medium', 'yashpokar.medium.com', 'https://yashpokar.medium.com'],
    ['Stack Overflow', 'yash-pokar', 'https://stackoverflow.com/users/5939254/yash-pokar'],
]

export default function ContactScreen() {
    useReveal()
    const [copied, setCopied] = useState(false)
    const copy = async () => {
        try { await navigator.clipboard.writeText(EMAIL); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* blocked */ }
    }
    const [time, setTime] = useState('')
    useEffect(() => {
        const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })
        const tick = () => setTime(fmt.format(new Date()))
        tick(); const id = setInterval(tick, 30000)
        return () => clearInterval(id)
    }, [])

    return (
        <>
            <PageHeader
                crumbs={[{ label: 'Contact' }]}
                title="Say hello"
                intro="Email is the best way to reach me. I read everything, and a specific question gets a better answer than a general one."
            />

            <section className="section section--tight">
                <div className="wrap">
                    <div className="mailcard" data-reveal>
                        <div className="cta__glow" aria-hidden="true" />
                        <a href={`mailto:${EMAIL}`} className="mailcard__addr" data-magnetic>{EMAIL}</a>
                        <div className="mailcard__row">
                            <a href={`mailto:${EMAIL}`} className="btn btn--primary" data-magnetic><span className="btn__bg" />Open mail</a>
                            <button type="button" className="btn btn--ghost" onClick={copy} data-magnetic>{copied ? 'Copied ✓' : 'Copy address'}</button>
                            <span className="mailcard__tz"><i /> Bangalore, India{time && ` · ${time} IST`}</span>
                        </div>
                    </div>

                    <div className="reasons">
                        {reasons.map(([t, d], i) => (
                            <div key={t} className="principle" data-reveal style={{ '--d': `${i * 70}ms` }}>
                                <h3>{t}</h3><p>{d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="wrap">
                    <div className="section__head" data-reveal><h2 className="section__title">Elsewhere</h2></div>
                    <ul className="linklist">
                        {links.map(([n, h, u], i) => (
                            <li key={n} data-reveal style={{ '--d': `${i * 50}ms` }}>
                                <a href={u} target="_blank" rel="noopener noreferrer"><span>{n}</span><small>{h}</small><b aria-hidden="true">↗</b></a>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    )
}
