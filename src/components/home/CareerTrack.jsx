import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

/*
 * Pinned horizontal timeline: the section is tall, the inner panel sticks,
 * and vertical scroll drives horizontal travel. Falls back to a vertical stack on small screens.
 */
export default function CareerTrack({ items, heading = 'Experience' }) {
    const section = useRef(null), rail = useRef(null), bar = useRef(null)

    useEffect(() => {
        const sec = section.current, r = rail.current
        if (!sec || !r) return
        let raf = 0
        const update = () => {
            if (!window.matchMedia('(min-width: 961px)').matches) { r.style.transform = ''; return }
            const rect = sec.getBoundingClientRect()
            const total = sec.offsetHeight - window.innerHeight
            const p = Math.min(1, Math.max(0, -rect.top / total))
            const travel = r.scrollWidth - r.parentElement.clientWidth
            r.style.transform = `translate3d(${-p * travel}px, 0, 0)`
            if (bar.current) bar.current.style.transform = `scaleX(${p})`
        }
        const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }
        update()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
        return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
    }, [])

    return (
        <section ref={section} className="track" style={{ '--n': items.length }}>
            <div className="track__sticky">
                <div className="wrap track__head">
                    <h2 className="section__title">{heading}</h2>
                    <p className="section__note">Keep scrolling. The years slide by.</p>
                    <div className="track__bar" aria-hidden="true"><i ref={bar} /></div>
                </div>
                <div className="track__viewport">
                    <div ref={rail} className="track__rail">
                        {items.map((item, i) => (
                            <article key={item.company} className="stop" style={{ '--i': i }}>
                                <div className="stop__year" aria-hidden="true">{item.year}</div>
                                <div className="stop__card">
                                    <div className="stop__when">{item.when}</div>
                                    <h3 className="stop__company">{item.company}</h3>
                                    <div className="stop__role">{item.role}{item.about ? ` · ${item.about}` : ''}</div>
                                    <span className="stop__outcome">{item.metric}</span>
                                    <p className="stop__body">{item.description}</p>
                                    <div className="stop__tech">{item.tags.map(t => <span key={t}>{t}</span>)}</div>
                                </div>
                            </article>
                        ))}
                        <div className="stop stop--end">
                            <div className="stop__card stop__card--end">
                                <div className="stop__when">next</div>
                                <h3 className="stop__company">Your hard problem?</h3>
                                <p className="stop__body">If it has to scale, has to be cheap, or has an agent in it, I want to hear about it.</p>
                                <a href="mailto:hello@yashpokar.com" className="btn btn--primary"><span className="btn__bg" />Say hello</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
CareerTrack.propTypes = { items: PropTypes.array.isRequired, heading: PropTypes.string }
