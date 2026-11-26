(async function () {
  const groups = [...document.querySelectorAll('[data-folder]')];
  if (!groups.length || !/^https?:$/.test(location.protocol)) return;
  let branch = 'master';
  if (location.hostname === 'htmlpreview.github.io') {
    const path = new URL(location.search.slice(1)).pathname;
    branch = decodeURIComponent(path.split('/blob/')[1].split('/site/')[0]);
  }
  try {
    const response = await fetch('https://api.github.com/repos/ml-adnan-bashir/portfolio/git/trees/' + encodeURIComponent(branch) + '?recursive=1');
    if (!response.ok) throw Error();
    const listing = await response.json();
    if (listing.truncated) throw Error();
    const other = groups.find(grid => grid.dataset.folder === 'lecture-apps');
    if (other) {
      const nav = document.querySelector('.course-jump');
      const files = listing.tree.filter(item => item.type === 'blob');
      const folders = new Set();
      for (const file of files) {
        const match = /^site\/lecture-apps\/([^/]+)\/(.+)$/.exec(file.path);
        if (match && (match[2] === 'course.txt' || /\.html?$/i.test(match[2]))) folders.add(match[1]);
      }
      for (const code of [...folders].sort()) {
        const folder = 'lecture-apps/' + code;
        let grid = groups.find(group => group.dataset.folder === folder);
        if (!grid) {
          const section = document.createElement('section');
          section.id = 'course-' + encodeURIComponent(code);
          section.className = 'section course-app-section';
          const label = document.createElement('div');
          label.className = 'eyebrow'; label.textContent = code.toUpperCase();
          const heading = document.createElement('h2'); heading.textContent = label.textContent;
          grid = document.createElement('div'); grid.className = 'app-grid'; grid.dataset.folder = folder;
          section.append(label, heading, grid);
          other.parentElement.before(section);
          groups.push(grid);
          const link = document.createElement('a');
          link.href = '#' + encodeURIComponent(section.id); link.textContent = label.textContent;
          nav.append(link);
        }
        if (files.some(file => file.path === 'site/' + folder + '/course.txt')) {
          try {
            const response = await fetch('lecture-apps/' + encodeURIComponent(code) + '/course.txt');
            if (response.ok) {
              const name = (await response.text()).trim().split(/\r?\n/)[0];
              if (name) grid.parentElement.querySelector('h2').textContent = name;
            }
          } catch { /* The course code remains available as its heading. */ }
        }
      }
    }
    for (const grid of groups) {
      const prefix = 'site/' + grid.dataset.folder + '/';
      const nested = groups.filter(other => other !== grid && other.dataset.folder.startsWith(grid.dataset.folder + '/')).map(other => 'site/' + other.dataset.folder + '/');
      const paths = listing.tree.filter(f => f.type === 'blob' && f.size > 2 && f.path.startsWith(prefix) && !nested.some(folder => f.path.startsWith(folder)) && /\.html?$/i.test(f.path))
        .map(f => f.path.slice(5));
      const entries = paths.filter(p => !paths.some(other => other !== p && /\/index\.html?$/i.test(other) && p.startsWith(other.slice(0,other.lastIndexOf('/')+1))));
      if (grid.parentElement.hasAttribute("data-optional")) grid.parentElement.hidden = entries.length === 0;
      for (const card of [...grid.children]) if (!entries.includes(card.dataset.path)) card.remove();
      for (const path of entries.sort()) {
        if ([...grid.children].some(card => card.dataset.path === path)) continue;
        const url = path.split('/').map(encodeURIComponent).join('/');
        const card = document.createElement('article');
        card.className = 'project-card'; card.dataset.path = path;
        const heading = document.createElement('h3');
        heading.textContent = path.replace(/\/index\.html?$/i,'').split('/').pop().replace(/\.html?$/i,'');
        const link = document.createElement('a');
        link.className = 'text-link'; link.href = url; link.textContent = 'Open app ↗';
        card.append(heading,link); grid.append(card);
        try {
          const page = await fetch(url,{headers:{Range:'bytes=0-32767'}});
          if (page.ok && page.body) {
            const reader=page.body.getReader(); let text=''; const decoder=new TextDecoder();
            while(text.length<32768 && !/<\/title>/i.test(text)) {
              const item=await reader.read(); if(item.done) break;
              text+=decoder.decode(item.value,{stream:true});
            }
            reader.cancel().catch(()=>{});
            const template=document.createElement('template');
            template.innerHTML=text.slice(0,32768);
            heading.textContent=template.content.querySelector('title')?.textContent.trim() || heading.textContent;
          }
        } catch { /* Keep the filename link when metadata is unavailable. */ }
      }
    }
  } catch {
    const message=document.createElement('p'); message.textContent='Showing the bundled catalog. Refresh to check for newly uploaded apps.';
    groups[0].before(message);
  }
})();
