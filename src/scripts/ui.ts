/* ============================================================
   UI behaviour: nav scrolled state, mobile menu, scroll-reveal,
   and active-section highlighting. Ported from the design prototype.
   ============================================================ */
export {}; // treat this file as a module so top-level names stay file-scoped

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Nav: scrolled state + mobile menu ---------- */
const nav = document.querySelector<HTMLElement>('.nav');
function navState(): void {
  if (!nav) return;
  if (window.scrollY > 24) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}
navState();
window.addEventListener('scroll', navState, { passive: true });

const burger = document.querySelector('.nav-burger');
if (burger && nav) {
  burger.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('.nav-links a').forEach((a) => {
    a.addEventListener('click', () => nav.classList.remove('open'));
  });
}

/* ---------- Scroll reveal ---------- */
const reveals = document.querySelectorAll<HTMLElement>('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
  );
  reveals.forEach((r) => io.observe(r));
} else {
  reveals.forEach((r) => r.classList.add('in'));
}

/* ---------- Active section in nav ---------- */
const navLinks = Array.from(
  document.querySelectorAll<HTMLAnchorElement>('.nav-links a[href^="#"]'),
);
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href') as string));
if ('IntersectionObserver' in window) {
  const so = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const id = `#${en.target.id}`;
          navLinks.forEach((a) => {
            a.style.color = a.getAttribute('href') === id ? 'var(--cyan)' : '';
          });
        }
      });
    },
    { threshold: 0.4 },
  );
  sections.forEach((s) => {
    if (s) so.observe(s);
  });
}
