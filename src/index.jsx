import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import Root from './Root'

import './assets/css/app.css'

const el = document.getElementById('root')
const app = (
    <React.StrictMode>
        <Root />
    </React.StrictMode>
)

// Production pages arrive prerendered, so hydrate them; the dev server serves an empty shell.
if (el.hasChildNodes()) hydrateRoot(el, app)
else createRoot(el).render(app)
