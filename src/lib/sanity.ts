import { createClient } from '@sanity/client';
import type { ContentCard } from '../data/content';
import { apps as fallbackApps, games as fallbackGames, projects as fallbackProjects, specials as fallbackSpecials } from '../data/content';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';

const client = projectId
  ? createClient({ projectId, dataset, apiVersion: '2026-03-01', useCdn: false })
  : null;

type SanityImage = { url?: string };
type SanityLink = { label?: string; url?: string; presentation?: string };
type SanityBodyBlock = { body?: Array<{ _type?: string; listItem?: string; children?: Array<{ text?: string }> }> };

const paletteAccent = (palette?: string) => {
  if (palette === 'studio-sand') return 'sand';
  if (palette === 'sea-glass') return 'sea-glass';
  if (palette === 'play-foam') return 'foam';
  if (palette === 'play-sunset') return 'sunset';
  return 'tide';
};

const bodyText = (body?: SanityBodyBlock[]) =>
  body?.flatMap((block) => block.body ?? [])
    .filter((block) => block._type === 'block')
    .flatMap((block) => block.children ?? [])
    .map((child) => child.text ?? '')
    .join(' ')
    .trim();

const bodyFeatures = (body?: SanityBodyBlock[]) =>
  body?.flatMap((block) => block.body ?? [])
    .filter((block) => block.listItem === 'bullet')
    .flatMap((block) => block.children ?? [])
    .map((child) => child.text ?? '')
    .filter(Boolean) ?? [];

const cardFromSanity = (item: any, theme: 'studio' | 'play', eyebrow: string, imageKey: string): ContentCard => {
  const image = item[imageKey] as SanityImage | undefined;
  const storeLinks = (item.storeLinks ?? []) as SanityLink[];
  const storeUrl = storeLinks.find((link) => link.presentation === 'appStoreBadge')?.url ?? storeLinks[0]?.url;

  return {
    slug: item.slug.current,
    title: item.title,
    eyebrow,
    description: item.shortDescription,
    theme,
    status: item.status,
    accent: paletteAccent(item.palette),
    image: image?.url,
    imageAlt: `${item.title} interface`,
    imageFit: imageKey === 'heroImage' ? 'contain' : 'cover',
    longDescription: bodyText(item.body) || item.shortDescription,
    features: bodyFeatures(item.body),
    tags: item.platforms ?? (item.projectType ? [item.projectType] : []),
    storeUrl,
  };
};

const appQuery = `*[_type == "app" && defined(slug.current)] | order(_createdAt asc){ title, slug, status, displayOnSite, shortDescription, palette, platforms, "heroImage": heroImage.asset->{"url": url}, storeLinks[]{label, url, presentation}, body }`;
const gameQuery = `*[_type == "game" && defined(slug.current)] | order(_createdAt asc){ title, slug, status, displayOnSite, shortDescription, "coverImage": coverImage.asset->{"url": url}, body }`;
const projectQuery = `*[_type == "project" && defined(slug.current)] | order(_createdAt asc){ title, slug, projectType, year, displayOnSite, shortDescription, palette, "coverImage": coverImage.asset->{"url": url}, body }`;
const specialQuery = `*[_type == "storeSpecial"] | order(startDate asc){ title, description, store, startDate, endDate, displayOnSite, "image": image.asset->{"url": url}, cta }`;

async function fetchPublished<T>(query: string, fallback: T[]): Promise<T[]> {
  if (!client) return fallback;
  try {
    const records = await client.fetch<T[]>(query);
    // Keep the local scaffold until a collection has its first published document.
    return records.length ? records : fallback;
  } catch (error) {
    console.warn('Sanity content unavailable; using local fallback content.', error);
    return fallback;
  }
}

export async function getApps() {
  const records = await fetchPublished<any>(appQuery, fallbackApps);
  return records === fallbackApps ? fallbackApps : records.filter((item) => item.displayOnSite).map((item) => cardFromSanity(item, 'studio', 'App · studio work', 'heroImage'));
}

export async function getGames() {
  const records = await fetchPublished<any>(gameQuery, fallbackGames);
  if (records === fallbackGames) return fallbackGames;
  const published = records.filter((item) => item.displayOnSite).map((item) => cardFromSanity(item, 'play', 'Mini-game · playful experiment', 'coverImage'));
  const localPlayable = fallbackGames.find((item) => item.slug === 'blue-velocity');
  return localPlayable && !published.some((item) => item.slug === localPlayable.slug) ? [...published, localPlayable] : published;
}

export async function getProjects() {
  const records = await fetchPublished<any>(projectQuery, fallbackProjects);
  return records === fallbackProjects ? fallbackProjects : records.filter((item) => item.displayOnSite).map((item) => cardFromSanity(item, 'studio', `${item.projectType ?? 'Project'} · studio work`, 'coverImage'));
}

export async function getSpecials() {
  const records = await fetchPublished<any>(specialQuery, fallbackSpecials);
  if (records === fallbackSpecials) return fallbackSpecials;

  return records.filter((item) => item.displayOnSite).map((item) => ({
    title: item.title,
    eyebrow: `Store special${item.store ? ` · ${item.store}` : ''}`,
    description: item.description,
    timing: item.startDate && item.endDate ? `${new Date(item.startDate).toLocaleDateString()} – ${new Date(item.endDate).toLocaleDateString()}` : 'See store for details',
    accent: 'brass',
    cta: item.cta?.label ?? 'Learn more',
    url: item.cta?.url ?? '/support/',
  }));
}
