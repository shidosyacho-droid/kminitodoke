// /api/admin?key=SECRET&match=gs1&result=win — 志道さん専用の勝敗フリップ
//   result: win=配信(delivered) / loss・draw=封印(sealed) / reset=未定に戻す
// win のときは購読者にプッシュ通知を送る。
import { getStates, setStates, sendPushToAll } from './_lib.js'

const RESULT_MAP = {
  win: 'delivered',
  loss: 'sealed',
  draw: 'sealed',
  reset: null,
}

export default async function handler(req, res) {
  const { key, match, result } = req.query

  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }
  if (!match || !(result in RESULT_MAP)) {
    res
      .status(400)
      .json({ error: 'match と result(win|loss|draw|reset) を指定してください' })
    return
  }

  try {
    const states = await getStates()
    const newState = RESULT_MAP[result]
    if (newState === null) {
      delete states[match]
    } else {
      states[match] = newState
    }
    await setStates(states)

    let push = null
    if (result === 'win') {
      push = await sendPushToAll({
        title: '⚽ 日本、勝利！',
        body: '君に新しいプレゼントが届いたよ🎁',
        url: '/',
      })
    }

    res
      .status(200)
      .json({ ok: true, match, state: newState ?? 'upcoming', push })
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
}
