import { useNavigate } from 'react-router-dom'
import { PhoneShell, Button, Avatar } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { mockResults, memberAvatarColor } from '../data/mock'

export default function ResultPage() {
  const nav = useNavigate()
  const { isGoogleUser } = useAuth()

  const ranked = [...mockResults].sort((a, b) => b.score - a.score)
  const [first, second, third, ...rest] = ranked

  return (
    <PhoneShell>
      <div className="absolute -top-12 inset-x-0 h-64 bg-buzz/20 blur-3xl" />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-10 pb-28 relative z-10">
        <div className="text-center mb-8 animate-slideUp">
          <p className="font-mono text-xs tracking-[0.2em] text-volt uppercase">final result</p>
          <h1 className="font-display text-4xl mt-1">大会終了！</h1>
        </div>

        {/* 表彰台 */}
        <div className="flex items-end justify-center gap-2 mb-8">
          <Podium member={second} place={2} h={88} />
          <Podium member={first} place={1} h={120} champion />
          <Podium member={third} place={3} h={64} />
        </div>

        {/* 4位以降 */}
        {rest.length > 0 && (
          <div className="space-y-2 mb-6">
            {rest.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center gap-3 bg-coal rounded-2xl p-3 border border-white/10"
              >
                <span className="font-display text-lg text-cream/40 w-6 text-center">{i + 4}</span>
                <Avatar name={m.name} color={memberAvatarColor(m)} size={32} />
                <span className="flex-1 font-bold truncate">{m.name}</span>
                <span className="font-display text-lg tabular-nums">{m.score}</span>
              </div>
            ))}
          </div>
        )}

        {/* 詳細スタッツ */}
        <div className="rounded-2xl bg-coal/60 border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-cream/70 mb-3">みんなの記録</h3>
          <div className="space-y-3">
            {ranked.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar name={m.name} color={memberAvatarColor(m)} size={28} />
                <span className="text-sm font-bold w-16 truncate">{m.name}</span>
                <div className="flex-1 flex gap-3 text-xs text-cream/55">
                  <Stat icon="○" v={m.correctCount} label="正解" />
                  <Stat icon="⚡" v={m.buzzCount ?? 0} label="早押し" />
                  <Stat icon="?" v={m.questionerCount ?? 0} label="出題" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isGoogleUser && (
          <p className="text-center text-xs text-cream/40 mt-4">
            Googleログインすると、この記録が履歴に残せます
          </p>
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-ink via-ink to-transparent space-y-2.5">
        <Button variant="volt" full onClick={() => nav('/rooms/new')}>
          もう一度あそぶ
        </Button>
        <Button variant="ghost" full onClick={() => nav('/')}>
          トップに戻る
        </Button>
      </div>
    </PhoneShell>
  )
}

function Podium({
  member,
  place,
  h,
  champion,
}: {
  member: (typeof mockResults)[number]
  place: number
  h: number
  champion?: boolean
}) {
  const medal = ['', '🥇', '🥈', '🥉'][place]
  return (
    <div className="flex flex-col items-center w-[30%]">
      {champion && <div className="text-2xl mb-1 animate-wiggle">👑</div>}
      <Avatar name={member.name} color={memberAvatarColor(member)} size={champion ? 54 : 42} />
      <div className="font-bold text-sm mt-1.5 truncate max-w-full">{member.name}</div>
      <div className="font-display text-xl text-volt tabular-nums leading-none">{member.score}</div>
      <div
        className="w-full rounded-t-xl mt-2 grid place-items-start justify-center pt-2"
        style={{
          height: h,
          background: champion
            ? 'linear-gradient(180deg,#FF3D7F,#e91e63)'
            : 'rgba(255,255,255,0.06)',
        }}
      >
        <span className="text-lg">{medal}</span>
      </div>
    </div>
  )
}

function Stat({ icon, v, label }: { icon: string; v: number; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-cream/30">{icon}</span>
      <span className="font-bold text-cream/80 tabular-nums">{v}</span>
      <span className="text-cream/30">{label}</span>
    </span>
  )
}
