// 君に届け — データの型定義

/** トーナメントの段階 */
export type MatchStage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final' | 'champion'

/**
 * メッセージ（試合枠）の配信状態
 * upcoming : まだ試合が行われていない（メッセージは届いていない）
 * delivered: 日本が勝った → 配信済み。ひなた様が開封できる
 * sealed   : 負け / 引き分け → 封印。大会後まで中身は見えない
 * revealed : 大会終了後、封印が解禁された「本当は届けたかったメッセージ」
 */
export type DeliveryState = 'upcoming' | 'delivered' | 'sealed' | 'revealed'

/** ひなた様からの反応 */
export interface Reaction {
  hearted: boolean
  sticker: string | null
}

/** 1試合ぶんのメッセージ枠 */
export interface MatchMessage {
  id: string
  order: number
  stage: MatchStage
  /** 段階の表示名（例：グループステージ 第1戦） */
  label: string
  /** 相手国名 */
  opponent: string
  /** 相手国の旗（絵文字） */
  flag: string
  /** 日本時間のキックオフ目安 */
  kickoff: string
  /** メッセージのタイトル（未解禁でも見せて興味を引く） */
  title?: string
  state: DeliveryState
  /** 配信 or 解禁されたときに見える内容 */
  result?: string // 例：日本 2-1 オランダ
  text?: string
  imageUrl?: string | null
  videoUrl?: string | null
  reaction?: Reaction
}

/** 段階ごとの色・ラベルなどの見た目設定 */
export const STAGE_META: Record<MatchStage, { short: string; tone: string }> = {
  group: { short: 'GS', tone: 'グループステージ' },
  r32: { short: 'R32', tone: 'ラウンド32' },
  r16: { short: 'R16', tone: 'ラウンド16' },
  qf: { short: 'QF', tone: '準々決勝' },
  sf: { short: 'SF', tone: '準決勝' },
  final: { short: '決勝', tone: '決勝・優勝' },
  champion: { short: '優勝', tone: '優勝・特別' },
}
