import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhoneShell, Button } from '../components/ui'
import { DISPLAY_NAME_MAX } from '../lib/session'
import { useAuth } from '../hooks/useAuth'

export default function TopPage() {
  const nav = useNavigate()
  const {
    loading,
    displayName,
    isGoogleUser,
    isGuest,
    isSignedIn,
    firebaseReady,
    authError,
    signInWithGoogle,
    signInAsGuest,
    setDisplayName,
    signOut,
    clearAuthError,
  } = useAuth()
  const [mode, setMode] = useState<'home' | 'guest' | 'editName'>('home')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleGoogleSignIn = async () => {
    setSubmitting(true)
    clearAuthError()
    await signInWithGoogle()
    setSubmitting(false)
  }

  const handleGuestSignIn = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setSubmitting(true)
    clearAuthError()
    await signInAsGuest(trimmed)
    setSubmitting(false)
  }

  const handleSaveName = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setDisplayName(trimmed)
    setMode('home')
  }

  const openEditName = () => {
    setName(displayName)
    setMode('editName')
  }

  if (loading) {
    return (
      <PhoneShell>
        <div className="flex-1 grid place-items-center">
          <p className="text-cream/50 text-sm">読み込み中…</p>
        </div>
      </PhoneShell>
    )
  }

  return (
    <PhoneShell>
      <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-buzz/20 blur-2xl" />
      <div className="absolute top-44 -left-16 w-44 h-44 rounded-full bg-volt/10 blur-2xl" />

      <div className="flex-1 flex flex-col px-6 pt-16 pb-8 relative z-10">
        <div className="animate-slideUp">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-3 h-3 rounded-full bg-buzz animate-pulse" />
            <span className="font-mono text-xs tracking-[0.2em] text-volt uppercase">live quiz</span>
          </div>
          <h1 className="font-display text-7xl leading-[0.92] tracking-tighter">
            Buzz<span className="text-buzz">ive</span>
          </h1>
          <p className="mt-5 text-2xl font-bold leading-snug text-cream/95">
            集まれば、
            <br />
            エンタメになる。
          </p>
          <p className="mt-3 text-sm text-cream/55 leading-relaxed">
            友達同士でリアルタイムに早押しクイズ大会。
            <br />
            URLを共有して、数分後には大会がはじまる。
          </p>
        </div>

        {!firebaseReady && (
          <p className="mt-4 text-xs text-amber-300/90 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2">
            Firebase 未設定（.env）。UI 確認モードで動作しています。
          </p>
        )}

        {authError && (
          <p className="mt-4 text-xs text-buzz-400 bg-buzz/10 border border-buzz/20 rounded-xl px-3 py-2">
            {authError}
          </p>
        )}

        <div className="my-10 grid place-items-center">
          <div className="w-40 h-40 rounded-full bg-buzz grid place-items-center shadow-pop animate-pulseRing">
            <span className="font-display text-3xl text-white">BUZZ</span>
          </div>
        </div>

        <div className="mt-auto space-y-3 animate-slideUp">
          {isSignedIn && mode === 'editName' ? (
            <NameForm
              name={name}
              onChange={setName}
              onSave={handleSaveName}
              onBack={() => setMode('home')}
              submitLabel="保存する"
            />
          ) : isSignedIn ? (
            <>
              <div className="text-center text-sm text-cream/60 mb-1">
                {displayName} さんとして参加中
                {isGoogleUser && <span className="ml-1 text-volt">· Google</span>}
                {isGuest && !isGoogleUser && <span className="ml-1 text-cream/40">· ゲスト</span>}
              </div>
              <Button variant="ghost" full onClick={openEditName}>
                表示名を変更
              </Button>
              <Button variant="volt" full onClick={() => nav('/rooms/new')}>
                ルームを作る
              </Button>
              <Button variant="dark" full onClick={() => nav('/join')}>
                ルームに参加する
              </Button>
              {isGoogleUser && (
                <Button variant="ghost" full onClick={() => nav('/packs')}>
                  クイズパックを管理 →
                </Button>
              )}
              <Button variant="ghost" full onClick={() => signOut()}>
                ログアウト
              </Button>
            </>
          ) : mode === 'home' ? (
            <>
              <Button variant="primary" full disabled={submitting} onClick={handleGoogleSignIn}>
                <GoogleMark /> Googleではじめる
              </Button>
              <Button variant="dark" full onClick={() => setMode('guest')}>
                ゲストとして参加
              </Button>
              <p className="text-center text-xs text-cream/40 pt-1">
                パック作成にはGoogleログインが必要です
              </p>
            </>
          ) : (
            <NameForm
              name={name}
              onChange={setName}
              onSave={handleGuestSignIn}
              onBack={() => setMode('home')}
              submitLabel="この名前ではじめる"
              disabled={submitting}
            />
          )}
        </div>
      </div>
    </PhoneShell>
  )
}

function NameForm({
  name,
  onChange,
  onSave,
  onBack,
  submitLabel,
  disabled,
}: {
  name: string
  onChange: (v: string) => void
  onSave: () => void
  onBack: () => void
  submitLabel: string
  disabled?: boolean
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-cream/70">表示名</label>
      <input
        autoFocus
        value={name}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例：ゆうた"
        maxLength={DISPLAY_NAME_MAX}
        className="w-full rounded-2xl bg-coal border border-white/10 px-4 py-3.5 text-lg outline-none focus:border-buzz transition"
      />
      <Button variant="volt" full disabled={!name.trim() || disabled} onClick={onSave}>
        {submitLabel}
      </Button>
      <Button variant="ghost" full onClick={onBack}>
        ‹ 戻る
      </Button>
    </div>
  )
}

function GoogleMark() {
  return (
    <span className="w-5 h-5 grid place-items-center bg-white rounded-full text-[13px] font-black text-buzz">
      G
    </span>
  )
}
