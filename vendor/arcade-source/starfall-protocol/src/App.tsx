import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { Stars, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { create } from 'zustand'

import type { MutableRefObject } from 'react'

type Screen = 'menu' | 'mission' | 'gameover' | 'victory'
type Weapon = 'blaster' | 'plasma' | 'pulse'
type EKind = 'scout' | 'guardian' | 'sentinel'
type Enemy = { id: number; type: EKind; pos: THREE.Vector3; hp: number; max: number; alive: boolean; phase: number; cd: number; hit: number; active: boolean }
type Shot = { pos: THREE.Vector3; vel: THREE.Vector3; dmg: number; r: number; life: number; on: boolean }
type Sim = {
  pos: THREE.Vector3; aim: THREE.Vector3; face: number; hp: number; shield: number; energy: number; fireCd: number
  dashT: number; dashCd: number; dashDir: THREE.Vector3; inv: number; sinceHit: number; relay: number; stage: 0 | 1 | 2
  enemies: Enemy[]; pShots: Shot[]; eShots: Shot[]; keys: Record<string, boolean>; mouse: boolean; done: '' | 'win' | 'lose'
  tick: number; shake: number; flash: number; objective: string
}
type GameState = {
  screen: Screen; hp: number; shield: number; energy: number; progress: number; objective: string; weapon: Weapon; paused: boolean
  hostiles: number; bossHp: number; bossMax: number; bossPhase: number; bossOn: boolean; runId: number
  set: (v: Partial<GameState>) => void; reset: () => void; start: () => void
}
const FRESH = { hp: 100, shield: 100, energy: 100, progress: 0, objective: 'Activate the orbital relay (hold E at the terminal)', weapon: 'blaster' as Weapon, paused: false, hostiles: 6, bossHp: 260, bossMax: 260, bossPhase: 0, bossOn: false }
const useGame = create<GameState>((set) => ({
  screen: 'menu', runId: 0, ...FRESH,
  set: (v) => set(v),
  reset: () => set({ screen: 'menu', ...FRESH }),
  start: () => set((s) => ({ screen: 'mission', ...FRESH, runId: s.runId + 1 })),
}))

const palette = { cyan: '#69e5ff', violet: '#b477ff', amber: '#ffb85c', red: '#ff557f', green: '#58ffbf' }
const WEAPONS = {
  blaster: { cost: 2, rate: 0.16, dmg: 10, speed: 28, r: 0.16 },
  plasma: { cost: 7, rate: 0.5, dmg: 34, speed: 20, r: 0.34 },
  pulse: { cost: 5, rate: 0.34, dmg: 9, speed: 24, r: 0.14 },
} as const
const RADIUS: Record<EKind, number> = { scout: 0.6, guardian: 0.85, sentinel: 1.3 }
const TERMINAL = new THREE.Vector3(0, 0, -8)
const POOL = 48

const mkShots = (): Shot[] => Array.from({ length: POOL }, () => ({ pos: new THREE.Vector3(), vel: new THREE.Vector3(), dmg: 0, r: 0.2, life: 0, on: false }))
const mkEnemy = (id: number, type: EKind, x: number, z: number): Enemy => {
  const hp = type === 'scout' ? 40 : type === 'guardian' ? 80 : 260
  return { id, type, pos: new THREE.Vector3(x, 0, z), hp, max: hp, alive: true, phase: 0, cd: 1, hit: 0, active: false }
}
function newSim(): Sim {
  return {
    pos: new THREE.Vector3(0, 0, 3), aim: new THREE.Vector3(0, 0, -1), face: Math.PI, hp: 100, shield: 100, energy: 100, fireCd: 0,
    dashT: 0, dashCd: 0, dashDir: new THREE.Vector3(), inv: 0, sinceHit: 9, relay: 0, stage: 0,
    enemies: [mkEnemy(1, 'scout', -3, -6), mkEnemy(2, 'guardian', 4, -11), mkEnemy(3, 'scout', -4, -14), mkEnemy(4, 'scout', 4, -17),
      mkEnemy(5, 'guardian', -3, -20), mkEnemy(6, 'scout', 2, -22), mkEnemy(7, 'sentinel', 0, -30)],
    pShots: mkShots(), eShots: mkShots(), keys: {}, mouse: false, done: '', tick: 0, shake: 0, flash: 0,
    objective: FRESH.objective,
  }
}
const spawnShot = (pool: Shot[], from: THREE.Vector3, dir: THREE.Vector3, speed: number, dmg: number, r: number, life = 1.6) => {
  const sh = pool.find((x) => !x.on)
  if (!sh) return
  sh.on = true; sh.pos.copy(from); sh.pos.y = 0.9; sh.vel.copy(dir).setY(0).normalize().multiplyScalar(speed); sh.dmg = dmg; sh.r = r; sh.life = life
}

function Player({ gref }: { gref: MutableRefObject<THREE.Group | null> }) {
  const gun = useRef<THREE.Mesh>(null)
  return <group ref={gref}>
    <mesh castShadow position={[0, .85, 0]}><capsuleGeometry args={[.38, .72, 6, 12]} /><meshStandardMaterial color="#d8e7ff" metalness={.85} roughness={.22} /></mesh>
    <mesh castShadow position={[0, 1.45, 0]}><sphereGeometry args={[.34, 16, 12]} /><meshStandardMaterial color="#2b3c58" metalness={.8} roughness={.18} /></mesh>
    <mesh position={[0, 1.45, .27]}><boxGeometry args={[.28, .12, .02]} /><meshBasicMaterial color={palette.cyan} toneMapped={false} /></mesh>
    <mesh castShadow position={[.43, .9, 0]} rotation={[0, 0, -.2]}><boxGeometry args={[.14, .7, .18]} /><meshStandardMaterial color="#9fb2cc" metalness={.75} /></mesh>
    <mesh ref={gun} position={[.56, .85, .35]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.09, .12, .9, 10]} /><meshStandardMaterial color={palette.cyan} emissive={palette.cyan} emissiveIntensity={2} /></mesh>
    <mesh position={[-.43, .88, 0]} rotation={[0, 0, .2]}><boxGeometry args={[.14, .7, .18]} /><meshStandardMaterial color="#9fb2cc" metalness={.75} /></mesh>
    <pointLight color={palette.cyan} intensity={1.8} distance={5} position={[0, 1, .4]} />
  </group>
}

function EnemyMesh({ enemy, sim }: { enemy: Enemy; sim: Sim }) {
  const ref = useRef<THREE.Group>(null)
  const color = enemy.type === 'sentinel' ? palette.red : enemy.type === 'guardian' ? palette.amber : palette.violet
  useFrame(() => {
    const g = ref.current
    if (!g) return
    g.visible = enemy.alive
    g.position.copy(enemy.pos)
    g.rotation.y = Math.atan2(sim.pos.x - enemy.pos.x, sim.pos.z - enemy.pos.z)
    const pulse = enemy.hit > 0 ? 1 + enemy.hit * 0.6 : 1
    g.scale.setScalar(pulse)
  })
  return <group ref={ref} position={enemy.pos}>
    <mesh castShadow position={[0, enemy.type === 'sentinel' ? 1.4 : .8, 0]}><boxGeometry args={enemy.type === 'sentinel' ? [1.6, 1.8, 1.2] : enemy.type === 'guardian' ? [.9, 1.1, .85] : [.6, .55, .6]} /><meshStandardMaterial color="#242a42" metalness={.78} roughness={.25} emissive={color} emissiveIntensity={.3} /></mesh>
    <mesh position={[0, enemy.type === 'sentinel' ? 1.85 : 1.2, enemy.type === 'sentinel' ? .62 : .42]}><boxGeometry args={[.28, .12, .04]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
    <pointLight color={color} intensity={1.5} distance={5} position={[0, 1, 0]} />
  </group>
}

function ShotMesh({ shot, color }: { shot: Shot; color: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => { const m = ref.current; if (!m) return; m.visible = shot.on; if (shot.on) { m.position.copy(shot.pos); m.scale.setScalar(shot.r * 2.4) } })
  return <mesh ref={ref} visible={false}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
}

function World({ sim }: { sim: Sim }) {
  const scene = useThree((s) => s.scene)
  useEffect(() => { scene.fog = new THREE.Fog('#070b19', 12, 46) }, [scene])
  const pRef = useRef<THREE.Group | null>(null)
  const termRef = useRef<THREE.Mesh>(null)
  const columns = useMemo(() => Array.from({ length: 20 }, (_, i) => i), [])
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.9), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const camTarget = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dtRaw) => {
    const s = sim, dt = Math.min(dtRaw, 0.05), g = useGame.getState()
    ;(window as unknown as { __sfp?: Sim }).__sfp = s
    const k = s.keys
    state.raycaster.setFromCamera(state.pointer, state.camera)
    if (state.raycaster.ray.intersectPlane(plane, tmp)) {
      s.aim.set(tmp.x - s.pos.x, 0, tmp.z - s.pos.z)
      if (s.aim.lengthSq() > 0.01) { s.face = Math.atan2(s.aim.x, s.aim.z); s.aim.normalize() }
    }

    if (!g.paused && !s.done) {
      let mx = (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0)
      let mz = (k.s || k.arrowdown ? 1 : 0) - (k.w || k.arrowup ? 1 : 0)
      const len = Math.hypot(mx, mz) || 1
      mx /= len; mz /= len
      if (s.dashT > 0) { s.pos.addScaledVector(s.dashDir, 18 * dt); s.dashT -= dt } else { s.pos.x += mx * 5.2 * dt; s.pos.z += mz * 5.2 * dt }
      s.pos.x = THREE.MathUtils.clamp(s.pos.x, -5.6, 5.6)
      s.pos.z = THREE.MathUtils.clamp(s.pos.z, -34, 4.5)
      s.dashCd = Math.max(0, s.dashCd - dt); s.inv = Math.max(0, s.inv - dt); s.shake = Math.max(0, s.shake - dt)
      s.sinceHit += dt

      const w = WEAPONS[g.weapon]
      s.fireCd -= dt
      if (s.mouse && s.fireCd <= 0 && s.energy >= w.cost) {
        const spread = g.weapon === 'pulse' ? [-0.2, 0, 0.2] : [0]
        spread.forEach((a) => { tmp.copy(s.aim).applyAxisAngle(new THREE.Vector3(0, 1, 0), a); spawnShot(s.pShots, s.pos.clone().addScaledVector(tmp, 0.8), tmp, w.speed, w.dmg, w.r) })
        s.energy -= w.cost; s.fireCd = w.rate
      } else {
        s.energy = Math.min(100, s.energy + (s.mouse ? 7 : 22) * dt)
      }
      if (s.sinceHit > 3) s.shield = Math.min(100, s.shield + 12 * dt)

      const damage = (n: number) => {
        if (s.inv > 0) return
        const a = Math.min(s.shield, n); s.shield -= a; n -= a; s.hp = Math.max(0, s.hp - n)
        s.sinceHit = 0; s.shake = 0.2; s.flash = 0.25
      }

      // relay terminal
      if (s.stage === 0) {
        if (k.e && s.pos.distanceTo(TERMINAL) < 2.6) s.relay = Math.min(100, s.relay + 45 * dt)
        if (s.relay >= 100) { s.stage = 1; s.objective = 'Eliminate all hostiles'; s.flash = 0.3 }
      }

      // enemies
      s.enemies.forEach((e) => {
        if (!e.alive) return
        e.hit = Math.max(0, e.hit - dt)
        const dist = e.pos.distanceTo(s.pos)
        if (!e.active) {
          if (e.type === 'sentinel' ? s.stage === 2 : dist < 15) e.active = true
          else return
        }
        const keep = e.type === 'scout' ? 1.2 : e.type === 'guardian' ? 6 : 8
        const speed = e.type === 'scout' ? 3.4 : e.type === 'guardian' ? 1.8 : e.phase ? 2.2 : 1.3
        tmp.set(s.pos.x - e.pos.x, 0, s.pos.z - e.pos.z).normalize()
        if (dist > keep) e.pos.addScaledVector(tmp, speed * dt)
        else if (dist < keep - 1.2 && e.type !== 'scout') e.pos.addScaledVector(tmp, -speed * dt)
        e.pos.x = THREE.MathUtils.clamp(e.pos.x, -6, 6)
        e.cd -= dt
        if (e.cd <= 0) {
          if (e.type === 'scout') { if (dist < 1.8) { damage(6); e.cd = 0.8 } }
          else if (e.type === 'guardian') { spawnShot(s.eShots, e.pos, tmp, 9, 8, 0.22, 3); e.cd = 1.7 }
          else {
            const n = e.phase ? 5 : 3
            for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) * 0.28; const d = tmp.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), a); spawnShot(s.eShots, e.pos, d, e.phase ? 10 : 8, 10, 0.28, 3.4) }
            e.cd = e.phase ? 1 : 1.5
          }
        }
      })

      // player shots
      s.pShots.forEach((sh) => {
        if (!sh.on) return
        sh.pos.addScaledVector(sh.vel, dt); sh.life -= dt
        if (sh.life <= 0 || Math.abs(sh.pos.x) > 9) { sh.on = false; return }
        for (const e of s.enemies) {
          if (!e.alive || !e.active) continue
          if (Math.hypot(sh.pos.x - e.pos.x, sh.pos.z - e.pos.z) < RADIUS[e.type] + sh.r) {
            e.hp -= sh.dmg; e.hit = 0.15; sh.on = false
            if (e.type === 'sentinel' && e.hp < e.max / 2) e.phase = 1
            if (e.hp <= 0) { e.alive = false; s.shake = e.type === 'sentinel' ? 0.8 : 0.15 }
            break
          }
        }
      })
      // enemy shots
      s.eShots.forEach((sh) => {
        if (!sh.on) return
        sh.pos.addScaledVector(sh.vel, dt); sh.life -= dt
        if (sh.life <= 0 || Math.abs(sh.pos.x) > 9) { sh.on = false; return }
        if (Math.hypot(sh.pos.x - s.pos.x, sh.pos.z - s.pos.z) < 0.6 + sh.r) { sh.on = false; damage(sh.dmg) }
      })

      const small = s.enemies.filter((e) => e.type !== 'sentinel')
      const boss = s.enemies[s.enemies.length - 1]
      if (s.stage === 1 && small.every((e) => !e.alive)) { s.stage = 2; s.objective = 'Destroy the Reactor Sentinel' }
      if (!boss.alive && !s.done) { s.done = 'win'; window.setTimeout(() => useGame.setState({ screen: 'victory' }), 1200) }
      if (s.hp <= 0 && !s.done) { s.done = 'lose'; window.setTimeout(() => useGame.setState({ screen: 'gameover' }), 900) }

      s.tick += dt
      if (s.tick > 0.1) {
        s.tick = 0
        useGame.setState({
          hp: Math.round(s.hp), shield: Math.round(s.shield), energy: s.energy, objective: s.objective,
          progress: s.stage === 0 ? s.relay : s.stage === 1 ? (small.filter((e) => !e.alive).length / small.length) * 100 : 100,
          hostiles: small.filter((e) => e.alive).length, bossOn: s.stage === 2 && boss.alive, bossHp: Math.max(0, boss.hp), bossMax: boss.max, bossPhase: boss.phase,
        })
      }
    }

    // visuals
    s.flash = Math.max(0, s.flash - dt)
    if (pRef.current) {
      pRef.current.position.copy(s.pos)
      pRef.current.rotation.y = s.face
      pRef.current.visible = !(s.inv > 0 && Math.floor(performance.now() / 60) % 2 === 0)
    }
    if (termRef.current) {
      const m = termRef.current.material as THREE.MeshBasicMaterial
      m.color.set(s.stage > 0 ? palette.green : palette.amber)
      termRef.current.scale.y = 1 + Math.sin(performance.now() * 0.004) * 0.08
    }
    camTarget.set(s.pos.x * 0.6, 6.4, s.pos.z + 8.5)
    state.camera.position.lerp(camTarget, Math.min(1, dt * 4))
    if (s.shake > 0) { state.camera.position.x += (Math.random() - 0.5) * s.shake; state.camera.position.y += (Math.random() - 0.5) * s.shake * 0.6 }
    state.camera.lookAt(s.pos.x * 0.6, 0.8, s.pos.z - 4.5)
  })

  return <>
    <color attach="background" args={['#050813']} />
    <ambientLight intensity={.5} color="#7898ff" /><directionalLight castShadow position={[5, 10, 4]} intensity={2.6} color="#bcdcff" />
    <Stars radius={55} depth={35} count={900} factor={1.7} saturation={.2} fade speed={.3} />
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -.06, -16]}><planeGeometry args={[18, 66]} /><meshStandardMaterial color="#0f1730" metalness={.5} roughness={.6} /></mesh>
    {columns.map((i) => <group key={i} position={[i % 2 ? -6.7 : 6.7, 0, -Math.floor(i / 2) * 4 + 2]}><mesh position={[0, 1.6, 0]}><boxGeometry args={[1.5, 3.2, 1.1]} /><meshStandardMaterial color="#141e35" metalness={.75} roughness={.3} /></mesh><mesh position={[i % 2 ? .76 : -.76, 1.7, 0]}><boxGeometry args={[.03, 2.1, .7]} /><meshBasicMaterial color={i % 3 ? palette.cyan : palette.violet} toneMapped={false} /></mesh></group>)}
    <mesh ref={termRef} position={[TERMINAL.x, .7, TERMINAL.z]}><cylinderGeometry args={[.5, .65, 1.4, 12]} /><meshBasicMaterial color={palette.amber} toneMapped={false} /></mesh>
    <mesh position={[TERMINAL.x, .02, TERMINAL.z]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.3, 2.6, 40]} /><meshBasicMaterial color={palette.cyan} toneMapped={false} transparent opacity={.6} /></mesh>
    <mesh position={[0, 3, -25]}><torusGeometry args={[4.5, .08, 8, 64]} /><meshBasicMaterial color={palette.red} toneMapped={false} /></mesh>
    {sim.enemies.map((e) => <EnemyMesh key={e.id} enemy={e} sim={sim} />)}
    {sim.pShots.map((sh, i) => <ShotMesh key={`p${i}`} shot={sh} color={palette.cyan} />)}
    {sim.eShots.map((sh, i) => <ShotMesh key={`e${i}`} shot={sh} color={palette.red} />)}
    <Player gref={pRef} />
  </>
}

function Scene({ sim }: { sim: Sim }) {
  return <div className="scene-wrap"><Canvas shadows camera={{ position: [0, 6.4, 11.5], fov: 55 }}><World sim={sim} /><EffectComposer><Bloom intensity={1} luminanceThreshold={.25} mipmapBlur /><Vignette darkness={.8} eskil={false} /></EffectComposer></Canvas></div>
}

function Menu(){const set=useGame(s=>s.set); return <main className="menu"><div className="menu-stars"/><div className="brand">SFP<span>//</span>07</div><div className="menu-hero"><p className="eyebrow">COLONY DEFENSE NETWORK / 2189</p><h1>STARFALL<br/><em>PROTOCOL</em></h1><p className="tagline">The colony went dark. You are the last active signal.</p><button className="btn primary" onClick={()=>useGame.getState().start()}>DEPLOY TO ECHO-9 <b>↗</b></button></div><div className="menu-footer"><span>BUILD 0.9.7 // ORBITAL SYSTEMS</span><span>WASD MOVE · MOUSE AIM · CLICK FIRE · Q DODGE · 1-3 WEAPONS · HOLD E AT TERMINAL</span></div><div className="menu-orbit"/></main>}

function Hud({onPause}:{onPause:()=>void}){const g=useGame(); return <div className="hud"><div className="hud-top"><div className="status"><div className="agent"><span className="agent-icon">✦</span><div><b>R-17 // AURORA</b><small>EXPLORER FRAME / ONLINE</small></div></div><div className="meters"><label>VITALS <i><b style={{width:`${g.hp}%`}}/></i><strong>{g.hp}</strong></label><label>SHIELD <i className="shield"><b style={{width:`${g.shield}%`}}/></i><strong>{g.shield}</strong></label></div></div><button className="pause" onClick={onPause}>PAUSE <span>ESC</span></button></div><div className="objective"><span>PRIMARY OBJECTIVE</span><b>{g.objective}</b><i><em style={{width:`${g.progress}%`}}/></i></div><div className="reticle" id="reticle"><i/><i/><i/><i/><b/></div><div className="weapon-panel"><div className="weapon-energy"><span>ENERGY CELL</span><strong>{Math.round(g.energy)}%</strong><i><b style={{width:`${g.energy}%`}}/></i></div><div className="weapons"><button className={g.weapon==='blaster'?'selected':''} onClick={()=>g.set({weapon:'blaster'})}><small>01</small>ARC BLASTER</button><button className={g.weapon==='plasma'?'selected':''} onClick={()=>g.set({weapon:'plasma'})}><small>02</small>PLASMA LANCE</button><button className={g.weapon==='pulse'?'selected':''} onClick={()=>g.set({weapon:'pulse'})}><small>03</small>ION PULSE</button></div></div>{g.bossOn&&<div className="boss"><span>REACTOR SENTINEL // PHASE {g.bossPhase+1}</span><i><b style={{width:`${g.bossHp/g.bossMax*100}%`}}/></i></div>}</div>}

function Mission() {
  const g = useGame()
  const sim = useMemo(() => newSim(), [])
  useEffect(() => {
    const key = (e: KeyboardEvent, down: boolean) => {
      const k = e.key.toLowerCase()
      if (k.startsWith('arrow') || k === ' ') e.preventDefault()
      sim.keys[k] = down
      if (!down || e.repeat) return
      const st = useGame.getState()
      if (k === 'escape') st.set({ paused: !st.paused })
      if (k === '1') st.set({ weapon: 'blaster' })
      if (k === '2') st.set({ weapon: 'plasma' })
      if (k === '3') st.set({ weapon: 'pulse' })
      if (k === 'q' && sim.dashCd <= 0 && !st.paused && !sim.done) {
        const mx = (sim.keys.d ? 1 : 0) - (sim.keys.a ? 1 : 0), mz = (sim.keys.s ? 1 : 0) - (sim.keys.w ? 1 : 0)
        if (mx || mz) sim.dashDir.set(mx, 0, mz).normalize(); else sim.dashDir.copy(sim.aim).multiplyScalar(-1)
        sim.dashT = 0.2; sim.dashCd = 1.2; sim.inv = 0.35
      }
    }
    const kd = (e: KeyboardEvent) => key(e, true), ku = (e: KeyboardEvent) => key(e, false)
    const md = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('button')) sim.mouse = true }
    const mu = () => { sim.mouse = false }
    const mm = (e: MouseEvent) => { const r = document.getElementById('reticle'); if (r) { r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px' } }
    const blur = () => { sim.keys = {}; sim.mouse = false }
    addEventListener('keydown', kd); addEventListener('keyup', ku); addEventListener('mousedown', md); addEventListener('mouseup', mu); addEventListener('mousemove', mm); addEventListener('blur', blur)
    return () => { removeEventListener('keydown', kd); removeEventListener('keyup', ku); removeEventListener('mousedown', md); removeEventListener('mouseup', mu); removeEventListener('mousemove', mm); removeEventListener('blur', blur) }
  }, [sim])
  return <main className="mission"><Scene sim={sim} /><Hud onPause={() => g.set({ paused: !g.paused })} /><div className="zone-chip">ZONE 01 <span>ORBITAL FACILITY</span></div><div className="enemy-counter">HOSTILES <b>{g.hostiles.toString().padStart(2, '0')}</b> / 06</div>{g.paused && <div className="pause-overlay"><p className="eyebrow">SYSTEM PAUSED</p><h2>Hold position.</h2><button className="btn primary" onClick={() => g.set({ paused: false })}>RESUME MISSION</button><button className="btn ghost" onClick={() => g.start()}>RESTART MISSION</button><button className="btn ghost" onClick={() => g.reset()}>ABORT TO TITLE</button></div>}</main>
}

function End({ victory }: { victory: boolean }) {
  const g = useGame()
  return <main className="end"><div className="end-grid" /><p className="eyebrow">MISSION {victory ? 'COMPLETE' : 'FAILED'} // ECHO-9</p><h1>{victory ? 'THE COLONY' : 'SIGNAL LOST'}</h1><p>{victory ? 'Power restored. The stars are listening again.' : 'Aurora frame offline. The protocol can still be restarted.'}</p><button className="btn primary" onClick={() => (victory ? g.reset() : g.start())}>{victory ? 'RETURN TO TITLE' : 'RETRY MISSION'} <b>↗</b></button>{!victory && <button className="btn ghost" onClick={() => g.reset()}>TITLE</button>}</main>
}

export default function App() { const screen = useGame((s) => s.screen), runId = useGame((s) => s.runId); if (screen === 'menu') return <Menu />; if (screen === 'mission') return <Mission key={runId} />; return <End victory={screen === 'victory'} /> }
