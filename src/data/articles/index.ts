// Índice de pergaminos (ordenados del más reciente al más antiguo)
import type { Article } from "../types";
import { inventos } from "./inventos";
import { personajes } from "./personajes";
import { rutaSeda } from "./rutaSeda";
import { moderna } from "./moderna";
import { empresas } from "./empresas";

export const ARTICLES: Article[] = [empresas, moderna, rutaSeda, personajes, inventos];

export const getArticle = (slug: string): Article | undefined => ARTICLES.find((a) => a.slug === slug);
