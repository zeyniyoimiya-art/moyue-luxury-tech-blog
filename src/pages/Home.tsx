// Página de inicio: hero de la luna de jade, últimos pergaminos, China en números y el jardín de Lin Yue.
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { ARTICLES } from "@/data/articles";
import type { Article } from "@/data/types";
import { BrushTitle, CloudDivider, Link, Reveal, Seal, XiangYun } from "@/components/ui";
import { GithubGarden } from "@/components/GithubGarden";

const JadeMoon = lazy(() => import("@/components/JadeMoon"));

/* ---------- Fallback estático (prefers-reduced-motion / sin WebGL) ---------- */
function StaticMoon() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute right-[8%] top-1/2 h-[38vmin] w-[38vmin] -translate-y-1/2 rounded-full max-lg:right-1/2 max-lg:top-[30%] max-lg:translate-x-1/2" style={{ background: "radial-gradient(circle at 35% 30%, #7fb8a4 0%, #00a86b 35%, #00543a 75%, #012a1d 100%)", boxShadow: "0 0 120px 30px rgba(0,168,107,.25), inset -30px -30px 80px rgba(0,0,0,.5)" }} />
    </div>
  );
}

function Hero() {
  const { theme, reduced } = useApp();
  const [gpu, setGpu] = useState(false);
  useEffect(() => setGpu(typeof navigator !== "undefined" && "gpu" in navigator), []);

  const scrollDown = () => document.getElementById("pergaminos")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden" aria-label="Portada: 墨玥 MoYue">
      <div className="absolute inset-0 bg-[var(--bg)]">
        <StaticMoon />
        {!reduced && (
          <Suspense fallback={null}>
            <JadeMoon theme={theme} />
          </Suspense>
        )}
      </div>

      {/* Caracteres 玥 flotando */}
      {!reduced && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="absolute bottom-[-10vh] font-brush text-jade-soft/40" style={{ left: `${(i * 11 + 4) % 96}%`, fontSize: `${1.2 + (i % 4) * 0.7}rem`, animation: `float-char ${16 + (i % 5) * 4}s ${i * 2.3}s linear infinite` }}>
              玥
            </span>
          ))}
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24">
        <div className="max-w-2xl">
          <p className="fade-up mb-6 flex items-center gap-3 font-cn text-sm tracking-[0.5em] text-gold" style={{ animationDelay: "100ms" }}>
            <span className="h-px w-10 bg-gold/60" /> 中国科技史 · historia de la tecnología china
          </p>
          <h1 className="font-display leading-[0.95]">
            <BrushTitle text="墨玥" className="block font-brush text-[clamp(5.5rem,16vw,11rem)] text-[var(--fg)]" delay={0.3} />
            <BrushTitle text="MoYue" className="block text-[clamp(3rem,8vw,5.5rem)] font-semibold tracking-[0.18em]" delay={0.9} />
          </h1>
          <p className="fade-up mt-6 max-w-xl font-display text-2xl italic text-[var(--fg-soft)]" style={{ animationDelay: "1.6s" }}>
            De los Cuatro Grandes Inventos a la era de la inteligencia artificial: un pergamino de dos mil años escrito con tinta y luz de luna.
          </p>
          <div className="fade-up mt-10 flex flex-wrap items-center gap-5" style={{ animationDelay: "1.9s" }}>
            <button onClick={scrollDown} className="jade-glow group relative rounded-full bg-[var(--card)] px-8 py-4 font-display text-xl tracking-wide backdrop-blur transition hover:bg-jade/15">
              Entrar al pergamino <span className="ml-2 inline-block transition-transform group-hover:translate-y-1">↓</span>
            </button>
            <Link to="/about" className="flex items-center gap-3 text-[var(--fg-soft)] transition hover:text-jade">
              <Seal text="林玥" size={40} /> por Lin Yue
            </Link>
          </div>
          <p className="mt-10 font-mono text-[0.7rem] text-smoke/80">{gpu ? "WebGPU detectado · render de shaders con WebGL2 (camino universal)" : "Render: Three.js · WebGL2 shaders"}</p>
        </div>
      </div>

      {/* Tagline vertical 竖排 (decorativo) */}
      <div aria-hidden="true" className="absolute right-5 top-28 z-10 hidden h-[70vh] items-start gap-4 md:flex">
        <span className="vertical font-brush text-4xl text-[var(--fg)]/90">墨落月升</span>
        <span className="vertical-mixed font-display text-base italic tracking-[0.2em] text-[var(--fg-soft)]">Donde la tinta encuentra la luna</span>
      </div>
      <p className="sr-only">Tagline: Donde la tinta encuentra la luna · 墨落月升 (cae la tinta, sube la luna)</p>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-xs tracking-[0.4em] text-smoke" aria-hidden="true">
        <XiangYun className="cloud-drift mx-auto mb-1 h-6 w-20 text-jade/50" />
        DESPLAZA
      </div>
    </section>
  );
}

/* ---------- Tarjeta de pergamino ---------- */
export function ArticleCard({ a, i, big = false }: { a: Article; i: number; big?: boolean }) {
  return (
    <Reveal delay={i * 90} className="h-full">
      <Link to={`/blog/${a.slug}`} className="group unroll relative flex h-full flex-col overflow-hidden rounded-2xl jade-border bg-[var(--card)]">
        <div className="unroll-rod unroll-rod-top h-1.5 bg-gradient-to-r from-[#6b4e1f] via-gold to-[#6b4e1f]" aria-hidden="true" />
        <div className="relative overflow-hidden">
          <img src={a.hero.src} alt={a.hero.alt} loading="lazy" decoding="async" width={1200} height={627} className={`ink-img w-full object-cover group-hover:scale-105 ${big ? "aspect-[16/9]" : "aspect-[16/10]"}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent" aria-hidden="true" />
          <span aria-hidden="true" className="absolute left-4 top-4 font-brush text-5xl text-paper drop-shadow-[0_2px_10px_rgba(0,0,0,.6)]">{a.zh}</span>
        </div>
        {/* Mancha de tinta sutil al pasar el ratón */}
        <div className="unroll-ink pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(0,168,107,.22),transparent_65%)]" aria-hidden="true" />
        <div className="relative flex flex-1 flex-col p-6">
          <p className="font-mono text-xs text-gold">
            {new Date(a.date + "T00:00:00").toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })} · {a.readMin} min
          </p>
          <h3 className="mt-2 font-display text-3xl font-semibold leading-tight transition-colors group-hover:text-jade">{a.title}</h3>
          <p className="mt-1 text-xs text-smoke">{a.zhMeaning}</p>
          <p className="mt-3 flex-1 text-[1rem] leading-relaxed text-[var(--fg-soft)]">{a.excerpt}</p>
          <span className="mt-5 text-sm tracking-wide text-jade">Desenrollar el pergamino →</span>
        </div>
        <Seal text="玥" size={30} className="absolute bottom-5 right-5" style={{ transform: "rotate(-8deg)" }} />
        <div className="unroll-rod unroll-rod-bottom h-1.5 bg-gradient-to-r from-[#6b4e1f] via-gold to-[#6b4e1f]" aria-hidden="true" />
      </Link>
    </Reveal>
  );
}

/* ---------- Contador jade ---------- */
function Counter({ value, decimals = 0, prefix = "", suffix = "", label, zh, source }: { value: number; decimals?: number; prefix?: string; suffix?: string; label: string; zh: string; source: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useApp();
  const [n, setN] = useState(reduced ? value : 0);
  useEffect(() => {
    if (reduced) {
      setN(value);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min((t - t0) / 1800, 1);
        setN(value * (1 - Math.pow(1 - k, 4)));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, reduced]);
  return (
    <div ref={ref} className="group relative overflow-hidden rounded-2xl jade-border bg-[var(--card)] p-6">
      <span aria-hidden="true" className="absolute -right-2 -top-4 font-brush text-7xl text-jade/10 transition-colors group-hover:text-jade/25">{zh}</span>
      <p className="font-display text-5xl font-semibold text-jade tabular-nums" aria-label={`${prefix}${value.toLocaleString("es")}${suffix}`}>
        {prefix}
        {n.toLocaleString("es", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        {suffix}
      </p>
      <p className="mt-2 text-[1rem] leading-snug">{label}</p>
      <p className="mt-2 text-xs text-smoke">{source}</p>
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    document.title = "墨玥 · MoYue — Historia de la tecnología china, de la tinta a la IA";
  }, []);
  const latest = ARTICLES.slice(0, 3);
  const rest = ARTICLES.slice(3);

  return (
    <>
      <Hero />

      <section id="pergaminos" className="relative mx-auto max-w-7xl scroll-mt-24 px-6 pt-28" aria-labelledby="t-ultimos">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-cn text-sm tracking-[0.4em] text-gold">新卷 · últimos pergaminos</p>
            <h2 id="t-ultimos" className="font-display text-5xl font-semibold sm:text-6xl">Publicaciones recientes</h2>
          </div>
          <p className="max-w-md text-[var(--fg-soft)]">Cada pergamino supera las ochocientas palabras, con fuentes, tablas, galerías y una nota del erudito.</p>
        </div>
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((a, i) => (
            <ArticleCard key={a.slug} a={a} i={i} />
          ))}
        </div>
        <div className="mt-7 grid gap-7 md:grid-cols-2">
          {rest.map((a, i) => (
            <ArticleCard key={a.slug} a={a} i={i + 3} big />
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6">
        <CloudDivider label="数 · números" />
      </div>

      <section className="mx-auto max-w-7xl px-6" aria-labelledby="t-numeros">
        <div className="mb-12 text-center">
          <p className="font-cn text-sm tracking-[0.4em] text-gold">数字中国 · China en números</p>
          <h2 id="t-numeros" className="font-display text-5xl font-semibold sm:text-6xl">China en números</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[var(--fg-soft)]">Cifras verificadas en fuentes oficiales y académicas. De la corteza de morera a la cara oculta de la Luna.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Counter value={105} prefix="año " label="Cai Lun presenta al emperador su método para fabricar papel" zh="纸" source="Hou Hanshu · Britannica" />
          <Counter value={4.25} decimals={2} suffix=" M" label="Estaciones base 5G en servicio a finales de 2024" zh="网" source="MIIT (Ministerio de Industria y TI)" />
          <Counter value={45000} prefix="+" suffix=" km" label="Red ferroviaria de alta velocidad, la más extensa del mundo" zh="铁" source="China State Railway Group" />
          <Counter value={93} suffix=" PF" label="Petaflops de Sunway TaihuLight, n.º 1 del TOP500 (2016–2017)" zh="算" source="TOP500.org" />
          <Counter value={600} suffix=" km/h" label="Velocidad de diseño del maglev de CRRC presentado en 2021" zh="速" source="CRRC" />
          <Counter value={1935.3} decimals={1} suffix=" g" label="Muestras traídas de la cara oculta de la Luna por Chang'e 6 (2024)" zh="月" source="CNSA" />
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6">
        <CloudDivider label="园 · jardín" />
      </div>

      <section className="mx-auto max-w-7xl px-6" aria-labelledby="t-jardin">
        <div className="mb-8 grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="font-cn text-sm tracking-[0.4em] text-gold">林玥的花园</p>
            <h2 id="t-jardin" className="font-display text-5xl font-semibold sm:text-6xl">El jardín de Lin Yue</h2>
            <p className="mt-3 max-w-2xl text-[var(--fg-soft)]">Cada día de código es una semilla. Los commits brotan como bambú y, en los días más intensos, florece el ciruelo: la flor que se abre en pleno invierno.</p>
          </div>
        </div>
        <GithubGarden />
      </section>
    </>
  );
}
