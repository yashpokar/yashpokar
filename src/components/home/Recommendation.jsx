import React from 'react'
import PropTypes from 'prop-types'

/** Wrap each highlight phrase in <mark>; phrases must match the text exactly. */
const withMarks = (text, phrases = []) => {
    if (!phrases.length) return text
    const esc = phrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const re = new RegExp(`(${esc.join('|')})`, 'g')
    return text.split(re).map((part, i) => phrases.includes(part) ? <mark key={i} className="hl">{part}</mark> : part)
}

const Recommendation = ({ content, author, headline, highlights, lead = false }) => (
    lead ? (
        <blockquote>
            <p className="quote-lead">{withMarks(content, highlights)}</p>
            <div className="quote__by"><strong>{author}</strong><span>{headline}</span></div>
        </blockquote>
    ) : (
        <blockquote className="quote">
            <p>{withMarks(content, highlights)}</p>
            <div className="quote__by"><strong>{author}</strong><span>{headline}</span></div>
        </blockquote>
    )
)

Recommendation.propTypes = {
    content:    PropTypes.string.isRequired,
    author:     PropTypes.string.isRequired,
    headline:   PropTypes.string.isRequired,
    highlights: PropTypes.arrayOf(PropTypes.string),
    lead:       PropTypes.bool,
}

export default Recommendation
