// Cuenta las palabras reales de un pergamino (párrafos, notas, citas, biografías, fichas y cronologías)
import type { Article, Block } from "./types";

const wc = (s: string) => s.split(/\s+/).filter(Boolean).length;

function blockWords(b: Block): number {
  switch (b.t) {
    case "p":
    case "h2":
    case "h3":
    case "note":
    case "quote":
      return wc(b.text);
    case "portraits":
      return b.people.reduce((s, p) => s + wc(p.bio) + wc(p.achievements.join(" ")) + (p.quote ? wc(p.quote.text) : 0), 0);
    case "companies":
      return b.items.reduce((s, c) => s + wc([c.products, c.impact, c.finance, c.status].join(" ")), 0);
    case "timeline":
      return b.items.reduce((s, i) => s + wc(i.text), 0);
    case "table":
      return wc(b.rows.flat().join(" "));
    default:
      return 0;
  }
}

export const articleWords = (a: Article): number => a.blocks.reduce((s, b) => s + blockWords(b), 0);
