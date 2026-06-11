// GET /api/state — 現在の試合状態を返す（アプリが起動時に取得）
import { getStates } from './_lib.js'

export default async function handler(req, res) {
  try {
    const states = await getStates()
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ states })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
}
