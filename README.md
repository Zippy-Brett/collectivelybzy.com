# Collectively Bzy

An Astro public studio site for collectivelybzy.com, with nine separate app pages, games, music and projects, store notes, support, and the existing MailerLite newsletter.

The redesigned studio uses warm paper, deep blue, sea-glass green, gold, and the established bee. Visitors enter the homepage directly. Five released apps link to the App Store; four testing apps link to studio release news.

## Work locally

```sh
npm ci
npm run dev
npm run check
```

Static output is `dist`. Cloudflare can deploy this directory. No delivery token is needed to build the local catalog. Use `.env.example` for published Storyblok reads and explicit draft preview settings. Never commit credentials.

## Staff and release guides

- [Staff editing](docs/STAFF-EDITING.md)
- [Release, CMS import, and account-side setup](docs/RELEASE.md)
- [CMS and private infrastructure boundaries](docs/CMS-BOUNDARY.md)

The Storyblok package includes eight schemas and 17 draft stories. Run `node scripts/import-cms.mjs` for its offline plan. Importing into the account, reviewing existing records, configuring the delivery token and deploy hook, and testing newsletter delivery remain account-side tasks. Existing Sanity content can still serve as the legacy source when Storyblok is not configured.

The Godot source under `godot/blue_velocity/` is independent of the public Astro build. Approved browser games are retained in their isolated play areas.
