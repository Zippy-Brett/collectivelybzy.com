# Storyblok setup

Collectively Bzy space: `295535334209633`. Public repository: `Zippy-Brett/collectivelybzy.com`.

The maintained setup instructions are in [RELEASE.md](RELEASE.md). The everyday editor workflow is in [STAFF-EDITING.md](STAFF-EDITING.md).

This release prepares eight schemas and 17 draft stories, including nine apps. Storyblok account import, existing-content reconciliation, delivery-token configuration, and deploy-hook verification are pending. Do not treat the local seed package as proof that these steps happened in the account.

Use space-scoped delivery tokens for website builds. The owner-only import utility uses a locally supplied management token and never publishes stories. No management token belongs in the website environment.

The existing Sanity integration remains available when Storyblok is unconfigured. Once the production delivery token is configured and `STORYBLOK_CONTENT_ENABLED=true`, published Storyblok collections control public visibility. See the release guide before switching sources.

CMS activation: keep `STORYBLOK_CONTENT_ENABLED=false` (the default) for the complete local nine-app launch. After reviewing and publishing the migrated collections, configure the appropriate delivery token and set `STORYBLOK_CONTENT_ENABLED=true` in Cloudflare. Existing tokens alone do not activate the new adapter. Publishing in the CMS updates the site only after activation and a successful build.
