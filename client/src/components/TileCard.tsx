import { clsx } from 'clsx';
import type { Tile } from '../types';

type TileSize = 'sm' | 'md';
type TileVariant = 'face-up' | 'face-down';

interface Props {
  tile: Tile;
  variant?: TileVariant;
  size?: TileSize;
  selected?: boolean;
  onClick?: () => void;
}

export function TileCard({ tile, variant = 'face-up', size = 'md', selected = false, onClick }: Props) {
  const isFaceDown = variant === 'face-down';
  const isBlack = tile.color === 'black';
  const interactive = !!onClick;

  return (
    <button
      onClick={onClick}
      disabled={!interactive}
      className={clsx(
        'relative rounded-xl font-black flex items-center justify-center transition-all duration-150 select-none',
        size === 'md' ? 'w-14 h-20 text-2xl' : 'w-10 h-14 text-lg',
        isFaceDown && 'bg-slate-700 border-2 border-slate-600',
        !isFaceDown && isBlack && 'bg-[#1a1a2e] text-white border-2 border-slate-700 shadow-lg shadow-black/40',
        !isFaceDown && !isBlack && 'bg-[#fdf6e3] text-slate-900 border-2 border-amber-200 shadow-lg shadow-black/20',
        selected && 'ring-4 ring-amber-400 scale-110 z-10',
        interactive && !selected && 'hover:scale-105 hover:ring-2 hover:ring-amber-400/50 cursor-pointer',
        interactive && 'active:scale-95',
        !interactive && 'cursor-default',
        tile.isRevealed && !isFaceDown && 'opacity-60',
      )}
    >
      {isFaceDown ? (
        <span className="text-slate-500 text-xl">?</span>
      ) : tile.isJoker ? (
        <span className={clsx('text-2xl', isBlack ? 'text-amber-400' : 'text-purple-500')}>★</span>
      ) : (
        <span>{tile.number}</span>
      )}

      {tile.isRevealed && !isFaceDown && (
        <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20 text-xs text-white font-medium">
          공개
        </span>
      )}
    </button>
  );
}
