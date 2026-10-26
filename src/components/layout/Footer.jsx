import React from 'react'
import { Link } from 'react-router'

const SOCIAL = [
    ['GitHub', 'https://github.com/yashpokar'],
    ['LinkedIn', 'https://linkedin.com/in/yashpokar'],
    ['X', 'https://twitter.com/yashpokar'],
    ['Medium', 'https://yashpokar.medium.com'],
    ['Stack Overflow', 'https://stackoverflow.com/users/5939254/yash-pokar'],
]

export default function Footer() {
    return (
        <footer className="footer">
            <div className="wrap footer__grid">
                <div className="footer__brand">
                    <div className="footer__name">Yash Pokar</div>
                    <p>Senior full stack developer building agents, evals and the infrastructure under them. Bangalore, India.</p>
                    <a href="mailto:hello@yashpokar.com" className="footer__mail">hello@yashpokar.com</a>
                </div>
                <div className="footer__col">
                    <div className="footer__head">Site</div>
                    <Link to="/work">Work</Link>
                    <Link to="/about">About</Link>
                    <Link to="/skills">Skills</Link>
                    <Link to="/blog">Blog</Link>
                    <Link to="/contact">Contact</Link>
                </div>
                <div className="footer__col">
                    <div className="footer__head">Elsewhere</div>
                    {SOCIAL.map(([l, u]) => <a key={l} href={u} target="_blank" rel="noopener noreferrer">{l}</a>)}
                </div>
                <div className="footer__col">
                    <div className="footer__head">Subscribe</div>
                    <a href="/rss.xml">RSS feed</a>
                    <span className="footer__hint">Press <kbd>⌘K</kbd> anywhere to jump around.</span>
                </div>
            </div>
            <div className="wrap footer__legal">© {new Date().getFullYear()} Yash Pokar. All rights reserved.</div>
        </footer>
    )
}
