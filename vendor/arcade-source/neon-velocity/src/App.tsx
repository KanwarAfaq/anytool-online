import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Environment, OrbitControls, PerspectiveCamera, Stars, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cars, tracks, useGame, type CameraMode } from './store'
import type { MutableRefObject } from 'react'

type Vec = [number, number, number]

const neon = (color: string, intensity = 4) => new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: true, opacity: 0.9 })

function Car({ color, accent, player = false, scale = 1, position = [0, 0.34, 0] as Vec, rotation = 0 }: { color: string; accent: string; player?: boolean; scale?: number; position?: Vec; rotation?: number }) {
  const body = useMemo(() => new THREE.MeshStandardMaterial({ color, metalness: 0.82, roughness: 0.18 }), [color])
  const glow = useMemo(() => neon(accent, 5), [accent])
  const wheels = [-0.72, 0.72].flatMap(x => [-0.92, 0.92].map(z => [x, 0.2, z] as Vec))
  return <group position={position} rotation={[0, rotation, 0]} scale={scale}>
    <mesh castShadow material={body} position={[0, 0.24, 0]}><boxGeometry args={[1.45, 0.34, 3.05]} /></mesh>
    <mesh castShadow material={body} position={[0, 0.48, -0.18]} rotation={[0.04, 0, 0]}><boxGeometry args={[1.08, 0.34, 1.42]} /></mesh>
    <mesh material={new THREE.MeshPhysicalMaterial({ color: '#152638', metalness: 0.2, roughness: 0.05, transmission: 0.1, transparent: true, opacity: 0.78 })} position={[0, 0.68, -0.18]} rotation={[0.05, 0, 0]}><boxGeometry args={[0.86, 0.24, 0.95]} /></mesh>
    <mesh material={glow} position={[0, 0.3, -1.54]}><boxGeometry args={[0.9, 0.06, 0.025]} /></mesh>
    <mesh material={new THREE.MeshBasicMaterial({ color: '#ff285f', toneMapped: false })} position={[0, 0.3, 1.54]}><boxGeometry args={[0.72, 0.07, 0.03]} /></mesh>
    {wheels.map((p, i) => <group key={i} position={p} rotation={[Math.PI / 2, 0, 0]}><mesh castShadow><cylinderGeometry args={[0.28, 0.28, 0.17, 16]} /><meshStandardMaterial color="#080b12" roughness={0.78} /></mesh><mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.13, 0.13, 0.18, 12]} /><meshStandardMaterial color={accent} metalness={0.8} /></mesh></group>)}
    {player && <><mesh material={glow} position={[-0.38, 0.34, -1.61]}><boxGeometry args={[0.16, 0.08, 0.04]} /></mesh><mesh material={glow} position={[0.38, 0.34, -1.61]}><boxGeometry args={[0.16, 0.08, 0.04]} /></mesh></>}
  </group>
}

function Road({ trackId }: { trackId: string }) {
  const accent = trackId === 'city' ? '#36d9ff' : trackId === 'mountain' ? '#ffb256' : '#ff5b93'
  const side = useMemo(() => Array.from({ length: 32 }, (_, i) => i), [])
  const props = useMemo(() => side.map(i => ({ z: -i * 8, offset: 2.9 + (i % 2) * 0.9 })), [side])
  return <group>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, -120]}><planeGeometry args={[8.4, 260]} /><meshStandardMaterial color="#161b2a" roughness={0.32} metalness={0.56} /></mesh>
    <mesh position={[-4.15, 0.02, -120]}><boxGeometry args={[0.08, 0.03, 260]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh>
    <mesh position={[4.15, 0.02, -120]}><boxGeometry args={[0.08, 0.03, 260]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh>
    {Array.from({ length: 26 }, (_, i) => <mesh key={i} position={[0, 0.015, -i * 10 - 3]}><boxGeometry args={[0.06, 0.02, 3.2]} /><meshBasicMaterial color="#d8eaff" transparent opacity={0.7} /></mesh>)}
    {props.map((p, i) => <StreetProp key={i} index={i} z={p.z} offset={p.offset} accent={accent} trackId={trackId} />)}
  </group>
}

function StreetProp({ index, z, offset, accent, trackId }: { index: number; z: number; offset: number; accent: string; trackId: string }) {
  const left = index % 2 === 0 ? -1 : 1
  if (trackId === 'mountain') return <group position={[left * offset, 0, z - 4]}><mesh position={[0, 1.2, 0]}><coneGeometry args={[1.15 + (index % 3) * .25, 2.8 + (index % 2), 6]} /><meshStandardMaterial color={index % 2 ? '#142e32' : '#243d38'} roughness={1} /></mesh><mesh position={[left * .35, 0.7, -2]} rotation={[0, 0, .25]}><boxGeometry args={[.08, 1.2, .08]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh></group>
  if (trackId === 'coast') return <group position={[left * offset, 0, z - 4]}><mesh position={[0, .8, 0]}><cylinderGeometry args={[.12, .18, 1.6, 8]} /><meshStandardMaterial color="#806249" /></mesh><mesh position={[0, 1.7, 0]}><sphereGeometry args={[.62, 10, 6]} /><meshStandardMaterial color="#2f8d68" roughness={.9} /></mesh><mesh position={[left * .4, .08, 0]}><boxGeometry args={[.65, .04, .12]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh></group>
  return <group position={[left * offset, 0, z - 4]}><mesh position={[0, 1.1, 0]}><boxGeometry args={[1.15 + (index % 2) * .5, 2.2 + (index % 3), 1.15]} /><meshStandardMaterial color={index % 3 === 0 ? '#1a2038' : '#242a49'} roughness={.82} /></mesh><mesh material={neon(index % 2 ? '#ff4da6' : accent, 3)} position={[0, 1.3 + (index % 3), .59]}><boxGeometry args={[.7, .14, .03]} /></mesh><mesh position={[left * .45, .55, .64]}><boxGeometry args={[.07, .7, .04]} /><meshBasicMaterial color="#ffe2ad" toneMapped={false} /></mesh></group>
}

function Rain() {
  const ref = useRef<THREE.Points>(null)
  const count = 280
  const positions = useMemo(() => { const a = new Float32Array(count * 3); for (let i = 0; i < count; i++) { a[i * 3] = (Math.random() - .5) * 18; a[i * 3 + 1] = Math.random() * 8; a[i * 3 + 2] = -Math.random() * 45; } return a }, [])
  useFrame((_, d) => { if (!ref.current) return; const p = ref.current.geometry.attributes.position.array as Float32Array; for (let i = 0; i < count; i++) { p[i * 3 + 1] -= d * 9; if (p[i * 3 + 1] < 0) p[i * 3 + 1] = 8; } ref.current.geometry.attributes.position.needsUpdate = true })
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} /></bufferGeometry><pointsMaterial color="#83c6ff" size={.035} transparent opacity={.48} /></points>
}

type Sim = {
  dist: number; x: number; speed: number; nitro: number; drift: number; lap: number; lapStart: number
  lapTimes: number[]; elapsed: number; hitCd: number; shake: number; steer: number; done: boolean; tick: number
  ai: { dist: number; x: number; speed: number; lane: number; ph: number }[]
}
type Ctl = { keys: Record<string, boolean>; go: boolean; paused: boolean }

const LAP_LEN: Record<string, number> = { city: 1100, mountain: 1300, coast: 1300 }
const AI_LOOK = [['#ff395f', '#ffb0be'], ['#51d3ff', '#d2f7ff'], ['#f5a640', '#ffe6b0']]

function newSim(): Sim {
  return {
    dist: 0, x: 0, speed: 0, nitro: 100, drift: 0, lap: 1, lapStart: 0, lapTimes: [], elapsed: 0, hitCd: 0, shake: 0, steer: 0, done: false, tick: 0,
    ai: [{ dist: 8, x: -1.8, speed: 0, lane: -1.8, ph: 0 }, { dist: 15, x: 1.7, speed: 0, lane: 1.7, ph: 2 }, { dist: 22, x: -1.2, speed: 0, lane: -1.2, ph: 4 }],
  }
}

type Finish = { elapsed: number; position: number; bestLap: number; drift: number }

function World({ trackId, cameraMode, carIndex, sim, ctl, laps, onFinish }: { trackId: string; cameraMode: CameraMode; carIndex: number; sim: Sim; ctl: MutableRefObject<Ctl>; laps: number; onFinish: (f: Finish) => void }) {
  const carRef = useRef<THREE.Group>(null)
  const sceneRef = useRef<THREE.Group>(null)
  const gateRef = useRef<THREE.Group>(null)
  const aiRefs = useRef<(THREE.Group | null)[]>([])
  const camera = useThree(s => s.camera) as THREE.PerspectiveCamera
  const playerCar = cars[carIndex]
  const L = LAP_LEN[trackId] ?? 1100

  useFrame((_, dtRaw) => {
    const s = sim, c = ctl.current, dt = Math.min(dtRaw, 0.05)
    const k = c.keys
    const steer = (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0)
    if (c.go && !c.paused && !s.done) {
      const car = cars[carIndex]
      const accel = k.w || k.arrowup, brake = k.s || k.arrowdown
      const boosting = !!k.shift && s.nitro > 0 && s.speed > 20
      const offroad = Math.abs(s.x) > 4.1
      const cap = (offroad ? 50 : car.top) + (boosting ? 28 : 0)
      let acc = accel ? 10 + car.accel * 0.18 : -14
      if (brake) acc -= 70
      if (boosting) acc += 45
      let next = s.speed + acc * dt
      if (next > cap) next = Math.max(cap, s.speed - 30 * dt)
      s.speed = THREE.MathUtils.clamp(next, 0, 200)
      s.nitro = THREE.MathUtils.clamp(s.nitro + (boosting ? -28 : 6) * dt, 0, 100)
      const drifting = !!k[' '] && s.speed > 40 && steer !== 0
      const rate = (2 + car.grip * 0.02) * (0.3 + Math.min(1, s.speed / 60) * 0.7) * (drifting ? 1.35 : 1)
      s.x += steer * rate * dt
      if (Math.abs(s.x) > 5.4) { s.x = Math.sign(s.x) * 5.4; s.speed *= 1 - 0.8 * dt }
      if (drifting) s.drift += s.speed * dt * 0.6
      s.steer = THREE.MathUtils.lerp(s.steer, steer, dt * 8)
      s.dist += s.speed * 0.277 * dt
      s.elapsed += dt
      s.hitCd = Math.max(0, s.hitCd - dt)
      s.shake = Math.max(0, s.shake - dt)

      s.ai.forEach((a, i) => {
        const target = car.top * (0.8 + 0.05 * i) + THREE.MathUtils.clamp((s.dist - a.dist) * 0.25, -6, 8)
        a.speed = THREE.MathUtils.lerp(a.speed, target, dt * 0.8)
        a.dist += a.speed * 0.277 * dt
        a.x = a.lane + Math.sin(s.elapsed * 0.6 + a.ph) * 0.7
        const rel = a.dist - s.dist
        if (s.hitCd <= 0 && Math.abs(rel) < 3.4 && Math.abs(a.x - s.x) < 1.55) {
          s.speed *= 0.65; s.x += (s.x >= a.x ? 1 : -1) * 0.8; s.hitCd = 0.6; s.shake = 0.35
        }
      })

      const lapNow = Math.floor(s.dist / L) + 1
      if (lapNow > s.lap) {
        s.lapTimes.push(s.elapsed - s.lapStart); s.lapStart = s.elapsed; s.lap = lapNow
        if (s.lap > laps) {
          s.done = true
          const pos = 1 + s.ai.filter(a => a.dist > s.dist).length
          onFinish({ elapsed: s.elapsed, position: pos, bestLap: Math.min(...s.lapTimes), drift: s.drift })
        }
      }
      s.tick += dt
      if (s.tick > 0.1) {
        s.tick = 0
        useGame.setState({
          speed: s.speed, nitro: s.nitro, lap: Math.min(s.lap, laps), elapsed: s.elapsed, driftScore: s.drift,
          position: 1 + s.ai.filter(a => a.dist > s.dist).length,
        })
      }
    }

    if (sceneRef.current) sceneRef.current.position.z = s.dist % 40
    if (carRef.current) {
      carRef.current.position.x = s.x
      carRef.current.rotation.y = THREE.MathUtils.lerp(carRef.current.rotation.y, -s.steer * 0.16, dt * 6)
      carRef.current.rotation.z = THREE.MathUtils.lerp(carRef.current.rotation.z, s.steer * 0.03, dt * 6)
    }
    s.ai.forEach((a, i) => {
      const g = aiRefs.current[i]
      if (!g) return
      const rel = a.dist - s.dist
      g.visible = rel > -14 && rel < 95
      g.position.set(a.x, 0, -rel)
    })
    if (gateRef.current) {
      const rel = s.lap * L - s.dist
      gateRef.current.visible = rel > -10 && rel < 120
      gateRef.current.position.z = -rel
    }
    const target = cameraMode === 'cockpit' ? new THREE.Vector3(s.x, 1.08, 0.1) : cameraMode === 'hood' ? new THREE.Vector3(s.x, 0.95, 1.7) : new THREE.Vector3(s.x * 0.75, 3.3, 7.5)
    camera.position.lerp(target, Math.min(1, dt * (cameraMode === 'chase' ? 4 : 14)))
    if (s.shake > 0) { camera.position.x += (Math.random() - 0.5) * 0.12; camera.position.y += (Math.random() - 0.5) * 0.1 }
    camera.lookAt(s.x * 0.5, 0.4, -10)
    const fov = 64 + Math.min(18, s.speed * 0.12) + (s.nitro < 99 && ctl.current.keys.shift ? 4 : 0)
    if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = THREE.MathUtils.lerp(camera.fov, fov, dt * 4); camera.updateProjectionMatrix() }
  })

  return <>
    <color attach="background" args={[trackId === 'city' ? '#070a1a' : trackId === 'mountain' ? '#19101c' : '#1b0d22']} />
    <fog attach="fog" args={[trackId === 'city' ? '#0b1230' : '#2a1727', 14, 65]} />
    <ambientLight intensity={trackId === 'city' ? .55 : .8} color={trackId === 'coast' ? '#ffc2a1' : '#8da7ff'} />
    <directionalLight position={[5, 10, 3]} intensity={3.5} color={trackId === 'city' ? '#7eabff' : '#ffd1a0'} castShadow shadow-mapSize={[1024, 1024]} />
    <Stars radius={50} depth={25} count={trackId === 'city' ? 900 : 1800} factor={1.2} saturation={0} fade speed={.2} />
    <group ref={sceneRef}><Road trackId={trackId} /></group>
    {trackId === 'coast' && <mesh position={[0, -1.8, -70]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[50, 200]} /><meshStandardMaterial color="#0b5264" metalness={.3} roughness={.35} /></mesh>}
    <group ref={carRef}><Car color={playerCar.color} accent={playerCar.accent} player position={[0, .34, 0]} /></group>
    {AI_LOOK.map(([c, a], i) => <group key={i} ref={el => { aiRefs.current[i] = el }}><Car color={c} accent={a} position={[0, .34, 0]} scale={.94 - i * .04} /></group>)}
    <group ref={gateRef} visible={false}>
      <mesh position={[-4.6, 2, 0]}><boxGeometry args={[.25, 4, .25]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      <mesh position={[4.6, 2, 0]}><boxGeometry args={[.25, 4, .25]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
      <mesh position={[0, 4, 0]}><boxGeometry args={[9.4, .5, .25]} /><meshBasicMaterial color="#ff3c9c" toneMapped={false} /></mesh>
      <mesh position={[0, .02, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[8.4, 1.2]} /><meshBasicMaterial color="#e9f6ff" transparent opacity={.55} /></mesh>
    </group>
    {trackId === 'city' && <Rain />}
  </>
}

function Scene(props: { trackId: string; cameraMode: CameraMode; carIndex: number; sim: Sim; ctl: MutableRefObject<Ctl>; laps: number; onFinish: (f: Finish) => void }) {
  return <div className="scene-wrap">
    <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true }}>
      <PerspectiveCamera makeDefault position={[0, 3.4, 8]} fov={64} />
      <World {...props} />
      <EffectComposer><Bloom intensity={0.7} luminanceThreshold={0.7} mipmapBlur /></EffectComposer>
    </Canvas>
  </div>
}

function CornerMark() { return <div className="corner-mark"><span>NV</span><i>///</i></div> }

function Menu() {
  const { set } = useGame()
  return <main className="menu-screen"><div className="menu-backdrop"><div className="grid-floor" /><div className="menu-orb" /></div><CornerMark /><div className="menu-copy"><p className="eyebrow">SEASON 01 / NIGHT RUN</p><h1>NEON<br /><em>VELOCITY</em></h1><p className="lede">The city is asleep. The road is yours.</p><button className="primary-btn" onClick={() => set({ screen: 'tracks' })}>START ENGINE <span>↗</span></button><div className="menu-links"><button onClick={() => set({ screen: 'garage' })}>GARAGE</button><button onClick={() => set({ screen: 'tracks' })}>SELECT TRACK</button></div></div><div className="menu-meta"><span>01</span><span>ARCADE RACING / 3 TRACKS / 4 CARS</span><span>© 2025 NV STUDIOS</span></div></main>
}

function Garage() {
  const { carIndex, set } = useGame(); const car = cars[carIndex]
  return <main className="selection-screen"><Header title="GARAGE" back={() => set({ screen: 'menu' })} /><div className="selection-content"><div className="selection-intro"><p className="eyebrow">YOUR COLLECTION / {cars.length} VEHICLES</p><h1>Choose your<br /><em>weapon.</em></h1><p>Every chassis has a signature. Find the one that feels like you.</p></div><div className="garage-stage"><div className="stage-glow" style={{ background: car.accent }} /><Car color={car.color} accent={car.accent} scale={1.7} position={[0, 0, 0]} /></div><div className="car-list">{cars.map((item, i) => <button className={i === carIndex ? 'car-row active' : 'car-row'} key={item.id} onClick={() => set({ carIndex: i })}><span className="car-index">0{i + 1}</span><span><strong>{item.name}</strong><small>{item.class}</small></span><span className="bar-set"><i style={{ width: `${item.top}%` }} /><i style={{ width: `${item.accel}%` }} /><i style={{ width: `${item.grip}%` }} /></span><span className="arrow">{i === carIndex ? '●' : '○'}</span></button>)}</div></div><div className="selection-footer"><button className="ghost-btn" onClick={() => set({ screen: 'menu' })}>← BACK</button><button className="primary-btn" onClick={() => set({ screen: 'tracks' })}>SELECT {car.name} <span>↗</span></button></div></main>
}

function TrackSelect() {
  const { trackIndex, set, carIndex } = useGame(); const track = tracks[trackIndex]
  return <main className="selection-screen track-select"><Header title="RACE SELECT" back={() => set({ screen: 'menu' })} /><div className="track-content"><div className="track-copy"><p className="eyebrow">RACE ROUTE / 0{trackIndex + 1}</p><h1>{track.name}</h1><p>{track.description}</p><div className="track-specs"><span><b>{track.laps}</b> LAPS</span><span><b>{track.length}</b> DISTANCE</span><span><b>{readBest(track.id) ? formatTime(readBest(track.id)) : '--:--'}</b> BEST TIME</span></div></div><div className="track-preview" style={{ '--track': track.tone } as React.CSSProperties}><div className="preview-sky" /><div className="preview-road" /><div className="preview-city" /><div className="preview-label">{track.location}</div></div><div className="track-tabs">{tracks.map((t, i) => <button className={i === trackIndex ? 'track-tab active' : 'track-tab'} key={t.id} onClick={() => set({ trackIndex: i })}><span>0{i + 1}</span>{t.name}</button>)}</div></div><div className="selection-footer"><button className="ghost-btn" onClick={() => set({ screen: 'garage' })}>← GARAGE</button><button className="primary-btn" onClick={() => { void carIndex; useGame.getState().startRace() }}>RACE NOW <span>↗</span></button></div></main>
}

function Header({ title, back }: { title: string; back: () => void }) { return <header className="app-header"><button className="brand-mini" onClick={back}><span>NV</span> NEON VELOCITY</button><span className="header-title">{title}</span><span className="header-right">ONLINE / LOCAL SAVE <i /></span></header> }

function Speedometer({ speed, nitro }: { speed: number; nitro: number }) { return <div className="speedometer"><div className="speed-number">{Math.round(speed)}<small>KM/H</small></div><div className="speed-ring" style={{ '--fill': `${Math.min(speed / 1.2, 100)}%` } as React.CSSProperties} /><div className="nitro-meter"><span>NITRO</span><i><b style={{ width: `${nitro}%` }} /></i></div></div> }

function bestKey(id: string) { return `neon-velocity:best:${id}` }
function readBest(id: string): number { try { return Number(localStorage.getItem(bestKey(id))) || 0 } catch { return 0 } }

function Race() {
  const { trackIndex, carIndex, camera, speed, nitro, lap, position, elapsed, driftScore, paused, set, resetRace } = useGame()
  const ctl = useRef<Ctl>({ keys: {}, go: false, paused: false })
  const sim = useMemo(() => newSim(), [])
  const [countdown, setCountdown] = useState(3)
  const track = tracks[trackIndex]
  ctl.current.paused = paused
  ctl.current.go = countdown === 0

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key.startsWith('arrow') || key === ' ') e.preventDefault()
      ctl.current.keys[key] = true
      const g = useGame.getState()
      if (key === 'c' && !e.repeat) g.set({ camera: g.camera === 'chase' ? 'hood' : g.camera === 'hood' ? 'cockpit' : 'chase' })
      if (key === 'escape' && !e.repeat) g.set({ paused: !g.paused })
    }
    const up = (e: KeyboardEvent) => { ctl.current.keys[e.key.toLowerCase()] = false }
    const blur = () => { ctl.current.keys = {} }
    addEventListener('keydown', down); addEventListener('keyup', up); addEventListener('blur', blur)
    return () => { removeEventListener('keydown', down); removeEventListener('keyup', up); removeEventListener('blur', blur) }
  }, [])
  useEffect(() => {
    if (countdown <= 0 || paused) return
    const t = window.setTimeout(() => setCountdown(c => Math.max(0, c - 1)), 850)
    return () => clearTimeout(t)
  }, [countdown, paused])

  const onFinish = (f: Finish) => {
    const prev = readBest(track.id)
    const record = prev === 0 || f.elapsed < prev
    if (record) { try { localStorage.setItem(bestKey(track.id), String(f.elapsed)) } catch { /* storage unavailable */ } }
    window.setTimeout(() => useGame.setState({ screen: 'results', elapsed: f.elapsed, finishPos: f.position, bestLap: f.bestLap, driftScore: f.drift, record }), 900)
  }

  return <main className="race-screen"><Scene trackId={track.id} cameraMode={camera} carIndex={carIndex} sim={sim} ctl={ctl} laps={track.laps} onFinish={onFinish} /><div className="race-vignette" /><div className="race-hud"><div className="hud-top"><div><span className="hud-label">POSITION</span><strong>{position}<small>/ 04</small></strong></div><div className="lap"><span className="hud-label">LAP</span><strong>{lap}<small>/ {track.laps}</small></strong></div><div className="race-time"><span className="hud-label">TIME</span><strong>{formatTime(elapsed)}</strong></div></div><div className="hud-bottom"><div className="drift"><span>DRIFT SCORE</span><b>{Math.floor(driftScore).toLocaleString()}</b></div><Speedometer speed={speed} nitro={nitro} /></div><div className="mini-map"><span>ROUTE 0{trackIndex + 1}</span><i /><i /><i /><b /></div><div className="race-controls">WASD <span>DRIVE</span> · SPACE <span>DRIFT</span> · SHIFT <span>NITRO</span> · C <span>CAMERA</span> · ESC <span>PAUSE</span></div></div>{countdown > 0 && <div className="countdown"><span>{countdown}</span><small>GET READY</small></div>}{paused && <div className="pause-card"><p className="eyebrow">RACE PAUSED</p><h2>Take a breath.</h2><button className="primary-btn" onClick={() => set({ paused: false })}>RESUME <span>↗</span></button><button className="ghost-btn" onClick={resetRace}>RESTART RACE</button><button className="ghost-btn" onClick={() => set({ screen: 'menu' })}>EXIT TO MENU</button></div>}</main>
}

function Results() {
  const { elapsed, trackIndex, carIndex, finishPos, bestLap, record, driftScore, set, resetRace } = useGame()
  const ord = ['', '1ST', '2ND', '3RD', '4TH'][finishPos] || `${finishPos}TH`
  return <main className="results-screen"><div className="results-grid" /><CornerMark /><div className="results-copy"><p className="eyebrow">RACE COMPLETE / {ord} PLACE</p><h1>{finishPos === 1 ? <>YOU<br /><em>WON.</em></> : <>YOU<br /><em>FINISHED {ord}.</em></>}</h1><div className="result-line"><span>FINISH TIME</span><b>{formatTime(elapsed)}</b></div><div className="result-line"><span>BEST LAP</span><b>{formatTime(bestLap)}</b></div><div className="result-line"><span>DRIFT SCORE</span><b>{Math.floor(driftScore).toLocaleString()}</b></div><div className="result-line"><span>VEHICLE</span><b>{cars[carIndex].name}</b></div><button className="primary-btn" onClick={resetRace}>REPLAY RACE <span>↗</span></button><button className="ghost-btn" onClick={() => set({ screen: 'tracks' })}>CHANGE TRACK</button><button className="ghost-btn" onClick={() => set({ screen: 'menu' })}>MAIN MENU</button></div><div className="results-side"><span>TRACK / {tracks[trackIndex].name}</span><div className="trophy">{finishPos === 1 ? '★' : '◆'}</div><p>{record ? <>NEW TRACK<br />RECORD</> : <>KEEP<br />PUSHING</>}</p></div></main>
}

function formatTime(seconds: number) { const m=Math.floor(seconds/60).toString().padStart(2,'0'); const s=Math.floor(seconds%60).toString().padStart(2,'0'); const ms=Math.floor((seconds%1)*100).toString().padStart(2,'0'); return `${m}:${s}.${ms}` }

export default function App() { const screen=useGame(s=>s.screen); const runId=useGame(s=>s.runId); if(screen==='menu')return <Menu/>; if(screen==='garage')return <Garage/>; if(screen==='tracks')return <TrackSelect/>; if(screen==='race')return <Race key={runId}/>; return <Results/> }
