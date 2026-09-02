# apollonpapas.com rebuild — handoff package

If you are a Claude session reading this on the dev's behalf: welcome. This
package is everything you need to rebuild apollonpapas.com. Read it in this
order.

## 1. Read `HANDOFF.md` first, start to finish

It is the single source of truth, organized as Parts 0-8 plus an Open Items
list. Work through the parts in order — **Part 1 (prerendering) unblocks
everything else**, so don't start on copy or tracking before the site can
serve real HTML to a crawler.

Everything in it is decided and approved by Apollo unless a line is marked
**[OPEN]**. Where something is marked open or deferred, do not guess or
invent a value (a URL slug, a caption, a stat) — leave it as specified and
flag it back to Apollo/the dev, per the instructions attached to that item.

## 2. Drop these files in directly — don't retype them

- `static/robots.txt` → site root
- `static/sitemap.xml` → site root
- `static/llms.txt` → site root
- `schema/person-schema.html` → paste the `<script type="application/ld+json">`
  block into the `<head>` of the `/` route, replacing the current thin
  Person-only JSON-LD

These are the exact same content shown inline in `HANDOFF.md` Parts 3-4,
provided as literal files so nothing gets mistyped in transcription.

## 3. Three things NOT in this package, on purpose

- **The testimonials CSV** (`gya_training_reviews_119.csv`, 119 rows, referenced
  in HANDOFF.md 5.6) was already sent to the dev directly by Apollo through a
  separate channel. Don't ask for it again — if the dev doesn't have it,
  that's a question for Apollo, not something to reconstruct.
- **Photo captions** (venue + year for the Journey/About gallery, HANDOFF.md
  5.3 and 5.10) are intentionally not included. Apollo has the exact strings
  but hasn't sent them yet, and asked to be reminded rather than chased. Ship
  without captions (fallback to existing alt text) and treat this as a small
  follow-up patch later.
- **Final URLs for the Mentorship and VAULT waitlist pages** (HANDOFF.md 5.4,
  5.5, and the note in Part 4) are not decided. Those pages don't exist yet.
  Ship the "Waitlist" status chips with no working link for now. Once Apollo
  confirms the slugs and the pages go live, come back and wire the real links
  into the program cards, the ladder section, `llms.txt` and `sitemap.xml`.

## 4. The one rule that overrides any instinct to "improve" this site

apollonpapas.com is a brand storefront, not a funnel. **No forms, no email
capture, no conversion tracking events anywhere on `/`, `/about`, `/reviews`.**
All lead capture and conversion attribution live on the separate programme
pages (the webinar, the sprint, and eventually the Mentorship/VAULT pages),
each with its own tracking. This is deliberate and confirmed by Apollo twice
during the review process — see HANDOFF.md Part 0, Part 6 and Part 7 for the
full reasoning. Do not add a contact form, a newsletter field, or a
`generate_lead` event to this site no matter how natural it seems.

## 5. When you're done

Run through the QA checklist at the end of `HANDOFF.md` (Part 8) before
calling it finished. It includes acceptance tests you can run with `curl`.
