import { useState } from 'react';
import { TileCard } from '../components/TileCard';
import type { Tile } from '../types';

interface Props {
  onJoinRoom: (roomId: string, nickname: string) => void;
  onJoinRandom: (nickname: string) => void;
}

type Mode = 'create' | 'join' | 'random' | null;

const DECO_TILES: Tile[] = [
  { id: 'd0', color: 'white', number: 3,  isRevealed: false },
  { id: 'd1', color: 'black', number: 7,  isRevealed: false },
  { id: 'd2', color: 'white', number: 1,  isRevealed: false },
  { id: 'd3', color: 'black', number: 11, isRevealed: false },
  { id: 'd4', color: 'white', number: 0,  isRevealed: false },
];
const DECO_POS = [
  { top: '15%', left: '8%',  rotate: -15, delay: 0 },
  { top: '70%', left: '85%', rotate: 12,  delay: 0.5 },
  { top: '25%', left: '90%', rotate: -8,  delay: 1 },
  { top: '55%', left: '5%',  rotate: 20,  delay: 1.5 },
  { top: '80%', left: '45%', rotate: -5,  delay: 2 },
];

export function LobbyPage({ onJoinRoom, onJoinRandom }: Props) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<Mode>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const ready = name.trim().length >= 1;

  function proceed(m: Mode) {
    if (!name.trim()) { setError('닉네임을 입력하세요'); return; }
    setError('');
    if (m === 'join') {
      if (!code.trim() || code.length < 4) { setError('방 코드를 입력하세요'); return; }
      onJoinRoom(code.toUpperCase(), name.trim());
    } else if (m === 'create') {
      const id = Math.random().toString(36).substring(2, 8).toUpperCase();
      onJoinRoom(id, name.trim());
    } else if (m === 'random') {
      onJoinRandom(name.trim());
    }
  }

  const BUTTONS = [
    { key: 'create' as Mode, label: '방 만들기',   sub: '새 방을 열고 친구를 초대' },
    { key: 'join'   as Mode, label: '코드로 입장', sub: '방 코드로 기존 방에 입장' },
    { key: 'random' as Mode, label: '랜덤 매칭',   sub: '자동으로 상대방 매칭'    },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', background: '#131c2b',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'screen-in .4s ease', position: 'relative', overflow: 'hidden',
    }}>
      {/* 배경 장식 타일 */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {DECO_TILES.map((t, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: DECO_POS[i].top, left: DECO_POS[i].left,
            opacity: .06,
            animation: `float ${3 + i * .4}s ease-in-out infinite`,
            animationDelay: `${DECO_POS[i].delay}s`,
            transform: `rotate(${DECO_POS[i].rotate}deg)`,
          }}>
            <TileCard tile={t} faceDown={false} size="lg" />
          </div>
        ))}
      </div>

      <div style={{ width: 'min(380px,90vw)', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {/* 타이틀 */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontFamily: 'Playfair Display', fontSize: 11, letterSpacing: 6, color: '#4e6080', textTransform: 'uppercase', marginBottom: 12 }}>Board Game</p>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 38, fontWeight: 900, color: '#c8a84b', letterSpacing: 2, lineHeight: 1.1 }}>
            Da Vinci<br/>Code
          </h1>
          <div style={{ width: 40, height: 1, background: '#2a3a54', margin: '16px auto 0' }}/>
        </div>

        {/* 닉네임 */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: 2, color: '#4e6080', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>닉네임</label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter' && mode) proceed(mode); }}
            placeholder="이름을 입력하세요"
            style={{
              width: '100%', background: '#1b2536', border: `1px solid ${error && !name.trim() ? '#eb5757' : '#2a3a54'}`,
              borderRadius: 4, padding: '11px 14px', fontFamily: 'Inter', fontSize: 14, color: '#dde3ee',
              outline: 'none', transition: 'border-color .15s',
            }}
            onFocus={e => (e.target.style.borderColor = '#c8a84b')}
            onBlur={e => (e.target.style.borderColor = error && !name.trim() ? '#eb5757' : '#2a3a54')}
          />
        </div>

        {/* 방 코드 입력 */}
        {mode === 'join' && (
          <div style={{ marginBottom: 20, animation: 'screen-in .25s ease' }}>
            <label style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: 2, color: '#4e6080', textTransform: 'uppercase', display: 'block', marginBottom: 7 }}>방 코드</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="코드 입력"
              style={{
                width: '100%', background: '#1b2536', border: `1px solid ${error && !code.trim() ? '#eb5757' : '#2a3a54'}`,
                borderRadius: 4, padding: '11px 14px', fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700,
                color: '#c8a84b', outline: 'none', letterSpacing: 6, textAlign: 'center',
              }}
              onFocus={e => (e.target.style.borderColor = '#c8a84b')}
              onBlur={e => (e.target.style.borderColor = '#2a3a54')}
            />
          </div>
        )}

        {error && <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#eb5757', marginBottom: 10, textAlign: 'center' }}>{error}</p>}

        {/* 버튼들 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {BUTTONS.map(btn => (
            <button
              key={btn.key}
              onClick={() => { if (mode === btn.key) proceed(btn.key); else setMode(btn.key); }}
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 5,
                border: `1px solid ${mode === btn.key ? '#c8a84b' : '#2a3a54'}`,
                background: mode === btn.key ? 'rgba(200,168,75,.15)' : '#1b2536',
                color: mode === btn.key ? '#c8a84b' : '#8898b0',
                fontFamily: 'Inter', fontSize: 14, fontWeight: mode === btn.key ? 600 : 400,
                cursor: 'pointer', transition: 'all .18s',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left',
              }}
            >
              <div>
                <div>{btn.label}</div>
                <div style={{ fontFamily: 'Inter', fontSize: 11, color: mode === btn.key ? 'rgba(200,168,75,.6)' : '#4e6080', marginTop: 2 }}>{btn.sub}</div>
              </div>
              <span style={{ fontSize: 18, opacity: .5 }}>›</span>
            </button>
          ))}
        </div>

        {mode && (
          <button
            onClick={() => proceed(mode)}
            style={{
              marginTop: 16, width: '100%', padding: '13px', borderRadius: 5,
              border: 'none', background: '#c8a84b', color: '#0a0a0c',
              fontFamily: 'Inter', fontSize: 14, fontWeight: 700, cursor: ready ? 'pointer' : 'not-allowed',
              letterSpacing: .5, opacity: ready ? 1 : .5, transition: 'opacity .15s',
              animation: 'screen-in .25s ease',
            }}
          >
            {mode === 'create' ? '방 만들기' : mode === 'join' ? '입장하기' : '매칭 시작'}
          </button>
        )}
      </div>
    </div>
  );
}
