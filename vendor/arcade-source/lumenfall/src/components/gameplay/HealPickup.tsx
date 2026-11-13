import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '@/stores/gameStore'

interface HealPickupProps {
  position: [number, number, number]
}

const COLLECT_RANGE = 1.5
const HEAL_AMOUNT = 20

export function HealPickup({ position }: HealPickupProps) {
  const groupRef = useRef<THREE.Group>(null)
  const sphereRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)

  const [collected, setCollected] = useState(false)
  const [animating, setAnimating] = useState(false)
  const collectAnim = useRef(0)
  const baseY = position[1]

  const playerPosition = useGameStore((s) => s.playerPosition)
  const healPlayer = useGameStore((s) => s.healPlayer)

  useFrame((_, delta) => {
    if (collected && !animating) return
    if (!groupRef.current) return

    if (animating) {
      collectAnim.current += delta
      const t = collectAnim.current
      const scale = Math.max(0, 1.2 - t * 3)
      groupRef.current.scale.setScalar(scale)
      groupRef.current.position.y = baseY + t * 2
      if (t > 0.4) {
        setCollected(true)
      }
      return
    }

    const time = Date.now() * 0.001

    // Bob
    groupRef.current.position.y = baseY + Math.sin(time * 2) * 0.1

    // Rotate
    groupRef.current.rotation.y += delta * 1.5

    // Pulse emissive
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 1.2 + Math.sin(time * 3) * 0.6
    }

    // Check proximity
    const dx = playerPosition[0] - position[0]
    const dy = playerPosition[1] - position[1]
    const dz = playerPosition[2] - position[2]
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (dist < COLLECT_RANGE) {
      healPlayer(HEAL_AMOUNT)
      setAnimating(true)
      collectAnim.current = 0
    }
  })

  if (collected) return null

  return (
    <group ref={groupRef} position={position}>
      {/* Main heal sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.22, 14, 14]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#00ff88"
          emissive="#00ff66"
          emissiveIntensity={1.5}
          transparent
          opacity={0.88}
          roughness={0.15}
          metalness={0.2}
        />
      </mesh>

      {/* Inner bright core */}
      <mesh>
        <sphereGeometry args={[0.10, 10, 10]} />
        <meshStandardMaterial
          color="#aaffcc"
          emissive="#88ffcc"
          emissiveIntensity={3}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Cross marker — horizontal bar */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.28, 0.06, 0.06]} />
        <meshStandardMaterial color="#ffffff" emissive="#aaffcc" emissiveIntensity={2} />
      </mesh>

      {/* Cross marker — vertical bar */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.06, 0.28, 0.06]} />
        <meshStandardMaterial color="#ffffff" emissive="#aaffcc" emissiveIntensity={2} />
      </mesh>

      {/* Outer orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.018, 8, 32]} />
        <meshStandardMaterial
          color="#00ff99"
          emissive="#00ff88"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Glow light */}
      <pointLight color="#00ff88" intensity={1.5} distance={3} decay={2} />
    </group>
  )
}
