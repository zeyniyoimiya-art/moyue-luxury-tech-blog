// Tipos del contenido del blog (equivalente a los schemas Zod/tRPC del backend).
import { z } from "zod";
import type { GalleryItem } from "@/components/ui";

export interface Person {
  name: string;
  zh: string;
  era: string;
  role: string;
  bio: string;
  achievements: string[];
  quote?: { text: string; source: string };
  glyph: string; // carácter emblemático para el retrato caligráfico
}

export interface Company {
  name: string;
  zh: string;
  founded: string;
  founder: string;
  hq: string;
  products: string;
  impact: string;
  finance: string;
  status: string;
  glyph: string;
}

export type Block =
  | { t: "p"; text: string; drop?: string }
  | { t: "h2"; text: string; zh?: string }
  | { t: "h3"; text: string }
  | { t: "quote"; cn: string; text: string; author: string; translation: string }
  | { t: "note"; text: string }
  | { t: "table"; caption: string; head: string[]; rows: string[][] }
  | { t: "gallery"; title?: string; items: GalleryItem[] }
  | { t: "figure"; item: GalleryItem }
  | { t: "divider"; label?: string }
  | { t: "portraits"; people: Person[] }
  | { t: "companies"; items: Company[] }
  | { t: "globe" }
  | { t: "timeline"; items: { year: string; title: string; text: string }[] }
  | { t: "sources"; items: { label: string; url: string }[] };

export interface Article {
  slug: string;
  title: string;
  zh: string;
  zhMeaning: string;
  subtitle: string;
  excerpt: string;
  date: string;
  readMin: number;
  hero: GalleryItem;
  blocks: Block[];
}

// Schema Zod de metadatos (se reutiliza en la API tipada y en el RSS)
export const ArticleMetaSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(3),
  zh: z.string().min(1),
  excerpt: z.string().min(20),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  readMin: z.number().int().positive(),
});
