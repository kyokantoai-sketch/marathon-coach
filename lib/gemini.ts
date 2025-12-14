// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * スクショからトレーニングデータを抽出
 */
export async function extractTrainingData(imageBase64: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
以下の画像からトレーニングデータを抽出してください。
画像にはランニングアプリ、体重計、筋トレアプリのスクショが含まれている可能性があります。

抽出する項目：
- date: 日付（YYYY-MM-DD形式）
- type: データタイプ（"running", "weight", "workout"のいずれか）
- distance: 走行距離（km、数値のみ）
- duration: 走行時間（秒、数値のみ）
- pace: ペース（"5:30/km"のような形式）
- weight: 体重（kg、数値のみ）
- workout_detail: 筋トレの詳細（文字列）

JSON形式で返してください。データが存在しない項目はnullにしてください。
複数のデータが含まれている場合は配列で返してください。

例：
{
  "data": [
    {
      "date": "2025-12-13",
      "type": "running",
      "distance": 10.5,
      "duration": 3150,
      "pace": "5:00/km",
      "weight": null,
      "workout_detail": null
    }
  ]
}
`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: 'image/png',
        data: imageBase64,
      },
    },
  ]);

  const response = result.response;
  const text = response.text();

  // JSONをパース
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse JSON:', error);
  }

  return { data: [] };
}

/**
 * 複数画像からデータを一括抽出
 */
export async function extractMultipleImages(imageBase64Array: string[]) {
  const batchSize = 5;
  const results = [];

  for (let i = 0; i < imageBase64Array.length; i += batchSize) {
    const batch = imageBase64Array.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((img) => extractTrainingData(img))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * 相対日付を絶対日付に変換
 */
export async function convertRelativeDate(text: string, baseDate: Date = new Date()) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
以下のテキストに含まれる相対日付（「今日」「昨日」「先週の土曜日」など）を、
基準日 ${baseDate.toISOString().split('T')[0]} を元に絶対日付（YYYY-MM-DD）に変換してください。

テキスト：
${text}

変換後のテキストをそのまま返してください。相対日付以外の部分は変更しないでください。
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * AIコーチとの対話
 */
export async function chatWithCoach(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  trainingData: any,
  characterType: string = 'balanced'
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const characterPrompts = {
    strict: '厳しいコーチとして、データに基づいて的確に指導してください。甘やかさず、目標達成にフォーカスします。',
    gentle: '優しく励ますコーチとして、ポジティブにサポートしてください。頑張りを認めつつ、無理のない提案をします。',
    analytical: 'データアナリストとして、客観的に分析し、数値に基づいたアドバイスをしてください。感情的な要素は控えめに。',
    balanced: 'バランスの取れたコーチとして、データを重視しつつも励ましも忘れず、適切なアドバイスをしてください。',
  };

  const systemPrompt = `
あなたはマラソントレーニングをサポートするAIコーチです。

キャラクター設定：${characterPrompts[characterType as keyof typeof characterPrompts]}

ユーザーのトレーニングデータ：
- 総走行距離: ${trainingData.totalDistance || 0}km
- 今週の走行距離: ${trainingData.weeklyDistance || 0}km
- 最近の体重: ${trainingData.recentWeight || '不明'}kg
- 継続日数: ${trainingData.continuousDays || 0}日

重要なルール：
1. 過去の会話を記憶し、文脈を理解してください
2. データに基づいた具体的なアドバイスを提供してください
3. ユーザーの目標（五島マラソン完走など）を常に念頭に置いてください
4. 短く簡潔に、要点を押さえて回答してください（3-5文程度）

ユーザーメッセージ: ${message}
`;

  const history = conversationHistory.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history,
  });

  const result = await chat.sendMessage(systemPrompt);
  return result.response.text();
}

/**
 * ボス戦の勝率予測
 */
export async function predictBossWinRate(
  goalName: string,
  targetDate: Date,
  targetValue: number,
  currentProgress: number,
  recentData: any
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const daysRemaining = Math.ceil(
    (targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const prompt = `
マラソン目標「${goalName}」の達成確率を予測してください。

目標情報：
- 目標値: ${targetValue}km
- 現在の進捗: ${currentProgress}km (${((currentProgress / targetValue) * 100).toFixed(1)}%)
- 残り日数: ${daysRemaining}日

最近のトレーニングデータ：
- 週平均走行距離: ${recentData.weeklyAverage || 0}km
- 月間走行距離: ${recentData.monthlyDistance || 0}km
- 継続率: ${recentData.continuityRate || 0}%

この情報を元に：
1. 達成確率（0-100%）
2. 推奨アクション（週何km走るべきか）
3. 簡単なコメント（1-2文）

JSON形式で返してください：
{
  "winRate": 75,
  "recommendedWeeklyDistance": 15,
  "comment": "現在のペースで継続すれば達成可能です"
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse prediction:', error);
  }

  return {
    winRate: 50,
    recommendedWeeklyDistance: 10,
    comment: '予測計算中...',
  };
}
