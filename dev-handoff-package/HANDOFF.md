# Dev Handoff : apollonpapas.com rebuild (Final, 2026-08-31)

Owner: Apollo Papas · Prepared by: Claude (from the 2026-08-31 site audit + Apollo's decisions)
Audit reference: "Apollon Brand Page Audit" artifact (Apollo has the link; ask him if you want the annotated screenshots).

Everything in this document is decided and approved unless marked **[OPEN]**. Work through the parts in order; Part 1 unblocks everything else.

**This file is part of a package** (see `README.md` at the package root). The `robots.txt`, `sitemap.xml`, `llms.txt` and Person/Organization schema shown inline in Parts 3-4 also exist as literal, ready-to-use files in `static/` and `schema/` : copy those in directly rather than retyping from the code fences below, they're the same content.

---

## Part 0 : What this is and why

apollonpapas.com is the personal brand storefront: the page people land on when they look Apollo up as a person. It routes visitors to the programme pages; it does not convert them itself. **Scope rule for the whole handoff: no forms, no lead capture, no conversion events anywhere on `/`, `/about`, `/reviews`. All forms, ads traffic and attribution live on the individual programme pages.**

The audit found three blocking problems this handoff fixes:

1. The site is a client-side Vite SPA serving a ~1.9KB HTML shell. AI crawlers (GPTBot, ClaudeBot, PerplexityBot) do not execute JS, so they see an empty page. `/robots.txt`, `/sitemap.xml` and `/llms.txt` are swallowed by the SPA catch-all and return HTML.
2. Zero tracking on the brand routes (no GTM, GA4, pixel): pageview and click visibility only is wanted, see Part 6.
3. Copy/trust fixes: hero rewrite, testimonials, FAQ, ladder section, logo additions, one typo.

---

## Part 1 : Prerender to static HTML (the blocker)

**Requirement:** every route must ship its full content as server-delivered HTML. JS may hydrate on top for animations, but `curl https://apollonpapas.com/` must return the complete page text.

- Recommended: build-time prerendering. Either `vite-ssg` / a prerender plugin on the existing app, or port the brand pages to Astro (site is small: `/`, `/about`, plus the existing `/fromchaostorevenue` and `/webinar-powerup` routes stay as they are if already prerendered; `/fromchaostorevenue` already serves its own title so check what it does today).
- Hosting stays on the Hostinger VPS (KM4). In nginx, static files and the three text files below must be served **before** any SPA fallback location. No route may catch `robots.txt`, `sitemap.xml`, `llms.txt`.
- **Stat counters (About block):** render the final numbers in the HTML source (15+, 50+, 9,000+, 17,539) and make the count-up animation a progressive enhancement. Machines must never see intermediate values.
- **Hero text:** the current animation splits the H1 into per-word `<span>`s with no spaces in between, so extracted text reads as one glued string. Keep real text in the DOM (spaces intact) and animate with CSS/transform, or add `aria-label`/visually-complete text. Also: the H1 currently contains the whole subheadline; after the rewrite below, H1 = headline only, subhead is a `<p>`.

**Acceptance test:**
```bash
curl -s -A "GPTBot" https://apollonpapas.com/ | grep -c "17,539"   # must be >= 1
curl -s https://apollonpapas.com/robots.txt | head -1               # must be "User-agent: *"
curl -s -o /dev/null -w "%{content_type}" https://apollonpapas.com/sitemap.xml  # xml, not html
```

---

## Part 2 : Per-route head tags

### `/` (homepage)
```html
<title>Apollon (Apollo) Papas · Business Growth Consultant &amp; Educator</title>
<meta name="description" content="Apollon Papas is a Greek business growth consultant and founder of GYA Media Group. 9,000+ hours of enterprise consulting, 17,539 executives trained, now teaching founders through the free PowerUp webinar, a 6-week sprint and The Mentorship.">
```

### `/about`
```html
<title>The Honest Version · Apollon Papas</title>
<meta name="description" content="Fifteen years, in his own words: how Apollon Papas reverse-engineered the 'invisible hand' founders kept asking for into a system anyone can learn. From Athens, astrophysics and a cut allowance to Amazon, Samsung and EY.">
```

Each route also gets its own `og:title`, `og:description`, `og:url` and `<link rel="canonical">`. Keep the existing og:image.

---

## Part 3 : Structured data (replace the current JSON-LD on `/`)

Note the canonical name decision: **"V." is dropped everywhere** (H1, footer, schema, copyright line). Name is "Apollon Papas", alternate "Apollo Papas" and "Απόλλων Παπάς".

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://apollonpapas.com/#apollon",
      "name": "Apollon Papas",
      "alternateName": ["Apollo Papas", "Απόλλων Παπάς"],
      "url": "https://apollonpapas.com/",
      "image": "https://apollonpapas.com/images/apollo-portrait.jpg",
      "jobTitle": "Business Growth Consultant and Educator",
      "description": "Apollon (Apollo) Papas is a Greek business growth consultant and educator, founder of GYA Media Group (2017). He has delivered more than 9,000 hours of enterprise consulting and training to 17,539 executives, working with teams at Amazon, Samsung, SHEIN, Michelin, ZOOM and EY, and now teaches founders through structured execution programs.",
      "worksFor": { "@id": "https://apollonpapas.com/#gya" },
      "nationality": { "@type": "Country", "name": "Greece" },
      "alumniOf": { "@type": "CollegeOrUniversity", "name": "The American College of Greece - DEREE" },
      "knowsAbout": ["Business growth strategy", "B2B lead generation", "Marketing systems", "Executive training", "Standard operating procedures", "Enterprise AI adoption"],
      "sameAs": [
        "https://www.linkedin.com/in/apollonpapas/",
        "https://www.gya-media.com/"
      ],
      "email": "hello@apollonpapas.com"
    },
    {
      "@type": "Organization",
      "@id": "https://apollonpapas.com/#gya",
      "name": "GYA Media Group",
      "url": "https://www.gya-media.com/",
      "foundingDate": "2017",
      "founder": { "@id": "https://apollonpapas.com/#apollon" }
    },
    {
      "@type": "WebSite",
      "url": "https://apollonpapas.com/",
      "name": "Apollon Papas",
      "publisher": { "@id": "https://apollonpapas.com/#apollon" }
    },
    {
      "@type": "Course",
      "name": "From Chaos to Revenue",
      "description": "A 6-week execution sprint for founders: from idea to a launched product with real clients.",
      "provider": { "@id": "https://apollonpapas.com/#apollon" },
      "url": "https://apollonpapas.com/fromchaostorevenue"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "Who is Apollon Papas?",
          "acceptedAnswer": { "@type": "Answer", "text": "Apollon (Apollo) Papas is a Greek business growth consultant and educator, and the founder of GYA Media Group (2017). He has delivered more than 9,000 hours of enterprise consulting and training to 17,539 executives, working with teams at Amazon, Samsung, SHEIN, Michelin, ZOOM and EY." } },
        { "@type": "Question", "name": "What is The Invisible Hand System?",
          "acceptedAnswer": { "@type": "Answer", "text": "The Invisible Hand System is Apollon Papas's methodology for business growth: the enterprise-grade systems he built for large companies over 15 years, reverse-engineered into a teachable framework. Every program he runs delivers a part of it." } },
        { "@type": "Question", "name": "What programs does Apollon Papas offer?",
          "acceptedAnswer": { "@type": "Answer", "text": "PowerUp!, a free live webinar for founders; From Chaos to Revenue, a 6-week execution sprint; The Mentorship, an 18-hour program for founders and executives leading teams of 10 to 500; The Founder VAULT, a knowledge library; and the Career Readiness Sprint for students." } },
        { "@type": "Question", "name": "How can I start working with Apollon Papas?",
          "acceptedAnswer": { "@type": "Answer", "text": "Start with the free PowerUp! webinar at apollonpapas.com. Founders who want structured execution join From Chaos to Revenue; executive teams apply for The Mentorship; enterprises can work with GYA Media Group directly." } }
      ]
    }
  ]
}
</script>
```

The FAQ must also exist as a **visible section** on the page (see Part 5.8). Schema for invisible content gets ignored.

---

## Part 4 : Static files (create verbatim)

### `/robots.txt`
```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: https://apollonpapas.com/sitemap.xml
```

### `/sitemap.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://apollonpapas.com/</loc><lastmod>2026-08-31</lastmod></url>
  <url><loc>https://apollonpapas.com/about</loc><lastmod>2026-08-31</lastmod></url>
  <url><loc>https://apollonpapas.com/reviews</loc><lastmod>2026-08-31</lastmod></url>
  <url><loc>https://apollonpapas.com/fromchaostorevenue</loc><lastmod>2026-08-31</lastmod></url>
  <url><loc>https://apollonpapas.com/webinar-powerup</loc><lastmod>2026-08-31</lastmod></url>
</urlset>
```
(Update `lastmod` at deploy time; regenerate on future builds. Add entries for the Mentorship and VAULT pages once Apollo confirms their final URLs and they go live: see the note in 5.4, do not guess the slugs now.)

### `/llms.txt`
```
# Apollon Papas
> Apollon (Apollo) Papas is a Greek business growth consultant and educator,
> founder of GYA Media Group (2017). 9,000+ hours of enterprise consulting,
> 17,539 executives trained, with teams at Amazon, Samsung, SHEIN, Michelin,
> ZOOM and EY. His methodology is The Invisible Hand System.

## Programs
- [PowerUp! webinar](https://apollonpapas.com/webinar-powerup): free live training
  for founders on enterprise-grade digital strategy and SOPs.
- [From Chaos to Revenue](https://apollonpapas.com/fromchaostorevenue): 6-week
  execution sprint, from idea to launched product with real clients.
- The Mentorship: 18-hour program for founders and executives leading teams of
  10 to 500. Waitlist open on apollonpapas.com; standalone page and URL coming
  soon (add the link here once it launches).
- The Founder VAULT: knowledge library of 15 years of agency handouts, guides
  and workbooks. Waitlist open on apollonpapas.com; standalone page and URL
  coming soon (add the link here once it launches).
- [Career Readiness Sprint](https://join-crs.com/): 4-week job-market preparation
  for students (in Greek).

## About
- [Apollo's story](https://apollonpapas.com/about): the full 15-year narrative.
- [Reviews](https://apollonpapas.com/reviews): 119 named reviews from trainings
  and workshops in 25+ countries.

## Contact
- hello@apollonpapas.com
```

---

## Part 5 : Approved copy changes

### 5.1 Hero (homepage)
- Eyebrow: keep `FOUNDER. OPERATOR. EDUCATOR.`
- **H1 (approved, proof-led):** `The growth systems behind 17,539 trained executives, opened up to founders.`
- **Subhead (p, not inside H1):** `I'm Apollon Papas. For 15 years I built growth systems with teams at Amazon, Samsung and EY and called them The Invisible Hand System. Now I teach founders and executives to run them without me.`
- **Primary CTA:** `Save my free seat at PowerUp!` → links to /webinar-powerup
- **Secondary CTA (ghost button):** `See the programs` → #programmata
- Directly under the hero (small text block or the About card intro), place the canonical bio paragraph, verbatim, as extractable text:
  > Apollon (Apollo) Papas is a Greek business growth consultant and educator, and the founder of GYA Media Group (2017). He has delivered more than 9,000 hours of enterprise consulting and training to 17,539 executives, working with teams at Amazon, Samsung, SHEIN, Michelin, ZOOM and EY, and now teaches founders through structured execution programs.

### 5.2 Global name cleanup
- Remove the `V.` everywhere: H1, footer identity block, schema, any meta. Copyright line becomes `© 2017-2026 Apollon Papas`.

### 5.3 Journey timeline
- 2018-2022 card: change `training teams in marketing and penetration` → `training teams in marketing and market entry`. **Only this fix; the Palantir/OpenAI sentence stays exactly as written (Apollo confirmed it is accurate).**
- Gallery photo captions: **deferred, not blocking**. Apollo hasn't sent exact venue/year strings yet and asked to be reminded when the dev is ready for this step rather than chased now. Ship this pass with the existing alt text as a fallback caption (or no caption); add real captions as a follow-up patch once Apollo supplies them.

### 5.4 Programs section
- Status chips: PowerUp! `Free`, From Chaos to Revenue `Live`, and The Mentorship + The Founder VAULT change from `Coming soon` to **`Waitlist`**. Add ladder labels: PowerUp! gets `Start here · Free`; From Chaos to Revenue gets `Core program`; The Mentorship gets `Flagship`; The Founder VAULT gets `Knowledge library`.
- Pricing: **Free label only** on PowerUp!. No prices on other cards (Apollo's decision).
- 6WS card copy, outcome first: `Launch your product in 6 weeks. A work-along sprint that takes founders from ideation to a launched product with real clients to deal with.`
- VAULT card copy, trimmed to: `15 years of client-facing agency knowledge in one place: eBooks, workbooks, tool guides, checklists, podcasts and how-to handouts my team wrote for real client teams. The written half of The Invisible Hand System.`
- Mentorship card: keep current copy but open with the anchor: `Born from 9,000+ hours of enterprise consulting: a comprehensive 18-hour course for founders and executives leading teams of 10 to 500...` (rest unchanged).
- The two Waitlist cards stay capture-free on this site. Their final URLs are **not decided yet** (Apollo will confirm the slugs after the Mentorship and VAULT pages are actually built). For this pass, render the chip as `Waitlist` with no working link (no `href`, or `href="#"`, cursor default) rather than guessing a URL.

> **Note for whoever picks this handoff up next (Claude or dev):** once Apollo confirms the final slugs and the Mentorship and VAULT pages go live, come back and wire the real links into: this card, the ladder in 5.5, `llms.txt` and `sitemap.xml` in Part 4. Do not invent or guess the slugs before then; ask Apollo.
- CRS card: add a small `Programme in Greek` label next to the Live chip (the banner asset stays as is).

### 5.5 New section: The Path (value ladder)
Insert between the Programs intro and the founder cards (or directly above Programs). A horizontal 5-step ascent, visually rising left to right, titled **`The path`** with the line `Every program is a step in the same system. Start free.`

| Step | Label | Name | One-liner | Status chip |
|---|---|---|---|---|
| 1 | Free · Start here | PowerUp! webinar | Live training. See the system working on real cases. | Free |
| 2 | Knowledge library | The Founder VAULT | The written system: guides, workbooks, checklists. | Waitlist |
| 3 | Core | From Chaos to Revenue | 6 weeks from idea to launched product with real clients. | Live |
| 4 | Flagship | The Mentorship | 18 hours for executives leading teams of 10 to 500. | Waitlist |
| 5 | Enterprise | GYA Media Group | Done-with-you consulting and in-house training. | By conversation |

No euro figures in this section (pricing decision above). Steps 1, 3 link to their programme pages; 5 links to gya-media.com. Steps 2 and 4 stay unlinked for now, same as their program cards (see the note in 5.4) until the Mentorship and VAULT pages exist and Apollo confirms the URLs.

### 5.6 New section: Testimonials (homepage) + dedicated /reviews page

**Source of truth:** `gya_training_reviews_119.csv` (119 reviews with reviewer_name, role, company, country; already sent to the dev). Render from the CSV at build time, never retype by hand.

**Homepage section.** Title: **`What participants say`**. Sub-line: `From GYA Media trainings and workshops across 25+ countries.` Two tiers:

*Featured (6 cards, always visible), CSV ids 1, 4, 3, 37, 7, 5:*
1. **Nikos Anagnostou, Managing Partner, Ionian Precision Castings SA (Greece):** "Honestly I went into the workshop thinking I already knew our market. Two days later I was rewriting our pricing sheet on the train home. What stuck with me wasn't the slides, it was Apollo pushing back on why we were scared to raise prices in the first place. 27 years in the business and nobody had ever asked me that directly."
2. **Youssef Al Mansoori, CEO, Desert Bridge Trading LLC (UAE):** "I have sat through many consultants over the years, most of them talk in circles. Apollo was direct, sometimes too direct for some of the older people in the room, but that is exactly what we needed. The framework on reframing what our team believed was possible in new markets, that alone changed how we planned our Saudi entry."
3. **Tomasz Wiśniewski, Regional Team Lead, Karpatia Logistics Sp. z o.o. (Poland):** "Our whole regional team walked in thinking expansion into Romania was too risky and left the session actually arguing about which city to launch in first. The GYA team also stayed an extra hour after to go through our actual numbers with us, which nobody expected."
4. **Kevin O'Brien, Managing Partner, O'Brien & Sons Roofing (USA):** "Family business, three generations now, and getting my father to change how he thinks about pricing has been basically impossible for years. This training did it in an afternoon."
5. **Yannis Michailidis, Founder, Michailidis Marine Supplies (Greece):** "I run a small supply business, third generation, and I was sure this training would be for bigger companies than mine. It wasn't. The pricing conversation alone paid for the whole thing twice over."
6. **Ngozi Eze, Operations Director, Lagos Prime Foods Ltd (Nigeria):** "We had been doing things the same way for 8 years because it worked when we were smaller. Apollo's team showed us where that same process was actually costing us. Also appreciated that they followed up by email after with a summary, a lot of trainers just disappear once the invoice is paid."

*Wall (12 more, masonry grid below the featured cards, can sit behind a "Show more" expander on mobile), CSV ids 19, 9, 33, 28, 89, 56, 23, 41, 81, 66, 55, 117.* Note ids 55 (Italian) and 117 (Turkish) are in their original language: keep them untranslated, it reads as authentic international proof. Pull exact text from the CSV.

*Closing line linking onward:* `Read all 119 reviews →` to `/reviews`.

**New page `/reviews`.** Renders all 119 reviews from the CSV at build time, grouped by region (Europe / Middle East / Africa / Americas), with a short intro and the canonical bio block at top. Head: `<title>Reviews · Apollon Papas</title>` + own meta description. Add `Review` schema entries (itemReviewed referencing the Person `@id`) for at least the featured six; skip aggregateRating unless Apollo wants star ratings added to the data. This page is a trust asset and a GEO asset ("Apollon Papas reviews" queries) in one.

### 5.7 Logo slider
All current logos stay (Apollo confirmed all relationships are real). **Add** the seven brands named in the story to the slider: Amazon, Samsung, SHEIN, COSRX, Michelin, ZOOM, EY. Label stays `Trusted by`. Use monochrome treatments consistent with the existing rows.

### 5.8 Visible FAQ section
Near the bottom (before Contact), title **`Frequently asked`**, containing the same four Q&As as the FAQPage schema in Part 3, as an accordion or plain list. Text must match the schema word for word.

### 5.9 Contact section
No form (scope rule). Keep it simple and routing-oriented:
- Email (mailto hello@apollonpapas.com) and the LinkedIn button, as today.
- Add one quiet line: `For enterprise consulting and in-house training, talk to GYA Media Group` → https://www.gya-media.com/.
- Add a final webinar pointer for scrolled-to-the-bottom visitors: `Want to see the system first? Join the free PowerUp! webinar` → /webinar-powerup (plain link/button, no capture here; the webinar page owns its own form and tracking).

### 5.10 About page packaging (`/about`)
- Content stays as written, with one small fact added: the line `I got into one of the country's top universities` becomes `I got into The American College of Greece - DEREE`. Nothing else in that paragraph changes.
- Also add:
  - 3 or 4 pull quotes as typographic breaks; must include `"The magic was never magic. It was a system."` (also name-drop: `Today I teach it as The Invisible Hand System.` may be appended where the closing paragraph introduces the six weeks).
  - Visible photo captions (place, event, year). **[OPEN, deferred]** Apollo has not sent these yet: he asked to be reminded when the dev is ready for this step, rather than being chased now. Ship the rebuild with the photos uncaptioned (or with the existing generic alt text repeated as caption) and treat captions as a small follow-up patch once Apollo supplies the venue/year strings.
  - A second, smaller CTA at the end next to the 6WS card for not-ready readers: `Not a founder yet? Start with the free PowerUp! webinar.` (plain link, no capture on this page).
  - Own title/meta (Part 2) and `Article` or `AboutPage` schema referencing the Person `@id`.

---

## Part 6 : Tracking install (IDs are final)

**Decision: reuse the existing 6WS stack sitewide. Do NOT create a second GTM container or GA4 property on this domain.** GTM-5S2Q3XZM was already scoped to apollonpapas.com paths (/fromchaostorevenue, /webinar-powerup) and already carries GA4, the Meta pixel bridge, scroll-depth and outbound-click tracking. The homepage, /about and /reviews simply join it.

| Asset | ID | Notes |
|---|---|---|
| GTM web container | `GTM-5S2Q3XZM` | GTM account 6350418905. Install on **every** route (head snippet + noscript body snippet). |
| GA4 property | `G-19MWNBHZP0` (property 533541098) | Fires via GTM. Do not install gtag.js directly; the legacy direct tag `GT-NSKCHZV5` must be removed wherever it still exists. |
| Google Ads | AW-18098716625, customer 6576112442 | Already linked to GA4. Nothing for dev to do. |
| Meta Pixel | `2139082203335602` | Fires via GTM. Do not hard-code the pixel. |
| GSC | sc-domain:apollonpapas.com | Already verified. After deploy, Claude/Apollo submits the new sitemap. |
| Clarity | none yet for this domain | Optional later; would be added as a GTM tag, no dev work now. |

**Event scope for the brand routes (`/`, `/about`, `/reviews`): pageviews and simple clicks only.** No `generate_lead`, no `sign_up`, no purchase or any conversion event may fire from these routes; conversion tracking and attribution belong exclusively to the programme pages and their own funnels. The container's existing pageview, scroll-depth and outbound-click tracking cover most of what is wanted. The only custom push dev adds:

```js
// on primary hero CTA click (plain engagement click, NOT a conversion):
dataLayer.push({ event: "cta_click", cta: "powerup_hero" });
```

If GTM tags in the container are found to fire conversion events globally (all-pages triggers), they must be scoped so they never fire on `/`, `/about`, `/reviews`. Flag anything ambiguous to Apollo instead of guessing.

---

## Part 7 : Email capture: none on this site (by design)

There are **no forms anywhere on apollonpapas.com brand routes**. All signups happen on the programme pages (webinar, sprint, and the future Mentorship/VAULT pages), which own their own forms, lists and attribution. Dev has nothing to wire here; no ActiveCampaign token is needed for this project.

For reference only (used by the programme funnels, not by this site): ActiveCampaign account `apollonpapas3.activehosted.com`, lists 6WS FREE WEBINAR = 14, Apollo Newsletter = 32, VAULT Waitlist = 33, Mentorship Waitlist = 34, Master Contact List = 3.

---

## Part 8 : QA checklist before calling it done

- [ ] `curl -A "GPTBot" https://apollonpapas.com/` returns full page text (check for "17,539")
- [ ] robots.txt, sitemap.xml, llms.txt return correct content and content-types
- [ ] Every route has unique title + meta description + canonical
- [ ] Google Rich Results Test passes for Person + FAQPage on `/`
- [ ] H1 contains only the headline; no `V.` anywhere on the site
- [ ] Stat counters show final values with JS disabled
- [ ] GTM preview: pageview + GA4 + Meta pixel fire on `/`, `/about`, `/reviews`; `cta_click` fires on the hero CTA; **no conversion event (generate_lead, sign_up, purchase) fires on any brand route**
- [ ] No form element exists anywhere on `/`, `/about`, `/reviews`
- [ ] "market entry" fix live; testimonials (6 featured + 12 wall), /reviews page with all 119, ladder, FAQ, new logos all render; Waitlist chips display correctly with no broken/guessed links; DEREE university name in the About story and schema `alumniOf`
- [ ] Mobile pass at 390px: no horizontal scroll, ladder scrolls in its own container
- [ ] Lighthouse: SEO 100, no accessibility regressions

## Open items (Apollo)
1. ~~Send the dev `gya_training_reviews_119.csv`.~~ **Done** : dev already has the reviews CSV.
2. ~~University name for the About story and schema `alumniOf`.~~ **Done** : The American College of Greece - DEREE (already applied in Parts 3 and 5.10).
3. **Deferred, not blocking launch** : exact captions (venue + year) for Journey/About photos. Apollo has not sent these; ask him to remind you when he's ready rather than chasing him for them now.
4. **Deferred, not blocking launch** : final slugs for the Mentorship and VAULT pages. Apollo will confirm the URLs once those pages exist. Ship the Waitlist chips unlinked (see the note in 5.4) until then; do not guess `/mentorship` / `/vault` as real.
5. **Once the Mentorship and VAULT pages go live and Apollo shares their URLs:** wire the real links into the program cards (5.4), the ladder (5.5), `llms.txt` and `sitemap.xml` (Part 4).
6. After the main rebuild deploys: tell Claude, so the `cta_click` GTM tag gets created (and any stray conversion triggers get scoped away from the brand routes), the sitemap gets submitted in GSC, and the acceptance tests get run.
