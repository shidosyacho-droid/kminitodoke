// タイトル画面の背景イラスト：二人でテレビ応援（ドット絵・アニメ付き）
export default function TitleScene() {
  return (
    <svg
      className="title-scene"
      viewBox="0 0 360 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tsRoom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#251b38" />
          <stop offset="0.7" stopColor="#1a1428" />
          <stop offset="1" stopColor="#120e1e" />
        </linearGradient>
        <radialGradient id="tsTvg" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#bfe6ff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#bfe6ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="360" height="640" fill="url(#tsRoom)" />

      {/* 壁の星 */}
      <g fill="#ffd24a">
        <rect className="ts-star" x="44" y="120" width="4" height="4" />
        <rect className="ts-star" x="306" y="138" width="4" height="4" />
        <rect className="ts-star" x="66" y="186" width="3" height="3" />
        <rect className="ts-star" x="292" y="210" width="3" height="3" />
      </g>

      {/* 床 */}
      <rect x="0" y="560" width="360" height="80" fill="#0e0a18" />

      {/* TVの光 */}
      <ellipse className="ts-tvglow" cx="180" cy="320" rx="150" ry="115" fill="url(#tsTvg)" />

      {/* TV（中継・画面中央） */}
      <g transform="translate(100,235)">
        <rect x="-6" y="-6" width="172" height="122" rx="6" fill="#0c0c12" stroke="#2a2a36" strokeWidth="3" />
        <rect x="2" y="2" width="156" height="102" fill="#1f7a40" />
        <rect x="2" y="2" width="16" height="102" fill="#1c6e3a" opacity="0.5" />
        <rect x="34" y="2" width="16" height="102" fill="#1c6e3a" opacity="0.5" />
        <rect x="66" y="2" width="16" height="102" fill="#1c6e3a" opacity="0.5" />
        <rect x="98" y="2" width="16" height="102" fill="#1c6e3a" opacity="0.5" />
        <rect x="130" y="2" width="16" height="102" fill="#1c6e3a" opacity="0.5" />
        <g fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.4">
          <rect x="5" y="7" width="150" height="92" />
          <line x1="80" y1="7" x2="80" y2="99" />
          <circle cx="80" cy="53" r="14" />
          <rect x="5" y="30" width="24" height="46" />
          <rect x="5" y="42" width="11" height="22" />
          <rect x="131" y="30" width="24" height="46" />
          <rect x="144" y="42" width="11" height="22" />
        </g>
        <circle cx="80" cy="53" r="1.5" fill="#fff" fillOpacity="0.7" />
        <rect x="2" y="45" width="3" height="16" fill="#fff" opacity="0.85" />
        <rect x="155" y="45" width="3" height="16" fill="#fff" opacity="0.85" />
        {/* 選手：日本(青) */}
        <g fill="#1b3bcc">
          <rect x="10" y="51" width="3" height="5" />
          <rect x="38" y="33" width="3" height="5" />
          <rect x="38" y="71" width="3" height="5" />
          <rect x="70" y="51" width="3" height="5" />
          <rect x="110" y="45" width="3" height="5" />
          <rect x="122" y="39" width="3" height="5" />
        </g>
        <g fill="#f3caa0">
          <rect x="10" y="49" width="3" height="2" />
          <rect x="38" y="31" width="3" height="2" />
          <rect x="38" y="69" width="3" height="2" />
          <rect x="70" y="49" width="3" height="2" />
          <rect x="110" y="43" width="3" height="2" />
          <rect x="122" y="37" width="3" height="2" />
        </g>
        {/* 選手：相手(白) */}
        <g fill="#e6e6ea">
          <rect x="148" y="51" width="3" height="5" />
          <rect x="126" y="35" width="3" height="5" />
          <rect x="126" y="69" width="3" height="5" />
          <rect x="98" y="51" width="3" height="5" />
        </g>
        <g fill="#f3caa0">
          <rect x="148" y="49" width="3" height="2" />
          <rect x="126" y="33" width="3" height="2" />
          <rect x="126" y="67" width="3" height="2" />
          <rect x="98" y="49" width="3" height="2" />
        </g>
        <circle cx="142" cy="52" r="2.4" fill="#fff" stroke="#15151c" strokeWidth="1" />
        {/* スコアボード */}
        <rect x="4" y="3" width="92" height="14" rx="2" fill="#0d0d14" opacity="0.9" />
        <rect x="7" y="6" width="9" height="8" fill="#fff" />
        <circle cx="11.5" cy="10" r="2" fill="#bc002d" />
        <text x="19" y="13" fontFamily="'Press Start 2P',monospace" fontSize="6" fill="#fff">JPN 1-0</text>
        <rect x="64" y="6" width="9" height="8" fill="#21468b" />
        <rect x="64" y="6" width="9" height="3" fill="#ae1c28" />
        <rect x="64" y="9" width="9" height="2" fill="#fff" />
        <text x="77" y="13" fontFamily="'Press Start 2P',monospace" fontSize="6" fill="#ffd24a">67'</text>
        <circle className="ts-blink" cx="126" cy="9" r="2.5" fill="#ff2d2d" />
        <text x="131" y="12" fontFamily="'Press Start 2P',monospace" fontSize="6" fill="#fff">LIVE</text>
        <g className="ts-blink">
          <rect x="98" y="85" width="54" height="15" rx="2" fill="#e0002d" />
          <text x="125" y="96" textAnchor="middle" fontFamily="'Press Start 2P',monospace" fontSize="8" fill="#fff">GOAL!</text>
        </g>
        <rect x="70" y="116" width="20" height="16" fill="#15151c" />
      </g>

      {/* ソファ背もたれ */}
      <rect x="44" y="470" width="272" height="96" rx="14" fill="#2e4a3c" />

      {/* ハート（上昇） */}
      <g fill="#ff5e86">
        <g transform="translate(176,452)"><g className="ts-h1"><rect x="0" y="2" width="10" height="8" /><rect x="-2" y="0" width="4" height="4" /><rect x="8" y="0" width="4" height="4" /><rect x="2" y="10" width="6" height="4" /></g></g>
        <g transform="translate(158,446)"><g className="ts-h2"><rect x="0" y="2" width="9" height="7" /><rect x="-2" y="0" width="4" height="4" /><rect x="7" y="0" width="4" height="4" /><rect x="2" y="9" width="5" height="3" /></g></g>
        <g transform="translate(196,450)"><g className="ts-h3"><rect x="0" y="2" width="8" height="6" /><rect x="-1" y="0" width="3" height="3" /><rect x="6" y="0" width="3" height="3" /><rect x="2" y="8" width="4" height="3" /></g></g>
      </g>

      {/* 志道（左・マッシュ） */}
      <g transform="translate(122,408)"><g className="ts-cheer">
        <rect x="-6" y="-10" width="13" height="48" fill="#2b6cc4" />
        <rect x="-9" y="-24" width="16" height="15" fill="#f0c090" />
        <rect x="45" y="-10" width="13" height="48" fill="#2b6cc4" />
        <rect x="45" y="-24" width="16" height="15" fill="#f0c090" />
        <rect x="7" y="0" width="38" height="6" fill="#241a16" />
        <rect x="2" y="5" width="48" height="15" fill="#241a16" />
        <rect x="6" y="20" width="40" height="6" fill="#241a16" />
        <rect x="18" y="25" width="16" height="8" fill="#f0c090" />
        <rect x="2" y="32" width="48" height="86" fill="#2b6cc4" />
      </g></g>

      {/* ひなた（右・ロングヘア） */}
      <g transform="translate(192,408)"><g className="ts-cheer ts-cheer--r">
        <rect x="-4" y="-8" width="13" height="46" fill="#e8728c" />
        <rect x="-7" y="-22" width="16" height="15" fill="#f0c090" />
        <rect x="43" y="-8" width="13" height="46" fill="#e8728c" />
        <rect x="43" y="-22" width="16" height="15" fill="#f0c090" />
        <rect x="6" y="32" width="40" height="86" fill="#e8728c" />
        <rect x="16" y="0" width="10" height="3" fill="#43301f" />
        <rect x="10" y="3" width="22" height="3" fill="#43301f" />
        <rect x="6" y="6" width="30" height="3" fill="#46331f" />
        <rect x="3" y="9" width="36" height="3" fill="#46331f" />
        <rect x="1" y="12" width="40" height="5" fill="#4a3624" />
        <rect x="0" y="17" width="42" height="8" fill="#4a3624" />
        <rect x="0" y="25" width="42" height="8" fill="#473321" />
        <rect x="0" y="33" width="42" height="8" fill="#473321" />
        <rect x="0" y="41" width="42" height="8" fill="#443019" />
        <rect x="1" y="49" width="41" height="8" fill="#443019" />
        <rect x="1" y="57" width="40" height="8" fill="#412d18" />
        <rect x="2" y="65" width="39" height="8" fill="#412d18" />
        <rect x="2" y="73" width="38" height="8" fill="#3e2b17" />
        <rect x="2" y="81" width="6" height="11" fill="#3a2715" />
        <rect x="9" y="81" width="6" height="17" fill="#3a2715" />
        <rect x="16" y="81" width="6" height="8" fill="#3a2715" />
        <rect x="23" y="81" width="6" height="15" fill="#3a2715" />
        <rect x="30" y="81" width="6" height="10" fill="#3a2715" />
        <rect x="36" y="81" width="5" height="14" fill="#3a2715" />
        <rect x="10" y="26" width="6" height="12" fill="#6e4d33" />
        <rect x="26" y="34" width="6" height="12" fill="#6e4d33" />
        <rect x="12" y="52" width="6" height="14" fill="#634528" />
        <rect x="24" y="60" width="5" height="12" fill="#634528" />
      </g></g>

      {/* ソファ前面 */}
      <rect x="36" y="528" width="288" height="78" rx="14" fill="#3a5a4a" />
      <rect x="36" y="505" width="30" height="100" rx="10" fill="#33503f" />
      <rect x="294" y="505" width="30" height="100" rx="10" fill="#33503f" />

      {/* ポップコーン */}
      <g transform="translate(166,556)">
        <rect x="-3" y="0" width="28" height="9" fill="#f6e7c5" />
        <rect x="0" y="9" width="22" height="22" fill="#e0002d" />
        <rect x="3" y="9" width="4" height="22" fill="#ffffff" />
        <rect x="11" y="9" width="4" height="22" fill="#ffffff" />
        <rect x="2" y="-5" width="5" height="6" fill="#f3dca8" />
        <rect x="9" y="-7" width="5" height="6" fill="#f3dca8" />
        <rect x="16" y="-5" width="5" height="6" fill="#f3dca8" />
      </g>
    </svg>
  )
}
