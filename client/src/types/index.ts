export type TileColor = 'black' | 'white' | 'joker';

export interface Tile {
  id: string;
  number: number | null;
  color: TileColor;
  isRevealed: boolean;
}

export interface Player {
  id: string;
  nickname: string;
  tiles: Tile[];
  isReady: boolean;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';
export type GamePhase = 'draw' | 'insert' | 'guess' | 'end';

export interface GameRoom {
  id: string;
  players: Player[];
  status: GameStatus;
  phase: GamePhase;
  currentTurnIndex: number;
  deck: Tile[];
  drawnTile: Tile | null;
  drawnTileId: string | null;
  winner: string | null;
}
