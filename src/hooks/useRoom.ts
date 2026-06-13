import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { Member, Room, SessionQuestion } from '../types'

function mapRoom(id: string, data: DocumentData): Room {
  return { id, ...data } as Room
}

function mapMember(snap: QueryDocumentSnapshot<DocumentData>): Member {
  return { id: snap.id, ...snap.data() } as Member
}

function mapSessionQuestion(snap: QueryDocumentSnapshot<DocumentData>): SessionQuestion {
  return { id: snap.id, ...snap.data() } as SessionQuestion
}

export function useRoom(roomId: string | undefined) {
  const [room, setRoom] = useState<Room | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [sessionQuestions, setSessionQuestions] = useState<SessionQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const memberId = auth?.currentUser?.uid ?? null

  useEffect(() => {
    if (!roomId || !db) {
      setLoading(false)
      if (!db) setError('Firebase が未設定です')
      return
    }

    setLoading(true)
    setError(null)

    const roomRef = doc(db, 'rooms', roomId)
    const membersRef = collection(db, 'rooms', roomId, 'members')
    const sessionRef = collection(db, 'rooms', roomId, 'sessionQuestions')

    const unsubRoom = onSnapshot(
      roomRef,
      (snap) => {
        if (!snap.exists()) {
          setRoom(null)
          setError('ルームが見つかりません')
          setLoading(false)
          return
        }
        setRoom(mapRoom(snap.id, snap.data()))
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    const unsubMembers = onSnapshot(membersRef, (snap) => {
      const list = snap.docs.map(mapMember).sort((a, b) => a.joinOrder - b.joinOrder)
      setMembers(list)
    })

    const unsubSession = onSnapshot(sessionRef, (snap) => {
      setSessionQuestions(snap.docs.map(mapSessionQuestion))
    })

    return () => {
      unsubRoom()
      unsubMembers()
      unsubSession()
    }
  }, [roomId])

  const isHost = useMemo(
    () => room != null && memberId != null && room.hostId === memberId,
    [room, memberId]
  )

  const isMember = useMemo(
    () => memberId != null && members.some((m) => m.id === memberId),
    [members, memberId]
  )

  const myMember = useMemo(
    () => members.find((m) => m.id === memberId) ?? null,
    [members, memberId]
  )

  return {
    room,
    members,
    sessionQuestions,
    loading,
    error,
    memberId,
    isHost,
    isMember,
    myMember,
  }
}
