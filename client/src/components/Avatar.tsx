interface Props {
  initials: string;
  active: boolean;
  size?: number;
}

export function Avatar({ initials, active, size = 28 }: Props) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: active ? 'rgba(200,168,75,.15)' : '#212e44',
      border: `1.5px solid ${active ? '#c8a84b' : '#2a3a54'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontFamily: 'Playfair Display', fontSize: size * .38, color: active ? '#c8a84b' : '#8898b0', fontWeight: 700, lineHeight: 1 }}>
        {initials}
      </span>
    </div>
  );
}
