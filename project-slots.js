/* Discover user-uploaded files on a static host. Reading a slot never opens it. */
(() => {
  'use strict';
  const grid = document.querySelector('#project-list .project-grid');
  if (!grid || !/^https?:$/.test(location.protocol)) return;

  const slotCount = 100;
  const headerBytes = 64 * 1024;
  let nextSlot = 1;

  async function readPrefix(response) {
    // Some static hosts ignore byte ranges. Stop reading large standalone apps early.
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let remaining = headerBytes;
    let text = '';
    try {
      while (remaining > 0) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = value.subarray(0, remaining);
        text += decoder.decode(chunk, { stream: true });
        remaining -= chunk.length;
      }
      return text + decoder.decode();
    } finally {
      reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  }

  function metadata(text, number) {
    if (!text.trim() || text.includes('<!-- portfolio-reserved-project-slot -->')) return null;
    // Nodes in a template remain inert. Only plain text goes into the live gallery.
    const template = document.createElement('template');
    template.innerHTML = text;
    const content = template.content;
    const clean = value => (value || '').replace(/\s+/g, ' ').trim();
    const title = clean(content.querySelector('title')?.textContent) ||
                  clean(content.querySelector('h1')?.textContent) || 'Project ' + number;
    const description = clean(content.querySelector('meta[name="description" i]')?.content);
    // Ignore pages containing only a title, metadata or the shared visit counter.
    content.querySelectorAll('title,meta:not([http-equiv="refresh" i]),script[src$="page-visits.js"]').forEach(node => node.remove());
    if (!content.textContent.trim() &&
        !content.querySelector('script,canvas,svg,img,video,iframe,object,embed,audio,input,button,link[rel="stylesheet"],style,meta[http-equiv="refresh" i]')) return null;
    return { title, description };
  }

  function insertCard(number, path, project) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.projectSlot = String(number);
    const heading = document.createElement('h3');
    heading.textContent = project.title;
    const link = document.createElement('a');
    link.className = 'text-link';
    link.href = path;
    link.textContent = 'Open project ↗';
    link.setAttribute('aria-label', 'Open ' + project.title);
    card.append(heading);
    if (project.description) {
      const summary = document.createElement('p');
      summary.textContent = project.description;
      card.append(summary);
    }
    card.append(link);
    const after = Array.from(grid.querySelectorAll('[data-project-slot]'))
      .find(other => Number(other.dataset.projectSlot) > number);
    grid.insertBefore(card, after || null);
    const count = document.querySelector('.project-count');
    if (count) {
      const total = grid.querySelectorAll(':scope > .project-card').length;
      count.textContent = String(total).padStart(2, '0') + (total === 1 ? ' project' : ' projects');
    }
  }

  async function scan() {
    while (nextSlot <= slotCount) {
      const number = nextSlot++;
      const path = 'project' + number + '.html';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(path, {
          headers: { Range: 'bytes=0-' + (headerBytes - 1) },
          cache: 'no-cache', redirect: 'error', signal: controller.signal
        });
        if (!response.ok || !response.body) continue;
        const project = metadata(await readPrefix(response), number);
        if (project) insertCard(number, path, project);
      } catch {
        // A missing or temporarily unavailable slot must not interrupt the others.
      } finally {
        clearTimeout(timer);
      }
    }
  }
  for (let worker = 0; worker < 6; worker++) scan();
})();
