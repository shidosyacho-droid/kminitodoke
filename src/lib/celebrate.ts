import confetti from 'canvas-confetti'

// 日本カラー＋ゴールド。ドット風に四角い紙吹雪で。
const COLORS = ['#ffffff', '#e0002d', '#4f8ff7', '#ffcf3f', '#ff6f9d']
const PIXEL = { shapes: ['square' as const], flat: true }

/** メッセージ開封時の「ゴール！」お祝い演出 */
export function celebrate() {
  confetti({
    particleCount: 110,
    spread: 90,
    startVelocity: 42,
    origin: { y: 0.6 },
    colors: COLORS,
    scalar: 1.2,
    ...PIXEL,
  })

  const shots = [120, 320, 520]
  shots.forEach((delay) => {
    setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 70,
        startVelocity: 48,
        origin: { x: 0, y: 0.7 },
        colors: COLORS,
        scalar: 1.2,
        ...PIXEL,
      })
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 70,
        startVelocity: 48,
        origin: { x: 1, y: 0.7 },
        colors: COLORS,
        scalar: 1.2,
        ...PIXEL,
      })
    }, delay)
  })
}

/** 優勝（決勝）専用の特大演出 */
export function celebrateChampion() {
  const duration = 2600
  const animationEnd = performance.now() + duration

  ;(function frame() {
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 70,
      origin: { x: 0 },
      colors: COLORS,
      scalar: 1.3,
      ...PIXEL,
    })
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 70,
      origin: { x: 1 },
      colors: COLORS,
      scalar: 1.3,
      ...PIXEL,
    })
    if (performance.now() < animationEnd) {
      requestAnimationFrame(frame)
    }
  })()

  confetti({
    particleCount: 160,
    spread: 130,
    startVelocity: 55,
    origin: { y: 0.5 },
    colors: COLORS,
    scalar: 1.4,
    ...PIXEL,
  })
}

/** ハートを送ったときの小さなときめき演出 */
export function heartBurst() {
  const heart = confetti.shapeFromText({ text: '❤️', scalar: 2 })
  confetti({
    particleCount: 20,
    spread: 60,
    startVelocity: 26,
    gravity: 0.8,
    scalar: 2,
    origin: { y: 0.7 },
    shapes: [heart],
    flat: true,
  })
}
