import React, { Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import Cursor from './components/fx/Cursor'
import Layout from './components/layout/Layout'
import SeoSync from './components/layout/SeoSync'

/** Scroll to top on route change, or to the hash target when one is present. */
const ScrollManager = () => {
    const { pathname, hash } = useLocation()
    useEffect(() => {
        if (hash) {
            const el = document.querySelector(hash)
            if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
        }
        window.scrollTo({ top: 0 })
    }, [pathname, hash])
    return null
}

/** Shared by the browser (lazy screens) and the prerenderer (eager screens), so both produce the same tree. */
export default function AppShell({ screens }) {
    const { Home, Work, About, Skills, Blog, Post, Contact, NotFound } = screens
    return (
        <>
            <ScrollManager />
            <SeoSync />
            <Cursor />
            <Suspense fallback={<div className="route-loading" />}>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/work" element={<Work />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/skills" element={<Skills />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<Post />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </Suspense>
        </>
    )
}
