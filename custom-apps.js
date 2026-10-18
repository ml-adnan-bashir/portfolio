/* Custom app entries live in the CUSTOM APPS block in index.html.
   This shared loader renders them on the homepage and Projects page.
   No packages, build step, or server-side code are required. */
(function () {
  'use strict';

  const catalogId = 'custom-app-list';
  const messageType = 'portfolio-custom-apps-v1';
  const sourceParameter = 'custom-apps-source';
  const indexURL = new URL('index.html', document.baseURI);

  function appURL(value, base) {
    const url = new URL(value, base);
    const folder = new URL('apps/custom/', base);
    if (url.protocol !== folder.protocol || url.host !== folder.host ||
        !url.pathname.startsWith(folder.pathname) || !/\.html?$/i.test(url.pathname)) {
      throw new Error('Custom app links must point to HTML files inside apps/custom/.');
    }
    return url.href;
  }

  function readApps(source, base) {
    const template = source.getElementById(catalogId);
    if (!template || !template.content) {
      throw new Error('The CUSTOM APPS block is missing from index.html.');
    }
    const apps = [];
    for (const link of template.content.querySelectorAll('a[href]')) {
      const name = link.textContent.trim();
      if (!name) continue;
      try {
        apps.push({
          name,
          href: appURL(link.getAttribute('href'), base),
          description: link.dataset.description || '',
          category: link.dataset.category || 'HTML app',
          mark: link.dataset.mark || '↗'
        });
      } catch (error) {
        console.warn('Skipped custom app "' + name + '": ' + error.message);
      }
    }
    return apps;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function card(app) {
    const article = element('article', 'project-card');
    article.setAttribute('data-custom-app-card', '');
    const meta = element('div', 'project-meta');
    const mark = element('span', 'project-mark', app.mark);
    mark.setAttribute('aria-hidden', 'true');
    meta.append(element('span', '', app.category), mark);
    article.append(meta, element('h3', '', app.name));
    if (app.description) article.append(element('p', '', app.description));
    const link = element('a', 'text-link', 'Open project ');
    link.href = app.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Open ' + app.name + ' in a new tab');
    const arrow = element('span', '', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    link.append(arrow);
    article.append(link);
    return article;
  }

  function key(href) {
    const url = new URL(href, document.baseURI);
    return url.protocol + '//' + url.host + url.pathname;
  }

  function render(apps, grid) {
    grid.querySelectorAll('[data-custom-app-card]').forEach(node => node.remove());
    const seen = new Set(Array.from(grid.querySelectorAll('a[href]'), link => key(link.href)));
    const fragment = document.createDocumentFragment();
    let added = 0;
    for (const app of apps) {
      const href = appURL(app.href, indexURL);
      const id = key(href);
      if (seen.has(id)) continue;
      seen.add(id);
      fragment.append(card({ ...app, href }));
      added++;
    }
    // Keep the existing coming-soon card after the working app links.
    const placeholder = Array.from(grid.children).find(node =>
      node.matches('.project-card') && node.querySelector('.project-status') && !node.querySelector('a[href]'));
    grid.insertBefore(fragment, placeholder || null);
    const section = document.getElementById('custom-apps');
    if (section) section.hidden = added === 0;
    const count = document.querySelector('.project-count');
    if (count) {
      const total = grid.querySelectorAll(':scope > .project-card').length;
      count.textContent = String(total).padStart(2, '0') + (total === 1 ? ' project' : ' projects');
    }
    document.getElementById('custom-apps-status')?.remove();
  }

  // Chrome and Edge block fetch() between local file:// pages. A short-lived
  // iframe shares only the app data through postMessage for double-click preview.
  function readLocalApps() {
    return new Promise((resolve, reject) => {
      const frame = document.createElement('iframe');
      const token = Date.now().toString(36) + Math.random().toString(36).slice(2);
      const url = new URL(indexURL);
      url.searchParams.set(sourceParameter, token);
      frame.hidden = true;
      frame.title = 'Load custom app list';
      frame.setAttribute('aria-hidden', 'true');
      frame.tabIndex = -1;
      frame.setAttribute('sandbox', 'allow-scripts');
      let timeout;
      function finish(error, apps) {
        clearTimeout(timeout);
        window.removeEventListener('message', onMessage);
        frame.remove();
        if (error) reject(error);
        else resolve(apps);
      }
      function onMessage(event) {
        if (event.source !== frame.contentWindow || !event.data ||
            event.data.type !== messageType || event.data.token !== token) return;
        if (typeof event.data.html !== 'string') {
          finish(new Error('The local app list could not be read.'));
          return;
        }
        try {
          const source = new DOMParser().parseFromString(
            '<template id="' + catalogId + '">' + event.data.html + '</template>', 'text/html');
          finish(null, readApps(source, indexURL));
        } catch (error) {
          finish(error);
        }
      }
      window.addEventListener('message', onMessage);
      timeout = setTimeout(() => finish(new Error('The local app list did not respond.')), 10000);
      frame.src = url.href;
      document.body.append(frame);
    });
  }

  async function start() {
    const template = document.getElementById(catalogId);
    const grid = document.querySelector('#custom-apps .project-grid, #project-list .project-grid');
    if (!grid) return;
    try {
      let apps;
      if (template) {
        apps = readApps(document, indexURL);
      } else if (location.protocol === 'file:') {
        apps = await readLocalApps();
      } else {
        const response = await fetch(indexURL.href, {cache: 'no-cache'});
        if (!response.ok) throw new Error('The homepage could not be loaded.');
        const source = new DOMParser().parseFromString(await response.text(), 'text/html');
        apps = readApps(source, indexURL);
      }
      render(apps, grid);
    } catch (error) {
      console.warn('Custom apps:', error.message);
      const section = document.getElementById('custom-apps');
      if (section) section.hidden = false;
      let status = document.getElementById('custom-apps-status');
      if (!status) {
        status = element('p', 'section-intro');
        status.id = 'custom-apps-status';
        status.setAttribute('role', 'status');
        grid.before(status);
      }
      status.textContent = 'Custom apps could not be loaded. Refresh the page to try again.';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();
