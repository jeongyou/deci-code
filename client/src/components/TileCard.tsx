import { Tile } from '../types';

interface Props {
  tile: Tile;
  faceDown?: boolean;
  selected?: boolean;
  onClick?: () => void;
  small?: boolean;
}

export function TileCard({ tile, faceDown = false, selected = false, onClick, small = false }: Props) {
  const isBlack = tile.color === 'black';

  const base = small ? 'w-10 h-14 text-sm' : 'w-14 h-20 text-lg';
  const bg = faceDown
    ? 'bg-slate-600'
    : isBlack
      ? 'bg-slate-900 text-white'
      : 'bg-amber-50 text-slate-900 border border-slate-300';

  const ring = selected ? 'ring-4 ring-yellow-400 scale-110' : '';

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`
        ${base} ${bg} ${ring}
        rounded-lg font-bold flex items-center justify-center
        shadow-md transition-all duration-150
        ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}
        relative
      `}
    >
      {faceDown ? (
        <span className="text-slate-400 text-xs">?</span>
      ) : tile.isJoker ? (
        <span className={`text-xl ${isBlack ? 'text-yellow-400' : 'text-purple-600'}`}>★</span>
      ) : (
        <span>{tile.number}</span>
      )}
      {tile.isRevealed && !faceDown && (
        <span className="absolute top-0.5 right-1 text-xs opacity-50">✓</span>
      )}
    </button>
  );
}
