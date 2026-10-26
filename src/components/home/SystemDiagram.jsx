import React, { useEffect, useRef } from 'react'

/*
 * A live schematic of the stack I actually run: ingest on the left, streaming in the
 * middle, services and the LLM layer on the right. Packets travel the edges on SVG
 * motion paths; the panel tilts toward the pointer and drifts on scroll.
 */
const W = 150, H = 56
const NODES = {
    events:   { x: 16,  y: 20,  label: 'Events',        sub: 'web · mobile · API' },
    docs:     { x: 16,  y: 112, label: 'Documents',     sub: 'knowledge base' },
    users:    { x: 16,  y: 296, label: 'People',        sub: 'approve · edit' },
    kafka:    { x: 196, y: 20,  label: 'Kafka',         sub: 'streams · topics' },
    rag:      { x: 196, y: 112, label: 'Vector store',  sub: 'embeddings · RAG' },
    tools:    { x: 196, y: 204, label: 'Tools',         sub: 'MCP servers' },
    evals:    { x: 196, y: 296, label: 'Evals',         sub: 'judge · CI gate' },
    agent:    { x: 376, y: 20,  label: 'Agent',         sub: 'langgraph · models' },
    agui:     { x: 376, y: 158, label: 'AG-UI',         sub: 'event stream' },
    ui:       { x: 376, y: 296, label: 'Generative UI', sub: 'A2UI · react' },
}
// [from, to, packet delay (s), target y-offset so fan-ins don't stack on one point]
const EDGES = [
    ['events', 'kafka', 0,   0],
    ['docs',   'rag',   0.9, 0],
    ['kafka',  'agent', 0.5, -14],
    ['rag',    'agent', 1.4, -4],
    ['tools',  'agent', 0.3, 6],
    ['evals',  'agent', 1.9, 16],
    ['agent',  'agui',  1.1, 0],
    ['agui',   'ui',    1.7, 0],
    ['users',  'ui',    2.2, 'under'],
]

const edgePath = (a, b, dy = 0) => {
    if (dy === 'under') {
        // route beneath whatever sits between the two columns
        const x1 = a.x + W, x2 = b.x, y = a.y + H / 2, yu = 374
        return `M ${x1} ${y} C ${x1 + 30} ${y}, ${x1 + 30} ${yu}, ${x1 + 60} ${yu} L ${x2 - 60} ${yu} C ${x2 - 30} ${yu}, ${x2 - 30} ${y}, ${x2} ${y}`
    }
    if (a.x === b.x) {
        const x = a.x + W / 2, y1 = a.y + H, y2 = b.y
        return `M ${x} ${y1} C ${x} ${y1 + 28}, ${x} ${y2 - 28}, ${x} ${y2}`
    }
    const x1 = a.x + W, y1 = a.y + H / 2
    const x2 = b.x,     y2 = b.y + H / 2 + dy
    const c  = (x2 - x1) * 0.55
    return `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`
}

export default function SystemDiagram() {
    const wrap = useRef(null)

    useEffect(() => {
        const el = wrap.current
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        if (!window.matchMedia('(pointer: fine)').matches) return

        let raf = 0, rx = 0, ry = 0, tx = 0, ty = 0
        const loop = () => {
            rx += (tx - rx) * 0.1
            ry += (ty - ry) * 0.1
            el.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`
            raf = requestAnimationFrame(loop)
        }
        const onMove = e => {
            const r = el.getBoundingClientRect()
            const px = (e.clientX - r.left) / r.width  - 0.5
            const py = (e.clientY - r.top)  / r.height - 0.5
            tx = -py * 10
            ty =  px * 12
        }
        const onLeave = () => { tx = 0; ty = 0 }
        const area = el.parentElement
        area.addEventListener('pointermove', onMove)
        area.addEventListener('pointerleave', onLeave)
        raf = requestAnimationFrame(loop)
        return () => {
            cancelAnimationFrame(raf)
            area.removeEventListener('pointermove', onMove)
            area.removeEventListener('pointerleave', onLeave)
        }
    }, [])

    return (
        <div className="diagram">
            <div ref={wrap} className="diagram__panel">
                <div className="diagram__bar">
                    <span className="diagram__dot diagram__dot--live" />
                    <span>production · bangalore</span>
                    <span className="diagram__bar__right">live</span>
                </div>

                <svg viewBox="0 0 540 388" className="diagram__svg" role="img" aria-label="Diagram of events and documents flowing through Kafka and a vector store, with MCP tools and an eval gate feeding a LangGraph agent that streams over AG-UI into a generative A2UI interface that people interact with">
                    <defs>
                        <linearGradient id="edge" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0"   stopColor="var(--accent)" stopOpacity="0.15" />
                            <stop offset="1"   stopColor="var(--accent-2)" stopOpacity="0.45" />
                        </linearGradient>
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="b" />
                            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>

                    {EDGES.map(([a, b, , dy]) => (
                        <path key={a + b} d={edgePath(NODES[a], NODES[b], dy)} className="diagram__edge" />
                    ))}

                    {EDGES.map(([a, b, delay, dy]) => (
                        <circle key={'p' + a + b} r="3.2" className="diagram__packet" filter="url(#glow)">
                            <animateMotion dur="2.6s" begin={`${delay}s`} repeatCount="indefinite" path={edgePath(NODES[a], NODES[b], dy)} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.4 0 0.2 1" />
                        </circle>
                    ))}

                    {Object.entries(NODES).map(([key, n], i) => (
                        <g key={key} className="diagram__node" style={{ animationDelay: `${i * 0.35}s` }} transform={`translate(${n.x} ${n.y})`}>
                            <rect width={W} height={H} rx="10" className="diagram__node__box" />
                            <text x="14" y="24" className="diagram__node__label">{n.label}</text>
                            <text x="14" y="42" className="diagram__node__sub">{n.sub}</text>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    )
}
