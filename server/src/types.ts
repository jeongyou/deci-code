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

// Socket 이벤트 타입
export interface ServerToClientEvents {
  room_joined: (room: GameRoom, playerId: string) => void;
  room_updated: (room: GameRoom) => void;
  game_started: (room: GameRoom) => void;
  tile_drawn: (tile: Tile) => void;
  guess_result: (correct: boolean, tile: Tile) => void;
  must_place_joker: () => void;
  must_reveal_tile: () => void;
  game_over: (winnerId: string, winnerNickname: string) => void;
  waiting_for_match: () => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  join_room: (roomId: string, nickname: string) => void;
  join_random: (nickname: string) => void;
  set_ready: () => void;
  draw_tile: () => void;
  place_joker: (position: number) => void;
  guess_tile: (targetPlayerId: string, tileId: string, guessedColor: TileColor, guessedNumber: number | null) => void;
  skip_guess: () => void;
  reveal_own_tile: (tileId: string) => void;
}
