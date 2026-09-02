import { useTranslation } from 'react-i18next';
import Gallery from './Gallery';
import { PUBLICATIONS, PUBLICATIONS_YEAR } from '../config';

interface JourneyItem {
  year: string;
  title: string;
  body: string;
}

export default function Journey() {
  const { t } = useTranslation();
  const items = t('journey.items', { returnObjects: true }) as JourneyItem[];

  return (
    <section className="section" id="diadromi" data-screen-label="Journey" data-edit-section="journey">
      <h2 className="display-l display-font" data-reveal="" data-edit-id="home.journey.title" data-edit-key="journey.title">{t('journey.title')}</h2>
      <Gallery />
      <div className="journey-list">
        <div className="journey-progress js-journey-progress" aria-hidden="true"></div>
        {items.map((j, i) => (
          <article className="journey-item" data-reveal="" key={i}>
            <span className="journey-year" data-edit-id="home.journey.item-year" data-edit-key="journey.items.{i}.year">{j.year}</span>
            <h3 className="journey-title" data-edit-id="home.journey.item-title" data-edit-key="journey.items.{i}.title">{j.title}</h3>
            <p className="journey-body" data-edit-id="home.journey.item-body" data-edit-key="journey.items.{i}.body">{j.body}</p>
            {/* Audit F12. Renders nothing while PUBLICATIONS is empty, so the
                card is unchanged until Apollo supplies the links. */}
            {j.year === PUBLICATIONS_YEAR && PUBLICATIONS.length > 0 ? (
              <ul className="journey-links">
                {PUBLICATIONS.map((p) => (
                  <li key={p.url}>
                    <a href={p.url} target="_blank" rel="noopener noreferrer">
                      {p.title}
                      {p.outlet ? <span className="journey-link-outlet"> · {p.outlet}</span> : null}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
