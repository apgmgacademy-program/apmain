import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../hooks/useScrollMotion';

type FaqItem = { q: string; a: string };

// HANDOFF 5.8. These four Q&As are the same strings src/seo.ts feeds into the
// FAQPage schema - both read en.json, so they cannot drift apart. Schema for
// content that is not visible on the page gets ignored, which is the whole
// reason this section exists.
//
// Built on <details>/<summary> rather than a JS accordion: it opens without
// hydration, is keyboard-accessible for free, and the answers sit in the
// prerendered HTML whether or not the disclosure is open. The easing below is a
// progressive enhancement on top of that - with JS off, or under reduced
// motion, the native snap-open behaviour is what runs.
export default function Faq() {
  const { t } = useTranslation();
  const items = t('faq.items', { returnObjects: true }) as FaqItem[];
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const details = gsap.utils.toArray<HTMLDetailsElement>('.faq-item', root.current);

      const onClick = (e: MouseEvent) => {
        const summary = e.currentTarget as HTMLElement;
        const item = summary.parentElement as HTMLDetailsElement;
        const panel = item.querySelector<HTMLElement>('.faq-panel');
        if (!panel) return;

        // The browser would toggle `open` instantly and there would be nothing
        // left to animate, so the disclosure is driven by hand from here.
        e.preventDefault();
        gsap.killTweensOf(panel);

        if (item.open) {
          item.classList.add('is-closing');
          gsap.to(panel, {
            height: 0,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut',
            onComplete: () => {
              item.open = false;
              item.classList.remove('is-closing');
              gsap.set(panel, { clearProps: 'height,opacity' });
            },
          });
        } else {
          // `open` has to be set first: a closed <details> has no layout, so
          // height:auto would measure zero.
          item.open = true;
          gsap.fromTo(
            panel,
            { height: 0, opacity: 0 },
            {
              height: 'auto',
              opacity: 1,
              duration: 0.36,
              ease: 'power2.out',
              // Released back to auto so a resize or a font swap cannot leave
              // the panel pinned at a stale pixel height.
              onComplete: () => gsap.set(panel, { clearProps: 'height' }),
            }
          );
        }
      };

      const summaries = details.map((d) => d.querySelector('summary')).filter(Boolean) as HTMLElement[];
      summaries.forEach((s) => s.addEventListener('click', onClick));
      return () => summaries.forEach((s) => s.removeEventListener('click', onClick));
    },
    { scope: root }
  );

  return (
    <section className="section faq" id="faq" data-screen-label="FAQ" data-edit-section="faq">
      <h2 className="display-l display-font" data-reveal="" data-edit-id="home.faq.title" data-edit-key="faq.title">
        {t('faq.title')}
      </h2>
      <div className="faq-list" data-reveal="" ref={root}>
        {items.map((f, i) => (
          <details className="faq-item" key={i}>
            <summary className="faq-q" data-edit-id="home.faq.item-q" data-edit-key="faq.items.{i}.q">
              {f.q}
              <span className="faq-mark" aria-hidden="true" />
            </summary>
            <div className="faq-panel">
              <p className="faq-a" data-edit-id="home.faq.item-a" data-edit-key="faq.items.{i}.a">
                {f.a}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
