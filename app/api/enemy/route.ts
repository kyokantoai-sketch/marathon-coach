// app/api/enemy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getExperience, getEnemyDefeats, defeatEnemy } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const expData = await getExperience();
    const defeats = await getEnemyDefeats();

    return NextResponse.json({
      currentExp: expData.experience,
      level: expData.level,
      nextLevelExp: expData.nextLevelExp,
      progress: ((expData.experience % 1000) / 1000) * 100,
      defeatedEnemies: defeats.length,
      defeats: defeats.slice(0, 10), // 最新10件
    });
  } catch (error) {
    console.error('Enemy status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enemy status', details: error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enemyLevel, experienceRequired } = body;

    if (!enemyLevel || !experienceRequired) {
      return NextResponse.json(
        { error: 'Enemy level and experience required' },
        { status: 400 }
      );
    }

    const defeat = await defeatEnemy(enemyLevel, experienceRequired);

    return NextResponse.json({
      success: true,
      defeat,
    });
  } catch (error) {
    console.error('Defeat enemy error:', error);
    return NextResponse.json(
      { error: 'Failed to record defeat', details: error },
      { status: 500 }
    );
  }
}
