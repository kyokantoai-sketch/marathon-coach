// app/api/ocr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractMultipleImages } from '@/lib/gemini';
import { saveTrainingRecord } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrls } = body;

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'No image URLs provided' },
        { status: 400 }
      );
    }

    // 画像をBase64に変換
    const imageBase64Array = await Promise.all(
      imageUrls.map(async (url: string) => {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer).toString('base64');
      })
    );

    // Gemini APIでデータ抽出
    const results = await extractMultipleImages(imageBase64Array);

    // データベースに保存
    const savedRecords = [];
    for (const result of results) {
      if (result.data && result.data.length > 0) {
        for (const record of result.data) {
          if (record.date && record.type) {
            const saved = await saveTrainingRecord({
              date: record.date,
              type: record.type,
              distance: record.distance,
              duration: record.duration,
              pace: record.pace,
              weight: record.weight,
              workout_detail: record.workout_detail,
            });
            savedRecords.push(saved);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      extractedCount: savedRecords.length,
      records: savedRecords,
    });
  } catch (error) {
    console.error('OCR error:', error);
    return NextResponse.json(
      { error: 'OCR processing failed', details: error },
      { status: 500 }
    );
  }
}
