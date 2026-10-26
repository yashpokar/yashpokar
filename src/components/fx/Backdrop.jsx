import React, { useEffect, useRef } from 'react'

/**
 * Fixed, layered backdrop:
 *  - dotted grid that drifts slower than the page (parallax)
 *  - two glow fields moving at different rates
 *  - a spotlight that follows the pointer (fine pointers only)
 *  - film-grain noise on top
 * All motion is transform-only and runs on its own rAF loop, outside React renders.
 */
export default function Backdrop() {
    const grid  = useRef(null)
    const glowA = useRef(null)
    const glowB = useRef(null)
    const spot  = useRef(null)

    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        let raf = 0, mx = window.innerWidth / 2, my = window.innerHeight / 3, sx = mx, sy = my

        const frame = () => {
            const y = window.scrollY
            if (!reduce) {
                grid.current  && (grid.current.style.transform  = `translate3d(0, ${y * -0.08}px, 0)`)
                glowA.current && (glowA.current.style.transform = `translate3d(0, ${y * -0.22}px, 0)`)
                glowB.current && (glowB.current.style.transform = `translate3d(0, ${y * -0.14}px, 0)`)
            }
            // ease the spotlight toward the pointer
            sx += (mx - sx) * 0.12
            sy += (my - sy) * 0.12
            spot.current && (spot.current.style.transform = `translate3d(${sx - 300}px, ${sy - 300}px, 0)`)
            raf = requestAnimationFrame(frame)
        }
        const onMove = e => { mx = e.clientX; my = e.clientY }
        window.addEventListener('pointermove', onMove, { passive: true })
        raf = requestAnimationFrame(frame)
        return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', onMove) }
    }, [])

    return (
        <div className="backdrop" aria-hidden="true">
            <div ref={grid}  className="backdrop__grid" />
            <div ref={glowA} className="backdrop__glow backdrop__glow--a" />
            <div ref={glowB} className="backdrop__glow backdrop__glow--b" />
            <div ref={spot}  className="backdrop__spot" />
            <div className="backdrop__noise" />
        </div>
    )
}
