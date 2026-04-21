import { Tile, TileColor, GameRoom, Player } from './types';
import { v4 as uuidv4 } from 'uuid';

function createDeck(): Tile[] {
  const tiles: Tile[] = [];
  const colors: TileColor[] = ['black', 'white'];

  for (const color of colors) {
    for (let n = 0; n <= 11; n++) {
      tiles.push({ id: uuidv4(), number: n, color, isJoker: false, isRevealed: false });
    }
    // 조커 1장씩
    tiles.push({ id: uuidv4(), number: null, color, isJoker: true, isRevealed: false });
  }
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

export function sortTiles(tiles: Tile[]): Tile[] {
  return [...tiles].sort((a, b) => {
    const an = a.number ?? 12; // 조커는 맨 뒤
    const bn = b.number ?? 12;
    if (an !== bn) return an - bn;
    // 같은 숫자면 검은색이 앞
    return a.color === 'black' ? -1 : 1;
  });
}

export function dealInitialTiles(room: GameRoom): void {
  const deck = shuffle(createDeck());
  const playerCount = room.players.length;
  const handSize = playerCount <= 2 ? 4 : 3;

  for (const player of room.players) {
    player.tiles = sortTiles(deck.splice(0, handSize));
  }
  room.deck = deck;
}

export function drawTile(room: GameRoom): Tile | null {
  if (room.deck.length === 0) return null;
  const tile = room.deck.shift()!;
  room.drawnTile = tile;
  return tile;
}

export function guessPlayerTile(
  room: GameRoom,
  targetPlayerId: string,
  tileId: string,
  guessedNumber: number | null
): boolean {
  const target = room.players.find(p => p.id === targetPlayerId);
  if (!target) return false;

  const tile = target.tiles.find(t => t.id === tileId);
  if (!tile || tile.isRevealed) return false;

  const correct = tile.number === guessedNumber;
  if (correct) {
    tile.isRevealed = true;
  }
  return correct;
}

export function addDrawnTileToPlayer(room: GameRoom, playerId: string): void {
  if (!room.drawnTile) return;
  const player = room.players.find(p => p.id === playerId);
  if (!player) return;

  player.tiles = sortTiles([...player.tiles, room.drawnTile]);
  room.drawnTile = null;
}

export function nextTurn(room: GameRoom): void {
  room.drawnTile = null;
  const playerCount = room.players.length;
  let next = (room.currentTurnIndex + 1) % playerCount;

  // 이미 진 플레이어(모든 타일 공개) 건너뜀
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
    currentTurnIndex: 0,
    deck: [],
    drawnTile: null,
    winner: null,
  };
}

export function addPlayer(room: GameRoom, playerId: string, nickname: string): Player {
  const player: Player = { id: playerId, nickname, tiles: [], isReady: false };
  room.players.push(player);
  return player;
}
