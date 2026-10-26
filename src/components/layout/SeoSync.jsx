import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { getSeo } from '../../seo'

const setMeta = (sel, attr, val) => {
    let el = document.head.querySelector(sel)
    if (!el) {
        el = document.createElement(sel.startsWith('link') ? 'link' : 'meta')
        const m = /\[(name|property|rel)="([^"]+)"\]/.exec(sel)
        if (m) el.setAttribute(m[1], m[2])
        document.head.appendChild(el)
    }
    el.setAttribute(attr, val)
}

/** Keeps <head> in step with the route during client-side navigation. The first load is already correct from the prerendered HTML. */
export default function SeoSync() {
    const { pathname } = useLocation()
    useEffect(() => {
        const s = getSeo(pathname)
        document.title = s.title
        setMeta('meta[name="description"]', 'content', s.description)
        setMeta('link[rel="canonical"]', 'href', s.canonical)
        setMeta('meta[name="robots"]', 'content', s.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1')
        for (const [p, v] of [['og:title', s.title], ['og:description', s.description], ['og:url', s.canonical], ['og:type', s.type]]) setMeta(`meta[property="${p}"]`, 'content', v)
        for (const [n, v] of [['twitter:title', s.title], ['twitter:description', s.description]]) setMeta(`meta[name="${n}"]`, 'content', v)
        let ld = document.getElementById('ld-json')
        if (s.ld) {
            if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'ld-json'; document.head.appendChild(ld) }
            ld.textContent = JSON.stringify(s.ld)
        } else ld?.remove()
    }, [pathname])
    return null
}
