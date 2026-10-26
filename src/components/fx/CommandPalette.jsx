import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { posts } from '../../lib/posts'

const copy = text => navigator.clipboard?.writeText(text)

export const useCommandPalette = () => {
    const [open, setOpen] = useState(false)
    useEffect(() => {
        const onKey = e => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(o => !o) }
            if (e.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])
    return [open, setOpen]
}

export default function CommandPalette({ open, onClose, onToggleTheme }) {
    const navigate = useNavigate()
    const [q, setQ] = useState('')
    const [idx, setIdx] = useState(0)
    const input = useRef(null)

    const items = useMemo(() => [
        { group: 'Go to', label: 'Home',       hint: '/',          run: () => navigate('/') },
        { group: 'Go to', label: 'Work',       hint: '/work',      run: () => navigate('/work') },
        { group: 'Go to', label: 'About',      hint: '/about',     run: () => navigate('/about') },
        { group: 'Go to', label: 'Skills',     hint: '/skills',    run: () => navigate('/skills') },
        { group: 'Go to', label: 'Blog',       hint: '/blog',      run: () => navigate('/blog') },
        { group: 'Go to', label: 'Contact',    hint: '/contact',   run: () => navigate('/contact') },
        { group: 'Do',    label: 'Toggle theme',       hint: 'light / dark', run: onToggleTheme },
        { group: 'Do',    label: 'Copy email address', hint: 'hello@yashpokar.com', run: () => copy('hello@yashpokar.com') },
        { group: 'Do',    label: 'Email Yash',         hint: 'opens mail',   run: () => { location.href = 'mailto:hello@yashpokar.com' } },
        { group: 'Open',  label: 'GitHub',   hint: 'github.com/yashpokar',      run: () => window.open('https://github.com/yashpokar', '_blank') },
        { group: 'Open',  label: 'LinkedIn', hint: 'linkedin.com/in/yashpokar', run: () => window.open('https://linkedin.com/in/yashpokar', '_blank') },
        { group: 'Open',  label: 'X',        hint: '@yashpokar',               run: () => window.open('https://twitter.com/yashpokar', '_blank') },
        { group: 'Open',  label: 'RSS feed', hint: '/rss.xml',                 run: () => window.open('/rss.xml', '_blank') },
        ...posts.map(p => ({ group: 'Read', label: p.title, hint: `${p.minutes} min`, run: () => navigate(`/blog/${p.slug}`) })),
    ], [navigate, onToggleTheme])

    const results = useMemo(() => {
        const norm = t => t.toLowerCase().replace(/[^a-z0-9]/g, '')
        const s = norm(q)
        if (!s) return items
        return items.filter(i => norm(i.label + i.hint + i.group).includes(s))
    }, [q, items])

    useEffect(() => { if (open) { setQ(''); setIdx(0); setTimeout(() => input.current?.focus(), 10) } }, [open])
    useEffect(() => { setIdx(0) }, [q])

    if (!open) return null

    const pick = item => { item.run(); onClose() }
    const onKey = e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(results.length - 1, i + 1)) }
        if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(0, i - 1)) }
        if (e.key === 'Enter' && results[idx]) pick(results[idx])
    }

    let lastGroup = null
    return (
        <div className="palette" onClick={onClose} role="dialog" aria-label="Command palette">
            <div className="palette__box" onClick={e => e.stopPropagation()}>
                <div className="palette__input">
                    <span aria-hidden="true">›</span>
                    <input ref={input} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey} placeholder="Jump anywhere, read anything, or just press Esc" aria-label="Search commands" />
                    <kbd>esc</kbd>
                </div>
                <ul className="palette__list">
                    {results.length === 0 && <li className="palette__empty">Nothing for “{q}”. Try “blog” or “email”.</li>}
                    {results.map((item, i) => {
                        const head = item.group !== lastGroup ? <li key={'g' + item.group} className="palette__group">{item.group}</li> : null
                        lastGroup = item.group
                        return (
                            <React.Fragment key={item.group + item.label}>
                                {head}
                                <li className={`palette__item${i === idx ? ' is-active' : ''}`} onMouseEnter={() => setIdx(i)} onClick={() => pick(item)}>
                                    <span>{item.label}</span><small>{item.hint}</small>
                                </li>
                            </React.Fragment>
                        )
                    })}
                </ul>
                <div className="palette__foot"><kbd>↑</kbd><kbd>↓</kbd> move <kbd>↵</kbd> go <kbd>⌘K</kbd> toggle</div>
            </div>
        </div>
    )
}
