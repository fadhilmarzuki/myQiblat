const CACHE='myqiblat-v18';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE&&!x.startsWith('myqiblat-audio')&&!x.startsWith('myqiblat-fonts')&&!x.startsWith('myqiblat-quran')).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  // font Google (Scheherazade New): cache-first supaya teks Arab cantik tanpa internet
  if(e.request.method==='GET'&&(u.host==='fonts.googleapis.com'||u.host==='fonts.gstatic.com')){
    e.respondWith(caches.open('myqiblat-fonts').then(c=>c.match(e.request).then(m=>m||fetch(e.request).then(r=>{if(r.ok||r.type==='opaque')c.put(e.request,r.clone());return r;}))));return;}
  if(e.request.method!=='GET'||u.origin!==location.origin)return; // API luar tidak dicache di sini
  if(/\.mp3$/i.test(u.pathname))return; // fail azan diurus sendiri oleh app (cache myqiblat-audio)
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c)return c.focus();}return clients.openWindow('./');}));
});
