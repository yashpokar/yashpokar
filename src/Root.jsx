import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router'

const HomeScreen = lazy(() => import('./screens/HomeScreen'))

const Root = () => (
    <Router>
        <Suspense fallback={<div />}>
            <Routes>
                <Route path="/" element={<HomeScreen />} />
            </Routes>
        </Suspense>
    </Router>
)

export default Root
