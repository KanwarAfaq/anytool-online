import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { AudioManager } from '@/audio/AudioManager';

const KEYFRAMES = `
@keyframes raysRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes victoryShimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes victoryIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes subtitlePulse {
  0%, 100% { opacity: 0.7; letter-spacing: 0.4em; }
  50% { opacity: 1; letter-spacing: 0.5em; }
}
@keyframes floatParticle {
  0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.9; }
  100% { transform: translateY(-120px) translateX(var(--dx)) scale(0); opacity: 0; }
}
@keyframes statsIn {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes goldButtonPulse {
  0%, 100% { box-shadow: 0 0 10px rgba(212,168,67,0.5), 0 0 30px rgba(212,168,67,0.2); }
  50% { box-shadow: 0 0 20px rgba(212,168,67,0.9), 0 0 50px rgba(212,168,67,0.4); }
}
@keyframes backdropIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  dx: number;
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const VictoryScreen: React.FC = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const restartLevel = useGameStore((s) => s.restartLevel);
  const crystals = useGameStore((s) => s.crystalsCollected);
  const totalCrystals = useGameStore((s) => s.totalCrystals);
  const hp = useGameStore((s) => s.hp);
  const maxHp = useGameStore((s) => s.maxHp);
  const elapsedSeconds = useGameStore((s) => s.elapsedSeconds) ?? 0;

  const [hovered, setHovered] = useState<'again' | 'menu' | null>(null);
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 20 + Math.random() * 70,
      color:
        i % 3 === 0
          ? '#f0d080'
          : i % 3 === 1
          ? '#4fd1c5'
          : '#9f7aea',
      size: 4 + Math.random() * 8,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 3,
      dx: -40 + Math.random() * 80,
    }))
  );

  useEffect(() => {
    AudioManager.getInstance().playVictory();
  }, []);

  const handlePlayAgain = () => {
    AudioManager.getInstance().playUIClick();
    restartLevel();
  };

  const handleMainMenu = () => {
    AudioManager.getInstance().playUIClick();
    setScreen('mainmenu');
  };

  const hpPct = Math.round((hp / maxHp) * 100);

  const statRows = [
    { label: 'TIME COMPLETED', value: formatTime(elapsedSeconds) },
    { label: 'CRYSTALS', value: `${crystals} / ${totalCrystals}` },
    { label: 'HEALTH REMAINING', value: `${hpPct}%` },
  ];

  const btnStyle = (key: 'again' | 'menu'): React.CSSProperties => ({
    fontFamily: "'Cinzel', serif",
    fontSize: key === 'again' ? '15px' : '13px',
    letterSpacing: '0.3em',
    padding: key === 'again' ? '14px 40px' : '11px 32px',
    border: `1px solid ${hovered === key ? 'rgba(212,168,67,0.9)' : 'rgba(212,168,67,0.45)'}`,
    background:
      hovered === key
        ? 'rgba(212,168,67,0.18)'
        : key === 'again'
        ? 'rgba(212,168,67,0.09)'
        : 'rgba(5,10,20,0.6)',
    color: hovered === key ? '#f0d080' : key === 'again' ? '#d4a843' : '#c4a060',
    cursor: 'pointer',
    borderRadius: '3px',
    transition: 'all 0.22s',
    transform: hovered === key ? 'scale(1.05)' : 'scale(1)',
    animation: key === 'again' ? 'goldButtonPulse 2.5s ease-in-out infinite' : 'none',
    outline: 'none',
    pointerEvents: 'all',
  });

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,10,20,0.92)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          overflow: 'hidden',
          animation: 'backdropIn 0.5s ease',
          pointerEvents: 'all',
        }}
      >
        {/* Light rays */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '900px',
            height: '900px',
            transform: 'translate(-50%, -50%)',
            animation: 'raysRotate 18s linear infinite',
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '450px',
                height: '2px',
                transformOrigin: '0 50%',
                transform: `rotate(${i * 30}deg)`,
                background: `linear-gradient(90deg, rgba(212,168,67,0.15), transparent)`,
              }}
            />
          ))}
        </div>

        {/* Celebration particles */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {particles.map((p) => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                background: p.color,
                filter: 'blur(1px)',
                ['--dx' as string]: `${p.dx}px`,
                animation: `floatParticle ${p.duration}s ease-out ${p.delay}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0',
            animation: 'victoryIn 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
        >
          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(42px, 7vw, 80px)',
              fontWeight: 900,
              letterSpacing: '0.2em',
              background: 'linear-gradient(90deg, #b8850a 0%, #f0d080 30%, #ffd700 50%, #f0d080 70%, #b8850a 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'victoryShimmer 2.5s linear infinite',
              margin: '0',
              textAlign: 'center',
            }}
          >
            LEVEL COMPLETE!
          </h1>

          <p
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(12px, 2vw, 18px)',
              animation: 'subtitlePulse 3s ease-in-out infinite',
              color: '#9f7aea',
              marginTop: '8px',
              marginBottom: '40px',
            }}
          >
            THE LOST REALM AWAITS...
          </p>

          {/* Stats Panel */}
          <div
            style={{
              background: 'rgba(5,10,20,0.85)',
              border: '1px solid rgba(212,168,67,0.3)',
              borderRadius: '6px',
              padding: '28px 48px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              minWidth: '320px',
              animation: 'statsIn 0.5s ease 0.3s both',
              marginBottom: '36px',
            }}
          >
            {statRows.map((row) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '32px',
                  borderBottom: '1px solid rgba(212,168,67,0.1)',
                  paddingBottom: '12px',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '10px',
                    letterSpacing: '0.25em',
                    color: 'rgba(212,168,67,0.6)',
                  }}
                >
                  {row.label}
                </span>
                <span
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: '18px',
                    color: '#f0d080',
                    fontWeight: 600,
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              style={btnStyle('again')}
              onMouseEnter={() => setHovered('again')}
              onMouseLeave={() => setHovered(null)}
              onClick={handlePlayAgain}
            >
              PLAY AGAIN
            </button>
            <button
              style={btnStyle('menu')}
              onMouseEnter={() => setHovered('menu')}
              onMouseLeave={() => setHovered(null)}
              onClick={handleMainMenu}
            >
              MAIN MENU
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VictoryScreen;
