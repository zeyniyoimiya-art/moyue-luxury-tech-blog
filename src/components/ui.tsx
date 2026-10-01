// Primitivos visuales de MoYue: sellos, nubes, citas verticales, notas del erudito, galerías y tablas.
import { useEffect, useRef, useState, type ReactNode, type MouseEvent, type CSSProperties } from "react";
import gsap from "gsap";
import { useApp } from "@/lib/store";
import { cn } from "@/utils/cn";

/* ---------- Enlace interno con transición de tinta ---------- */
export function Link({ to, className, children, ariaLabel }: { to: string; className?: string; children: ReactNode; ariaLabel?: string }) {
  const { navigate } = useApp();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    navigate(to, { x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
  };
  return (
    <a href={`#${to}`} onClick={onClick} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}

/* ---------- Sello rojo caligráfico (印章) ---------- */
export function Seal({ text = "林玥", size = 64, className, style }: { text?: string; size?: number; className?: string; style?: CSSProperties }) {
  const chars = Array.from(text);
  // Sellos de 2 caracteres se escriben en columna (tradicional: de arriba abajo)
  return (
    <span
      role="img"
      aria-label={`Sello rojo: ${text} (Lin Yue)`}
      className={cn("seal inline-grid place-items-center rounded-[6px] leading-none select-none", className)}
      style={{ width: size, height: size, fontSize: size * (chars.length > 1 ? 0.36 : 0.62), ...style }}
    >
      <span className="flex flex-col items-center" style={{ gap: size * 0.02 }}>
        {chars.map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </span>
    </span>
  );
}

/* ---------- Filtro SVG de rugosidad para sellos (se monta una vez) ---------- */
export function SvgDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <filter id="seal-rough">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
      </filter>
    </svg>
  );
}

/* ---------- Nube auspiciosa 祥云 (SVG) ---------- */
export function XiangYun({ className, stroke = "currentColor" }: { className?: string; stroke?: string }) {
  return (
    <svg viewBox="0 0 160 60" className={className} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M10 44c0-10 9-16 18-13 2-10 14-15 22-8 5-9 20-9 24 2 9-4 19 3 17 13" />
      <path d="M38 44c-6 0-8-8-2-10 4-1 7 3 5 6" />
      <path d="M70 31c4-5 12-3 12 3 0 4-5 6-8 3" />
      <path d="M8 50h84c10 0 14-8 8-12M100 50h52" />
      <path d="M112 42c0-6 7-10 13-7 3-7 13-7 16 0 6 0 9 5 7 9" />
      <path d="M130 42c-3 0-4-4-1-5 2 0 3 2 2 3" />
    </svg>
  );
}

/* ---------- Separador de sección con nubes animadas ---------- */
export function CloudDivider({ label }: { label?: string }) {
  return (
    <div className="relative my-16 flex items-center justify-center gap-6 text-jade-soft/70" role="separator" aria-label={label ?? "Separador de sección"}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--line)] to-[var(--line)]" />
      <XiangYun className="cloud-drift h-8 w-24" />
      {label && <span className="font-cn text-sm tracking-[0.5em] text-gold/80">{label}</span>}
      <XiangYun className="cloud-drift h-8 w-24 -scale-x-100" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--line)] to-[var(--line)]" />
    </div>
  );
}

/* ---------- Revelado al entrar en viewport ---------- */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn(className, seen ? "fade-up" : "opacity-0")} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------- Título escrito "trazo a trazo" (GSAP, estilo SplitText) ---------- */
export function BrushTitle({ text, className, delay = 0.2 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reduced } = useApp();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const chars = el.querySelectorAll<HTMLElement>(".stroke-char");
    const tl = gsap.to(chars, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.1, stagger: 0.13, ease: "power3.out", delay });
    return () => {
      tl.kill();
    };
  }, [text, reduced, delay]);
  return (
    <span ref={ref} className={className} aria-label={text}>
      {Array.from(text).map((c, i) => (
        <span key={i} aria-hidden="true" className={cn("stroke-char", c === " " && "w-[0.3em]")}>
          {c === " " ? "\u00a0" : c}
        </span>
      ))}
    </span>
  );
}

/* ---------- Pull quote con caracteres verticales 竖排 ---------- */
export function PullQuote({ cn: zh, text, author, translation }: { cn: string; text: string; author: string; translation: string }) {
  return (
    <figure className="cq relative my-14 grid grid-cols-[auto_1fr] items-center gap-6 rounded-2xl border-y border-[var(--line)] px-2 py-10 sm:gap-10 sm:px-8">
      <div aria-hidden="true" className="vertical font-brush text-3xl text-jade sm:text-4xl" style={{ textShadow: "0 0 30px rgba(0,168,107,.35)" }}>
        {zh}
      </div>
      <blockquote className="relative">
        <span aria-hidden="true" className="absolute -left-2 -top-10 font-display text-8xl leading-none text-gold/25">
          “
        </span>
        <p className="font-display text-2xl italic leading-snug sm:text-3xl">{text}</p>
        <figcaption className="mt-4 text-sm tracking-wide text-smoke">
          — {author} · <span className="italic">{zh}: «{translation}»</span>
        </figcaption>
      </blockquote>
    </figure>
  );
}

/* ---------- Nota del Erudito (curiosidad con sello) ---------- */
export function ScholarNote({ title = "Nota del Erudito", children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="relative my-12 overflow-hidden rounded-2xl jade-border bg-[var(--card)] p-6 pl-24 backdrop-blur-sm sm:p-8 sm:pl-28" aria-label={title}>
      <div className="absolute left-5 top-6 sm:left-7">
        <Seal text="学" size={52} style={{ transform: "rotate(-6deg)" }} />
      </div>
      <p className="mb-1 font-display text-sm uppercase tracking-[0.3em] text-gold">
        {title} <span className="font-cn normal-case tracking-normal text-smoke">· 学者笔记 (apunte del erudito)</span>
      </p>
      <div className="text-[1.05rem] leading-relaxed text-[var(--fg)]">{children}</div>
      <div className="seigaiha pointer-events-none absolute -bottom-6 -right-6 h-28 w-48" aria-hidden="true" />
    </aside>
  );
}

/* ---------- Galería tipo pergamino desplegable (scroll horizontal) ---------- */
export interface GalleryItem {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  creditUrl: string;
}
export function ScrollGallery({ items, title }: { items: GalleryItem[]; title?: string }) {
  return (
    <section className="my-14" aria-label={title ?? "Galería"}>
      {title && <h3 className="!mt-0 mb-4 font-display text-xl text-gold">{title}</h3>}
      <div className="relative">
        {/* Rodillos del pergamino */}
        <div aria-hidden="true" className="absolute -left-2 top-0 bottom-6 z-10 w-3 rounded-full bg-gradient-to-b from-[#6b4e1f] via-gold to-[#6b4e1f] shadow-lg" />
        <div aria-hidden="true" className="absolute -right-2 top-0 bottom-6 z-10 w-3 rounded-full bg-gradient-to-b from-[#6b4e1f] via-gold to-[#6b4e1f] shadow-lg" />
        <div className="scroll-gallery flex gap-5 overflow-x-auto rounded-lg border-y border-gold/30 bg-[var(--bg-2)] px-6 py-5 pb-6" tabIndex={0} role="region" aria-label="Galería desplazable horizontalmente">
          {items.map((it) => (
            <figure key={it.src} className="group w-[78%] shrink-0 sm:w-[46%]">
              <div className="overflow-hidden rounded-md jade-border">
                <img src={it.src} alt={it.alt} loading="lazy" decoding="async" width={1200} height={627} className="ink-img aspect-[16/9] w-full object-cover group-hover:scale-105" />
              </div>
              <figcaption className="mt-2 text-sm text-[var(--fg-soft)]">
                {it.caption}{" "}
                <a href={it.creditUrl} target="_blank" rel="noopener noreferrer" className="text-jade-soft underline decoration-dotted underline-offset-2">
                  Foto: {it.credit} / Pexels
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Tabla comparativa con bordes de jade ---------- */
export function JadeTable({ caption, head, rows }: { caption: string; head: string[]; rows: string[][] }) {
  return (
    <div className="cq my-12 overflow-x-auto rounded-xl jade-border bg-[var(--card)]">
      <table className="w-full min-w-[560px] border-collapse text-left text-[0.98rem]">
        <caption className="border-b border-[var(--line)] px-5 py-3 text-left font-display text-lg text-gold">{caption}</caption>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="border-b border-[var(--line)] bg-jade/10 px-5 py-3 font-display text-base font-semibold tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="transition-colors hover:bg-jade/5">
              {r.map((c, j) => (
                <td key={j} className={cn("border-b border-[var(--line)]/50 px-5 py-3 align-top", j === 0 && "font-semibold")}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Figura simple ---------- */
export function InkFigure({ src, alt, caption, credit, creditUrl }: GalleryItem) {
  return (
    <figure className="group my-12">
      <div className="overflow-hidden rounded-xl jade-border">
        <img src={src} alt={alt} loading="lazy" decoding="async" width={1200} height={627} className="ink-img aspect-[16/8] w-full object-cover" />
      </div>
      <figcaption className="mt-3 text-sm text-[var(--fg-soft)]">
        {caption}{" "}
        <a href={creditUrl} target="_blank" rel="noopener noreferrer" className="text-jade-soft underline decoration-dotted underline-offset-2">
          Foto: {credit} / Pexels
        </a>
      </figcaption>
    </figure>
  );
}
