// Contacto: "Carta al erudito" con validación Zod (patrón Superforms: esquema único cliente/servidor)
import { useEffect, useState, type FormEvent } from "react";
import { api, LetterSchema, type Letter } from "@/lib/api";
import { ambient } from "@/lib/audio";
import { BrushTitle, Seal } from "@/components/ui";
import { cn } from "@/utils/cn";

type Errors = Partial<Record<keyof Letter, string>>;
const EMPTY = { name: "", email: "", topic: "", message: "", website: "" };

const TOPICS = [
  ["inventos", "Los Cuatro Grandes Inventos · 四大发明"],
  ["personajes", "Personajes clave · 人物"],
  ["ruta", "Ruta de la Seda · 丝路"],
  ["moderna", "China moderna · 当代"],
  ["empresas", "Empresas · 企业"],
  ["otro", "Otro asunto · 其他"],
] as const;

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    document.title = "Carta al erudito · 书信 — 墨玥 MoYue";
  }, []);

  const set = (k: keyof typeof EMPTY, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as keyof Letter]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (): Letter | null => {
    const r = LetterSchema.safeParse(form);
    if (r.success) {
      setErrors({});
      return r.data;
    }
    const errs: Errors = {};
    for (const issue of r.error.issues) {
      const k = issue.path[0] as keyof Letter | undefined;
      if (k && !errs[k]) errs[k] = issue.message;
    }
    setErrors(errs);
    return null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const data = validate();
    if (!data) return;
    setStatus("sending");
    try {
      await api.letters.send(data);
      ambient.stamp();
      setStatus("sent");
      setForm(EMPTY);
    } catch {
      setStatus("error");
    }
  };

  const field = "w-full border-0 border-b border-[var(--line)] bg-transparent px-1 py-2.5 font-display text-xl outline-none transition placeholder:text-smoke/60 focus:border-jade";

  return (
    <div className="mx-auto max-w-4xl px-6 pt-36">
      <p className="font-cn text-sm tracking-[0.4em] text-gold">书信 · correspondencia</p>
      <h1 className="font-display text-6xl font-semibold sm:text-7xl">
        <BrushTitle text="Carta al erudito" />
      </h1>
      <p className="mt-4 max-w-2xl font-display text-2xl italic text-[var(--fg-soft)]">Como los letrados que se escribían de provincia en provincia: sin prisa, con cuidado. Lin Yue lee cada carta.</p>

      <div className="relative mt-12 overflow-hidden rounded-[1.5rem] border border-gold/30 bg-[var(--card)] shadow-[0_40px_80px_-50px_rgba(0,0,0,.8)]">
        <div className="h-3 bg-gradient-to-r from-[#6b4e1f] via-gold to-[#6b4e1f]" aria-hidden="true" />
        {/* Líneas verticales de papel de carta china (信笺) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "repeating-linear-gradient(90deg, #a6192e 0 1px, transparent 1px 56px)" }} />

        {status === "sent" ? (
          <div className="relative grid place-items-center gap-4 px-6 py-24 text-center" role="status" aria-live="polite">
            <div className="stamp-in">
              <Seal text="已阅" size={120} />
            </div>
            <p className="font-display text-3xl">Tu carta ha sido sellada</p>
            <p className="max-w-md text-[var(--fg-soft)]">
              <span className="font-cn">已阅</span> («leído»). Lin Yue la responderá cuando la luna vuelva a estar llena.
            </p>
            <button onClick={() => setStatus("idle")} className="mt-4 rounded-full border border-jade px-6 py-2 text-jade transition hover:bg-jade hover:text-ink">
              Escribir otra carta
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="relative grid gap-8 p-6 sm:p-12" aria-label="Formulario de contacto: carta al erudito">
            <p className="font-display text-2xl italic">Estimada Lin Yue 林玥:</p>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-xs uppercase tracking-[0.25em] text-gold">Remitente · 姓名</label>
                <input id="name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} className={cn(field, errors.name && "border-seal")} placeholder="Tu nombre o seudónimo" aria-invalid={!!errors.name} aria-describedby={errors.name ? "e-name" : undefined} />
                {errors.name && <p id="e-name" className="mt-1 text-sm text-[#e0596c]" role="alert">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="text-xs uppercase tracking-[0.25em] text-gold">Dirección · 邮箱</label>
                <input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={cn(field, errors.email && "border-seal")} placeholder="tu@correo.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "e-email" : undefined} />
                {errors.email && <p id="e-email" className="mt-1 text-sm text-[#e0596c]" role="alert">{errors.email}</p>}
              </div>
            </div>

            <fieldset>
              <legend className="mb-3 text-xs uppercase tracking-[0.25em] text-gold">Sobre qué pergamino · 主题</legend>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map(([v, l]) => (
                  <label key={v} className={cn("cursor-pointer rounded-full border px-4 py-1.5 text-sm transition", form.topic === v ? "border-jade bg-jade/15 text-jade" : "border-[var(--line)] hover:border-jade")}>
                    <input type="radio" name="topic" value={v} checked={form.topic === v} onChange={() => set("topic", v)} className="sr-only" />
                    {l}
                  </label>
                ))}
              </div>
              {errors.topic && <p className="mt-2 text-sm text-[#e0596c]" role="alert">{errors.topic}</p>}
            </fieldset>

            <div>
              <label htmlFor="message" className="text-xs uppercase tracking-[0.25em] text-gold">Carta · 正文</label>
              <textarea id="message" rows={7} value={form.message} onChange={(e) => set("message", e.target.value)} className={cn(field, "resize-y leading-relaxed", errors.message && "border-seal")} placeholder="Escribe con calma, como quien moja el pincel…" aria-invalid={!!errors.message} aria-describedby="m-count" />
              <div className="mt-1 flex justify-between text-sm">
                {errors.message ? <p className="text-[#e0596c]" role="alert">{errors.message}</p> : <span />}
                <span id="m-count" className="font-mono text-xs text-smoke">{form.message.length}/2000</span>
              </div>
            </div>

            {/* Campo trampa anti-spam, invisible para personas */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Sitio web</label>
              <input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6">
              <p className="font-display text-lg italic text-[var(--fg-soft)]">Con respeto, bajo la misma luna.</p>
              <button type="submit" disabled={status === "sending"} className="jade-glow rounded-full bg-jade/10 px-8 py-3.5 font-display text-xl transition hover:bg-jade hover:text-ink disabled:opacity-60">
                {status === "sending" ? "Sellando la carta…" : "Sellar y enviar · 封缄"}
              </button>
            </div>
            {status === "error" && <p className="text-[#e0596c]" role="alert">El correo imperial se ha extraviado. Inténtalo de nuevo.</p>}
            <p className="text-xs text-smoke">Tus datos sólo se usan para responderte. Sin cookies ni rastreadores.</p>
          </form>
        )}
      </div>
    </div>
  );
}
