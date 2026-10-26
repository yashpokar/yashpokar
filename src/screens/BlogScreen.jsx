import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import PageHeader from '../components/layout/PageHeader'
import PostRow from '../components/blog/PostRow'
import { posts, tags } from '../lib/posts'
import useMeta from '../hooks/useMeta'

export default function BlogScreen() {
    const [params, setParams] = useSearchParams()
    const active = params.get('tag')
    const [query, setQuery] = useState('')

    useMeta('Blog', 'Notes on backend systems, infrastructure, and building AI products — by Yash Pokar.')

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase()
        return posts.filter(p =>
            (!active || p.tags.includes(active)) &&
            (!q || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)))
        )
    }, [active, query])

    const setTag = tag => setParams(tag ? { tag } : {})
    const filtering = Boolean(active || query)

    return (
        <>
            <main className="wrap">
                <PageHeader
                    crumbs={[{ label: 'Blog' }]}
                    title="Blog"
                    intro={`Field notes from ${new Date().getFullYear() - 2017} years of shipping backend systems, trimming cloud bills, and putting agents in front of real users. Specific over general.`}
                />

                <div className="blog-tools">
                    <label className="blog-search">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                        <input type="search" placeholder="Search" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search posts" />
                    </label>
                    <div className="blog-tags">
                        <button type="button" className={`blog-tag${!active ? ' blog-tag--active' : ''}`} onClick={() => setTag(null)}>All</button>
                        {tags.map(t => (
                            <button key={t} type="button" className={`blog-tag${active === t ? ' blog-tag--active' : ''}`} onClick={() => setTag(active === t ? null : t)}>{t}</button>
                        ))}
                    </div>
                </div>

                <section className="blog-list">
                    {visible.map((p, i) => <PostRow key={p.slug} post={p} featured={!filtering && i === 0} />)}

                    {visible.length === 0 && (
                        <div className="blog-empty">
                            No posts match “{query || active}”.
                            <button type="button" className="blog-tag blog-tag--active" onClick={() => { setQuery(''); setTag(null) }}>Show all</button>
                        </div>
                    )}

                    <p className="blog-more">
                        Older posts are on <a href="https://yashpokar.medium.com" target="_blank" rel="noopener noreferrer">Medium</a>. Subscribe via <a href="/rss.xml">RSS</a>.
                    </p>
                </section>
            </main>
        </>
    )
}
