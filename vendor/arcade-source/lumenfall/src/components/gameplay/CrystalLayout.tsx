import { useEffect, useMemo } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { CrystalCollectible } from './CrystalCollectible'
import { getTerrainHeight } from '@/utils/terrainHeight'

interface CrystalDef {
  id: string
  x: number
  z: number
  region: 'forest' | 'crystal_valley' | 'sanctuary'
}

const RAW_CRYSTALS: CrystalDef[] = [
  // Forest — 3 crystals near ancient ruins & tree groves
  { id: 'crystal_forest_0', x: -38, z: -12, region: 'forest' },
  { id: 'crystal_forest_1', x: -52, z: 8,   region: 'forest' },
  { id: 'crystal_forest_2', x: -30, z: 20,  region: 'forest' },

  // Crystal Valley — 4 crystals embedded among crystal spires
  { id: 'crystal_valley_0', x: 12,  z: 6,   region: 'crystal_valley' },
  { id: 'crystal_valley_1', x: 24,  z: -10, region: 'crystal_valley' },
  { id: 'crystal_valley_2', x: 18,  z: 22,  region: 'crystal_valley' },
  { id: 'crystal_valley_3', x: 36,  z: 14,  region: 'crystal_valley' },

  // Sanctuary Approach & Dais — 2 crystals
  { id: 'crystal_sanctuary_0', x: 62, z: 18, region: 'sanctuary' },
  { id: 'crystal_sanctuary_1', x: 74, z: 12, region: 'sanctuary' },
]

export function CrystalLayout() {
  const collectedCrystals = useGameStore((s) => s.collectedCrystals)
  const initCrystals = useGameStore((s) => s.initCrystals)

  const crystals = useMemo(() => {
    return RAW_CRYSTALS.map((c) => {
      const y = getTerrainHeight(c.x, c.z) + 1.4 // Float gracefully above terrain
      return {
        id: c.id,
        position: [c.x, y, c.z] as [number, number, number],
      }
    })
  }, [])

  useEffect(() => {
    initCrystals(crystals.map((c) => c.id))
  }, [crystals, initCrystals])

  return (
    <>
      {crystals.map((crystal) => {
        if (collectedCrystals && collectedCrystals.has(crystal.id)) return null
        return (
          <CrystalCollectible
            key={crystal.id}
            id={crystal.id}
            position={crystal.position}
          />
        )
      })}
    </>
  )
}

export default CrystalLayout
