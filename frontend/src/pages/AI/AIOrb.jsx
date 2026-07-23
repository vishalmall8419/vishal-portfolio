// Original decorative graphic for the AI hero -- inspired by, but not a
// copy of, the reference image (a glowing neural orb). Built with plain
// SVG + CSS animation so it stays lightweight and theme-aware.
export default function AIOrb() {
  return (
    <div className="ai-orb" aria-hidden="true">
      <div className="ai-orb-ring ai-orb-ring-1" />
      <div className="ai-orb-ring ai-orb-ring-2" />
      <div className="ai-orb-ring ai-orb-ring-3" />

      <svg viewBox="0 0 200 200" className="ai-orb-core">
        <defs>
          <radialGradient id="aiOrbGradient" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="45%" stopColor="#7c5cff" />
            <stop offset="100%" stopColor="#4f8cff" stopOpacity="0.15" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="62" fill="url(#aiOrbGradient)" />
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = (i / 10) * Math.PI * 2;
          const x1 = 100 + Math.cos(angle) * 34;
          const y1 = 100 + Math.sin(angle) * 34;
          const x2 = 100 + Math.cos(angle) * 78;
          const y2 = 100 + Math.sin(angle) * 78;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1"
            />
          );
        })}
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = (i / 10) * Math.PI * 2;
          const x = 100 + Math.cos(angle) * 78;
          const y = 100 + Math.sin(angle) * 78;
          return <circle key={i} cx={x} cy={y} r="3.5" fill="#f5a623" className="ai-orb-node" />;
        })}
      </svg>
    </div>
  );
}
