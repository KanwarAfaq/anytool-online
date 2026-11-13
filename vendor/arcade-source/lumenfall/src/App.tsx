import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Preload, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { EffectComposer, Bloom, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'

import { useGameStore } from '@/stores/gameStore'
import { initAudio, resumeAudio } from '@/audio/AudioManager'

// UI Screens
import { MainMenu } from '@/components/ui/MainMenu'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { HUD } from '@/components/ui/HUD'
import { PauseMenu } from '@/components/ui/PauseMenu'
import { VictoryScreen } from '@/components/ui/VictoryScreen'
import { DefeatedScreen } from '@/components/ui/DefeatedScreen'

// Game Scene
import { GameScene } from '@/components/game/GameScene'

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const settings = useGameStore((s) => s.settings)
  const isDead = useGameStore((s) => s.isDead)
  const audioInitialized = useRef(false)

  // Init audio on first interaction
  const handleFirstInteraction = () => {
    if (!audioInitialized.current) {
      initAudio()
      resumeAudio()
      audioInitialized.current = true
    }
  }

  useEffect(() => {
    window.addEventListener('click', handleFirstInteraction, { once: true })
    window.addEventListener('keydown', handleFirstInteraction, { once: true })
    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])

  const isPlaying = screen === 'playing' || screen === 'paused'

  return (
    <div
      style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}
      onClick={handleFirstInteraction}
    >
      {/* 3D Canvas — always mounted for seamless transitions */}
      <Canvas
        shadows
        camera={{ fov: 65, near: 0.1, far: 800 }}
        gl={{
          antialias: settings.quality !== 'low',
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.25,
        }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        dpr={settings.quality === 'low' ? 0.75 : settings.quality === 'medium' ? 1 : window.devicePixelRatio}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        <Suspense fallback={null}>
          <Physics
            gravity={[0, -20, 0]}
            paused={screen !== 'playing'}
          >
            <GameScene isPlaying={isPlaying} />
          </Physics>

          {/* Post processing */}
          {settings.quality !== 'low' && (
            <EffectComposer>
              <Bloom
                intensity={settings.quality === 'ultra' ? 0.9 : 0.65}
                luminanceThreshold={0.55}
                luminanceSmoothing={0.85}
                mipmapBlur
              />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
              <Vignette eskil={false} offset={0.35} darkness={0.45} />
            </EffectComposer>
          )}
          <Preload all />
        </Suspense>
      </Canvas>

      {/* UI Layer */}
      {screen === 'mainMenu' && <MainMenu />}
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'playing' && <HUD />}
      {screen === 'playing' && isDead && <DefeatedScreen />}
      {screen === 'paused' && (
        <>
          <HUD />
          <PauseMenu />
        </>
      )}
      {screen === 'victory' && <VictoryScreen />}
    </div>
  )
}
