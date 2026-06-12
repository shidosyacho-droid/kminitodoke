import { useEffect, useState } from 'react'
import './App.css'
import type { DeliveryState, MatchMessage, Reaction } from './types'
import { MATCHES } from './data/matches'
import { WC_END_DATE } from './config'
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
    () => Date.now() >= WC_END_DATE.getTime(),
  )

  // サーバー(KV)の最新スコアを取得して反映（本人プレビュー時は固定なのでスキップ）
  // 形: { gs1: { jp, opp, opponent? } } → 勝ち(jp>opp)=配信 / それ以外=封印、表示は「日本 2-1 オランダ」
  useEffect(() => {
    if (IS_PREVIEW) return
    fetch('/api/state')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const results: Record<
          string,
          { jp: number; opp: number; opponent?: string }
        > = data?.results ?? {}
        if (!results || Object.keys(results).length === 0) return
        setMatches((prev) =>
          prev.map((m) => {
            const r = results[m.id]
            if (!r) return m
            const opponent = r.opponent ?? m.opponent
            const won = r.jp > r.opp
            return {
              ...m,
              opponent,
              state: (won ? 'delivered' : 'sealed') as DeliveryState,
              result: `日本 ${r.jp}-${r.opp} ${opponent}`,
            }
          }),
        )
      })
      .catch(() => {
        /* APIが無い/失敗時はアプリ内の初期状態のまま */
      })
  }, [])

  const selected = matches.find((m) => m.id === selectedId) ?? null

  const handleReact = (id: string, reaction: Reaction) => {
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, reaction } : m)))
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
