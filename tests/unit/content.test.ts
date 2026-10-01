// Pruebas unitarias (Vitest) — contenido y validación
// Ejecutar: npx vitest run
import { describe, expect, it } from "vitest";
import { ARTICLES, getArticle } from "../../src/data/articles";
import { ArticleMetaSchema } from "../../src/data/types";
import { LetterSchema } from "../../src/lib/api";
import { articleWords } from "../../src/data/wordcount";

describe("pergaminos", () => {
  it("hay exactamente 5 pergaminos con slugs únicos", () => {
    expect(ARTICLES).toHaveLength(5);
    expect(new Set(ARTICLES.map((a) => a.slug)).size).toBe(5);
  });

  it("cada pergamino supera las 800 palabras", () => {
    for (const a of ARTICLES) expect(articleWords(a), a.slug).toBeGreaterThan(800);
  });

  it("los metadatos cumplen el esquema Zod", () => {
    for (const a of ARTICLES) expect(() => ArticleMetaSchema.parse(a)).not.toThrow();
  });

  it("cada pergamino incluye tabla, cita vertical, galería y nota del erudito", () => {
    for (const a of ARTICLES) {
      const kinds = new Set(a.blocks.map((b) => b.t));
      for (const k of ["table", "quote", "note", "sources"]) expect(kinds.has(k as never), `${a.slug} → ${k}`).toBe(true);
      expect(kinds.has("gallery") || kinds.has("figure")).toBe(true);
    }
  });

  it("getArticle devuelve undefined para slugs desconocidos", () => {
    expect(getArticle("no-existe")).toBeUndefined();
  });
});

describe("carta al erudito", () => {
  const ok = { name: "Mei", email: "mei@luna.cn", topic: "inventos", message: "Una carta suficientemente larga para el erudito." };

  it("acepta una carta válida", () => {
    expect(LetterSchema.safeParse(ok).success).toBe(true);
  });
  it("rechaza correos inválidos", () => {
    expect(LetterSchema.safeParse({ ...ok, email: "luna" }).success).toBe(false);
  });
  it("rechaza mensajes demasiado cortos", () => {
    expect(LetterSchema.safeParse({ ...ok, message: "hola" }).success).toBe(false);
  });
  it("rechaza bots que rellenan el campo trampa", () => {
    expect(LetterSchema.safeParse({ ...ok, website: "spam.com" }).success).toBe(false);
  });
});
