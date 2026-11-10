// Site-wide design decisions locked during the prototype phase.
// Colors/typography/radii live in src/styles/site.css as CSS custom properties.

export const SITE = {
  auroraOpacity: 0.5,
  grainOpacity: 0.07,
  marqueeDurationS: 28,
  goldDot: true,
  // Headline tail settles to bright white after the fill-wave reveal
  tailEnd: 'white' as 'white' | 'dim',
  portraitEffect: 'Tilt' as 'Tilt' | 'Spotlight' | 'None',
  linkedinUrl: 'https://www.linkedin.com/in/apollonpapas/',
  email: 'hello@apollonpapas.com',
  // TODO: paste Apollo's real Calendly booking link. Empty = the "Book a call"
  // button falls back to the contact anchor so nothing dead-links in the meantime.
  calendlyUrl: '',
  crsUrl: 'https://join-crs.com/',
  gyaUrl: 'https://www.gya-media.com/',
  webinarUrl: '/webinar-powerup',
  sprintUrl: '/fromchaostorevenue',
  // The VAULT's own landing page (plans and checkout), a separate app on its own
  // domain since 10 Nov 2026 (the old vault-landing host redirects here).
  vaultUrl: 'https://foundrsvault.com/',
  // Apollo has paused the Greek locale. The toggle is hidden and i18n is pinned
  // to EN (see src/i18n/index.ts); el.json stays in the build so flipping this
  // back to true is the only change needed to bring Greek back.
  showLangToggle: false,
  // Year the business started, for the footer copyright range. The end year is
  // taken from the clock at render time.
  foundedYear: 2017,
  // Programs render as a sticky stack: each card pins under the nav and the
  // next one slides over it. Set to false for a plain scrolling grid.
  programStack: true,
  // Program cards open in a new tab, including the same-origin ones, so the
  // hub stays put behind them.
  programLinksNewTab: true,
};

// Programs: copy lives in the locale files under `programs.founders` /
// `programs.students`, keyed by id. Layout and media are structural, so they
// live here. `span` drives the grid: 'wide' takes the full row.
// Shape of one entry in `programs.founders` / `programs.students`. Shared so the
// Programs section and the nav dropdown read the same list the same way.
export type Program = {
  id: string;
  kicker: string;
  title: string;
  desc: string;
  // 'soon' is retained for anything Apollo parks later; the two unreleased
  // programs moved to 'waitlist' in HANDOFF 5.4.
  status: 'live' | 'free' | 'soon' | 'waitlist';
  // Ladder label (HANDOFF 5.4): a quiet chip beside the status one. Doubles as
  // the "Programme in Greek" note on the CRS card.
  tag?: string;
};

export const PROGRAM_GROUPS = ['founders', 'students'] as const;
export type ProgramGroup = (typeof PROGRAM_GROUPS)[number];

// Anchor for one audience band inside the Programs section. Defined here so the
// section that owns the id and the dropdown that links to it cannot drift.
export const programGroupId = (group: ProgramGroup) => `programmata-${group}`;

export type ProgramMedia = {
  image?: string;
  href?: string;
  span?: 'wide';
  // Overrides the default 16/9 mockup frame. Set it for artwork that carries
  // its own composition and would lose content to a crop.
  ratio?: string;
};

// Same-origin paths rather than full URLs, so these open in place instead of a
// new tab (ProgramCard only adds target=_blank for absolute http(s) links).
export const PROGRAM_MEDIA: Record<string, ProgramMedia> = {
  sprint: { image: '/images/6ws-banner.jpg', href: '/fromchaostorevenue', span: 'wide' },
  // The webinar banner is a finished 2:1 layout with type running to its edges,
  // so it keeps its own ratio rather than being cropped to 16/9.
  powerup: { image: '/images/powerup-banner.jpg', href: '/webinar-powerup', span: 'wide', ratio: '1400 / 684' },
  // The Mentorship has nowhere to point yet, so it stays unlinked and renders
  // without the arrow.
  mentorship: {},
  // The banner is the VAULT's own sign-in look: its covers on a tilted wall
  // under the landing page's headline. Like CRS, it lives on its own host.
  vault: { image: '/images/vault-banner.jpg', href: SITE.vaultUrl, span: 'wide' },
  // Lives on its own domain, so this one opens in a new tab (ProgramCard adds
  // target=_blank for absolute http(s) links).
  crs: { image: '/images/crs-banner-16x9-dark.png', href: SITE.crsUrl, span: 'wide' },
};

// Journey snapshot wall. `rot` tilts each print, `lift` nudges it off the
// baseline and `z` sets the overlap order. Fixed values, not random, so the
// composition is identical on every load.
// `w` varies the print sizes, `focus` shifts the crop for photos whose subject
// is not centred once they are cropped to the shared landscape frame.
export const GALLERY = [
  { src: '/images/gallery/g4.jpg', rot: '-5.5deg', lift: '16px', z: 1, w: '17vw', focus: 'center' },
  { src: '/images/gallery/g3.jpg', rot: '2.5deg', lift: '-12px', z: 3, w: '20vw', focus: 'center' },
  { src: '/images/gallery/g1.jpg', rot: '-1.5deg', lift: '4px', z: 5, w: '23vw', focus: 'center' },
  { src: '/images/gallery/g2.jpg', rot: '4deg', lift: '-6px', z: 2, w: '20vw', focus: 'center' },
  // Shot portrait, so the group sits low once cropped to landscape.
  { src: '/images/gallery/g5.jpg', rot: '-3deg', lift: '20px', z: 4, w: '17vw', focus: 'center 62%' },
];

// /about: prints scattered down the gutters either side of the story column.
// `top` is a percentage of the prose height, so the composition holds whatever
// the copy length or viewport does to it. `side` picks the gutter, `nudge` is
// an offset from the container edge (positive pulls the print in toward the
// text, negative lets it hang past the edge) and `w` varies the print sizes so
// the wall never reads as a grid.
// `tall` marks the two portrait-orientation sources: the rest are landscape and
// would lose people at the edges if forced into the same frame.
export type StoryShot = {
  src: string;
  side: 'left' | 'right';
  top: string;
  rot: string;
  w: string;
  nudge?: string;
  tall?: boolean;
  focus?: string;
};

export const STORY_SHOTS: StoryShot[] = [
  { src: '/images/story/s1.jpg', side: 'left',  top: '2%',  rot: '-6deg',  w: '210px' },
  { src: '/images/story/s2.jpg', side: 'right', top: '7%',  rot: '4.5deg', w: '180px', tall: true, nudge: '18px' },
  { src: '/images/story/s3.jpg', side: 'left',  top: '21%', rot: '3deg',   w: '235px', nudge: '-14px' },
  { src: '/images/story/s4.jpg', side: 'right', top: '30%', rot: '-3.5deg', w: '225px' },
  { src: '/images/story/s5.jpg', side: 'left',  top: '45%', rot: '5deg',   w: '175px', tall: true, nudge: '22px' },
  { src: '/images/story/s6.jpg', side: 'right', top: '54%', rot: '2.5deg', w: '230px', nudge: '-10px' },
  { src: '/images/story/s7.jpg', side: 'left',  top: '69%', rot: '-4deg',  w: '220px' },
  { src: '/images/story/s8.jpg', side: 'right', top: '80%', rot: '4deg',   w: '205px', nudge: '12px' },
];

// Audit F12: "50+ Publications" is a stat with no artifact behind it, and the
// 2023-2025 Journey card compresses three years of authority-building into nine
// words. The fix is three to five of the best pieces linked from that card;
// linked ones become citable sources with Apollo's name on them.
//
// Apollo has not sent the URLs yet (see OPEN-ITEMS.md), and a publication link
// is not something to guess at. The row below renders only when this array has
// entries, so supplying them here is the entire remaining change - no component
// edit needed. `outlet` is optional and shown as a quiet suffix.
export type Publication = { title: string; url: string; outlet?: string };
export const PUBLICATIONS: Publication[] = [];

// Which Journey card the publication links hang under. Matched on the year
// string rather than an array index, so reordering the timeline in the locale
// files cannot silently move them onto the wrong card.
export const PUBLICATIONS_YEAR = '2023-2025';

// HANDOFF 5.5: steps 1, 3 link to their programme pages and 5 to gya-media.com.
// Step 2 (VAULT) links to its own landing page since 2026-10-23. Step 4
// (Mentorship) stays unlinked until its page exists and Apollo confirms the
// slug - do not guess it. See OPEN-ITEMS.md.
export const PATH_LINKS: Record<string, string | undefined> = {
  powerup: SITE.webinarUrl,
  vault: SITE.vaultUrl,
  sprint: SITE.sprintUrl,
  mentorship: undefined,
  gya: SITE.gyaUrl,
};

// /reviews groups the 119 rows into the four bands HANDOFF 5.6 asks for. The
// CSV's `country` column is the only geography it carries, so the mapping is
// explicit rather than inferred; a country added to a future export and missed
// here surfaces in the build (scripts/prerender.mjs fails on an unmapped one).
export const REVIEW_REGIONS = ['Europe', 'Middle East', 'Africa', 'Americas'] as const;
export type ReviewRegion = (typeof REVIEW_REGIONS)[number];

export const COUNTRY_REGION: Record<string, ReviewRegion> = {
  Bulgaria: 'Europe',
  Cyprus: 'Europe',
  'Czech Republic': 'Europe',
  France: 'Europe',
  Germany: 'Europe',
  Greece: 'Europe',
  Italy: 'Europe',
  Netherlands: 'Europe',
  Poland: 'Europe',
  Portugal: 'Europe',
  Romania: 'Europe',
  Serbia: 'Europe',
  Spain: 'Europe',
  Turkey: 'Europe',
  'United Kingdom': 'Europe',
  Jordan: 'Middle East',
  Lebanon: 'Middle East',
  'Saudi Arabia': 'Middle East',
  'United Arab Emirates': 'Middle East',
  Egypt: 'Africa',
  Ghana: 'Africa',
  Kenya: 'Africa',
  Morocco: 'Africa',
  Nigeria: 'Africa',
  'South Africa': 'Africa',
  'United States': 'Americas',
};

export const AURORA_PALETTE = ['#F2C14E', '#FF7A3C', '#E85CCB', '#5B7CF5', '#2FD6C2'];

// Token hex values for GSAP color tweens (GSAP cannot tween var() keywords)
export const TOKEN_TEXT = '#F7F7F6';
export const TOKEN_DIM = '#8B8B92';
export const TOKEN_FAINT = '#5E5E66';

// GYA Media featured clients. Single-color SVGs and transparent PNGs so the
// mono-white filter in .trusted-logo renders them as clean white silhouettes.
// HANDOFF 5.7 adds the seven brands named in the story. They lead the strip,
// because the hero copy names them as the proof.
export const TRUSTED_LOGOS = [
  { src: '/assets/logos/amazon.svg', alt: 'Amazon', cls: '' },
  { src: '/assets/logos/samsung.svg', alt: 'Samsung', cls: '' },
  { src: '/assets/logos/shein.svg', alt: 'SHEIN', cls: '' },
  { src: '/assets/logos/cosrx.svg', alt: 'COSRX', cls: '' },
  { src: '/assets/logos/michelin.svg', alt: 'Michelin', cls: '' },
  { src: '/assets/logos/zoom.svg', alt: 'ZOOM', cls: '' },
  // Near-square mark rather than a wordmark, so at the shared 22px it reads far
  // smaller than the names either side of it. 'lg' evens out the optical weight.
  { src: '/assets/logos/ey.svg', alt: 'EY', cls: 'lg' },
  { src: '/assets/logos/microsoft.svg', alt: 'Microsoft', cls: '' },
  { src: '/assets/logos/aws.png', alt: 'AWS', cls: '' },
  { src: '/assets/logos/oracle.png', alt: 'Oracle', cls: '' },
  { src: '/assets/logos/dell.png', alt: 'Dell', cls: 'lg' },
  { src: '/assets/logos/hpe.png', alt: 'Hewlett Packard Enterprise', cls: '' },
  { src: '/assets/logos/veeam.png', alt: 'Veeam', cls: '' },
  { src: '/assets/logos/square.svg', alt: 'Square', cls: '' },
  { src: '/assets/logos/squarespace.svg', alt: 'Squarespace', cls: '' },
  { src: '/assets/logos/invision.svg', alt: 'InVision', cls: '' },
  { src: '/assets/logos/wistia.svg', alt: 'Wistia', cls: '' },
  { src: '/assets/logos/feathr.svg', alt: 'Feathr', cls: '' },
  { src: '/assets/logos/mileiq.svg', alt: 'MileIQ', cls: '' },
  { src: '/assets/logos/swagup.svg', alt: 'SwagUp', cls: '' },
  { src: '/assets/logos/mobilize.svg', alt: 'Mobilize', cls: '' },
];
