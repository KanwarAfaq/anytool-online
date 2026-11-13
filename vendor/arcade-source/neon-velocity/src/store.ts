import { create } from 'zustand'

export type Screen = 'menu' | 'garage' | 'tracks' | 'race' | 'results'
export type CameraMode = 'chase' | 'hood' | 'cockpit'

export const cars = [
  { id: 'vanta', name: 'VANTA R', class: 'HYPER', color: '#d8f4ff', accent: '#35d5ff', top: 94, accel: 89, grip: 78, nitro: 82 },
  { id: 'specter', name: 'SPECTER GT', class: 'GT', color: '#ff3c9c', accent: '#ff9fd2', top: 87, accel: 82, grip: 92, nitro: 70 },
  { id: 'apex', name: 'APEX 4S', class: 'SPORT', color: '#ffad3d', accent: '#ffe1a0', top: 91, accel: 95, grip: 70, nitro: 78 },
  { id: 'kairo', name: 'KAIRO X', class: 'RALLY', color: '#74f5b4', accent: '#caffdf', top: 84, accel: 78, grip: 97, nitro: 91 },
] as const

export const tracks = [
  { id: 'city', name: 'NEON CITY', location: 'TOKYO / 02:14 AM', laps: 3, length: '4.8 KM', tone: '#44d8ff', description: 'A midnight sprint through the electric core.' },
  { id: 'mountain', name: 'MOUNTAIN HIGHWAY', location: 'ALPINE PASS / 19:42 PM', laps: 2, length: '6.2 KM', tone: '#ffb35b', description: 'High-speed switchbacks above the clouds.' },
  { id: 'coast', name: 'COASTAL EXPRESSWAY', location: 'PACIFIC COAST / 20:06 PM', laps: 2, length: '5.6 KM', tone: '#ff5f89', description: 'Sunset, salt air, and a line of perfect corners.' },
] as const

type GameState = {
  screen: Screen
  carIndex: number
  trackIndex: number
  camera: CameraMode
  speed: number
  nitro: number
  lap: number
  position: number
  elapsed: number
  driftScore: number
  paused: boolean
  runId: number
  finishPos: number
  bestLap: number
  record: boolean
  set: (patch: Partial<GameState>) => void
  startRace: () => void
  resetRace: () => void
}

export const useGame = create<GameState>((set) => ({
  screen: 'menu', carIndex: 0, trackIndex: 0, camera: 'chase', speed: 0, nitro: 100,
  lap: 1, position: 4, elapsed: 0, driftScore: 0, paused: false, runId: 0, finishPos: 4, bestLap: 0, record: false,
  set: (patch) => set(patch),
  startRace: () => set((s) => ({ screen: 'race', speed: 0, nitro: 100, lap: 1, position: 4, elapsed: 0, driftScore: 0, paused: false, runId: s.runId + 1 })),
  resetRace: () => set((s) => ({ screen: 'race', speed: 0, nitro: 100, lap: 1, position: 4, elapsed: 0, driftScore: 0, paused: false, runId: s.runId + 1 })),
}))
