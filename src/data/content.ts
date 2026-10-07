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
  gallery?: { src: string; alt: string; caption?: string }[];
  embeds?: { url: string; title: string }[];
  gameUrl?: string;
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
    eyebrow: 'Appsurd · care logging for families',
    description: 'Care details, together. Keep everyday care notes in one private place—now with glucose input, vitals, medications, meals, hydration, and doctor-visit prep.',
    theme: 'studio',
    status: 'Available · v1.1',
    accent: 'brass',
    image: '/images/apps/back-the-pack/hero.webp',
    imageAlt: 'Three Back The Pack app screens showing care records, glucose logging, and vitals',
    gallery: [
      { src: '/images/apps/back-the-pack/lifestyle.jpg', alt: 'Back The Pack promotional image' },
      { src: '/images/apps/back-the-pack/dashboard.png', alt: 'Back The Pack care dashboard' },
      { src: '/images/apps/back-the-pack/glucose-log.png', alt: 'Back The Pack glucose log' },
      { src: '/images/apps/back-the-pack/medical-sources.png', alt: 'Back The Pack medical information and sources screen' },
    ],
    longDescription: 'Back The Pack is a private care logging app built to help families stay organized when supporting a loved one. Track daily care details in one place, from vitals and medications to hydration, meals, restroom activity, notes, and doctor visit preparation.',
    features: [
      'Care records in one view',
      'Medication plans, schedules, and recorded doses',
      'Glucose and vitals logging',
      'Doctor visit notes and reports',
      'Saved records and trends',
      'Optional read-only Apple Health import',
      'Local-first storage for personal care records',
      'Widgets for quick visibility',
    ],
    tags: ['iPhone', 'iPad', 'Family care'],
    notice: 'Back The Pack is designed for organization and record keeping. It does not diagnose conditions, provide medical advice, or replace guidance from a licensed medical professional.',
    storeUrl: 'https://apps.apple.com/us/app/back-the-pack/id6805175460',
  },
  {
    slug: 'sensory-seek',
    title: 'Sensory Seek',
    eyebrow: 'App · sensory support',
    description: 'Know before you go. Community sensory reports for noise, lighting, and crowds—plus Soothe tools when you need a calmer moment.',
    theme: 'studio',
    status: 'Available',
    storeUrl: 'https://apps.apple.com/us/app/sensoryseek/id6806780705',
    accent: 'sea-glass',
    image: '/images/apps/sensory-seek/hero.webp',
    imageAlt: 'Sensory Seek map and Soothe screens',
    gallery: [
      { src: '/images/apps/sensory-seek/lifestyle.jpg', alt: 'Sensory Seek promotional image' },
      { src: '/images/apps/sensory-seek/map.jpg', alt: 'Sensory Seek sensory report map' },
      { src: '/images/apps/sensory-seek/soothe.jpg', alt: 'Sensory Seek Soothe breathing screen' },
      { src: '/images/apps/sensory-seek/profile.jpg', alt: 'Sensory Seek profile screen' },
    ],
    longDescription: 'Sensory Seek helps neurodivergent people and caregivers understand what a place might feel like before they arrive—then find calm when they need it. Community reports, Plan B, and caregiver tools are available on the App Store.',
    features: [
      'Community ratings for noise, lighting, and crowds',
      'Quick reports with amenity tags and notes',
      'Nearby calmer options when a place feels like too much',
      'Soothe tools for sound, breathing, liquid motion, and nature loops',
      'Caregiver tools with trusted contacts and prepared messages',
      'Local tools without an account',
    ],
    tags: ['iPhone', 'Sensory support'],
    notice: 'Community reports reflect conditions at submission time. Noise readings are estimates. Sensory Seek is not medical or emergency care.',
  },
  {
    slug: 'hold-my-place',
    title: 'Hold My Place',
    eyebrow: 'Appsurd · job-site memory for DIY',
    description: 'Keep every next step, progress note, hardware list, photo, and reminder together—right where the work happens.',
    theme: 'studio',
    status: 'Available',
    accent: 'sunset',
    image: '/images/apps/hold-my-place/hero.webp',
    imageAlt: 'Three Hold My Place app screens showing projects, next steps, and a jukebox',
    gallery: [
      { src: '/images/apps/hold-my-place/lifestyle.jpg', alt: 'Hold My Place promotional image' },
      { src: '/images/apps/hold-my-place/project-overview.jpg', alt: 'Hold My Place project overview' },
      { src: '/images/apps/hold-my-place/project-detail.jpg', alt: 'Hold My Place project detail and next step' },
      { src: '/images/apps/hold-my-place/jukebox.jpg', alt: 'Hold My Place Mood Boost jukebox' },
    ],
    longDescription: 'Hold My Place keeps every next step, progress note, hardware list, photo, and reminder together—right where the work happens. It is local-first on your iPhone, so interrupted projects are easier to pick back up.',
    features: [
      'One clear next step for every project',
      'Progress notes and photos',
      'Combined hardware list',
      'Local reminders',
      'On-device label and barcode help',
      'Siri and Voice when hands are full',
      'Mood Boost jukebox',
      'No account and local-first storage',
    ],
    tags: ['iPhone', 'DIY', 'Home repair'],
    storeUrl: 'https://apps.apple.com/us/app/hold-my-place/id6809287781',
  },
  {
    slug: 'scroll-in-peace',
    title: 'Scroll in Peace',
    eyebrow: 'App · mindful technology',
    description: 'A calmer Safari with powerful filters and clear control. EasyList and EasyPrivacy convert on your device—pause, refresh, and see what is protecting you.',
    theme: 'studio',
    status: 'Available',
    accent: 'tide',
    image: '/images/apps/scroll-in-peace/hero.webp',
    imageAlt: 'Scroll in Peace iPhone and desktop protection dashboards',
    gallery: [
      { src: '/images/apps/scroll-in-peace/lifestyle.jpg', alt: 'Scroll in Peace promotional image' },
      { src: '/images/apps/scroll-in-peace/dashboard.jpg', alt: 'Scroll in Peace resource dashboard' },
      { src: '/images/apps/scroll-in-peace/extension-popup.jpg', alt: 'Scroll in Peace browser extension popup' },
      { src: '/images/apps/scroll-in-peace/options.jpg', alt: 'Scroll in Peace browser extension options' },
    ],
    longDescription: 'Scroll in Peace helps reduce supported advertising, tracking requests, and page clutter in Safari—with on-device EasyList and EasyPrivacy conversion and clear filter control.',
    features: [
      'On-device EasyList and EasyPrivacy filters',
      'Separate Ads & Cleanup and Privacy controls',
      'Optional cookie-banner and nag-screen cleanup',
      'Caregiver Shield for recognized deceptive prompts',
      'Visible, user-controlled protection status',
      'No account and no browsing history sent to the developer',
    ],
    tags: ['iPhone', 'iPad', 'Mac', 'Safari'],
    notice: 'The App Store app protects Safari. Desktop Chrome, Edge, and Firefox use separate extension editions.',
    storeUrl: 'https://apps.apple.com/us/app/scroll-in-peace/id6810617183',
  },
  {
    slug: 'roametry',
    title: 'Roametry',
    eyebrow: 'Appsurd · travel memories, privately kept',
    description: 'Turn trips, concerts, dinners, and everyday adventures into beautiful private stories. Plan the days, capture the moments, and keep your Roams on your device.',
    theme: 'studio',
    status: 'Available',
    accent: 'brass',
    image: '/images/apps/roametry/hero.webp',
    imageAlt: 'Three Roametry travel memory screens',
    gallery: [
      { src: '/images/apps/roametry/lifestyle.jpg', alt: 'Roametry promotional image' },
      { src: '/images/apps/roametry/home.jpg', alt: 'Roametry memories home screen' },
      { src: '/images/apps/roametry/active-trip.jpg', alt: 'Roametry active trip screen' },
      { src: '/images/apps/roametry/capture.jpg', alt: 'Roametry capture screen' },
    ],
    longDescription: 'Roametry turns trips, concerts, dinners, and everyday adventures into beautiful private stories. Plan the days, capture the moments, and keep your Roams on your device.',
    features: [
      'Create a Roam for any adventure',
      'Capture photos, notes, and voice memos',
      'Day-by-day journey timeline',
      'Simple itinerary planning',
      'Maps with privacy in mind',
      'Fit Check for carry-ons',
      'Local-first stories kept on your device',
      'Warm, scrapbook-inspired design',
    ],
    tags: ['iPhone', 'iPad', 'Travel memories'],
    notice: 'Roametry is designed for personal memories and planning. Location features are optional and controlled by you.',
    storeUrl: 'https://apps.apple.com/us/app/roametry/id6806166399',
  },
  {
    slug: 'whats-that-hue',
    title: "What's That Hue?",
    eyebrow: 'App · color notebook',
    description: 'Point, hold, and save. A calm camera color notebook for the hues you want to remember—names, HEX, palettes, and a collection that stays on your device.',
    theme: 'studio',
    status: 'In testing',
    accent: 'sea-glass',
    image: '/images/apps/whats-that-hue/hero.webp',
    imageAlt: "Three What's That Hue? color notebook screens",
    gallery: [
      { src: '/images/apps/whats-that-hue/lifestyle.jpg', alt: "What's That Hue? promotional image" },
      { src: '/images/apps/whats-that-hue/scan.jpg', alt: "What's That Hue? scan screen" },
      { src: '/images/apps/whats-that-hue/studio.jpg', alt: "What's That Hue? studio screen" },
      { src: '/images/apps/whats-that-hue/collection.jpg', alt: "What's That Hue? color collection" },
    ],
    longDescription: "What's That Hue? is a native color notebook for precise sampling, honest color science, and a calm lavender studio. Captures stay on your device.",
    features: [
      'Center-pixel or 5×5 mean color sampling',
      'Friendly names, HEX, RGB, and HSL values',
      'Review before you keep with undo',
      'Searchable color collection',
      'Studio themes and palettes',
      'Local-first captures with no account',
    ],
    tags: ['iPhone', 'iPad', 'TestFlight'],
    notice: 'Camera values depend on lighting. ΔE is a distance, not confidence. This app is not a certified paint instrument.',
  },
  {slug: 'lifetility', title: 'Lifetility', eyebrow: 'Life admin, lighter.', description: 'Keep receipts, trials, returns, warranties, and refund records together, with deadlines you review and confirm.', theme: 'studio', status: 'In testing', accent: 'sea-glass', image: '/images/apps/lifetility/illustration.svg', imageAlt: 'Abstract illustration for Lifetility', imageFit: 'contain', longDescription: 'Keep receipts, trials, returns, warranties, and refund records together, with deadlines you review and confirm.', features: ['Receipt records and attachments', 'Review suggested details from local receipt OCR', 'Track returns, warranties, trials, and refunds', 'Export deadlines to your calendar and records to CSV'], notice: 'Calendar reminders require importing the calendar file. Lifetility does not connect to your bank or cancel subscriptions for you.'},
  {slug: 'appsurd', title: 'Appsurd', eyebrow: 'For the oddly specific.', description: 'A pocket collection of small tools for timing, decisions, and the everyday tasks that deserve an easier way.', theme: 'studio', status: 'In testing', accent: 'sunset', image: '/images/apps/appsurd/illustration.svg', imageAlt: 'Abstract illustration for Appsurd', imageFit: 'contain', longDescription: 'A pocket collection of small tools for timing, decisions, and the everyday tasks that deserve an easier way.', features: ['Small tools for everyday decisions', 'Timing and planning helpers', 'Text and presentation utilities', 'Private tools that run on your device'], notice: 'In testing. Features and availability may change before release.'},
  {slug: 'corelink', title: 'CoreLink', eyebrow: 'Your utility workbench.', description: 'A keyboard-friendly collection of browser utilities for working with data, text, and the little jobs between bigger ideas.', theme: 'studio', status: 'In testing', accent: 'tide', image: '/images/apps/corelink/illustration.svg', imageAlt: 'Abstract illustration for CoreLink', imageFit: 'contain', longDescription: 'A keyboard-friendly collection of browser utilities for working with data, text, and the little jobs between bigger ideas.', features: ['A modular collection of utility tools', 'Keyboard-first navigation', 'Work with JSON, regular expressions, and timestamps', 'A lightweight workbench without an account'], notice: 'In testing. This page introduces the project; a public release link will be added when ready.'},
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
    slug: 'downhill-detour',
    title: 'Downhill Detour',
    eyebrow: 'Arcade run · snowy switchbacks',
    description: 'Pick a line, dodge the hazards, and keep the downhill detour moving through a living mountain course.',
    theme: 'play',
    status: 'Playable',
    accent: 'tide',
    gameUrl: '/game-packages/downhill-detour.html',
    tags: ['Endless run', 'Snow day', 'Gamepad ready'],
  },
  {
    slug: 'neon-overdrive',
    title: 'Neon Overdrive',
    eyebrow: 'Arcade run · four-lane midnight',
    description: 'Dodge traffic, grab gold, and ride the neon through a fast little arcade highway built for repeat runs.',
    theme: 'play',
    status: 'Playable',
    accent: 'sunset',
    gameUrl: '/games/neon-overdrive.html',
    tags: ['Arcade', 'High score', 'Controller ready'],
  },
  {
    slug: 'ledge-and-ladder',
    title: 'Ledge & Ladder',
    eyebrow: 'Arcade survival · haunted ship',
    description: 'Work the rigging, drop four chests into the hold, and survive the ghosts, skeletons, and strange luck of a haunted voyage.',
    theme: 'play',
    status: 'Playable',
    accent: 'brass',
    gameUrl: '/game-packages/ledge-and-ladder.html',
    tags: ['Platformer', 'Pirate climb', 'Touch ready'],
  },
  {
    slug: 'gravity-shift',
    title: 'Gravity Shift',
    eyebrow: 'Puzzle arcade · turn the world',
    description: 'Rotate the whole grid, settle the pieces, and clear lines before the ceiling closes in on your next run.',
    theme: 'play',
    status: 'Playable',
    accent: 'sea-glass',
    gameUrl: '/game-packages/gravity-shift.html',
    tags: ['Puzzle', 'High score', 'Touch and controller'],
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
    longDescription: 'A small listening room for late walks, open windows, and starting over. These first two pieces were made in Suno and are embedded from their public players.',
    embeds: [
      { url: 'https://suno.com/embed/ad0907ff-0c8d-4ebb-a284-269baaeeaa99', title: 'Ridge Line Cove of Quiet Smoke' },
      { url: 'https://suno.com/embed/bec2db0a-62ba-4298-ab14-47bda450fb4f', title: 'Soft Horizon' },
      { url: 'https://suno.com/embed/8f9d8f67-a88d-45ec-9c8a-23692fb77ca7', title: 'Midnight Lounge' },
      { url: 'https://suno.com/embed/5302885b-4da3-4312-bb20-5492fc37d4e3', title: 'Emerald Stays' },
      { url: 'https://suno.com/embed/5f357c78-c9b0-4cf0-8c7d-6b5ffc991e64', title: 'Festival Finder' },
      { url: 'https://suno.com/embed/628a0aef-0236-4527-88a7-afa139a76ca8', title: 'Stay for the Morning' },
      { url: 'https://suno.com/embed/f8151dba-f4e6-44e0-8726-e3372ed4a562', title: 'Save a Little Dance for Me' },
      { url: 'https://suno.com/embed/a8d6fce2-e774-4671-97ef-ef39835caf53', title: 'Flower Flour' },
      { url: 'https://suno.com/embed/0366ebb3-62ea-4a5d-a704-96e75798dcfc', title: "Don't Come Knocking" },
      { url: 'https://suno.com/embed/f2c84abe-0ccc-40e7-843c-98efc0dcaf59', title: 'I’m Better Here' },
      { url: 'https://suno.com/embed/0f3302fa-f8d2-4963-90f9-944b0a78d4b2', title: 'Call a Real Witch' },
      { url: 'https://suno.com/embed/746be89b-06a6-431e-83c8-a9741b3146a7', title: "Don't Touch That Fuse, Todd" },
      { url: 'https://suno.com/embed/96f098f0-81e7-413b-a3f9-91a479eb4542', title: "Here's a Dollar (Call Someone Smarter)" },
      { url: 'https://suno.com/embed/89512628-8d72-4aa8-b9de-edf0f8fe8427', title: 'Hold My Place…Save me from Myself' },
      { url: 'https://suno.com/embed/1c2794dd-1724-47f5-98b3-88f1931b3365', title: "Shimmy Shaggin'" },
    ],
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

export const specials: {title:string;eyebrow:string;description:string;timing:string;accent:string;cta:string;url:string}[] = [];

export const getBySlug = (items: ContentCard[], slug: string) =>
  items.find((item) => item.slug === slug);
