// /api/poll — cronから叩く。日本のWC試合について:
//   ① 終了した試合のスコアを反映（勝ちは解禁＋通知）
//   ② 決勝トーナメントの「次の相手・日程」を試合前に反映（国旗・日本語名つき）
//   ③ 24時間以内に迫った試合のリマインド通知（1試合1回）
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

// グループの相手TLA → match id
const OPP_TO_ID = { NED: 'gs1', TUN: 'gs2', SWE: 'gs3' }
// 決勝Tのステージ → match id（実際のステージ名はKO開始時に debug で要確認）
const STAGE_TO_ID = {
  LAST_32: 'r32',
  LAST_16: 'r16',
  QUARTER_FINALS: 'qf',
  SEMI_FINALS: 'sf',
  FINAL: 'final',
}

// TLA → 日本語名・国旗（WC2026 出場48カ国）
const COUNTRY = {
  URY: { ja: 'ウルグアイ', flag: '🇺🇾' },
  GER: { ja: 'ドイツ', flag: '🇩🇪' },
  ESP: { ja: 'スペイン', flag: '🇪🇸' },
  PAR: { ja: 'パラグアイ', flag: '🇵🇾' },
  ARG: { ja: 'アルゼンチン', flag: '🇦🇷' },
  GHA: { ja: 'ガーナ', flag: '🇬🇭' },
  BRA: { ja: 'ブラジル', flag: '🇧🇷' },
  POR: { ja: 'ポルトガル', flag: '🇵🇹' },
  JPN: { ja: '日本', flag: '🇯🇵' },
  MEX: { ja: 'メキシコ', flag: '🇲🇽' },
  ENG: { ja: 'イングランド', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  USA: { ja: 'アメリカ', flag: '🇺🇸' },
  KOR: { ja: '韓国', flag: '🇰🇷' },
  FRA: { ja: 'フランス', flag: '🇫🇷' },
  RSA: { ja: '南アフリカ', flag: '🇿🇦' },
  ALG: { ja: 'アルジェリア', flag: '🇩🇿' },
  AUS: { ja: 'オーストラリア', flag: '🇦🇺' },
  NZL: { ja: 'ニュージーランド', flag: '🇳🇿' },
  SUI: { ja: 'スイス', flag: '🇨🇭' },
  ECU: { ja: 'エクアドル', flag: '🇪🇨' },
  SWE: { ja: 'スウェーデン', flag: '🇸🇪' },
  CZE: { ja: 'チェコ', flag: '🇨🇿' },
  CRO: { ja: 'クロアチア', flag: '🇭🇷' },
  KSA: { ja: 'サウジアラビア', flag: '🇸🇦' },
  TUN: { ja: 'チュニジア', flag: '🇹🇳' },
  TUR: { ja: 'トルコ', flag: '🇹🇷' },
  SEN: { ja: 'セネガル', flag: '🇸🇳' },
  BEL: { ja: 'ベルギー', flag: '🇧🇪' },
  MAR: { ja: 'モロッコ', flag: '🇲🇦' },
  AUT: { ja: 'オーストリア', flag: '🇦🇹' },
  COL: { ja: 'コロンビア', flag: '🇨🇴' },
  EGY: { ja: 'エジプト', flag: '🇪🇬' },
  CAN: { ja: 'カナダ', flag: '🇨🇦' },
  HAI: { ja: 'ハイチ', flag: '🇭🇹' },
  IRN: { ja: 'イラン', flag: '🇮🇷' },
  BIH: { ja: 'ボスニア', flag: '🇧🇦' },
  PAN: { ja: 'パナマ', flag: '🇵🇦' },
  CPV: { ja: 'カーボベルデ', flag: '🇨🇻' },
  COD: { ja: 'コンゴ民主共和国', flag: '🇨🇩' },
  CIV: { ja: 'コートジボワール', flag: '🇨🇮' },
  QAT: { ja: 'カタール', flag: '🇶🇦' },
  JOR: { ja: 'ヨルダン', flag: '🇯🇴' },
  IRQ: { ja: 'イラク', flag: '🇮🇶' },
  UZB: { ja: 'ウズベキスタン', flag: '🇺🇿' },
  NED: { ja: 'オランダ', flag: '🇳🇱' },
  NOR: { ja: 'ノルウェー', flag: '🇳🇴' },
  SCO: { ja: 'スコットランド', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  CUW: { ja: 'キュラソー', flag: '🇨🇼' },
}

const isJapan = (t) => t?.name === 'Japan' || t?.tla === 'JPN'

function matchToId(m) {
  const oppTla = isJapan(m.homeTeam) ? m.awayTeam?.tla : m.homeTeam?.tla
  if (m.stage === 'GROUP_STAGE') return OPP_TO_ID[oppTla] || null
  return STAGE_TO_ID[m.stage] ?? null
}

function oppInfo(m) {
  const t = isJapan(m.homeTeam) ? m.awayTeam : m.homeTeam
  return COUNTRY[t?.tla] || { ja: t?.name || '相手', flag: '🏳️' }
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
  const japan = (data.matches || []).filter((m) => isJapan(m.homeTeam) || isJapan(m.awayTeam))
  return { japan }
}

export default async function handler(req, res) {
  const { key, debug, remindTest } = req.query
  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  // 出場国リスト（対応表づくり用）
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
        homeTla: m.homeTeam?.tla,
        awayTla: m.awayTeam?.tla,
        score: m.score?.fullTime,
        mapped: matchToId(m),
        opp: oppInfo(m),
      })),
    })
    return
  }

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
  const results = await getResults()
  const updated = []
  let pushed = 0
  let changed = false

  for (const m of data.japan) {
    const id = matchToId(m)
    if (!id) continue
    if (results[id]?.manual) continue
    const info = oppInfo(m)

    if (m.status === 'FINISHED') {
      // ① スコア反映
      const ft = m.score?.fullTime
      if (!ft || ft.home == null || ft.away == null) continue
      const jp = isJapan(m.homeTeam) ? ft.home : ft.away
      const opp = isJapan(m.homeTeam) ? ft.away : ft.home
      const prev = results[id]
      if (prev && prev.jp === jp && prev.opp === opp) continue
      const wasWin = prev && prev.jp > prev.opp
      results[id] = { jp, opp, opponent: info.ja, flag: info.flag }
      changed = true
      updated.push({ id, score: `${jp}-${opp}` })
      if (jp > opp && !wasWin) {
        const p = await notifyWin()
        pushed += p.sent || 0
      }
    } else if (id !== 'gs1' && id !== 'gs2' && id !== 'gs3') {
      // ② 決勝Tの相手・日程を試合前に反映（グループは元から入っているので対象外）
      const prev = results[id]
      if (prev && prev.jp != null) continue // 既に結果あり
      const kickoff = formatJST(m.utcDate)
      if (prev && prev.opponent === info.ja && prev.kickoff === kickoff) continue
      results[id] = { opponent: info.ja, flag: info.flag, kickoff }
      changed = true
      updated.push({ id, upcoming: `${info.ja} ${kickoff}` })
    }
  }
  if (changed) await setResults(results)

  // ③ 24時間前リマインド
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
