import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhoneShell, TopBar, Card, Button } from '../components/ui'
import { seedDemoPacks } from '../lib/seedDemoPacks'
import { useAuth } from '../hooks/useAuth'
import { enrichPacksWithCount, listMyPacks } from '../services/packService'
import type { QuizPack } from '../types'

export default function PackListPage() {
  const nav = useNavigate()
  const { isGoogleUser, user, loading: authLoading } = useAuth()
  const [packs, setPacks] = useState<QuizPack[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadPacks = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const list = await listMyPacks(user.uid)
      setPacks(await enrichPacksWithCount(list))
    } catch (e) {
      setError(e instanceof Error ? e.message : '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return
    if (!isGoogleUser || !user) {
      setLoading(false)
      return
    }
    loadPacks()
  }, [authLoading, isGoogleUser, user, loadPacks])

  const handleSeed = async () => {
    setSeeding(true)
    setError(null)
    setMessage(null)
    try {
      const { created, skipped } = await seedDemoPacks()
      await loadPacks()
      if (created === 0) {
        setMessage('デモパックはすでに投入済みです')
      } else {
        setMessage(`${created} 件のテスト用パックを作成しました（${skipped} 件スキップ）`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '投入に失敗しました')
    } finally {
      setSeeding(false)
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
        <TopBar title="クイズパック" onBack={() => nav('/')} />
        <div className="flex-1 px-5 py-10 text-center space-y-4">
          <p className="text-cream/70">パック管理には Google ログインが必要です。</p>
          <Button variant="volt" full onClick={() => nav('/')}>
            トップへ戻る
          </Button>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell>
      <TopBar title="クイズパック" onBack={() => nav('/')} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-36">
        <p className="text-sm text-cream/55 mb-5">
          自分で作った問題パック。ルーム作成時に選べます。友達にはパック ID を教えて共有できます。
        </p>

        <Button variant="dark" full disabled={seeding} onClick={handleSeed}>
          {seeding ? '投入中…' : 'テスト用パックを投入'}
        </Button>
        <p className="text-[11px] text-cream/40 mt-2 mb-5 text-center">
          雑学・アニメ・身内ネタのサンプル問題が入ります（2回目以降はスキップ）
        </p>

        {message && (
          <p className="text-xs text-volt bg-volt/10 border border-volt/20 rounded-xl px-3 py-2 mb-4">
            {message}
          </p>
        )}

        {error && (
          <p className="text-xs text-buzz-400 bg-buzz/10 border border-buzz/20 rounded-xl px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {packs.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-cream/50 font-semibold">まだパックがありません</p>
            <p className="text-sm text-cream/35 mt-1">上のボタンでテスト投入するか、新規作成してください</p>
          </div>
        ) : (
          <div className="space-y-3">
            {packs.map((p, i) => (
              <Card
                key={p.id}
                onClick={() => nav(`/packs/${p.id}/questions`)}
                className="p-4 animate-slideUp"
              >
                <div style={{ animationDelay: `${i * 40}ms` }}>
                  <h3 className="font-display text-xl leading-tight truncate">{p.title}</h3>
                  <p className="text-xs text-cream/45 mt-1 font-mono truncate">ID: {p.id}</p>
                  <p className="text-sm text-buzz mt-2 font-bold">{p.questionCount ?? 0} 問</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        <button
          onClick={() => nav('/packs/new')}
          className="mt-3 w-full rounded-2xl border-2 border-dashed border-white/15 py-5 text-cream/50 font-semibold hover:border-volt hover:text-volt transition active:scale-[0.99]"
        >
          + 新しいパックを作る
        </button>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-ink via-ink to-transparent">
        <Button variant="volt" full onClick={() => nav('/packs/new')}>
          新しいパックを作る
        </Button>
      </div>
    </PhoneShell>
  )
}
