/* Portfolio Builder core: pure state, validation, themes, and HTML export. */
(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const escape=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lines=x=>escape(x).replace(/\n/g,'<br>');
const json=x=>JSON.stringify(x).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const palettes=[
 ['ember','Original ember',['#090a0d','#f4f3ef','#a6a8b3','#f4c4ad','#f3ae89','#8992b8','#efefeb','#15161a']],
 ['ocean','Midnight ocean',['#080f18','#f0f6ff','#a1b3ca','#a3d3ff','#6eb9ff','#70c6c4','#e9f2f8','#142234']],
 ['violet','Violet ink',['#100c19','#f6f2ff','#b9afce','#d9bdff','#b68bfa','#82a7dc','#f0ecf7','#211830']],
 ['forest','Forest light',['#0b1311','#f1f7f3','#a5b9ad','#b2e0c4','#75c9a3','#c2ab77','#eaf2ec','#152b20']],
 ['rose','Rose after dark',['#180d13','#fff1f6','#c7a9b8','#ffbfd4','#f38faf','#ab99cf','#f8edf2','#301720']],
 ['mono','Graphite',['#101112','#f4f4f4','#b0b2b5','#e7e8ec','#d4d5d9','#828993','#ededee','#1e2023']],
 ['paper','Paper & copper',['#f4f2ef','#272421','#64615d','#914422','#af653b','#738391','#252321','#faf7f3']],
 ['daylight','Blue daylight',['#f1f6fa','#152a3a','#516775','#175b88','#287bb2','#79969f','#112b3d','#edf6ff']]
].map(([id,name,colors])=>({id,name,theme:Object.fromEntries(['background','text','muted','accent','signalA','signalB','panel','panelText'].map((k,i)=>[k,colors[i]]))}));
function safeUrl(value){
 if(typeof value!=='string')return false;
 const v=value.trim();if(!v||/[\\\u0000-\u0020\u007f]/.test(v)||v.startsWith('//'))return false;
 if(/^https?:\/\//i.test(v)){try{const u=new URL(v);return !u.username&&!u.password;}catch{return false;}}
 return !/^[^/?#]*:/.test(v);
}
function normalize(raw,base,allowDraft=false){
 if(!raw||raw.schemaVersion!==1)throw Error('This design version is not supported. Open a design saved by this builder.');
 // Earlier saved designs acquire the new galleries without losing their edits.
 raw={...raw};for(const key of ['papers','resources','documents','mathematics'])if(raw[key]===undefined)raw[key]=clone(base[key]);
 function copy(template,value,path){
  if(Array.isArray(template)){
   if(!Array.isArray(value)||value.length>50)throw Error('Invalid list: '+path);
   return value.map((v,i)=>copy(template[0],v,path+'.'+i));
  }
  if(template&&typeof template==='object'){
   if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Missing design section: '+path);
   return Object.fromEntries(Object.keys(template).map(k=>[k,copy(template[k],value[k],path+'.'+k)]));
  }
  if(typeof value!==typeof template||typeof value==='string'&&value.length>20000)throw Error('Invalid field: '+path);
  return value;
 }
 const state=copy(base,raw,'design');
 for(const [k,v]of Object.entries(state.theme))if(!/^#[0-9a-f]{6}$/i.test(v))throw Error('Invalid color: '+k);
 if(!allowDraft&&!safeUrl(state.profile.tributeUrl))throw Error('The tribute link must be a relative or HTTP(S) URL.');
 for(const p of state.projects)if(!allowDraft&&!safeUrl(p.url))throw Error('Use a relative or HTTP(S) link for '+p.name+'.');
 for(const d of state.documents){
  if(!['paper','resource'].includes(d.kind))throw Error('Choose paper or resource for '+d.title+'.');
  if(!allowDraft&&(!safeUrl(d.url)||!safeUrl(d.preview)))throw Error('Use relative or HTTP(S) links for '+d.title+' and its preview image.');
 }
 for(const e of state.mathematics.items){
  if(e.latex.length>2000)throw Error('Keep each equation under 2,000 characters.');
  if(!allowDraft){if(!safeUrl(e.sourceUrl))throw Error('Use a relative or HTTP(S) source link for '+e.title+'.');mathML(e.latex);}
 }
 return state;
}
function mathML(latex){
 const engine=typeof module!=='undefined'&&module.exports?require('./katex.min.js'):root.katex;
 try{return engine.renderToString(latex,{displayMode:true,output:'mathml',throwOnError:true,trust:false,strict:'error',maxExpand:200,maxSize:10});}
 catch(error){throw Error('Check the equation LaTeX: '+error.message);}
}
function parseDesign(text,base,allowDraft=false){
 let value;
 if(text.trim().startsWith('<')){
  const match=text.match(/<script\b(?=[^>]*\bid=["']portfolio-builder-state["'])[^>]*>([\s\S]*?)<\/script>/i);
  if(!match)throw Error('This HTML has no saved builder design. Open a design JSON or an HTML page exported by this builder.');
  value=JSON.parse(match[1]);
 }else value=JSON.parse(text);
 return normalize(value,base,allowDraft);
}
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const alpha=(hex,a)=>`rgba(${rgb(hex).join(',')},${a})`;
const mix=(a,b,t)=>'#'+rgb(a).map((v,i)=>Math.round(v*(1-t)+rgb(b)[i]*t).toString(16).padStart(2,'0')).join('');
function themeCSS(t){
 const bg=t.background,fg=t.text,muted=t.muted,accent=t.accent,border=mix(bg,fg,.20),card=mix(bg,fg,.035),pm=mix(t.panel,t.panelText,.70);
 return `:root{--bg:${bg};--fg:${fg};--muted:${muted};--line:${border};--accent:${accent};--signal-a:${t.signalA};--signal-b:${t.signalB};--signal-grid:${border};--signal-marker:${muted}}
body{background:${bg};color:${fg}}header{background:${alpha(bg,.94)};border-color:${alpha(fg,.10)}}nav a{color:${muted}}nav a:hover,nav a.active,nav a[aria-current=page]{color:${accent}}.hero-content{text-shadow:0 2px 36px ${bg}}.hero .intro{background:linear-gradient(90deg,${alpha(bg,.65)},transparent)}h1 em{color:${accent}}.intro,.bio-note,.lab p,.section-intro,.projects-intro p{color:${muted}}.section,.page-projects main{background:linear-gradient(90deg,transparent,${alpha(bg,.93)} 11%,${alpha(bg,.96)} 89%,transparent)}.motion{color:${fg};background:${alpha(bg,.60)};border-color:${border}}.interaction-hint,.ripple-button,.research-notes h4,.project-count,.project-mark{color:${accent}}.credentials,.detail,.research-notes p,.back-link{color:${muted}}.credentials strong,.footer-name{color:${fg}}.tags span{border-color:${border}}.text-link{border-color:${mix(bg,fg,.55)}}.signal{background:${alpha(bg,.30)}}.signal-label,.eyebrow,.number,summary small{color:${muted}}footer{background:${alpha(bg,.88)};color:${muted};border-color:${border}}.project-card{background:${alpha(card,.95)};border-color:${border}}.project-card:hover{border-color:${accent}}.project-card .text-link,.project-meta{color:${accent}}.project-card p,.project-feature,.project-card small{color:${muted}!important}.teaching{background:${t.panel};color:${t.panelText}}.teaching .eyebrow,.semester,.course p,.course .detail,.course .plus{color:${pm}}.course,.course details{border-color:${mix(t.panel,t.panelText,.35)}}.teaching .teaching-intro,.course h3{color:${t.panelText}}.teaching .semester{color:${pm}}.skip{background:${fg};color:${bg}}
@media(max-width:720px){.section,.page-projects main{background:linear-gradient(90deg,transparent,${alpha(bg,.95)} 6%,${alpha(bg,.95)} 94%,transparent)}.teaching{background:${t.panel}}}`;
}
function header(s,page){return `<canvas id="field" aria-hidden="true"></canvas><a class="skip" href="${page==='home'?'#about':'#project-list'}">Skip to content</a><header><a class="brand" href="${page==='home'?'#home':'index.html'}">${escape(s.profile.name)}</a><nav aria-label="Main navigation"><a href="${page==='home'?'':'index.html'}#about">About</a><a href="${page==='home'?'':'index.html'}#research">Research</a>${s.documents.some(d=>d.enabled&&d.kind==='paper')?`<a href="${page==='home'?'':'index.html'}#papers">Papers</a>`:''}<a href="${page==='home'?'':'index.html'}#teaching">Teaching</a><a href="projects.html"${page==='projects'?' aria-current="page"':''}>Projects</a></nav><button class="motion" id="motion" aria-pressed="true" aria-label="Pause signal motion">Motion on</button></header>`;}
function footer(s){return `<footer><div><div class="footer-name">${escape(s.profile.name)}</div><p>${escape(s.profile.footerLine)}</p></div><div><p>${escape(s.profile.independence)}</p><p>With appreciation for <a href="${escape(s.profile.tributeUrl)}" target="_blank" rel="noopener noreferrer">${escape(s.profile.tributeLabel)}</a>.</p></div></footer>`;}
function sectionHead(s){return `<div class="section-head"><div class="eyebrow">${escape(s.eyebrow)}</div><h2>${lines(s.heading)}</h2></div>`;}
function documentCard(d,assets,preview){
 const embedded=assets.files&&assets.files[d.preview];
 const src=preview&&embedded&&embedded.mime.startsWith('image/')?'data:'+embedded.mime+';base64,'+embedded.base64:d.preview;
 return `<article class="document-card"><a class="paper-frame" href="${escape(d.url)}" target="_blank" rel="noopener noreferrer" aria-label="Read ${escape(d.title)} PDF in a new tab"><span class="frame-caption"><span>${escape(d.category)}</span><span>PDF / ${escape(d.pages)} ${d.pages==='1'?'page':'pages'}</span></span><span class="paper-mat"><img src="${escape(src)}" alt="First page of ${escape(d.title)}" loading="lazy" decoding="async" width="742" height="960"></span><span class="frame-open">Open the document <span aria-hidden="true">↗</span></span></a><div class="document-copy"><div class="eyebrow">${escape(d.meta)}</div><h3><a href="${escape(d.url)}" target="_blank" rel="noopener noreferrer">${escape(d.title)}</a></h3><p>${escape(d.description)}</p><a class="text-link" href="${escape(d.url)}" download>Download PDF <span aria-hidden="true">↓</span></a></div></article>`;
}
function documents(s,assets,kind,preview){
 const items=s.documents.filter(d=>d.enabled&&d.kind===kind),settings=kind==='paper'?s.papers:s.resources,id=kind==='paper'?'papers':'resources';
 return items.length?`<section class="section document-section ${id}" id="${id}">${sectionHead(settings)}<p class="section-intro">${escape(settings.intro)}</p><div class="document-grid">${items.map(d=>documentCard(d,assets,preview)).join('')}</div></section>`:'';
}
function mathematics(s){
 const items=s.mathematics.items.filter(e=>e.enabled);
 return items.length?`<section class="section mathematics" id="mathematics">${sectionHead(s.mathematics)}<p class="section-intro">${escape(s.mathematics.intro)}</p><div class="equation-grid">${items.map((e,i)=>`<article class="equation-card"><div class="equation-meta"><span>${escape(e.label)}</span><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span></div><h3>${escape(e.title)}</h3><div class="equation" tabindex="0" role="region" aria-label="Equation for ${escape(e.title)}">${mathML(e.latex)}</div><p>${escape(e.description)}</p><details class="equation-notes"><summary>Inside the equation <span aria-hidden="true">+</span></summary><div><p>${escape(e.notation)}</p><a href="${escape(e.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escape(e.sourceLabel)} <span aria-hidden="true">↗</span></a></div></details></article>`).join('')}</div></section>`:'';
}
function card(p){return `<article class="project-card"><div class="project-meta"><span>${escape(p.category)}</span><span class="project-mark" aria-hidden="true">${escape(p.mark)}</span></div><h3>${escape(p.name)}</h3><p>${escape(p.description)}</p><p class="project-feature">${escape(p.features)}</p><a class="text-link" href="${escape(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escape(p.name)} in a new tab">Open project <span aria-hidden="true">↗</span></a><small>${escape(p.note)}</small></article>`;}
function home(s,assets,preview){
 const active=s.projects.filter(p=>p.enabled),featured=active.filter(p=>p.featured);
 return `<section id="home" class="hero"><div class="hero-content"><div class="eyebrow">${escape(s.hero.eyebrow)}</div><h1>${escape(s.hero.line1)}<br>${escape(s.hero.line2)} <em>${escape(s.hero.emphasis)}</em></h1><p class="intro">${escape(s.hero.intro)}</p></div><div class="hero-bottom"><a class="text-link" href="#research">${escape(s.hero.cta)} <span aria-hidden="true">↓</span></a><div class="signal-actions"><span class="interaction-hint">Move to bend the signal · tap to ripple</span><button class="ripple-button" id="ripple">Send a ripple <span aria-hidden="true">◎</span></button></div></div></section>
<section class="section" id="about">${sectionHead(s.about)}<div class="bio-grid"><div class="eyebrow">${escape(s.profile.name)}<br>${escape(s.profile.degree)}</div><div><p class="about-copy">${escape(s.about.lead)} <span>${escape(s.about.secondary)}</span></p><p class="bio-note">${escape(s.about.note)}</p><div class="credentials">${s.about.institutions.map(x=>`<div><strong>${escape(x.title)}</strong>${escape(x.subtitle)}</div>`).join('')}</div></div></div></section>
<section class="section" id="research">${sectionHead(s.research)}<div class="research-list">${s.research.items.map((x,i)=>`<details${i===0?' open':''}><summary><span class="number">${String(i+1).padStart(2,'0')}</span><h3>${escape(x.title)}<small>${escape(x.subtitle)}</small></h3><span class="plus" aria-hidden="true">+</span></summary><div class="detail"><p>${escape(x.description)}</p><div class="research-notes">${x.notes.map(n=>`<div><h4>${escape(n.heading)}</h4><p>${escape(n.text)}</p></div>`).join('')}</div><div class="tags">${x.tags.map(t=>`<span>${escape(t)}</span>`).join('')}</div></div></details>`).join('')}</div></section>
${documents(s,assets,'paper',preview)}
<section class="section teaching" id="teaching">${sectionHead(s.teaching)}<p class="semester">${escape(s.teaching.semester)}</p><p class="teaching-intro">${escape(s.teaching.intro)}</p><div class="section-nav">${s.documents.some(d=>d.enabled&&d.kind==='resource')?'<a href="#resources">Teaching PDFs ↓</a>':''}${s.mathematics.items.some(e=>e.enabled)?'<a href="#mathematics">Mathematical notes ↓</a>':''}</div><div class="courses">${s.teaching.courses.map(c=>`<article class="course"><div class="eyebrow">${escape(c.code)}</div><h3>${escape(c.name)}</h3><p>${escape(c.description)}</p><details><summary>Explore the course themes <span class="plus" aria-hidden="true">+</span></summary><div class="detail"><ol>${c.topics.map(t=>`<li>${escape(t)}</li>`).join('')}</ol></div></details></article>`).join('')}</div></section>
${documents(s,assets,'resource',preview)}
<section class="section lab" id="exploration"><div><div class="eyebrow">${escape(s.exploration.eyebrow)}</div><h2>${lines(s.exploration.heading)}</h2>${s.exploration.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}<a class="text-link" href="projects.html">Explore the projects <span aria-hidden="true">↗</span></a></div><div class="signal"><canvas id="signal" role="img" aria-label="Illustrative time series with a marked change in behavior"></canvas><span class="signal-label">Illustrative signal / a change in behavior</span></div></section>
${mathematics(s)}
${active.length?`<section class="section featured-projects" id="projects">${sectionHead(s.featured)}<p class="section-intro">${escape(s.featured.intro)}</p><div class="project-grid">${featured.map(card).join('')}</div><div class="projects-footer-link"><a class="text-link" href="projects.html">View all ${active.length} projects <span aria-hidden="true">↗</span></a></div></section>`:''}`;
}
function gallery(s){const active=s.projects.filter(p=>p.enabled);return `<section class="projects-intro"><a class="back-link" href="index.html">← Back to the portfolio</a><div class="eyebrow">${escape(s.gallery.eyebrow)} / <span class="project-count">${String(active.length).padStart(2,'0')} projects</span></div><h1>${escape(s.gallery.line1)}<br>${escape(s.gallery.line2)} <em>${escape(s.gallery.emphasis)}</em></h1><p>${escape(s.gallery.intro)}</p></section><section class="section" id="project-list" aria-label="All projects"><div class="project-grid">${active.map(card).join('')}</div>${active.length?'':'<p class="section-intro">Projects will be added here.</p>'}</section>`;}
function render(s,assets,page='home',preview=false){
 const bridge=preview?`<script>window.addEventListener('load',function(){const anchor=${json(preview.anchor||'')};if(anchor){const target=document.getElementById(anchor);if(target)target.scrollIntoView();}else window.scrollTo(0,${Math.max(0,Number(preview.scrollY)||0)});});window.addEventListener('scroll',function(){parent.postMessage({type:'portfolio-preview-scroll',page:${json(page)},y:scrollY},'*');},{passive:true});document.addEventListener('click',function(e){const a=e.target.closest('a');if(!a)return;const h=a.getAttribute('href')||'';if(h.startsWith('#'))return;e.preventDefault();parent.postMessage({type:'portfolio-preview-link',href:h},'*');});<\/script>`:'';
 return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escape(s.profile.description)}"><meta name="theme-color" content="${escape(s.theme.background)}"><title>${escape(page==='home'?s.profile.name+' — Research, teaching & exploration':'Projects — '+s.profile.name)}</title><style>${assets.css.replace(/<\/style/gi,'<\\/style')}\n${themeCSS(s.theme)}</style></head><body${page==='projects'?' class="page-projects"':''}>${header(s,page)}<main>${page==='projects'?gallery(s):home(s,assets,preview)}</main>${footer(s)}<script type="application/json" id="portfolio-builder-state">${json(s)}<\/script><script>${assets.signal.replace(/<\/script/gi,'<\\/script')}<\/script>${bridge}</body></html>`;
}
function saveRevision(list,state,name,stamp=new Date().toISOString()){
 const next={id:stamp+'-'+Math.random().toString(36).slice(2,7),name:name.trim()||'Saved version',savedAt:stamp,state:clone(state)};
 return [next,...list].slice(0,20);
}
function writeStorage(storage,key,value){try{storage.setItem(key,JSON.stringify(value));return {ok:true};}catch(error){return {ok:false,error:'Browser saving is unavailable or full. Download your design to keep it.'};}}
root.PortfolioBuilderCore={clone,escape,lines,json,palettes,safeUrl,mathML,normalize,parseDesign,themeCSS,render,saveRevision,writeStorage};
})(typeof module!=='undefined'&&module.exports?module.exports:globalThis);
