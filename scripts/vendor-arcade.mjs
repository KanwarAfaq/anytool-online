// Vendor game runtime into AnyTool without adding game engines to Vite.
import {cp, mkdir, readFile, writeFile, rm, readdir} from 'node:fs/promises';
import {resolve, join, dirname} from 'node:path';
import {arcadeGames} from '../src/data/arcadeGames.js';
const source=resolve(process.argv[2]||'.vendor-games');
const target=resolve('public');
const copy=async a=>{
  const from=join(source,a),to=join(target,a);
  await rm(to,{recursive:true,force:true});
  await mkdir(dirname(to),{recursive:true});
  await cp(from,to,{recursive:true});
};
for(const path of ['assets/css','assets/js','assets/img','play'])await copy(path);
// This integration stylesheet lives in AnyTool, not the imported source.
await cp(resolve('scripts/arcade-embed.css'),join(target,'assets/css/anytool-embed.css'));

// Compiled WebGL launch documents are application runtime, not content pages.
for(const slug of ['lumenfall','neon-velocity','starfall-protocol']){
  const engine=join(target,'play',slug,'index.html');
  let html=await readFile(engine,'utf8');
  if(!/<meta name="robots"/i.test(html)){
    html=html.replace(/<head>/i,'<head>\n    <meta name="robots" content="noindex,follow">');
  }
  if(!html.includes('content="noindex,follow"'))throw Error('Engine must be noindex: '+slug);
  await writeFile(engine,html);
}
await mkdir(join(target,'games'),{recursive:true});
const listing=await readdir(join(source,'games'));
for(const game of arcadeGames){
  const slug=game.slug;
  if(!listing.includes(slug+'.html'))throw Error('Missing game: '+slug);
  let html=await readFile(join(source,'games',slug+'.html'),'utf8');
  const canonical='https://anytool.online/games/'+slug;
  html=html.replace(/<meta name="robots" content="[^"]*">/i,'<meta name="robots" content="noindex,follow">')
    .replace(/<link rel="canonical" href="[^"]*">/i,'<link rel="canonical" href="'+canonical+'">')
    .replace(/<meta property="og:url" content="[^"]*">/i,'<meta property="og:url" content="'+canonical+'">')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/gi,'')
    .replace(/<link rel="manifest"[^>]*>/gi,'')
    .replaceAll('https://games-psi-ashy.vercel.app/assets/','https://anytool.online/assets/')
    .replace(/<\/head>/i,'<script>if(new URLSearchParams(location.search).has("embed"))document.documentElement.classList.add("anytool-arcade-embed")</script><link rel="stylesheet" href="../assets/css/anytool-embed.css"></head>')
    .replaceAll('../index.html#games','/games')
    .replaceAll('../index.html','/games')
    .replaceAll('../contact.html','/contact');
  if(!html.includes('content="noindex,follow"'))throw Error('Missing robots meta: '+slug);
  await writeFile(join(target,'games',slug+'.html'),html);
}
const siteJs=join(target,'assets/js/site.js');
const code=await readFile(siteJs,'utf8');
if(!code.includes("navigator.serviceWorker.register('/sw.js')"))throw Error('Legacy service worker changed');
await writeFile(siteJs,code.replace("navigator.serviceWorker.register('/sw.js')",'Promise.resolve()'));
// Keep the editable 3D/2D game source in the same repository as the playable
// compiled output. This directory is never included in Vite's browser bundle.
const sourceTarget=resolve('vendor/arcade-source')
await rm(sourceTarget,{recursive:true,force:true})
await mkdir(sourceTarget,{recursive:true})
for(const dir of ['lumenfall','neon-velocity','starfall-protocol','scripts','games']){
 await cp(join(source,dir),join(sourceTarget,dir),{recursive:true,force:true})
}
await cp(join(source,'README.md'),join(sourceTarget,'UPSTREAM_README.md'))
await writeFile(join(sourceTarget,'SOURCE_REVISION.txt'),(process.env.GAMES_COMMIT||'manual')+'\\n')

await writeFile(join(target,'arcade-manifest.json'),JSON.stringify({revision:process.env.GAMES_COMMIT||'manual',games:arcadeGames.map(g=>g.slug),hosting:'same-origin AnyTool; game engines loaded only on demand'},null,2)+'\n');
console.log('ARCADE_VENDORED',arcadeGames.length);
