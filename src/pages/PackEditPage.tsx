import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PhoneShell, TopBar, Button } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { countQuestions, createPack, deletePack, getPack, updatePack } from '../services/packService'

export default function PackEditPage() {
  const nav = useNavigate()
  const { packId } = useParams()
  const { isGoogleUser, loading: authLoading } = useAuth()
  const isEdit = Boolean(packId)

  const [title, setTitle] = useState('')
  const [questionCount, setQuestionCount] = useState(0)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit || !packId) return
    getPack(packId)
      .then(async (pack) => {
        if (!pack) throw new Error('パックが見つかりません')
        setTitle(pack.title)
        setQuestionCount(await countQuestions(packId))
      })
      .catch((e) => setError(e instanceof Error ? e.message : '読み込みに失敗しました'))
      .finally(() => setLoading(false))
  }, [isEdit, packId])

  const handleSave = async () => {
    setError(null)
    setSubmitting(true)
    try {
      if (isEdit && packId) {
        await updatePack(packId, title)
        nav(`/packs/${packId}/questions`)
      } else {
        const id = await createPack(title)
        nav(`/packs/${id}/questions`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!packId || !confirm('このパックを削除しますか？')) return
    setSubmitting(true)
    try {
      await deletePack(packId)
      nav('/packs')
    } catch (e) {
      setError(e instanceof Error ? e.message : '削除に失敗しました')
      setSubmitting(false)
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
        <TopBar title="パック" onBack={() => nav('/')} />
        <div className="flex-1 px-5 py-10 text-center">
          <p className="text-cream/70">Google ログインが必要です。</p>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell>
      <TopBar title={isEdit ? 'パックを編集' : '新しいパック'} onBack={() => nav(-1)} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-28 space-y-6">
        <Field label="パック名">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：身内ネタ大会"
            maxLength={80}
            className="w-full rounded-2xl bg-coal border border-white/10 px-4 py-3.5 text-lg outline-none focus:border-buzz transition"
          />
        </Field>

        {isEdit && (
          <div className="pt-2 space-y-3">
            <Button variant="dark" full onClick={() => nav(`/packs/${packId}/questions`)}>
              問題を編集する（{questionCount}問）→
            </Button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="w-full text-sm text-buzz-400 font-semibold py-2 disabled:opacity-40"
            >
              このパックを削除
            </button>
          </div>
        )}

        {error && (
          <p className="text-xs text-buzz-400 bg-buzz/10 border border-buzz/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-ink via-ink to-transparent">
        <Button variant="volt" full disabled={!title.trim() || submitting} onClick={handleSave}>
          {submitting ? '保存中…' : isEdit ? '保存する' : 'パックを作成して問題を追加'}
        </Button>
      </div>
    </PhoneShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-cream/70 mb-2">{label}</label>
      {children}
    </div>
  )
}
