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

  class LauncherError extends Error {
    constructor(message, code) {
      super(message);
      this.name = "LauncherError";
      this.code = code;
    }
  }

  const getFragmentBody = (url) => {
    if (!url.hash) {
      return undefined;
    }

    const fragment = new URLSearchParams(url.hash.slice(1));
    return fragment.has("body") ? fragment.get("body") : undefined;
  };

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
