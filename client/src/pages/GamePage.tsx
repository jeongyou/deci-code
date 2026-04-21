import { useState } from 'react';
import { clsx } from 'clsx';
import type { GameRoom, Tile, Player } from '../types';
import { TileCard } from '../components/TileCard';

interface Props {
  room: GameRoom;
  myId: string;
  drawnTile: Tile | null;
  hasDrawnThisTurn: boolean;
  onDrawTile: () => void;
  onGuessTile: (targetPlayerId: string, tileId: string, guessedNumber: number | null) => void;
  onSkipGuess: () => void;
  lastGuessResult: { correct: boolean; tile: Tile } | null;
}

interface SelectedTarget {
  playerId: string;
  tileId: string;
}

function TurnBanner({ isMyTurn, playerName }: { isMyTurn: boolean; playerName: string }) {
  return (
    <div className={clsx(
      'text-center py-2.5 rounded-xl text-sm font-bold tracking-wide',
      isMyTurn ? 'bg-amber-400 text-slate-900' : 'bg-white/6 text-white/50 border border-white/8'
    )}>
      {isMyTurn ? '내 차례' : `${playerName}의 차례`}
    </div>
  );
}

function GuessResultToast({ result }: { result: { correct: boolean; tile: Tile } }) {
  return (
    <div className={clsx(
      'text-center py-2.5 rounded-xl text-sm font-bold',
      result.correct ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
    )}>
      {result.correct ? '정답! 타일이 공개됐습니다.' : '틀렸습니다. 턴이 넘어갑니다.'}
    </div>
  );
}

function OpponentArea({
  opponent,
  isMyTurn,
  hasDrawn,
  selectedTileId,
  onTileClick,
}: {
  opponent: Player;
  isMyTurn: boolean;
  hasDrawn: boolean;
  selectedTileId: string | null;
  onTileClick: (tileId: string) => void;
}) {
  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs font-bold">
          {opponent.nickname[0].toUpperCase()}
        </div>
        <span className="text-white/50 text-xs font-medium">{opponent.nickname}</span>
        <span className="text-white/20 text-xs ml-auto">{opponent.tiles.length}장</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {opponent.tiles.map((tile: Tile) => (
          <TileCard
            key={tile.id}
            tile={tile}
            variant={tile.isRevealed ? 'face-up' : 'face-down'}
            size="sm"
            selected={selectedTileId === tile.id}
            onClick={isMyTurn && hasDrawn && !tile.isRevealed ? () => onTileClick(tile.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function GuessPanel({
  onGuess,
  onCancel,
}: {
  onGuess: (num: number | null, isJoker: boolean) => void;
  onCancel: () => void;
}) {
  const [guessNumber, setGuessNumber] = useState<number | null>(null);
  const [isJoker, setIsJoker] = useState(false);

  const canGuess = guessNumber !== null || isJoker;

  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl p-4 space-y-3">
      <p className="text-white/40 text-xs uppercase tracking-widest">숫자 선택</p>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 12 }, (_, i) => (
          <button
            key={i}
            onClick={() => { setGuessNumber(i); setIsJoker(false); }}
            className={clsx(
              'h-9 rounded-lg font-bold text-sm transition-colors',
              guessNumber === i && !isJoker
                ? 'bg-amber-400 text-slate-900'
                : 'bg-white/8 hover:bg-white/15 text-white'
            )}
          >
            {i}
          </button>
        ))}
        <button
          onClick={() => { setIsJoker(true); setGuessNumber(null); }}
          className={clsx(
            'h-9 rounded-lg font-bold text-sm transition-colors',
            isJoker ? 'bg-purple-500 text-white' : 'bg-white/8 hover:bg-white/15 text-white'
          )}
        >
          ★
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onGuess(guessNumber, isJoker)}
          disabled={!canGuess}
          className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-20 text-slate-900 font-bold py-2.5 rounded-xl transition-colors"
        >
          추리하기
        </button>
        <button
          onClick={onCancel}
          className="bg-white/8 hover:bg-white/15 text-white/60 font-medium py-2.5 px-4 rounded-xl transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}

function MyHand({
  tiles,
  drawnTile,
  isMyTurn,
  hasDrawn,
  deckCount,
  onDrawTile,
  onSkipGuess,
}: {
  tiles: Tile[];
  drawnTile: Tile | null;
  isMyTurn: boolean;
  hasDrawn: boolean;
  deckCount: number;
  onDrawTile: () => void;
  onSkipGuess: () => void;
}) {
  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/30 text-xs uppercase tracking-widest">내 타일</span>
        <span className="text-white/20 text-xs">덱 {deckCount}장</span>
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {tiles.map((tile: Tile) => (
          <TileCard key={tile.id} tile={tile} variant="face-up" />
        ))}
        {drawnTile && (
          <>
            <div className="w-px bg-white/10 self-stretch mx-1" />
            <TileCard tile={drawnTile} variant="face-up" />
          </>
        )}
      </div>

      {isMyTurn && (
        <div className="flex gap-2">
          {!hasDrawn ? (
            <button
              onClick={onDrawTile}
              disabled={deckCount === 0}
              className="flex-1 bg-amber-400 hover:bg-amber-300 disabled:opacity-20 text-slate-900 font-bold py-3 rounded-xl transition-colors"
            >
              타일 뽑기
            </button>
          ) : (
            <>
              <p className="text-white/30 text-xs self-center flex-1">타일을 뽑았습니다. 상대 타일을 눌러 추리하거나</p>
              <button
                onClick={onSkipGuess}
                className="bg-white/8 hover:bg-white/15 text-white/60 font-medium py-2.5 px-4 rounded-xl text-sm transition-colors whitespace-nowrap"
              >
                그냥 추가
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function GamePage({ room, myId, drawnTile, hasDrawnThisTurn, onDrawTile, onGuessTile, onSkipGuess, lastGuessResult }: Props) {
  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget | null>(null);

  const me = room.players.find(p => p.id === myId)!;
  const isMyTurn = room.players[room.currentTurnIndex]?.id === myId;
  const currentPlayer = room.players[room.currentTurnIndex];
  const opponents = room.players.filter(p => p.id !== myId);

  const handleTileClick = (playerId: string, tileId: string) => {
    setSelectedTarget({ playerId, tileId });
  };

  const handleGuess = (num: number | null, isJoker: boolean) => {
    if (!selectedTarget) return;
    onGuessTile(selectedTarget.playerId, selectedTarget.tileId, isJoker ? null : num);
    setSelectedTarget(null);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col p-4 gap-3 max-w-lg mx-auto">
      <TurnBanner isMyTurn={isMyTurn} playerName={currentPlayer?.nickname ?? ''} />

      {lastGuessResult && <GuessResultToast result={lastGuessResult} />}

      <div className="space-y-2 flex-1">
        {opponents.map((opponent: Player) => (
          <OpponentArea
            key={opponent.id}
            opponent={opponent}
            isMyTurn={isMyTurn}
            hasDrawn={hasDrawnThisTurn}
            selectedTileId={selectedTarget?.playerId === opponent.id ? selectedTarget.tileId : null}
            onTileClick={(tileId) => handleTileClick(opponent.id, tileId)}
          />
        ))}
      </div>

      {selectedTarget && (
        <GuessPanel
          onGuess={handleGuess}
          onCancel={() => setSelectedTarget(null)}
        />
      )}

      <MyHand
        tiles={me?.tiles ?? []}
        drawnTile={drawnTile}
        isMyTurn={isMyTurn}
        hasDrawn={hasDrawnThisTurn}
        deckCount={room.deck.length}
        onDrawTile={onDrawTile}
        onSkipGuess={onSkipGuess}
      />
    </div>
  );
}
