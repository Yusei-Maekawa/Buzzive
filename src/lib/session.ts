import type { User } from 'firebase/auth'

const DISPLAY_NAME_KEY = 'buzzive_displayName'
const ROOM_ID_KEY = 'buzzive_roomId'
export const DISPLAY_NAME_MAX = 12

export function getStoredDisplayName(): string | null {
  return localStorage.getItem(DISPLAY_NAME_KEY)
}

export function setStoredDisplayName(name: string): void {
  localStorage.setItem(DISPLAY_NAME_KEY, name.trim())
}

export function clearStoredDisplayName(): void {
  localStorage.removeItem(DISPLAY_NAME_KEY)
}

export function getDefaultNameFromUser(user: User): string {
  return user.displayName ?? user.email?.split('@')[0] ?? 'ユーザー'
}

/** 表示名の優先順: localStorage → Google プロフィール → ゲスト既定 */
export function resolveDisplayName(user: User | null): string {
  const stored = getStoredDisplayName()
  if (stored) return stored
  if (!user) return ''
  if (user.isAnonymous) return ''
  return getDefaultNameFromUser(user)
}

export function getStoredRoomId(): string | null {
  return localStorage.getItem(ROOM_ID_KEY)
}

export function setStoredRoomId(roomId: string): void {
  localStorage.setItem(ROOM_ID_KEY, roomId)
}

export function clearStoredRoomId(): void {
  localStorage.removeItem(ROOM_ID_KEY)
}

export function clearRoomSession(): void {
  clearStoredRoomId()
}
