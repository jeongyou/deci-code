import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  createRoom, addPlayer, dealInitialTiles, drawTile,
  guessPlayerTile, addDrawnTileToPlayer, revealDrawnTileAsPlaced,
  insertJokerAtPosition, nextTurn, checkWinner, revealOwnTile,
} from './gameLogic';
import type { GameRoom, TileColor } from './types';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const rooms = new Map<string, GameRoom>();
const waitingQueue: { socketId: string; nickname: string }[] = [];

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('connected:', socket.id);

  socket.on('join_room', (roomId: string, nickname: string) => {
    let room = rooms.get(roomId);
    if (!room) {
      room = createRoom(roomId);
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
    io.to(roomId).emit('room_updated', room);
    socket.emit('room_joined', room, socket.id);
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
          s.emit('room_joined', room, p.socketId);
        }
      }
      io.to(roomId).emit('room_updated', room);
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
      io.to(room.id).emit('game_started', room);
    } else {
      io.to(room.id).emit('room_updated', room);
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
      io.to(room.id).emit('room_updated', room);
      return;
    }

    socket.emit('tile_drawn', tile);

    if (tile.color === 'joker') {
      // 조커는 배치 단계로 이동 (플레이어가 위치 선택)
      room.phase = 'insert';
      socket.emit('must_place_joker');
    } else {
      room.phase = 'guess';
    }

    io.to(room.id).emit('room_updated', room);
  });

  socket.on('place_joker', (position: number) => {
    const room = findRoomByPlayer(socket.id);
    if (!room || room.status !== 'playing') return;
    if (room.players[room.currentTurnIndex].id !== socket.id) return;
    if (room.phase !== 'insert') return;

    const ok = insertJokerAtPosition(room, socket.id, position);
    if (!ok) return;

    io.to(room.id).emit('room_updated', room);
  });

  socket.on('guess_tile', (targetPlayerId: string, tileId: string, guessedColor: TileColor, guessedNumber: number | null) => {
    const room = findRoomByPlayer(socket.id);
    if (!room || room.status !== 'playing') return;
    if (room.players[room.currentTurnIndex].id !== socket.id) return;
    if (room.phase !== 'guess') return;

    const correct = guessPlayerTile(room, targetPlayerId, tileId, guessedColor, guessedNumber);
    const targetTile = room.players
      .find(p => p.id === targetPlayerId)?.tiles
      .find(t => t.id === tileId);

    if (!targetTile) return;

    io.to(room.id).emit('guess_result', correct, targetTile);

    if (correct) {
      const winner = checkWinner(room);
      if (winner) {
        room.status = 'finished';
        room.winner = winner.id;
        io.to(room.id).emit('game_over', winner.id, winner.nickname);
        return;
      }
      // 정답 → 뽑은 타일을 패에 추가 (조커는 이미 place_joker로 배치됨)
      addDrawnTileToPlayer(room, socket.id);
      io.to(room.id).emit('room_updated', room);
    } else {
      if (room.drawnTile) {
        // 뽑은 타일이 아직 패에 없음 (비조커) → 공개 후 삽입, 턴 종료
        room.drawnTile.isRevealed = true;
        addDrawnTileToPlayer(room, socket.id);
        nextTurn(room);
        io.to(room.id).emit('room_updated', room);
      } else if (room.drawnTileId) {
        // 조커가 이미 배치된 경우 → 해당 타일 공개, 턴 종료
        revealDrawnTileAsPlaced(room, socket.id);
        nextTurn(room);
        io.to(room.id).emit('room_updated', room);
      } else {
        // 덱이 비어 뽑은 타일 없음 → 자기 타일 직접 선택해서 공개
        socket.emit('must_reveal_tile');
        io.to(room.id).emit('room_updated', room);
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
      room.status = 'finished';
      room.winner = winner.id;
      io.to(room.id).emit('game_over', winner.id, winner.nickname);
      return;
    }

    nextTurn(room);
    io.to(room.id).emit('room_updated', room);
  });

  socket.on('skip_guess', () => {
    const room = findRoomByPlayer(socket.id);
    if (!room || room.status !== 'playing') return;
    if (room.players[room.currentTurnIndex].id !== socket.id) return;

    // 뽑은 타일이 아직 패에 없으면 삽입 (조커는 이미 배치됨)
    addDrawnTileToPlayer(room, socket.id);
    nextTurn(room);
    io.to(room.id).emit('room_updated', room);
  });

  socket.on('disconnect', () => {
    console.log('disconnected:', socket.id);

    const qIdx = waitingQueue.findIndex(p => p.socketId === socket.id);
    if (qIdx !== -1) waitingQueue.splice(qIdx, 1);

    const room = findRoomByPlayer(socket.id);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== socket.id);
    if (room.players.length === 0) {
      rooms.delete(room.id);
    } else if (room.status === 'playing') {
      if (room.players.length === 1) {
        const winner = room.players[0];
        room.status = 'finished';
        io.to(room.id).emit('game_over', winner.id, winner.nickname);
      } else {
        if (room.currentTurnIndex >= room.players.length) {
          room.currentTurnIndex = 0;
        }
        io.to(room.id).emit('room_updated', room);
      }
    } else {
      io.to(room.id).emit('room_updated', room);
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
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

