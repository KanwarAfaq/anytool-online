import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RigidBody, CapsuleCollider, useRapier } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'

import { useGameStore } from '@/stores/gameStore'
import { useKeyboard } from '@/hooks/useKeyboard'
import {
  playFootstep,
  playJump,
  playLand,
  playAttack,
  playDamage,
} from '@/audio/AudioManager'
import { CameraController } from '@/components/game/CameraController'
import { getTerrainHeight } from '@/utils/terrainHeight'

const WALK_SPEED = 5.2
const RUN_SPEED = 9.8
const JUMP_IMPULSE = 8.2
const ROTATION_SLERP = 0.22
const GROUND_RAY_LENGTH = 1.3
const FOOTSTEP_INTERVAL_WALK = 0.45
const FOOTSTEP_INTERVAL_RUN = 0.28

export interface PlayerRefHandle {
  rigidBody: React.MutableRefObject<RapierRigidBody>
  mesh: React.MutableRefObject<THREE.Group>
}

export interface PlayerCharacterProps {
  cameraRef?: React.RefObject<THREE.PerspectiveCamera>
  spawnPosition?: [number, number, number]
}

export const PlayerCharacter = forwardRef<PlayerRefHandle, PlayerCharacterProps>(
  function PlayerCharacter({ spawnPosition }, ref) {
    const defaultSpawn = useMemo<[number, number, number]>(() => {
      const y = getTerrainHeight(0, 0) + 1.2
      return spawnPosition ?? [0, y, 0]
    }, [spawnPosition])

    const rigidBodyRef = useRef<RapierRigidBody>(null!)
    const meshGroupRef = useRef<THREE.Group>(null!)

    const isGrounded = useRef(true)
    const wasGrounded = useRef(true)
    const footstepTimer = useRef(0)
    const lastAttackTime = useRef(0)
    const currentAction = useRef<string>('idle')

    const facingQuat = useRef(new THREE.Quaternion())
    const targetQuat = useRef(new THREE.Quaternion())

    const keys = useKeyboard()
    const { rapier, world } = useRapier()

    const isDead = useGameStore((s) => s.isDead)
    const hp = useGameStore((s) => s.hp)
    const prevHp = useRef(hp)

    const handle = useMemo<PlayerRefHandle>(
      () => ({ rigidBody: rigidBodyRef, mesh: meshGroupRef }),
      []
    )
    useImperativeHandle(ref, () => handle)

    // Listen to external teleports (e.g. respawn or cinematic triggers)
    useEffect(() => {
      return useGameStore.subscribe(
        (s) => s.playerPosition,
        (newPos) => {
          if (!rigidBodyRef.current) return
          const cur = rigidBodyRef.current.translation()
          const dx = cur.x - newPos.x
          const dz = cur.z - newPos.z
          if (dx * dx + dz * dz > 9) {
            rigidBodyRef.current.setTranslation(
              { x: newPos.x, y: newPos.y + 1.0, z: newPos.z },
              true
            )
            rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
          }
        }
      )
    }, [])

    const checkGrounded = (): boolean => {
      if (!rigidBodyRef.current) return false
      const pos = rigidBodyRef.current.translation()
      const origin = { x: pos.x, y: pos.y, z: pos.z }
      const dir = { x: 0, y: -1, z: 0 }
      try {
        if (rapier && world) {
          const ray = new rapier.Ray(origin, dir)
          const hit = (world as any).castRay
            ? (world as any).castRay(ray, GROUND_RAY_LENGTH, true)
            : null
          return hit !== null && hit.toi < GROUND_RAY_LENGTH
        }
        return true
      } catch {
        return true
      }
    }

    useFrame((_state, delta) => {
      if (!rigidBodyRef.current || !meshGroupRef.current) return
      const dt = Math.min(delta, 0.05)

      const pos = rigidBodyRef.current.translation()
      const terrainFloor = getTerrainHeight(pos.x, pos.z)

      // Guarantee the character never falls through terrain
      if (pos.y < terrainFloor + 0.8) {
        rigidBodyRef.current.setTranslation(
          { x: pos.x, y: terrainFloor + 0.85, z: pos.z },
          true
        )
        const lv = rigidBodyRef.current.linvel()
        if (lv.y < 0) {
          rigidBodyRef.current.setLinvel({ x: lv.x, y: 0, z: lv.z }, true)
        }
      }

      // Sync character position
      const actualPos = rigidBodyRef.current.translation()
      meshGroupRef.current.position.set(actualPos.x, actualPos.y - 0.72, actualPos.z)
      useGameStore.getState().setPlayerPosition([actualPos.x, actualPos.y, actualPos.z])

      if (isDead) {
        currentAction.current = 'sad_pose'
        return
      }

      const cameraYaw = meshGroupRef.current.userData.cameraYaw ?? 0

      const forward = keys.forward
      const backward = keys.backward
      const left = keys.left
      const right = keys.right
      const sprint = keys.sprint
      const jumpKey = keys.jump
      const attackKey = keys.attack

      const moving = forward || backward || left || right
      const speed = sprint && moving ? RUN_SPEED : WALK_SPEED

      const moveDir = new THREE.Vector3()
      if (forward) moveDir.z -= 1
      if (backward) moveDir.z += 1
      if (left) moveDir.x -= 1
      if (right) moveDir.x += 1

      if (moveDir.lengthSq() > 0) {
        moveDir.normalize()
        moveDir.applyEuler(new THREE.Euler(0, cameraYaw, 0))
      }

      wasGrounded.current = isGrounded.current
      isGrounded.current = checkGrounded() || actualPos.y <= terrainFloor + 0.9

      if (!wasGrounded.current && isGrounded.current) {
        playLand()
      }

      if (jumpKey && isGrounded.current) {
        rigidBodyRef.current.applyImpulse({ x: 0, y: JUMP_IMPULSE, z: 0 }, true)
        isGrounded.current = false
        playJump()
      }

      const now = performance.now()
      if (attackKey && now - lastAttackTime.current > 550) {
        lastAttackTime.current = now
        useGameStore.getState().setPlayerAttacking(true)
        playAttack()
        setTimeout(() => {
          useGameStore.getState().setPlayerAttacking(false)
        }, 350)
      }

      if (hp < prevHp.current) {
        playDamage()
        prevHp.current = hp
      } else if (hp > prevHp.current) {
        prevHp.current = hp
      }

      const currentLinvel = rigidBodyRef.current.linvel()
      rigidBodyRef.current.setLinvel(
        {
          x: moving ? moveDir.x * speed : currentLinvel.x * 0.72,
          y: currentLinvel.y,
          z: moving ? moveDir.z * speed : currentLinvel.z * 0.72,
        },
        true
      )

      if (moving && isGrounded.current) {
        footstepTimer.current -= dt
        if (footstepTimer.current <= 0) {
          playFootstep()
          footstepTimer.current = sprint ? FOOTSTEP_INTERVAL_RUN : FOOTSTEP_INTERVAL_WALK
        }
      } else {
        footstepTimer.current = 0
      }

      if (moveDir.lengthSq() > 0.001) {
        const targetAngle = Math.atan2(moveDir.x, moveDir.z)
        targetQuat.current.setFromEuler(new THREE.Euler(0, targetAngle, 0))
        facingQuat.current.slerp(targetQuat.current, ROTATION_SLERP)
        meshGroupRef.current.quaternion.copy(facingQuat.current)
      }

      if (now - lastAttackTime.current < 450) {
        currentAction.current = 'agree'
      } else if (moving) {
        currentAction.current = sprint ? 'run' : 'walk'
      } else {
        currentAction.current = 'idle'
      }
    })

    return (
      <>
        <RigidBody
          ref={rigidBodyRef}
          position={defaultSpawn}
          enabledRotations={[false, false, false]}
          linearDamping={0.4}
          angularDamping={1.0}
          colliders={false}
          lockRotations
        >
          <CapsuleCollider args={[0.55, 0.35]} />
        </RigidBody>

        <group ref={meshGroupRef}>
          <RiggedCharacterModel currentAction={currentAction} />
          {/* Subtle warm magical adventurer ground glow */}
          <pointLight color="#38bdf8" intensity={0.6} distance={2.5} position={[0, 0.5, 0]} />
        </group>

        <CameraController targetRef={meshGroupRef} />
      </>
    )
  }
)

PlayerCharacter.displayName = 'PlayerCharacter'

function RiggedCharacterModel({ currentAction }: { currentAction: React.MutableRefObject<string> }) {
  const group = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF('/models/character.glb')
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions } = useAnimations(animations, group)
  const activeActionName = useRef<string>('idle')

  // Natural dark fantasy armor styling
  useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          const mat = new THREE.MeshStandardMaterial({
            color: '#1e2530',        // dark tempered steel
            metalness: 0.85,
            roughness: 0.28,
            emissive: new THREE.Color('#0369a1'), // subtle cyan runic accent
            emissiveIntensity: 0.2,
          })
          mesh.material = mat
        }
      }
    })
  }, [clone])

  useFrame(() => {
    const desired = currentAction.current
    if (desired !== activeActionName.current) {
      const prev = actions[activeActionName.current]
      const next = actions[desired] ?? actions['idle']

      if (prev) prev.fadeOut(0.18)
      if (next) {
        next.reset().fadeIn(0.18).play()
      }
      activeActionName.current = desired
    }
  })

  useEffect(() => {
    if (actions['idle']) {
      actions['idle'].play()
    }
  }, [actions])

  return (
    <group ref={group} dispose={null} scale={0.92}>
      <primitive object={clone} />
      {/* Adventurer's glowing broadsword on right side */}
      <group position={[0.35, 0.95, -0.1]} rotation={[0.4, 0, -0.6]}>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.08, 1.1, 0.02]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.2}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        {/* Guard & pommel */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.26, 0.04, 0.04]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

useGLTF.preload('/models/character.glb')
export default PlayerCharacter
