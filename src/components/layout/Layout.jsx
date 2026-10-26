import React from 'react'
import { Outlet, useLocation } from 'react-router'
import Backdrop from '../fx/Backdrop'
import Nav from './Nav'
import Footer from './Footer'

/** The single frame every page renders inside: backdrop, nav, a keyed page region, footer. */
export default function Layout() {
    const { pathname } = useLocation()
    return (
        <>
            <a href="#main" className="skip">Skip to content</a>
            <Backdrop />
            <Nav />
            <div key={pathname} id="main" className="page">
                <Outlet />
            </div>
            <Footer />
        </>
    )
}
