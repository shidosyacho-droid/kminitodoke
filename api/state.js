// GET /api/state — 現在の試合結果（スコア）を返す（アプリが起動時に取得）
import { getResults } from './_lib.js'

export default async function handler(req, res) {
  try {
    const results = await getResults()
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ results })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
}
