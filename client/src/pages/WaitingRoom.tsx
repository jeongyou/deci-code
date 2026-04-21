import type { GameRoom, Player } from '../types';

interface Props {
  room: GameRoom;
  myId: string;
  onReady: () => void;
}

export function WaitingRoom({ room, myId, onReady }: Props) {
  const me = room.players.find(p => p.id === myId);
  const needsMore = room.players.length < 2;

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <p className="text-white/30 text-xs tracking-widest uppercase mb-2">방 코드</p>
          <h1 className="text-5xl font-black text-amber-400 font-mono tracking-[0.2em]">
            {room.id}
          </h1>
          <p className="text-white/20 text-xs mt-2">친구에게 이 코드를 공유하세요</p>
        </div>

        <div className="bg-white/4 border border-white/8 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-white/30 text-xs uppercase tracking-widest">플레이어</span>
            <span className="text-white/30 text-xs">{room.players.length} / 4</span>
          </div>

          {room.players.map((player: Player) => (
            <div
              key={player.id}
              className="flex items-center justify-between bg-white/4 rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-sm font-bold">
                  {player.nickname[0].toUpperCase()}
                </div>
                <span className="text-white font-medium text-sm">{player.nickname}</span>
                {player.id === myId && (
                  <span className="text-xs bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">나</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${player.isReady ? 'bg-green-400' : 'bg-white/20'}`} />
                <span className={`text-xs ${player.isReady ? 'text-green-400' : 'text-white/30'}`}>
                  {player.isReady ? '준비' : '대기'}
                </span>
              </div>
            </div>
          ))}

          {Array.from({ length: 4 - room.players.length }).map((_, i) => (
            <div key={i} className="flex items-center bg-white/2 border border-dashed border-white/8 rounded-xl px-4 py-3">
              <span className="text-white/15 text-sm">빈 자리</span>
            </div>
          ))}

          <div className="pt-1">
            <button
              onClick={onReady}
              disabled={me?.isReady}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed text-slate-900 font-bold py-3.5 rounded-xl transition-colors"
            >
              {me?.isReady ? '준비 완료 ✓' : '준비하기'}
            </button>
            {needsMore && (
              <p className="text-center text-white/20 text-xs mt-3">최소 2명이 필요합니다</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
