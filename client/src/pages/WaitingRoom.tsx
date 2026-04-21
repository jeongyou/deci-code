import { GameRoom, Player } from '../types';

interface Props {
  room: GameRoom;
  myId: string;
  onReady: () => void;
}

export function WaitingRoom({ room, myId, onReady }: Props) {
  const me = room.players.find(p => p.id === myId);
  const allReady = room.players.length >= 2 && room.players.every(p => p.isReady);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-slate-400 text-sm mb-1">방 코드</p>
          <h1 className="text-4xl font-black text-amber-400 font-mono tracking-widest">
            {room.id}
          </h1>
          <p className="text-slate-500 text-xs mt-1">친구에게 이 코드를 공유하세요</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-white font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">
            플레이어 ({room.players.length}/4)
          </h2>

          <div className="space-y-2 mb-6">
            {room.players.map((player: Player) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-slate-700 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{player.nickname}</span>
                  {player.id === myId && (
                    <span className="text-xs bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-bold">
                      나
                    </span>
                  )}
                </div>
                <span className={player.isReady ? 'text-green-400 text-sm font-bold' : 'text-slate-500 text-sm'}>
                  {player.isReady ? '준비 완료' : '대기 중'}
                </span>
              </div>
            ))}

            {Array.from({ length: 4 - room.players.length }).map((_, i) => (
              <div
                key={i}
                className="flex items-center bg-slate-700/40 rounded-xl px-4 py-3 border-2 border-dashed border-slate-600"
              >
                <span className="text-slate-600 text-sm">빈 자리</span>
              </div>
            ))}
          </div>

          <button
            onClick={onReady}
            disabled={me?.isReady}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-3 rounded-xl transition-colors"
          >
            {me?.isReady ? '준비 완료!' : '준비하기'}
          </button>

          {room.players.length < 2 && (
            <p className="text-center text-slate-500 text-xs mt-3">
              최소 2명이 필요합니다
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
