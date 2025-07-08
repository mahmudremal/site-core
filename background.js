async function __AIStream({ message = '', token = null, cid = '', onChunk = (t) => {}, parent_message_id = '' }) {
  return new Promise(async (resolve, reject) => {
    if (! token) {reject(new Error('Invalid token provided!'));}
    const response = await fetch("https://api2.sider.ai/api/chat/v1/completions", {
      method: "POST",
      headers: {
        "accept": "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
        "authorization": `Bearer ${token}`,
        "cache-control": "no-cache",
        "content-type": "application/json",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "none",
        "sec-fetch-storage-access": "active",
        "x-app-name": "ChitChat_Chrome_Ext",
        "x-app-version": "5.7.1",
        "x-time-zone": "Asia/Dhaka",
        "x-trace-id": "1a9a18b1-e963-4e4b-b737-3a2ee2c729a6"
      },
      body: JSON.stringify({
        "stream": !false,
        "cid": cid,
        "model": "sider",
        "filter_search_history": false,
        "from": "chat",
        "chat_models": [],
        "think_mode": {"enable": false},
        "quote": null,
        "multi_content": [{
          "type": "text",
          "text": message,
          "user_input_text": message
        }],
        "prompt_templates": [{
          "key": "artifacts",
          "attributes": { "lang": "original" }
        }],
        "tools": {
          "image": { "quality_level": "medium" },
          "auto": ["search", "create_image", "data_analysis"]
        },
        "extra_info": {
          "origin_url": "chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/standalone.html?from=sidebar",
          "origin_title": "Sider"
        },
        "output_language": "en",
        "parent_message_id": parent_message_id
      }),
      mode: "cors",
      credentials: "include"
    });

    // console.log(response)
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let _result = {resoning: '', content: ''};

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });

      // Streamed content may contain multiple SSE-style events
      chunk.split("\n").forEach(line => {
        if (line.startsWith("data:")) {
          const json = line.slice(5).trim();
          if (json === "[DONE]") return;
          try {
            const parsed = JSON.parse(json);
            // console.log("Received:", parsed);
            if (parsed?.data?.reasoning_content?.text) {
              _result.resoning += parsed.data.reasoning_content.text;
            }
            if (parsed?.data?.text && parsed?.data?.type == 'text') {
              _result.content += parsed.data.text;
            }
            if (typeof onChunk === 'function') {
              if (parsed?.data?.message_start) {onChunk({...parsed?.data?.message_start, _type: 'message_start'});}
              // const rChunk = { resoning: parsed?.data?.reasoning_content?.text, content: parsed?.data?.text };onChunk(rChunk);
              onChunk(_result);
            }
          } catch (e) {
            console.error("Invalid JSON:", json);
            reject(e);
          }
        }
      });
    }

    resolve(_result)
  });
}





chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  const tabId = sender?.tab?.id;
  if (!tabId) {
    sendResponse({ error: 'Missing tab ID' });
    return;
  }

  const token_id = Date.now(); // Can be UUID if needed
  sendResponse({ token_id }); // Immediately respond to avoid timeout

  try {
    const result = await __AIStream({
      ...request,
      token: request?.token || '',
      cid: '',
      onChunk: (chunk) => {
        chrome.tabs.sendMessage(tabId, { token_id, chunk }, () => {
          if (chrome.runtime.lastError) {
            console.warn('Chunk send failed:', chrome.runtime.lastError.message);
          }
        });
      }
    });

    chrome.tabs.sendMessage(tabId, { token_id, result }, () => {
      if (chrome.runtime.lastError) {
        console.warn('Final result send failed:', chrome.runtime.lastError.message);
      }
    });

  } catch (err) {
    console.error('Error while processing AI stream:', err);
    chrome.tabs.sendMessage(tabId, {
      token_id,
      error: 'Failed to process request'
    }, () => {
      if (chrome.runtime.lastError) {
        console.warn('Error response send failed:', chrome.runtime.lastError.message);
      }
    });
  }

  return true; // Keeps sendResponse alive for async
});





// src/js/tasks/aicg.js
// {
//   "matches": ["http://abas.com/"],
//   "js": ["dist/js/sw.js"]
// }

// const ws = new WebSocket('ws://localhost:3000');

// ws.onopen = () => {
//   console.log('Connected to server');
// };

// ws.onmessage = (event) => {
//   const response = JSON.parse(event.data);
//   console.log('Server response:', response);
// };

// // Check platform status
// fetch('http://localhost:3000/api/status')
// .then(res => res.json())
// .then(status => console.log('Platform status:', status));

// // Example WebSocket actions
// function shareThought(platform, content, mediaUrls) {
//   ws.send(JSON.stringify({
//     action: 'share_thought',
//     data: { platform, content, mediaUrls }
//   }));
// }

// function comment(platform, postId, commentText) {
//   ws.send(JSON.stringify({
//     action: 'comment',
//     data: { platform, postId, commentText }
//   }));
// }

// // Example REST API calls
// async function shareThoughtRest(platform, content, mediaUrls) {
//   const res = await fetch('http://localhost:3000/api/share_thought', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ platform, content, mediaUrls })
//   });
//   return res.json();
// }
