import { useState } from 'react';

interface Props {
  onGuess: (kind: 'number' | 'joker', n: number | null) => void;
  onCancel: () => void;
}

const BTN_BASE: React.CSSProperties = {
  borderRadius: 4, fontFamily: 'Inter', cursor: 'pointer', transition: 'all .12s',
};

export function GuessModal({ onGuess, onCancel }: Props) {
  const [mode, setMode] = useState<'number' | 'joker'>('number');
  const [num, setNum] = useState<number | null>(null);

  const canSubmit = mode === 'joker' || num !== null;

  function handleSubmit() {
    if (!canSubmit) return;
    if (mode === 'joker') { onGuess('joker', null); return; }
    onGuess('number', num);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1b2536', border: '1px solid #2a3a54', borderRadius: 8, padding: '28px 30px', width: 'min(380px,92vw)', animation: 'modal-in .2s ease', boxShadow: '0 24px 80px rgba(0,0,0,.7)' }}>
        <p style={{ fontFamily: 'Playfair Display', fontSize: 20, color: '#dde3ee', marginBottom: 4, letterSpacing: 1 }}>추리하기</p>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#4e6080', marginBottom: 20 }}>선택한 타일의 색상은 자동으로 적용됩니다</p>

        <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#4e6080', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>선언</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {([
            { value: 'number' as const, label: '숫자', bg: '#212e44', border: '#2a3a54', text: '#8898b0' },
            { value: 'joker' as const, label: '조커', bg: '#2a1a4a', border: '#6a3db0', text: '#b080ff' },
          ]).map(c => (
            <button key={c.value} onClick={() => { setMode(c.value); setNum(null); }} style={{
              ...BTN_BASE,
              flex: 1, padding: '10px 0',
              border: mode === c.value ? `2px solid #c8a84b` : `1.5px solid ${c.border}`,
              background: mode === c.value ? `rgba(200,168,75,.1)` : c.bg,
              color: mode === c.value ? '#c8a84b' : c.text,
              fontFamily: 'Inter', fontSize: 13, fontWeight: 600,
            }}>{c.label}</button>
          ))}
        </div>

        {mode === 'number' && (
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

        {mode === 'joker' && (
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
