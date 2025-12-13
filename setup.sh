#!/bin/bash

# Marathon Coach PWA セットアップスクリプト

echo "🏃 Marathon Coach PWA セットアップ開始..."

# Next.jsプロジェクト作成
echo "📦 Next.jsプロジェクト作成中..."
npx create-next-app@latest marathon-coach \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd marathon-coach

# 必要なパッケージインストール
echo "📚 依存パッケージインストール中..."
npm install @google/generative-ai
npm install recharts
npm install next-pwa
npm install @vercel/postgres
npm install @vercel/blob
npm install date-fns
npm install zustand

# 開発用パッケージ
npm install -D @types/node

echo "✅ セットアップ完了！"
echo ""
echo "次のステップ:"
echo "1. cd marathon-coach"
echo "2. .env.local ファイルを作成して環境変数を設定"
echo "3. npm run dev でローカル起動"
