import { useCallback, useEffect, useRef, useState } from 'react'

export interface MouseDelta {
  dx: number
  dy: number
}

export interface PointerLockState {
  isLocked: boolean
  lock: (element?: HTMLElement) => void
  unlock: () => void
  /** Consumes and returns accumulated mouse delta since last call */
  getDelta: () => MouseDelta
}

export function usePointerLock(): PointerLockState {
  const [isLocked, setIsLocked] = useState(false)
  const accumulatedDelta = useRef<MouseDelta>({ dx: 0, dy: 0 })

  // ── Pointer-lock change listener ────────────────────────────────────────
  useEffect(() => {
    const onLockChange = () => {
      const locked = document.pointerLockElement !== null
      setIsLocked(locked)
      if (!locked) {
        // Clear stale delta when lock is released
        accumulatedDelta.current = { dx: 0, dy: 0 }
      }
    }

    const onLockError = () => {
      console.warn('[usePointerLock] Pointer lock request failed')
      setIsLocked(false)
    }

    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('pointerlockerror', onLockError)

    return () => {
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('pointerlockerror', onLockError)
    }
  }, [])

  // ── Mouse-move accumulation ──────────────────────────────────────────────
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === null) return
      accumulatedDelta.current.dx += e.movementX
      accumulatedDelta.current.dy += e.movementY
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  // ── Public API ───────────────────────────────────────────────────────────
  const lock = useCallback((element?: HTMLElement) => {
    const target = element ?? document.documentElement
    if (document.pointerLockElement === target) return
    target.requestPointerLock()
  }, [])

  const unlock = useCallback(() => {
    if (document.pointerLockElement !== null) {
      document.exitPointerLock()
    }
  }, [])

  const getDelta = useCallback((): MouseDelta => {
    const delta = { ...accumulatedDelta.current }
    accumulatedDelta.current = { dx: 0, dy: 0 }
    return delta
  }, [])

  return { isLocked, lock, unlock, getDelta }
}
