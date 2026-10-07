/**
 * Minimal Storyblok Content Delivery API client.
 *
 * This intentionally does not use the Storyblok CLI or a management token.
 * This client is read-only. It uses only a space-scoped delivery token and
 * keeps the existing local/Sanity fallback available until Storyblok is
 * configured locally.
 */

export type StoryblokVersion = 'draft' | 'published';

export type StoryblokStory<T = Record<string, unknown>> = {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  full_slug: string;
  content: T;
};

export type StoryblokAsset = {
  filename?: string;
  alt?: string;
  title?: string;
};

export type StoryblokLink = {
  url?: string;
  cached_url?: string;
  linktype?: string;
};

export type StoryblokBlock = {
  component?: string;
  [key: string]: unknown;
};

const spaceId = import.meta.env.STORYBLOK_SPACE_ID || '295535334209633';
const apiBaseUrl = (import.meta.env.STORYBLOK_API_BASE_URL || 'https://api.storyblok.com').replace(/\/$/, '');
const requestedVersion = import.meta.env.STORYBLOK_VERSION;
const version: StoryblokVersion = requestedVersion === 'draft' ? 'draft' : 'published';

export const storyblokSpaceId = spaceId;
const token = version === 'draft' ? import.meta.env.STORYBLOK_PREVIEW_TOKEN : import.meta.env.STORYBLOK_PUBLIC_TOKEN;
if (version === 'draft' && import.meta.env.STORYBLOK_PREVIEW_BUILD !== 'true') {
  throw new Error('Draft content requires STORYBLOK_PREVIEW_BUILD=true and SITE_INDEXABLE=false.');
}
if (version === 'draft' && import.meta.env.SITE_INDEXABLE !== 'false') {
  throw new Error('Draft builds must use SITE_INDEXABLE=false.');
}
if ((import.meta.env.STORYBLOK_PUBLIC_TOKEN || import.meta.env.STORYBLOK_PREVIEW_TOKEN) && !token) {
  throw new Error('The delivery token for the selected Storyblok version is missing.');
}
export const storyblokConfigured = Boolean(token);
const tokenForVersion = () => token;

/**
 * Read one published/draft story when the safe, space-scoped delivery values
 * are present. Returns null while Storyblok is still being configured so the
 * existing local/Sanity content path remains available.
 */
export async function getStoryblokStory<T = Record<string, unknown>>(path: string): Promise<StoryblokStory<T> | null> {
  const token = tokenForVersion();
  if (!apiBaseUrl || !token) return null;

  const query = new URLSearchParams({
    version,
    token,
  });

  const response = await fetch(`${apiBaseUrl}/v2/cdn/stories/${path.replace(/^\//, '')}?${query.toString()}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Storyblok request failed: ${response.status}`);
  }

  const payload = await response.json() as { story?: StoryblokStory<T> };
  return payload.story ?? null;
}

/**
 * Read a list of stories from the delivery API. Unconfigured builds use local content. Configured request failures stop
 * the build, preserving the previous deployed site.
 */
export async function getStoryblokStories<T = Record<string, unknown>>(
  params: Record<string, string> = {},
): Promise<StoryblokStory<T>[]> {
  const token = tokenForVersion();
  if (!apiBaseUrl || !token) return [];

  const query = new URLSearchParams({
    version,
    token,
    ...params,
  });

  const stories: StoryblokStory<T>[] = [];
  // Request full pages until exhausted; do not silently truncate the collection.
  for (let page = 1; ; page++) {
    query.set('page', String(page));
    query.set('per_page', '100');
    const response = await fetch(`${apiBaseUrl}/v2/cdn/stories?${query.toString()}`);
    if (!response.ok) throw new Error(`Storyblok list request failed: ${response.status}`);
    const payload = await response.json() as { stories?: StoryblokStory<T>[] };
    if (!Array.isArray(payload.stories)) throw new Error('Storyblok returned an invalid story collection.');
    stories.push(...payload.stories);
    if (payload.stories.length < 100) break;
    if (page >= 100) throw new Error('Storyblok pagination exceeded its safety limit.');
  }
  return stories;
}
