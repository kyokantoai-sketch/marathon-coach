# 🚀 クイックスタート

## 最速で動かす（5分）

### 1. プロジェクトのセットアップ

```bash
# プロジェクトディレクトリに移動
cd marathon-coach

# 依存パッケージをインストール
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成：

```bash
cp .env.local.template .env.local
```

`.env.local`を編集して、最低限以下を設定：

```env
GEMINI_API_KEY=your_api_key_here
```

**Gemini API Keyの取得方法：**
1. https://makersuite.google.com/app/apikey にアクセス
2. 「Create API Key」をクリック
3. コピーして`.env.local`に貼り付け

### 3. 開発サーバーを起動

```bash
npm run dev
```

http://localhost:3000 を開く

### 4. 動作確認

- ✅ ホーム画面が表示される
- ✅ 左右にスワイプして画面切り替え
- ✅ （データベースは後で設定）

---

## 📊 データベースのセットアップ（Vercel）

### Option A: Vercel CLIで自動セットアップ（推奨）

```bash
# Vercel CLIをインストール
npm install -g vercel

# Vercelにログイン
vercel login

# プロジェクトをデプロイ
vercel

# Postgres Storageを作成
vercel storage create postgres

# Blob Storageを作成
vercel storage create blob

# 環境変数を取得
vercel env pull .env.local
```

### Option B: Vercel Dashboardで手動セットアップ

1. https://vercel.com にアクセス
2. プロジェクトを作成
3. Storage → Create Database → Postgres
4. Storage → Create Database → Blob
5. 環境変数をコピーして`.env.local`に追加

### データベースの初期化

Vercel Postgresダッシュボードで：
1. SQL Queryセクションを開く
2. `schema.sql`の内容をコピー＆ペースト
3. 実行

または：

```bash
psql $POSTGRES_URL < schema.sql
```

---

## 🧪 動作テスト

### 1. スクショアップロードのテスト

1. http://localhost:3000/upload にアクセス
2. ランニングアプリのスクショをアップロード
3. データが抽出されることを確認

### 2. AIコーチのテスト

1. http://localhost:3000/coach にアクセス
2. 「今日は5km走った」とメッセージ送信
3. AIからの返信を確認

### 3. ゲーミフィケーションのテスト

1. ホーム画面で左スワイプ（敵画面）
2. 右スワイプ（ボス画面）
3. 「+ 新しい目標」で五島マラソンを設定

---

## 📱 PWAとして使う

### スマホにインストール

1. スマホのブラウザ（Chrome/Safari）でアクセス
2. メニューから「ホーム画面に追加」
3. アイコンをタップして起動

### デスクトップにインストール

1. Chrome/Edgeでアクセス
2. アドレスバーの「インストール」アイコンをクリック

---

## 🚢 本番環境へデプロイ

```bash
# 本番デプロイ
vercel --prod
```

デプロイ完了後、URLが発行されます。

---

## ⚠️ トラブルシューティング

### エラー: Gemini API Key is not set
→ `.env.local`にAPIキーを設定してください

### エラー: Database connection failed
→ Vercel Postgresを作成して、環境変数を設定してください

### エラー: Blob upload failed
→ Vercel Blobを作成して、環境変数を設定してください

### 画面が真っ白
→ `npm run dev`を再起動してください

---

## 📚 次のステップ

- [ ] 自分のランニングデータをアップロード
- [ ] AIコーチと対話して使い勝手を確認
- [ ] ボス目標を設定（五島マラソンなど）
- [ ] 毎日使ってフィードバック
- [ ] noteに開発過程を投稿

---

**ヘルプが必要？**
- README.mdを確認
- marathon-coach-spec.mdで全体設計を確認
