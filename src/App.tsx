import { useEffect, useState } from 'react'
import './App.css'
import type { DeliveryState, MatchMessage, Reaction } from './types'
import { MATCHES } from './data/matches'
import { WC_END_DATE, ANNIVERSARY } from './config'
import TitleScreen from './components/TitleScreen'
import LoadingScreen from './components/LoadingScreen'
import Home from './components/Home'
import Collection from './components/Collection'
import MessageScene from './components/MessageScene'

type Screen = 'title' | 'loading' | 'home' | 'collection'

// 本人プレビュー用：URLに ?preview を付けると全プレゼントを「配信済み」表示にして
// 中身を確認できる。彼女が使う通常URL／ホーム画面のインストール版(start_url="/")には影響しない。
const IS_PREVIEW =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('preview')

function App() {
  const [screen, setScreen] = useState<Screen>('title')
  const [matches, setMatches] = useState<MatchMessage[]>(() =>
    IS_PREVIEW
      ? MATCHES.map((m) => ({ ...m, state: 'delivered' as const }))
      : MATCHES,
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // ワールドカップ終了日時を過ぎていたら、最初から全プレゼントを自動解禁。
  // （DEMOボタンで手動トグルもできる＝終了後の状態をプレビュー用）
  const [revealSealed, setRevealSealed] = useState(
    () => ANNIVERSARY || Date.now() >= WC_END_DATE.getTime(),
  )

  // サーバー(KV)の最新スコアを取得して反映（本人プレビュー時は固定なのでスキップ）
  // 形: { gs1: { jp, opp, opponent? } } → 勝ち(jp>opp)=配信 / それ以外=封印、表示は「日本 2-1 オランダ」
  useEffect(() => {
    if (IS_PREVIEW) return
    const syncState = () => {
      fetch('/api/state')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const results: Record<
            string,
            {
              jp?: number
              opp?: number
              won?: boolean
              pk?: { jp: number; opp: number }
              opponent?: string
              flag?: string
              kickoff?: string
            }
          > = data?.results ?? {}
          if (!results || Object.keys(results).length === 0) return
          // 決勝T進出済みか（グループ突破記念で、グループステージの封印を解禁する判定）
          const clearedGroup = ['r32', 'r16', 'qf', 'sf', 'final'].some(
            (k) => results[k],
          )
          setMatches((prev) =>
            prev.map((m) => {
              const r = results[m.id]
              if (!r) return m
              const merged: MatchMessage = { ...m }
              // 決勝Tの相手・国旗・日程を試合前でも反映
              if (r.opponent) merged.opponent = r.opponent
              if (r.flag) merged.flag = r.flag
              if (r.kickoff) merged.kickoff = r.kickoff
              // スコアが入っていれば勝敗確定（勝敗は won＝PK込みの正しい判定）
              if (r.jp != null && r.opp != null) {
                const won = r.won ?? r.jp > r.opp
                let st: DeliveryState = won ? 'delivered' : 'sealed'
                // グループ突破記念：決勝T進出後はグループの封印を解禁
                if (!won && m.stage === 'group' && clearedGroup) st = 'revealed'
                merged.state = st
                const pk = r.pk ? `（PK ${r.pk.jp}-${r.pk.opp}）` : ''
                merged.result = `日本 ${r.jp}-${r.opp}${pk} ${merged.opponent}`
              }
              return merged
            }),
          )
        })
        .catch(() => {
          /* APIが無い/失敗時はアプリ内の初期状態のまま */
        })
    }
    // 新しいデプロイが出ていたら自動で最新を読み込む（手動リロード不要にする）
    const currentBundle = () => {
      const s = document.querySelector(
        'script[type="module"][src*="/assets/index-"]',
      )
      return s ? s.getAttribute('src') : null
    }
    const checkForUpdate = () => {
      const cur = currentBundle()
      if (!cur) return // 開発時など本番ビルド以外は何もしない
      fetch('/', { cache: 'no-store' })
        .then((r) => (r.ok ? r.text() : ''))
        .then((html) => {
          const m = html.match(/\/assets\/index-[^"]+\.js/)
          const latest = m ? m[0] : null
          // バンドルのハッシュが変わっていたら＝新バージョン → 自動で読み込み直す
          if (latest && !cur.includes(latest)) location.reload()
        })
        .catch(() => {})
    }
    // 起動時に取得
    syncState()
    // アプリが前面に戻った時／フォーカス時：データ再取得＋新バージョン確認
    // （彼女が通知をタップして開きっぱなしのアプリに戻った時も、最新を必ず反映）
    const onForeground = () => {
      syncState()
      checkForUpdate()
      // 記念モード、または大会終了日時を過ぎていたら封印を解禁（開きっぱなしでも開いた時に反映）
      if (ANNIVERSARY || Date.now() >= WC_END_DATE.getTime()) setRevealSealed(true)
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') onForeground()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onForeground)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onForeground)
    }
  }, [])

  // 端末に保存したリアクション（ハート/スタンプ）を復元
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('kimi_reactions') || '{}')
      if (saved && Object.keys(saved).length) {
        setMatches((prev) =>
          prev.map((m) => (saved[m.id] ? { ...m, reaction: saved[m.id] } : m)),
        )
      }
    } catch {
      /* 壊れていたら無視 */
    }
  }, [])

  const selected = matches.find((m) => m.id === selectedId) ?? null

  const handleReact = (id: string, reaction: Reaction) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, reaction } : m)))
    // 端末に保存（リロード/再起動でも残る）
    try {
      const saved = JSON.parse(localStorage.getItem('kimi_reactions') || '{}')
      saved[id] = reaction
      localStorage.setItem('kimi_reactions', JSON.stringify(saved))
    } catch {
      /* 保存できなくても操作は成立 */
    }
  }

  let content
  if (selected) {
    content = (
      <MessageScene
        key={selected.id}
        match={selected}
        revealSealed={revealSealed}
        fromCollection={screen === 'collection'}
        onClose={() => setSelectedId(null)}
        onReact={handleReact}
      />
    )
  } else if (screen === 'title') {
    content = <TitleScreen onStart={() => setScreen('loading')} />
  } else if (screen === 'loading') {
    content = <LoadingScreen onDone={() => setScreen('home')} />
  } else if (screen === 'home') {
    content = (
      <Home
        matches={matches}
        revealSealed={revealSealed}
        onOpen={(id) => setSelectedId(id)}
        onGoCollection={() => setScreen('collection')}
        onBackToTitle={() => setScreen('title')}
      />
    )
  } else {
    content = (
      <Collection
        matches={matches}
        revealSealed={revealSealed}
        onOpen={(id) => setSelectedId(id)}
        onToggleDemo={() => setRevealSealed((v) => !v)}
        onBackToTitle={() => setScreen('home')}
      />
    )
  }

  return (
    <div className="app">
      <div className="stadium" aria-hidden>
        <div className="stadium__lights" />
        <div className="stadium__crowd" />
      </div>
      {content}
      <div className="crt" aria-hidden />
    </div>
  )
}

export default App
