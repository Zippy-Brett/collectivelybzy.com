import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { writeFile,readFile } from 'node:fs/promises';
const base=new URL('../',import.meta.url).pathname;
let number=0;
async function load(env={}){ const output=`${base}node_modules/.cache/collectively-module-${number++}.mjs`;await build({entryPoints:[base+'src/lib/content.ts'],outfile:output,bundle:true,packages:'external',platform:'node',format:'esm',define:{'import.meta.env':JSON.stringify({STORYBLOK_CONTENT_ENABLED:'true',...env})},logLevel:'silent'});return import(output); }
const story=(slug,visible=true)=>({slug,name:slug,content:{display_on_site:visible,status:'in-development',short_description:'Example',body:[{component:'rich_text',body:{type:'doc',content:[{type:'bullet_list',content:[{type:'list_item',content:[{type:'paragraph',content:[{type:'text',text:'A real benefit'}]}]}]}]}}]}});
let module=await load();assert.equal((await module.getApps()).length,9);
module=await load({STORYBLOK_PUBLIC_TOKEN:'test',STORYBLOK_CONTENT_ENABLED:'false'});assert.equal((await module.getApps()).length,9);
globalThis.fetch=async()=>new Response(JSON.stringify({stories:[story('roametry',false),story('corelink')]}),{status:200});
module=await load({STORYBLOK_PUBLIC_TOKEN:'test'});let apps=await module.getApps();assert.deepEqual(apps.map(a=>a.slug),['corelink']);assert.deepEqual(apps[0].features,['A real benefit']);
module=await load({STORYBLOK_PUBLIC_TOKEN:'test',STORYBLOK_MIGRATION_MODE:'merge'});apps=await module.getApps();assert.equal(apps.length,8);assert.equal(apps.some(a=>a.slug==='roametry'),false);
globalThis.fetch=async()=>new Response('{}',{status:503});module=await load({STORYBLOK_PUBLIC_TOKEN:'test'});await assert.rejects(()=>module.getApps(),/503/);
await assert.rejects(()=>load({STORYBLOK_PREVIEW_TOKEN:'test',STORYBLOK_VERSION:'draft'}),/Draft content/);
await assert.rejects(()=>load({STORYBLOK_PREVIEW_TOKEN:'test',STORYBLOK_VERSION:'draft',STORYBLOK_PREVIEW_BUILD:'true'}),/SITE_INDEXABLE/);
globalThis.fetch=async()=>new Response(JSON.stringify({stories:[{...story('missing-store-link'),content:{status:'available'}}]}));module=await load({STORYBLOK_PUBLIC_TOKEN:'test'});await assert.rejects(()=>module.getApps(),/official App Store link/);
let requests=0;globalThis.fetch=async()=>new Response(JSON.stringify({stories:++requests===1?Array.from({length:100},(_,i)=>story('app-'+i)):[story('last-app')]}));module=await load({STORYBLOK_PUBLIC_TOKEN:'test'});assert.equal((await module.getApps()).length,101);assert.equal(requests,2);
const seed=JSON.parse(await readFile(base+'cms/stories.json'));assert.equal(seed.stories.filter(s=>s.folder==='apps').length,9);const sensory=seed.stories.find(s=>s.slug==='sensory-seek');assert.equal(sensory.content.status,'available');assert.match(sensory.content.app_store_url.url,/id6806780705/);
console.log('Passed: nine-app fallback; authoritative visibility; migration visibility; rich-text benefits; failed request stops build; two draft guards; pagination; nine seeds; Sensory Seek release state.');
