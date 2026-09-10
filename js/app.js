(function () {
  "use strict";

  /** @param {string} message 表示する状態メッセージ @returns {void} */
  const setStatus = (message) => {
    const status = document.querySelector("[data-launcher-status]");
    if (status) {
      status.textContent = message;
    }
  };

  /** @param {Error} error 表示するエラー @returns {void} */
  const showError = (error) => {
    const panel = document.querySelector("[data-launcher-error]");
    const message = document.querySelector("[data-launcher-error-message]");

    setStatus("ランチャーを実行できませんでした。");
    if (panel && message) {
      message.textContent = error.message;
      panel.hidden = false;
      panel.focus();
    }
  };

  /** ランチャーURLを解決し、Scrapboxへの遷移またはエラー表示を行う。 @returns {void} */
  const run = () => {
    try {
      const result = window.ScrapboxDiaryLauncher.resolveLauncherRequest(window.location.href);
      if (result.type === "redirect") {
        setStatus("Scrapboxへ移動しています…");
        window.location.assign(result.destination);
      }
    } catch (error) {
      showError(error);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
