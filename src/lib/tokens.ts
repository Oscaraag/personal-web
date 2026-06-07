/**
 * Inline markup tokens used inside the bilingual `data-es` / `data-en` strings.
 * Shared between server render (T.astro) and the client i18n toggle (i18n.ts)
 * so the markup is identical before and after hydration.
 *
 *   |b| ... |/b|  ->  <b> ... </b>
 *   |g| ... |/g|  ->  <span class="glow"> ... </span>
 *   |d| ... |/d|  ->  <span class='dot'> ... </span>
 */
export function renderTokens(value: string): string {
  return value
    .replace(/\|b\|/g, '<b>')
    .replace(/\|\/b\|/g, '</b>')
    .replace(/\|g\|/g, '<span class="glow">')
    .replace(/\|\/g\|/g, '</span>')
    .replace(/\|d\|/g, "<span class='dot'>")
    .replace(/\|\/d\|/g, '</span>');
}
