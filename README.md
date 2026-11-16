# portfolio.tech.v1

My personal portfolio: a solar-system themed site where I'm the sun and every technology I work with is a planet, one orbit per category.

**Stack:** Next.js 16 · React 19 · Tailwind 4 · canvas orrery — deployed on **Vercel**.
Content comes from [portfolio-cms.api.v1](https://github.com/bornpheakkny/portfolio-cms.api.v1) and is edited in [cms.v1](https://github.com/bornpheakkny/cms.v1).

## Run locally
```bash
pnpm install
cp .env.example .env.local
pnpm dev            # http://localhost:3000
```
If the API isn't reachable the site falls back to built-in starter content, so it always builds.

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
