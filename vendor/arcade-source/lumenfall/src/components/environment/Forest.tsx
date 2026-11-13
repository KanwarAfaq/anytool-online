import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getTerrainHeight } from '@/utils/terrainHeight'

function seededRand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function randInRange(seed: number, min: number, max: number): number {
  return min + seededRand(seed) * (max - min)
}

const TREE_COUNT = 75
const treeData = Array.from({ length: TREE_COUNT }, (_, i) => {
  const angle = seededRand(i * 3 + 0) * Math.PI * 2
  const radius = 8 + seededRand(i * 3 + 1) * 50
  const x = -45 + Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  const y = getTerrainHeight(x, z)

  return {
    x,
    y,
    z,
    scale: randInRange(i * 3 + 2, 0.9, 1.6),
    phase: seededRand(i * 5) * Math.PI * 2,
    species: Math.floor(seededRand(i * 7 + 3) * 3),
  }
})

export function Forest() {
  const trunkRef = useRef<THREE.InstancedMesh>(null)
  const foliage0Ref = useRef<THREE.InstancedMesh>(null)
  const foliage1Ref = useRef<THREE.InstancedMesh>(null)
  const foliage2Ref = useRef<THREE.InstancedMesh>(null)
  const firefliesRef = useRef<THREE.Points>(null)

  // Position trees on the terrain once
  useEffect(() => {
    const dummy = new THREE.Object3D()

    treeData.forEach((t, i) => {
      const trunkH = 3.5 * t.scale

      // Trunk sitting directly on ground
      dummy.position.set(t.x, t.y + trunkH * 0.5, t.z)
      dummy.scale.set(t.scale * 0.22, trunkH, t.scale * 0.22)
      dummy.rotation.set(0, seededRand(i) * Math.PI * 2, 0)
      dummy.updateMatrix()
      trunkRef.current?.setMatrixAt(i, dummy.matrix)

      // Lower foliage layer
      const f0y = t.y + trunkH * 0.75 + 1.2 * t.scale
      dummy.position.set(t.x, f0y, t.z)
      dummy.scale.set(t.scale * 2.4, t.scale * 2.2, t.scale * 2.4)
      dummy.rotation.set(0, seededRand(i + 40) * Math.PI * 2, 0)
      dummy.updateMatrix()
      foliage0Ref.current?.setMatrixAt(i, dummy.matrix)

      // Mid foliage layer
      const f1y = f0y + 1.5 * t.scale
      dummy.position.set(t.x, f1y, t.z)
      dummy.scale.set(t.scale * 1.8, t.scale * 1.9, t.scale * 1.8)
      dummy.rotation.set(0, seededRand(i + 80) * Math.PI * 2, 0)
      dummy.updateMatrix()
      foliage1Ref.current?.setMatrixAt(i, dummy.matrix)

      // Top foliage cone
      const f2y = f1y + 1.4 * t.scale
      dummy.position.set(t.x, f2y, t.z)
      dummy.scale.set(t.scale * 1.1, t.scale * 1.5, t.scale * 1.1)
      dummy.rotation.set(0, seededRand(i + 120) * Math.PI * 2, 0)
      dummy.updateMatrix()
      foliage2Ref.current?.setMatrixAt(i, dummy.matrix)
    })

    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true
    if (foliage0Ref.current) foliage0Ref.current.instanceMatrix.needsUpdate = true
    if (foliage1Ref.current) foliage1Ref.current.instanceMatrix.needsUpdate = true
    if (foliage2Ref.current) foliage2Ref.current.instanceMatrix.needsUpdate = true
  }, [])

  // Fireflies animation
  const fireflyGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const count = 120
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const x = -70 + Math.random() * 60
      const z = -40 + Math.random() * 80
      const y = getTerrainHeight(x, z) + 0.8 + Math.random() * 3.5
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (firefliesRef.current) {
      const pos = firefliesRef.current.geometry.attributes.position as THREE.BufferAttribute
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i)
        y += Math.sin(t * 1.5 + i) * 0.008
        pos.setY(i, y)
      }
      pos.needsUpdate = true
    }
  })

  return (
    <group>
      {/* 1. Instanced Forest Trees */}
      <instancedMesh ref={trunkRef} args={[undefined, undefined, TREE_COUNT]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1.25, 1, 6]} />
        <meshStandardMaterial color="#3b2512" roughness={0.92} metalness={0.0} />
      </instancedMesh>

      <instancedMesh ref={foliage0Ref} args={[undefined, undefined, TREE_COUNT]} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 7]} />
        <meshStandardMaterial color="#1b5e20" roughness={0.82} metalness={0.0} />
      </instancedMesh>

      <instancedMesh ref={foliage1Ref} args={[undefined, undefined, TREE_COUNT]} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 7]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.82} metalness={0.0} />
      </instancedMesh>

      <instancedMesh ref={foliage2Ref} args={[undefined, undefined, TREE_COUNT]} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 6]} />
        <meshStandardMaterial color="#388e3c" roughness={0.8} metalness={0.0} />
      </instancedMesh>

      {/* 2. Floating Bioluminescent Fireflies */}
      <points ref={firefliesRef} geometry={fireflyGeo}>
        <pointsMaterial
          color="#86efac"
          size={0.35}
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* 3. Forest Ancient Ruins & Stone Arches */}
      <ForestRuins />
    </group>
  )
}

function ForestRuins() {
  const ruins = useMemo(() => [
    { x: -50, z: -15, rot: 0.3 },
    { x: -30, z: 22, rot: 1.1 },
    { x: -65, z: 12, rot: -0.5 },
    { x: -22, z: -25, rot: 0.8 },
  ], [])

  return (
    <group>
      {ruins.map((r, i) => {
        const y = getTerrainHeight(r.x, r.z)
        return (
          <group key={i} position={[r.x, y, r.z]} rotation={[0, r.rot, 0]}>
            {/* Crumbled stone pillars */}
            <mesh position={[-2.5, 2.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.6, 0.7, 5, 8]} />
              <meshStandardMaterial color="#475569" roughness={0.9} />
            </mesh>
            <mesh position={[2.5, 3.2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.6, 0.7, 6.4, 8]} />
              <meshStandardMaterial color="#475569" roughness={0.9} />
            </mesh>
            {/* Fallen archway beam */}
            <mesh position={[0, 5.2, 0]} rotation={[0, 0, 0.1]} castShadow receiveShadow>
              <boxGeometry args={[6.5, 0.8, 1.2]} />
              <meshStandardMaterial color="#334155" roughness={0.88} />
            </mesh>
            {/* Emissive ancient rune carving */}
            <mesh position={[0, 1.5, 0.8]}>
              <ringGeometry args={[0.3, 0.6, 16]} />
              <meshStandardMaterial
                color="#4ade80"
                emissive="#22c55e"
                emissiveIntensity={1.2}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export default Forest
