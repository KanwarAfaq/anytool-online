import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useGameStore } from '@/stores/gameStore';

const KEYFRAMES = `
@keyframes hpPulse {
  0%, 100% { box-shadow: 0 0 6px rgba(220,38,38,0.5); }
  50% { box-shadow: 0 0 18px rgba(220,38,38,1); }
}
@keyframes crystalGlow {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(79,209,197,0.6)); }
  50% { filter: drop-shadow(0 0 14px rgba(79,209,197,1)); }
}
@keyframes objectiveFade {
  0% { opacity: 0; transform: translateY(6px); }
  15% { opacity: 1; transform: translateY(0); }
  85% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-6px); }
}
@keyframes interactPulse {
  0%, 100% { opacity: 0.85; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.03); }
}
@keyframes combatFlash {
  0%, 100% { opacity: 1; color: #ef4444; }
  50% { opacity: 0.5; color: #f97316; }
}
@keyframes damagePulse {
  0% { opacity: 1; }
  30% { opacity: 0.4; }
  60% { opacity: 1; }
  100% { opacity: 1; }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
`;

const REGION_COLORS: Record<string, string> = {
  Forest: '#4ade80',
  'Crystal Valley': '#4fd1c5',
  'Ancient Sanctuary': '#d4a843',
  Default: '#e8dcc8',
};

interface MiniMapProps {
  playerPos: { x: number; z: number };
  crystals: Array<{ x: number; z: number; collected: boolean }>;
}

const MiniMap: React.FC<MiniMapProps> = ({ playerPos, crystals }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const SIZE = 100;
  const WORLD_SCALE = 80; // map 1 world unit = how many pixels

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, SIZE, SIZE);

    // Background
    ctx.fillStyle = 'rgba(5,10,20,0.92)';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Grid lines
    ctx.strokeStyle = 'rgba(212,168,67,0.08)';
    ctx.lineWidth = 0.5;
    for (let i = 10; i < SIZE; i += 10) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
    }

    // Crystals
    crystals.forEach((c) => {
      const cx = SIZE / 2 + (c.x - playerPos.x) * (SIZE / WORLD_SCALE);
      const cy = SIZE / 2 + (c.z - playerPos.z) * (SIZE / WORLD_SCALE);
      if (cx < 2 || cx > SIZE - 2 || cy < 2 || cy > SIZE - 2) return;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = c.collected ? 'rgba(79,209,197,0.25)' : 'rgba(79,209,197,0.9)';
      ctx.fill();
    });

    // Player dot
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f0d080';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [playerPos, crystals]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        width: `${SIZE}px`,
        height: `${SIZE}px`,
        borderRadius: '6px',
        border: '1px solid rgba(212,168,67,0.4)',
        overflow: 'hidden',
        boxShadow: '0 0 12px rgba(0,0,0,0.6)',
      }}
    >
      <canvas ref={canvasRef} width={SIZE} height={SIZE} />
      <div
        style={{
          position: 'absolute',
          top: '4px',
          left: '6px',
          fontFamily: "'Cinzel', serif",
          fontSize: '7px',
          letterSpacing: '0.15em',
          color: 'rgba(212,168,67,0.6)',
        }}
      >
        MAP
      </div>
    </div>
  );
};

export const HUD: React.FC = () => {
  const hp = useGameStore((s) => s.hp);
  const maxHp = useGameStore((s) => s.maxHp);
  const crystals = useGameStore((s) => s.crystalsCollected);
  const totalCrystals = useGameStore((s) => s.totalCrystals);
  const objective = useGameStore((s) => s.currentObjective);
  const regionName = useGameStore((s) => s.regionName);
  const interactionHint = useGameStore((s) => s.interactionHint);
  const inCombat = useGameStore((s) => s.inCombat);
  const playerPos = useGameStore((s) => s.playerPosition) ?? { x: 0, z: 0 };
  const crystalPositions = useGameStore((s) => s.crystalPositions) ?? [];
  const collectedSet = useGameStore((s) => s.collectedCrystals);
  const mapCrystals = useMemo(() => {
    return crystalPositions.map((pos, idx) => ({
      x: pos[0],
      z: pos[2],
      collected: collectedSet ? collectedSet.has(`crystal_${idx}`) : false,
    }));
  }, [crystalPositions, collectedSet]);

  const [prevHp, setPrevHp] = useState(hp);
  const [damaged, setDamaged] = useState(false);
  const [crystalJustCollected, setCrystalJustCollected] = useState(false);
  const [prevCrystals, setPrevCrystals] = useState(crystals);

  useEffect(() => {
    if (hp < prevHp) {
      setDamaged(true);
      setTimeout(() => setDamaged(false), 500);
    }
    setPrevHp(hp);
  }, [hp, prevHp]);

  useEffect(() => {
    if (crystals > prevCrystals) {
      setCrystalJustCollected(true);
      setTimeout(() => setCrystalJustCollected(false), 1200);
    }
    setPrevCrystals(crystals);
  }, [crystals, prevCrystals]);

  const hpPct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const hpColor =
    hpPct > 60 ? '#ef4444' : hpPct > 30 ? '#f97316' : '#dc2626';
  const regionColor = REGION_COLORS[regionName] ?? REGION_COLORS['Default'];

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 50,
          fontFamily: "'Rajdhani', sans-serif",
        }}
      >
        {/* ── TOP LEFT: Health ── */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '18px', opacity: 0.85 }}>🛡</span>
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '11px',
                letterSpacing: '0.2em',
                color: 'rgba(212,168,67,0.7)',
              }}
            >
              HEALTH
            </span>
          </div>
          <div
            style={{
              width: '180px',
              height: '10px',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(212,168,67,0.35)',
              borderRadius: '2px',
              overflow: 'hidden',
              animation: damaged ? 'damagePulse 0.5s ease' : 'none',
            }}
          >
            <div
              style={{
                width: `${hpPct}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${hpColor}, #ff6b6b)`,
                borderRadius: '2px',
                transition: 'width 0.3s ease',
                animation: damaged ? 'hpPulse 0.3s ease' : 'none',
              }}
            />
          </div>
          <div
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '12px',
              color: '#c4a060',
              letterSpacing: '0.08em',
            }}
          >
            {hp} / {maxHp} HP
          </div>
        </div>

        {/* ── TOP RIGHT: Crystals ── */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(5,10,20,0.7)',
              border: '1px solid rgba(79,209,197,0.35)',
              borderRadius: '4px',
              padding: '8px 14px',
              animation: crystalJustCollected ? 'crystalGlow 1.2s ease' : 'none',
            }}
          >
            {/* Teal crystal via clip-path */}
            <div
              style={{
                width: '18px',
                height: '22px',
                background: 'linear-gradient(180deg, #a5f3fc, #4fd1c5, #0e7490)',
                clipPath: 'polygon(50% 0%, 100% 40%, 50% 100%, 0% 40%)',
                flexShrink: 0,
                filter: crystalJustCollected
                  ? 'drop-shadow(0 0 8px #4fd1c5)'
                  : 'drop-shadow(0 0 4px rgba(79,209,197,0.5))',
                transition: 'filter 0.3s',
              }}
            />
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '14px',
                letterSpacing: '0.15em',
                color: crystalJustCollected ? '#a5f3fc' : '#4fd1c5',
                transition: 'color 0.3s',
              }}
            >
              {crystals} / {totalCrystals} CRYSTALS
            </span>
          </div>
        </div>

        {/* ── TOP CENTER: Combat Indicator ── */}
        {inCombat && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: "'Cinzel', serif",
              fontSize: '14px',
              letterSpacing: '0.4em',
              animation: 'combatFlash 0.8s ease-in-out infinite',
              background: 'rgba(5,10,20,0.75)',
              border: '1px solid rgba(239,68,68,0.5)',
              borderRadius: '4px',
              padding: '6px 18px',
            }}
          >
            ⚔ COMBAT
          </div>
        )}

        {/* ── CENTER: Interaction Hint ── */}
        {interactionHint && (
          <div
            style={{
              position: 'absolute',
              bottom: '120px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: "'Cinzel', serif",
              fontSize: '14px',
              letterSpacing: '0.2em',
              color: '#f0d080',
              background: 'rgba(5,10,20,0.82)',
              border: '1px solid rgba(212,168,67,0.45)',
              borderRadius: '4px',
              padding: '10px 22px',
              animation: 'interactPulse 2s ease-in-out infinite',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {interactionHint}
          </div>
        )}

        {/* ── BOTTOM CENTER: Objective ── */}
        {objective && (
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '14px',
              letterSpacing: '0.12em',
              color: '#c8b88a',
              background: 'rgba(5,10,20,0.78)',
              border: '1px solid rgba(212,168,67,0.28)',
              borderRadius: '20px',
              padding: '8px 24px',
              animation: 'objectiveFade 6s ease forwards',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: '#d4a843', marginRight: '8px' }}>▶</span>
            {objective}
          </div>
        )}

        {/* ── BOTTOM RIGHT: Region Name ── */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '10px',
              letterSpacing: '0.3em',
              color: 'rgba(232,220,200,0.4)',
              marginBottom: '2px',
            }}
          >
            REGION
          </div>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '16px',
              letterSpacing: '0.15em',
              color: regionColor,
              textShadow: `0 0 12px ${regionColor}`,
            }}
          >
            {regionName}
          </div>
        </div>

        {/* ── BOTTOM LEFT: Mini Map ── */}
        <MiniMap playerPos={playerPos} crystals={mapCrystals} />
      </div>
    </>
  );
};

export default HUD;
