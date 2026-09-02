import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import reviews from '../data/reviews.json';
import { FEATURED_REVIEW_IDS, WALL_REVIEW_IDS } from '../seo';

export type Review = (typeof reviews)[number];

export const byId = (id: number): Review => {
  const r = reviews.find((x) => x.id === id);
  // A missing id means the CSV changed under a hand-picked selection, which is
  // worth failing the build over rather than silently dropping a card.
  if (!r) throw new Error(`reviews.json has no id ${id}`);
  return r;
};

// One quote. Named, with role, company and country: the attribution is the
// proof, so it is never trimmed to just a first name.
export function ReviewCard({ r, editId }: { r: Review; editId?: string }) {
  return (
    <figure className="review-card" {...(editId ? { 'data-edit-id': `${editId}-${r.id}` } : {})}>
      <blockquote className="review-quote">{r.review}</blockquote>
      <figcaption className="review-by">
        <span className="review-name">{r.name}</span>
        <span className="review-meta">
          {r.role}, {r.company} ({r.country})
        </span>
      </figcaption>
    </figure>
  );
}

const STREAM_COLUMNS = 3;

// HANDOFF 5.6 specifies two tiers: six featured cards always visible above a
// masonry wall of twelve. This departs from that on Kyriakos's direction - the
// same eighteen reviews, presented as one moving stream. Flag it to Apollo
// rather than letting him find it.
//
// Ids 55 (Italian) and 117 (Turkish) are in their original language on purpose:
// untranslated reads as authentic international proof.
//
// All eighteen run as one slow vertical stream rather than a static grid.
// Eighteen quotes standing still is a wall of text you scroll past; in motion
// the same eighteen read as evidence of volume while taking a fraction of the
// page height. The featured six are dealt first, so they sit at the top of the
// three columns and are what a visitor reads before anything has moved.
//
// Hover, focus and drag act on ONE column: holding a single quote still should
// not freeze the whole section.
//
// Motion is enhancement only. It is set up inside gsap.matchMedia, so phones
// and anyone on reduced motion get the plain stacked list behind the expander,
// and the loop's duplicate cards are cloned by script rather than rendered -
// the prerendered HTML carries each review exactly once.
export default function Testimonials() {
  const { t } = useTranslation();
  // Only does anything at the narrow breakpoint, where the stream is a plain
  // list and twelve extra cards would bury the rest of the page.
  const [expanded, setExpanded] = useState(false);
  const stream = useRef<HTMLDivElement>(null);

  // All eighteen run in the stream, featured first. Dealt round-robin, so the
  // six hand-picked ones land at the top of the three columns and are what you
  // see before anything has moved; the wall follows behind them.
  const streamIds = [...FEATURED_REVIEW_IDS, ...WALL_REVIEW_IDS];
  const columns = Array.from({ length: STREAM_COLUMNS }, (_, c) =>
    streamIds.filter((_, i) => i % STREAM_COLUMNS === c)
  );

  useGSAP(
    () => {
      const root = stream.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add('(min-width: 721px) and (prefers-reduced-motion: no-preference)', () => {
        const tracks = gsap.utils.toArray<HTMLElement>('.review-stream-track', root);

        // A seamless loop needs the column's contents twice: the tween travels
        // exactly one copy's worth and repeats, so the seam never lands on
        // screen. The clones are decorative repeats of text already read out
        // above them, hence aria-hidden and no edit tags.
        const clones: HTMLElement[] = [];
        tracks.forEach((track) => {
          [...track.children].forEach((child) => {
            const clone = child.cloneNode(true) as HTMLElement;
            clone.setAttribute('aria-hidden', 'true');
            clone.removeAttribute('data-edit-id');
            track.appendChild(clone);
            clones.push(clone);
          });
        });

        // Alternate direction so the columns do not read as one sliding block.
        const isDown = (i: number) => i % 2 === 0;
        const tweens = tracks.map((track, i) => {
          const down = isDown(i);
          gsap.set(track, { yPercent: down ? -50 : 0 });
          return gsap.to(track, {
            yPercent: down ? 0 : -50,
            duration: 46 + i * 9,
            ease: 'none',
            repeat: -1,
          });
        });

        // Interaction is per column, not per section. Reading one quote should
        // hold that column still and leave the other two running; freezing the
        // whole wall to read a single card is heavy-handed and makes the
        // section feel stalled.
        const wrap01 = gsap.utils.wrap(0, 1);
        const cols = gsap.utils.toArray<HTMLElement>('.review-stream-col', root);
        const teardown: Array<() => void> = [];

        cols.forEach((col, i) => {
          const tween = tweens[i];
          const track = tracks[i];
          const down = isDown(i);

          let dragging = false;
          let lastY = 0;

          const pause = () => tween.pause();
          // A column being dragged must not be restarted by the pointer
          // wandering out of it mid-drag; the pointer capture keeps the move
          // events coming, so the resume is left to onUp.
          const play = () => {
            if (!dragging) tween.play();
          };

          const onDown = (e: PointerEvent) => {
            // Touch is left alone: a vertical drag here is the visitor trying
            // to scroll the page, and stealing it would trap them in it.
            if (e.pointerType !== 'mouse') return;
            dragging = true;
            lastY = e.clientY;
            col.setPointerCapture(e.pointerId);
            col.classList.add('is-dragging');
            tween.pause();
          };
          const onMove = (e: PointerEvent) => {
            if (!dragging) return;
            const dy = e.clientY - lastY;
            lastY = e.clientY;
            const half = track.offsetHeight / 2;
            if (!half) return;
            // Progress runs the opposite way for the two directions, so the
            // cards follow the cursor whichever way the column travels.
            const delta = dy / half;
            tween.progress(wrap01(tween.progress() + (down ? delta : -delta)));
          };
          const onUp = (e: PointerEvent) => {
            if (!dragging) return;
            dragging = false;
            if (col.hasPointerCapture(e.pointerId)) col.releasePointerCapture(e.pointerId);
            col.classList.remove('is-dragging');
            // Only resume if the cursor actually left; otherwise the visitor is
            // still reading this column.
            if (!col.matches(':hover')) tween.play();
          };

          col.addEventListener('pointerenter', pause);
          col.addEventListener('pointerleave', play);
          col.addEventListener('focusin', pause);
          col.addEventListener('focusout', play);
          col.addEventListener('pointerdown', onDown);
          col.addEventListener('pointermove', onMove);
          col.addEventListener('pointerup', onUp);
          col.addEventListener('pointercancel', onUp);

          teardown.push(() => {
            col.removeEventListener('pointerenter', pause);
            col.removeEventListener('pointerleave', play);
            col.removeEventListener('focusin', pause);
            col.removeEventListener('focusout', play);
            col.removeEventListener('pointerdown', onDown);
            col.removeEventListener('pointermove', onMove);
            col.removeEventListener('pointerup', onUp);
            col.removeEventListener('pointercancel', onUp);
            col.classList.remove('is-dragging');
          });
        });

        return () => {
          teardown.forEach((fn) => fn());
          tweens.forEach((tw) => tw.kill());
          clones.forEach((c) => c.remove());
          gsap.set(tracks, { clearProps: 'transform' });
        };
      });

      return () => mm.revert();
    },
    { scope: stream }
  );

  return (
    <section className="section testimonials" id="testimonials" data-screen-label="Testimonials" data-edit-section="testimonials">
      <h2 className="display-l display-font" data-reveal="" data-edit-id="home.testimonials.title" data-edit-key="testimonials.title">
        {t('testimonials.title')}
      </h2>
      <p className="testimonials-lede body-l" data-reveal="" data-edit-id="home.testimonials.lede" data-edit-key="testimonials.lede">
        {t('testimonials.lede')}
      </p>

      <div className={'review-stream' + (expanded ? ' is-open' : '')} ref={stream} data-reveal="">
        {columns.map((ids, c) => (
          <div className="review-stream-col" key={c}>
            <div className="review-stream-track">
              {ids.map((id) => (
                <ReviewCard
                  key={id}
                  r={byId(id)}
                  editId={FEATURED_REVIEW_IDS.includes(id) ? 'home.testimonials.featured' : 'home.testimonials.wall'}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="testimonials-foot" data-reveal="">
        <button
          type="button"
          className="btn btn-ghost btn-sm review-more"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          data-edit-id="home.testimonials.show-more"
          data-edit-key="testimonials.showMore"
        >
          {t('testimonials.showMore')}
        </button>
        <a className="review-all" href="/reviews" data-edit-id="home.testimonials.all" data-edit-key="testimonials.all">
          {t('testimonials.all')} <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
