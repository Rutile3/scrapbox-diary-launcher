# 手動確認手順

自動テストだけでは確認できないブラウザー操作を、以下の手順で確認します。

## ランチャージェネレーター

1. `generator.html` をブラウザーで直接開く
2. 初期状態で「日付」が表示され、「月」と「本文」が非表示であることを確認する
3. actionを切り替え、次の表示になることを確認する
   - `show-today`: 日付のみ
   - `create-today`: 日付と本文
   - `show-month`: 月のみ
   - `create-month-schedule`: 月のみ
4. projectを空にしたまま生成し、必須入力として通知されることを確認する
5. project、action、任意の日付または月を入力して生成する
6. `create-today` では、本文に次の文字を含めて生成する
   - 日本語
   - 空白と改行
   - `&`
   - `%`
   - `#`
   - `?`
   - `=`
   - 単一引用符と二重引用符
7. 生成された正規URLのクエリに `body` がなく、フラグメントに `#body=` があることを確認する
8. URL、UserScript、PowerShell、BATの各コピーボタンを押す
9. コピー成功の通知が表示され、貼り付けた内容が表示内容と一致することを確認する
10. 入力を変更すると古い生成結果が非表示になり、再生成を促す通知が表示されることを確認する

## ランチャー画面と遷移

1. クエリ文字列を付けずにルートの `index.html` を開き、`generator.html` へ遷移することを確認する
2. ブラウザーの履歴を戻っても、パラメーターなしの `index.html` が履歴に残っていないことを確認する
3. 正規ランチャーURLを開き、ジェネレーターのフォームが表示されないままScrapboxへ遷移することを確認する
4. `action` または `project` が不足したURLを開き、Scrapboxへ遷移せず入力エラーが表示されることを確認する
5. `generator.html` で生成した正規ランチャーURLが `generator.html` を含まず、ルートページを指すことを確認する

## アクセシビリティと表示

1. Tabキーだけで全入力、生成ボタン、コピーボタンを順に操作できることを確認する
2. フォーカス位置が視覚的に分かることを確認する
3. コピー結果が画面上へ通知されることを確認する
4. ウィンドウ幅を狭くしても、入力欄と生成結果が画面外へはみ出さないことを確認する
5. ヘッダー左上のツール名が `https://github.com/Rutile3/scrapbox-diary-launcher` へリンクしていることを確認する
6. 開発者ツールのNetworkパネルで、Bootstrap CSSは読み込まれ、Bootstrap Bundle JavaScriptは読み込まれないことを確認する

## 注意事項

- 入力した本文がブラウザーのlocalStorageやsessionStorageに保存されないことを開発者ツールで確認する
- 実際のScrapboxへの遷移テストでは、意図した検証用プロジェクトを明示的に指定する
- 外部の旧 `/RedirectPage/` Pages URLは、このローカル確認の対象外とする

## Google Analytics

1. Google Analyticsの読み込みを許可できる環境で、`generator.html?project=Secret#body=Private` を開く
2. 開発者ツールのコンソールで `dataLayer.find(item => item[0] === "config")?.[2]?.page_location` を実行する
3. 結果が `generator.html` までのURLであり、`?project=Secret` と `#body=Private` を含まないことを確認する
4. ランチャー画面ではGoogle Analyticsが読み込まれないことを確認する

## 検証記録（2026年9月10日）

### 完了した確認

- JavaScript全ファイルの構文チェック: 成功
- Node.js標準テスト: 46件すべて成功
- UTCでのテスト: 46件すべて成功
- Asia/Tokyoでのテスト: 46件すべて成功
- Edgeのヘッドレスブラウザーによるデスクトップ幅（1440×1200）の描画: 成功
- Chromeのヘッドレスブラウザーによるモバイル幅（390×1000）の描画: 成功
- ブラウザー内のUI操作ハーネス: 17項目すべて成功
  - actionに応じた日付、月、本文の表示切替
  - 特殊文字を含む本文付きURLの生成
  - 本文がクエリではなくフラグメントに入ること
  - UserScript、PowerShell、BATの生成
  - 入力変更後に古い出力を隠すこと
  - localStorageとsessionStorageへ保存しないこと
- project欠落時のエラー表示: Edge上で確認済み
- PowerShell生成結果: PowerShellの構文解析でエラー0件
- BAT生成結果: 自動テストで `%` と引用符のエスケープ、および元URLの復元を確認済み
- リポジトリ相対のMarkdownリンク: 自動テストでリンク先の存在を確認済み
- 認証情報、トークン、秘密鍵に該当する代表的なパターン: 検出なし
- `git diff --check`: 成功

### 公開GitHub Pagesの確認

| 対象 | HTTP状態 |
| --- | --- |
| `/scrapbox-diary-launcher/` | 200 |
| `/scrapbox-diary-launcher/js/diary-core.js` | 404 |
| `/scrapbox-diary-launcher/js/generators.js` | 404 |
| 旧 `/RedirectPage/` | 404 |

新しい共有スクリプトの404は、検証時点で作業ブランチがリモートへpushされておらず、GitHub Pagesへ新実装がデプロイされていないためです。デプロイ後にルートページと共有スクリプトを再確認する必要があります。

### ユーザーによる残りの手動確認

- 実際のユーザー操作で4つのコピーボタンを押し、OSクリップボードへ貼り付ける
- Tabキーだけで入力欄、生成ボタン、コピーボタンを順に操作する
- 生成されたPowerShellとBATを、意図した検証用Scrapboxプロジェクトを指定して実行する
- 4つの正規actionから、意図したScrapboxページへ遷移する
- デプロイ後にGitHub Pages上で新しいJavaScriptがHTTP 200になることを確認する

## 互換エンドポイント廃止後の検証記録（2026年9月16日）

- JavaScript全ファイルの構文チェック: 成功
- Node.js標準テスト: 40件すべて成功
- 旧4HTML、互換変換処理、専用テストが削除されていることを確認済み
- 機能仕様書、README、移行ガイド、手動確認手順、開発ルールを現行仕様へ更新済み
- `git diff --check`: 成功

## ランチャー・ジェネレーター分離後の検証記録（2026年9月16日）

- パラメーターなしのルートURLが `generator.html` へ遷移することをEdgeで確認済み
- `generator.html` のデスクトップ幅表示をEdgeで確認済み
- `generator.html` の狭幅表示をChromeで確認済み
- `project` がないランチャーURLで、ジェネレーターUIを表示せず入力エラーを表示することをEdgeで確認済み
- ローカルHTTP配信で `index.html`、`generator.html`、CSS、JavaScript、faviconがHTTP 200になることを確認済み

## 共通テンプレート適用後の検証記録（2026年9月24日）

- Edgeのデスクトップ幅（1440×1200）で、生成フォームと使用方法が横並びになり、ヘッダー、カード、フッターが崩れず表示されることを確認済み
- Chromeの狭幅（500×1000）と390px相当のデバイス表示で、2つのカードが1列になり、横スクロールが発生しないことを確認済み
- Tabキー操作で入力欄、生成ボタン、生成結果、4つのコピーボタン、ページ内リンクへ順に移動できることを確認済み
- キーボードフォーカス時に、入力欄とボタンへBootstrapのフォーカスリングが表示されることを確認済み
- 特殊文字を含む本文から生成したURLで、本文がクエリではなくURLフラグメントへ格納されることを確認済み
- 入力値と本文がlocalStorageおよびsessionStorageへ保存されないことを確認済み
- `index.html` がローカルのCSS 1件とJavaScript 3件だけを読み込み、Bootstrap、Google Analytics、ジェネレーターUIを読み込まないことを確認済み
- `project` がないランチャーURLで、ジェネレーターUIを表示せず入力エラーを表示することを確認済み
