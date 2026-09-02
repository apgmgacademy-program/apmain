# Open items after the rebuild pass

Carried forward from `dev-handoff-package/HANDOFF.md` (Open items 3-6) plus what
turned up while building it. Nothing here blocks launch.

## Waiting on Apollo

**1. Photo captions (venue + year).** HANDOFF 5.3 and 5.10. Apollo has the exact
strings and asked to be reminded when the dev is ready, rather than chased. The
Journey gallery and the /about prints currently use their existing alt text and
carry no visible caption, which is the specified fallback. When the strings
arrive they go into `journey.galleryAlts` / `story.shotAlts` neighbours in
`src/i18n/en.json` and get rendered as `<figcaption>`.

**2. Final slugs for the Mentorship and VAULT pages.** HANDOFF 5.4, 5.5, Part 4.
Those pages do not exist yet. Both are shipped as unlinked `Waitlist` cards, with
no `href` at all rather than a guessed one. When Apollo confirms the URLs, wire
them into all four places:

- `PATH_LINKS` in `src/config.ts` (currently `vault: undefined`, `mentorship: undefined`)
- `PROGRAM_MEDIA` in `src/config.ts` (currently `mentorship: {}`, `vault: {}`)
- `public/llms.txt` (two "standalone page and URL coming soon" lines)
- `public/sitemap.xml` (add two `<url>` entries)

Do not invent `/mentorship` or `/vault` before then.

**3. ~~An EY logo asset.~~ DONE (2026-09-01).** Kyriakos supplied `ey.svg`
(renamed from `ey_logo.svg` to match the folder convention) and it is now in
`TRUSTED_LOGOS`. All seven brands HANDOFF 5.7 asks for are in the strip:
Amazon, Samsung, SHEIN, COSRX, Michelin, ZOOM, EY.

It carries `cls: 'lg'` because it is a near-square mark rather than a wordmark -
at the shared 22px it read far smaller than the names either side of it. The
source SVG is two-tone (white letterforms, `#FFE600` beam); `.trusted-logo`'s
`brightness(0) invert(1)` flattens both to white, same as every other logo.

## Waiting on the deploy

**Deployed 2026-09-02, commit e1b2b1e.** All three brand routes now serve
prerendered HTML from the VPS. The nginx vhost already had the `$uri/` term so
no config change was needed. One cosmetic issue found and left open: `/about`
and `/reviews` 301 to their trailing-slash form before serving, while the
canonical tags and sitemap use the no-slash form. Fix and rationale in
`docs/deploy-nginx.md` under "Trailing slashes"; it needs a one-line vhost edit.

**4. Create the `cta_click` GTM tag.** HANDOFF Part 6 and Open item 6. The
dataLayer push is live in the code (`src/lib/analytics.ts`, fired by the hero's
"Save my free seat at PowerUp!" button). The tag that listens for it does not
exist in container `GTM-5S2Q3XZM` yet.

**5. Audit the container for stray all-pages conversion triggers.** Part 6: if
any tag in the container fires a conversion event on an all-pages trigger, it
must be scoped so it never fires on `/`, `/about` or `/reviews`. This could not
be checked from the codebase - it needs someone inside the GTM UI.

**6. Submit the new sitemap in GSC** (`sc-domain:apollonpapas.com`). Now
unblocked - the deploy is live and `https://apollonpapas.com/sitemap.xml`
serves as `text/xml` with all five URLs.

## Audit findings the handoff did not carry

Crosschecked the rebuild against the source audit ("Apollon Brand Page Audit",
27 findings, 6 critical). The handoff covers it well, and where the two conflict
Apollo's decisions in the handoff win. These are the items that appear in the
audit but in neither the handoff nor this pass, listed so nothing is lost:

**7. F15 / F25 - the nav hid the free webinar. FIXED.** Both findings ask for the
webinar to be the default action in the nav as well as the hero. The nav's single
pill is now "Free training" pointing at `/webinar-powerup`, and Contact has moved
down into the inline link row, since it is the weakest thing to offer a cold
visitor (F4). This also matches the nav the design system describes: links in the
middle, one primary pill on the right.

Note this adds a second `cta_click` push (`cta: "powerup_nav"`), where HANDOFF
Part 6 says the hero is "the only custom push dev adds". It is the same
engagement event under a different label, not a conversion, so it stays inside
Part 6's actual scope rule - but the `cta` parameter now has two values and
whoever builds the GTM tag should know that.

**8. F12 - "50+ publications" is claimed and nothing is linked. HALF DONE.** The
rendering is built and tested: `PUBLICATIONS` in `src/config.ts` drives a link
row under the 2023-2025 Journey card, matched on the year string so reordering
the timeline cannot move it onto the wrong card. It is empty, so it renders
nothing and the card is visually unchanged.

**Apollo needs to supply three to five URLs.** There is not a single publication
link anywhere in this repo, and a citation is not something to guess at. Filling
that array is the entire remaining change - no component edit needed. The
`/publications` page the audit's trust table and P2 tier ask for is a separate,
later job.

**9. F5 - the "Trusted by" label itself.** Apollo confirmed the relationships are
real, which settles the truth question the audit raised, and the six brands named
in the story now lead the strip (which is what the audit asked for). What is still
unaddressed is the audit's narrower point: the first row and the story name two
disjoint sets of companies, and one "Trusted by" label over both invites the
reader to treat them identically. Splitting the label ("Trusted by" for the client
brands, "Partner ecosystem" or "Certified across" for the rest) would resolve it.

**10. F6 - InVision shut down at the end of 2024.** Apollo said all logos stay, so
they have. Worth re-raising as a specific fact rather than a general objection:
the audit's concern is that Squarespace / InVision / Wistia / Feathr / MileIQ /
SwagUp / Mobilize is the logo set that ships with several popular site templates,
and a dead product in the row is the detail a skeptical reader notices.

**11. F8 (second half) - a cross-domain number conflict.** gya-media.com says
"9,000+ projects" while this site says "9,000+ training hours". Same figure, two
meanings, two domains. The audit flags this as an AI-reconciliation risk. Nothing
to change here; it is a gya-media.com edit.

**12. F9 - the About card could close its own loop.** The card opens the "just do
your magic" loop and only /about closes it. The audit suggests ending the card
with the payoff line, "The magic was never magic. It was a system." That line is
now a pull quote on /about but does not appear on the homepage.

**13. F22 - video on /about, if footage exists.** The audit notes the desk photo
looks like a still from a recorded session and that video multiplies an origin
story. There is a `Videos 6WS/` folder in this repo. Worth asking Apollo whether
any of it is him telling this story.

**14. Trust table - the ministry/government line.** The Journey card says
"government and other projects" with no detail. The audit's note: one anchored
line ("IT consulting for the Ministry of Environment and Energy") outranks a
vague plural. Needs a fact from Apollo.

Everything in the audit's P2 tier (annual data report, /publications, directory
and podcast campaign, entity alignment sweep, monthly AI visibility check) is
off-site authority work, not dev work, and is correctly out of scope for this pass.

## Notes on things that differ from the handoff

**The reviews CSV was already here.** HANDOFF 5.6 and the package README say it
was sent separately. It was in the repo the whole time as
`Videos 6WS/gyamedia_Export_reviews_for_apollo_typeform-selection.csv` - 119
rows, matching schema, featured review #1 identical to the handoff. It has been
copied to `data/gya_training_reviews_119.csv` under the name the handoff uses,
because the original folder is gitignored and the build needs it tracked.
`src/data/reviews.json` is generated from it by `scripts/build-reviews.mjs` (run
automatically by `npm run dev` and `npm run build`). Never hand-edit the JSON.

**Region grouping on /reviews is a judgement call.** HANDOFF 5.6 asks for
Europe / Middle East / Africa / Americas but the CSV only carries a country
column, so the mapping is explicit in `COUNTRY_REGION` (`src/config.ts`). Turkey
is filed under Europe, and Egypt and Morocco under Africa. Move them if Apollo
prefers a MENA reading. A country in a future export that is missing from the map
fails the build rather than vanishing from the page.

**Greek is still paused and the new sections are English-only.** This follows the
existing, documented precedent: `el.json` already has no `story` block for the
same reason (see the comment at the top of `src/components/Story.tsx`).
`npm run verify:edit-tags` therefore reports the new `path.*`, `faq.*`,
`testimonials.*` and `reviews.*` keys as missing from `el.json`, alongside the
`story.*` ones it already reported. i18next falls back to English per key, so the
site is correct. Translate all of it before flipping `SITE.showLangToggle`.

One trap in there: `el.json` still holds the **pre-rebuild** hero, where `headTail` is the
entire 33-word subheadline. That is the exact defect HANDOFF Part 1 and 5.1 fixed on the
English side. It renders nowhere today because Greek is off, but flipping the toggle would
put it straight back into the `<h1>`. Retranslate `hero.headLead` / `hero.headTail` /
`hero.sub` against HANDOFF 5.1 before Greek ever goes live.

**The "glued string" half of audit F2 was not accurate, and this was verified.**
F2 and Part 1 both say the per-word animation spans render with no spaces, so
extracted text reads as "15+yearsonthefrontlineofEnterpriseGrowth...". Measured on
the live deployed build before this rebuild: the `<h1>` held 34 spans, 189
characters, **32 spaces** and no run-together joins. The spaces were always there.

The other half of F2 was exactly right and was the real defect: that entire
189-character, 33-word paragraph was inside the `<h1>`. The H1 is now the approved
headline only. Splitting it into a lead and a dimmed tail did briefly reintroduce
a genuine glue (React renders adjacent spans with no whitespace between them);
that was caught in testing, and both this H1 and the /about title now carry an
explicit space so `textContent` reads as a sentence.
