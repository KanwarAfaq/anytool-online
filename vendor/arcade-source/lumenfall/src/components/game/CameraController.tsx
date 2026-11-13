import {
  createContext,
  useContext,
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useRapier } from '@react-three/rapier'
import { usePointerLock } from '@/hooks/usePointerLock'

// ─── Constants ──────────────────────────────────────────────────────────────
const CAMERA_DISTANCE = 5.2
const PITCH_MIN = -0.35 // look slightly up (~20 deg)
const PITCH_MAX = 1.05  // look down (~60 deg)
const LERP_FACTOR = 0.12
const MOUSE_SENSITIVITY = 0.0022
const COLLISION_OFFSET = 0.4
const MIN_CAMERA_DISTANCE = 2.0 // Never get closer than 2.0 units to prevent character clipping

export interface CameraControllerHandle {
  camera: THREE.PerspectiveCamera
  yaw: React.MutableRefObject<number>
}

const CameraControllerContext = createContext<CameraControllerHandle | null>(null)

export function useCameraController(): CameraControllerHandle {
  const ctx = useContext(CameraControllerContext)
  if (!ctx) throw new Error('useCameraController must be used within CameraController')
  return ctx
}

export interface CameraControllerProps {
  targetRef: React.RefObject<THREE.Object3D>
  children?: React.ReactNode
}

export const CameraController = forwardRef<CameraControllerHandle, CameraControllerProps>(
  function CameraController({ targetRef, children }, ref) {
    const { camera } = useThree()
    const { getDelta } = usePointerLock()
    const { rapier, world } = useRapier()

    // Spherical coordinates (natural default view: looking slightly downward from behind player)
    const yaw = useRef(0)
    const pitch = useRef(0.22) // ~12 degrees down

    const smoothTarget = useRef(new THREE.Vector3())
    const desiredPos = useRef(new THREE.Vector3())
    const actualPos = useRef(new THREE.Vector3())

    const spherical = useRef(new THREE.Spherical())
    const targetVec = useRef(new THREE.Vector3())
    const rayDir = useRef(new THREE.Vector3())

    const handle = useMemo<CameraControllerHandle>(
      () => ({ camera: camera as THREE.PerspectiveCamera, yaw }),
      [camera]
    )
    useImperativeHandle(ref, () => handle)

    useFrame((_state, delta) => {
      // 1. Mouse rotation
      const { dx, dy } = getDelta()
      yaw.current -= dx * MOUSE_SENSITIVITY
      pitch.current = THREE.MathUtils.clamp(
        pitch.current + dy * MOUSE_SENSITIVITY,
        PITCH_MIN,
        PITCH_MAX
      )

      // 2. Track target pivot (chest / eye level)
      if (targetRef.current) {
        targetRef.current.getWorldPosition(targetVec.current)
        targetVec.current.y += 1.35
        // Share yaw to player mesh for movement alignment
        targetRef.current.userData.cameraYaw = yaw.current
      }

      if (smoothTarget.current.lengthSq() === 0 || smoothTarget.current.distanceToSquared(targetVec.current) > 64) {
        smoothTarget.current.copy(targetVec.current)
      } else {
        smoothTarget.current.lerp(targetVec.current, LERP_FACTOR)
      }

      // 3. Ideal camera position
      spherical.current.set(CAMERA_DISTANCE, Math.PI / 2 - pitch.current, yaw.current)
      desiredPos.current.setFromSpherical(spherical.current).add(smoothTarget.current)

      // 4. Collision check (cast from 1.0 unit outside player to avoid self-collision)
      const origin = smoothTarget.current
      rayDir.current.copy(desiredPos.current).sub(origin).normalize()

      let safeDistance = CAMERA_DISTANCE

      try {
        if (rapier && world) {
          // Offset origin forward by 0.9m along ray direction to ignore player's own capsule
          const rayStart = {
            x: origin.x + rayDir.current.x * 0.9,
            y: origin.y + rayDir.current.y * 0.9,
            z: origin.z + rayDir.current.z * 0.9,
          }
          const ray = new rapier.Ray(rayStart, {
            x: rayDir.current.x,
            y: rayDir.current.y,
            z: rayDir.current.z,
          })
          const remainingDist = CAMERA_DISTANCE - 0.9
          const hit = (world as any).castRay ? (world as any).castRay(ray, remainingDist, true) : null
          if (hit !== null && hit.toi < remainingDist) {
            safeDistance = Math.max(MIN_CAMERA_DISTANCE, hit.toi + 0.9 - COLLISION_OFFSET)
          }
        }
      } catch {
        // Rapier not ready; keep default
      }

      // 5. Final camera position
      spherical.current.set(safeDistance, Math.PI / 2 - pitch.current, yaw.current)
      actualPos.current.setFromSpherical(spherical.current).add(smoothTarget.current)

      if (camera.position.lengthSq() === 0 || camera.position.distanceToSquared(actualPos.current) > 100) {
        camera.position.copy(actualPos.current)
      } else {
        camera.position.lerp(actualPos.current, 0.25)
      }
      camera.lookAt(smoothTarget.current)
    })

    return (
      <CameraControllerContext.Provider value={handle}>
        {children}
      </CameraControllerContext.Provider>
    )
  }
)

CameraController.displayName = 'CameraController'
