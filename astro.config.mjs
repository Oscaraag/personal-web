// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

// Production domain. Used for canonical URLs, sitemap and Open Graph absolute URLs.
const SITE = 'https://oangel.dev';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  // React powers interactive islands (e.g. the WebGL black-hole hero). The base
  // portfolio uses no islands, so index.html still ships zero framework JS — React
  // only loads on pages that mount an island.
  integrations: [
    react(),
    // `/blackhole` is a hero variant that duplicates the home content — keep it out
    // of the sitemap (it's also noindex) to avoid duplicate-content signals.
    sitemap({ filter: (page) => !page.includes('/blackhole') }),
  ],
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
