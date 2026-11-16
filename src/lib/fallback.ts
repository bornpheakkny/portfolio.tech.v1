import type { PortfolioData } from "@/shared";

/** Used when the API is unreachable (e.g. Render cold start during a Vercel build). */
export const fallbackData: PortfolioData = {
  profile: {
    id: "fallback",
    name: "Pheakkorny Born",
    headline: "Frontend Developer",
    bio: "Frontend developer based in Phnom Penh, Cambodia. I build fast, accessible interfaces with React and TypeScript — from design systems and component libraries to data-heavy admin consoles.",
    location: "Phnom Penh, Cambodia",
    email: "",
    avatarUrl: null,
    resumeUrl: null,
    socials: {
      linkedin: "https://www.linkedin.com/in/pheakkorny-born-15259b249",
      github: "https://github.com/bornpheakkny",
    },
    updatedAt: new Date(0).toISOString(),
  },
  skills: [
    { id: "1", name: "React", category: "core", color: "#61dafb", level: 90, orbitOrder: 0, description: "", iconUrl: null },
    { id: "2", name: "TypeScript", category: "core", color: "#3178c6", level: 88, orbitOrder: 1, description: "", iconUrl: null },
    { id: "3", name: "JavaScript", category: "core", color: "#f7df1e", level: 90, orbitOrder: 2, description: "", iconUrl: null },
    { id: "4", name: "HTML", category: "core", color: "#e34f26", level: 92, orbitOrder: 3, description: "", iconUrl: null },
    { id: "5", name: "CSS", category: "core", color: "#1572b6", level: 90, orbitOrder: 4, description: "", iconUrl: null },
    { id: "6", name: "Next.js", category: "framework", color: "#e8e8e8", level: 80, orbitOrder: 0, description: "", iconUrl: null },
    { id: "7", name: "Tailwind CSS", category: "styling", color: "#38bdf8", level: 85, orbitOrder: 0, description: "", iconUrl: null },
    { id: "8", name: "Testing", category: "testing", color: "#c2577a", level: 75, orbitOrder: 0, description: "", iconUrl: null },
    { id: "9", name: "Node.js", category: "backend", color: "#5fa04e", level: 70, orbitOrder: 0, description: "", iconUrl: null },
  ],
  projects: [],
  experience: [],
  education: [],
};
