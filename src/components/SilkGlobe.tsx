// Globo interactivo de la Ruta de la Seda: histórica (oro) y digital (jade).
// Arrastrar para rotar; seleccionar ciudades en la lista para leer su historia.
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useApp } from "@/lib/store";
import { cn } from "@/utils/cn";

interface Node {
  id: string;
  name: string;
  zh: string;
  lat: number;
  lon: number;
  kind: "hist" | "digi";
  text: string;
}

const NODES: Node[] = [
  { id: "xian", name: "Xi'an (Chang'an)", zh: "长安", lat: 34.34, lon: 108.94, kind: "hist", text: "Capital de los Han y los Tang y punto de partida oriental de la Ruta. Desde aquí partió la misión de Zhang Qian hacia Asia Central (s. II a.C.)." },
  { id: "dunhuang", name: "Dunhuang", zh: "敦煌", lat: 40.14, lon: 94.66, kind: "hist", text: "Oasis en el corredor del Hexi. Las Grutas de Mogao (Patrimonio UNESCO, 1987) guardaban el Sutra del Diamante de 868, el libro impreso fechado más antiguo." },
  { id: "kashgar", name: "Kashgar", zh: "喀什", lat: 39.47, lon: 75.99, kind: "hist", text: "Cruce donde las ramas norte y sur alrededor del desierto de Taklamakán se reunían antes de cruzar el Pamir." },
  { id: "samarkand", name: "Samarcanda", zh: "撒马尔罕", lat: 39.65, lon: 66.96, kind: "hist", text: "Joya sogdiana. Según la tradición, tras la batalla de Talas (751) artesanos chinos enseñaron aquí a fabricar papel." },
  { id: "baghdad", name: "Bagdad", zh: "巴格达", lat: 33.31, lon: 44.36, kind: "hist", text: "Hacia 794 funcionaba un molino de papel; la Casa de la Sabiduría copió en papel la ciencia griega, persa e india." },
  { id: "constantinople", name: "Constantinopla", zh: "君士坦丁堡", lat: 41.01, lon: 28.98, kind: "hist", text: "Puerta de Europa. Hacia 552, monjes llevaron huevos de gusano de seda a Bizancio escondidos en bastones de bambú (Procopio)." },
  { id: "venice", name: "Venecia", zh: "威尼斯", lat: 45.44, lon: 12.33, kind: "hist", text: "Patria de Marco Polo y extremo occidental del comercio con Oriente." },
  { id: "beijing", name: "Beijing · Zhongguancun", zh: "中关村", lat: 39.98, lon: 116.31, kind: "digi", text: "El «Silicon Valley chino» en Haidian: allí nacieron Lenovo (1984), y tienen sede Baidu y Xiaomi, junto a las universidades Tsinghua y Pekín." },
  { id: "shenzhen", name: "Shenzhen", zh: "深圳", lat: 22.54, lon: 114.06, kind: "digi", text: "Zona Económica Especial desde 1980. Sede de Huawei, Tencent, BYD y DJI; el mercado de Huaqiangbei es la mayor bazar electrónico del mundo." },
  { id: "hangzhou", name: "Hangzhou", zh: "杭州", lat: 30.27, lon: 120.15, kind: "digi", text: "Ciudad del Lago del Oeste y sede de Alibaba (1999) y DeepSeek (2023). Hoy se habla de los «seis pequeños dragones» tecnológicos de Hangzhou." },
  { id: "guiyang", name: "Guiyang · Gui'an", zh: "贵阳", lat: 26.65, lon: 106.63, kind: "digi", text: "Capital del big data de Guizhou: clima fresco, energía hidroeléctrica y cuevas kársticas albergan centros de datos de Apple iCloud (China), Tencent y Huawei Cloud." },
  { id: "gwadar", name: "Gwadar / Karachi", zh: "瓜达尔", lat: 25.13, lon: 62.32, kind: "digi", text: "Puntos de amarre en Pakistán del cable submarino PEACE (~15.000 km), que une Asia, África Oriental y Europa." },
  { id: "djibouti", name: "Yibuti", zh: "吉布提", lat: 11.59, lon: 43.15, kind: "digi", text: "Nodo estratégico del Cuerno de África para cables submarinos y logística de la Franja y la Ruta." },
  { id: "marseille", name: "Marsella", zh: "马赛", lat: 43.3, lon: 5.37, kind: "digi", text: "Uno de los grandes hubs de cables del Mediterráneo y amarre europeo del cable PEACE." },
];

const HIST_ROUTE = ["xian", "dunhuang", "kashgar", "samarkand", "baghdad", "constantinople", "venice"];
const DIGI_ROUTE: [string, string][] = [
  ["beijing", "hangzhou"],
  ["hangzhou", "shenzhen"],
  ["shenzhen", "guiyang"],
  ["guiyang", "beijing"],
  ["shenzhen", "gwadar"],
  ["gwadar", "djibouti"],
  ["djibouti", "marseille"],
];

const R = 2;
function toVec(lat: number, lon: number, r = R) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const th = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}

export default function SilkGlobe() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useApp();
  const [mode, setMode] = useState<"all" | "hist" | "digi">("all");
  const [sel, setSel] = useState<Node>(NODES[0]!);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const selRef = useRef(sel.id);
  selRef.current = sel.id;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.1, 100);
    cam.position.copy(toVec(32, 80, 6.4));
    const controls = new OrbitControls(cam, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 0.35;

    // Esfera de tinta con retícula tenue
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(R, 64, 64), new THREE.MeshBasicMaterial({ color: 0x0f1a15, transparent: true, opacity: 0.92 })));
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.001, 36, 18), new THREE.MeshBasicMaterial({ color: 0x00a86b, wireframe: true, transparent: true, opacity: 0.08 })));
    // Halo atmosférico
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.18, 48, 48),
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        vertexShader: "varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ",
        fragmentShader: "varying vec3 vN; void main(){ float i=pow(0.65-dot(vN,vec3(0,0,1.0)),3.0); gl_FragColor=vec4(0.0,0.66,0.42,1.0)*i; }",
      }),
    );
    scene.add(halo);

    // Puntos de "continentes" aproximados con ruido (estética de puntos de tinta)
    const dots: number[] = [];
    for (let i = 0; i < 2600; i++) {
      const u = Math.random();
      const v = Math.random();
      const lat = Math.acos(2 * v - 1) * (180 / Math.PI) - 90;
      const lon = u * 360 - 180;
      const m = Math.sin(lat * 0.09) * Math.cos(lon * 0.05) + Math.sin(lon * 0.11 + lat * 0.04);
      if (m > 0.35 || (lon > 20 && lon < 135 && lat > 10 && lat < 55 && Math.random() < 0.55)) {
        const p = toVec(lat, lon, R * 1.003);
        dots.push(p.x, p.y, p.z);
      }
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.Float32BufferAttribute(dots, 3));
    scene.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: 0x7fb8a4, size: 0.018, transparent: true, opacity: 0.45 })));

    const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
    const arc = (a: Node, b: Node, color: number) => {
      const va = toVec(a.lat, a.lon);
      const vb = toVec(b.lat, b.lon);
      const mid = va.clone().add(vb).multiplyScalar(0.5);
      mid.setLength(R + va.distanceTo(vb) * 0.35);
      const curve = new THREE.QuadraticBezierCurve3(va, mid, vb);
      const geo = new THREE.TubeGeometry(curve, 48, 0.008, 6, false);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
      return { mesh: new THREE.Mesh(geo, mat), curve };
    };
    const histGroup = new THREE.Group();
    const digiGroup = new THREE.Group();
    const runners: { curve: THREE.QuadraticBezierCurve3; dot: THREE.Mesh; off: number }[] = [];
    const addRunner = (curve: THREE.QuadraticBezierCurve3, color: number, g: THREE.Group) => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), new THREE.MeshBasicMaterial({ color }));
      g.add(dot);
      runners.push({ curve, dot, off: Math.random() });
    };
    for (let i = 0; i < HIST_ROUTE.length - 1; i++) {
      const a = byId[HIST_ROUTE[i]!];
      const b = byId[HIST_ROUTE[i + 1]!];
      if (!a || !b) continue;
      const { mesh, curve } = arc(a, b, 0xc9a227);
      histGroup.add(mesh);
      addRunner(curve, 0xffe08a, histGroup);
    }
    for (const [x, y] of DIGI_ROUTE) {
      const a = byId[x];
      const b = byId[y];
      if (!a || !b) continue;
      const { mesh, curve } = arc(a, b, 0x00a86b);
      digiGroup.add(mesh);
      addRunner(curve, 0x9ff5cf, digiGroup);
    }
    scene.add(histGroup, digiGroup);

    const markers = new Map<string, THREE.Mesh>();
    for (const n of NODES) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), new THREE.MeshBasicMaterial({ color: n.kind === "hist" ? 0xc9a227 : 0x00a86b }));
      m.position.copy(toVec(n.lat, n.lon, R * 1.01));
      markers.set(n.id, m);
      (n.kind === "hist" ? histGroup : digiGroup).add(m);
    }

    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      cam.aspect = el.clientWidth / el.clientHeight;
      cam.updateProjectionMatrix();
    };
    window.addEventListener("resize", resize);

    let raf = 0;
    const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      histGroup.visible = modeRef.current !== "digi";
      digiGroup.visible = modeRef.current !== "hist";
      for (const r of runners) r.dot.position.copy(r.curve.getPoint((t * 0.18 + r.off) % 1));
      markers.forEach((m, id) => m.scale.setScalar(id === selRef.current ? 2.2 + Math.sin(t * 4) * 0.3 : 1));
      controls.update();
      renderer.render(scene, cam);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      controls.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [reduced]);

  const list = NODES.filter((n) => mode === "all" || n.kind === mode);

  return (
    <div className="cq my-14 grid gap-6 rounded-3xl jade-border bg-[var(--card)] p-4 sm:p-6 lg:grid-cols-[1.25fr_1fr]">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-ink" aria-label="Globo 3D interactivo con la Ruta de la Seda histórica en oro y la digital en jade. Arrastra para girar." role="img">
        <div ref={ref} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
        <div className="absolute left-3 top-3 flex gap-2 text-xs">
          <span className="rounded-full bg-black/50 px-2 py-1 text-gold">● Histórica 丝绸之路</span>
          <span className="rounded-full bg-black/50 px-2 py-1 text-jade">● Digital 数字丝路</span>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="mb-4 flex gap-2" role="group" aria-label="Filtrar rutas">
          {(["all", "hist", "digi"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} className={cn("rounded-full border px-4 py-1.5 text-sm transition", mode === m ? "border-jade bg-jade text-ink" : "border-[var(--line)] hover:border-jade")}>
              {m === "all" ? "Ambas" : m === "hist" ? "Histórica" : "Digital"}
            </button>
          ))}
        </div>
        <ul className="grid max-h-56 grid-cols-2 gap-1.5 overflow-y-auto pr-1 text-sm">
          {list.map((n) => (
            <li key={n.id}>
              <button onClick={() => setSel(n)} aria-pressed={sel.id === n.id} className={cn("w-full rounded-lg border px-3 py-1.5 text-left transition", sel.id === n.id ? "border-gold/60 bg-gold/10" : "border-transparent hover:border-[var(--line)]")}>
                <span className={n.kind === "hist" ? "text-gold" : "text-jade"}>●</span> {n.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex-1 rounded-2xl border border-[var(--line)] p-5" aria-live="polite">
          <p className="font-brush text-4xl text-jade">{sel.zh}</p>
          <p className="font-display text-2xl font-semibold">{sel.name}</p>
          <p className="mt-2 text-[var(--fg-soft)]">{sel.text}</p>
        </div>
      </div>
    </div>
  );
}
