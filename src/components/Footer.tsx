import { useTranslation } from 'react-i18next';
import { SITE } from '../config';
import { sectionHref, type Route } from '../router';

export default function Footer({ route }: { route: Route }) {
  const { t } = useTranslation();
  // Copyright range ends at the current year so the footer never goes stale.
  const year = new Date().getFullYear();

  return (
    <footer className="footer" data-screen-label="Footer" data-edit-section="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-name display-font" data-edit-id="footer.brand.name" data-edit-key="nav.name">{t('nav.name')}</span>
          <span className="footer-tagline" data-edit-id="footer.brand.tagline" data-edit-key="footer.tagline">{t('footer.tagline')}</span>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          <a href="/about" data-edit-id="footer.nav.about" data-edit-key="nav.about">{t('nav.about')}</a>
          <a href={sectionHref(route, 'diadromi')} data-edit-id="footer.nav.journey" data-edit-key="nav.journey">{t('nav.journey')}</a>
          <a href="/reviews" data-edit-id="footer.nav.reviews" data-edit-key="nav.reviews">{t('nav.reviews')}</a>
          <a href={sectionHref(route, 'programmata')} data-edit-id="footer.nav.programs" data-edit-key="nav.programs">{t('nav.programs')}</a>
          <a href={sectionHref(route, 'epikoinonia')} data-edit-id="footer.nav.contact" data-edit-key="nav.contact">{t('nav.contact')}</a>
        </nav>
        <div className="footer-legal">
          <span className="footer-copy" data-edit-id="footer.legal.copyright" data-edit-key="footer.rights">
            {t('footer.rights', { from: SITE.foundedYear, to: year })}
          </span>
          {/* The Unified Terms v1.0 and the two policies. They are served by the
              6WS build on this same domain (nginx /legal mounts), so these are
              plain links out of this app, not router links. The pages are in
              English only. */}
          <nav className="footer-legal-nav" aria-label={t('footer.legalNav')}>
            <a href="/legal/terms" data-edit-id="footer.legal.terms" data-edit-key="footer.terms">{t('footer.terms')}</a>
            <a href="/legal#privacy" data-edit-id="footer.legal.privacy" data-edit-key="footer.privacy">{t('footer.privacy')}</a>
            <a href="/legal#cookies" data-edit-id="footer.legal.cookies" data-edit-key="footer.cookies">{t('footer.cookies')}</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
