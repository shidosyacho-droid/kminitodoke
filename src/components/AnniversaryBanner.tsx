import { ANNIVERSARY_TITLE, ANNIVERSARY_LINES } from '../config'

/** 1年記念のお祝いメッセージ（config.ts の文言を表示） */
export default function AnniversaryBanner() {
  return (
    <div className="anniv-banner">
      <div className="anniv-banner__title">{ANNIVERSARY_TITLE}</div>
      <div className="anniv-banner__body">
        {ANNIVERSARY_LINES.map((line, i) => (
          <p key={i} className="anniv-banner__line">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
