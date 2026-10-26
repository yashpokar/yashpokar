import { parseFrontmatter, readingTime, extractHeadings } from './frontmatter'

const files = import.meta.glob('../content/posts/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
})

const fmtDate = iso =>
    new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
    })

export const posts = Object.entries(files)
    .map(([path, raw]) => {
        const { data, content } = parseFrontmatter(raw)
        const slug = data.slug || path.split('/').pop().replace(/\.md$/, '')
        return {
            slug,
            title:       data.title || slug,
            summary:     data.summary || '',
            date:        data.date,
            dateLabel:   fmtDate(data.date),
            tags:        data.tags || [],
            draft:       data.draft === true,
            featured:    data.featured === true,
            minutes:     readingTime(content),
            headings:    extractHeadings(content),
            content,
        }
    })
    .filter(p => !p.draft || import.meta.env.DEV)
    .sort((a, b) => (a.date < b.date ? 1 : -1))

export const tags = [...new Set(posts.flatMap(p => p.tags))].sort()

export const getPost = slug => posts.find(p => p.slug === slug)

export const adjacent = slug => {
    const i = posts.findIndex(p => p.slug === slug)
    return {
        newer: i > 0 ? posts[i - 1] : null,
        older: i < posts.length - 1 ? posts[i + 1] : null,
    }
}
