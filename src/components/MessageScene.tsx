import { useEffect, useState } from 'react'
import type { MatchMessage, Reaction } from '../types'
import { SENDER } from '../config'
import { celebrate, celebrateChampion, heartBurst } from '../lib/celebrate'
import { effectiveState } from '../lib/state'
import { Sprite, flagSprite } from './Sprite'

type Props = {
  match: MatchMessage
  revealSealed: boolean
  /** コレクション一覧から開いたか（＝お祝い演出を出さず、素の動画を見せる） */
  fromCollection?: boolean
  onClose: () => void
  onReact: (id: string, reaction: Reaction) => void
}

const STICKERS = ['heart', 'star', 'smile', 'fire', 'cry'] as const

export default function MessageScene({ match, revealSealed, fromCollection, onClose, onReact }: Props) {
  const state = effectiveState(match, revealSealed)
  const isFinal = match.stage === 'final'
  const isChampion = match.stage === 'champion'
  const isRevealed = state === 'revealed'
  const reaction: Reaction = match.reaction ?? { hearted: false, sticker: null }

  const fullText = match.text ?? ''
  const [shown, setShown] = useState(0)
  const done = shown >= fullText.length

  // 1文字ずつ表示（タイプライター）
  useEffect(() => {
    if (done) return
    const id = setInterval(() => {
      setShown((s) => Math.min(fullText.length, s + 1))
    }, 40)
    return () => clearInterval(id)
  }, [done, fullText.length])

  // 開封時のお祝い演出（コレクション一覧から開いたときは演出なし＝素の動画）
  useEffect(() => {
    if (fromCollection) return
    const t = setTimeout(() => {
      if (isRevealed) heartBurst()
      else if (isFinal || isChampion) celebrateChampion()
      else celebrate()
    }, 260)
    return () => clearTimeout(t)
  }, [isFinal, isChampion, isRevealed, fromCollection])

  const toggleHeart = () => {
    const next = { ...reaction, hearted: !reaction.hearted }
    if (next.hearted) heartBurst()
    onReact(match.id, next)
  }
  const chooseSticker = (s: string) => {
    onReact(match.id, { ...reaction, sticker: reaction.sticker === s ? null : s })
  }

  return (
    <div className={`scene ${isFinal || isChampion ? 'scene--final' : ''}`}>
      <div className="scene__top">
        <button className="scene__back" onClick={onClose}>
          ← 戻る
        </button>
      </div>

      <div className="scene__body">
        <div className="get">
          {isChampion ? (
            <div className="get__title">🏆 優勝・特別プレゼント</div>
          ) : isRevealed ? (
            <div className="get__title get__title--rose">💌 本当は届けたかった</div>
          ) : (
            <div className="get__title">{isFinal ? '🏆 世界一！！' : '⚽ 日本、勝利！'}</div>
          )}
          {match.title && <div className="get__name">「{match.title}」</div>}
          <div className="get__match">
            {flagSprite(match.opponent) ? (
              <Sprite name={flagSprite(match.opponent)!} size={24} />
            ) : (
              <span style={{ fontSize: 22 }}>{match.flag}</span>
            )}
            <span>
              {match.label}
              {match.result && <> ・ <span className="get__result">{match.result}</span></>}
            </span>
          </div>
        </div>

        {(match.videoUrl || match.imageUrl) && (
          <div className={`scene__video ${match.videoUrl ? 'scene__video--vid' : ''}`}>
            {match.videoUrl ? (
              <video
                src={match.videoUrl}
                poster={match.imageUrl ?? undefined}
                autoPlay
                loop
                muted
                playsInline
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget
                  const box = v.closest('.scene__video') as HTMLElement | null
                  if (box && v.videoWidth && v.videoHeight) {
                    // 下端を約8%トリミング（透かし除去）
                    box.style.aspectRatio = `${v.videoWidth} / ${Math.round(v.videoHeight * 0.92)}`
                  }
                }}
              />
            ) : (
              <img src={match.imageUrl ?? ''} alt="" />
            )}
          </div>
        )}

        <div className="win dialog" onClick={() => setShown(fullText.length)}>
          <span className="dialog__name">{SENDER}より</span>
          <p className="dialog__text">
            {fullText.slice(0, shown)}
            {!done && <span className="dialog__cursor">▌</span>}
            {done && <span className="dialog__cursor">▼</span>}
          </p>
        </div>

        {done && (
          <div className="react">
            <button
              className={`pix-heart ${reaction.hearted ? 'is-on' : ''}`}
              onClick={toggleHeart}
            >
              <span className={`pix-heart__icon ${reaction.hearted ? '' : 'heart-dim'}`}>
                <Sprite name="heart" size={18} />
              </span>
              {reaction.hearted ? 'ハートを送った！' : 'ハートを送る'}
            </button>
            <div className="sticker-row">
              {STICKERS.map((s) => (
                <button
                  key={s}
                  className={`sticker ${reaction.sticker === s ? 'is-on' : ''}`}
                  onClick={() => chooseSticker(s)}
                >
                  <Sprite name={s} size={26} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
