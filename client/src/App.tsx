import { useState, useCallback } from 'react';
import { GameRoom, Tile } from './types';
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
  const [drawnTile, setDrawnTile] = useState<Tile | null>(null);
  const [lastGuessResult, setLastGuessResult] = useState<{ correct: boolean; tile: Tile } | null>(null);
  const [gameOver, setGameOver] = useState<GameOver | null>(null);
  const [error, setError] = useState<string | null>(null);

  const socket = useSocket({
    onRoomJoined: useCallback((r: GameRoom, id: string) => {
      setRoom(r);
      setMyId(id);
      setPage('waiting');
      setError(null);
    }, []),

    onRoomUpdated: useCallback((r: GameRoom) => {
      setRoom(r);
    }, []),

    onGameStarted: useCallback((r: GameRoom) => {
      setRoom(r);
      setDrawnTile(null);
      setLastGuessResult(null);
      setPage('game');
    }, []),

    onTileDrawn: useCallback((tile: Tile) => {
      setDrawnTile(tile);
    }, []),

    onGuessResult: useCallback((correct: boolean, tile: Tile) => {
      setLastGuessResult({ correct, tile });
      setDrawnTile(null);
      setTimeout(() => setLastGuessResult(null), 2500);
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

  const handleBackToLobby = () => {
    setPage('lobby');
    setRoom(null);
    setMyId('');
    setDrawnTile(null);
    setLastGuessResult(null);
    setGameOver(null);
    setError(null);
  };

  if (page === 'lobby') {
    return (
      <>
        <LobbyPage onJoinRoom={handleJoinRoom} onJoinRandom={handleJoinRandom} />
        {error && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
            {error}
          </div>
        )}
      </>
    );
  }

  if (page === 'waiting' && room) {
    return (
      <>
        <WaitingRoom room={room} myId={myId} onReady={socket.setReady} />
        {error && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
            {error}
          </div>
        )}
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
          onDrawTile={socket.drawTile}
          onGuessTile={socket.guessTile}
          onSkipGuess={socket.skipGuess}
          lastGuessResult={lastGuessResult}
        />
        {error && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
            {error}
          </div>
        )}
      </>
    );
  }

  if (page === 'finished') {
    const isWinner = gameOver?.winnerId === myId;
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-slate-800 rounded-2xl p-8 shadow-xl space-y-4">
            <div className="text-6xl">{isWinner ? '🏆' : '💀'}</div>
            <h1 className="text-3xl font-black text-white">
              {isWinner ? '승리!' : '패배'}
            </h1>
            <p className="text-slate-400">
              {isWinner
                ? '모든 상대 타일을 맞혔습니다!'
                : `${gameOver?.winnerNickname ?? '상대방'}이(가) 승리했습니다.`}
            </p>
            <button
              onClick={handleBackToLobby}
              className="w-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3 rounded-xl transition-colors mt-2"
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
