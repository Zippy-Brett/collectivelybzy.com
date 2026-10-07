// Owner-only migration utility. No management credentials are used by the site.
import { readFile } from 'node:fs/promises';
const {components}=JSON.parse(await readFile(new URL('../cms/components.json',import.meta.url)));
const {stories,space_id}=JSON.parse(await readFile(new URL('../cms/stories.json',import.meta.url)));
const apply=process.argv.includes('--apply');
if (!apply) { console.log(`Plan only: ${components.length} schemas, ${stories.length} draft stories into space ${space_id}. Existing records are never overwritten. Use --apply with STORYBLOK_MANAGEMENT_TOKEN in your local environment.`); process.exit(0); }
const token=process.env.STORYBLOK_MANAGEMENT_TOKEN;
if (!token) throw new Error('Set STORYBLOK_MANAGEMENT_TOKEN locally. Do not put it in the website environment.');
const base=`https://mapi.storyblok.com/v1/spaces/${space_id}`;
async function request(path,method='GET',body) {
 const result=await fetch(base+path,{method,headers:{Authorization:token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
 if (!result.ok) throw new Error(`Storyblok ${method} ${path.split('?')[0]} failed (${result.status}).`);
 return result.json();
}
const existing=(await request('/components')).components;
// Inspect the whole schema before making any mutations.
for(const component of components){const old=existing.find(c=>c.name===component.name);if(old){const missing=Object.entries(component.schema).filter(([key,value])=>!old.schema[key]||old.schema[key].type!==value.type);if(missing.length)throw new Error(`Review existing ${component.name} schema first: ${missing.map(([key])=>key).join(', ')}. No schema has been overwritten.`);}}
const records=[];
for(let page=1;;page++){const batch=(await request(`/stories?per_page=100&page=${page}`)).stories;records.push(...batch);if(batch.length<100)break;if(page>=100)throw new Error('Story pagination exceeded safety limit.');}
for(const component of components)if(!existing.some(c=>c.name===component.name))await request('/components','POST',{component});
const folders=new Map();
for(const folder of ['apps','games','projects','store']){const old=records.find(s=>s.is_folder&&s.full_slug.replace(/\/$/,'')===folder);const record=old||(await request('/stories','POST',{publish:false,story:{name:folder[0].toUpperCase()+folder.slice(1),slug:folder,is_folder:true}})).story;folders.set(folder,record.id);}
for(const {folder,...story} of stories){const path=folder?`${folder}/${story.slug}`:story.slug;if(records.some(s=>s.full_slug===path)){console.log(`Keep existing: ${path}`);continue;}await request('/stories','POST',{publish:false,story:{...story,...(folder?{parent_id:folders.get(folder)}:{})}});console.log(`Created draft: ${path}`);}
console.log('Draft import complete. Review and publish in Storyblok, then rebuild Cloudflare.');
