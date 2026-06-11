import type { MatchMessage } from '../types'
import { APP_NAME } from '../config'
import { effectiveState, isOpenable } from '../lib/state'
import { playClick } from '../lib/sfx'
import BingoCell from './BingoCell'
import { Sprite, PitchLines } from './Sprite'

type Props = {
  matches: MatchMessage[]
  revealSealed: boolean
  onOpen: (id: string) => void
  onToggleDemo: () => void
  onBackToTitle: () => void
}

export default function Collection({
  matches,
  revealSealed,
  onOpen,
  onToggleDemo,
  onBackToTitle,
}: Props) {
  // #9（champion）は盤面から除外し、トロフィーマスから開く
  const boardMatches = matches.filter((m) => m.stage !== 'champion')
  const championMatch = matches.find((m) => m.stage === 'champion') ?? null

  const openableCount = boardMatches.filter((m) =>
    isOpenable(effectiveState(m, revealSealed)),
  ).length
  const sealedCount = boardMatches.filter((m) => m.state === 'sealed').length

  // 決勝に勝つ or 大会終了（自動解禁）でトロフィー（#9）が開く
  const champion =
    matches.find((m) => m.stage === 'final')?.state === 'delivered' || revealSealed

  const nextId = boardMatches.find((m) => m.state === 'upcoming')?.id ?? null

  return (
    <div className="collection">
      <div className="hud">
        <button
          className="hud__back"
          onClick={() => {
            playClick()
            onBackToTitle()
          }}
        >
          ← ホーム
        </button>
        <div className="hud__title">{APP_NAME}</div>
        <div className="hud__score">★{openableCount}/8</div>
      </div>

      <div className="collection-heading">★ コレクション一覧 ★</div>

      {revealSealed && sealedCount > 0 && (
        <div className="finale-banner">
          🎉 全てのプレゼントが解禁されました。<br />
          勝てなかった日の <b>「本当は届けたかったメッセージ」</b>の封印が解けました。
        </div>
      )}

      <div className="pitch-board">
        <PitchLines className="pitch-lines" />
        <div className="bingo-grid">
          {boardMatches.map((m, i) => (
            <BingoCell
              key={m.id}
              match={m}
              no={i + 1}
              revealSealed={revealSealed}
              isNext={m.id === nextId}
              onOpen={onOpen}
            />
          ))}

          {/* 9マス目：優勝トロフィー＝特別プレゼント（優勝で開封可） */}
          {champion && championMatch ? (
            <button
              className="cell cell--trophy is-champion"
              onClick={() => onOpen(championMatch.id)}
            >
              <span className="stamp">開</span>
              <span className="cell__flag">
                <Sprite name="trophy" size={34} />
              </span>
              <span className="cell__team">優勝！</span>
              {championMatch.title && (
                <span className="cell__title">{championMatch.title}</span>
              )}
            </button>
          ) : (
            <div className="cell cell--trophy">
              <span className="cell__flag">
                <Sprite name="trophy" size={34} />
              </span>
              <span className="cell__team">優勝</span>
            </div>
          )}
        </div>
      </div>

      <div className="legend">
        <span><i className="lg-win" />開封ずみ</span>
        <span><i className="lg-lock" />？ 未解禁</span>
      </div>

      {/* --- デモ用：開発時(npm run dev)のみ表示。本番ビルド＝彼女のアプリには出ない --- */}
      {import.meta.env.DEV && (
        <div className="demo-bar">
          <span className="demo-bar__tag">DEMO</span>
          <button className="demo-bar__btn" onClick={onToggleDemo}>
            {revealSealed ? '▶ 大会期間中に戻す' : '▶ 大会終了をシミュレート（封印解禁）'}
          </button>
        </div>
      )}
    </div>
  )
}
