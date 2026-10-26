import { useCallback, useEffect, useState } from 'react'

const KEY = 'yp-theme'

const resolve = () => {
    try {
        const saved = localStorage.getItem(KEY)
        if (saved === 'light' || saved === 'dark') return saved
    } catch { /* private mode */ }
    return 'dark'
}

export default function useTheme() {
    const [theme, setTheme] = useState(() =>
        document.documentElement.dataset.theme || resolve()
    )

    useEffect(() => {
        document.documentElement.dataset.theme = theme
        document.querySelector('meta[name="theme-color"]')
            ?.setAttribute('content', theme === 'light' ? '#f5f7fb' : '#070b14')
    }, [theme])

    const toggle = useCallback(() => {
        setTheme(t => {
            const next = t === 'light' ? 'dark' : 'light'
            try { localStorage.setItem(KEY, next) } catch { /* ignore */ }
            return next
        })
    }, [])

    return [theme, toggle]
}
