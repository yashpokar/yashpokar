import React, { useEffect } from 'react'
import SocialLink from './../components/home/SocialLink'
import Recommendation from './../components/home/Recommendation'
import recommendations from './../constants/home/recommendations'
import achievements from './../constants/home/achievements'
import skills from './../constants/home/skills'

const CAREER_START = new Date('2017-12-01')

const yearsOfExperience = () => {
    const now = new Date()
    const years = (now - CAREER_START) / (1000 * 60 * 60 * 24 * 365.25)
    return Math.floor(years) + '+'
}

export default function HomeScreen() {
    useEffect(() => {
        const io = new IntersectionObserver(
            entries => entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-visible')
                    io.unobserve(e.target)
                }
            }),
            { threshold: 0.08 }
        )
        document.querySelectorAll('.reveal').forEach(el => io.observe(el))
        return () => io.disconnect()
    }, [])

    return (
        <div className="site">

            {/* Ambient background orbs */}
            <div className="bg-orbs" aria-hidden="true">
                <div className="bg-orb bg-orb--1" />
                <div className="bg-orb bg-orb--2" />
                <div className="bg-orb bg-orb--3" />
            </div>

            {/* ── Navigation ── */}
            <nav className="nav">
                <div className="nav__inner">
                    <a href="/" className="nav__brand">YP</a>
                    <div className="nav__links">
                        <a href="#skills" className="nav__link">Skills</a>
                        <a href="#experience" className="nav__link">Experience</a>
                        <a href="#testimonials" className="nav__link">Testimonials</a>
                    </div>
                    <a href="mailto:hello@yashpokar.com" className="nav__cta">
                        Contact <span aria-hidden="true">↗</span>
                    </a>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section id="about" className="hero">
                <div className="hero__photo-wrap reveal reveal--d1">
                    <img src="/me.jpg" alt="Yash Pokar" className="hero__photo" />
                </div>

                <h1 className="hero__name reveal reveal--d2">Yash Pokar</h1>
                <p className="hero__role reveal reveal--d3">Senior Full Stack Developer</p>
                <div className="hero__divider reveal reveal--d3" />

                <p className="hero__bio reveal reveal--d3">
                    Building scalable systems and AI-powered products with {yearsOfExperience()} years of experience.
                    Currently at Twilio · Segment R&amp;D — delivered the company's first customer-facing AI product.
                </p>

                <div className="hero__location reveal reveal--d4">
                    <span className="hero__location__dot" />
                    Twilio · Segment R&amp;D &nbsp;—&nbsp; Bangalore, India
                </div>

                <div className="hero__contacts reveal reveal--d4">
                    <a href="mailto:hello@yashpokar.com" className="hero__contact">
                        hello@yashpokar.com
                    </a>
                    <span className="hero__contact">(+91) 940-956-7085</span>
                </div>

                <ul className="hero__social reveal reveal--d4">
                    <SocialLink icon="github"         url="https://github.com/yashpokar" />
                    <SocialLink icon="linkedin"       url="https://linkedin.com/in/yashpokar" />
                    <SocialLink icon="medium"         url="https://yashpokar.medium.com" />
                    <SocialLink icon="stack-overflow" url="https://stackoverflow.com/users/5939254/yash-pokar" />
                    <SocialLink icon="twitter"        url="https://twitter.com/yashpokar" />
                    <SocialLink icon="instagram"      url="https://instagram.com/yashpokar" />
                </ul>

                <div className="hero__scroll" aria-hidden="true">
                    <span>Scroll</span>
                    <div className="hero__scroll__arrow" />
                </div>
            </section>

            {/* ── Stats bar ── */}
            <div className="stats">
                <div className="stats__inner">
                    <div className="stat reveal">
                        <div className="stat__num">{yearsOfExperience()}</div>
                        <div className="stat__label">Years Experience</div>
                    </div>
                    <div className="stat__divider" aria-hidden="true" />
                    <div className="stat reveal reveal--d1">
                        <div className="stat__num">4</div>
                        <div className="stat__label">Companies</div>
                    </div>
                    <div className="stat__divider" aria-hidden="true" />
                    <div className="stat reveal reveal--d2">
                        <div className="stat__num">~60%</div>
                        <div className="stat__label">Cost Reduction</div>
                    </div>
                    <div className="stat__divider" aria-hidden="true" />
                    <div className="stat reveal reveal--d3">
                        <div className="stat__num">15×</div>
                        <div className="stat__label">Pipeline Speed-up</div>
                    </div>
                </div>
            </div>

            {/* ── Skills ── */}
            <section id="skills" className="skills">
                <div className="section-header reveal">
                    <p className="section-label">Tech Stack</p>
                    <h2 className="section-title">Skills</h2>
                </div>

                <div className="skills__grid">
                    {skills.map((group, i) => (
                        <div
                            key={group.category}
                            className={`skill-card reveal reveal--d${i + 1}`}
                        >
                            <div className="skill-card__category">{group.category}</div>
                            <div className="skill-card__tags">
                                {group.items.map(item => (
                                    <span key={item} className="skill-tag">{item}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Experience ── */}
            <section id="experience" className="journey">
                <div className="journey__inner">
                    <div className="section-header reveal">
                        <p className="section-label">Career</p>
                        <h2 className="section-title">Experience</h2>
                        <p className="section-subtitle">
                            7+ years of building, scaling, and shipping across the full stack.
                        </p>
                    </div>

                    <div className="journey__timeline">
                        <div className="journey__spine" aria-hidden="true" />
                        <div className="journey__items">
                            {achievements.map((item, i) => (
                                <div
                                    key={i}
                                    className={`journey__item journey__item--${i % 2 === 0 ? 'left' : 'right'} reveal reveal--${i % 2 === 0 ? 'left' : 'right'}`}
                                >
                                    <div className="journey__item__year">{item.year}</div>
                                    <div className="journey__item__dot" aria-hidden="true">
                                        <div className="journey__item__dot__ring" />
                                    </div>
                                    <div className="journey__item__card">
                                        <h3 className="journey__item__title">{item.title}</h3>
                                        <p className="journey__item__desc">{item.description}</p>
                                        <div className="journey__item__tags">
                                            {item.tags.map(tag => (
                                                <span key={tag} className="journey__item__tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section id="testimonials" className="testimonials">
                <div className="section-header reveal">
                    <p className="section-label">Social Proof</p>
                    <h2 className="section-title">Commendations</h2>
                    <p className="section-subtitle">
                        What colleagues, founders, and managers say about working with me.
                    </p>
                </div>

                <div className="testimonials__grid">
                    {recommendations.map((r, i) => (
                        <Recommendation
                            key={r.author.name}
                            author={r.author.name}
                            headline={r.author.headline}
                            address={r.author.address}
                            content={r.content}
                            className={`reveal reveal--d${(i % 4) + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="site-footer">
                <p>
                    &copy; {new Date().getFullYear()} &nbsp; Yash Pokar &nbsp;—&nbsp; Built with React &amp; Vite
                </p>
            </footer>
        </div>
    )
}
