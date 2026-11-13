import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RigidBody } from '@react-three/rapier'
import { Html } from '@react-three/drei'
import { useGameStore } from '@/stores/gameStore'
import { playDamage, playAttack } from '@/audio/AudioManager'
import { HealPickup } from './HealPickup'

// ─── Types ──────────────────────────────────────────────────────────────────

type EnemyType = 'guardian' | 'shade'
type AIState = 'PATROL' | 'ALERT' | 'CHASE' | 'ATTACK' | 'STUNNED' | 'DEAD'

interface EnemyProps {
  id: string
  startPosition: [number, number, number]
  patrolPoints: THREE.Vector3[]
  type: EnemyType
  onDefeated?: (id: string) => void
}

const ENEMY_MAX_HP = 60
const PATROL_SPEED = 2
const ALERT_SPEED = 3
const CHASE_SPEED = 4
const ATTACK_DAMAGE = 15
const ATTACK_COOLDOWN = 1.5
const STUN_DURATION = 0.8
const DEATH_DURATION = 2.0
const ALERT_RANGE = 15
const CHASE_RANGE = 10
const ATTACK_RANGE = 2

// ─── Guardian mesh ───────────────────────────────────────────────────────────

function GuardianMesh({ hit }: { hit: boolean }) {
  const mat = hit
    ? { color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 2 }
    : { color: '#2a2a2e', emissive: '#111114', emissiveIntensity: 0.1 }

  return (
    <group>
      {/* Torso */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.55, 0.65, 0.35]} />
        <meshStandardMaterial {...mat} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.12, 0]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial {...mat} metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Glowing red eyes */}
      <mesh position={[-0.09, 1.16, 0.19]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={3} />
      </mesh>
      <mesh position={[0.09, 1.16, 0.19]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={3} />
      </mesh>

      {/* Left arm */}
      <mesh position={[-0.38, 0.58, 0]} rotation={[0, 0, 0.25]}>
        <cylinderGeometry args={[0.08, 0.07, 0.5, 8]} />
        <meshStandardMaterial {...mat} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Right arm */}
      <mesh position={[0.38, 0.58, 0]} rotation={[0, 0, -0.25]}>
        <cylinderGeometry args={[0.08, 0.07, 0.5, 8]} />
        <meshStandardMaterial {...mat} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.16, 0.12, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.55, 8]} />
        <meshStandardMaterial {...mat} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Right leg */}
      <mesh position={[0.16, 0.12, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.55, 8]} />
        <meshStandardMaterial {...mat} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Sword */}
      <mesh position={[0.52, 0.65, 0.1]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.06, 0.55, 0.04]} />
        <meshStandardMaterial color="#888899" emissive="#4444aa" emissiveIntensity={0.4} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

// ─── Shade mesh ──────────────────────────────────────────────────────────────

function ShadeMesh({ hit, time }: { hit: boolean; time: number }) {
  const mat = hit
    ? { color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 2 }
    : { color: '#1a0020', emissive: '#220033', emissiveIntensity: 0.4 }

  const corePulse = 0.5 + Math.sin(time * 3.0) * 0.5

  return (
    <group>
      {/* Main body — elongated sphere */}
      <mesh position={[0, 0.9, 0]} scale={[0.45, 0.72, 0.45]}>
        <sphereGeometry args={[0.6, 14, 14]} />
        <meshStandardMaterial
          {...mat}
          transparent
          opacity={0.82}
          roughness={0.8}
        />
      </mesh>

      {/* Emissive core */}
      <mesh position={[0, 0.88, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial
          color="#ff0055"
          emissive="#ff0055"
          emissiveIntensity={hit ? 4 : 1 + corePulse * 1.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Wispy tendrils */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const angle = (deg * Math.PI) / 180 + time * 0.8
        const r = 0.28
        return (
          <mesh
            key={i}
            position={[Math.sin(angle) * r, 0.55 + i * 0.08, Math.cos(angle) * r]}
            rotation={[Math.PI / 2 + Math.sin(time + i) * 0.3, angle, 0]}
          >
            <cylinderGeometry args={[0.025, 0.005, 0.38 + Math.sin(time * 1.5 + i) * 0.08, 5]} />
            <meshStandardMaterial
              color="#330044"
              emissive="#660088"
              emissiveIntensity={0.8}
              transparent
              opacity={0.55}
            />
          </mesh>
        )
      })}

      {/* Point light */}
      <pointLight color="#aa0044" intensity={0.8} distance={3} decay={2} />
    </group>
  )
}

// ─── Main Enemy component ────────────────────────────────────────────────────

export function Enemy({ id, startPosition, patrolPoints, type }: EnemyProps) {
  const groupRef = useRef<THREE.Group>(null)

  const [aiState, setAIState] = useState<AIState>('PATROL')
  const [hp, setHp] = useState(ENEMY_MAX_HP)
  const [hit, setHit] = useState(false)
  const [dead, setDead] = useState(false)
  const [dropHeal, setDropHeal] = useState(false)
  const [healPos, setHealPos] = useState<[number, number, number]>([0, 0, 0])
  const [shadeTime, setShadeTime] = useState(0)

  const patrolIndex = useRef(0)
  const stateTimer = useRef(0)
  const attackTimer = useRef(0)
  const deathTimer = useRef(0)
  const pos = useRef(new THREE.Vector3(...startPosition))
  const velocity = useRef(new THREE.Vector3())
  const hitFlashTimer = useRef(0)

  const playerPosition = useGameStore((s) => s.playerPosition)
  const dealPlayerDamage = useGameStore((s) => s.dealPlayerDamage)
  const isPlayerAttacking = useGameStore((s) => s.isPlayerAttacking)

  const playerVec = new THREE.Vector3()

  const distToPlayer = useCallback(() => {
    playerVec.set(playerPosition[0], playerPosition[1], playerPosition[2])
    return pos.current.distanceTo(playerVec)
  }, [playerPosition])

  // Move toward a target position, return true if arrived
  const moveTo = useCallback(
    (target: THREE.Vector3, speed: number, delta: number, group: THREE.Group): boolean => {
      const dir = new THREE.Vector3().subVectors(target, pos.current)
      dir.y = 0
      const d = dir.length()
      if (d < 0.15) return true
      dir.normalize()
      velocity.current.copy(dir).multiplyScalar(speed)
      pos.current.addScaledVector(velocity.current, delta)
      group.position.copy(pos.current)
      // Face movement direction
      if (d > 0.2) {
        const angle = Math.atan2(dir.x, dir.z)
        group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, angle, Math.min(1, delta * 6))
      }
      return false
    },
    []
  )

  // Receive damage from player attack
  const takeDamage = useCallback(
    (amount: number) => {
      if (dead || aiState === 'DEAD') return
      playDamage()
      setHit(true)
      hitFlashTimer.current = 0.18
      setHp((prev) => {
        const next = prev - amount
        if (next <= 0) {
          setAIState('DEAD')
          return 0
        }
        setAIState('STUNNED')
        stateTimer.current = STUN_DURATION
        return next
      })
    },
    [dead, aiState]
  )

  // Expose enemy takeDamage via store registration
  useEffect(() => {
    const unsub = useGameStore.getState().registerEnemy?.(id, takeDamage)
    return () => { unsub?.() }
  }, [id, takeDamage])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const group = groupRef.current

    // Hit flash decay
    if (hitFlashTimer.current > 0) {
      hitFlashTimer.current -= delta
      if (hitFlashTimer.current <= 0) setHit(false)
    }

    setShadeTime((t) => t + delta)

    // ── DEAD ──────────────────────────────────────────────────────────────
    if (aiState === 'DEAD') {
      deathTimer.current += delta
      // Sink into ground
      group.position.y = pos.current.y - deathTimer.current * 0.5
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, Math.PI / 2, delta * 2)
      if (deathTimer.current > DEATH_DURATION && !dead) {
        setDead(true)
        setHealPos([pos.current.x, pos.current.y + 0.5, pos.current.z])
        setDropHeal(true)
      }
      return
    }

    const dist = distToPlayer()

    // ── STUNNED ───────────────────────────────────────────────────────────
    if (aiState === 'STUNNED') {
      stateTimer.current -= delta
      if (stateTimer.current <= 0) {
        setAIState(dist < CHASE_RANGE ? 'CHASE' : 'PATROL')
      }
      return
    }

    // ── ATTACK ────────────────────────────────────────────────────────────
    if (aiState === 'ATTACK') {
      if (dist > ATTACK_RANGE + 0.5) {
        setAIState('CHASE')
        return
      }
      attackTimer.current -= delta
      if (attackTimer.current <= 0) {
        playAttack()
        dealPlayerDamage(ATTACK_DAMAGE)
        attackTimer.current = ATTACK_COOLDOWN
      }
      // Face player
      playerVec.set(playerPosition[0], playerPosition[1], playerPosition[2])
      const dir = new THREE.Vector3().subVectors(playerVec, pos.current)
      dir.y = 0
      if (dir.length() > 0.01) {
        const angle = Math.atan2(dir.x, dir.z)
        group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, angle, Math.min(1, delta * 8))
      }

      // Check if player attacks this enemy
      if (isPlayerAttacking && dist < ATTACK_RANGE + 0.5) {
        takeDamage(25)
      }
      return
    }

    // ── CHASE ─────────────────────────────────────────────────────────────
    if (aiState === 'CHASE') {
      if (dist <= ATTACK_RANGE) {
        setAIState('ATTACK')
        attackTimer.current = 0
        return
      }
      if (dist > CHASE_RANGE + 2) {
        setAIState('ALERT')
        return
      }
      playerVec.set(playerPosition[0], playerPosition[1], playerPosition[2])
      moveTo(playerVec, CHASE_SPEED, delta, group)
      if (isPlayerAttacking && dist < ATTACK_RANGE + 0.5) takeDamage(25)
      return
    }

    // ── ALERT ─────────────────────────────────────────────────────────────
    if (aiState === 'ALERT') {
      if (dist < CHASE_RANGE) {
        setAIState('CHASE')
        return
      }
      if (dist > ALERT_RANGE + 2) {
        setAIState('PATROL')
        return
      }
      playerVec.set(playerPosition[0], playerPosition[1], playerPosition[2])
      moveTo(playerVec, ALERT_SPEED, delta, group)
      if (isPlayerAttacking && dist < ATTACK_RANGE + 0.5) takeDamage(25)
      return
    }

    // ── PATROL ────────────────────────────────────────────────────────────
    if (aiState === 'PATROL') {
      if (dist < ALERT_RANGE) {
        setAIState('ALERT')
        return
      }
      if (patrolPoints.length === 0) return
      const target = patrolPoints[patrolIndex.current]
      const arrived = moveTo(target, PATROL_SPEED, delta, group)
      if (arrived) {
        patrolIndex.current = (patrolIndex.current + 1) % patrolPoints.length
      }
      return
    }
  })

  if (dead) {
    return dropHeal ? <HealPickup position={healPos} /> : null
  }

  return (
    <group ref={groupRef} position={startPosition}>
      {type === 'guardian' ? (
        <GuardianMesh hit={hit} />
      ) : (
        <ShadeMesh hit={hit} time={shadeTime} />
      )}

      {/* Floating health bar (only when damaged) */}
      {hp < ENEMY_MAX_HP && (
        <Html
          center
          position={[0, type === 'guardian' ? 1.8 : 1.9, 0]}
          distanceFactor={8}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              width: 70,
              height: 7,
              background: '#220000',
              borderRadius: 4,
              border: '1px solid #550000',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(hp / ENEMY_MAX_HP) * 100}%`,
                height: '100%',
                background: hp > 30 ? '#ee3300' : '#ff8800',
                transition: 'width 0.2s',
                borderRadius: 4,
              }}
            />
          </div>
        </Html>
      )}
    </group>
  )
}
