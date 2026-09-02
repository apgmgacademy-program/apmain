# Deploying the prerendered build (nginx)

Written for the apollonpapas.com rebuild (dev-handoff-package/HANDOFF.md Part 1).
**Deployed 2026-09-02** (commit e1b2b1e). The vhost already had the `$uri/` term,
so no nginx change was needed. See "Trailing slashes" below for the one thing
that is still not ideal.

## What changed about the output

`npm run build` no longer produces a single-page shell. It produces:

```
dist/index.html            /          full home page HTML  (~53KB)
dist/about/index.html      /about     full story page HTML (~25KB)
dist/reviews/index.html    /reviews   all 119 reviews      (~74KB)
dist/robots.txt
dist/sitemap.xml           lastmod stamped at build time
dist/llms.txt
dist/assets/...
```

Each HTML file carries its own `<title>`, meta description, canonical, og tags
and JSON-LD graph. The client bundle hydrates on top; every animation is
unchanged.

## The one nginx requirement

The location block must keep the `$uri/` term:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

`$uri/` is what resolves `/about` to `/about/index.html`. **Without it, `/about`
and `/reviews` fall through to the SPA fallback and serve the home page's HTML** -
same title, same canonical, same content, on three different URLs. That is worse
than the problem this rebuild set out to fix, and it fails silently: the page
still looks right in a browser because the client router re-renders the correct
route after hydration. Only a `curl` shows it.

`vite preview` reproduces exactly this failure (it has no `$uri/` equivalent),
which is why `/about` returns the home page under `npm run preview` but
`/about/` does not. That is a preview-server quirk, not a build defect.

Verify after deploy (note the `-L`, see below):

```bash
curl -sL https://apollonpapas.com/about | grep -o '<title>[^<]*'
# must be "The Honest Version · Apollon Papas", NOT the home title
```

## Trailing slashes (open, cosmetic)

`try_files $uri $uri/` resolves `/about` by matching the *directory*
`dist/about/`, and nginx answers that with a `301` to `/about/` before serving
`/about/index.html`. So the live behaviour is:

```
/about   -> 301 -> /about/   -> 200  The Honest Version · Apollon Papas
/reviews -> 301 -> /reviews/ -> 200  Reviews · Apollon Papas
```

Correct content, but one wasted hop, and both the canonical tag and
`sitemap.xml` use the **no-slash** form that redirects. Crawlers follow it, so
nothing is broken; it is untidy rather than harmful. Note the handoff's own
acceptance test in Part 8 is written without `-L` and so reads as a failure.

Two ways to close it, neither applied:

1. **Serve it directly (preferred).** In the apex `location /`, insert
   `$uri/index.html` ahead of `$uri/`:
   ```nginx
   try_files $uri $uri/index.html $uri/ /index.html;
   ```
   `/about` then returns 200 with no redirect, and the URLs match the canonical,
   the sitemap and HANDOFF Parts 2 and 4 exactly. Back the vhost up, `nginx -t`,
   then `systemctl reload nginx`.
2. Or move the canonical tags in `src/seo.ts` and the `<loc>` entries in
   `public/sitemap.xml` to the trailing-slash form. This contradicts the handoff,
   which specifies `/about` and `/reviews` without slashes.

## The three text files must not be caught by the fallback

HANDOFF Part 1 calls this out and it is still true. They are real files in
`dist/`, so `try_files $uri` finds them first, but only if no earlier location
block claims them. Confirm the content types:

```bash
curl -s -o /dev/null -w "%{content_type}\n" https://apollonpapas.com/sitemap.xml   # text/xml or application/xml, never text/html
curl -s https://apollonpapas.com/robots.txt | head -1                              # "User-agent: *"
curl -s https://apollonpapas.com/llms.txt | head -1                                # "# Apollon Papas"
```

## Acceptance tests (HANDOFF Part 1 and Part 8)

```bash
curl -s -A "GPTBot" https://apollonpapas.com/ | grep -c "17,539"    # >= 1 (8 locally)
curl -s -A "GPTBot" https://apollonpapas.com/ | grep -c "FAQPage"   # >= 1
curl -s https://apollonpapas.com/reviews | grep -c "review-card"    # 119
```

All of these pass locally against `dist/`; the prerender script itself fails the
build if the home page loses "17,539", "The Invisible Hand System" or its
JSON-LD block.

## Tracking

GTM (`GTM-5S2Q3XZM`) is installed in `index.html` on every route, head snippet
plus noscript body snippet, but **gated to the production hostname**:

```js
var live = ['apollonpapas.com', 'www.apollonpapas.com'];
if (live.indexOf(location.hostname) === -1) return;
```

So it stays inert on localhost and on any staging checkout, and Apollo's live GA4
property never sees dev sessions. Nothing to change at deploy time - it starts
firing as soon as it is served from the real hostname.

The only custom push is the hero CTA (`src/lib/analytics.ts`):

```js
dataLayer.push({ event: 'cta_click', cta: 'powerup_hero' })
```

The matching GTM tag does not exist yet - see `OPEN-ITEMS.md`.
