async function fetchAIStream(text, token = null, cid = "681978e6b26b631bde86cd3a") {
  if (! token) {
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNTYzNjY3NSwicmVnaXN0ZXJfdHlwZSI6Im9hdXRoMiIsImFwcF9uYW1lIjoiQ2hpdENoYXRfV2ViIiwidG9rZW5faWQiOiJiYTA4MDBkNy02NWFjLTQ1MTUtYjIxMi01MTE0ZmU1NmIxZDkiLCJpc3MiOiJzaWRlci5haSIsImF1ZCI6WyIiXSwiZXhwIjoxNzc2MDYzMDY3LCJuYmYiOjE3NDQ5NTkwNjcsImlhdCI6MTc0NDk1OTA2N30._iluVsUht-vSzVYfVoFFP7OFpoQB-jK2asyIfdfVKOM';
  }
  const response = await fetch("https://api2.sider.ai/api/chat/v1/completions", {
    method: "POST",
    headers: {
      "accept": "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
      "authorization": `Bearer ${token}`, // Replace securely
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
      "stream": true,
      "cid": cid,
      "model": "sider",
      "filter_search_history": false,
      "from": "chat",
      "chat_models": [],
      "think_mode": { "enable": true },
      "quote": null,
      "multi_content": [{
        "type": "text",
        "text": text,
        "user_input_text": text
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
      "parent_message_id": "68197fccb26b631bde876ecd"
    }),
    mode: "cors",
    credentials: "include"
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });

    // Streamed content may contain multiple SSE-style events
    chunk.split("\n").forEach(line => {
      if (line.startsWith("data: ")) {
        const json = line.slice(6);
        if (json === "[DONE]") return;
        try {
          const data = JSON.parse(json);
          console.log("Received:", data);
        } catch (e) {
          console.error("Invalid JSON:", json);
        }
      }
    });
  }
}

fetchAIStream()