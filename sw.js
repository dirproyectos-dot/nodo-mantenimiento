const CACHE="nodo-mantenimiento-v1-1-final";
const ASSETS=["./","index.html","styles.css?v=1.1","app.js?v=1.1","manifest.webmanifest","logo.jpeg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{let c=resp.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return resp}).catch(()=>caches.match("index.html")))));
