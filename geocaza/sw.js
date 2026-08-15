/* GeoCaza — caché para jugar sin internet */
const CACHE = 'geocaza-v1';
const ARCHIVOS = ['index.html','docente.html','manifest.json',
  'js/geometria.js','js/marcadores.js','js/caceria.js',
  'vendor/three.global.js','vendor/ar-threex.js','vendor/qrcode.js','data/camera_para.dat'];
for (let i = 0; i < 12; i++) ARCHIVOS.push('data/patrones/p' + String(i).padStart(2,'0') + '.patt');
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r => r || fetch(e.request)
    .then(resp => { const c = resp.clone(); caches.open(CACHE).then(k=>k.put(e.request,c)).catch(()=>{}); return resp; })
    .catch(() => caches.match('index.html'))));
});
