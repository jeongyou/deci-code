import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameRoom, Tile, TileColor } from '../types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export interface SocketEvents {
  onRoomJoined?: (room: GameRoom, playerId: string) => void;
  onRoomUpdated?: (room: GameRoom) => void;
  onGameStarted?: (room: GameRoom) => void;
  onTileDrawn?: (tile: Tile) => void;
  onGuessResult?: (correct: boolean, tile: Tile) => void;
  onMustPlaceJoker?: () => void;
  onMustRevealTile?: () => void;
  onGameOver?: (winnerId: string, winnerNickname: string) => void;
  onError?: (message: string) => void;
}

export function useSocket(events: SocketEvents) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on('room_joined', (room, playerId) => events.onRoomJoined?.(room, playerId));
    socket.on('room_updated', (room) => events.onRoomUpdated?.(room));
    socket.on('game_started', (room) => events.onGameStarted?.(room));
    socket.on('tile_drawn', (tile) => events.onTileDrawn?.(tile));
    socket.on('guess_result', (correct, tile) => events.onGuessResult?.(correct, tile));
    socket.on('must_place_joker', () => events.onMustPlaceJoker?.());
    socket.on('must_reveal_tile', () => events.onMustRevealTile?.());
    socket.on('game_over', (winnerId, winnerNickname) => events.onGameOver?.(winnerId, winnerNickname));
    socket.on('error', (msg) => events.onError?.(msg));

    return () => { socket.disconnect(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    joinRoom: (roomId: string, nickname: string) =>
      socketRef.current?.emit('join_room', roomId, nickname),
    joinRandom: (nickname: string) =>
      socketRef.current?.emit('join_random', nickname),
    setReady: () => socketRef.current?.emit('set_ready'),
    drawTile: () => socketRef.current?.emit('draw_tile'),
    placeJoker: (position: number) =>
      socketRef.current?.emit('place_joker', position),
    guessTile: (targetPlayerId: string, tileId: string, guessedColor: TileColor, guessedNumber: number | null) =>
      socketRef.current?.emit('guess_tile', targetPlayerId, tileId, guessedColor, guessedNumber),
    skipGuess: () => socketRef.current?.emit('skip_guess'),
    revealOwnTile: (tileId: string) => socketRef.current?.emit('reveal_own_tile', tileId),
  };
}
