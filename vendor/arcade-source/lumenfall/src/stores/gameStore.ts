import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import * as THREE from 'three'
import { getTerrainHeight } from '@/utils/terrainHeight'

export type GameScreen =
  | 'mainMenu'
  | 'mainmenu'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'victory'
  | 'defeat'
  | 'controls'
  | 'credits'

export type QualityPreset = 'low' | 'medium' | 'high' | 'ultra' | 'Low' | 'Medium' | 'High' | 'Ultra'
export type GameRegion = 'forest' | 'crystal' | 'sanctuary'

export class GameVector3 extends THREE.Vector3 {
  [index: number]: number
  constructor(x = 0, y = 0, z = 0) {
    super(x, y, z)
    this[0] = x
    this[1] = y
    this[2] = z
  }

  set(x: number, y: number, z: number) {
    super.set(x, y, z)
    this[0] = x
    this[1] = y
    this[2] = z
    return this
  }

  clone(): this {
    return new GameVector3(this.x, this.y, this.z) as this
  }
}

export interface Crystal {
  id: string
  position: GameVector3 | [number, number, number]
  collected: boolean
}

export interface Checkpoint {
  id: string
  position: GameVector3 | [number, number, number]
  activated: boolean
}

export interface Settings {
  masterVolume: number
  musicVolume: number
  sfxVolume: number
  mouseSensitivity: number
  quality: QualityPreset
  fullscreen: boolean
  reducedMotion: boolean
}

const REGION_NAMES: Record<string, string> = {
  forest: 'The Forgotten Forest',
  crystal: 'Crystal Valley',
  sanctuary: 'The Ancient Sanctuary',
}

interface GameState {
  // Screen management
  screen: GameScreen
  setScreen: (screen: GameScreen) => void

  // Health
  health: number
  maxHealth: number
  hp: number
  maxHp: number
  takeDamage: (amount: number) => void
  dealPlayerDamage: (amount: number) => void
  heal: (amount: number) => void
  healPlayer: (amount: number) => void
  respawn: () => void
  isDead: boolean
  isInvincible: boolean
  setInvincible: (v: boolean) => void

  // Combat
  isPlayerAttacking: boolean
  setPlayerAttacking: (v: boolean) => void
  inCombat: boolean
  setInCombat: (v: boolean) => void
  registerEnemy?: (id: string, takeDamage: (dmg: number) => void) => () => void

  // Crystals
  crystals: Crystal[]
  collectedCrystals: Set<string>
  crystalPositions: [number, number, number][]
  crystalsCollected: number
  totalCrystals: number
  collectCrystal: (id: string) => void
  initCrystals: (crystals: Crystal[] | string[]) => void

  // Checkpoints
  checkpoints: Checkpoint[]
  lastCheckpointPosition: GameVector3
  activateCheckpoint: (id: string, position: THREE.Vector3 | [number, number, number]) => void
  initCheckpoints: (checkpoints: Checkpoint[]) => void

  // Player position
  playerPosition: GameVector3
  setPlayerPosition: (pos: THREE.Vector3 | [number, number, number]) => void

  // Regions & objectives
  currentRegion: GameRegion
  regionName: string
  setRegion: (region: GameRegion) => void
  setCurrentRegion: (region: string) => void
  objectiveText: string
  currentObjective: string
  setObjectiveText: (text: string) => void

  // Portal & completion
  portalActivated: boolean
  levelComplete: boolean
  gameStartTime: number
  gameEndTime: number
  elapsedSeconds: number
  tryActivatePortal: () => void
  completeLevel: () => void

  // Game flow
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  restartGame: () => void
  restartLevel: () => void

  // Settings
  settings: Settings
  updateSettings: (partial: Partial<Settings> | any) => void

  // UI Hints
  interactionHint: string
  setInteractionHint: (hint: string) => void
}

const DEFAULT_SETTINGS: Settings = {
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  mouseSensitivity: 0.003,
  quality: detectDefaultQuality(),
  fullscreen: false,
  reducedMotion: false,
}

function detectDefaultQuality(): QualityPreset {
  if (typeof navigator === 'undefined') return 'medium'
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
  if (!gl) return 'low'
  const ext = (gl as WebGLRenderingContext).getExtension?.('WEBGL_debug_renderer_info')
  if (ext) {
    const renderer = (gl as WebGLRenderingContext).getParameter(
      (ext as any).UNMASKED_RENDERER_WEBGL as GLenum
    ) as string
    if (/RTX|Radeon RX 6|RX 7|M[123] Max|M[123] Pro/i.test(renderer)) return 'ultra'
    if (/GTX|Radeon|Intel Iris/i.test(renderer)) return 'medium'
  }
  return 'medium'
}

const SPAWN_POS = new GameVector3(0, getTerrainHeight(0, 0) + 1.2, 0)

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => {
    const enemies = new Map<string, (dmg: number) => void>()

    return {
      screen: 'mainMenu',
      setScreen: (screen) => {
        // Normalize screen key if needed
        const s = (screen === 'mainmenu' ? 'mainMenu' : screen) as GameScreen
        set({ screen: s })
      },

      health: 100,
      maxHealth: 100,
      hp: 100,
      maxHp: 100,

      takeDamage: (amount) =>
        set((state) => {
          if (state.isInvincible || state.isDead) return {}
          const health = Math.max(0, state.health - amount)
          return {
            health,
            hp: health,
            isDead: health <= 0,
          }
        }),

      dealPlayerDamage: (amount) => get().takeDamage(amount),

      heal: (amount) =>
        set((state) => {
          const health = Math.min(state.maxHealth, state.health + amount)
          return { health, hp: health }
        }),

      healPlayer: (amount) => get().heal(amount),

      respawn: () =>
        set((state) => ({
          health: state.maxHealth,
          hp: state.maxHealth,
          isDead: false,
          isInvincible: true,
          playerPosition: state.lastCheckpointPosition.clone(),
        })),

      isDead: false,
      isInvincible: false,
      setInvincible: (v) => set({ isInvincible: v }),

      isPlayerAttacking: false,
      setPlayerAttacking: (v) => set({ isPlayerAttacking: v }),
      inCombat: false,
      setInCombat: (v) => set({ inCombat: v }),

      registerEnemy: (id, takeDamage) => {
        enemies.set(id, takeDamage)
        return () => {
          enemies.delete(id)
        }
      },

      crystals: [],
      collectedCrystals: new Set<string>(),
      crystalPositions: [
        [-20, 2, -15],
        [-35, 3, 5],
        [-15, 2, 25],
        [15, 3, 0],
        [25, 4, -12],
        [32, 2, 18],
        [42, 5, 8],
        [75, 2, 15],
        [85, 3, 25],
      ],
      crystalsCollected: 0,
      totalCrystals: 9,

      collectCrystal: (id) =>
        set((state) => {
          const newSet = new Set(state.collectedCrystals)
          newSet.add(id)
          const crystals = state.crystals.map((c) =>
            c.id === id ? { ...c, collected: true } : c
          )
          const count = newSet.size
          return {
            crystals,
            collectedCrystals: newSet,
            crystalsCollected: count,
          }
        }),

      initCrystals: (input) => {
        if (!input || input.length === 0) return
        if (typeof input[0] === 'string') {
          const ids = input as string[]
          const crystals: Crystal[] = ids.map((id, i) => ({
            id,
            position: get().crystalPositions[i] || [0, 1, 0],
            collected: false,
          }))
          set({ crystals, totalCrystals: crystals.length })
        } else {
          const crystals = input as Crystal[]
          set({ crystals, totalCrystals: crystals.length })
        }
      },

      checkpoints: [],
      lastCheckpointPosition: SPAWN_POS.clone(),

      activateCheckpoint: (id, position) =>
        set((state) => {
          const pos =
            position instanceof THREE.Vector3
              ? new GameVector3(position.x, position.y, position.z)
              : new GameVector3(position[0], position[1], position[2])

          const checkpoints = state.checkpoints.map((c) =>
            c.id === id ? { ...c, activated: true } : c
          )
          return { checkpoints, lastCheckpointPosition: pos }
        }),

      initCheckpoints: (checkpoints) => set({ checkpoints }),

      playerPosition: SPAWN_POS.clone(),
      setPlayerPosition: (pos) => {
        if (pos instanceof THREE.Vector3) {
          get().playerPosition.set(pos.x, pos.y, pos.z)
        } else {
          get().playerPosition.set(pos[0], pos[1], pos[2])
        }
      },

      currentRegion: 'forest',
      regionName: 'The Forgotten Forest',

      setRegion: (region) => {
        const objectives: Record<GameRegion, string> = {
          forest: 'Explore the Forgotten Forest — collect ancient energy crystals',
          crystal: 'Navigate Crystal Valley — gather the glowing energy shards',
          sanctuary: 'Reach the Ancient Sanctuary and activate the final portal',
        }
        const text = objectives[region] || ''
        set({
          currentRegion: region,
          regionName: REGION_NAMES[region] || region,
          objectiveText: text,
          currentObjective: text,
        })
      },

      setCurrentRegion: (region) => {
        const r = region.toLowerCase()
        const reg: GameRegion = r.includes('sanctuary')
          ? 'sanctuary'
          : r.includes('crystal')
          ? 'crystal'
          : 'forest'
        get().setRegion(reg)
      },

      objectiveText: 'Explore the Forgotten Forest — collect ancient energy crystals',
      currentObjective: 'Explore the Forgotten Forest — collect ancient energy crystals',
      setObjectiveText: (text) => set({ objectiveText: text, currentObjective: text }),

      portalActivated: false,
      levelComplete: false,
      gameStartTime: 0,
      gameEndTime: 0,
      elapsedSeconds: 0,

      tryActivatePortal: () => {
        const { crystalsCollected, totalCrystals } = get()
        if (crystalsCollected >= totalCrystals) {
          set({ portalActivated: true })
          setTimeout(() => get().completeLevel(), 3000)
        }
      },

      completeLevel: () => {
        const now = Date.now()
        const start = get().gameStartTime || now
        const elapsedSeconds = Math.round((now - start) / 1000)
        set({
          screen: 'victory',
          levelComplete: true,
          gameEndTime: now,
          elapsedSeconds,
        })
      },

      startGame: () =>
        set({
          screen: 'playing',
          health: 100,
          maxHealth: 100,
          hp: 100,
          maxHp: 100,
          crystalsCollected: 0,
          collectedCrystals: new Set<string>(),
          portalActivated: false,
          levelComplete: false,
          isDead: false,
          isInvincible: false,
          currentRegion: 'forest',
          regionName: 'The Forgotten Forest',
          gameStartTime: Date.now(),
          gameEndTime: 0,
          elapsedSeconds: 0,
          lastCheckpointPosition: SPAWN_POS.clone(),
          objectiveText: 'Explore the Forgotten Forest — collect ancient energy crystals',
          currentObjective: 'Explore the Forgotten Forest — collect ancient energy crystals',
        }),

      pauseGame: () => set({ screen: 'paused' }),
      resumeGame: () => set({ screen: 'playing' }),

      restartGame: () => {
        set({
          screen: 'loading',
          health: 100,
          hp: 100,
          crystalsCollected: 0,
          collectedCrystals: new Set<string>(),
          portalActivated: false,
          levelComplete: false,
          isDead: false,
          isInvincible: false,
          currentRegion: 'forest',
          regionName: 'The Forgotten Forest',
          gameStartTime: 0,
          gameEndTime: 0,
          elapsedSeconds: 0,
          lastCheckpointPosition: SPAWN_POS.clone(),
          objectiveText: 'Explore the Forgotten Forest — collect ancient energy crystals',
          currentObjective: 'Explore the Forgotten Forest — collect ancient energy crystals',
        })
        setTimeout(() => get().startGame(), 1000)
      },

      restartLevel: () => get().restartGame(),

      settings: DEFAULT_SETTINGS,
      updateSettings: (partial) =>
        set((state) => {
          let quality = partial.quality ?? state.settings.quality
          if (typeof quality === 'string') {
            quality = quality.toLowerCase() as QualityPreset
          }
          return {
            settings: {
              ...state.settings,
              ...partial,
              quality,
            },
          }
        }),

      interactionHint: '',
      setInteractionHint: (hint) => set({ interactionHint: hint }),
    }
  })
)
