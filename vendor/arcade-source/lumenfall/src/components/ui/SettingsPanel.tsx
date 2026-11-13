import React, { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { AudioManager } from '@/audio/AudioManager';

const KEYFRAMES = `
@keyframes panelIn {
  from { opacity: 0; transform: translate(-50%, -52%) scale(0.93); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes sectionIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
input[type=range].lumen-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
input[type=range].lumen-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0d080, #d4a843);
  border: 1px solid rgba(212,168,67,0.8);
  box-shadow: 0 0 6px rgba(212,168,67,0.6);
  cursor: pointer;
}
input[type=range].lumen-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0d080, #d4a843);
  border: 1px solid rgba(212,168,67,0.8);
  cursor: pointer;
}
`;

export interface SettingsPanelProps {
  onClose: () => void;
}

interface LocalSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  mouseSensitivity: number;
  quality: 'Low' | 'Medium' | 'High' | 'Ultra';
  fullscreen: boolean;
  reducedMotion: boolean;
}

const QUALITY_OPTIONS = ['Low', 'Medium', 'High', 'Ultra'] as const;

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const updateSettings = useGameStore((s) => s.updateSettings);
  const storeSettings = useGameStore((s) => s.settings);

  const [local, setLocal] = useState<LocalSettings>({
    masterVolume: storeSettings?.masterVolume ?? 80,
    musicVolume: storeSettings?.musicVolume ?? 70,
    sfxVolume: storeSettings?.sfxVolume ?? 90,
    mouseSensitivity: storeSettings?.mouseSensitivity ?? 5,
    quality: (storeSettings?.quality ? (storeSettings.quality.charAt(0).toUpperCase() + storeSettings.quality.slice(1).toLowerCase()) : 'High') as 'Low' | 'Medium' | 'High' | 'Ultra',
    fullscreen: storeSettings?.fullscreen ?? false,
    reducedMotion: storeSettings?.reducedMotion ?? false,
  });

  const [activeSection, setActiveSection] = useState<'audio' | 'controls' | 'graphics' | 'accessibility'>('audio');

  const handleChange = <K extends keyof LocalSettings>(key: K, value: LocalSettings[K]) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    updateSettings(updated);
    if (key === 'masterVolume' || key === 'sfxVolume' || key === 'musicVolume') {
      AudioManager.getInstance().updateVolumes({
        master: updated.masterVolume / 100,
        music: updated.musicVolume / 100,
        sfx: updated.sfxVolume / 100,
      });
    }
    if (key === 'fullscreen') {
      if (value && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (!value && document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  };

  const TABS: Array<{ key: typeof activeSection; label: string }> = [
    { key: 'audio', label: 'AUDIO' },
    { key: 'controls', label: 'CONTROLS' },
    { key: 'graphics', label: 'GRAPHICS' },
    { key: 'accessibility', label: 'ACCESS' },
  ];

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    animation: 'sectionIn 0.25s ease',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Cinzel', serif",
    fontSize: '10px',
    letterSpacing: '0.3em',
    color: 'rgba(212,168,67,0.7)',
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: '12px',
    color: '#c8b88a',
    textAlign: 'right',
  };

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    width: '44px',
    height: '22px',
    borderRadius: '11px',
    background: active ? 'rgba(212,168,67,0.8)' : 'rgba(255,255,255,0.08)',
    border: `1px solid ${active ? 'rgba(212,168,67,0.9)' : 'rgba(255,255,255,0.15)'}`,
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.25s ease',
    flexShrink: 0,
  });

  const toggleKnobStyle = (active: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: '3px',
    left: active ? '25px' : '3px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: active ? '#050a14' : 'rgba(212,168,67,0.5)',
    transition: 'left 0.22s ease',
  });

  const selectStyle: React.CSSProperties = {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: '14px',
    letterSpacing: '0.1em',
    color: '#f0d080',
    background: 'rgba(5,10,20,0.85)',
    border: '1px solid rgba(212,168,67,0.4)',
    borderRadius: '3px',
    padding: '6px 10px',
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
  };

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,10,20,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
          pointerEvents: 'all',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 201,
          width: '440px',
          maxHeight: '85vh',
          overflowY: 'auto',
          background: 'rgba(5,10,20,0.97)',
          border: '1px solid rgba(212,168,67,0.35)',
          borderRadius: '8px',
          padding: '32px',
          animation: 'panelIn 0.28s ease',
          boxShadow: '0 0 80px rgba(0,0,0,0.95), 0 0 40px rgba(212,168,67,0.06)',
          pointerEvents: 'all',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '20px',
              letterSpacing: '0.3em',
              color: '#d4a843',
              margin: 0,
            }}
          >
            SETTINGS
          </h2>
          <button
            onClick={() => { AudioManager.getInstance().playUIClick(); onClose(); }}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '12px',
              letterSpacing: '0.2em',
              color: '#c4a060',
              background: 'none',
              border: '1px solid rgba(212,168,67,0.3)',
              borderRadius: '3px',
              padding: '6px 12px',
              cursor: 'pointer',
              pointerEvents: 'all',
            }}
          >
            CLOSE
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { AudioManager.getInstance().playUIClick(); setActiveSection(tab.key); }}
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '10px',
                letterSpacing: '0.2em',
                color: activeSection === tab.key ? '#f0d080' : 'rgba(212,168,67,0.5)',
                background: activeSection === tab.key ? 'rgba(212,168,67,0.12)' : 'transparent',
                border: `1px solid ${activeSection === tab.key ? 'rgba(212,168,67,0.6)' : 'rgba(212,168,67,0.2)'}`,
                borderRadius: '3px',
                padding: '6px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                pointerEvents: 'all',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.3), transparent)', marginBottom: '24px' }} />

        {/* AUDIO */}
        {activeSection === 'audio' && (
          <div style={sectionStyle} key="audio">
            {(['masterVolume', 'musicVolume', 'sfxVolume'] as const).map((field) => {
              const labels: Record<typeof field, string> = {
                masterVolume: 'MASTER VOLUME',
                musicVolume: 'MUSIC VOLUME',
                sfxVolume: 'SFX VOLUME',
              };
              return (
                <div key={field} style={rowStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={labelStyle}>{labels[field]}</span>
                    <span style={valueStyle}>{local[field]}%</span>
                  </div>
                  <input
                    type="range"
                    className="lumen-slider"
                    min={0}
                    max={100}
                    value={local[field]}
                    onChange={(e) => handleChange(field, Number(e.target.value) as any)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* CONTROLS */}
        {activeSection === 'controls' && (
          <div style={sectionStyle} key="controls">
            <div style={rowStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={labelStyle}>MOUSE SENSITIVITY</span>
                <span style={valueStyle}>{local.mouseSensitivity}</span>
              </div>
              <input
                type="range"
                className="lumen-slider"
                min={1}
                max={10}
                step={0.5}
                value={local.mouseSensitivity}
                onChange={(e) => handleChange('mouseSensitivity', Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* GRAPHICS */}
        {activeSection === 'graphics' && (
          <div style={sectionStyle} key="graphics">
            <div style={rowStyle}>
              <span style={labelStyle}>QUALITY PRESET</span>
              <select
                style={selectStyle}
                value={local.quality}
                onChange={(e) => handleChange('quality', e.target.value as LocalSettings['quality'])}
              >
                {QUALITY_OPTIONS.map((q) => (
                  <option key={q} value={q} style={{ background: '#050a14', color: '#f0d080' }}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={labelStyle}>FULLSCREEN</span>
              <div
                style={toggleStyle(local.fullscreen)}
                onClick={() => handleChange('fullscreen', !local.fullscreen)}
              >
                <div style={toggleKnobStyle(local.fullscreen)} />
              </div>
            </div>
          </div>
        )}

        {/* ACCESSIBILITY */}
        {activeSection === 'accessibility' && (
          <div style={sectionStyle} key="accessibility">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={labelStyle}>REDUCED MOTION</span>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: 'rgba(200,184,138,0.5)', marginTop: '3px' }}>
                  Disables particle effects &amp; screen shake
                </div>
              </div>
              <div
                style={toggleStyle(local.reducedMotion)}
                onClick={() => handleChange('reducedMotion', !local.reducedMotion)}
              >
                <div style={toggleKnobStyle(local.reducedMotion)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SettingsPanel;
