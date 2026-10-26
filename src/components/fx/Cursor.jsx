import React, { useEffect, useRef } from 'react'

/** Custom cursor: a dot that sticks to the pointer and a ring that lags behind and grows over links. Fine pointers only. */
export default function Cursor() {
    const dot = useRef(null), ring = useRef(null)
    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches) return
        document.documentElement.classList.add('has-cursor')
        let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0, hot = false
        const move = e => {
            x = e.clientX; y = e.clientY
            hot = Boolean(e.target.closest?.('a, button, [role="button"], input, textarea, canvas'))
        }
        const loop = () => {
            rx += (x - rx) * 0.18; ry += (y - ry) * 0.18
            dot.current.style.transform  = `translate3d(${x}px, ${y}px, 0)`
            ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${hot ? 1.8 : 1})`
            ring.current.style.opacity = hot ? 0.9 : 0.5
            raf = requestAnimationFrame(loop)
        }
        const mag = e => {
            document.querySelectorAll('[data-magnetic]').forEach(el => {
                const r = el.getBoundingClientRect()
                const cx = r.left + r.width / 2, cy = r.top + r.height / 2
                const d = Math.hypot(e.clientX - cx, e.clientY - cy)
                el.style.transform = d < 110 ? `translate(${(e.clientX - cx) * 0.25}px, ${(e.clientY - cy) * 0.35}px)` : ''
            })
        }
        window.addEventListener('pointermove', mag, { passive: true })
        window.addEventListener('pointermove', move, { passive: true })
        raf = requestAnimationFrame(loop)
        return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move); window.removeEventListener('pointermove', mag); document.documentElement.classList.remove('has-cursor') }
    }, [])
    return (
        <>
            <div ref={dot} className="cursor" aria-hidden="true" />
            <div ref={ring} className="cursor-ring" aria-hidden="true" />
        </>
    )
}
