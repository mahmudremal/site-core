async function siderAIStream(text, token = null, cid = '') {
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
            console.log("Received:", parsed);
            if (parsed?.data?.reasoning_content?.text) {
              _result.resoning += parsed.data.reasoning_content.text;
            }
            if (parsed?.data?.text && parsed?.data?.type == 'text') {
              _result.content += parsed.data.text;
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
// await siderAIStream("What's up!", 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNTYzNjY3NSwicmVnaXN0ZXJfdHlwZSI6Im9hdXRoMiIsImFwcF9uYW1lIjoiQ2hpdENoYXRfV2ViIiwidG9rZW5faWQiOiI4NzE0YTIwYy0yOWZkLTQyMDctOTY3ZC1hNDg0NjIzNjM0ZjAiLCJpc3MiOiJzaWRlci5haSIsImF1ZCI6WyIiXSwiZXhwIjoxNzgxMDE5MTg1LCJuYmYiOjE3NDk5MTUxODUsImlhdCI6MTc0OTkxNTE4NX0.cWsqJBXBGN0o-sQA30Dgg8tWjtPuTAwLgObfwZrjiUI', '')



const schemas_dir = `https://${location.host}/wp-json/sitecore/v1/tasks/attachments/schemas`;

class System {
  constructor() {
    // 
    this.cpu = {previousIdleTime: 0, previousTotalTime: 0};
  }
  async get_cpu() {
  
    return new Promise((resolve, reject) => {
        chrome.system.cpu.getInfo((info) => {
            const cores = info.numCores;
            const currentTimes = info.cores.map(core => core.times);
            
            let idleTime = 0;
            let totalTime = 0;

            currentTimes.forEach(times => {
                idleTime += times.idle;
                totalTime += times.idle + times.user + times.nice + times.sys + times.irq;
            });
            if (this.cpu.previousTotalTime !== 0 && this.cpu.previousIdleTime !== 0) {
                const deltaIdle = idleTime - this.cpu.previousIdleTime;
                const deltaTotal = totalTime - this.cpu.previousTotalTime;

                const cpuUsage = (1 - deltaIdle / deltaTotal) * 100;
                
                this.cpu.previousIdleTime = idleTime;
                this.cpu.previousTotalTime = totalTime;
                
                const cpuTemperature = "50°C";
                // chrome.runtime.sendNativeMessage("com.yournativeapp", { get_cpu_temp: true }, (response) => {
                //   if (chrome.runtime.lastError) {
                //     console.error("Error: ", chrome.runtime.lastError);
                //     resolve({ ...info, usage: cpuUsage.toFixed(2), temperature: -1 });
                //   } else {
                //     resolve({ ...info, usage: cpuUsage.toFixed(2), temperature: response.cpu_temperature });
                //   }
                // });

                resolve({ ...info, usage: cpuUsage.toFixed(2), temperature: cpuTemperature });
            } else {
                this.cpu.previousIdleTime = idleTime;
                this.cpu.previousTotalTime = totalTime;
                resolve({ ...info, usage: -1, temperature: -1 });
            }
        });
    });
  }

}

class LLM extends System {
  constructor(endpoint, model, tools = {}) {
    super();
    this.endpoint = endpoint;
    this.model = model;
    this.tools = tools;
    this.context = [];
    this.system = null;
    this.format = null;
  }

  setSystemPrompt(args) {
    const { message, format = null } = args;
    this.system = message;
    if (format) {this.format = format;}
  }

  clearSystem() {
    this.system = this.format = null;
  }

  async _callLLM(messages, tool_choice) {
    if (this.system) {messages = [{role: 'system', content: this.system}, ...messages];}
    const requestBody = {
      model: this.model,
      messages: messages,
      stream: false,
    };
    if (tool_choice) requestBody.tool_choice = tool_choice;
    if (Object.keys(this.tools).length > 0) {
      requestBody.tools = Object.values(this.tools).map(tool => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        }
      }));
    }
    if (this.format) {
      requestBody.format = this.format;
    }
    // generate
    const response = await fetch(`${this.endpoint}/api/chat`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(requestBody),
    });

    // const trimmed = this.trimMessages(messages, 32768);
    // const prompt = this.convertMessagesToPrompt(trimmed);
    // const response = await siderAIStream(prompt)

    if (!response.ok) throw new Error(`LLM API error: ${response.statusText}`);
    const data = await response.json();
    return data?.message??(data?.response);
  }

  async aask(userInput) {
    this.context.push({"role": "user", "content": userInput});
    let llmResponse = await this._callLLM(this.context);
    this.context.push(llmResponse);
    while (llmResponse.tool_calls?.length) {
      const newToolMessages = [];
      for (const toolCall of llmResponse.tool_calls) {
        const functionToCall = this.tools[toolCall.function.name];
        if (functionToCall) {
          try {
            const result = await functionToCall.execute(JSON.parse(toolCall.function.arguments));
            newToolMessages.push({"role": "tool", "tool_call_id": toolCall.id, "content": JSON.stringify(result)});
          } catch (error) {
            newToolMessages.push({"role": "tool", "tool_call_id": toolCall.id, "content": JSON.stringify({error: error.message})});
          }
        } else {
          newToolMessages.push({"role": "tool", "tool_call_id": toolCall.id, "content": JSON.stringify({error: "Tool not found"})});
        }
      }
      this.context.push(...newToolMessages);
      llmResponse = await this._callLLM(this.context);
      this.context.push(llmResponse);
    }
    return llmResponse.content;
  }

  add_tool(toolDefinition) {
    if (toolDefinition.name && toolDefinition.description && toolDefinition.parameters && typeof toolDefinition.execute === 'function') {
      this.tools[toolDefinition.name] = toolDefinition;
    }
  }

  clearContext() {
    this.context = [];
  }

  getContext() {
    return [...this.context];
  }

  async forceToolCall(userInput, toolName, toolArguments) {
    this.context.push({"role": "user", "content": userInput});
    const toolToForce = this.tools[toolName];
    if (!toolToForce) throw new Error(`Tool "${toolName}" not found.`);
    let llmResponse = await this._callLLM(this.context, { name: toolName });
    this.context.push(llmResponse);
    if (llmResponse.tool_calls?.length) {
      const toolCall = llmResponse.tool_calls[0];
      if (toolCall.function.name === toolName) {
        try {
          const result = await toolToForce.execute(toolArguments);
          this.context.push({"role": "tool", "tool_call_id": toolCall.id, "content": JSON.stringify(result)});
          const finalLlmResponse = await this._callLLM(this.context);
          this.context.push(finalLlmResponse);
          return finalLlmResponse.content;
        } catch (error) {
          this.context.push({"role": "tool", "tool_call_id": toolCall.id, "content": JSON.stringify({error: error.message})});
          const finalLlmResponse = await this._callLLM(this.context);
          this.context.push(finalLlmResponse);
          return finalLlmResponse.content;
        }
      }
    }
    return llmResponse.content;
  }

  estimateTokens(text) {
    // Rough average: 1 token ≈ 4 characters for English
    return Math.ceil(text.trim().length / 4);
  }

  trimMessages(messages, maxTokens = 3000) {
    const reversed = [...messages].reverse();
    let total = 0;
    const selected = [];
  
    for (const msg of reversed) {
      const line = `${msg.role}: ${msg.content}`;
      const tokenEstimate = this.estimateTokens(line);
      if (total + tokenEstimate > maxTokens) break;
      selected.unshift(msg);
      total += tokenEstimate;
    }
  
    return selected;
  }

  convertMessagesToPrompt(messages) {
    return messages.map(m => `${m.role}: ${m.content}`).join('\n');
  }
}

class ContentGenerator extends LLM {
  constructor(llmEndpoint, llmModel, restRoot) {
    super(llmEndpoint, llmModel);
    this.restRoot = restRoot;
    this.contentType = "post";
    this.promptContext = "";
  }

  sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, ms);
    });
  }
  
  setContentType(type) {
    this.contentType = type;
  }
  setPromptContext(context) {
    this.promptContext = context;
  }

  trimJsonResponse(res) {
    let match;
    if (match = res.match(/```json\s*([\s\S]*?)\s*```/) && match?.[1]) {
      return match[1];
    }
    return res;
  }
  
  createPostData(title, content, featuredImageId = null, categories = [], tags = []) {
    const postData = {
      title: title,
      content: content,
      status: 'publish',
    };

    if (featuredImageId) {
      postData.featured_media = featuredImageId;
    }
    if (categories && categories.length > 0) {
      postData.categories = categories;
    }
    if (tags && tags.length > 0) {
      postData.tags = tags;
    }
    return postData;
  }
  async uploadMedia(file, restRoot) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const wpResponse = await fetch(`${restRoot}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa('admin:password')}`,
        },
        body: formData,
      });

      if (!wpResponse.ok) {
        const errorData = await wpResponse.json();
        console.error('WordPress Media API Error:', errorData);
        throw new Error(`WordPress Media API Error: ${wpResponse.statusText} - ${errorData.message || 'No details'}`);
      }
      const media = await wpResponse.json();
      return media;
    } catch (error) {
      console.error('Error uploading media to WordPress:', error);
      throw error;
    }
  }
  createContent(task) {
    return new Promise(async (resolve, reject) => {
      try {
        const task_desc = task?.task_desc;
        const { title = '', context = null, featuredImage = null, categories = [], tags = [] } = task?.task_object;

        this.setSystemPrompt({message: `You're a good content writter. you write content with a proper planning, reseach based and informative.
          when you want to put an image inside anywhere on your content, you put a shortcode [media type="image/png" title="filename" prompt="prompt to generate image/video"], that autometically replace with an ai generated image/video based on the prompt in it. You always ensure readbility, perfection, tone balance. If SEO is applicable (e.g., for articles or blogs), pre-plan concise, high-ranking, low competition keywords. Also, design relevant SEO elements like Meta Description, Focus Keywords, and schema for best results.`});
          // 

        // Step 1: Set prompt context and include the task description
        if (context) {this.setPromptContext(context);}

        // Step 2: Generate a planning phase based on task_desc
        const planningPrompt = `${this.promptContext}\nTask Description: "${task_desc}"`;

        
        
        const prevFormat = this.format;this.format = await fetch(`${schemas_dir}/${task.task_type}`).then(d => d.json());
        const planningOutput = this.trimJsonResponse(await this.aask(planningPrompt));
        this.format = null; // prevFormat
        console.log("Generated Planning Output:", planningOutput);

        // Step 3: Parse the planning output
        const parsedPlanning = JSON.parse(planningOutput);
        const { contentType, keywords, metaDescription, outline } = parsedPlanning;

        // Step 4: Generate content based on the outline's key points
        let fullContent = `<h2>${title}</h2>`;
        for (const point of outline?.keyPoints??[]) {
          const pointPrompt = this.promptContext + `\nGenerate detailed content for the following point for ${contentType}:\n${point}`;
          const pointContent = await this.aask(pointPrompt);

          // Step 4.1: Replace shortcode with media elements
          fullContent += `\n\n${this.replaceShortcodes(pointContent)}`;
          console.log(`Generated content for point: ${point}`);
        }

        // Step 5: Prepare the FormData object to send to the server
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', fullContent);
        if (featuredImage) {
          formData.append('featuredImage', featuredImage); // Include media as part of FormData
        }
        if (categories.length > 0) {
          formData.append('categories', JSON.stringify(categories)); // Include categories
        }
        if (tags.length > 0) {
          formData.append('tags', JSON.stringify(tags)); // Include tags
        }
        if (keywords && keywords.length > 0) {
          formData.append('keywords', JSON.stringify(keywords)); // Include keywords
        }
        if (metaDescription) {
          formData.append('metaDescription', metaDescription); // Include meta description if applicable
        }
        // Step 6: Resolve with the constructed FormData object for server
        resolve(formData);
      } catch (error) {
        console.error('Error in generation:', error);
        // throw error; // Handle error gracefully
        reject(error);
      }
    });
  }

  // Step 4.1 Implementation: Function to replace shortcodes with media elements
  async replaceShortcodes(content) {
    // Match shortcode pattern and extract properties
    const mediaRegex = /\[media type="(\w+)" title="([^"]+)" prompt="([^"]+)"\]/g;
    const mediaPromises = [];

    const replacedContent = content.replace(mediaRegex, (match, mediaType, title, prompt) => {
      // Generate media item based on prompt
      if (mediaType === 'image') {
        const mediaPromise = this.generateMedia({mediaType, title, prompt}).then(imageUrl => {
          return `<img src="${imageUrl}" alt="${title}" title="${title}">`;
        });
        mediaPromises.push(mediaPromise);
        return ''; // Keep the placeholder for now
      }
      // Handle other media types like video, audio, etc. (implement as needed)
      return match; // Return the original match for unsupported types
    });

    // Wait for all media generation to complete
    return Promise.all(mediaPromises).then(mediaElements => {
      // Replace each shortcode with the corresponding media element
      return replacedContent + mediaElements.join(''); // Append generated media elements
    });
  }

  // Function to generate media based on prompt
  async generateMedia(media) {
    const mediasGenerated = ['https://images.unsplash.com/photo-1697660125394-e857584ea92a?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGElMjBiZWF1dGlmdWwlMjB3b21lbnxlbnwwfHwwfHx8MA%3D%3D', 'https://images.unsplash.com/photo-1742038106844-d976720a45df?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1737536229149-f82dc23fb2b9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D']; // await this.aask(prompt);
    const imageUrl = mediasGenerated[Math.floor(Math.random() * mediasGenerated.length)];
    return imageUrl;
  }

  handle_action_tasks(task, json_schema) {
    return new Promise(async (resolve, reject) => {
      console.log(task)
      try {
        let post = null;const postData = new FormData();
        // 
        const taskObject = task.task_object;
        // 
        if (taskObject?.post_type && taskObject?.post_id) {
          post = await fetch(`${this.restRoot}/sitecore/v1/post-table/${taskObject?.post_type}/${taskObject?.post_id}`).then(d => d.json()).then(d => JSON.stringify(d));
        }
        // 
        this.setSystemPrompt({message: `You're a good virtual assistant trained with writing, accounting, seo, shote managing, etc fields. You'll do what exactly asked you todo. you'll use available information and you're always remember that never provide irrelevent data to things not asked for.`});
        const prompt = `Task Description: "${task?.task_desc??'N/A'}"`;
        const prevFormat = this.format;this.format = json_schema;
        const output = this.trimJsonResponse(await this.aask(prompt));
        this.format = null; // prevFormat
        console.log("Generated Output:", output);
        // 
        const response_json = JSON.parse(output);
        console.log(response_json);
        // 
        postData.append('task_id', task?.id);
        postData.append('data', JSON.stringify(response_json));
        resolve(postData);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    })
  }
}

class TaskHandler extends ContentGenerator {
  constructor(restRoot, llmEndpoint, llmModel) {
    super(llmEndpoint, llmModel, restRoot);
    this.state = {jobs: {done: 0, doing: false, pending: 0}};
    this.task = null;
  }
  async getTask() {
    try {
      const response = await fetch(`${this.restRoot}/sitecore/v1/tasks/search?status=pending`);
      if (!response.ok) {
        throw new Error(`Task API error: ${response.statusText}`);
      }
      const task = await response.json();
      return task;
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }
  processTask() {
    return new Promise(async (resolve, reject) => {
      try {
        const task = this.task = await this.getTask();
        if (!task || !task.task_type) {
          console.log('No task available or invalid task format.');
          this.proceed = false;
          return;
        }

        switch (task.task_type) {
          case 'create_content':
              this.createContent(task).then(postData => {
                console.log('Content generated and post created:', postData);
                postData.append('task_id', task?.id);
                resolve(postData);
              })
              .catch(e => reject(e));
            break;
          default:
            // console.warn(`Unknown task type: ${task.task_type}`);
            // reject(`Unknown task type: ${task.task_type}`);
            fetch(`${schemas_dir}/${task.task_type}`)
            .then(d => d.json())
            .then(async json_schema => {
              const postData = await this.handle_action_tasks(task, json_schema);
              resolve(postData);
            })
            .catch(e => {throw e;});
            break;
        }
      } catch (error) {
        this.proceed = false;
        console.error('Error processing content creation task:', error);
        reject(`Error processing content creation task: ${error?.message??''}`);
      }
    });
  }
  submitTask(data) {
    return new Promise(async (resolve, reject) => {
      const task_id = data.get('task_id');
      if (!task_id) {reject(new Error('Task identification data missing'));return;}
      fetch(`${this.restRoot}/sitecore/v1/tasks/${task_id}/submit`, {
        method: 'POST',
        // headers: {'Content-Type': 'application/json'},
        body: data, // JSON.stringify(data)
      })
      .then(async res => {
        if (!res.ok) {
          return res.json().then(errorData => {
            throw new Error(`WordPress API error: ${res.statusText} - ${errorData.message || 'No details available'}`);
          });
        }
        return res.json();
      })
      .then(data => this.showBadge('number', `${++this.state.jobs.done}`).then(res => resolve(data)))
      .catch(err => reject(err));
    });
  }

  showBadge(type = null, text = null, color = '#FF5733') {
    if (!type || !text) {return;}
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color });
    return Promise.resolve(true);
  }

  async processJobs() {
    this.proceed = true;
    while (this.proceed) {
      await this.processTask()
      .then(async r => await this.submitTask(r))
      .then(async r => await this.sleep(500))
      .then(r => this.context = [])
      // .then(r => this.proceed = false)
      .catch(e => {
        this.proceed = false;
        console.error(e);
      });
    }
  }
}

const taskHandler = new TaskHandler('https://core.agency.local/wp-json', 'http://localhost:11434', 'romi');
taskHandler.processJobs();

// 
// taskHandler.aask('Why the sky blue?');
// 


async function main() {
  const llm = new LLM("http://localhost:11434", "romi"); // llama3.1 | romi | deepseek-r1:1.5b
  llm.add_tool({
    name: "get_current_weather",
    description: "Get the current weather in a given location",
    parameters: {
      type: "object",
      properties: {
        location: { type: "string", description: "The city and state, e.g. San Francisco, CA" },
        unit: { type: "string", enum: ["celsius", "fahrenheit"] }
      },
      required: ["location"]
    },
    execute: async (args) => (args.location.toLowerCase().includes("bashikpur")) ? { temperature: 30, unit: "celsius", description: "Clear sky" } : { temperature: 25, unit: "celsius", description: "Partly cloudy" }
  });
  const response1 = await llm.aask("What's the weather like in Bashikpur?");
  console.log("LLM Response 1:", response1);
  const response2 = await llm.aask("How does that compare to London?");
  console.log("LLM Response 2:", response2);
  const forcedResponse = await llm.forceToolCall("Tell me the weather in Tokyo.", "get_current_weather", { location: "Tokyo, Japan", unit: "fahrenheit" });
  console.log("Forced Tool Call Response:", forcedResponse);
  llm.clearContext();
  const response3 = await llm.aask("What is the capital of France?");
  console.log("LLM Response 3 (new context):", response3);
}
// main().catch(console.error);




// (function(){function l(u,c){var d=document,t='script',o=d.createElement(t),s=d.getElementsByTagName(t)[0];o.async=true;o.src=u;if(c)o.onload=c;s.parentNode.insertBefore(o,s);}l('https://core.agency.local/wp-content/plugins/partnership-manager/src/js/tasks/aicg.js');})();
