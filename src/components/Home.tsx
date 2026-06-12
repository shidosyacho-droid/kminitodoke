import type { MatchMessage } from '../types'
import { STAGE_META } from '../types'
import { APP_NAME, RECIPIENT } from '../config'
import { effectiveState, isOpenable } from '../lib/state'
import { playClick } from '../lib/sfx'
import { Sprite, flagSprite } from './Sprite'

type Props = {
  matches: MatchMessage[]
  revealSealed: boolean
  onOpen: (id: string) => void
  onGoCollection: () => void
  onBackToTitle: () => void
}

export default function Home({
  matches,
  revealSealed,
  onOpen,
  onGoCollection,
  onBackToTitle,
}: Props) {
  // #9（champion）はホーム日程には出さず、コレクションのトロフィーマスから開く
  const board = matches.filter((m) => m.stage !== 'champion')
  const openableCount = board.filter((m) => isOpenable(effectiveState(m, revealSealed))).length
  const nextMatch = board.find((m) => m.state === 'upcoming') ?? null

  const group = board.filter((m) => m.stage === 'group')
  const ko = board.filter((m) => m.stage !== 'group')

  const renderRow = (m: MatchMessage) => {
    const st = effectiveState(m, revealSealed)
    const openable = isOpenable(st)
    const isNext = m.id === nextMatch?.id
    const fs = flagSprite(m.opponent)

    const inner = (
      <>
        <div className="srow__icon">
          {fs ? <Sprite name={fs} size={26} /> : <span className="srow__q">？</span>}
        </div>
        <div className="srow__main">
          <div className="srow__top">
            <span className="srow__chip">{STAGE_META[m.stage].short}</span>
            <span className="srow__team">
              {m.opponent === '未定' ? '対戦相手 未定' : `vs ${m.opponent}`}
            </span>
          </div>
          <div className="srow__kick">🕑 {m.kickoff}</div>
          {m.result && <div className="srow__result">{m.result}</div>}
          {m.title && (
            <div className={`srow__title ${openable ? '' : 'srow__title--locked'}`}>
              📜「{m.title}」
            </div>
          )}
        </div>
        <div className="srow__status">
          {st === 'delivered' && <span className="sbadge sbadge--win">勝利</span>}
          {st === 'revealed' && <span className="sbadge sbadge--rose">解禁</span>}
          {st === 'sealed' && <span className="sbadge sbadge--lock">封印</span>}
          {st === 'upcoming' && (
            <span className={`sbadge ${isNext ? 'sbadge--next' : 'sbadge--soon'}`}>
              {isNext ? 'NEXT' : '予定'}
            </span>
          )}
          {openable && <span className="srow__open">開く ▶</span>}
        </div>
      </>
    )

    const cls = `srow srow--${st}${isNext ? ' srow--next' : ''}`
    return openable ? (
      <button key={m.id} className={cls} onClick={() => onOpen(m.id)}>
        {inner}
      </button>
    ) : (
      <div key={m.id} className={cls} aria-disabled>
        {inner}
      </div>
    )
  }

  return (
    <div className="home">
      <div className="hud">
        <button
          className="hud__back"
          onClick={() => {
            playClick()
            onBackToTitle()
          }}
        >
          ← TITLE
        </button>
        <div className="hud__title">{APP_NAME}</div>
        <div className="hud__score">★{openableCount}/8</div>
      </div>

      <p className="home-greet">
        {RECIPIENT}へ。<br />
        日本代表の試合日程です。勝つとプレゼントが届きます！
      </p>

      {nextMatch && (
        <div className="next-hero">
          <div className="next-hero__tag">▶ 次の試合</div>
          <div className="next-hero__row">
            <div className="next-hero__icon">
              {flagSprite(nextMatch.opponent) ? (
                <Sprite name={flagSprite(nextMatch.opponent)!} size={40} />
              ) : (
                <span className="srow__q big">？</span>
              )}
            </div>
            <div>
              <div className="next-hero__label">
                {STAGE_META[nextMatch.stage].short}・{nextMatch.label}
              </div>
              <div className="next-hero__opp">
                {nextMatch.opponent === '未定' ? '対戦相手 未定' : `vs ${nextMatch.opponent}`}
              </div>
              <div className="next-hero__kick">🕑 {nextMatch.kickoff}</div>
            </div>
          </div>
        </div>
      )}

      <section className="sched-section">
        <h2 className="sched-label">グループステージ</h2>
        <div className="sched-list">{group.map(renderRow)}</div>
      </section>

      <section className="sched-section">
        <h2 className="sched-label">決勝トーナメント — 優勝への道</h2>
        <div className="sched-list">{ko.map(renderRow)}</div>
      </section>

      <button
        className="home-cta"
        onClick={() => {
          playClick()
          onGoCollection()
        }}
      >
        🎁 コレクション一覧を開く
      </button>
    </div>
  )
}
