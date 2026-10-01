// Renderizador de bloques de contenido de cada pergamino.
import { Fragment, type ReactNode } from "react";
import type { Block, Company, Person } from "@/data/types";
import { CloudDivider, InkFigure, JadeTable, PullQuote, Reveal, ScholarNote, ScrollGallery, Seal } from "./ui";
import SilkGlobe from "./SilkGlobe";

/** Convierte **negrita** y *cursiva* en elementos */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith("*") && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em> : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}

/* ---------- Retrato caligráfico con marco de jade y sello ---------- */
function Portrait({ p, i }: { p: Person; i: number }) {
  return (
    <Reveal delay={i * 60}>
      <article className="cq group unroll relative h-full overflow-hidden rounded-2xl jade-border bg-[var(--card)] p-6">
        <div className="unroll-ink pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(0,168,107,.18),transparent_70%)]" aria-hidden="true" />
        <div className="flex gap-5">
          {/* Marco de jade con carácter emblemático (retrato simbólico) */}
          <div className="relative shrink-0">
            <div className="grid h-28 w-24 place-items-center rounded-[10px] border-2 border-jade/60 bg-gradient-to-b from-jade/15 to-transparent shadow-[inset_0_0_0_4px_var(--bg),inset_0_0_0_5px_rgba(201,162,39,.5)]">
              <span className="font-brush text-5xl text-[var(--fg)]" aria-hidden="true">{p.glyph}</span>
            </div>
            <Seal text={p.zh.slice(0, 2)} size={34} className="absolute -bottom-2 -right-3" style={{ transform: "rotate(-8deg)" }} />
          </div>
          <div className="min-w-0">
            <h3 className="!m-0 font-display text-2xl font-semibold leading-tight !text-[var(--fg)]">{p.name}</h3>
            <p className="font-cn text-lg text-jade">{p.zh}</p>
            <p className="text-sm text-gold">{p.era}</p>
            <p className="text-sm italic text-smoke">{p.role}</p>
          </div>
        </div>
        <p className="mt-4 !mb-3 text-[1rem] leading-relaxed">{p.bio}</p>
        <ul className="space-y-1 text-[0.95rem]">
          {p.achievements.map((a) => (
            <li key={a} className="flex gap-2">
              <span className="text-jade" aria-hidden="true">◆</span>
              {a}
            </li>
          ))}
        </ul>
        {p.quote && (
          <blockquote className="mt-4 border-l-2 border-gold/60 pl-4">
            <p className="!m-0 font-display text-lg italic">«{p.quote.text}»</p>
            <cite className="text-xs not-italic text-smoke">— {p.quote.source}</cite>
          </blockquote>
        )}
      </article>
    </Reveal>
  );
}

/* ---------- Ficha de empresa ---------- */
function CompanyCard({ c, i }: { c: Company; i: number }) {
  const rows: [string, string][] = [
    ["Fundación", c.founded],
    ["Fundador", c.founder],
    ["Sede", c.hq],
    ["Productos icónicos", c.products],
    ["Impacto global", c.impact],
    ["Datos financieros", c.finance],
    ["Estado actual", c.status],
  ];
  return (
    <Reveal delay={i * 50}>
      <article className="group unroll relative h-full overflow-hidden rounded-2xl jade-border bg-[var(--card)]">
        <div className="unroll-rod unroll-rod-top h-2 bg-gradient-to-r from-[#6b4e1f] via-gold to-[#6b4e1f]" aria-hidden="true" />
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="!m-0 font-display text-3xl font-semibold !text-[var(--fg)]">{c.name}</h3>
              <p className="font-cn text-lg text-jade">{c.zh}</p>
            </div>
            <span className="font-brush text-6xl text-jade/25 transition-colors duration-700 group-hover:text-jade/60" aria-hidden="true">{c.glyph}</span>
          </div>
          <dl className="space-y-2.5 text-[0.95rem]">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-3 border-t border-[var(--line)]/40 pt-2">
                <dt className="text-xs uppercase tracking-[0.15em] text-gold">{k}</dt>
                <dd className="m-0 leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="unroll-rod unroll-rod-bottom h-2 bg-gradient-to-r from-[#6b4e1f] via-gold to-[#6b4e1f]" aria-hidden="true" />
        <Seal text="林玥" size={30} className="absolute bottom-5 right-5 opacity-80" style={{ transform: "rotate(-6deg)" }} />
      </article>
    </Reveal>
  );
}

function Timeline({ items }: { items: { year: string; title: string; text: string }[] }) {
  return (
    <ol className="relative my-12 ml-3 border-l border-jade/40" aria-label="Cronología">
      {items.map((it, i) => (
        <Reveal key={it.year + it.title} delay={i * 60} className="relative mb-8 pl-8">
          <li className="list-none">
            <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-jade bg-[var(--bg)] shadow-[0_0_12px_rgba(0,168,107,.6)]" aria-hidden="true" />
            <p className="!m-0 font-mono text-sm text-gold">{it.year}</p>
            <p className="!m-0 font-display text-xl font-semibold">{it.title}</p>
            <p className="!m-0 text-[var(--fg-soft)]">{it.text}</p>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}

export function BlockView({ b }: { b: Block }): ReactNode {
  switch (b.t) {
    case "p":
      return (
        <p>
          {b.drop && (
            <span className="dropcap-cn" aria-hidden="true">
              {b.drop}
            </span>
          )}
          <Rich text={b.text} />
        </p>
      );
    case "h2":
      return (
        <h2 className="flex items-baseline gap-4">
          <span>{b.text}</span>
          {b.zh && (
            <span className="font-brush text-3xl text-jade/70" aria-hidden="true">
              {b.zh}
            </span>
          )}
        </h2>
      );
    case "h3":
      return <h3>{b.text}</h3>;
    case "quote":
      return <PullQuote cn={b.cn} text={b.text} author={b.author} translation={b.translation} />;
    case "note":
      return (
        <ScholarNote>
          <Rich text={b.text} />
        </ScholarNote>
      );
    case "table":
      return <JadeTable caption={b.caption} head={b.head} rows={b.rows} />;
    case "gallery":
      return <ScrollGallery title={b.title} items={b.items} />;
    case "figure":
      return <InkFigure {...b.item} />;
    case "divider":
      return <CloudDivider label={b.label} />;
    case "portraits":
      return (
        <div className="not-prose my-10 grid gap-6 md:grid-cols-2">
          {b.people.map((p, i) => (
            <Portrait key={p.name} p={p} i={i} />
          ))}
        </div>
      );
    case "companies":
      return (
        <div className="my-10 grid gap-6 lg:grid-cols-2">
          {b.items.map((c, i) => (
            <CompanyCard key={c.name} c={c} i={i} />
          ))}
        </div>
      );
    case "globe":
      return <SilkGlobe />;
    case "timeline":
      return <Timeline items={b.items} />;
    case "sources":
      return (
        <section className="mt-16 rounded-2xl border border-dashed border-[var(--line)] p-6" aria-label="Fuentes consultadas">
          <p className="!mb-3 font-display text-sm uppercase tracking-[0.3em] text-gold">Fuentes · 参考文献</p>
          <ul className="grid gap-1.5 text-[0.95rem] sm:grid-cols-2">
            {b.items.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-jade-soft underline decoration-dotted underline-offset-4 hover:text-jade">
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      );
  }
}
