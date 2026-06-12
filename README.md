# 君に届け（kimi-ni-todoke）

彼女（ひなた様）への、**FIFAワールドカップ2026連動サプライズアプリ**。
日本代表が勝つたびに、二人の思い出のドット絵動画＋メッセージ（プレゼント）が解禁され、コレクションになっていく。

- **本番URL**: https://kminitodoke.vercel.app/
- **管理ページ（志道さん専用）**: https://kminitodoke.vercel.app/admin.html
- **リポジトリ**: GitHub `shidosyacho-droid/kminitodoke`

---

## これは何

- 日本代表が**試合に勝つ** → 二人の思い出のプレゼント（ドット絵動画＋短いメッセージ）が**解禁**され、彼女のスマホに**通知**が届く。
- **負け／引き分け** → その日のメッセージは**封印**され、大会終了後にまとめて解禁（「本当は届けたかったメッセージ」）。
- 全8試合（グループ3＋決勝トーナメント5）＋**優勝・特別プレゼント**の**計9個**を事前制作。
- 試合の**約24時間前**にリマインド通知（「○月○日 ○:○○ に代表戦があります。応援しましょう！」）。
- 大会終了日（**7/20**）を過ぎると、未解禁のものも含めて**全部自動で解禁**。

---

## 体験の流れ（彼女の視点）

1. **約24h前** … リマインド通知が届く
2. **日本が勝つ** … 約10〜15分後に自動で解禁＋通知（「ひなた様、日本が勝利しました。/ 志道様からプレゼントが届いております。」）
3. アプリを開く … 思い出の動画＋メッセージ
4. **決勝トーナメント** … 相手・国旗・日程が試合前に自動で入る（PK勝ちも正しく解禁）
5. **大会終了（7/20）** … 負けた日・未開催も含め、全プレゼントが自動解禁
6. ハート／スタンプの反応は端末に保存され残る

---

## 使った技術・サービスと役割

| サービス / 道具 | 役割 | なぜ |
|---|---|---|
| **GitHub** | ソースコードの保管＋変更履歴。pushでVercelに自動デプロイ。GitHub Actions（cron）の実行場所 | 無料・履歴で安全・Vercel連携 |
| **Vercel** | ホスティング（HTTPS配信）＋サーバーレス関数（`/api/*`）の実行＋自動デプロイ | 無料枠・HTTPS標準（PWA/通知に必須）・サーバー管理不要 |
| **Vite + React + TypeScript** | アプリ本体（画面・演出・ロジック）を作り、配信用にビルド | 速い・安定・PWA化しやすい |
| **PWA** | アプリストアを通さず「ホーム画面に追加」でアプリ化（全画面・アイコン・通知） | 審査・費用・時間を回避 |
| **Upstash KV（Vercel KV / Redis）** | データベース＝記憶。試合スコア・勝敗、通知購読、リマインド済みフラグ | 無料・サーバーレス・シンプル |
| **football-data.org** | 外部APIで WC2026 の日程・スコア・勝者・相手を取得 | 無料枠でWCが取れる |
| **GitHub Actions（cron）** | 試合の時間帯などに自動で `/api/poll` を叩くタイマー | 無料・新規登録不要 |
| **Web Push（VAPID + Service Worker + web-push）** | 彼女のスマホへの通知（アプリを閉じてても届く） | 標準のプッシュ手段・無料 |
| **localStorage** | 端末内にハート/スタンプを保存 | サーバー不要・本人だけ見えればよい |

### 全体の流れ

```
[あなた] ──push──▶ [GitHub] ──自動デプロイ──▶ [Vercel]
                      │                          ├─ フロント(PWA) ──▶ [彼女のスマホ]
                      │                          └─ API関数 ─┬─▶ [Upstash KV(記憶)]
                      │                                       └─▶ [football-data.org(結果)]
                      └─ GitHub Actions(時計) ──定期的に──▶ Vercel /api/poll
                                                              └─ 勝ち検知 ──Web Push──▶ [彼女のスマホに通知]
```

---

## 仕組み（動作）

- **自動**: GitHub Actions のcronが `/api/poll` を叩く → football-data.org から日本の試合結果を取得 → KVに保存 → 勝てば解禁＋通知。決勝Tの相手・国旗・日程も試合前に反映。24時間前リマインドも同じ仕組みに相乗り。
- **勝敗判定**: `score.winner`（PK戦込みの勝者）で判定。スコアは「日本 2-1 オランダ」形式で表示。
- **手動（保険）**: `/admin.html` でスコアを入力（「PK勝ち」チェックあり）。手動入力は `manual` フラグが付き、**自動取得が上書きしない**。
- **本人プレビュー**: URLに `?preview` を付けると全プレゼントが解禁表示（中身確認用）。彼女の通常URL／インストール版（`start_url="/"`）には**影響しない**。
- **大会終了の自動解禁**: `src/config.ts` の `WC_END_DATE`（2026-07-20 JST）を過ぎると、封印・未開催も含め全解禁。

---

## 運用・設定

### 環境変数（値はVercel/GitHubのSecretsに保存。リポジトリには置かない）

- **Vercel（Settings → Environment Variables）**: `ADMIN_SECRET` / `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` / `FOOTBALL_API_TOKEN` / `KV_*`（Upstash連携で自動追加）
- **GitHub（Settings → Secrets and variables → Actions）**: `ADMIN_SECRET`（cronが `/api/poll` を叩くため）
- フロントで使うVAPID**公開**鍵は `src/config.ts`（公開情報なのでコードに記載）
- ※ env varを追加・変更したら**再デプロイが必要**（反映されない時はこれ）

### 管理ページの使い方

`https://kminitodoke.vercel.app/admin.html` を開く → 管理キー（`ADMIN_SECRET`）を1回入力（端末に保存）→ 試合のスコアを入れて「勝敗を確定」。PK勝ちはチェックを入れる。

---

## ファイル構成（主要）

```
web/
├─ src/                     フロント（React）
│  ├─ App.tsx               画面の切替・状態管理・KVから結果取得・リアクション保存
│  ├─ components/           画面部品（Title/Home/Collection/MessageScene/NotifyButton 等）
│  ├─ data/matches.ts       プレゼント9個の中身（タイトル・メッセージ・動画）
│  ├─ lib/                  push.ts(通知購読) / state.ts / sfx.ts / celebrate.ts
│  └─ config.ts             表示名・WC_END_DATE・VAPID公開鍵
├─ api/                     Vercelのサーバーレス関数
│  ├─ state.js              現在の結果を返す（アプリが起動時に取得）
│  ├─ admin.js              手動でスコア入力（志道さん専用・要ADMIN_SECRET）
│  ├─ poll.js               自動取得・決勝T反映・24h前リマインド
│  ├─ subscribe.js          通知の購読を保存
│  └─ _lib.js               KV読み書き・プッシュ送信・通知文面
├─ public/                  静的ファイル
│  ├─ scenes/               プレゼントの動画・画像・タイトル画像
│  ├─ admin.html            手動管理ページ
│  ├─ sw.js                 Service Worker（通知の受信）
│  ├─ manifest.webmanifest  PWA設定
│  └─ app-icon / apple-touch-icon  アプリアイコン
└─ .github/workflows/poll.yml   自動cron（試合の時間帯＋3時間おき）
```

---

## 残タスク・メモ

- **決勝トーナメントのcron窓**（`.github/workflows/poll.yml`）は、日本が勝ち上がって日程が決まったら追記する。
- 決勝Tの**ステージ名**（APIで R32 が `LAST_32` か等）は、KO戦がAPIに出た時点で `/api/poll?debug=1` で確認し、必要なら `api/poll.js` の `STAGE_TO_ID` を調整。
- 設計の前提: **PWA採用（App Store回避）／全部無料枠／単一ユーザー（彼女）向けの個人アプリ**。

## 制作の流れ（記録）

1. 企画・仕様（プレゼント9個の構成、勝敗連動の体験設計）
2. プレゼント9個の制作（思い出 → AIでドット絵画像 → image-to-videoで動画化）
3. UI/UX（タイトル／ローディング／ホーム／コレクション／メッセージ画面、ドット絵・RPG風）
4. 本番化（実日程の反映・PWA化・Vercelデプロイ）
5. システム（自動スコア取得＋手動補助＋プッシュ通知＋24h前リマインド＋決勝T自動反映）
6. 品質改善（PK勝ち判定の修正・リアクション保存・cron発火確認）
