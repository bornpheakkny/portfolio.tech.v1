import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolio, getProject, getProjects } from "@/lib/api";
import { cld } from "@/lib/format";
import { cx } from "@/lib/cx";
import { Header } from "@/components/layout/Header";
import { TechList } from "@/components/ui/TechList";
import button from "@/components/ui/button.module.css";
import link from "@/components/ui/link.module.css";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: { images: project.coverUrl ? [cld(project.coverUrl, 1200)] : [] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [project, { profile }] = await Promise.all([getProject(slug), getPortfolio()]);
  if (!project) notFound();

  return (
    <>
      <Header name={profile?.name ?? "Portfolio"} hasProjects />
      <main className={styles.main}>
        <article className={styles.article}>
          <Link href="/#work" className={cx(link.quiet, styles.back)}>
            Back to all work
          </Link>
          <h1 className={styles.title}>{project.title}</h1>
          <p className={styles.summary}>{project.summary}</p>

          <div className={styles.actions}>
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className={cx(button.primary, button.compact)}>
                Open live site
              </a>
            )}
            {(project.repos ?? []).map((repo) => (
              <a
                key={repo.url}
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className={cx(button.outline, button.compact)}
              >
                <RepoIcon url={repo.url} />
                {repo.label}
              </a>
            ))}
          </div>
          {(project.repos?.length ?? 0) > 1 && (
            <p className={styles.note}>This project is split across {project.repos.length} repositories.</p>
          )}

          {project.coverUrl && (
            <div className={styles.cover}>
              <Image src={cld(project.coverUrl, 1600)} alt={project.title} fill priority sizes="(min-width:768px) 768px, 100vw" className={styles.image} />
            </div>
          )}

          <TechList items={project.techStack} className={styles.tech} />

          <div className={styles.content}>
            {project.content.split(/\n{2,}/).map((para, i) => (
              <p key={i} className={styles.paragraph}>
                {para}
              </p>
            ))}
          </div>

          {project.gallery.length > 0 && (
            <div className={styles.gallery}>
              {project.gallery.map((url) => (
                <div key={url} className={styles.shot}>
                  <Image src={cld(url, 1000)} alt="" fill sizes="(min-width:640px) 384px, 100vw" className={styles.image} />
                </div>
              ))}
            </div>
          )}
        </article>
      </main>
    </>
  );
}

/** GitHub mark for GitHub links, a generic code icon for anything else. */
function RepoIcon({ url }: { url: string }) {
  if (/github\.com/i.test(url)) {
    return (
      <svg aria-hidden viewBox="0 0 16 16" className={styles.icon} fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={styles.icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  );
}
