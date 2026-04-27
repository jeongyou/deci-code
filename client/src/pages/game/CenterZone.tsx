import type { Phase, SelTarget } from './types';
import type { GamePhase } from '../../types';

interface Props {
  phase: Phase;
  roomPhase: GamePhase;
  isCurrentPlayerResolvingDraw: boolean;
  deckLength: number;
  selTarget: SelTarget | null;
  hasDrawnThisTurn: boolean;
  currentPlayerName: string | undefined;
  turnRemainingSec: number;
  turnDurationSec: 30 | 60;
  onDrawTile: () => void;
  onSkipGuess: () => void;
  onGuessClick: () => void;
  onContinueGuess: () => void;
}

export function CenterZone({ phase, roomPhase, isCurrentPlayerResolvingDraw, deckLength, selTarget, hasDrawnThisTurn, currentPlayerName, turnRemainingSec, turnDurationSec, onDrawTile, onSkipGuess, onGuessClick, onContinueGuess }: Props) {
  const progress = turnDurationSec > 0 ? Math.max(0, Math.min(1, turnRemainingSec / turnDurationSec)) : 0;
  return (
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
            <p style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700, color: '#8898b0', lineHeight: 1 }}>{deckLength}</p>
            <p style={{ fontFamily: 'Inter', fontSize: 8, color: '#4e6080', letterSpacing: 1 }}>DECK</p>
          </div>
        </div>

        <div style={{ width: 40, height: 1, background: '#2a3a54' }}/>

        <div style={{ width: 150, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center' }}>
          <div style={{ width: '100%', height: 4, borderRadius: 2, background: '#1b2536', overflow: 'hidden', border: '1px solid #2a3a54' }}>
            <div style={{ width: `${progress * 100}%`, height: '100%', background: turnRemainingSec <= 10 ? '#eb5757' : '#c8a84b', transition: 'width .3s ease' }}/>
          </div>
          <span style={{ fontFamily: 'Inter', fontSize: 10, color: turnRemainingSec <= 10 ? '#eb5757' : '#8898b0' }}>{turnRemainingSec}s</span>
        </div>

        {/* 액션 */}
        <div style={{ textAlign: 'center', maxWidth: 180 }}>
          {phase === 'draw' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#8898b0' }}>타일을 뽑고 추리하세요</p>
              <button onClick={onDrawTile} style={{ background: '#c8a84b', color: '#0a0a0c', border: 'none', borderRadius: 3, padding: '8px 18px', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>타일 뽑기</button>
            </div>
          )}
          {phase === 'insert' && (
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#b080ff', animation: 'blink 1.5s ease infinite' }}>조커 배치 위치를 선택하세요</p>
          )}
          {phase === 'select' && <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#c8a84b', animation: 'blink 2s ease infinite' }}>타일을 선택하세요</p>}
          {phase === 'correct' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#6fcf97' }}>정답!</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={onContinueGuess} style={{ background: 'rgba(39,174,96,.12)', border: '1.5px solid #27ae60', color: '#6fcf97', borderRadius: 5, padding: '10px 16px', fontFamily: 'Inter', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>계속 추리</button>
                <button onClick={onSkipGuess} style={{ background: 'none', border: '1.5px solid #2a3a54', color: '#8898b0', borderRadius: 5, padding: '10px 16px', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>턴 종료</button>
              </div>
            </div>
          )}
          {phase === 'penalty' && <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#eb5757', animation: 'blink 1.5s ease infinite' }}>내 타일을 선택하세요</p>}
          {phase === 'wait' && (
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: isCurrentPlayerResolvingDraw || roomPhase === 'insert' ? '#c8a84b' : '#4e6080', animation: isCurrentPlayerResolvingDraw || roomPhase === 'insert' ? 'blink 1.5s ease infinite' : 'none' }}>
              {isCurrentPlayerResolvingDraw || roomPhase === 'insert' ? `${currentPlayerName}님이 타일을 정리하는 중` : `${currentPlayerName}의 차례`}
            </p>
          )}

          {(phase === 'select' || phase === 'correct') && selTarget && (
            <button onClick={onGuessClick} style={{ background: '#c8a84b', color: '#0a0a0c', border: 'none', borderRadius: 3, padding: '9px 20px', fontFamily: 'Inter', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 8, display: 'block', width: '100%' }}>추리하기</button>
          )}
          {phase === 'select' && !selTarget && hasDrawnThisTurn && (
            <button onClick={onSkipGuess} style={{ marginTop: 8, background: 'none', border: '1px solid #2a3a54', color: '#4e6080', borderRadius: 3, padding: '5px 14px', fontFamily: 'Inter', fontSize: 11, cursor: 'pointer' }}>패스</button>
          )}
        </div>
      </div>
    </div>
  );
}
