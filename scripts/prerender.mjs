/* Turns the built SPA shell into real HTML for every route: dist/<route>/index.html, plus dist/404.html.
   Runs after `vite build` and `vite build --ssr`. */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = resolve('dist')
const serverDir = resolve('dist-server')
const { render, getSeo, headHtml, routes } = await import(pathToFileURL(join(serverDir, 'entry-server.js')).href)
const template = readFileSync(join(dist, 'index.html'), 'utf8')
if (!template.includes('<!--seo-->') || !template.includes('<div id="root"></div>')) throw new Error('index.html template is missing its markers')

const page = (url, seo) => template
  .replace('<!--seo-->', headHtml(seo))
  .replace('<div id="root"></div>', () => `<div id="root">${render(url)}</div>`)

let count = 0
for (const route of routes) {
  const html = page(route, getSeo(route))
  if (route === '/') writeFileSync(join(dist, 'index.html'), html)
  else { mkdirSync(join(dist, route), { recursive: true }); writeFileSync(join(dist, route, 'index.html'), html) }
  count++
}
// Unknown URLs get the not-found page; the host serves 404.html with a 404 status.
writeFileSync(join(dist, '404.html'), page('/__not-found__', getSeo('/__not-found__')))

rmSync(serverDir, { recursive: true, force: true })
console.log(`prerendered ${count} routes + 404.html`)
