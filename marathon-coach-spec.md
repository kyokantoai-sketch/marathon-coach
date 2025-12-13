# マラソンコーチPWA アプリ 全体構成書

## 1. プロジェクト概要

### 1.1 目的
マラソントレーニングを継続するための個人用PWAアプリ。スクショを放り込むだけでデータが蓄積され、AIコーチが永続的なコンテキストで対話・分析・予測を行う。

### 1.2 ターゲットユーザー
- 第一優先：開発者本人（奥 秀輝）
- 将来的：note読者（1000人以上）への展開可能性

### 1.3 開発期間
Phase 1（MVP）: 2週間程度
Phase 2-3: 五島マラソン（3月）までに順次実装

---

## 2. 主要機能

### 2.1 Phase 1 - MVP（最小実装）
1. **スクショアップロード**
   - 複数枚同時アップロード対応（10枚以上）
   - 画像プレビュー表示
   - バッチ処理（5枚ずつ自動分割）

2. **データ自動抽出（OCR）**
   - Gemini 2.0 Flashで画像解析
   - 抽出項目：
     - 日付
     - 走行距離（km）
     - 走行時間
     - ペース
     - 体重（kg）
     - 筋トレ内容

3. **データ蓄積・表示**
   - Vercel Postgresに保存
   - 時系列グラフ表示（Recharts使用）
   - 週次・月次サマリー

4. **日付変換機能**
   - 相対日付（今日、昨日、先週）→ 絶対日付
   - Geminiで自然言語処理
   - note投稿用フォーマット生成

### 2.2 Phase 2 - ゲーミフィケーション
1. **経験値システム**
   - 走行距離 = 経験値（1km = 100exp）
   - 経験値バー表示
   - レベルアップ演出

2. **敵システム**
   - 一定経験値で敵を倒せる
   - 倒した敵の履歴表示
   - トロフィー獲得

3. **ボス戦**
   - 目標設定（五島マラソン、月100kmなど）
   - AI予測勝率表示
   - カウントダウン表示

### 2.3 Phase 3 - AIコーチ
1. **永続的コンテキスト**
   - 全トレーニング履歴を記憶
   - 過去の出来事参照可能
   - 引き継ぎ不要

2. **対話機能**
   - 自然言語での振り返り
   - データに基づくアドバイス
   - キャラクター設定変更可能

3. **週次レポート生成**
   - 自動で週の振り返り作成
   - note投稿用コンテンツ生成

---

## 3. 技術スタック

### 3.1 フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 15.x | Reactフレームワーク |
| TypeScript | 5.x | 型安全性 |
| Tailwind CSS | 3.x | スタイリング |
| Recharts | 2.x | グラフ描画 |
| next-pwa | 5.x | PWA化 |

### 3.2 バックエンド
| 技術 | 用途 |
|------|------|
| Next.js API Routes | サーバーサイドAPI |
| Vercel | ホスティング・デプロイ |
| Vercel Postgres | データベース |
| Vercel Blob | 画像ストレージ |

### 3.3 AI・機械学習
| API | モデル | 用途 |
|-----|--------|------|
| Google Gemini API | 2.0 Flash | OCR、対話、予測 |

### 3.4 開発ツール
- Codex CLI（OpenAI）：コード生成支援
- Claude（Anthropic）：設計・相談

---

## 4. システム設計

### 4.1 アーキテクチャ図
```
┌─────────────┐
│   ユーザー   │
│  (スマホ)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│      Next.js PWA (Vercel)    │
│  ┌──────────────────────┐   │
│  │  UI Components       │   │
│  │  - Upload Page       │   │
│  │  - Graph Page        │   │
│  │  - Coach Chat        │   │
│  │  - Enemy/Boss Page   │   │
│  └──────────────────────┘   │
└──────────┬──────────────────┘
           │
           ▼
    ┌─────────────┐
    │  API Routes │
    └──────┬──────┘
           │
    ┌──────┴──────────┬──────────────┐
    ▼                 ▼              ▼
┌─────────┐    ┌──────────┐   ┌─────────┐
│ Vercel  │    │ Vercel   │   │ Gemini  │
│Postgres │    │  Blob    │   │   API   │
│   DB    │    │ Storage  │   │         │
└─────────┘    └──────────┘   └─────────┘
```

### 4.2 データベース設計

#### training_records テーブル
```sql
CREATE TABLE training_records (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'running', 'weight', 'workout'
  distance DECIMAL(5,2), -- km
  duration INTEGER, -- 秒
  pace VARCHAR(10), -- "5:30/km"
  weight DECIMAL(4,1), -- kg
  workout_detail TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_date ON training_records(user_id, date);
```

#### images テーブル
```sql
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  blob_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);
```

#### enemy_defeats テーブル
```sql
CREATE TABLE enemy_defeats (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  enemy_level INTEGER NOT NULL,
  experience_required INTEGER NOT NULL,
  defeated_at TIMESTAMP DEFAULT NOW()
);
```

#### boss_goals テーブル
```sql
CREATE TABLE boss_goals (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  goal_name VARCHAR(255) NOT NULL, -- "五島マラソン"
  goal_type VARCHAR(50) NOT NULL, -- "race", "monthly"
  target_value DECIMAL(10,2), -- 42.195, 100
  target_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### conversation_history テーブル
```sql
CREATE TABLE conversation_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_conversation ON conversation_history(user_id, created_at);
```

### 4.3 API設計

#### POST /api/upload
スクショアップロード
```typescript
Request:
{
  files: File[]
}

Response:
{
  success: boolean
  uploadedUrls: string[]
  jobId: string
}
```

#### POST /api/ocr
画像からデータ抽出
```typescript
Request:
{
  imageUrls: string[]
}

Response:
{
  success: boolean
  extractedData: {
    date: string
    distance?: number
    weight?: number
    workoutDetail?: string
  }[]
}
```

#### GET /api/stats
統計データ取得
```typescript
Request:
{
  startDate: string
  endDate: string
}

Response:
{
  totalDistance: number
  totalWorkouts: number
  averageWeight: number
  weeklyData: {
    week: string
    distance: number
    weight: number
  }[]
}
```

#### POST /api/coach
AIコーチ対話
```typescript
Request:
{
  message: string
  characterType?: string // "strict" | "gentle" | "analytical"
}

Response:
{
  reply: string
  context: string[]
}
```

#### GET /api/enemy/status
経験値・敵ステータス
```typescript
Response:
{
  currentExp: number
  nextEnemyExp: number
  level: number
  defeatedEnemies: number
}
```

#### GET /api/boss/status
ボス戦ステータス
```typescript
Response:
{
  goals: {
    name: string
    progress: number // %
    winProbability: number // %
    daysRemaining: number
  }[]
}
```

---

## 5. UI/UX設計

### 5.1 画面構成（スマホ横スワイプ）

```
┌───────────┬───────────┬───────────┐
│  日常の敵  │   ホーム   │  ボス戦   │
│           │           │           │
│ ← swipe   │           │  swipe →  │
└───────────┴───────────┴───────────┘
```

### 5.2 ホーム画面
- 今週のグラフ（走行距離、体重）
- スクショアップロードボタン（大きく）
- AIコーチチャット起動ボタン
- クイック統計表示

### 5.3 日常の敵画面（左スワイプ）
- 現在の経験値バー
- 次の敵まで「あと○km」
- 倒した敵の履歴リスト
- 今週の進捗サマリー

### 5.4 ボス戦画面（右スワイプ）
- 五島マラソンカウントダウン
- 勝率表示（AI予測）
- 月間目標進捗
- ボス撃破履歴

### 5.5 スクショアップロード画面
- ドラッグ&ドロップエリア
- 複数枚プレビュー
- アップロード進捗表示
- 処理完了通知

### 5.6 グラフ画面
- 週次グラフ（デフォルト）
- 月次グラフ
- 全期間グラフ
- フィルター機能

### 5.7 AIコーチ画面
- チャット形式
- キャラクター選択（厳しめ/優しめ/分析型）
- 過去の会話履歴
- 振り返り機能

---

## 6. PWA設定

### 6.1 manifest.json
```json
{
  "name": "Marathon Coach",
  "short_name": "MCoach",
  "description": "AI-powered marathon training assistant",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 6.2 PWA機能
- オフライン対応（基本画面のみ）
- ホーム画面追加
- プッシュ通知（Phase 2以降）
  - 「今週まだ記録なし」
  - 「ボス戦まであと7日」

---

## 7. コスト試算

### 7.1 月額コスト（個人利用）
| サービス | 用途 | 想定コスト |
|---------|------|-----------|
| Vercel Hosting | 無料枠 | ¥0 |
| Vercel Postgres | 無料枠 | ¥0 |
| Vercel Blob | 無料枠 | ¥0 |
| Gemini API | OCR + 対話 | ¥300-500 |
| **合計** | | **¥300-500** |

### 7.2 スケール時のコスト（1000ユーザー）
| サービス | 想定コスト |
|---------|-----------|
| Vercel Pro | ¥2,500/月 |
| Vercel Postgres | ¥10,000/月 |
| Vercel Blob | ¥5,000/月 |
| Gemini API | ¥50,000-100,000/月 |
| **合計** | **¥67,500-117,500/月** |

※スケール時は有料化必須

---

## 8. セキュリティ

### 8.1 認証
- Phase 1: 認証なし（自分専用）
- Phase 2以降: Vercel Auth（Google OAuth）

### 8.2 データ保護
- HTTPS通信
- 環境変数でAPIキー管理
- 画像は非公開Blob

### 8.3 個人情報
- 体重・健康データは個人情報として扱う
- 将来的な一般公開時は利用規約・プライバシーポリシー必須

---

## 9. 開発スケジュール

### Week 1-2: Phase 1 MVP
- [x] プロジェクト設計（←今ココ）
- [ ] プロジェクトセットアップ
- [ ] スクショアップロード機能
- [ ] Gemini OCR実装
- [ ] データベース実装
- [ ] グラフ表示実装
- [ ] 日付変換機能
- [ ] PWA化
- [ ] 自分で使い始める

### Week 3-4: Phase 2 ゲーミフィケーション
- [ ] 経験値システム
- [ ] 敵システム
- [ ] ボス戦機能
- [ ] スワイプUI実装
- [ ] note記事（アプリ開発中）

### Week 5-12: Phase 3 AIコーチ
- [ ] 永続コンテキスト実装
- [ ] 対話機能
- [ ] 週次レポート自動生成
- [ ] キャラクター設定
- [ ] 五島マラソンまで使い込み
- [ ] note連載継続

---

## 10. 今後の拡張可能性

### 10.1 機能追加
- 食事記録（カロリー計算）
- 睡眠記録
- 心拍数連携（Garmin API）
- コミュニティ機能（他ユーザーとの比較）
- ソーシャルシェア（Xへ自動投稿）

### 10.2 収益化（Phase 4以降）
- 月額サブスク（¥500/月）
- プレミアム機能
  - 詳細なAI分析
  - カスタムボス設定
  - データエクスポート
- note記事からの誘導

### 10.3 技術的拡張
- React Nativeでネイティブアプリ化
- Apple Watch / Wear OS対応
- オフライン完全対応

---

## 11. 成功指標（KPI）

### Phase 1（自分用）
- ✅ 毎週スクショアップロード継続
- ✅ データ抽出精度 80%以上
- ✅ note記事で開発過程を共有

### Phase 2-3（五島マラソンまで）
- ✅ 五島マラソン完走
- ✅ note読者反応（コメント、いいね）
- ✅ アプリ継続使用（3ヶ月以上）

### Phase 4（一般公開時）
- 初月ユーザー数：100人
- 有料転換率：5-10%
- 継続率（3ヶ月）：50%以上

---

## 12. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| Gemini API料金高騰 | 高 | 使用量モニタリング、代替API検討 |
| OCR精度低い | 中 | プロンプト改善、手動補正機能 |
| 継続使用しない | 高 | UI/UX改善、ゲーミフィケーション強化 |
| Vercel無料枠超過 | 低 | 有料プラン移行 |
| データロスト | 中 | 定期バックアップ、エクスポート機能 |

---

## 13. 参考資料

### 技術ドキュメント
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- Gemini API: https://ai.google.dev/docs
- Recharts: https://recharts.org/
- next-pwa: https://github.com/shadowwalker/next-pwa

### デザイン参考
- Nike Run Club
- Strava
- MyFitnessPal
- Habitica（ゲーミフィケーション）

---

## 14. まとめ

このPWAアプリは、奥さんのマラソントレーニングを支援しつつ、note連載のコンテンツ化も可能な実用的プロジェクトです。

**成功のポイント**：
1. 自分が毎日使いたくなる設計
2. データ入力の手間を最小化（スクショ放り込むだけ）
3. ゲーミフィケーションでモチベーション維持
4. 開発過程そのものをコンテンツ化

**Next Action**：
プロジェクトセットアップから開始し、Phase 1のMVPを2週間で完成させる。

---

作成日: 2025-12-13
バージョン: 1.0
