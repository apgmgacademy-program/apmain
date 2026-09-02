// Build-time prerender (HANDOFF Part 1).
//
// Runs after `vite build` (client) and `vite build --ssr` (server). For every
// route it renders the app to a string and writes a complete HTML file, so
// `curl https://apollonpapas.com/` returns the whole page and a crawler that
// executes no JS still sees the copy, the stats and the schema.
//
//   dist/index.html          ->  /
//   dist/about/index.html    ->  /about
//   dist/reviews/index.html  ->  /reviews
//
// The client bundle hydrates on top of what is written here, so GSAP, Lenis and
// the sticky program stack behave exactly as they did before.
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DIST = 'dist';
const SSR = 'dist-ssr';

const { ROUTES, render, headHtml } = await import(`../${SSR}/entry-server.js`);

// Vite's client build leaves the built <script>/<link> tags in dist/index.html.
// That file is the template every route is written from, so the hashed asset
// names never have to be guessed here.
const template = readFileSync(join(DIST, 'index.html'), 'utf8');

if (!template.includes('<!--app-head-->')) throw new Error('dist/index.html is missing the <!--app-head--> marker');
if (!template.includes('<div id="root"></div>')) throw new Error('dist/index.html is missing an empty #root');

const outFile = (route) => (route === '/' ? join(DIST, 'index.html') : join(DIST, route.slice(1), 'index.html'));

for (const route of ROUTES) {
  const html = template
    .replace('<!--app-head-->', headHtml(route))
    .replace('<div id="root"></div>', `<div id="root">${render(route)}</div>`);

  const file = outFile(route);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);

  // A crude but honest size signal: an empty shell is ~2KB, a real page is not.
  console.log(`  ${route.padEnd(10)} -> ${file.padEnd(26)} ${(Buffer.byteLength(html) / 1024).toFixed(1)}KB`);
}

// Part 4 asks for lastmod to be refreshed at deploy time. Only the three routes
// this build actually owns are stamped: /fromchaostorevenue and /webinar-powerup
// are served from the separate 6WS build, so this one has no idea when they last
// changed and must not claim otherwise.
const sitemapFile = join(DIST, 'sitemap.xml');
const today = new Date().toISOString().slice(0, 10);
let sitemap = readFileSync(sitemapFile, 'utf8');
for (const route of ROUTES) {
  const loc = route === '/' ? 'https://apollonpapas.com/' : `https://apollonpapas.com${route}`;
  const re = new RegExp(`(<loc>${loc.replace(/[/.]/g, '\\$&')}</loc><lastmod>)[^<]*`);
  // Tested rather than compared before/after: on a day when lastmod already
  // equals today the replace is a no-op, which is success, not a missing entry.
  if (!re.test(sitemap)) throw new Error(`sitemap.xml has no <loc> entry for ${loc}`);
  sitemap = sitemap.replace(re, `$1${today}`);
}
writeFileSync(sitemapFile, sitemap);
console.log(`  sitemap.xml lastmod stamped ${today} for ${ROUTES.length} routes`);

// The SSR bundle is a build artefact, not something to deploy.
rmSync(SSR, { recursive: true, force: true });

// Acceptance test from Part 1, run against the file rather than the live site so
// a regression fails the build instead of the launch.
const home = readFileSync(join(DIST, 'index.html'), 'utf8');
for (const needle of ['17,539', 'The Invisible Hand System', 'application/ld+json']) {
  if (!home.includes(needle)) throw new Error(`dist/index.html does not contain "${needle}"`);
}
console.log(`  prerendered ${ROUTES.length} routes`);
