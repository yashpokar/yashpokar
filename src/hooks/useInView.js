import { useEffect, useRef, useState } from 'react'

/** True once the element has entered the viewport (stays true). */
export default function useInView(options = { threshold: 0.2 }) {
    const ref = useRef(null)
    const [inView, setInView] = useState(false)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setInView(true); io.disconnect() }
        }, options)
        io.observe(el)
        return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return [ref, inView]
}
