import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import TopPage from './pages/TopPage'
import PackListPage from './pages/PackListPage'
import PackEditPage from './pages/PackEditPage'
import QuestionListPage from './pages/QuestionListPage'
import JoinPage from './pages/JoinPage'
import RoomCreatePage from './pages/RoomCreatePage'
import RoomLobbyPage from './pages/RoomLobbyPage'
import GamePage from './pages/GamePage'
import ResultPage from './pages/ResultPage'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/packs" element={<PackListPage />} />
        <Route path="/packs/new" element={<PackEditPage />} />
        <Route path="/packs/:packId/edit" element={<PackEditPage />} />
        <Route path="/packs/:packId/questions" element={<QuestionListPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/rooms/new" element={<RoomCreatePage />} />
        <Route path="/rooms/:roomId/lobby" element={<RoomLobbyPage />} />
        <Route path="/rooms/:roomId/game" element={<GamePage />} />
        <Route path="/rooms/:roomId/result" element={<ResultPage />} />
      </Routes>
      <FlowNav />
    </>
  )
}

// モック確認用：全画面に直接ジャンプできる小さなナビ（実装では削除）
const SCREENS: { path: string; label: string }[] = [
  { path: '/', label: 'Top' },
  { path: '/packs', label: 'パック一覧' },
  { path: '/packs/new', label: 'パック作成' },
  { path: '/packs/pack-1/questions', label: '問題一覧' },
  { path: '/rooms/new', label: 'ルーム作成' },
  { path: '/rooms/MOCK/lobby', label: 'ロビー' },
  { path: '/rooms/MOCK/game', label: 'ゲーム' },
  { path: '/rooms/MOCK/result', label: '結果' },
]

function FlowNav() {
  const nav = useNavigate()
  const loc = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-[#1b1726] border border-white/10 rounded-2xl p-2 shadow-xl w-44 animate-slideUp">
          <p className="text-[10px] uppercase tracking-wider text-white/40 px-2 py-1 font-mono">
            画面ジャンプ
          </p>
          {SCREENS.map((s) => {
            const active = loc.pathname === s.path
            return (
              <button
                key={s.path}
                onClick={() => {
                  nav(s.path)
                  setOpen(false)
                }}
                className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition ${
                  active ? 'bg-volt text-ink font-bold' : 'text-white/70 hover:bg-white/5'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-12 h-12 rounded-full bg-volt text-ink font-black grid place-items-center shadow-pop active:scale-90 transition"
        aria-label="画面ジャンプ"
      >
        {open ? '✕' : '☰'}
      </button>
    </div>
  )
}
