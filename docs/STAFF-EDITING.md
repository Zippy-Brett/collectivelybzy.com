# Editing Collectively Bzy

Space: `295535334209633`. The prepared CMS package has 17 draft stories: the studio homepage, nine app pages, five games, and two projects. Store notes can be added separately. It has not yet been imported into the account.

## Everyday app updates

1. Open Content → Apps → the app name.
2. Change the short description, product note, screenshots, or the description and benefit bullets under Page content. Use descriptive image alt text. Use the story name as the public app title.
3. Choose **Available** only for a released app and enter its official App Store link. Testing apps use **In testing** and leave that link blank. Five apps are currently released: Roametry, Back The Pack, Scroll in Peace, Hold My Place, and Sensory Seek. Four are in testing: What's That Hue?, Lifetility, Appsurd, and CoreLink.
4. Save your draft. Review in the separate draft build. Ask the publishing owner to publish when ready.
5. Published content appears after a successful Cloudflare rebuild. Saving or publishing in Storyblok alone does not change this static site until the build runs.

To hide a page, turn off **Show on website**, publish that change, and rebuild. This removes its card and generated page. Do not rename a slug for a title correction; changing a slug changes the public URL and needs a redirect.

The seeded assets reference existing public website files. They render on the website but are not uploaded Storyblok assets. To replace a screenshot, upload it through the Storyblok asset picker. Assets for Lifetility, Appsurd, and CoreLink are abstract illustrations, not product screenshots.

## Homepage, games, projects, and store

- **Studio homepage**: edit the two headline lines and introduction. Featured app slug must match an existing visible app. App groups automatically follow the app collection.
- **Games**: edit titles, descriptions, benefits, images, and visibility. Playable packages remain maintained in source code; staff do not need to touch game code.
- **Projects**: edit public project copy and visibility. Existing approved music players remain maintained in source.
- **Store**: create a Store note with a name, description, and timing. Use Show on website to control visibility. No invented specials are published as examples.
- **Newsletter**: the existing MailerLite form is `4f8Hhv`, account `2677501`. Its fields, consent, confirmation, and welcome messages are managed in MailerLite. The website loads this form; delivery and welcome automation need an account-side test.

## Recommended access

Give routine editors content and asset editing. Keep schema changes, integrations, tokens, public publishing, and deployments with the owner. If the current Storyblok plan does not support custom publishing roles, use owner review before publication rather than granting everyone administrator access.

CMS activation: keep `STORYBLOK_CONTENT_ENABLED=false` (the default) for the complete local nine-app launch. After reviewing and publishing the migrated collections, configure the appropriate delivery token and set `STORYBLOK_CONTENT_ENABLED=true` in Cloudflare. Existing tokens alone do not activate the new adapter. Publishing in the CMS updates the site only after activation and a successful build.
