import { useState, useCallback, useRef } from 'react';
import type { GameRoom, Tile, TileColor } from './types';
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
  const [lastGuessResult, setLastGuessResult] = useState<{ correct: boolean; tile: Tile } | null>(null);
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
      setPage('game');
    }, []),

    onTileDrawn: useCallback((tile: Tile) => {
      setDrawnTile(tile);
      setHasDrawnThisTurn(true);
    }, []),

    onMustPlaceJoker: useCallback(() => {
      setMustPlaceJoker(true);
    }, []),

    onGuessResult: useCallback((correct: boolean, tile: Tile) => {
      setLastGuessResult({ correct, tile });
      setDrawnTile(null);
      if (!correct) {
        setHasDrawnThisTurn(false);
      }
      setTimeout(() => setLastGuessResult(null), 2500);
    }, []),

    onMustRevealTile: useCallback(() => {
      setMustRevealTile(true);
    }, []),

    onGameOver: useCallback((winnerId: string, winnerNickname: string) => {
      setGameOver({ winnerId, winnerNickname });
      setPage('finished');
    }, []),

    onError: useCallback((message: string) => {
      setError(message);
    }, []),
  });

  const handleJoinRoom = (roomId: string, nickname: string) => {
    setError(null);
    socket.joinRoom(roomId, nickname);
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
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-white/4 border border-white/8 rounded-2xl p-8 space-y-4">
            <div className="text-6xl">{isWinner ? '🏆' : '💀'}</div>
            <h1 className="text-3xl font-black text-white">
              {isWinner ? '승리!' : '패배'}
            </h1>
            <p className="text-white/40">
              {isWinner
                ? '모든 상대 타일을 맞혔습니다!'
                : `${gameOver?.winnerNickname ?? '상대방'}이(가) 승리했습니다.`}
            </p>
            <button
              onClick={handleBackToLobby}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3.5 rounded-xl transition-colors"
            >
              로비로 돌아가기
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
