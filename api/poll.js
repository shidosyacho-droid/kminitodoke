// /api/poll — 自動取得（cronから叩く）。まずは検証モード（?debug=1）で
// football-data.org から日本のWC試合が取れるかを確認する。本実装は検証後に追加。
const FD = 'https://api.football-data.org/v4'

async function fetchWCJapan() {
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
    return { error: 'parse error', detail: text.slice(0, 200) }
  }
  const all = data.matches || []
  const japan = all.filter(
    (m) => m.homeTeam?.name === 'Japan' || m.awayTeam?.name === 'Japan',
  )
  return {
    competition: data.competition?.name,
    season: data.filters?.season || data.competition?.currentSeason?.startDate,
    total: all.length,
    japanCount: japan.length,
    japan: japan.map((m) => ({
      id: m.id,
      utcDate: m.utcDate,
      status: m.status,
      stage: m.stage,
      group: m.group,
      home: m.homeTeam?.name,
      away: m.awayTeam?.name,
      score: m.score?.fullTime,
    })),
  }
}

export default async function handler(req, res) {
  const { key, debug } = req.query
  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }
  const data = await fetchWCJapan()
  if (debug) {
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json(data)
    return
  }
  // 本番の自動取得ロジックは、検証でデータ構造を確認してから実装する
  res.status(200).json({
    ok: true,
    note: 'auto-poll は検証後に実装',
    summary: data.error ?? `japan ${data.japanCount}件 取得`,
  })
}
