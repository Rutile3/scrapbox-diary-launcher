# CreateMonthSchedule
[CreateMonthSchedule](https://github.com/Rutile3/RedirectPage/tree/master/Scrapbox/Diary/CreateMonthSchedule)は[Scrapbox](https://scrapbox.io/product)に月予定表を作成するようリダイレクトするページです。  

## URLパラメータ
```
 ~前略~ ?project_url=RutileEx&yymm=1901
```
### project_url
月予定表を作成するプロジェクト。  
上記の例では「RutileEx」というプロジェクトに月予定表を作成しています。  
未指定の場合は「RutileTest」というプロジェクトに月予定表を作成します。 
### yymm
作成する月予定表の年月。「yymm」形式で指定します。  
上記の例では2019年1月の月予定表を作成しています。  
未指定の場合は今月の月予定表を作成します。

## 使用例
### ブックマークレットから今月の月予定表を作成
次のリンクは「RutileEx」プロジェクトに今月の月予定表を作成します。  
リンクをブラウザのブックマークツールバーにドラッグアンドドロップすることにより、ブックマークレットとして使用できます。  
[今月の月予定表を作成](https://rutile3.github.io/RedirectPage/Scrapbox/RutileDiary/CreateMonthSchedule/CreateMonthSchedule.html?project_url=RutileEx)
#### 実行結果
![ブックマークレットから今月の月予定表を作成](https://i.gyazo.com/acd1bb19719d8bcf4fce9647675ad020.gif)
### Scrapboxのドキュメントアイコンに「月予定表を作成」を追加
次のコードはScrapboxのPageMenu(ドキュメントアイコン)に「月予定表を作成」を追加します。  
「月予定表を作成」をクリックすると入力ダイアログ（プロンプト）が表示され、OKボタン押すと入力された年月の月予定表を作成します。
```
// プロジェクト名を取得します。
const getProjectUrl = () => {
  const href_tmp = location.href;
  return href_tmp.substring(20, href_tmp.lastIndexOf("/"));
}

// 日付を「yymm」形式で取得します。
const getYYMM = (date) => {
    const yy = (""  + (date.getFullYear() )).slice(-2);
    const mm = ("0" + (date.getMonth() + 1)).slice(-2);
    return yy + mm;
}

// PageMenu(ドキュメントアイコン)に「月予定表を作成」を追加します。
scrapbox.PageMenu.addItem({
  title: () => "月予定表を作成",
  onClick: () => (function () {
    const yymm = window.prompt("", getYYMM(new Date()));
    if (yymm === null) return; // キャンセルボタン押下時

    const url = "https://rutile3.github.io/RedirectPage/Scrapbox/RutileDiary/CreateMonthSchedule/CreateMonthSchedule.html";
    const parameter = "?yymm=" + yymm + "&project_url=" + getProjectUrl();
    location.href = url + parameter;
  })()
})
```
#### 実行結果
![Scrapboxのドキュメントアイコンにから月予定表を作成](https://i.gyazo.com/40fa03725475c8f0959d34c523297233.gif)
