import type { PortfolioData, Project } from "@/shared";
import { fallbackData } from "./fallback";

const API_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");

/**
 * Pages are statically generated and cached (ISR). The CMS triggers /api/revalidate
 * on every save, and the hourly revalidate is a safety net.
 */
const cacheOpts: RequestInit = { next: { revalidate: 3600, tags: ["portfolio"] } };

async function getJSON<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { ...cacheOpts, signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getPortfolio(): Promise<PortfolioData> {
  const data = await getJSON<PortfolioData>("/portfolio");
  if (!data) return fallbackData;
  return {
    ...data,
    profile: data.profile ?? fallbackData.profile,
    skills: data.skills.length ? data.skills : fallbackData.skills,
  };
}

export const getProject = (slug: string) => getJSON<Project>(`/projects/${encodeURIComponent(slug)}`);
export const getProjects = async () => (await getJSON<Project[]>("/projects")) ?? [];
