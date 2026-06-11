import { useEffect } from 'react'
import { APP_NAME, APP_DESC } from '../config'
import { Sprite } from './Sprite'

type Props = {
  /** ロード完了（ボールがゴールに入ったタイミング）でホームへ */
  onDone: () => void
}

export default function LoadingScreen({ onDone }: Props) {
  useEffect(() => {
    // ドリブル演出（約7秒）が終わってゴール → ホームへ自動遷移
    const t = setTimeout(onDone, 7000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="loading">
      <div className="loading__inner">
        <h1 className="loading__logo">{APP_NAME}</h1>

        <div className="title-desc win">{APP_DESC}</div>

        <div className="howto">
          <div className="howto__head">― 遊び方 ―</div>
          <div className="howto__steps">
            <div className="howto__step">
              <div className="howto__icon">
                <Sprite name="play" size={40} />
              </div>
              <div className="howto__cap">
                <b>1</b> 日本代表の
                <br />
                試合を見る
              </div>
            </div>
            <div className="howto__arrow">▶</div>
            <div className="howto__step">
              <div className="howto__icon">
                <Sprite name="trophy" size={38} />
              </div>
              <div className="howto__cap">
                <b>2</b> 日本が
                <br />
                試合に勝つ
              </div>
            </div>
            <div className="howto__arrow">▶</div>
            <div className="howto__step">
              <div className="howto__icon">
                <Sprite name="gift" size={38} />
              </div>
              <div className="howto__cap">
                <b>3</b> プレゼントが
                <br />
                届く！
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="loading__bar">
        <div className="loading__label">Now Loading...</div>
        <div className="loader-field">
          <div className="loader-goal" />
          <div className="loader-goalflash">GOAL!</div>
          <div className="loader-runner">
            <Sprite name="play" size={44} />
          </div>
        </div>
      </div>
    </div>
  )
}
