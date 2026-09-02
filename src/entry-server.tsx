// Server entry for the build-time prerender (scripts/prerender.mjs).
//
// HANDOFF Part 1: every route must ship its full content as server-delivered
// HTML. AI crawlers (GPTBot, ClaudeBot, PerplexityBot) run no JS, so a
// client-rendered shell is an empty page to them. This renders each route to a
// string at build time; the client bundle then hydrates on top of it, and every
// animation stays exactly as it was.
//
// Nothing here runs in the browser. Styles are imported by src/main.tsx, not by
// this module, so the SSR bundle stays free of CSS.
import { renderToString } from 'react-dom/server';
import App from './App';
import './i18n';
import { ROUTES, type Route } from './router';

export { ROUTES, type Route };
export { headHtml } from './seo';

export function render(route: Route): string {
  return renderToString(<App route={route} />);
}
