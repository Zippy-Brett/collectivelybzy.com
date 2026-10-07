import { apps, games, projects } from '../src/data/content.ts';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
const output = new URL('../cms/', import.meta.url); await mkdir(output,{recursive:true});
const field=(type,display_name,extra={})=>({type,display_name,...extra});
const schema={
 display_on_site:field('boolean','Show on website',{default_value:true,description:'Turn off and publish to remove this page from the next build.'}),
 status:field('option','Release status',{options:[{name:'Available',value:'available'},{name:'In testing',value:'in-development'},{name:'Coming soon',value:'coming-soon'},{name:'Archived',value:'archived'},{name:'Playable',value:'playable'}]}),
 short_description:field('textarea','Short description',{required:true}),
 hero_image:field('asset','Product image',{filetypes:['images'],description:'Add descriptive alternative text. Keep screenshots current.'}),
 app_store_url:field('multilink','App Store link',{description:'Use the official https://apps.apple.com URL. Leave blank for testing apps.'}),
 palette:field('option','Accent palette',{options:['sea-glass','brass','storm','studio-sand'].map(value=>({name:value,value}))}),
 notice:field('textarea','Useful product note'),
 body:field('bloks','Page content',{restrict_components:true,component_whitelist:['rich_text','gallery','cta_button']})
};
const components=[{name:'app_page',display_name:'App page',is_root:true,is_nestable:false,schema},
{name:'rich_text',display_name:'Description & benefits',is_root:false,is_nestable:true,schema:{body:field('richtext','Text and benefit bullets')}},
{name:'gallery',display_name:'Product screenshots',is_root:false,is_nestable:true,schema:{images:field('multiasset','Screenshots',{filetypes:['images']})}},
{name:'cta_button',display_name:'App Store button',is_root:false,is_nestable:true,schema:{link:field('multilink','Official App Store URL')}},
{name:'bzy_studio_home',display_name:'Studio homepage',is_root:true,is_nestable:false,schema:{headline:field('text','Headline, first line'),second_line:field('text','Headline, second line'),description:field('textarea','Introduction'),featured_app:field('text','Featured app slug',{description:'Use an existing app slug, e.g. roametry. Hidden apps cannot be featured.'})}},
...['game','project'].map(kind=>({name:`bzy_${kind}_page`,display_name:`Studio ${kind} page`,is_root:true,is_nestable:false,schema:{...schema,eyebrow:field('text','Category label')}})),
{name:'bzy_store_note',display_name:'Store note',is_root:true,is_nestable:false,schema:{display_on_site:schema.display_on_site,description:field('textarea','Description'),timing:field('text','Dates or timing')}}];
const asset=(filename,alt='',title='')=>({id:0,fieldtype:'asset',filename,alt,title});
const text=t=>({type:'paragraph',content:[{type:'text',text:t}]});
function story(item,folder,component){return {name:item.title,slug:item.slug,folder,content:{_uid:randomUUID(),component,display_on_site:true,status:item.theme === 'play' ? 'playable': item.storeUrl ? 'available':'in-development',short_description:item.description,eyebrow:item.eyebrow,hero_image:asset(item.image||'',item.imageAlt||''),app_store_url:{fieldtype:'multilink',linktype:'url',url:item.storeUrl||''},palette:item.accent === 'sea-glass' ? 'sea-glass':'brass',notice:item.notice||'',body:[{_uid:randomUUID(),component:'rich_text',body:{type:'doc',content:[text(item.longDescription||item.description),...(item.features?.length?[{type:'bullet_list',content:item.features.map(feature=>({type:'list_item',content:[text(feature)]}))}]:[])]}},...(item.gallery?.length?[{_uid:randomUUID(),component:'gallery',images:item.gallery.map(i=>asset(i.src,i.alt,i.caption))}]:[])]}};}
const stories=[{name:'Studio homepage',slug:'studio-home',content:{component:'bzy_studio_home',_uid:randomUUID(),headline:'Little things.',second_line:'Better days.',description:'Thoughtful apps, playful detours, and ideas that make everyday life a little more you.',featured_app:'roametry'}},...apps.map(i=>story(i,'apps','app_page')),...games.map(i=>story(i,'games','bzy_game_page')),...projects.map(i=>story(i,'projects','bzy_project_page'))];
await writeFile(new URL('components.json',output),JSON.stringify({components},null,2)+'\n');
await writeFile(new URL('stories.json',output),JSON.stringify({space_id:'295535334209633',stories},null,2)+'\n');
console.log(`Prepared ${components.length} components and ${stories.length} draft stories (${apps.length} apps).`);
