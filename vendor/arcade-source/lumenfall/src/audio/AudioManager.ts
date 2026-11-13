// Audio Manager — Web Audio API synthesized sounds
// All audio is synthesized procedurally (no external files)

let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null
let musicGain: GainNode | null = null
let sfxGain: GainNode | null = null

// Ambient music oscillators
let musicOscillators: OscillatorNode[] = []
let musicIntervalId: number | null = null

export function initAudio() {
  if (audioContext) return
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioCtx) return
  audioContext = new AudioCtx()
  masterGain = audioContext.createGain()
  musicGain = audioContext.createGain()
  sfxGain = audioContext.createGain()
  masterGain.gain.value = 0.7
  musicGain.gain.value = 0.4
  sfxGain.gain.value = 0.8
  musicGain.connect(masterGain)
  sfxGain.connect(masterGain)
  masterGain.connect(audioContext.destination)
  startAmbientMusic()
}

export function setMasterVolume(v: number) {
  if (masterGain && audioContext) {
    masterGain.gain.linearRampToValueAtTime(v, audioContext.currentTime + 0.05)
  }
}
export function setMusicVolume(v: number) {
  if (musicGain && audioContext) {
    musicGain.gain.linearRampToValueAtTime(v * 0.5, audioContext.currentTime + 0.05)
  }
}
export function setSfxVolume(v: number) {
  if (sfxGain && audioContext) {
    sfxGain.gain.linearRampToValueAtTime(v, audioContext.currentTime + 0.05)
  }
}

function startAmbientMusic() {
  if (!audioContext || !musicGain) return
  const baseFreqs = [55, 82.5, 110, 137.5]
  musicOscillators.forEach(o => { try { o.stop() } catch (_) {} })
  musicOscillators = []

  baseFreqs.forEach((freq, i) => {
    const osc = audioContext!.createOscillator()
    const g = audioContext!.createGain()
    const filter = audioContext!.createBiquadFilter()

    osc.type = i % 2 === 0 ? 'sine' : 'triangle'
    osc.frequency.value = freq
    osc.detune.value = (i * 7) - 14

    filter.type = 'lowpass'
    filter.frequency.value = 800 + i * 200

    g.gain.value = 0.02
    osc.connect(filter)
    filter.connect(g)
    g.connect(musicGain!)

    const lfo = audioContext!.createOscillator()
    const lfoGain = audioContext!.createGain()
    lfo.frequency.value = 0.05 + i * 0.02
    lfoGain.gain.value = freq * 0.01
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    lfo.start()

    osc.start()
    musicOscillators.push(osc)
  })

  scheduleMelody()
}

function scheduleMelody() {
  if (!audioContext || !musicGain) return
  const scale = [220, 246.94, 261.63, 293.66, 329.63, 369.99, 392, 440]
  let t = audioContext.currentTime + 1

  const playNote = () => {
    if (!audioContext || !musicGain) return
    const freq = scale[Math.floor(Math.random() * scale.length)]
    const osc = audioContext.createOscillator()
    const g = audioContext.createGain()
    const reverb = createSimpleReverb()

    osc.type = 'sine'
    osc.frequency.value = freq
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.06, t + 0.1)
    g.gain.exponentialRampToValueAtTime(0.001, t + 3)

    osc.connect(g)
    if (reverb) { g.connect(reverb); reverb.connect(musicGain!) }
    else g.connect(musicGain!)

    osc.start(t)
    osc.stop(t + 3.5)
    t += 1.5 + Math.random() * 3
  }

  for (let i = 0; i < 8; i++) playNote()

  musicIntervalId = window.setTimeout(scheduleMelody, 12000)
}

function createSimpleReverb(): ConvolverNode | null {
  if (!audioContext) return null
  try {
    const convolver = audioContext.createConvolver()
    const rate = audioContext.sampleRate
    const length = rate * 2
    const buffer = audioContext.createBuffer(2, length, rate)
    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c)
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3)
      }
    }
    convolver.buffer = buffer
    return convolver
  } catch {
    return null
  }
}

// SFX functions
export function playCrystalPickup() {
  if (!audioContext || !sfxGain) return
  const t = audioContext.currentTime
  const freqs = [523.25, 659.25, 783.99, 1046.5]
  freqs.forEach((f, i) => {
    const osc = audioContext!.createOscillator()
    const g = audioContext!.createGain()
    osc.type = 'sine'
    osc.frequency.value = f
    g.gain.setValueAtTime(0, t + i * 0.06)
    g.gain.linearRampToValueAtTime(0.3, t + i * 0.06 + 0.02)
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.4)
    osc.connect(g)
    g.connect(sfxGain!)
    osc.start(t + i * 0.06)
    osc.stop(t + i * 0.06 + 0.5)
  })
}

export function playJump() {
  if (!audioContext || !sfxGain) return
  const t = audioContext.currentTime
  const osc = audioContext.createOscillator()
  const g = audioContext.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(200, t)
  osc.frequency.exponentialRampToValueAtTime(350, t + 0.15)
  g.gain.setValueAtTime(0.2, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
  osc.connect(g)
  g.connect(sfxGain!)
  osc.start(t)
  osc.stop(t + 0.4)
}

export function playLand() {
  if (!audioContext || !sfxGain) return
  const t = audioContext.currentTime
  const buf = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * 0.1), audioContext.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2)
  const src = audioContext.createBufferSource()
  const g = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 200
  src.buffer = buf
  g.gain.value = 0.4
  src.connect(filter)
  filter.connect(g)
  g.connect(sfxGain!)
  src.start(t)
}

export function playFootstep() {
  if (!audioContext || !sfxGain) return
  const t = audioContext.currentTime
  const buf = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * 0.05), audioContext.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4)
  const src = audioContext.createBufferSource()
  const g = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 300
  filter.Q.value = 0.5
  src.buffer = buf
  g.gain.value = 0.12
  src.connect(filter)
  filter.connect(g)
  g.connect(sfxGain!)
  src.start(t)
}

export function playAttack() {
  if (!audioContext || !sfxGain) return
  const t = audioContext.currentTime
  const buf = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * 0.2), audioContext.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) {
    const env = Math.pow(1 - i / d.length, 1.5)
    d[i] = (Math.random() * 2 - 1) * env * 0.5 + Math.sin(i * 0.5) * env * 0.5
  }
  const src = audioContext.createBufferSource()
  const g = audioContext.createGain()
  const filter = audioContext.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 600
  src.buffer = buf
  g.gain.value = 0.5
  src.connect(filter)
  filter.connect(g)
  g.connect(sfxGain!)
  src.start(t)
}

export function playDamage() {
  if (!audioContext || !sfxGain) return
  const t = audioContext.currentTime
  const osc = audioContext.createOscillator()
  const g = audioContext.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(150, t)
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.2)
  g.gain.setValueAtTime(0.4, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
  osc.connect(g)
  g.connect(sfxGain!)
  osc.start(t)
  osc.stop(t + 0.4)
}

export function playPortalActivate() {
  if (!audioContext || !sfxGain) return
  const t = audioContext.currentTime
  const freqs = [110, 220, 330, 440, 660, 880]
  freqs.forEach((f, i) => {
    const osc = audioContext!.createOscillator()
    const g = audioContext!.createGain()
    osc.type = 'sine'
    osc.frequency.value = f
    g.gain.setValueAtTime(0, t + i * 0.1)
    g.gain.linearRampToValueAtTime(0.15, t + i * 0.1 + 0.05)
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 1.5)
    osc.connect(g)
    g.connect(sfxGain!)
    osc.start(t + i * 0.1)
    osc.stop(t + i * 0.1 + 2)
  })
}

export function playUIClick() {
  if (!audioContext || !sfxGain) return
  const t = audioContext.currentTime
  const osc = audioContext.createOscillator()
  const g = audioContext.createGain()
  osc.type = 'sine'
  osc.frequency.value = 800
  g.gain.setValueAtTime(0.15, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
  osc.connect(g)
  g.connect(sfxGain!)
  osc.start(t)
  osc.stop(t + 0.1)
}

export function playCheckpoint() {
  if (!audioContext || !sfxGain) return
  const t = audioContext.currentTime
  const freqs = [392, 523.25, 659.25]
  freqs.forEach((f, i) => {
    const osc = audioContext!.createOscillator()
    const g = audioContext!.createGain()
    osc.type = 'sine'
    osc.frequency.value = f
    g.gain.setValueAtTime(0, t + i * 0.12)
    g.gain.linearRampToValueAtTime(0.2, t + i * 0.12 + 0.04)
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.6)
    osc.connect(g)
    g.connect(sfxGain!)
    osc.start(t + i * 0.12)
    osc.stop(t + i * 0.12 + 0.8)
  })
}

export function playDefeat() {
  if (!audioContext || !sfxGain) return
  const t = audioContext.currentTime
  const notes = [200, 180, 160, 120]
  notes.forEach((freq, i) => {
    const osc = audioContext!.createOscillator()
    const g = audioContext!.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(freq, t + i * 0.3)
    g.gain.setValueAtTime(0.25, t + i * 0.3)
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.3 + 0.5)
    osc.connect(g)
    g.connect(sfxGain!)
    osc.start(t + i * 0.3)
    osc.stop(t + i * 0.3 + 0.6)
  })
}

export function playVictory() {
  if (!audioContext || !sfxGain) return
  const t = audioContext.currentTime
  const chords = [392, 523.25, 659.25, 783.99, 1046.5]
  chords.forEach((freq, i) => {
    const osc = audioContext!.createOscillator()
    const g = audioContext!.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, t + i * 0.15)
    g.gain.setValueAtTime(0.3, t + i * 0.15)
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 1.2)
    osc.connect(g)
    g.connect(sfxGain!)
    osc.start(t + i * 0.15)
    osc.stop(t + i * 0.15 + 1.5)
  })
}

export function resumeAudio() {
  if (audioContext?.state === 'suspended') {
    audioContext.resume()
  }
}

export class AudioManager {
  private static instance: AudioManager

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  init() {
    initAudio()
  }

  resume() {
    resumeAudio()
  }

  playUIClick() {
    playUIClick()
  }

  playCrystalPickup() {
    playCrystalPickup()
  }

  playJump() {
    playJump()
  }

  playLand() {
    playLand()
  }

  playFootstep() {
    playFootstep()
  }

  playAttack() {
    playAttack()
  }

  playDamage() {
    playDamage()
  }

  playPortalActivate() {
    playPortalActivate()
  }

  playCheckpoint() {
    playCheckpoint()
  }

  playDefeat() {
    playDefeat()
  }

  playVictory() {
    playVictory()
  }

  updateVolumes(v: { masterVolume?: number; musicVolume?: number; sfxVolume?: number; master?: number; music?: number; sfx?: number }) {
    if (v.masterVolume !== undefined) setMasterVolume(v.masterVolume)
    if (v.master !== undefined) setMasterVolume(v.master)
    if (v.musicVolume !== undefined) setMusicVolume(v.musicVolume)
    if (v.music !== undefined) setMusicVolume(v.music)
    if (v.sfxVolume !== undefined) setSfxVolume(v.sfxVolume)
    if (v.sfx !== undefined) setSfxVolume(v.sfx)
  }
}
