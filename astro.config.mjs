// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// NOTE: React is installed and ready (deps + `src/islands/`). The integration is
// intentionally left out while the base portfolio ships zero framework JS. To add
// the first interactive island (e.g. /arcade), `pnpm add` is already done — just
// re-enable it here:  import react from '@astrojs/react';  integrations: [react(), sitemap()]

// TODO: replace with the final custom domain once available.
// Used for canonical URLs, sitemap and Open Graph absolute URLs.
const SITE = 'https://oscarangel.netlify.app';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [sitemap()],
  // `prefetch` is omitted on purpose: the one-page base has no internal page
  // navigation (only hash anchors), so it would just ship idle JS. Re-enable it
  // when /arcade, /escape, … land:  prefetch: { defaultStrategy: 'hover', prefetchAll: true }
  // Native Astro 6 Fonts API: self-hosted woff2, subset to `latin`,
  // only the weights actually used, with automatic fallback metrics.
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Orbitron',
      cssVariable: '--font-display',
      // Only the weights actually used by the design (brand/titles/H1).
      weights: [700, 800, 900],
      styles: ['normal'],
      subsets: ['latin'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Space Mono',
      cssVariable: '--font-mono',
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['latin'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Montserrat',
      cssVariable: '--font-body',
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
    },
  ],
});
