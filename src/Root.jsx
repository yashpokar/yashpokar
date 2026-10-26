import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router'

import Cursor from './components/fx/Cursor'
import Layout from './components/layout/Layout'

const HomeScreen     = lazy(() => import('./screens/HomeScreen'))
const BlogScreen     = lazy(() => import('./screens/BlogScreen'))
const PostScreen     = lazy(() => import('./screens/PostScreen'))
const WorkScreen     = lazy(() => import('./screens/WorkScreen'))
const AboutScreen    = lazy(() => import('./screens/AboutScreen'))
const SkillsScreen   = lazy(() => import('./screens/SkillsScreen'))
const ContactScreen  = lazy(() => import('./screens/ContactScreen'))
const NotFoundScreen = lazy(() => import('./screens/NotFoundScreen'))

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

const Root = () => (
    <Router>
        <ScrollManager />
        <Cursor />
        <Suspense fallback={<div className="route-loading" />}>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/"           element={<HomeScreen />} />
                    <Route path="/work"       element={<WorkScreen />} />
                    <Route path="/about"      element={<AboutScreen />} />
                    <Route path="/skills"     element={<SkillsScreen />} />
                    <Route path="/blog"       element={<BlogScreen />} />
                    <Route path="/blog/:slug" element={<PostScreen />} />
                    <Route path="/contact"    element={<ContactScreen />} />
                    <Route path="*"           element={<NotFoundScreen />} />
                </Route>
            </Routes>
        </Suspense>
    </Router>
)

export default Root
