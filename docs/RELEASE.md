# Collectively Bzy release and CMS connection

The redesigned source is in branch `codex/studio-redesign`. The original local project and its credentials were not changed. The production site has not been replaced by this work.

## Cloudflare

For Git builds use `npm ci` followed by `npm run build`, with output directory `dist`. Use the Node version supported by Astro and the migration scripts; the verified local build uses Node 24. A packaged static production ZIP is also provided outside this checkout in the parent workspace's artifacts folder.

Production builds use `SITE_INDEXABLE=true` (also the default) and `STORYBLOK_VERSION=published`. Preview deployments use `SITE_INDEXABLE=false`. Draft CMS builds also require `STORYBLOK_VERSION=draft`, `STORYBLOK_PREVIEW_BUILD=true`, and the space-scoped preview delivery token. Production uses a public delivery token, not a personal management token. Do not paste tokens into chat or commit `.env` files.

The generated sitemap includes public site pages and excludes the old splash demo and packaged game assets. Canonical links always point to collectivelybzy.com. Submit the sitemap in the verified Search Console property after deployment. Preview builds receive noindex metadata and a blocking robots.txt. The legacy splash demonstration also remains noindex.

## Import and migration

`cms/components.json` contains eight component definitions. `cms/stories.json` contains 17 proposed draft stories, including all nine apps.

1. Run `node scripts/import-cms.mjs` to inspect the offline plan. No credentials are needed and no writes occur.
2. An owner can set `STORYBLOK_MANAGEMENT_TOKEN` in a local terminal environment and run `node scripts/import-cms.mjs --apply`. This utility writes only to the stated space. It creates missing schemas and missing draft stories, explicitly uses `publish:false`, and preserves existing records. It stops before writes if an existing schema is missing required fields or has incompatible field types. Review and add those fields through Storyblok before retrying. Existing story content is deliberately not overwritten: review it against the seed package manually.
3. Review all stories in Storyblok, correct existing stale release statuses, replace seeded local asset references through the asset picker if desired, and verify the five official App Store links. Set Available for Sensory Seek.
4. Publish the complete intended collections before enabling the production public delivery token. With a token configured and `STORYBLOK_CONTENT_ENABLED=true`, Storyblok is authoritative for apps, games, projects, and store notes. An empty collection stays empty rather than resurrecting local content. During a short app migration only, `STORYBLOK_MIGRATION_MODE=merge` overlays CMS apps on local records; remove it after migration. Hidden CMS entries still stay hidden in merge mode, but unpublished CMS entries may use local content until this temporary mode is removed.
5. Configure the production delivery token and published version in Cloudflare. Test a preview build, then deploy the reviewed production build.
6. Add Storyblok publish/unpublish webhooks to a Cloudflare Pages deploy hook so staff publication starts a new build. Keep that hook in account settings. The Cloudflare Git project is `collectivelybzy`. The publish/unpublish/delete/move hook is configured, and a publish-triggered production deployment was verified successfully.

Without delivery tokens the build uses the complete local catalog. Once activated, failed Storyblok requests stop the build to preserve the last deployed site; they do not publish stale fallback pages. The website never uses a management token.

Visual Editor live updates are not wired in this release. Staff can edit forms in Storyblok and review a separately rebuilt draft preview. A successful connected-account preview and webhook test are required before calling the CMS migration complete.

Reference: [Storyblok component creation](https://www.storyblok.com/docs/api/management/components/create-a-component) and [draft story creation](https://www.storyblok.com/docs/api/management/stories/create-a-story).

## Verification

Run `npm run check`. Browser checks cover desktop, phone navigation, all nine app routes, release grouping, image loading, and the newsletter embed. No signup emails were sent during testing. Actual MailerLite signup, confirmation, and welcome delivery still need an account-side test.

Approved game assets and private Scroll in Peace infrastructure retain the boundaries documented in CMS-BOUNDARY.md. Marketing content and public App Store links are the only app details changed here.

Production uses published Storyblok content with `STORYBLOK_CONTENT_ENABLED=true`. Local builds without a delivery token retain the nine-app catalog. Staff publication reaches the public site after the connected Cloudflare production build succeeds; drafts remain unpublished.
