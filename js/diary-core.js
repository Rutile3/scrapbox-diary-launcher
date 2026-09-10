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

  /** @param {number} value @returns {string} */
  const pad2 = (value) => String(value).padStart(2, "0");

  /**
   * Dateが有効であることを検証する。
   * @param {Date} date 検証対象
   * @param {string} label エラーメッセージに使う項目名
   * @returns {void}
   * @throws {TypeError} 有効なDateでない場合
   */
  const assertValidDate = (date, label) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new TypeError(`${label}には有効なDateを指定してください。`);
    }
  };

  /**
   * 指定した年月日からローカル時刻の午前0時を表すDateを生成する。
   * @param {number} year 4桁の年
   * @param {number} month 1から12の月
   * @param {number} day 日
   * @returns {Date}
   * @throws {RangeError} 存在しない日付の場合
   */
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

  /**
   * ISO形式の日付をローカル時刻のDateへ変換する。
   * @param {string} value YYYY-MM-DD形式の日付
   * @returns {Date}
   * @throws {RangeError} 形式が不正または日付が存在しない場合
   */
  const parseIsoDate = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      throw new RangeError("日付はYYYY-MM-DD形式で指定してください。");
    }

    return createLocalDate(Number(match[1]), Number(match[2]), Number(match[3]));
  };

  /**
   * ISO形式の月を月初のDateへ変換する。
   * @param {string} value YYYY-MM形式の月
   * @returns {Date}
   * @throws {RangeError} 形式が不正または月が存在しない場合
   */
  const parseIsoMonth = (value) => {
    const match = /^(\d{4})-(\d{2})$/.exec(value);
    if (!match) {
      throw new RangeError("月はYYYY-MM形式で指定してください。");
    }

    return createLocalDate(Number(match[1]), Number(match[2]), 1);
  };

  /**
   * 旧形式の日付を2000年代のローカル時刻のDateへ変換する。
   * @param {string} value YYMMDD形式の日付
   * @returns {Date}
   * @throws {RangeError} 形式が不正または日付が存在しない場合
   */
  const parseLegacyDate = (value) => {
    const match = /^(\d{2})(\d{2})(\d{2})$/.exec(value);
    if (!match) {
      throw new RangeError("旧形式の日付はYYMMDD形式で指定してください。");
    }

    return createLocalDate(2000 + Number(match[1]), Number(match[2]), Number(match[3]));
  };

  /**
   * 旧形式の月を2000年代の月初のDateへ変換する。
   * @param {string} value YYMM形式の月
   * @returns {Date}
   * @throws {RangeError} 形式が不正または月が存在しない場合
   */
  const parseLegacyMonth = (value) => {
    const match = /^(\d{2})(\d{2})$/.exec(value);
    if (!match) {
      throw new RangeError("旧形式の月はYYMM形式で指定してください。");
    }

    return createLocalDate(2000 + Number(match[1]), Number(match[2]), 1);
  };

  /**
   * ローカル時刻での今日を午前0時のDateとして返す。
   * @param {Date} [now] 現在日時。省略時は実行時刻を使う
   * @returns {Date}
   * @throws {TypeError} nowが有効なDateでない場合
   */
  const localToday = (now) => {
    const source = now === undefined ? new Date() : now;
    assertValidDate(source, "現在日時");
    return createLocalDate(source.getFullYear(), source.getMonth() + 1, source.getDate());
  };

  /**
   * ローカル時刻での現在月を月初のDateとして返す。
   * @param {Date} [now] 現在日時。省略時は実行時刻を使う
   * @returns {Date}
   * @throws {TypeError} nowが有効なDateでない場合
   */
  const localCurrentMonth = (now) => {
    const today = localToday(now);
    return createLocalDate(today.getFullYear(), today.getMonth() + 1, 1);
  };

  /**
   * ISO日付または現在日時から対象日を解決する。
   * @param {string|null|undefined} value YYYY-MM-DD形式の日付
   * @param {Date} [now] value省略時に基準とする現在日時
   * @returns {Date}
   * @throws {TypeError|RangeError} 日付入力が不正な場合
   */
  const resolveDate = (value, now) => {
    return value === undefined || value === null ? localToday(now) : parseIsoDate(value);
  };

  /**
   * ISO月または現在日時から対象月を解決する。
   * @param {string|null|undefined} value YYYY-MM形式の月
   * @param {Date} [now] value省略時に基準とする現在日時
   * @returns {Date}
   * @throws {TypeError|RangeError} 月入力が不正な場合
   */
  const resolveMonth = (value, now) => {
    return value === undefined || value === null ? localCurrentMonth(now) : parseIsoMonth(value);
  };

  /**
   * DateをScrapboxの日次ページ名へ変換する。
   * @param {Date} date 対象日
   * @returns {string} YYMMDD形式のページ名
   * @throws {TypeError} dateが有効なDateでない場合
   */
  const formatDailyPageName = (date) => {
    assertValidDate(date, "日付");
    return `${pad2(date.getFullYear() % 100)}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
  };

  /**
   * DateをScrapboxの月次ページ名へ変換する。
   * @param {Date} date 対象月
   * @returns {string} YYMM形式のページ名
   * @throws {TypeError} dateが有効なDateでない場合
   */
  const formatMonthlyPageName = (date) => {
    assertValidDate(date, "月");
    return `${pad2(date.getFullYear() % 100)}${pad2(date.getMonth() + 1)}`;
  };

  /**
   * Scrapboxプロジェクト名を検証する。
   * @param {string} project プロジェクト名
   * @returns {string} 検証済みのプロジェクト名
   * @throws {RangeError} 値が空、前後に空白がある、または禁止文字を含む場合
   */
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

  /**
   * ScrapboxページURLを構築する。
   * @param {string} project プロジェクト名
   * @param {string} pageName ページ名
   * @param {*} [body] ページ作成時の本文
   * @returns {string}
   * @throws {RangeError} projectが不正な場合
   */
  const buildPageUrl = (project, pageName, body) => {
    const projectSegment = encodeURIComponent(validateProject(project));
    const baseUrl = `${SCRAPBOX_ORIGIN}/${projectSegment}/${pageName}`;
    return body === undefined ? baseUrl : `${baseUrl}?body=${encodeURIComponent(String(body))}`;
  };

  /**
   * Scrapboxの日次ページURLを構築する。
   * @param {string} project プロジェクト名
   * @param {Date} date 対象日
   * @param {*} [body] ページ作成時の本文
   * @returns {string}
   * @throws {TypeError|RangeError} projectまたはdateが不正な場合
   */
  const buildDailyUrl = (project, date, body) => {
    return buildPageUrl(project, formatDailyPageName(date), body);
  };

  /**
   * Scrapboxの月次ページURLを構築する。
   * @param {string} project プロジェクト名
   * @param {Date} month 対象月
   * @param {*} [body] ページ作成時の本文
   * @returns {string}
   * @throws {TypeError|RangeError} projectまたはmonthが不正な場合
   */
  const buildMonthlyUrl = (project, month, body) => {
    return buildPageUrl(project, formatMonthlyPageName(month), body);
  };

  /**
   * 月初を基準に月を移動する。
   * @param {Date} date 基準月
   * @param {number} offset 移動する月数
   * @returns {Date} 移動先の月初
   * @throws {TypeError} dateが有効なDateでない場合
   */
  const shiftMonth = (date, offset) => {
    assertValidDate(date, "月");
    const shifted = new Date(0);
    shifted.setHours(0, 0, 0, 0);
    shifted.setFullYear(date.getFullYear(), date.getMonth() + offset, 1);
    return shifted;
  };

  /**
   * 指定月の日数を返す。
   * @param {Date} date 対象月
   * @returns {number}
   * @throws {TypeError} dateが有効なDateでない場合
   */
  const daysInMonth = (date) => {
    assertValidDate(date, "月");
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  /**
   * 前後月へのリンクと日別行を含む月間予定本文を生成する。
   * @param {Date} month 対象月
   * @returns {string} Scrapbox記法の本文
   * @throws {TypeError|RangeError} monthが有効なDateでない場合
   */
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

  /**
   * 本文を含むScrapbox月間予定ページURLを構築する。
   * @param {string} project プロジェクト名
   * @param {Date} month 対象月
   * @returns {string}
   * @throws {TypeError|RangeError} projectまたはmonthが不正な場合
   */
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
