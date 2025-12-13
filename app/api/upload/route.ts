// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { saveImage } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    // 各ファイルをVercel Blobにアップロード
    for (const file of files) {
      const blob = await put(file.name, file, {
        access: 'public',
      });

      uploadedUrls.push(blob.url);

      // データベースに記録
      await saveImage(blob.url);
    }

    return NextResponse.json({
      success: true,
      uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
