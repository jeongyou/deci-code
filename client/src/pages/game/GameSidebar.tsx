import type { Player } from '../../types';
import type { Phase } from './types';
import { Avatar } from '../../components/Avatar';

const PHASE_STEPS = [
  { key: 'draw', label: '타일 뽑기' },
  { key: 'select', label: '타일 선택' },
  { key: 'correct', label: '정답 처리' },
] as const;

interface Props {
  players: Player[];
  myId: string;
  currentTurnIndex: number;
  phase: Phase;
  isMyTurn: boolean;
  log: string[];
}

export function GameSidebar({ players, myId, currentTurnIndex, phase, isMyTurn, log }: Props) {
  const eliminated = (p: Player) => p.tiles.length > 0 && p.tiles.every(t => t.isRevealed);

  return (
    <div className="sidebar" style={{ width: 200, borderLeft: '1px solid #2a3a54', display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#1b2536' }}>

      {/* Players */}
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #2a3a54' }}>
        <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: 3, color: '#4e6080', textTransform: 'uppercase', marginBottom: 10 }}>Players</p>
        {players.map(p => {
          const isTurn = players[currentTurnIndex]?.id === p.id;
          const elim = eliminated(p);
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 0', borderBottom: '1px solid #1e2d42', opacity: elim ? .3 : 1 }}>
              <Avatar initials={p.nickname[0]} active={isTurn} size={22}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: isTurn ? 600 : 400, color: isTurn ? '#c8a84b' : '#8898b0', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.nickname}{p.id === myId ? ' ★' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                {p.tiles.map((t, i) => (
                  <div key={i} style={{ width: 4, height: 13, borderRadius: 1, background: t.isRevealed ? '#2a3a54' : t.color === 'white' ? '#c0b8a0' : '#282828', border: t.color === 'white' && !t.isRevealed ? '0.5px solid #888' : '0.5px solid #2a2a2a', opacity: t.isRevealed ? .3 : 1 }}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Phase */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #2a3a54' }}>
        <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: 3, color: '#4e6080', textTransform: 'uppercase', marginBottom: 8 }}>Phase</p>
        {PHASE_STEPS.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: phase === s.key && isMyTurn ? '#c8a84b' : '#2a3a54' }}/>
            <span style={{ fontFamily: 'Inter', fontSize: 11, color: phase === s.key && isMyTurn ? '#8898b0' : '#4e6080' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Log */}
      <div style={{ flex: 1, padding: '10px 14px', overflow: 'hidden' }}>
        <p style={{ fontFamily: 'Inter', fontSize: 9, letterSpacing: 3, color: '#4e6080', textTransform: 'uppercase', marginBottom: 8 }}>Log</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', height: 'calc(100% - 26px)' }}>
          {log.map((entry, i) => (
            <p key={i} style={{ fontFamily: 'Inter', fontSize: 11, lineHeight: 1.5, color: i === 0 ? '#8898b0' : '#4e6080', borderLeft: i === 0 ? '1.5px solid #2a3a54' : '1.5px solid transparent', paddingLeft: 6 }}>
              {entry}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
