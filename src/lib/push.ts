// Web Push の購読（彼女の端末で通知をオンにする）
import { VAPID_PUBLIC_KEY } from '../config'

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const buffer = new ArrayBuffer(raw.length)
  const arr = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export function pushSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/** 現在の通知許可状態 */
export function notifStatus(): NotificationPermission | 'unsupported' {
  if (!pushSupported()) return 'unsupported'
  return Notification.permission
}

/** 通知を許可してもらい、購読をサーバーに登録する（ボタン等のユーザー操作から呼ぶ） */
export async function enablePush(): Promise<{ ok: boolean; reason?: string }> {
  if (!pushSupported()) return { ok: false, reason: 'unsupported' }
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return { ok: false, reason: permission }

    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    const sub =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }))

    const r = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    })
    return { ok: r.ok, reason: r.ok ? undefined : 'server' }
  } catch (e) {
    return { ok: false, reason: String(e) }
  }
}
