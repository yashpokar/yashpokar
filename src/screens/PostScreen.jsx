import React, { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import langBash       from 'highlight.js/lib/languages/bash'
import langGo         from 'highlight.js/lib/languages/go'
import langJava       from 'highlight.js/lib/languages/java'
import langJs         from 'highlight.js/lib/languages/javascript'
import langJson       from 'highlight.js/lib/languages/json'
import langPython     from 'highlight.js/lib/languages/python'
import langSql        from 'highlight.js/lib/languages/sql'
import langTs         from 'highlight.js/lib/languages/typescript'
import langYaml       from 'highlight.js/lib/languages/yaml'
import langMarkdown   from 'highlight.js/lib/languages/markdown'
import langDockerfile from 'highlight.js/lib/languages/dockerfile'

// Only bundle the languages the blog actually uses (keeps the post chunk small).
const LANGUAGES = {
    bash: langBash, sh: langBash, shell: langBash, zsh: langBash,
    go: langGo, golang: langGo,
    java: langJava,
    javascript: langJs, js: langJs, jsx: langJs,
    json: langJson,
    python: langPython, py: langPython,
    sql: langSql,
    typescript: langTs, ts: langTs, tsx: langTs,
    yaml: langYaml, yml: langYaml,
    markdown: langMarkdown, md: langMarkdown,
    dockerfile: langDockerfile,
}
import CodeBlock from '../components/blog/CodeBlock'
import { getPost, adjacent, posts } from '../lib/posts'
import { slugify } from '../lib/frontmatter'
import useMeta from '../hooks/useMeta'

const text = node => {
    if (typeof node === 'string') return node
    if (Array.isArray(node)) return node.map(text).join('')
    if (node?.props?.children) return text(node.props.children)
    return ''
}

const Heading = Tag => function H({ children, ...rest }) {
    const id = slugify(text(children))
    return (
        <Tag id={id} {...rest}>
            <a href={`#${id}`} className="prose__anchor" aria-label="Link to this section">#</a>
            {children}
        </Tag>
    )
}

const components = {
    h2: Heading('h2'),
    h3: Heading('h3'),
    pre: CodeBlock,
    a: ({ href = '', children, ...rest }) => {
        const external = /^https?:\/\//.test(href)
        return (
            <a href={href} {...rest} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {children}
            </a>
        )
    },
}

export default function PostScreen() {
    const { slug } = useParams()
    const post = getPost(slug)
    const [progress, setProgress] = useState(0)
    const [activeId, setActiveId] = useState(null)

    useMeta(post?.title, post?.summary)

    // Reading progress bar
    useEffect(() => {
        const onScroll = () => {
            const el = document.documentElement
            const max = el.scrollHeight - el.clientHeight
            setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0)
        }
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [slug])

    // Highlight the TOC entry currently in view
    useEffect(() => {
        if (!post) return
        const io = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) }),
            { rootMargin: '-80px 0px -70% 0px' }
        )
        document.querySelectorAll('.prose h2[id], .prose h3[id]').forEach(h => io.observe(h))
        return () => io.disconnect()
    }, [post])

    if (!post) return <Navigate to="/blog" replace />

    const { newer, older } = adjacent(slug)
    const related = posts
        .filter(p => p.slug !== slug)
        .map(p => ({ ...p, overlap: p.tags.filter(t => post.tags.includes(t)).length }))
        .filter(p => p.overlap > 0)
        .sort((a, b) => b.overlap - a.overlap || (a.date < b.date ? 1 : -1))
        .slice(0, 3)
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const h2s = post.headings.filter(h => h.depth === 2)

    return (
        <>
            <div className="read-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />

            <article className="wrap post">
                <div className="post__grid">
                    <div>
                        <Link to="/blog" className="post__back">← Blog</Link>
                        <h1 className="post__title">{post.title}</h1>
                        <p className="post__summary">{post.summary}</p>
                        <div className="post__meta">
                            <time dateTime={post.date}>{post.dateLabel}</time>
                            <span>{post.minutes} min read</span>
                            {post.tags.map(t => (
                                <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`}>{t}</Link>
                            ))}
                        </div>

                        <div className="prose">
                            <Markdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[[rehypeHighlight, { languages: LANGUAGES }]]}
                                components={components}
                            >
                                {post.content}
                            </Markdown>
                        </div>

                        <footer className="post__end">
                            <div className="post__share">
                                <span>Share</span>
                                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}&via=yashpokar`} target="_blank" rel="noopener noreferrer">X</a>
                                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                                <button type="button" onClick={() => navigator.clipboard?.writeText(url)}>Copy link</button>
                            </div>

                            <div className="post__author">
                                <img src="/me.jpg" alt="" />
                                <div>
                                    <strong>Yash Pokar</strong>
                                    <p>Senior full stack developer at Twilio Segment. I write about the systems I build and the mistakes I make along the way.</p>
                                </div>
                            </div>

                            {related.length > 0 && (
                                <div className="related">
                                    <div className="related__label">Keep reading</div>
                                    {related.map(r => (
                                        <Link key={r.slug} to={`/blog/${r.slug}`} className="related__item">
                                            <strong>{r.title}</strong>
                                            <small>{r.minutes} min · {r.tags.filter(t => post.tags.includes(t)).slice(0, 2).join(', ')}</small>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <nav className="post__nav" aria-label="Adjacent posts">
                                {older ? (
                                    <Link to={`/blog/${older.slug}`}><span>Older</span><strong>{older.title}</strong></Link>
                                ) : <span />}
                                {newer ? (
                                    <Link to={`/blog/${newer.slug}`}><span>Newer</span><strong>{newer.title}</strong></Link>
                                ) : <span />}
                            </nav>
                        </footer>
                    </div>

                    {h2s.length > 1 && (
                        <aside className="toc">
                            <div className="toc__label">Contents</div>
                            <ol>
                                {h2s.map(h => (
                                    <li key={h.id}>
                                        <a href={`#${h.id}`} className={activeId === h.id ? 'toc__active' : ''}>{h.text}</a>
                                    </li>
                                ))}
                            </ol>
                        </aside>
                    )}
                </div>
            </article>
        </>
    )
}
