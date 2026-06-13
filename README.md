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

### 出題者モード

* 固定出題者
* 順番交代
* 手動指定（将来実装）

---

## クイズパック機能

Buzzive では問題を「クイズパック」として管理します。

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
* 早押し成功数
* 出題回数

を確認できます。

また、過去の大会結果も保存されます。

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

1. ルーム作成
2. ルームコード共有
3. メンバー参加
4. クイズパック選択
5. ルール設定
6. クイズ開始
7. 出題者が問題を出題
8. 回答者が早押し
9. 正誤判定
10. 得点加算
11. 出題者交代
12. 結果発表

---

# MVP（v0.1）

## ルーム機能

* ルーム作成
* ルーム参加
* ルームコード共有
* 参加者一覧

---

## クイズ機能

* クイズパック選択
* 問題表示
* 回答権管理
* 正誤判定

---

## 早押し機能

* リアルタイム早押し
* 早押し順位表示

---

## ルール設定

* 問題数
* 正解時得点
* 不正解時得点
* 出題者モード

---

## 出題者機能

* 固定出題者
* 順番交代

---

## 結果機能

* 最終順位
* 得点表示
* 正解数表示
* プレイ履歴保存

---

# 将来的な機能

## クイズパック作成

ユーザー自身が問題パックを作成。

---

## クイズパック共有

他ユーザーと問題パックを共有。

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

# 技術スタック

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router

## Backend

* Firebase Authentication
* Cloud Firestore

## Hosting

* Vercel

---

# データ設計

## rooms

```ts
rooms/{roomId} {
  roomCode: string
  status: 'waiting' | 'playing' | 'finished'

  selectedPackIds: string[]

  settings: {
    totalQuestions: number
    correctPoint: number
    wrongPoint: number
    questionerMode: 'fixed' | 'rotation'
  }

  currentQuestionerId: string | null
  currentQuestionId: string | null

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## members

```ts
members/{memberId} {
  name: string

  score: number
  correctCount: number
  buzzCount: number
  questionerCount: number

  joinedAt: Timestamp
}
```

## quizPacks

```ts
quizPacks/{packId} {
  title: string
  description: string

  category: string

  createdBy: string

  isPublic: boolean

  questionCount: number

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## questions

```ts
questions/{questionId} {
  packId: string

  questionText: string
  answerText: string
  explanation: string

  point: number

  difficulty: 'easy' | 'normal' | 'hard'

  createdAt: Timestamp
}
```

## gameResults

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
    buzzCount: number
    questionerCount: number

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
