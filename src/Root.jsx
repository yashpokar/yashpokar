import React, { lazy } from 'react'
import { BrowserRouter } from 'react-router'
import AppShell from './AppShell'

const screens = {
    Home:     lazy(() => import('./screens/HomeScreen')),
    Work:     lazy(() => import('./screens/WorkScreen')),
    About:    lazy(() => import('./screens/AboutScreen')),
    Skills:   lazy(() => import('./screens/SkillsScreen')),
    Blog:     lazy(() => import('./screens/BlogScreen')),
    Post:     lazy(() => import('./screens/PostScreen')),
    Contact:  lazy(() => import('./screens/ContactScreen')),
    NotFound: lazy(() => import('./screens/NotFoundScreen')),
}

export default function Root() {
    return (
        <BrowserRouter>
            <AppShell screens={screens} />
        </BrowserRouter>
    )
}
