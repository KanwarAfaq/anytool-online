import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getTerrainHeight } from '@/utils/terrainHeight'

export function CrystalValley() {
  const crystalMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const purpleMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const floatRef = useRef<THREE.Group>(null)

  // Formations data positioned on terrain
  const formations = useMemo(() => {
    const rawPos = [
      [10, 6], [22, -8], [15, 20], [38, 12],
      [28, -16], [20, 32], [46, -4], [34, 26],
      [8, -2], [42, 22]
    ]

    return rawPos.map(([x, z], i) => {
      const y = getTerrainHeight(x, z)
      return {
        x,
        y,
        z,
        color: i % 2 === 0 ? 'cyan' : 'purple',
        scale: 1.2 + (i % 3) * 0.4,
        rotation: (i * 0.7) % (Math.PI * 2),
      }
    })
  }, [])

  // Floating crystal shards orbiting
  const floatingShards = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      centerX: 15 + Math.sin(i * 1.3) * 20,
      centerZ: 8 + Math.cos(i * 1.3) * 18,
      radius: 2 + (i % 4) * 1.5,
      speed: 0.4 + (i % 3) * 0.3,
      offset: i * 0.5,
      size: 0.18 + (i % 3) * 0.08,
      isPurple: i % 2 === 1,
    }))
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (crystalMatRef.current) {
      crystalMatRef.current.emissiveIntensity = 0.8 + Math.sin(t * 2.0) * 0.3
    }
    if (purpleMatRef.current) {
      purpleMatRef.current.emissiveIntensity = 0.9 + Math.sin(t * 1.8 + 1.2) * 0.35
    }

    if (floatRef.current) {
      floatRef.current.children.forEach((child, i) => {
        const s = floatingShards[i]
        if (!s) return
        const curY = getTerrainHeight(s.centerX, s.centerZ) + 2.5 + Math.sin(t * s.speed + s.offset) * 0.8
        child.position.set(
          s.centerX + Math.cos(t * s.speed + s.offset) * s.radius,
          curY,
          s.centerZ + Math.sin(t * s.speed + s.offset) * s.radius
        )
        child.rotation.x = t * s.speed
        child.rotation.y = t * s.speed * 0.7
      })
    }
  })

  return (
    <group>
      {/* 1. Crystal Clusters */}
      {formations.map((f, fi) => (
        <group key={fi} position={[f.x, f.y, f.z]} scale={f.scale} rotation={[0, f.rotation, 0]}>
          {/* Main central spire */}
          <mesh position={[0, 2.2, 0]} castShadow>
            <coneGeometry args={[0.5, 4.4, 6]} />
            <meshStandardMaterial
              ref={fi === 0 ? (f.color === 'cyan' ? crystalMatRef : purpleMatRef) : undefined}
              color={f.color === 'cyan' ? '#0284c7' : '#7c3aed'}
              emissive={f.color === 'cyan' ? '#38bdf8' : '#c084fc'}
              emissiveIntensity={0.8}
              roughness={0.15}
              metalness={0.3}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Surrounding angled shards */}
          {[-0.6, 0.6, -0.4, 0.4].map((offset, j) => (
            <mesh
              key={j}
              position={[offset, 1.3, offset * 0.8]}
              rotation={[offset * 0.4, j * 1.5, -offset * 0.3]}
              scale={0.65}
              castShadow
            >
              <coneGeometry args={[0.4, 3.0, 5]} />
              <meshStandardMaterial
                color={f.color === 'cyan' ? '#0ea5e9' : '#9333ea'}
                emissive={f.color === 'cyan' ? '#38bdf8' : '#c084fc'}
                emissiveIntensity={0.7}
                roughness={0.2}
              />
            </mesh>
          ))}

          {/* Base rock mound */}
          <mesh position={[0, 0.3, 0]}>
            <dodecahedronGeometry args={[1.1, 0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.92} />
          </mesh>
        </group>
      ))}

      {/* 2. Floating Crystal Shards */}
      <group ref={floatRef}>
        {floatingShards.map((s, i) => (
          <mesh key={i} scale={s.size}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={s.isPurple ? '#a855f7' : '#06b6d4'}
              emissive={s.isPurple ? '#c084fc' : '#67e8f9'}
              emissiveIntensity={1.4}
            />
          </mesh>
        ))}
      </group>

      {/* 3. Ancient Crystal Pass Archway */}
      <CrystalArchway />
    </group>
  )
}

function CrystalArchway() {
  const x = 28
  const z = -4
  const y = getTerrainHeight(x, z)

  return (
    <group position={[x, y, z]} rotation={[0, 0.4, 0]}>
      {/* Stone pillars */}
      <mesh position={[-3.5, 4.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 8.0, 2.0]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      <mesh position={[3.5, 4.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 8.0, 2.0]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      {/* Top Keystone Arch */}
      <mesh position={[0, 8.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[8.8, 1.4, 2.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* Embedded glowing crystal prism in arch center */}
      <mesh position={[0, 7.3, 0]} rotation={[0, 0, Math.PI / 4]}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  )
}

export default CrystalValley
