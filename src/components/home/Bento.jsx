import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import useInView from '../../hooks/useInView'

const ease = t => 1 - Math.pow(1 - t, 3)

function CountUp({ to, decimals = 0, duration = 1400, start }) {
    const [v, setV] = useState(0)
    useEffect(() => {
        if (!start) return
        let raf, t0
        const tick = now => {
            t0 ??= now
            const p = Math.min(1, (now - t0) / duration)
            setV(to * ease(p))
            if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [start, to, duration])
    return <>{v.toFixed(decimals)}</>
}
CountUp.propTypes = { to: PropTypes.number.isRequired, decimals: PropTypes.number, duration: PropTypes.number, start: PropTypes.bool }

/* Pointer-tracking spotlight on each tile (CSS reads --mx / --my). */
const track = e => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export default function Bento({ years }) {
    const [ref, inView] = useInView({ threshold: 0.3 })
    return (
        <div ref={ref} className="bento">
            <div className="tile tile--wide" onPointerMove={track} data-reveal>
                <div className="tile__kicker">Twilio · Segment R&amp;D</div>
                <div className="tile__big">Segment's first customer-facing AI feature</div>
                <p className="tile__body">Functions Copilot: plain-English prompts to working Segment functions. Hackathon demo to production: retrieval, a LangGraph agent, a streaming editor integration, and the eval set that made every change measurable.</p>
            </div>
            <div className="tile" onPointerMove={track} data-reveal style={{ '--d': '80ms' }}>
                <div className="tile__num"><CountUp to={15} start={inView} />×</div>
                <div className="tile__label">faster crawling after dropping Selenium</div>
            </div>
            <div className="tile" onPointerMove={track} data-reveal style={{ '--d': '160ms' }}>
                <div className="tile__num"><CountUp to={60} start={inView} />%</div>
                <div className="tile__label">lower infra bill at Zivame on spot Kubernetes</div>
            </div>
            <div className="tile" onPointerMove={track} data-reveal style={{ '--d': '240ms' }}>
                <div className="tile__num"><span className="tile__num--dim">3.5h →</span> <CountUp to={20} start={inView} />m</div>
                <div className="tile__label">Zivame nightly SKU sync after a concurrency rewrite</div>
            </div>
            <div className="tile" onPointerMove={track} data-reveal style={{ '--d': '320ms' }}>
                <div className="tile__num"><CountUp to={years} start={inView} />+</div>
                <div className="tile__label">years shipping across four companies</div>
            </div>
        </div>
    )
}
Bento.propTypes = { years: PropTypes.number.isRequired }
