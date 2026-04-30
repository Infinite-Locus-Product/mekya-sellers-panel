# Mekya Sellers Panel

Next.js seller dashboard (order management, product listing, analytics).

## Prerequisites

- **Node.js** 20 or newer
- **npm** 10+ (this repo is locked with **`package-lock.json` only** — do not add alternate lockfiles)

## Setup

```bash
npm ci
```

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Dev server (webpack) |
| `npm run dev:turbo` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm test` | Vitest (unit) |

## Package manager

Install and CI must use **npm** with the committed `package-lock.json`. Yarn/pnpm/bun lockfiles are intentionally not used to avoid dependency drift.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
