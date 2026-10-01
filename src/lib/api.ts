// Capa de API 100% tipada (contrato equivalente a un router tRPC).
// En producción estos procedimientos llaman a Supabase (tabla `articles` y `letters`);
// aquí resuelven contra el contenido local y localStorage para funcionar offline.
import { z } from "zod";
import { ARTICLES, getArticle } from "@/data/articles";
import { ArticleMetaSchema } from "@/data/types";

/* ---------- Esquema del formulario "Carta al erudito" ---------- */
export const LetterSchema = z.object({
  name: z.string().trim().min(2, "Tu nombre (o seudónimo) necesita al menos 2 caracteres").max(60, "Máximo 60 caracteres"),
  email: z.string().trim().email("Ese correo no parece válido"),
  topic: z.enum(["inventos", "personajes", "ruta", "moderna", "empresas", "otro"], { message: "Elige un pergamino" }),
  message: z.string().trim().min(20, "Escribe al menos 20 caracteres: el erudito aprecia las cartas pausadas").max(2000, "Máximo 2000 caracteres"),
  // Campo trampa anti-spam: debe quedar vacío
  website: z.string().max(0).optional(),
});
export type Letter = z.infer<typeof LetterSchema>;

/* ---------- Procedimientos ---------- */
export const api = {
  articles: {
    /** Lista de metadatos validados (equivale a trpc.articles.list.query()) */
    list: () => z.array(ArticleMetaSchema).parse(ARTICLES.map(({ slug, title, zh, excerpt, date, readMin }) => ({ slug, title, zh, excerpt, date, readMin }))),
    bySlug: (slug: string) => getArticle(z.string().min(1).parse(slug)),
  },
  letters: {
    /** Envía una carta (equivale a trpc.letters.send.mutate()) */
    send: async (input: unknown): Promise<{ ok: true; id: string }> => {
      const letter = LetterSchema.parse(input);
      await new Promise((r) => setTimeout(r, 900)); // latencia simulada
      const id = `carta-${Date.now().toString(36)}`;
      const box = JSON.parse(localStorage.getItem("moyue-letters") ?? "[]") as unknown[];
      box.push({ id, ...letter, sentAt: new Date().toISOString() });
      localStorage.setItem("moyue-letters", JSON.stringify(box));
      return { ok: true, id };
    },
  },
};
