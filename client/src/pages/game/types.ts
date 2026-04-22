export interface SelTarget { playerId: string; tileIdx: number; tileId: string; }
export type Phase = 'wait' | 'draw' | 'insert' | 'select' | 'correct' | 'penalty';
