// components/HomeView.tsx
'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

export default function HomeView() {
  const [stats, setStats] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats?weeks=4');
      const data = await response.json();
      setStats(data.stats);
 setWeeklyData(data.weeklyData || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6">Marathon Coach</h1>

      {/* クイック統計 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">総走行距離</div>
          <div className="text-2xl font-bold text-blue-500">
            {stats?.totalDistance?.toFixed(1) || 0}
            <span className="text-sm ml-1">km</span>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">今週</div>
          <div className="text-2xl font-bold text-green-500">
            {stats?.weeklyDistance?.toFixed(1) || 0}
            <span className="text-sm ml-1">km</span>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">最近の体重</div>
          <div className="text-2xl font-bold text-purple-500">
            {stats?.recentWeight?.toFixed(1) || '--'}
            <span className="text-sm ml-1">kg</span>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">継続日数</div>
          <div className="text-2xl font-bold text-orange-500">
            {stats?.continuousDays || 0}
            <span className="text-sm ml-1">日</span>
          </div>
        </div>
      </div>

      {/* 週次グラフ */}
      {weeklyData?.length > 0 && (
        <div className="bg-gray-900 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">週次推移</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="week" 
                stroke="#9ca3af"
                tickFormatter={(value) => new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                labelFormatter={(value) => new Date(value).toLocaleDateString('ja-JP')}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="distance" 
                stroke="#3b82f6" 
                name="走行距離 (km)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* アクションボタン */}
      <div className="space-y-3">
        <Link href="/upload">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition-colors">
            📸 スクショをアップロード
          </button>
        </Link>

        <Link href="/coach">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold transition-colors">
            💬 AIコーチと話す
          </button>
        </Link>

        <Link href="/graph">
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg font-semibold transition-colors">
            📊 詳細グラフを見る
          </button>
        </Link>
      </div>
    </div>
  );
}
