import React from 'react'
import { Link } from 'react-router'

export default function NotFoundScreen() {
    return (
        <>
            <main className="wrap notfound">
                <h1>That page doesn't exist.</h1>
                <p>It may have moved, or the link was mistyped.</p>
                <Link to="/" className="nav__cta">Go to the home page</Link>
            </main>
        </>
    )
}
