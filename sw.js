/* Cavern Quest SW */
const CACHE_NAME='cq-v1';
const CORE=[
  './','./index.html','./css/styles.css','./manifest.webmanifest','./sw.js',
  './assets/sprites.png',
  './js/main.js',
  './js/engine/loader.js','./js/engine/storage.js','./js/engine/input.js','./js/engine/audio.js',
  './js/game/game.js','./js/game/grid.js','./js/game/player.js','./js/game/enemy.js','./js/game/rock.js','./js/game/treasure.js','./js/game/ai.js',
  './js/game/levels_classic.js','./js/game/levels_caves.js','./js/game/levels_ice.js'
];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME&&caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e=>{
  const url=new URL(e.request.url);
  if(url.origin===location.origin){
    e.respondWith(caches.match(e.request).then(res=>res||fetch(e.request).then(r=>{
      const copy=r.clone(); caches.open(CACHE_NAME).then(c=>c.put(e.request,copy)); return r;
    }).catch(()=>caches.match('./index.html'))));
  }
});