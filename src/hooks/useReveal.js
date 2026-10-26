import { useEffect } from 'react'

/** Adds `.in` to every `[data-reveal]` element as it scrolls into view. */
export default function useReveal(deps = []) {
    useEffect(() => {
        const io = new IntersectionObserver(
            entries => entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
            }),
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        )
        document.querySelectorAll('[data-reveal]:not(.in)').forEach(el => io.observe(el))
        return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
}
