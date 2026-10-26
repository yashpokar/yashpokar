import React from 'react'
import { Link } from 'react-router'
import SystemDiagram from '../components/home/SystemDiagram'
import Bento from '../components/home/Bento'
import PostRow from '../components/blog/PostRow'
import ParticleWordmark from '../components/fx/ParticleWordmark'
import projects from '../data/projects'
import useStars from '../hooks/useStars'
import { posts } from '../lib/posts'
import useReveal from '../hooks/useReveal'

const years = Math.floor((Date.now() - new Date('2017-12-01')) / (1000 * 60 * 60 * 24 * 365.25))
const oss = projects.filter(p => p.kind === 'Open source')
const WORDS = ['AGENTS', 'EVALS', 'KAFKA', 'GEN UI', 'SHIP IT']

const explore = [
    { to: '/work',   title: 'Work',   body: 'Career timeline and six projects, each framed as problem, action and result.' },
    { to: '/about',  title: 'About',  body: 'How I work, the short version of the career, and what colleagues say.' },
    { to: '/skills', title: 'Skills', body: 'The stack on a globe, and the four agent protocol layers explained.' },
    { to: '/blog',   title: 'Blog',   body: `${posts.length} posts on agents, evals, generative UI, infrastructure and data.` },
]

function OssCard({ p, delay }) {
    const stars = useStars(p.repo, p.stars)
    return (
        <article className="osscard" data-reveal style={{ '--d': `${delay}ms` }}>
            <div className="osscard__top">
                <span className="osscard__kind">{p.year}</span>
                <a className="osscard__stars" href={`https://github.com/${p.repo}`} target="_blank" rel="noopener noreferrer" aria-label={`${stars} stars on GitHub`}>★ {stars}</a>
            </div>
            <h3 className="osscard__title">{p.title}</h3>
            <p className="osscard__blurb">{p.blurb}</p>
            <div className="stop__tech">{p.tags.map(t => <span key={t}>{t}</span>)}</div>
            <div className="osscard__links">
                <Link to={`/work#${p.slug}`} className="textlink">Read the story</Link>
                <a href={`https://github.com/${p.repo}`} target="_blank" rel="noopener noreferrer" className="textlink">GitHub ↗</a>
            </div>
        </article>
    )
}

export default function HomeScreen() {
    useReveal()

    return (
        <main>
            <section className="hero hero--stack">
                <div className="wrap">
                    <div className="hero__status" data-rise="1">
                        <span className="hero__status__dot" />
                        Hi, I'm Yash. Press <kbd>⌘K</kbd> to wander.
                    </div>
                    <h1 className="hero__statement hero__statement--sm" data-rise="2">
                        I build the systems behind products that have to work.
                    </h1>
                    <p className="hero__lede" data-rise="3">
                        Senior full stack developer on the R&amp;D team at Twilio Segment, shipping AI features to customers.
                        {' '}{years} years of crawlers, data pipelines and Kubernetes platforms, and now agents, evals,
                        and the generative UI protocols that put them in front of real users.
                    </p>
                    <div className="hero__actions" data-rise="4">
                        <Link to="/contact" className="btn btn--primary" data-magnetic><span className="btn__bg" />Start a conversation</Link>
                        <Link to="/work" className="btn btn--ghost" data-magnetic>See my work</Link>
                    </div>
                </div>
                <div className="hero__word" data-rise="5">
                    <ParticleWordmark words={WORDS} />
                    <p className="hero__poke">↑ go on, poke it. Click to scatter.</p>
                </div>
            </section>

            <section className="section section--tight">
                <div className="wrap">
                    <Bento years={years} />
                </div>
            </section>

            <section className="section">
                <div className="wrap">
                    <div className="section__head" data-reveal>
                        <h2 className="section__title">Built in the open</h2>
                        <p className="section__note">Two public projects on GitHub that people have starred.</p>
                    </div>
                    <div className="oss">
                        {oss.map((p, i) => <OssCard key={p.slug} p={p} delay={i * 90} />)}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="wrap stackgrid stackgrid--flush">
                    <div data-reveal>
                        <h2 className="section__title">The stack, in motion</h2>
                        <p className="section__note">Events and documents go in. An agent with tools and an eval gate does the thinking. AG-UI streams it, A2UI draws it, and a person stays in the loop.</p>
                        <Link to="/skills" className="textlink">Explore the stack →</Link>
                    </div>
                    <div data-reveal style={{ '--d': '100ms' }}><SystemDiagram /></div>
                </div>
            </section>

            <section className="section">
                <div className="wrap">
                    <div className="section__head" data-reveal>
                        <h2 className="section__title">Explore</h2>
                        <p className="section__note">Four places to go next.</p>
                    </div>
                    <div className="explore">
                        {explore.map((e, i) => (
                            <Link key={e.to} to={e.to} className="explore__card" data-reveal style={{ '--d': `${i * 70}ms` }}>
                                <span className="explore__arrow" aria-hidden="true">↗</span>
                                <h3>{e.title}</h3>
                                <p>{e.body}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="wrap">
                    <div className="section__head section__head--row" data-reveal>
                        <div>
                            <h2 className="section__title">Selected work</h2>
                            <p className="section__note">Three of six. The rest are on the Work page.</p>
                        </div>
                        <Link to="/work" className="btn btn--ghost">All projects</Link>
                    </div>
                    <div className="post-grid">
                        {['functions-copilot', 'spot-kubernetes', 'selenium-free-crawler'].map(sl => projects.find(p => p.slug === sl)).map((p, i) => (
                            <Link key={p.slug} to={`/work#${p.slug}`} className="tile tile--post" data-reveal style={{ '--d': `${i * 80}ms` }}>
                                <div className="tile__kicker">{p.org} · {p.year}</div>
                                <div className="tile__title">{p.title}</div>
                                <p className="tile__body">{p.metric}</p>
                                <div className="tile__tags">{p.tags.slice(0, 3).map(t => <span key={t}>{t}</span>)}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="wrap">
                    <div className="section__head section__head--row" data-reveal>
                        <div>
                            <h2 className="section__title">Latest from the blog</h2>
                            <p className="section__note">Notes on the systems I build.</p>
                        </div>
                        <Link to="/blog" className="btn btn--ghost">All {posts.length} posts</Link>
                    </div>
                    <div className="post-grid">
                        {posts.slice(0, 3).map((p, i) => (
                            <div key={p.slug} data-reveal style={{ '--d': `${i * 80}ms` }}><PostRow post={p} card /></div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="wrap">
                    <div className="cta" data-reveal>
                        <div className="cta__glow" aria-hidden="true" />
                        <h2 className="cta__title">Have a system that has to work?</h2>
                        <p className="cta__body">I'm happiest on problems with real constraints: throughput, cost, correctness, or an agent that needs to behave. Say hello.</p>
                        <Link to="/contact" className="btn btn--primary" data-magnetic><span className="btn__bg" />Get in touch</Link>
                    </div>
                </div>
            </section>
        </main>
    )
}
