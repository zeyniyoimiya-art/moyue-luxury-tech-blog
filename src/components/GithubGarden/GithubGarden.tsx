// 🌱 Jardín de Contribuciones (GitHub Garden)
// Lee el calendario público de contribuciones de GitHub (vía github-contributions-api.jogruber.de,
// que expone los datos públicos del perfil) con TanStack Query y lo dibuja como un jardín:
//   0 commits  → tierra vacía
//   1-3        → brote de bambú
//   4-7        → bambú alto
//   8+         → flor de ciruelo (梅花) floreciendo
import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useApp } from "@/lib/store";

// Esquema Zod de la respuesta (validación en tiempo de ejecución)
const DaySchema = z.object({ date: z.string(), count: z.number().int().nonnegative(), level: z.number().optional() });
const ResponseSchema = z.object({
  total: z.record(z.string(), z.number()).optional(),
  contributions: z.array(DaySchema),
});
type Day = z.infer<typeof DaySchema>;

async function fetchGarden(username: string): Promise<Day[]> {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`);
  if (!res.ok) throw new Error(`GitHub respondió ${res.status}`);
  const parsed = ResponseSchema.parse(await res.json());
  if (!parsed.contributions.length) throw new Error("Sin datos");
  return parsed.contributions;
}

/** Jardín estático de respaldo (determinista) cuando la API falla */
function fallbackDays(): Day[] {
  const out: Day[] = [];
  const start = new Date();
  start.setDate(start.getDate() - 364);
  let seed = 7;
  for (let i = 0; i < 365; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const r = seed / 233280;
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push({ date: d.toISOString().slice(0, 10), count: r < 0.45 ? 0 : r < 0.75 ? 2 : r < 0.92 ? 5 : 9 });
  }
  return out;
}

const CW = 14; // ancho de celda
const CH = 20; // alto de celda (las plantas crecen hacia arriba)

function Plant({ count, x, y, delay, reduced }: { count: number; x: number; y: number; delay: number; reduced: boolean }) {
  const base = y + CH - 3;
  const cx = x + CW / 2;
  if (count === 0) {
    // Tierra vacía: un pequeño montículo
    return <ellipse cx={cx} cy={base} rx={4} ry={1.4} fill="#5b4a33" opacity={0.45} />;
  }
  if (count <= 3) {
    // Brote de bambú
    return (
      <g className={reduced ? "" : "sway"} style={{ animationDelay: `${delay}ms`, transformBox: "fill-box" }}>
        <ellipse cx={cx} cy={base} rx={4} ry={1.3} fill="#5b4a33" opacity={0.5} />
        <path d={`M${cx} ${base} L${cx} ${base - 7}`} stroke="#7fb8a4" strokeWidth={1.6} strokeLinecap="round" />
        <path d={`M${cx} ${base - 5} q3 -2 5 -1`} stroke="#00a86b" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (count <= 7) {
    // Bambú alto con nudos
    return (
      <g className={reduced ? "" : "sway"} style={{ animationDelay: `${delay}ms`, transformBox: "fill-box" }}>
        <ellipse cx={cx} cy={base} rx={4} ry={1.3} fill="#5b4a33" opacity={0.5} />
        <path d={`M${cx} ${base} L${cx} ${base - 15}`} stroke="#00a86b" strokeWidth={2} strokeLinecap="round" />
        <path d={`M${cx - 1.2} ${base - 5} h2.4 M${cx - 1.2} ${base - 10} h2.4`} stroke="#0b5c3e" strokeWidth={1} />
        <path d={`M${cx} ${base - 12} q-4 -2 -6 0 M${cx} ${base - 8} q4 -3 6 -1`} stroke="#7fb8a4" strokeWidth={1.2} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  // Flor de ciruelo: rama oscura + cinco pétalos
  return (
    <g>
      <ellipse cx={cx} cy={base} rx={4} ry={1.3} fill="#5b4a33" opacity={0.5} />
      <path d={`M${cx} ${base} q-1 -6 1 -10 q1 -3 -1 -6`} stroke="#3a2a1c" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <g style={{ transformOrigin: `${cx}px ${base - 14}px`, animation: reduced ? undefined : `bloom .9s ${delay}ms cubic-bezier(.2,.9,.3,1.3) both` }}>
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={cx + Math.cos((a * Math.PI) / 180) * 2.4} cy={base - 14 + Math.sin((a * Math.PI) / 180) * 2.4} r={1.9} fill="#e8a3b0" />
        ))}
        <circle cx={cx} cy={base - 14} r={1.1} fill="#c9a227" />
      </g>
    </g>
  );
}

export default function GithubGarden({ username: initial = "torvalds" }: { username?: string }) {
  const { theme, reduced } = useApp();
  const [username, setUsername] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [hover, setHover] = useState<{ x: number; y: number; d: Day } | null>(null);

  const q = useQuery({ queryKey: ["garden", username], queryFn: () => fetchGarden(username), retry: 1, staleTime: 1000 * 60 * 30 });
  const failed = q.isError;
  const days = useMemo(() => (q.data ?? (failed ? fallbackDays() : [])), [q.data, failed]);

  // Organizar en semanas (columnas) empezando en domingo
  const weeks = useMemo(() => {
    const cols: (Day | null)[][] = [];
    if (!days.length) return cols;
    const first = new Date(days[0]!.date + "T00:00:00");
    let col: (Day | null)[] = Array.from({ length: first.getDay() }, () => null);
    for (const d of days) {
      col.push(d);
      if (col.length === 7) {
        cols.push(col);
        col = [];
      }
    }
    if (col.length) cols.push(col);
    return cols;
  }, [days]);

  const total = days.reduce((s, d) => s + d.count, 0);
  const blossoms = days.filter((d) => d.count >= 8).length;
  const W = weeks.length * CW + 8;
  const H = 7 * CH + 10;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (draft.trim()) setUsername(draft.trim());
  };

  return (
    <section className="cq relative overflow-hidden rounded-3xl jade-border bg-[var(--card)] p-5 sm:p-8" aria-label={`Jardín de contribuciones de GitHub de ${username}`}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-cn text-sm tracking-[0.4em] text-gold">林玥的花园 · el jardín de Lin Yue</p>
          <h3 className="font-display text-3xl font-semibold">Jardín de contribuciones</h3>
          <p className="mt-1 text-sm text-smoke">
            {q.isLoading ? "Regando el jardín…" : failed ? "El jardín descansa hoy" : `${total.toLocaleString("es")} contribuciones · ${blossoms} ciruelos en flor · @${username}`}
          </p>
        </div>
        <form onSubmit={submit} className="flex items-center gap-2" aria-label="Plantar el jardín de otro usuario de GitHub">
          <label htmlFor="gh-user" className="sr-only">Usuario de GitHub</label>
          <input id="gh-user" value={draft} onChange={(e) => setDraft(e.target.value)} className="w-40 rounded-full border border-[var(--line)] bg-transparent px-4 py-1.5 font-mono text-sm outline-none focus:border-jade" placeholder="usuario" />
          <button className="rounded-full border border-jade/60 px-4 py-1.5 text-sm text-jade transition hover:bg-jade hover:text-ink">Plantar</button>
        </form>
      </div>

      <div className="relative overflow-x-auto pb-2">
        {q.isLoading ? (
          <div className="h-[150px] animate-pulse rounded-xl bg-jade/5" />
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto min-w-[720px] w-full" role="img" aria-label={failed ? "Jardín de muestra: la API de GitHub no respondió" : `Gráfico de ${total} contribuciones en el último año representado como jardín`} onMouseLeave={() => setHover(null)}>
            {/* Línea de tierra por fila */}
            {Array.from({ length: 7 }).map((_, r) => (
              <line key={r} x1={0} x2={W} y1={r * CH + CH - 2} y2={r * CH + CH - 2} stroke="var(--line)" strokeOpacity={0.25} strokeDasharray="1 5" />
            ))}
            {weeks.map((col, wi) =>
              col.map((d, di) =>
                d ? (
                  <g key={d.date} onMouseEnter={() => setHover({ x: wi * CW + 4, y: di * CH, d })} opacity={failed ? 0.55 : 1}>
                    <rect x={wi * CW + 4} y={di * CH} width={CW} height={CH} fill="transparent" />
                    <Plant count={d.count} x={wi * CW + 4} y={di * CH} delay={(wi * 7 + di) * 4} reduced={reduced} />
                  </g>
                ) : null,
              ),
            )}
          </svg>
        )}

        {hover && !failed && (
          <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-gold/40 bg-ink/95 px-3 py-1.5 text-xs text-paper shadow-xl" style={{ left: `${(hover.x / W) * 100}%`, top: `${(hover.y / H) * 100}%` }} role="tooltip">
            <span className="font-semibold text-jade-soft">{hover.d.count} {hover.d.count === 1 ? "contribución" : "contribuciones"}</span>
            <br />
            {new Date(hover.d.date + "T00:00:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        )}

        {failed && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="rounded-2xl border border-gold/30 bg-[var(--bg)]/85 px-6 py-4 text-center backdrop-blur">
              <p className="font-brush text-3xl text-jade">园静</p>
              <p className="font-display text-xl italic">El jardín descansa hoy</p>
              <p className="text-xs text-smoke">La API de GitHub no respondió; se muestra un jardín de muestra.</p>
            </div>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <ul className="mt-4 flex flex-wrap gap-5 text-sm text-[var(--fg-soft)]" aria-label="Leyenda del jardín">
        <li className="flex items-center gap-2"><span className="inline-block h-1.5 w-3 rounded-full bg-[#5b4a33]/60" /> 0 · tierra</li>
        <li className="flex items-center gap-2"><span className="inline-block h-3 w-0.5 bg-jade-soft" /> 1–3 · brote de bambú <span className="font-cn text-xs">竹笋</span></li>
        <li className="flex items-center gap-2"><span className="inline-block h-4 w-1 bg-jade" /> 4–7 · bambú <span className="font-cn text-xs">竹</span></li>
        <li className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-[#e8a3b0]" /> 8+ · ciruelo en flor <span className="font-cn text-xs">梅花</span></li>
      </ul>

      {/* Luciérnagas (sólo en modo noche y con movimiento permitido) */}
      {theme === "dark" && !reduced && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-[#e9f5a0]"
              style={{
                left: `${(i * 53) % 100}%`,
                top: `${20 + ((i * 37) % 70)}%`,
                boxShadow: "0 0 10px 3px rgba(233,245,160,.6)",
                ["--fx" as string]: `${((i % 5) - 2) * 18}px`,
                ["--fy" as string]: `${-10 - (i % 4) * 10}px`,
                animation: `firefly ${5 + (i % 6)}s ${i * 0.4}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
