import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PhoneShell, TopBar, Card, Button } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import {
  createQuestion,
  deleteQuestion,
  getPack,
  listQuestions,
  updateQuestion,
} from '../services/packService'
import type { Question } from '../types'

export default function QuestionListPage() {
  const nav = useNavigate()
  const { packId } = useParams()
  const { isGoogleUser, loading: authLoading } = useAuth()
  const [packTitle, setPackTitle] = useState('問題')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Question | null>(null)

  const load = async () => {
    if (!packId) return
    setLoading(true)
    setError(null)
    try {
      const pack = await getPack(packId)
      if (!pack) throw new Error('パックが見つかりません')
      setPackTitle(pack.title)
      setQuestions(await listQuestions(packId))
    } catch (e) {
      setError(e instanceof Error ? e.message : '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading || !isGoogleUser || !packId) {
      setLoading(false)
      return
    }
    load()
  }, [authLoading, isGoogleUser, packId])

  const handleSave = async (q: Question, isNew: boolean) => {
    if (!packId) return
    if (isNew) {
      await createQuestion(packId, q.questionText, q.answerText)
    } else {
      await updateQuestion(packId, q.id, q.questionText, q.answerText)
    }
    await load()
    setEditing(null)
  }

  const handleDelete = async (questionId: string) => {
    if (!packId || !confirm('この問題を削除しますか？')) return
    try {
      await deleteQuestion(packId, questionId)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : '削除に失敗しました')
    }
  }

  if (authLoading || loading) {
    return (
      <PhoneShell>
        <div className="flex-1 grid place-items-center">
          <p className="text-cream/50 text-sm">読み込み中…</p>
        </div>
      </PhoneShell>
    )
  }

  if (!isGoogleUser) {
    return (
      <PhoneShell>
        <TopBar title="問題" onBack={() => nav('/packs')} />
        <div className="flex-1 px-5 py-10 text-center">
          <p className="text-cream/70">Google ログインが必要です。</p>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell>
      <TopBar title={packTitle} onBack={() => nav('/packs')} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28">
        <p className="text-sm text-cream/55 mb-4">{questions.length}問の問題</p>

        {error && (
          <p className="text-xs text-buzz-400 bg-buzz/10 border border-buzz/20 rounded-xl px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {questions.length === 0 ? (
          <div className="mt-16 text-center">
            <div className="font-display text-5xl text-cream/15 mb-3">?</div>
            <p className="text-cream/50 font-semibold">まだ問題がありません</p>
            <p className="text-sm text-cream/35 mt-1">最初の問題を追加しましょう</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <Card key={q.id} onClick={() => setEditing(q)} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-sm text-cream/30 mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug line-clamp-2">{q.questionText}</p>
                    <p className="text-xs text-cream/40 mt-2">答: {q.answerText}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <button
          onClick={() =>
            setEditing({
              id: '',
              packId: packId ?? '',
              questionText: '',
              answerText: '',
            })
          }
          className="mt-3 w-full rounded-2xl border-2 border-dashed border-white/15 py-5 text-cream/50 font-semibold hover:border-volt hover:text-volt transition active:scale-[0.99]"
        >
          + 問題を追加
        </button>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-ink via-ink to-transparent">
        <Button variant="dark" full onClick={() => nav('/packs')}>
          完了
        </Button>
      </div>

      {editing && (
        <QuestionSheet
          question={editing}
          isNew={!editing.id}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          onDelete={editing.id ? () => handleDelete(editing.id) : undefined}
        />
      )}
    </PhoneShell>
  )
}

function QuestionSheet({
  question,
  isNew,
  onClose,
  onSave,
  onDelete,
}: {
  question: Question
  isNew: boolean
  onClose: () => void
  onSave: (q: Question, isNew: boolean) => Promise<void>
  onDelete?: () => void
}) {
  const [q, setQ] = useState(question)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await onSave(q, isNew)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-coal rounded-t-3xl border-t border-white/10 p-5 pb-7 max-h-[88%] overflow-y-auto no-scrollbar animate-slideUp">
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
        <h2 className="font-display text-2xl mb-5">{isNew ? '問題を追加' : '問題を編集'}</h2>

        <label className="block text-sm font-semibold text-cream/70 mb-2">問題文</label>
        <textarea
          value={q.questionText}
          onChange={(e) => setQ({ ...q, questionText: e.target.value })}
          rows={3}
          placeholder="問題を入力"
          maxLength={500}
          className="w-full rounded-2xl bg-ink border border-white/10 px-4 py-3 outline-none focus:border-buzz transition resize-none mb-4"
        />

        <label className="block text-sm font-semibold text-cream/70 mb-2">答え</label>
        <input
          value={q.answerText}
          onChange={(e) => setQ({ ...q, answerText: e.target.value })}
          placeholder="正解"
          maxLength={500}
          className="w-full rounded-2xl bg-ink border border-white/10 px-4 py-3 outline-none focus:border-buzz transition mb-4"
        />

        {error && (
          <p className="text-xs text-buzz-400 mb-3">{error}</p>
        )}

        <Button
          variant="volt"
          full
          disabled={!q.questionText.trim() || !q.answerText.trim() || saving}
          onClick={handleSave}
        >
          {saving ? '保存中…' : '保存'}
        </Button>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="w-full mt-3 text-sm text-buzz-400 font-semibold py-2"
          >
            この問題を削除
          </button>
        )}
      </div>
    </div>
  )
}
