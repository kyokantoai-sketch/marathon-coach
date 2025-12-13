// app/api/coach/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { chatWithCoach } from '@/lib/gemini';
import {
  getStats,
  getConversationHistory,
  saveConversation,
  getUserSettings,
} from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // ユーザー設定を取得
    const settings = await getUserSettings();

    // トレーニングデータを取得
    const trainingData = await getStats();

    // 会話履歴を取得
    const history = await getConversationHistory();

    // AIコーチと対話
    const reply = await chatWithCoach(
      message,
      history,
      trainingData,
      settings.coach_character
    );

    // 会話を保存
    await saveConversation('user', message);
    await saveConversation('assistant', reply);

    return NextResponse.json({
      success: true,
      reply,
      trainingData,
    });
  } catch (error) {
    console.error('Coach chat error:', error);
    return NextResponse.json(
      { error: 'Chat failed', details: error },
      { status: 500 }
    );
  }
}
