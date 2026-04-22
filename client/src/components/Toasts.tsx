export interface Toast { id: number; msg: string; type: 'success' | 'error' | 'info'; fading: boolean; }

export function Toasts({ list }: { list: Toast[] }) {
  return (
    <div style={{ position: 'fixed', top: 52, right: 12, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'none' }}>
      {list.map(t => (
        <div key={t.id} style={{
          background: t.type === 'success' ? '#172b22' : t.type === 'error' ? '#2a1616' : '#1b2536',
          border: `1px solid ${t.type === 'success' ? '#2d6a4a' : t.type === 'error' ? '#6a2d2d' : '#2a3a54'}`,
          color: t.type === 'success' ? '#6fcf97' : t.type === 'error' ? '#eb5757' : '#8898b0',
          padding: '9px 14px', borderRadius: 4, fontFamily: 'Inter', fontSize: 12, fontWeight: 500,
          animation: t.fading ? 'toast-out .25s ease forwards' : 'toast-in .25s ease', maxWidth: 240, lineHeight: 1.5,
        }}>{t.msg}</div>
      ))}
    </div>
  );
}
