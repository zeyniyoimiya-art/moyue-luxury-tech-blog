# 墨玥 · MoYue — `moyue-blog`

> *Donde la tinta encuentra la luna · 墨落月升*
> Historia de la tecnología china: de los Cuatro Grandes Inventos a la era de la IA.
> **Desarrollado por Lin Yue 林玥.**

Blog personal con estética *shuǐmò* (水墨, pintura de tinta) + jade imperial + luna: una luna 3D de jade translúcido con shaders de difusión de tinta, lluvia de tinta, cursor de pincel caligráfico, ambiente sonoro de guzheng, sello rojo 林玥 al final de cada artículo y un **jardín de contribuciones de GitHub** con bambú y flores de ciruelo.

---

## ⚠️ Nota sobre el stack de esta entrega

El entorno de ejecución donde se generó y compiló esta entrega está **fijado a React 19 + Vite 7 + Tailwind CSS v4** (no se permite cambiar `package.json` ni `vite.config.ts`, y el build produce un único `dist/index.html`). Por eso esta versión, que funciona y compila, está hecha en React y **no** en SvelteKit. La arquitectura está separada por capas para poder pasarla a SvelteKit:

| Pieza pedida (SvelteKit) | Implementación en esta entrega | Paso a SvelteKit |
|---|---|---|
| Rutas `+page.svelte` | Router por hash (`src/lib/store.tsx`, `src/App.tsx`) | `src/routes/blog/[slug]/+page.svelte` |
| Svelte stores | React Context (`useApp`) | `writable()` para tema / sonido / movimiento |
| tRPC + Zod | `src/lib/api.ts` (procedimientos tipados + Zod) | `trpc-sveltekit` con el mismo esquema |
| Superforms | `LetterSchema` (Zod) compartido cliente/servidor | `superValidate(zod(LetterSchema))` |
| Threlte | Three.js directo (`JadeMoon.tsx`, `SilkGlobe.tsx`) | `<Canvas>` de Threlte con los mismos shaders |
| Barba.js ink-wipe | Overlay CSS `clip-path` + View Transitions API | `onNavigate` + `document.startViewTransition` |
| GSAP SplitText | GSAP + división de caracteres propia (`BrushTitle`) | Igual |
| Lottie (nubes/flores) | SVG + animaciones CSS (más ligero, sin JSON externo) | `lottie-web` opcional |
| CSS Houdini `paint()` | Patrón seigaiha con gradientes CSS (respaldo universal) | Worklet `paint()` en `static/` |
| enhanced-img | `<img>` con `loading="lazy"`, `decoding`, tamaños fijos (CLS 0) | `@sveltejs/enhanced-img` |
| WebGPU (TypeGPU) | Se detecta `navigator.gpu`; el render usa WebGL2 en todos los navegadores | `three/webgpu` + TypeGPU |

---

## ✨ Funcionalidades

- **Hero**: luna 3D de jade (fresnel, vetas de nefrita, translucidez simulada) + fondo GLSL de **difusión de tinta** que se extiende con el scroll y sigue al puntero + lluvia de tinta en partículas + caracteres 玥 flotando.
- **Título trazo a trazo** (GSAP) y tagline vertical 竖排 (`writing-mode: vertical-rl`, `aria-hidden`).
- **Cursor de pincel**: trazo de tinta que se adelgaza con la velocidad, lupa jade sobre enlaces y sello rojo 印 sobre botones.
- **Easter egg**: triple-click en el logo 墨玥 → sello gigante 林玥 con golpe sonoro.
- **Ambiente sonoro** (Web Audio API): guzheng sintetizado en escala pentatónica + gotas de agua; el filtro reacciona al scroll. Botón mute visible; empieza silenciado.
- **5 pergaminos** con más de 800 palabras cada uno, fuentes enlazadas, tablas con bordes jade, citas verticales, galerías tipo pergamino desplegable y «Nota del Erudito».
- **Globo interactivo** de la Ruta de la Seda: histórica (oro) y digital (jade), con filtro y fichas de ciudades.
- **GithubGarden**: `<GithubGarden username="..." />` con TanStack Query + Zod; 0 = tierra, 1–3 = brote, 4–7 = bambú, 8+ = ciruelo en flor; tooltips; luciérnagas en modo noche; respaldo «El jardín descansa hoy».
- **Carta al erudito**: formulario validado con Zod, campo trampa anti-spam, sello 已阅 al enviar.
- **Modo noche** por defecto y modo pergamino (claro).
- **Accesibilidad**: enlace «saltar al contenido», foco jade visible, ARIA, `prefers-reduced-motion` (sin WebGL, partículas ni cursor; luna estática en CSS).
- **PWA**: `manifest.webmanifest`, `sw.js` (offline, stale-while-revalidate), iconos.
- **SEO**: `robots.txt`, `sitemap.xml`, `rss.xml`, Open Graph.

## 📁 Estructura

```
src/
  App.tsx                 → proveedores + router
  lib/store.tsx           → estado global (tema, sonido, movimiento, navegación ink-wipe)
  lib/audio.ts            → motor Web Audio (guzheng + agua + sello)
  lib/api.ts              → API tipada (contrato tRPC) + LetterSchema (Zod)
  components/
    JadeMoon.tsx          → luna de jade + shaders de tinta + lluvia
    SilkGlobe.tsx         → globo de la Ruta de la Seda
    BrushCursor.tsx       → cursor de pincel
    GithubGarden/         → jardín de contribuciones
    ArticleBlocks.tsx     → renderizador de bloques
    Layout.tsx · ui.tsx   → header, footer, sellos, nubes, citas, tablas, galerías
  data/                   → pergaminos, imágenes con crédito, tipos
  pages/                  → Home, ArticlePage, About, Contact
supabase/                 → migración SQL (RLS) + Edge Function RSS
wasm/                     → crate Rust (wasm-bindgen): niveles del jardín, haversine, CAGR
public/                   → manifest, sw.js, iconos, robots, sitemap, rss
tests/                    → Vitest (unit) + Playwright (13 e2e)
```

## 🚀 Scripts

```bash
npm install
npm run dev        # desarrollo
npm run build      # build de producción → dist/index.html
npm run preview    # previsualizar
# Opcionales (instalar antes vitest / @playwright/test):
npx vitest run
npx playwright test
# WASM:
cd wasm && wasm-pack build --target web --release
```

## 📊 Core Web Vitals (simulados — objetivo de diseño)

| Métrica | Objetivo | Simulado | Estado |
|---|---|---|---|
| LCP | < 2,5 s | 1,4 s | 🟢 |
| INP | < 200 ms | 72 ms | 🟢 |
| FID | < 100 ms | 12 ms | 🟢 |
| CLS | 0 | 0,00 | 🟢 |
| TTFB | < 800 ms | 180 ms (edge) | 🟢 |
| Lighthouse Performance | 100 | 100 | 🟢 |
| Accesibilidad | 100 | 100 | 🟢 |
| Buenas prácticas | 100 | 100 | 🟢 |
| SEO | 100 | 100 | 🟢 |

*Son cifras simuladas, no una medición real. Hay que comprobarlas con Lighthouse / PageSpeed Insights en el despliegue final.*

## 🖼 Créditos de imágenes

Todas las fotografías provienen de **Pexels** (licencia Pexels) y están acreditadas con nombre y enlace junto a cada imagen: Feng Zou, Ever Louie Pogosa, Ylanite Koppens, Yifan Lai, Ec lipse, Sergey Pesterev, Eve R, Ravi Lages, kf zhou, Sheldon Li, Brett Sayles, panumas nikhomkhai, David Yu, molin liu, dh tang, 政 施, Bert Christiaens, Alan Kabeš, Ulrick Trappschuh, CK Seng, Nguyen Khuong, Jakub Zerdzicki, Igor Mashkov, entre otros.

Los retratos de los personajes son **retratos caligráficos simbólicos** (un carácter emblemático dentro de un marco de jade), para no depender de imágenes con derechos dudosos.

## 📚 Fuentes principales

Britannica, British Library, UNESCO, TOP500, MIIT, GSMA, CNSA, informe técnico de DeepSeek-V3 (arXiv 2412.19437), informes anuales de Huawei, Xiaomi, BYD, Tencent y resultados del año fiscal 2025 de Alibaba. Cada pergamino enlaza sus fuentes al final.

---

**Desarrollado por Lin Yue 林玥** · *Crafted in ink by MoYue* · 墨落月升
