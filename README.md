# Marathon Coach PWA

AI搭載のマラソントレーニングアシスタントアプリ（PWA）

## 🚀 機能

### Phase 1 (MVP)
- ✅ スクショ一括アップロード（10枚以上対応）
- ✅ Gemini AIによる自動データ抽出
  - 走行距離・時間・ペース
  - 体重
  - 筋トレ内容
- ✅ データ自動蓄積（PostgreSQL）
- ✅ グラフ表示（週次・月次）
- ✅ PWA対応（ホーム画面追加可能）

### Phase 2 (ゲーミフィケーション)
- ✅ 経験値システム（1km = 100exp）
- ✅ 敵撃破システム
- ✅ ボス戦（目標設定 + AI勝率予測）
- ✅ スワイプUI（3画面切り替え）

### Phase 3 (AIコーチ)
- ✅ 永続的コンテキスト対話
- ✅ キャラクター設定切り替え
- ✅ トレーニングアドバイス

## 📦 技術スタック

- **フロントエンド**: Next.js 15, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes, Vercel
- **データベース**: Vercel Postgres
- **ストレージ**: Vercel Blob
- **AI**: Google Gemini 2.0 Flash
- **グラフ**: Recharts
- **PWA**: next-pwa

## 🛠️ セットアップ

### 1. 依存パッケージのインストール

```bash
# リポジトリをクローン（または作成）
npx create-next-app@latest marathon-coach --typescript --tailwind --app --no-src-dir

cd marathon-coach

# 依存パッケージインストール
npm install @google/generative-ai recharts next-pwa @vercel/postgres @vercel/blob date-fns zustand
npm install -D @types/node
```

### 2. 環境変数の設定

`.env.local`ファイルを作成：

```env
# Gemini API Key（必須）
GEMINI_API_KEY=your_gemini_api_key_here

# Vercel環境変数（Vercelデプロイ後、自動生成される）
POSTGRES_URL=
BLOB_READ_WRITE_TOKEN=
```

### 3. Gemini API Keyの取得

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. 「Create API Key」をクリック
3. 生成されたキーを`.env.local`に設定

### 4. データベースのセットアップ（Vercel）

#### Option A: Vercel CLIを使用

```bash
npm install -g vercel

# Vercelにログイン
vercel login

# プロジェクトをリンク
vercel link

# Postgres Storageを追加
vercel storage create postgres

# 環境変数を自動取得
vercel env pull .env.local
```

#### Option B: Vercel Dashboardから

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクトを作成
3. Storage → Create Database → Postgres
4. 環境変数をコピーして`.env.local`に貼り付け

### 5. データベースの初期化

Vercel Postgresダッシュボードで`schema.sql`を実行：

```bash
# または、ローカルから実行
psql $POSTGRES_URL < schema.sql
```

### 6. ローカル開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

## 📱 PWAインストール

### スマホから

1. ブラウザ（Chrome/Safari）でアプリにアクセス
2. メニューから「ホーム画面に追加」を選択
3. インストール完了

### デスクトップから

1. Chrome/Edgeでアプリにアクセス
2. アドレスバーの「インストール」アイコンをクリック
3. インストール完了

## 🚢 デプロイ

### Vercelへデプロイ

```bash
# 初回デプロイ
vercel

# 本番環境へデプロイ
vercel --prod
```

### または、GitHub連携で自動デプロイ

1. GitHubリポジトリにプッシュ
2. Vercelダッシュボードで「Import Project」
3. 環境変数を設定
4. デプロイ完了

## 📊 使い方

### 1. スクショアップロード
1. ホーム画面の「📸 スクショをアップロード」をタップ
2. ランニングアプリ、体重計、筋トレアプリのスクショを選択
3. 10枚以上でもOK、一括アップロード
4. 自動でデータが抽出され、グラフに反映

### 2. データ確認
- ホーム画面で今週の統計を確認
- 「📊 詳細グラフを見る」で過去データを確認
- 週次・月次の推移をグラフで表示

### 3. ゲーミフィケーション
- **左スワイプ**: 日常の敵（経験値システム）
  - 1km走ると100exp獲得
  - 1000expで敵を撃破
- **右スワイプ**: ボス戦（目標設定）
  - 五島マラソンなどの目標を設定
  - AI予測で勝率を表示

### 4. AIコーチ
1. 「💬 AIコーチと話す」をタップ
2. キャラクター選択（厳しめ/優しめ/分析型/バランス）
3. トレーニングの相談、振り返り、アドバイス
4. 過去の会話を記憶しているので引き継ぎ不要

## 💰 コスト

### 個人利用（月額）
- Vercel Hobby: 無料
- Gemini API: 約300-500円
- **合計: 約300-500円/月**

### スケール時（1000ユーザー）
- Vercel Pro: 約2,500円
- Vercel Postgres: 約10,000円
- Gemini API: 約50,000-100,000円
- **合計: 約67,500-117,500円/月**

## 🔒 セキュリティ

- HTTPS通信
- 環境変数でAPIキー管理
- 画像は非公開Blob
- Phase 1は認証なし（自分専用）
- Phase 2以降でVercel Auth（Google OAuth）実装予定

## 📝 今後の予定

### Phase 1 完了（✅）
- スクショアップロード
- データ抽出・蓄積
- グラフ表示
- ゲーミフィケーション基礎
- AIコーチ対話

### Phase 2（予定）
- プッシュ通知
- 週次レポート自動生成
- note投稿連携

### Phase 3（予定）
- ユーザー認証
- コミュニティ機能
- 有料化（月額サブスク）

## 🐛 トラブルシューティング

### Gemini APIエラー
- APIキーが正しく設定されているか確認
- APIキーが有効化されているか確認
- クォータ制限に達していないか確認

### データベース接続エラー
- Vercel Postgresが作成されているか確認
- 環境変数が正しく設定されているか確認
- `schema.sql`が実行されているか確認

### 画像アップロードエラー
- Vercel Blobが設定されているか確認
- ファイルサイズが4.5MB以下か確認

## 📄 ライセンス

MIT License

## 👤 作成者

奥 秀輝 (@ThanksLab)

---

**Note**: このアプリは個人用として開発されました。五島つばきマラソン完走を目指して！🏃‍♂️
