import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { Question, QuizPack } from '../types'

function requireDb() {
  if (!db) throw new Error('Firebase が未設定です')
  return db
}

export function requireUid(): string {
  if (!auth?.currentUser) throw new Error('ログインしてください')
  return auth.currentUser.uid
}

export async function listMyPacks(uid: string): Promise<QuizPack[]> {
  const firestore = requireDb()
  const snap = await getDocs(query(collection(firestore, 'quizPacks'), where('createdBy', '==', uid)))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as QuizPack))
}

export async function getPack(packId: string): Promise<QuizPack | null> {
  const firestore = requireDb()
  const snap = await getDoc(doc(firestore, 'quizPacks', packId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as QuizPack
}

export async function countQuestions(packId: string): Promise<number> {
  const firestore = requireDb()
  const snap = await getCountFromServer(collection(firestore, 'quizPacks', packId, 'questions'))
  return snap.data().count
}

export async function enrichPacksWithCount(packs: QuizPack[]): Promise<QuizPack[]> {
  return Promise.all(
    packs.map(async (p) => ({
      ...p,
      questionCount: await countQuestions(p.id),
    }))
  )
}

export async function resolvePacks(packIds: string[]): Promise<QuizPack[]> {
  const packs: QuizPack[] = []
  for (const id of packIds) {
    const pack = await getPack(id)
    if (pack) {
      packs.push({ ...pack, questionCount: await countQuestions(id) })
    }
  }
  return packs
}

async function assertPackOwner(packId: string): Promise<QuizPack> {
  const uid = requireUid()
  const pack = await getPack(packId)
  if (!pack || pack.createdBy !== uid) throw new Error('このパックを編集する権限がありません')
  return pack
}

export async function createPack(title: string): Promise<string> {
  const firestore = requireDb()
  const uid = requireUid()
  const trimmed = title.trim()
  if (!trimmed) throw new Error('パック名を入力してください')

  const ref = await addDoc(collection(firestore, 'quizPacks'), {
    title: trimmed,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updatePack(packId: string, title: string): Promise<void> {
  const firestore = requireDb()
  await assertPackOwner(packId)
  const trimmed = title.trim()
  if (!trimmed) throw new Error('パック名を入力してください')

  await updateDoc(doc(firestore, 'quizPacks', packId), {
    title: trimmed,
    updatedAt: serverTimestamp(),
  })
}

export async function deletePack(packId: string): Promise<void> {
  const firestore = requireDb()
  await assertPackOwner(packId)

  const questionsSnap = await getDocs(collection(firestore, 'quizPacks', packId, 'questions'))
  const batch = writeBatch(firestore)
  questionsSnap.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(doc(firestore, 'quizPacks', packId))
  await batch.commit()
}

export async function listQuestions(packId: string): Promise<Question[]> {
  const firestore = requireDb()
  await assertPackOwner(packId)
  const snap = await getDocs(collection(firestore, 'quizPacks', packId, 'questions'))
  return snap.docs.map((d) => ({ id: d.id, packId, ...d.data() } as Question))
}

export async function createQuestion(
  packId: string,
  questionText: string,
  answerText: string
): Promise<string> {
  const firestore = requireDb()
  await assertPackOwner(packId)
  const q = questionText.trim()
  const a = answerText.trim()
  if (!q || !a) throw new Error('問題文と正解を入力してください')

  const ref = await addDoc(collection(firestore, 'quizPacks', packId, 'questions'), {
    questionText: q,
    answerText: a,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(firestore, 'quizPacks', packId), { updatedAt: serverTimestamp() })
  return ref.id
}

export async function updateQuestion(
  packId: string,
  questionId: string,
  questionText: string,
  answerText: string
): Promise<void> {
  const firestore = requireDb()
  await assertPackOwner(packId)
  const q = questionText.trim()
  const a = answerText.trim()
  if (!q || !a) throw new Error('問題文と正解を入力してください')

  await updateDoc(doc(firestore, 'quizPacks', packId, 'questions', questionId), {
    questionText: q,
    answerText: a,
  })
  await updateDoc(doc(firestore, 'quizPacks', packId), { updatedAt: serverTimestamp() })
}

export async function deleteQuestion(packId: string, questionId: string): Promise<void> {
  const firestore = requireDb()
  await assertPackOwner(packId)
  await deleteDoc(doc(firestore, 'quizPacks', packId, 'questions', questionId))
  await updateDoc(doc(firestore, 'quizPacks', packId), { updatedAt: serverTimestamp() })
}
