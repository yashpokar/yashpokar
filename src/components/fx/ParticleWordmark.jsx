import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

/*
 * Thousands of particles that assemble into words, morph between them,
 * flee from the pointer, and scatter when clicked. Canvas 2D, no deps.
 */
export default function ParticleWordmark({ words, interval = 3400 }) {
    const canvasRef = useRef(null)
    const [word, setWord] = useState(0)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        let W = 0, H = 0, particles = [], targets = [], raf = 0, wordIdx = 0, timer = 0, dead = false
        const mouse = { x: -9999, y: -9999, down: false }
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6d8cff'
        const accent2 = getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim() || '#a78bfa'
        const ink = () => getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#fff'

        const resize = () => {
            if (dead || !canvas.parentElement) return
            const r = canvas.parentElement.getBoundingClientRect()
            W = Math.floor(r.width); H = Math.floor(r.height)
            canvas.width = W * dpr; canvas.height = H * dpr
            canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }

        // Rasterise a word offscreen and sample its filled pixels into target points.
        const sample = text => {
            const off = document.createElement('canvas')
            const octx = off.getContext('2d')
            off.width = W; off.height = H
            let size = Math.min(H * 0.8, W / (text.length * 0.56))
            octx.font = `600 ${size}px "Bricolage Grotesque", "Geist", sans-serif`
            const tw = octx.measureText(text).width
            if (tw > W * 0.94) { size *= (W * 0.94) / tw; octx.font = `600 ${size}px "Bricolage Grotesque", "Geist", sans-serif` }
            octx.fillStyle = '#fff'
            octx.textAlign = 'center'; octx.textBaseline = 'middle'
            octx.fillText(text, W / 2, H / 2)
            const step = W < 640 ? 6 : W < 1100 ? 5 : 4
            const data = octx.getImageData(0, 0, W, H).data
            const pts = []
            for (let y = 0; y < H; y += step)
                for (let x = 0; x < W; x += step)
                    if (data[(y * W + x) * 4 + 3] > 128) pts.push({ x, y })
            // shuffle so morphs look organic rather than row-by-row
            for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]] }
            return pts
        }

        const retarget = () => {
            targets = sample(words[wordIdx])
            const n = Math.max(targets.length, particles.length)
            while (particles.length < n) {
                particles.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: 0, ty: 0, s: 1 + Math.random() * 1.6, c: Math.random() })
            }
            particles.forEach((p, i) => {
                if (i < targets.length) { p.tx = targets[i].x; p.ty = targets[i].y; p.alive = true }
                else { p.tx = Math.random() * W; p.ty = Math.random() * H; p.alive = false }
            })
        }

        const scatter = () => particles.forEach(p => {
            const a = Math.random() * Math.PI * 2, v = 6 + Math.random() * 14
            p.vx += Math.cos(a) * v; p.vy += Math.sin(a) * v
        })

        const frame = () => {
            ctx.clearRect(0, 0, W, H)
            const col = ink()
            for (const p of particles) {
                // spring to target
                p.vx += (p.tx - p.x) * 0.045
                p.vy += (p.ty - p.y) * 0.045
                // flee the pointer
                const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy
                if (d2 < 110 * 110) { const d = Math.sqrt(d2) || 1, f = (110 - d) / 110 * 2.4; p.vx += dx / d * f; p.vy += dy / d * f }
                p.vx *= 0.82; p.vy *= 0.82
                p.x += p.vx; p.y += p.vy
                if (!p.alive) continue
                const speed = Math.min(1, Math.hypot(p.vx, p.vy) / 6)
                ctx.fillStyle = speed > 0.25 ? (p.c > 0.5 ? accent : accent2) : col
                ctx.globalAlpha = 0.55 + 0.45 * (1 - speed)
                ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s)
            }
            ctx.globalAlpha = 1
            raf = requestAnimationFrame(frame)
        }

        const onMove = e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top }
        const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }
        const onClick = () => scatter()
        const next = () => { wordIdx = (wordIdx + 1) % words.length; setWord(wordIdx); retarget() }

        const start = () => {
            if (dead) return
            resize(); retarget()
            particles.forEach(p => { p.x = W / 2 + (Math.random() - 0.5) * W * 1.4; p.y = H / 2 + (Math.random() - 0.5) * H * 2 })
            if (reduce) { particles.forEach(p => { p.x = p.tx; p.y = p.ty }) }
            raf = requestAnimationFrame(frame)
            if (!reduce) timer = setInterval(next, interval)
        }

        document.fonts.ready.then(start)
        const onResize = () => { if (!dead) { resize(); retarget() } }
        window.addEventListener('resize', onResize)
        canvas.addEventListener('pointermove', onMove)
        canvas.addEventListener('pointerleave', onLeave)
        canvas.addEventListener('pointerdown', onClick)
        return () => {
            dead = true; cancelAnimationFrame(raf); clearInterval(timer)
            window.removeEventListener('resize', onResize)
            canvas.removeEventListener('pointermove', onMove)
            canvas.removeEventListener('pointerleave', onLeave)
            canvas.removeEventListener('pointerdown', onClick)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="wordmark" aria-label={words.join(', ')} role="img">
            <canvas ref={canvasRef} className="wordmark__canvas" />
            <div className="wordmark__dots" aria-hidden="true">
                {words.map((w, i) => <span key={w} className={i === word ? 'on' : ''} />)}
            </div>
        </div>
    )
}
ParticleWordmark.propTypes = { words: PropTypes.arrayOf(PropTypes.string).isRequired, interval: PropTypes.number }
