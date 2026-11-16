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
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noreferrer" className="rounded-full border border-orbit px-5 py-2.5 font-medium hover:border-brass">
                View source
              </a>
            )}
          </div>

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
