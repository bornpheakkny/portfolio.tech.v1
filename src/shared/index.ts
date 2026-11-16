/**
 * Shared zod schemas + types. The same file lives in all three repos
 * (portfolio-cms.api.v1, portfolio.tech.v1, cms.v1). Keep them in sync when you change the data model.
 */
import { z } from "zod";

/** Optional URL field: accepts a valid URL, empty string, or nothing. */
const optionalUrl = z.union([z.url(), z.literal("")]).optional().nullable();

// ---------- Profile ----------
export const socialsSchema = z.object({
  linkedin: optionalUrl,
  github: optionalUrl,
  telegram: optionalUrl,
  facebook: optionalUrl,
  website: optionalUrl,
});

export const profileSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  bio: z.string().min(1),
  location: z.string().default(""),
  email: z.email(),
  avatarUrl: optionalUrl,
  resumeUrl: optionalUrl,
  socials: socialsSchema.default({}),
});
export type ProfileInput = z.infer<typeof profileSchema>;
export type Profile = ProfileInput & { id: string; updatedAt: string };

// ---------- Skills (the "planets") ----------
export const SKILL_CATEGORIES = ["core", "framework", "styling", "testing", "tooling", "backend"] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const skillSchema = z.object({
  name: z.string().min(1),
  category: z.enum(SKILL_CATEGORIES),
  level: z.number().int().min(0).max(100).default(80),
  iconUrl: optionalUrl,
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Hex color like #61dafb").default("#61dafb"),
  description: z.string().default(""),
  orbitOrder: z.number().int().default(0),
});
export type SkillInput = z.infer<typeof skillSchema>;
export type Skill = SkillInput & { id: string };

// ---------- Projects ----------
export const projectSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase-words-with-dashes"),
  summary: z.string().min(1),
  content: z.string().default(""),
  coverUrl: optionalUrl,
  gallery: z.array(z.url()).default([]),
  techStack: z.array(z.string()).default([]),
  liveUrl: optionalUrl,
  repoUrl: optionalUrl,
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  order: z.number().int().default(0),
});
export type ProjectInput = z.infer<typeof projectSchema>;
export type Project = ProjectInput & { id: string; createdAt: string; updatedAt: string };

// ---------- Experience ----------
export const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  location: z.string().default(""),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  description: z.string().default(""),
  techStack: z.array(z.string()).default([]),
  order: z.number().int().default(0),
});
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type Experience = Omit<ExperienceInput, "startDate" | "endDate"> & {
  id: string;
  startDate: string;
  endDate: string | null;
};

// ---------- Education ----------
export const educationSchema = z.object({
  school: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().default(""),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  order: z.number().int().default(0),
});
export type EducationInput = z.infer<typeof educationSchema>;
export type Education = Omit<EducationInput, "startDate" | "endDate"> & {
  id: string;
  startDate: string;
  endDate: string | null;
};

// ---------- Media ----------
export type Media = {
  id: string;
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
  alt: string;
  createdAt: string;
};
export const mediaCreateSchema = z.object({
  publicId: z.string().min(1),
  url: z.url(),
  width: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
  format: z.string().optional().nullable(),
  bytes: z.number().int().optional().nullable(),
  alt: z.string().default(""),
});

// ---------- Contact ----------
export const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.email(),
  message: z.string().min(5).max(5000),
});
export type ContactInput = z.infer<typeof contactSchema>;
export type Message = ContactInput & { id: string; read: boolean; createdAt: string };

// ---------- Auth ----------
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const reorderSchema = z.object({
  ids: z.array(z.string()).min(1),
});

// ---------- Aggregated public payload ----------
export type PortfolioData = {
  profile: Profile | null;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
};
