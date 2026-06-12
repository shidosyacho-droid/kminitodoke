import { useState } from 'react'
import { enablePush, notifStatus } from '../lib/push'

// 試合の通知をオンにするボタン（彼女が1回タップするだけ）。
// 既に許可ずみ/非対応のときは控えめに切り替わる。
export default function NotifyButton() {
  const [status, setStatus] = useState<string>(() => notifStatus())
  const [busy, setBusy] = useState(false)

  if (status === 'unsupported') return null
  if (status === 'granted') {
    return <div className="notify notify--on">🔔 通知オン</div>
  }
  if (status === 'denied') {
    return (
      <div className="notify notify--off">
        🔕 通知がブロックされています（端末の設定から許可できます）
      </div>
    )
  }

  const onClick = async () => {
    setBusy(true)
    const r = await enablePush()
    setBusy(false)
    setStatus(r.ok ? 'granted' : r.reason || 'error')
  }

  return (
    <button className="notify" onClick={onClick} disabled={busy}>
      🔔 試合の通知をオンにする
    </button>
  )
}
