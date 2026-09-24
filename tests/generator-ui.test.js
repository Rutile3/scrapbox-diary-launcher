"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("ジェネレーターに必要な入力と出力が専用ページに存在する", () => {
  const html = read("generator.html");
  const requiredIds = [
    "generator-project",
    "generator-action",
    "generator-date",
    "generator-month",
    "generator-body",
    "output-url",
    "output-userscript",
    "output-powershell",
    "output-bat"
  ];

  for (const id of requiredIds) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /data-generator-form/);
  assert.match(html, /data-copy-status role="status" aria-live="polite"/);
});

test("共有生成処理をUI処理より先に読み込む", () => {
  const html = read("generator.html");
  const generatorModule = html.indexOf('src="js/generators.js"');
  const generatorUi = html.indexOf('src="js/generator-ui.js"');

  assert.ok(generatorModule >= 0);
  assert.ok(generatorUi > generatorModule);
});

test("各画面のfaviconを小文字のimageフォルダーから読み込む", () => {
  const launcherHtml = read("index.html");
  const generatorHtml = read("generator.html");
  const rootEntries = fs.readdirSync(root);

  assert.match(launcherHtml, /href="image\/favicon\.ico"/);
  assert.match(generatorHtml, /href="image\/favicon\.ico"/);
  assert.equal(fs.existsSync(path.join(root, "image", "favicon.ico")), true);
  assert.equal(rootEntries.includes("image"), true);
  assert.equal(rootEntries.includes("Image"), false);
});

test("ジェネレーターがテンプレート準拠のBootstrapレイアウトと画像資産を使用する", () => {
  const html = read("generator.html");
  const css = read("css/generator.css");

  assert.match(html, /class="navbar navbar-dark bg-brand shadow-sm"/);
  assert.match(html, /class="flex-fill container-md my-4"/);
  assert.match(html, /class="row g-4"/);
  assert.match(html, /class="card shadow-sm"/);
  assert.match(html, /src="image\/avatar\.png" alt=""/);
  assert.match(html, /<footer class="py-3 bg-brand text-white">/);
  assert.match(html, /class="form-control"/);
  assert.match(html, /class="form-select"/);
  assert.match(html, /class="btn btn-primary"/);
  assert.equal(fs.existsSync(path.join(root, "image", "avatar.png")), true);
  assert.match(css, /--brand:/);
  assert.match(css, /\.avatar/);
  assert.match(css, /\.mono/);
});

test("ジェネレーターのカラースキームをライトテーマに固定する", () => {
  const html = read("generator.html");

  assert.match(html, /<meta name="color-scheme" content="light">/);
  assert.doesNotMatch(html, /<meta name="color-scheme" content="light dark">/);
});

test("作者名に隣接するアバターを装飾画像として扱う", () => {
  const html = read("generator.html");

  assert.match(html, /<span[^>]*>by Rutile3<\/span>\s*<img src="image\/avatar\.png" alt=""/);
  assert.doesNotMatch(html, /<img src="image\/avatar\.png" alt="Rutile3"/);
});

test("ヘッダーのツール名がGitHubリポジトリへリンクする", () => {
  const html = read("generator.html");

  assert.match(
    html,
    /<a href="https:\/\/github\.com\/Rutile3\/scrapbox-diary-launcher" class="navbar-brand fw-bold">Scrapbox Diary Launcher<\/a>/
  );
});

test("各生成結果にコピー操作が関連付けられている", () => {
  const html = read("generator.html");
  for (const id of ["output-url", "output-userscript", "output-powershell", "output-bat"]) {
    assert.match(html, new RegExp(`data-copy-target="${id}"`));
  }
});

test("ルートページはジェネレーターUIを読み込まず、専用ページへ転送できる", () => {
  const html = read("index.html");
  const launcherUi = read("js/launcher-ui.js");

  assert.doesNotMatch(html, /data-generator-form|js\/generators\.js|js\/generator-ui\.js/);
  assert.match(launcherUi, /result\.type === "help"/);
  assert.match(launcherUi, /location\.replace\(new URL\("generator\.html"/);
});

test("ランチャーとジェネレーターが画面専用のスタイルとUIスクリプトを読み込む", () => {
  const launcherHtml = read("index.html");
  const generatorHtml = read("generator.html");
  const launcherCss = read("css/launcher.css");

  assert.match(launcherHtml, /href="css\/launcher\.css"/);
  assert.match(launcherHtml, /src="js\/launcher-ui\.js"/);
  assert.doesNotMatch(launcherHtml, /generator\.css|generator-ui\.js/);
  assert.match(generatorHtml, /href="css\/generator\.css"/);
  assert.match(generatorHtml, /src="js\/generator-ui\.js"/);
  assert.doesNotMatch(generatorHtml, /launcher\.css|launcher-ui\.js/);
  assert.doesNotMatch(launcherCss, /\.card|\bform\b|\.output|--accent/);
});

test("Bootstrap 5.3.3のCSSだけをジェネレーターがSRI付きで読み込む", () => {
  const launcherHtml = read("index.html");
  const generatorHtml = read("generator.html");

  assert.match(generatorHtml, /bootstrap@5\.3\.3\/dist\/css\/bootstrap\.min\.css/);
  assert.doesNotMatch(generatorHtml, /bootstrap@5\.3\.3\/dist\/js\/bootstrap\.bundle\.min\.js/);
  assert.match(generatorHtml, /sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW\+ALEwIH/);
  assert.doesNotMatch(generatorHtml, /sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz/);
  assert.equal((generatorHtml.match(/crossorigin="anonymous"/g) || []).length, 1);
  assert.ok(generatorHtml.indexOf("bootstrap.min.css") < generatorHtml.indexOf("css/generator.css"));
  assert.doesNotMatch(launcherHtml, /bootstrap|cdn\.jsdelivr\.net/);
});

test("Google Analyticsをジェネレーターだけでクエリ文字列とフラグメントを除外して初期化する", () => {
  const launcherHtml = read("index.html");
  const generatorHtml = read("generator.html");
  const analyticsBlock = generatorHtml.match(/<!-- Google tag \(gtag\.js\) -->[\s\S]*?page_location:[\s\S]*?<\/script>/);

  assert.ok(analyticsBlock);
  assert.match(analyticsBlock[0], /googletagmanager\.com\/gtag\/js\?id=G-501GNTE7BK/);
  assert.match(analyticsBlock[0], /gtag\("config", "G-501GNTE7BK"/);
  assert.match(
    analyticsBlock[0],
    /page_location: window\.location\.origin \+ window\.location\.pathname/
  );
  assert.doesNotMatch(
    analyticsBlock[0],
    /location\.href|location\.search|location\.hash|generator-body|data-generator-form/
  );
  assert.doesNotMatch(launcherHtml, /googletagmanager|G-501GNTE7BK|\bgtag\b/);
});

test("ジェネレーターは正規ランチャーのルートURLを生成する", () => {
  const script = read("js/generator-ui.js");

  assert.match(script, /return new URL\("\."\s*,\s*current\)\.href/);
});

test("UI処理は本文を永続化またはログ出力しない", () => {
  const script = read("js/generator-ui.js");
  assert.doesNotMatch(script, /localStorage|sessionStorage/);
  assert.doesNotMatch(script, /console\s*\./);
});

test("ブラウザーでの手動確認手順が用意されている", () => {
  const instructions = read("docs/MANUAL_TESTS.md");
  assert.match(instructions, /actionを切り替え/);
  assert.match(instructions, /#body=/);
  assert.match(instructions, /コピーボタン/);
  assert.match(instructions, /Tabキー/);
});
