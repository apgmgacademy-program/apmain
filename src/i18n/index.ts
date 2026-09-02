import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import el from './el.json';
import en from './en.json';
import { SITE } from '../config';

const saved = (() => {
  try {
    return localStorage.getItem('ap-lang');
  } catch {
    return null;
  }
})();

// With the toggle hidden, a stored 'el' would strand a returning visitor in a
// language they have no way to switch out of, so the saved value is ignored.
const initialLang = SITE.showLangToggle ? saved || 'en' : 'en';

i18n.use(initReactI18next).init({
  resources: {
    el: { translation: el },
    en: { translation: en },
  },
  lng: initialLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// The prerender (scripts/prerender.mjs) imports this module in Node, where
// there is no document: the per-route <title> is written into the HTML template
// there instead, so on the server this is simply a no-op.
function syncDocument(lng: string) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lng;
  // Only the fallback title is owned here. Prerendered routes ship their own
  // <title> (src/seo.ts) and must keep it, so EN never overwrites it; a switch
  // to Greek still relabels the tab.
  if (lng === 'el') document.title = 'Απόλλων Παπάς';
  try {
    localStorage.setItem('ap-lang', lng);
  } catch {
    // private mode etc - non-fatal
  }
}

syncDocument(i18n.language);
i18n.on('languageChanged', syncDocument);

export default i18n;
