import { describe, it, expect, beforeEach } from 'vitest';
import {
  createRoom, addPlayer, dealInitialTiles, drawTile,
  guessPlayerTile, addDrawnTileToPlayer, insertJokerAtPosition,
  revealDrawnTileAsPlaced, nextTurn, checkWinner,
  isPlayerEliminated, revealOwnTile, sortTiles, findInsertIndex,
  resetRoomForReplay,
} from '../gameLogic';
import type { GameRoom, Tile } from '../types';

function makeRoom(playerCount = 2): GameRoom {
  const room = createRoom('test');
  for (let i = 0; i < playerCount; i++) {
    addPlayer(room, `p${i}`, `Player${i}`);
  }
  return room;
}

function makeTile(id: string, color: Tile['color'], number: number | null, isRevealed = false): Tile {
  return { id, number, color, isRevealed };
}

// ─── createRoom / addPlayer ───────────────────────────────────────────────────

describe('createRoom', () => {
  it('빈 방을 생성한다', () => {
    const room = createRoom('abc');
    expect(room.id).toBe('abc');
    expect(room.players).toHaveLength(0);
    expect(room.status).toBe('waiting');
    expect(room.phase).toBe('draw');
    expect(room.drawnTile).toBeNull();
    expect(room.drawnTileId).toBeNull();
    expect(room.turnDurationSec).toBe(30);
    expect(room.turnStartedAt).toBeNull();
  });
});

describe('addPlayer', () => {
  it('플레이어를 방에 추가한다', () => {
    const room = createRoom('r');
    const p = addPlayer(room, 's1', 'Alice');
    expect(room.players).toHaveLength(1);
    expect(p.nickname).toBe('Alice');
    expect(p.tiles).toHaveLength(0);
    expect(p.isReady).toBe(false);
  });
});

// ─── dealInitialTiles ─────────────────────────────────────────────────────────

describe('dealInitialTiles', () => {
  it('2인: 각 4장 배분', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    expect(room.players[0].tiles).toHaveLength(4);
    expect(room.players[1].tiles).toHaveLength(4);
    expect(room.deck).toHaveLength(26 - 8);
  });

  it('3인: 각 4장 배분 (규칙: 2~3명=4장)', () => {
    const room = makeRoom(3);
    dealInitialTiles(room);
    room.players.forEach(p => expect(p.tiles).toHaveLength(4));
    expect(room.deck).toHaveLength(26 - 12);
  });

  it('4인: 각 3장 배분', () => {
    const room = makeRoom(4);
    dealInitialTiles(room);
    room.players.forEach(p => expect(p.tiles).toHaveLength(3));
    expect(room.deck).toHaveLength(26 - 12);
  });

  it('초기 타일은 오름차순 정렬 (숫자 타일)', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    for (const player of room.players) {
      const numbers = player.tiles
        .filter(t => t.color !== 'joker')
        .map(t => t.number!);
      for (let i = 1; i < numbers.length; i++) {
        expect(numbers[i]).toBeGreaterThanOrEqual(numbers[i - 1]);
      }
    }
  });

  it('딜 후 phase가 draw', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    expect(room.phase).toBe('draw');
    expect(room.turnStartedAt).toEqual(expect.any(Number));
  });
});

// ─── sortTiles ────────────────────────────────────────────────────────────────

describe('sortTiles', () => {
  it('숫자 오름차순 정렬', () => {
    const tiles = [
      makeTile('a', 'white', 5),
      makeTile('b', 'black', 2),
      makeTile('c', 'white', 0),
    ];
    const sorted = sortTiles(tiles);
    expect(sorted.map(t => t.number)).toEqual([0, 2, 5]);
  });

  it('같은 숫자면 black이 앞', () => {
    const tiles = [
      makeTile('a', 'white', 3),
      makeTile('b', 'black', 3),
    ];
    const sorted = sortTiles(tiles);
    expect(sorted[0].color).toBe('black');
    expect(sorted[1].color).toBe('white');
  });

  it('조커는 맨 뒤로', () => {
    const tiles = [
      makeTile('j', 'joker', null),
      makeTile('a', 'black', 0),
      makeTile('b', 'white', 11),
    ];
    const sorted = sortTiles(tiles);
    expect(sorted[sorted.length - 1].color).toBe('joker');
  });
});

// ─── findInsertIndex ──────────────────────────────────────────────────────────

describe('findInsertIndex', () => {
  it('빈 패에 삽입 시 0', () => {
    expect(findInsertIndex([], makeTile('x', 'black', 5))).toBe(0);
  });

  it('중간 삽입 위치 반환', () => {
    const tiles = [makeTile('a', 'black', 2), makeTile('b', 'white', 8)];
    expect(findInsertIndex(tiles, makeTile('x', 'white', 5))).toBe(1);
  });

  it('같은 숫자면 black을 앞에', () => {
    const tiles = [makeTile('a', 'white', 5)];
    expect(findInsertIndex(tiles, makeTile('x', 'black', 5))).toBe(0);
  });

  it('맨 뒤 삽입', () => {
    const tiles = [makeTile('a', 'black', 0), makeTile('b', 'white', 3)];
    expect(findInsertIndex(tiles, makeTile('x', 'white', 9))).toBe(2);
  });
});

// ─── drawTile ─────────────────────────────────────────────────────────────────

describe('drawTile', () => {
  it('덱 맨 앞 타일을 반환하고 덱에서 제거', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    const before = room.deck.length;
    const tile = drawTile(room);
    expect(tile).not.toBeNull();
    expect(room.deck).toHaveLength(before - 1);
    expect(room.drawnTile).toBe(tile);
    expect(room.drawnTileId).toBe(tile!.id);
  });

  it('덱이 비면 null 반환', () => {
    const room = makeRoom(2);
    dealInitialTiles(room);
    room.deck = [];
    expect(drawTile(room)).toBeNull();
  });
});

// ─── insertJokerAtPosition ────────────────────────────────────────────────────

describe('insertJokerAtPosition', () => {
  let room: GameRoom;
  beforeEach(() => {
    room = makeRoom(2);
    dealInitialTiles(room);
    // drawnTile을 조커로 교체
    const joker: Tile = { id: 'j1', number: null, color: 'joker', isRevealed: false };
    room.drawnTile = joker;
    room.drawnTileId = joker.id;
    room.phase = 'insert';
  });

  it('지정 위치에 조커 삽입', () => {
    const p = room.players[0];
    const beforeLen = p.tiles.length;
    const ok = insertJokerAtPosition(room, 'p0', 0);
    expect(ok).toBe(true);
    expect(p.tiles).toHaveLength(beforeLen + 1);
    expect(p.tiles[0].color).toBe('joker');
    expect(room.drawnTile).toBeNull();
    expect(room.phase).toBe('guess');
  });

  it('조커가 아닌 drawnTile이면 실패', () => {
    room.drawnTile = makeTile('x', 'black', 3);
    expect(insertJokerAtPosition(room, 'p0', 0)).toBe(false);
  });

  it('position이 범위를 벗어나면 클램프', () => {
    const p = room.players[0];
    const len = p.tiles.length;
    insertJokerAtPosition(room, 'p0', 999);
    expect(p.tiles[len].color).toBe('joker'); // 맨 뒤에 삽입
  });
});

// ─── guessPlayerTile ──────────────────────────────────────────────────────────

describe('guessPlayerTile', () => {
  let room: GameRoom;
  beforeEach(() => {
    room = makeRoom(2);
    room.players[1].tiles = [
      makeTile('t1', 'black', 7),
      makeTile('t2', 'white', 3),
      makeTile('t3', 'joker', null),
    ];
  });

  it('색상과 숫자 모두 맞으면 정답', () => {
    const ok = guessPlayerTile(room, 'p1', 't1', 'black', 7);
    expect(ok).toBe(true);
    expect(room.players[1].tiles.find(t => t.id === 't1')!.isRevealed).toBe(true);
  });

  it('숫자는 맞지만 색상이 다르면 오답', () => {
    expect(guessPlayerTile(room, 'p1', 't1', 'white', 7)).toBe(false);
  });

  it('색상은 맞지만 숫자가 다르면 오답', () => {
    expect(guessPlayerTile(room, 'p1', 't1', 'black', 5)).toBe(false);
  });

  it('joker로 선언하면 조커 타일에 정답', () => {
    expect(guessPlayerTile(room, 'p1', 't3', 'joker', null)).toBe(true);
  });

  it('joker로 선언했지만 일반 타일이면 오답', () => {
    expect(guessPlayerTile(room, 'p1', 't1', 'joker', null)).toBe(false);
  });

  it('이미 공개된 타일은 추리 불가', () => {
    room.players[1].tiles[0].isRevealed = true;
    expect(guessPlayerTile(room, 'p1', 't1', 'black', 7)).toBe(false);
  });

  it('없는 플레이어면 false', () => {
    expect(guessPlayerTile(room, 'nobody', 't1', 'black', 7)).toBe(false);
  });
});

// ─── addDrawnTileToPlayer ─────────────────────────────────────────────────────

describe('addDrawnTileToPlayer', () => {
  it('비조커 타일을 정렬 위치에 삽입하고 drawnTile 초기화', () => {
    const room = makeRoom(2);
    room.players[0].tiles = [makeTile('a', 'black', 2), makeTile('b', 'white', 8)];
    room.drawnTile = makeTile('c', 'white', 5);

    addDrawnTileToPlayer(room, 'p0');

    expect(room.players[0].tiles).toHaveLength(3);
    expect(room.players[0].tiles[1].id).toBe('c'); // 2 < 5 < 8
    expect(room.drawnTile).toBeNull();
  });

  it('drawnTile 없으면 아무것도 안 함', () => {
    const room = makeRoom(2);
    room.players[0].tiles = [makeTile('a', 'black', 2)];
    addDrawnTileToPlayer(room, 'p0');
    expect(room.players[0].tiles).toHaveLength(1);
  });
});

// ─── revealDrawnTileAsPlaced ──────────────────────────────────────────────────

describe('revealDrawnTileAsPlaced', () => {
  it('drawnTileId로 패에서 타일을 찾아 공개', () => {
    const room = makeRoom(2);
    const joker: Tile = { id: 'j99', number: null, color: 'joker', isRevealed: false };
    room.players[0].tiles = [joker];
    room.drawnTileId = 'j99';

    revealDrawnTileAsPlaced(room, 'p0');
    expect(joker.isRevealed).toBe(true);
  });
});

// ─── nextTurn ─────────────────────────────────────────────────────────────────

describe('nextTurn', () => {
  it('다음 플레이어로 턴 이동', () => {
    const room = makeRoom(3);
    room.currentTurnIndex = 0;
    nextTurn(room);
    expect(room.currentTurnIndex).toBe(1);
  });

  it('마지막 플레이어 다음은 0번', () => {
    const room = makeRoom(2);
    room.currentTurnIndex = 1;
    nextTurn(room);
    expect(room.currentTurnIndex).toBe(0);
  });

  it('탈락 플레이어 건너뜀', () => {
    const room = makeRoom(3);
    // p1 탈락 처리
    room.players[1].tiles = [{ ...makeTile('x', 'black', 5), isRevealed: true }];
    room.currentTurnIndex = 0;
    nextTurn(room);
    expect(room.currentTurnIndex).toBe(2);
  });

  it('nextTurn 후 phase = draw, drawnTile = null, drawnTileId = null', () => {
    const room = makeRoom(2);
    room.drawnTile = makeTile('z', 'black', 3);
    room.drawnTileId = 'z';
    room.phase = 'guess';
    nextTurn(room);
    expect(room.drawnTile).toBeNull();
    expect(room.drawnTileId).toBeNull();
    expect(room.phase).toBe('draw');
    expect(room.turnStartedAt).toEqual(expect.any(Number));
  });
});

// ─── resetRoomForReplay ──────────────────────────────────────────────────────

describe('resetRoomForReplay', () => {
  it('같은 플레이어로 대기방 상태를 초기화한다', () => {
    const room = makeRoom(2);
    room.status = 'finished';
    room.phase = 'end';
    room.currentTurnIndex = 1;
    room.deck = [makeTile('d', 'black', 1)];
    room.drawnTile = makeTile('x', 'white', 2);
    room.drawnTileId = 'x';
    room.winner = 'p1';
    room.turnStartedAt = Date.now();
    room.players[0].isReady = true;
    room.players[0].tiles = [makeTile('a', 'black', 3)];

    resetRoomForReplay(room);

    expect(room.status).toBe('waiting');
    expect(room.phase).toBe('draw');
    expect(room.currentTurnIndex).toBe(0);
    expect(room.deck).toHaveLength(0);
    expect(room.drawnTile).toBeNull();
    expect(room.drawnTileId).toBeNull();
    expect(room.winner).toBeNull();
    expect(room.turnStartedAt).toBeNull();
    expect(room.players).toHaveLength(2);
    expect(room.players[0].isReady).toBe(false);
    expect(room.players[0].tiles).toHaveLength(0);
  });
});

// ─── isPlayerEliminated / checkWinner ────────────────────────────────────────

describe('isPlayerEliminated', () => {
  it('모든 타일 공개 → 탈락', () => {
    const room = makeRoom(1);
    room.players[0].tiles = [{ ...makeTile('a', 'black', 1), isRevealed: true }];
    expect(isPlayerEliminated(room.players[0])).toBe(true);
  });

  it('타일 없으면 탈락 아님', () => {
    const room = makeRoom(1);
    expect(isPlayerEliminated(room.players[0])).toBe(false);
  });

  it('비공개 타일 있으면 탈락 아님', () => {
    const room = makeRoom(1);
    room.players[0].tiles = [
      { ...makeTile('a', 'black', 1), isRevealed: true },
      { ...makeTile('b', 'white', 2), isRevealed: false },
    ];
    expect(isPlayerEliminated(room.players[0])).toBe(false);
  });
});

describe('checkWinner', () => {
  it('생존자 1명이면 승자 반환', () => {
    const room = makeRoom(2);
    room.players[0].tiles = [{ ...makeTile('a', 'black', 1), isRevealed: false }];
    room.players[1].tiles = [{ ...makeTile('b', 'white', 2), isRevealed: true }];
    expect(checkWinner(room)?.id).toBe('p0');
  });

  it('생존자 2명이면 null', () => {
    const room = makeRoom(2);
    room.players[0].tiles = [{ ...makeTile('a', 'black', 1), isRevealed: false }];
    room.players[1].tiles = [{ ...makeTile('b', 'white', 2), isRevealed: false }];
    expect(checkWinner(room)).toBeNull();
  });
});

// ─── revealOwnTile ────────────────────────────────────────────────────────────

describe('revealOwnTile', () => {
  it('비공개 타일을 공개', () => {
    const room = makeRoom(2);
    room.players[0].tiles = [makeTile('a', 'black', 5)];
    expect(revealOwnTile(room, 'p0', 'a')).toBe(true);
    expect(room.players[0].tiles[0].isRevealed).toBe(true);
  });

  it('이미 공개된 타일은 다시 공개 불가', () => {
    const room = makeRoom(2);
    room.players[0].tiles = [{ ...makeTile('a', 'black', 5), isRevealed: true }];
    expect(revealOwnTile(room, 'p0', 'a')).toBe(false);
  });

  it('없는 타일이면 false', () => {
    const room = makeRoom(2);
    expect(revealOwnTile(room, 'p0', 'nonexistent')).toBe(false);
  });
});
