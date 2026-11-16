"use client";

import { useEffect, useRef } from "react";
import { SKILL_CATEGORIES, type Skill } from "@/shared";

/**
 * Full-page animated orrery. You are the sun; every skill is a planet,
 * one orbit per category (core technologies on the innermost orbit).
 *
 * Rendering notes
 * - Real 3D: planets move on a flat orbital plane that is projected with perspective,
 *   so they grow as they swing towards you and pass behind / in front of the sun.
 * - Stable motion: simulation time advances in clamped steps, so a dropped frame or a
 *   background tab never makes planets jump, and every fade is a smooth ramp (no popping).
 * - Cheap frames: textures, glows, the sun and the star field are painted once into
 *   offscreen canvases (on resize) and only blitted per frame. No shadowBlur.
 */

type RGB = [number, number, number];

type Planet = {
  name: string;
  rgb: RGB;
  ring: number;
  level: number;
  phase: number; // starting angle on the orbit
  speed: number; // orbital speed, rad/s
  spin: number; // surface rotation, turns/s
  axial: number; // axial tilt, rad
  ringed: boolean;
  seed: number;
  halo: HTMLCanvasElement;
  tex?: HTMLCanvasElement;
};

type Layout = {
  wide: boolean;
  unit: number;
  baseX: number;
  baseY: number;
  focal: number;
  orbit: number[];
  sunR: number;
  textEdge: number;
};

const TAU = Math.PI * 2;
const ELEVATION = 0.4; // rad: how far above the orbital plane we look from
const SIN_E = Math.sin(ELEVATION);
const COS_E = Math.cos(ELEVATION);
const ROLL = -0.09; // rad: slight tilt of the whole system on screen
const COS_R = Math.cos(ROLL);
const SIN_R = Math.sin(ROLL);
const BASE_SPEED = 0.15; // rad/s on the innermost orbit (~42 s per lap)
const ORBIT_STEPS = 64; // segments per half orbit
const TRAIL_STEPS = 18;
const TRAIL_STEP = 0.026; // rad between trail segments
const BG_MARGIN = 30; // px of extra star field for pointer parallax
const MAX_PIXELS = 4_500_000; // cap canvas backing store on huge / hi-dpi screens
const NIGHT = "5, 7, 24";

export function SolarSystem({ skills }: { skills: Skill[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const maybeCtx = canvas?.getContext("2d");
    if (!canvas || !maybeCtx) return;
    const ctx: CanvasRenderingContext2D = maybeCtx;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- planets: one orbit per category that actually has skills ----------
    const rings = SKILL_CATEGORIES.filter((c) => skills.some((s) => s.category === c));
    const planets: Planet[] = [];
    rings.forEach((cat, ring) => {
      const onRing = skills.filter((s) => s.category === cat).sort((a, b) => a.orbitOrder - b.orbitOrder);
      onRing.forEach((s, i) => {
        const seed = hash(s.name);
        const rnd = rng(seed);
        const rgb = toRgb(s.color);
        planets.push({
          name: s.name,
          rgb,
          ring,
          level: s.level,
          phase: (i / onRing.length) * TAU + ring * 1.3,
          // Kepler says ω ∝ r^-1.5; softened a little so outer planets still visibly move
          speed: BASE_SPEED / Math.pow(1 + ring * 0.55, 1.25),
          spin: 0.025 + rnd() * 0.05,
          axial: (rnd() - 0.5) * 0.7,
          ringed: ring > 0 && seed % 3 === 1,
          seed,
          halo: makeHalo(rgb),
        });
      });
    });

    // ---------- sprites that never change ----------
    const corona = makeCorona();
    const rays = makeRays();
    const limb = makeLimb();
    const starSprites = ([[255, 255, 255], [200, 220, 255], [255, 226, 186]] as RGB[]).map(makeStarSprite);
    const twinklers = (() => {
      const rnd = rng(7);
      return Array.from({ length: 48 }, () => ({
        x: rnd(),
        y: rnd(),
        r: 0.6 + rnd() * 1.3,
        a: 0.35 + rnd() * 0.5,
        sp: 0.6 + rnd() * 1.8,
        ph: rnd() * TAU,
        tint: Math.floor(rnd() * 3),
      }));
    })();

    // ---------- state rebuilt on resize ----------
    let w = 0;
    let h = 0;
    let dpr = 1;
    let L: Layout | null = null;
    let bg: HTMLCanvasElement | null = null;
    let sunTex: HTMLCanvasElement | null = null;

    // narrow screens get relatively bigger planets so their surfaces stay readable
    const planetRadius = (p: Planet) => (L ? L.unit * (0.0048 + (p.level / 100) * 0.0058) * (L.wide ? 1 : 1.75) : 0);

    const resize = () => {
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (!cw || !ch || (cw === w && ch === h)) return;
      w = cw;
      h = ch;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (w * h * dpr * dpr > MAX_PIXELS) dpr = Math.sqrt(MAX_PIXELS / (w * h));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = "high";

      const wide = w >= 1024;
      const unit = Math.min(w, h * 1.6);
      const inner = unit * (wide ? 0.13 : 0.16);
      const gap = unit * (wide ? 0.066 : 0.08);
      L = {
        wide,
        unit,
        baseX: wide ? w * 0.67 : w * 0.5,
        baseY: wide ? h * 0.5 : h * 0.3,
        focal: unit * 2.4,
        orbit: rings.map((_, i) => inner + gap * i * (1 + i * 0.04)),
        sunR: inner * 0.34,
        textEdge: wide ? w * 0.56 : -Infinity,
      };

      for (const p of planets) p.tex = makeSurface(p, Math.ceil(planetRadius(p) * 2 * 1.35 * dpr));
      sunTex = makeSun(Math.ceil(L.sunR * 2 * dpr));
      bg = makeBackground(w, h, dpr);
      if (reduceMotion) render();
    };

    // ---------- simulation ----------
    let sim = reduceMotion ? 40 : 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let shoot: { x: number; y: number; vx: number; vy: number; age: number; life: number } | null = null;
    let nextShoot = 4;
    const shootRnd = rng(1234);

    // projection scratch (avoids allocating per point)
    const P = { x: 0, y: 0, s: 1 };
    let cx = 0;
    let cy = 0;
    const project = (xw: number, zw: number) => {
      const s = L!.focal / (L!.focal - zw * COS_E);
      const sx = xw * s;
      const sy = zw * SIN_E * s;
      P.x = cx + sx * COS_R - sy * SIN_R;
      P.y = cy + sx * SIN_R + sy * COS_R;
      P.s = s;
    };

    const textFade = (x: number) => (L!.wide ? 0.16 + 0.84 * smooth(L!.textEdge - 80, L!.textEdge + 50, x) : 1);

    function drawOrbitHalf(radius: number, front: boolean) {
      ctx.beginPath();
      for (let k = 0; k <= ORBIT_STEPS; k++) {
        const a = (front ? 0 : Math.PI) + (k / ORBIT_STEPS) * Math.PI;
        project(Math.cos(a) * radius, Math.sin(a) * radius);
        if (k === 0) ctx.moveTo(P.x, P.y);
        else ctx.lineTo(P.x, P.y);
      }
      ctx.stroke();
    }

    function drawOrbits(front: boolean, fade: number) {
      ctx.lineWidth = 1;
      L!.orbit.forEach((radius, i) => {
        const a = (front ? 0.3 : 0.12) * (i === 0 ? 1.25 : 1);
        ctx.globalAlpha = fade;
        ctx.strokeStyle = `rgba(150, 160, 235, ${a})`;
        drawOrbitHalf(radius, front);
      });
    }

    type Placed = { p: Planet; a: number; x: number; y: number; r: number; front: number };

    function drawRing(o: Placed, front: boolean, alpha: number) {
      const { r, p } = o;
      const col = mix(p.rgb, [236, 222, 196], 0.45);
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.rotate(ROLL + p.axial * 0.6);
      const bands: [number, number, number][] = [
        [1.55, 0.14, 0.32],
        [1.85, 0.26, 0.55],
        [2.2, 0.16, 0.3],
      ];
      for (const [k, width, a] of bands) {
        ctx.globalAlpha = alpha * (front ? 1 : 0.8);
        ctx.strokeStyle = css(col, a);
        ctx.lineWidth = r * width;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * k, r * k * 0.3, 0, front ? 0 : Math.PI, front ? Math.PI : TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawPlanet(o: Placed, fade: number) {
      const { p, x, y, r } = o;
      const alpha = fade * textFade(x);
      if (alpha < 0.01 || r < 0.5) return;
      const R = L!.orbit[p.ring] ?? 0;

      // fading trail along the orbit
      ctx.lineCap = "round";
      ctx.strokeStyle = css(p.rgb);
      for (let k = 0; k < TRAIL_STEPS; k++) {
        const t = 1 - k / TRAIL_STEPS;
        project(Math.cos(o.a - k * TRAIL_STEP) * R, Math.sin(o.a - k * TRAIL_STEP) * R);
        const x0 = P.x;
        const y0 = P.y;
        project(Math.cos(o.a - (k + 1) * TRAIL_STEP) * R, Math.sin(o.a - (k + 1) * TRAIL_STEP) * R);
        ctx.globalAlpha = alpha * 0.28 * t * t;
        ctx.lineWidth = Math.max(0.6, r * 0.5 * t);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(P.x, P.y);
        ctx.stroke();
      }
      ctx.lineCap = "butt";

      // soft glow around the planet
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha * (0.55 - 0.3 * o.front);
      ctx.drawImage(p.halo, x - r * 2.6, y - r * 2.6, r * 5.2, r * 5.2);
      ctx.globalCompositeOperation = "source-over";

      if (p.ringed) drawRing(o, false, alpha);

      // body: rotating surface texture, clipped to the disc
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.clip();
      if (p.tex) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ROLL + p.axial);
        const span = 4 * r;
        const off = (((sim * p.spin * span) % span) + span) % span;
        ctx.drawImage(p.tex, -r - off, -r, span, 2 * r);
        ctx.drawImage(p.tex, -r - off + span, -r, span, 2 * r);
        ctx.restore();
      }

      // sunlight: the side facing the sun is lit; planets in front of the sun show a crescent
      const dx = x - cx;
      const dy = y - cy;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const shift = r * (0.4 - 0.85 * o.front);
      const shadow = ctx.createLinearGradient(
        x + ux * (shift - r * 0.42),
        y + uy * (shift - r * 0.42),
        x + ux * (shift + r * 0.5),
        y + uy * (shift + r * 0.5),
      );
      shadow.addColorStop(0, `rgba(${NIGHT}, 0)`);
      shadow.addColorStop(1, `rgba(${NIGHT}, 0.94)`);
      ctx.fillStyle = shadow;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.drawImage(limb, x - r, y - r, r * 2, r * 2);
      ctx.restore();

      // thin atmosphere rim on the sun-facing edge
      const towardSun = Math.atan2(-uy, -ux);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha * (0.7 - 0.25 * o.front);
      ctx.strokeStyle = css(mix(p.rgb, [255, 255, 255], 0.45));
      ctx.lineWidth = Math.max(0.8, r * 0.13);
      ctx.beginPath();
      ctx.arc(x, y, r * 0.96, towardSun - 1.15, towardSun + 1.15);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";

      if (p.ringed) drawRing(o, true, alpha);
    }

    function drawSun(fade: number) {
      const sunR = L!.sunR;
      ctx.globalCompositeOperation = "lighter";
      const pulse = 1 + 0.035 * Math.sin(sim * 0.9) + 0.018 * Math.sin(sim * 2.3);
      const cr = sunR * 7 * pulse;
      ctx.globalAlpha = fade * 0.85;
      ctx.drawImage(corona, cx - cr, cy - cr, cr * 2, cr * 2);

      const rr = sunR * 5.5;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sim * 0.02);
      ctx.globalAlpha = fade * 0.32;
      ctx.drawImage(rays, -rr, -rr, rr * 2, rr * 2);
      ctx.rotate(-sim * 0.05 + 0.7);
      ctx.globalAlpha = fade * 0.2;
      ctx.drawImage(rays, -rr * 0.8, -rr * 0.8, rr * 1.6, rr * 1.6);
      ctx.restore();
      ctx.globalCompositeOperation = "source-over";

      if (sunTex) {
        ctx.globalAlpha = fade;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(sim * 0.03);
        ctx.drawImage(sunTex, -sunR, -sunR, sunR * 2, sunR * 2);
        ctx.restore();
      }
      // hot inner glow over the limb
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = fade * 0.5;
      const ir = sunR * 1.9;
      ctx.drawImage(corona, cx - ir, cy - ir, ir * 2, ir * 2);
      ctx.globalCompositeOperation = "source-over";
    }

    function drawLabels(placed: Placed[], fade: number) {
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      for (const o of placed) {
        const depthVis = L!.wide ? 0.45 + 0.55 * smooth(0.1, 0.6, o.front) : smooth(0.35, 0.7, o.front);
        const dist = Math.hypot(o.x - cx, o.y - cy);
        const sunVis = o.front < 0.5 ? smooth(L!.sunR * 0.9, L!.sunR * 1.7, dist) : 1;
        const a = fade * textFade(o.x) * depthVis * sunVis * 0.92;
        if (a < 0.02) continue;
        ctx.font = `500 ${o.p.ring === 0 ? 12.5 : 11.5}px "IBM Plex Sans", system-ui, sans-serif`;
        ctx.globalAlpha = a;
        ctx.strokeStyle = "rgba(10, 13, 36, 0.75)";
        ctx.lineWidth = 3;
        ctx.strokeText(o.p.name, o.x + o.r + 7, o.y);
        ctx.fillStyle = "#ece8dc";
        ctx.fillText(o.p.name, o.x + o.r + 7, o.y);
      }
    }

    function drawShootingStar(dt: number) {
      if (!shoot && sim > nextShoot) {
        const ang = 0.35 + shootRnd() * 0.35;
        const dir = shootRnd() < 0.5 ? 1 : -1;
        const speed = 700 + shootRnd() * 500;
        shoot = {
          x: w * (0.15 + shootRnd() * 0.7),
          y: h * shootRnd() * 0.35,
          vx: Math.cos(ang) * speed * dir,
          vy: Math.sin(ang) * speed,
          age: 0,
          life: 0.7 + shootRnd() * 0.5,
        };
      }
      if (!shoot) return;
      shoot.age += dt;
      if (shoot.age > shoot.life) {
        shoot = null;
        nextShoot = sim + 7 + shootRnd() * 10;
        return;
      }
      const t = shoot.age / shoot.life;
      const env = Math.sin(t * Math.PI);
      const hx = shoot.x + shoot.vx * shoot.age;
      const hy = shoot.y + shoot.vy * shoot.age;
      const sp = Math.hypot(shoot.vx, shoot.vy);
      const tail = 150 * env;
      const tx = hx - (shoot.vx / sp) * tail;
      const ty = hy - (shoot.vy / sp) * tail;
      const g = ctx.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0, "rgba(255, 245, 225, 0)");
      g.addColorStop(1, `rgba(255, 245, 225, ${0.85 * env})`);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      ctx.lineCap = "butt";
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = env;
      ctx.drawImage(starSprites[0]!, hx - 6, hy - 6, 12, 12);
      ctx.globalCompositeOperation = "source-over";
    }

    function render(dt = 0) {
      if (!L) return;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);

      // star field (deepest layer, smallest parallax)
      if (bg) {
        ctx.drawImage(bg, -BG_MARGIN - pointer.x * 8, -BG_MARGIN - pointer.y * 6, w + BG_MARGIN * 2, h + BG_MARGIN * 2);
      }
      ctx.globalCompositeOperation = "lighter";
      for (const s of twinklers) {
        const tw = reduceMotion ? 0.8 : 0.55 + 0.45 * Math.sin(sim * s.sp + s.ph);
        const size = s.r * (0.8 + tw * 0.5) * 7;
        ctx.globalAlpha = s.a * tw;
        ctx.drawImage(starSprites[s.tint]!, s.x * w - size / 2 - pointer.x * 12, s.y * h - size / 2 - pointer.y * 9, size, size);
      }
      ctx.globalCompositeOperation = "source-over";
      if (!reduceMotion) drawShootingStar(dt);

      // the system
      const fade = Math.max(0.35, 1 - window.scrollY / (h * 1.2));
      cx = L.baseX + pointer.x * 10;
      cy = L.baseY + pointer.y * 7;

      const placed: Placed[] = planets
        .map((p) => {
          const a = p.phase + sim * p.speed;
          const R = L!.orbit[p.ring] ?? 0;
          project(Math.cos(a) * R, Math.sin(a) * R);
          return { p, a, x: P.x, y: P.y, r: planetRadius(p) * P.s, front: (Math.sin(a) + 1) / 2 };
        })
        .sort((A, B) => A.front - B.front);

      drawOrbits(false, fade);
      for (const o of placed) if (o.front < 0.5) drawPlanet(o, fade);
      drawSun(fade);
      drawOrbits(true, fade);
      for (const o of placed) if (o.front >= 0.5) drawPlanet(o, fade);
      drawLabels(placed, fade);
      ctx.globalAlpha = 1;
    }

    // ---------- loop ----------
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 20); // clamp: no jumps after a stall
      last = now;
      sim += dt;
      const k = 1 - Math.exp(-dt * 2.5); // frame-rate independent easing
      pointer.x += (pointer.tx - pointer.x) * k;
      pointer.y += (pointer.ty - pointer.y) * k;
      render(dt);
      raf = requestAnimationFrame(frame);
    };

    const onPointer = (e: PointerEvent) => {
      if (!w || !h) return;
      pointer.tx = (e.clientX / w - 0.5) * 2;
      pointer.ty = (e.clientY / h - 0.5) * 2;
    };
    let scrollQueued = false;
    const onScroll = () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        render();
      });
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    if (reduceMotion) {
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      window.addEventListener("pointermove", onPointer, { passive: true });
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [skills]);

  // h-lvh: sized to the *large* viewport so the mobile address bar showing/hiding never resizes it
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed left-0 top-0 -z-10 h-lvh w-full" />;
}

/* ====================================================================== */
/* Offscreen painters (run once, or on resize)                            */
/* ====================================================================== */

function canvasOf(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return [c, c.getContext("2d")!] as const;
}

/** Horizontally tileable planet surface (2:1), so it can scroll to fake rotation. */
function makeSurface(p: Planet, size: number) {
  const H = Math.min(Math.max(size, 24), 192);
  const W = H * 2;
  const [c, g] = canvasOf(W, H);
  const rnd = rng(p.seed);
  const base = p.rgb;
  g.fillStyle = css(base);
  g.fillRect(0, 0, W, H);

  // draws an ellipse, repeated across the seam so the texture tiles
  const blob = (x: number, y: number, rx: number, ry: number) => {
    for (const ox of [-W, 0, W]) {
      if (x + ox + rx < 0 || x + ox - rx > W) continue;
      g.beginPath();
      g.ellipse(x + ox, y, rx, ry, 0, 0, TAU);
      g.fill();
    }
  };

  if (p.seed % 3 !== 0) {
    // gas giant: latitude bands + wispy streaks + maybe a storm
    const bands = 4 + Math.floor(rnd() * 6);
    const o1 = rnd() * TAU;
    const o2 = rnd() * TAU;
    const o3 = rnd() * TAU;
    for (let y = 0; y < H; y++) {
      const v = (y / H) * Math.PI;
      const n = Math.sin(v * bands + o1) * 0.5 + Math.sin(v * bands * 2.7 + o2) * 0.28 + Math.sin(v * bands * 6.3 + o3) * 0.14;
      g.fillStyle = css(n > 0 ? mix(base, [255, 255, 255], n * 0.42) : mix(base, [0, 0, 0], -n * 0.5));
      g.fillRect(0, y, W, 1);
    }
    for (let i = 0; i < 70; i++) {
      g.globalAlpha = 0.06 + rnd() * 0.12;
      g.fillStyle = css(rnd() < 0.5 ? mix(base, [0, 0, 0], 0.35) : mix(base, [255, 255, 255], 0.4));
      blob(rnd() * W, rnd() * H, W * (0.04 + rnd() * 0.16), Math.max(0.6, H * (0.006 + rnd() * 0.02)));
    }
    if (rnd() < 0.65) {
      const sx = rnd() * W;
      const sy = H * (0.3 + rnd() * 0.4);
      g.globalAlpha = 0.55;
      g.fillStyle = css(mix(base, [120, 40, 20], 0.45));
      blob(sx, sy, H * 0.12, H * 0.065);
      g.globalAlpha = 0.5;
      g.fillStyle = css(mix(base, [255, 240, 220], 0.35));
      blob(sx, sy, H * 0.06, H * 0.03);
    }
  } else {
    // rocky world: mottled terrain + craters
    for (let i = 0; i < 160; i++) {
      g.globalAlpha = 0.06 + rnd() * 0.14;
      g.fillStyle = css(rnd() < 0.55 ? mix(base, [0, 0, 0], 0.4) : mix(base, [255, 255, 255], 0.35));
      const r = H * (0.02 + rnd() * 0.16);
      blob(rnd() * W, rnd() * H, r * (1 + rnd()), r);
    }
    for (let i = 0; i < 28; i++) {
      const x = rnd() * W;
      const y = H * (0.1 + rnd() * 0.8);
      const r = H * (0.012 + rnd() * 0.045);
      g.globalAlpha = 0.35;
      g.fillStyle = css(mix(base, [0, 0, 0], 0.5));
      blob(x, y, r * 1.6, r);
      g.globalAlpha = 0.25;
      g.fillStyle = css(mix(base, [255, 255, 255], 0.5));
      blob(x - r * 0.25, y - r * 0.2, r * 1.1, r * 0.6);
    }
    // polar caps
    g.globalAlpha = 0.35;
    g.fillStyle = "rgba(240, 244, 255, 1)";
    g.fillRect(0, 0, W, H * 0.06);
    g.fillRect(0, H * 0.94, W, H * 0.06);
  }
  g.globalAlpha = 1;
  return c;
}

function makeHalo(rgb: RGB) {
  const [c, g] = canvasOf(64, 64);
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, css(rgb, 0.6));
  grad.addColorStop(0.32, css(rgb, 0.18));
  grad.addColorStop(1, css(rgb, 0));
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

/** Darkening towards the edge of a sphere. */
function makeLimb() {
  const [c, g] = canvasOf(128, 128);
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(0, 0, 0, 0)");
  grad.addColorStop(0.55, "rgba(0, 0, 0, 0)");
  grad.addColorStop(0.85, "rgba(0, 0, 0, 0.22)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.55)");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(64, 64, 64, 0, TAU);
  g.fill();
  return c;
}

function makeCorona() {
  const [c, g] = canvasOf(256, 256);
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(255, 240, 200, 1)");
  grad.addColorStop(0.08, "rgba(255, 210, 130, 0.6)");
  grad.addColorStop(0.2, "rgba(255, 165, 75, 0.24)");
  grad.addColorStop(0.45, "rgba(240, 115, 55, 0.08)");
  grad.addColorStop(1, "rgba(200, 80, 40, 0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return c;
}

function makeRays() {
  const S = 512;
  const [c, g] = canvasOf(S, S);
  const rnd = rng(99);
  g.translate(S / 2, S / 2);
  g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 22; i++) {
    const ang = (i / 22) * TAU + (rnd() - 0.5) * 0.25;
    const len = S * (0.22 + rnd() * 0.28);
    const half = 1 + rnd() * 3.5;
    g.save();
    g.rotate(ang);
    const grad = g.createLinearGradient(0, 0, len, 0);
    grad.addColorStop(0, "rgba(255, 215, 150, 0.55)");
    grad.addColorStop(1, "rgba(255, 180, 100, 0)");
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(0, -half);
    g.lineTo(len, 0);
    g.lineTo(0, half);
    g.closePath();
    g.fill();
    g.restore();
  }
  return c;
}

function makeSun(size: number) {
  const S = Math.min(Math.max(size, 32), 400);
  const [c, g] = canvasOf(S, S);
  const r = S / 2;
  const rnd = rng(42);
  g.beginPath();
  g.arc(r, r, r, 0, TAU);
  g.clip();
  const base = g.createRadialGradient(r * 0.85, r * 0.85, 0, r, r, r);
  base.addColorStop(0, "#fffbe8");
  base.addColorStop(0.35, "#ffe29a");
  base.addColorStop(0.7, "#ffb347");
  base.addColorStop(0.92, "#f07c2a");
  base.addColorStop(1, "#d9541c");
  g.fillStyle = base;
  g.fillRect(0, 0, S, S);
  // granulation
  const n = Math.floor((S * S) / 18);
  for (let i = 0; i < n; i++) {
    const light = rnd() < 0.5;
    g.globalAlpha = 0.04 + rnd() * 0.1;
    g.fillStyle = light ? "#fff6d8" : "#b4500f";
    g.beginPath();
    g.arc(rnd() * S, rnd() * S, S * (0.006 + rnd() * 0.016), 0, TAU);
    g.fill();
  }
  // a couple of sunspots
  for (let i = 0; i < 3; i++) {
    const a = rnd() * TAU;
    const d = r * (0.2 + rnd() * 0.5);
    g.globalAlpha = 0.35;
    g.fillStyle = "#7a2a08";
    g.beginPath();
    g.arc(r + Math.cos(a) * d, r + Math.sin(a) * d, S * (0.015 + rnd() * 0.02), 0, TAU);
    g.fill();
  }
  g.globalAlpha = 1;
  const limb = g.createRadialGradient(r, r, r * 0.55, r, r, r);
  limb.addColorStop(0, "rgba(150, 40, 0, 0)");
  limb.addColorStop(1, "rgba(120, 30, 0, 0.45)");
  g.fillStyle = limb;
  g.fillRect(0, 0, S, S);
  return c;
}

function makeStarSprite(rgb: RGB) {
  const [c, g] = canvasOf(64, 64);
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, css([255, 255, 255], 1));
  grad.addColorStop(0.08, css(rgb, 0.9));
  grad.addColorStop(0.25, css(rgb, 0.18));
  grad.addColorStop(1, css(rgb, 0));
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  // diffraction spikes
  for (const [x0, y0, x1, y1] of [
    [0, 32, 64, 32],
    [32, 0, 32, 64],
  ] as const) {
    const s = g.createLinearGradient(x0, y0, x1, y1);
    s.addColorStop(0, css(rgb, 0));
    s.addColorStop(0.5, css(rgb, 0.55));
    s.addColorStop(1, css(rgb, 0));
    g.strokeStyle = s;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.stroke();
  }
  return c;
}

/** Nebulae, a Milky Way band and the static star field. Deterministic, so resizes don't reshuffle it. */
function makeBackground(w: number, h: number, dpr: number) {
  const W = w + BG_MARGIN * 2;
  const H = h + BG_MARGIN * 2;
  const [c, g] = canvasOf(W * dpr, H * dpr);
  g.scale(dpr, dpr);
  const rnd = rng(2024);
  const big = Math.max(W, H);

  // nebulae
  g.globalCompositeOperation = "lighter";
  const tints: RGB[] = [
    [110, 80, 210],
    [60, 95, 210],
    [170, 70, 150],
    [40, 140, 175],
    [90, 60, 180],
    [200, 110, 90],
  ];
  for (const t of tints) {
    const x = rnd() * W;
    const y = rnd() * H;
    const r = big * (0.22 + rnd() * 0.3);
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, css(t, 0.08 + rnd() * 0.06));
    grad.addColorStop(0.5, css(t, 0.03));
    grad.addColorStop(1, css(t, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
  }

  // Milky Way band (diagonal, bottom-left → top-right)
  const x0 = -0.1 * W;
  const y0 = 0.92 * H;
  const x1 = 1.1 * W;
  const y1 = 0.08 * H;
  const len = Math.hypot(x1 - x0, y1 - y0);
  const dx = (x1 - x0) / len;
  const dy = (y1 - y0) / len;
  const bandW = H * 0.09;
  g.save();
  g.translate((x0 + x1) / 2, (y0 + y1) / 2);
  g.rotate(Math.atan2(dy, dx));
  g.scale(1, 0.16);
  const glow = g.createRadialGradient(0, 0, 0, 0, 0, len * 0.55);
  glow.addColorStop(0, "rgba(175, 165, 230, 0.12)");
  glow.addColorStop(0.6, "rgba(140, 130, 210, 0.04)");
  glow.addColorStop(1, "rgba(140, 130, 210, 0)");
  g.fillStyle = glow;
  g.fillRect(-len, -len, len * 2, len * 2);
  g.restore();
  g.globalCompositeOperation = "source-over";

  const starTints = ["#ffffff", "#d4e2ff", "#ffe8c8", "#ece8dc"];
  const bandStars = Math.floor((W * H) / 800);
  for (let i = 0; i < bandStars; i++) {
    const t = rnd();
    const off = ((rnd() + rnd() + rnd() - 1.5) / 1.5) * bandW;
    const x = x0 + dx * len * t - dy * off;
    const y = y0 + dy * len * t + dx * off;
    const s = 0.3 + rnd() * rnd() * 0.9;
    g.globalAlpha = 0.15 + rnd() * 0.45;
    g.fillStyle = starTints[Math.floor(rnd() * starTints.length)]!;
    g.fillRect(x, y, s, s);
  }

  const fieldStars = Math.floor((W * H) / 2000);
  for (let i = 0; i < fieldStars; i++) {
    const r = 0.25 + Math.pow(rnd(), 3) * 1.2;
    g.globalAlpha = 0.25 + rnd() * 0.65;
    g.fillStyle = starTints[Math.floor(rnd() * starTints.length)]!;
    g.beginPath();
    g.arc(rnd() * W, rnd() * H, r, 0, TAU);
    g.fill();
  }
  g.globalAlpha = 1;
  return c;
}

/* ====================================================================== */
/* Helpers                                                                */
/* ====================================================================== */

function smooth(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

function toRgb(hex: string): RGB {
  let h = (hex || "").trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return [159, 180, 255];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function css(c: RGB, a = 1) {
  return `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${a})`;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small seeded PRNG (mulberry32), so every planet looks the same on every visit. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
