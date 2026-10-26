import { posts } from './lib/posts'
import projects from './data/projects'
import faq from './data/faq'

export const SITE = 'https://www.yashpokar.com'
export const NAME = 'Yash Pokar'
export const OG_IMAGE = `${SITE}/og.png`
const SAME_AS = [
    'https://github.com/yashpokar',
    'https://linkedin.com/in/yashpokar',
    'https://twitter.com/yashpokar',
    'https://yashpokar.medium.com',
    'https://stackoverflow.com/users/5939254/yash-pokar',
]

/** Trim to a snippet-safe length at a word boundary. */
const clip = (t, max = 155) => {
    if (t.length <= max) return t
    const cut = t.slice(0, max - 1)
    return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…'
}

const person = {
    '@type': 'Person',
    '@id': `${SITE}/#person`,
    name: NAME,
    url: SITE,
    image: `${SITE}/me.jpg`,
    email: 'mailto:hello@yashpokar.com',
    jobTitle: 'Senior Full Stack Developer',
    description: 'Senior full stack developer on the R&D team at Twilio Segment, building AI agents, evals and the infrastructure under them.',
    worksFor: { '@type': 'Organization', name: 'Twilio', url: 'https://www.twilio.com' },
    address: { '@type': 'PostalAddress', addressLocality: 'Bangalore', addressCountry: 'IN' },
    knowsAbout: ['AI agents', 'LLM evaluation', 'Retrieval-augmented generation', 'Generative UI', 'AG-UI', 'A2UI', 'Model Context Protocol', 'LangGraph', 'Kubernetes', 'Apache Kafka', 'Web crawling', 'Golang', 'Python', 'TypeScript'],
    sameAs: SAME_AS,
}
const website = {
    '@type': 'WebSite', '@id': `${SITE}/#website`, url: SITE, name: NAME, inLanguage: 'en',
    publisher: { '@id': `${SITE}/#person` },
}
const crumbs = items => ({
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })),
})
const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes })

const PAGES = {
    '/': {
        title: 'Yash Pokar | Senior Full Stack Developer, AI Agents & Evals',
        description: 'Yash Pokar is a senior full stack developer at Twilio Segment in Bangalore, building AI agents, evals, generative UI and the infrastructure under them.',
        ld: () => graph(person, website, { '@type': 'ProfilePage', '@id': `${SITE}/#webpage`, url: SITE, name: NAME, mainEntity: { '@id': `${SITE}/#person` }, isPartOf: { '@id': `${SITE}/#website` } }),
    },
    '/work': {
        title: 'Work: Projects and Case Studies | Yash Pokar',
        description: "Projects by Yash Pokar: Twilio's first customer-facing AI product, the open-source ManasAI agent, an Amazon crawler, Kubernetes on spot and data pipelines.",
        ld: () => graph(person, crumbs([['Home', '/'], ['Work', '/work']]), {
            '@type': 'ItemList', name: 'Selected projects',
            itemListElement: projects.map((p, i) => ({
                '@type': 'ListItem', position: i + 1,
                item: p.repo
                    ? { '@type': 'SoftwareSourceCode', name: p.title, description: p.blurb, codeRepository: `https://github.com/${p.repo}`, license: 'https://opensource.org/license/mit', author: { '@id': `${SITE}/#person` }, url: `${SITE}/work#${p.slug}` }
                    : { '@type': 'CreativeWork', name: p.title, description: p.metric, author: { '@id': `${SITE}/#person` }, url: `${SITE}/work#${p.slug}` },
            })),
        }),
    },
    '/about': {
        title: 'About Yash Pokar | Senior Full Stack Developer in Bangalore',
        description: 'About Yash Pokar: how he works, an eight-year career from web crawling to AI agents at Twilio Segment, what colleagues say, and answers to common questions.',
        ld: () => graph(person, crumbs([['Home', '/'], ['About', '/about']]), {
            '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }),
    },
    '/skills': {
        title: 'Skills: AI Agents, Evals and Infrastructure | Yash Pokar',
        description: 'The stack Yash Pokar works with, linked to the projects and posts that prove it: LangGraph, MCP, A2A, AG-UI, A2UI, RAG, evals, Go, Python, Kubernetes and Kafka.',
        ld: () => graph(person, crumbs([['Home', '/'], ['Skills', '/skills']])),
    },
    '/blog': {
        title: 'Blog: AI Agents, Evals, Generative UI | Yash Pokar',
        description: 'Field notes from Yash Pokar on AG-UI, A2UI, LLM evals, fine-tuning versus retrieval, Kubernetes cost, crawling and data pipelines.',
        ld: () => graph(person, crumbs([['Home', '/'], ['Blog', '/blog']]), {
            '@type': 'Blog', '@id': `${SITE}/blog#blog`, url: `${SITE}/blog`, name: `${NAME} Blog`, author: { '@id': `${SITE}/#person` },
            blogPost: posts.map(p => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE}/blog/${p.slug}`, datePublished: p.date })),
        }),
    },
    '/contact': {
        title: 'Contact Yash Pokar | Email and Social Links',
        description: 'Get in touch with Yash Pokar at hello@yashpokar.com about hard engineering problems, AI features, or talking shop on agents and infrastructure.',
        ld: () => graph(person, crumbs([['Home', '/'], ['Contact', '/contact']]), { '@type': 'ContactPage', url: `${SITE}/contact`, mainEntity: { '@id': `${SITE}/#person` } }),
    },
}

export const routes = ['/', '/work', '/about', '/skills', '/blog', '/contact', ...posts.map(p => `/blog/${p.slug}`)]

/** Everything a page needs in <head>. Used at build time (prerender) and on the client for route changes. */
export function getSeo(pathname) {
    const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
    const canonical = SITE + (path === '/' ? '/' : path)

    if (PAGES[path]) {
        const p = PAGES[path]
        return { path, canonical, title: p.title, description: p.description, type: 'website', image: OG_IMAGE, noindex: false, ld: p.ld() }
    }
    const m = /^\/blog\/([^/]+)$/.exec(path)
    const post = m && posts.find(x => x.slug === m[1])
    if (post) {
        const url = `${SITE}/blog/${post.slug}`
        return {
            path, canonical, title: post.title.length + NAME.length + 3 <= 65 ? `${post.title} | ${NAME}` : post.title, description: clip(post.summary), type: 'article', image: OG_IMAGE,
            published: post.date, tags: post.tags, markdown: `${url}.md`, noindex: false,
            ld: graph(person, crumbs([['Home', '/'], ['Blog', '/blog'], [post.title, `/blog/${post.slug}`]]), {
                '@type': 'BlogPosting', '@id': `${url}#post`, headline: post.title, description: post.summary,
                datePublished: post.date, dateModified: post.date, inLanguage: 'en', url, mainEntityOfPage: url,
                image: OG_IMAGE, keywords: post.tags.join(', '), wordCount: post.content.split(/\s+/).length,
                articleSection: post.tags[0], author: { '@id': `${SITE}/#person` }, publisher: { '@id': `${SITE}/#person` },
            }),
        }
    }
    return { path, canonical: SITE + '/', title: 'Page not found | Yash Pokar', description: 'This page does not exist.', type: 'website', image: OG_IMAGE, noindex: true, ld: null }
}

/** Replace/insert the SEO tags in an HTML string's <head>. Idempotent so it works on the template. */
export function headHtml(seo) {
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
    const tags = [
        `<title>${esc(seo.title)}</title>`,
        `<meta name="description" content="${esc(seo.description)}" />`,
        `<link rel="canonical" href="${seo.canonical}" />`,
        `<meta name="robots" content="${seo.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}" />`,
        `<meta property="og:site_name" content="${NAME}" />`,
        `<meta property="og:locale" content="en_IN" />`,
        `<meta property="og:type" content="${seo.type}" />`,
        `<meta property="og:title" content="${esc(seo.title)}" />`,
        `<meta property="og:description" content="${esc(seo.description)}" />`,
        `<meta property="og:url" content="${seo.canonical}" />`,
        `<meta property="og:image" content="${seo.image}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta property="og:image:alt" content="${NAME}, senior full stack developer" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:site" content="@yashpokar" />`,
        `<meta name="twitter:creator" content="@yashpokar" />`,
        `<meta name="twitter:title" content="${esc(seo.title)}" />`,
        `<meta name="twitter:description" content="${esc(seo.description)}" />`,
        `<meta name="twitter:image" content="${seo.image}" />`,
    ]
    if (seo.type === 'article') {
        tags.push(`<meta property="article:published_time" content="${seo.published}" />`, `<meta property="article:author" content="${SITE}" />`)
        ;(seo.tags || []).forEach(t => tags.push(`<meta property="article:tag" content="${esc(t)}" />`))
        tags.push(`<link rel="alternate" type="text/markdown" href="${seo.markdown}" />`)
    }
    if (seo.ld) tags.push(`<script type="application/ld+json" id="ld-json">${JSON.stringify(seo.ld).replace(/</g, '\\u003c')}</script>`)
    return tags.join('\n    ')
}
