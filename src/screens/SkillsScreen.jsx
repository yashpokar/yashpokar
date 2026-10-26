import React from 'react'
import { Link } from 'react-router'
import PageHeader from '../components/layout/PageHeader'
import SkillSphere from '../components/home/SkillSphere'
import SkillExplorer from '../components/skills/SkillExplorer'
import AgentPlayground from '../components/skills/AgentPlayground'
import EvalLab from '../components/skills/EvalLab'
import StackYears from '../components/skills/StackYears'
import decisions from '../data/decisions'
import { posts } from '../lib/posts'
import useReveal from '../hooks/useReveal'

const protocols = [
    ['MCP', 'Agent to tool', 'How an agent calls things in the world.'],
    ['A2A', 'Agent to agent', 'How agents delegate work to each other.'],
    ['AG-UI', 'Agent to user', 'A typed event stream from a run to the client.'],
    ['A2UI', 'What the user sees', 'UI described as data, rendered with trusted components.'],
]
const titleOf = slug => posts.find(p => p.slug === slug)?.title

export default function SkillsScreen() {
    useReveal()
    return (
        <>
            <PageHeader
                crumbs={[{ label: 'Skills' }]}
                title="Skills"
                intro="Claims are cheap, so each skill here links to the projects and posts behind it. Then a live agent run, how the stack changed over eight years, and the defaults I reach for and why."
            />

            <section className="section section--tight">
                <div className="wrap skillsplit">
                    <div data-reveal><SkillSphere /></div>
                    <div data-reveal style={{ '--d': '80ms' }}>
                        <div className="section__head"><h2 className="section__title">Proof, not claims</h2>
                            <p className="section__note">Pick a skill. The bar under each one shows how much public evidence there is.</p></div>
                        <SkillExplorer />
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="wrap">
                    <div className="section__head" data-reveal>
                        <h2 className="section__title">Watch an agent run</h2>
                        <p className="section__note">An invoice-approval agent, streamed as the same kinds of events AG-UI defines. It stops and asks before it acts.</p>
                    </div>
                    <div data-reveal><AgentPlayground /></div>
                    <p className="layers__more" data-reveal>How the protocol works: <Link to="/blog/ag-ui-the-protocol-between-agents-and-your-frontend">AG-UI</Link> and <Link to="/blog/a2ui-when-the-agent-builds-the-interface">A2UI</Link>.</p>
                </div>
            </section>

            <section className="section">
                <div className="wrap">
                    <div className="section__head" data-reveal>
                        <h2 className="section__title">Try an eval gate</h2>
                        <p className="section__note">Ten generated outputs, some broken. Switch the checks on and see what each layer catches, and what it blocks by mistake.</p>
                    </div>
                    <div data-reveal><EvalLab /></div>
                </div>
            </section>

            <section className="section">
                <div className="wrap">
                    <div className="section__head" data-reveal>
                        <h2 className="section__title">How the stack changed</h2>
                        <p className="section__note">One row per job. Bright tools showed up for the first time; dim ones carried forward.</p>
                    </div>
                    <StackYears />
                </div>
            </section>

            <section className="section">
                <div className="wrap">
                    <div className="section__head" data-reveal>
                        <h2 className="section__title">What I reach for, and why</h2>
                        <p className="section__note">Defaults earned the hard way. Each links to the write-up.</p>
                    </div>
                    <div className="decisions">
                        {decisions.map((d, i) => (
                            <article key={d.when} className="decision" data-reveal style={{ '--d': `${(i % 3) * 70}ms` }}>
                                <div className="decision__when">{d.when}</div>
                                <div className="decision__pick">{d.pick}</div>
                                <p>{d.why}</p>
                                {titleOf(d.post) && <Link to={`/blog/${d.post}`} className="decision__link">{titleOf(d.post)}</Link>}
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="wrap">
                    <div className="section__head" data-reveal>
                        <h2 className="section__title">The agent protocol stack</h2>
                        <p className="section__note">Four layers have settled. The demo above sits on the third.</p>
                    </div>
                    <div className="layers">
                        {protocols.map(([name, role, d], i) => (
                            <div key={name} className="layer" data-reveal style={{ '--d': `${i * 70}ms` }}>
                                <div className="layer__name">{name}</div><div className="layer__role">{role}</div><p>{d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}
