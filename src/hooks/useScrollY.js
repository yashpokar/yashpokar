import { useEffect, useState } from 'react'

/** Current scroll position, throttled to animation frames. */
export default function useScrollY() {
    const [y, setY] = useState(0)
    useEffect(() => {
        let raf = 0
        const onScroll = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => setY(window.scrollY))
        }
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
    }, [])
    return y
}
