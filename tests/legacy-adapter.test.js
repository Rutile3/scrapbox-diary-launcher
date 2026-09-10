"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const adapter = require("../js/legacy-adapter.js");

const CANONICAL = "https://rutile3.github.io/scrapbox-diary-launcher/";

const convert = (pathAndQuery, action) => {
  const source = new URL(pathAndQuery, CANONICAL);
  return new URL(adapter.buildCanonicalUrl(source, CANONICAL, action));
};

test("CreateTodayの旧パラメーターを正規形式へ変換する", () => {
  const body = "日本語 space\n&%#?=\"'";
  const source = `/Scrapbox/Diary/CreateToday/CreateToday.html?project_url=Example&yymmdd=240229&body=${encodeURIComponent(body)}`;
  const result = convert(source, "create-today");

  assert.equal(result.searchParams.get("action"), "create-today");
  assert.equal(result.searchParams.get("project"), "Example");
  assert.equal(result.searchParams.get("date"), "2024-02-29");
  assert.equal(result.searchParams.has("body"), false);
  assert.equal(new URLSearchParams(result.hash.slice(1)).get("body"), body);
});

test("ShowTodayの旧日付を正規形式へ変換する", () => {
  const result = convert(
    "/Scrapbox/Diary/ShowToday/ShowToday.html?project_url=Example&yymmdd=260910",
    "show-today"
  );
  assert.equal(result.href, `${CANONICAL}?action=show-today&project=Example&date=2026-09-10`);
});

test("月次の2エンドポイントを正規形式へ変換する", () => {
  const show = convert("?project_url=Example&yymm=2412", "show-month");
  const create = convert("?project_url=Example&yymm=2501", "create-month-schedule");

  assert.equal(show.href, `${CANONICAL}?action=show-month&project=Example&month=2024-12`);
  assert.equal(create.href, `${CANONICAL}?action=create-month-schedule&project=Example&month=2025-01`);
});

test("project_url省略時は旧エンドポイントだけ既存の既定値を維持する", () => {
  const result = convert("?yymmdd=240101", "show-today");
  assert.equal(result.searchParams.get("project"), "Rutile3-Test");
});

test("無効な旧日付または月は省略し正規ランチャーの現在値へ委ねる", () => {
  const invalidDate = convert("?project_url=Example&yymmdd=230229", "show-today");
  const invalidMonth = convert("?project_url=Example&yymm=2413", "show-month");

  assert.equal(invalidDate.searchParams.has("date"), false);
  assert.equal(invalidMonth.searchParams.has("month"), false);
});

test("未対応の旧エンドポイント設定を拒否する", () => {
  assert.throws(
    () => adapter.buildCanonicalUrl(CANONICAL, CANONICAL, "unknown"),
    /未対応/
  );
});

test("4つの旧HTMLパスが共通互換ラッパーを読み込む", () => {
  const root = path.resolve(__dirname, "..");
  const wrappers = [
    ["Scrapbox/Diary/CreateToday/CreateToday.html", "create-today"],
    ["Scrapbox/Diary/ShowToday/ShowToday.html", "show-today"],
    ["Scrapbox/Diary/CreateMonthSchedule/CreateMonthSchedule.html", "create-month-schedule"],
    ["Scrapbox/Diary/ShowMonthSchedule/ShowMonthSchedule.html", "show-month"]
  ];

  for (const [relativePath, action] of wrappers) {
    const html = fs.readFileSync(path.join(root, relativePath), "utf8");
    assert.match(html, new RegExp(`data-legacy-action="${action}"`));
    assert.match(html, /src="\.\.\/\.\.\/\.\.\/js\/diary-core\.js"/);
    assert.match(html, /src="\.\.\/\.\.\/\.\.\/js\/legacy-adapter\.js"/);
    assert.match(html, /src="\.\.\/\.\.\/\.\.\/js\/legacy-wrapper\.js"/);
  }
});
