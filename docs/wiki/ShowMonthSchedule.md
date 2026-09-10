# ShowMonthSchedule

## 現行版

現在または指定した月の月次ページを表示する機能です。正規ランチャーでは、`project` を必須とし、任意の月を `month=YYYY-MM` で指定します。正規action名は `show-month` です。

```text
https://rutile3.github.io/scrapbox-diary-launcher/?action=show-month&project=Example&month=2024-12
```

新しいリポジトリ内では、従来の `Scrapbox/Diary/ShowMonthSchedule/ShowMonthSchedule.html` も互換ラッパーとして利用できます。旧 `project_url` と `yymm` を正規形式へ変換します。

新しいURLはルートページのジェネレーターで作成してください。詳細は[移行ガイド](../MIGRATION.md)を参照してください。

## 旧RedirectPage版の記録

[ShowMonthSchedule](https://github.com/Rutile3/RedirectPage/tree/master/Scrapbox/Diary/ShowMonthSchedule)は[Scrapbox](https://scrapbox.io/product)の月予定表を表示するようリダイレクトするページです。  


## URLパラメータ
```
 ~前略~ ?project_url=RutileEx&yymm=1901
```
### project_url
月予定表を表示するプロジェクト。  
上記の例では「RutileEx」というプロジェクトの月予定表を表示しています。  
未指定の場合は「RutileTest」というプロジェクトの月予定表を表示します。 
### yymm
表示する月予定表の年月。「yymm」形式で指定します。  
上記の例では2019年1月の月予定表を表示しています。  
未指定の場合は今月の月予定表を表示します。

## 使用例
### ブックマークレットから今月の月予定表を表示
次のリンクは「RutileEx」プロジェクトの今月の月予定表を表示します。  
リンクをブラウザのブックマークツールバーにドラッグアンドドロップすることにより、ブックマークレットとして使用できます。  
[今月の予定表](https://rutile3.github.io/RedirectPage/Scrapbox/RutileDiary/ShowMonthSchedule/ShowMonthSchedule.html?project_url=RutileEx)
#### 実行結果
![ブックマークレットから今月の月予定表を表示](https://i.gyazo.com/6102971ac927b3c467bf50d2bf393658.gif)
### Scrapboxのドキュメントアイコンに「今月の予定表」を追加
次のコードはScrapboxのPageMenu(ドキュメントアイコン)に「今月の予定表」を追加します。  
```
// プロジェクト名を取得します。
const getProjectUrl = () => {
  const href_tmp = location.href;
  return href_tmp.substring(20, href_tmp.lastIndexOf("/"));
}

// PageMenu(ドキュメントアイコン)に「今月の予定表」を追加します。
scrapbox.PageMenu.addItem({
  title: () => "今月の予定表",
  onClick: () => (function () {
    const url = "https://rutile3.github.io/RedirectPage/Scrapbox/RutileDiary/ShowMonthSchedule/ShowMonthSchedule.html";
    const parameter = "?project_url=" + getProjectUrl();
    location.href = url + parameter;
  })()
})
```
#### 実行結果
![Scrapboxのドキュメントアイコンに「今月の予定表」を追加](https://i.gyazo.com/a08eec77a83fff5c886e1ba012acc6cd.gif)
