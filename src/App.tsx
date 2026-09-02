import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { SITE } from './config';
import { useRoute, useRouteScroll, type Route } from './router';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Journey from './components/Journey';
import Path from './components/Path';
import Programs from './components/Programs';
import Testimonials from './components/Testimonials';
import Faq from './components/Faq';
import Story from './components/Story';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { useScrollMotion } from './hooks/useScrollMotion';

// `route` is only passed by the prerender (src/entry-server.tsx), which knows
// which file it is writing and has no window to read a pathname from. In the
// browser it is absent and useRoute reads location as before, arriving at the
// same value the server rendered.
export default function App({ route: ssrRoute }: { route?: Route } = {}) {
  const route = useRoute(ssrRoute);
  useRouteScroll(route);
  // The route is a dependency: every ScrollTrigger on the page is measured
  // against DOM that a navigation replaces wholesale.
  useScrollMotion(route);
  const { i18n } = useTranslation();

  const rootVars = {
    '--aurora-opacity': SITE.auroraOpacity,
    '--grain-opacity': SITE.grainOpacity,
    '--marquee-duration': `${SITE.marqueeDurationS}s`,
  } as CSSProperties;

  return (
    <div data-lang={i18n.language} data-edit-source={`src/i18n/${i18n.language}.json`} style={rootVars}>
      <Nav route={route} />
      {route === '/about' ? (
        <main>
          <Story />
        </main>
      ) : route === '/reviews' ? (
        <main>
          <Reviews />
        </main>
      ) : (
        <>
          <Hero />
          <main>
            <About />
            <Journey />
            {/* The ladder sits directly above Programs so the shape of the
                offer is read before the individual cards (HANDOFF 5.5). */}
            <Path />
            <Programs />
            <Testimonials />
            <Faq />
            <Contact />
          </main>
        </>
      )}
      <Footer route={route} />
    </div>
  );
}
