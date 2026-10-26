import { useCallback, useEffect, useState } from 'react'

const KEY = 'yp-theme'

/** Starts as 'dark' so server and client markup match, then syncs to what index.html already applied before first paint. */
export default function useTheme() {
    const [theme, setTheme] = useState('dark')

    useEffect(() => {
        setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
    }, [])

    const toggle = useCallback(() => {
        setTheme(t => {
            const next = t === 'light' ? 'dark' : 'light'
            document.documentElement.dataset.theme = next
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'light' ? '#f5f7fb' : '#070b14')
            try { localStorage.setItem(KEY, next) } catch { /* ignore */ }
            return next
        })
    }, [])

    return [theme, toggle]
}
