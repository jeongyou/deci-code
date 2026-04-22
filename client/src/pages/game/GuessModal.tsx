import { useState } from 'react';
import type { TileColor } from '../../types';

interface Props {
  onGuess: (color: TileColor, n: number | null) => void;
  onCancel: () => void;
}

const BTN_BASE: React.CSSProperties = {
  borderRadius: 4, fontFamily: 'Inter', cursor: 'pointer', transition: 'all .12s',
};

export function GuessModal({ onGuess, onCancel }: Props) {
  const [color, setColor] = useState<TileColor | null>(null);
  const [num, setNum] = useState<number | null | 'J'>(null);

  const canSubmit = color !== null && (color === 'joker' || num !== null);

  function handleSubmit() {
    if (!canSubmit || color === null) return;
    if (color === 'joker') { onGuess('joker', null); return; }
    onGuess(color, num === 'J' ? null : (num as number));
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1b2536', border: '1px solid #2a3a54', borderRadius: 8, padding: '28px 30px', width: 'min(380px,92vw)', animation: 'modal-in .2s ease', boxShadow: '0 24px 80px rgba(0,0,0,.7)' }}>
        <p style={{ fontFamily: 'Playfair Display', fontSize: 20, color: '#dde3ee', marginBottom: 4, letterSpacing: 1 }}>추리하기</p>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#4e6080', marginBottom: 20 }}>색상 → 숫자 순서로 선택하세요</p>

        {/* 색상 선택 */}
        <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#4e6080', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>색상</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {([
            { value: 'black' as TileColor, label: '흑', bg: '#161618', border: '#3a3a3a', text: '#e0e0e0' },
            { value: 'white' as TileColor, label: '백', bg: '#bfbab0', border: '#888', text: '#1a1a1a' },
            { value: 'joker' as TileColor, label: '조커', bg: '#2a1a4a', border: '#6a3db0', text: '#b080ff' },
          ]).map(c => (
            <button key={c.value} onClick={() => { setColor(c.value); setNum(null); }} style={{
              ...BTN_BASE,
              flex: 1, padding: '10px 0',
              border: color === c.value ? `2px solid #c8a84b` : `1.5px solid ${c.border}`,
              background: color === c.value ? `rgba(200,168,75,.1)` : c.bg,
              color: color === c.value ? '#c8a84b' : c.text,
              fontFamily: 'Inter', fontSize: 13, fontWeight: 600,
            }}>{c.label}</button>
          ))}
        </div>

        {/* 숫자 선택 (조커 선택 시 숨김) */}
        {color !== null && color !== 'joker' && (
          <>
            <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#4e6080', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>숫자</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
              {([0,1,2,3,4,5,6,7,8,9,10,11] as number[]).map(n => (
                <button key={n} onClick={() => setNum(n)} style={{
                  ...BTN_BASE,
                  width: 46, height: 46,
                  border: num === n ? '1.5px solid #c8a84b' : '1.5px solid #2a3a54',
                  background: num === n ? 'rgba(200,168,75,.15)' : '#212e44',
                  color: num === n ? '#c8a84b' : '#8898b0',
                  fontFamily: 'Playfair Display', fontSize: 19, fontWeight: 700,
                }}>{n}</button>
              ))}
            </div>
          </>
        )}

        {color === 'joker' && (
          <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#b080ff', marginBottom: 24 }}>조커로 선언합니다</p>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ ...BTN_BASE, padding: '8px 18px', border: '1px solid #2a3a54', background: 'transparent', color: '#4e6080', fontSize: 13 }}>취소</button>
          <button onClick={handleSubmit} style={{
            ...BTN_BASE,
            padding: '8px 22px',
            border: `1px solid ${canSubmit ? '#c8a84b' : '#2a3a54'}`,
            background: canSubmit ? '#c8a84b' : 'transparent',
            color: canSubmit ? '#0a0a0c' : '#4e6080',
            fontSize: 13, fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}>확인</button>
        </div>
      </div>
    </div>
  );
}
