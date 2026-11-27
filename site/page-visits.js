(() => {
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
