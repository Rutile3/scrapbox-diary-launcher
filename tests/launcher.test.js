"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const launcher = require("../js/launcher.js");

const BASE = "https://rutile3.github.io/scrapbox-diary-launcher/";
const NOW = new Date(2026, 8, 10, 12, 0, 0);

const resolve = (relativeUrl) => {
  return launcher.resolveLauncherRequest(new URL(relativeUrl, BASE), NOW);
};

test("パラメーターのないルートURLではヘルプを表示する", () => {
  assert.deepEqual(resolve(""), { type: "help" });
});

test("今日の日記ページを表示するURLを解決する", () => {
  const result = resolve("?action=show-today&project=Example");
  assert.equal(result.type, "redirect");
  assert.equal(result.destination, "https://scrapbox.io/Example/260910");
});

test("指定日の日記ページを表示するURLを解決する", () => {
  const result = resolve("?action=show-today&project=Example&date=2024-02-29");
  assert.equal(result.destination, "https://scrapbox.io/Example/240229");
});

test("フラグメントの本文を使って日記ページを作成する", () => {
  const body = "日本語 space\n&%#?=\"'";
  const source = `?action=create-today&project=Example&date=2024-02-29#body=${encodeURIComponent(body)}`;
  const result = resolve(source);
  const destinationBody = result.destination.split("?body=")[1];

  assert.equal(result.destination.split("?body=")[0], "https://scrapbox.io/Example/240229");
  assert.equal(decodeURIComponent(destinationBody), body);
  assert.ok(!new URL(source, BASE).searchParams.has("body"));
});

test("本文を省略した日記作成URLにはbodyクエリを付けない", () => {
  const result = resolve("?action=create-today&project=Example");
  assert.equal(result.destination, "https://scrapbox.io/Example/260910");
});

test("現在月と指定月のページを表示するURLを解決する", () => {
  assert.equal(
    resolve("?action=show-month&project=Example").destination,
    "https://scrapbox.io/Example/2609"
  );
  assert.equal(
    resolve("?action=show-month&project=Example&month=2025-01").destination,
    "https://scrapbox.io/Example/2501"
  );
});

test("月間予定を生成するURLを解決する", () => {
  const result = resolve("?action=create-month-schedule&project=Example&month=2024-02");
  const body = decodeURIComponent(result.destination.split("?body=")[1]);

  assert.equal(result.destination.split("?body=")[0], "https://scrapbox.io/Example/2402");
  assert.ok(body.includes("[*** 2024年02月]"));
  assert.ok(body.includes("[240229] 木"));
  assert.ok(body.endsWith("#月予定表\n"));
});

test("actionまたはprojectの欠落を明確なエラーにする", () => {
  assert.throws(
    () => resolve("?project=Example"),
    (error) => error.code === "missing-action" && /action/.test(error.message)
  );
  assert.throws(
    () => resolve("?action=show-today"),
    (error) => error.code === "invalid-parameter" && /プロジェクト/.test(error.message)
  );
});

test("未対応のactionと無効な日付・月・projectを拒否する", () => {
  const cases = [
    ["?action=unknown&project=Example", "invalid-action"],
    ["?action=show-today&project=Example&date=2023-02-29", "invalid-parameter"],
    ["?action=show-month&project=Example&month=2024-13", "invalid-parameter"],
    ["?action=show-today&project=a%2Fb", "invalid-parameter"]
  ];

  for (const [url, code] of cases) {
    assert.throws(() => resolve(url), (error) => error.code === code);
  }
});

test("bodyをクエリ文字列で渡すことを拒否する", () => {
  assert.throws(
    () => resolve("?action=create-today&project=Example&body=secret"),
    (error) => error.code === "body-in-query" && /フラグメント/.test(error.message)
  );
});

test("create-today以外のactionに指定されたbodyを拒否する", () => {
  assert.throws(
    () => resolve("?action=show-today&project=Example#body=unused"),
    (error) => error.code === "body-not-supported"
  );
});
