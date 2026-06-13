import type { Timestamp } from 'firebase/firestore'

export type RoomStatus = 'waiting' | 'playing' | 'finished'
export type RoomPhase = 'waiting' | 'reading' | 'buzzed' | 'judged' | 'finished'
export type QuestionerMode = 'fixed' | 'rotation'
export type Difficulty = 'easy' | 'normal' | 'hard'

export interface RoomSettings {
  totalQuestions: number
  correctPoint: number
  wrongPoint: number
  questionerMode: QuestionerMode
}

export interface Room {
  id: string
  roomCode: string
  hostId: string
  status: RoomStatus
  selectedPackIds: string[]
  settings: RoomSettings
  phase: RoomPhase
  questionIndex: number
  questionOrder: string[]
  currentQuestionerId: string | null
  currentQuestionId: string | null
  buzzWinnerId: string | null
  buzzedAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Member {
  id: string
  name: string
  uid?: string | null
  score: number
  correctCount: number
  joinOrder: number
  joinedAt?: Timestamp
  // UI / モック用（Firestore には保存しない）
  avatarColor?: string
  isGuest?: boolean
  isOnline?: boolean
  wrongCount?: number
  buzzCount?: number
  questionerCount?: number
}

export interface ResultMember extends Member {
  rank: number
}

export interface QuizPack {
  id: string
  title: string
  createdBy: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
  // モック UI 用（v0.1 Firestore には含めない）
  description?: string
  category?: string
  questionCount?: number
}

export interface Question {
  id: string
  questionText: string
  answerText: string
  createdAt?: Timestamp
  packId?: string
  explanation?: string
  difficulty?: Difficulty
  order?: number
}

export interface SessionQuestion {
  id: string
  questionText: string
  answerText: string
  addedBy: string
  createdAt: Timestamp
}

export interface RoomCodeDoc {
  roomId: string
}

/** 問題参照: pack:{packId}/{questionId} | session:{questionId} */
export type QuestionRef = string
