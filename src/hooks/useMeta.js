import { useEffect } from 'react'

const SITE = 'Yash Pokar'

export default function useMeta(title, description) {
    useEffect(() => {
        document.title = title ? `${title} — ${SITE}` : `${SITE} — Senior Full Stack Developer`
        if (description) {
            document.querySelector('meta[name="description"]')?.setAttribute('content', description)
        }
    }, [title, description])
}
