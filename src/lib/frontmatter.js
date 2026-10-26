/**
 * Tiny dependency-free frontmatter parser.
 * Works in the browser (Vite) and in Node (vite.config / RSS generation).
 *
 * Supports:   key: value   ·   key: "quoted"   ·   key: [a, b, c]   ·   key: true/false
 */
const coerce = raw => {
    const v = raw.trim()
    if (v === 'true')  return true
    if (v === 'false') return false
    if (/^\[.*\]$/.test(v)) {
        return v.slice(1, -1)
            .split(',')
            .map(s => s.trim().replace(/^["']|["']$/g, ''))
            .filter(Boolean)
    }
    return v.replace(/^["']|["']$/g, '')
}

export function parseFrontmatter(src) {
    const match = /^---\s*\n([\s\S]*?)\n---\s*\n?/.exec(src)
    if (!match) return { data: {}, content: src }

    const data = {}
    for (const line of match[1].split('\n')) {
        const idx = line.indexOf(':')
        if (idx === -1 || line.trim().startsWith('#')) continue
        data[line.slice(0, idx).trim()] = coerce(line.slice(idx + 1))
    }
    return { data, content: src.slice(match[0].length) }
}

export const slugify = str =>
    str.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')

export const readingTime = content => {
    const words = content
        .replace(/```[\s\S]*?```/g, '')
        .split(/\s+/)
        .filter(Boolean).length
    return Math.max(1, Math.round(words / 220))
}

/** Pull `## ` and `### ` headings (outside code fences) for a table of contents. */
export const extractHeadings = content => {
    const out = []
    let inFence = false
    for (const line of content.split('\n')) {
        if (/^```/.test(line)) { inFence = !inFence; continue }
        if (inFence) continue
        const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
        if (m) out.push({ depth: m[1].length, text: m[2], id: slugify(m[2]) })
    }
    return out
}
