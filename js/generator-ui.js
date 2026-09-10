(function () {
  "use strict";

  const selectors = Object.freeze({
    action: "#generator-action",
    body: "#generator-body",
    bodyField: "[data-body-field]",
    copyStatus: "[data-copy-status]",
    date: "#generator-date",
    dateField: "[data-date-field]",
    error: "[data-generator-error]",
    errorMessage: "[data-generator-error-message]",
    form: "[data-generator-form]",
    month: "#generator-month",
    monthField: "[data-month-field]",
    outputs: "[data-generator-outputs]",
    project: "#generator-project"
  });

  /**
   * 現在ページから正規ランチャーのベースURLを取得する。
   * @returns {string}
   */
  const getCanonicalBaseUrl = () => {
    const current = new URL(window.location.href);
    current.search = "";
    current.hash = "";
    return new URL(".", current).href;
  };

  /**
   * actionに応じて入力欄の表示と送信可否を切り替える。
   * @param {HTMLElement} container 入力欄のコンテナー
   * @param {HTMLInputElement|HTMLTextAreaElement} input 入力要素
   * @param {boolean} visible 表示する場合はtrue
   * @returns {void}
   */
  const setConditionalField = (container, input, visible) => {
    container.hidden = !visible;
    input.disabled = !visible;
  };

  /** ジェネレーター画面の要素取得とイベント登録を行う。 @returns {void} */
  const initializeGenerator = () => {
    const form = document.querySelector(selectors.form);
    if (!form || !window.ScrapboxDiaryGenerators) {
      return;
    }

    const actionInput = document.querySelector(selectors.action);
    const bodyInput = document.querySelector(selectors.body);
    const bodyField = document.querySelector(selectors.bodyField);
    const copyStatus = document.querySelector(selectors.copyStatus);
    const dateInput = document.querySelector(selectors.date);
    const dateField = document.querySelector(selectors.dateField);
    const errorPanel = document.querySelector(selectors.error);
    const errorMessage = document.querySelector(selectors.errorMessage);
    const monthInput = document.querySelector(selectors.month);
    const monthField = document.querySelector(selectors.monthField);
    const outputs = document.querySelector(selectors.outputs);
    const projectInput = document.querySelector(selectors.project);

    const updateFields = () => {
      const action = actionInput.value;
      const daily = action === "show-today" || action === "create-today";
      setConditionalField(dateField, dateInput, daily);
      setConditionalField(monthField, monthInput, !daily);
      setConditionalField(bodyField, bodyInput, action === "create-today");
      outputs.hidden = true;
      copyStatus.textContent = "";
    };

    const hideError = () => {
      errorPanel.hidden = true;
      errorMessage.textContent = "";
    };

    /** @param {Error} error 表示するエラー @returns {void} */
    const showError = (error) => {
      errorMessage.textContent = error.message;
      errorPanel.hidden = false;
      errorPanel.focus();
    };

    /** @param {string} id 出力要素のID @param {string} value 出力値 @returns {void} */
    const setOutput = (id, value) => {
      document.getElementById(id).value = value;
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      hideError();
      copyStatus.textContent = "";

      const action = actionInput.value;
      const options = {
        action,
        baseUrl: getCanonicalBaseUrl(),
        project: projectInput.value
      };

      if (!dateInput.disabled && dateInput.value !== "") {
        options.date = dateInput.value;
      }
      if (!monthInput.disabled && monthInput.value !== "") {
        options.month = monthInput.value;
      }
      if (!bodyInput.disabled && bodyInput.value !== "") {
        options.body = bodyInput.value;
      }

      try {
        const generated = window.ScrapboxDiaryGenerators.generateAll(options);
        setOutput("output-url", generated.url);
        setOutput("output-userscript", generated.userScript);
        setOutput("output-bookmarklet", generated.bookmarklet);
        setOutput("output-powershell", generated.powerShell);
        setOutput("output-bat", generated.bat);
        outputs.hidden = false;
        outputs.focus();
      } catch (error) {
        outputs.hidden = true;
        showError(error);
      }
    });

    actionInput.addEventListener("change", updateFields);
    form.addEventListener("input", () => {
      outputs.hidden = true;
      copyStatus.textContent = "入力が変更されました。もう一度生成してください。";
    });

    document.querySelectorAll("[data-copy-target]").forEach((button) => {
      button.addEventListener("click", async () => {
        const target = document.getElementById(button.dataset.copyTarget);
        const label = button.dataset.copyLabel;

        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(target.value);
          } else {
            target.focus();
            target.select();
            if (!document.execCommand("copy")) {
              throw new Error("コピー操作に対応していません。");
            }
          }
          copyStatus.textContent = `${label}をコピーしました。`;
        } catch (_error) {
          copyStatus.textContent = `${label}をコピーできませんでした。内容を選択してコピーしてください。`;
          target.focus();
          target.select();
        }
      });
    });

    updateFields();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeGenerator, { once: true });
  } else {
    initializeGenerator();
  }
})();
