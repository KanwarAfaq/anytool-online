import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RigidBody } from '@react-three/rapier'
import { Html } from '@react-three/drei'
import { useGameStore } from '@/stores/gameStore'
import { playCrystalPickup } from '@/audio/AudioManager'

interface CrystalCollectibleProps {
  id: string
  position: [number, number, number]
  onCollect?: (id: string) => void
}

export function CrystalCollectible({ id, position, onCollect }: CrystalCollectibleProps) {
  const groupRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const octaRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const glowMaterialRef = useRef<THREE.MeshStandardMaterial>(null)

  const [collected, setCollected] = useState(false)
  const [playerNear, setPlayerNear] = useState(false)
  const [animating, setAnimating] = useState(false)

  const collectCrystal = useGameStore((s) => s.collectCrystal)
  const playerPosition = useGameStore((s) => s.playerPosition)

  const collectAnimTime = useRef(0)
  const baseY = position[1]

  // Check proximity to player each frame
  useFrame((_, delta) => {
    if (collected) return

    const px = playerPosition[0]
    const py = playerPosition[1]
    const pz = playerPosition[2]
    const dx = px - position[0]
    const dy = py - position[1]
    const dz = pz - position[2]
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    setPlayerNear(dist < 3)

    if (!groupRef.current) return

    if (animating) {
      collectAnimTime.current += delta
      const t = collectAnimTime.current
      const scale = Math.max(0, 1 - t / 0.5)
      groupRef.current.scale.setScalar(scale)
      groupRef.current.position.y = baseY + t * 1.5
      if (t > 0.55) {
        groupRef.current.visible = false
      }
      return
    }

    const time = Date.now() * 0.001

    // Gentle bob
    groupRef.current.position.y = baseY + Math.sin(time * 1.2) * 0.12

    // Spin octahedron
    if (octaRef.current) {
      octaRef.current.rotation.y += delta * 1.2
      octaRef.current.rotation.x += delta * 0.4
    }

    // Pulse emissive
    if (materialRef.current) {
      const pulse = 0.6 + Math.sin(time * 2.5) * 0.4
      materialRef.current.emissiveIntensity = pulse
    }

    // Glow sphere pulse
    if (glowMaterialRef.current) {
      const glow = 0.3 + Math.sin(time * 3.0 + 1.0) * 0.2
      glowMaterialRef.current.emissiveIntensity = glow
    }

    // Orbit ring
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8
      ringRef.current.rotation.x = Math.PI / 4 + Math.sin(time * 0.7) * 0.2
    }
  })

  const handleCollect = useCallback(() => {
    if (collected || animating) return
    playCrystalPickup()
    setAnimating(true)
    setCollected(true)
    setTimeout(() => {
      collectCrystal(id)
      onCollect?.(id)
    }, 500)
  }, [collected, animating, collectCrystal, id, onCollect])

  // Keyboard interaction
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'e' || e.key === 'E') && playerNear && !collected) {
        handleCollect()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playerNear, collected, handleCollect])

  if (collected && !animating) return null

  return (
    <group ref={groupRef} position={position}>
      {/* Main octahedron */}
      <mesh ref={octaRef}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#00e5cc"
          emissive="#00ffd0"
          emissiveIntensity={0.8}
          metalness={0.3}
          roughness={0.1}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Inner glow sphere */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial
          ref={glowMaterialRef}
          color="#aaffee"
          emissive="#00ffe0"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Orbiting ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.55, 0.025, 8, 48]} />
        <meshStandardMaterial
          color="#00ffcc"
          emissive="#00ffcc"
          emissiveIntensity={1.2}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Point light for local illumination */}
      <pointLight color="#00ffd0" intensity={1.2} distance={3.5} decay={2} />

      {/* Interaction hint */}
      {playerNear && !collected && (
        <Html
          center
          position={[0, 1.1, 0]}
          style={{ pointerEvents: 'none' }}
          distanceFactor={6}
        >
          <div
            style={{
              background: 'rgba(0,20,30,0.82)',
              border: '1px solid #00ffd0',
              borderRadius: 6,
              padding: '4px 10px',
              color: '#00ffd0',
              fontFamily: 'monospace',
              fontSize: 13,
              whiteSpace: 'nowrap',
              boxShadow: '0 0 10px #00ffd088',
            }}
          >
            [E] Collect Crystal
          </div>
        </Html>
      )}
    </group>
  )
}
