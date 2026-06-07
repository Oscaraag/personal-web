/**
 * One-off generator for the Open Graph / Twitter card image.
 * Renders a "Deep Space 80s" SVG to public/og-image.png (1200x630) via sharp.
 * Run with: node scripts/gen-og.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '..', 'public', 'og-image.png');

const W = 1200;
const H = 630;

// A sparse, deterministic star field (no RNG so the card is reproducible).
const stars = [
  [120, 90], [300, 60], [520, 120], [760, 70], [1020, 110], [1130, 50],
  [200, 200], [430, 170], [900, 220], [1080, 260], [60, 320], [350, 470],
  [620, 520], [840, 560], [1010, 470], [1150, 560], [700, 300], [260, 540],
].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 === 0 ? 2 : 1.4}" fill="#ece9ff" opacity="${0.5 + (i % 4) * 0.12}"/>`).join('');

// Horizontal slits across the lower half of the synthwave sun.
const slits = [0, 1, 2, 3, 4]
  .map((i) => `<rect x="900" y="${300 + i * 15}" width="290" height="6" fill="#0a0618"/>`)
  .join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#07040f"/>
      <stop offset="0.55" stop-color="#0a0618"/>
      <stop offset="1" stop-color="#0d0726"/>
    </linearGradient>
    <radialGradient id="nebula" cx="0.82" cy="0.05" r="0.7">
      <stop offset="0" stop-color="#7b61ff" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#7b61ff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffce6b"/>
      <stop offset="0.46" stop-color="#ff5db1"/>
      <stop offset="1" stop-color="#7b61ff"/>
    </linearGradient>
    <linearGradient id="name" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4dd0ff"/>
      <stop offset="0.5" stop-color="#7b61ff"/>
      <stop offset="1" stop-color="#ff5db1"/>
    </linearGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4dd0ff" stop-opacity="0"/>
      <stop offset="0.35" stop-color="#4dd0ff"/>
      <stop offset="0.7" stop-color="#ff5db1"/>
      <stop offset="1" stop-color="#ff5db1" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="sunClip"><circle cx="1045" cy="280" r="138"/></clipPath>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#nebula)"/>
  ${stars}

  <g>
    <circle cx="1045" cy="280" r="138" fill="url(#sun)"/>
    <g clip-path="url(#sunClip)">${slits}</g>
  </g>

  <rect x="0" y="430" width="${W}" height="3" fill="url(#line)" filter="url(#glow)"/>

  <text x="90" y="250" font-family="DejaVu Sans Mono, monospace" font-size="22" letter-spacing="8" fill="#4dd0ff">VENEZUELA · REMOTO</text>
  <text x="86" y="345" font-family="sans-serif" font-weight="bold" font-size="86" letter-spacing="2" fill="#ece9ff">OSCAR ANGEL</text>
  <text x="86" y="433" font-family="sans-serif" font-weight="bold" font-size="86" letter-spacing="2" fill="url(#name)">GONZALEZ</text>
  <text x="90" y="500" font-family="DejaVu Sans Mono, monospace" font-size="27" fill="#b7b1da">Head of Engineering · Distributed systems</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log('Wrote', out);
