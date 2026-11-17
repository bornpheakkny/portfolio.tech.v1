import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/shared";
import { cld } from "@/lib/format";
import { Section, SectionTitle } from "@/components/ui/Section";
import { TechList } from "@/components/ui/TechList";
import styles from "./Work.module.css";

/** Selected work: the first project is featured, the rest form a grid. */
export function Work({ projects }: { projects: Project[] }) {
  const [featured, ...rest] = projects;
  if (!featured) return null;

  return (
    <Section id="work">
      <SectionTitle>Selected work</SectionTitle>

      <Link href={`/projects/${featured.slug}`} className={styles.featured}>
        <div className={styles.cover}>
          {featured.coverUrl ? (
            <Image src={cld(featured.coverUrl, 1400)} alt={featured.title} fill sizes="(min-width:1024px) 60vw, 100vw" className={styles.image} />
          ) : (
            <PlaceholderCover title={featured.title} />
          )}
        </div>
        <div>
          <h3 className={styles.featuredTitle}>{featured.title}</h3>
          <p className={styles.summary}>{featured.summary}</p>
          <TechList items={featured.techStack} className={styles.tech} />
        </div>
      </Link>

      {rest.length > 0 && (
        <div className={styles.grid}>
          {rest.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`} className={styles.card}>
              <div className={styles.coverSmall}>
                {p.coverUrl ? (
                  <Image src={cld(p.coverUrl, 800)} alt={p.title} fill sizes="(min-width:1024px) 33vw, 50vw" className={styles.image} />
                ) : (
                  <PlaceholderCover title={p.title} />
                )}
              </div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardSummary}>{p.summary}</p>
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}

function PlaceholderCover({ title }: { title: string }) {
  return (
    <div className={styles.placeholder}>
      <span className={styles.placeholderTitle}>{title}</span>
    </div>
  );
}
