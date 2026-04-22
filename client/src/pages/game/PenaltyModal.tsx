import { useState } from 'react';
import type { Tile } from '../../types';
import { TileCard } from '../../components/TileCard';

interface Props { myTiles: Tile[]; onReveal: (tileId: string) => void; }

export function PenaltyModal({ myTiles, onReveal }: Props) {
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
