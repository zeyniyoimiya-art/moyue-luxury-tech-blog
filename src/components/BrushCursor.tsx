// Cursor personalizado: un pincel de caligrafía que deja un trazo de tinta.
// - Sobre enlaces: efecto "magnify" (anillo de jade que se agranda)
// - Sobre botones: se transforma en un pequeño sello rojo 印
// Sólo para punteros finos (ratón) y nunca con prefers-reduced-motion.
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";

type Mode = "brush" | "link" | "button";

export default function BrushCursor() {
  const { reduced, theme } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("brush");
  const [enabled, setEnabled] = useState(false);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    setEnabled(fine && !reduced);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("brush-cursor-on");
    const canvas = canvasRef.current;
    const tip = tipRef.current;
    if (!canvas || !tip) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Puntos del trazo con "edad" para desvanecerse
    const pts: { x: number; y: number; w: number; age: number }[] = [];
    let lx = -100;
    let ly = -100;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      const v = Math.hypot(dx, dy);
      // El pincel se adelgaza cuanto más rápido se mueve (como la caligrafía real)
      const w = Math.max(1.2, 9 - v * 0.22);
      if (lx > -50) pts.push({ x: e.clientX, y: e.clientY, w, age: 0 });
      lx = e.clientX;
      ly = e.clientY;
      tip.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const el = e.target as HTMLElement | null;
      const btn = el?.closest("button, [role=button], input[type=submit]");
      const link = el?.closest("a");
      setMode(btn ? "button" : link ? "link" : "brush");
    };

    const draw = () => {
      raf = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const dark = themeRef.current === "dark";
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        if (!a || !b) continue;
        const life = 1 - b.age / 60;
        if (life <= 0) continue;
        ctx.strokeStyle = dark ? `rgba(127,184,164,${0.55 * life})` : `rgba(11,13,12,${0.7 * life})`;
        ctx.lineWidth = b.w * life;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (const p of pts) p.age++;
      while (pts.length && (pts[0]?.age ?? 0) > 60) pts.shift();
    };
    draw();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      document.documentElement.classList.remove("brush-cursor-on");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[90]" aria-hidden="true" />
      <div ref={tipRef} className="pointer-events-none fixed left-0 top-0 z-[95]" aria-hidden="true">
        {mode === "button" ? (
          <div className="seal -translate-x-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-[4px] text-sm transition-all duration-200" style={{ transform: "translate(-50%,-50%) rotate(-8deg)" }}>
            印
          </div>
        ) : mode === "link" ? (
          <div className="h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-jade bg-jade/10 backdrop-blur-[1px] transition-all duration-200" style={{ backdropFilter: "contrast(1.2) brightness(1.1)" }} />
        ) : (
          // Pincel: mango de bambú + punta de pelo de tinta
          <svg width="34" height="34" viewBox="0 0 34 34" className="-translate-x-[3px] -translate-y-[31px]">
            <path d="M6 28 L26 4" stroke="#c9a227" strokeWidth="3" strokeLinecap="round" />
            <path d="M26 4 L29 1" stroke="#7a5f0c" strokeWidth="3" strokeLinecap="round" />
            <path d="M2 33 C3 30 4 28 7 27 C8 29 6 31 2 33 Z" fill={theme === "dark" ? "#7fb8a4" : "#0b0d0c"} />
          </svg>
        )}
      </div>
    </>
  );
}
