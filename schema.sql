-- Marathon Coach Database Schema

-- トレーニング記録テーブル
CREATE TABLE IF NOT EXISTS training_records (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL DEFAULT 'default_user',
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'running', 'weight', 'workout'
  distance DECIMAL(5,2), -- km
  duration INTEGER, -- 秒
  pace VARCHAR(10), -- "5:30/km"
  weight DECIMAL(4,1), -- kg
  workout_detail TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_date ON training_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_type ON training_records(type);

-- 画像アップロードテーブル
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL DEFAULT 'default_user',
  blob_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_user_images ON images(user_id, uploaded_at);

-- 敵撃破履歴テーブル
CREATE TABLE IF NOT EXISTS enemy_defeats (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL DEFAULT 'default_user',
  enemy_level INTEGER NOT NULL,
  experience_required INTEGER NOT NULL,
  defeated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_defeats ON enemy_defeats(user_id, defeated_at);

-- ボス目標テーブル
CREATE TABLE IF NOT EXISTS boss_goals (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL DEFAULT 'default_user',
  goal_name VARCHAR(255) NOT NULL,
  goal_type VARCHAR(50) NOT NULL, -- 'race', 'monthly', 'weekly'
  target_value DECIMAL(10,2), -- 42.195, 100
  target_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_goals ON boss_goals(user_id, completed);

-- AIコーチ会話履歴テーブル
CREATE TABLE IF NOT EXISTS conversation_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL DEFAULT 'default_user',
  role VARCHAR(20) NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_conversation ON conversation_history(user_id, created_at);

-- ユーザー設定テーブル
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE DEFAULT 'default_user',
  coach_character VARCHAR(50) DEFAULT 'balanced', -- 'strict', 'gentle', 'analytical', 'balanced'
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 初期データ（default_user用）
INSERT INTO user_settings (user_id, coach_character, notification_enabled)
VALUES ('default_user', 'balanced', true)
ON CONFLICT (user_id) DO NOTHING;
