import { collection, doc, getDoc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Member, RoomSettings } from '../types'
import { requireUid } from './packService'

function requireDb() {
  if (!db) throw new Error('Firebase が未設定です')
  return db
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

async function collectQuestionRefs(roomId: string, selectedPackIds: string[]): Promise<string[]> {
  const firestore = requireDb()
  const refs: string[] = []

  for (const packId of selectedPackIds) {
    const snap = await getDocs(collection(firestore, 'quizPacks', packId, 'questions'))
    for (const q of snap.docs) {
      refs.push(`pack:${packId}/${q.id}`)
    }
  }

  const sessionSnap = await getDocs(collection(firestore, 'rooms', roomId, 'sessionQuestions'))
  for (const q of sessionSnap.docs) {
    refs.push(`session:${q.id}`)
  }

  return refs
}

function pickFirstQuestioner(members: Member[], hostId: string, mode: RoomSettings['questionerMode']): string {
  if (mode === 'fixed') return hostId
  const ordered = [...members].sort((a, b) => a.joinOrder - b.joinOrder)
  return ordered[0]?.id ?? hostId
}

function parseQuestionRef(ref: string): { type: 'pack' | 'session'; packId?: string; questionId: string } {
  if (ref.startsWith('pack:')) {
    const body = ref.slice(5)
    const slash = body.indexOf('/')
    return { type: 'pack', packId: body.slice(0, slash), questionId: body.slice(slash + 1) }
  }
  return { type: 'session', questionId: ref.slice(8) }
}

export async function startGame(roomId: string): Promise<void> {
  const firestore = requireDb()
  const uid = requireUid()
  const roomRef = doc(firestore, 'rooms', roomId)
  const roomSnap = await getDoc(roomRef)

  if (!roomSnap.exists()) throw new Error('ルームが見つかりません')
  const room = roomSnap.data()

  if (room.hostId !== uid) throw new Error('ホストのみ開始できます')
  if (room.status !== 'waiting') throw new Error('すでに開始されています')

  const membersSnap = await getDocs(collection(firestore, 'rooms', roomId, 'members'))
  const members: Member[] = membersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Member))

  const pool = shuffle(await collectQuestionRefs(roomId, room.selectedPackIds ?? []))
  const total = room.settings.totalQuestions as number

  if (pool.length === 0) {
    throw new Error('問題がありません。パックを選ぶか、ロビーで問題を追加してください')
  }
  if (pool.length < total) {
    throw new Error(`問題が足りません（${pool.length}問 / 必要${total}問）`)
  }

  const questionOrder = pool.slice(0, total)
  const firstRef = questionOrder[0]
  const parsed = parseQuestionRef(firstRef)
  const currentQuestionId =
    parsed.type === 'pack' ? `${parsed.packId}/${parsed.questionId}` : parsed.questionId

  const currentQuestionerId = pickFirstQuestioner(members, room.hostId, room.settings.questionerMode)

  await updateDoc(roomRef, {
    status: 'playing',
    phase: 'reading',
    questionIndex: 0,
    questionOrder,
    currentQuestionerId,
    currentQuestionId,
    buzzWinnerId: null,
    buzzedAt: null,
    updatedAt: serverTimestamp(),
  })
}
