# R4B-beginners-luck .github

このリポジトリは、R4B-beginners-luck Organization 共通の開発ルール・Issueテンプレート・Pull Requestテンプレートを管理するためのリポジトリです。

## 目的

チーム開発におけるルールやテンプレートを共通化し、各リポジトリでの開発・レビュー・Issue起票を進めやすくすることを目的としています。

## 管理しているもの

### 開発ルール

- `CONTRIBUTING.md`

ブランチ運用、コミットメッセージ、プッシュ、Pull Request 作成時のルールをまとめています。

### Pull Request テンプレート

- `PULL_REQUEST_TEMPLATE.md`

Pull Request 作成時に、目的・変更内容・影響範囲・確認事項を記載しやすくするためのテンプレートです。

### Issue テンプレート

- `.github/ISSUE_TEMPLATE/01_task.md`
- `.github/ISSUE_TEMPLATE/02_bug_report.md`
- `.github/ISSUE_TEMPLATE/03_spike.md`
- `.github/ISSUE_TEMPLATE/04_chore.md`
- `.github/ISSUE_TEMPLATE/config.yml`

Issue 起票時に、作業内容や不具合報告、調査内容、環境整備などを整理して記載するためのテンプレートです。

## Issue テンプレートの種類

| テンプレート | 用途 |
|---|---|
| Task | 通常の実装・修正タスク |
| Bug report | 不具合の報告 |
| Spike | 調査・検証・技術選定 |
| Chore | 設定・環境整備・雑務・ドキュメント更新 |

## 運用方針

- ルールは最初から厳しくしすぎず、必要に応じて追加・修正する
- 変更する場合は、チーム内で認識を合わせてから更新する
- 各リポジトリ固有のルールは、各リポジトリ側の README や `.github/copilot-instructions.md` に記載する
- このリポジトリには、Organization 全体で共通して使う内容のみを置く

## 各リポジトリ側で管理するもの

各リポジトリでは、必要に応じて以下を管理します。

- `README.md`
  - リポジトリの役割
  - セットアップ手順
  - 使用技術
  - 実行方法

- `.github/copilot-instructions.md`
  - GitHub Copilot に読ませるプロジェクト固有の指示
  - AI利用時の方針
  - 実装時の注意点

## 注意事項

各リポジトリに同種のテンプレートやルールファイルを置いた場合、Organization 共通のものではなく、各リポジトリ側の内容が優先される場合があります。

そのため、基本的には共通ルールはこのリポジトリで管理し、リポジトリ固有の内容のみ各リポジトリ側に記載します。
