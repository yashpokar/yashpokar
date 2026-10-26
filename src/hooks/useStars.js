import { useEffect, useState } from 'react'

/** Live star count from the public GitHub API, falling back to the known number if the request fails or is rate limited. */
export default function useStars(repo, fallback) {
    const [stars, setStars] = useState(fallback)
    useEffect(() => {
        let alive = true
        fetch(`https://api.github.com/repos/${repo}`)
            .then(r => (r.ok ? r.json() : Promise.reject()))
            .then(d => { if (alive && Number.isFinite(d.stargazers_count)) setStars(d.stargazers_count) })
            .catch(() => {})
        return () => { alive = false }
    }, [repo])
    return stars
}
