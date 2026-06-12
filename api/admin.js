// /api/admin — 志道さん専用：スコアを手動で入れる（自動が外した時のフォールバック）
//   解禁/封印はスコアから自動判定（jp>opp = 勝ち = 解禁）。勝ちのときは通知も送る。
//
//   例（勝ち）: /api/admin?key=SECRET&match=gs1&jp=2&opp=1
//   例（KO・相手も指定）: /api/admin?key=SECRET&match=r32&jp=1&opp=0&opponent=スペイン
//   例（リセット）: /api/admin?key=SECRET&match=gs1&reset=1
import { getResults, setResults, sendPushToAll } from './_lib.js'

export default async function handler(req, res) {
  const { key, match, jp, opp, opponent, reset } = req.query

  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  // 環境変数の「有無」だけ点検（値は返さない）。?env=1
  if (req.query.env) {
    const names = [
      'ADMIN_SECRET',
      'KV_REST_API_URL',
      'KV_REST_API_TOKEN',
      'VAPID_PUBLIC_KEY',
      'VAPID_PRIVATE_KEY',
      'VAPID_SUBJECT',
      'FOOTBALL_API_TOKEN',
    ]
    const present = {}
    for (const n of names) present[n] = !!process.env[n]
    res.status(200).json({ env: present })
    return
  }

  if (!match) {
    res.status(400).json({ error: 'match を指定してください' })
    return
  }

  try {
    const results = await getResults()

    if (reset) {
      delete results[match]
      await setResults(results)
      res.status(200).json({ ok: true, match, state: 'upcoming' })
      return
    }

    const jpN = Number(jp)
    const oppN = Number(opp)
    if (!Number.isFinite(jpN) || !Number.isFinite(oppN)) {
      res
        .status(400)
        .json({ error: 'jp と opp（スコア）を数字で指定してください' })
      return
    }

    const prev = results[match]
    const wasWin = prev && prev.jp > prev.opp
    results[match] = {
      jp: jpN,
      opp: oppN,
      ...(opponent ? { opponent: String(opponent) } : {}),
      manual: true, // 手動設定 → 自動取得(poll)は上書きしない
    }
    await setResults(results)

    const won = jpN > oppN
    let push = null
    // 新たに「勝ち」になった時だけ通知（同じ勝ちの再送はしない）
    if (won && !wasWin) {
      push = await sendPushToAll({
        title: '⚽ 日本、勝利！',
        body: '君に新しいプレゼントが届いたよ🎁',
        url: '/',
      })
    }

    res.status(200).json({
      ok: true,
      match,
      score: `${jpN}-${oppN}`,
      state: won ? 'delivered' : 'sealed',
      push,
    })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
}
