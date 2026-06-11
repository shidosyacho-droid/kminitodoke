// UI効果音（アセット不要・WebAudioで合成）。ボタンのクリック（＝ユーザー操作）で鳴らす。

let _ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (_ctx) return _ctx
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  _ctx = Ctx ? new Ctx() : null
  return _ctx
}

/** ナビ用の短いレトロな「ピッ」音 */
export function playClick() {
  try {
    const ac = getCtx()
    if (!ac) return
    if (ac.state === 'suspended') ac.resume()
    const t = ac.currentTime
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(620, t)
    osc.frequency.exponentialRampToValueAtTime(980, t + 0.05)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
    osc.connect(g).connect(ac.destination)
    osc.start(t)
    osc.stop(t + 0.14)
  } catch {
    /* 音が出せない環境でも操作には影響しない */
  }
}
