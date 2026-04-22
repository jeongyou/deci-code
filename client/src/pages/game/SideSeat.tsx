import type { Player } from '../../types';
import type { SelTarget } from './types';
import { Avatar } from '../../components/Avatar';
import { TileCard } from '../../components/TileCard';

interface Props {
  player: Player;
  side: 'left' | 'right';
  isActive: boolean;
  isEliminated: boolean;
  canInteract: boolean;
  selTarget: SelTarget | null;
  onTileClick: (tileId: string, idx: number) => void;
  animMap: Record<string, 'appear' | 'flip' | 'shake'>;
}

export function SideSeat({ player, side, isActive, isEliminated, canInteract, selTarget, onTileClick, animMap }: Props) {
  const border = side === 'left' ? { borderRight: '1px solid #2a3a54' } : { borderLeft: '1px solid #2a3a54' };
  return (
    <div style={{ width: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 8px', ...border, opacity: isEliminated ? .35 : 1, gap: 8 }}>
      <Avatar initials={player.nickname[0]} active={isActive} size={22}/>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        {player.tiles.map((tile, idx) => (
          <div key={tile.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {idx > 0 && <span style={{ fontFamily: 'Inter', fontSize: 8, color: '#4e6080', lineHeight: 1 }}>≤</span>}
            <TileCard
              tile={tile} faceDown={!tile.isRevealed} colorVisible={true} size="xs"
              selected={selTarget?.tileId === tile.id}
              onClick={canInteract && !tile.isRevealed ? () => onTileClick(tile.id, idx) : undefined}
              anim={animMap[tile.id]}
            />
          </div>
        ))}
      </div>
      <span style={{ fontFamily: 'Inter', fontSize: 9, color: '#8898b0', marginTop: 'auto', textAlign: 'center', lineHeight: 1.3 }}>
        {player.nickname}
      </span>
    </div>
  );
}
