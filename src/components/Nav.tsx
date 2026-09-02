import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SITE } from '../config';
import { sectionHref, type Route } from '../router';
import ProgramsMenu from './ProgramsMenu';
import { trackCtaClick } from '../lib/analytics';

// Matches the width where the CSS swaps the inline links for the menu button.
const MOBILE = '(max-width: 720px)';

export default function Nav({ route }: { route: Route }) {
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const lang = i18n.language;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on Escape, on a tap anywhere outside the bar, and on growing past the
  // breakpoint: the button that opened the panel is gone at that width, so an
  // open panel would otherwise have no way out. The dropdown rides along, since
  // it can be open on its own with the mobile panel shut.
  useEffect(() => {
    if (!open && !programsOpen) return;
    const closeAll = () => {
      setOpen(false);
      setProgramsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    const onOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement | null)?.closest?.('.nav')) closeAll();
    };
    const mq = window.matchMedia(MOBILE);
    const onChange = () => {
      // Crossing the breakpoint swaps which copy of the dropdown is visible, so
      // an open one would otherwise reappear in the other placement.
      closeAll();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onOutside);
    mq.addEventListener('change', onChange);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onOutside);
      mq.removeEventListener('change', onChange);
    };
  }, [open, programsOpen]);

  // Both outlive the page they were opened on, so a navigation closes them.
  useEffect(() => {
    setOpen(false);
    setProgramsOpen(false);
  }, [route]);

  // The panel repeats the same entries. Only the bar copy carries the
  // data-edit-* attributes, so the Overlay CMS sees one target per key rather
  // than two nodes fighting over the same one.
  const links = (variant: 'bar' | 'panel') => {
    const edit = variant === 'bar';
    return (
      <>
        {/* About is its own page now; the rest are sections of the home page, so
            off / they need the path in front of the hash. */}
        <a
          href="/about"
          className={route === '/about' ? 'active' : ''}
          {...(edit ? { 'data-edit-id': 'nav.links.about', 'data-edit-key': 'nav.about' } : {})}
        >
          {t('nav.about')}
        </a>
        <a
          href={sectionHref(route, 'diadromi')}
          {...(edit ? { 'data-edit-id': 'nav.links.journey', 'data-edit-key': 'nav.journey' } : {})}
        >
          {t('nav.journey')}
        </a>
        {/* Its own page, like About: 119 named reviews is a destination, not a
            section to scroll past. */}
        <a
          href="/reviews"
          className={route === '/reviews' ? 'active' : ''}
          {...(edit ? { 'data-edit-id': 'nav.links.reviews', 'data-edit-key': 'nav.reviews' } : {})}
        >
          {t('nav.reviews')}
        </a>
        {/* Programs is a dropdown rather than an anchor: the section has two
            audience bands and five destinations, and the nav can offer them
            directly instead of dropping you at the top to scan. */}
        <ProgramsMenu route={route} open={programsOpen} setOpen={setProgramsOpen} variant={variant} />
        {/* Contact moved out of the right-hand pill and in here. It is the
            weakest thing a cold visitor can be offered (audit F4), so it reads
            as one destination among several rather than the page's main ask. */}
        <a
          href={sectionHref(route, 'epikoinonia')}
          {...(edit ? { 'data-edit-id': 'nav.links.contact', 'data-edit-key': 'nav.contact' } : {})}
        >
          {t('nav.contact')}
        </a>
      </>
    );
  };

  return (
    <nav className={'nav js-nav' + (scrolled || open ? ' scrolled' : '')} data-edit-section="nav">
      <div className="nav-inner">
        <a className="nav-logo display-font" href="/" data-edit-id="nav.brand.name" data-edit-key="nav.name">{t('nav.name')}</a>
        <div className="nav-links">{links('bar')}</div>
        <div className="nav-right">
          {/* Greek is paused, not removed: flip SITE.showLangToggle to bring it back. */}
          {SITE.showLangToggle ? (
            <div className="lang-toggle" role="group" aria-label="Language">
              <button type="button" className={lang === 'el' ? 'active' : ''} onClick={() => i18n.changeLanguage('el')} data-edit-id="nav.lang.el">EL</button>
              <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => i18n.changeLanguage('en')} data-edit-id="nav.lang.en">EN</button>
            </div>
          ) : null}
          {/* Audit F15/F25: the free webinar is the front-end offer and the
              default action for anyone not ready to buy, so it owns the nav's
              one pill. "Free training" says what it is; a Programs dropdown
              entry does not. */}
          <a
            className="btn btn-primary btn-sm nav-cta"
            href={SITE.webinarUrl}
            onClick={() => trackCtaClick('powerup_nav')}
            data-edit-id="nav.cta.webinar"
            data-edit-key="nav.freeTraining"
          >
            {t('nav.freeTraining')}
          </a>
          <button
            type="button"
            className={'nav-toggle' + (open ? ' open' : '')}
            aria-expanded={open}
            aria-controls="nav-panel"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* `hidden` rather than a slide-down: it keeps the panel out of the tab
          order and the accessibility tree while closed, which a height
          transition would need extra work to match. */}
      <div className="nav-panel" id="nav-panel" hidden={!open}>
        {/* Every link either navigates or scrolls away, so the panel closes
            behind any tap inside it. The dropdown trigger stops its own click
            here, since expanding is not leaving. */}
        <div
          className="nav-panel-inner"
          onClick={() => {
            setOpen(false);
            setProgramsOpen(false);
          }}
        >
          {links('panel')}
          <a className="btn btn-primary nav-panel-cta" href={SITE.webinarUrl} onClick={() => trackCtaClick('powerup_nav')}>
            {t('nav.freeTraining')}
          </a>
        </div>
      </div>
    </nav>
  );
}
