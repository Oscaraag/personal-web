/* ============================================================
   ES / EN language toggle (persistent in localStorage).
   Swaps innerHTML of every [data-es] element using the shared token
   renderer so server and client markup match. Ported from the prototype.
   ============================================================ */
import { renderTokens } from '../lib/tokens';

const STORE = 'oag-lang';

function applyLang(lang: string): void {
  document.documentElement.lang = lang;

  document.querySelectorAll<HTMLElement>('[data-es]').forEach((el) => {
    const val = el.getAttribute(`data-${lang}`);
    if (val !== null) el.innerHTML = renderTokens(val);
  });

  document.querySelectorAll<HTMLElement>('[data-es-aria]').forEach((el) => {
    const v = el.getAttribute(`data-${lang}-aria`);
    if (v) el.setAttribute('aria-label', v);
  });

  document.querySelectorAll<HTMLElement>('.lang-toggle button').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-lang') === lang);
  });

  localStorage.setItem(STORE, lang);
}

document.querySelectorAll<HTMLElement>('.lang-toggle button').forEach((b) => {
  b.addEventListener('click', () => applyLang(b.getAttribute('data-lang') as string));
});

applyLang(localStorage.getItem(STORE) ?? 'es');
