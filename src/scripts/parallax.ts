/* ============================================================
   Cosmic background: generated star fields + scroll/mouse parallax.
   Ported 1:1 from the design prototype — rates, lerp and transforms
   are intentionally identical. Honours prefers-reduced-motion.
   ============================================================ */
export {}; // treat this file as a module so top-level names stay file-scoped

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface StarSprite {
  el: HTMLDivElement;
  tile: number;
}
interface ParallaxLayer {
  el: HTMLElement;
  rate: number;
}

/* ---------- 1. Build star-field layers ---------- */
function makeStars(count: number, size: number, color: string, alpha: number): StarSprite {
  const w = 2000;
  const h = 2000;
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * w);
    const y = Math.floor(Math.random() * h);
    shadows.push(`${x}px ${y}px ${color}`);
  }
  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = '50%';
  el.style.background = color;
  el.style.boxShadow = shadows.join(',');
  el.style.opacity = String(alpha);
  return { el, tile: h };
}

function buildLayer(
  parent: HTMLElement,
  count: number,
  size: number,
  color: string,
  alpha: number,
  depthClass: string,
): HTMLElement {
  const layer = document.createElement('div');
  layer.className = `stars ${depthClass}`;
  layer.style.height = '2000px';
  const s = makeStars(count, size, color, alpha);
  // duplicate vertically so it tiles when translated
  layer.appendChild(s.el.cloneNode(true));
  const clone = s.el.cloneNode(true) as HTMLDivElement;
  clone.style.transform = 'translateY(2000px)';
  layer.appendChild(clone);
  parent.appendChild(layer);
  return layer;
}

const cosmos = document.querySelector<HTMLElement>('.cosmos');
const layers: ParallaxLayer[] = [];
if (cosmos) {
  layers.push({ el: buildLayer(cosmos, 90, 2, 'rgba(255,255,255,0.9)', 0.9, 'd-far'), rate: 0.12 });
  layers.push({ el: buildLayer(cosmos, 60, 2, 'rgba(180,200,255,0.95)', 0.9, 'd-mid'), rate: 0.26 });
  layers.push({ el: buildLayer(cosmos, 30, 3, 'rgba(255,170,225,1)', 1, 'd-near'), rate: 0.45 });
}

/* ---------- 2. Parallax (scroll + subtle mouse) ---------- */
const sun = document.querySelector<HTMLElement>('.sun');
const horizon = document.querySelector<HTMLElement>('.horizon');
const heroInner = document.querySelector<HTMLElement>('.hero-inner');
let mouseX = 0;
let mouseY = 0;
let curX = 0;
let curY = 0;
let scrollY = window.scrollY;

window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

if (!reduceMotion) {
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  });
}

function raf(): void {
  curX += (mouseX - curX) * 0.06;
  curY += (mouseY - curY) * 0.06;

  for (let i = 0; i < layers.length; i++) {
    const L = layers[i];
    const ty = (-scrollY * L.rate) % 2000;
    const mx = curX * (10 + i * 14);
    const my = curY * (8 + i * 10);
    L.el.style.transform = `translate3d(${mx}px,${ty + my}px,0)`;
  }
  if (sun) {
    sun.style.transform = `translateX(-50%) translateY(${-scrollY * 0.18 + curY * 14}px)`;
  }
  if (horizon) {
    horizon.style.transform =
      `translateX(-50%) perspective(360px) rotateX(74deg) translateY(${scrollY * 0.05}px)`;
  }
  if (heroInner) {
    const op = Math.max(0, 1 - scrollY / (window.innerHeight * 0.7));
    heroInner.style.opacity = String(op);
    heroInner.style.transform = `translateY(${scrollY * 0.12}px)`;
  }
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
