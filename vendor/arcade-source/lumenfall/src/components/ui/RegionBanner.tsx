import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

const KEYFRAMES = `
@keyframes bannerSlideIn {
  from { transform: translateX(-50%) translateY(-120%); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}
@keyframes bannerSlideOut {
  from { transform: translateX(-50%) translateY(0); opacity: 1; }
  to { transform: translateX(-50%) translateY(-120%); opacity: 0; }
}
@keyframes accentPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
`;

interface RegionConfig {
  color: string;
  icon: string;
  description: string;
}

const REGION_CONFIGS: Record<string, RegionConfig> = {
  Forest: {
    color: '#4ade80',
    icon: '🌲',
    description: 'Ancient trees whisper forgotten secrets.',
  },
  'Crystal Valley': {
    color: '#4fd1c5',
    icon: '💎',
    description: 'Shimmering crystals pulse with arcane energy.',
  },
  'Ancient Sanctuary': {
    color: '#d4a843',
    icon: '⚱',
    description: 'Sacred ruins guard the heart of Lumenfall.',
  },
};

type BannerState = 'hidden' | 'entering' | 'visible' | 'leaving';

export const RegionBanner: React.FC = () => {
  const regionName = useGameStore((s) => s.regionName);
  const [displayedRegion, setDisplayedRegion] = useState<string>('');
  const [bannerState, setBannerState] = useState<BannerState>('hidden');
  const prevRegionRef = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!regionName || regionName === prevRegionRef.current) return;

    // Clear any running timers
    if (timerRef.current) clearTimeout(timerRef.current);

    // If already showing, slide out first then in
    const showBanner = () => {
      prevRegionRef.current = regionName;
      setDisplayedRegion(regionName);
      setBannerState('entering');

      timerRef.current = setTimeout(() => {
        setBannerState('visible');

        timerRef.current = setTimeout(() => {
          setBannerState('leaving');

          timerRef.current = setTimeout(() => {
            setBannerState('hidden');
          }, 500);
        }, 3000);
      }, 600);
    };

    if (bannerState === 'hidden') {
      showBanner();
    } else {
      setBannerState('leaving');
      timerRef.current = setTimeout(showBanner, 520);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionName]);

  if (bannerState === 'hidden') return null;

  const config = REGION_CONFIGS[displayedRegion] ?? {
    color: '#e8dcc8',
    icon: '✦',
    description: 'An unknown region awaits.',
  };

  const animationName =
    bannerState === 'entering' || bannerState === 'visible'
      ? 'bannerSlideIn'
      : 'bannerSlideOut';

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 90,
          pointerEvents: 'none',
          animation: `${animationName} 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards`,
        }}
      >
        <div
          style={{
            background: 'rgba(5,10,20,0.92)',
            border: `1px solid ${config.color}55`,
            borderRadius: '6px',
            padding: '18px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            minWidth: '300px',
            boxShadow: `0 0 30px rgba(0,0,0,0.8), 0 0 20px ${config.color}22`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top accent bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              width: '80%',
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
              animation: 'accentPulse 2s ease-in-out infinite',
            }}
          />

          {/* Entering label */}
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '9px',
              letterSpacing: '0.45em',
              color: 'rgba(232,220,200,0.4)',
            }}
          >
            ENTERING REGION
          </div>

          {/* Icon + Name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '22px' }}>{config.icon}</span>
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(20px, 3vw, 28px)',
                fontWeight: 700,
                letterSpacing: '0.2em',
                margin: 0,
                background: `linear-gradient(90deg, ${config.color}aa, ${config.color}, ${config.color}aa)`,
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 2.5s linear infinite',
              }}
            >
              {displayedRegion}
            </h2>
          </div>

          {/* Description */}
          <p
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '13px',
              letterSpacing: '0.08em',
              color: 'rgba(200,184,138,0.65)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            {config.description}
          </p>

          {/* Bottom accent bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '20%',
              width: '60%',
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${config.color}66, transparent)`,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default RegionBanner;
