import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RigidBody } from '@react-three/rapier'
import { useGameStore } from '@/stores/gameStore'
import { playPortalActivate } from '@/audio/AudioManager'
import { getTerrainHeight } from '@/utils/terrainHeight'

const SANCTUARY_X = 75
const SANCTUARY_Z = 20

export function Sanctuary() {
  const portalActivated = useGameStore((s) => s.portalActivated)
  const portalRef = useRef<THREE.Group>(null)
  const runeRingRef = useRef<THREE.Mesh>(null)
  const portalLightRef = useRef<THREE.PointLight>(null)
  const activatedAudioPlayed = useRef(false)

  const baseY = useMemo(() => getTerrainHeight(SANCTUARY_X, SANCTUARY_Z), [])

  const stoneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#332f3d', roughness: 0.88, metalness: 0.1 }),
    []
  )

  const goldMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#b45309',
        roughness: 0.35,
        metalness: 0.8,
        emissive: new THREE.Color('#d97706'),
        emissiveIntensity: 0.5,
      }),
    []
  )

  // Portal vortex swirl shader
  const portalShader = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uActive: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uActive;
        varying vec2 vUv;

        void main() {
          vec2 center = vUv - 0.5;
          float dist = length(center);
          float angle = atan(center.y, center.x);

          // Vortex swirl pattern
          float swirl = sin(angle * 5.0 - uTime * 3.5 + dist * 10.0);
          float ripple = sin(dist * 24.0 - uTime * 4.0);
          float pattern = swirl * 0.5 + ripple * 0.5;
          pattern = pattern * 0.5 + 0.5;

          // Boundary mask
          float mask = smoothstep(0.48, 0.32, dist);

          vec3 colTeal = vec3(0.22, 0.85, 0.78);
          vec3 colGold = vec3(0.98, 0.75, 0.22);
          vec3 colPurple = vec3(0.72, 0.38, 0.95);

          vec3 color = mix(colTeal, colPurple, pattern);
          if (uActive > 0.5) {
            color = mix(color, colGold, uActive * 0.7);
          }

          float brightness = (0.7 + pattern * 0.5) * (uActive > 0.5 ? 1.8 : 0.65);
          float alpha = mask * (0.6 + pattern * 0.4);

          gl_FragColor = vec4(color * brightness, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  }, [])

  // Floating ancient stone relics
  const floatingStones = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      angle: (i / 10) * Math.PI * 2,
      dist: 12 + (i % 3) * 3,
      height: 7 + (i % 4) * 2,
      speed: 0.2 + (i % 3) * 0.1,
      scale: 0.7 + (i % 2) * 0.4,
    }))
  }, [])

  const floatGroup = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    portalShader.uniforms.uTime.value = t

    if (portalActivated) {
      if (!activatedAudioPlayed.current) {
        activatedAudioPlayed.current = true
        playPortalActivate()
      }
      portalShader.uniforms.uActive.value = Math.min(1.0, portalShader.uniforms.uActive.value + 0.03)

      if (portalLightRef.current) {
        portalLightRef.current.intensity = 4.0 + Math.sin(t * 5) * 1.5
      }
      if (portalRef.current) {
        portalRef.current.rotation.y = t * 0.5
      }
    } else {
      portalShader.uniforms.uActive.value = 0.2 + Math.sin(t * 1.2) * 0.08
    }

    if (runeRingRef.current) {
      runeRingRef.current.rotation.z = t * 0.3
    }

    if (floatGroup.current) {
      floatGroup.current.children.forEach((child, i) => {
        const s = floatingStones[i]
        if (!s) return
        child.position.x = Math.cos(t * s.speed + s.angle) * s.dist
        child.position.y = s.height + Math.sin(t * s.speed * 1.5 + s.angle) * 1.2
        child.position.z = Math.sin(t * s.speed + s.angle) * s.dist
        child.rotation.x = t * 0.2
        child.rotation.y = t * 0.3
      })
    }
  })

  return (
    <group position={[SANCTUARY_X, baseY, SANCTUARY_Z]}>
      {/* 1. Grand Raised Stone Platform */}
      <RigidBody type="fixed" colliders="hull">
        <group position={[0, 0, 0]}>
          {/* Octagonal base dais */}
          <mesh position={[0, 0.4, 0]} material={stoneMat} receiveShadow>
            <cylinderGeometry args={[18, 20, 0.8, 8]} />
          </mesh>
          {/* Inner gold rune ring */}
          <mesh position={[0, 0.82, 0]} material={goldMat} receiveShadow>
            <cylinderGeometry args={[10, 10.5, 0.2, 16]} />
          </mesh>
          {/* Steps */}
          {[20, 22].map((r, i) => (
            <mesh key={i} position={[0, -(i * 0.4) + 0.1, 0]} material={stoneMat} receiveShadow>
              <cylinderGeometry args={[r, r + 1.2, 0.4, 8]} />
            </mesh>
          ))}
        </group>
      </RigidBody>

      {/* 2. Rotating Ground Rune Circle */}
      <mesh ref={runeRingRef} position={[0, 0.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.5, 9.2, 32]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={portalActivated ? 1.8 : 0.8}
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Four Grand Temple Pillars */}
      {[[-7, -7], [7, -7], [-7, 7], [7, 7]].map(([px, pz], i) => (
        <RigidBody key={i} type="fixed" colliders="hull">
          <group position={[px, 0.8, pz]}>
            {/* Shaft */}
            <mesh position={[0, 7.5, 0]} material={stoneMat} castShadow receiveShadow>
              <cylinderGeometry args={[1.1, 1.4, 15, 8]} />
            </mesh>
            {/* Golden Capital */}
            <mesh position={[0, 15.4, 0]} material={goldMat} castShadow>
              <cylinderGeometry args={[1.8, 1.1, 1.2, 8]} />
            </mesh>
            {/* Base block */}
            <mesh position={[0, 0.4, 0]} material={stoneMat} castShadow receiveShadow>
              <boxGeometry args={[2.8, 0.8, 2.8]} />
            </mesh>
            {/* Emissive runic insets */}
            <mesh position={[0, 7.5, 1.15]}>
              <planeGeometry args={[0.3, 7.0]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#38bdf8"
                emissiveIntensity={1.2}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        </RigidBody>
      ))}

      {/* 4. Torches with Animated Flames */}
      {[[-11, 0], [11, 0], [0, -11], [0, 11]].map(([tx, tz], i) => (
        <group key={i} position={[tx, 0.8, tz]}>
          <mesh position={[0, 2.5, 0]} material={stoneMat} castShadow>
            <cylinderGeometry args={[0.2, 0.25, 5, 6]} />
          </mesh>
          <mesh position={[0, 5.2, 0]} material={goldMat}>
            <coneGeometry args={[0.6, 0.8, 6]} />
          </mesh>
          {/* Flame mesh */}
          <mesh position={[0, 5.8, 0]}>
            <coneGeometry args={[0.35, 0.9, 6]} />
            <meshStandardMaterial
              color="#f97316"
              emissive="#ea580c"
              emissiveIntensity={2.5}
              transparent
              opacity={0.9}
            />
          </mesh>
          <pointLight position={[0, 6.0, 0]} color="#fb923c" intensity={1.8} distance={15} decay={2} />
        </group>
      ))}

      {/* 5. THE FINAL PORTAL */}
      <group ref={portalRef} position={[0, 8.5, 0]}>
        {/* Outer Torus Ring */}
        <mesh castShadow>
          <torusGeometry args={[5.2, 0.65, 16, 64]} />
          <meshStandardMaterial
            color="#1e1b4b"
            roughness={0.25}
            metalness={0.85}
            emissive={portalActivated ? '#fbbf24' : '#38bdf8'}
            emissiveIntensity={portalActivated ? 1.8 : 0.6}
          />
        </mesh>
        {/* Inner Gold Trim */}
        <mesh>
          <torusGeometry args={[4.8, 0.18, 8, 32]} />
          <primitive object={goldMat} />
        </mesh>
        {/* Animated Vortex Plane */}
        <mesh rotation={[0, 0, 0]}>
          <circleGeometry args={[4.8, 32]} />
          <primitive object={portalShader} attach="material" />
        </mesh>
        {/* Portal Radiant Light */}
        <pointLight
          ref={portalLightRef}
          color={portalActivated ? '#fbbf24' : '#38bdf8'}
          intensity={portalActivated ? 4.0 : 1.8}
          distance={35}
          decay={2}
        />
      </group>

      {/* 6. Orbiting Ancient Relic Fragments */}
      <group ref={floatGroup}>
        {floatingStones.map((s, i) => (
          <mesh key={i} scale={s.scale} material={stoneMat} castShadow>
            <dodecahedronGeometry args={[0.7, 0]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export default Sanctuary
