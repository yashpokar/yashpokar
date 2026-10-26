import React, { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { flushSync } from 'react-dom'
import useTheme from '../../hooks/useTheme'
import CommandPalette, { useCommandPalette } from '../fx/CommandPalette'

const LINKS = [
    { to: '/work',    label: 'Work',    route: true },
    { to: '/about',   label: 'About',   route: true },
    { to: '/skills',  label: 'Skills',  route: true },
    { to: '/blog',    label: 'Blog',    route: true },
    { to: '/contact', label: 'Contact', route: true },
]

const SunIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
    </svg>
)
const MoonIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
)

export default function Nav() {
    const [theme, toggleTheme] = useTheme()
    const [open, setOpen] = useState(false)
    const [paletteOpen, setPaletteOpen] = useCommandPalette()
    const [scrolled, setScrolled] = useState(false)
    const { pathname } = useLocation()

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => { setOpen(false) }, [pathname])

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    // Circular reveal from the toggle button when the browser supports view transitions.
    const switchTheme = e => {
        const btn = e?.currentTarget
        if (!document.startViewTransition || !btn || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            toggleTheme(); return
        }
        const r = btn.getBoundingClientRect()
        const x = r.left + r.width / 2, y = r.top + r.height / 2
        const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
        const t = document.startViewTransition(() => { flushSync(toggleTheme) })
        t.ready.then(() => document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
        ))
    }
    const nextTheme = theme === 'light' ? 'dark' : 'light'

    return (
        <nav className={`nav${scrolled ? ' nav--scrolled' : ''}${open ? ' nav--open' : ''}`}>
            <div className="wrap nav__inner">
                <Link to="/" className="nav__brand">
                    Yash Pokar
                </Link>

                <div className="nav__links">
                    {LINKS.map(l => l.route
                        ? <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}>{l.label}</NavLink>
                        : <a key={l.to} href={l.to} className="nav__link">{l.label}</a>
                    )}
                </div>

                <button type="button" className="nav__kbd" onClick={() => setPaletteOpen(true)} aria-label="Open command palette">
                    <span>Search</span><kbd>⌘K</kbd>
                </button>

                <button type="button" className="nav__theme" onClick={switchTheme} aria-label={`Switch to ${nextTheme} mode`} title={`Switch to ${nextTheme} mode`}>
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>

                <Link to="/contact" className="nav__cta">Let's talk</Link>

                <button type="button" className="nav__burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(o => !o)}>
                    <span /><span /><span />
                </button>
            </div>

            <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onToggleTheme={toggleTheme} />

            <div className="nav__drawer" aria-hidden={!open}>
                {LINKS.map(l => l.route
                    ? <Link key={l.to} to={l.to} className="nav__drawer__link">{l.label}</Link>
                    : <a key={l.to} href={l.to} className="nav__drawer__link" onClick={() => setOpen(false)}>{l.label}</a>
                )}
                <a href="mailto:hello@yashpokar.com" className="nav__drawer__link nav__drawer__link--cta">hello@yashpokar.com</a>
            </div>
        </nav>
    )
}
