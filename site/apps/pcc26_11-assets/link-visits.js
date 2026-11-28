(() => {
  "use strict";
  if (window.top !== window || window.__pccVisitTracker || !window.crypto?.randomUUID) return;
  const script = document.currentScript;
  if (!script || !script.src) return;
  const endpoint = new URL("/views/record", script.dataset?.collector || script.src);
  const page = document.documentElement.dataset.visit || script.dataset?.visit;
  if (!page) return;
  window.__pccVisitTracker = true;

  function record(resource) {
    const body = new URLSearchParams({ event: crypto.randomUUID(), resource });
    const send = () => fetch(endpoint, { method: "POST", body, keepalive: true, credentials: "omit", referrerPolicy: "origin" });
    send().then(response => { if (response.status >= 500) return send(); })
      .catch(() => send()).catch(() => {});
  }

  function opened() {
    if (document.prerendering) {
      document.addEventListener("prerenderingchange", opened, { once: true });
      return;
    }
    if (performance.getEntriesByType("navigation")[0]?.type !== "back_forward") record(page);
  }

  // A document is created once for an open or refresh. Restoring the same document
  // through history, focusing a tab and the polls' periodic API reads do not rerun this script.
  opened();
  if (page !== "materials") return;
  const materialIds = new Set(["open-slides", "get-slides", "kaggle", "get-notebook", "get-dataset", "get-handout"]);
  function clicked(event) {
    if (!event.isTrusted || event.defaultPrevented || (event.type === "click" ? event.button !== 0 : event.button !== 1)) return;
    const control = event.target.closest?.("a[id],button[id]");
    if (!control || !materialIds.has(control.id) || (event.type === "auxclick" && control.tagName !== "A")) return;
    record(control.id);
  }
  // At capture time a download button has not yet disabled itself during preparation.
  document.addEventListener("click", clicked, true);
  document.addEventListener("auxclick", clicked, true);
})();
