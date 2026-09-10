"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

test("READMEだけで主要機能、パラメーター、プライバシー方針を確認できる", () => {
  const readme = read("README.md");

  for (const action of ["show-today", "create-today", "show-month", "create-month-schedule"]) {
    assert.match(readme, new RegExp(`\\b${action}\\b`));
  }
  for (const parameter of ["action", "project", "date", "month", "body"]) {
    assert.ok(readme.includes(`| \`${parameter}\` |`));
  }
  assert.match(readme, /#body=/);
  assert.match(readme, /localStorage/);
  assert.match(readme, /sessionStorage/);
  assert.doesNotMatch(readme, /github\.com\/Rutile3\/RedirectPage\/wiki/);
});

test("READMEから主要なリポジトリ内文書へ移動できる", () => {
  const readme = read("README.md");
  for (const target of [
    "docs/README.md",
    "docs/task-list.md",
    "docs/MIGRATION.md",
    "docs/MANUAL_TESTS.md",
    "docs/wiki/README.md"
  ]) {
    assert.match(readme, new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.equal(fs.existsSync(path.join(root, target)), true);
  }
});

test("文書一覧から作業管理と変更記録へ移動できる", () => {
  const index = read("docs/README.md");
  for (const target of [
    "task-list.md",
    "spec_additions.md",
    "spec_changes.md",
    "bug_fixes.md",
    "refactoring.md",
    "REFACTOR_PLAN.md"
  ]) {
    assert.match(index, new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.equal(fs.existsSync(path.join(root, "docs", target)), true);
  }
});

test("移行済みWikiの4機能ページで現行版と旧版を区別する", () => {
  for (const name of ["CreateToday", "ShowToday", "CreateMonthSchedule", "ShowMonthSchedule"]) {
    const page = read(`docs/wiki/${name}.md`);
    assert.match(page, /## 現行版/);
    assert.match(page, /## 旧RedirectPage版の記録/);
    assert.match(page, /scrapbox-diary-launcher/);
    assert.match(page, /移行ガイド/);
  }
});

test("Markdownのリポジトリ相対リンク先が存在する", () => {
  const files = [
    "README.md",
    "docs/wiki/README.md",
    "docs/wiki/Home.md",
    "docs/wiki/CreateToday.md",
    "docs/wiki/ShowToday.md",
    "docs/wiki/CreateMonthSchedule.md",
    "docs/wiki/ShowMonthSchedule.md"
  ];

  for (const relativePath of files) {
    const content = read(relativePath);
    const directory = path.dirname(path.join(root, relativePath));
    const links = [...content.matchAll(/\[[^\]]*\]\((?!https?:|#)([^)]+)\)/g)];
    for (const link of links) {
      const target = decodeURIComponent(link[1].split("#")[0]);
      assert.equal(fs.existsSync(path.resolve(directory, target)), true, `${relativePath}: ${target}`);
    }
  }
});
