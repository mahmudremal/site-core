// content.js (runs in extension)
window.addEventListener('message', (event) => {
    if (event.source !== window || event.data?.type !== 'AI_ASK_REQUEST') return;

    const { message, token, token_id } = event.data.payload;

    chrome.runtime.sendMessage({ message, token, token_id }, (response) => {
        const error = chrome.runtime.lastError?.message || response?.error || null;

        window.postMessage({
            type: 'AI_ASK_RESPONSE',
            token_id,
            response: error ? null : response,
            error: error
        }, '*');
    });
});
