import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { AudioManager } from '@/audio/AudioManager';
import { SettingsPanel } from './SettingsPanel';

const KEYFRAMES = `
@keyframes backdropIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes panelSlideIn {
  from { opacity: 0; transform: translate(-50%, -52%) scale(0.94); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes buttonGlow {
  0%, 100% { box-shadow: 0 0 6px rgba(212,168,67,0.3); }
  50% { box-shadow: 0 0 16px rgba(212,168,67,0.7); }
}
@keyframes titleShimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
`;

const PAUSE_BUTTONS = [
  { label: 'RESUME', key: 'resume', primary: true },
  { label: 'RESTART LEVEL', key: 'restart', primary: false },
  { label: 'SETTINGS', key: 'settings', primary: false },
  { label: 'MAIN MENU', key: 'mainmenu', primary: false },
] as const;

type PauseKey = 'resume' | 'restart' | 'settings' | 'mainmenu';

export const PauseMenu: React.FC = () => {
  const resumeGame = useGameStore((s) => s.resumeGame);
  const restartLevel = useGameStore((s) => s.restartLevel);
  const setScreen = useGameStore((s) => s.setScreen);
  const [hovered, setHovered] = useState<PauseKey | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        AudioManager.getInstance().playUIClick();
        resumeGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [resumeGame]);

  const handleButton = (key: PauseKey) => {
    AudioManager.getInstance().playUIClick();
    switch (key) {
      case 'resume':
        resumeGame();
        break;
      case 'restart':
        restartLevel();
        break;
      case 'settings':
        setShowSettings(true);
        break;
      case 'mainmenu':
        setScreen('mainmenu');
        break;
    }
  };

  const getButtonStyle = (key: PauseKey, primary: boolean): React.CSSProperties => ({
    fontFamily: "'Cinzel', serif",
    fontSize: primary ? '15px' : '13px',
    letterSpacing: '0.3em',
    padding: primary ? '13px 28px' : '10px 24px',
    border: `1px solid ${
      hovered === key ? 'rgba(212,168,67,0.9)' : 'rgba(212,168,67,0.4)'
    }`,
    background:
      hovered === key
        ? 'rgba(212,168,67,0.14)'
        : primary
        ? 'rgba(212,168,67,0.07)'
        : 'rgba(5,10,20,0.5)',
    color: hovered === key ? '#f0d080' : primary ? '#d4a843' : '#c4a060',
    cursor: 'pointer',
    borderRadius: '3px',
    transition: 'all 0.2s ease',
    transform: hovered === key ? 'scale(1.04)' : 'scale(1)',
    animation: primary ? 'buttonGlow 2.5s ease-in-out infinite' : 'none',
    outline: 'none',
    width: '100%',
    textAlign: 'center',
    pointerEvents: 'all',
  });

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* Blurred Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,10,20,0.72)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 100,
          animation: 'backdropIn 0.3s ease',
          pointerEvents: 'all',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 101,
          width: '320px',
          background: 'rgba(5,10,20,0.92)',
          border: '1px solid rgba(212,168,67,0.35)',
          borderRadius: '8px',
          padding: '40px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          animation: 'panelSlideIn 0.3s ease',
          boxShadow: '0 0 60px rgba(0,0,0,0.9), 0 0 30px rgba(212,168,67,0.08)',
          pointerEvents: 'all',
        }}
      >
        {/* Decorative top line */}
        <div
          style={{
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.5), transparent)',
            marginBottom: '8px',
          }}
        />

        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '28px',
            fontWeight: 900,
            letterSpacing: '0.35em',
            background: 'linear-gradient(90deg, #b8850a, #f0d080, #d4a843, #f0d080, #b8850a)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'titleShimmer 3s linear infinite',
            margin: '0 0 16px',
          }}
        >
          PAUSED
        </h2>

        {PAUSE_BUTTONS.map(({ label, key, primary }) => (
          <button
            key={key}
            style={getButtonStyle(key, primary)}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleButton(key)}
          >
            {label}
          </button>
        ))}

        <div
          style={{
            marginTop: '8px',
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.3), transparent)',
          }}
        />

        <div
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '11px',
            color: 'rgba(107,122,141,0.8)',
            letterSpacing: '0.2em',
          }}
        >
          [ESC] RESUME
        </div>
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
};

export default PauseMenu;
