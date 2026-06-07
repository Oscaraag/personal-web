# Oscar Angel Gonzalez — Web personal

Portafolio personal **"Deep Space 80s"**: espacial + retro 80s synthwave. Construido con
**Astro 6** (estático), pensado para cargar ultrarrápido, con SEO sólido y listo para escalar
hacia features interactivas (juego arcade, escape-room con código) mediante islas React.

## Stack

- **Astro 6** (output estático) — el portafolio base se sirve como HTML puro, **0 KB de JS de framework**.
- **Fonts API nativa** de Astro — fuentes self-hosted en woff2 subseteado (Orbitron, Space Mono, Montserrat).
- **TypeScript** (strict) para los scripts de comportamiento.
- **@astrojs/sitemap** para `sitemap-index.xml`.
- **React 19 + @astrojs/react** instalados y listos para islas (integración desactivada hasta que se use; ver más abajo).

## Comandos

| Comando | Acción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Build de producción en `dist/` |
| `pnpm preview` | Sirve el build localmente |
| `pnpm check` | Type-check (`astro check`) |
| `node scripts/gen-og.mjs` | Regenera `public/og-image.png` (1200×630) |

## Estructura

```
src/
  layouts/BaseLayout.astro   # <head>, SEO (OG/Twitter/canonical/JSON-LD), fuentes, fondo, anti-flash i18n
  components/                # Secciones .astro (Nav, Hero, About, Experience, Stack, Streams, Contact, Cosmos)
  components/T.astro         # Nodo de texto bilingüe (data-es/data-en + render de tokens)
  islands/                   # (futuro) componentes React .tsx interactivos
  pages/index.astro          # One-page: compone las secciones
  scripts/                   # parallax.ts · ui.ts · i18n.ts (vanilla, inlineados por Astro)
  data/                      # site.ts · experience.ts · stack.ts (contenido bilingüe)
  lib/tokens.ts              # tokens |b| |g| |d| compartidos entre SSR y el toggle i18n
  styles/global.css          # estilos del diseño (sin cambios visuales)
public/                      # CV.pdf · robots.txt · og-image.png
```

## i18n (ES / EN)

El contenido lleva atributos `data-es` / `data-en`; `src/scripts/i18n.ts` intercambia el texto en
runtime y persiste el idioma en `localStorage`. El idioma por defecto es **ES** (lo que indexan los
buscadores). Un script anti-flash en `<head>` fija `<html lang>` antes del primer pintado.

## Escalar a features interactivas (arcade, escape-room)

1. Reactivar React en `astro.config.mjs`:
   ```js
   import react from '@astrojs/react';
   // integrations: [react(), sitemap()]
   ```
   (Opcional) reactivar `prefetch` para navegación entre rutas.
2. Crear la isla en `src/islands/MiFeature.tsx`.
3. Crear la ruta `src/pages/mi-feature/index.astro`, reutilizar `BaseLayout` y montar la isla con
   `client:load` (interacción inmediata) o `client:visible`.

Solo esas páginas cargarán JS de React; el portafolio base sigue en 0 KB de framework.

## Despliegue

Sitio estático en **Netlify** (`netlify.toml`: `pnpm build` → `dist/`). Dominio de producción:
**https://oangel.dev** (configurado en `astro.config.mjs` y `public/robots.txt`).

## Pendientes

- **Instagram**: añadir el handle a `src/data/site.ts` (`socials`) y a los iconos sociales.
