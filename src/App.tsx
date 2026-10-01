// 墨玥 · MoYue — punto de entrada de la aplicación
// Autora: Lin Yue 林玥
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider, useApp } from "@/lib/store";
import Layout from "@/components/Layout";
import BrushCursor from "@/components/BrushCursor";
import { Link, Seal, SvgDefs } from "@/components/ui";
import Home from "@/pages/Home";
import ArticlePage from "@/pages/ArticlePage";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import { getArticle } from "@/data/articles";

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } });

function NotFound() {
  return (
    <section className="grid min-h-[80vh] place-items-center px-6 pt-32 text-center">
      <div>
        <p className="font-brush text-8xl text-jade">迷路</p>
        <h1 className="mt-4 font-display text-4xl">Este pergamino se perdió en el desierto</h1>
        <p className="mt-2 text-[var(--fg-soft)]">
          <span className="font-cn">迷路</span> significa «perder el camino». Volvamos al oasis.
        </p>
        <Link to="/" className="mt-8 inline-flex items-center gap-3 rounded-full border border-jade px-6 py-3 text-jade hover:bg-jade hover:text-ink">
          <Seal text="归" size={28} /> Regresar al inicio
        </Link>
      </div>
    </section>
  );
}

/** Enrutador por hash: compatible con el build de un solo archivo y modo offline */
function Router() {
  const { path } = useApp();
  if (path === "/" || path === "") return <Home />;
  if (path === "/about") return <About />;
  if (path === "/contact") return <Contact />;
  const m = path.match(/^\/blog\/([\w-]+)\/?$/);
  if (m?.[1]) {
    const a = getArticle(m[1]);
    if (a) return <ArticlePage key={a.slug} article={a} />;
  }
  return <NotFound />;
}

export default function App() {
  // Service Worker (PWA offline) sólo en producción y si el archivo existe
  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* sin SW: el sitio sigue funcionando online */
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <SvgDefs />
        <Layout>
          <Router />
        </Layout>
        <BrushCursor />
      </AppProvider>
    </QueryClientProvider>
  );
}
