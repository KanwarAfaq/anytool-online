import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { AudioManager } from '@/audio/AudioManager';

const KEYFRAMES = `
@keyframes defeatedIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes titleDrop {
  0% { opacity: 0; transform: translateY(-30px) scale(1.1); filter: brightness(2); }
  60% { opacity: 1; transform: translateY(4px) scale(1); filter: brightness(1.2); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: brightness(1); }
}
@keyframes redPulse {
  0%, 100% { text-shadow: 0 0 20px rgba(220,38,38,0.6), 0 0 40px rgba(220,38,38,0.2); }
  50% { text-shadow: 0 0 40px rgba(220,38,38,1), 0 0 80px rgba(220,38,38,0.5); }
}
@keyframes btnIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes btnGlow {
  0%, 100% { box-shadow: 0 0 8px rgba(212,168,67,0.4); }
  50% { box-shadow: 0 0 20px rgba(212,168,67,0.8); }
}
@keyframes vignetteIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes subtitleFade {
  from { opacity: 0; }
  to { opacity: 0.65; }
}
`;

export const DefeatedScreen: React.FC = () => {
  const respawn = useGameStore((s) => s.respawn);
  const setScreen = useGameStore((s) => s.setScreen);
  const [visible, setVisible] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [hovered, setHovered] = useState<'respawn' | 'menu' | null>(null);

  useEffect(() => {
    // 1.5s dramatic delay before showing
    const t1 = setTimeout(() => setVisible(true), 1500);
    const t2 = setTimeout(() => setShowButton(true), 2800);
    AudioManager.getInstance().playDefeat();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleRespawn = () => {
    AudioManager.getInstance().playUIClick();
    respawn();
  };

  const handleMenu = () => {
    AudioManager.getInstance().playUIClick();
    setScreen('mainmenu');
  };

  const btnStyle = (key: 'respawn' | 'menu'): React.CSSProperties => ({
    fontFamily: "'Cinzel', serif",
    fontSize: key === 'respawn' ? '15px' : '13px',
    letterSpacing: '0.3em',
    padding: key === 'respawn' ? '13px 36px' : '10px 28px',
    border: `1px solid ${
      hovered === key
        ? 'rgba(212,168,67,0.9)'
        : key === 'respawn'
        ? 'rgba(212,168,67,0.5)'
        : 'rgba(212,168,67,0.25)'
    }`,
    background:
      hovered === key
        ? 'rgba(212,168,67,0.14)'
        : key === 'respawn'
        ? 'rgba(212,168,67,0.07)'
        : 'rgba(5,10,20,0.6)',
    color: hovered === key ? '#f0d080' : key === 'respawn' ? '#d4a843' : '#c4a060',
    cursor: 'pointer',
    borderRadius: '3px',
    transition: 'all 0.2s',
    transform: hovered === key ? 'scale(1.05)' : 'scale(1)',
    animation:
      showButton
        ? key === 'respawn'
          ? 'btnGlow 2.5s ease-in-out infinite'
          : 'none'
        : 'none',
    outline: 'none',
    pointerEvents: 'all',
  });

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* Dark overlay — appears immediately */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,2,2,0.78)',
          zIndex: 180,
          animation: 'vignetteIn 0.8s ease',
          pointerEvents: 'all',
        }}
      />

      {/* Red vignette */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(100,0,0,0.45) 100%)',
          zIndex: 181,
          pointerEvents: 'none',
        }}
      />

      {/* Content — delayed */}
      {visible && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 182,
            animation: 'defeatedIn 0.4s ease',
            gap: '0',
            pointerEvents: 'all',
          }}
        >
          {/* Decorative line top */}
          <div
            style={{
              width: '240px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.5), transparent)',
              marginBottom: '32px',
            }}
          />

          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(36px, 6vw, 72px)',
              fontWeight: 900,
              letterSpacing: '0.2em',
              color: '#ef4444',
              animation: 'titleDrop 0.6s cubic-bezier(0.23, 1, 0.32, 1), redPulse 3s ease-in-out 0.6s infinite',
              margin: '0',
              textAlign: 'center',
            }}
          >
            YOU HAVE FALLEN
          </h1>

          <p
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(12px, 1.8vw, 16px)',
              letterSpacing: '0.35em',
              color: '#9b7070',
              marginTop: '10px',
              marginBottom: '52px',
              animation: 'subtitleFade 0.8s ease 0.4s both',
            }}
          >
            THE REALM GROWS DARKER...
          </p>

          {/* Decorative line bottom */}
          <div
            style={{
              width: '160px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.3), transparent)',
              marginBottom: '40px',
            }}
          />

          {showButton && (
            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                animation: 'btnIn 0.5s ease',
              }}
            >
              <button
                style={btnStyle('respawn')}
                onMouseEnter={() => setHovered('respawn')}
                onMouseLeave={() => setHovered(null)}
                onClick={handleRespawn}
              >
                RESPAWN
              </button>
              <button
                style={btnStyle('menu')}
                onMouseEnter={() => setHovered('menu')}
                onMouseLeave={() => setHovered(null)}
                onClick={handleMenu}
              >
                MAIN MENU
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DefeatedScreen;
