// Página de pergamino (artículo)
import { useEffect, useState } from "react";
import type { Article } from "@/data/types";
import { ARTICLES } from "@/data/articles";
import { articleWords } from "@/data/wordcount";
import { BlockView } from "@/components/ArticleBlocks";
import { BrushTitle, CloudDivider, Link, Seal } from "@/components/ui";

function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? window.scrollY / max : 0);
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden="true">
      <div className="h-full origin-left bg-gradient-to-r from-jade via-jade-soft to-gold" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

export default function ArticlePage({ article }: { article: Article }) {
  const idx = ARTICLES.findIndex((a) => a.slug === article.slug);
  const prev = ARTICLES[idx + 1];
  const next = ARTICLES[idx - 1];

  useEffect(() => {
    document.title = `${article.title} · ${article.zh} — 墨玥 MoYue`;
  }, [article]);

  const words = articleWords(article);

  return (
    <article>
      <ReadingProgress />
      {/* Hero con overlay de tinta */}
      <header className="relative flex min-h-[78vh] items-end overflow-hidden">
        <img src={article.hero.src} alt={article.hero.alt} className="ink-img absolute inset-0 h-full w-full object-cover" fetchPriority="high" width={1200} height={627} />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/70 to-[var(--bg)]/20" aria-hidden="true" />
        <svg className="absolute inset-0 h-full w-full mix-blend-multiply opacity-70" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <filter id="ink-blot">
              <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="3" />
              <feDisplacementMap in="SourceGraphic" scale="9" />
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
          </defs>
          <ellipse cx="12" cy="18" rx="22" ry="16" fill="#0b0d0c" filter="url(#ink-blot)" opacity=".55" />
          <ellipse cx="92" cy="70" rx="16" ry="22" fill="#0b0d0c" filter="url(#ink-blot)" opacity=".4" />
        </svg>
        <div aria-hidden="true" className="vertical absolute right-6 top-28 hidden font-brush text-6xl text-[var(--fg)]/80 md:block">
          {article.zh}
        </div>
        <div className="relative mx-auto w-full max-w-5xl px-6 pb-16 pt-40">
          <p className="mb-4 font-cn text-sm tracking-[0.4em] text-gold">
            卷 · PERGAMINO · <span className="tracking-normal text-smoke">{article.zhMeaning}</span>
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[1.02] sm:text-7xl">
            <BrushTitle text={article.title} />
          </h1>
          <p className="mt-6 max-w-2xl font-display text-2xl italic text-[var(--fg-soft)]">{article.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-smoke">
            <span className="flex items-center gap-2">
              <Seal text="玥" size={26} /> Lin Yue 林玥
            </span>
            <time dateTime={article.date}>{new Date(article.date + "T00:00:00").toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}</time>
            <span>{article.readMin} min de lectura</span>
            <span>≈ {words.toLocaleString("es")} palabras</span>
          </div>
          <p className="mt-3 text-xs text-smoke">
            Imagen:{" "}
            <a className="underline decoration-dotted" href={article.hero.creditUrl} target="_blank" rel="noopener noreferrer">
              {article.hero.credit} / Pexels
            </a>
          </p>
        </div>
      </header>

      {/* Cuerpo del pergamino */}
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[80px_1fr_80px]">
        <aside aria-hidden="true" className="hidden lg:block">
          <div className="sticky top-32 flex flex-col items-center gap-6 text-smoke">
            <span className="vertical font-cn text-sm text-gold/70">墨落月升 · 林玥书</span>
            <span className="h-24 w-px bg-gradient-to-b from-jade/50 to-transparent" />
          </div>
        </aside>
        <div className="scroll-prose mx-auto w-full max-w-3xl">
          {article.blocks.map((b, i) => (
            <BlockView key={i} b={b} />
          ))}

          {/* Firma con sello caligráfico */}
          <CloudDivider label="终 · fin" />
          <footer className="flex flex-col items-center gap-4 py-6 text-center">
            <p className="font-display text-lg italic text-[var(--fg-soft)]">Escrito con tinta y luna por</p>
            <div className="flex items-center gap-6">
              <span className="font-brush text-5xl">林玥</span>
              <Seal text="林玥" size={84} className="stamp-in" />
            </div>
            <p className="text-sm text-smoke">Lin Yue · <span className="font-cn">墨落月升</span> (cae la tinta, sube la luna)</p>
          </footer>
        </div>
        <div className="hidden lg:block" />
      </div>

      {/* Navegación entre pergaminos */}
      <nav className="mx-auto mt-16 grid max-w-5xl gap-4 px-6 sm:grid-cols-2" aria-label="Otros pergaminos">
        {prev ? (
          <Link to={`/blog/${prev.slug}`} className="group rounded-2xl jade-border bg-[var(--card)] p-6 transition hover:-translate-y-1">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">← Anterior</span>
            <p className="mt-1 font-display text-2xl group-hover:text-jade">{prev.title}</p>
            <p className="font-cn text-jade/70">{prev.zh}</p>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/blog/${next.slug}`} className="group rounded-2xl jade-border bg-[var(--card)] p-6 text-right transition hover:-translate-y-1">
            <span className="text-xs uppercase tracking-[0.3em] text-gold">Siguiente →</span>
            <p className="mt-1 font-display text-2xl group-hover:text-jade">{next.title}</p>
            <p className="font-cn text-jade/70">{next.zh}</p>
          </Link>
        )}
      </nav>
    </article>
  );
}
