# GitHub Wiki移行索引

このディレクトリには、旧GitHub WikiのページをMarkdownファイルとして保存しています。

初回移行では元の情報と用語を維持し、Wikiページ間のリンクだけをリポジトリ相対のMarkdownリンクへ変換しています。そのため、旧リポジトリ名、旧GitHub Pages URL、現在の実装とは異なる説明が含まれます。内容の現行化は、忠実な移行とは別の作業として行います。

## ページ一覧と移行対応表

| 元のWikiページ／ファイル | 移行先 | 概要 |
| --- | --- | --- |
| `Home.md` | [Home.md](./Home.md) | 旧Wikiのホームとページ一覧 |
| `CreateToday.md` | [CreateToday.md](./CreateToday.md) | 日記ページを作成する旧エンドポイントの説明 |
| `ShowToday.md` | [ShowToday.md](./ShowToday.md) | 日記ページを表示する旧エンドポイントの説明 |
| `CreateMonthSchedule.md` | [CreateMonthSchedule.md](./CreateMonthSchedule.md) | 月予定表を作成する旧エンドポイントの説明 |
| `ShowMonthSchedule.md` | [ShowMonthSchedule.md](./ShowMonthSchedule.md) | 月予定表を表示する旧エンドポイントの説明 |
| `使用素材.md` | [使用素材.md](./使用素材.md) | 使用素材と出典 |

## 移行記録

- 取得元: `https://github.com/Rutile3/scrapbox-diary-launcher.wiki.git`
- 取得時のWikiコミット: `00494a1`（`Created CreateToday (markdown)`）
- 移行したページ数: 6
- 添付ファイル: Wikiリポジトリ内には存在しませんでした
- 外部画像: 元ページに記載されたGyazoへのリンクを維持しています
- 空の画像リンク: 元ページの記録を忠実に保つため、そのまま維持しています

## 初回移行時の変更

`Home.md` にあった次のWiki内部リンクだけを、移行先ファイルへの相対リンクに変換しました。

- `CreateMonthSchedule`
- `ShowMonthSchedule`
- `ShowToday`

元のホームページには `CreateToday` と `使用素材` へのリンクがありませんでした。この索引には全移行ページを掲載していますが、[Home.md](./Home.md) の内容には追加していません。
