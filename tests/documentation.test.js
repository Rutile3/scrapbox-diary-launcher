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
    "docs/functional-spec.md",
    "docs/task-list.md",
    "docs/MIGRATION.md",
    "docs/MANUAL_TESTS.md"
  ]) {
    assert.match(readme, new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.equal(fs.existsSync(path.join(root, target)), true);
  }
});

test("機能仕様書が現行ランチャーと互換動作を網羅する", () => {
  const specification = read("docs/functional-spec.md");

  for (const action of ["show-today", "create-today", "show-month", "create-month-schedule"]) {
    assert.match(specification, new RegExp(`\\b${action}\\b`));
  }
  for (const code of [
    "invalid-url",
    "missing-action",
    "invalid-action",
    "body-in-query",
    "body-not-supported",
    "invalid-parameter"
  ]) {
    assert.match(specification, new RegExp(`\\b${code}\\b`));
  }
  for (const endpoint of ["CreateToday", "ShowToday", "CreateMonthSchedule", "ShowMonthSchedule"]) {
    assert.match(specification, new RegExp(`${endpoint}\\.html`));
  }
  assert.match(specification, /Rutile3-Test/);
  assert.match(specification, /#月予定表/);
});

test("文書一覧から作業管理と変更記録へ移動できる", () => {
  const index = read("docs/README.md");
  for (const target of [
    "task-list.md",
    "spec_additions.md",
    "spec_changes.md",
    "bug_fixes.md",
    "refactoring.md",
    "functional-spec.md",
    "REFACTOR_PLAN.md"
  ]) {
    assert.match(index, new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.equal(fs.existsSync(path.join(root, "docs", target)), true);
  }
});

test("Markdownのリポジトリ相対リンク先が存在する", () => {
  const files = [
    "README.md",
    "docs/README.md",
    "docs/functional-spec.md",
    "docs/MIGRATION.md",
    "docs/MANUAL_TESTS.md",
    "docs/REFACTOR_PLAN.md",
    "docs/task-list.md",
    "docs/spec_additions.md",
    "docs/spec_changes.md",
    "docs/bug_fixes.md",
    "docs/refactoring.md"
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
