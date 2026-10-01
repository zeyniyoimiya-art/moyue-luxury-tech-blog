// Luna 3D de jade translúcido + fondo de difusión de tinta (shaders GLSL custom) + lluvia de tinta.
// Se detecta WebGPU (navigator.gpu); el render usa WebGL2 de Three.js como camino universal y estable.
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Theme } from "@/lib/store";

const NOISE = /* glsl */ `
  vec3 hash3(vec3 p){ p = vec3(dot(p,vec3(127.1,311.7,74.7)), dot(p,vec3(269.5,183.3,246.1)), dot(p,vec3(113.5,271.9,124.6))); return -1.0 + 2.0*fract(sin(p)*43758.5453123); }
  float noise(vec3 p){
    vec3 i=floor(p); vec3 f=fract(p); vec3 u=f*f*(3.0-2.0*f);
    return mix(mix(mix(dot(hash3(i+vec3(0,0,0)),f-vec3(0,0,0)),dot(hash3(i+vec3(1,0,0)),f-vec3(1,0,0)),u.x),
                   mix(dot(hash3(i+vec3(0,1,0)),f-vec3(0,1,0)),dot(hash3(i+vec3(1,1,0)),f-vec3(1,1,0)),u.x),u.y),
               mix(mix(dot(hash3(i+vec3(0,0,1)),f-vec3(0,0,1)),dot(hash3(i+vec3(1,0,1)),f-vec3(1,0,1)),u.x),
                   mix(dot(hash3(i+vec3(0,1,1)),f-vec3(0,1,1)),dot(hash3(i+vec3(1,1,1)),f-vec3(1,1,1)),u.x),u.y),u.z);
  }
  float fbm(vec3 p){ float a=0.5; float s=0.0; for(int i=0;i<5;i++){ s+=a*noise(p); p*=2.03; a*=0.5; } return s; }
`;

/* Shader de fondo: tinta que se difunde en agua según scroll y puntero */
const inkFrag = /* glsl */ `
  precision highp float;
  uniform float uTime; uniform float uScroll; uniform vec2 uMouse; uniform vec2 uRes; uniform float uLight;
  varying vec2 vUv;
  ${NOISE}
  void main(){
    vec2 uv = vUv; vec2 p = (uv - 0.5) * vec2(uRes.x/uRes.y, 1.0);
    float t = uTime * 0.04;
    // Dominio deformado: la tinta se "abre" como en papel xuan húmedo
    vec3 q = vec3(p*1.6, t);
    float w = fbm(q + vec3(fbm(q + vec3(0.0, t, 1.7)), fbm(q + vec3(5.2, 1.3, t)), 0.0) * 1.4);
    float spread = 0.25 + uScroll * 0.9;
    float d = length(p - (uMouse - 0.5) * vec2(uRes.x/uRes.y, 1.0));
    float bloom = smoothstep(0.55, 0.0, d) * 0.35;
    float ink = smoothstep(0.08 - spread*0.25, 0.55, w + bloom + uScroll*0.25);
    // Paleta: tinta pura / jade profundo
    vec3 inkDark = vec3(0.043, 0.051, 0.047);
    vec3 jadeMist = vec3(0.0, 0.22, 0.14);
    vec3 col = mix(inkDark, jadeMist, ink * 0.55);
    col += vec3(0.79, 0.64, 0.15) * pow(max(w,0.0), 6.0) * 0.25; // vetas de oro antiguo
    // Modo pergamino (light): tinta negra sobre papel de arroz
    vec3 paper = vec3(0.949, 0.929, 0.890);
    vec3 lightCol = mix(paper, vec3(0.1,0.12,0.11), ink * 0.32);
    lightCol = mix(lightCol, vec3(0.0,0.45,0.29), pow(max(w,0.0),3.0)*0.18);
    col = mix(col, lightCol, uLight);
    float vig = smoothstep(1.25, 0.3, length(p));
    col *= mix(0.75, 1.0, vig);
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* Shader de la luna de jade: fresnel, vetas, pseudo-dispersión subsuperficial */
const moonVert = /* glsl */ `
  varying vec3 vN; varying vec3 vP; varying vec3 vView;
  void main(){
    vN = normalize(normalMatrix * normal);
    vP = position;
    vec4 mv = modelViewMatrix * vec4(position,1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const moonFrag = /* glsl */ `
  precision highp float;
  uniform float uTime; uniform vec3 uLightDir;
  varying vec3 vN; varying vec3 vP; varying vec3 vView;
  ${NOISE}
  void main(){
    vec3 n = normalize(vN);
    float fres = pow(1.0 - max(dot(n, vView), 0.0), 2.4);
    // Vetas del jade (nefrita imperial) y cráteres suaves
    float veins = fbm(vP * 2.2 + vec3(0.0, uTime*0.02, 0.0));
    float cracks = smoothstep(0.02, 0.0, abs(fbm(vP*4.0) - 0.05));
    float craters = smoothstep(0.15, 0.45, fbm(vP*1.3 + 3.0));
    vec3 deep = vec3(0.0, 0.33, 0.21);
    vec3 imperial = vec3(0.0, 0.66, 0.42);
    vec3 pale = vec3(0.50, 0.72, 0.64);
    vec3 col = mix(deep, imperial, smoothstep(-0.3, 0.5, veins));
    col = mix(col, pale, craters * 0.35);
    col += vec3(0.85, 0.95, 0.88) * cracks * 0.25;
    float diff = max(dot(n, normalize(uLightDir)), 0.0);
    float wrap = (dot(n, normalize(uLightDir)) + 0.6) / 1.6; // luz envolvente = translucidez
    col *= 0.35 + 0.65 * max(wrap, 0.0);
    col += imperial * fres * 1.2;               // halo interior
    col += vec3(1.0, 0.92, 0.7) * pow(diff, 32.0) * 0.35; // brillo pulido
    float alpha = 0.82 + fres * 0.18;
    gl_FragColor = vec4(col, alpha);
  }
`;

const haloFrag = /* glsl */ `
  precision highp float; varying vec2 vUv; uniform float uTime;
  void main(){ float d = length(vUv-0.5); float a = smoothstep(0.5, 0.18, d) * 0.55 * (0.9 + 0.1*sin(uTime*0.6));
    gl_FragColor = vec4(vec3(0.0,0.66,0.42)*1.2, a*a); }
`;

const rainVert = /* glsl */ `
  attribute float aSpeed; attribute float aSize; uniform float uTime; uniform float uH;
  varying float vA;
  void main(){
    vec3 p = position; p.y = mod(p.y - uTime * aSpeed, uH) - uH*0.5;
    vA = smoothstep(-uH*0.5, uH*0.2, p.y);
    vec4 mv = modelViewMatrix * vec4(p,1.0);
    gl_PointSize = aSize * (8.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const rainFrag = /* glsl */ `
  precision highp float; varying float vA; uniform float uLight;
  void main(){
    vec2 c = gl_PointCoord - 0.5; c.x *= 3.2; // gota alargada
    float a = smoothstep(0.5, 0.0, length(c)) * vA;
    vec3 col = mix(vec3(0.5,0.72,0.64), vec3(0.06,0.07,0.06), uLight);
    gl_FragColor = vec4(col, a * 0.55);
  }
`;

export default function JadeMoon({ theme }: { theme: Theme }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      return; // sin WebGL: el fallback CSS ya está pintado detrás
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    // Escena de fondo (ortográfica) para la tinta
    const bgScene = new THREE.Scene();
    const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const inkU = {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: { value: new THREE.Vector2(mount.clientWidth, mount.clientHeight) },
      uLight: { value: themeRef.current === "light" ? 1 : 0 },
    };
    bgScene.add(
      new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0);} ", fragmentShader: inkFrag, depthWrite: false }),
      ),
    );

    // Escena 3D
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(38, mount.clientWidth / mount.clientHeight, 0.1, 100);
    cam.position.set(0, 0, 9);

    const moonU = { uTime: { value: 0 }, uLightDir: { value: new THREE.Vector3(-0.6, 0.5, 0.8) } };
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(1.75, 128, 128),
      new THREE.ShaderMaterial({ uniforms: moonU, vertexShader: moonVert, fragmentShader: moonFrag, transparent: true }),
    );
    const group = new THREE.Group();
    group.add(moon);
    const haloU = { uTime: { value: 0 } };
    const halo = new THREE.Mesh(
      new THREE.PlaneGeometry(7.5, 7.5),
      new THREE.ShaderMaterial({ uniforms: haloU, vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} ", fragmentShader: haloFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    halo.position.z = -0.5;
    group.add(halo);
    scene.add(group);

    // Lluvia de tinta
    const COUNT = window.innerWidth < 700 ? 260 : 600;
    const pos = new Float32Array(COUNT * 3);
    const speed = new Float32Array(COUNT);
    const size = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      speed[i] = 0.4 + Math.random() * 1.2;
      size[i] = 2 + Math.random() * 5;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    rainGeo.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    rainGeo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    const rainU = { uTime: { value: 0 }, uH: { value: 12 }, uLight: { value: 0 } };
    scene.add(new THREE.Points(rainGeo, new THREE.ShaderMaterial({ uniforms: rainU, vertexShader: rainVert, fragmentShader: rainFrag, transparent: true, depthWrite: false })));

    const layout = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      inkU.uRes.value.set(w, h);
      // En móvil la luna se centra arriba; en escritorio se desplaza a la derecha
      group.position.set(w > 900 ? 2.3 : 0, w > 900 ? 0.1 : 1.2, 0);
      group.scale.setScalar(w > 900 ? 1 : 0.78);
    };
    layout();

    const target = new THREE.Vector2(0.5, 0.5);
    const onMove = (e: PointerEvent) => target.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", layout);

    // Pausar cuando no está visible (rendimiento + batería)
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting));
    io.observe(mount);

    const clock = new THREE.Clock();
    let raf = 0;
    renderer.autoClear = false;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      const t = clock.getElapsedTime();
      const sc = Math.min(window.scrollY / window.innerHeight, 1);
      inkU.uTime.value = t;
      inkU.uScroll.value += (sc - inkU.uScroll.value) * 0.06;
      inkU.uMouse.value.lerp(target, 0.04);
      const light = themeRef.current === "light" ? 1 : 0;
      inkU.uLight.value += (light - inkU.uLight.value) * 0.05;
      rainU.uLight.value = inkU.uLight.value;
      moonU.uTime.value = t;
      haloU.uTime.value = t;
      rainU.uTime.value = t;
      moon.rotation.y = t * 0.08;
      moon.rotation.x = Math.sin(t * 0.15) * 0.08;
      group.position.y += (Math.sin(t * 0.6) * 0.002);
      group.rotation.z = (inkU.uMouse.value.x - 0.5) * 0.15;
      group.position.z = -sc * 2.5;
      renderer.clear();
      renderer.render(bgScene, bgCam);
      renderer.clearDepth();
      renderer.render(scene, cam);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", layout);
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose?.();
      });
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
