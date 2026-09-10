# CreateToday

## 現行版

日次ページを作成または表示し、任意の本文を事前入力する機能です。正規ランチャーでは、`project` を必須とし、任意の日付を `date=YYYY-MM-DD`、本文をURLフラグメントの `#body=...` で指定します。

```text
https://rutile3.github.io/scrapbox-diary-launcher/?action=create-today&project=Example&date=2024-02-29#body=%E3%83%A1%E3%83%A2
```

新しいリポジトリ内では、従来の `Scrapbox/Diary/CreateToday/CreateToday.html` も互換ラッパーとして利用できます。旧 `project_url`、`yymmdd`、`body` を正規形式へ変換します。

新しいURLはルートページのジェネレーターで作成してください。詳細は[移行ガイド](../MIGRATION.md)を参照してください。

## 旧RedirectPage版の記録

[CreateToday](https://github.com/Rutile3/RedirectPage/tree/master/Scrapbox/Diary/CreateToday)は[Scrapbox](https://scrapbox.io/product)の日記を作成するようリダイレクトするページです。  


## URLパラメータ
```
 ~前略~ ?project_url=RutileEx&yymmdd=190125&body=%E6%9C%AC%E6%96%87
```
### project_url
日記を作成するプロジェクト。  
上記の例では「RutileEx」というプロジェクトの日記を作成しています。  
未指定の場合は「RutileTest」というプロジェクトの日記を作成します。 
### yymmdd
作成する日記の年月日。「yymmdd」形式で指定します。  
上記の例では2019年1月25日の日記を作成しています。  
未指定の場合は今日の日記を作成します。
### body
作成する日記の本文。
未指定の場合は本文なしで日記を作成します。

## 使用例
### ブックマークレットから今日の日記を作成
次のリンクは「RutileEx」プロジェクトの今日の日記を作成します。  
リンクをブラウザのブックマークツールバーにドラッグアンドドロップすることにより、ブックマークレットとして使用できます。  
[今日の日記を作成](https://rutile3.github.io/RedirectPage/Scrapbox/Diary/CreateToday/CreateToday.html?project_url=RutileEx&body=%5B%2A%2A%2A%2A+%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E5%90%8D%5D%0D+%0D%0D%5B%2A%2A%2A%2A+%E3%82%84%E3%81%A3%E3%81%9F%E3%81%93%E3%81%A8%5D%0D+00%3A00%7E00%3A00%EF%BC%9A%0D%0D%5B%2A%2A%2A%2A+%E3%83%A1%E3%83%A2%5D%0D+)
#### 実行結果
![ブックマークレットから今日の日記を作成]()
### Scrapboxのドキュメントアイコンに「今日の日記を作成」を追加
次のコードはScrapboxのPageMenu(ドキュメントアイコン)に「今日の日記を作成」を追加します。  
```
// プロジェクト名を取得します。
const getProjectUrl = () => {
  const href_tmp = location.href;
  return href_tmp.substring(20, href_tmp.lastIndexOf("/"));
}

// PageMenu(ドキュメントアイコン)に「今日の日記」を追加します。
scrapbox.PageMenu.addItem({
  title: () => "今日の日記",
  onClick: () => (function () {
    const url = "https://rutile3.github.io/RedirectPage/Scrapbox/Diary/CreateToday/CreateToday.html";
    const project= "?project_url=" + getProjectUrl();
    const body= "&body=" + "%5B%2A%2A%2A%2A+%E3%83%97%E3%83%AD%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E5%90%8D%5D%0D+%0D%0D%5B%2A%2A%2A%2A+%E3%82%84%E3%81%A3%E3%81%9F%E3%81%93%E3%81%A8%5D%0D+00%3A00%7E00%3A00%EF%BC%9A%0D%0D%5B%2A%2A%2A%2A+%E3%83%A1%E3%83%A2%5D%0D+";
    location.href = url + project + body;
  })()
})
```
#### 実行結果
![Scrapboxのドキュメントアイコンに「今日の日記を作成」を追加]()
