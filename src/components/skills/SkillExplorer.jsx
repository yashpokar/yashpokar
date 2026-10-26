import React, { useMemo, useState } from 'react'
import { Link } from 'react-router'
import skills from '../../constants/home/skills'
import projects from '../../data/projects'
import { posts } from '../../lib/posts'

/* How each listed skill is detected in projects and posts. Word-boundary regexes keep "Java" from matching "JavaScript". */
const MATCH = {
    'LangGraph agents': /langgraph/i, 'MCP': /\bMCP\b/, 'A2A': /\bA2A\b/, 'AG-UI': /AG-UI/i, 'A2UI generative UI': /A2UI/i,
    'RAG pipelines': /\bRAG\b|retriev/i, 'Evals & LLM-as-judge': /\beval/i, 'LoRA fine-tuning': /\bLoRA\b|fine-tun/i,
    'Guardrails': /guardrail/i, 'OpenAI & Claude APIs': /openai|claude/i,
    'Golang': /golang/i, 'Python': /\bpython\b/i, 'Java': /\bjava\b/i, 'Node.js': /node\.js/i, 'FastAPI': /fastapi/i,
    'Flask': /\bflask\b/i, 'Spring Boot': /spring boot/i, 'GraphQL': /graphql/i,
    'React': /\breact\b/i, 'TypeScript': /typescript/i, 'Next.js': /next\.js/i, 'Streaming UIs': /\bstreaming\b/i, 'CopilotKit': /copilotkit/i,
    'AWS': /\baws\b/i, 'Kubernetes': /kubernetes/i, 'Docker': /docker/i, 'Kafka': /kafka/i, 'Redis': /\bredis\b/i,
    'MySQL': /mysql/i, 'Solr': /\bsolr\b/i, 'SageMaker': /sagemaker/i,
}

const projText = p => [p.title, p.problem, p.result, ...p.did, ...p.tags].join(' ')
const postText = p => [p.title, p.summary, p.tags.join(' '), p.content].join(' ')

export default function SkillExplorer() {
    const [cat, setCat] = useState(skills[0].category)
    const [active, setActive] = useState(skills[0].items[0])

    const evidence = useMemo(() => {
        const out = {}
        for (const g of skills) for (const s of g.items) {
            const re = MATCH[s]
            const ps = projects.filter(p => re.test(projText(p)))
            const bl = posts
                .map(p => ({ p, n: (postText(p).match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')) || []).length }))
                .filter(x => x.n > 0).sort((a, b) => b.n - a.n)
            out[s] = { projects: ps, posts: bl, score: ps.length * 3 + bl.length }
        }
        return out
    }, [])

    const group = skills.find(g => g.category === cat)
    const ev = evidence[active]

    return (
        <div className="explorer">
            <div className="explorer__tabs" role="tablist">
                {skills.map(g => (
                    <button key={g.category} type="button" role="tab" aria-selected={cat === g.category}
                        className={`blog-tag${cat === g.category ? ' blog-tag--active' : ''}`}
                        onClick={() => { setCat(g.category); setActive(g.items[0]) }}>{g.category}</button>
                ))}
            </div>

            <div className="explorer__chips">
                {group.items.map(s => (
                    <button key={s} type="button" className={`chip${active === s ? ' chip--on' : ''}`} onClick={() => setActive(s)}>
                        {s}<i style={{ '--w': Math.min(1, evidence[s].score / 8) }} aria-hidden="true" />
                    </button>
                ))}
            </div>

            <div className="explorer__panel" key={active}>
                <div className="explorer__title">{active}</div>
                <div className="explorer__stats">
                    <span><b>{ev.projects.length}</b> project{ev.projects.length === 1 ? '' : 's'}</span>
                    <span><b>{ev.posts.length}</b> post{ev.posts.length === 1 ? '' : 's'}</span>
                </div>

                {ev.projects.length > 0 && (
                    <div className="explorer__block">
                        <div className="explorer__label">Used in</div>
                        <ul>
                            {ev.projects.map(p => (
                                <li key={p.slug}><Link to={`/work#${p.slug}`}><strong>{p.title}</strong><small>{p.org} · {p.year}</small></Link></li>
                            ))}
                        </ul>
                    </div>
                )}
                {ev.posts.length > 0 && (
                    <div className="explorer__block">
                        <div className="explorer__label">Written about in</div>
                        <ul>
                            {ev.posts.slice(0, 4).map(({ p, n }) => (
                                <li key={p.slug}><Link to={`/blog/${p.slug}`}><strong>{p.title}</strong><small>mentioned {n}×</small></Link></li>
                            ))}
                        </ul>
                    </div>
                )}
                {ev.projects.length === 0 && ev.posts.length === 0 && (
                    <p className="explorer__none">No public write-up for this one yet. Ask me about it.</p>
                )}
            </div>
        </div>
    )
}
