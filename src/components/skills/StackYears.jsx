import React from 'react'
import achievements from '../../constants/home/achievements'

const ERAS = {
    2017: ['Crawl', 'Learning to move data at scale'],
    2019: ['Integrate', 'Connecting systems and automating the manual'],
    2020: ['Scale', 'Platforms, cost and throughput'],
    2022: ['Ship AI', 'Agents, retrieval and evals for real customers'],
}

/** One row per job. Tools that appear for the first time are highlighted; carried-over tools are dimmed. */
export default function StackYears() {
    const seen = new Set()
    const rows = achievements.map(a => {
        const items = a.tags.map(t => ({ t, fresh: !seen.has(t.toLowerCase()) }))
        a.tags.forEach(t => seen.add(t.toLowerCase()))
        return { ...a, items, fresh: items.filter(i => i.fresh).length }
    })
    return (
        <div className="years">
            {rows.map((r, i) => {
                const [era, sub] = ERAS[r.year] || ['', '']
                return (
                    <div key={r.year} className="year" data-reveal style={{ '--d': `${i * 80}ms` }}>
                        <div className="year__head">
                            <span className="year__num">{r.year}</span>
                            <div><div className="year__era">{era}</div><div className="year__sub">{sub}</div></div>
                        </div>
                        <div className="year__body">
                            <div className="year__co">{r.company}<span>{r.fresh} new</span></div>
                            <div className="stop__tech">
                                {r.items.map(({ t, fresh }) => <span key={t} className={fresh ? 'is-new' : 'is-old'}>{t}</span>)}
                            </div>
                        </div>
                    </div>
                )
            })}
            <p className="years__legend"><i className="is-new" /> first time in the stack <i className="is-old" /> carried forward</p>
        </div>
    )
}
