// components/EnemyView.tsx
'use client';

import { useState, useEffect } from 'react';

export default function EnemyView() {
  const [enemyData, setEnemyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnemyStatus();
  }, []);

  const fetchEnemyStatus = async () => {
    try {
      const response = await fetch('/api/enemy');
      const data = await response.json();
      setEnemyData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch enemy status:', error);
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

  const nextEnemyExp = ((Math.floor(enemyData.currentExp / 1000) + 1) * 1000);
  const remainingExp = nextEnemyExp - enemyData.currentExp;
  const remainingKm = (remainingExp / 100).toFixed(1);

  return (
    <div className="p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6">⚔️ 日常の敵</h1>

      {/* レベル表示 */}
      <div className="bg-gray-900 p-6 rounded-lg mb-6 text-center">
        <div className="text-gray-400 text-sm mb-2">現在のレベル</div>
        <div className="text-5xl font-bold text-yellow-500">Lv. {enemyData.level}</div>
      </div>

      {/* 経験値バー */}
      <div className="bg-gray-900 p-6 rounded-lg mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">経験値</span>
          <span className="text-blue-500 font-semibold">
            {enemyData.currentExp} / {nextEnemyExp} EXP
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-4 mb-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${enemyData.progress}%` }}
          />
        </div>
        <div className="text-center">
          <span className="text-2xl font-bold text-white">
            あと {remainingKm} km
          </span>
          <span className="text-gray-400 text-sm ml-2">で次の敵を倒せる！</span>
        </div>
      </div>

      {/* 撃破数 */}
      <div className="bg-gradient-to-r from-red-900 to-orange-900 p-6 rounded-lg mb-6">
        <div className="text-center">
          <div className="text-gray-300 text-sm mb-2">累計撃破数</div>
          <div className="text-4xl font-bold text-white">
            {enemyData.defeatedEnemies}
            <span className="text-xl ml-2">体</span>
          </div>
        </div>
      </div>

      {/* 最近の撃破履歴 */}
      {enemyData.defeats && enemyData.defeats.length > 0 && (
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">🏆 撃破履歴</h2>
          <div className="space-y-3">
            {enemyData.defeats.slice(0, 5).map((defeat: any, index: number) => (
              <div
                key={defeat.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded"
              >
                <div>
                  <div className="font-semibold">Lv.{defeat.enemy_level} の敵</div>
                  <div className="text-sm text-gray-400">
                    {new Date(defeat.defeated_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>
                <div className="text-blue-500 font-semibold">
                  {defeat.experience_required} EXP
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* モチベーションメッセージ */}
      <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
        <p className="text-center text-blue-300">
          💪 走った距離が経験値になる！<br />
          どんどん走って敵を倒そう！
        </p>
      </div>
    </div>
  );
}
