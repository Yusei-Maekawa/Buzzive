import { createPack, createQuestion, listMyPacks, requireUid } from '../services/packService'

const DEMO_PACKS = [
  {
    title: '雑学パック（デモ）',
    questions: [
      {
        questionText: '世界で一番高い山はエベレストですが、では海底からの高さで一番高い山は？',
        answerText: 'マウナ・ケア',
      },
      {
        questionText: '1分間は60秒。では1日は何秒でしょう？',
        answerText: '86,400秒',
      },
      {
        questionText: 'バナナは植物学上、果物ではなく何に分類される？',
        answerText: 'ベリー（液果）',
      },
    ],
  },
  {
    title: 'アニメパック（デモ）',
    questions: [
      {
        questionText: '「進撃の巨人」の作者は誰？',
        answerText: '諫山創',
      },
      {
        questionText: '「ジブリ」の創業者の一人で、「千と千尋の神隠し」の監督は誰？',
        answerText: '宮崎駿',
      },
    ],
  },
  {
    title: '身内ネタパック（デモ）',
    questions: [
      {
        questionText: 'Buzzive のキャッチコピーは？',
        answerText: '集まれば、エンタメになる。',
      },
    ],
  },
] as const

export async function seedDemoPacks(): Promise<{ created: number; skipped: number }> {
  const uid = requireUid()
  const existing = await listMyPacks(uid)
  const existingTitles = new Set(existing.map((p) => p.title))

  let created = 0
  let skipped = 0

  for (const demo of DEMO_PACKS) {
    if (existingTitles.has(demo.title)) {
      skipped++
      continue
    }

    const packId = await createPack(demo.title)
    for (const q of demo.questions) {
      await createQuestion(packId, q.questionText, q.answerText)
    }
    created++
  }

  return { created, skipped }
}
