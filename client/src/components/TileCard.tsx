import { useState } from 'react';
import type { Tile } from '../types';

type TileSize = 'xs' | 'sm' | 'md' | 'lg';

interface Props {
  tile: Tile;
  faceDown?: boolean;
  colorVisible?: boolean;
  selected?: boolean;
  onClick?: () => void;
  size?: TileSize;
  anim?: 'appear' | 'flip' | 'shake';
  isNew?: boolean;
  isMine?: boolean;
}

const SIZES: Record<TileSize, { w: number; h: number; fs: number }> = {
  xs: { w: 32, h: 42, fs: 14 },
  sm: { w: 40, h: 52, fs: 18 },
  md: { w: 50, h: 64, fs: 24 },
  lg: { w: 58, h: 76, fs: 30 },
};

export function TileCard({ tile, faceDown = false, colorVisible = false, selected = false, onClick, size = 'md', anim, isNew = false, isMine = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const { w, h, fs } = SIZES[size];

  const whiteFace = {
    background: '#f0ebe0',
    border: selected ? '1.5px solid #c8a84b' : '1.5px solid #c8c0b0',
    boxShadow: selected
      ? '0 0 0 1px #c8a84b,0 4px 16px rgba(0,0,0,.4)'
      : '0 2px 6px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.6)',
  };
  const blackFace = {
    background: '#1e1e1e',
    border: selected ? '1.5px solid #c8a84b' : '1.5px solid #3a3a3a',
    boxShadow: selected
      ? '0 0 0 1px #c8a84b,0 4px 16px rgba(0,0,0,.6)'
      : '0 2px 6px rgba(0,0,0,.5)',
  };
  const whiteBack = {
    background: '#bfbab0',
    border: selected ? '1.5px solid #c8a84b' : '1.5px solid #a09890',
    boxShadow: selected ? '0 0 0 1px #c8a84b,0 4px 12px rgba(0,0,0,.4)' : '0 2px 5px rgba(0,0,0,.25)',
  };
  const blackBack = {
    background: '#161618',
    border: selected ? '1.5px solid #c8a84b' : '1.5px solid #2e2e2e',
    boxShadow: selected ? '0 0 0 1px #c8a84b,0 4px 12px rgba(0,0,0,.6)' : '0 2px 5px rgba(0,0,0,.5)',
  };
  const unkBack = {
    background: '#1b2536',
    border: selected ? '1.5px solid #c8a84b' : '1.5px solid #2a3a54',
    boxShadow: selected ? '0 0 0 1px #c8a84b,0 4px 14px rgba(0,0,0,.5)' : '0 2px 8px rgba(0,0,0,.3)',
  };

  const jokerFace = {
    background: '#1e0f33',
    border: selected ? '1.5px solid #c8a84b' : '1.5px solid #6a3db0',
    boxShadow: selected ? '0 0 0 1px #c8a84b,0 4px 16px rgba(0,0,0,.6)' : '0 2px 8px rgba(0,0,0,.5)',
  };

  const hiddenJokerBack = faceDown && colorVisible && tile.color === 'joker';
  const faceStyle = !faceDown
    ? tile.color === 'white' ? whiteFace : tile.color === 'joker' ? jokerFace : blackFace
    : colorVisible
      ? hiddenJokerBack ? unkBack : tile.color === 'white' ? whiteBack : blackBack
      : unkBack;

  const animStyle: React.CSSProperties = anim === 'appear'
    ? { animation: 'tile-appear .3s ease' }
    : anim === 'flip'
      ? { animation: 'tile-flip .35s ease' }
      : anim === 'shake'
        ? { animation: 'shake .3s ease' }
        : {};

  const selAnim: React.CSSProperties = selected ? { animation: 'gold-pulse 1.6s ease infinite' } : {};
  const revealOffset = isMine && tile.isRevealed ? -9 : 0;
  const hoverOffset = hovered && onClick && !selected ? -3 : 0;
  const lift: React.CSSProperties = revealOffset || hoverOffset ? { transform: `translateY(${revealOffset + hoverOffset}px)` } : {};

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: w, height: h, borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0, userSelect: 'none', position: 'relative',
        transition: 'transform .12s ease, box-shadow .12s ease',
        ...faceStyle, ...lift, ...selAnim, ...animStyle,
      }}
    >
      {!faceDown ? (
        <span style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontSize: tile.color === 'joker' ? fs * .65 : fs, fontWeight: 900,
          color: tile.color === 'white' ? '#111' : tile.color === 'joker' ? '#b080ff' : '#f0f0f0',
          lineHeight: 1,
          letterSpacing: (tile.number !== null && tile.number >= 10) ? '-2px' : '-1px',
        }}>
          {tile.color === 'joker' ? '★' : tile.number}
        </span>
      ) : colorVisible && !hiddenJokerBack ? (
        <span style={{
          fontFamily: 'Playfair Display',
          fontSize: fs * .7, fontWeight: 700,
          color: tile.color === 'white' ? 'rgba(60,50,40,.3)' : 'rgba(255,255,255,.1)',
          lineHeight: 1,
        }}>?</span>
      ) : (
        <svg width={w - 10} height={h - 10} viewBox="0 0 30 42">
          <rect x="1" y="1" width="28" height="40" rx="2" fill="none" stroke="#2a3a54" strokeWidth="1"/>
          <line x1="1" y1="1" x2="29" y2="41" stroke="#1e2d42" strokeWidth=".7"/>
          <line x1="29" y1="1" x2="1" y2="41" stroke="#1e2d42" strokeWidth=".7"/>
        </svg>
      )}

      {/* color hint strip for face-down colorVisible */}
      {faceDown && colorVisible && !hiddenJokerBack && (
        <div style={{
          position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
          width: w - 10, height: 3, borderRadius: 1.5,
          background: tile.color === 'white' ? 'rgba(160,148,120,.4)' : 'rgba(255,255,255,.06)',
        }}/>
      )}

      {/* NEW badge */}
      {isNew && (
        <div style={{
          position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
          background: '#c8a84b', color: '#000', fontSize: 8, fontWeight: 700,
          padding: '1px 4px', borderRadius: 2, fontFamily: 'Inter', letterSpacing: .5, whiteSpace: 'nowrap',
        }}>NEW</div>
      )}

      {/* revealed overlay */}
      {tile.isRevealed && !faceDown && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 4,
          border: '1.5px solid rgba(200,60,60,.7)',
          background: 'rgba(200,40,40,.1)', pointerEvents: 'none',
        }}/>
      )}
      {tile.isRevealed && (
        <div style={{
          position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)',
          width: w * .5, height: 3, borderRadius: 2, background: '#eb5757',
          boxShadow: '0 0 8px rgba(235,87,87,.55)', pointerEvents: 'none',
        }}/>
      )}
    </div>
  );
}
