# Storyblok setup

Collectively Bzy space: `295535334209633`. Public repository: `Zippy-Brett/collectivelybzy.com`.

The maintained setup instructions are in [RELEASE.md](RELEASE.md). The everyday editor workflow is in [STAFF-EDITING.md](STAFF-EDITING.md).

This release prepares eight schemas and 17 draft stories, including nine apps. Storyblok account import, existing-content reconciliation, delivery-token configuration, and deploy-hook verification are pending. Do not treat the local seed package as proof that these steps happened in the account.

Use space-scoped delivery tokens for website builds. The owner-only import utility uses a locally supplied management token and never publishes stories. No management token belongs in the website environment.

The existing Sanity integration remains available when Storyblok is unconfigured. Once the production delivery token is configured, published Storyblok collections control public visibility. See the release guide before switching sources.
