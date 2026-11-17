import { getPortfolio } from "@/lib/api";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Stack } from "@/components/sections/Stack";
import { Work } from "@/components/sections/Work";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { SolarSystem } from "@/features/solar-system/SolarSystem";

export default async function Home() {
  const { profile, skills, projects, experience, education } = await getPortfolio();
  const name = profile?.name ?? "Portfolio";

  return (
    <>
      <SolarSystem
        skills={skills}
        projects={projects.map(({ slug, title, techStack }) => ({ slug, title, techStack }))}
        experience={experience.map(({ id, role, company, techStack }) => ({ id, role, company, techStack }))}
      />
      <Header name={name} hasProjects={projects.length > 0} />

      <main>
        <Hero name={name} location={profile?.location} headline={profile?.headline} hasProjects={projects.length > 0} />
        <Stack skills={skills} />
        <Work projects={projects} />
        <About name={name} profile={profile} experience={experience} education={education} />
        <Contact email={profile?.email} />
      </main>

      <Footer name={name} />
    </>
  );
}
