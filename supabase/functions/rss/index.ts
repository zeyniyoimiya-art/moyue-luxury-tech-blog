// Edge Function (Deno) — genera el feed RSS de 墨玥 MoYue desde la tabla `articles`.
// Despliegue: supabase functions deploy rss
import { createClient } from "jsr:@supabase/supabase-js@2";

const SITE = "https://moyue.vercel.app";

// Escapa caracteres XML
const esc = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] ?? c);

Deno.serve(async () => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data, error } = await supabase
    .from("articles")
    .select("slug,title,excerpt,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) return new Response("El pergamino no pudo leerse", { status: 500 });

  const items = (data ?? [])
    .map(
      (a) => `<item><title>${esc(a.title)}</title><link>${SITE}/#/blog/${a.slug}</link><guid>${a.slug}</guid>` +
        `<pubDate>${new Date(a.published_at).toUTCString()}</pubDate><description>${esc(a.excerpt)}</description></item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>墨玥 · MoYue</title>` +
    `<link>${SITE}</link><description>Donde la tinta encuentra la luna · 墨落月升</description><language>es</language>${items}</channel></rss>`;

  // Caché en el edge: 1 h fresca + 1 día stale (patrón ISR)
  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
});
