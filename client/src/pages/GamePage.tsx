import { useState } from 'react';
import { clsx } from 'clsx';
import type { GameRoom, Tile, Player } from '../types';
import { TileCard } from '../components/TileCard';

interface Props {
  room: GameRoom;
  myId: string;
  drawnTile: Tile | null;
  hasDrawnThisTurn: boolean;
  mustRevealTile: boolean;
  onDrawTile: () => void;
  onGuessTile: (targetPlayerId: string, tileId: string, guessedNumber: number | null) => void;
  onSkipGuess: () => void;
  onRevealOwnTile: (tileId: string) => void;
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
      result.correct
        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
        : 'bg-red-500/20 text-red-400 border border-red-500/30'
    )}>
      {result.correct ? '정답! 타일이 공개됐습니다.' : '틀렸습니다. 뽑은 타일이 공개됩니다.'}
    </div>
  );
}

function TileRow({ tiles, label, isMyTurn, hasDrawn, selectedTileId, onTileClick }: {
  tiles: Tile[];
  label: string;
  isMyTurn: boolean;
  hasDrawn: boolean;
  selectedTileId: string | null;
  onTileClick: (tileId: string) => void;
}) {
  if (tiles.length === 0) return null;
  return (
    <div>
      <p className="text-white/20 text-xs mb-1.5">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {tiles.map((tile) => (
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

function OpponentArea({ opponent, isMyTurn, hasDrawn, selectedTileId, onTileClick }: {
  opponent: Player;
  isMyTurn: boolean;
  hasDrawn: boolean;
  selectedTileId: string | null;
  onTileClick: (tileId: string) => void;
}) {
  const blackTiles = opponent.tiles.filter(t => t.color === 'black');
  const whiteTiles = opponent.tiles.filter(t => t.color === 'white');

  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs font-bold">
          {opponent.nickname[0].toUpperCase()}
        </div>
        <span className="text-white/50 text-xs font-medium">{opponent.nickname}</span>
        <span className="text-white/20 text-xs ml-auto">{opponent.tiles.length}장</span>
      </div>
      <div className="space-y-2">
        <TileRow
          tiles={blackTiles}
          label="검정"
          isMyTurn={isMyTurn}
          hasDrawn={hasDrawn}
          selectedTileId={selectedTileId}
          onTileClick={onTileClick}
        />
        <TileRow
          tiles={whiteTiles}
          label="흰색"
          isMyTurn={isMyTurn}
          hasDrawn={hasDrawn}
          selectedTileId={selectedTileId}
          onTileClick={onTileClick}
        />
      </div>
    </div>
  );
}

function GuessPanel({ onGuess, onCancel }: {
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
              guessNumber === i && !isJoker ? 'bg-amber-400 text-slate-900' : 'bg-white/8 hover:bg-white/15 text-white'
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

function MustRevealPanel({ myTiles, onReveal }: {
  myTiles: Tile[];
  onReveal: (tileId: string) => void;
}) {
  const unrevealed = myTiles.filter(t => !t.isRevealed);
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-3">
      <p className="text-red-400 text-sm font-bold">덱이 비었습니다</p>
      <p className="text-white/40 text-xs">공개할 내 타일을 선택하세요</p>
      <div className="flex gap-2 flex-wrap">
        {unrevealed.map((tile) => (
          <TileCard
            key={tile.id}
            tile={tile}
            variant="face-up"
            size="sm"
            onClick={() => onReveal(tile.id)}
          />
        ))}
      </div>
    </div>
  );
}

function MyHand({ tiles, drawnTile, isMyTurn, hasDrawn, deckCount, onDrawTile, onSkipGuess }: {
  tiles: Tile[];
  drawnTile: Tile | null;
  isMyTurn: boolean;
  hasDrawn: boolean;
  deckCount: number;
  onDrawTile: () => void;
  onSkipGuess: () => void;
}) {
  const blackTiles = tiles.filter(t => t.color === 'black');
  const whiteTiles = tiles.filter(t => t.color === 'white');

  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/30 text-xs uppercase tracking-widest">내 타일</span>
        <span className="text-white/20 text-xs">덱 {deckCount}장</span>
      </div>
      <div className="space-y-2 mb-4">
        {blackTiles.length > 0 && (
          <div>
            <p className="text-white/20 text-xs mb-1.5">검정</p>
            <div className="flex gap-2 flex-wrap">
              {blackTiles.map((tile) => (
                <TileCard key={tile.id} tile={tile} variant="face-up" />
              ))}
            </div>
          </div>
        )}
        {whiteTiles.length > 0 && (
          <div>
            <p className="text-white/20 text-xs mb-1.5">흰색</p>
            <div className="flex gap-2 flex-wrap">
              {whiteTiles.map((tile) => (
                <TileCard key={tile.id} tile={tile} variant="face-up" />
              ))}
            </div>
          </div>
        )}
        {drawnTile && (
          <div>
            <p className="text-amber-400/60 text-xs mb-1.5">방금 뽑음</p>
            <TileCard tile={drawnTile} variant="face-up" />
          </div>
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
              {deckCount === 0 ? '덱이 비었습니다' : '타일 뽑기'}
            </button>
          ) : (
            <>
              <p className="text-white/30 text-xs self-center flex-1">상대 타일을 눌러 추리하거나</p>
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

export function GamePage({
  room, myId, drawnTile, hasDrawnThisTurn, mustRevealTile,
  onDrawTile, onGuessTile, onSkipGuess, onRevealOwnTile, lastGuessResult,
}: Props) {
  const [selectedTarget, setSelectedTarget] = useState<SelectedTarget | null>(null);

  const me = room.players.find(p => p.id === myId)!;
  const isMyTurn = room.players[room.currentTurnIndex]?.id === myId;
  const currentPlayer = room.players[room.currentTurnIndex];
  const opponents = room.players.filter(p => p.id !== myId);

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
            onTileClick={(tileId) => setSelectedTarget({ playerId: opponent.id, tileId })}
          />
        ))}
      </div>

      {mustRevealTile && me && (
        <MustRevealPanel myTiles={me.tiles} onReveal={onRevealOwnTile} />
      )}

      {selectedTarget && !mustRevealTile && (
        <GuessPanel onGuess={handleGuess} onCancel={() => setSelectedTarget(null)} />
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
