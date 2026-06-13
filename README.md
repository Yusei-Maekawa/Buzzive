# Buzzive（バジブ）

> **集まれば、エンタメになる。**

Buzzive は、友達同士でリアルタイムにクイズ大会を開催できる Web アプリです。

旅行、ドライブ、飲み会、学園祭、サークル活動。

人が集まる場所には、楽しい時間が生まれる可能性があります。

Buzzive は、そんな時間をもっと面白くするために生まれました。

ただクイズに答えるだけではありません。

参加者同士で問題を出し合い、自分たちだけのルールで、自分たちだけのクイズ大会を作ることができます。

---

# 名前の由来

**Buzzive = Buzz + Live**

* Buzz：ブザー、早押し、盛り上がり
* Live：リアルタイム、その瞬間を共有する体験

Buzzive には、

> **「リアルタイムでつながり、その場を盛り上げる」**

という意味が込められています。

---

# Vision

> **集まれば、エンタメになる。**

Buzzive が目指すのは、クイズアプリではありません。

人が集まった時、

* 会話が生まれる
* 盛り上がりが生まれる
* 思い出が生まれる

そんな時間を作るためのエンタメプラットフォームを目指しています。

---

# コンセプト

Buzzive は、

> **「みんなでクイズ大会を作るプラットフォーム」**

です。

参加者は回答者になるだけではなく、出題者にもなれます。

また、ルームごとにルールを自由に設定し、自分たちだけの大会を作ることができます。

---

# 主な特徴

## リアルタイム早押し

参加者はスマートフォンから早押しボタンを押し、回答権を競います。

リアルタイム同期によって、複数人でのクイズ大会を実現します。

---

## 出題者交代システム

Buzzive では、参加者全員が出題者になることができます。

問題ごとに出題者を交代しながら遊べるため、全員がクイズ大会に参加できます。

### 出題者モード（v0.1）

* **順番交代（rotation）** — 問題ごとに参加順で出題者がローテーション
* **固定（fixed）** — ホストが全問題の出題者（司会役）。回答者は全員が早押し

### 将来実装

* 手動指定（任意のメンバーを固定出題者に指定）

---

## クイズパック機能

Buzzive では問題を「クイズパック」として管理します。

**自分で問題を作り、みんなで出し合う** のが基本の遊び方です。

* 事前に各自がパックを作成（Google ログイン）
* ルーム作成時に複数パックを合成して選択
* ロビーで当日の問題を追加（ゲストも可）

例えば、

* ポーカー初級パック
* アニメパック
* 雑学パック
* 学園祭パック
* 身内ネタパック
* 旅行向けパック

などを作成できます。

さらに複数のパックを選択できます。

例：

```txt
ポーカー
＋
身内ネタ
＋
雑学
```

毎回異なるクイズ大会を楽しむことができます。

---

## カスタムルール

ルームごとに大会ルールを設定できます。

### 設定例

* 問題数
* 正解時得点
* 不正解時得点
* 出題者モード

将来的には、

* 誤答ペナルティ
* 回答時間制限
* チーム戦
* ボーナスルール

などにも対応予定です。

---

## 結果・履歴管理

ゲーム終了後には、

* 順位
* 得点
* 正解数

を確認できます（v0.1）。

将来的には、早押し成功数・出題回数の表示や、過去の大会結果の保存にも対応予定です。

---

# 想定利用シーン

## 友達との旅行

ホテルや移動時間でクイズ大会。

---

## ドライブ

休憩中のレクリエーション。

---

## 飲み会

身内ネタ大会。

---

## 学園祭

クイズイベントの運営。

---

## サークル活動

交流イベント。

---

## オンライン通話

離れた場所でも一緒に遊べる。

---

# プレイの流れ

1. （事前）各自がクイズパック・問題を作成
2. ルーム作成（パック選択・ルール設定）
3. ルームコード共有
4. メンバー参加
5. ロビーで当日の問題を追加（任意）
6. ホストがクイズ開始
7. 出題者が問題を出題
8. 回答者が早押し
9. 正誤判定
10. 得点加算
11. 出題者交代（rotation 時）
12. 結果発表

---

## MVP（v0.1）

### クイズパック機能

- クイズパック作成・編集・削除（Google ログインユーザー）
- 問題作成・編集・削除（問題文 + 正解）
- 自分のクイズパック一覧
- ルーム作成時の複数パック選択

### ルーム機能

- ルーム作成（ホスト）
- ルーム参加（コード入力 / URL）
- ルームコード共有
- 参加者一覧
- ロビーでの当日問題追加（`sessionQuestions`、全参加者・ゲスト可）

### クイズ機能

- 選択パック + 当日問題を合成した問題プールから出題
- ゲーム開始時に `questionOrder` を確定
- 問題表示
- 回答権管理（Firestore Transaction）
- 正誤判定（出題者のみ）

### 早押し機能

- リアルタイム早押し
- 早押し成功者の表示

### ルール設定

- 問題数
- 正解時得点
- 不正解時得点
- 出題者モード（**rotation** / **fixed（ホスト固定）**）

### 結果機能

- 最終順位
- 得点表示
- 正解数表示

### v0.1 で含めないもの

- プレイ履歴保存
- パックの公開・マーケット（`isPublic`）
- 出題者の手動指定
- 詳細スタッツ（早押し成功数・出題回数）

---

# 将来的な機能

## クイズパック共有

他ユーザーと問題パックを共有・検索。

---

## 出題者の手動指定

固定出題者をホスト以外の任意メンバーに指定。

---

## AI問題生成

テーマを入力すると問題を自動生成。

---

## QRコード参加

URL共有不要で参加可能。

---

## チーム戦

2vs2
3vs3
団体戦

---

## イベントモード

学園祭
オフ会
交流会向け機能

---

## ランキング機能

* 通算成績
* クイズパック別成績
* 勝率
* 正答率

---

## PWA対応

ホーム画面追加対応。

---

## 技術スタック

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend / Realtime

v0.1 では Firebase を使用する。

- Firebase Authentication
- Cloud Firestore

Firestore のリアルタイムリスナーを利用し、ルーム状態・早押し状態・得点を同期する。

### Hosting

- Vercel

### 将来的な検討

早押しの公平性や低遅延性がより重要になった場合は、以下の技術を検討する。

- Supabase Realtime
- Socket.IO
- Node.js + WebSocket
---

# データ設計

## コレクション構成

```
quizPacks/{packId}
  └── questions/{questionId}

rooms/{roomId}
  ├── members/{memberId}
  └── sessionQuestions/{questionId}   // ロビーで全員が追加する当日問題
```

## rooms

```ts
rooms/{roomId} {
  roomCode: string
  hostId: string
  status: 'waiting' | 'playing' | 'finished'

  selectedPackIds: string[]

  settings: {
    totalQuestions: number
    correctPoint: number
    wrongPoint: number
    questionerMode: 'fixed' | 'rotation'
  }

  // ゲーム進行（開始時に questionOrder を確定）
  phase: 'waiting' | 'reading' | 'buzzed' | 'judged' | 'finished'
  questionIndex: number
  questionOrder: string[]            // 例: ["pack:abc/q1", "session:xyz"]

  currentQuestionerId: string | null
  currentQuestionId: string | null

  // 早押し（Transaction で更新）
  buzzWinnerId: string | null
  buzzedAt: Timestamp | null

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 出題者モードの挙動

* **rotation** — ゲーム開始時は `joinOrder` 最小のメンバー。`nextQuestion` ごとに参加順でローテ
* **fixed** — 常に `hostId` が出題者

## members（rooms/{roomId}/members）

```ts
members/{memberId} {
  name: string
  uid: string | null               // Google ログイン時のみ

  score: number                    // サーバー側 Transaction のみ更新
  correctCount: number

  joinOrder: number
  joinedAt: Timestamp
}
```

## sessionQuestions（rooms/{roomId}/sessionQuestions）

```ts
sessionQuestions/{questionId} {
  questionText: string
  answerText: string
  addedBy: string                  // memberId
  createdAt: Timestamp
}
```

## quizPacks

```ts
quizPacks/{packId} {
  title: string
  createdBy: string                // Firebase Auth uid

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## questions（quizPacks/{packId}/questions）

```ts
questions/{questionId} {
  questionText: string
  answerText: string

  createdAt: Timestamp
}
```

## gameResults（v0.2 以降）

```ts
gameResults/{resultId} {
  roomId: string
  winnerId: string
  totalQuestions: number
  playedAt: Timestamp

  members: {
    memberId: string
    name: string
    score: number
    correctCount: number
    rank: number
  }[]
}
```

---

# 開発方針

Buzzive は、

> **「高機能」より「すぐ遊べる」**

を優先します。

URLを共有して、
数分後にはクイズ大会が始まる。

そんな体験を目指します。

---

# 最後に

Buzzive は、

クイズを解くためのアプリではありません。

**みんなで楽しい時間を作るためのアプリです。**

> **集まれば、エンタメになる。**
