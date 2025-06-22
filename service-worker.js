// service-worker.js
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
});

self.addEventListener("push", function (event) {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data?.icon??null,
      data: {
        href: data.href ?? null
      }
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const href = event.notification.data.href;
  if (href) {
    event.waitUntil(
      clients.openWindow(href)
    );
  }
});

// self.addEventListener('fetch', (event) => {
//     // Implement caching strategies here if necessary
// });
