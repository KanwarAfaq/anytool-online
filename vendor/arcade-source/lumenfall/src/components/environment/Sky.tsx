import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Sky() {
  const sunHaloRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Group>(null)

  // Smooth twilight sky shader
  const skyMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vWorldPosition;

        void main() {
          vec3 dir = normalize(vWorldPosition);
          float y = dir.y; // -1 to 1

          // Twilight color palette
          vec3 colZenith = vec3(0.06, 0.08, 0.18);   // deep indigo
          vec3 colMid = vec3(0.30, 0.12, 0.42);      // dusk violet
          vec3 colSunset = vec3(0.85, 0.42, 0.18);   // warm amber/orange
          vec3 colHorizon = vec3(0.95, 0.65, 0.35);  // golden rim

          // Smooth multi-stop interpolation
          vec3 sky;
          if (y < 0.0) {
            sky = mix(colSunset, colHorizon, 1.0 + y * 2.0);
          } else if (y < 0.25) {
            float t = y / 0.25;
            sky = mix(colHorizon, colSunset, t);
          } else if (y < 0.6) {
            float t = (y - 0.25) / 0.35;
            sky = mix(colSunset, colMid, t);
          } else {
            float t = (y - 0.6) / 0.4;
            sky = mix(colMid, colZenith, t);
          }

          // Subtle atmospheric haze shimmer
          sky += sin(dir.x * 12.0 + uTime * 0.1) * 0.015;

          gl_FragColor = vec4(sky, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    })
  }, [])

  // Procedural twinkling stars
  const starsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const count = 400
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(0.2 + Math.random() * 0.8) // only upper sky
      const r = 550
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi)
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  // Clouds
  const clouds = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      pos: [
        (Math.sin(i * 1.5) - 0.5) * 280,
        60 + (i % 3) * 15,
        (Math.cos(i * 1.2) - 0.5) * 280,
      ] as [number, number, number],
      scale: 14 + (i % 4) * 6,
      speed: 0.3 + (i % 3) * 0.2,
    }))
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    skyMaterial.uniforms.uTime.value = t

    if (sunHaloRef.current) {
      sunHaloRef.current.rotation.z = t * 0.05
    }

    if (cloudsRef.current) {
      cloudsRef.current.children.forEach((child, i) => {
        child.position.x += clouds[i].speed * 0.03
        if (child.position.x > 180) child.position.x = -180
      })
    }
  })

  return (
    <group>
      {/* 1. Atmospheric Sky Dome */}
      <mesh scale={600}>
        <sphereGeometry args={[1, 32, 24]} />
        <primitive object={skyMaterial} />
      </mesh>

      {/* 2. Stars */}
      <points geometry={starsGeometry}>
        <pointsMaterial
          color="#f1f5f9"
          size={1.6}
          transparent
          opacity={0.85}
          sizeAttenuation={false}
        />
      </points>

      {/* 3. Golden Twilight Sun */}
      <group position={[180, 110, -180]}>
        {/* Core sun disc */}
        <mesh>
          <circleGeometry args={[22, 32]} />
          <meshBasicMaterial color="#fed7aa" />
        </mesh>
        {/* Luminous corona */}
        <mesh ref={sunHaloRef}>
          <ringGeometry args={[22, 55, 32]} />
          <meshBasicMaterial
            color="#fb923c"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 4. Drifting Twilight Cloud Layer */}
      <group ref={cloudsRef}>
        {clouds.map((c, i) => (
          <group key={i} position={c.pos} scale={c.scale}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial
                color="#644368"
                roughness={1}
                transparent
                opacity={0.4}
                depthWrite={false}
              />
            </mesh>
            <mesh position={[0.7, 0.1, 0.2]} scale={0.75}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial
                color="#78537b"
                roughness={1}
                transparent
                opacity={0.35}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

export default Sky
