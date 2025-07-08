fetch('http://localhost:3000/v1/models')
.then(res => res.json())
.then(console.log);

fetch('http://localhost:3000/v1/chat/completions', {
  method: 'POST',
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "romi",
    messages: [
      { role: "system", content: "You're a concise assistant." },
      { role: "user", content: "What's the capital of Japan?" }
    ]
  })
})
.then(res => res.json())
.then(console.log);

fetch('http://localhost:3000/v1/completions', {
  method: 'POST',
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "romi",
    prompt: "The largest animal on Earth is",
    max_tokens: 64
  })
})
.then(res => res.json())
.then(console.log);

fetch('http://localhost:3000/v1/embeddings', {
  method: 'POST',
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "romi",
    input: ["Hello world!"]
  })
})
.then(res => res.json())
.then(console.log);

fetch('http://localhost:3000/v1/images/generations', {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "a cat as superhero",
    n: 1,
    size: "512x512"
  })
})
.then(res => res.json())
.then(console.log);




(async () => {
  const response = await fetch('http://localhost:3000/v1/chat/completions', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "romi",
      stream: true,
      messages: [
        { role: "user", content: "Say hello to the world." }
      ]
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (line.startsWith('data:')) {
        const json = line.slice(5).trim();
        if (json === '[DONE]') {
          console.log('[DONE]');
          break;
        } else {
          try {
            const parsed = JSON.parse(json);
            // Print or process the streamed chunk
            console.log(parsed.choices?.[0]?.delta?.content ?? parsed);
          } catch (e) {
            // If chunk is not JSON or partial, skip
          }
        }
      }
    }
  }
})();