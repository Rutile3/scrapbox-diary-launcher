(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.ScrapboxDiaryCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SCRAPBOX_ORIGIN = "https://scrapbox.io";
  const WEEKDAYS = Object.freeze(["日", "月", "火", "水", "木", "金", "土"]);

  const pad2 = (value) => String(value).padStart(2, "0");

  const assertValidDate = (date, label) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new TypeError(`${label}には有効なDateを指定してください。`);
    }
  };

  const createLocalDate = (year, month, day) => {
    const date = new Date(0);
    date.setHours(0, 0, 0, 0);
    date.setFullYear(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      throw new RangeError("存在しない日付です。");
    }

    return date;
  };

  const parseIsoDate = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      throw new RangeError("日付はYYYY-MM-DD形式で指定してください。");
    }

    return createLocalDate(Number(match[1]), Number(match[2]), Number(match[3]));
  };

  const parseIsoMonth = (value) => {
    const match = /^(\d{4})-(\d{2})$/.exec(value);
    if (!match) {
      throw new RangeError("月はYYYY-MM形式で指定してください。");
    }

    return createLocalDate(Number(match[1]), Number(match[2]), 1);
  };

  const parseLegacyDate = (value) => {
    const match = /^(\d{2})(\d{2})(\d{2})$/.exec(value);
    if (!match) {
      throw new RangeError("旧形式の日付はYYMMDD形式で指定してください。");
    }

    return createLocalDate(2000 + Number(match[1]), Number(match[2]), Number(match[3]));
  };

  const parseLegacyMonth = (value) => {
    const match = /^(\d{2})(\d{2})$/.exec(value);
    if (!match) {
      throw new RangeError("旧形式の月はYYMM形式で指定してください。");
    }

    return createLocalDate(2000 + Number(match[1]), Number(match[2]), 1);
  };

  const localToday = (now) => {
    const source = now === undefined ? new Date() : now;
    assertValidDate(source, "現在日時");
    return createLocalDate(source.getFullYear(), source.getMonth() + 1, source.getDate());
  };

  const localCurrentMonth = (now) => {
    const today = localToday(now);
    return createLocalDate(today.getFullYear(), today.getMonth() + 1, 1);
  };

  const resolveDate = (value, now) => {
    return value === undefined || value === null ? localToday(now) : parseIsoDate(value);
  };

  const resolveMonth = (value, now) => {
    return value === undefined || value === null ? localCurrentMonth(now) : parseIsoMonth(value);
  };

  const formatDailyPageName = (date) => {
    assertValidDate(date, "日付");
    return `${pad2(date.getFullYear() % 100)}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
  };

  const formatMonthlyPageName = (date) => {
    assertValidDate(date, "月");
    return `${pad2(date.getFullYear() % 100)}${pad2(date.getMonth() + 1)}`;
  };

  const validateProject = (project) => {
    if (typeof project !== "string" || project.length === 0) {
      throw new RangeError("Scrapboxプロジェクトを指定してください。");
    }
    if (project !== project.trim()) {
      throw new RangeError("Scrapboxプロジェクトの前後に空白は指定できません。");
    }
    if (/[\/\\?#\u0000-\u001f\u007f]/.test(project)) {
      throw new RangeError("Scrapboxプロジェクトに使用できない文字が含まれています。");
    }

    return project;
  };

  const buildPageUrl = (project, pageName, body) => {
    const projectSegment = encodeURIComponent(validateProject(project));
    const baseUrl = `${SCRAPBOX_ORIGIN}/${projectSegment}/${pageName}`;
    return body === undefined ? baseUrl : `${baseUrl}?body=${encodeURIComponent(String(body))}`;
  };

  const buildDailyUrl = (project, date, body) => {
    return buildPageUrl(project, formatDailyPageName(date), body);
  };

  const buildMonthlyUrl = (project, month, body) => {
    return buildPageUrl(project, formatMonthlyPageName(month), body);
  };

  const shiftMonth = (date, offset) => {
    assertValidDate(date, "月");
    const shifted = new Date(0);
    shifted.setHours(0, 0, 0, 0);
    shifted.setFullYear(date.getFullYear(), date.getMonth() + offset, 1);
    return shifted;
  };

  const daysInMonth = (date) => {
    assertValidDate(date, "月");
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const generateMonthlyScheduleBody = (month) => {
    assertValidDate(month, "月");
    const target = createLocalDate(month.getFullYear(), month.getMonth() + 1, 1);
    const previous = formatMonthlyPageName(shiftMonth(target, -1));
    const next = formatMonthlyPageName(shiftMonth(target, 1));
    const navigation = `[**** [${previous}]←→[${next}]]`;
    const yy = pad2(target.getFullYear() % 100);
    const mm = pad2(target.getMonth() + 1);
    let body = `${navigation}\n\n[*** 20${yy}年${mm}月]\n`;

    for (let day = 1; day <= daysInMonth(target); day += 1) {
      const date = createLocalDate(target.getFullYear(), target.getMonth() + 1, day);
      body += `[${yy}${mm}${pad2(day)}] ${WEEKDAYS[date.getDay()]} \n`;
    }

    body += `\n${navigation}\n\n#月予定表\n`;
    return body;
  };

  const buildMonthlyScheduleUrl = (project, month) => {
    return buildMonthlyUrl(project, month, generateMonthlyScheduleBody(month));
  };

  return Object.freeze({
    SCRAPBOX_ORIGIN,
    WEEKDAYS,
    buildDailyUrl,
    buildMonthlyScheduleUrl,
    buildMonthlyUrl,
    createLocalDate,
    daysInMonth,
    formatDailyPageName,
    formatMonthlyPageName,
    generateMonthlyScheduleBody,
    localCurrentMonth,
    localToday,
    parseIsoDate,
    parseIsoMonth,
    parseLegacyDate,
    parseLegacyMonth,
    resolveDate,
    resolveMonth,
    shiftMonth,
    validateProject
  });
});
