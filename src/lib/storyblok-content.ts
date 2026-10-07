import type { ContentCard } from '../data/content';
import {
  getStoryblokStories,
  storyblokConfigured,
  type StoryblokAsset,
  type StoryblokBlock,
  type StoryblokLink,
  type StoryblokStory,
} from './storyblok';

type AppContent = {
  display_on_site?: boolean;
  status?: string;
  short_description?: string;
  hero_image?: StoryblokAsset;
  app_store_url?: StoryblokLink;
  palette?: string;
  notice?: string;
  body?: StoryblokBlock[];
};

const paletteAccent = (palette?: string) => {
  if (palette === 'studio-sand') return 'sand';
  if (palette === 'sea-glass') return 'sea-glass';
  if (palette === 'storm') return 'charcoal';
  if (palette === 'brass') return 'brass';
  return 'tide';
};

const statusLabel = (status?: string) => {
  const labels: Record<string, string> = {
    available: 'Available',
    playable: 'Playable',
    'coming-soon': 'Coming soon',
    'in-development': 'In testing',
    'in-testing': 'In testing',
    archived: 'Archived',
  };

  return labels[status ?? ''] ?? status ?? 'In development';
};

const assetUrl = (asset?: StoryblokAsset) => asset?.filename;
const linkUrl = (link?: StoryblokLink) => {
  const url = link?.url || link?.cached_url;
  if (!url) return undefined;
  try { const parsed = new URL(url); return parsed.protocol === 'https:' && parsed.hostname === 'apps.apple.com' ? url : undefined; } catch { return undefined; }
};

const inlineText = (node: any): string => {
  if (!node) return '';
  if (node.type === 'text') return node.text ?? '';
  return (node.content ?? []).map((child: any) => inlineText(child)).join('');
};

const richTextSummary = (value: any) => {
  const paragraphs: string[] = [];
  const features: string[] = [];

  const visit = (node: any) => {
    if (!node) return;
    if (node.type === 'list_item') {
      const feature = inlineText(node).trim();
      if (feature) features.push(feature);
      return;
    }
    if (node.type === 'paragraph') {
      const paragraph = inlineText(node).trim();
      if (paragraph) paragraphs.push(paragraph);
    }
    for (const child of node.content ?? []) visit(child);
  };

  visit(value);
  return { text: paragraphs.join('\n\n'), features };
};

export const toApp = (story: StoryblokStory<AppContent>): ContentCard | null => {
  const content = story.content;
  if (content.display_on_site === false || content.status === 'archived') return null;
  if (content.status === 'available' && !linkUrl(content.app_store_url)) throw new Error(`Released app ${story.slug} needs an official App Store link.`);

  const gallery: ContentCard['gallery'] = [];
  const features: string[] = [];
  let longDescription = '';
  let ctaUrl = '';

  for (const block of content.body ?? []) {
    if (block.component === 'gallery') {
      const images = (block.images as StoryblokAsset[] | undefined) ?? [];
      gallery.push(...images.flatMap((image) => {
        const src = assetUrl(image);
        return src ? [{
          src,
          alt: image.alt || image.title || story.name,
          caption: image.title || undefined,
        }] : [];
      }));
    }

    if (block.component === 'rich_text') {
      const summary = richTextSummary(block.body);
      features.push(...summary.features);
      if (summary.text) longDescription = summary.text;
    }

    if (block.component === 'cta_button') {
      ctaUrl = linkUrl(block.link as StoryblokLink | undefined) ?? '';
    }
  }

  return {
    slug: story.slug,
    title: story.name,
    eyebrow: 'App · studio work',
    description: content.short_description ?? '',
    theme: 'studio',
    status: statusLabel(content.status),
    accent: paletteAccent(content.palette),
    image: assetUrl(content.hero_image),
    imageAlt: content.hero_image?.alt || `${story.name} interface`,
    imageFit: 'contain',
    gallery: gallery.length ? gallery : undefined,
    longDescription: longDescription || content.short_description,
    notice: content.notice,
    features,
    tags: [],
    storeUrl: linkUrl(content.app_store_url) || ctaUrl || undefined,
  };
};

export async function getStoryblokApps(): Promise<ContentCard[]> {
  return (await getStoryblokAppCollection()).visible;
}

export async function getStoryblokAppCollection(): Promise<{ visible: ContentCard[]; knownSlugs: Set<string> }> {
  if (!storyblokConfigured) return { visible: [], knownSlugs: new Set() };

  const stories = await getStoryblokStories<AppContent>({
    starts_with: 'apps/',
    content_type: 'app_page',
    per_page: '100',
  });

  const visible = stories.flatMap((story) => {
    const app = toApp(story);
    return app ? [app] : [];
  });

  return { visible, knownSlugs: new Set(stories.map((story) => story.slug)) };
}
