// Motor de ambiente sonoro de MoYue (Web Audio API).
// Guzheng/guqin sintetizado en escala pentatónica china (宫商角徵羽) + goteo de agua lejano.
// El scroll abre/cierra un filtro paso-bajo: cuanto más se lee, más "clara" suena el agua.

type Maybe<T> = T | null;

class AmbientEngine {
  private ctx: Maybe<AudioContext> = null;
  private master: Maybe<GainNode> = null;
  private filter: Maybe<BiquadFilterNode> = null;
  private reverb: Maybe<ConvolverNode> = null;
  private timers: number[] = [];
  private running = false;

  // Pentatónica de Re: gong, shang, jue, zhi, yu (dos octavas)
  private scale = [146.83, 164.81, 185.0, 220.0, 246.94, 293.66, 329.63, 369.99, 440.0, 493.88];

  private ensure(): AudioContext {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1400;
    filter.Q.value = 0.6;
    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(ctx, 3.2);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    filter.connect(master);
    filter.connect(reverb);
    reverb.connect(wet);
    wet.connect(master);
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    this.filter = filter;
    this.reverb = reverb;
    return ctx;
  }

  /** Respuesta al impulso sintética (sala de templo) */
  private impulse(ctx: AudioContext, seconds: number): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    return buf;
  }

  /** Pulsación de cuerda tipo guzheng: armónicos con caída exponencial y leve vibrato */
  private pluck(freq: number, vel = 0.18) {
    const ctx = this.ctx;
    const out = this.filter;
    if (!ctx || !out) return;
    const t = ctx.currentTime;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.8);
    g.connect(out);
    [1, 2, 3, 4.02].forEach((h, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? "triangle" : "sine";
      o.frequency.setValueAtTime(freq * h * 1.006, t);
      o.frequency.exponentialRampToValueAtTime(freq * h, t + 0.12); // ligero "pitch bend" de la cuerda
      const hg = ctx.createGain();
      hg.gain.value = 1 / (i * 1.8 + 1);
      o.connect(hg);
      hg.connect(g);
      o.start(t);
      o.stop(t + 4);
    });
  }

  /** Gota de agua: seno con caída rápida de tono */
  private drip() {
    const ctx = this.ctx;
    const out = this.filter;
    if (!ctx || !out) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    const f = 900 + Math.random() * 700;
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.35, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + 0.3);
  }

  private loop() {
    if (!this.running) return;
    // Frase melódica lenta y espaciada (estética del vacío, 留白)
    const id = window.setTimeout(() => {
      const n = this.scale[Math.floor(Math.random() * this.scale.length)] ?? 220;
      this.pluck(n, 0.12 + Math.random() * 0.08);
      if (Math.random() < 0.35) window.setTimeout(() => this.pluck(n * 1.5, 0.07), 260);
      this.loop();
    }, 1800 + Math.random() * 2600);
    const id2 = window.setTimeout(() => this.drip(), 700 + Math.random() * 3000);
    this.timers.push(id, id2);
    if (this.timers.length > 40) this.timers.splice(0, 20);
  }

  async start() {
    const ctx = this.ensure();
    await ctx.resume();
    if (this.running) return;
    this.running = true;
    this.master?.gain.setTargetAtTime(0.5, ctx.currentTime, 0.8);
    this.pluck(this.scale[5] ?? 293.66, 0.16);
    this.loop();
  }

  stop() {
    this.running = false;
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
  }

  /** Progreso de scroll 0..1 → frecuencia de corte del filtro */
  setScroll(p: number) {
    if (!this.ctx || !this.filter) return;
    this.filter.frequency.setTargetAtTime(700 + p * 4200, this.ctx.currentTime, 0.4);
  }

  /** Golpe seco del sello sobre el papel (easter egg) */
  stamp() {
    const ctx = this.ensure();
    void ctx.resume();
    const t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.25);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    const g = ctx.createGain();
    g.gain.value = 1.4;
    src.connect(lp);
    lp.connect(g);
    g.connect(ctx.destination);
    if (this.reverb) g.connect(this.reverb);
    src.start(t);
    // Cuerpo grave
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.2);
    og.gain.setValueAtTime(0.6, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(og);
    og.connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.35);
  }
}

export const ambient = new AmbientEngine();
