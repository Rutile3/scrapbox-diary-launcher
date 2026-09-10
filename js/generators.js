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

  const hasValue = (value) => value !== undefined && value !== null;

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

  const normalizeUrl = (launcherUrl) => {
    try {
      return launcherUrl instanceof URL ? launcherUrl.href : new URL(launcherUrl).href;
    } catch (_error) {
      throw new RangeError("有効なランチャーURLを指定してください。");
    }
  };

  const generateUserScript = (launcherUrl) => {
    const urlLiteral = JSON.stringify(normalizeUrl(launcherUrl));
    return [
      "(() => {",
      `  const launcherUrl = ${urlLiteral};`,
      "  location.href = launcherUrl;",
      "})();"
    ].join("\n");
  };

  const escapePowerShellSingleQuotedString = (value) => value.replace(/'/g, "''");

  const generatePowerShell = (launcherUrl) => {
    const escaped = escapePowerShellSingleQuotedString(normalizeUrl(launcherUrl));
    return `Start-Process -FilePath '${escaped}'`;
  };

  const escapeBatArgument = (value) => value.replace(/%/g, "%%").replace(/"/g, '""');

  const generateBat = (launcherUrl) => {
    const escaped = escapeBatArgument(normalizeUrl(launcherUrl));
    return `@start "" "${escaped}"`;
  };

  const generateAll = (options) => {
    const url = generateLauncherUrl(options);
    return Object.freeze({
      bat: generateBat(url),
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
    generateLauncherUrl,
    generatePowerShell,
    generateUserScript
  });
});
