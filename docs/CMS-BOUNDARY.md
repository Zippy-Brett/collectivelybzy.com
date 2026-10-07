# CMS boundary

This public site is intentionally separate from Scroll in Peace and its private infrastructure.

## CMS shape

- Storyblok is the selected CMS for the public site.
- Astro reads Storyblok content through its read-only Content Delivery API.
- Storyblok editor access, users, roles, and schema remain outside this public frontend.
- Preview tokens belong only in local ignored environment files; they are never committed.
- Editor login should use the CMS account's available security controls.
- No `*.sip.collectivelybzy.com` address may be used by this project.

## Editorial safeguards

- Owner/admin controls users, roles, schema, templates, themes, integrations, and publishing.
- Store managers create drafts for specials and announcements.
- Games Curator manages only approved game records and visibility.
- New game packages, origins, themes, and scripts require owner approval.
- No arbitrary HTML, CSS, JavaScript, or public write endpoints are part of the public site.

The current content in `src/data/content.ts` is the local catalog used when Storyblok is unconfigured. Once connected, Storyblok is authoritative for app, game, project, and store collections. Configured API failures stop the build. Temporary app-only merge mode is documented in RELEASE.md and must be removed after migration. Existing approved game package paths and music embed origins remain in source code.
