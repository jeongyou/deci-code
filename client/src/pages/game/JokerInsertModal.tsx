import type { Tile } from '../../types';

interface Props {
  myTiles: Tile[];
  onPlace: (position: number) => void;
}

function TileMini({ tile }: { tile: Tile }) {
  const isJoker = tile.color === 'joker';
  return (
    <div style={{
      width: 28, height: 40, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isJoker ? '#2a1a4a' : tile.color === 'white' ? '#bfbab0' : '#161618',
      border: isJoker ? '1px solid #6a3db0' : tile.color === 'white' ? '1px solid #888' : '1px solid #3a3a3a',
      color: isJoker ? '#b080ff' : tile.color === 'white' ? '#1a1a1a' : '#e0e0e0',
      fontFamily: 'Playfair Display', fontSize: 12, fontWeight: 700,
      opacity: tile.isRevealed ? 0.4 : 1,
    }}>
      {isJoker ? '★' : tile.number}
    </div>
  );
}

function GapButton({ position, onPlace }: { position: number; onPlace: (p: number) => void }) {
  return (
    <button
      onClick={() => onPlace(position)}
      title={`${position}번째 위치에 삽입`}
      style={{
        width: 20, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      }}
    >
      <div style={{ width: 3, height: 28, borderRadius: 2, background: '#c8a84b', opacity: 0.7, transition: 'opacity .15s' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
      />
    </button>
  );
}

export function JokerInsertModal({ myTiles, onPlace }: Props) {
  const nonJokerTiles = myTiles.filter(t => t.color !== 'joker');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1b2536', border: '1px solid #6a3db0', borderRadius: 8, padding: '28px 30px', width: 'min(480px,92vw)', animation: 'modal-in .2s ease', boxShadow: '0 24px 80px rgba(0,0,0,.7)' }}>
        <p style={{ fontFamily: 'Playfair Display', fontSize: 20, color: '#b080ff', marginBottom: 4, letterSpacing: 1 }}>조커 배치</p>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#4e6080', marginBottom: 24 }}>금색 슬롯을 클릭해 조커를 삽입할 위치를 선택하세요</p>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0, justifyContent: 'center', minHeight: 52 }}>
          <GapButton position={0} onPlace={onPlace} />
          {nonJokerTiles.map((tile, i) => (
            <div key={tile.id} style={{ display: 'flex', alignItems: 'center' }}>
              <TileMini tile={tile} />
              <GapButton position={i + 1} onPlace={onPlace} />
            </div>
          ))}
          {nonJokerTiles.length === 0 && (
            <button onClick={() => onPlace(0)} style={{
              padding: '10px 24px', background: '#c8a84b', border: 'none', borderRadius: 4,
              color: '#0a0a0c', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>첫 번째 위치에 배치</button>
          )}
        </div>

        <p style={{ fontFamily: 'Inter', fontSize: 10, color: '#4e6080', textAlign: 'center', marginTop: 16 }}>
          조커는 숫자 타일 사이 어디에도 배치할 수 있습니다
        </p>
      </div>
    </div>
  );
}
