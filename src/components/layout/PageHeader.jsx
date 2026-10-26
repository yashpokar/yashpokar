import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

/** Consistent page opener: breadcrumb, big title, one-paragraph intro, optional actions. */
export default function PageHeader({ crumbs = [], title, intro, children }) {
    return (
        <header className="pagehead">
            <div className="wrap">
                <nav className="crumbs" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    {crumbs.map(c => (
                        <React.Fragment key={c.label}>
                            <span aria-hidden="true">/</span>
                            {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
                        </React.Fragment>
                    ))}
                </nav>
                <h1 className="pagehead__title">{title}</h1>
                {intro && <p className="pagehead__intro">{intro}</p>}
                {children}
            </div>
        </header>
    )
}
PageHeader.propTypes = {
    crumbs: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string.isRequired, to: PropTypes.string })),
    title: PropTypes.node.isRequired, intro: PropTypes.node, children: PropTypes.node,
}
