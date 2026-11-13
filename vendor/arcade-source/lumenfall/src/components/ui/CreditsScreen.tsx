import React, { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { AudioManager } from '@/audio/AudioManager';

const KEYFRAMES = `
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes screenIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes floatOrb {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-20px) scale(1.08); opacity: 0.55; }
}
@keyframes sectionIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes dividerPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
`;

interface CreditEntry {
  label: string;
  value: string;
  highlight?: boolean;
}

const CREDIT_SECTIONS: Array<{ title: string; entries: CreditEntry[] }> = [
  {
    title: 'ENGINE & RENDERING',
    entries: [
      { label: 'Framework', value: 'React Three Fiber (R3F)', highlight: true },
      { label: '3D Library', value: 'Three.js r169', highlight: true },
      { label: 'Helpers', value: '@react-three/drei' },
      { label: 'Physics', value: '@react-three/rapier (Rapier WASM)' },
    ],
  },
  {
    title: 'APPLICATION',
    entries: [
      { label: 'UI Framework', value: 'React 18 + TypeScript' },
      { label: 'State Management', value: 'Zustand' },
      { label: 'Build Tool', value: 'Vite 5' },
      { label: 'Styling', value: 'Inline CSS + CSS Variables' },
    ],
  },
  {
    title: 'AUDIO',
    entries: [
      { label: 'Audio Engine', value: 'Web Audio API' },
      { label: 'Music', value: 'Procedural & Original Composition' },
      { label: 'SFX', value: 'Custom synthesized audio' },
    ],
  },
  {
    title: 'TYPOGRAPHY',
    entries: [
      { label: 'Heading Font', value: 'Cinzel — Google Fonts' },
      { label: 'Body Font', value: 'Rajdhani — Google Fonts' },
    ],
  },
  {
    title: 'SPECIAL THANKS',
    entries: [
      { label: 'Community', value: 'Three.js & R3F open-source community' },
      { label: 'Inspiration', value: 'Classic fantasy adventure games' },
      { label: 'Tools', value: 'VS Code, Blender, GIMP' },
    ],
  },
];

export const CreditsScreen: React.FC = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const [hoveredBack, setHoveredBack] = useState(false);

  const handleBack = () => {
    AudioManager.getInstance().playUIClick();
    setScreen('mainmenu');
  };

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(160deg, #050a14 0%, #07111e 50%, #050a14 100%)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '50px 20px',
          zIndex: 10,
          fontFamily: "'Rajdhani', sans-serif",
        }}
      >
        {/* Background orbs */}
        {[
          { x: 10, y: 15, c: 'rgba(212,168,67,0.3)', d: 7 },
          { x: 85, y: 25, c: 'rgba(79,209,197,0.25)', d: 9 },
          { x: 50, y: 80, c: 'rgba(159,122,234,0.25)', d: 11 },
        ].map((orb, i) => (
          <div
            key={i}
            style={{
              position: 'fixed',
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: orb.c,
              filter: 'blur(40px)',
              animation: `floatOrb ${orb.d}s ease-in-out infinite`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        ))}

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '640px',
            animation: 'screenIn 0.5s ease',
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h1
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(42px, 7vw, 76px)',
                fontWeight: 900,
                letterSpacing: '0.2em',
                background: 'linear-gradient(90deg, #b8850a, #f0d080, #d4a843, #f0d080, #b8850a)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear infinite',
                margin: 0,
              }}
            >
              LUMENFALL
            </h1>
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '13px',
                letterSpacing: '0.45em',
                color: '#9f7aea',
                marginTop: '6px',
                marginBottom: '0',
              }}
            >
              A PREMIUM 3D BROWSER ADVENTURE
            </p>
          </div>

          {/* Top divider */}
          <div
            style={{
              width: '100%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.5), transparent)',
              margin: '28px 0',
              animation: 'dividerPulse 3s ease-in-out infinite',
            }}
          />

          {/* Built-with tagline */}
          <div
            style={{
              textAlign: 'center',
              background: 'rgba(5,10,20,0.6)',
              border: '1px solid rgba(212,168,67,0.2)',
              borderRadius: '6px',
              padding: '16px 24px',
              marginBottom: '36px',
            }}
          >
            <p
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '15px',
                letterSpacing: '0.12em',
                color: 'rgba(232,220,200,0.75)',
                margin: 0,
              }}
            >
              Built with{' '}
              <span style={{ color: '#f0d080', fontWeight: 600 }}>Three.js</span>
              {' '}+{' '}
              <span style={{ color: '#4fd1c5', fontWeight: 600 }}>React Three Fiber</span>
              {' '}+{' '}
              <span style={{ color: '#9f7aea', fontWeight: 600 }}>Rapier Physics</span>
            </p>
          </div>

          {/* Credit sections */}
          {CREDIT_SECTIONS.map((section, sIdx) => (
            <div
              key={section.title}
              style={{
                marginBottom: '30px',
                animation: `sectionIn 0.4s ease ${sIdx * 0.08}s both`,
              }}
            >
              {/* Section title */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ flex: 1, height: '1px', background: 'rgba(212,168,67,0.15)' }} />
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '10px',
                    letterSpacing: '0.35em',
                    color: 'rgba(212,168,67,0.6)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {section.title}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(212,168,67,0.15)' }} />
              </div>

              {/* Entries */}
              <div
                style={{
                  background: 'rgba(5,10,20,0.55)',
                  border: '1px solid rgba(212,168,67,0.12)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                {section.entries.map((entry, eIdx) => (
                  <div
                    key={entry.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '11px 18px',
                      borderBottom:
                        eIdx < section.entries.length - 1
                          ? '1px solid rgba(212,168,67,0.07)'
                          : 'none',
                      gap: '16px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '10px',
                        letterSpacing: '0.18em',
                        color: 'rgba(212,168,67,0.5)',
                        flexShrink: 0,
                      }}
                    >
                      {entry.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: '14px',
                        color: entry.highlight ? '#f0d080' : 'rgba(232,220,200,0.8)',
                        fontWeight: entry.highlight ? 600 : 400,
                        textAlign: 'right',
                      }}
                    >
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Bottom version + copyright */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '8px',
              marginBottom: '36px',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.3), transparent)',
                marginBottom: '20px',
              }}
            />
            <p
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '12px',
                letterSpacing: '0.2em',
                color: 'rgba(107,122,141,0.7)',
                margin: '0 0 6px',
              }}
            >
              LUMENFALL — v1.0.0
            </p>
            <p
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '11px',
                letterSpacing: '0.12em',
                color: 'rgba(107,122,141,0.45)',
                margin: 0,
              }}
            >
              © 2025 LUMENFALL PROJECT. ALL RIGHTS RESERVED.
            </p>
          </div>

          {/* Back */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleBack}
              onMouseEnter={() => setHoveredBack(true)}
              onMouseLeave={() => setHoveredBack(false)}
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '13px',
                letterSpacing: '0.3em',
                padding: '11px 32px',
                border: `1px solid ${hoveredBack ? 'rgba(212,168,67,0.8)' : 'rgba(212,168,67,0.35)'}`,
                background: hoveredBack ? 'rgba(212,168,67,0.12)' : 'rgba(5,10,20,0.6)',
                color: hoveredBack ? '#f0d080' : '#c4a060',
                cursor: 'pointer',
                borderRadius: '3px',
                transition: 'all 0.2s',
                transform: hoveredBack ? 'scale(1.04)' : 'scale(1)',
                outline: 'none',
              }}
            >
              ← BACK TO MENU
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreditsScreen;
