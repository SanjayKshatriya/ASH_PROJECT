// notifications.js — loaded by app.html
// Notification rendering logic is in supply-chain.js (renderNotifications, filterNotifs, markAllRead)
// This file handles push notification setup

// Register service worker for push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker not required for demo
    });
  });
}

// Live notification badge update
setInterval(() => {
  const dot = document.querySelector('.topbar-notif-dot');
  if (dot) dot.style.display = 'block';
}, 60000);
