"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import type { Skill } from "@/shared";
import link from "@/components/ui/link.module.css";
import { CATEGORY_BLURB, ORBIT_NAMES, levelWord, sameTech, techInfo } from "./tech-info";
import styles from "./PlanetPanel.module.css";

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
          <span className={styles.muted}>Orbital period {Math.round(period)} s</span>
          {info?.url && (
            <a href={info.url} target="_blank" rel="noreferrer" className={link.text}>
              Official site ↗
            </a>
          )}
        </>
      }
    >
      <LevelBar level={skill.level} color={skill.color} />

      <p className={styles.descriptionSpaced}>{description}</p>

      {info && info.highlights.length > 0 && (
        <ul className={styles.highlights}>
          {info.highlights.map((h) => (
            <li key={h} className={styles.highlight}>
              <span aria-hidden className={styles.bullet} style={{ background: skill.color }} />
              {h}
            </li>
          ))}
        </ul>
      )}

      {(usedIn.length > 0 || roles.length > 0) && (
        <div className={styles.related}>
          <h3 className={styles.relatedTitle}>Where I&apos;ve used it</h3>
          <ul className={styles.relatedList}>
            {usedIn.map((p) => (
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`} className={link.text}>
                  {p.title}
                </Link>
              </li>
            ))}
            {roles.map((e) => (
              <li key={e.id} className={styles.roleItem}>
                {e.role}, <span className={styles.muted}>{e.company}</span>
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
          <span className={styles.muted}>
            {skills.length} technologies · avg {avg}%
          </span>
          <span className={styles.muted}>Everything else orbits these</span>
        </>
      }
    >
      <p className={styles.description}>
        The foundation of everything I build: the languages and the UI library I use every day. Frameworks, styling, testing and
        backend tools are the orbits around them.
      </p>

      <ul className={styles.coreList}>
        {skills.map((s) => {
          const info = techInfo(s.name);
          const blurb = s.description.trim() || (info ? firstSentence(info.summary) : "");
          return (
            <li key={s.id}>
              <div className={styles.coreRow}>
                <span aria-hidden className={styles.coreDot} style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />
                <span className={styles.coreName}>{s.name}</span>
                <span className={styles.coreLevel}>
                  {levelWord(s.level)} · {s.level}%
                </span>
              </div>
              <div className={styles.coreTrack} role="img" aria-label={`${s.level} out of 100`}>
                <div className={styles.fill} style={{ width: `${s.level}%`, background: `linear-gradient(90deg, ${darkOf(s.color)}, ${s.color})` }} />
              </div>
              {blurb && <p className={styles.coreBlurb}>{blurb}</p>}
            </li>
          );
        })}
      </ul>

      {usedIn.length > 0 && (
        <div className={styles.related}>
          <h3 className={styles.relatedTitle}>Built with it</h3>
          <ul className={styles.relatedList}>
            {usedIn.map((p) => (
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`} className={link.text}>
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
      <div className={styles.levelHead}>
        <span className={styles.muted}>Proficiency</span>
        <span className={styles.levelValue}>
          {levelWord(level)} · {level}%
        </span>
      </div>
      <div className={styles.levelTrack} role="img" aria-label={`${level} out of 100`}>
        <div className={styles.fill} style={{ width: `${level}%`, background: `linear-gradient(90deg, ${darkOf(color)}, ${color})` }} />
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
      className={styles.dialog}
    >
      <div key={id} className={styles.content}>
        <div className={styles.head}>
          <span aria-hidden className={styles.orb} style={orbStyle} />
          <div className={styles.titles}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2 id="planet-title" className={styles.title}>
              {title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => onClose(true)}
            aria-label="Close details"
            className={styles.close}
          >
            <svg viewBox="0 0 24 24" className={styles.closeIcon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>{children}</div>

        <div className={styles.footer}>{footer}</div>

        {total > 1 && (
          <div className={styles.pager}>
            <button
              type="button"
              onClick={() => onStep(-1)}
              className={styles.pageButton}
            >
              ← Prev
            </button>
            <span className={styles.count}>
              {position} / {total}
            </span>
            <button
              type="button"
              onClick={() => onStep(1)}
              className={styles.pageButton}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
