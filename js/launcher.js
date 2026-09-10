(function (root, factory) {
  const core = typeof module === "object" && module.exports
    ? require("./diary-core.js")
    : root.ScrapboxDiaryCore;
  const api = factory(core);

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.ScrapboxDiaryLauncher = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (core) {
  "use strict";

  if (!core) {
    throw new Error("ScrapboxDiaryCoreを先に読み込んでください。");
  }

  const ACTIONS = Object.freeze([
    "show-today",
    "create-today",
    "show-month",
    "create-month-schedule"
  ]);

  /**
   * @typedef {"show-today"|"create-today"|"show-month"|"create-month-schedule"} LauncherAction
   */

  /** @typedef {{type: "help"}} LauncherHelpResult */

  /**
   * @typedef {Object} LauncherRedirectResult
   * @property {LauncherAction} action 実行するアクション
   * @property {string} destination 遷移先のScrapbox URL
   * @property {string} project Scrapboxプロジェクト名
   * @property {"redirect"} type 結果種別
   */

  /** ランチャー入力の検証エラー。 */
  class LauncherError extends Error {
    /**
     * @param {string} message 利用者向けメッセージ
     * @param {string} code 機械判定用のエラーコード
     */
    constructor(message, code) {
      super(message);
      this.name = "LauncherError";
      this.code = code;
    }
  }

  /**
   * URLフラグメントから自由記述本文を取得する。
   * @param {URL} url 対象URL
   * @returns {string|undefined} bodyがなければundefined
   */
  const getFragmentBody = (url) => {
    if (!url.hash) {
      return undefined;
    }

    const fragment = new URLSearchParams(url.hash.slice(1));
    return fragment.has("body") ? fragment.get("body") : undefined;
  };

  /**
   * ランチャーURLを検証し、表示内容または遷移先を解決する。
   * @param {string|URL} inputUrl ランチャーURL
   * @param {Date} [now] 日付省略時に基準とする現在日時
   * @returns {Readonly<LauncherHelpResult|LauncherRedirectResult>}
   * @throws {LauncherError} URL、action、project、日付、月、bodyの指定が不正な場合
   */
  const resolveLauncherRequest = (inputUrl, now) => {
    let url;
    try {
      url = inputUrl instanceof URL ? inputUrl : new URL(inputUrl);
    } catch (_error) {
      throw new LauncherError("ランチャーURLを解析できません。", "invalid-url");
    }

    const parameters = url.searchParams;
    const action = parameters.get("action");

    if (action === null) {
      if (url.search === "" && url.hash === "") {
        return Object.freeze({ type: "help" });
      }
      throw new LauncherError("actionパラメーターを指定してください。", "missing-action");
    }

    if (!ACTIONS.includes(action)) {
      throw new LauncherError(`未対応のactionです: ${action}`, "invalid-action");
    }

    if (parameters.has("body")) {
      throw new LauncherError(
        "bodyはクエリ文字列ではなく、#body=... の形式でURLフラグメントに指定してください。",
        "body-in-query"
      );
    }

    const fragmentBody = getFragmentBody(url);
    if (fragmentBody !== undefined && action !== "create-today") {
      throw new LauncherError(
        "bodyを指定できるactionはcreate-todayだけです。",
        "body-not-supported"
      );
    }

    const project = parameters.get("project");

    try {
      core.validateProject(project);

      let destination;
      switch (action) {
        case "show-today":
          destination = core.buildDailyUrl(project, core.resolveDate(parameters.get("date") ?? undefined, now));
          break;
        case "create-today":
          destination = core.buildDailyUrl(
            project,
            core.resolveDate(parameters.get("date") ?? undefined, now),
            fragmentBody
          );
          break;
        case "show-month":
          destination = core.buildMonthlyUrl(project, core.resolveMonth(parameters.get("month") ?? undefined, now));
          break;
        case "create-month-schedule":
          destination = core.buildMonthlyScheduleUrl(
            project,
            core.resolveMonth(parameters.get("month") ?? undefined, now)
          );
          break;
      }

      return Object.freeze({ action, destination, project, type: "redirect" });
    } catch (error) {
      if (error instanceof LauncherError) {
        throw error;
      }
      throw new LauncherError(error.message, "invalid-parameter");
    }
  };

  return Object.freeze({ ACTIONS, LauncherError, getFragmentBody, resolveLauncherRequest });
});
