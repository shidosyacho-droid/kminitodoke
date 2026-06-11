import { APP_NAME } from '../config'
import { playClick } from '../lib/sfx'

type Props = {
  onStart: () => void
}

export default function TitleScreen({ onStart }: Props) {
  return (
    <div className="title-screen title-screen--scene">
      <img className="title-photo" src="/scenes/title-room.png" alt="" aria-hidden />

      <div className="title-top">
        <h1 className="title-logo">{APP_NAME}</h1>
      </div>

      <div className="title-bottom title-bottom--clean">
        <div className="title-sub">⚽ WORLD CUP 2026 ⚽</div>
        <p className="title-tag">
          日本代表が勝つと、プレゼントが届く。
          <br />
          二人で応援しよう！
        </p>
        <button
          className="start-btn"
          onClick={() => {
            playClick()
            onStart()
          }}
        >
          ▶ スタートする
        </button>
      </div>
    </div>
  )
}
