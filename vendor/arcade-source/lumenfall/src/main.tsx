import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'
import { useGameStore } from './stores/gameStore'

if (typeof window !== 'undefined') {
  ;(window as any).__GAME_STORE__ = useGameStore
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
