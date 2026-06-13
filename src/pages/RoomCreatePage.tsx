import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhoneShell, TopBar, Card, Button } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { defaultSettings } from '../data/mock'
import {
  enrichPacksWithCount,
  getPack,
  listMyPacks,
  resolvePacks,
} from '../services/packService'
import { createRoom } from '../services/roomService'
import type { QuestionerMode, QuizPack, RoomSettings } from '../types'

export default function RoomCreatePage() {
  const nav = useNavigate()
  const { isSignedIn, isGoogleUser, user, firebaseReady } = useAuth()
  const [packs, setPacks] = useState<QuizPack[]>([])
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>([])
  const [packIdInput, setPackIdInput] = useState('')
  const [settings, setSettings] = useState<RoomSettings>(defaultSettings)
  const [loadingPacks, setLoadingPacks] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSignedIn || !firebaseReady || !isGoogleUser || !user) {
      setLoadingPacks(false)
      return
    }
    listMyPacks(user.uid)
      .then(enrichPacksWithCount)
      .then(setPacks)
      .catch(() => setPacks([]))
      .finally(() => setLoadingPacks(false))
  }, [isSignedIn, firebaseReady, isGoogleUser, user])

  const selectedPacks = packs.filter((p) => selectedPackIds.includes(p.id))
  const totalFromPacks = selectedPacks.reduce((sum, p) => sum + (p.questionCount ?? 0), 0)

  const togglePack = (id: string) => {
    setSelectedPackIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const addPackById = async () => {
    const id = packIdInput.trim()
    if (!id) return
    setError(null)
    try {
      const pack = await getPack(id)
      if (!pack) {
        setError('パックが見つかりません')
        return
      }
      const [enriched] = await resolvePacks([id])
      setPacks((prev) => (prev.some((p) => p.id === id) ? prev : [...prev, enriched]))
      setSelectedPackIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      setPackIdInput('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'パックの追加に失敗しました')
    }
  }

  const handleCreate = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const roomId = await createRoom({ selectedPackIds, settings })
      nav(`/rooms/${roomId}/lobby`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ルーム作成に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isSignedIn) {
    return (
      <PhoneShell>
        <TopBar title="ルームを作る" onBack={() => nav('/')} />
        <div className="flex-1 px-5 py-10 text-center space-y-4">
          <p className="text-cream/70">ルームを作るには、先にトップページでログインしてください。</p>
          <Button variant="volt" full onClick={() => nav('/')}>
            トップへ戻る
          </Button>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell>
      <TopBar title="ルームを作る" onBack={() => nav('/')} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28 space-y-7">
        <section>
          <SectionLabel n="01" title="クイズパックを選ぶ" hint="複数選べます" />

          {loadingPacks ? (
            <p className="text-sm text-cream/45 mt-3">パックを読み込み中…</p>
          ) : packs.length === 0 ? (
            <p className="text-sm text-cream/45 mt-3">
              自分のパックがありません。下の欄で友達のパック ID を追加するか、ロビーで当日問題を追加できます。
            </p>
          ) : (
            <div className="space-y-2.5 mt-3">
              {packs.map((p) => {
                const on = selectedPackIds.includes(p.id)
                return (
                  <Card
                    key={p.id}
                    onClick={() => togglePack(p.id)}
                    className={`p-3.5 border-2 ${on ? 'border-volt' : 'border-white/10'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg border-2 grid place-items-center shrink-0 ${
                          on ? 'bg-volt border-volt text-ink' : 'border-white/25'
                        }`}
                      >
                        {on && <span className="text-sm font-black leading-none">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold leading-tight truncate">{p.title}</h3>
                        <p className="text-xs text-cream/45">{p.questionCount ?? 0}問</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <input
              value={packIdInput}
              onChange={(e) => setPackIdInput(e.target.value)}
              placeholder="友達のパック ID"
              className="flex-1 rounded-xl bg-coal border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-buzz"
            />
            <Button variant="dark" onClick={addPackById} disabled={!packIdInput.trim()}>
              追加
            </Button>
          </div>

          {selectedPackIds.length > 0 && (
            <p className="text-xs text-volt mt-2.5 font-semibold">
              パックから合計 {totalFromPacks}問（ロビーで追加も可）
            </p>
          )}
        </section>

        <section>
          <SectionLabel n="02" title="ルールを決める" />
          <div className="space-y-4 mt-3">
            <Stepper
              label="問題数"
              value={settings.totalQuestions}
              min={1}
              max={Math.max(1, totalFromPacks || 50)}
              step={1}
              suffix="問"
              onChange={(v) => setSettings({ ...settings, totalQuestions: v })}
            />
            <Stepper
              label="正解時の得点"
              value={settings.correctPoint}
              min={1}
              max={100}
              step={5}
              suffix="点"
              onChange={(v) => setSettings({ ...settings, correctPoint: v })}
            />
            <Stepper
              label="誤答時の得点"
              value={settings.wrongPoint}
              min={-50}
              max={0}
              step={5}
              suffix="点"
              onChange={(v) => setSettings({ ...settings, wrongPoint: v })}
            />

            <div>
              <span className="text-sm font-semibold text-cream/70">出題者モード</span>
              <div className="flex gap-2 mt-2">
                {(
                  [
                    { v: 'rotation', label: '順番に交代', sub: '全員が出題者に' },
                    { v: 'fixed', label: '固定', sub: 'ホストが司会' },
                  ] as { v: QuestionerMode; label: string; sub: string }[]
                ).map((m) => (
                  <button
                    key={m.v}
                    onClick={() => setSettings({ ...settings, questionerMode: m.v })}
                    className={`flex-1 rounded-xl p-3 text-left transition border-2 ${
                      settings.questionerMode === m.v
                        ? 'bg-buzz/15 border-buzz'
                        : 'bg-coal border-white/10'
                    }`}
                  >
                    <div className="font-bold text-sm">{m.label}</div>
                    <div className="text-[11px] text-cream/45">{m.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <p className="text-xs text-buzz-400 bg-buzz/10 border border-buzz/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-ink via-ink to-transparent">
        <Button variant="volt" full disabled={submitting} onClick={handleCreate}>
          {submitting ? '作成中…' : 'ルームを作成する'}
        </Button>
      </div>
    </PhoneShell>
  )
}

function SectionLabel({ n, title, hint }: { n: string; title: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="font-mono text-sm text-buzz">{n}</span>
      <h2 className="font-display text-xl">{title}</h2>
      {hint && <span className="text-xs text-cream/40 ml-auto">{hint}</span>}
    </div>
  )
}

function Stepper({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix: string
  onChange: (v: number) => void
}) {
  const dec = () => onChange(Math.max(min, value - step))
  const inc = () => onChange(Math.min(max, value + step))
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-cream/70">{label}</span>
      <div className="flex items-center gap-3">
        <StepBtn onClick={dec} disabled={value <= min}>
          −
        </StepBtn>
        <span className="font-display text-xl w-16 text-center tabular-nums">
          {value}
          <span className="text-sm text-cream/40 ml-0.5">{suffix}</span>
        </span>
        <StepBtn onClick={inc} disabled={value >= max}>
          +
        </StepBtn>
      </div>
    </div>
  )
}

function StepBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 rounded-full bg-coal border border-white/10 grid place-items-center text-lg font-bold active:scale-90 transition disabled:opacity-30"
    >
      {children}
    </button>
  )
}
