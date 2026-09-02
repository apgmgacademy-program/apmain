import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { SITE } from '../config';
import { fmtStat, prefersReducedMotion } from '../hooks/useScrollMotion';

interface Stat {
  n: number;
  suffix: string;
  label: string;
}

export default function About() {
  const { t } = useTranslation();
  const stats = t('about.stats', { returnObjects: true }) as Stat[];
  const portraitRef = useRef<HTMLDivElement>(null);

  // Portrait pointer effect (Tilt by default; see SITE.portraitEffect)
  useEffect(() => {
    const portrait = portraitRef.current;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const effect = SITE.portraitEffect;
    if (!portrait || prefersReducedMotion() || !fine || effect === 'None') return;

    let onMove: ((e: PointerEvent) => void) | null = null;
    let onLeave: (() => void) | null = null;

    if (effect === 'Spotlight') {
      onMove = (e) => {
        const r = portrait.getBoundingClientRect();
        portrait.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(2) + '%');
        portrait.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(2) + '%');
      };
      portrait.addEventListener('pointermove', onMove);
    } else if (effect === 'Tilt') {
      gsap.set(portrait, { transformPerspective: 700 });
      const rx = gsap.quickTo(portrait, 'rotationX', { duration: 0.45, ease: 'power2.out' });
      const ry = gsap.quickTo(portrait, 'rotationY', { duration: 0.45, ease: 'power2.out' });
      onMove = (e) => {
        const r = portrait.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        ry(dx * 9);
        rx(dy * -9);
        portrait.style.setProperty('--mx', ((dx + 0.5) * 100).toFixed(2) + '%');
      };
      onLeave = () => {
        rx(0);
        ry(0);
      };
      portrait.addEventListener('pointermove', onMove);
      portrait.addEventListener('pointerleave', onLeave);
    }

    return () => {
      if (onMove) portrait.removeEventListener('pointermove', onMove);
      if (onLeave) portrait.removeEventListener('pointerleave', onLeave);
      gsap.set(portrait, { clearProps: 'transform' });
    };
  }, []);

  return (
    <section className="section" id="sxetika" data-screen-label="About" data-edit-section="about">
      <h2 className="display-l display-font" data-reveal="" data-edit-id="home.about.title" data-edit-key="about.title">{t('about.title')}</h2>
      {/* HANDOFF 5.1: the canonical bio, verbatim, as the first block of prose
          under the hero. It is the paragraph the Person schema, llms.txt and the
          /reviews header all repeat, so an extractor gets the same sentence
          whichever surface it reads. Deliberately plain text, no markup inside. */}
      <p className="about-canonical body-l" data-reveal="" data-edit-id="home.about.canonical-bio" data-edit-key="about.canonicalBio">
        {t('about.canonicalBio')}
      </p>
      <div className="about-card" data-reveal="">
        <div className="about-left">
          <div className="about-role">
            <span className="label role-label" data-edit-id="home.about.role-label" data-edit-key="about.role">{t('about.role')}</span>
            <span className="company display-font" data-edit-id="home.about.company" data-edit-key="about.company">{t('about.company')}</span>
          </div>
          {/* One paragraph, not two: the credentials and the story hook were
              covering the same ground, and the button under it is what the hook
              is there to earn. */}
          <p className="about-bio" data-edit-id="home.about.bio" data-edit-key="about.bio">{t('about.bio')}</p>
          <a className="btn btn-ghost btn-sm" href="/about" data-edit-id="home.about.cta" data-edit-key="about.cta">{t('about.cta')}</a>
        </div>
        <div className="portrait" data-effect={SITE.portraitEffect} ref={portraitRef}>
          <img className="base" src="/images/apollo-portrait.jpg" alt={t('about.portraitAlt')} data-edit-id="home.about.portrait" data-edit-key="about.portraitAlt" data-edit-type="image" />
          <img className="reveal" src="/images/apollo-portrait.jpg" alt="" aria-hidden="true" />
          <div className="sheen" aria-hidden="true"></div>
        </div>
        <div className="about-stats">
          {stats.map((st, i) => (
            <div className="stat" key={i}>
              {/* Rendered text is fmtStat(n) + suffix, a locale-formatted composition of two
                  JSON fields, and GSAP rewrites textContent during the count-up. The key points
                  at `n` only; `suffix` is a sibling field. See docs/overlay-cms.md. */}
              <span
                className="stat-num display-font"
                data-count={st.n}
                data-suffix={st.suffix}
                data-edit-id="home.about.stat-num"
                data-edit-key="about.stats.{i}.n"
              >
                {fmtStat(st.n) + st.suffix}
              </span>
              <span className="stat-label" data-edit-id="home.about.stat-label" data-edit-key="about.stats.{i}.label">{st.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
