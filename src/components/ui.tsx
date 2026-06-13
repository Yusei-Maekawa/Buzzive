import type { ReactNode, ButtonHTMLAttributes } from 'react'

// ---- 画面シェル（スマホ幅の枠） ----
export function PhoneShell({ children }: { children: ReactNode }) {
  return (
    <div className="grain min-h-screen w-full max-w-[440px] bg-ink text-cream flex flex-col relative overflow-hidden">
      {children}
    </div>
  )
}

// ---- トップバー ----
export function TopBar({
  title,
  onBack,
  right,
}: {
  title?: string
  onBack?: () => void
  right?: ReactNode
}) {
  return (
    <header className="flex items-center gap-3 px-5 pt-6 pb-4 shrink-0">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="戻る"
          className="w-9 h-9 grid place-items-center rounded-full bg-coal border border-white/10 active:scale-95 transition"
        >
          <span className="text-lg leading-none">‹</span>
        </button>
      )}
      {title && <h1 className="font-display text-2xl tracking-tight">{title}</h1>}
      <div className="ml-auto">{right}</div>
    </header>
  )
}

// ---- ボタン ----
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'volt' | 'ghost' | 'dark'
  full?: boolean
}
export function Button({ variant = 'primary', full, className = '', children, ...rest }: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-bold rounded-2xl px-5 py-3.5 transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-40 disabled:pointer-events-none'
  const variants: Record<string, string> = {
    primary: 'bg-buzz text-white shadow-pop',
    volt: 'bg-volt text-ink shadow-pop',
    dark: 'bg-coal text-cream border border-white/10',
    ghost: 'bg-transparent text-cream/70 hover:text-cream',
  }
  return (
    <button className={`${base} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`} {...rest}>
      {children}
    </button>
  )
}

// ---- カード ----
export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-coal border border-white/10 ${
        onClick ? 'cursor-pointer active:scale-[0.99] transition' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

// ---- 難易度バッジ ----
export function DiffBadge({ difficulty = 'normal' }: { difficulty?: 'easy' | 'normal' | 'hard' }) {
  const map = {
    easy: { label: 'やさしい', cls: 'bg-sky2/20 text-sky2' },
    normal: { label: 'ふつう', cls: 'bg-volt/20 text-volt' },
    hard: { label: 'むずかしい', cls: 'bg-buzz/20 text-buzz-400' },
  }
  const d = map[difficulty]
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${d.cls}`}>{d.label}</span>
}

// ---- アバター ----
export function Avatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  return (
    <div
      className="rounded-xl grid place-items-center font-display text-ink shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.42 }}
    >
      {name.slice(0, 1)}
    </div>
  )
}

// ---- カテゴリチップ ----
export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm font-semibold px-3.5 py-2 rounded-full border transition active:scale-95 ${
        active
          ? 'bg-volt text-ink border-volt'
          : 'bg-coal text-cream/70 border-white/10 hover:border-white/30'
      }`}
    >
      {children}
    </button>
  )
}
