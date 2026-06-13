import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { DISPLAY_NAME_MAX, resolveDisplayName, setStoredDisplayName, setStoredRoomId } from '../lib/session'
import type { RoomSettings } from '../types'
import { requireUid } from './packService'

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function requireDb() {
  if (!db) throw new Error('Firebase が未設定です')
  return db
}

function genRoomCode(): string {
  return Array.from({ length: 6 }, () =>
    ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
  ).join('')
}

function resolveMemberName(): string {
  const user = auth?.currentUser
  if (!user) throw new Error('ログインしてください')
  const name = resolveDisplayName(user)
  const base = name || (user.isAnonymous ? 'ゲスト' : 'ユーザー')
  return base.slice(0, DISPLAY_NAME_MAX)
}

export async function createRoom(params: {
  selectedPackIds: string[]
  settings: RoomSettings
}): Promise<string> {
  const firestore = requireDb()
  const uid = requireUid()
  const hostName = resolveMemberName()

  for (let attempt = 0; attempt < 8; attempt++) {
    const roomCode = genRoomCode()
    const codeRef = doc(firestore, 'roomCodes', roomCode)
    const codeSnap = await getDoc(codeRef)
    if (codeSnap.exists()) continue

    const roomRef = doc(collection(firestore, 'rooms'))
    const batch = writeBatch(firestore)

    batch.set(codeRef, { roomId: roomRef.id })
    batch.set(roomRef, {
      roomCode,
      hostId: uid,
      status: 'waiting',
      selectedPackIds: params.selectedPackIds,
      settings: params.settings,
      phase: 'waiting',
      questionIndex: 0,
      questionOrder: [],
      currentQuestionerId: null,
      currentQuestionId: null,
      buzzWinnerId: null,
      buzzedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    await batch.commit()

    await setDoc(doc(firestore, 'rooms', roomRef.id, 'members', uid), {
      name: hostName,
      uid,
      score: 0,
      correctCount: 0,
      joinOrder: 0,
      joinedAt: serverTimestamp(),
    })
    setStoredRoomId(roomRef.id)
    return roomRef.id
  }

  throw new Error('ルームコードの生成に失敗しました。もう一度お試しください')
}

export async function joinRoom(roomCode: string): Promise<string> {
  const firestore = requireDb()
  const uid = requireUid()
  const memberName = resolveMemberName()
  const normalized = roomCode.trim().toUpperCase()

  if (normalized.length !== 6) {
    throw new Error('ルームコードは6文字です')
  }

  const codeRef = doc(firestore, 'roomCodes', normalized)
  const codeSnap = await getDoc(codeRef)
  if (!codeSnap.exists()) {
    throw new Error('ルームが見つかりません')
  }

  const roomId = codeSnap.data().roomId as string
  const roomRef = doc(firestore, 'rooms', roomId)
  const roomSnap = await getDoc(roomRef)
  if (!roomSnap.exists()) {
    throw new Error('ルームが見つかりません')
  }

  const room = roomSnap.data()
  if (room.status !== 'waiting') {
    throw new Error('このルームはすでに開始されています')
  }

  const memberRef = doc(firestore, 'rooms', roomId, 'members', uid)
  const memberSnap = await getDoc(memberRef)
  if (memberSnap.exists()) {
    await updateDoc(memberRef, { name: memberName })
    setStoredRoomId(roomId)
    return roomId
  }

  const membersSnap = await getDocs(collection(firestore, 'rooms', roomId, 'members'))
  await setDoc(memberRef, {
    name: memberName,
    uid,
    score: 0,
    correctCount: 0,
    joinOrder: membersSnap.size,
    joinedAt: serverTimestamp(),
  })

  setStoredRoomId(roomId)
  return roomId
}

export async function addSessionQuestion(
  roomId: string,
  questionText: string,
  answerText: string
): Promise<void> {
  const firestore = requireDb()
  const uid = requireUid()

  const roomSnap = await getDoc(doc(firestore, 'rooms', roomId))
  if (!roomSnap.exists() || roomSnap.data().status !== 'waiting') {
    throw new Error('ロビー中のみ問題を追加できます')
  }

  const q = questionText.trim()
  const a = answerText.trim()
  if (!q || !a) throw new Error('問題文と正解を入力してください')

  const ref = doc(collection(firestore, 'rooms', roomId, 'sessionQuestions'))
  await setDoc(ref, {
    questionText: q,
    answerText: a,
    addedBy: uid,
    createdAt: serverTimestamp(),
  })
}

export async function updateMemberName(roomId: string, name: string): Promise<void> {
  const firestore = requireDb()
  const uid = requireUid()
  const trimmed = name.trim().slice(0, DISPLAY_NAME_MAX)
  if (!trimmed) throw new Error('名前を入力してください')

  const roomSnap = await getDoc(doc(firestore, 'rooms', roomId))
  if (!roomSnap.exists() || roomSnap.data().status !== 'waiting') {
    throw new Error('ロビー中のみ名前を変更できます')
  }

  await updateDoc(doc(firestore, 'rooms', roomId, 'members', uid), { name: trimmed })
  setStoredDisplayName(trimmed)
}

export function memberLabel(member: { joinOrder: number; uid?: string | null }, hostId: string): string {
  if (member.uid === hostId) return 'ホスト'
  return 'メンバー'
}
