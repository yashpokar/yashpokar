import React, { useEffect, useRef } from 'react'
import {
    siLangchain, siModelcontextprotocol, siClaude, siGo, siPython, siOpenjdk, siNodedotjs,
    siFastapi, siSpringboot, siGraphql, siReact, siTypescript, siNextdotjs, siKubernetes,
    siDocker, siApachekafka, siRedis, siMysql, siApachesolr, siFlask, siPytorch,
} from 'simple-icons'

/* Brand logos where they exist; a compact badge for protocols, techniques and the few brands without a logo. */
const ITEMS = [
    { name: 'LangGraph', icon: siLangchain }, { name: 'MCP', icon: siModelcontextprotocol },
    { name: 'Claude', icon: siClaude },       { name: 'PyTorch', icon: siPytorch },
    { name: 'Go', icon: siGo },               { name: 'Python', icon: siPython },
    { name: 'Java', icon: siOpenjdk },        { name: 'Node.js', icon: siNodedotjs },
    { name: 'FastAPI', icon: siFastapi },     { name: 'Spring Boot', icon: siSpringboot },
    { name: 'Flask', icon: siFlask },         { name: 'GraphQL', icon: siGraphql },
    { name: 'React', icon: siReact },         { name: 'TypeScript', icon: siTypescript },
    { name: 'Next.js', icon: siNextdotjs },   { name: 'Kubernetes', icon: siKubernetes },
    { name: 'Docker', icon: siDocker },       { name: 'Kafka', icon: siApachekafka },
    { name: 'Redis', icon: siRedis },         { name: 'MySQL', icon: siMysql },
    { name: 'Solr', icon: siApachesolr },
    { name: 'AG-UI' }, { name: 'A2UI' }, { name: 'A2A' }, { name: 'RAG' }, { name: 'Evals' },
    { name: 'LoRA' }, { name: 'OpenAI' }, { name: 'AWS' }, { name: 'SageMaker' },
]

const lum = hex => {
    const n = parseInt(hex, 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

export default function SkillSphere() {
    const ref = useRef(null)
    useEffect(() => {
        const canvas = ref.current, ctx = canvas.getContext('2d')
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        let W = 0, H = 0, R = 0, raf = 0, ax = 0.0022, ay = 0.0036, tx = 0.0022, ty = 0.0036
        const n = ITEMS.length
        const pts = ITEMS.map((it, i) => {
            const phi = Math.acos(1 - 2 * (i + 0.5) / n), theta = Math.PI * (1 + Math.sqrt(5)) * i
            return { ...it, path: it.icon ? new Path2D(it.icon.path) : null, x: Math.cos(theta) * Math.sin(phi), y: Math.sin(theta) * Math.sin(phi), z: Math.cos(phi) }
        })
        const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim()
        const resize = () => {
            const r = canvas.parentElement.getBoundingClientRect()
            W = r.width; H = r.height; R = Math.min(W, H) * 0.36
            canvas.width = W * dpr; canvas.height = H * dpr
            canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }
        const rot = (p, a, b) => {
            const cy = Math.cos(a), sy = Math.sin(a), cx = Math.cos(b), sx = Math.sin(b)
            const x = p.x * cy - p.z * sy; let z = p.x * sy + p.z * cy
            const y = p.y * cx - z * sx; z = p.y * sx + z * cx
            p.x = x; p.y = y; p.z = z
        }
        const frame = () => {
            ax += (tx - ax) * 0.05; ay += (ty - ay) * 0.05
            ctx.clearRect(0, 0, W, H)
            const ink = css('--ink'), accent = css('--accent'), line = css('--line-strong'), mono = css('--font-mono')
            const dark = document.documentElement.dataset.theme !== 'light'
            const order = pts.map(p => { if (!reduce) rot(p, ay, ax); return p }).slice().sort((a, b) => a.z - b.z)
            for (const p of order) {
                const depth = (p.z + 1) / 2
                const size = 20 + depth * 20
                const cx = W / 2 + p.x * R, cy = H / 2 + p.y * R
                ctx.globalAlpha = 0.2 + depth * 0.8
                if (p.path) {
                    const l = lum(p.icon.hex)
                    const color = (dark && l < 0.38) || (!dark && l > 0.8) ? ink : '#' + p.icon.hex
                    ctx.save()
                    ctx.translate(cx - size / 2, cy - size / 2)
                    ctx.scale(size / 24, size / 24)
                    ctx.fillStyle = color
                    ctx.fill(p.path)
                    ctx.restore()
                } else {
                    const fs = 9 + depth * 4
                    ctx.font = `500 ${fs}px ${mono}`
                    const w = ctx.measureText(p.name).width + 16, h = fs + 12
                    ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 8)
                    ctx.strokeStyle = depth > 0.85 ? accent : line; ctx.lineWidth = 1; ctx.stroke()
                    ctx.fillStyle = depth > 0.85 ? accent : ink
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
                    ctx.fillText(p.name, cx, cy + 0.5)
                }
                // label the logos that face you so they stay legible
                if (p.path && depth > 0.82) {
                    ctx.globalAlpha = (depth - 0.82) / 0.18 * 0.9
                    ctx.font = `500 11px ${mono}`
                    ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
                    ctx.fillText(p.name, cx, cy + size / 2 + 4)
                }
            }
            ctx.globalAlpha = 1
            raf = requestAnimationFrame(frame)
        }
        const onMove = e => {
            const r = canvas.getBoundingClientRect()
            tx = ((e.clientY - r.top) / r.height - 0.5) * 0.02
            ty = ((e.clientX - r.left) / r.width - 0.5) * 0.02
        }
        const onLeave = () => { tx = 0.0022; ty = 0.0036 }
        resize(); raf = requestAnimationFrame(frame)
        window.addEventListener('resize', resize)
        canvas.addEventListener('pointermove', onMove)
        canvas.addEventListener('pointerleave', onLeave)
        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave) }
    }, [])
    return <div className="sphere"><canvas ref={ref} aria-label={'Skills: ' + ITEMS.map(i => i.name).join(', ')} role="img" /></div>
}
