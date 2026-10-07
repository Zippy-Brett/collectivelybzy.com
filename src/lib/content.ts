import { env } from './environment';
import { getApps as getSanityApps, getGames as getLegacyGames, getProjects as getLegacyProjects, getSpecials as getLegacySpecials } from './sanity';
import { getStoryblokAppCollection, toApp } from './storyblok-content';
import { storyblokConfigured, getStoryblokStories, getStoryblokStory } from './storyblok';
import { apps as localApps } from '../data/content';

/**
 * Content routing boundary for the public site.
 *
 * Storyblok is tried first for app pages. Sanity/local fallback remains in
 * place for everything else until each Storyblok collection is migrated and
 * tested. No write-capable CMS client belongs in this public site.
 */
export async function getApps() {
  const storyblok = await getStoryblokAppCollection();
  // Once connected, published Storyblok stories are authoritative. Unpublished
  // or hidden records must never reappear through a local fallback.
  if (storyblokConfigured && env.STORYBLOK_MIGRATION_MODE !== 'merge') return storyblok.visible;
  const existingApps = await getSanityApps();
  const merged = new Map(existingApps.map((item) => [item.slug, item]));

  // Keep the shell complete while individual App Page stories are being
  // created. Storyblok entries replace these records by slug as they arrive.
  localApps.forEach((item) => {
    if (!merged.has(item.slug) && !storyblok.knownSlugs.has(item.slug)) merged.set(item.slug, item);
  });
  storyblok.knownSlugs.forEach(slug => merged.delete(slug));
  storyblok.visible.forEach((item) => merged.set(item.slug, item));

  return [...merged.values()];
}

const homeFallback = { headline: 'Little things.', second_line: 'Better days.', description: 'Thoughtful apps, playful detours, and ideas that make everyday life a little more you.', featured_app: 'roametry' };
export async function getStudioHome() {
  if (!storyblokConfigured) return homeFallback;
  const story = await getStoryblokStory<typeof homeFallback>('studio-home');
  return { ...homeFallback, ...story?.content };
}
async function getStudioCollection(folder: string, component: string, fallback: () => Promise<any[]>, theme: 'studio' | 'play') {
  if (!storyblokConfigured) return fallback();
  const stories = await getStoryblokStories<any>({starts_with: `${folder}/`, content_type: component});
  const legacy = await fallback();
  return stories.flatMap(story => {
    const item = toApp(story);
    if (!item) return [];
    const previous = legacy.find(card => card.slug === story.slug);
    return [{ ...previous, ...item, theme, eyebrow: story.content.eyebrow || (theme === 'play' ? 'Mini-game · playful experiment' : 'Project · studio work'), gameUrl: previous?.gameUrl, embeds: previous?.embeds }];
  });
}
export const getGames = () => getStudioCollection('games','bzy_game_page',getLegacyGames,'play');
export const getProjects = () => getStudioCollection('projects','bzy_project_page',getLegacyProjects,'studio');
export async function getSpecials() {
  if (!storyblokConfigured) return getLegacySpecials();
  const stories = await getStoryblokStories<any>({starts_with:'store/',content_type:'bzy_store_note'});
  return stories.filter(story => story.content.display_on_site !== false).map(story=> ({title:story.name, eyebrow:'Store notes', description:story.content.description, timing:story.content.timing || '', accent:'brass', cta:'Ask the studio', url:'/support/'}));
}

