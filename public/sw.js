/* 君に届け — Service Worker
 * 現状はインストール可能にするための最小構成。
 * P1（プッシュ通知）で push / notificationclick ハンドラを追加する。
 */

self.addEventListener('install', () => {
  // すぐに新しいSWを有効化
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// パススルー（キャッシュしない＝コンテンツが古くならない）。
// インストール可能要件のための fetch ハンドラ。
self.addEventListener('fetch', () => {})

/* === P1で追加予定 ===
self.addEventListener('push', (event) => { ... 通知を表示 ... })
self.addEventListener('notificationclick', (event) => { ... アプリを開く ... })
*/
