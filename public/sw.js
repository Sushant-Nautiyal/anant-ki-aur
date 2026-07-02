const CACHE_NAME = "anant-ki-aur-v7";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./data/messages.json",
  "./icons/icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

// self.addEventListener("fetch", (event) => {
//   if (event.request.method !== "GET") return;

//   const requestUrl = new URL(event.request.url);

//   // For static app shell: cache first.
//   // For data JSON/CSV: network first, then fallback to cache.
//   const isDataRequest = requestUrl.pathname.includes("/data/") || requestUrl.href.includes("docs.google.com");

//   if (isDataRequest) {
//     event.respondWith(networkFirst(event.request));
//     return;
//   }

//   event.respondWith(cacheFirst(event.request));
// });

self.addEventListener("fetch", (event) => {
 if (event.request.method !== "GET") return;

 const requestUrl = new URL(event.request.url);

 const isGoogleSheetRequest =
 requestUrl.hostname.includes("docs.google.com") ||
 requestUrl.hostname.includes("googleusercontent.com");

 const isLocalDataRequest = requestUrl.pathname.includes("/data/");

 // Google Sheet must always be fresh.
 if (isGoogleSheetRequest) {
 event.respondWith(networkOnly(event.request));
 return;
 }

 // Local JSON should be network-first.
 if (isLocalDataRequest) {
 event.respondWith(networkFirst(event.request));
 return;
 }

 // Static app shell can be cache-first.
 event.respondWith(cacheFirst(event.request));
});

async function networkOnly(request) {
 return fetch(request);
}
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match("./index.html");
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match("./data/messages.json");
  }
}
self.addEventListener("message", (event) => {
 if (event.data && event.data.type === "SKIP_WAITING") {
 self.skipWaiting();
 }
});
