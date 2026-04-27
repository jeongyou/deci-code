import { useEffect } from 'react';
import type { GuessResult } from '../../types';

interface Props {
  result: GuessResult;
  onContinue: () => void;
  onEnd: () => void;
}

export function GuessResultOverlay({ result, onContinue, onEnd }: Props) {
  const { correct, tile, guessedColor, guessedNumber } = result;

  useEffect(() => {
    if (!correct) {
      const t = setTimeout(onEnd, 2400);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tileLabel = tile.color === 'joker'
    ? '★ 조커'
    : `${tile.color === 'white' ? '백' : '흑'} ${tile.number}`;

  const guessedLabel = guessedColor === 'joker'
    ? '★ 조커'
    : `${guessedColor === 'white' ? '백' : '흑'} ${guessedNumber}`;

  const accent = correct ? '#27ae60' : '#eb5757';
  const accentDim = correct ? 'rgba(39,174,96,.12)' : 'rgba(235,87,87,.12)';
  const bg = correct ? 'rgba(0,18,8,.90)' : 'rgba(18,0,0,.90)';

  return (
    <div style={{
      position: 'fixed', inset: 0, background: bg, zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'result-overlay-in .2s ease',
    }}>
      <div style={{
        background: '#1b2536', border: `1.5px solid ${accent}`,
        borderRadius: 12, padding: '36px 40px', width: 'min(380px, 90vw)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        animation: 'result-card-in .22s cubic-bezier(.22,.68,0,1.2)',
        boxShadow: `0 0 60px ${correct ? 'rgba(39,174,96,.25)' : 'rgba(235,87,87,.25)'}, 0 24px 80px rgba(0,0,0,.7)`,
      }}>

        {/* 아이콘 */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: accentDim, border: `2px solid ${accent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 36, lineHeight: 1, color: accent }}>
            {correct ? '✓' : '✕'}
          </span>
        </div>

        {/* 제목 */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'Playfair Display', fontSize: 32, fontWeight: 700,
            color: accent, lineHeight: 1, marginBottom: 8,
          }}>
            {correct ? '정답!' : '오답'}
          </p>
          {correct ? (
            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#8898b0' }}>
              <span style={{ color: '#dde3ee', fontWeight: 600 }}>{tileLabel}</span> — 공개됩니다
            </p>
          ) : (
            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#8898b0' }}>
              선언: <span style={{ color: '#dde3ee' }}>{guessedLabel}</span>
            </p>
          )}
        </div>

        {/* 버튼 */}
        {correct ? (
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button
              onClick={onContinue}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 6,
                border: '1.5px solid #27ae60', background: 'rgba(39,174,96,.15)',
                color: '#27ae60', fontFamily: 'Inter', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', transition: 'all .12s',
              }}
            >
              계속 추리
            </button>
            <button
              onClick={onEnd}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 6,
                border: '1.5px solid #2a3a54', background: 'transparent',
                color: '#8898b0', fontFamily: 'Inter', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', transition: 'all .12s',
              }}
            >
              턴 종료
            </button>
          </div>
        ) : (
          <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#4e6080' }}>
            잠시 후 자동으로 넘어갑니다…
          </p>
        )}
      </div>

      <style>{`
        @keyframes result-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes result-card-in {
          from { opacity: 0; transform: scale(.88); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
