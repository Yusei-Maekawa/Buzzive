import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PhoneShell, TopBar, Button, Avatar } from '../components/ui'
import { AVATAR_COLORS } from '../data/mock'
import { DISPLAY_NAME_MAX } from '../lib/session'
import { useAuth } from '../hooks/useAuth'
import { useRoom } from '../hooks/useRoom'
import { startGame } from '../services/gameService'
import { resolvePacks } from '../services/packService'
import { addSessionQuestion, memberLabel, updateMemberName } from '../services/roomService'
import type { QuizPack } from '../types'

export default function RoomLobbyPage() {
  const nav = useNavigate()
  const { roomId } = useParams()
  const { isSignedIn, displayName, setDisplayName } = useAuth()
  const { room, members, sessionQuestions, loading, error, isHost, isMember, myMember } = useRoom(roomId)
  const [copied, setCopied] = useState<'code' | 'url' | null>(null)
  const [packs, setPacks] = useState<QuizPack[]>([])
  const [questionText, setQuestionText] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [adding, setAdding] = useState(false)
  const [starting, setStarting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSignedIn) nav('/')
  }, [isSignedIn, nav])

  useEffect(() => {
    if (room?.status === 'playing' && roomId) {
      nav(`/rooms/${roomId}/game`, { replace: true })
    }
  }, [room?.status, roomId, nav])

  useEffect(() => {
    if (!room?.selectedPackIds.length) return
    resolvePacks(room.selectedPackIds).then(setPacks).catch(() => setPacks([]))
  }, [room?.selectedPackIds])

  const copy = async (type: 'code' | 'url') => {
    if (!room) return
    const url = `${window.location.origin}/join?code=${room.roomCode}`
    const text = type === 'code' ? room.roomCode : url
    await navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(type)
    setTimeout(() => setCopied(null), 1600)
  }

  const handleAddQuestion = async () => {
    if (!roomId) return
    setActionError(null)
    setAdding(true)
    try {
      await addSessionQuestion(roomId, questionText, answerText)
      setQuestionText('')
      setAnswerText('')
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '追加に失敗しました')
    } finally {
      setAdding(false)
    }
  }

  const handleSaveName = async () => {
    if (!roomId) return
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setActionError(null)
    setSavingName(true)
    try {
      await updateMemberName(roomId, trimmed)
      setDisplayName(trimmed)
      setEditingName(false)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '名前の変更に失敗しました')
    } finally {
      setSavingName(false)
    }
  }

  const handleStart = async () => {
    if (!roomId) return
    setActionError(null)
    setStarting(true)
    try {
      await startGame(roomId)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '開始に失敗しました')
    } finally {
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <PhoneShell>
        <div className="flex-1 grid place-items-center">
          <p className="text-cream/50 text-sm">ロビーに接続中…</p>
        </div>
      </PhoneShell>
    )
  }

  if (error || !room) {
    return (
      <PhoneShell>
        <TopBar title="ロビー" onBack={() => nav('/')} />
        <div className="flex-1 px-5 py-10 text-center space-y-4">
          <p className="text-buzz-400">{error ?? 'ルームが見つかりません'}</p>
          <Button variant="volt" full onClick={() => nav('/')}>
            トップへ戻る
          </Button>
        </div>
      </PhoneShell>
    )
  }

  if (!isMember) {
    return (
      <PhoneShell>
        <TopBar title="ロビー" onBack={() => nav('/')} />
        <div className="flex-1 px-5 py-10 text-center space-y-4">
          <p className="text-cream/70">このルームのメンバーではありません。</p>
          <Button variant="volt" full onClick={() => nav(`/join?code=${room.roomCode}`)}>
            参加する
          </Button>
        </div>
      </PhoneShell>
    )
  }

  const packQuestionCount = packs.reduce((s, p) => s + (p.questionCount ?? 0), 0)
  const totalQuestionsAvailable = packQuestionCount + sessionQuestions.length

  return (
    <PhoneShell>
      <TopBar title="ロビー" onBack={() => nav('/')} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28">
        <div className="rounded-3xl bg-buzz p-6 shadow-pop text-center mb-6 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/15" />
          <p className="text-white/80 text-sm font-semibold relative">この番号で参加できます</p>
          <div className="font-display text-5xl tracking-[0.15em] text-white mt-2 mb-4 relative">
            {room.roomCode}
          </div>
          <div className="flex gap-2 justify-center relative">
            <button
              onClick={() => copy('code')}
              className="bg-white text-buzz font-bold rounded-full px-4 py-2 text-sm active:scale-95 transition"
            >
              {copied === 'code' ? '✓ コピー' : 'コード'}
            </button>
            <button
              onClick={() => copy('url')}
              className="bg-white/20 text-white font-bold rounded-full px-4 py-2 text-sm active:scale-95 transition"
            >
              {copied === 'url' ? '✓ コピー' : 'URL'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-coal/60 border border-white/10 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-cream/70">あなたの表示名</h3>
            {!editingName && (
              <button
                type="button"
                onClick={() => {
                  setNameInput(myMember?.name ?? displayName)
                  setEditingName(true)
                }}
                className="text-xs text-volt font-semibold"
              >
                変更
              </button>
            )}
          </div>
          {editingName ? (
            <div className="space-y-2">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={DISPLAY_NAME_MAX}
                className="w-full rounded-xl bg-ink border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-buzz"
              />
              <div className="flex gap-2">
                <Button variant="volt" full disabled={!nameInput.trim() || savingName} onClick={handleSaveName}>
                  {savingName ? '保存中…' : '保存'}
                </Button>
                <Button variant="dark" full onClick={() => setEditingName(false)}>
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <p className="font-bold">{myMember?.name ?? displayName}</p>
          )}
        </div>

        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-xl">参加者</h2>
          <span className="text-sm text-cream/50">{members.length}人</span>
        </div>
        <div className="space-y-2.5 mb-6">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 bg-coal rounded-2xl p-3 border border-white/10"
            >
              <Avatar
                name={m.name}
                color={AVATAR_COLORS[m.joinOrder % AVATAR_COLORS.length]}
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold leading-tight">{m.name}</div>
                <div className="text-xs text-cream/45">{memberLabel(m, room.hostId)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-coal/60 border border-white/10 p-4 mb-6">
          <h3 className="text-sm font-semibold text-cream/70 mb-3">問題を追加（任意）</h3>
          <input
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="問題文"
            maxLength={500}
            className="w-full rounded-xl bg-ink border border-white/10 px-3 py-2.5 text-sm mb-2 outline-none focus:border-buzz"
          />
          <input
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="正解"
            maxLength={500}
            className="w-full rounded-xl bg-ink border border-white/10 px-3 py-2.5 text-sm mb-3 outline-none focus:border-buzz"
          />
          <Button
            variant="dark"
            full
            disabled={!questionText.trim() || !answerText.trim() || adding}
            onClick={handleAddQuestion}
          >
            {adding ? '追加中…' : 'このルームに問題を追加'}
          </Button>
          {sessionQuestions.length > 0 && (
            <p className="text-xs text-volt mt-2 font-semibold">
              当日問題 {sessionQuestions.length}問
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-coal/60 border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-cream/70 mb-3">この大会のルール</h3>
          <dl className="grid grid-cols-2 gap-y-2.5 text-sm">
            <Stat label="問題数" value={`${room.settings.totalQuestions}問`} />
            <Stat label="利用可能" value={`${totalQuestionsAvailable}問`} />
            <Stat label="正解" value={`+${room.settings.correctPoint}点`} />
            <Stat label="誤答" value={`${room.settings.wrongPoint}点`} />
            <Stat
              label="出題者"
              value={room.settings.questionerMode === 'rotation' ? '順番交代' : 'ホスト固定'}
            />
          </dl>
          {packs.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-1.5">
              {packs.map((p) => (
                <span
                  key={p.id}
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-volt/20 text-volt"
                >
                  {p.title}
                </span>
              ))}
            </div>
          )}
        </div>

        {actionError && (
          <p className="mt-4 text-xs text-buzz-400 bg-buzz/10 border border-buzz/20 rounded-xl px-3 py-2">
            {actionError}
          </p>
        )}
      </div>

      {isHost && (
        <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-ink via-ink to-transparent space-y-2">
          <Button
            variant="volt"
            full
            disabled={starting || totalQuestionsAvailable < room.settings.totalQuestions}
            onClick={handleStart}
          >
            {starting ? '開始中…' : 'クイズをはじめる'}
          </Button>
          <p className="text-center text-[11px] text-cream/40">
            {totalQuestionsAvailable < room.settings.totalQuestions
              ? `問題が ${room.settings.totalQuestions - totalQuestionsAvailable} 問足りません`
              : 'ホストだけが開始できます'}
          </p>
        </div>
      )}
    </PhoneShell>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-cream/45 text-xs">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  )
}
