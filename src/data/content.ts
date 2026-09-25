export type Theme = 'studio' | 'play';

export type ContentCard = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  theme: Theme;
  status?: string;
  accent: string;
  image?: string;
  imageAlt?: string;
  imageFit?: 'cover' | 'contain';
  gallery?: { src: string; alt: string }[];
  longDescription?: string;
  features?: string[];
  tags?: string[];
  notice?: string;
  storeUrl?: string;
};

export const apps: ContentCard[] = [
  {
    slug: 'back-the-pack',
    title: 'Back The Pack',
    eyebrow: 'App · family care records',
    description: 'A private care logging app that helps families keep everyday details organized and ready for the next conversation with a doctor.',
    theme: 'studio',
    status: 'In development',
    accent: 'sea-glass',
    image: '/images/back-the-pack-ipad.png',
    imageAlt: 'Back The Pack dashboard showing vitals, Apple Health, quick-add care logs, and recent care records',
    imageFit: 'contain',
    gallery: [
      { src: '/images/back-the-pack-iphone.png', alt: 'Back The Pack iPhone dashboard with vitals, Apple Health, hydration, nutrition, and medication records' },
    ],
    longDescription: 'Back The Pack is a private care logging app built to help families stay organized when supporting a loved one. Track daily care details in one place, from vitals and medications to hydration, meals, restroom activity, notes, and doctor visit preparation.',
    features: [
      'Vitals and care logs',
      'Medication tracking',
      'Hydration and nutrition records',
      'Doctor visit notes and reports',
      'Apple Health read-only import',
      'Local-first storage for personal care records',
      'Widgets for quick care visibility',
    ],
    tags: ['iPhone', 'iPad', 'Family care'],
    notice: 'Back The Pack is designed for organization and record keeping. It does not diagnose conditions, provide medical advice, or replace guidance from a licensed medical professional.',
    storeUrl: 'https://apps.apple.com/us/app/back-the-pack/id6805175460',
  },
  {
    slug: 'scroll-in-peace',
    title: 'Scroll in Peace',
    eyebrow: 'App · mindful technology',
    description: 'A calmer, more intentional way to make room for the things that matter on your phone.',
    theme: 'studio',
    status: 'Coming soon',
    accent: 'tide',
    image: '/images/scroll-in-peace-hero.png',
    longDescription: 'Scroll in Peace is a quieter approach to the moments when your attention gets pulled in too many directions. It is being shaped around pause, choice, and a more humane relationship with the small screen in your hand.',
    features: ['A calmer surface for intentional pauses', 'Simple prompts that leave room for your own judgment', 'A visual language built around tide, light, and breathing room'],
    tags: ['iPhone', 'Focus', 'Wellbeing'],
  },
  {
    slug: 'studio-notes',
    title: 'Studio Notes',
    eyebrow: 'App · creative practice',
    description: 'A small place for collecting sparks, half-finished thoughts, and the next good idea.',
    theme: 'studio',
    status: 'In the works',
    accent: 'brass',
    image: '/images/studio-notes-hero.png',
    longDescription: 'Studio Notes is a small, tactile place for collecting sparks before they disappear. It is made for half-finished thoughts, reference images, and the next good idea that arrives at an inconvenient time.',
    features: ['Quick capture without a crowded dashboard', 'Flexible notes for words, links, and images', 'A warm, focused workspace for creative practice'],
    tags: ['Ideas', 'Writing', 'Making'],
  },
];

export const games: ContentCard[] = [
  {
    slug: 'blue-velocity',
    title: 'Blue Velocity',
    eyebrow: 'Arcade run · open ocean',
    description: 'Take the long way through a living seascape. Thread wrecks, reefs, and ghost nets, then launch into the sun for a little extra style.',
    theme: 'play',
    status: 'Playable',
    accent: 'foam',
    tags: ['Endless run', 'Procedural ocean', 'High score'],
  },
  {
    slug: 'tideline',
    title: 'Tideline',
    eyebrow: 'Mini-game · gentle rhythm',
    description: 'A small shoreline game about timing, collecting light, and finding your way back in.',
    theme: 'play',
    status: 'Prototype',
    accent: 'foam',
    tags: ['Casual', 'Atmospheric'],
  },
  {
    slug: 'brass-bandit',
    title: 'Brass Bandit',
    eyebrow: 'Experiment · playful strategy',
    description: 'A pocket-sized puzzle about bold moves, bright sounds, and getting gloriously sidetracked.',
    theme: 'play',
    status: 'Coming soon',
    accent: 'sunset',
    tags: ['Puzzle', 'Arcade'],
  },
];

export const projects: ContentCard[] = [
  {
    slug: 'low-tide-radio',
    title: 'Low Tide Radio',
    eyebrow: 'Music · slow signals',
    description: 'A growing collection of small sounds for late walks, open windows, and starting over.',
    theme: 'studio',
    status: 'Listening room soon',
    accent: 'sea-glass',
    tags: ['Ambient', 'Playlists'],
  },
  {
    slug: 'paper-weather',
    title: 'Paper Weather',
    eyebrow: 'Project · visual notes',
    description: 'A set of tiny observations about weather, memory, and the shapes a day leaves behind.',
    theme: 'studio',
    status: 'A work in progress',
    accent: 'sand',
    tags: ['Visuals', 'Writing'],
  },
];

export const specials = [
  {
    title: 'New things on the shelf',
    eyebrow: 'Store special · seasonal',
    description: 'A rotating selection of new products and small surprises. Details will be managed by store editors.',
    timing: 'Dates will appear here',
    accent: 'brass',
    cta: 'See what’s new',
    url: '/support/',
  },
  {
    title: 'A little extra brightness',
    eyebrow: 'Announcement · in store',
    description: 'Look for limited-time moments, local favorites, and timely calls to action from the store team.',
    timing: 'Coming soon',
    accent: 'foam',
    cta: 'Get the latest',
    url: '/support/',
  },
];

export const getBySlug = (items: ContentCard[], slug: string) =>
  items.find((item) => item.slug === slug);
