import React, { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { AudioManager } from '@/audio/AudioManager';

const KEYFRAMES = `
@keyframes screenIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes rowHover {
  from { background: transparent; }
  to { background: rgba(212,168,67,0.06); }
}
`;

interface ControlEntry {
  key: string;
  action: string;
  category: string;
}

const CONTROLS: ControlEntry[] = [
  { key: 'W A S D', action: 'Move', category: 'Movement' },
  { key: 'Shift', action: 'Sprint', category: 'Movement' },
  { key: 'Space', action: 'Jump', category: 'Movement' },
  { key: 'Double-tap Direction', action: 'Dodge Roll', category: 'Movement' },
  { key: 'Mouse Move', action: 'Look Around', category: 'Camera' },
  { key: 'Scroll Wheel', action: 'Zoom', category: 'Camera' },
  { key: 'E', action: 'Interact / Collect', category: 'Interaction' },
  { key: 'F', action: 'Use Item', category: 'Interaction' },
  { key: 'Left Click', action: 'Attack', category: 'Combat' },
  { key: 'Right Click', action: 'Block / Parry', category: 'Combat' },
  { key: 'Q', action: 'Special Ability', category: 'Combat' },
  { key: 'R', action: 'Ranged Attack', category: 'Combat' },
  { key: 'Esc', action: 'Pause Menu', category: 'System' },
  { key: 'Tab', action: 'Open Map', category: 'System' },
  { key: 'M', action: 'Toggle Minimap', category: 'System' },
  { key: '1 2 3', action: 'Hotbar Items', category: 'System' },
];

const CATEGORIES = ['Movement', 'Camera', 'Interaction', 'Combat', 'System'];

export const ControlsScreen: React.FC = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredBack, setHoveredBack] = useState(false);

  const handleBack = () => {
    AudioManager.getInstance().playUIClick();
    setScreen('mainmenu');
  };

  const filtered =
    activeCategory === 'All'
      ? CONTROLS
      : CONTROLS.filter((c) => c.category === activeCategory);

  // Split into two columns
  const mid = Math.ceil(filtered.length / 2);
  const col1 = filtered.slice(0, mid);
  const col2 = filtered.slice(mid);

  const categoryTabs = ['All', ...CATEGORIES];

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #050a14, #07111e)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflowY: 'auto',
          padding: '40px 20px',
          zIndex: 10,
          fontFamily: "'Rajdhani', sans-serif",
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(212,168,67,0.03) 0px, rgba(212,168,67,0.03) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, rgba(212,168,67,0.03) 0px, rgba(212,168,67,0.03) 1px, transparent 1px, transparent 60px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '820px',
            animation: 'screenIn 0.4s ease',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h1
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(28px, 5vw, 52px)',
                fontWeight: 900,
                letterSpacing: '0.2em',
                background: 'linear-gradient(90deg, #b8850a, #f0d080, #d4a843, #f0d080, #b8850a)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear infinite',
                margin: '0 0 8px',
              }}
            >
              CONTROLS
            </h1>
            <div
              style={{
                width: '200px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.5), transparent)',
                margin: '0 auto',
              }}
            />
          </div>

          {/* Category tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '28px',
            }}
          >
            {categoryTabs.map((cat) => (
              <button
                key={cat}
                onClick={() => { AudioManager.getInstance().playUIClick(); setActiveCategory(cat); }}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '10px',
                  letterSpacing: '0.2em',
                  padding: '6px 14px',
                  border: `1px solid ${
                    activeCategory === cat ? 'rgba(212,168,67,0.7)' : 'rgba(212,168,67,0.2)'
                  }`,
                  background:
                    activeCategory === cat ? 'rgba(212,168,67,0.12)' : 'transparent',
                  color:
                    activeCategory === cat ? '#f0d080' : 'rgba(212,168,67,0.5)',
                  cursor: 'pointer',
                  borderRadius: '3px',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Two-column grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px 24px',
              background: 'rgba(5,10,20,0.7)',
              border: '1px solid rgba(212,168,67,0.2)',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '32px',
            }}
          >
            {[col1, col2].map((col, colIdx) => (
              <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {col.map((entry, rowIdx) => {
                  const globalIdx = colIdx * mid + rowIdx;
                  return (
                    <div
                      key={`${entry.key}-${entry.action}`}
                      onMouseEnter={() => setHoveredRow(globalIdx)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '9px 12px',
                        borderRadius: '4px',
                        background:
                          hoveredRow === globalIdx
                            ? 'rgba(212,168,67,0.06)'
                            : 'transparent',
                        transition: 'background 0.2s',
                        borderBottom: '1px solid rgba(212,168,67,0.07)',
                      }}
                    >
                      {/* Key badge */}
                      <div
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: '12px',
                          letterSpacing: '0.08em',
                          color: '#f0d080',
                          background: 'rgba(212,168,67,0.1)',
                          border: '1px solid rgba(212,168,67,0.4)',
                          borderRadius: '3px',
                          padding: '3px 10px',
                          whiteSpace: 'nowrap',
                          minWidth: '80px',
                          textAlign: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {entry.key}
                      </div>

                      {/* Action */}
                      <span
                        style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: '11px',
                          letterSpacing: '0.15em',
                          color: 'rgba(232,220,200,0.8)',
                        }}
                      >
                        {entry.action}
                      </span>

                      {/* Category tag */}
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: '9px',
                          letterSpacing: '0.2em',
                          color: 'rgba(212,168,67,0.35)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {entry.category.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Back button */}
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

export default ControlsScreen;
