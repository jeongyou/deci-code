import { useState } from 'react';
import type { GameRoom, Player } from '../types';

interface Props {
  room: GameRoom;
  myId: string;
  onReady: () => void;
}

export function WaitingRoom({ room, myId, onReady }: Props) {
  const [copied, setCopied] = useState(false);
  const me = room.players.find(p => p.id === myId);
  const emptySlots = 4 - room.players.length;

  function copyCode() {
    navigator.clipboard.writeText(room.id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const allReady = room.players.length >= 2 && room.players.every(p => p.isReady);

  return (
    <div style={{
      width: '100%', height: '100%', background: '#131c2b',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'screen-in .35s ease', position: 'relative',
    }}>
      <div style={{ width: 'min(400px,90vw)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* 방 코드 */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: 3, color: '#4e6080', textTransform: 'uppercase', marginBottom: 10 }}>방 코드</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <span style={{
              fontFamily: 'Playfair Display', fontSize: 48, fontWeight: 900, color: '#c8a84b',
              letterSpacing: 10, lineHeight: 1, animation: 'code-glow 2s ease-in-out infinite',
            }}>
              {room.id}
            </span>
            <button
              onClick={copyCode}
              style={{
                background: copied ? 'rgba(200,168,75,.15)' : 'none',
                border: `1px solid ${copied ? '#c8a84b' : '#2a3a54'}`,
                borderRadius: 4, padding: '6px 10px', cursor: 'pointer',
                color: copied ? '#c8a84b' : '#4e6080',
                fontFamily: 'Inter', fontSize: 11, transition: 'all .2s',
              }}
            >
              {copied ? '✓ 복사됨' : '복사'}
            </button>
          </div>
          <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#4e6080', marginTop: 8 }}>
            이 코드를 친구에게 공유하세요
          </p>
        </div>

        {/* 플레이어 목록 */}
        <div style={{
          width: '100%', background: '#1b2536', borderRadius: 8, border: '1px solid #2a3a54',
          overflow: 'hidden', marginBottom: 20,
        }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #2a3a54' }}>
            <p style={{ fontFamily: 'Inter', fontSize: 10, letterSpacing: 3, color: '#4e6080', textTransform: 'uppercase' }}>
              플레이어 {room.players.length} / 4
            </p>
          </div>

          {room.players.map((player: Player) => (
            <div key={player.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderBottom: '1px solid #1e2d42', animation: 'dot-enter .3s ease',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: player.isReady ? 'rgba(200,168,75,.15)' : '#212e44',
                border: `1.5px solid ${player.isReady ? '#c8a84b' : '#2a3a54'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'Playfair Display', fontSize: 13, color: player.isReady ? '#c8a84b' : '#8898b0', fontWeight: 700 }}>
                  {player.nickname[0].toUpperCase()}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: player.isReady ? '#dde3ee' : '#8898b0' }}>
                  {player.nickname}{player.id === myId ? ' (나)' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: player.isReady ? '#6fcf97' : '#3a4a5a',
                  boxShadow: player.isReady ? '0 0 8px rgba(111,207,151,.5)' : 'none',
                  transition: 'all .3s',
                }}/>
                <span style={{ fontFamily: 'Inter', fontSize: 11, color: player.isReady ? '#6fcf97' : '#4e6080' }}>
                  {player.isReady ? '준비 완료' : '대기 중'}
                </span>
              </div>
            </div>
          ))}

          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderBottom: i < emptySlots - 1 ? '1px solid #1e2d42' : 'none', opacity: .35,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                border: '1.5px dashed #2a3a54',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#4e6080', fontSize: 16 }}>+</span>
              </div>
              <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#4e6080' }}>대기 중...</p>
            </div>
          ))}
        </div>

        {/* 준비 버튼 */}
        <button
          onClick={onReady}
          disabled={me?.isReady}
          style={{
            width: '100%', padding: '13px', borderRadius: 5,
            border: `1px solid ${me?.isReady ? '#6fcf97' : '#2a3a54'}`,
            background: me?.isReady ? 'rgba(111,207,151,.12)' : 'transparent',
            color: me?.isReady ? '#6fcf97' : '#8898b0',
            fontFamily: 'Inter', fontSize: 14, fontWeight: 600, cursor: me?.isReady ? 'default' : 'pointer',
            transition: 'all .2s', letterSpacing: .3,
            animation: me?.isReady ? 'ready-pop .3s ease' : 'none',
          }}
        >
          {me?.isReady ? '✓ 준비 완료' : '준비하기'}
        </button>

        {allReady && (
          <p style={{
            fontFamily: 'Inter', fontSize: 11, color: '#6fcf97',
            marginTop: 12, textAlign: 'center', animation: 'blink 1.2s ease infinite',
          }}>
            모든 플레이어가 준비되었습니다!
          </p>
        )}

        {room.players.length < 2 && (
          <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#4e6080', marginTop: 12, textAlign: 'center' }}>
            최소 2명이 필요합니다
          </p>
        )}
      </div>
    </div>
  );
}
