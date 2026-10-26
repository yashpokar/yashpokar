import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

const track = e => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export default function PostRow({ post, featured = false, card = false }) {
    if (card) {
        return (
            <Link to={`/blog/${post.slug}`} className="tile tile--post" onPointerMove={track}>
                <div className="tile__kicker">{post.dateLabel} · {post.minutes} min read</div>
                <div className="tile__title">{post.title}</div>
                <p className="tile__body">{post.summary}</p>
                <div className="tile__tags">{post.tags.slice(0, 3).map(t => <span key={t}>{t}</span>)}</div>
            </Link>
        )
    }
    return (
        <Link to={`/blog/${post.slug}`} className={`post-row${featured ? ' post-row--featured' : ''}`}>
            <time className="post-row__when" dateTime={post.date}>{post.dateLabel}</time>
            <div>
                <div className="post-row__title">{post.title}</div>
                {featured && <p className="post-row__summary">{post.summary}</p>}
                <div className="post-row__meta">{post.minutes} min read · {post.tags.slice(0, 3).join(', ')}</div>
            </div>
        </Link>
    )
}

PostRow.propTypes = {
    post:     PropTypes.object.isRequired,
    featured: PropTypes.bool,
    card:     PropTypes.bool,
}
