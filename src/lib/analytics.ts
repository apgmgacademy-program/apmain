// The only custom dataLayer push this site makes (HANDOFF Part 6).
//
// Scope rule for the brand routes (/, /about, /reviews): pageviews and simple
// clicks only. No generate_lead, no sign_up, no purchase, no conversion event of
// any kind may originate here - conversion tracking and attribution belong
// exclusively to the programme pages and their own funnels. If you are adding a
// second event to this file, re-read Part 6 first.
declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

// GTM defines window.dataLayer, but the container is gated to the production
// hostname (see index.html), so on localhost the array simply does not exist and
// the push is skipped rather than throwing.
export function trackCtaClick(cta: string): void {
  if (typeof window === 'undefined' || !window.dataLayer) return;
  window.dataLayer.push({ event: 'cta_click', cta });
}
