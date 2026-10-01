// Estado global de MoYue: tema, sonido, movimiento reducido y enrutado por hash.
// (Equivalente a los "Svelte stores" del diseño original, implementado con Context.)
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
  muted: boolean;
  setMuted: (m: boolean) => void;
  reduced: boolean;
  path: string;
  navigate: (to: string, origin?: { x: number; y: number }) => void;
  wiping: boolean;
  wipeOrigin: { x: number; y: number };
}

const Ctx = createContext<AppState | null>(null);

/** Lee la ruta actual del hash (#/blog/...) */
function readPath(): string {
  const h = window.location.hash.replace(/^#/, "");
  return h.startsWith("/") ? h : "/";
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Dark mode por defecto (noche con luna de jade)
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("moyue-theme") as Theme | null) ?? "dark");
  const [muted, setMuted] = useState(true);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [path, setPath] = useState(readPath);
  const [wiping, setWiping] = useState(false);
  const [wipeOrigin, setWipeOrigin] = useState({ x: 50, y: 50 });

  // Aplicar tema a <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("reduced", reduced);
    localStorage.setItem("moyue-theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0b0d0c" : "#f2ede3");
  }, [theme, reduced]);

  // Escuchar cambios de preferencia de movimiento
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  // Navegación con el botón "atrás" del navegador
  useEffect(() => {
    const onHash = () => {
      setPath(readPath());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  /** Navega con transición "ink-wipe": una mancha de tinta cubre y revela la nueva página */
  const navigate = useCallback(
    (to: string, origin?: { x: number; y: number }) => {
      if (to === readPath()) {
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        return;
      }
      const go = () => {
        window.location.hash = to;
      };
      if (reduced) {
        go();
        return;
      }
      setWipeOrigin(origin ?? { x: 50, y: 50 });
      setWiping(true);
      // View Transitions API nativa si existe; si no, la mancha de tinta CSS
      window.setTimeout(() => {
        const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
        if (doc.startViewTransition) doc.startViewTransition(go);
        else go();
        window.setTimeout(() => setWiping(false), 380);
      }, 520);
    },
    [reduced],
  );

  const value = useMemo(
    () => ({ theme, toggleTheme, muted, setMuted, reduced, path, navigate, wiping, wipeOrigin }),
    [theme, toggleTheme, muted, reduced, path, navigate, wiping, wipeOrigin],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return c;
}
