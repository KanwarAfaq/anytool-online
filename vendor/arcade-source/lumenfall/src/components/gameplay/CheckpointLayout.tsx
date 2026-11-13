import { useMemo } from 'react'
import { Checkpoint } from './Checkpoint'
import { getTerrainHeight } from '@/utils/terrainHeight'

const RAW_CHECKPOINTS = [
  { id: 'checkpoint_forest', x: -30, z: 5 },
  { id: 'checkpoint_valley', x: 15, z: 10 },
  { id: 'checkpoint_sanctuary', x: 65, z: 20 },
]

export function CheckpointLayout() {
  const checkpoints = useMemo(() => {
    return RAW_CHECKPOINTS.map((cp) => {
      const y = getTerrainHeight(cp.x, cp.z)
      return {
        id: cp.id,
        position: [cp.x, y, cp.z] as [number, number, number],
      }
    })
  }, [])

  return (
    <>
      {checkpoints.map((cp) => (
        <Checkpoint key={cp.id} id={cp.id} position={cp.position} />
      ))}
    </>
  )
}

export default CheckpointLayout
