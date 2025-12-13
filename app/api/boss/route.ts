// app/api/boss/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveBossGoals,
  createBossGoal,
  completeBossGoal,
  getStats,
  getWeeklyData,
} from '@/lib/db';
import { predictBossWinRate } from '@/lib/gemini';

export async function GET(request: NextRequest) {
  try {
    const goals = await getActiveBossGoals();
    const stats = await getStats();
    const weeklyData = await getWeeklyData(4);

    // 各ゴールの進捗と勝率を計算
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal: any) => {
        let progress = 0;
        let currentValue = 0;

        if (goal.goal_type === 'race') {
          // マラソンの場合は総走行距離から推測
          currentValue = stats.totalDistance;
          progress = (currentValue / goal.target_value) * 100;
        } else if (goal.goal_type === 'monthly') {
          // 月間目標の場合は今月の距離
          currentValue = stats.weeklyDistance * 4; // 簡易計算
          progress = (currentValue / goal.target_value) * 100;
        }

        // AI予測
        const prediction = await predictBossWinRate(
          goal.goal_name,
          new Date(goal.target_date),
          goal.target_value,
          currentValue,
          {
            weeklyAverage: weeklyData.reduce((sum, w) => sum + w.distance, 0) / weeklyData.length,
            monthlyDistance: currentValue,
            continuityRate: (stats.continuousDays / 7) * 100,
          }
        );

        // 残り日数
        const daysRemaining = Math.ceil(
          (new Date(goal.target_date).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return {
          ...goal,
          progress: Math.min(progress, 100),
          currentValue,
          winProbability: prediction.winRate,
          recommendedWeeklyDistance: prediction.recommendedWeeklyDistance,
          comment: prediction.comment,
          daysRemaining,
        };
      })
    );

    return NextResponse.json({
      goals: goalsWithProgress,
    });
  } catch (error) {
    console.error('Boss status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boss status', details: error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal_name, goal_type, target_value, target_date } = body;

    if (!goal_name || !goal_type || !target_value || !target_date) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const goal = await createBossGoal({
      goal_name,
      goal_type,
      target_value,
      target_date,
    });

    return NextResponse.json({
      success: true,
      goal,
    });
  } catch (error) {
    console.error('Create boss error:', error);
    return NextResponse.json(
      { error: 'Failed to create boss goal', details: error },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { goalId } = body;

    if (!goalId) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    await completeBossGoal(goalId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Complete boss error:', error);
    return NextResponse.json(
      { error: 'Failed to complete boss goal', details: error },
      { status: 500 }
    );
  }
}
