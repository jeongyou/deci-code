import type { Player } from '../../types';
import { Avatar } from '../../components/Avatar';
import { TileRow } from '../../components/TileRow';

interface Props {
  me: Player;
  isMyTurn: boolean;
  animMap: Record<string, 'appear' | 'flip' | 'shake'>;
  drawnTileId: string | null;
}

export function MySeat({ me, isMyTurn, animMap, drawnTileId }: Props) {
  return (
    <div style={{ borderTop: `1px solid ${isMyTurn ? 'rgba(200,168,75,.3)' : '#2a3a54'}`, padding: '10px 20px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Avatar initials={me.nickname[0]} active={isMyTurn} size={24}/>
        <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 500, color: isMyTurn ? '#c8a84b' : '#8898b0' }}>
          {isMyTurn ? '내 차례' : me.nickname}
        </span>
        <span style={{ fontFamily: 'Inter', fontSize: 10, color: '#4e6080', marginLeft: 'auto' }}>
          {me.tiles.filter(t => !t.isRevealed).length} / {me.tiles.length}
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <TileRow tiles={me.tiles} faceDown={false} colorVisible={false} animMap={animMap} drawnTileId={drawnTileId} size="lg"/>
      </div>
    </div>
  );
}
