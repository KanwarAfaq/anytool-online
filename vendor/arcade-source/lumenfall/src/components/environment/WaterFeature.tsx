import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getTerrainHeight } from '@/utils/terrainHeight'

export function WaterFeature() {
  const waterMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('#0284c7') },
          uFoam: { value: new THREE.Color('#7dd3fc') },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          uniform float uTime;
          void main() {
            vUv = uv;
            vPosition = position;
            vec3 pos = position;
            pos.z += sin(position.x * 4.0 + uTime * 2.5) * 0.04;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor;
          uniform vec3 uFoam;
          varying vec2 vUv;

          void main() {
            vec2 scrollUv = vUv + vec2(uTime * 0.12, uTime * 0.18);
            float ripple = sin(scrollUv.x * 24.0) * sin(scrollUv.y * 24.0);
            ripple = ripple * 0.5 + 0.5;

            vec3 color = mix(uColor, uFoam, ripple * 0.35);
            float alpha = 0.72 + ripple * 0.15;

            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  )

  const waterfallMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
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
          varying vec2 vUv;

          void main() {
            float flow = fract(vUv.y - uTime * 0.7);
            float streaks = abs(sin(vUv.x * 32.0)) * 0.4;
            float foam = (1.0 - flow) * (1.0 - flow);
            float alpha = (0.5 + streaks + foam * 0.35) * (1.0 - abs(vUv.x - 0.5) * 1.8);
            vec3 color = mix(vec3(0.08, 0.48, 0.72), vec3(0.65, 0.92, 0.98), flow + foam);
            gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.9));
          }
        `,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    waterMat.uniforms.uTime.value = t
    waterfallMat.uniforms.uTime.value = t
  })

  // Stream positions calculated on terrain
  const streamPoints = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const frac = i / 13
      const x = -48 + Math.sin(frac * Math.PI * 1.5) * 6
      const z = -25 + frac * 45
      const y = getTerrainHeight(x, z) + 0.08
      return { x, y, z }
    })
  }, [])

  const poolX = 28
  const poolZ = 14
  const poolY = useMemo(() => getTerrainHeight(poolX, poolZ) + 0.1, [])

  return (
    <group>
      {/* 1. Winding Forest Stream */}
      {streamPoints.map((pt, i) => (
        <mesh
          key={i}
          position={[pt.x, pt.y, pt.z]}
          rotation={[-Math.PI / 2, 0, Math.sin(i * 0.3) * 0.2]}
        >
          <planeGeometry args={[3.2, 4.5]} />
          <primitive object={waterMat} attach="material" />
        </mesh>
      ))}

      {/* 2. Crystal Valley Pool Basin */}
      <mesh position={[poolX, poolY, poolZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.5, 32]} />
        <primitive object={waterMat} attach="material" />
      </mesh>
      <mesh position={[poolX, poolY - 0.1, poolZ]}>
        <torusGeometry args={[5.5, 0.45, 8, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* 3. Forest Waterfall Cliff Face */}
      <mesh position={[-52, getTerrainHeight(-52, -22) + 2.5, -22]} rotation={[0, 0.35, 0]}>
        <planeGeometry args={[4.5, 9.0, 4, 16]} />
        <primitive object={waterfallMat} attach="material" />
      </mesh>
    </group>
  )
}

export default WaterFeature
