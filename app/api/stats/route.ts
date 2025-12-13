// app/api/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getStats, getWeeklyData, getTrainingRecords } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const weeks = parseInt(searchParams.get('weeks') || '4');

    // 基本統計
    const stats = await getStats();

    // 週次データ
    const weeklyData = await getWeeklyData(weeks);

    // 期間指定がある場合は詳細データも取得
    let detailedRecords = null;
    if (startDate && endDate) {
      detailedRecords = await getTrainingRecords(startDate, endDate);
    }

    return NextResponse.json({
      stats,
      weeklyData,
      detailedRecords,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error },
      { status: 500 }
    );
  }
}
