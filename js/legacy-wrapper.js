(function () {
  "use strict";

  const showError = (error) => {
    document.body.textContent = `互換ランチャーを実行できませんでした: ${error.message}`;
  };

  try {
    const action = document.documentElement.dataset.legacyAction;
    const canonicalBaseUrl = new URL("../../../", window.location.href);
    const destination = window.ScrapboxDiaryLegacyAdapter.buildCanonicalUrl(
      window.location.href,
      canonicalBaseUrl,
      action
    );
    window.location.replace(destination);
  } catch (error) {
    showError(error);
  }
})();
