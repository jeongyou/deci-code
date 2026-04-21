import { describe, it, expect, beforeEach } from 'vitest';
import {
  createRoom,
  addPlayer,
  dealInitialTiles,
  drawTile,
  guessPlayerTile,
  addDrawnTileToPlayer,
  nextTurn,
  checkWinner,
  isPlayerEliminated,
  sortTiles,
} from './gameLogic';
import type { GameRoom } from './types';

function makeRoom(playerCount: number): GameRoom {
  const room = createRoom('TEST');
  for (let i = 0; i < playerCount; i++) {
    addPlayer(room, `p${i}`, `Player${i}`);
  }
  return room;
}

describe('sortTiles', () => {
  it('숫자 오름차순 정렬', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    const player = room.players[0];
    const numbers = player.tiles.map(t => t.number ?? 12);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
  });
});

describe('dealInitialTiles', () => {
  it('2인: 각 4장', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    expect(room.players[0].tiles).toHaveLength(4);
    expect(room.players[1].tiles).toHaveLength(4);
  });

  it('3인: 각 3장', () => {
    const room = makeRoom(3);
    dealInitialTiles(room);
    room.players.forEach(p => expect(p.tiles).toHaveLength(3));
  });

  it('덱에서 분배한 만큼 차감됨', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    expect(room.deck).toHaveLength(26 - 4 * 2); // 전체 26장 - 분배 8장
  });
});

describe('drawTile', () => {
  it('덱에서 타일 1장 뽑고 drawnTile에 저장', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    const deckSizeBefore = room.deck.length;
    const tile = drawTile(room);
    expect(tile).not.toBeNull();
    expect(room.drawnTile).toEqual(tile);
    expect(room.deck).toHaveLength(deckSizeBefore - 1);
  });

  it('덱이 비어있으면 null 반환', () => {
    const room = makeRoom(2);
    room.deck = [];
    expect(drawTile(room)).toBeNull();
  });
});

describe('guessPlayerTile', () => {
  it('정답이면 타일 공개되고 true 반환', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    const target = room.players[1];
    const tile = target.tiles[0];
    const result = guessPlayerTile(room, target.id, tile.id, tile.number);
    expect(result).toBe(true);
    expect(tile.isRevealed).toBe(true);
  });

  it('오답이면 타일 그대로고 false 반환', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    const target = room.players[1];
    const tile = target.tiles[0];
    const wrong = tile.number === 0 ? 1 : 0;
    const result = guessPlayerTile(room, target.id, tile.id, wrong);
    expect(result).toBe(false);
    expect(tile.isRevealed).toBe(false);
  });

  it('이미 공개된 타일은 추리 불가 (false)', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    const target = room.players[1];
    const tile = target.tiles[0];
    tile.isRevealed = true;
    expect(guessPlayerTile(room, target.id, tile.id, tile.number)).toBe(false);
  });
});

describe('addDrawnTileToPlayer', () => {
  it('뽑은 타일이 플레이어 패에 추가되고 drawnTile은 null', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    drawTile(room);
    const before = room.players[0].tiles.length;
    addDrawnTileToPlayer(room, 'p0');
    expect(room.players[0].tiles).toHaveLength(before + 1);
    expect(room.drawnTile).toBeNull();
  });
});

describe('nextTurn', () => {
  it('턴이 다음 플레이어로 넘어감', () => {
    const room = makeRoom(2);
    expect(room.currentTurnIndex).toBe(0);
    nextTurn(room);
    expect(room.currentTurnIndex).toBe(1);
    nextTurn(room);
    expect(room.currentTurnIndex).toBe(0);
  });

  it('탈락한 플레이어는 건너뜀', () => {
    const room = makeRoom(3);
    dealInitialTiles(room);
    // p1 전부 공개 → 탈락
    room.players[1].tiles.forEach(t => { t.isRevealed = true; });
    nextTurn(room); // p0 → p1 건너뛰고 p2
    expect(room.currentTurnIndex).toBe(2);
  });
});

describe('isPlayerEliminated', () => {
  it('타일이 없으면 탈락 아님', () => {
    const room = makeRoom(1);
    expect(isPlayerEliminated(room.players[0])).toBe(false);
  });

  it('타일이 모두 공개되면 탈락', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    room.players[0].tiles.forEach(t => { t.isRevealed = true; });
    expect(isPlayerEliminated(room.players[0])).toBe(true);
  });
});

describe('checkWinner', () => {
  it('살아있는 플레이어가 2명이면 null', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    expect(checkWinner(room)).toBeNull();
  });

  it('1명만 살아있으면 그 플레이어 반환', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    room.players[1].tiles.forEach(t => { t.isRevealed = true; });
    expect(checkWinner(room)?.id).toBe('p0');
  });
});
