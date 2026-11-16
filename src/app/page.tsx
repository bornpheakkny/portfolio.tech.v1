import Image from "next/image";
import Link from "next/link";
import type { Skill, SkillCategory } from "@/shared";
import { getPortfolio } from "@/lib/api";
import { cld, monthYear } from "@/lib/format";
import { SolarSystem } from "@/components/SolarSystem";
import { Header } from "@/components/Header";
import { ContactForm } from "@/components/ContactForm";
import { ORBIT_NAMES } from "@/lib/tech-info";

export default async function Home() {
  const { profile, skills, projects, experience, education } = await getPortfolio();
  const name = profile?.name ?? "Portfolio";
  const socials = Object.entries(profile?.socials ?? {}).filter(([, v]) => v) as [string, string][];
  const orbits = (Object.keys(ORBIT_NAMES) as SkillCategory[])
    .map((cat) => ({ cat, items: skills.filter((s) => s.category === cat) }))
    .filter((o) => o.items.length);
  const [featured, ...rest] = projects;

  return (
    <>
      <SolarSystem
        skills={skills}
        projects={projects.map(({ slug, title, techStack }) => ({ slug, title, techStack }))}
        experience={experience.map(({ id, role, company, techStack }) => ({ id, role, company, techStack }))}
      />
      <Header name={name} hasProjects={projects.length > 0} />

      <main>
        {/* ---------- Hero: you are the sun ---------- */}
        <section className="mx-auto flex min-h-svh max-w-6xl flex-col justify-end px-6 pb-16 pt-[46svh] lg:justify-center lg:pb-0 lg:pt-0">
          <div className="max-w-xl">
            <p className="rise text-muted" style={{ animationDelay: "0.1s" }}>
              {profile?.location}
            </p>
            <h1
              className="rise font-display mt-3 text-[clamp(2.6rem,7vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-star"
              style={{ animationDelay: "0.2s" }}
            >
              {name}
            </h1>
            <p className="rise mt-5 text-xl text-star/90 sm:text-2xl" style={{ animationDelay: "0.35s" }}>
              {profile?.headline}. Every planet out there is a technology I work with.
            </p>
            <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "0.5s" }}>
              <a href={projects.length ? "#work" : "#stack"} className="rounded-full bg-brass px-6 py-3 font-medium text-void transition hover:bg-[#f0c97c]">
                {projects.length ? "See my work" : "See my stack"}
              </a>
              <a href="#contact" className="rounded-full border border-orbit px-6 py-3 font-medium text-star transition hover:border-brass">
                Get in touch
              </a>
            </div>
          </div>
        </section>

        {/* ---------- Stack: the orbits, as a readable list ---------- */}
        <section id="stack" className="panel border-t border-orbit/60">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Stack</h2>
            <p className="mt-3 max-w-xl text-muted">
              The sun is my core frontend, what I use every day. Each orbit further out is a layer of the stack around it.
            </p>
            <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
              {orbits.map(({ cat, items }) => (
                <div key={cat}>
                  <h3 className="flex items-baseline gap-3 text-lg font-semibold">
                    <span className="text-sm font-normal text-muted">
                      {cat === "core" ? "The sun" : `Orbit ${orbits.filter((o) => o.cat !== "core").findIndex((o) => o.cat === cat) + 1}`}
                    </span>
                    {ORBIT_NAMES[cat]}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {items.map((s) => (
                      <SkillRow key={s.id} skill={s} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Work ---------- */}
        {featured && (
          <section id="work" className="panel border-t border-orbit/60">
            <div className="mx-auto max-w-6xl px-6 py-24">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Selected work</h2>

              <Link href={`/projects/${featured.slug}`} className="group mt-12 grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-orbit bg-panel">
                  {featured.coverUrl ? (
                    <Image src={cld(featured.coverUrl, 1400)} alt={featured.title} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
                  ) : (
                    <PlaceholderCover title={featured.title} />
                  )}
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold group-hover:text-brass">{featured.title}</h3>
                  <p className="mt-3 text-muted">{featured.summary}</p>
                  <TechList items={featured.techStack} />
                </div>
              </Link>

              {rest.length > 0 && (
                <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p) => (
                    <Link key={p.id} href={`/projects/${p.slug}`} className="group block">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-orbit bg-panel">
                        {p.coverUrl ? (
                          <Image src={cld(p.coverUrl, 800)} alt={p.title} fill sizes="(min-width:1024px) 33vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
                        ) : (
                          <PlaceholderCover title={p.title} />
                        )}
                      </div>
                      <h3 className="mt-4 font-semibold group-hover:text-brass">{p.title}</h3>
                      <p className="mt-1 text-sm text-muted">{p.summary}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ---------- About + experience ---------- */}
        <section id="about" className="panel border-t border-orbit/60">
          <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">About</h2>
              {profile?.avatarUrl && (
                <Image src={cld(profile.avatarUrl, 400)} alt={name} width={112} height={112} className="mt-8 size-28 rounded-full border-2 border-brass/60 object-cover" />
              )}
              <div className="mt-8 max-w-[62ch] space-y-4 text-star/90">
                {profile?.bio.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {socials.map(([key, url]) => (
                  <a key={key} href={url} target="_blank" rel="noreferrer" className="capitalize text-brass underline-offset-4 hover:underline">
                    {key}
                  </a>
                ))}
                {profile?.resumeUrl && (
                  <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-brass underline-offset-4 hover:underline">
                    Résumé (PDF)
                  </a>
                )}
              </div>
            </div>

            {(experience.length > 0 || education.length > 0) && (
              <div>
                {experience.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold">Experience</h3>
                    <ol className="mt-6 space-y-8 border-l border-orbit pl-6">
                      {experience.map((e) => (
                        <li key={e.id} className="relative">
                          <span className="absolute -left-[1.84rem] top-2 size-2.5 rounded-full bg-brass" />
                          <p className="text-sm text-muted">
                            {monthYear(e.startDate)} to {monthYear(e.endDate)}
                          </p>
                          <p className="mt-1 font-semibold">
                            {e.role}, <span className="font-normal text-star/80">{e.company}</span>
                          </p>
                          {e.description && <p className="mt-2 text-[0.95rem] text-muted">{e.description}</p>}
                          <TechList items={e.techStack} small />
                        </li>
                      ))}
                    </ol>
                  </>
                )}
                {education.length > 0 && (
                  <>
                    <h3 className="mt-12 text-lg font-semibold">Education</h3>
                    <ul className="mt-4 space-y-4">
                      {education.map((ed) => (
                        <li key={ed.id}>
                          <p className="font-medium">
                            {ed.degree}
                            {ed.field && `, ${ed.field}`}
                          </p>
                          <p className="text-sm text-muted">
                            {ed.school}, {monthYear(ed.startDate)} to {monthYear(ed.endDate)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ---------- Contact ---------- */}
        <section id="contact" className="panel border-t border-orbit/60">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Say hello</h2>
              <p className="mt-4 max-w-sm text-muted">
                Have a project, a role or a question? Send a message and I&apos;ll get back to you.
              </p>
              {profile?.email && (
                <a href={`mailto:${profile.email}`} className="mt-6 inline-block text-brass underline-offset-4 hover:underline">
                  {profile.email}
                </a>
              )}
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="panel border-t border-orbit/60">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted">
          © {new Date().getFullYear()} {name}
        </div>
      </footer>
    </>
  );
}

function SkillRow({ skill }: { skill: Skill }) {
  return (
    <li className="grid grid-cols-[1fr_8rem] items-center gap-4">
      <span className="flex items-center gap-3">
        <span className="size-3 shrink-0 rounded-full" style={{ background: skill.color, boxShadow: `0 0 10px ${skill.color}` }} />
        <span>{skill.name}</span>
      </span>
      <span className="h-1 overflow-hidden rounded-full bg-orbit/60" role="img" aria-label={`${skill.level} out of 100`}>
        <span className="block h-full rounded-full" style={{ width: `${skill.level}%`, background: skill.color }} />
      </span>
    </li>
  );
}

function TechList({ items, small }: { items: string[]; small?: boolean }) {
  if (!items.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${small ? "mt-3" : "mt-5"}`}>
      {items.map((t) => (
        <li key={t} className={`rounded-full border border-orbit text-star/80 ${small ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}>
          {t}
        </li>
      ))}
    </ul>
  );
}

function PlaceholderCover({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,#2a2f6b,#12163a_70%)] p-8">
      <span className="font-display text-center text-2xl font-semibold text-star/70">{title}</span>
    </div>
  );
}
