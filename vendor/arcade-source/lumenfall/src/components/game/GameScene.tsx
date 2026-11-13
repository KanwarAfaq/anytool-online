import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useGameStore } from '@/stores/gameStore'
import { PlayerCharacter } from '@/components/character/PlayerCharacter'
import { Terrain } from '@/components/environment/Terrain'
import { Forest } from '@/components/environment/Forest'
import { CrystalValley } from '@/components/environment/CrystalValley'
import { Sanctuary } from '@/components/environment/Sanctuary'
import { Sky } from '@/components/environment/Sky'
import { WaterFeature } from '@/components/environment/WaterFeature'
import { CrystalLayout } from '@/components/gameplay/CrystalLayout'
import { EnemyLayout } from '@/components/gameplay/EnemyLayout'
import { CheckpointLayout } from '@/components/gameplay/CheckpointLayout'
import { RegionTrigger } from '@/components/gameplay/RegionTrigger'
import { Lighting } from '@/components/environment/Lighting'

interface GameSceneProps {
  isPlaying: boolean
}

export function GameScene({ isPlaying }: GameSceneProps) {
  const { camera } = useThree()
  const cameraRef = useRef(camera as THREE.PerspectiveCamera)
  const screen = useGameStore((s) => s.screen)

  useEffect(() => {
    cameraRef.current = camera as THREE.PerspectiveCamera
  }, [camera])

  return (
    <>
      {/* Sky and atmosphere */}
      <Sky />

      {/* Scene lighting */}
      <Lighting />

      {/* Terrain base */}
      <Terrain />

      {/* Environment regions */}
      <Forest />
      <CrystalValley />
      <Sanctuary />

      {/* Water effects */}
      <WaterFeature />

      {/* Gameplay elements */}
      {(isPlaying || screen === 'victory') && (
        <>
          <CrystalLayout />
          <EnemyLayout />
          <CheckpointLayout />
          <RegionTrigger />
        </>
      )}

      {/* Player character */}
      {isPlaying && (
        <PlayerCharacter cameraRef={cameraRef} />
      )}

      {/* Cinematic Main Menu revolving camera */}
      {(screen === 'mainMenu' || screen === 'mainmenu') && (
        <MainMenuCamera />
      )}

      {/* Global atmospheric twilight fog */}
      <fog attach="fog" args={['#3b2652', 25, 230]} />
    </>
  )
}

function MainMenuCamera() {
  const { camera } = useThree()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.08
    const r = 65
    camera.position.x = Math.sin(t) * r + 20
    camera.position.y = 16 + Math.sin(t * 0.5) * 3
    camera.position.z = Math.cos(t) * r
    camera.lookAt(25, 6, 10)
  })
  return null
}
