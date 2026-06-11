// 君に届け — ドット絵スプライト（SVGの1pxレクトで描画）
// グリッド文字列 + パレットで定義。'.' は透明。あとから色を微調整しやすい。

import type { ReactNode } from 'react'

type Grid = string[]
type Palette = Record<string, string>

function PixelArt({
  grid,
  palette,
  size,
  className,
  label,
}: {
  grid: Grid
  palette: Palette
  size: number
  className?: string
  label?: string
}) {
  const h = grid.length
  const w = grid[0].length
  const rects: ReactNode[] = []
  for (let y = 0; y < h; y++) {
    const row = grid[y]
    for (let x = 0; x < w; x++) {
      const c = palette[row[x]]
      if (!c) continue
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={c} />)
    }
  }
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated', display: 'block' }}
      role="img"
      aria-label={label}
    >
      {rects}
    </svg>
  )
}

/* ---------- スプライト定義 ---------- */

const BALL: Grid = [
  '....KKKK....',
  '..KKWWWWKK..',
  '.KWWWWWWWWK.',
  '.KWWKKWWWWK.',
  'KWWKKKKWWWWK',
  'KWWWKKWWWWWK',
  'KWWWWWWKKWWK',
  'KWWWWWKKKWWK',
  '.KWWWWKKWWK.',
  '.KWWWWWWWWK.',
  '..KKWWWWKK..',
  '....KKKK....',
]

const TROPHY: Grid = [
  '.KKKKKKKKKK.',
  '.KYYYYYYYYK.',
  'KKYYYYYYYYKK',
  'KOYYYYHHYYOK',
  'KOYYYYYYYYOK',
  'KKYYYYYYYYKK',
  '.KYYYYYYYYK.',
  '..KYYYYYYK..',
  '...KYYYYK...',
  '....KYYK....',
  '...KKYYKK...',
  '..KKKKKKKK..',
]

const HEART: Grid = [
  '..KKK..KKK..',
  '.KPPRKKRPPK.',
  'KPRRRRRRRRRK',
  'KRRRRRRRRRRK',
  'KRRRRRRRRRRK',
  '.KRRRRRRRRK.',
  '..KRRRRRRK..',
  '...KRRRRK...',
  '....KRRK....',
  '.....KK.....',
]

const NL: Grid = [
  'KKKKKKKKKKKK',
  'KrrrrrrrrrrK',
  'KrrrrrrrrrrK',
  'KwwwwwwwwwwK',
  'KwwwwwwwwwwK',
  'KbbbbbbbbbbK',
  'KbbbbbbbbbbK',
  'KKKKKKKKKKKK',
]

const JP: Grid = [
  'KKKKKKKKKKKK',
  'KwwwwwwwwwwK',
  'KwwwwRRwwwwK',
  'KwwwRRRRwwwK',
  'KwwwRRRRwwwK',
  'KwwwwRRwwwwK',
  'KwwwwwwwwwwK',
  'KKKKKKKKKKKK',
]

const SE: Grid = [
  'KKKKKKKKKKKK',
  'KbbyybbbbbbK',
  'KbbyybbbbbbK',
  'KyyyyyyyyyyK',
  'KyyyyyyyyyyK',
  'KbbyybbbbbbK',
  'KbbyybbbbbbK',
  'KKKKKKKKKKKK',
]

const TN: Grid = [
  'KKKKKKKKKKKK',
  'KRRRRRRRRRRK',
  'KRRRwwwwRRRK',
  'KRRwwwwwwRRK',
  'KRRwwwRwwRRK',
  'KRRRwwwwRRRK',
  'KRRRRRRRRRRK',
  'KKKKKKKKKKKK',
]

const STAR: Grid = [
  '....Y....',
  '...YYY...',
  '...YYY...',
  'YYYYYYYYY',
  '.YYYYYYY.',
  '..YYYYY..',
  '..YY.YY..',
  '.YY...YY.',
  'YY.....YY',
]

const SMILE: Grid = [
  '..YYYYY..',
  '.YYYYYYY.',
  'YYYYYYYYY',
  'YKYYYYYKY',
  'YYYYYYYYY',
  'YYYYYYYYY',
  'YYKKKKKYY',
  '.YYYYYYY.',
  '..YYYYY..',
]

const CRY: Grid = [
  '..YYYYY..',
  '.YYYYYYY.',
  'YYYYYYYYY',
  'YKYYYYYKY',
  'YYYYYYYYY',
  'YYYYYYYbY',
  'YYYKKKYYY',
  '.YYYbYYY.',
  '..YYYYY..',
]

const FIRE: Grid = [
  '....R....',
  '...RRR...',
  '...ROR...',
  '..ROOR...',
  '..ROOOR..',
  '.ROOYOOR.',
  '.ROYYYOR.',
  '.ROOYOOR.',
  '..RRRRR..',
]

// 選手がボールを蹴る場面
const PLAY: Grid = [
  '....kk..........',
  '...kssk.........',
  '...kssk.........',
  '....kk..........',
  '...kjjk.........',
  '..kjjjjk........',
  '.kjjjjjjk.......',
  '..kjjjjk........',
  '..kwwwwk........',
  '..kl..lk........',
  '..kl..lk........',
  '.kl...llk.......',
  'kl....kllk......',
  'kk......kkbbk...',
  '........kbbbbk..',
  '.........kbbk...',
]

// 届くメッセージ（ハート入りの封筒）
const MAIL: Grid = [
  'KKKKKKKKKKKKKK',
  'KEEEEEEEEEEEEK',
  'KEKEEEEEEEEKEK',
  'KEEKEEEEEEKEEK',
  'KEEEKEEEEKEEEK',
  'KEEEERRRREEEEK',
  'KEEERRRRRRREEK',
  'KEEERRRRRRREEK',
  'KEEEERRRRREEEK',
  'KEEEEERRREEEEK',
  'KKKKKKKKKKKKKK',
]

// プレゼント箱（リボン付き）
const GIFT: Grid = [
  '......RR......',
  '.....RKKR.....',
  '....RK..KR....',
  '....RK..KR....',
  'KKKKKKRRKKKKKK',
  'KBBBBBRRBBBBBK',
  'KBBBBBRRBBBBBK',
  'KKKKKKRRKKKKKK',
  'KBBBBBRRBBBBBK',
  'KBBBBBRRBBBBBK',
  'KBBBBBRRBBBBBK',
  'KBBBBBRRBBBBBK',
  'KBBBBBRRBBBBBK',
  'KKKKKKKKKKKKKK',
]

const OUTLINE = '#15151c'

export type SpriteName =
  | 'ball'
  | 'trophy'
  | 'heart'
  | 'nl'
  | 'jp'
  | 'se'
  | 'tn'
  | 'star'
  | 'smile'
  | 'cry'
  | 'fire'
  | 'play'
  | 'mail'
  | 'gift'

const DEFS: Record<SpriteName, { grid: Grid; palette: Palette }> = {
  ball: { grid: BALL, palette: { W: '#f5f5f5', K: OUTLINE } },
  trophy: {
    grid: TROPHY,
    palette: { Y: '#ffcf3f', O: '#c8961a', H: '#fff3c0', K: '#6b4f12' },
  },
  heart: { grid: HEART, palette: { R: '#e0002d', P: '#ff9ab3', K: '#7a0016' } },
  nl: { grid: NL, palette: { r: '#ae1c28', w: '#ffffff', b: '#21468b', K: OUTLINE } },
  jp: { grid: JP, palette: { w: '#ffffff', R: '#bc002d', K: OUTLINE } },
  se: { grid: SE, palette: { b: '#006aa7', y: '#fecc00', K: OUTLINE } },
  tn: { grid: TN, palette: { R: '#e70013', w: '#ffffff', K: OUTLINE } },
  star: { grid: STAR, palette: { Y: '#ffd64a' } },
  smile: { grid: SMILE, palette: { Y: '#ffd64a', K: '#6b4f12' } },
  cry: { grid: CRY, palette: { Y: '#ffd64a', K: '#6b4f12', b: '#4f8ff7' } },
  fire: { grid: FIRE, palette: { R: '#e0002d', O: '#ff8a3d', Y: '#ffe27a' } },
  play: {
    grid: PLAY,
    palette: { s: '#f1c79a', j: '#2350c8', w: '#eef1f5', l: '#f1c79a', b: '#f5f5f5', k: OUTLINE },
  },
  mail: { grid: MAIL, palette: { E: '#f6e7c5', R: '#e0002d', K: OUTLINE } },
  gift: { grid: GIFT, palette: { B: '#e0002d', R: '#ffcf3f', K: OUTLINE } },
}

export function Sprite({
  name,
  size = 24,
  className,
}: {
  name: SpriteName
  size?: number
  className?: string
}) {
  const def = DEFS[name]
  return (
    <PixelArt grid={def.grid} palette={def.palette} size={size} className={className} label={name} />
  )
}

/** 対戦国名 → 国旗スプライト名（なければ null） */
export function flagSprite(opponent: string): SpriteName | null {
  switch (opponent) {
    case 'オランダ':
      return 'nl'
    case 'スウェーデン':
      return 'se'
    case 'チュニジア':
      return 'tn'
    case '日本':
      return 'jp'
    default:
      return null
  }
}

/** ピッチのライン（センターサークル・ペナルティエリア・ゴールエリア） */
export function PitchLines({ className }: { className?: string }) {
  const line = 'rgba(255,255,255,0.32)'
  return (
    <svg
      className={className}
      viewBox="0 0 100 130"
      preserveAspectRatio="none"
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <g fill="none" stroke={line} strokeWidth="1.4" vectorEffect="non-scaling-stroke">
        <line x1="2" y1="65" x2="98" y2="65" />
        <circle cx="50" cy="65" r="13" />
        {/* 上のペナルティ／ゴールエリア */}
        <rect x="27" y="2" width="46" height="20" />
        <rect x="39" y="2" width="22" height="9" />
        {/* 下のペナルティ／ゴールエリア */}
        <rect x="27" y="108" width="46" height="20" />
        <rect x="39" y="119" width="22" height="9" />
      </g>
      <circle cx="50" cy="65" r="1.4" fill={line} />
    </svg>
  )
}
