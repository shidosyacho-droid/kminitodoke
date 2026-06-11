// 君に届け — サーバー側の共有ユーティリティ（Vercel Functions / Node）
// ファイル名が _ で始まるので Vercel のルートにはならない（import専用）。
import webpush from 'web-push'

const KV_URL = process.env.KV_REST_API_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN

/** Upstash(Vercel KV) の REST API にコマンドを投げる */
export async function kv(command) {
  const r = await fetch(KV_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })
  if (!r.ok) throw new Error(`KV error ${r.status}`)
  const data = await r.json()
  return data.result
}

/** 試合の状態（{ gs1: 'delivered', ... }）を取得 */
export async function getStates() {
  const raw = await kv(['GET', 'matchStates'])
  if (!raw) return {}
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return {}
  }
}

export async function setStates(states) {
  await kv(['SET', 'matchStates', JSON.stringify(states)])
}

/** プッシュ通知の購読を取得 */
export async function getSubscriptions() {
  const arr = await kv(['SMEMBERS', 'subscriptions'])
  return (arr || [])
    .map((s) => {
      try {
        return typeof s === 'string' ? JSON.parse(s) : s
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

export async function addSubscription(sub) {
  await kv(['SADD', 'subscriptions', JSON.stringify(sub)])
}

let vapidReady = false
function ensureVapid() {
  if (vapidReady) return true
  const pub = process.env.VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:example@example.com'
  if (!pub || !priv) return false
  webpush.setVapidDetails(subject, pub, priv)
  vapidReady = true
  return true
}

/** 全購読にプッシュ通知を送る */
export async function sendPushToAll(payload) {
  if (!ensureVapid()) return { sent: 0, error: 'vapid未設定' }
  const subs = await getSubscriptions()
  let sent = 0
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload))
        sent++
      } catch {
        // 期限切れ等は無視（少数運用なので自動削除はしない）
      }
    }),
  )
  return { sent, total: subs.length }
}
