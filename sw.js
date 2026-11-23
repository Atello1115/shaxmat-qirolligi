/* Service worker: dastur bir marta ochilgach internetsiz ishlaydi. build_web.py 186b037f, ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"], ["audio_m.12d65ae7.js", "audio_f.c6667212.js"] ni to'ldiradi.
   - Asosiy fayllar (shell) har versiyada alohida keshda; eski versiya keshi o'chiriladi.
   - Ovoz fayllari nomida xesh bor va ular «shq-audio» keshida turadi: ovoz o'zgarmasa, qayta yuklanmaydi. */
const V = "186b037f", SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"], AUDIO = ["audio_m.12d65ae7.js", "audio_f.c6667212.js"];
const SC = "shq-shell-" + V, AC = "shq-audio";
const isAudio = url => AUDIO.some(a => new URL(url).pathname.endsWith("/" + a));

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SC)
    .then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("shq-shell-") && k !== SC) await caches.delete(k);
    const ac = await caches.open(AC);
    for (const r of await ac.keys()) if (!isAudio(r.url)) await ac.delete(r);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(isAudio(r.url) ? AC : SC);
    let hit = await c.match(r, { ignoreSearch: true });
    if (!hit && r.mode === "navigate") hit = await c.match("index.html");
    if (hit) return hit;
    const res = await fetch(r);
    if (res.ok && res.type === "basic") c.put(r, res.clone()).catch(() => {});
    return res;
  })());
});
