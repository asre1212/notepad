// Change this version on every deployment (the workflow does this automatically).
const VERSION = "notepad-v1";
const ASSETS = ["./", "./index.html", "./style.css", "./app.js", "./manifest.webmanifest", "./icon.svg", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png"];
const urls = ASSETS.map(path => new URL(path, self.registration.scope).href);
self.addEventListener("install", event => event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(urls)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("notepad-") && key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
 // Only immutable app resources are cached. Editor data never enters this worker.
 if(event.request.method !== "GET" || !urls.includes(event.request.url)) return;
 event.respondWith(caches.open(VERSION).then(async cache => (await cache.match(event.request)) || fetch(event.request)));
});
