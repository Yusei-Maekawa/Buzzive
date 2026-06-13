import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PhoneShell, TopBar, Button } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { joinRoom } from '../services/roomService'

export default function JoinPage() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { isSignedIn, loading: authLoading, displayName } = useAuth()
  const [code, setCode] = useState(params.get('code')?.toUpperCase() ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fromUrl = params.get('code')
    if (fromUrl) setCode(fromUrl.toUpperCase())
  }, [params])

  const handleJoin = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const roomId = await joinRoom(code)
      nav(`/rooms/${roomId}/lobby`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '参加に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <PhoneShell>
        <div className="flex-1 grid place-items-center">
          <p className="text-cream/50 text-sm">読み込み中…</p>
        </div>
      </PhoneShell>
    )
  }

  if (!isSignedIn) {
    return (
      <PhoneShell>
        <TopBar title="ルームに参加" onBack={() => nav('/')} />
        <div className="flex-1 px-5 py-10 text-center space-y-4">
          <p className="text-cream/70">参加するには、先にトップページで名前を登録してください。</p>
          <Button variant="volt" full onClick={() => nav('/')}>
            トップへ戻る
          </Button>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell>
      <TopBar title="ルームに参加" onBack={() => nav('/')} />

      <div className="flex-1 px-5 pt-8 pb-28">
        <p className="text-sm text-cream/55 mb-6">
          {displayName} さんとして参加します。6桁のルームコードを入力してください。
        </p>

        <label className="block text-sm font-semibold text-cream/70 mb-2">ルームコード</label>
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
          placeholder="ABC123"
          maxLength={6}
          className="w-full rounded-2xl bg-coal border border-white/10 px-4 py-4 text-2xl font-display tracking-[0.2em] text-center outline-none focus:border-buzz transition uppercase"
        />

        {error && (
          <p className="mt-4 text-xs text-buzz-400 bg-buzz/10 border border-buzz/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-ink via-ink to-transparent">
        <Button variant="volt" full disabled={code.length !== 6 || submitting} onClick={handleJoin}>
          {submitting ? '参加中…' : 'ルームに参加'}
        </Button>
      </div>
    </PhoneShell>
  )
}
