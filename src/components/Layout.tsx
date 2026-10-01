// Estructura común: header tipo pergamino, footer con firma caligráfica, transición de tinta,
// easter egg del sello gigante y control de sonido ambiente.
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { ambient } from "@/lib/audio";
import { Link, Seal, XiangYun } from "./ui";
import { cn } from "@/utils/cn";

const NAV = [
  { to: "/", label: "Inicio", zh: "首页" },
  { to: "/blog/cuatro-inventos", label: "Inventos", zh: "发明" },
  { to: "/blog/personajes", label: "Personajes", zh: "人物" },
  { to: "/blog/ruta-seda-digital", label: "Ruta de la Seda", zh: "丝路" },
  { to: "/blog/china-moderna", label: "China moderna", zh: "当代" },
  { to: "/blog/empresas", label: "Empresas", zh: "企业" },
  { to: "/about", label: "Lin Yue", zh: "作者" },
  { to: "/contact", label: "Carta", zh: "书信" },
];

/* ---------- Sello gigante (triple-click en el logo) ---------- */
function GiantSeal({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 2600);
    return () => window.clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/30 backdrop-blur-[2px]" onClick={onDone} role="dialog" aria-label="Sello de Lin Yue 林玥 estampado">
      <div className="stamp-in">
        <Seal text="林玥" size={Math.min(window.innerWidth * 0.55, 320)} />
      </div>
      {/* Salpicaduras de tinta roja del impacto */}
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute rounded-full bg-seal/70"
          style={{
            width: 6 + (i % 4) * 5,
            height: 6 + (i % 4) * 5,
            left: `calc(50% + ${Math.cos(i * 0.9) * (180 + i * 9)}px)`,
            top: `calc(50% + ${Math.sin(i * 0.9) * (160 + i * 7)}px)`,
            opacity: 0,
            animation: `fade-up .4s ${0.3 + i * 0.015}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

function Header({ onStamp }: { onStamp: () => void }) {
  const { path, theme, toggleTheme, muted, setMuted } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => setOpen(false), [path]);

  // Easter egg: triple-click en el logo → sello gigante 林玥
  const onLogo = (e: MouseEvent) => {
    if (e.detail === 3) {
      e.preventDefault();
      ambient.stamp();
      onStamp();
    }
  };

  const toggleSound = async () => {
    if (muted) {
      await ambient.start();
      setMuted(false);
    } else {
      ambient.stop();
      setMuted(true);
    }
  };

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled ? "py-2" : "py-4")}>
      <div className={cn("mx-auto flex max-w-7xl items-center gap-4 rounded-full px-4 transition-all duration-500 sm:px-6", scrolled && "mx-3 border border-[var(--line)] bg-[var(--card)] py-1.5 shadow-[0_10px_40px_-20px_rgba(0,0,0,.6)] backdrop-blur-xl lg:mx-auto")}>
        <div onClick={onLogo} className="flex shrink-0 items-center gap-3" title="Triple-click: 印">
          <Link to="/" className="group flex items-center gap-2.5" ariaLabel="墨玥 MoYue — inicio">
            <span className="font-brush text-3xl leading-none text-[var(--fg)] transition-colors group-hover:text-jade">墨玥</span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-lg font-semibold tracking-[0.2em]">MOYUE</span>
              <span className="text-[0.65rem] tracking-[0.18em] text-smoke">por Lin Yue 林玥</span>
            </span>
          </Link>
        </div>

        <nav aria-label="Navegación principal" className="ml-auto hidden xl:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => {
              const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
              return (
                <li key={n.to}>
                  <Link to={n.to} className={cn("group relative block rounded-full px-3 py-1.5 font-display text-[1.02rem] transition-colors hover:text-jade", active ? "text-jade" : "text-[var(--fg-soft)]")}>
                    {n.label}
                    <span aria-hidden="true" className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 font-cn text-[0.6rem] tracking-widest text-gold opacity-0 transition-opacity group-hover:opacity-100">
                      {n.zh}
                    </span>
                    {active && <span aria-hidden="true" className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-jade to-transparent" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-2">
          <button onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? "Activar ambiente sonoro de guzheng" : "Silenciar ambiente sonoro"} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] text-[var(--fg-soft)] transition hover:border-jade hover:text-jade">
            {muted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M17 9l5 6M22 9l-5 6" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" /></svg>
            )}
          </button>
          <button onClick={toggleTheme} aria-label={theme === "dark" ? "Cambiar a modo pergamino (claro)" : "Cambiar a modo noche (oscuro)"} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] font-cn text-sm text-[var(--fg-soft)] transition hover:border-jade hover:text-jade">
            <span aria-hidden="true">{theme === "dark" ? "月" : "日"}</span>
          </button>
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="menu-movil" aria-label="Abrir menú" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] xl:hidden">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h10" />}</svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-movil" aria-label="Menú móvil" className="fade-up mx-3 mt-2 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 backdrop-blur-xl xl:hidden">
          <ul className="grid grid-cols-2 gap-2">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="flex items-baseline justify-between rounded-lg px-3 py-2 font-display text-lg hover:bg-jade/10">
                  {n.label} <span className="font-cn text-xs text-gold">{n.zh}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative z-[2] mt-32 border-t border-[var(--line)] bg-[var(--bg-2)]/60">
      <div className="seigaiha absolute inset-x-0 top-0 h-16" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-5">
            <p className="font-brush text-5xl leading-none">林玥</p>
            <Seal text="林玥" size={58} style={{ transform: "rotate(-5deg)" }} />
          </div>
          <p className="mt-3 font-display text-xl italic">Lin Yue · alias artístico</p>
          <p className="mt-1 text-sm text-smoke">
            <span className="font-cn">墨落月升</span> — «cae la tinta, sube la luna»
          </p>
          <p className="mt-6 max-w-sm text-[var(--fg-soft)]">Un pergamino digital sobre cómo un pueblo convirtió la corteza en papel, el imán en rumbo y el silicio en pensamiento.</p>
        </div>
        <nav aria-label="Pergaminos">
          <p className="mb-4 font-display text-sm uppercase tracking-[0.3em] text-gold">Pergaminos · 卷</p>
          <ul className="space-y-2">
            {NAV.slice(1, 6).map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="text-jade-soft transition hover:text-jade">
                  {n.label} <span className="font-cn text-xs text-smoke">{n.zh}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="mb-4 font-display text-sm uppercase tracking-[0.3em] text-gold">Estudio · 书房</p>
          <ul className="space-y-2">
            <li><Link to="/about" className="text-jade-soft hover:text-jade">Sobre Lin Yue</Link></li>
            <li><Link to="/contact" className="text-jade-soft hover:text-jade">Escribir una carta</Link></li>
            <li><a href="/rss.xml" className="text-jade-soft hover:text-jade">RSS</a></li>
            <li><a href="/sitemap.xml" className="text-jade-soft hover:text-jade">Mapa del sitio</a></li>
          </ul>
          <XiangYun className="cloud-drift mt-8 h-10 w-32 text-jade/40" />
        </div>
      </div>
      <div className="border-t border-[var(--line)]/60 py-6 text-center text-sm text-smoke">
        © {new Date().getFullYear()} 墨玥 MoYue · Lin Yue 林玥 · <span className="italic">Crafted in ink by MoYue</span>
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { wiping, wipeOrigin, muted, reduced } = useApp();
  const [stamp, setStamp] = useState(false);

  // El ambiente sonoro reacciona al scroll (filtro)
  useEffect(() => {
    if (muted) return;
    const fn = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ambient.setScroll(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [muted]);

  return (
    <div className="rice-paper relative min-h-screen">
      <a href="#contenido" className="sr-only z-[200] rounded bg-jade px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Saltar al contenido
      </a>
      <Header onStamp={() => setStamp(true)} />
      <main id="contenido" className="relative z-[2]">{children}</main>
      <Footer />

      {/* Transición ink-wipe: mancha de tinta que cubre y revela */}
      {wiping && !reduced && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[110] grid place-items-center bg-ink"
          style={{ ["--wx" as string]: `${wipeOrigin.x}%`, ["--wy" as string]: `${wipeOrigin.y}%`, animation: "ink-in .55s cubic-bezier(.7,0,.3,1) forwards" }}
        >
          <span className="font-brush text-7xl text-jade/70">墨</span>
        </div>
      )}
      {stamp && <GiantSeal onDone={() => setStamp(false)} />}
    </div>
  );
}
