import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { headHtml } from './src/seo';

// index.html carries an <!--app-head--> marker that scripts/prerender.mjs fills
// per route at build time. The dev server never runs the prerender, so without
// this the marker would sit there and `vite dev` would have no title, no
// description and no schema to eyeball. Serve-only: in a build the marker must
// survive untouched for the prerender to find it.
const devHead = () => ({
  name: 'dev-head',
  apply: 'serve' as const,
  transformIndexHtml: (html: string) => html.replace('<!--app-head-->', headHtml('/')),
});

export default defineConfig({
  plugins: [react(), devHead()],
  build: {
    // The prerender imports this bundle directly, so it needs to be plain ESM
    // Node can load rather than something wrapped for a browser.
    ssrEmitAssets: false,
  },
});
