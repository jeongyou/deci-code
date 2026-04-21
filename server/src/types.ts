export type TileColor = 'black' | 'white';

export interface Tile {
  id: string;
  number: number | null; // null = joker
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
  drawnTile: Tile | null; // 이번 턴에 뽑은 타일
  winner: string | null;
}

// Socket 이벤트 타입
export interface ServerToClientEvents {
  room_joined: (room: GameRoom, playerId: string) => void;
  room_updated: (room: GameRoom) => void;
  game_started: (room: GameRoom) => void;
  tile_drawn: (tile: Tile) => void;
  guess_result: (correct: boolean, tile: Tile) => void;
  game_over: (winnerId: string, winnerNickname: string) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  join_room: (roomId: string, nickname: string) => void;
  join_random: (nickname: string) => void;
  set_ready: () => void;
  draw_tile: () => void;
  guess_tile: (targetPlayerId: string, tileId: string, guessedNumber: number | null) => void;
  skip_guess: () => void; // 뽑은 타일 자기 패에 추가하고 턴 넘김
}
