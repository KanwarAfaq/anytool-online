import { useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useGameStore } from '@/stores/gameStore'
import { playCheckpoint } from '@/audio/AudioManager'

interface CheckpointProps {
  id: string
  position: [number, number, number]
}

const ACTIVATION_RANGE = 2.5

// Rune ring geometry: 12-sided torus at ground level
function RuneRing({ active, scale }: { active: boolean; scale: number }) {
  return (
    <group scale={[scale, scale, scale]}>
      {/* Outer ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.04, 8, 48]} />
        <meshStandardMaterial
          color={active ? '#ffcc00' : '#2255aa'}
          emissive={active ? '#ffaa00' : '#1133aa'}
          emissiveIntensity={active ? 3 : 0.9}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Inner ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.025, 8, 32]} />
        <meshStandardMaterial
          color={active ? '#ffe080' : '#4488dd'}
          emissive={active ? '#ffcc00' : '#2255cc'}
          emissiveIntensity={active ? 2 : 0.6}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Rune marks — 6 thin bars arranged radially */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const rx = Math.cos(angle) * 0.72
        const rz = Math.sin(angle) * 0.72
        return (
          <mesh key={i} position={[rx, 0, rz]} rotation={[-Math.PI / 2, 0, angle]}>
            <boxGeometry args={[0.04, 0.2, 0.015]} />
            <meshStandardMaterial
              color={active ? '#ffe555' : '#6699ff'}
              emissive={active ? '#ffcc00' : '#4466cc'}
              emissiveIntensity={active ? 2.5 : 0.7}
              transparent
              opacity={0.85}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Particle burst on activation
function ActivationBurst({ active, burstTime }: { active: boolean; burstTime: number }) {
  if (!active || burstTime > 1.2) return null
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const t = Math.min(burstTime, 1.0)
        const radius = t * 3.2
        const opacity = 1 - t
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = t * 2.5
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.07 * (1 - t * 0.7), 6, 6]} />
            <meshStandardMaterial
              color="#ffdd44"
              emissive="#ffcc00"
              emissiveIntensity={3}
              transparent
              opacity={opacity}
            />
          </mesh>
        )
      })}
    </>
  )
}

export function Checkpoint({ id, position }: CheckpointProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.PointLight>(null)

  const [active, setActive] = useState(false)
  const [activating, setActivating] = useState(false)
  const [burstTime, setBurstTime] = useState(0)
  const [ringScale, setRingScale] = useState(1)
  const [showLabel, setShowLabel] = useState(false)

  const activateCheckpoint = useGameStore((s) => s.activateCheckpoint)
  const playerPosition = useGameStore((s) => s.playerPosition)

  const activationHandled = useRef(false)

  const handleActivate = useCallback(() => {
    if (activationHandled.current) return
    activationHandled.current = true
    playCheckpoint()
    setActivating(true)
    setActive(true)
    setBurstTime(0)
    activateCheckpoint(id, position)

    // Show label briefly
    setShowLabel(true)
    setTimeout(() => setShowLabel(false), 3000)
  }, [activateCheckpoint, id, position])

  useFrame((_, delta) => {
    const px = playerPosition[0]
    const py = playerPosition[1]
    const pz = playerPosition[2]
    const dx = px - position[0]
    const dy = py - position[1]
    const dz = pz - position[2]
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (dist < ACTIVATION_RANGE && !activationHandled.current) {
      handleActivate()
    }

    const time = Date.now() * 0.001

    if (ringRef.current) {
      ringRef.current.rotation.y += delta * (active ? 0.9 : 0.3)
    }

    // Ring breathing scale
    const breathe = 1 + Math.sin(time * 2) * (active ? 0.06 : 0.02)
    setRingScale(breathe)

    // Burst animation
    if (activating) {
      setBurstTime((t) => t + delta)
    }

    // Glow pulse
    if (glowRef.current) {
      glowRef.current.intensity = active
        ? 3.5 + Math.sin(time * 3) * 1.2
        : 0.6 + Math.sin(time * 1.5) * 0.3
    }
  })

  return (
    <group position={position}>
      {/* Stone monolith */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.38, 2.2, 0.28]} />
        <meshStandardMaterial color="#444455" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Carved top piece */}
      <mesh position={[0, 2.32, 0]}>
        <boxGeometry args={[0.48, 0.25, 0.38]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.85} />
      </mesh>

      {/* Rune glyph on stone face */}
      <mesh position={[0, 1.2, 0.145]}>
        <planeGeometry args={[0.22, 0.55]} />
        <meshStandardMaterial
          color={active ? '#ffcc44' : '#3366cc'}
          emissive={active ? '#ffaa00' : '#2244aa'}
          emissiveIntensity={active ? 2.5 : 0.7}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Rune ring at base */}
      <group ref={ringRef} position={[0, 0.02, 0]}>
        <RuneRing active={active} scale={ringScale} />
      </group>

      {/* Activation burst */}
      <ActivationBurst active={active} burstTime={burstTime} />

      {/* Glow light */}
      <pointLight
        ref={glowRef}
        color={active ? '#ffaa00' : '#2255dd'}
        intensity={active ? 3.5 : 0.6}
        distance={5}
        decay={2}
        position={[0, 0.5, 0]}
      />

      {/* Region name banner */}
      {showLabel && (
        <Html center position={[0, 3.2, 0]} distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              background: 'rgba(10,6,0,0.88)',
              border: '1px solid #ffcc44',
              borderRadius: 8,
              padding: '6px 14px',
              color: '#ffdd77',
              fontFamily: 'serif',
              fontSize: 15,
              whiteSpace: 'nowrap',
              textAlign: 'center',
              boxShadow: '0 0 18px #ffaa0066',
            }}
          >
            ✦ Checkpoint Reached ✦
          </div>
        </Html>
      )}
    </group>
  )
}
