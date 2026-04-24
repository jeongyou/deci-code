import type { Tile } from '../types';
import { TileCard } from './TileCard';
import { OrderGap } from './OrderGap';

interface Props {
  tiles: Tile[];
  faceDown: boolean;
  colorVisible: boolean;
  selectedTileId?: string | null;
  onTileClick?: (tileId: string, idx: number) => void;
  animMap: Record<string, 'appear' | 'flip' | 'shake'>;
  drawnTileId?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isMine?: boolean;
}

export function TileRow({ tiles, faceDown, colorVisible, selectedTileId, onTileClick, animMap, drawnTileId, size = 'md', isMine = false }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0 }}>
      {tiles.map((tile, idx) => (
        <div key={tile.id} style={{ display: 'flex', alignItems: 'center' }}>
          {idx > 0 && (
            <OrderGap
              left={tiles[idx - 1]} right={tile}
              leftVisible={!faceDown || tiles[idx - 1].isRevealed}
              rightVisible={!faceDown || tile.isRevealed}
            />
          )}
          <TileCard
            tile={tile}
            faceDown={faceDown && !tile.isRevealed}
            colorVisible={faceDown && colorVisible}
            size={size}
            selected={selectedTileId === tile.id}
            onClick={onTileClick && !tile.isRevealed ? () => onTileClick(tile.id, idx) : undefined}
            anim={animMap[tile.id]}
            isNew={tile.id === drawnTileId}
            isMine={isMine}
          />
        </div>
      ))}
    </div>
  );
}
