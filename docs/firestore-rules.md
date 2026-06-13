# Firestore Security Rules（v0.1）

`firestore.rules` の設計意図と実装時の注意点。

---

## 前提

### 全参加者は Firebase Auth 必須

ゲストも **Anonymous Auth**（`signInAnonymously`）で `uid` を発行する。

| ユーザー | Auth | memberId |
|----------|------|----------|
| Google ログイン | Google Provider | `auth.uid` |
| ゲスト | Anonymous | `auth.uid` |

`members/{memberId}` のドキュメント ID は **`auth.uid` と同一** にする。Rules が「誰が操作しているか」を判定できる。

```ts
// 参加時
const memberRef = doc(db, 'rooms', roomId, 'members', auth.currentUser!.uid)
await setDoc(memberRef, {
  name: displayName,
  uid: auth.currentUser!.uid,
  score: 0,
  correctCount: 0,
  joinOrder,
  joinedAt: serverTimestamp(),
})
```

### Cloud Functions なし（信頼ホスト / 信頼出題者モデル）

得点更新・フェーズ遷移は **出題者クライアントの Transaction** で行う。Rules で「誰が・いつ・何を」更新できるかを制限する。

---

## コレクション別サマリ

| コレクション | read | create | update | delete |
|-------------|------|--------|--------|--------|
| `quizPacks` | 認証済み全員 | 本人のみ | 本人のみ | 本人のみ |
| `quizPacks/.../questions` | 認証済み全員 | パック所有者 | パック所有者 | パック所有者 |
| `roomCodes/{code}` | 認証済み | 認証済み | ✗ | ✗ |
| `rooms` | メンバー or waiting | ホスト | 下記参照 | ✗ |
| `rooms/.../members` | メンバー | waiting 中に参加 | 名前 / 得点 | ✗ |
| `rooms/.../sessionQuestions` | メンバー | waiting 中 | ✗ | ✗ |

---

## rooms の update パターン

| 操作 | 実行者 | 条件 |
|------|--------|------|
| ゲーム開始 | ホスト | `status: waiting → playing`, `questionOrder` 確定 |
| 早押し | 回答者（メンバー） | `phase: reading → buzzed`, `buzzWinnerId == 自分` |
| 正誤判定 | 出題者 | `phase: buzzed → judged` |
| 次の問題 | 出題者 | `phase: judged → reading` + index++、または `finished` |

`judge` 時は **同一 Transaction** で以下を実行する:

1. `rooms` — `phase → judged`
2. `members/{buzzWinnerId}` — `score`, `correctCount` 更新

---

## パック共有（v0.1）

公開マーケットはなし。**パック ID を教え合う** ことで共有する。

Rules 上、認証済みユーザーは任意の `quizPacks` を read できる（パック ID = 共有の鍵）。

---

## デプロイ

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # プロジェクト ID を選択
firebase deploy --only firestore:rules
```

---

## 既知の制限（v0.1 で許容）

| 制限 | 理由 |
|------|------|
| 早押しの ms 単位公平性 | Firestore 遅延。Rules では改善不可 |
| 出題者クライアント改ざん | Cloud Functions がないため完全防止不可。不正利用者は少数想定 |
| `roomCodes` の create 制限が緩い | 認証済みなら誰でも create 可。ルーム作成と同時にのみ write する実装で運用 |
| ゲーム中の sessionQuestion 追加不可 | Rules で `status == waiting` のみ create 可 |

---

## Emulator でのテスト（推奨）

```bash
firebase emulators:start --only firestore,auth
```

確認項目:

- [ ] 未認証 → すべて deny
- [ ] 他人のパック update/delete → deny
- [ ] 非メンバーの buzz → deny
- [ ] 出題者以外の judge / next → deny
- [ ] `phase != reading` での buzz → deny
- [ ] 出題者以外の score 更新 → deny
