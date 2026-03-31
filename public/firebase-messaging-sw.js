/* No-op worker: stops 404 when browsers/extensions probe for FCM at origin root.
   Replace with Firebase messaging bootstrap when you implement push. */
self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
