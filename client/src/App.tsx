import { useState, useCallback, useRef } from 'react';
import posthog from 'posthog-js';
import type { GameRoom, GuessResult, Tile, TileColor } from './types';
import { useSocket } from './hooks/useSocket';
import { LobbyPage } from './pages/LobbyPage';
import { WaitingRoom } from './pages/WaitingRoom';
import { GamePage } from './pages/GamePage';

type Page = 'lobby' | 'waiting' | 'game' | 'finished';

interface GameOver {
  winnerId: string;
  winnerNickname: string;
}

export default function App() {
  const [page, setPage] = useState<Page>('lobby');
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [myId, setMyId] = useState<string>('');
  const myIdRef = useRef<string>('');
  const [drawnTile, setDrawnTile] = useState<Tile | null>(null);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false);
  const [mustPlaceJoker, setMustPlaceJoker] = useState(false);
  const [mustRevealTile, setMustRevealTile] = useState(false);
  const [lastGuessResult, setLastGuessResult] = useState<GuessResult | null>(null);
  const [gameOver, setGameOver] = useState<GameOver | null>(null);
  const [error, setError] = useState<string | null>(null);

  const socket = useSocket({
    onRoomJoined: useCallback((r: GameRoom, id: string) => {
      setRoom(r);
      setMyId(id);
      myIdRef.current = id;
      setPage('waiting');
      setError(null);
    }, []),

    onRoomUpdated: useCallback((r: GameRoom) => {
      setRoom(r);
      if (r.status === 'waiting') {
        setPage('waiting');
      }
      const isMyTurn = r.players[r.currentTurnIndex]?.id === myIdRef.current;
      if (!isMyTurn) {
        setHasDrawnThisTurn(false);
        setDrawnTile(null);
        setMustPlaceJoker(false);
        setMustRevealTile(false);
      } else if (r.deck.length === 0 && r.phase === 'draw') {
        // 덱이 비었으면 뽑기 없이 바로 추리
        setHasDrawnThisTurn(true);
      }
    }, []),

    onGameStarted: useCallback((r: GameRoom) => {
      setRoom(r);
      setDrawnTile(null);
      setHasDrawnThisTurn(false);
      setMustPlaceJoker(false);
      setMustRevealTile(false);
      setLastGuessResult(null);
      setGameOver(null);
      setPage('game');
      posthog.capture('game_started', { player_count: r.players.length });
    }, []),

    onTileDrawn: useCallback((tile: Tile) => {
      setDrawnTile(tile);
      setHasDrawnThisTurn(true);
    }, []),

    onMustPlaceJoker: useCallback(() => {
      setMustPlaceJoker(true);
    }, []),

    onGuessResult: useCallback((result: GuessResult) => {
      setLastGuessResult(result);
      setDrawnTile(null);
      if (!result.correct) {
        setHasDrawnThisTurn(false);
      }
      posthog.capture(result.correct ? 'guess_correct' : 'guess_wrong');
      setTimeout(() => setLastGuessResult(null), 2500);
    }, []),

    onMustRevealTile: useCallback(() => {
      setMustRevealTile(true);
    }, []),

    onGameOver: useCallback((winnerId: string, winnerNickname: string) => {
      setGameOver({ winnerId, winnerNickname });
      setPage('finished');
      posthog.capture('game_ended', { won: winnerId === myIdRef.current });
    }, []),

    onError: useCallback((message: string) => {
      setError(message);
    }, []),
  });

  const handleJoinRoom = (roomId: string, nickname: string, turnDurationSec?: 30 | 60) => {
    setError(null);
    socket.joinRoom(roomId, nickname, turnDurationSec);
  };

  const handleJoinRandom = (nickname: string) => {
    setError(null);
    socket.joinRandom(nickname);
  };

  const handlePlaceJoker = (position: number) => {
    setMustPlaceJoker(false);
    socket.placeJoker(position);
  };

  const handleBackToLobby = () => {
    setPage('lobby');
    setRoom(null);
    setMyId('');
    myIdRef.current = '';
    setDrawnTile(null);
    setHasDrawnThisTurn(false);
    setMustPlaceJoker(false);
    setMustRevealTile(false);
    setLastGuessResult(null);
    setGameOver(null);
    setError(null);
  };

  if (page === 'lobby') {
    return (
      <>
        <LobbyPage onJoinRoom={handleJoinRoom} onJoinRandom={handleJoinRandom} />
        {error && <ErrorToast message={error} />}
      </>
    );
  }

  if (page === 'waiting' && room) {
    return (
      <>
        <WaitingRoom room={room} myId={myId} onReady={socket.setReady} />
        {error && <ErrorToast message={error} />}
      </>
    );
  }

  if (page === 'game' && room) {
    return (
      <>
        <GamePage
          room={room}
          myId={myId}
          drawnTile={drawnTile}
          hasDrawnThisTurn={hasDrawnThisTurn}
          mustPlaceJoker={mustPlaceJoker}
          mustRevealTile={mustRevealTile}
          onDrawTile={socket.drawTile}
          onPlaceJoker={handlePlaceJoker}
          onGuessTile={(targetPlayerId: string, tileId: string, guessedColor: TileColor, guessedNumber: number | null) =>
            socket.guessTile(targetPlayerId, tileId, guessedColor, guessedNumber)}
          onSkipGuess={socket.skipGuess}
          onRevealOwnTile={socket.revealOwnTile}
          lastGuessResult={lastGuessResult}
        />
        {error && <ErrorToast message={error} />}
      </>
    );
  }

  if (page === 'finished') {
    const isWinner = gameOver?.winnerId === myId;
    return (
      <div style={{ minHeight: '100vh', background: '#131c2b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: 'min(420px,92vw)', textAlign: 'center', animation: 'screen-in .35s ease' }}>
          <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: 4, color: '#4e6080', textTransform: 'uppercase', marginBottom: 12 }}>Game Finished</p>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 46, fontWeight: 900, color: isWinner ? '#c8a84b' : '#dde3ee', letterSpacing: 2, lineHeight: 1 }}>
            {isWinner ? '승리' : '패배'}
          </h1>
          <div style={{ width: 42, height: 1, background: '#2a3a54', margin: '18px auto 20px' }}/>
          <p style={{ fontFamily: 'Inter', fontSize: 14, lineHeight: 1.7, color: '#8898b0', marginBottom: 28 }}>
            {isWinner
              ? '모든 상대 타일을 추리했습니다.'
              : `${gameOver?.winnerNickname ?? '상대방'}님이 마지막까지 살아남았습니다.`}
          </p>
          <div style={{
            background: '#1b2536', border: '1px solid #2a3a54', borderRadius: 8,
            padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
          }}>
            <button
              onClick={socket.restartGame}
              style={{ border: 'none', borderRadius: 4, padding: '12px 10px', background: '#c8a84b', color: '#0a0a0c', fontFamily: 'Inter', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              같은 방에서 다시하기
            </button>
            <button
              onClick={handleBackToLobby}
              style={{ border: '1px solid #2a3a54', borderRadius: 4, padding: '12px 10px', background: 'transparent', color: '#8898b0', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              로비로 나가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function ErrorToast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium whitespace-nowrap">
      {message}
    </div>
  );
}
