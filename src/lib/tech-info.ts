import type { SkillCategory } from "@/shared";

export const ORBIT_NAMES: Record<SkillCategory, string> = {
  core: "Core frontend",
  framework: "Frameworks",
  styling: "Styling",
  testing: "Testing",
  tooling: "Tooling",
  backend: "Backend",
};

/** Used when neither the CMS nor the built-in library has a description. */
export const CATEGORY_BLURB: Record<SkillCategory, string> = {
  core: "One of the core technologies I work with every day.",
  framework: "A framework I build applications with.",
  styling: "Part of how I style and lay out interfaces.",
  testing: "Part of how I keep software reliable as it changes.",
  tooling: "Part of the tooling that keeps my workflow fast.",
  backend: "Part of the server side I build and connect to.",
};

export type TechInfo = { summary: string; highlights: string[]; url?: string };

/**
 * Built-in descriptions of common technologies. A description written in the CMS
 * always wins; this is the fallback so every planet has something to say.
 */
const INFO: Record<string, TechInfo> = {
  react: {
    summary:
      "A JavaScript library for building user interfaces out of reusable components. React keeps the UI in sync with state and scales from a single widget to large single-page apps.",
    highlights: ["Component-based UI", "Hooks for state and side effects", "Huge ecosystem: Next.js, React Native, TanStack"],
    url: "https://react.dev",
  },
  typescript: {
    summary:
      "JavaScript with static types. TypeScript catches whole classes of bugs before the code runs and makes large codebases easier to navigate and refactor.",
    highlights: ["Static type checking", "First-class editor autocompletion", "Compiles to plain JavaScript"],
    url: "https://www.typescriptlang.org",
  },
  javascript: {
    summary:
      "The programming language of the web. It runs in every browser and, through runtimes like Node.js, on servers and tooling too.",
    highlights: ["Event-driven and asynchronous", "Modern ES2015+ syntax and modules", "Runs everywhere"],
    url: "https://developer.mozilla.org/docs/Web/JavaScript",
  },
  html: {
    summary:
      "The markup language that gives every web page its structure. Semantic HTML is the foundation of accessible, search-friendly sites.",
    highlights: ["Semantic document structure", "Accessibility built in", "Forms, media and metadata"],
    url: "https://developer.mozilla.org/docs/Web/HTML",
  },
  css: {
    summary:
      "The language that styles the web: layout, color, typography and motion. Modern CSS brings Grid, Flexbox, custom properties and container queries.",
    highlights: ["Grid and Flexbox layout", "Custom properties and theming", "Animations and transitions"],
    url: "https://developer.mozilla.org/docs/Web/CSS",
  },
  nextjs: {
    summary:
      "A React framework for production sites: file-based routing, server components, static generation and on-demand revalidation. This portfolio is built with it.",
    highlights: ["Server and client components", "Static generation with revalidation", "Image, font and route optimisation"],
    url: "https://nextjs.org",
  },
  tailwindcss: {
    summary:
      "A utility-first CSS framework. Styles are composed in markup from small, consistent building blocks, which keeps design systems tight and CSS bundles small.",
    highlights: ["Utility-first styling", "Design tokens via theme", "Only ships the CSS you use"],
    url: "https://tailwindcss.com",
  },
  testing: {
    summary:
      "Automated tests that keep software working as it changes: unit tests for logic, component tests for UI and end-to-end tests for real user flows.",
    highlights: ["Unit and component tests", "End-to-end user flows", "Confidence to refactor"],
  },
  nodejs: {
    summary:
      "A JavaScript runtime built on the V8 engine. It runs JavaScript on servers, CLIs and build tools, and powers the API behind this site.",
    highlights: ["Non-blocking, event-driven I/O", "npm, the largest package ecosystem", "One language across front and back end"],
    url: "https://nodejs.org",
  },
  vue: {
    summary: "A progressive JavaScript framework for building user interfaces, known for its approachable templates and reactivity system.",
    highlights: ["Reactive data binding", "Single-file components", "Gentle learning curve"],
    url: "https://vuejs.org",
  },
  angular: {
    summary: "A full-featured TypeScript framework from Google for building large, structured web applications.",
    highlights: ["Batteries included", "Dependency injection", "Strong conventions for big teams"],
    url: "https://angular.dev",
  },
  svelte: {
    summary: "A compiler-based UI framework that turns components into small, fast vanilla JavaScript at build time.",
    highlights: ["No virtual DOM", "Tiny bundles", "Built-in transitions"],
    url: "https://svelte.dev",
  },
  redux: {
    summary: "A predictable state container for JavaScript apps, with one store and pure reducer functions.",
    highlights: ["Single source of truth", "Time-travel debugging", "Redux Toolkit for less boilerplate"],
    url: "https://redux.js.org",
  },
  tanstackquery: {
    summary: "Data-fetching and caching for web apps: it handles loading states, background refetching and cache invalidation for server data.",
    highlights: ["Automatic caching", "Background refetching", "Mutations with optimistic updates"],
    url: "https://tanstack.com/query",
  },
  sass: {
    summary: "A CSS preprocessor that adds variables, nesting, mixins and functions to stylesheets.",
    highlights: ["Variables and nesting", "Mixins and functions", "Compiles to standard CSS"],
    url: "https://sass-lang.com",
  },
  jest: {
    summary: "A JavaScript testing framework with a built-in runner, assertions, mocking and snapshot testing.",
    highlights: ["Zero-config setup", "Snapshot testing", "Powerful mocking"],
    url: "https://jestjs.io",
  },
  vitest: {
    summary: "A fast unit-test framework powered by Vite, with a Jest-compatible API.",
    highlights: ["Native ES modules and TypeScript", "Instant watch mode", "Jest-compatible API"],
    url: "https://vitest.dev",
  },
  playwright: {
    summary: "End-to-end testing across Chromium, Firefox and WebKit, driving real browsers like a user would.",
    highlights: ["Cross-browser testing", "Auto-waiting, less flakiness", "Trace viewer for debugging"],
    url: "https://playwright.dev",
  },
  cypress: {
    summary: "End-to-end and component testing that runs in the browser with a visual, time-travelling test runner.",
    highlights: ["Interactive test runner", "Automatic waiting", "Component testing"],
    url: "https://www.cypress.io",
  },
  git: {
    summary: "The distributed version-control system behind almost every codebase: branches, history and collaboration.",
    highlights: ["Branching and merging", "Full local history", "Works with GitHub and GitLab"],
    url: "https://git-scm.com",
  },
  vite: {
    summary: "A modern frontend build tool with an instant dev server and optimised production builds. The CMS for this site runs on it.",
    highlights: ["Instant dev server", "Hot module replacement", "Optimised production builds"],
    url: "https://vite.dev",
  },
  webpack: {
    summary: "A module bundler that turns an app's JavaScript, styles and assets into optimised bundles.",
    highlights: ["Code splitting", "Loaders and plugins", "Mature ecosystem"],
    url: "https://webpack.js.org",
  },
  docker: {
    summary: "Packages applications and their dependencies into containers that run the same everywhere.",
    highlights: ["Reproducible environments", "Lightweight containers", "Compose for multi-service apps"],
    url: "https://www.docker.com",
  },
  express: {
    summary: "A minimal, flexible web framework for Node.js, used to build APIs and servers. The API behind this site uses it.",
    highlights: ["Simple routing", "Middleware architecture", "Huge ecosystem"],
    url: "https://expressjs.com",
  },
  prisma: {
    summary: "A type-safe database toolkit for TypeScript: schema, migrations and an auto-generated query client.",
    highlights: ["Type-safe queries", "Declarative schema", "Migrations built in"],
    url: "https://www.prisma.io",
  },
  postgresql: {
    summary: "A powerful open-source relational database known for reliability, standards compliance and rich features.",
    highlights: ["ACID transactions", "JSON and full-text search", "Extensible"],
    url: "https://www.postgresql.org",
  },
  mongodb: {
    summary: "A document database that stores flexible, JSON-like records and scales horizontally.",
    highlights: ["Flexible document model", "Aggregation pipeline", "Horizontal scaling"],
    url: "https://www.mongodb.com",
  },
  graphql: {
    summary: "A query language for APIs that lets clients ask for exactly the data they need in one request.",
    highlights: ["Strongly typed schema", "No over-fetching", "Single endpoint"],
    url: "https://graphql.org",
  },
  figma: {
    summary: "A collaborative interface-design tool for wireframes, prototypes and design systems.",
    highlights: ["Real-time collaboration", "Components and variables", "Dev Mode handoff"],
    url: "https://www.figma.com",
  },
  storybook: {
    summary: "A workshop for building, documenting and testing UI components in isolation.",
    highlights: ["Isolated component development", "Living documentation", "Visual and interaction tests"],
    url: "https://storybook.js.org",
  },
  python: {
    summary: "A readable, general-purpose programming language used for scripting, automation, data and back-end services.",
    highlights: ["Readable syntax", "Huge standard library", "Data and AI ecosystem"],
    url: "https://www.python.org",
  },
};

const ALIASES: Record<string, string> = {
  reactjs: "react",
  ts: "typescript",
  js: "javascript",
  html5: "html",
  css3: "css",
  next: "nextjs",
  tailwind: "tailwindcss",
  node: "nodejs",
  vuejs: "vue",
  reactquery: "tanstackquery",
  scss: "sass",
  postgres: "postgresql",
  expressjs: "express",
  github: "git",
};

/** "Next.js" → "nextjs", "Tailwind CSS" → "tailwindcss" */
export const techKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

export function techInfo(name: string): TechInfo | undefined {
  const key = techKey(name);
  return INFO[ALIASES[key] ?? key];
}

export function sameTech(a: string, b: string) {
  const ka = techKey(a);
  const kb = techKey(b);
  return (ALIASES[ka] ?? ka) === (ALIASES[kb] ?? kb);
}

export function levelWord(level: number) {
  if (level >= 90) return "Expert";
  if (level >= 75) return "Advanced";
  if (level >= 60) return "Proficient";
  if (level >= 40) return "Intermediate";
  return "Learning";
}
