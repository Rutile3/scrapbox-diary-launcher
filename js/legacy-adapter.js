(function (root, factory) {
  const core = typeof module === "object" && module.exports
    ? require("./diary-core.js")
    : root.ScrapboxDiaryCore;
  const api = factory(core);

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.ScrapboxDiaryLegacyAdapter = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (core) {
  "use strict";

  if (!core) {
    throw new Error("ScrapboxDiaryCoreを先に読み込んでください。");
  }

  const LEGACY_DEFAULT_PROJECT = "Rutile3-Test";
  const LEGACY_ACTIONS = Object.freeze({
    "create-month-schedule": Object.freeze({ legacyParameter: "yymm", canonicalParameter: "month" }),
    "create-today": Object.freeze({ legacyParameter: "yymmdd", canonicalParameter: "date" }),
    "show-month": Object.freeze({ legacyParameter: "yymm", canonicalParameter: "month" }),
    "show-today": Object.freeze({ legacyParameter: "yymmdd", canonicalParameter: "date" })
  });

  /** @param {number} value @returns {string} */
  const pad2 = (value) => String(value).padStart(2, "0");

  /** @param {Date} date @returns {string} YYYY-MM-DD形式の日付 */
  const toIsoDate = (date) => {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  };

  /** @param {Date} date @returns {string} YYYY-MM形式の月 */
  const toIsoMonth = (date) => {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
  };

  /**
   * 旧形式の日付または月をISO形式へ変換する。
   * 旧実装との互換性のため、不正値は例外にせず省略扱いにする。
   * @param {"yymmdd"|"yymm"} name 旧パラメーター名
   * @param {string} value 変換対象
   * @returns {string|undefined}
   */
  const convertLegacyValue = (name, value) => {
    try {
      return name === "yymmdd"
        ? toIsoDate(core.parseLegacyDate(value))
        : toIsoMonth(core.parseLegacyMonth(value));
    } catch (_error) {
      // 旧実装は無効な日付または月を現在値へフォールバックしていたため、
      // 正規ランチャー側で既定値を使わせる目的でパラメーターを省略する。
      return undefined;
    }
  };

  /**
   * 旧エンドポイントのURLを正規ランチャーURLへ変換する。
   * @param {string|URL} legacyUrl 旧形式のパラメーターを含むURL
   * @param {string|URL} canonicalBaseUrl 正規ランチャーのベースURL
   * @param {string} action 旧エンドポイントに対応するアクション
   * @returns {string} 正規ランチャーURL
   * @throws {RangeError} actionが未対応の場合
   * @throws {TypeError} URLを解析できない場合
   */
  const buildCanonicalUrl = (legacyUrl, canonicalBaseUrl, action) => {
    const configuration = LEGACY_ACTIONS[action];
    if (!configuration) {
      throw new RangeError(`未対応の旧エンドポイントです: ${action}`);
    }

    const source = legacyUrl instanceof URL ? legacyUrl : new URL(legacyUrl);
    const destination = canonicalBaseUrl instanceof URL
      ? new URL(canonicalBaseUrl.href)
      : new URL(canonicalBaseUrl);
    const sourceParameters = source.searchParams;
    const project = sourceParameters.get("project_url") || LEGACY_DEFAULT_PROJECT;

    destination.search = "";
    destination.hash = "";
    destination.searchParams.set("action", action);
    destination.searchParams.set("project", project);

    if (sourceParameters.has(configuration.legacyParameter)) {
      const converted = convertLegacyValue(
        configuration.legacyParameter,
        sourceParameters.get(configuration.legacyParameter)
      );
      if (converted !== undefined) {
        destination.searchParams.set(configuration.canonicalParameter, converted);
      }
    }

    if (action === "create-today" && sourceParameters.has("body")) {
      const fragment = new URLSearchParams();
      fragment.set("body", sourceParameters.get("body"));
      destination.hash = fragment.toString();
    }

    return destination.href;
  };

  return Object.freeze({
    LEGACY_ACTIONS,
    LEGACY_DEFAULT_PROJECT,
    buildCanonicalUrl,
    convertLegacyValue
  });
});
