import Image from "next/image";
import type { Education, Experience, Profile } from "@/shared";
import { cld, monthYear } from "@/lib/format";
import { cx } from "@/lib/cx";
import { Section, SectionTitle } from "@/components/ui/Section";
import { TechList } from "@/components/ui/TechList";
import link from "@/components/ui/link.module.css";
import styles from "./About.module.css";

/** Bio, links, and the experience / education timeline. */
export function About({
  name,
  profile,
  experience,
  education,
}: {
  name: string;
  profile: Profile | null;
  experience: Experience[];
  education: Education[];
}) {
  const socials = Object.entries(profile?.socials ?? {}).filter(([, v]) => v) as [string, string][];

  return (
    <Section id="about" className={styles.inner}>
      <div>
        <SectionTitle>About</SectionTitle>
        {profile?.avatarUrl && <Image src={cld(profile.avatarUrl, 400)} alt={name} width={112} height={112} className={styles.avatar} />}
        <div className={styles.bio}>{profile?.bio.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}</div>
        <div className={styles.links}>
          {socials.map(([key, url]) => (
            <a key={key} href={url} target="_blank" rel="noreferrer" className={cx(link.text, styles.social)}>
              {key}
            </a>
          ))}
          {profile?.resumeUrl && (
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className={link.text}>
              Résumé (PDF)
            </a>
          )}
        </div>
      </div>

      {(experience.length > 0 || education.length > 0) && (
        <div>
          {experience.length > 0 && (
            <>
              <h3 className={styles.subTitle}>Experience</h3>
              <ol className={styles.timeline}>
                {experience.map((e) => (
                  <li key={e.id} className={styles.entry}>
                    <span className={styles.marker} />
                    <p className={styles.meta}>
                      {monthYear(e.startDate)} to {monthYear(e.endDate)}
                    </p>
                    <p className={styles.role}>
                      {e.role}, <span className={styles.company}>{e.company}</span>
                    </p>
                    {e.description && <p className={styles.description}>{e.description}</p>}
                    <TechList items={e.techStack} small className={styles.tech} />
                  </li>
                ))}
              </ol>
            </>
          )}
          {education.length > 0 && (
            <>
              <h3 className={experience.length > 0 ? styles.subTitleSpaced : styles.subTitle}>Education</h3>
              <ul className={styles.education}>
                {education.map((ed) => (
                  <li key={ed.id}>
                    <p className={styles.degree}>
                      {ed.degree}
                      {ed.field && `, ${ed.field}`}
                    </p>
                    <p className={styles.meta}>
                      {ed.school}, {monthYear(ed.startDate)} to {monthYear(ed.endDate)}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </Section>
  );
}
