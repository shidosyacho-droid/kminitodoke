// /api/poll — 自動取得（cronから叩く）。football-data.org から日本のWC試合の
// スコアを取得し、終了した試合を KV に反映（勝ちは解禁＋通知）。
// 手動で入れた結果（manual:true）は上書きしない＝自動が間違えた時の補正を守る。
import { getResults, setResults, notifyWin } from './_lib.js'

const FD = 'https://api.football-data.org/v4'

// グループは相手名で、決勝Tはステージ名で、自分のmatch idに対応づける
const OPP_TO_ID = { Netherlands: 'gs1', Tunisia: 'gs2', Sweden: 'gs3' }
const STAGE_TO_ID = {
  LAST_32: 'r32',
  LAST_16: 'r16',
  QUARTER_FINALS: 'qf',
  SEMI_FINALS: 'sf',
  FINAL: 'final',
}
// 相手名の日本語表記（グループは固定。KOは分かるものだけ）
const OPP_JA = { Netherlands: 'オランダ', Tunisia: 'チュニジア', Sweden: 'スウェーデン' }

function matchToId(m) {
  const japanHome = m.homeTeam?.name === 'Japan'
  const opp = japanHome ? m.awayTeam?.name : m.homeTeam?.name
  if (m.stage === 'GROUP_STAGE') return OPP_TO_ID[opp] || null
  return STAGE_TO_ID[m.stage] ?? null
}

async function fetchJapanMatches() {
  const token = process.env.FOOTBALL_API_TOKEN
  if (!token) return { error: 'FOOTBALL_API_TOKEN未設定' }
  const r = await fetch(`${FD}/competitions/WC/matches`, {
    headers: { 'X-Auth-Token': token },
  })
  const text = await r.text()
  if (!r.ok) return { error: `football-data ${r.status}`, detail: text.slice(0, 400) }
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return { error: 'parse error' }
  }
  const japan = (data.matches || []).filter(
    (m) => m.homeTeam?.name === 'Japan' || m.awayTeam?.name === 'Japan',
  )
  return { japan }
}

export default async function handler(req, res) {
  const { key, debug } = req.query
  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  const data = await fetchJapanMatches()
  if (data.error) {
    res.status(200).json(data)
    return
  }

  if (debug) {
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({
      japan: data.japan.map((m) => ({
        utcDate: m.utcDate,
        status: m.status,
        stage: m.stage,
        home: m.homeTeam?.name,
        away: m.awayTeam?.name,
        score: m.score?.fullTime,
        mapped: matchToId(m),
      })),
    })
    return
  }

  const results = await getResults()
  const updated = []
  let pushed = 0

  for (const m of data.japan) {
    if (m.status !== 'FINISHED') continue
    const id = matchToId(m)
    if (!id) continue
    // 手動で入れた結果は尊重（上書きしない）
    if (results[id]?.manual) continue

    const ft = m.score?.fullTime
    if (!ft || ft.home == null || ft.away == null) continue
    const japanHome = m.homeTeam?.name === 'Japan'
    const jp = japanHome ? ft.home : ft.away
    const opp = japanHome ? ft.away : ft.home
    const oppEn = japanHome ? m.awayTeam?.name : m.homeTeam?.name
    const opponent = OPP_JA[oppEn] || oppEn

    const prev = results[id]
    if (prev && prev.jp === jp && prev.opp === opp) continue // 変化なし

    const wasWin = prev && prev.jp > prev.opp
    results[id] = { jp, opp, opponent }
    updated.push({ id, score: `${jp}-${opp}` })

    if (jp > opp && !wasWin) {
      const p = await notifyWin()
      pushed += p.sent || 0
    }
  }

  if (updated.length) await setResults(results)
  res.status(200).json({ ok: true, updated, pushed })
}
