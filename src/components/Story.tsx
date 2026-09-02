import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { PROGRAM_MEDIA, SITE, STORY_SHOTS } from '../config';

// Apollo's story in his own words, as one centred column with event prints
// scattered down the gutters either side of it. The prints are DOM siblings of
// the paragraphs, interleaved, so a phone (which has no gutters) gets a sensible
// reading order for free: the desktop rule below is what lifts them out of flow.
//
// Copy lives under `story` in the locale files. el.json deliberately has no
// `story` block: Greek is paused, i18next falls back to en per key, and 1,500
// words of untranslated English masquerading as a Greek translation would be
// worse than the fallback. Translate it before flipping SITE.showLangToggle.
// A line lifted out of the prose and set large, to break up 1,500 words of
// unbroken column. `after` is the index of the paragraph it follows.
type PullQuote = { after: number; text: string };

export default function Story() {
  const { t } = useTranslation();
  const paragraphs = t('story.paragraphs', { returnObjects: true }) as string[];
  const alts = t('story.shotAlts', { returnObjects: true }) as string[];
  const pullQuotes = t('story.pullQuotes', { returnObjects: true }) as PullQuote[];
  const sprint = PROGRAM_MEDIA.sprint;

  // One print after each paragraph, so they arrive at a steady rhythm on
  // mobile. Any extra prints ride along after the last paragraph rather than
  // being dropped.
  const shotsAfter = (i: number) =>
    STORY_SHOTS.filter((_, s) => (i === paragraphs.length - 1 ? s >= i : s === i));

  return (
    <section className="section story" data-screen-label="Story" data-edit-section="story">
      {/* This page has no hero, so a faint glow behind the title does that job.
          Two blobs rather than five, like the one behind the contact CTA: any
          more competes with the prints for attention further down.
          Deliberately not .js-aurora, which Hero's timeline animates. */}
      <div className="aurora-wrap story-aurora" aria-hidden="true">
        <div className="aurora-blob b-gold"></div>
        <div className="aurora-blob b-orange"></div>
        <div className="aurora-grain"></div>
      </div>

      <header className="story-head">
        <span className="eyebrow label" data-edit-id="story.eyebrow" data-edit-key="story.eyebrow">
          <span className="dot" aria-hidden="true" />
          {t('story.eyebrow')}
        </span>
        <h1 className="display-xl story-title" data-edit-id="story.title" data-edit-key="story.titleLead">
          {t('story.titleLead')}{' '}
          <span className="head-tail" data-edit-id="story.title-tail" data-edit-key="story.titleTail">
            {t('story.titleTail')}
          </span>
        </h1>
        <p className="story-lede body-l" data-edit-id="story.lede" data-edit-key="story.lede">
          {t('story.lede')}
        </p>
      </header>

      <div className="story-body">
        <div className="story-prose">
          {paragraphs.map((para, i) => (
            <div key={i} className="story-block">
              <p
                // The first paragraph carries a drop cap, which needs the
                // opening character to be a letter. Every other one is plain.
                className={'story-para' + (i === 0 ? ' story-para--lead' : '')}
                data-edit-id={`story.paragraph-${i}`}
                data-edit-key={`story.paragraphs.${i}`}
              >
                {para}
              </p>
              {shotsAfter(i).map((shot) => {
                const idx = STORY_SHOTS.indexOf(shot);
                return (
                  <figure
                    key={shot.src}
                    className={'story-shot' + (shot.tall ? ' story-shot--tall' : '')}
                    data-side={shot.side}
                    data-story-shot=""
                    style={
                      {
                        '--top': shot.top,
                        '--rot': shot.rot,
                        '--w': shot.w,
                        '--nudge': shot.nudge ?? '0px',
                      } as CSSProperties
                    }
                  >
                    <img
                      src={shot.src}
                      alt={alts[idx] ?? ''}
                      loading="lazy"
                      decoding="async"
                      style={shot.focus ? { objectPosition: shot.focus } : undefined}
                      data-edit-id={`story.shot-${idx}`}
                      data-edit-key={`story.shotAlts.${idx}`}
                      data-edit-type="image"
                    />
                  </figure>
                );
              })}
              {pullQuotes
                .filter((q) => q.after === i)
                .map((q) => (
                  <p
                    className="story-pull display-font"
                    key={q.text}
                    data-edit-id={`story.pull-${i}`}
                    data-edit-key={`story.pullQuotes.${pullQuotes.indexOf(q)}.text`}
                  >
                    {q.text}
                  </p>
                ))}
            </div>
          ))}
        </div>
      </div>

      <a
        className="product-card product-card--wide product-card--media story-cta"
        href={sprint.href}
        {...(SITE.programLinksNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        data-reveal=""
        data-edit-id="story.cta"
      >
        <img className="product-mockup" src={sprint.image} alt={t('story.ctaTitle')} />
        <div className="product-body">
          <span className="product-kicker label" data-edit-id="story.cta-kicker" data-edit-key="story.ctaKicker">
            {t('story.ctaKicker')}
          </span>
          <div className="product-head">
            <h2 className="product-title" data-edit-id="story.cta-title" data-edit-key="story.ctaTitle">
              {t('story.ctaTitle')}
            </h2>
            <span className="product-arrow" aria-hidden="true">
              ↗
            </span>
          </div>
          <p className="product-desc" data-edit-id="story.cta-desc" data-edit-key="story.ctaDesc">
            {t('story.ctaDesc')}
          </p>
          <span className="chip chip-live" data-edit-id="story.cta-button" data-edit-key="story.ctaButton">
            {t('story.ctaButton')}
          </span>
        </div>
      </a>

      {/* HANDOFF 5.10: the not-ready-yet door, beside the sprint card. A plain
          link - /about is a brand route and captures nothing. */}
      <p className="story-cta-alt" data-reveal="" data-edit-id="story.cta-alt" data-edit-key="story.ctaAlt">
        <a href={SITE.webinarUrl}>
          {t('story.ctaAlt')} <span aria-hidden="true">→</span>
        </a>
      </p>
    </section>
  );
}
