import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhoneShell, Avatar } from '../components/ui'
import { useApp } from '../contexts/AppContext'
import { mockMembers, mockQuestions, memberAvatarColor } from '../data/mock'

type Phase = 'reading' | 'buzzed' | 'judged'
type Role = 'answerer' | 'questioner'

const QUESTIONS = mockQuestions['pack-1']

export default function GamePage() {
  const nav = useNavigate()
  const { settings } = useApp()

  const [role, setRole] = useState<Role>('answerer')
  const [qIndex, setQIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('reading')
  const [buzzedBy, setBuzzedBy] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(mockMembers.map((m) => [m.id, 0]))
  )
  const [reveal, setReveal] = useState(false)

  const total = settings.totalQuestions
  const q = QUESTIONS[qIndex % QUESTIONS.length]
  const sorted = [...mockMembers].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))

  const me = mockMembers[0]

  const handleBuzz = () => {
    if (phase !== 'reading') return
    setBuzzedBy(me.id)
    setPhase('buzzed')
  }

  const judge = (correct: boolean) => {
    if (buzzedBy) {
      setScores((s) => ({
        ...s,
        [buzzedBy]: (s[buzzedBy] ?? 0) + (correct ? settings.correctPoint : settings.wrongPoint),
      }))
    }
    setPhase('judged')
    setReveal(true)
  }

  const next = () => {
    if (qIndex + 1 >= total) {
      nav('/rooms/MOCK/result')
      return
    }
    setQIndex((i) => i + 1)
    setPhase('reading')
    setBuzzedBy(null)
    setReveal(false)
  }

  const buzzedMember = mockMembers.find((m) => m.id === buzzedBy)

  return (
    <PhoneShell>
      {/* ヘッダー：進捗 + ロール切替（モック用） */}
      <div className="px-5 pt-6 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-sm text-cream/50">
            Q{qIndex + 1}
            <span className="text-cream/25"> / {total}</span>
          </span>
          {/* モック専用：自分の役割を切り替えて両方の画面を確認できる */}
          <div className="flex items-center gap-1 bg-coal rounded-full p-1 border border-white/10">
            <RoleTab active={role === 'answerer'} onClick={() => setRole('answerer')}>
              回答者
            </RoleTab>
            <RoleTab active={role === 'questioner'} onClick={() => setRole('questioner')}>
              出題者
            </RoleTab>
          </div>
        </div>
        {/* プログレスバー */}
        <div className="h-1.5 rounded-full bg-coal overflow-hidden">
          <div
            className="h-full bg-volt transition-all duration-300"
            style={{ width: `${((qIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* スコアストリップ */}
      <div className="px-5 pb-3 shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {sorted.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-1.5 bg-coal rounded-full pl-1 pr-3 py-1 border border-white/10 shrink-0"
            >
              <Avatar name={m.name} color={memberAvatarColor(m)} size={22} />
              <span className="text-xs font-bold tabular-nums">{scores[m.id] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 問題エリア */}
      <div className="flex-1 flex flex-col px-5 min-h-0">
        <div className="flex-1 grid place-items-center py-4">
          <div className="w-full">
            <div className="rounded-3xl bg-coal border border-white/10 p-6 min-h-[180px] flex items-center justify-center text-center">
              <div>
                {role === 'questioner' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-buzz/20 text-buzz-400 mb-3 inline-block">
                    あなたが出題者
                  </span>
                )}
                <p className="text-lg font-semibold leading-relaxed">{q.questionText}</p>
                {reveal && (
                  <div className="mt-4 pt-4 border-t border-white/10 animate-slideUp">
                    <p className="text-sm text-cream/50">正解</p>
                    <p className="font-display text-2xl text-volt">{q.answerText}</p>
                    {q.explanation && (
                      <p className="text-xs text-cream/45 mt-2">{q.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 早押し状態の表示 */}
            {buzzedMember && phase !== 'reading' && (
              <div className="mt-4 flex items-center justify-center gap-2 animate-buzzin">
                <Avatar name={buzzedMember.name} color={memberAvatarColor(buzzedMember)} size={28} />
                <span className="font-bold">
                  {buzzedMember.name} が最速で押しました！
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 下部コントロール */}
        <div className="pb-7 pt-2">
          {role === 'answerer' ? (
            <AnswererControls phase={phase} onBuzz={handleBuzz} onNext={next} />
          ) : (
            <QuestionerControls phase={phase} onJudge={judge} onNext={next} />
          )}
        </div>
      </div>
    </PhoneShell>
  )
}

function RoleTab({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-bold px-3 py-1 rounded-full transition ${
        active ? 'bg-volt text-ink' : 'text-cream/50'
      }`}
    >
      {children}
    </button>
  )
}

// 回答者：大きな早押しボタン
function AnswererControls({
  phase,
  onBuzz,
  onNext,
}: {
  phase: Phase
  onBuzz: () => void
  onNext: () => void
}) {
  if (phase === 'judged') {
    return (
      <button
        onClick={onNext}
        className="w-full rounded-2xl bg-coal border border-white/10 font-bold py-4 active:scale-[0.99] transition"
      >
        次の問題を待つ…
      </button>
    )
  }
  return (
    <div className="grid place-items-center">
      <button
        onClick={onBuzz}
        disabled={phase === 'buzzed'}
        className={`w-44 h-44 rounded-full font-display text-3xl text-white grid place-items-center transition ${
          phase === 'buzzed'
            ? 'bg-coal text-cream/30 border-2 border-white/10'
            : 'bg-buzz shadow-pop active:translate-x-1 active:translate-y-1 active:shadow-none animate-pulseRing'
        }`}
      >
        {phase === 'buzzed' ? '押した！' : 'BUZZ'}
      </button>
      <p className="text-xs text-cream/40 mt-4">
        {phase === 'buzzed' ? '出題者の判定を待っています' : '分かったら押そう'}
      </p>
    </div>
  )
}

// 出題者：正誤判定ボタン
function QuestionerControls({
  phase,
  onJudge,
  onNext,
}: {
  phase: Phase
  onJudge: (correct: boolean) => void
  onNext: () => void
}) {
  if (phase === 'reading') {
    return (
      <div className="text-center rounded-2xl bg-coal border border-white/10 py-5">
        <p className="text-cream/60 font-semibold">回答者の早押しを待っています</p>
        <p className="text-xs text-cream/35 mt-1">誰かが押すと判定ボタンが出ます</p>
      </div>
    )
  }
  if (phase === 'judged') {
    return (
      <button
        onClick={onNext}
        className="w-full rounded-2xl bg-volt text-ink font-bold py-4 shadow-pop active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
      >
        次の問題へ →
      </button>
    )
  }
  // buzzed
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => onJudge(false)}
        className="rounded-2xl bg-coal border-2 border-buzz/40 text-buzz-400 font-bold py-5 text-lg active:scale-95 transition"
      >
        ✕ 不正解
      </button>
      <button
        onClick={() => onJudge(true)}
        className="rounded-2xl bg-volt text-ink font-bold py-5 text-lg shadow-pop active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
      >
        ○ 正解
      </button>
    </div>
  )
}
