import { useEffect, useState } from 'react';

// apollonpapas.com is one origin serving several independent builds. nginx
// mounts /fromchaostorevenue, /webinar-powerup and the legal stack from the 6WS
// build, and falls back to THIS app for anything else. The click handler below
// must only ever intercept paths this app actually owns; anything not in ROUTES
// is left to the browser and reaches nginx.
//
// Every route here is now prerendered to its own directory index
// (scripts/prerender.mjs), so nginx must keep the `$uri/` term in
// `try_files $uri $uri/ /index.html`. Without it /about and /reviews fall
// through to the home page's HTML and the whole site serves one title and one
// canonical. See docs/deploy-nginx.md.
export const ROUTES = ['/', '/about', '/reviews'] as const;
export type Route = (typeof ROUTES)[number];

function owns(pathname: string): pathname is Route {
  return (ROUTES as readonly string[]).includes(pathname);
}

// A trailing slash is the same page: nginx serves the shell for both forms.
function normalize(pathname: string): Route {
  const p = pathname.replace(/\/+$/, '') || '/';
  return owns(p) ? p : '/';
}

// Where a section anchor should point from the page currently being rendered.
// The sections all live on the home page, so from anywhere else they need the
// path in front of the hash or the browser looks for the id on the wrong page.
export function sectionHref(route: Route, id: string): string {
  return route === '/' ? `#${id}` : `/#${id}`;
}

// `ssrRoute` is what the prerender passes in: there is no window in Node, and
// the route is already known from the file being written. On the client the
// prop is absent and the pathname is read as before, which is the same value
// the server rendered, so hydration matches.
export function useRoute(ssrRoute?: Route): Route {
  const [route, setRoute] = useState<Route>(
    () => ssrRoute ?? (typeof window === 'undefined' ? '/' : normalize(window.location.pathname))
  );

  useEffect(() => {
    const onPop = () => setRoute(normalize(window.location.pathname));

    const onClick = (e: MouseEvent) => {
      // A modified click is the visitor deliberately asking the browser for a
      // new tab, a download or a menu. Never swallow those.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.('a') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      // Bare hash links belong to the smooth-anchor handler in useScrollMotion.
      // They resolve to the current pathname, which is a route, so without this
      // they would be caught here and turned into a pointless re-navigation.
      if (a.getAttribute('href')?.startsWith('#')) return;

      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const next = url.pathname.replace(/\/+$/, '') || '/';
      if (!owns(next)) return;

      e.preventDefault();
      window.history.pushState({}, '', next + url.hash);
      setRoute(next);
    };

    window.addEventListener('popstate', onPop);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return route;
}

let first = true;

// Scroll position after a route change. Runs only on navigation, never on the
// first render, so a reload keeps whatever position the browser restored.
export function useRouteScroll(route: Route): void {
  useEffect(() => {
    if (first) {
      first = false;
      return;
    }
    const id = window.location.hash.slice(1);
    const dest = id ? document.getElementById(id) : null;
    // Same offset the smooth-anchor handler uses, so a cross-page section link
    // lands where an in-page one would.
    window.scrollTo(0, dest ? dest.getBoundingClientRect().top + window.scrollY - 72 : 0);
  }, [route]);
}
