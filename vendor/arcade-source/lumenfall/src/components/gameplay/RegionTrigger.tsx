import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useGameStore } from '@/stores/gameStore'

type Region = 'forest' | 'crystal_valley' | 'sanctuary'

interface RegionDef {
  id: Region
  label: string
  center: [number, number, number]
  // Half-extents of the AABB trigger volume
  halfExtents: [number, number, number]
  bannerColor: string
  bannerBorder: string
}

const REGIONS: RegionDef[] = [
  {
    id: 'forest',
    label: 'The Verdant Ruins',
    center: [-44, 1, 8],
    halfExtents: [22, 10, 22],
    bannerColor: 'rgba(0,20,5,0.88)',
    bannerBorder: '#44ff88',
  },
  {
    id: 'crystal_valley',
    label: 'Crystal Valley',
    center: [18, 1, -22],
    halfExtents: [20, 10, 18],
    bannerColor: 'rgba(0,10,25,0.88)',
    bannerBorder: '#44aaff',
  },
  {
    id: 'sanctuary',
    label: 'The Radiant Sanctuary',
    center: [0, 1, 48],
    halfExtents: [20, 10, 18],
    bannerColor: 'rgba(20,10,0,0.88)',
    bannerBorder: '#ffcc44',
  },
]

function inAABB(
  px: number, py: number, pz: number,
  cx: number, cy: number, cz: number,
  hx: number, hy: number, hz: number
): boolean {
  return (
    Math.abs(px - cx) < hx &&
    Math.abs(py - cy) < hy &&
    Math.abs(pz - cz) < hz
  )
}

// Banner shown when entering a region
function RegionBanner({
  label,
  color,
  border,
  visible,
}: {
  label: string
  color: string
  border: string
  visible: boolean
}) {
  const opacity = useRef(0)
  const [styleOpacity, setStyleOpacity] = useState(0)

  useEffect(() => {
    if (visible) {
      opacity.current = 1
      setStyleOpacity(1)
      const t = setTimeout(() => {
        setStyleOpacity(0)
      }, 2800)
      return () => clearTimeout(t)
    } else {
      setStyleOpacity(0)
    }
  }, [visible])

  if (styleOpacity === 0 && !visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: color,
        border: `1px solid ${border}`,
        borderRadius: 10,
        padding: '10px 28px',
        color: border,
        fontFamily: 'Georgia, serif',
        fontSize: 22,
        letterSpacing: 2,
        whiteSpace: 'nowrap',
        boxShadow: `0 0 30px ${border}55`,
        opacity: styleOpacity,
        transition: 'opacity 0.7s ease',
        pointerEvents: 'none',
        zIndex: 999,
      }}
    >
      ◈ {label} ◈
    </div>
  )
}

// A single invisible trigger volume with debug wireframe option
function TriggerVolume({
  region,
  onEnter,
}: {
  region: RegionDef
  onEnter: () => void
}) {
  const triggered = useRef(false)
  const playerPosition = useGameStore((s) => s.playerPosition)

  useFrame(() => {
    const inside = inAABB(
      playerPosition[0], playerPosition[1], playerPosition[2],
      region.center[0], region.center[1], region.center[2],
      region.halfExtents[0], region.halfExtents[1], region.halfExtents[2]
    )
    if (inside && !triggered.current) {
      triggered.current = true
      onEnter()
    } else if (!inside) {
      triggered.current = false
    }
  })

  // Invisible — just logic. Uncomment the mesh below for debug view.
  return null
  /*
  return (
    <mesh position={region.center}>
      <boxGeometry args={region.halfExtents.map(h => h * 2) as [number, number, number]} />
      <meshStandardMaterial color="blue" wireframe transparent opacity={0.1} />
    </mesh>
  )
  */
}

export function RegionTrigger() {
  const setCurrentRegion = useGameStore((s) => s.setCurrentRegion)
  const [activeRegion, setActiveRegion] = useState<Region | null>(null)
  const [bannerVisible, setBannerVisible] = useState(false)
  const bannerRegion = useRef<RegionDef | null>(null)

  const handleEnter = (region: RegionDef) => {
    setCurrentRegion(region.id)
    setActiveRegion(region.id)
    bannerRegion.current = region
    setBannerVisible(true)
    setTimeout(() => setBannerVisible(false), 3000)
  }

  const currentBanner = bannerRegion.current

  return (
    <>
      {REGIONS.map((region) => (
        <TriggerVolume
          key={region.id}
          region={region}
          onEnter={() => handleEnter(region)}
        />
      ))}

      {currentBanner && (
        <Html fullscreen>
          <RegionBanner
            label={currentBanner.label}
            color={currentBanner.bannerColor}
            border={currentBanner.bannerBorder}
            visible={bannerVisible}
          />
        </Html>
      )}
    </>
  )
}
