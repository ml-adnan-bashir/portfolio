(() => {
  if (window.top !== window.self || location.origin !== 'https://ml-adnan-bashir.github.io' ||
      window.__portfolioAnalyticsInstalled || !crypto.randomUUID) return;
  window.__portfolioAnalyticsInstalled = true;
  const endpoint = 'https://portfolio-visit-reports.ml-adnan-bashir.chatgpt.site/collect';
  const portfolioPath = new URL('../', document.currentScript.src).pathname;

  function canonical(url) {
    // Query strings and fragments can contain registration IDs and access codes.
    return url.origin + url.pathname.replace(/\/index\.html$/i, '/');
  }

  function record(kind, url, label) {
    const body = new URLSearchParams({
      id: crypto.randomUUID(),
      kind,
      target: canonical(url),
      label: String(label || '').replace(/\s+/g, ' ').trim().slice(0, 150)
    });
    const send = () => fetch(endpoint, {
      method: 'POST', body, keepalive: true, credentials: 'omit', referrerPolicy: 'no-referrer'
    });
    // The id is reused if delivery is uncertain so the collector can deduplicate.
    send().then(response => { if (response.status >= 500) return send(); })
      .catch(() => send()).catch(() => {});
  }

  function opened() {
    if (performance.getEntriesByType('navigation')[0]?.type !== 'back_forward') {
      record('page', location, document.title);
    }
  }

  function activated(event) {
    if (!event.isTrusted || (event.type === 'auxclick' ? event.button !== 1 : event.button !== 0)) return;
    const link = event.target.closest?.('a[href],area[href]');
    if (!link) return;
    const target = new URL(link.href, location.href);
    if (!/^https?:$/.test(target.protocol)) return;
    const internal = target.origin === location.origin && target.pathname.startsWith(portfolioPath);
    // The destination records its own view for ordinary internal navigation.
    if (internal && !link.hasAttribute('download') && /(?:\/|\.html?)$/i.test(target.pathname)) return;
    if (target.hash && canonical(target) === canonical(location)) return;
    record('link', target, link.getAttribute('aria-label') || link.textContent || link.title);
  }

  if (document.prerendering) document.addEventListener('prerenderingchange', opened, { once: true });
  else opened();
  document.addEventListener('click', activated, true);
  document.addEventListener('auxclick', activated, true);
})();

(() => {
  if (document.currentScript?.hasAttribute('data-analytics-only')) return;
  if (window.top !== window.self || !/^https?:$/.test(location.protocol) || window.__portfolioCountInstalled) return;
  window.__portfolioCountInstalled = true;
  const directory = new URL('.', document.currentScript.src);
  const image = document.querySelector('#visit-counter img[data-counter-src]') || new Image();
  const status = document.querySelector('#visit-counter .visit-counter-status');
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('portfolio-visits-' + directory.pathname) : null;
  let canRead = false;
  let ownHit = false;
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      canRead = navigator.serviceWorker.controller?.scriptURL === new URL('visit-badge-worker.js', directory).href;
    });
  }
  image.referrerPolicy = 'no-referrer';
  image.onload = () => {
    image.hidden = false;
    if (status) status.hidden = true;
    if (ownHit) channel?.postMessage('updated');
    ownHit = false;
  };
  image.onerror = () => {
    ownHit = false;
    if (status) { status.hidden = false; status.textContent = 'Page visits unavailable'; }
  };
  if (channel) channel.onmessage = () => {
    if (canRead && !ownHit && image.isConnected) {
      image.src = new URL('shared-visit-badge?read=' + Math.random(), directory).href;
    }
  };
  async function count() {
    const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    if ('serviceWorker' in navigator && !canRead) {
      try {
        const worker = new URL('visit-badge-worker.js', directory);
        await navigator.serviceWorker.register(worker);
        await Promise.race([navigator.serviceWorker.ready, new Promise(resolve => setTimeout(resolve, 1200))]);
        canRead = navigator.serviceWorker.controller?.scriptURL === worker.href;
      } catch { /* Preview hosts may disable service workers. */ }
    }
    ownHit = canRead;
    image.src = canRead ? new URL('shared-visit-badge?visit=' + id, directory).href :
      'https://hits.sh/ml-adnan-bashir.github.io/portfolio.svg?label=Page%20visits&color=f4c4ad&labelColor=090a0d&style=flat&_view=' + id;
  }
  if (document.prerendering) document.addEventListener('prerenderingchange', count, {once:true});
  else count();
})();
