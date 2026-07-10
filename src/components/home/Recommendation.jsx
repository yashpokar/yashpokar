import React from 'react'
import PropTypes from 'prop-types'

const initials = name =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

const Recommendation = ({ content, author, headline, address, className }) => (
    <div className={`recommendations__item${className ? ' ' + className : ''}`}>
        <div className="recommendations__item__content">
            {content}
        </div>
        <div className="recommendations__item__author">
            <div className="recommendations__item__avatar">
                {initials(author)}
            </div>
            <div>
                <div className="recommendations__item__name">{author}</div>
                <div className="recommendations__item__author__headline">
                    {headline}<br />{address}
                </div>
            </div>
        </div>
    </div>
)

Recommendation.propTypes = {
    content:   PropTypes.string.isRequired,
    author:    PropTypes.string.isRequired,
    headline:  PropTypes.string.isRequired,
    address:   PropTypes.string.isRequired,
    className: PropTypes.string,
}

export default Recommendation
