import type { MatchMessage } from '../types'
import { effectiveState, isOpenable } from '../lib/state'
import { Sprite, flagSprite } from './Sprite'

type Props = {
  match: MatchMessage
  no: number
  revealSealed: boolean
  isNext: boolean
  onOpen: (id: string) => void
}

export default function BingoCell({ match, no, revealSealed, isNext, onOpen }: Props) {
  const state = effectiveState(match, revealSealed)
  const openable = isOpenable(state)

  const className = [
    'cell',
    `cell--${state}`,
    isNext && state === 'upcoming' ? 'cell--next' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const fs = flagSprite(match.opponent)
  const flagEl = fs ? (
    <span className="cell__flag">
      <Sprite name={fs} size={30} />
    </span>
  ) : (
    <span className="cell__flag">{match.flag}</span>
  )

  const body = (
    <>
      <span className="cell__no">{String(no).padStart(2, '0')}</span>

      {state === 'delivered' ? (
        <>
          <span className="stamp">勝</span>
          {flagEl}
          <span className="cell__team">{match.opponent}</span>
          {match.title && <span className="cell__title">{match.title}</span>}
        </>
      ) : state === 'revealed' ? (
        <>
          <span className="stamp stamp--rose">届</span>
          {flagEl}
          <span className="cell__team">{match.opponent}</span>
          {match.title && <span className="cell__title">{match.title}</span>}
        </>
      ) : (
        <>
          {isNext && state === 'upcoming' && <span className="cell__nexttag">NEXT</span>}
          <span className="cell__q">？</span>
          <span className="cell__title cell__title--locked">
            {match.title ?? '？？？'}
          </span>
        </>
      )}
    </>
  )

  if (openable) {
    return (
      <button className={className} onClick={() => onOpen(match.id)}>
        {body}
      </button>
    )
  }
  return (
    <div className={className} aria-disabled>
      {body}
    </div>
  )
}
