(function (root, factory) {
  const core = typeof module === "object" && module.exports
    ? require("./diary-core.js")
    : root.ScrapboxDiaryCore;
  const launcher = typeof module === "object" && module.exports
    ? require("./launcher.js")
    : root.ScrapboxDiaryLauncher;
  const api = factory(core, launcher);

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.ScrapboxDiaryGenerators = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (core, launcher) {
  "use strict";

  if (!core || !launcher) {
    throw new Error("ScrapboxDiaryCoreとScrapboxDiaryLauncherを先に読み込んでください。");
  }

  /**
   * @typedef {Object} GeneratorOptions
   * @property {string} action ランチャーのアクション
   * @property {string|URL} baseUrl 正規ランチャーのベースURL
   * @property {string} project Scrapboxプロジェクト名
   * @property {*} [body] create-todayで使用する本文
   * @property {string} [date] YYYY-MM-DD形式の日付
   * @property {string} [month] YYYY-MM形式の月
   */

  /**
   * @typedef {Object} GeneratedLaunchers
   * @property {string} bat BATランチャー
   * @property {string} bookmarklet ブックマークレット
   * @property {string} powerShell PowerShellランチャー
   * @property {string} url 正規ランチャーURL
   * @property {string} userScript Scrapbox UserScript用JavaScript
   */

  /** @param {*} value @returns {boolean} */
  const hasValue = (value) => value !== undefined && value !== null;

  /**
   * ベースURLを解析し、既存のクエリ文字列とフラグメントを除去する。
   * @param {string|URL} value ベースURL
   * @returns {URL}
   * @throws {RangeError} URLを解析できない場合
   */
  const parseBaseUrl = (value) => {
    try {
      const url = value instanceof URL ? new URL(value.href) : new URL(value);
      url.search = "";
      url.hash = "";
      return url;
    } catch (_error) {
      throw new RangeError("正規ランチャーのベースURLを指定してください。");
    }
  };

  /**
   * actionと任意パラメーターの組み合わせを検証する。
   * @param {GeneratorOptions} options ランチャー設定
   * @returns {void}
   * @throws {RangeError} action、日付、月、bodyの指定が不正な場合
   */
  const validateActionOptions = (options) => {
    const { action, body, date, month } = options;

    if (!launcher.ACTIONS.includes(action)) {
      throw new RangeError(`未対応のactionです: ${action}`);
    }

    const dailyAction = action === "show-today" || action === "create-today";
    if (dailyAction && hasValue(month)) {
      throw new RangeError("日次actionにはmonthを指定できません。");
    }
    if (!dailyAction && hasValue(date)) {
      throw new RangeError("月次actionにはdateを指定できません。");
    }
    if (hasValue(body) && action !== "create-today") {
      throw new RangeError("bodyを指定できるactionはcreate-todayだけです。");
    }

    if (hasValue(date)) {
      core.parseIsoDate(date);
    }
    if (hasValue(month)) {
      core.parseIsoMonth(month);
    }
  };

  /**
   * 設定から正規ランチャーURLを生成する。bodyはURLフラグメントへ格納する。
   * @param {GeneratorOptions} options ランチャー設定
   * @returns {string}
   * @throws {TypeError|RangeError} 設定または各入力値が不正な場合
   */
  const generateLauncherUrl = (options) => {
    if (!options || typeof options !== "object") {
      throw new TypeError("ランチャー設定を指定してください。");
    }

    const { action, baseUrl, body, date, month, project } = options;
    core.validateProject(project);
    validateActionOptions(options);

    const url = parseBaseUrl(baseUrl);
    url.searchParams.set("action", action);
    url.searchParams.set("project", project);

    if (hasValue(date)) {
      url.searchParams.set("date", date);
    }
    if (hasValue(month)) {
      url.searchParams.set("month", month);
    }
    if (hasValue(body)) {
      const fragment = new URLSearchParams();
      fragment.set("body", String(body));
      url.hash = fragment.toString();
    }

    return url.href;
  };

  /**
   * URLまたはURL文字列を絶対URL文字列へ正規化する。
   * @param {string|URL} launcherUrl ランチャーURL
   * @returns {string}
   * @throws {RangeError} URLを解析できない場合
   */
  const normalizeUrl = (launcherUrl) => {
    try {
      return launcherUrl instanceof URL ? launcherUrl.href : new URL(launcherUrl).href;
    } catch (_error) {
      throw new RangeError("有効なランチャーURLを指定してください。");
    }
  };

  /**
   * 指定URLへ遷移するScrapbox UserScript用JavaScriptを生成する。
   * @param {string|URL} launcherUrl ランチャーURL
   * @returns {string}
   * @throws {RangeError} URLを解析できない場合
   */
  const generateUserScript = (launcherUrl) => {
    const urlLiteral = JSON.stringify(normalizeUrl(launcherUrl));
    return [
      "(() => {",
      `  const launcherUrl = ${urlLiteral};`,
      "  location.href = launcherUrl;",
      "})();"
    ].join("\n");
  };

  /**
   * 指定URLへ遷移するブックマークレットを生成する。
   * @param {string|URL} launcherUrl ランチャーURL
   * @returns {string}
   * @throws {RangeError} URLを解析できない場合
   */
  const generateBookmarklet = (launcherUrl) => {
    const urlLiteral = JSON.stringify(normalizeUrl(launcherUrl));
    return `javascript:void(location.href=${urlLiteral})`;
  };

  /** @param {string} value @returns {string} PowerShell単一引用符文字列用の値 */
  const escapePowerShellSingleQuotedString = (value) => value.replace(/'/g, "''");

  /**
   * ランチャーURLを開くPowerShellコマンドを生成する。
   * @param {string|URL} launcherUrl ランチャーURL
   * @returns {string}
   * @throws {RangeError} URLを解析できない場合
   */
  const generatePowerShell = (launcherUrl) => {
    const escaped = escapePowerShellSingleQuotedString(normalizeUrl(launcherUrl));
    return `Start-Process -FilePath '${escaped}'`;
  };

  /** @param {string} value @returns {string} BATの二重引用符付き引数用の値 */
  const escapeBatArgument = (value) => value.replace(/%/g, "%%").replace(/"/g, '""');

  /**
   * ランチャーURLを開くBATコマンドを生成する。
   * @param {string|URL} launcherUrl ランチャーURL
   * @returns {string}
   * @throws {RangeError} URLを解析できない場合
   */
  const generateBat = (launcherUrl) => {
    const escaped = escapeBatArgument(normalizeUrl(launcherUrl));
    return `@start "" "${escaped}"`;
  };

  /**
   * 正規URLと各呼び出し元向けコードをまとめて生成する。
   * @param {GeneratorOptions} options ランチャー設定
   * @returns {Readonly<GeneratedLaunchers>}
   * @throws {TypeError|RangeError} 設定または各入力値が不正な場合
   */
  const generateAll = (options) => {
    const url = generateLauncherUrl(options);
    return Object.freeze({
      bat: generateBat(url),
      bookmarklet: generateBookmarklet(url),
      powerShell: generatePowerShell(url),
      url,
      userScript: generateUserScript(url)
    });
  };

  return Object.freeze({
    escapeBatArgument,
    escapePowerShellSingleQuotedString,
    generateAll,
    generateBat,
    generateBookmarklet,
    generateLauncherUrl,
    generatePowerShell,
    generateUserScript
  });
});
