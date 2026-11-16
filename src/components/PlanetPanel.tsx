"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import type { Skill } from "@/shared";
import { CATEGORY_BLURB, ORBIT_NAMES, levelWord, sameTech, techInfo } from "@/lib/tech-info";

export type ProjectRef = { slug: string; title: string; techStack: string[] };
export type ExperienceRef = { id: string; role: string; company: string; techStack: string[] };

type Nav = {
  position: number;
  total: number;
  onClose: (restoreFocus: boolean) => void;
  onStep: (dir: 1 | -1) => void;
};

const darkOf = (color: string) => `color-mix(in oklab, ${color} 40%, #05071a)`;
const firstSentence = (s: string) => s.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? s;

/* ---------------------------------------------------------------------- */
/* Planet: one technology                                                  */
/* ---------------------------------------------------------------------- */

export function PlanetPanel({
  skill,
  orbit,
  period,
  projects,
  experience,
  ...nav
}: Nav & { skill: Skill; orbit: number; period: number; projects: ProjectRef[]; experience: ExperienceRef[] }) {
  const info = techInfo(skill.name);
  const description = skill.description.trim() || info?.summary || CATEGORY_BLURB[skill.category];
  const usedIn = projects.filter((p) => p.techStack.some((t) => sameTech(t, skill.name)));
  const roles = experience.filter((e) => e.techStack.some((t) => sameTech(t, skill.name)));

  return (
    <PanelShell
      {...nav}
      id={skill.id}
      orb={skill.color}
      eyebrow={`Orbit ${orbit} · ${ORBIT_NAMES[skill.category]}`}
      title={skill.name}
      footer={
        <>
          <span className="text-muted">Orbital period {Math.round(period)} s</span>
          {info?.url && (
            <a href={info.url} target="_blank" rel="noreferrer" className="text-brass underline-offset-4 hover:underline">
              Official site ↗
            </a>
          )}
        </>
      }
    >
      <LevelBar level={skill.level} color={skill.color} />

      <p className="mt-6 text-[0.95rem] leading-relaxed text-star/90">{description}</p>

      {info && info.highlights.length > 0 && (
        <ul className="mt-5 space-y-2">
          {info.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-sm text-star/80">
              <span aria-hidden className="mt-[0.55rem] size-1.5 shrink-0 rounded-full" style={{ background: skill.color }} />
              {h}
            </li>
          ))}
        </ul>
      )}

      {(usedIn.length > 0 || roles.length > 0) && (
        <div className="mt-6 border-t border-orbit/60 pt-5">
          <h3 className="text-xs uppercase tracking-[0.14em] text-muted">Where I&apos;ve used it</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {usedIn.map((p) => (
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`} className="text-brass underline-offset-4 hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
            {roles.map((e) => (
              <li key={e.id} className="text-star/85">
                {e.role}, <span className="text-muted">{e.company}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PanelShell>
  );
}

/* ---------------------------------------------------------------------- */
/* Sun: Core Frontend (all "core" skills)                                  */
/* ---------------------------------------------------------------------- */

export function CorePanel({ skills, projects, ...nav }: Nav & { skills: Skill[]; projects: ProjectRef[] }) {
  const avg = Math.round(skills.reduce((sum, s) => sum + s.level, 0) / Math.max(1, skills.length));
  const usedIn = projects.filter((p) => p.techStack.some((t) => skills.some((s) => sameTech(t, s.name))));

  return (
    <PanelShell
      {...nav}
      id="core"
      orb="#f2b34a"
      sun
      eyebrow="The sun · centre of my stack"
      title="Core Frontend"
      footer={
        <>
          <span className="text-muted">
            {skills.length} technologies · avg {avg}%
          </span>
          <span className="text-muted">Everything else orbits these</span>
        </>
      }
    >
      <p className="text-[0.95rem] leading-relaxed text-star/90">
        The foundation of everything I build: the languages and the UI library I use every day. Frameworks, styling, testing and
        backend tools are the orbits around them.
      </p>

      <ul className="mt-6 space-y-5">
        {skills.map((s) => {
          const info = techInfo(s.name);
          const blurb = s.description.trim() || (info ? firstSentence(info.summary) : "");
          return (
            <li key={s.id}>
              <div className="flex items-center gap-3">
                <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />
                <span className="font-medium text-star">{s.name}</span>
                <span className="ml-auto text-xs text-muted">
                  {levelWord(s.level)} · {s.level}%
                </span>
              </div>
              <div className="ml-[1.375rem] mt-1.5 h-1 overflow-hidden rounded-full bg-orbit/60" role="img" aria-label={`${s.level} out of 100`}>
                <div className="h-full rounded-full" style={{ width: `${s.level}%`, background: `linear-gradient(90deg, ${darkOf(s.color)}, ${s.color})` }} />
              </div>
              {blurb && <p className="ml-[1.375rem] mt-1.5 text-[0.85rem] leading-snug text-muted">{blurb}</p>}
            </li>
          );
        })}
      </ul>

      {usedIn.length > 0 && (
        <div className="mt-6 border-t border-orbit/60 pt-5">
          <h3 className="text-xs uppercase tracking-[0.14em] text-muted">Built with it</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {usedIn.map((p) => (
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`} className="text-brass underline-offset-4 hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PanelShell>
  );
}

/* ---------------------------------------------------------------------- */
/* Shared pieces                                                           */
/* ---------------------------------------------------------------------- */

function LevelBar({ level, color }: { level: number; color: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted">Proficiency</span>
        <span className="font-medium text-star">
          {levelWord(level)} · {level}%
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-orbit/60" role="img" aria-label={`${level} out of 100`}>
        <div className="h-full rounded-full" style={{ width: `${level}%`, background: `linear-gradient(90deg, ${darkOf(color)}, ${color})` }} />
      </div>
    </div>
  );
}

/**
 * Card chrome shared by planets and the sun: non-modal dialog, focus on open,
 * Esc / click-outside to close, ← → (and Prev / Next) to move between bodies.
 */
function PanelShell({
  id,
  orb,
  sun,
  eyebrow,
  title,
  footer,
  children,
  position,
  total,
  onClose,
  onStep,
}: Nav & { id: string; orb: string; sun?: boolean; eyebrow: string; title: string; footer: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // move focus into the card when it opens (not on every switch)
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(true);
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t || ref.current?.contains(t) || t.closest?.("[data-planet], [data-sun]")) return;
      onClose(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [onClose]);

  const orbStyle = sun
    ? { background: "radial-gradient(circle at 38% 35%, #fffbe8 0%, #ffd27a 30%, #f59e3b 70%, #c2410c 100%)", boxShadow: "0 0 34px -4px #f2b34a" }
    : { background: `radial-gradient(circle at 32% 30%, #ffffff 0%, ${orb} 26%, ${darkOf(orb)} 100%)`, boxShadow: `0 0 28px -6px ${orb}` };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby="planet-title"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onStep(1);
        if (e.key === "ArrowLeft") onStep(-1);
      }}
      className="fixed inset-x-3 bottom-3 z-50 max-h-[72svh] overflow-y-auto rounded-3xl border border-orbit/80 bg-void/85 p-6 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-24 sm:max-h-[calc(100svh-8rem)] sm:w-[24rem]"
    >
      <div key={id} className="panel-in">
        <div className="flex items-start gap-4">
          <span aria-hidden className="mt-0.5 size-12 shrink-0 rounded-full" style={orbStyle} />
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{eyebrow}</p>
            <h2 id="planet-title" className="font-display mt-1 text-2xl font-semibold leading-tight text-star">
              {title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => onClose(true)}
            aria-label="Close details"
            className="-mr-2 -mt-2 rounded-full p-2 text-muted transition-colors hover:text-star"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-6">{children}</div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-orbit/60 pt-4 text-sm">{footer}</div>

        {total > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onStep(-1)}
              className="rounded-full border border-orbit px-3.5 py-1.5 text-sm text-muted transition-colors hover:border-brass hover:text-star"
            >
              ← Prev
            </button>
            <span className="text-xs text-muted">
              {position} / {total}
            </span>
            <button
              type="button"
              onClick={() => onStep(1)}
              className="rounded-full border border-orbit px-3.5 py-1.5 text-sm text-muted transition-colors hover:border-brass hover:text-star"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
