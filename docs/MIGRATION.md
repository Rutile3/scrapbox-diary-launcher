# RedirectPageからの移行ガイド

## 概要

このリポジトリは `RedirectPage` から `scrapbox-diary-launcher` へ改名されました。

GitHubリポジトリの改名とGitHub PagesプロジェクトサイトのURL転送は別の仕組みです。外部の呼び出し元に `/RedirectPage/` を含むURLが残っている場合は、新しいURLへ更新してください。

2026年9月10日に公開URLへHTTP HEADリクエストを行い、次の応答を確認しました。

| URL | 確認結果 |
| --- | --- |
| `https://rutile3.github.io/scrapbox-diary-launcher/` | HTTP 200 |
| `https://rutile3.github.io/RedirectPage/` | HTTP 404 |

新しいPagesのベースURLは次のとおりです。

```text
https://rutile3.github.io/scrapbox-diary-launcher/
```

## 推奨する移行方法

新しいルートページにあるランチャージェネレーターを使用してください。

1. `https://rutile3.github.io/scrapbox-diary-launcher/` を開く
2. Scrapboxプロジェクトとアクションを選択する
3. 必要に応じて日付、月、本文を入力する
4. 用途に合わせてURL、UserScript、PowerShell、BATをコピーする
5. 旧URLを使用している呼び出し元と置き換える

本文や複雑な文字を扱うWindows環境では、PowerShell出力を推奨します。

## 正規ランチャーのパラメーター

| パラメーター | 必須 | 内容 |
| --- | --- | --- |
| `action` | はい | `show-today`、`create-today`、`show-month`、`create-month-schedule` のいずれか |
| `project` | はい | Scrapboxのプロジェクト名 |
| `date` | いいえ | 日次アクションの日付。`YYYY-MM-DD` 形式 |
| `month` | いいえ | 月次アクションの月。`YYYY-MM` 形式 |
| `body` | いいえ | `create-today` の本文。クエリではなくURLフラグメントに指定 |

日付または月を省略した場合は、ブラウザーの現在のローカル日付を使用します。

`project` は正規ランチャーでは必須です。指定がない場合にテスト用プロジェクトへ暗黙に転送することはありません。

## 4つの旧エンドポイントからの移行

以下の例では、Scrapboxプロジェクト名に `Example` を使用します。実際のプロジェクト名に置き換えてください。

### CreateToday

旧URL:

```text
https://rutile3.github.io/RedirectPage/Scrapbox/Diary/CreateToday/CreateToday.html?project_url=Example&yymmdd=240229&body=%E3%83%A1%E3%83%A2
```

新しい正規URL:

```text
https://rutile3.github.io/scrapbox-diary-launcher/?action=create-today&project=Example&date=2024-02-29#body=%E3%83%A1%E3%83%A2
```

変更点:

- `project_url` を `project` に変更
- `yymmdd=240229` を `date=2024-02-29` に変更
- `body` をクエリ文字列から `#body=...` フラグメントへ移動

### ShowToday

旧URL:

```text
https://rutile3.github.io/RedirectPage/Scrapbox/Diary/ShowToday/ShowToday.html?project_url=Example&yymmdd=240229
```

新しい正規URL:

```text
https://rutile3.github.io/scrapbox-diary-launcher/?action=show-today&project=Example&date=2024-02-29
```

変更点:

- `project_url` を `project` に変更
- `yymmdd=240229` を `date=2024-02-29` に変更

### CreateMonthSchedule

旧URL:

```text
https://rutile3.github.io/RedirectPage/Scrapbox/Diary/CreateMonthSchedule/CreateMonthSchedule.html?project_url=Example&yymm=2412
```

新しい正規URL:

```text
https://rutile3.github.io/scrapbox-diary-launcher/?action=create-month-schedule&project=Example&month=2024-12
```

変更点:

- `project_url` を `project` に変更
- `yymm=2412` を `month=2024-12` に変更

### ShowMonthSchedule

旧URL:

```text
https://rutile3.github.io/RedirectPage/Scrapbox/Diary/ShowMonthSchedule/ShowMonthSchedule.html?project_url=Example&yymm=2412
```

新しい正規URL:

```text
https://rutile3.github.io/scrapbox-diary-launcher/?action=show-month&project=Example&month=2024-12
```

変更点:

- `project_url` を `project` に変更
- `yymm=2412` を `month=2024-12` に変更
- action名では月ページを表示する目的を `show-month` と表現

## 新しいリポジトリ内の互換パス

急いで正規形式へ移行できない呼び出し元のために、新しいリポジトリ内では従来のHTMLパスと旧パラメーターを維持しています。

```text
https://rutile3.github.io/scrapbox-diary-launcher/Scrapbox/Diary/CreateToday/CreateToday.html
https://rutile3.github.io/scrapbox-diary-launcher/Scrapbox/Diary/ShowToday/ShowToday.html
https://rutile3.github.io/scrapbox-diary-launcher/Scrapbox/Diary/CreateMonthSchedule/CreateMonthSchedule.html
https://rutile3.github.io/scrapbox-diary-launcher/Scrapbox/Diary/ShowMonthSchedule/ShowMonthSchedule.html
```

これらの互換パスでは、`project_url`、`yymmdd`、`yymm`、`body` を使用できます。`CreateToday` の `body` は、互換ラッパーが正規ランチャーへ転送するときにURLフラグメントへ移します。

ただし、互換パスは新しい `/scrapbox-diary-launcher/` の下にあります。旧 `/RedirectPage/` URLをそのまま動作させるものではありません。将来の保守性を考慮し、可能な場合は正規ランチャーへ移行してください。

## 本文の移行とプライバシー

旧CreateToday URLでは、本文を次のようにクエリ文字列へ入れていました。

```text
?project_url=Example&body=ENCODED_TEXT
```

新しい正規URLでは、本文を次のようにフラグメントへ入れます。

```text
?action=create-today&project=Example#body=ENCODED_TEXT
```

URLフラグメントは、GitHub PagesへのHTTPリクエストには送信されません。ランチャーがブラウザー内で本文を読み取り、最終的なScrapbox URLの `body` クエリへ正しくエンコードします。これはScrapboxから本文を隠す仕組みではなく、中継するGitHub Pagesへ本文を不必要に送らないための設計です。

正規ランチャーは、クエリ文字列に指定された `body` を受け付けません。本文付きURLはジェネレーターで作成することを推奨します。

## リポジトリ外にある呼び出し元の更新

### Scrapbox UserScript

UserScript内で次を確認してください。

- `rutile3.github.io/RedirectPage` を検索する
- URLをジェネレーターが出力するUserScriptへ置き換える
- 独自の日付計算や本文エンコードが残っている場合は、可能な限りランチャーへ委ねる

固定URLを開くだけなら、呼び出し元は次の程度にできます。

```javascript
location.href = "https://rutile3.github.io/scrapbox-diary-launcher/?action=show-today&project=Example";
```

### PowerShell／BAT

Windows上のスクリプトやスタートアップ項目で、次の文字列を検索してください。

```text
/RedirectPage/
```

ジェネレーターからPowerShellまたはBAT出力を作成し、既存の起動コマンドと置き換えてください。

PowerShellの例:

```powershell
Start-Process -FilePath 'https://rutile3.github.io/scrapbox-diary-launcher/?action=show-today&project=Example'
```

BATでは、URLエンコードに含まれる `%` をファイル内で `%%` と記述する必要があります。この処理を手作業で行わず、ジェネレーターのBAT出力を使用することを推奨します。

### Windowsスタートアップ

スタートアップフォルダー、タスクスケジューラ、ショートカットのリンク先が、旧BAT／PowerShellや旧Pages URLを参照していないか確認してください。

起動対象を新しく生成したPowerShell／BAT、または正規ランチャーURLへ変更します。

### ブックマーク／ショートカット

ブラウザーのブックマーク、デスクトップショートカット、URLファイルに `/RedirectPage/` が含まれていないか確認し、ジェネレーターで作成した正規URLへ置き換えてください。

## 移行チェックリスト

- [ ] Scrapbox UserScriptの旧URLを更新した
- [ ] PowerShell／BATの旧URLを更新した
- [ ] Windowsスタートアップとタスクスケジューラを確認した
- [ ] ブックマーク／ショートカットを更新した
- [ ] `body` をクエリ文字列からフラグメントへ移した
- [ ] 意図したScrapboxプロジェクトを明示的に指定した
- [ ] 更新後の呼び出し元を実際に起動して確認した

## 対応しない作業

この移行では、代替の `RedirectPage` リポジトリを作成せず、旧リポジトリの設定も変更しません。リポジトリ内へ移行していた旧Wiki文書は廃止済みです。

旧 `/RedirectPage/` Pages URLを維持する必要がある場合は、別途リダイレクト用サイトなどの運用判断が必要です。これは新しいリポジトリ内の互換ラッパーだけでは解決できません。
