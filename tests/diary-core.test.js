"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../js/diary-core.js");

test("ISO形式の日付をローカル日付として厳密に解析する", () => {
  const date = core.parseIsoDate("2024-02-29");
  assert.equal(date.getFullYear(), 2024);
  assert.equal(date.getMonth(), 1);
  assert.equal(date.getDate(), 29);

  for (const invalid of ["2023-02-29", "2024-02-30", "2024-13-01", "24-01-01", "2024-1-01", ""]) {
    assert.throws(() => core.parseIsoDate(invalid), RangeError);
  }
});

test("ISO形式の月を厳密に解析する", () => {
  assert.equal(core.formatMonthlyPageName(core.parseIsoMonth("2024-12")), "2412");

  for (const invalid of ["2024-00", "2024-13", "24-01", "2024-1", ""]) {
    assert.throws(() => core.parseIsoMonth(invalid), RangeError);
  }
});

test("旧形式の日付と月を2000年代として解析する", () => {
  assert.equal(core.formatDailyPageName(core.parseLegacyDate("240229")), "240229");
  assert.equal(core.formatMonthlyPageName(core.parseLegacyMonth("2412")), "2412");
  assert.throws(() => core.parseLegacyDate("230229"), RangeError);
  assert.throws(() => core.parseLegacyMonth("2413"), RangeError);
});

test("省略時は指定した現在日時のローカル日付と月を使用する", () => {
  const now = new Date(2025, 0, 31, 23, 59, 59);
  assert.equal(core.formatDailyPageName(core.resolveDate(undefined, now)), "250131");
  assert.equal(core.formatMonthlyPageName(core.resolveMonth(undefined, now)), "2501");
  assert.throws(() => core.resolveDate("", now), RangeError);
  assert.throws(() => core.resolveMonth("", now), RangeError);
});

test("日次と月次のページ名を生成する", () => {
  assert.equal(core.formatDailyPageName(core.parseIsoDate("2026-09-10")), "260910");
  assert.equal(core.formatMonthlyPageName(core.parseIsoMonth("2026-09")), "2609");
});

test("プロジェクトを必須としパスを壊す文字を拒否する", () => {
  assert.equal(core.validateProject("Rutile3-Test"), "Rutile3-Test");
  assert.equal(core.validateProject("日本語 project"), "日本語 project");

  for (const invalid of [undefined, "", " project", "project ", "a/b", "a\\b", "a?b", "a#b", "a\nb"]) {
    assert.throws(() => core.validateProject(invalid), RangeError);
  }
});

test("Scrapboxの日次URLと月次URLを構築する", () => {
  const date = core.parseIsoDate("2026-09-10");
  const month = core.parseIsoMonth("2026-09");
  assert.equal(core.buildDailyUrl("Rutile3-Test", date), "https://scrapbox.io/Rutile3-Test/260910");
  assert.equal(core.buildMonthlyUrl("Rutile3-Test", month), "https://scrapbox.io/Rutile3-Test/2609");
  assert.equal(
    core.buildDailyUrl("日本語 project", date),
    "https://scrapbox.io/%E6%97%A5%E6%9C%AC%E8%AA%9E%20project/260910"
  );
});

test("本文を一度だけURLエンコードする", () => {
  const body = "日本語 space\n&%#?=\"'";
  const url = core.buildDailyUrl("Example", core.parseIsoDate("2024-02-29"), body);
  assert.equal(url.split("?body=")[0], "https://scrapbox.io/Example/240229");
  assert.equal(decodeURIComponent(url.split("?body=")[1]), body);
  assert.ok(!url.includes("日本語"));
  assert.ok(!url.includes("#"));
});

test("月間予定本文に既存形式のナビゲーション、全日、タグを含める", () => {
  const body = core.generateMonthlyScheduleBody(core.parseIsoMonth("2024-02"));
  const dailyLines = body.split("\n").filter((line) => /^\[2402\d{2}\]/.test(line));

  assert.ok(body.startsWith("[**** [2401]←→[2403]]\n\n[*** 2024年02月]\n"));
  assert.equal(dailyLines.length, 29);
  assert.ok(body.includes("[240201] 木 \n"));
  assert.ok(body.includes("[240229] 木 \n"));
  assert.ok(body.endsWith("\n[**** [2401]←→[2403]]\n\n#月予定表\n"));
});

test("月と年の境界を正しく処理する", () => {
  const january = core.generateMonthlyScheduleBody(core.parseIsoMonth("2024-01"));
  const december = core.generateMonthlyScheduleBody(core.parseIsoMonth("2024-12"));
  assert.ok(january.includes("[**** [2312]←→[2402]]"));
  assert.ok(december.includes("[**** [2411]←→[2501]]"));
});

test("月間予定URLの本文を復元できる", () => {
  const month = core.parseIsoMonth("2025-06");
  const url = core.buildMonthlyScheduleUrl("Example", month);
  assert.equal(url.split("?body=")[0], "https://scrapbox.io/Example/2506");
  assert.equal(decodeURIComponent(url.split("?body=")[1]), core.generateMonthlyScheduleBody(month));
});
