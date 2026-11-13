import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { AudioManager } from '@/audio/AudioManager';

const KEYFRAMES = `
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes floatOrb {
  0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.4; }
  33% { transform: translateY(-30px) translateX(15px) scale(1.1); opacity: 0.7; }
  66% { transform: translateY(20px) translateX(-10px) scale(0.9); opacity: 0.3; }
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes buttonGlow {
  0%, 100% { box-shadow: 0 0 8px rgba(212, 168, 67, 0.4), inset 0 0 8px rgba(212, 168, 67, 0.05); }
  50% { box-shadow: 0 0 20px rgba(212, 168, 67, 0.8), inset 0 0 16px rgba(212, 168, 67, 0.15); }
}
@keyframes subtitleFade {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
@keyframes versionBlink {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
@keyframes loadingDots {
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
}
`;

interface Orb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const MENU_BUTTONS = [
  { label: 'PLAY', key: 'play' },
  { label: 'SETTINGS', key: 'settings' },
  { label: 'CONTROLS', key: 'controls' },
  { label: 'CREDITS', key: 'credits' },
] as const;

type MenuKey = 'play' | 'settings' | 'controls' | 'credits';

export const MainMenu: React.FC = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const [hoveredBtn, setHoveredBtn] = useState<MenuKey | null>(null);
  const [orbs] = useState<Orb[]>(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 6 + Math.random() * 18,
      color:
        i % 3 === 0
          ? 'rgba(212,168,67,0.55)'
          : i % 3 === 1
          ? 'rgba(79,209,197,0.45)'
          : 'rgba(159,122,234,0.45)',
      duration: 5 + Math.random() * 8,
      delay: Math.random() * 5,
    }))
  );
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const handleButton = (key: MenuKey) => {
    AudioManager.getInstance().playUIClick();
    if (key === 'play') {
      setScreen('loading');
    } else if (key === 'settings') {
      setShowSettingsPanel(true);
    } else if (key === 'controls') {
      setScreen('controls');
    } else if (key === 'credits') {
      setScreen('credits');
    }
  };

  const styles: Record<string, React.CSSProperties> = {
    root: {
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(ellipse at center, rgba(5,10,20,0.45) 0%, rgba(5,10,20,0.82) 70%, rgba(3,6,12,0.95) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: "'Rajdhani', sans-serif",
      userSelect: 'none',
    },
    orbsLayer: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
    },
    centerContent: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0px',
      zIndex: 10,
    },
    logo: {
      fontFamily: "'Cinzel', serif",
      fontSize: 'clamp(52px, 9vw, 96px)',
      fontWeight: 900,
      letterSpacing: '0.18em',
      background: 'linear-gradient(90deg, #b8850a 0%, #f0d080 30%, #d4a843 50%, #f0d080 70%, #b8850a 100%)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'shimmer 3.5s linear infinite',
      textShadow: 'none',
      margin: 0,
      lineHeight: 1.05,
    },
    subtitle: {
      fontFamily: "'Cinzel', serif",
      fontSize: 'clamp(14px, 2.2vw, 22px)',
      letterSpacing: '0.5em',
      color: '#b89a50',
      animation: 'subtitleFade 4s ease-in-out infinite',
      marginTop: '4px',
      marginBottom: '48px',
    },
    buttonStack: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      width: '260px',
    },
    version: {
      position: 'fixed',
      bottom: '18px',
      right: '22px',
      fontFamily: "'Rajdhani', sans-serif",
      fontSize: '11px',
      color: '#6b7a8d',
      letterSpacing: '0.12em',
      animation: 'versionBlink 4s ease-in-out infinite',
    },
    loadingHint: {
      position: 'fixed',
      bottom: '18px',
      left: '22px',
      fontFamily: "'Rajdhani', sans-serif",
      fontSize: '11px',
      color: '#4fd1c5',
      letterSpacing: '0.15em',
      opacity: 0.5,
    },
    decorLine: {
      width: '180px',
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.5), transparent)',
      margin: '0 auto 38px',
    },
  };

  const getButtonStyle = (key: MenuKey, isPrimary: boolean): React.CSSProperties => ({
    fontFamily: "'Cinzel', serif",
    fontSize: isPrimary ? '17px' : '14px',
    letterSpacing: '0.3em',
    padding: isPrimary ? '14px 32px' : '11px 28px',
    border: `1px solid ${hoveredBtn === key ? 'rgba(212,168,67,0.9)' : 'rgba(212,168,67,0.4)'}`,
    background:
      hoveredBtn === key
        ? 'rgba(212,168,67,0.12)'
        : isPrimary
        ? 'rgba(212,168,67,0.06)'
        : 'rgba(5,10,20,0.6)',
    color: hoveredBtn === key ? '#f0d080' : isPrimary ? '#d4a843' : '#c4a060',
    cursor: 'pointer',
    borderRadius: '3px',
    transition: 'all 0.22s ease',
    transform: hoveredBtn === key ? 'scale(1.045)' : 'scale(1)',
    animation: isPrimary ? 'buttonGlow 2.5s ease-in-out infinite' : 'none',
    outline: 'none',
    width: '100%',
    textAlign: 'center',
  });

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div style={styles.root}>
        {/* Particle orbs */}
        <div style={styles.orbsLayer}>
          {orbs.map((orb) => (
            <div
              key={orb.id}
              style={{
                position: 'absolute',
                left: `${orb.x}%`,
                top: `${orb.y}%`,
                width: `${orb.size}px`,
                height: `${orb.size}px`,
                borderRadius: '50%',
                background: orb.color,
                filter: 'blur(4px)',
                animation: `floatOrb ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Vignette overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,10,20,0.85) 100%)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />

        {/* Center content */}
        <div style={styles.centerContent}>
          <h1 style={styles.logo}>LUMENFALL</h1>
          <p style={styles.subtitle}>THE LOST REALM</p>
          <div style={styles.decorLine} />

          <div style={styles.buttonStack}>
            {MENU_BUTTONS.map(({ label, key }) => (
              <button
                key={key}
                style={getButtonStyle(key, key === 'play')}
                onMouseEnter={() => setHoveredBtn(key)}
                onMouseLeave={() => setHoveredBtn(null)}
                onClick={() => handleButton(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.loadingHint}>3D WORLD LOADING...</div>
        <div style={styles.version}>v1.0.0 — LUMENFALL ENGINE</div>
      </div>
    </>
  );
};

export default MainMenu;
