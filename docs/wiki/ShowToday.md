# ShowToday

## 現行版

今日または指定日の日次ページを表示する機能です。正規ランチャーでは、`project` を必須とし、任意の日付を `date=YYYY-MM-DD` で指定します。

```text
https://rutile3.github.io/scrapbox-diary-launcher/?action=show-today&project=Example&date=2024-02-29
```

新しいリポジトリ内では、従来の `Scrapbox/Diary/ShowToday/ShowToday.html` も互換ラッパーとして利用できます。旧 `project_url` と `yymmdd` を正規形式へ変換します。

新しいURLはルートページのジェネレーターで作成してください。詳細は[移行ガイド](../MIGRATION.md)を参照してください。

## 旧RedirectPage版の記録

[ShowToday](https://github.com/Rutile3/RedirectPage/tree/master/Scrapbox/Diary/ShowToday)は[Scrapbox](https://scrapbox.io/product)の日記を表示するようリダイレクトするページです。  


## URLパラメータ
```
 ~前略~ ?project_url=RutileEx&yymmdd=190125
```
### project_url
日記を表示するプロジェクト。  
上記の例では「RutileEx」というプロジェクトの日記を表示しています。  
未指定の場合は「RutileTest」というプロジェクトの日記を表示します。 
### yymmdd
表示する日記の年月日。「yymmdd」形式で指定します。  
上記の例では2019年1月25日の日記を表示しています。  
未指定の場合は今日の日記を表示します。

## 使用例
### ブックマークレットから今日の日記を表示
次のリンクは「RutileEx」プロジェクトの今日の日記を表示します。  
リンクをブラウザのブックマークツールバーにドラッグアンドドロップすることにより、ブックマークレットとして使用できます。  
[今日の日記](https://rutile3.github.io/RedirectPage/Scrapbox/RutileDiary/ShowToday/ShowToday.html?project_url=RutileEx)
#### 実行結果
![ブックマークレットから今日の日記を表示](https://i.gyazo.com/95cfd8828df4625d7daeac909322e6d4.gif)
### Scrapboxのドキュメントアイコンに「今日の日記を表示」を追加
次のコードはScrapboxのPageMenu(ドキュメントアイコン)に「今日の日記」を追加します。  
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
    const url = "https://rutile3.github.io/RedirectPage/Scrapbox/RutileDiary/ShowToday/ShowToday.html";
    const parameter = "?project_url=" + getProjectUrl();
    location.href = url + parameter;
  })()
})
```
#### 実行結果
![Scrapboxのドキュメントアイコンに「今日の日記」を追加](https://i.gyazo.com/5f5f09348c8531e2744b868b68faccd1.gif)
