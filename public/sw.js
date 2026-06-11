/* 君に届け — Service Worker（インストール＋プッシュ通知） */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// パススルー（キャッシュしない＝コンテンツが古くならない）
self.addEventListener('fetch', () => {})

// プッシュ受信 → 通知を表示
self.addEventListener('push', (event) => {
  let data = { title: '君に届け', body: 'プレゼントが届きました🎁', url: '/' }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch {
    // ペイロードが無い/壊れていてもデフォルトで表示
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/apple-touch-icon-180.png',
      badge: '/apple-touch-icon-180.png',
      data: { url: data.url || '/' },
      vibrate: [80, 40, 80],
      tag: 'kimi-present',
      renotify: true,
    }),
  )
})

// 通知タップ → アプリを開く（既に開いていればフォーカス）
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) return c.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    }),
  )
})
