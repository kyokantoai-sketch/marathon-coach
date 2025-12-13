// app/coach/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function CoachPage() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [character, setCharacter] = useState('balanced');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初回メッセージ
    setMessages([
      {
        role: 'assistant',
        content: 'こんにちは！マラソンコーチです。トレーニングの相談や振り返り、何でも聞いてください！',
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error('Chat failed');

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '申し訳ありません、エラーが発生しました。もう一度お試しください。',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const characterTypes = [
    { value: 'balanced', label: 'バランス型', emoji: '⚖️' },
    { value: 'strict', label: '厳しめ', emoji: '💪' },
    { value: 'gentle', label: '優しめ', emoji: '🤗' },
    { value: 'analytical', label: '分析型', emoji: '📊' },
  ];

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* ヘッダー */}
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-blue-500 mr-4">
            ← 戻る
          </Link>
          <h1 className="text-xl font-bold">💬 AIコーチ</h1>
        </div>

        {/* キャラクター選択 */}
        <select
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
          className="bg-gray-800 px-3 py-1 rounded text-sm"
        >
          {characterTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.emoji} {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600'
                  : 'bg-gray-800 border border-gray-700'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="bg-gray-900 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="メッセージを入力..."
            className="flex-1 bg-gray-800 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold"
          >
            送信
          </button>
        </div>

        {/* クイックアクション */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {[
            '今週の調子は？',
            '五島マラソンまでの戦略は？',
            '体重管理のアドバイスは？',
            '膝が痛いけど...',
          ].map((text) => (
            <button
              key={text}
              onClick={() => setInput(text)}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-sm whitespace-nowrap"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
