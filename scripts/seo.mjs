import { readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
const root = new URL('../dist/', import.meta.url).pathname;
const files = [];
async function walk(dir) { for (const item of await readdir(dir, {withFileTypes:true})) { const path=join(dir,item.name); if(item.isDirectory()) await walk(path); else if(item.name.endsWith('.html')) files.push(path); } }
await walk(root);
const urls = files.filter(path=> !relative(root,path).startsWith('games/') || /games\/(?:index.html|[^/]+\/index.html)$/.test(relative(root,path))).map(path=> '/'+relative(root,path).replace(/index.html$/, '')).filter(path=> !path.includes('splash-preview') && !path.endsWith('.html'));
await writeFile(join(root,'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(path=>`<url><loc>https://collectivelybzy.com${path}</loc></url>`).join('')}</urlset>`);
await writeFile(join(root,'robots.txt'), process.env.SITE_INDEXABLE === 'false' ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\nDisallow: /splash-preview/\nDisallow: /game-packages/\nSitemap: https://collectivelybzy.com/sitemap.xml\n');
console.log(`Sitemap: ${urls.length} public pages`);

const preview = process.env.SITE_INDEXABLE === 'false';
await writeFile(join(root,'_headers'), `${preview ? '/*\n  X-Robots-Tag: noindex, nofollow\n' : ''}/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n/images/*\n  Cache-Control: public, max-age=3600, must-revalidate\n/splash-preview/*\n  X-Robots-Tag: noindex, nofollow\n`);
