// Deterministic terrain elevation function shared across environment, gameplay, and character systems
function hash(n: number): number {
  const x = Math.sin(n) * 43758.5453123
  return x - Math.floor(x)
}

function noise2D(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const n00 = hash(ix + iy * 57.0)
  const n10 = hash(ix + 1 + iy * 57.0)
  const n01 = hash(ix + (iy + 1) * 57.0)
  const n11 = hash(ix + 1 + (iy + 1) * 57.0)
  return (
    n00 * (1 - ux) * (1 - uy) +
    n10 * ux * (1 - uy) +
    n01 * (1 - ux) * uy +
    n11 * ux * uy
  )
}

function fbm(x: number, y: number, octaves = 6): number {
  let value = 0
  let amplitude = 0.5
  let frequency = 1
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2D(x * frequency, y * frequency)
    amplitude *= 0.5
    frequency *= 2.1
  }
  return value
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/**
 * Returns the exact terrain height at world coordinate (wx, wz).
 * World coordinates span from -100 to +100 in X and Z.
 */
export function getTerrainHeight(wx: number, wz: number): number {
  const nx = (wx + 100) / 200
  const nz = (wz + 100) / 200

  // Zone weights based on X coordinate
  const forestW = smoothstep(0.5, 0.2, nx)           // left side: forest
  const crystalW = 1 - Math.abs(nx - 0.45) / 0.25    // center: crystal valley
  const crystalWc = Math.max(0, Math.min(1, crystalW))
  const sanctuaryW = smoothstep(0.55, 0.85, nx)       // right side: sanctuary plateau

  // Height functions per zone
  const forestH = fbm(nx * 3 + 10, nz * 3 + 10, 5) * 8 - 1
  const crystalH = fbm(nx * 5 + 40, nz * 5 + 40, 6) * 12 - 2
  const sanctuaryH =
    smoothstep(0.0, 0.4, nz) * 12 + fbm(nx * 2 + 80, nz * 2 + 80, 4) * 3

  let height =
    forestH * forestW + crystalH * crystalWc + sanctuaryH * sanctuaryW

  // Gentle boundary walls
  const distFromCenter = Math.sqrt(wx * wx + wz * wz)
  if (distFromCenter > 85) {
    const edgeRise = Math.pow((distFromCenter - 85) / 15, 2) * 20
    height += edgeRise
  }

  return Math.max(0.5, height)
}
