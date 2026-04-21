import { useState } from 'react';
import type { GameRoom, Tile, Player } from '../types';
import { TileCard } from '../components/TileCard';

interface Props {
  room: GameRoom;
  myId: string;
  drawnTile: Tile | null;
  onDrawTile: () => void;
  onGuessTile: (targetPlayerId: string, tileId: string, guessedNumber: number | null) => void;
  onSkipGuess: () => void;
  lastGuessResult: { correct: boolean; tile: Tile } | null;
}

export function GamePage({ room, myId, drawnTile, onDrawTile, onGuessTile, onSkipGuess, lastGuessResult }: Props) {
  const [selectedTarget, setSelectedTarget] = useState<{ playerId: string; tileId: string } | null>(null);
  const [guessNumber, setGuessNumber] = useState<number | null>(null);
  const [isJokerGuess, setIsJokerGuess] = useState(false);

  const me = room.players.find(p => p.id === myId)!;
  const isMyTurn = room.players[room.currentTurnIndex]?.id === myId;
  const currentPlayer = room.players[room.currentTurnIndex];
  const opponents = room.players.filter(p => p.id !== myId);
  const hasDrawn = !!drawnTile;

  const handleTileClick = (playerId: string, tileId: string) => {
    if (!isMyTurn || !hasDrawn) return;
    setSelectedTarget({ playerId, tileId });
    setGuessNumber(null);
    setIsJokerGuess(false);
  };

  const handleGuess = () => {
    if (!selectedTarget) return;
    onGuessTile(selectedTarget.playerId, selectedTarget.tileId, isJokerGuess ? null : guessNumber);
    setSelectedTarget(null);
    setGuessNumber(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-4 gap-4">
      {/* 턴 표시 */}
      <div className={`text-center py-2 rounded-xl text-sm font-bold ${isMyTurn ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 text-slate-300'}`}>
        {isMyTurn ? '내 차례!' : `${currentPlayer?.nickname}의 차례`}
      </div>

      {/* 추리 결과 토스트 */}
      {lastGuessResult && (
        <div className={`text-center py-2 rounded-xl text-sm font-bold ${lastGuessResult.correct ? 'bg-green-500' : 'bg-red-500'}`}>
          {lastGuessResult.correct ? '정답! 타일이 공개되었습니다.' : '틀렸습니다. 턴이 넘어갑니다.'}
        </div>
      )}

      {/* 상대방 타일들 */}
      <div className="space-y-3">
        {opponents.map((opponent: Player) => (
          <div key={opponent.id} className="bg-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-2 uppercase tracking-widest">{opponent.nickname}</p>
            <div className="flex gap-2 flex-wrap">
              {opponent.tiles.map((tile: Tile) => (
                <TileCard
                  key={tile.id}
                  tile={tile}
                  faceDown={!tile.isRevealed}
                  selected={selectedTarget?.tileId === tile.id}
                  onClick={isMyTurn && hasDrawn && !tile.isRevealed ? () => handleTileClick(opponent.id, tile.id) : undefined}
                  small
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 추리 패널 */}
      {selectedTarget && (
        <div className="bg-slate-700 rounded-xl p-4 space-y-3">
          <p className="text-sm text-slate-300">숫자를 골라 추리하세요</p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }, (_, i) => (
              <button
                key={i}
                onClick={() => { setGuessNumber(i); setIsJokerGuess(false); }}
                className={`w-9 h-9 rounded-lg font-bold text-sm transition-colors ${guessNumber === i && !isJokerGuess ? 'bg-amber-400 text-slate-900' : 'bg-slate-600 hover:bg-slate-500'}`}
              >
                {i}
              </button>
            ))}
            <button
              onClick={() => { setIsJokerGuess(true); setGuessNumber(null); }}
              className={`w-9 h-9 rounded-lg font-bold text-sm transition-colors ${isJokerGuess ? 'bg-purple-500' : 'bg-slate-600 hover:bg-slate-500'}`}
            >
              ★
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleGuess}
              disabled={guessNumber === null && !isJokerGuess}
              className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-900 font-bold py-2 rounded-lg transition-colors"
            >
              추리하기
            </button>
            <button
              onClick={() => setSelectedTarget(null)}
              className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 내 타일 + 뽑은 타일 */}
      <div className="mt-auto bg-slate-800 rounded-xl p-4">
        <p className="text-slate-400 text-xs mb-2 uppercase tracking-widest">내 타일</p>
        <div className="flex gap-2 flex-wrap mb-3">
          {me?.tiles.map((tile: Tile) => (
            <TileCard key={tile.id} tile={tile} faceDown={false} />
          ))}
          {drawnTile && (
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-xs">→</span>
              <TileCard tile={drawnTile} faceDown={false} />
            </div>
          )}
        </div>

        {isMyTurn && (
          <div className="flex gap-2">
            {!hasDrawn ? (
              <button
                onClick={onDrawTile}
                disabled={room.deck.length === 0}
                className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-900 font-bold py-2.5 rounded-lg transition-colors"
              >
                타일 뽑기 (덱 {room.deck.length}장)
              </button>
            ) : (
              <>
                <p className="text-slate-400 text-xs self-center">타일을 뽑았습니다. 상대 타일을 클릭해 추리하거나</p>
                <button
                  onClick={onSkipGuess}
                  className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-3 rounded-lg text-sm transition-colors whitespace-nowrap"
                >
                  그냥 패에 추가
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
