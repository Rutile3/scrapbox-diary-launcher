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

  const pad2 = (value) => String(value).padStart(2, "0");

  const toIsoDate = (date) => {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  };

  const toIsoMonth = (date) => {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
  };

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
