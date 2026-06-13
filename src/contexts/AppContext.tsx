import { createContext, useContext, useState, type ReactNode } from 'react'
import type { QuizPack, RoomSettings } from '../types'
import { mockPacks, defaultSettings } from '../data/mock'

interface AppState {
  packs: QuizPack[]
  selectedPackIds: string[]
  togglePack: (id: string) => void
  settings: RoomSettings
  setSettings: (s: RoomSettings) => void
  roomCode: string
}

const Ctx = createContext<AppState | null>(null)

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>(['pack-1'])
  const [settings, setSettings] = useState<RoomSettings>(defaultSettings)
  const [roomCode] = useState(genCode())

  const value: AppState = {
    packs: mockPacks,
    selectedPackIds,
    togglePack: (id) =>
      setSelectedPackIds((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      ),
    settings,
    setSettings,
    roomCode,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
