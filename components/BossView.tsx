// components/BossView.tsx
'use client';

import { useState, useEffect } from 'react';

export default function BossView() {
  const [bossData, setBossData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddBoss, setShowAddBoss] = useState(false);

  useEffect(() => {
    fetchBossStatus();
  }, []);

  const fetchBossStatus = async () => {
    try {
      const response = await fetch('/api/boss');
      const data = await response.json();
      setBossData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch boss status:', error);
      setLoading(false);
    }
  };

  const handleAddBoss = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/boss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal_name: formData.get('goal_name'),
          goal_type: formData.get('goal_type'),
          target_value: parseFloat(formData.get('target_value') as string),
          target_date: formData.get('target_date'),
        }),
      });

      if (response.ok) {
        setShowAddBoss(false);
        fetchBossStatus();
      }
    } catch (error) {
      console.error('Failed to add boss:', error);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">👹 ボス戦</h1>
        <button
          onClick={() => setShowAddBoss(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
        >
          + 新しい目標
        </button>
      </div>

      {/* ボス目標リスト */}
      {bossData?.goals && bossData.goals.length > 0 ? (
        <div className="space-y-4">
          {bossData.goals.map((goal: any) => (
            <div
              key={goal.id}
              className="bg-gradient-to-br from-red-900 to-purple-900 p-6 rounded-lg border-2 border-red-500"
            >
              {/* ボス名 */}
              <div className="text-2xl font-bold mb-2">{goal.goal_name}</div>

              {/* カウントダウン */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-300">残り</span>
                <span className="text-3xl font-bold text-yellow-500">
                  {goal.daysRemaining}
                </span>
                <span className="text-gray-300">日</span>
              </div>

              {/* 進捗バー */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">進捗</span>
                  <span className="text-white font-semibold">
                    {goal.currentValue.toFixed(1)} / {goal.target_value} km
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* AI予測勝率 */}
              <div className="bg-black/30 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">🎯 AI予測勝率</span>
                  <span
                    className={`text-2xl font-bold ${
                      goal.winProbability >= 70
                        ? 'text-green-500'
                        : goal.winProbability >= 50
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  >
                    {goal.winProbability}%
                  </span>
                </div>
                {goal.winProbability < 70 && (
                  <div className="text-sm text-gray-400">
                    推奨: 週 {goal.recommendedWeeklyDistance}km 走行
                  </div>
                )}
              </div>

              {/* AIコメント */}
              <div className="text-sm text-gray-300 bg-black/20 p-3 rounded">
                💬 {goal.comment}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 p-8 rounded-lg text-center">
          <div className="text-gray-400 mb-4">まだボス目標がありません</div>
          <button
            onClick={() => setShowAddBoss(true)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
          >
            最初の目標を設定する
          </button>
        </div>
      )}

      {/* ボス追加モーダル */}
      {showAddBoss && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">新しい目標を設定</h2>
            <form onSubmit={handleAddBoss} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  目標名
                </label>
                <input
                  type="text"
                  name="goal_name"
                  placeholder="例: 五島つばきマラソン"
                  className="w-full bg-gray-800 px-4 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  タイプ
                </label>
                <select
                  name="goal_type"
                  className="w-full bg-gray-800 px-4 py-2 rounded"
                  required
                >
                  <option value="race">レース完走</option>
                  <option value="monthly">月間目標</option>
                  <option value="weekly">週間目標</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  目標距離 (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="target_value"
                  placeholder="42.195"
                  className="w-full bg-gray-800 px-4 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  目標日
                </label>
                <input
                  type="date"
                  name="target_date"
                  className="w-full bg-gray-800 px-4 py-2 rounded"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddBoss(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded"
                >
                  追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
