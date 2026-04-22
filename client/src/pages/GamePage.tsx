import { useState, useEffect } from 'react';
import type { GameRoom, Tile, TileColor } from '../types';
import { Toasts } from '../components/Toasts';
import type { Toast } from '../components/Toasts';
import { GuessModal } from './game/GuessModal';
import { PenaltyModal } from './game/PenaltyModal';
import { JokerInsertModal } from './game/JokerInsertModal';
import { TopSeat } from './game/TopSeat';
import { SideSeat } from './game/SideSeat';
import { MySeat } from './game/MySeat';
import { CenterZone } from './game/CenterZone';
import { GameSidebar } from './game/GameSidebar';
import type { SelTarget, Phase } from './game/types';

interface Props {
  room: GameRoom;
  myId: string;
  drawnTile: Tile | null;
  hasDrawnThisTurn: boolean;
  mustPlaceJoker: boolean;
  mustRevealTile: boolean;
  onDrawTile: () => void;
  onPlaceJoker: (position: number) => void;
  onGuessTile: (targetPlayerId: string, tileId: string, guessedColor: TileColor, guessedNumber: number | null) => void;
  onSkipGuess: () => void;
  onRevealOwnTile: (tileId: string) => void;
  lastGuessResult: { correct: boolean; tile: Tile } | null;
}

export function GamePage({ room, myId, drawnTile, hasDrawnThisTurn, mustPlaceJoker, mustRevealTile, onDrawTile, onPlaceJoker, onGuessTile, onSkipGuess, onRevealOwnTile, lastGuessResult }: Props) {
  const [showGuess, setShowGuess] = useState(false);
  const [selTarget, setSelTarget] = useState<SelTarget | null>(null);
  const [guessedCorrectly, setGuessedCorrectly] = useState(false);
  const [seenTurnIndex, setSeenTurnIndex] = useState(room.currentTurnIndex);
  const [seenGuessResult, setSeenGuessResult] = useState(lastGuessResult);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [animMap, setAnimMap] = useState<Record<string, 'appear' | 'flip' | 'shake'>>({});
  const [log, setLog] = useState<string[]>(['게임 시작']);

  const me = room.players.find(p => p.id === myId)!;
  const isMyTurn = room.players[room.currentTurnIndex]?.id === myId;
  const currentPlayer = room.players[room.currentTurnIndex];
  const opponents = room.players.filter(p => p.id !== myId);
  const seats = { top: opponents[0] ?? null, left: opponents[1] ?? null, right: opponents[2] ?? null };

  const phase: Phase = !isMyTurn ? 'wait'
    : mustRevealTile ? 'penalty'
    : mustPlaceJoker ? 'insert'
    : !hasDrawnThisTurn ? 'draw'
    : guessedCorrectly ? 'correct'
    : 'select';

  function addToast(msg: string, type: Toast['type'] = 'info', ms = 2600) {
    const id = Date.now();
    setTimeout(() => {
      setToasts(p => [...p, { id, msg, type, fading: false }]);
      setTimeout(() => {
        setToasts(p => p.map(t => t.id === id ? { ...t, fading: true } : t));
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 280);
      }, ms);
    }, 0);
  }

  function addAnim(tileId: string, type: 'appear' | 'flip' | 'shake') {
    setTimeout(() => {
      setAnimMap(p => ({ ...p, [tileId]: type }));
      setTimeout(() => setAnimMap(p => { const n = { ...p }; delete n[tileId]; return n; }), 500);
    }, 0);
  }

  // 턴 변경 — render-time state reset
  if (seenTurnIndex !== room.currentTurnIndex) {
    setSeenTurnIndex(room.currentTurnIndex);
    setSelTarget(null);
    setShowGuess(false);
    setGuessedCorrectly(false);
    setLog(p => [`${currentPlayer?.nickname ?? '?'}의 차례`, ...p.slice(0, 29)]);
  }

  // 턴 변경 — toast (async)
  useEffect(() => {
    if (isMyTurn) {
      addToast(room.deck.length === 0 ? '덱이 비었습니다 — 바로 추리하세요' : '당신의 차례입니다', 'success');
    }
  }, [room.currentTurnIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // 추리 결과 — render-time state + log
  if (lastGuessResult !== seenGuessResult) {
    setSeenGuessResult(lastGuessResult);
    if (lastGuessResult) {
      setGuessedCorrectly(lastGuessResult.correct);
      const { tile } = lastGuessResult;
      const label = tile.color === 'joker' ? '조커' : `${tile.color === 'white' ? '백' : '흑'}${tile.number}`;
      setLog(p => [lastGuessResult.correct ? `정답 적중 [${label}]` : '추리 실패', ...p.slice(0, 29)]);
    }
  }

  // 추리 결과 — toast/anim (async)
  useEffect(() => {
    if (!lastGuessResult) return;
    if (lastGuessResult.correct) {
      const { tile } = lastGuessResult;
      const label = tile.color === 'joker' ? '조커' : tile.number;
      addToast(`정답 — ${label}`, 'success', 3200);
      addAnim(tile.id, 'flip');
    } else {
      addToast('틀렸습니다', 'error', 3000);
    }
  }, [lastGuessResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const canInteract = phase === 'select' || phase === 'correct';

  function handleTileClick(playerId: string, tileId: string, tileIdx: number) {
    setSelTarget({ playerId, tileId, tileIdx });
    setShowGuess(true);
  }

  function handleGuess(color: TileColor, num: number | null) {
    if (!selTarget) return;
    setShowGuess(false);
    onGuessTile(selTarget.playerId, selTarget.tileId, color, num);
    setSelTarget(null);
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#131c2b', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'screen-in .3s ease' }}>

      {showGuess && <GuessModal onGuess={handleGuess} onCancel={() => { setShowGuess(false); setSelTarget(null); }}/>}
      {mustRevealTile && me && <PenaltyModal myTiles={me.tiles} onReveal={onRevealOwnTile}/>}
      {mustPlaceJoker && me && <JokerInsertModal myTiles={me.tiles} onPlace={onPlaceJoker}/>}
      <Toasts list={toasts}/>

      {/* NAV */}
      <div style={{ height: 46, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #2a3a54', flexShrink: 0, background: '#1b2536' }}>
        <span style={{ fontFamily: 'Playfair Display', fontSize: 15, letterSpacing: 4, color: '#c8a84b', fontWeight: 700 }}>DA VINCI CODE</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 11, height: 15, borderRadius: 2, background: '#bfbab0', border: '1px solid #a09890' }}/><span style={{ fontFamily: 'Inter', fontSize: 10, color: '#8898b0' }}>백</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 11, height: 15, borderRadius: 2, background: '#161618', border: '1px solid #2e2e2e' }}/><span style={{ fontFamily: 'Inter', fontSize: 10, color: '#8898b0' }}>흑</span>
          </div>
          <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#4e6080' }}>≤ 오름차순</span>
          <div style={{ width: 1, height: 16, background: '#2a3a54' }}/>
          <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#4e6080' }}>덱 {room.deck.length}장</span>
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'grid', gridTemplateRows: 'auto 1fr auto', overflow: 'hidden', minWidth: 0 }}>

          {seats.top && (
            <TopSeat
              player={seats.top}
              isActive={room.players[room.currentTurnIndex]?.id === seats.top.id}
              isEliminated={seats.top.tiles.every(t => t.isRevealed)}
              canInteract={canInteract}
              selTarget={selTarget}
              onTileClick={(tileId, idx) => handleTileClick(seats.top!.id, tileId, idx)}
              animMap={animMap}
            />
          )}

          <div style={{ display: 'flex', overflow: 'hidden', minHeight: 0 }}>
            {seats.left && (
              <SideSeat
                player={seats.left} side="left"
                isActive={room.players[room.currentTurnIndex]?.id === seats.left.id}
                isEliminated={seats.left.tiles.every(t => t.isRevealed)}
                canInteract={canInteract}
                selTarget={selTarget}
                onTileClick={(tileId, idx) => handleTileClick(seats.left!.id, tileId, idx)}
                animMap={animMap}
              />
            )}

            <CenterZone
              phase={phase}
              deckLength={room.deck.length}
              selTarget={selTarget}
              hasDrawnThisTurn={hasDrawnThisTurn}
              currentPlayerName={currentPlayer?.nickname}
              onDrawTile={onDrawTile}
              onSkipGuess={onSkipGuess}
              onGuessClick={() => setShowGuess(true)}
              onContinueGuess={() => setGuessedCorrectly(false)}
            />

            {seats.right && (
              <SideSeat
                player={seats.right} side="right"
                isActive={room.players[room.currentTurnIndex]?.id === seats.right.id}
                isEliminated={seats.right.tiles.every(t => t.isRevealed)}
                canInteract={canInteract}
                selTarget={selTarget}
                onTileClick={(tileId, idx) => handleTileClick(seats.right!.id, tileId, idx)}
                animMap={animMap}
              />
            )}
          </div>

          <MySeat me={me} isMyTurn={isMyTurn} animMap={animMap} drawnTileId={drawnTile?.id ?? null}/>
        </div>

        <GameSidebar
          players={room.players}
          myId={myId}
          currentTurnIndex={room.currentTurnIndex}
          phase={phase}
          isMyTurn={isMyTurn}
          log={log}
        />
      </div>

      <style>{`@media(max-width:700px){.sidebar{display:none!important}}`}</style>
    </div>
  );
}
