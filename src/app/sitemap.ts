import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/api";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const projects = await getProjects();
  return [
    { url: site, changeFrequency: "weekly", priority: 1 },
    ...projects.map((p) => ({ url: `${site}/projects/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
