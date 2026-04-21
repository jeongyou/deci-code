export type TileColor = 'black' | 'white';

export interface Tile {
  id: string;
  number: number | null;
  color: TileColor;
  isJoker: boolean;
  isRevealed: boolean;
}

export interface Player {
  id: string;
  nickname: string;
  tiles: Tile[];
  isReady: boolean;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GameRoom {
  id: string;
  players: Player[];
  status: GameStatus;
  currentTurnIndex: number;
  deck: Tile[];
  drawnTile: Tile | null;
  winner: string | null;
}
