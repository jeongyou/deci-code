import type { Player } from '../../types';
import type { SelTarget } from './types';
import { Avatar } from '../../components/Avatar';
import { TileRow } from '../../components/TileRow';

interface Props {
  player: Player;
  isActive: boolean;
  isEliminated: boolean;
  canInteract: boolean;
  selTarget: SelTarget | null;
  onTileClick: (tileId: string, idx: number) => void;
  animMap: Record<string, 'appear' | 'flip' | 'shake'>;
}

export function TopSeat({ player, isActive, isEliminated, canInteract, selTarget, onTileClick, animMap }: Props) {
  const selectedTileId = selTarget?.playerId === player.id ? selTarget.tileId : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 20px 8px', borderBottom: '1px solid #2a3a54', opacity: isEliminated ? .35 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
        <Avatar initials={player.nickname[0]} active={isActive} size={22}/>
        <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 500, color: isActive ? '#c8a84b' : '#8898b0' }}>
          {player.nickname}
        </span>
        {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#c8a84b', animation: 'blink 1.2s ease infinite' }}/>}
      </div>
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <TileRow
          tiles={player.tiles} faceDown={true} colorVisible={true}
          selectedTileId={selectedTileId}
          onTileClick={canInteract ? onTileClick : undefined}
          animMap={animMap} size="sm"
        />
      </div>
    </div>
  );
}
