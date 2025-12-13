// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import EnemyView from '@/components/EnemyView';
import HomeView from '@/components/HomeView';
import BossView from '@/components/BossView';

export default function Home() {
  const [currentView, setCurrentView] = useState<'enemy' | 'home' | 'boss'>('home');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // スワイプ検知の最小距離
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // 左スワイプ: home -> boss, enemy -> home
      if (currentView === 'home') setCurrentView('boss');
      else if (currentView === 'enemy') setCurrentView('home');
    }

    if (isRightSwipe) {
      // 右スワイプ: home -> enemy, boss -> home
      if (currentView === 'home') setCurrentView('enemy');
      else if (currentView === 'boss') setCurrentView('home');
    }
  };

  return (
    <div
      className="min-h-screen overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ナビゲーションドット */}
      <div className="fixed top-4 left-0 right-0 flex justify-center gap-2 z-50">
        <button
          onClick={() => setCurrentView('enemy')}
          className={`h-2 w-2 rounded-full transition-all ${
            currentView === 'enemy' ? 'bg-blue-500 w-8' : 'bg-gray-600'
          }`}
        />
        <button
          onClick={() => setCurrentView('home')}
          className={`h-2 w-2 rounded-full transition-all ${
            currentView === 'home' ? 'bg-blue-500 w-8' : 'bg-gray-600'
          }`}
        />
        <button
          onClick={() => setCurrentView('boss')}
          className={`h-2 w-2 rounded-full transition-all ${
            currentView === 'boss' ? 'bg-blue-500 w-8' : 'bg-gray-600'
          }`}
        />
      </div>

      {/* コンテンツ */}
      <div className="pt-12">
        {currentView === 'enemy' && <EnemyView />}
        {currentView === 'home' && <HomeView />}
        {currentView === 'boss' && <BossView />}
      </div>
    </div>
  );
}
