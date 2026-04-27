import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
}

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  createRoom, addPlayer, dealInitialTiles, drawTile,
  guessPlayerTile, addDrawnTileToPlayer, revealDrawnTileAsPlaced,
  insertJokerAtPosition, nextTurn, checkWinner, revealOwnTile,
  resetRoomForReplay,
} from './gameLogic';
import type { GameRoom, Player, Tile, TileColor } from './types';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const rooms = new Map<string, GameRoom>();
const waitingQueue: { socketId: string; nickname: string }[] = [];
const turnTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearTurnTimer(roomId: string): void {
  const t = turnTimers.get(roomId);
  if (t !== undefined) { clearTimeout(t); turnTimers.delete(roomId); }
}

function scheduleTurnTimer(room: GameRoom): void {
  clearTurnTimer(room.id);
  if (!room.turnStartedAt) return;
  const snapshot = room.turnStartedAt;
  const delay = room.turnDurationSec * 1000;

  turnTimers.set(room.id, setTimeout(() => {
    const r = rooms.get(room.id);
    if (!r || r.status !== 'playing') return;
    if (r.turnStartedAt !== snapshot) return; // 이미 다음 턴으로 넘어감

    const currentPlayer = r.players[r.currentTurnIndex];
    if (!currentPlayer) return;

    // 조커 미배치 상태면 패 맨 뒤에 삽입
    if (r.phase === 'insert' && r.drawnTile) {
      insertJokerAtPosition(r, currentPlayer.id, currentPlayer.tiles.length);
    }
    // 이번 턴에 뽑은 타일이 패에 있으면 공개 (패널티)
    if (r.drawnTileId) {
      revealDrawnTileAsPlaced(r, currentPlayer.id);
    }

    const winner = checkWinner(r);
    if (winner) {
      r.status = 'finished'; r.phase = 'end'; r.winner = winner.id;
      io.to(r.id).emit('game_over', winner.id, winner.nickname);
      clearTurnTimer(r.id);
      return;
    }

    nextTurn(r);
    scheduleTurnTimer(r);
    emitRoomUpdated(r);
  }, delay));
}

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('connected:', socket.id);

  socket.on('join_room', (roomId: string, nickname: string, turnDurationSec?: 30 | 60) => {
    let room = rooms.get(roomId);
    if (!room) {
      room = createRoom(roomId);
      if (turnDurationSec === 30 || turnDurationSec === 60) {
        room.turnDurationSec = turnDurationSec;
      }
      rooms.set(roomId, room);
    }
    if (room.status !== 'waiting') {
      socket.emit('error', '이미 진행 중인 게임입니다.');
      return;
    }
    if (room.players.length >= 4) {
      socket.emit('error', '방이 가득 찼습니다.');
      return;
    }

    addPlayer(room, socket.id, nickname);
    socket.join(roomId);
    emitRoomUpdated(room);
    socket.emit('room_joined', roomForPlayer(room, socket.id), socket.id);
  });

  socket.on('join_random', (nickname: string) => {
    waitingQueue.push({ socketId: socket.id, nickname });

    if (waitingQueue.length >= 2) {
      const pair = waitingQueue.splice(0, 2);
      const roomId = generateRoomId();
      const room = createRoom(roomId);
      rooms.set(roomId, room);

      for (const p of pair) {
        addPlayer(room, p.socketId, p.nickname);
        const s = io.sockets.sockets.get(p.socketId);
        if (s) {
          s.join(roomId);
          s.emit('room_joined', roomForPlayer(room, p.socketId), p.socketId);
        }
      }
      emitRoomUpdated(room);
    } else {
      socket.emit('waiting_for_match');
    }
  });

  socket.on('set_ready', () => {
    const room = findRoomByPlayer(socket.id);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    player.isReady = true;

    const allReady = room.players.length >= 2 && room.players.every(p => p.isReady);
    if (allReady) {
      room.status = 'playing';
      dealInitialTiles(room);
      scheduleTurnTimer(room);
      emitGameStarted(room);
    } else {
      emitRoomUpdated(room);
    }
  });

  socket.on('draw_tile', () => {
    const room = findRoomByPlayer(socket.id);
    if (!room || room.status !== 'playing') return;
    if (room.players[room.currentTurnIndex].id !== socket.id) return;
    if (room.drawnTile || room.phase !== 'draw') return;

    const tile = drawTile(room);
    if (!tile) {
      // 덱 비어있음 → 뽑기 없이 바로 추리
      room.phase = 'guess';
      emitRoomUpdated(room);
      return;
    }

    socket.emit('tile_drawn', tile);

    if (tile.color === 'joker') {
      // 조커는 배치 단계로 이동 (플레이어가 위치 선택)
      room.phase = 'insert';
      socket.emit('must_place_joker');
    } else {
      // 일반 타일은 뽑는 즉시 내 패에 정렬 삽입하고, 오답 시 drawnTileId로 공개한다.
      addDrawnTileToPlayer(room, socket.id);
      room.phase = 'guess';
    }

    emitRoomUpdated(room);
  });

  socket.on('place_joker', (position: number) => {
    const room = findRoomByPlayer(socket.id);
    if (!room || room.status !== 'playing') return;
    if (room.players[room.currentTurnIndex].id !== socket.id) return;
    if (room.phase !== 'insert') return;

    const ok = insertJokerAtPosition(room, socket.id, position);
    if (!ok) return;

    emitRoomUpdated(room);
  });

  socket.on('guess_tile', (targetPlayerId: string, tileId: string, guessedColor: TileColor, guessedNumber: number | null) => {
    const room = findRoomByPlayer(socket.id);
    if (!room || room.status !== 'playing') return;
    if (room.players[room.currentTurnIndex].id !== socket.id) return;
    if (room.phase !== 'guess') return;

    const guesser = room.players.find(p => p.id === socket.id);
    const target = room.players.find(p => p.id === targetPlayerId);
    if (!guesser || !target) return;

    const correct = guessPlayerTile(room, targetPlayerId, tileId, guessedColor, guessedNumber);
    const targetTile = room.players
      .find(p => p.id === targetPlayerId)?.tiles
      .find(t => t.id === tileId);

    if (!targetTile) return;

    io.to(room.id).emit(
      'guess_result',
      correct,
      correct ? targetTile : { ...targetTile, color: targetTile.color === 'white' ? 'white' : 'black', number: null },
      guessedColor,
      guessedNumber,
      guesser.nickname,
      target.nickname
    );

    if (correct) {
      const winner = checkWinner(room);
      if (winner) {
        clearTurnTimer(room.id);
        room.status = 'finished';
        room.phase = 'end';
        room.winner = winner.id;
        io.to(room.id).emit('game_over', winner.id, winner.nickname);
        return;
      }
      emitRoomUpdated(room);
    } else {
      if (room.drawnTile) {
        // 조커가 아직 배치되지 않은 예외 상황
        room.drawnTile.isRevealed = true;
        addDrawnTileToPlayer(room, socket.id);
        nextTurn(room);
        scheduleTurnTimer(room);
        emitRoomUpdated(room);
      } else if (room.drawnTileId) {
        // 이번 턴에 뽑아 패에 들어간 타일 공개, 턴 종료
        revealDrawnTileAsPlaced(room, socket.id);
        nextTurn(room);
        scheduleTurnTimer(room);
        emitRoomUpdated(room);
      } else {
        // 덱이 비어 뽑은 타일 없음 → 자기 타일 직접 선택해서 공개
        socket.emit('must_reveal_tile');
        emitRoomUpdated(room);
      }
    }
  });

  socket.on('reveal_own_tile', (tileId: string) => {
    const room = findRoomByPlayer(socket.id);
    if (!room || room.status !== 'playing') return;
    if (room.players[room.currentTurnIndex].id !== socket.id) return;

    const revealed = revealOwnTile(room, socket.id, tileId);
    if (!revealed) return;

    const winner = checkWinner(room);
    if (winner) {
      clearTurnTimer(room.id);
      room.status = 'finished';
      room.phase = 'end';
      room.winner = winner.id;
      io.to(room.id).emit('game_over', winner.id, winner.nickname);
      return;
    }

    nextTurn(room);
    scheduleTurnTimer(room);
    emitRoomUpdated(room);
  });

  socket.on('skip_guess', () => {
    const room = findRoomByPlayer(socket.id);
    if (!room || room.status !== 'playing') return;
    if (room.players[room.currentTurnIndex].id !== socket.id) return;

    nextTurn(room);
    scheduleTurnTimer(room);
    emitRoomUpdated(room);
  });

  socket.on('restart_game', () => {
    const room = findRoomByPlayer(socket.id);
    if (!room || room.status !== 'finished') return;
    clearTurnTimer(room.id);
    resetRoomForReplay(room);
    emitRoomUpdated(room);
  });

  socket.on('disconnect', () => {
    console.log('disconnected:', socket.id);

    const qIdx = waitingQueue.findIndex(p => p.socketId === socket.id);
    if (qIdx !== -1) waitingQueue.splice(qIdx, 1);

    const room = findRoomByPlayer(socket.id);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== socket.id);
    if (room.players.length === 0) {
      clearTurnTimer(room.id);
      rooms.delete(room.id);
    } else if (room.status === 'playing') {
      if (room.players.length === 1) {
        clearTurnTimer(room.id);
        const winner = room.players[0];
        room.status = 'finished';
        room.phase = 'end';
        io.to(room.id).emit('game_over', winner.id, winner.nickname);
      } else {
        if (room.currentTurnIndex >= room.players.length) {
          room.currentTurnIndex = 0;
        }
        emitRoomUpdated(room);
      }
    } else {
      emitRoomUpdated(room);
    }
  });
});

function findRoomByPlayer(socketId: string): GameRoom | null {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.id === socketId)) return room;
  }
  return null;
}

const PORT = process.env.PORT || 3001;

if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function emitRoomUpdated(room: GameRoom): void {
  for (const player of room.players) {
    io.to(player.id).emit('room_updated', roomForPlayer(room, player.id));
  }
}

function emitGameStarted(room: GameRoom): void {
  for (const player of room.players) {
    io.to(player.id).emit('game_started', roomForPlayer(room, player.id));
  }
}

function roomForPlayer(room: GameRoom, viewerId: string): GameRoom {
  return {
    ...room,
    players: room.players.map(player => playerForViewer(player, player.id === viewerId)),
    drawnTile: room.drawnTile ? tileForViewer(room.drawnTile, true) : null,
  };
}

function playerForViewer(player: Player, isSelf: boolean): Player {
  return {
    ...player,
    tiles: player.tiles.map(tile => tileForViewer(tile, isSelf || tile.isRevealed)),
  };
}

function tileForViewer(tile: Tile, revealIdentity: boolean): Tile {
  if (revealIdentity || tile.color !== 'joker') return { ...tile };
  return { ...tile, color: 'black', number: null };
}
