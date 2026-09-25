# Collectively Bzy public site

Separate public-site scaffold for `collectivelybzy.com`.

## Current state

This is a local Astro scaffold with:

- Studio and Play visual template families
- Home, apps, games, projects, store specials, and support routes
- App, game, and project detail-page templates
- **Blue Velocity**, a playable randomized dolphin-runner at `/games/blue-velocity/`
- The matching Godot 4 source project under `godot/blue_velocity/`, with a Web export preset for itch.io
- Local placeholder content in `src/data/content.ts`
- A Sanity boundary document with no credentials or external configuration
- Read-only build-time Sanity connection for published content, with local fallback content until each collection is seeded

The project is connected locally to the approved Sanity project for published-content reads only. It has not been connected to Cloudflare Pages or DNS.

## Local development

Node.js is not currently installed in the workspace environment. Once it is available:

```sh
npm install
npm run dev
```

The Godot project is independent of the Astro site and can be opened directly from `godot/blue_velocity/project.godot`. The site currently includes a lightweight browser build; the Godot project is the editable 3D source for native and itch.io Web exports.

Use port `4322` when Sanity login callbacks need port `4321`:

```sh
npm run dev -- --port 4322
```

Astro reads only published Sanity documents whose **Display on public site** switch is on. Content changes appear after the next Astro build. The local `.env` contains only the Sanity project ID and dataset name; it contains no write token.

The intended production path is Astro static output on Cloudflare Pages, with published content read from a separately protected Sanity Studio/content project.

## Safety boundary

Do not add, inspect, proxy, or reuse any Apple, Fly.io, DNS, signing, token, secret, filtering-service, or Scroll in Peace configuration here. See `docs/CMS-BOUNDARY.md`.
