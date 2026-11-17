import type { PortfolioData, Project } from "@/shared";
import { fallbackData } from "./fallback";

const API_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");
const IS_PROD = process.env.NODE_ENV === "production";

/**
 * Pages are statically generated and cached (ISR). The CMS triggers /api/revalidate
 * on every save, and the hourly revalidate is a safety net.
 */
const cacheOpts: RequestInit = { next: { revalidate: 3600, tags: ["portfolio"] } };

/** The API runs on Render's free plan, which sleeps when idle and can take ~60s to wake. */
const ATTEMPTS = 3;
const ATTEMPT_TIMEOUT_MS = 45_000;

/**
 * Returns `null` only for a genuine 404. Any other failure (timeout, network, 5xx) throws,
 * so Next.js never caches an empty page: a failing build keeps the previous deployment live,
 * and a failing ISR revalidation keeps serving the last good page.
 */
async function getJSON<T>(path: string): Promise<T | null> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${API_URL}${path}`, { ...cacheOpts, signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS) });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      console.warn(`[api] ${path} attempt ${attempt}/${ATTEMPTS} failed:`, err instanceof Error ? err.message : err);
    }
  }
  throw new Error(`[api] ${API_URL}${path} unreachable after ${ATTEMPTS} attempts`, { cause: lastError });
}

/** In dev, fall back to placeholder data so the site still runs without the API. */
async function devSafe<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  if (IS_PROD) return load();
  try {
    return await load();
  } catch {
    return fallback;
  }
}

export async function getPortfolio(): Promise<PortfolioData> {
  return devSafe(async () => {
    const data = await getJSON<PortfolioData>("/portfolio");
    if (!data) throw new Error("[api] /portfolio returned 404");
    return {
      ...data,
      profile: data.profile ?? fallbackData.profile,
      skills: data.skills.length ? data.skills : fallbackData.skills,
    };
  }, fallbackData);
}

export const getProject = (slug: string) => devSafe(() => getJSON<Project>(`/projects/${encodeURIComponent(slug)}`), null);
export const getProjects = () => devSafe(async () => (await getJSON<Project[]>("/projects")) ?? [], []);
