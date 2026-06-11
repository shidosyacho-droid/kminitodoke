import type { MatchMessage, DeliveryState } from '../types'

/**
 * 表示上の実効状態。
 * 大会終了後（revealSealed）は、封印（sealed）だけでなく
 * まだ届いていない（upcoming）プレゼントも含めて解禁（revealed）扱いにする。
 * ＝ 最後にすべてのプレゼントがひなた様へ届く。
 */
export function effectiveState(
  match: MatchMessage,
  revealSealed: boolean,
): DeliveryState {
  if (revealSealed && (match.state === 'sealed' || match.state === 'upcoming')) {
    return 'revealed'
  }
  return match.state
}

/** 開封できる（=タップで読める）状態か */
export function isOpenable(state: DeliveryState): boolean {
  return state === 'delivered' || state === 'revealed'
}
