import type { Skill, SkillCategory } from "@/shared";
import { Section, SectionTitle } from "@/components/ui/Section";
import { ORBIT_NAMES } from "@/features/solar-system/tech-info";
import styles from "./Stack.module.css";

/** The orbits, as a readable list. */
export function Stack({ skills }: { skills: Skill[] }) {
  const orbits = (Object.keys(ORBIT_NAMES) as SkillCategory[])
    .map((cat) => ({ cat, items: skills.filter((s) => s.category === cat) }))
    .filter((o) => o.items.length);
  const outer = orbits.filter((o) => o.cat !== "core");

  return (
    <Section id="stack">
      <SectionTitle>Stack</SectionTitle>
      <p className={styles.intro}>
        The sun is my core frontend, what I use every day. Each orbit further out is a layer of the stack around it.
      </p>
      <div className={styles.grid}>
        {orbits.map(({ cat, items }) => (
          <div key={cat}>
            <h3 className={styles.orbitTitle}>
              <span className={styles.orbitLabel}>
                {cat === "core" ? "The sun" : `Orbit ${outer.findIndex((o) => o.cat === cat) + 1}`}
              </span>
              {ORBIT_NAMES[cat]}
            </h3>
            <ul className={styles.list}>
              {items.map((s) => (
                <SkillRow key={s.id} skill={s} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SkillRow({ skill }: { skill: Skill }) {
  return (
    <li className={styles.row}>
      <span className={styles.skill}>
        <span className={styles.dot} style={{ background: skill.color, boxShadow: `0 0 10px ${skill.color}` }} />
        <span>{skill.name}</span>
      </span>
      <span className={styles.track} role="img" aria-label={`${skill.level} out of 100`}>
        <span className={styles.fill} style={{ width: `${skill.level}%`, background: skill.color }} />
      </span>
    </li>
  );
}
