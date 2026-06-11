// POST /api/subscribe — 彼女の端末のプッシュ購読を保存
import { addSubscription } from './_lib.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' })
    return
  }
  try {
    const sub =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (!sub || !sub.endpoint) {
      res.status(400).json({ error: 'invalid subscription' })
      return
    }
    await addSubscription(sub)
    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
}
