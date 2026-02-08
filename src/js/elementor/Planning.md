# Elementor AI Agent - Architectural Planning (Updated)

## Current Architecture Overview

The Elementor AI Agent is a **client-side React application** that runs entirely within the Elementor editor, using a **local Ollama LLM** (no WordPress backend required). It provides a chat interface for generating Elementor page sections through natural language.

### Tech Stack

- **Frontend**: React + Lucide Icons
- **LLM Backend**: Ollama (local inference at `http://localhost:11434`)
- **State Management**: React Context (`AiProvider`)
- **Storage**: `localStorage` for chat history
- **Integration**: Elementor JavaScript API

---

## Core Architecture Components

### 1. Context Provider (`context.jsx`)

**Purpose**: Central state management and LLM communication

**Key Responsibilities**:

- Manage chat messages and session history
- Stream responses from Ollama API
- Extract and inject Elementor JSON from LLM responses
- Manage available models and selected model
- Provide widget metadata to LLM

### 2. UI Components

- **`AiApp.jsx`**: Main application shell
- **`ChatPanel.jsx`**: Chat interface with message history
- **`HistoryPanel.jsx`**: Session management and history
- **`Sidebar.jsx`**: Navigation and model selection
- **`ModelSelector.jsx`**: Ollama model dropdown

### 3. Integration (`ai-writer.jsx`)

**Purpose**: Bootstrap the React app within Elementor

**Key Features**:

- Adds AI panel tab to Elementor sidebar
- Creates draggable modal for AI chat
- Injects preview button into Elementor canvas
- Mounts React application

---

## Critical Context Management Problem

### The Issue

Current implementation sends **full widget controls** for all available Elementor widgets to the LLM in every message. This causes:

1. **Context Explosion**: 200+ widgets × detailed controls = 50K+ tokens per request
2. **Small Model Failure**: gemma3:270m (2K context) cannot handle this load
3. **Wasted Tokens**: 95% of widget info is irrelevant to the current task
4. **Redundant Data**: Content/Style/Advanced tabs share common control patterns

### Elementor Widget Structure

Each widget has standardized control tabs:

- **Content**: Widget-specific content controls (varies by widget)
- **Style**: Typography, colors, spacing, borders (mostly common patterns)
- **Advanced**: CSS classes, responsive settings, animations (highly standardized)

---

## Proposed Solution: Two-Phase Architecture

### Phase 1: Planning Mode (Lightweight)

**Context Budget**: ~2K tokens  
**Goal**: Let LLM plan the page structure without detailed widget schemas

**Input to LLM**:

```
Available widgets: heading, text-editor, image, button, divider, spacer, icon,
gallery, video, map, social-icons, nav-menu, ...

User request: "Create a hero section with title and CTA button"
```

**Expected Output**:

```
PLAN:
1. heading - main title
2. text-editor - description text
3. button - call to action
```

### Phase 2: Execution Mode (Smart Context)

**Context Budget**: ~8K tokens  
**Goal**: Generate valid Elementor JSON using only planned widgets

**Input to LLM**:

```
Common Controls (shared across all widgets):
{
  "advanced_tab": { "css_id", "css_classes", "margin", "padding", ... },
  "style_base": { "typography", "text_color", "background", ... }
}

Widget-Specific Controls:
heading: { title, tag, alignment, link }
text-editor: { editor, drop_cap }
button: { text, link, size, icon }

Previous Plan: [heading, text-editor, button]
User request: "Create a hero section with title and CTA button"
```

**Expected Output**:

```json
[JSON]
{
  "elType": "container",
  "elements": [
    { "widgetType": "heading", "settings": { "title": "Hero Title", ... } },
    { "widgetType": "text-editor", "settings": { ... } },
    { "widgetType": "button", "settings": { ... } }
  ]
}
[/JSON]
```

---

## Implementation Plan Summary

### New Files to Create

#### 1. `schemas/common-controls.js`

Export common control structures:

```javascript
export const COMMON_CONTROLS = {
  advanced: { css_id, css_classes, margin, padding, ... },
  style_base: { typography, text_color, background, ... }
};
```

#### 2. `schemas/widget-registry.js`

Registry for widget-specific metadata:

```javascript
export const getWidgetInfo = (mode, widgets = []) => {
  if (mode === "names") return widgetNames;
  if (mode === "selective") return getSelectiveSchemas(widgets);
  return allWidgets; // fallback
};
```

### Files to Modify

#### 1. `context.jsx` - Core Logic Changes

**Changes**:

- Refactor `getAvailableWidgets()` to support modes: `'names'`, `'selective'`, `'full'`
- Implement phase detection in `sendMessage()`
- Create two separate system prompts for planning/execution
- Extract mentioned widgets from chat history for selective context

**Priority Rules to Remove**:

- ❌ Tailwind CSS prefix (Elementor doesn't use it)
- ❌ Raw SVG usage (use icon widget instead)

**New Rules to Add**:

- ✅ Use ONLY Elementor widgets
- ✅ Icons must use icon widget
- ✅ Reference common controls by name

#### 2. `ChatPanel.jsx` - UI Enhancements

**Changes**:

- Add phase indicator badge ("Planning" / "Building")
- Show token usage per message
- Enhance prompt suggestions for common sections

---

## Verification & Testing Strategy

### 1. Schema Extraction Verification

- Open real Elementor widget editor
- Compare extracted schema with actual UI
- Verify common controls match across widgets

### 2. Context Size Measurement

```javascript
// Temporary logging in context.jsx
console.log("Planning context:", planningPrompt.length);
console.log("Execution context:", executionPrompt.length);
// Target: Planning < 2K, Execution < 8K (for 3-5 widgets)
```

### 3. End-to-End Flow Test

1. New chat → "Create hero section"
2. Verify planning phase produces widget list
3. Continue → "Build it"
4. Verify execution generates valid JSON
5. Apply to canvas → verify elements appear

### 4. Small Model Test (gemma3:270m)

- Run same tests with small model
- Verify no hallucinations
- Verify JSON validity

---

## Migration from Old Architecture

### What Was Removed

❌ WordPress REST API integration  
❌ Server-side AI processing  
❌ PHP backend endpoints  
❌ WP nonces and permissions  
❌ Database models for jobs/history

### What Replaced It

✅ Ollama local inference  
✅ Client-side React state  
✅ `localStorage` for persistence  
✅ Direct Elementor API calls

### What Stays the Same

- Elementor JSON insertion mechanism
- UI component structure
- Modal/dialog integration
- Editor lifecycle hooks

---

## Security & Performance Notes

### Security

- No API keys exposed (Ollama is local)
- No external network calls
- All data stays in browser localStorage
- Elementor's own security applies to JSON insertion

### Performance

- Small models (270m) run fast on CPU
- Streaming provides immediate feedback
- Context optimization reduces inference time
- localStorage is instant for history

---

## Next Steps

1. ✅ Create `task.md` with breakdown
2. ✅ Create `implementation_plan.md` with detailed changes
3. ⏳ Get user review and approval
4. 🔜 Implement schema extraction
5. 🔜 Refactor context management
6. 🔜 Update prompts for two-phase flow
7. 🔜 Test with small and large models
8. 🔜 Document widget schema patterns

---

**Last Updated**: 2026-02-08  
**Status**: Planning Phase - Awaiting User Review
