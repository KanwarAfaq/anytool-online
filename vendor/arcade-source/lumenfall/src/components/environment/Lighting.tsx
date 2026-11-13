import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Cinematic Twilight Lighting
 * Warm golden setting sun contrasting with deep twilight sky & magical crystal radiance
 */
export function Lighting() {
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const rimLightRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (rimLightRef.current) {
      rimLightRef.current.intensity = 1.0 + Math.sin(t * 1.5) * 0.3
    }
  })

  return (
    <>
      {/* 1. Primary Twilight Sun (casts warm directional sunlight & soft shadows) */}
      <directionalLight
        ref={sunRef}
        position={[65, 80, -45]}
        intensity={2.8}
        color="#ffba70"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={260}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0004}
      />

      {/* 2. Soft Cool Fill Light (simulates sky dome illumination) */}
      <directionalLight
        position={[-60, 45, 55]}
        intensity={0.9}
        color="#708fd4"
      />

      {/* 3. Global Ambient Baseline */}
      <ambientLight intensity={0.7} color="#453860" />

      {/* 4. Natural Hemisphere Light (sky vs ground bounce) */}
      <hemisphereLight
        args={['#7e8acc', '#2b221a', 0.65]}
      />

      {/* 5. Region 1 (Forest) magical lantern radiance */}
      <pointLight
        position={[-40, 10, 0]}
        color="#4ade80"
        intensity={1.2}
        distance={70}
        decay={2}
      />

      {/* 6. Region 2 (Crystal Valley) pulsating energy source */}
      <pointLight
        ref={rimLightRef}
        position={[25, 12, 5]}
        color="#38bdf8"
        intensity={2.0}
        distance={60}
        decay={2}
      />

      {/* 7. Region 3 (Sanctuary) divine gold glow over the portal dais */}
      <pointLight
        position={[80, 25, 20]}
        color="#fbbf24"
        intensity={2.5}
        distance={80}
        decay={2}
      />
    </>
  )
}
