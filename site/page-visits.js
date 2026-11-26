/* One request per top-level page view, including a restored history entry. */
(()=>{
  if (window.top !== window.self || !/^https?:$/.test(location.protocol) || window.__portfolioCountInstalled) return;
  window.__portfolioCountInstalled = true;
  function countView() {
    const box = document.getElementById('visit-counter');
    const badge = box && box.querySelector('img[data-counter-src]');
    const status = box && box.querySelector('.visit-counter-status');
    const img = badge || new Image();
    const url = new URL(badge?.dataset.counterSrc || 'https://hits.sh/ml-adnan-bashir.github.io/portfolio.svg?label=Page%20visits&color=f4c4ad&labelColor=090a0d&style=flat');
    // The path identifies the existing shared counter. A fresh query bypasses image caches.
    url.searchParams.set('_view',Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
    img.referrerPolicy = 'no-referrer';
    if (badge && status) {
      status.hidden = false; status.textContent = 'Page visits · loading';
      img.onload = () => {status.hidden = true; badge.hidden = false;};
      img.onerror = () => {badge.hidden = true; status.hidden = false; status.textContent = 'Page visits · unavailable';};
    }
    img.src = url.href;
  }
  if(document.prerendering) document.addEventListener('prerenderingchange',countView,{once:true});
  else countView();
  window.addEventListener('pageshow',event=>{if(event.persisted) countView();});
})();
