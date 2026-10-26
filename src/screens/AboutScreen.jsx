import React from 'react'
import { Link } from 'react-router'
import PageHeader from '../components/layout/PageHeader'
import Recommendation from '../components/home/Recommendation'
import recommendations from '../constants/home/recommendations'
import useMeta from '../hooks/useMeta'
import useReveal from '../hooks/useReveal'

const years = Math.floor((Date.now() - new Date('2017-12-01')) / (1000 * 60 * 60 * 24 * 365.25))

const principles = [
    ['Measure before you believe', 'My theory about why something is slow, or why a model is better, is usually wrong. A profile or an eval set takes an hour and ends the argument.'],
    ['Make it safe to retry', 'Idempotent writes, resumable jobs, approvals before anything irreversible. Speed comes from being allowed to fail cheaply.'],
    ['Start with the boring layer', 'The model is rarely the hard part. State, streaming, rate limits, rollbacks and the interface are, and they decide whether it ships.'],
    ['Write it down', 'If I learned it the hard way, I write it up. The blog is where those notes end up.'],
]

const timeline = [
    ['2017', 'First job, SKU Monetate', 'Crawling infrastructure, and the pipeline that stopped needing browsers.'],
    ['2019', 'Itilite Technologies', 'Travel integrations, and the favour that became a finance system.'],
    ['2020', 'Zivame', "India's largest lingerie platform. Kubernetes on spot, a faster catalogue sync, a multi-warehouse system."],
    ['2022', 'Twilio · Segment R&D', 'From a hackathon demo to the first customer-facing AI feature, and the agent protocols that came after.'],
]

export default function AboutScreen() {
    useMeta('About', 'About Yash Pokar: senior full stack developer on the Segment R&D team at Twilio, based in Bangalore. How I work and what I care about.')
    useReveal()
    const lead = { content: "If you want to get the best out of him don't tell him how it should be done, he will figure out the best way.", author: 'Amit Basuri', headline: 'Software Engineer at Amazon', highlights: ['figure out the best way'] }

    return (
        <>
            <PageHeader
                crumbs={[{ label: 'About' }]}
                title="About"
                intro={`I'm Yash, a senior full stack developer in Bangalore. ${years} years in, I work on the R&D team at Twilio Segment, building AI features that real customers use.`}
            />

            <section className="section section--tight">
                <div className="wrap aboutgrid">
                    <div className="aboutgrid__photo" data-reveal>
                        <img src="/me.jpg" alt="Yash Pokar" width="360" height="360" />
                        <div className="aboutgrid__badge">Bangalore, India</div>
                    </div>
                    <div className="prose aboutgrid__text" data-reveal style={{ '--d': '80ms' }}>
                        <p>I like the parts of products that have to work: the crawler that cannot fall over, the sync that must finish before morning, the agent that should ask before it deploys.</p>
                        <p>I started out building web-crawling infrastructure, spent a few years in e-commerce and travel making pipelines faster and infrastructure cheaper, and now spend my days on agents, retrieval, evals and the interfaces that put them in front of customers.</p>
                        <p>I'm happiest when a problem has real constraints, and when someone has to be honest about trade-offs. Most of what I've learned I've written down on <Link to="/blog">the blog</Link>.</p>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="wrap">
                    <div className="section__head" data-reveal><h2 className="section__title">How I work</h2></div>
                    <div className="principles">
                        {principles.map(([t, d], i) => (
                            <div key={t} className="principle" data-reveal style={{ '--d': `${i * 70}ms` }}>
                                <h3>{t}</h3><p>{d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="wrap">
                    <div className="section__head" data-reveal>
                        <h2 className="section__title">The short version</h2>
                        <p className="section__note">The full detail is on <Link to="/work">Work</Link>.</p>
                    </div>
                    <ol className="mini">
                        {timeline.map(([y, t, d], i) => (
                            <li key={y} data-reveal style={{ '--d': `${i * 70}ms` }}>
                                <span className="mini__year">{y}</span>
                                <div><strong>{t}</strong><p>{d}</p></div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="section">
                <div className="wrap">
                    <div className="section__head" data-reveal>
                        <h2 className="section__title">What people say</h2>
                        <p className="section__note">From managers, founders and engineers I've worked alongside.</p>
                    </div>
                    <div data-reveal><Recommendation lead content={lead.content} author={lead.author} headline={lead.headline} highlights={lead.highlights} /></div>
                    <div className="quote-grid">
                        {recommendations.map((r, i) => (
                            <div key={r.author.name} data-reveal style={{ '--d': `${(i % 2) * 80}ms` }}>
                                <Recommendation content={r.content} author={r.author.name} headline={r.author.headline} highlights={r.highlights} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}
