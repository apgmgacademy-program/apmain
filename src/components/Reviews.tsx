import { useTranslation } from 'react-i18next';
import reviews from '../data/reviews.json';
import { COUNTRY_REGION, REVIEW_REGIONS, SITE, type ReviewRegion } from '../config';
import { ReviewCard } from './Testimonials';

// /reviews: all 119 rows from the CSV, grouped by region (HANDOFF 5.6).
//
// A trust asset and a GEO asset in one - "Apollon Papas reviews" is a real
// query, and this is the page that should answer it. Which is also why the
// canonical bio sits at the top: an extractor that lands here should leave
// knowing who is being reviewed.
//
// No form, no capture, no conversion event. This is a brand route (Part 0).
export default function Reviews() {
  const { t } = useTranslation();

  const grouped = REVIEW_REGIONS.map((region) => ({
    region,
    items: reviews.filter((r) => regionOf(r.country) === region),
  })).filter((g) => g.items.length > 0);

  return (
    <section className="section reviews-page" data-screen-label="Reviews" data-edit-section="reviews">
      <div className="aurora-wrap story-aurora" aria-hidden="true">
        <div className="aurora-blob b-gold"></div>
        <div className="aurora-blob b-orange"></div>
        <div className="aurora-grain"></div>
      </div>

      <header className="reviews-head">
        <span className="eyebrow label" data-edit-id="reviews.eyebrow" data-edit-key="reviews.eyebrow">
          <span className="dot" aria-hidden="true" />
          {t('reviews.eyebrow')}
        </span>
        <h1 className="display-xl display-font reviews-title" data-edit-id="reviews.title" data-edit-key="reviews.title">
          {t('reviews.title')}
        </h1>
        <p className="reviews-lede body-l" data-edit-id="reviews.lede" data-edit-key="reviews.lede">
          {t('reviews.lede')}
        </p>
        {/* The canonical bio, verbatim and extractable (HANDOFF 5.1). */}
        <p className="reviews-bio" data-edit-id="reviews.bio" data-edit-key="about.canonicalBio">
          {t('about.canonicalBio')}
        </p>
      </header>

      {grouped.map(({ region, items }) => (
        <div className="reviews-region" key={region}>
          <div className="reviews-region-head">
            <h2 className="display-l display-font" data-edit-id={`reviews.region-${region}`} data-edit-key={`reviews.regions.${region}`}>
              {t(`reviews.regions.${region}`)}
            </h2>
            <span className="reviews-count label">{t('reviews.count', { count: items.length })}</span>
          </div>
          <div className="review-wall is-open">
            {items.map((r) => (
              <ReviewCard key={r.id} r={r} editId={`reviews.${region.toLowerCase().replace(/ /g, '-')}`} />
            ))}
          </div>
        </div>
      ))}

      <div className="reviews-foot">
        <a className="btn btn-ghost" href="/" data-edit-id="reviews.back" data-edit-key="reviews.back">
          {t('reviews.back')}
        </a>
        <a className="btn btn-primary" href={SITE.webinarUrl} data-edit-id="reviews.webinar" data-edit-key="hero.ctaPrimary">
          {t('hero.ctaPrimary')}
        </a>
      </div>
    </section>
  );
}

// An unmapped country would silently vanish from the page, so it fails loudly
// instead. Add it to COUNTRY_REGION in src/config.ts when a new export lands.
function regionOf(country: string): ReviewRegion {
  const region = COUNTRY_REGION[country];
  if (!region) throw new Error(`COUNTRY_REGION has no entry for "${country}" (src/config.ts)`);
  return region;
}
