import { useState } from 'react';

interface Props {
  onJoinRoom: (roomId: string, nickname: string) => void;
  onJoinRandom: (nickname: string) => void;
}

export function LobbyPage({ onJoinRoom, onJoinRandom }: Props) {
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');

  const canProceed = nickname.trim().length >= 1;

  const handleCreate = () => {
    if (!canProceed) return;
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    onJoinRoom(id, nickname.trim());
  };

  const handleJoin = () => {
    if (!canProceed || !roomId.trim()) return;
    onJoinRoom(roomId.trim().toUpperCase(), nickname.trim());
  };

  const handleRandom = () => {
    if (!canProceed) return;
    onJoinRandom(nickname.trim());
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* 타이틀 */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white tracking-tight mb-2">
            Da Vinci
          </h1>
          <h2 className="text-5xl font-black tracking-tight mb-2">
            <span className="text-amber-400">Code</span>
          </h2>
          <p className="text-slate-400 text-sm">숫자 타일 추리 게임</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          {/* 닉네임 */}
          <div>
            <label className="text-slate-400 text-xs uppercase tracking-widest mb-1.5 block">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="이름을 입력하세요"
              maxLength={10}
              className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-500"
            />
          </div>

          {mode === 'home' && (
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => setMode('create')}
                disabled={!canProceed}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-900 font-bold py-3 rounded-xl transition-colors"
              >
                방 만들기
              </button>
              <button
                onClick={() => setMode('join')}
                disabled={!canProceed}
                className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors"
              >
                방 코드로 입장
              </button>
              <button
                onClick={handleRandom}
                disabled={!canProceed}
                className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-colors"
              >
                랜덤 매칭
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleCreate}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3 rounded-xl transition-colors"
              >
                방 생성
              </button>
              <button
                onClick={() => setMode('home')}
                className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors"
              >
                ← 돌아가기
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-2.5 pt-1">
              <input
                type="text"
                value={roomId}
                onChange={e => setRoomId(e.target.value.toUpperCase())}
                placeholder="방 코드 입력 (예: AB1C23)"
                maxLength={6}
                className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-500 font-mono tracking-widest"
              />
              <button
                onClick={handleJoin}
                disabled={!canProceed || !roomId.trim()}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-900 font-bold py-3 rounded-xl transition-colors"
              >
                입장하기
              </button>
              <button
                onClick={() => setMode('home')}
                className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors"
              >
                ← 돌아가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
