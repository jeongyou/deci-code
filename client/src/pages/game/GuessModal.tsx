import { useState } from 'react';

interface Props { onGuess: (n: number | null) => void; onCancel: () => void; }

export function GuessModal({ onGuess, onCancel }: Props) {
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
