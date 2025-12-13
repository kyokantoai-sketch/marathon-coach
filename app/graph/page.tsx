// app/graph/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function GraphPage() {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [viewType, setViewType] = useState<'line' | 'bar'>('line');
  const [weeks, setWeeks] = useState(4);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [weeks]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/stats?weeks=${weeks}`);
      const data = await response.json();
      setWeeklyData(data.weeklyData);
      setStats(data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/" className="text-blue-500 mr-4">
              ← 戻る
            </Link>
            <h1 className="text-2xl font-bold">📊 詳細グラフ</h1>
          </div>

          {/* 表示切り替え */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewType('line')}
              className={`px-3 py-1 rounded ${
                viewType === 'line' ? 'bg-blue-600' : 'bg-gray-800'
              }`}
            >
              線グラフ
            </button>
            <button
              onClick={() => setViewType('bar')}
              className={`px-3 py-1 rounded ${
                viewType === 'bar' ? 'bg-blue-600' : 'bg-gray-800'
              }`}
            >
              棒グラフ
            </button>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">総走行距離</div>
            <div className="text-xl font-bold text-blue-500">
              {stats?.totalDistance?.toFixed(1) || 0} km
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">今週</div>
            <div className="text-xl font-bold text-green-500">
              {stats?.weeklyDistance?.toFixed(1) || 0} km
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">平均ペース</div>
            <div className="text-xl font-bold text-purple-500">
              {weeklyData.length > 0
                ? (
                    weeklyData.reduce((sum, w) => sum + w.distance, 0) /
                    weeklyData.length
                  ).toFixed(1)
                : 0}{' '}
              km/週
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">最新体重</div>
            <div className="text-xl font-bold text-orange-500">
              {stats?.recentWeight?.toFixed(1) || '--'} kg
            </div>
          </div>
        </div>

        {/* 期間選択 */}
        <div className="bg-gray-900 p-4 rounded-lg mb-6">
          <div className="text-sm text-gray-400 mb-2">表示期間</div>
          <div className="flex gap-2">
            {[4, 8, 12, 24].map((w) => (
              <button
                key={w}
                onClick={() => setWeeks(w)}
                className={`flex-1 py-2 rounded ${
                  weeks === w ? 'bg-blue-600' : 'bg-gray-800'
                }`}
              >
                {w}週間
              </button>
            ))}
          </div>
        </div>

        {/* グラフ */}
        {weeklyData.length > 0 ? (
          <div className="bg-gray-900 p-6 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-4">週次走行距離</h2>
            <ResponsiveContainer width="100%" height={300}>
              {viewType === 'line' ? (
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="week"
                    stroke="#9ca3af"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString('ja-JP')
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="distance"
                    stroke="#3b82f6"
                    name="走行距離 (km)"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="week"
                    stroke="#9ca3af"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString('ja-JP')
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="distance"
                    fill="#3b82f6"
                    name="走行距離 (km)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-gray-900 p-8 rounded-lg text-center text-gray-400">
            データがありません
          </div>
        )}

        {/* 体重推移 */}
        {weeklyData.some((w) => w.weight) && (
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">体重推移</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="week"
                  stroke="#9ca3af"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                />
                <YAxis stroke="#9ca3af" domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('ja-JP')
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#f97316"
                  name="体重 (kg)"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
