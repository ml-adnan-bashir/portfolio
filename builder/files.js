/* All writes are confined to the chosen folder. Backups precede mutations. */
(function(root){
'use strict';
function cleanPath(path,internal=false){if(typeof path!=='string'||!path||path.startsWith('/')||path.includes('\\')||/[\x00-\x1f:*?"<>|]/.test(path))throw Error('Invalid relative file path.');const parts=path.split('/');if(parts.some(p=>!p||p==='.'||p==='..'||p.toLowerCase()==='.git'||(!internal&&p==='.portfolio-backups')))throw Error('This path is outside the editable portfolio files.');return parts;}
async function handle(folder,path,create=false,internal=false){const parts=cleanPath(path,internal);let dir=folder;for(const p of parts.slice(0,-1))dir=await dir.getDirectoryHandle(p,{create});return dir.getFileHandle(parts.at(-1),{create});}
async function read(folder,path){try{return await(await handle(folder,path)).getFile();}catch(e){if(e.name==='NotFoundError')return null;throw e;}}
async function write(folder,path,content,internal=false){const h=await handle(folder,path,true,internal),stream=await h.createWritable();try{await stream.write(content);await stream.close();}catch(e){try{await stream.abort();}catch{}throw e;}}
async function remove(folder,path){const p=cleanPath(path);let dir=folder;for(const a of p.slice(0,-1))dir=await dir.getDirectoryHandle(a);await dir.removeEntry(p.at(-1));}
async function same(a,b){if(a===null||b===null)return a===b;const blob=v=>typeof v==='string'?new Blob([v]):v;const av=blob(a),bv=blob(b);if(av.size!==bv.size)return false;const x=new Uint8Array(await av.arrayBuffer()),y=new Uint8Array(await bv.arrayBuffer());return x.every((v,i)=>v===y[i]);}
async function open(folder){const files={};for(const name of ['index.html','projects.html','portfolio-design.json','builder-defaults.js','.gitignore']){const f=await read(folder,name);files[name]=f?await f.text():null;}if(!files['index.html']||!files['projects.html'])throw Error('Select the portfolio folder containing both index.html and projects.html.');return {folder,expected:files,sources:{home:files['index.html'],projects:files['projects.html']}};}
async function save(session,output,onProgress=()=>{}){
 const permission=await session.folder.queryPermission({mode:'readwrite'});if(permission!=='granted')throw Error('Folder write permission is needed. Click Save to folder again and allow access.');
 const planned={...output},ignore=await read(session.folder,'.gitignore'),ignoreText=ignore?await ignore.text():'';
 if(!ignoreText.split(/\r?\n/).some(s=>s.trim()==='.portfolio-backups/'||s.trim()==='/.portfolio-backups/'))planned['.gitignore']=ignoreText+(ignoreText&&!ignoreText.endsWith('\n')?'\n':'')+'\n# Local portfolio editor backups\n.portfolio-backups/\n';
 const changes=[];for(const[path,content]of Object.entries(planned)){cleanPath(path);const current=await read(session.folder,path);const owned=Object.prototype.hasOwnProperty.call(session.expected,path),expected=owned?session.expected[path]:null;
  if(owned&&!await same(current,expected))throw Error(path+' changed outside the builder. Open the folder again before saving; your draft is still available.');
  if(!owned&&current&&!await same(current,content))throw Error(path+' already exists. Rename the uploaded asset before saving.');
  if(!await same(current,content))changes.push({path,content,old:current?new Blob([await current.arrayBuffer()]):null});
 }
 if(!changes.length)return {paths:[],backup:null};
 const stamp=new Date().toISOString().replace(/[:.]/g,'-')+'-'+Math.random().toString(36).slice(2,6),backup='.portfolio-backups/'+stamp;
 for(const c of changes)if(c.old){onProgress('Backing up '+c.path);await write(session.folder,backup+'/'+c.path,c.old,true);}
 // Recheck after backups to catch a concurrently edited page before the first write.
 for(const c of changes)if(!await same(await read(session.folder,c.path),c.old))throw Error(c.path+' changed while the backup was being made. No portfolio files were overwritten.');
 const attempted=[];try{for(const c of changes){onProgress('Saving '+c.path);attempted.push(c);await write(session.folder,c.path,c.content);}}
 catch(e){const failed=[];for(const c of attempted.reverse()){try{if(c.old)await write(session.folder,c.path,c.old);else await remove(session.folder,c.path);}catch{failed.push(c.path);}}
  throw Error('Save failed: '+e.message+(failed.length?' Restore these files from '+backup+': '+failed.join(', '):' Previous files were restored. Your changes remain in the editor.'));
 }
 for(const c of changes)session.expected[c.path]=c.content;
 return {paths:changes.map(c=>c.path),backup:changes.some(c=>c.old)?backup:null};
}
root.PortfolioFiles={cleanPath,read,write,open,save,same};
})(globalThis);
