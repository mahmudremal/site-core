window.addEventListener("ai_browser_tool", (event) => {
  chrome.runtime.sendMessage(event.detail, (result) => {
    window.dispatchEvent(
      new CustomEvent("ai_browser_tool_result", {
        detail: { id: event.detail.id, result },
      }),
    );
  });
});
