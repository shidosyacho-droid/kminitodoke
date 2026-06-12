// /api/poll — cronから叩く。日本のWC試合について:
//   ① 終了した試合のスコアを反映（勝ちは解禁＋通知）
//   ② 24時間以内に迫った試合のリマインド通知（1試合1回）
// 手動で入れた結果（manual:true）は上書きしない。
import {
  getResults,
  setResults,
  getReminded,
  setReminded,
  notifyWin,
  notifyMatchSoon,
} from './_lib.js'

const FD = 'https://api.football-data.org/v4'

const OPP_TO_ID = { Netherlands: 'gs1', Tunisia: 'gs2', Sweden: 'gs3' }
const STAGE_TO_ID = {
  LAST_32: 'r32',
  LAST_16: 'r16',
  QUARTER_FINALS: 'qf',
  SEMI_FINALS: 'sf',
  FINAL: 'final',
}
const OPP_JA = { Netherlands: 'オランダ', Tunisia: 'チュニジア', Sweden: 'スウェーデン' }

function matchToId(m) {
  const japanHome = m.homeTeam?.name === 'Japan'
  const opp = japanHome ? m.awayTeam?.name : m.homeTeam?.name
  if (m.stage === 'GROUP_STAGE') return OPP_TO_ID[opp] || null
  return STAGE_TO_ID[m.stage] ?? null
}

// 日本時間で「6月15日(月) 5:00」形式に
function formatJST(utcDate) {
  const parts = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(utcDate))
  const p = {}
  for (const x of parts) p[x.type] = x.value
  return `${p.month}月${p.day}日(${p.weekday}) ${p.hour}:${p.minute}`
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
  const { key, debug, remindTest } = req.query
  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  // 出場国リスト（対応表づくり用の検証）
  if (req.query.teams) {
    const token = process.env.FOOTBALL_API_TOKEN
    const r = await fetch(`${FD}/competitions/WC/teams`, {
      headers: { 'X-Auth-Token': token },
    })
    const d = await r.json().catch(() => ({}))
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({
      count: d.teams?.length,
      teams: (d.teams || []).map((t) => ({ name: t.name, tla: t.tla })),
    })
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
        jst: formatJST(m.utcDate),
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

  // テスト：直近の未終了の試合でリマインド文面を1通送る（24h/フラグ無視）
  if (remindTest) {
    const next = data.japan
      .filter((m) => m.status !== 'FINISHED')
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))[0]
    if (!next) {
      res.status(200).json({ error: 'upcoming match not found' })
      return
    }
    const p = await notifyMatchSoon(formatJST(next.utcDate))
    res.status(200).json({ test: true, when: formatJST(next.utcDate), push: p })
    return
  }

  const now = Date.now()

  // ① スコア反映
  const results = await getResults()
  const updated = []
  let pushed = 0
  for (const m of data.japan) {
    if (m.status !== 'FINISHED') continue
    const id = matchToId(m)
    if (!id) continue
    if (results[id]?.manual) continue
    const ft = m.score?.fullTime
    if (!ft || ft.home == null || ft.away == null) continue
    const japanHome = m.homeTeam?.name === 'Japan'
    const jp = japanHome ? ft.home : ft.away
    const opp = japanHome ? ft.away : ft.home
    const oppEn = japanHome ? m.awayTeam?.name : m.homeTeam?.name
    const opponent = OPP_JA[oppEn] || oppEn
    const prev = results[id]
    if (prev && prev.jp === jp && prev.opp === opp) continue
    const wasWin = prev && prev.jp > prev.opp
    results[id] = { jp, opp, opponent }
    updated.push({ id, score: `${jp}-${opp}` })
    if (jp > opp && !wasWin) {
      const p = await notifyWin()
      pushed += p.sent || 0
    }
  }
  if (updated.length) await setResults(results)

  // ② 24時間前リマインド
  const reminded = await getReminded()
  const reminders = []
  let remindedChanged = false
  for (const m of data.japan) {
    if (m.status === 'FINISHED' || m.status === 'IN_PLAY' || m.status === 'PAUSED') continue
    const flag = String(m.id)
    if (reminded[flag]) continue
    const hoursUntil = (new Date(m.utcDate).getTime() - now) / 3600000
    if (hoursUntil > 0 && hoursUntil <= 24) {
      const p = await notifyMatchSoon(formatJST(m.utcDate))
      reminded[flag] = true
      remindedChanged = true
      reminders.push({ when: formatJST(m.utcDate), sent: p.sent })
    }
  }
  if (remindedChanged) await setReminded(reminded)

  res.status(200).json({ ok: true, updated, pushed, reminders })
}
