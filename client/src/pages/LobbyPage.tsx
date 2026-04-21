import { useState } from 'react';

interface Props {
  onJoinRoom: (roomId: string, nickname: string) => void;
  onJoinRandom: (nickname: string) => void;
}

type Mode = 'home' | 'create' | 'join';

export function LobbyPage({ onJoinRoom, onJoinRandom }: Props) {
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [mode, setMode] = useState<Mode>('home');

  const ready = nickname.trim().length >= 1;

  const handleCreate = () => {
    if (!ready) return;
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    onJoinRoom(id, nickname.trim());
  };

  const handleJoin = () => {
    if (!ready || !roomId.trim()) return;
    onJoinRoom(roomId.trim().toUpperCase(), nickname.trim());
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-xs">

        <div className="text-center mb-10">
          <p className="text-amber-400/60 text-xs tracking-[0.3em] uppercase mb-3">Number Deduction Game</p>
          <h1 className="text-6xl font-black tracking-tight leading-none">
            <span className="text-white">Da </span>
            <span className="text-amber-400">Vinci</span>
          </h1>
          <h2 className="text-6xl font-black tracking-tight text-white/20 mt-1">Code</h2>
        </div>

        <div className="space-y-3">
          <div>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ready && setMode('create')}
              placeholder="닉네임"
              maxLength={10}
              className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-amber-400/60 focus:bg-white/8 placeholder:text-white/20 transition-colors"
            />
          </div>

          {mode === 'home' && (
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCreate}
                disabled={!ready}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-20 text-slate-900 font-bold py-3.5 rounded-2xl transition-colors"
              >
                방 만들기
              </button>
              <button
                onClick={() => setMode('join')}
                disabled={!ready}
                className="w-full bg-white/8 hover:bg-white/12 disabled:opacity-20 border border-white/10 text-white font-medium py-3.5 rounded-2xl transition-colors"
              >
                코드로 입장
              </button>
              <button
                onClick={() => ready && onJoinRandom(nickname.trim())}
                disabled={!ready}
                className="w-full bg-white/5 hover:bg-white/10 disabled:opacity-20 text-white/60 hover:text-white font-medium py-3 rounded-2xl transition-colors text-sm"
              >
                랜덤 매칭
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-2 pt-1">
              <input
                type="text"
                value={roomId}
                onChange={e => setRoomId(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="방 코드 (예: AB1C23)"
                maxLength={6}
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-3.5 outline-none focus:border-amber-400/60 placeholder:text-white/20 font-mono tracking-widest transition-colors"
              />
              <button
                onClick={handleJoin}
                disabled={!ready || !roomId.trim()}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-20 text-slate-900 font-bold py-3.5 rounded-2xl transition-colors"
              >
                입장하기
              </button>
              <button
                onClick={() => setMode('home')}
                className="w-full text-white/30 hover:text-white/60 text-sm py-2 transition-colors"
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
