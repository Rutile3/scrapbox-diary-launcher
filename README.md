# Scrapbox Diary Launcher

Scrapbox Diary Launcherは、日付ベースのScrapbox日記ページを開くための静的なGitHub Pagesツールです。

Scrapbox UserScript、ブックマーク、PowerShell、BAT、Windowsスタートアップなどの呼び出し元から日付計算やURLエンコードを取り除き、このランチャーへ集約します。フレームワーク、ビルド手順、外部CDNは使用していません。

公開ページ:

```text
https://rutile3.github.io/scrapbox-diary-launcher/
```

## 対応するアクション

| action | 動作 | 任意指定 |
| --- | --- | --- |
| `show-today` | 日次ページを表示 | `date=YYYY-MM-DD` |
| `create-today` | 任意の本文付きで日次ページを作成または表示 | `date=YYYY-MM-DD`、`#body=...` |
| `show-month` | 月次ページを表示 | `month=YYYY-MM` |
| `create-month-schedule` | 月間予定本文を生成して月次ページを作成または表示 | `month=YYYY-MM` |

日次ページ名は `YYMMDD`、月次ページ名は `YYMM` です。日付または月を省略すると、ブラウザーの現在のローカル日付を使用します。

## ランチャージェネレーター

公開ページをパラメーターなしで開くと、ランチャージェネレーターが表示されます。

1. Scrapboxプロジェクトを入力する
2. アクションを選択する
3. 必要に応じて日付、月、本文を入力する
4. 「生成する」を押す
5. 用途に合わせて次の出力をコピーする
   - 正規ランチャーURL
   - Scrapbox UserScript／JavaScript
   - PowerShell
   - BAT

本文や複雑な文字を扱うWindows環境ではPowerShell出力を推奨します。

## URLの使用例

今日の日記を表示:

```text
https://rutile3.github.io/scrapbox-diary-launcher/?action=show-today&project=Example
```

指定日の日記を表示:

```text
https://rutile3.github.io/scrapbox-diary-launcher/?action=show-today&project=Example&date=2024-02-29
```

本文付きで今日の日記を作成:

```text
https://rutile3.github.io/scrapbox-diary-launcher/?action=create-today&project=Example#body=%E3%83%A1%E3%83%A2
```

指定月の月間予定を作成:

```text
https://rutile3.github.io/scrapbox-diary-launcher/?action=create-month-schedule&project=Example&month=2024-12
```

`Example` は実際のScrapboxプロジェクト名へ置き換えてください。

## URLパラメーター

| 名前 | 必須 | 説明 |
| --- | --- | --- |
| `action` | はい | 実行するアクション |
| `project` | はい | Scrapboxプロジェクト名。暗黙のテスト用プロジェクトは使用しません |
| `date` | いいえ | 日次アクションの日付。厳密な `YYYY-MM-DD` 形式 |
| `month` | いいえ | 月次アクションの月。厳密な `YYYY-MM` 形式 |
| `body` | いいえ | `create-today` 用本文。クエリではなく `#body=...` フラグメントに指定 |

不足または不正なパラメーターがある場合、意図しないScrapboxプロジェクトへ転送せず、エラーを表示します。

## 本文のプライバシー

自由記述の本文は、次のようにURLフラグメントへ入れてください。

```text
?action=create-today&project=Example#body=ENCODED_TEXT
```

フラグメントはGitHub PagesへのHTTPリクエストには送信されません。ランチャーがブラウザー内で本文を読み取り、Scrapboxへ渡す最終URLを構築します。

これはScrapboxから本文を隠す仕組みではありません。中継するGitHub Pagesへ本文を不必要に送信しないための設計です。

入力した本文はログ、localStorage、sessionStorageへ保存しません。正規ランチャーは、クエリ文字列の `body` を受け付けません。

## 旧RedirectPageからの移行

リポジトリ名の変更に伴い、`/RedirectPage/` を含む旧GitHub Pages URLは利用できません。Scrapbox UserScript、PowerShell／BAT、Windowsスタートアップ、ブックマークなど、リポジトリ外の呼び出し元も更新してください。

新しいリポジトリ内には4つの旧HTMLパスを互換ラッパーとして残していますが、旧 `/RedirectPage/` URLを転送するものではありません。

詳しい新旧URL例と更新手順は[移行ガイド](./docs/MIGRATION.md)を参照してください。

## 開発とテスト

実装はプレーンなHTML、CSS、JavaScriptで構成されています。Node.jsの標準テストランナーを使うため、テスト用パッケージのインストールは不要です。

```powershell
node --test
```

実ブラウザーで確認する項目は[手動確認手順](./docs/MANUAL_TESTS.md)に記載しています。

## ドキュメント

- [改修計画](./docs/REFACTOR_PLAN.md)
- [改修TODO](./docs/TODO.md)
- [RedirectPageからの移行ガイド](./docs/MIGRATION.md)
- [手動確認手順](./docs/MANUAL_TESTS.md)
- [リポジトリ内へ移行した旧Wiki](./docs/wiki/README.md)

旧Wikiの情報は履歴としてリポジトリ内に保存し、現行仕様の注記と旧版の記録を区別しています。通常の利用に外部GitHub Wikiは必要ありません。

## ライセンス

[MIT License](./LICENSE)
