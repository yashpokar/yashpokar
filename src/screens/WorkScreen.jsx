import React, { useMemo, useState } from 'react'
import { Link } from 'react-router'
import PageHeader from '../components/layout/PageHeader'
import CareerTrack from '../components/home/CareerTrack'
import achievements from '../constants/home/achievements'
import projects from '../data/projects'
import useMeta from '../hooks/useMeta'
import useReveal from '../hooks/useReveal'

const experience = [...achievements].reverse().map((item, i) => ({
    ...item,
    when: i === 0 ? `${item.year} to now` : item.year,
    about: item.company === 'Zivame' ? "India's largest lingerie platform" : undefined,
}))
const kinds = ['All', ...new Set(projects.map(p => p.kind))]

export default function WorkScreen() {
    useMeta('Work', 'Selected projects and career timeline: Segment, Zivame, Itilite and SKU Monetate. Agents, evals, Kubernetes, data pipelines.')
    const [kind, setKind] = useState('All')
    const visible = useMemo(() => projects.filter(p => kind === 'All' || p.kind === kind), [kind])
    useReveal([kind])

    return (
        <>
            <PageHeader
                crumbs={[{ label: 'Work' }]}
                title="Work"
                intro="Four companies, eight years, and a habit of picking up the problem nobody wanted. Scroll the career first, then read the projects as problem, what I did, and what changed."
            />

            <CareerTrack items={experience} heading="Career" />

            <section className="section">
                <div className="wrap">
                    <div className="section__head" data-reveal>
                        <h2 className="section__title">Selected projects</h2>
                        <p className="section__note">Each one is framed the same way so you can skim.</p>
                    </div>

                    <div className="filters" data-reveal>
                        {kinds.map(k => (
                            <button key={k} type="button" className={`blog-tag${kind === k ? ' blog-tag--active' : ''}`} onClick={() => setKind(k)}>{k}</button>
                        ))}
                    </div>

                    <div className="cases">
                        {visible.map(p => (
                            <article key={p.slug} id={p.slug} className="case" data-reveal>
                                <div className="case__side">
                                    <div className="case__year">{p.year}</div>
                                    <div className="case__org">{p.org}</div>
                                    <div className="case__kind">{p.kind}</div>
                                </div>
                                <div className="case__main">
                                    <h3 className="case__title">{p.title}</h3>
                                    <span className="case__metric">{p.metric}</span>
                                    <dl className="case__grid">
                                        <div><dt>The problem</dt><dd>{p.problem}</dd></div>
                                        <div>
                                            <dt>What I did</dt>
                                            <dd><ul>{p.did.map(d => <li key={d}>{d}</li>)}</ul></dd>
                                        </div>
                                        <div><dt>The result</dt><dd>{p.result}</dd></div>
                                    </dl>
                                    <div className="case__foot">
                                        <div className="stop__tech">{p.tags.map(t => <span key={t}>{t}</span>)}</div>
                                        {p.post && <Link to={`/blog/${p.post.slug}`} className="case__link">{p.post.label} →</Link>}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section section--tight">
                <div className="wrap">
                    <div className="cta" data-reveal>
                        <div className="cta__glow" aria-hidden="true" />
                        <h2 className="cta__title">Got a problem like these?</h2>
                        <p className="cta__body">Throughput, cost, correctness, or an agent that needs to behave. Tell me what it is.</p>
                        <Link to="/contact" className="btn btn--primary"><span className="btn__bg" />Start a conversation</Link>
                    </div>
                </div>
            </section>
        </>
    )
}
