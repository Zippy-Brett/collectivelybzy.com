import assert from 'node:assert/strict';
import { readFile,readdir,access } from 'node:fs/promises';
import { join,dirname } from 'node:path';
import { apps } from '../src/data/content.ts';
const root=new URL('../dist/',import.meta.url).pathname;
const home=await readFile(join(root,'index.html'),'utf8');
assert.match(home,/Out in the world \/ 5 apps/);assert.match(home,/On the workbench \/ 4 apps/);
assert.equal(apps.length,9);assert.equal(apps.filter(a=>a.storeUrl).length,5);
const errors=[];let pages=0;
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory()){await walk(path);continue;}if(!entry.name.endsWith('.html')||path.includes('/game-packages/'))continue;const html=await readFile(path,'utf8');if(!html.includes('class="site-shell"'))continue;pages++;assert.match(html,/<link rel="canonical" href="https:\/\/collectivelybzy.com/);assert.match(html,/name="robots"/);for(const [,url] of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)){if(url==='/'||url.startsWith('//'))continue;const target=join(root,url);try{await access(url.endsWith('/')?join(target,'index.html'):target);}catch{errors.push(`${path}: ${url}`);}}}}
await walk(root);assert.deepEqual(errors,[]);
for(const app of apps){const html=await readFile(join(root,'apps',app.slug,'index.html'),'utf8');assert.ok(html.includes(app.title));assert.match(html,/What it’s here to do/);if(app.storeUrl)assert.ok(html.includes(app.storeUrl));else assert.match(html,/Get studio release news/);}
const sitemap=await readFile(join(root,'sitemap.xml'),'utf8');for(const app of apps)assert.ok(sitemap.includes(`/apps/${app.slug}/`));assert.equal(sitemap.includes('splash-preview'),false);
assert.match(home,/data-form="4f8Hhv"/);assert.match(await readFile(join(root,'robots.txt'),'utf8'),/Sitemap:/);
assert.match(await readFile(join(root,'splash-preview/index.html'),'utf8'),/noindex, nofollow/);
console.log(`Verified ${pages} public layouts, nine app detail pages, all local assets and links, release grouping, sitemap, production indexing, and MailerLite embed.`);
