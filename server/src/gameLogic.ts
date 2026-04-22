import type { Tile, TileColor, GameRoom, Player } from './types';
import { v4 as uuidv4 } from 'uuid';

function createDeck(): Tile[] {
  const tiles: Tile[] = [];
  const colors: TileColor[] = ['black', 'white'];

  for (const color of colors) {
    for (let n = 0; n <= 11; n++) {
      tiles.push({ id: uuidv4(), number: n, color, isRevealed: false });
    }
  }
  // 조커 2개 (색 없음)
  tiles.push({ id: uuidv4(), number: null, color: 'joker', isRevealed: false });
  tiles.push({ id: uuidv4(), number: null, color: 'joker', isRevealed: false });
  return tiles;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 숫자 타일만 정렬 (조커는 현재 위치 유지 — 이 함수는 초기 배분에만 사용)
export function sortTiles(tiles: Tile[]): Tile[] {
  return [...tiles].sort((a, b) => {
    const an = a.color === 'joker' ? 12 : (a.number ?? 12);
    const bn = b.color === 'joker' ? 12 : (b.number ?? 12);
    if (an !== bn) return an - bn;
    // 같은 숫자면 검은색이 앞
    if (a.color === 'black' && b.color !== 'black') return -1;
    if (b.color === 'black' && a.color !== 'black') return 1;
    return 0;
  });
}

// 숫자 타일을 정렬 순서를 유지하면서 삽입할 위치를 찾아 반환
export function findInsertIndex(tiles: Tile[], newTile: Tile): number {
  let idx = tiles.length;
  for (let i = 0; i < tiles.length; i++) {
    const t = tiles[i];
    if (t.color === 'joker') continue; // 조커 위치는 건너뜀
    const tv = t.number ?? 12;
    const nv = newTile.number ?? 12;
    if (nv < tv) { idx = i; break; }
    if (nv === tv && newTile.color === 'black' && t.color !== 'black') { idx = i; break; }
  }
  return idx;
}

export function dealInitialTiles(room: GameRoom): void {
  const deck = shuffle(createDeck());
  const playerCount = room.players.length;
  // 규칙: 2~3명 → 4장, 4명 → 3장
  const handSize = playerCount <= 3 ? 4 : 3;

  for (const player of room.players) {
    player.tiles = sortTiles(deck.splice(0, handSize));
  }
  room.deck = deck;
  room.phase = 'draw';
  room.drawnTile = null;
  room.drawnTileId = null;
  room.winner = null;
  room.turnStartedAt = Date.now();
}

export function drawTile(room: GameRoom): Tile | null {
  if (room.deck.length === 0) return null;
  const tile = room.deck.shift()!;
  room.drawnTile = tile;
  room.drawnTileId = tile.id;
  return tile;
}

export function insertJokerAtPosition(room: GameRoom, playerId: string, position: number): boolean {
  if (!room.drawnTile || room.drawnTile.color !== 'joker') return false;
  const player = room.players.find(p => p.id === playerId);
  if (!player) return false;

  const clampedPos = Math.max(0, Math.min(position, player.tiles.length));
  player.tiles.splice(clampedPos, 0, room.drawnTile);
  room.drawnTile = null;
  room.phase = 'guess';
  return true;
}

export function guessPlayerTile(
  room: GameRoom,
  targetPlayerId: string,
  tileId: string,
  guessedColor: TileColor,
  guessedNumber: number | null
): boolean {
  const target = room.players.find(p => p.id === targetPlayerId);
  if (!target) return false;

  const tile = target.tiles.find(t => t.id === tileId);
  if (!tile || tile.isRevealed) return false;

  let correct: boolean;
  if (guessedColor === 'joker') {
    correct = tile.color === 'joker';
  } else {
    correct = tile.color === guessedColor && tile.number === guessedNumber;
  }

  if (correct) {
    tile.isRevealed = true;
  }
  return correct;
}

export function addDrawnTileToPlayer(room: GameRoom, playerId: string): void {
  if (!room.drawnTile) return;
  const player = room.players.find(p => p.id === playerId);
  if (!player) return;

  const idx = findInsertIndex(player.tiles, room.drawnTile);
  player.tiles.splice(idx, 0, room.drawnTile);
  room.drawnTile = null;
}

export function revealDrawnTileAsPlaced(room: GameRoom, playerId: string): void {
  if (!room.drawnTileId) return;
  const player = room.players.find(p => p.id === playerId);
  if (!player) return;
  const tile = player.tiles.find(t => t.id === room.drawnTileId);
  if (tile) tile.isRevealed = true;
}

export function nextTurn(room: GameRoom): void {
  room.drawnTile = null;
  room.drawnTileId = null;
  room.phase = 'draw';
  room.turnStartedAt = Date.now();
  const playerCount = room.players.length;
  let next = (room.currentTurnIndex + 1) % playerCount;

  let attempts = 0;
  while (isPlayerEliminated(room.players[next]) && attempts < playerCount) {
    next = (next + 1) % playerCount;
    attempts++;
  }
  room.currentTurnIndex = next;
}

export function isPlayerEliminated(player: Player): boolean {
  return player.tiles.length > 0 && player.tiles.every(t => t.isRevealed);
}

export function checkWinner(room: GameRoom): Player | null {
  const alive = room.players.filter(p => !isPlayerEliminated(p));
  if (alive.length === 1) return alive[0];
  return null;
}

export function revealOwnTile(room: GameRoom, playerId: string, tileId: string): boolean {
  const player = room.players.find(p => p.id === playerId);
  if (!player) return false;
  const tile = player.tiles.find(t => t.id === tileId && !t.isRevealed);
  if (!tile) return false;
  tile.isRevealed = true;
  return true;
}

export function createRoom(id: string): GameRoom {
  return {
    id,
    players: [],
    status: 'waiting',
    phase: 'draw',
    currentTurnIndex: 0,
    deck: [],
    drawnTile: null,
    drawnTileId: null,
    winner: null,
    turnDurationSec: 30,
    turnStartedAt: null,
  };
}

export function resetRoomForReplay(room: GameRoom): void {
  room.status = 'waiting';
  room.phase = 'draw';
  room.currentTurnIndex = 0;
  room.deck = [];
  room.drawnTile = null;
  room.drawnTileId = null;
  room.winner = null;
  room.turnStartedAt = null;
  for (const player of room.players) {
    player.tiles = [];
    player.isReady = false;
  }
}

export function addPlayer(room: GameRoom, playerId: string, nickname: string): Player {
  const player: Player = { id: playerId, nickname, tiles: [], isReady: false };
  room.players.push(player);
  return player;
}
