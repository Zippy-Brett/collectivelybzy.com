# CMS boundary

This public site is intentionally separate from Scroll in Peace and its private infrastructure.

## Planned CMS shape

- Sanity Studio will eventually live at a separate address such as `cms.collectivelybzy.com`.
- Editor login should be protected with MFA and Cloudflare Access.
- Astro should consume published content only.
- No Sanity write token belongs in this public frontend.
- No `*.sip.collectivelybzy.com` address may be used by this project.

## Editorial safeguards

- Owner/admin controls users, roles, schema, templates, themes, integrations, and publishing.
- Store managers create drafts for specials and announcements.
- Games Curator manages only approved game records and visibility.
- New game packages, origins, themes, and scripts require owner approval.
- No arbitrary HTML, CSS, JavaScript, or public write endpoints are part of the public site.

The current content in `src/data/content.ts` is local placeholder content. It is not connected to Sanity and contains no private service configuration.
