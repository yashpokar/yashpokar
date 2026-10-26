import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import AppShell from './AppShell'
import Home from './screens/HomeScreen'
import Work from './screens/WorkScreen'
import About from './screens/AboutScreen'
import Skills from './screens/SkillsScreen'
import Blog from './screens/BlogScreen'
import Post from './screens/PostScreen'
import Contact from './screens/ContactScreen'
import NotFound from './screens/NotFoundScreen'

const screens = { Home, Work, About, Skills, Blog, Post, Contact, NotFound }

export { getSeo, headHtml, routes } from './seo'

export function render(url) {
    return renderToString(
        <React.StrictMode>
            <StaticRouter location={url}>
                <AppShell screens={screens} />
            </StaticRouter>
        </React.StrictMode>
    )
}
