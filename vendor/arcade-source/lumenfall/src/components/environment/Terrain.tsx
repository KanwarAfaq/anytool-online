import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { RigidBody } from '@react-three/rapier'
import { getTerrainHeight } from '@/utils/terrainHeight'

const WIDTH = 200
const SEGS = 120

export function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null)

  const { geometry, colliderGeometry } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WIDTH, WIDTH, SEGS, SEGS)
    geo.rotateX(-Math.PI / 2)

    const pos = geo.attributes.position as THREE.BufferAttribute
    const count = pos.count
    const colors = new Float32Array(count * 3)

    // Palette colors
    const colGrassLush = new THREE.Color('#387a38')
    const colGrassDark = new THREE.Color('#1f4d24')
    const colRock = new THREE.Color('#474c55')
    const colRockDark = new THREE.Color('#2d3038')
    const colCrystalGround = new THREE.Color('#28334a')
    const colCrystalVein = new THREE.Color('#3ea4aa')
    const colSanctuaryStone = new THREE.Color('#78674d')
    const colSanctuaryPath = new THREE.Color('#948265')

    // Displace vertices
    for (let i = 0; i < count; i++) {
      const wx = pos.getX(i)
      const wz = pos.getZ(i)
      const h = getTerrainHeight(wx, wz)
      pos.setY(i, h)
    }

    geo.computeVertexNormals()
    const normals = geo.attributes.normal as THREE.BufferAttribute

    // Color vertices based on position, height, and slope
    for (let i = 0; i < count; i++) {
      const wx = pos.getX(i)
      const wz = pos.getZ(i)
      const h = pos.getY(i)
      const ny = normals.getY(i) // 1.0 is flat horizontal, < 0.7 is steep cliff

      const col = new THREE.Color()

      // Region weights
      if (wx < -5) {
        // --- Forest Region ---
        const grassMix = (Math.sin(wx * 0.2) * Math.cos(wz * 0.2) + 1) * 0.5
        const baseGrass = colGrassLush.clone().lerp(colGrassDark, grassMix)

        if (ny < 0.75) {
          // Steep slope -> cliff rock
          const rockBlend = (0.75 - ny) / 0.35
          col.copy(baseGrass).lerp(colRock, Math.min(1, rockBlend))
        } else {
          col.copy(baseGrass)
        }
      } else if (wx >= -5 && wx < 55) {
        // --- Crystal Valley Region ---
        const veinPattern = Math.abs(Math.sin(wx * 0.4 + wz * 0.3))
        const isVein = veinPattern > 0.88

        if (isVein) {
          col.copy(colCrystalVein)
        } else if (ny < 0.7) {
          col.copy(colRockDark)
        } else {
          col.copy(colCrystalGround).lerp(colRock, (wx + 5) / 60)
        }
      } else {
        // --- Ancient Sanctuary Region ---
        const pathDist = Math.abs(wz - 20)
        const isPath = pathDist < 5

        if (isPath) {
          col.copy(colSanctuaryPath)
        } else if (ny < 0.75) {
          col.copy(colRock)
        } else {
          col.copy(colSanctuaryStone)
        }
      }

      colors[i * 3] = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const colGeo = geo.clone()
    return { geometry: geo, colliderGeometry: colGeo }
  }, [])

  return (
    <>
      {/* Visual & Physical terrain */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh
          ref={meshRef}
          geometry={geometry}
          receiveShadow
          castShadow={false}
        >
          <meshStandardMaterial
            vertexColors
            roughness={0.88}
            metalness={0.08}
            side={THREE.DoubleSide}
          />
        </mesh>
      </RigidBody>

      {/* Distant mountain silhouettes framing the perimeter */}
      <DistantMountainRing />
    </>
  )
}

function DistantMountainRing() {
  const peaks = useMemo(() => [
    { x: -120, z: -110, scale: [35, 60, 35], rot: 0.2 },
    { x: -70, z: -130, scale: [45, 75, 40], rot: -0.4 },
    { x: 0, z: -140, scale: [50, 85, 45], rot: 0.1 },
    { x: 70, z: -130, scale: [45, 70, 40], rot: 0.5 },
    { x: 130, z: -100, scale: [35, 65, 35], rot: -0.2 },
    { x: 140, z: 20, scale: [40, 75, 40], rot: 0.3 },
    { x: 120, z: 110, scale: [35, 60, 35], rot: -0.5 },
    { x: 0, z: 135, scale: [50, 80, 45], rot: 0.2 },
    { x: -90, z: 120, scale: [40, 65, 40], rot: -0.3 },
    { x: -135, z: 0, scale: [45, 70, 40], rot: 0.4 },
  ], [])

  return (
    <group>
      {peaks.map((p, i) => (
        <mesh key={i} position={[p.x, 0, p.z]} rotation={[0, p.rot, 0]} receiveShadow>
          <coneGeometry args={[p.scale[0], p.scale[1], 6, 1]} />
          <meshStandardMaterial
            color="#28223d"
            roughness={0.95}
            metalness={0.0}
            fog
          />
        </mesh>
      ))}
    </group>
  )
}

export default Terrain
