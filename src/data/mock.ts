import type { QuizPack, Question, Member, RoomSettings } from '../types'

export const CATEGORIES = ['雑学', 'アニメ', 'ポーカー', '身内ネタ', '旅行', '学園祭', '映画', 'スポーツ']

export const AVATAR_COLORS = ['#FF3D7F', '#C6FF3D', '#3DD6FF', '#FFB23D', '#A78BFA', '#FF7A5C']

export const mockPacks: QuizPack[] = [
  {
    id: 'pack-1',
    title: '雑学パック',
    createdBy: 'mock-user',
    description: '日常で使えるちょっとした雑学クイズ集',
    category: '雑学',
    questionCount: 12,
  },
  {
    id: 'pack-2',
    title: 'アニメ名作パック',
    createdBy: 'mock-user',
    description: '90年代〜最新まで、アニメ好きが集まる夜に',
    category: 'アニメ',
    questionCount: 20,
  },
  {
    id: 'pack-3',
    title: '身内ネタ大会',
    createdBy: 'mock-user',
    description: 'サークルメンバーしか分からない問題たち',
    category: '身内ネタ',
    questionCount: 8,
  },
  {
    id: 'pack-4',
    title: 'ポーカー初級',
    createdBy: 'mock-user',
    description: '役の強さからハンドの確率まで',
    category: 'ポーカー',
    questionCount: 15,
  },
]

export const mockQuestions: Record<string, Question[]> = {
  'pack-1': [
    {
      id: 'q-1',
      packId: 'pack-1',
      questionText: '世界で一番高い山はエベレストですが、では海底からの高さで一番高い山は？',
      answerText: 'マウナ・ケア',
      explanation: 'ハワイ島にあり、海底からの高さは約10,000m。',
      difficulty: 'normal',
      order: 0,
    },
    {
      id: 'q-2',
      packId: 'pack-1',
      questionText: '1分間は60秒。では1日は何秒でしょう？',
      answerText: '86,400秒',
      explanation: '60 × 60 × 24 = 86,400。',
      difficulty: 'easy',
      order: 1,
    },
    {
      id: 'q-3',
      packId: 'pack-1',
      questionText: 'バナナは植物学上、果物ではなく何に分類される？',
      answerText: 'ベリー（液果）',
      explanation: 'バナナは植物学的にはベリーの一種。',
      difficulty: 'hard',
      order: 2,
    },
  ],
  'pack-2': [],
  'pack-3': [],
  'pack-4': [],
}

export const defaultSettings: RoomSettings = {
  totalQuestions: 10,
  correctPoint: 10,
  wrongPoint: 0,
  questionerMode: 'rotation',
}

export const mockMembers: Member[] = [
  {
    id: 'm-1',
    name: 'あなた',
    isGuest: false,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    buzzCount: 0,
    questionerCount: 0,
    isOnline: true,
    joinOrder: 0,
    avatarColor: '#FF3D7F',
  },
  {
    id: 'm-2',
    name: 'ゆうた',
    isGuest: true,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    buzzCount: 0,
    questionerCount: 0,
    isOnline: true,
    joinOrder: 1,
    avatarColor: '#C6FF3D',
  },
  {
    id: 'm-3',
    name: 'みき',
    isGuest: true,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    buzzCount: 0,
    questionerCount: 0,
    isOnline: true,
    joinOrder: 2,
    avatarColor: '#3DD6FF',
  },
  {
    id: 'm-4',
    name: 'けんと',
    isGuest: true,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    buzzCount: 0,
    questionerCount: 0,
    isOnline: false,
    joinOrder: 3,
    avatarColor: '#FFB23D',
  },
]

export const mockResults: Member[] = [
  { ...mockMembers[1], score: 70, correctCount: 7, wrongCount: 1, buzzCount: 9, questionerCount: 3 },
  { ...mockMembers[0], score: 50, correctCount: 5, wrongCount: 2, buzzCount: 8, questionerCount: 2 },
  { ...mockMembers[2], score: 40, correctCount: 4, wrongCount: 0, buzzCount: 5, questionerCount: 3 },
  { ...mockMembers[3], score: 20, correctCount: 2, wrongCount: 3, buzzCount: 4, questionerCount: 2 },
]

export function memberAvatarColor(member: Member): string {
  return member.avatarColor ?? AVATAR_COLORS[member.joinOrder % AVATAR_COLORS.length]
}
