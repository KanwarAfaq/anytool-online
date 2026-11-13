import { useEffect, useRef } from 'react'

export interface KeyboardState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  sprint: boolean
  jump: boolean
  interact: boolean
  attack: boolean
  pause: boolean
  map: boolean
}

const KEY_MAP: Record<string, keyof KeyboardState> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  ShiftLeft: 'sprint',
  ShiftRight: 'sprint',
  Space: 'jump',
  KeyE: 'interact',
  Escape: 'pause',
  KeyM: 'map',
}

export function useKeyboard(): KeyboardState {
  const keysRef = useRef<KeyboardState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    jump: false,
    interact: false,
    attack: false,
    pause: false,
    map: false,
  })

  // We return a stable proxy that always reads from the ref so callers
  // always get the live state without triggering re-renders.
  const stateProxy = useRef<KeyboardState>(
    new Proxy(keysRef.current, {
      get(_target, prop: string) {
        return keysRef.current[prop as keyof KeyboardState]
      },
      set(_target, prop: string, value: boolean) {
        keysRef.current[prop as keyof KeyboardState] = value
        return true
      },
    })
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser shortcuts only for game-relevant keys
      if (e.code === 'Space' || e.code === 'KeyM') e.preventDefault()
      const action = KEY_MAP[e.code]
      if (action) keysRef.current[action] = true
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const action = KEY_MAP[e.code]
      if (action) keysRef.current[action] = false
    }

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) keysRef.current.attack = true
    }
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 0) keysRef.current.attack = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return stateProxy.current
}
