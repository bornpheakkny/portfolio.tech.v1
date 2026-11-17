# portfolio.tech.v1

My personal portfolio: a solar-system themed site where I'm the sun and every technology I work with is a planet, one orbit per category.

**Stack:** Next.js 16 · React 19 · CSS Modules · canvas orrery — deployed on **Vercel**.
Content comes from [portfolio-cms.api.v1](https://github.com/bornpheakkny/portfolio-cms.api.v1) and is edited in [cms.v1](https://github.com/bornpheakkny/cms.v1).

## Run locally
```bash
pnpm install
cp .env.example .env.local
pnpm dev            # http://localhost:3000
```
In development, if the API isn't reachable the site falls back to built-in starter content.
A **production build fails** when the API can't be reached (instead of shipping an empty site), so the previous deployment stays live.

## Project structure
```
src/
  app/                    routes only: compose sections, fetch data (page.module.css next to a page when it needs styles)
  components/
    layout/               Header, Footer
    sections/             home page sections: Hero, Stack, Work, About, Contact
    ui/                   shared building blocks: Section, TechList, button / link styles
  features/
    solar-system/         canvas orrery, planet / sun detail panels, tech-info data
    contact/              contact form (client component)
  lib/                    api client, formatting, fallback data, cx() class joiner
  shared/                 types + zod schemas shared with the API and CMS
  styles/globals.css      design tokens (:root vars), reset, document-level rules
```

**Styling:** every component has a co-located `*.module.css`. Use the tokens from `styles/globals.css` (`var(--color-brass)`, `var(--gutter)`, …) rather than raw values, and put hover rules inside `@media (hover: hover)` so they don't stick on touch screens.

## Deploy to Vercel
Import the repo (framework: Next.js) and set:

| Variable | Value |
|---|---|
| `API_URL` | `https://<api>.onrender.com/api/v1` |
| `NEXT_PUBLIC_API_URL` | same as above (used by the contact form) |
| `NEXT_PUBLIC_SITE_URL` | `https://<this-site>.vercel.app` |
| `REVALIDATE_SECRET` | same value as on the API |

Pages are static (ISR). The API calls `POST /api/revalidate` whenever content changes in the CMS.

## How the orrery works
- `category` of a skill → which orbit (core = innermost) · `orbitOrder` → position · `level` → planet size · `color` → planet color
- Respects `prefers-reduced-motion`; planets fade when they pass behind the hero text.
