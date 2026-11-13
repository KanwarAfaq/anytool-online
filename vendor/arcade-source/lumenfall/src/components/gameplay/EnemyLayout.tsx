import { useState, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { Enemy } from './Enemy'
import { getTerrainHeight } from '@/utils/terrainHeight'

interface EnemyDef {
  id: string
  type: 'guardian' | 'shade'
  startPos: [number, number, number]
  patrolPoints: THREE.Vector3[]
}

export function EnemyLayout() {
  const [aliveMap, setAliveMap] = useState<Record<string, boolean>>({
    enemy_forest_0: true,
    enemy_forest_1: true,
    enemy_valley_0: true,
    enemy_valley_1: true,
    enemy_valley_2: true,
    enemy_sanctuary_0: true,
    enemy_sanctuary_1: true,
  })

  const handleDefeated = useCallback((id: string) => {
    setAliveMap((prev) => ({ ...prev, [id]: false }))
  }, [])

  const enemies = useMemo<EnemyDef[]>(() => {
    const makePoint = (x: number, z: number) => {
      const y = getTerrainHeight(x, z)
      return new THREE.Vector3(x, y, z)
    }

    return [
      // Forest Guardians
      {
        id: 'enemy_forest_0',
        type: 'guardian',
        startPos: [-42, getTerrainHeight(-42, -8), -8],
        patrolPoints: [
          makePoint(-42, -8),
          makePoint(-50, -4),
          makePoint(-48, 4),
          makePoint(-38, 0),
        ],
      },
      {
        id: 'enemy_forest_1',
        type: 'guardian',
        startPos: [-36, getTerrainHeight(-36, 16), 16],
        patrolPoints: [
          makePoint(-36, 16),
          makePoint(-46, 22),
          makePoint(-40, 26),
        ],
      },

      // Crystal Valley Shades
      {
        id: 'enemy_valley_0',
        type: 'shade',
        startPos: [14, getTerrainHeight(14, 4), 4],
        patrolPoints: [
          makePoint(14, 4),
          makePoint(22, -6),
          makePoint(18, 12),
        ],
      },
      {
        id: 'enemy_valley_1',
        type: 'shade',
        startPos: [26, getTerrainHeight(26, -12), -12],
        patrolPoints: [
          makePoint(26, -12),
          makePoint(34, -4),
          makePoint(30, -18),
        ],
      },
      {
        id: 'enemy_valley_2',
        type: 'shade',
        startPos: [22, getTerrainHeight(22, 24), 24],
        patrolPoints: [
          makePoint(22, 24),
          makePoint(32, 18),
          makePoint(28, 30),
        ],
      },

      // Sanctuary Gate Guardians
      {
        id: 'enemy_sanctuary_0',
        type: 'guardian',
        startPos: [66, getTerrainHeight(66, 14), 14],
        patrolPoints: [
          makePoint(66, 14),
          makePoint(72, 10),
          makePoint(70, 20),
        ],
      },
      {
        id: 'enemy_sanctuary_1',
        type: 'guardian',
        startPos: [68, getTerrainHeight(68, 26), 26],
        patrolPoints: [
          makePoint(68, 26),
          makePoint(74, 28),
          makePoint(72, 20),
        ],
      },
    ]
  }, [])

  return (
    <>
      {enemies.map((e) => {
        if (!aliveMap[e.id]) return null
        return (
          <Enemy
            key={e.id}
            id={e.id}
            type={e.type}
            startPosition={e.startPos}
            patrolPoints={e.patrolPoints}
            onDefeated={handleDefeated}
          />
        )
      })}
    </>
  )
}

export default EnemyLayout
