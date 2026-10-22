/*! coi-serviceworker — enables cross-origin isolation (SharedArrayBuffer) on
    static hosts such as GitHub Pages that cannot set COOP/COEP response headers.
    Based on the MIT-licensed coi-serviceworker helper by Guido Zuidhof.
    It installs a service worker that re-serves same-origin navigations with the
    required headers and tags cross-origin subresources as credentialless. */
/* eslint-disable */
let coepCredentialless = true;

if (typeof window === 'undefined') {
  // ---- Service worker context ----
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener('message', (ev) => {
    if (!ev.data) return;
    if (ev.data.type === 'deregister') {
      self.registration.unregister().then(() => self.clients.matchAll()).then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      });
    } else if (ev.data.type === 'coepCredentialless') {
      coepCredentialless = ev.data.value;
    }
  });

  self.addEventListener('fetch', (event) => {
    const r = event.request;
    if (r.cache === 'only-if-cached' && r.mode !== 'same-origin') return;

    const request =
      coepCredentialless && r.mode === 'no-cors'
        ? new Request(r, { credentials: 'omit' })
        : r;

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 0) return response;
          const headers = new Headers(response.headers);
          headers.set('Cross-Origin-Embedder-Policy', coepCredentialless ? 'credentialless' : 'require-corp');
          if (!coepCredentialless) headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
          headers.set('Cross-Origin-Opener-Policy', 'same-origin');
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
        })
        .catch((e) => console.error(e)),
    );
  });
} else {
  // ---- Window context: register the worker ----
  (() => {
    const reloadedBySelf = window.sessionStorage.getItem('coiReloadedBySelf');
    window.sessionStorage.removeItem('coiReloadedBySelf');
    const coepDegrading = reloadedBySelf === 'coepdegrade';

    const n = navigator;
    if (n.serviceWorker && n.serviceWorker.controller) {
      n.serviceWorker.controller.postMessage({ type: 'coepCredentialless', value: coepCredentialless });
    }

    if (!window.crossOriginIsolated && !coepDegrading && n.serviceWorker) {
      n.serviceWorker
        .register(window.document.currentScript.src)
        .then((registration) => {
          registration.addEventListener('updatefound', () => window.location.reload());
          if (registration.active && !n.serviceWorker.controller) window.location.reload();
        })
        .catch((e) => console.error('COOP/COEP Service Worker failed to register:', e));
    }
  })();
}
