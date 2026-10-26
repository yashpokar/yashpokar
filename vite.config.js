import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parseFrontmatter } from './src/lib/frontmatter.js'
import projects from './src/data/projects.js'
import faq from './src/data/faq.js'

const SITE = 'https://www.yashpokar.com'

const escape = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Client build only. Emits everything that is not a page:
 *  rss.xml, sitemap.xml, llms.txt, llms-full.txt, and a raw Markdown copy of every post at /blog/<slug>.md
 * The prerender step (scripts/prerender.mjs) then writes the HTML for each route.
 */
const siteFiles = () => {
  let ssr = false
  return {
    name: 'site-files',
    apply: 'build',
    configResolved(c) { ssr = Boolean(c.build.ssr) },
    closeBundle() {
      if (ssr) return
      const out = resolve('dist')
      const dir = resolve('src/content/posts')
      const posts = readdirSync(dir)
        .filter(f => f.endsWith('.md'))
        .map(f => {
          const { data, content } = parseFrontmatter(readFileSync(join(dir, f), 'utf8'))
          return { slug: data.slug || f.replace(/\.md$/, ''), ...data, content }
        })
        .filter(p => p.draft !== true)
        .sort((a, b) => (a.date < b.date ? 1 : -1))

      // RSS
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
    <description>Notes on AI agents, evals, generative UI, infrastructure and data pipelines.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>
`)

      // Sitemap with lastmod
      const today = new Date().toISOString().slice(0, 10)
      const latest = posts[0]?.date || today
      const urls = [
        ['/', today], ['/work', today], ['/about', today], ['/skills', today], ['/blog', latest], ['/contact', today],
        ...posts.map(p => [`/blog/${p.slug}`, p.date]),
      ]
      writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(([u, d]) => `
  <url><loc>${SITE}${u === '/' ? '/' : u}</loc><lastmod>${d}</lastmod></url>`).join('')}
</urlset>
`)

      // Raw Markdown per post, for answer engines and anyone who prefers plain text
      mkdirSync(join(out, 'blog'), { recursive: true })
      const md = p => `# ${p.title}\n\n> ${p.summary}\n\nBy Yash Pokar. Published ${p.date}. Tags: ${(p.tags || []).join(', ')}.\nCanonical: ${SITE}/blog/${p.slug}\n\n${p.content.trim()}\n`
      posts.forEach(p => writeFileSync(join(out, 'blog', `${p.slug}.md`), md(p)))

      // llms.txt: a short map of the site for language models
      const projLine = p => `- [${p.title}](${p.repo ? `https://github.com/${p.repo}` : `${SITE}/work#${p.slug}`}): ${p.metric}. ${p.org}, ${p.year}.`
      writeFileSync(join(out, 'llms.txt'), `# Yash Pokar

> Senior full stack developer in Bangalore, India, on the R&D team at Twilio Segment. Builds AI agents, LLM evals, generative UI and the infrastructure under them. About eight years of experience across web crawling, data pipelines, Kubernetes platforms and AI products.

Facts: Yash Pokar shipped Twilio's first customer-facing AI product (Functions Copilot) from a company hackathon, created the open-source AI software engineer ManasAI in March 2024, and writes about AG-UI, A2UI, evals and infrastructure. Contact: hello@yashpokar.com

## Pages
- [Home](${SITE}/): overview
- [Work](${SITE}/work): career timeline and ${projects.length} projects framed as problem, action, result
- [About](${SITE}/about): how he works, timeline, references and answers to common questions
- [Skills](${SITE}/skills): skills linked to the projects and posts that prove them
- [Blog](${SITE}/blog): ${posts.length} posts
- [Contact](${SITE}/contact)

## Projects
${projects.map(projLine).join('\n')}

## Blog posts (raw Markdown)
${posts.map(p => `- [${p.title}](${SITE}/blog/${p.slug}.md): ${p.summary}`).join('\n')}

## Optional
- [Full text of every post](${SITE}/llms-full.txt)
- [RSS](${SITE}/rss.xml)
- [GitHub](https://github.com/yashpokar)
- [LinkedIn](https://linkedin.com/in/yashpokar)
`)

      // llms-full.txt: the same facts plus every answer and post in one file
      writeFileSync(join(out, 'llms-full.txt'), `# Yash Pokar: full site content

Canonical site: ${SITE}

## Frequently asked questions

${faq.map(f => `### ${f.q}\n${f.a}`).join('\n\n')}

## Projects

${projects.map(p => `### ${p.title} (${p.org}, ${p.year})\nProblem: ${p.problem}\nWhat was done:\n${p.did.map(d => `- ${d}`).join('\n')}\nResult: ${p.result}${p.repo ? `\nRepository: https://github.com/${p.repo}` : ''}`).join('\n\n')}

## Blog posts

${posts.map(p => `${md(p)}\n---\n`).join('\n')}`)
    },
  }
}

export default defineConfig({
  plugins: [tailwindcss(), react(), siteFiles()],
})
