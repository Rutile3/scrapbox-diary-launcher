"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const generators = require("../js/generators.js");
const launcher = require("../js/launcher.js");

const BASE = "https://rutile3.github.io/scrapbox-diary-launcher/";
const SPECIAL_BODY = "日本語 space\n&%#?=\"'";

test("4つのactionの正規ランチャーURLを生成する", () => {
  const cases = [
    [
      { action: "show-today", baseUrl: BASE, project: "Example", date: "2024-02-29" },
      `${BASE}?action=show-today&project=Example&date=2024-02-29`
    ],
    [
      { action: "create-today", baseUrl: BASE, project: "Example" },
      `${BASE}?action=create-today&project=Example`
    ],
    [
      { action: "show-month", baseUrl: BASE, project: "Example", month: "2025-01" },
      `${BASE}?action=show-month&project=Example&month=2025-01`
    ],
    [
      { action: "create-month-schedule", baseUrl: BASE, project: "Example" },
      `${BASE}?action=create-month-schedule&project=Example`
    ]
  ];

  for (const [options, expected] of cases) {
    assert.equal(generators.generateLauncherUrl(options), expected);
  }
});

test("本文をクエリではなくフラグメントへエンコードする", () => {
  const generated = generators.generateLauncherUrl({
    action: "create-today",
    baseUrl: `${BASE}?old=value#old-fragment`,
    body: SPECIAL_BODY,
    date: "2024-02-29",
    project: "日本語 project"
  });
  const url = new URL(generated);

  assert.equal(url.searchParams.get("project"), "日本語 project");
  assert.equal(url.searchParams.has("body"), false);
  assert.equal(new URLSearchParams(url.hash.slice(1)).get("body"), SPECIAL_BODY);
  assert.equal(url.searchParams.has("old"), false);
  assert.ok(!generated.includes("日本語"));
});

test("生成URLを正規ランチャーで解決できる", () => {
  const generated = generators.generateLauncherUrl({
    action: "create-today",
    baseUrl: BASE,
    body: SPECIAL_BODY,
    date: "2024-02-29",
    project: "Example"
  });
  const result = launcher.resolveLauncherRequest(generated);

  assert.equal(result.type, "redirect");
  assert.equal(result.destination.split("?body=")[0], "https://scrapbox.io/Example/240229");
  assert.equal(decodeURIComponent(result.destination.split("?body=")[1]), SPECIAL_BODY);
});

test("不正またはactionに合わない入力を拒否する", () => {
  const invalidOptions = [
    undefined,
    { action: "unknown", baseUrl: BASE, project: "Example" },
    { action: "show-today", baseUrl: BASE, project: "" },
    { action: "show-today", baseUrl: BASE, project: "Example", date: "2023-02-29" },
    { action: "show-month", baseUrl: BASE, project: "Example", month: "2024-13" },
    { action: "show-today", baseUrl: BASE, project: "Example", month: "2024-01" },
    { action: "show-month", baseUrl: BASE, project: "Example", date: "2024-01-01" },
    { action: "show-month", baseUrl: BASE, project: "Example", body: "unused" }
  ];

  for (const options of invalidOptions) {
    assert.throws(() => generators.generateLauncherUrl(options));
  }
});

test("UserScriptを有効なJavaScriptとして生成する", () => {
  const url = generators.generateLauncherUrl({
    action: "create-today",
    baseUrl: BASE,
    body: SPECIAL_BODY,
    project: "Example"
  });
  const script = generators.generateUserScript(url);
  const sandbox = { location: { href: "https://scrapbox.io/Example" } };

  new vm.Script(script).runInNewContext(sandbox);
  assert.equal(sandbox.location.href, url);
});

test("ブックマークレットを有効なJavaScript URLとして生成する", () => {
  const url = generators.generateLauncherUrl({
    action: "create-today",
    baseUrl: BASE,
    body: SPECIAL_BODY,
    project: "Example"
  });
  const bookmarklet = generators.generateBookmarklet(url);
  const sandbox = { location: { href: "https://example.com/" } };

  assert.ok(bookmarklet.startsWith("javascript:"));
  new vm.Script(bookmarklet.slice("javascript:".length)).runInNewContext(sandbox);
  assert.equal(sandbox.location.href, url);
  assert.ok(bookmarklet.includes("#body="));
});

test("PowerShell用の単一引用符を安全にエスケープする", () => {
  assert.equal(generators.escapePowerShellSingleQuotedString("a'b''c"), "a''b''''c");

  const url = generators.generateLauncherUrl({
    action: "create-today",
    baseUrl: BASE,
    body: SPECIAL_BODY,
    project: "Example"
  });
  const script = generators.generatePowerShell(url);

  assert.equal(script, `Start-Process -FilePath '${url.replace(/'/g, "''")}'`);
  assert.ok(script.includes("#body="));
});

test("BATファイル用にパーセント記号と引用符をエスケープする", () => {
  assert.equal(generators.escapeBatArgument('a%20b"c'), 'a%%20b""c');

  const url = generators.generateLauncherUrl({
    action: "create-today",
    baseUrl: BASE,
    body: SPECIAL_BODY,
    project: "Example"
  });
  const bat = generators.generateBat(url);
  const argument = bat.slice('@start "" "'.length, -1).replace(/%%/g, "%").replace(/""/g, '"');

  assert.equal(argument, url);
  assert.ok(bat.includes("%%"));
  assert.ok(bat.includes("#body="));
});

test("全形式を同じ正規URLからまとめて生成する", () => {
  const outputs = generators.generateAll({
    action: "show-month",
    baseUrl: BASE,
    month: "2026-09",
    project: "Example"
  });

  assert.equal(outputs.url, `${BASE}?action=show-month&project=Example&month=2026-09`);
  assert.ok(outputs.bookmarklet.includes(outputs.url));
  assert.ok(outputs.userScript.includes(outputs.url));
  assert.ok(outputs.powerShell.includes(outputs.url));
  assert.ok(outputs.bat.includes(outputs.url));
  assert.ok(Object.isFrozen(outputs));
});
