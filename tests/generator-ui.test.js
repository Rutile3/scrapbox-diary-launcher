"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("ジェネレーターに必要な入力と出力がルートページに存在する", () => {
  const html = read("index.html");
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
  const html = read("index.html");
  const generatorModule = html.indexOf('src="js/generators.js"');
  const generatorUi = html.indexOf('src="js/generator-ui.js"');

  assert.ok(generatorModule >= 0);
  assert.ok(generatorUi > generatorModule);
});

test("各生成結果にコピー操作が関連付けられている", () => {
  const html = read("index.html");
  for (const id of ["output-url", "output-userscript", "output-powershell", "output-bat"]) {
    assert.match(html, new RegExp(`data-copy-target="${id}"`));
  }
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
