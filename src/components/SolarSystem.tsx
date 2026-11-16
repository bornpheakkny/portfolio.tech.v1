"use client";

import { useEffect, useRef } from "react";
import { SKILL_CATEGORIES, type Skill } from "@/shared";

type Planet = {
  name: string;
  color: string;
  size: number;
  ring: number;
  phase: number;
  speed: number;
};

const TILT = 0.36; // ellipse y-ratio: looks like an orrery seen from slightly above
const STAR_COUNT = 260;

/**
 * Full-page animated orrery. You are the sun; every skill is a planet,
 * one ring per category (core technologies on the innermost ring).
 */
export function SolarSystem({ skills }: { skills: Skill[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext("2d");
    if (!maybeCtx) return;
    const ctx: CanvasRenderingContext2D = maybeCtx;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- build rings from the categories that actually have skills
    const rings = SKILL_CATEGORIES.filter((c) => skills.some((s) => s.category === c));
    const planets: Planet[] = [];
    rings.forEach((cat, ring) => {
      const onRing = skills.filter((s) => s.category === cat).sort((a, b) => a.orbitOrder - b.orbitOrder);
      onRing.forEach((s, i) => {
        planets.push({
          name: s.name,
          color: s.color || "#9fb4ff",
          size: 3.5 + (s.level / 100) * 5,
          ring,
          phase: (i / onRing.length) * Math.PI * 2 + ring * 0.9,
          // Kepler-ish: outer rings move slower
          speed: 0.11 / Math.pow(ring + 1, 0.85),
        });
      });
    });

    // ---- stars (normalised 0..1 coords so resize keeps them)
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.6 + 0.2,
      tw: Math.random() * 2 + 0.5,
      ph: Math.random() * Math.PI * 2,
    }));

    let w = 0;
    let h = 0;
    let dpr = 1;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduceMotion) draw(8);
    };

    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / w - 0.5) * 2;
      pointer.ty = (e.clientY / h - 0.5) * 2;
    };

    function draw(t: number) {
      const wide = w >= 1024;
      const unit = Math.min(w, h * 1.6);
      const cx = (wide ? w * 0.67 : w * 0.5) + pointer.x * 14;
      const cy = (wide ? h * 0.5 : h * 0.3) + pointer.y * 10;
      const inner = unit * (wide ? 0.13 : 0.16);
      const gap = unit * (wide ? 0.072 : 0.085);
      const scrollFade = Math.max(0.35, 1 - window.scrollY / (h * 1.2));

      ctx.clearRect(0, 0, w, h);

      // stars
      for (const s of stars) {
        const twinkle = reduceMotion ? 1 : 0.65 + 0.35 * Math.sin(t * s.tw + s.ph);
        ctx.globalAlpha = s.a * twinkle;
        ctx.fillStyle = "#ece8dc";
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = scrollFade;

      // orbits
      rings.forEach((_, i) => {
        const rx = inner + i * gap;
        ctx.strokeStyle = "rgba(122, 130, 200, 0.28)";
        ctx.lineWidth = 1;
        ctx.setLineDash(i === 0 ? [] : [2, 5]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, rx * TILT, 0, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // planet positions
      const placed = planets.map((p) => {
        const rx = inner + p.ring * gap;
        const a = p.phase + t * p.speed;
        const depth = Math.sin(a); // >0 = in front of the sun
        return {
          p,
          x: cx + Math.cos(a) * rx,
          y: cy + Math.sin(a) * rx * TILT,
          depth,
          scale: 0.8 + (depth + 1) * 0.18,
        };
      });

      // keep the hero text readable: planets passing behind it go faint
      const textEdge = wide ? w * 0.56 : 0;
      const drawPlanet = (o: (typeof placed)[number]) => {
        const r = o.p.size * o.scale;
        const behindText = o.x < textEdge;
        ctx.globalAlpha = scrollFade * (behindText ? 0.22 : 1);
        const g = ctx.createRadialGradient(o.x - r * 0.35, o.y - r * 0.35, r * 0.1, o.x, o.y, r);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.25, o.p.color);
        g.addColorStop(1, shade(o.p.color, -0.55));
        ctx.shadowColor = o.p.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        const showLabel = !behindText && (wide || o.depth >= 0);
        if (showLabel) {
          ctx.font = `500 ${o.p.ring === 0 ? 12.5 : 11.5}px "IBM Plex Sans", system-ui, sans-serif`;
          ctx.fillStyle = `rgba(236, 232, 220, ${0.45 + (o.depth + 1) * 0.22})`;
          ctx.fillText(o.p.name, o.x + r + 6, o.y + 4);
        }
      };

      // behind the sun
      placed.filter((o) => o.depth < 0).forEach(drawPlanet);

      // the sun (you)
      ctx.globalAlpha = scrollFade;
      const sunR = inner * 0.3;
      const glow = ctx.createRadialGradient(cx, cy, sunR * 0.2, cx, cy, sunR * 4);
      glow.addColorStop(0, "rgba(227, 184, 102, 0.55)");
      glow.addColorStop(0.35, "rgba(227, 140, 70, 0.14)");
      glow.addColorStop(1, "rgba(227, 140, 70, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR * 4, 0, Math.PI * 2);
      ctx.fill();
      const core = ctx.createRadialGradient(cx - sunR * 0.3, cy - sunR * 0.3, sunR * 0.1, cx, cy, sunR);
      core.addColorStop(0, "#fff6dc");
      core.addColorStop(0.45, "#f2c876");
      core.addColorStop(1, "#c98a3a");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
      ctx.fill();

      // in front of the sun
      placed.filter((o) => o.depth >= 0).forEach(drawPlanet);
      ctx.globalAlpha = 1;
    }

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      draw((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointer);
      raf = requestAnimationFrame(loop);
    } else {
      window.addEventListener("scroll", () => draw(8), { passive: true });
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [skills]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}

/** Darken (amount < 0) or lighten a hex color. */
function shade(hex: string, amount: number) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  const f = (c: number) => Math.round(Math.min(255, Math.max(0, amount < 0 ? c * (1 + amount) : c + (255 - c) * amount)));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `rgb(${r}, ${g}, ${b})`;
}
