// lib/db.ts
import { sql } from '@vercel/postgres';

const DEFAULT_USER_ID = 'default_user';

/**
 * トレーニング記録を保存
 */
export async function saveTrainingRecord(data: {
  date: string;
  type: string;
  distance?: number;
  duration?: number;
  pace?: string;
  weight?: number;
  workout_detail?: string;
  user_id?: string;
}) {
  const userId = data.user_id || DEFAULT_USER_ID;

  const result = await sql`
    INSERT INTO training_records 
    (user_id, date, type, distance, duration, pace, weight, workout_detail)
    VALUES 
    (${userId}, ${data.date}, ${data.type}, ${data.distance}, ${data.duration}, 
     ${data.pace}, ${data.weight}, ${data.workout_detail})
    RETURNING *
  `;

  return result.rows[0];
}

/**
 * 画像記録を保存
 */
export async function saveImage(blobUrl: string, userId: string = DEFAULT_USER_ID) {
  const result = await sql`
    INSERT INTO images (user_id, blob_url, processed)
    VALUES (${userId}, ${blobUrl}, false)
    RETURNING *
  `;

  return result.rows[0];
}

/**
 * 画像を処理済みにマーク
 */
export async function markImageAsProcessed(imageId: number) {
  await sql`
    UPDATE images 
    SET processed = true 
    WHERE id = ${imageId}
  `;
}

/**
 * 期間内のトレーニング記録を取得
 */
export async function getTrainingRecords(
  startDate: string,
  endDate: string,
  userId: string = DEFAULT_USER_ID
) {
  const result = await sql`
    SELECT * FROM training_records
    WHERE user_id = ${userId}
    AND date BETWEEN ${startDate} AND ${endDate}
    ORDER BY date ASC
  `;

  return result.rows;
}

/**
 * 統計情報を取得
 */
export async function getStats(userId: string = DEFAULT_USER_ID) {
  // 総走行距離
  const totalDistanceResult = await sql`
    SELECT COALESCE(SUM(distance), 0) as total_distance
    FROM training_records
    WHERE user_id = ${userId} AND type = 'running'
  `;

  // 今週の走行距離
  const weeklyDistanceResult = await sql`
    SELECT COALESCE(SUM(distance), 0) as weekly_distance
    FROM training_records
    WHERE user_id = ${userId} 
    AND type = 'running'
    AND date >= DATE_TRUNC('week', CURRENT_DATE)
  `;

  // 最新の体重
  const latestWeightResult = await sql`
    SELECT weight, date
    FROM training_records
    WHERE user_id = ${userId} AND type = 'weight'
    ORDER BY date DESC
    LIMIT 1
  `;

  // 継続日数（過去7日間のトレーニング日数）
  const continuousDaysResult = await sql`
    SELECT COUNT(DISTINCT date) as days
    FROM training_records
    WHERE user_id = ${userId}
    AND date >= CURRENT_DATE - INTERVAL '7 days'
  `;

  return {
    totalDistance: parseFloat(totalDistanceResult.rows[0].total_distance),
    weeklyDistance: parseFloat(weeklyDistanceResult.rows[0].weekly_distance),
    recentWeight: latestWeightResult.rows[0]?.weight || null,
    continuousDays: parseInt(continuousDaysResult.rows[0].days),
  };
}

/**
 * 週次データを取得（グラフ用）
 */
export async function getWeeklyData(
  weeks: number = 4,
  userId: string = DEFAULT_USER_ID
) {
  const result = await sql`
    SELECT 
      DATE_TRUNC('week', date) as week,
      SUM(CASE WHEN type = 'running' THEN distance ELSE 0 END) as distance,
      AVG(CASE WHEN type = 'weight' THEN weight ELSE NULL END) as avg_weight
    FROM training_records
    WHERE user_id = ${userId}
    AND date >= CURRENT_DATE - INTERVAL '${weeks} weeks'
    GROUP BY DATE_TRUNC('week', date)
    ORDER BY week ASC
  `;

  return result.rows.map((row) => ({
    week: row.week,
    distance: parseFloat(row.distance || 0),
    weight: row.avg_weight ? parseFloat(row.avg_weight) : null,
  }));
}

/**
 * 経験値を計算
 */
export async function getExperience(userId: string = DEFAULT_USER_ID) {
  const result = await sql`
    SELECT COALESCE(SUM(distance), 0) as total_distance
    FROM training_records
    WHERE user_id = ${userId} AND type = 'running'
  `;

  const totalDistance = parseFloat(result.rows[0].total_distance);
  const experience = Math.floor(totalDistance * 100); // 1km = 100exp

  return {
    experience,
    level: Math.floor(experience / 1000), // 1000expで1レベル
    nextLevelExp: (Math.floor(experience / 1000) + 1) * 1000,
  };
}

/**
 * 敵撃破を記録
 */
export async function defeatEnemy(
  enemyLevel: number,
  experienceRequired: number,
  userId: string = DEFAULT_USER_ID
) {
  const result = await sql`
    INSERT INTO enemy_defeats (user_id, enemy_level, experience_required)
    VALUES (${userId}, ${enemyLevel}, ${experienceRequired})
    RETURNING *
  `;

  return result.rows[0];
}

/**
 * 敵撃破履歴を取得
 */
export async function getEnemyDefeats(userId: string = DEFAULT_USER_ID) {
  const result = await sql`
    SELECT * FROM enemy_defeats
    WHERE user_id = ${userId}
    ORDER BY defeated_at DESC
  `;

  return result.rows;
}

/**
 * ボス目標を作成
 */
export async function createBossGoal(data: {
  goal_name: string;
  goal_type: string;
  target_value: number;
  target_date: string;
  user_id?: string;
}) {
  const userId = data.user_id || DEFAULT_USER_ID;

  const result = await sql`
    INSERT INTO boss_goals (user_id, goal_name, goal_type, target_value, target_date)
    VALUES (${userId}, ${data.goal_name}, ${data.goal_type}, ${data.target_value}, ${data.target_date})
    RETURNING *
  `;

  return result.rows[0];
}

/**
 * アクティブなボス目標を取得
 */
export async function getActiveBossGoals(userId: string = DEFAULT_USER_ID) {
  const result = await sql`
    SELECT * FROM boss_goals
    WHERE user_id = ${userId}
    AND completed = false
    AND (target_date IS NULL OR target_date >= CURRENT_DATE)
    ORDER BY target_date ASC
  `;

  return result.rows;
}

/**
 * ボス目標を完了
 */
export async function completeBossGoal(goalId: number) {
  await sql`
    UPDATE boss_goals 
    SET completed = true 
    WHERE id = ${goalId}
  `;
}

/**
 * 会話履歴を保存
 */
export async function saveConversation(
  role: string,
  content: string,
  userId: string = DEFAULT_USER_ID
) {
  const result = await sql`
    INSERT INTO conversation_history (user_id, role, content)
    VALUES (${userId}, ${role}, ${content})
    RETURNING *
  `;

  return result.rows[0];
}

/**
 * 会話履歴を取得
 */
export async function getConversationHistory(
  limit: number = 20,
  userId: string = DEFAULT_USER_ID
) {
  const result = await sql`
    SELECT * FROM conversation_history
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return result.rows.reverse(); // 古い順に並び替え
}

/**
 * ユーザー設定を取得
 */
export async function getUserSettings(userId: string = DEFAULT_USER_ID) {
  const result = await sql`
    SELECT * FROM user_settings
    WHERE user_id = ${userId}
  `;

  return result.rows[0] || {
    coach_character: 'balanced',
    notification_enabled: true,
  };
}

/**
 * ユーザー設定を更新
 */
export async function updateUserSettings(
  settings: {
    coach_character?: string;
    notification_enabled?: boolean;
  },
  userId: string = DEFAULT_USER_ID
) {
  const result = await sql`
    UPDATE user_settings
    SET 
      coach_character = COALESCE(${settings.coach_character}, coach_character),
      notification_enabled = COALESCE(${settings.notification_enabled}, notification_enabled),
      updated_at = NOW()
    WHERE user_id = ${userId}
    RETURNING *
  `;

  return result.rows[0];
}
