import type { Tile } from '../types';

interface Props {
  left: Tile;
  right: Tile;
  leftVisible: boolean;
  rightVisible: boolean;
}

export function OrderGap({ left, right, leftVisible, rightVisible }: Props) {
  let label = '≤';
  if (leftVisible && rightVisible) {
    const lv = left.isJoker ? 12 : (left.number ?? 12);
    const rv = right.isJoker ? 12 : (right.number ?? 12);
    label = lv < rv ? '<' : '=';
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 14, flexShrink: 0 }}>
      <span style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 600, color: '#4e6080', userSelect: 'none' }}>
        {label}
      </span>
    </div>
  );
}
