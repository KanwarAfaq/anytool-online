import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

const TIPS = [
  'Use Shift to sprint through the realm.',
  'Collect all 9 crystals to unlock the ancient portal.',
  'Press E to interact with glowing objects.',
  'Dodge enemy strikes — your shield regenerates over time.',
  'Explore every corner — secrets hide in shadow.',
  'The Crystal Valley holds the rarest gems.',
  'Ancient Sanctuary guardians can be outrun.',
  'Health shrines restore your vitality fully.',
  'Double-tap direction keys to dodge-roll.',
];

const RUNE_COUNT = 12;
const LOAD_DURATION_MS = 3000;

const KEYFRAMES = `
@keyframes spinRune {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes spinRuneReverse {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}
@keyframes pulseCore {
  0%, 100% { opacity: 0.6; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.05); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes fadeInTip {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes barGlow {
  0%, 100% { box-shadow: 0 0 6px rgba(212,168,67,0.5); }
  50% { box-shadow: 0 0 18px rgba(212,168,67,0.9); }
}
@keyframes bgPulse {
  0%, 100% { opacity: 0.03; }
  50% { opacity: 0.07; }
}
`;

export const LoadingScreen: React.FC = () => {
  const startGame = useGameStore((s) => s.startGame);
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipKey, setTipKey] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tipIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / LOAD_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current!);
        setDone(true);
        setTimeout(() => startGame(), 600);
      }
    }, 30);

    tipIntervalRef.current = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
      setTipKey((k) => k + 1);
    }, 2800);

    return () => {
      clearInterval(intervalRef.current!);
      clearInterval(tipIntervalRef.current!);
    };
  }, [startGame]);

  const runeAngles = Array.from({ length: RUNE_COUNT }, (_, i) => (360 / RUNE_COUNT) * i);
  const RUNE_CHARS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'];

  const styles: Record<string, React.CSSProperties> = {
    root: {
      position: 'fixed',
      inset: 0,
      background: '#050a14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    bgGrid: {
      position: 'absolute',
      inset: 0,
      backgroundImage:
        'repeating-linear-gradient(0deg, rgba(212,168,67,0.04) 0px, rgba(212,168,67,0.04) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, rgba(212,168,67,0.04) 0px, rgba(212,168,67,0.04) 1px, transparent 1px, transparent 60px)',
      animation: 'bgPulse 4s ease-in-out infinite',
      pointerEvents: 'none',
    },
    runeRing: {
      position: 'relative',
      width: '220px',
      height: '220px',
      marginBottom: '40px',
      animation: 'spinRune 12s linear infinite',
    },
    runeRingInner: {
      position: 'absolute',
      inset: '24px',
      border: '1px solid rgba(79,209,197,0.2)',
      borderRadius: '50%',
      animation: 'spinRuneReverse 8s linear infinite',
    },
    runeRingCore: {
      position: 'absolute',
      inset: '48px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(212,168,67,0.18) 0%, rgba(5,10,20,0.9) 70%)',
      border: '1px solid rgba(212,168,67,0.35)',
      animation: 'pulseCore 2s ease-in-out infinite',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    runeCoreLetter: {
      fontFamily: "'Cinzel', serif",
      fontSize: '28px',
      color: 'rgba(212,168,67,0.8)',
    },
    logo: {
      fontFamily: "'Cinzel', serif",
      fontSize: 'clamp(36px, 6vw, 64px)',
      fontWeight: 900,
      letterSpacing: '0.2em',
      background: 'linear-gradient(90deg, #b8850a 0%, #f0d080 30%, #d4a843 50%, #f0d080 70%, #b8850a 100%)',
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      animation: 'shimmer 3s linear infinite',
      margin: 0,
    },
    loadingLabel: {
      fontFamily: "'Rajdhani', sans-serif",
      fontSize: '13px',
      letterSpacing: '0.35em',
      color: '#6b8a9a',
      marginTop: '6px',
      marginBottom: '28px',
    },
    trackOuter: {
      width: 'clamp(280px, 40vw, 480px)',
      height: '6px',
      background: 'rgba(255,255,255,0.06)',
      borderRadius: '3px',
      border: '1px solid rgba(212,168,67,0.2)',
      overflow: 'hidden',
      position: 'relative',
    },
    trackFill: {
      height: '100%',
      borderRadius: '3px',
      background: 'linear-gradient(90deg, #b8850a, #f0d080, #d4a843)',
      transition: 'width 0.08s linear',
      animation: 'barGlow 1.5s ease-in-out infinite',
    },
    progressPct: {
      fontFamily: "'Rajdhani', sans-serif",
      fontSize: '12px',
      letterSpacing: '0.2em',
      color: '#d4a843',
      marginTop: '10px',
    },
    tipBox: {
      marginTop: '36px',
      maxWidth: '480px',
      textAlign: 'center',
      padding: '12px 24px',
      border: '1px solid rgba(212,168,67,0.15)',
      borderRadius: '4px',
      background: 'rgba(5,10,20,0.7)',
    },
    tipLabel: {
      fontFamily: "'Cinzel', serif",
      fontSize: '10px',
      letterSpacing: '0.35em',
      color: '#6b7a8d',
      marginBottom: '6px',
    },
    tipText: {
      fontFamily: "'Rajdhani', sans-serif",
      fontSize: '15px',
      color: '#c8b88a',
      letterSpacing: '0.05em',
      animation: 'fadeInTip 0.5s ease',
    },
  };

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div style={styles.root}>
        <div style={styles.bgGrid} />

        {/* Rune Circle */}
        <div style={styles.runeRing}>
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            viewBox="0 0 220 220"
          >
            <circle cx="110" cy="110" r="105" fill="none" stroke="rgba(212,168,67,0.25)" strokeWidth="1" />
            <circle cx="110" cy="110" r="88" fill="none" stroke="rgba(79,209,197,0.12)" strokeWidth="1" strokeDasharray="8 6" />
          </svg>
          {runeAngles.map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const r = 100;
            const cx = 110 + r * Math.sin(rad) - 8;
            const cy = 110 - r * Math.cos(rad) - 10;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${cx}px`,
                  top: `${cy}px`,
                  fontFamily: 'serif',
                  fontSize: '16px',
                  color: 'rgba(212,168,67,0.55)',
                  userSelect: 'none',
                }}
              >
                {RUNE_CHARS[i % RUNE_CHARS.length]}
              </div>
            );
          })}
          <div style={styles.runeRingInner} />
          <div style={styles.runeRingCore}>
            <span style={styles.runeCoreLetter}>✦</span>
          </div>
        </div>

        <h1 style={styles.logo}>LUMENFALL</h1>
        <p style={styles.loadingLabel}>LOADING THE REALM...</p>

        <div style={styles.trackOuter}>
          <div style={{ ...styles.trackFill, width: `${progress}%` }} />
        </div>
        <div style={styles.progressPct}>{Math.floor(progress)}%</div>

        <div style={styles.tipBox}>
          <div style={styles.tipLabel}>— TIP —</div>
          <div key={tipKey} style={styles.tipText}>
            {TIPS[tipIndex]}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoadingScreen;
