// app/upload/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUploadAndProcess = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(10);

    try {
      // 画像アップロード
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      setProgress(30);
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      const uploadData = await uploadResponse.json();
      setProgress(50);
      setUploading(false);
      setProcessing(true);

      // OCR処理
      const ocrResponse = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls: uploadData.uploadedUrls }),
      });

      if (!ocrResponse.ok) throw new Error('OCR failed');

      const ocrData = await ocrResponse.json();
      setProgress(100);

      // 完了後、ホームに戻る
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      alert('処理に失敗しました');
      setUploading(false);
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <Link href="/" className="text-blue-500 mr-4">
            ← 戻る
          </Link>
          <h1 className="text-2xl font-bold">スクショアップロード</h1>
        </div>

        {/* アップロードエリア */}
        {files.length === 0 ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center"
          >
            <div className="text-6xl mb-4">📸</div>
            <p className="text-gray-400 mb-4">
              ここに画像をドロップ<br />または
            </p>
            <label className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg cursor-pointer inline-block">
              画像を選択
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 mt-4">
              10枚以上の画像も一度にアップロードできます
            </p>
          </div>
        ) : (
          <div>
            {/* プレビュー */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {files.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* 枚数表示 */}
            <div className="bg-gray-900 p-4 rounded-lg mb-4 text-center">
              <span className="text-2xl font-bold text-blue-500">{files.length}</span>
              <span className="text-gray-400 ml-2">枚の画像</span>
            </div>

            {/* 進捗バー */}
            {(uploading || processing) && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">
                    {uploading ? 'アップロード中...' : 'データ抽出中...'}
                  </span>
                  <span className="text-blue-500">{progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex gap-3">
              <label className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg text-center cursor-pointer">
                追加
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles([...files, ...Array.from(e.target.files)]);
                    }
                  }}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleUploadAndProcess}
                disabled={uploading || processing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-semibold"
              >
                {uploading || processing ? '処理中...' : 'アップロード開始'}
              </button>
            </div>
          </div>
        )}

        {/* 説明 */}
        <div className="mt-8 bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
          <h3 className="font-semibold mb-2">💡 使い方</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• ランニングアプリのスクショ → 走行距離を自動抽出</li>
            <li>• 体重計のスクショ → 体重を自動記録</li>
            <li>• 筋トレアプリのスクショ → トレーニング内容を記録</li>
            <li>• 10枚以上でも一度に処理できます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
