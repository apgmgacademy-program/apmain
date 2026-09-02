// Per-route <head> and structured data (HANDOFF Parts 2 and 3).
//
// This module is imported by the prerender (scripts/prerender.mjs, via
// src/entry-server.tsx) and never by the browser bundle: the head it builds is
// baked into the HTML at build time, so a crawler that runs no JS still gets a
// unique title, description, canonical and JSON-LD graph per route.
//
// The FAQ answers and the canonical bio are read out of en.json rather than
// retyped here. HANDOFF 5.8 requires the visible FAQ section and the FAQPage
// schema to match word for word, and the only way to guarantee that over time
// is to give both one source.
import type { Route } from './router';
import en from './i18n/en.json';
import reviews from './data/reviews.json';

export const ORIGIN = 'https://apollonpapas.com';
export const PERSON_ID = `${ORIGIN}/#apollon`;
export const GYA_ID = `${ORIGIN}/#gya`;

// HANDOFF 5.6 picks these out of the CSV by id: six featured cards, then a wall
// of twelve. Ids 55 (Italian) and 117 (Turkish) are deliberately untranslated.
export const FEATURED_REVIEW_IDS = [1, 4, 3, 37, 7, 5];
export const WALL_REVIEW_IDS = [19, 9, 33, 28, 89, 56, 23, 41, 81, 66, 55, 117];

const OG_IMAGE = `${ORIGIN}/images/og-apollon-papas-v2.jpg`;

type RouteHead = { title: string; description: string };

export const ROUTE_HEAD: Record<Route, RouteHead> = {
  '/': {
    title: 'Apollon (Apollo) Papas · Business Growth Consultant & Educator',
    description:
      'Apollon Papas is a Greek business growth consultant and founder of GYA Media Group. 9,000+ hours of enterprise consulting, 17,539 executives trained, now teaching founders through the free PowerUp webinar, a 6-week sprint and The Mentorship.',
  },
  '/about': {
    title: 'The Honest Version · Apollon Papas',
    description:
      "Fifteen years, in his own words: how Apollon Papas reverse-engineered the 'invisible hand' founders kept asking for into a system anyone can learn. From Athens, astrophysics and a cut allowance to Amazon, Samsung and EY.",
  },
  '/reviews': {
    title: 'Reviews · Apollon Papas',
    description:
      'All 119 named reviews from GYA Media trainings and workshops across 25+ countries: founders, managing partners and operations directors on what changed after working with Apollon Papas.',
  },
};

// A route's absolute URL. The home route keeps its trailing slash (that is the
// form used in the schema and the sitemap); the others must not gain one.
export const routeUrl = (route: Route) => (route === '/' ? `${ORIGIN}/` : `${ORIGIN}${route}`);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// `<` is escaped so a "</script>" that ever appears inside review text or copy
// cannot close the tag the JSON is sitting in.
const jsonScript = (data: unknown) =>
  `<script type="application/ld+json">\n${JSON.stringify(data, null, 2).replace(/</g, '\\u003c')}\n</script>`;

const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Apollon Papas',
  alternateName: ['Apollo Papas', 'Απόλλων Παπάς'],
  url: `${ORIGIN}/`,
  image: `${ORIGIN}/images/apollo-portrait.jpg`,
  jobTitle: 'Business Growth Consultant and Educator',
  description: en.about.canonicalBio,
  worksFor: { '@id': GYA_ID },
  nationality: { '@type': 'Country', name: 'Greece' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'The American College of Greece - DEREE' },
  knowsAbout: [
    'Business growth strategy',
    'B2B lead generation',
    'Marketing systems',
    'Executive training',
    'Standard operating procedures',
    'Enterprise AI adoption',
  ],
  sameAs: ['https://www.linkedin.com/in/apollonpapas/', 'https://www.gya-media.com/'],
  email: 'hello@apollonpapas.com',
};

const organization = {
  '@type': 'Organization',
  '@id': GYA_ID,
  name: 'GYA Media Group',
  url: 'https://www.gya-media.com/',
  foundingDate: '2017',
  founder: { '@id': PERSON_ID },
};

function graph(route: Route): unknown[] {
  if (route === '/') {
    return [
      person,
      organization,
      { '@type': 'WebSite', url: `${ORIGIN}/`, name: 'Apollon Papas', publisher: { '@id': PERSON_ID } },
      {
        '@type': 'Course',
        name: 'From Chaos to Revenue',
        description: 'A 6-week execution sprint for founders: from idea to a launched product with real clients.',
        provider: { '@id': PERSON_ID },
        url: `${ORIGIN}/fromchaostorevenue`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: en.faq.items.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ];
  }

  if (route === '/about') {
    return [
      person,
      organization,
      {
        '@type': 'AboutPage',
        '@id': `${ORIGIN}/about#page`,
        url: `${ORIGIN}/about`,
        name: ROUTE_HEAD['/about'].title,
        description: ROUTE_HEAD['/about'].description,
        mainEntity: { '@id': PERSON_ID },
        about: { '@id': PERSON_ID },
      },
    ];
  }

  // HANDOFF 5.6: Review entries for at least the featured six, itemReviewed
  // pointing at the Person. No aggregateRating - the CSV carries no stars, and
  // inventing them would be fabricating data.
  return [
    person,
    organization,
    ...FEATURED_REVIEW_IDS.map((id) => {
      const r = reviews.find((x) => x.id === id)!;
      return {
        '@type': 'Review',
        itemReviewed: { '@id': PERSON_ID },
        reviewBody: r.review,
        author: { '@type': 'Person', name: r.name, jobTitle: r.role, worksFor: { '@type': 'Organization', name: r.company } },
      };
    }),
  ];
}

// The full <head> contents for one route, minus the parts index.html already
// owns (charset, viewport, the built CSS/JS tags Vite injects).
export function headHtml(route: Route): string {
  const { title, description } = ROUTE_HEAD[route];
  const url = routeUrl(route);

  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="${route === '/' ? 'website' : 'article'}" />`,
    `<meta property="og:site_name" content="Apollon Papas" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Apollon Papas, Business Growth Consultant and Educator" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    jsonScript({ '@context': 'https://schema.org', '@graph': graph(route) }),
  ].join('\n');
}
