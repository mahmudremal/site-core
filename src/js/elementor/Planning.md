# Context message for CodeAI CLI

You are building **Elementor AI Writer** — a plugin and editor-extension that adds an **"AI" tab to the Elementor Elements sidebar** and a **context-menu AI action on any block**. Target environment: WordPress + Elementor editor (React-based preview/editor), plugin backend in PHP (WP REST), front-end in React/vanilla JS inside Elementor editor. Use Elementor internal APIs (`elementor.on`, `elementor.dialogsManager`, preview/model APIs) and follow editor lifecycle. Use Lucid icons, React components for UI, and REST endpoints under `sitecore/v1/elementor/editor/*`. Auth: WP nonces and capability checks. Support: streaming token output, job queue for long generation, optimistic insert + undo/redo. Deliver components, routes, tests, and documentation so the generated code is production-ready, maintainable, and upgrade-safe.

Constraints:

- Do not manipulate editor DOM directly with polling; use Elementor hooks and `dialogsManager`.
- All network calls must use WP REST endpoints with nonce and server-side API key management.
- Generated content must be inserted as valid Elementor elements widgets (container + widget JSON).
- Provide graceful failure, rate-limiting, and logging.
- Provide CLI-accessible tasks: scaffold plugin, register REST routes, build React components, unit tests.
- Use Lucid icons for actions and buttons.

Outputs expected from CodeAI: plugin scaffold, PHP REST route implementations, React/JS editor bundle, CSS, sample integration tests, deployment README, and brief acceptance tests.

---

# Complete CRD / Implementation Plan

## 1. Goal

Add an **AI tab** to Elementor's left panel showing a chat/list of AI-generated article drafts and provide a **“AI → Transform”** context action for any block to let the LLM modify, rewrite, summarize, or expand that block.

## 2. Actors

- Editor User (author)
- Elementor Editor (host)
- WordPress Server (plugin backend)
- LLM Provider (OpenAI/Gemini/Claude) — server-side
- Admin (plugin settings)

## 3. High-level features

1. Sidebar Tab: `AI` — list of generated drafts, chat UI, templates, history, model select.
2. Draft Composer: prompt input, outline generator, streaming preview, insert button.
3. Block Context Action: right-click or three-dot menu on any widget/block → **AI: Transform** → choose action (rewrite, optimize for SEO, expand, summarize, convert to sections).
4. History & Revisions: saved responses per post; ability to revert.
5. Settings: API provider config, default model, token limits, throttling.
6. Security: capability checks (`current_user_can('edit_posts')`), nonce validation.
7. Performance: background queue for large generations, streaming via SSE/WebSocket optional.
8. Accessibility: keyboard accessible, labels.

## 4. Non-functional requirements

- Editor-safe (use Elementor dialog manager, hooks).
- Minimal load on editor init.
- All remote LLM calls server-side (no client API key).
- Error handling and retries.
- Configurable rate limits and per-user quotas.

## 5. REST API Design (PHP examples)

### Base

`register_rest_route('sitecore/v1', '/elementor/editor/generate', ...)`
`register_rest_route('sitecore/v1', '/elementor/editor/transform-block', ...)`
`register_rest_route('sitecore/v1', '/elementor/editor/history', ...)`
`register_rest_route('sitecore/v1', '/elementor/editor/models', ...)`

### /generate

Request

```json
POST /wp-json/sitecore/v1/elementor/editor/generate
{
  "prompt": "Write a 800-word article about headless CMS",
  "post_id": 123,
  "mode": "article|outline|section",
  "model": "gpt-4.1",
  "stream": false
}
```

Response

```json
{
  "id": "uuid",
  "status": "done",
  "content": "<p>...</p>",
  "elementor_json": {
    /* container+widget model to insert */
  },
  "meta": { "tokens": 1024 }
}
```

### /transform-block

Request

```json
POST /wp-json/sitecore/v1/elementor/editor/transform-block
{
  "post_id":123,
  "element_id":"abc-123",
  "action":"rewrite|summarize|seo_optimize|expand|convert_to_sections",
  "params": { "tone":"formal", "length":"short" }
}
```

Response

```json
{
  "status": "done",
  "replacement_element": {
    /* elementor widget JSON to replace target */
  },
  "diff_html": "<ins>...</ins><del>...</del>"
}
```

### /history

GET/POST to fetch or store actions per-post.

## 6. Backend Implementation Notes

- Use `wp_remote_post()` to call provider; store API keys in plugin settings (encrypted if possible).
- Use non-blocking job system for heavy tasks (WP background processing or Action Scheduler).
- Provide streaming via chunked responses or SSE proxied through REST for editor streaming.
- Validate permissions: `permission_callback` should check `current_user_can('edit_post', $post_id)`.

## 7. Frontend Architecture

- Bundle as a single `ai-writer.js` enqueued only in Elementor editor via `elementor/editor/after_enqueue_scripts`.
- Use React for UI components; can use Elementor’s existing React context where possible.
- Components:
  - `AiTab` — top-level tab content
  - `ChatPanel` — messages, prompt composer, model select, history
  - `DraftCard` — preview, insert button, open in editor
  - `TransformMenu` — small menu for context actions
  - `StreamingOutput` — progressive rendering component

- Integrations:
  - Register new tab with Elementor panels API (or inject under safe hook).
  - Use `elementor.dialogsManager.createWidget('lightbox', {...})` for modal dialogs.
  - Insert content using `elementor.getPreviewView().model` or use Elementor’s `api.elements` insertion methods (create container & widgets JSON).
  - Add context menu item using Elementor’s editor panels `elementor.on('panel:ready')` or widget controls extension points.

## 8. UI/UX Flows

### Flow A — Insert Article from AI Tab

1. User clicks `AI` tab.
2. User types prompt or chooses template.
3. Click `Generate` → show streaming tokens in `StreamingOutput`.
4. User previews. Click `Insert` → plugin converts to Elementor JSON and inserts container+text-editor widget.
5. Editor now shows widget; normal Elementor undo/redo works.

### Flow B — Transform Block

1. User right-clicks block or opens block context menu.
2. Click `AI: Transform` → small modal with transformations.
3. Choose action + options → `Transform`.
4. Show streaming output; on complete, replace selected element JSON with returned widget JSON; store history diff.

## 9. Data models

- `ai_job { id, post_id, user_id, type, prompt, status, result, tokens, created_at }`
- `ai_history { id, post_id, element_id, user_id, before_html, after_html, prompt }`

## 10. Elementor JSON sample for insertion

```json
{
  "id": "container-1",
  "elType": "container",
  "settings": {},
  "elements": [
    {
      "id": "widget-1",
      "elType": "widget",
      "widgetType": "text-editor",
      "settings": { "editor": "<h2>Title</h2><p>Generated content...</p>" }
    }
  ]
}
```

## 11. Security & Permissions

- Use WP nonces (`wp_create_nonce('wp_rest')`) and send `X-WP-Nonce`.
- REST `permission_callback` must verify `current_user_can('edit_post', $post_id)`.
- Do not expose provider API keys to client.
- Rate-limit per-user and per-site usage; provide admin controls.
- Sanitize all stored HTML; optionally convert to Markdown for storage then to Elementor HTML on insert.

## 12. Error handling & UX

- Clear progress indicators; show token usage and cost estimate.
- Fallback UI when generation fails; allow manual retry.
- Keep server logs for errors and query IDs for provider.

## 13. Testing & Acceptance Criteria

- Unit tests for REST endpoints.
- Integration tests for editor insertion (mock elementor preview).
- E2E test: generate article → insert → save post → reload → confirm content.
- Transform test: select widget → transform → verify replacement and undo.

## 14. Deployment & Dev workflow

- WP plugin scaffold with `composer.json` and `package.json` for frontend build.
- Webpack/ESBuild bundle for `ai-writer.js`.
- Build tasks: `npm run build`, `phpunit` for backend tests.
- CI: run linter, unit tests, build, then create release zip.

## 15. Milestones (deliverable list)

1. Plugin scaffold + settings UI (API key).
2. REST endpoints (/generate + /transform-block).
3. Editor script: add AI tab, modal, generate flow (non-stream).
4. Insert generated Elementor JSON into canvas + history store.
5. Context menu transform implementation.
6. Streaming responses + background queue.
7. Admin controls, rate-limiting, logging.
8. Tests, docs, release.

## 16. Example code snippets

### PHP enqueue (plugin main)

```php
add_action('elementor/editor/after_enqueue_scripts', function () {
	wp_enqueue_script('ai-writer', plugin_dir_url(__FILE__) . 'build/ai-writer.js', ['elementor-editor'], '1.0', true);
	wp_localize_script('ai-writer', 'AI_WRITER', [
		'rest_base' => esc_url_raw(rest_url('sitecore/v1/elementor/editor')),
		'nonce'     => wp_create_nonce('wp_rest')
	]);
});
```

### Example REST registration

```php
add_action('rest_api_init', function () {
	register_rest_route('sitecore/v1', '/elementor/editor/generate', [
		'methods' => 'POST',
		'callback' => 'eai_generate_handler',
		'permission_callback' => function ($req) {
			$post_id = $req->get_param('post_id');
			return current_user_can('edit_post', $post_id);
		}
	]);
});
```

### Frontend: open Dialog (JS)

```javascript
const modal = elementor.dialogsManager.createWidget("lightbox", {
  id: "ai-modal",
  headerMessage: "AI Writer",
  message: '<div id="ai-root"></div>',
  closeButton: true,
});
modal.show();
```

## 17. Acceptance examples

- Add AI tab visible next to Widgets/Globals/Yoast.
- Clicking a draft’s Insert button adds a container with the article as a text-editor widget.
- Right-click any widget, pick `AI: Transform → SEO Optimize`, gets a streamed result and replaces widget content.
- All actions are undoable and stored in per-post history.

---

Provide this whole CRD to CodeAI CLI as the context. Use it to generate code for each milestone in sequence, starting with scaffold and REST endpoints, then editor UI and context actions.
