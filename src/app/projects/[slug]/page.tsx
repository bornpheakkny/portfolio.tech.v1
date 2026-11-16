import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolio, getProject, getProjects } from "@/lib/api";
import { cld } from "@/lib/format";
import { Header } from "@/components/Header";

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
      <main className="panel min-h-svh">
        <article className="mx-auto max-w-3xl px-6 pb-24 pt-32">
          <Link href="/#work" className="text-sm text-muted hover:text-star">
            Back to all work
          </Link>
          <h1 className="font-display mt-6 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-tight tracking-tight">{project.title}</h1>
          <p className="mt-4 text-xl text-star/85">{project.summary}</p>

          <div className="mt-6 flex flex-wrap gap-4">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="rounded-full bg-brass px-5 py-2.5 font-medium text-void">
                Open live site
              </a>
            )}
            {(project.repos ?? []).map((repo) => (
              <a
                key={repo.url}
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-orbit px-5 py-2.5 font-medium transition-colors hover:border-brass"
              >
                <RepoIcon url={repo.url} />
                {repo.label}
              </a>
            ))}
          </div>
          {(project.repos?.length ?? 0) > 1 && (
            <p className="mt-3 text-sm text-muted">This project is split across {project.repos.length} repositories.</p>
          )}

          {project.coverUrl && (
            <div className="relative mt-12 aspect-[16/10] overflow-hidden rounded-3xl border border-orbit">
              <Image src={cld(project.coverUrl, 1600)} alt={project.title} fill priority sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
            </div>
          )}

          {project.techStack.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2">
              {project.techStack.map((t) => (
                <li key={t} className="rounded-full border border-orbit px-3 py-1 text-sm text-star/80">
                  {t}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 max-w-[68ch] space-y-5 text-star/90">
            {project.content.split(/\n{2,}/).map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>

          {project.gallery.length > 0 && (
            <div className="mt-14 grid gap-4 sm:grid-cols-2">
              {project.gallery.map((url) => (
                <div key={url} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-orbit">
                  <Image src={cld(url, 1000)} alt="" fill sizes="(min-width:640px) 384px, 100vw" className="object-cover" />
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
      <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  );
}
