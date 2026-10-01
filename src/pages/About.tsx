// Sobre Lin Yue 林玥 (alias artístico)
import { useEffect } from "react";
import { BrushTitle, CloudDivider, PullQuote, Reveal, Seal } from "@/components/ui";
import { GithubGarden } from "@/components/GithubGarden";
import { IMG } from "@/data/images";

const PRINCIPLES = [
  { zh: "格物致知", es: "Investigar las cosas para alcanzar el conocimiento", text: "Ningún dato sin fuente. Cada cifra de este blog enlaza a Britannica, informes oficiales o publicaciones técnicas." },
  { zh: "留白", es: "Dejar espacio en blanco", text: "Como en la pintura de tinta, el vacío también comunica. Diseño sobrio, sin dragones de cartón ni rojo de restaurante." },
  { zh: "温故知新", es: "Repasar lo antiguo para conocer lo nuevo", text: "El papel de Cai Lun y los modelos de DeepSeek pertenecen a la misma historia: la de convertir ideas en herramientas." },
  { zh: "精益求精", es: "Pulir lo pulido", text: "Rendimiento, accesibilidad y movimiento reducido no son extras: son la caligrafía del código." },
];

export default function About() {
  useEffect(() => {
    document.title = "Lin Yue 林玥 — Sobre la autora · 墨玥 MoYue";
  }, []);
  return (
    <div className="pt-36">
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="font-cn text-sm tracking-[0.4em] text-gold">作者 · la autora</p>
          <h1 className="mt-2 font-display text-6xl font-semibold leading-none sm:text-7xl">
            <BrushTitle text="Lin Yue" />
          </h1>
          <p className="mt-2 font-brush text-6xl text-jade">林玥</p>
          <p className="mt-6 font-display text-2xl italic text-[var(--fg-soft)]">Alias artístico. Estudiante de Sistemas Informáticos. Lectora de crónicas antiguas y de informes técnicos a partes iguales.</p>
          <div className="scroll-prose mt-8">
            <p>
              <span className="dropcap-cn" aria-hidden="true">林</span>
              <strong>林</strong> (lín) significa «bosque»; <strong>玥</strong> (yuè) es una perla mítica, una gema que los antiguos asociaban a la luz de la luna. Elegí este nombre porque resume lo que busco al escribir: muchos árboles —datos, fechas, nombres— y, entre ellos, una pequeña luz que permita ver el conjunto.
            </p>
            <p>
              Estudio Sistemas Informáticos y paso las noches entre dos tipos de texto: el código que compila y las crónicas que no se dejan compilar. MoYue nació de una pregunta sencilla: si la historia de la informática empieza oficialmente en el siglo XX, ¿dónde empieza la historia de la <em>información</em>? Mi respuesta provisional es una hoja de papel hecha con corteza de morera en el año 105.
            </p>
            <p>
              Este blog no pretende ser imparcial en la estética —amo la tinta, el jade y la luna—, pero sí riguroso en los hechos. Cuando algo es leyenda, lo digo; cuando una cifra es estimación, también.
            </p>
          </div>
        </div>
        <Reveal>
          <figure className="relative">
            <div className="overflow-hidden rounded-[2rem] border-2 border-jade/50 p-2 shadow-[0_40px_80px_-40px_rgba(0,168,107,.5)]">
              <img src={IMG.mistPavilion.src} alt={IMG.mistPavilion.alt} className="ink-img aspect-[4/5] w-full rounded-[1.6rem] object-cover" loading="lazy" width={1200} height={627} />
            </div>
            <Seal text="林玥" size={96} className="absolute -bottom-6 -left-6" style={{ transform: "rotate(-8deg)" }} />
            <span aria-hidden="true" className="vertical absolute -right-3 top-8 rounded-full bg-[var(--bg)]/80 px-2 py-4 font-cn text-sm text-gold">林中有玥</span>
            <figcaption className="mt-8 text-right text-xs text-smoke">
              Autorretrato simbólico: un pabellón entre la niebla. Foto:{" "}
              <a className="underline decoration-dotted" href={IMG.mistPavilion.creditUrl} target="_blank" rel="noopener noreferrer">
                {IMG.mistPavilion.credit} / Pexels
              </a>
            </figcaption>
          </figure>
        </Reveal>
      </section>

      <div className="mx-auto max-w-4xl px-6">
        <PullQuote cn="墨落月升" text="Cae la tinta sobre el papel y, en el mismo instante, sube la luna. Escribir es eso: oscurecer una página para que algo se ilumine." author="Lin Yue 林玥" translation="cae la tinta, sube la luna" />
      </div>

      <section className="mx-auto max-w-6xl px-6" aria-labelledby="t-filosofia">
        <h2 id="t-filosofia" className="mb-10 text-center font-display text-5xl font-semibold">Filosofía del pergamino</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.zh} delay={i * 80}>
              <article className="group unroll relative h-full rounded-2xl jade-border bg-[var(--card)] p-7">
                <p className="font-brush text-5xl text-jade">{p.zh}</p>
                <p className="mt-2 font-display text-xl italic text-gold">{p.es}</p>
                <p className="mt-3 text-[var(--fg-soft)]">{p.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6">
        <CloudDivider label="园 · jardín" />
      </div>

      <section className="mx-auto max-w-7xl px-6" aria-labelledby="t-garden">
        <h2 id="t-garden" className="mb-3 font-display text-5xl font-semibold">El jardín de contribuciones</h2>
        <p className="mb-8 max-w-2xl text-[var(--fg-soft)]">Mi actividad en GitHub, cultivada como un jardín de letrado. Puedes plantar el jardín de cualquier usuario público escribiendo su nombre.</p>
        <GithubGarden />
      </section>
    </div>
  );
}
