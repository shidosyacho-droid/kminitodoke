// 君に届け — 表示名などの設定（ここを変えれば全体に反映）

export const SENDER = '志道様' // 送り主（あなた）の表示名
export const RECIPIENT = 'ひなた様' // 受け取り手（彼女）の表示名

// ワールドカップ終了日時。これを過ぎると、未解禁のプレゼント（封印・未開催）が
// 自動で全て解禁される（＝最後に全部ひなた様へ届く）。
export const WC_END_DATE = new Date('2026-07-20T00:00:00+09:00')

export const APP_NAME = '君に届け'
export const APP_TAGLINE = '日本代表が勝ったら、君にメッセージが届く。'
export const APP_DESC =
  '日本代表が試合に勝つと、志道様からのプレゼントが届きます。勝つたびにプレゼントが解禁され、二人のコレクションが増えていきます。日本代表を応援しましょう！'
