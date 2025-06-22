function openExtensionPage() {
  const extensionUrl = chrome.runtime.getURL("index.html");
  window.open(extensionUrl, "_blank");
}
openExtensionPage();