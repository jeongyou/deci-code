import { useState, useEffect } from 'react';
import type { GameRoom, Tile, Player } from '../types';
import { TileCard } from '../components/TileCard';
import { OrderGap } from '../components/OrderGap';

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

interface Toast { id: number; msg: string; type: 'success' | 'error' | 'info'; fading: boolean; }
interface SelTarget { playerId: string; tileIdx: number; tileId: string; }

type Phase = 'wait' | 'draw' | 'select' | 'correct' | 'penalty';

/* ── Toast overlay ── */
function Toasts({ list }: { list: Toast[] }) {
  return (
    <div style={{ position: 'fixed', top: 52, right: 12, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'none' }}>
      {list.map(t => (
        <div key={t.id} style={{
          background: t.type === 'success' ? '#172b22' : t.type === 'error' ? '#2a1616' : '#1b2536',
          border: `1px solid ${t.type === 'success' ? '#2d6a4a' : t.type === 'error' ? '#6a2d2d' : '#2a3a54'}`,
          color: t.type === 'success' ? '#6fcf97' : t.type === 'error' ? '#eb5757' : '#8898b0',
          padding: '9px 14px', borderRadius: 4, fontFamily: 'Inter', fontSize: 12, fontWeight: 500,
          animation: t.fading ? 'toast-out .25s ease forwards' : 'toast-in .25s ease', maxWidth: 240, lineHeight: 1.5,
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

/* ── Guess modal ── */
function GuessModal({ onGuess, onCancel }: { onGuess: (n: number | null) => void; onCancel: () => void }) {
  const [pick, setPick] = useState<number | null | 'J'>(null);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1b2536', border: '1px solid #2a3a54', borderRadius: 8, padding: '28px 30px', width: 'min(380px,92vw)', animation: 'modal-in .2s ease', boxShadow: '0 24px 80px rgba(0,0,0,.7)' }}>
        <p style={{ fontFamily: 'Playfair Display', fontSize: 20, color: '#dde3ee', marginBottom: 4, letterSpacing: 1 }}>추리하기</p>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#4e6080', marginBottom: 22 }}>선택한 타일의 숫자를 맞혀보세요</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
          {([0,1,2,3,4,5,6,7,8,9,10,11,'J'] as (number|'J')[]).map(n => (
            <button key={n} onClick={() => setPick(n)} style={{
              width: 46, height: 46, borderRadius: 4,
              border: pick === n ? '1.5px solid #c8a84b' : '1.5px solid #2a3a54',
              background: pick === n ? 'rgba(200,168,75,.15)' : '#212e44',
              color: pick === n ? '#c8a84b' : '#8898b0',
              fontFamily: 'Playfair Display', fontSize: 19, fontWeight: 700, cursor: 'pointer', transition: 'all .12s',
            }}>
              {n === 'J' ? '–' : n}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 4, border: '1px solid #2a3a54', background: 'transparent', color: '#4e6080', fontFamily: 'Inter', fontSize: 13, cursor: 'pointer' }}>취소</button>
          <button onClick={() => pick !== null && onGuess(pick === 'J' ? null : pick as number)} style={{
            padding: '8px 22px', borderRadius: 4,
            border: `1px solid ${pick !== null ? '#c8a84b' : '#2a3a54'}`,
            background: pick !== null ? '#c8a84b' : 'transparent',
            color: pick !== null ? '#0a0a0c' : '#4e6080',
            fontFamily: 'Inter', fontSize: 13, fontWeight: 600,
            cursor: pick !== null ? 'pointer' : 'not-allowed', transition: 'all .12s',
          }}>확인</button>
        </div>
      </div>
    </div>
  );
}

/* ── Penalty modal ── */
function PenaltyModal({ myTiles, onReveal }: { myTiles: Tile[]; onReveal: (tileId: string) => void }) {
  const [pick, setPick] = useState<string | null>(null);
  const unrevealed = myTiles.filter(t => !t.isRevealed);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1b2536', border: '1.5px solid #9b4040', borderRadius: 8, padding: '28px 30px', width: 'min(400px,92vw)', animation: 'modal-in .2s ease', boxShadow: '0 24px 80px rgba(0,0,0,.7)' }}>
        <p style={{ fontFamily: 'Playfair Display', fontSize: 20, color: '#eb5757', marginBottom: 4, letterSpacing: 1 }}>추리 실패</p>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#8898b0', marginBottom: 6 }}>덱이 비어 있습니다.</p>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#4e6080', marginBottom: 22 }}>내 타일 중 하나를 선택해 공개하세요.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 26 }}>
          {unrevealed.map(t => (
            <div key={t.id} onClick={() => setPick(t.id)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                padding: 3, borderRadius: 6,
                border: pick === t.id ? '2px solid #eb5757' : '2px solid transparent',
                boxShadow: pick === t.id ? '0 0 12px rgba(235,87,87,.4)' : 'none', transition: 'all .15s',
              }}>
                <TileCard tile={t} faceDown={false} size="md"/>
              </div>
              <span style={{ fontFamily: 'Inter', fontSize: 9, color: pick === t.id ? '#eb5757' : '#4e6080' }}>
                {t.color === 'white' ? '백' : '흑'} {t.isJoker ? '조커' : t.number}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => pick !== null && onReveal(pick)} style={{
            padding: '9px 24px', borderRadius: 4, border: '1px solid #eb5757',
            background: pick !== null ? '#eb5757' : 'transparent',
            color: pick !== null ? '#fff' : '#4e6080',
            fontFamily: 'Inter', fontSize: 13, fontWeight: 600,
            cursor: pick !== null ? 'pointer' : 'not-allowed', transition: 'all .12s',
          }}>공개하기</button>
        </div>
      </div>
    </div>
  );
}

/* ── TileRow (with OrderGap) ── */
function TileRow({ tiles, faceDown, colorVisible, selectedTileId, onTileClick, animMap, drawnTileId, size = 'md' }: {
  tiles: Tile[];
  faceDown: boolean;
  colorVisible: boolean;
  selectedTileId?: string | null;
  onTileClick?: (tileId: string, idx: number) => void;
  animMap: Record<string, 'appear' | 'flip' | 'shake'>;
  drawnTileId?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}>
      {tiles.map((tile, idx) => (
        <div key={tile.id} style={{ display: 'flex', alignItems: 'center' }}>
          {idx > 0 && (
            <OrderGap
              left={tiles[idx - 1]} right={tile}
              leftVisible={!faceDown || tiles[idx - 1].isRevealed}
              rightVisible={!faceDown || tile.isRevealed}
            />
          )}
          <TileCard
            tile={tile}
            faceDown={faceDown && !tile.isRevealed}
            colorVisible={faceDown && colorVisible}
            size={size}
            selected={selectedTileId === tile.id}
            onClick={onTileClick && !tile.isRevealed ? () => onTileClick(tile.id, idx) : undefined}
            anim={animMap[tile.id]}
            isNew={tile.id === drawnTileId}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Avatar ── */
function Avatar({ initials, active, size = 28 }: { initials: string; active: boolean; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: active ? 'rgba(200,168,75,.15)' : '#212e44',
      border: `1.5px solid ${active ? '#c8a84b' : '#2a3a54'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontFamily: 'Playfair Display', fontSize: size * .38, color: active ? '#c8a84b' : '#8898b0', fontWeight: 700, lineHeight: 1 }}>{initials}</span>
    </div>
  );
}

/* ── Main GamePage ── */
export function GamePage({ room, myId, drawnTile, hasDrawnThisTurn, mustRevealTile, onDrawTile, onGuessTile, onSkipGuess, onRevealOwnTile, lastGuessResult }: Props) {
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

  const phase: Phase = !isMyTurn ? 'wait'
    : mustRevealTile ? 'penalty'
    : !hasDrawnThisTurn ? 'draw'
    : guessedCorrectly ? 'correct'
    : 'select';

  // async 래핑 — effect 내 동기 setState 없이 호출 가능
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

  function addLog(msg: string) {
    setLog(p => [msg, ...p.slice(0, 29)]);
  }

  // async 래핑 — effect 내 동기 setState 없이 호출 가능
  function addAnim(tileId: string, type: 'appear' | 'flip' | 'shake') {
    setTimeout(() => {
      setAnimMap(p => ({ ...p, [tileId]: type }));
      setTimeout(() => setAnimMap(p => { const n = { ...p }; delete n[tileId]; return n; }), 500);
    }, 0);
  }

  // 턴 변경 — render-time state reset (React 권장 패턴)
  if (seenTurnIndex !== room.currentTurnIndex) {
    setSeenTurnIndex(room.currentTurnIndex);
    setSelTarget(null);
    setShowGuess(false);
    setGuessedCorrectly(false);
    addLog(`${currentPlayer?.nickname ?? '?'}의 차례`);
  }

  // 턴 변경 — toast 사이드이펙트만 (addToast는 async, 동기 setState 없음)
  useEffect(() => {
    if (isMyTurn) {
      addToast(room.deck.length === 0 ? '덱이 비었습니다 — 바로 추리하세요' : '당신의 차례입니다', 'success');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.currentTurnIndex]);

  // 추리 결과 — render-time state + log (동기 setState, effect 아님)
  if (lastGuessResult !== seenGuessResult) {
    setSeenGuessResult(lastGuessResult);
    if (lastGuessResult) {
      setGuessedCorrectly(lastGuessResult.correct);
      const tile = lastGuessResult.tile;
      addLog(lastGuessResult.correct
        ? `정답 적중 [${tile.color === 'white' ? '백' : '흑'}${tile.isJoker ? '조커' : tile.number}]`
        : '추리 실패'
      );
    }
  }

  // 추리 결과 — toast/anim 사이드이펙트만 (async, 동기 setState 없음)
  useEffect(() => {
    if (!lastGuessResult) return;
    if (lastGuessResult.correct) {
      addToast(`정답 — ${lastGuessResult.tile.isJoker ? '조커' : lastGuessResult.tile.number}`, 'success', 3200);
      addAnim(lastGuessResult.tile.id, 'flip');
    } else {
      addToast('틀렸습니다', 'error', 3000);
    }
  }, [lastGuessResult]);

  function handleTileClick(playerId: string, tileId: string, tileIdx: number) {
    if (phase !== 'select' && phase !== 'correct') return;
    setSelTarget({ playerId, tileId, tileIdx });
    setShowGuess(true);
  }

  function handleGuess(num: number | null) {
    if (!selTarget) return;
    setShowGuess(false);
    onGuessTile(selTarget.playerId, selTarget.tileId, num);
    setSelTarget(null);
  }

  const eliminated = (p: Player) => p.tiles.length > 0 && p.tiles.every(t => t.isRevealed);
  const drawnTileId = drawnTile?.id ?? null;

  // Layout: top / (left | center | right) / bottom
  const seats = { top: opponents[0] ?? null, left: opponents[1] ?? null, right: opponents[2] ?? null };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#131c2b', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'screen-in .3s ease' }}>

      {showGuess && <GuessModal onGuess={handleGuess} onCancel={() => { setShowGuess(false); setSelTarget(null); }}/>}
      {mustRevealTile && me && <PenaltyModal myTiles={me.tiles} onReveal={onRevealOwnTile}/>}
      <Toasts list={toasts}/>

      {/* ── NAV ── */}
      <div style={{ height: 46, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #2a3a54', flexShrink: 0, background: '#1b2536' }}>
        <span style={{ fontFamily: 'Playfair Display', fontSize: 15, letterSpacing: 4, color: '#c8a84b', fontWeight: 700 }}>DA VINCI CODE</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 11, height: 15, borderRadius: 2, background: '#bfbab0', border: '1px solid #a09890' }}/>
            <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#8898b0' }}>백</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 11, height: 15, borderRadius: 2, background: '#161618', border: '1px solid #2e2e2e' }}/>
            <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#8898b0' }}>흑</span>
          </div>
          <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#4e6080' }}>≤ 오름차순</span>
          <div style={{ width: 1, height: 16, background: '#2a3a54' }}/>
          <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#4e6080' }}>덱 {room.deck.length}장</span>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* TABLE */}
        <div style={{ flex: 1, display: 'grid', gridTemplateRows: 'auto 1fr auto', overflow: 'hidden', minWidth: 0 }}>

          {/* TOP SEAT */}
          {seats.top && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 20px 8px', borderBottom: '1px solid #2a3a54', opacity: eliminated(seats.top) ? .35 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                <Avatar initials={seats.top.nickname[0]} active={room.currentTurnIndex === room.players.indexOf(seats.top)} size={22}/>
                <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 500, color: room.players[room.currentTurnIndex]?.id === seats.top.id ? '#c8a84b' : '#8898b0' }}>
                  {seats.top.nickname}
                </span>
                {room.players[room.currentTurnIndex]?.id === seats.top.id && (
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#c8a84b', animation: 'blink 1.2s ease infinite' }}/>
                )}
              </div>
              <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                <TileRow
                  tiles={seats.top.tiles} faceDown={true} colorVisible={true}
                  selectedTileId={selTarget?.playerId === seats.top.id ? selTarget.tileId : null}
                  onTileClick={(tileId, idx) => (phase === 'select' || phase === 'correct') && handleTileClick(seats.top!.id, tileId, idx)}
                  animMap={animMap} size="sm"
                />
              </div>
            </div>
          )}

          {/* MIDDLE ROW */}
          <div style={{ display: 'flex', overflow: 'hidden', minHeight: 0 }}>

            {/* LEFT SEAT */}
            {seats.left && (
              <div style={{ width: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 8px', borderRight: '1px solid #2a3a54', opacity: eliminated(seats.left) ? .35 : 1, gap: 8 }}>
                <Avatar initials={seats.left.nickname[0]} active={room.players[room.currentTurnIndex]?.id === seats.left.id} size={22}/>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  {seats.left.tiles.map((tile, idx) => (
                    <div key={tile.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {idx > 0 && <span style={{ fontFamily: 'Inter', fontSize: 8, color: '#4e6080', lineHeight: 1 }}>≤</span>}
                      <TileCard
                        tile={tile} faceDown={!tile.isRevealed} colorVisible={true} size="xs"
                        selected={selTarget?.tileId === tile.id}
                        onClick={(phase === 'select' || phase === 'correct') && !tile.isRevealed ? () => handleTileClick(seats.left!.id, tile.id, idx) : undefined}
                        anim={animMap[tile.id]}
                      />
                    </div>
                  ))}
                </div>
                <span style={{ fontFamily: 'Inter', fontSize: 9, color: '#8898b0', marginTop: 'auto', textAlign: 'center', lineHeight: 1.3 }}>
                  {seats.left.nickname}
                </span>
              </div>
            )}

            {/* CENTER ZONE */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'radial-gradient(ellipse at center, rgba(42,58,84,.3) 0%, transparent 70%)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 12 }}>

                {/* 덱 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ position: 'relative', width: 40, height: 52 }}>
                    {[1, 0].map(i => (
                      <div key={i} style={{ position: 'absolute', top: -i * 2, left: i * 2, width: 40, height: 52, borderRadius: 4, background: '#1b2536', border: '1.5px solid #2a3a54', boxShadow: '0 2px 8px rgba(0,0,0,.3)', display: i === 0 ? 'flex' : 'block', alignItems: 'center', justifyContent: 'center' }}>
                        {i === 0 && <svg width="24" height="34" viewBox="0 0 30 42"><rect x="1" y="1" width="28" height="40" rx="2" fill="none" stroke="#2a3a54" strokeWidth="1"/><line x1="1" y1="1" x2="29" y2="41" stroke="#1e2d42" strokeWidth=".7"/><line x1="29" y1="1" x2="1" y2="41" stroke="#1e2d42" strokeWidth=".7"/></svg>}
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700, color: '#8898b0', lineHeight: 1 }}>{room.deck.length}</p>
                    <p style={{ fontFamily: 'Inter', fontSize: 8, color: '#4e6080', letterSpacing: 1 }}>DECK</p>
                  </div>
                </div>

                <div style={{ width: 40, height: 1, background: '#2a3a54' }}/>

                {/* 액션 영역 */}
                <div style={{ textAlign: 'center', maxWidth: 180 }}>
                  {phase === 'draw' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#8898b0' }}>타일을 뽑고 추리하세요</p>
                      <button onClick={onDrawTile} style={{ background: '#c8a84b', color: '#0a0a0c', border: 'none', borderRadius: 3, padding: '8px 18px', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>타일 뽑기</button>
                    </div>
                  )}
                  {phase === 'select' && <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#c8a84b', animation: 'blink 2s ease infinite' }}>타일을 선택하세요</p>}
                  {phase === 'correct' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#6fcf97' }}>정답!</p>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setGuessedCorrectly(false)} style={{ background: 'none', border: '1px solid #3b8a5e', color: '#6fcf97', borderRadius: 3, padding: '5px 10px', fontFamily: 'Inter', fontSize: 11, cursor: 'pointer' }}>계속</button>
                        <button onClick={onSkipGuess} style={{ background: 'none', border: '1px solid #2a3a54', color: '#8898b0', borderRadius: 3, padding: '5px 10px', fontFamily: 'Inter', fontSize: 11, cursor: 'pointer' }}>종료</button>
                      </div>
                    </div>
                  )}
                  {phase === 'penalty' && <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#eb5757', animation: 'blink 1.5s ease infinite' }}>내 타일을 선택하세요</p>}
                  {phase === 'wait' && <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#4e6080' }}>{currentPlayer?.nickname}의 차례</p>}

                  {(phase === 'select' || phase === 'correct') && selTarget && (
                    <button onClick={() => setShowGuess(true)} style={{ background: '#c8a84b', color: '#0a0a0c', border: 'none', borderRadius: 3, padding: '9px 20px', fontFamily: 'Inter', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 8, display: 'block', width: '100%' }}>추리하기</button>
                  )}

                  {phase === 'select' && !selTarget && hasDrawnThisTurn && (
                    <button onClick={onSkipGuess} style={{ marginTop: 8, background: 'none', border: '1px solid #2a3a54', color: '#4e6080', borderRadius: 3, padding: '5px 14px', fontFamily: 'Inter', fontSize: 11, cursor: 'pointer' }}>패스</button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SEAT */}
            {seats.right && (
              <div style={{ width: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 8px', borderLeft: '1px solid #2a3a54', opacity: eliminated(seats.right) ? .35 : 1, gap: 8 }}>
                <Avatar initials={seats.right.nickname[0]} active={room.players[room.currentTurnIndex]?.id === seats.right.id} size={22}/>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  {seats.right.tiles.map((tile, idx) => (
                    <div key={tile.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {idx > 0 && <span style={{ fontFamily: 'Inter', fontSize: 8, color: '#4e6080', lineHeight: 1 }}>≤</span>}
                      <TileCard
                        tile={tile} faceDown={!tile.isRevealed} colorVisible={true} size="xs"
                        selected={selTarget?.tileId === tile.id}
                        onClick={(phase === 'select' || phase === 'correct') && !tile.isRevealed ? () => handleTileClick(seats.right!.id, tile.id, idx) : undefined}
                        anim={animMap[tile.id]}
                      />
                    </div>
                  ))}
                </div>
                <span style={{ fontFamily: 'Inter', fontSize: 9, color: '#8898b0', marginTop: 'auto', textAlign: 'center', lineHeight: 1.3 }}>
                  {seats.right.nickname}
                </span>
              </div>
            )}
          </div>

          {/* BOTTOM — ME */}
          <div style={{ borderTop: `1px solid ${isMyTurn ? 'rgba(200,168,75,.3)' : '#2a3a54'}`, padding: '10px 20px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Avatar initials={me?.nickname[0] ?? '?'} active={isMyTurn} size={24}/>
              <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 500, color: isMyTurn ? '#c8a84b' : '#8898b0' }}>
                {isMyTurn ? '내 차례' : me?.nickname}
              </span>
              <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#4e6080', marginLeft: 'auto' }}>
                {me?.tiles.filter(t => !t.isRevealed).length} / {me?.tiles.length}
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <TileRow
                tiles={me?.tiles ?? []} faceDown={false} colorVisible={false}
                animMap={animMap} drawnTileId={drawnTileId} size="lg"
              />
            </div>
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div className="sidebar" style={{ width: 200, borderLeft: '1px solid #2a3a54', display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#1b2536' }}>
          {/* Players */}
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #2a3a54' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: 3, color: '#4e6080', textTransform: 'uppercase', marginBottom: 10 }}>Players</p>
            {room.players.map(p => {
              const isTurn = room.players[room.currentTurnIndex]?.id === p.id;
              const elim = eliminated(p);
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 0', borderBottom: '1px solid #1e2d42', opacity: elim ? .3 : 1 }}>
                  <Avatar initials={p.nickname[0]} active={isTurn} size={22}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: isTurn ? 600 : 400, color: isTurn ? '#c8a84b' : '#8898b0', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.nickname}{p.id === myId ? ' ★' : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    {p.tiles.map((t, i) => (
                      <div key={i} style={{ width: 4, height: 13, borderRadius: 1, background: t.isRevealed ? '#2a3a54' : t.color === 'white' ? '#c0b8a0' : '#282828', border: t.color === 'white' && !t.isRevealed ? '0.5px solid #888' : '0.5px solid #2a2a2a', opacity: t.isRevealed ? .3 : 1 }}/>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Phase */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #2a3a54' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: 3, color: '#4e6080', textTransform: 'uppercase', marginBottom: 8 }}>Phase</p>
            {([{ key: 'draw', label: '타일 뽑기' }, { key: 'select', label: '타일 선택' }, { key: 'correct', label: '정답 처리' }] as const).map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: phase === s.key && isMyTurn ? '#c8a84b' : '#2a3a54' }}/>
                <span style={{ fontFamily: 'Inter', fontSize: 11, color: phase === s.key && isMyTurn ? '#8898b0' : '#4e6080' }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Log */}
          <div style={{ flex: 1, padding: '10px 14px', overflow: 'hidden' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: 3, color: '#4e6080', textTransform: 'uppercase', marginBottom: 8 }}>Log</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', height: 'calc(100% - 26px)' }}>
              {log.map((entry, i) => (
                <p key={i} style={{ fontFamily: 'Inter', fontSize: 11, lineHeight: 1.5, color: i === 0 ? '#8898b0' : '#4e6080', borderLeft: i === 0 ? '1.5px solid #2a3a54' : '1.5px solid transparent', paddingLeft: 6 }}>
                  {entry}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 모바일: 사이드바 숨김 CSS */}
      <style>{`@media(max-width:700px){.sidebar{display:none!important}}`}</style>
    </div>
  );
}
