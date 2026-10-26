import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { readdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parseFrontmatter } from './src/lib/frontmatter.js'

const SITE = 'https://yashpokar.com'

const escape = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * After every build:
 *  - rss.xml        from src/content/posts
 *  - sitemap.xml    for the home page, blog index and each post
 *  - 404.html       a copy of index.html so deep links work on static hosts (GitHub Pages etc.)
 */
const staticExtras = () => ({
  name: 'static-extras',
  apply: 'build',
  closeBundle() {
    const out   = resolve('dist')
    const dir   = resolve('src/content/posts')
    const posts = readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const { data, content } = parseFrontmatter(readFileSync(join(dir, f), 'utf8'))
        return { slug: data.slug || f.replace(/\.md$/, ''), ...data, content }
      })
      .filter(p => p.draft !== true)
      .sort((a, b) => (a.date < b.date ? 1 : -1))

    const items = posts.map(p => `
    <item>
      <title>${escape(p.title)}</title>
      <link>${SITE}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date + 'T00:00:00Z').toUTCString()}</pubDate>
      <description>${escape(p.summary || '')}</description>${(p.tags || []).map(t => `
      <category>${escape(t)}</category>`).join('')}
    </item>`).join('')

    writeFileSync(join(out, 'rss.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Yash Pokar — Blog</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Notes on backend systems, infrastructure, and building AI products.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>
`)

    const urls = ['/', '/work', '/about', '/skills', '/blog', '/contact', ...posts.map(p => `/blog/${p.slug}`)]
    writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `
  <url><loc>${SITE}${u}</loc></url>`).join('')}
</urlset>
`)

    copyFileSync(join(out, 'index.html'), join(out, '404.html'))
  },
})

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    staticExtras(),
  ],
})
