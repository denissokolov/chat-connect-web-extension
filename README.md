# Chat Connect Web Extension

[![CI workflow](https://github.com/denissokolov/chat-connect-web-extension/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/denissokolov/chat-connect-web-extension/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/denissokolov/chat-connect-web-extension.svg)](https://github.com/denissokolov/chat-connect-web-extension/blob/main/LICENSE)
[![Storybook](https://raw.githubusercontent.com/storybooks/brand/master/badge/badge-storybook.svg)](https://denissokolov.github.io/chat-connect-web-extension/)

An AI agent in Chrome's side panel that works with the page you're on. Ask it about the page, have it write a reply and put it in the right field, or let it fill in a form and click through it.

**[Download the latest build (ZIP)](https://github.com/denissokolov/chat-connect-web-extension/releases/latest/download/chat-connect-chrome.zip)**

## What it does

- **Understands the current page.** The assistant knows which tab you're on and reads its content when it needs to, as simplified text (visible elements only) or as HTML.
- **Acts on the page** through three tools:
  - `get_page_content`: read the page as text or HTML
  - `fill_input`: fill inputs, textareas, selects, radios, checkboxes and rich-text (contenteditable) editors
  - `click_element`: click buttons, links and other elements
- **Stays in control.** Every tool call shows up in the chat with its status. Tools can run automatically or wait for you to press *Execute* (an auto-execute toggle in the chat input). The assistant is instructed never to submit forms or order anything unless you explicitly ask.
- **Answers in your language,** translating page content when the page is in another one.
- **OpenAI models:** GPT-5 (default), GPT-5 mini, GPT-4.1, GPT-4.1 mini, GPT-4o, o3, o3-mini and o4-mini, switchable from the chat input. Reasoning summaries are streamed while the model thinks.
- **Chat history** kept locally in IndexedDB (optional), streaming markdown answers, a stop button, and light and dark themes.

Open it with the toolbar icon or **⌘+Shift+Y** (macOS) / **Ctrl+Shift+Y** (Windows/Linux).

## How it works

```
side panel (React) ──► OpenAI Responses API (streaming) ──► tool call
       ▲                  (direct, or via chat-connect-server)  │
       │                                                         ▼
       └──── tool result ◄── chrome.scripting.executeScript in the active tab
```

Each message is sent to the OpenAI Responses API with the page title and URL in the instructions and the three tools attached. When the model calls a tool, the extension runs it in the active tab, returns the result, and the model continues. Conversation state is chained with `previous_response_id`.

## Settings

Open the settings page from the side panel:

| Setting | Notes |
| --- | --- |
| OpenAI API key | Your own key, stored in extension storage on your machine. |
| Custom OpenAI server URL | Leave blank to call OpenAI directly. To use [chat-connect-server](https://github.com/denissokolov/chat-connect-server) instead, set it to `<server-url>/proxy/openai` (e.g. `http://localhost:3001/proxy/openai`). |
| History | Keep chat threads between sessions. |

## Development

Requires Node.js 22+ and Google Chrome.

```bash
npm install
npx playwright install    # browsers for Storybook tests
npm run dev               # watch and rebuild
npm run build             # production build in dist/chrome-mv3
npm run check             # typecheck, lint, tests, knip
npm run storybook         # http://localhost:6006
```

Firefox builds: `npm run dev:firefox`, `npm run build:firefox`.

### Load the extension in Chrome

1. Run `npm run build` (or unzip the downloaded release).
2. Open `chrome://extensions/` and turn on **Developer mode**.
3. Click **Load unpacked** and select `dist/chrome-mv3` (or the unzipped folder).

## Tech stack

- [WXT](https://wxt.dev/) (Manifest V3), React 19, TypeScript
- Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com/) on Radix primitives, [lucide](https://lucide.dev/icons/) icons
- Zustand store split into slices (messages, threads, settings, view)
- OpenAI SDK (Responses API, streaming)
- IndexedDB for chat history

### Architecture

The assistant, browser and storage live behind interfaces in `src/services/`, each with a real and a mock implementation:

| Interface | Real | Mock |
| --- | --- | --- |
| `IAssistant` | `OpenAIAssistant` | `MockAssistant` |
| `IBrowser` | `WXTBrowser` (Chrome APIs) | `MockBrowser` |
| `IRepository` | `IndexedDBRepository` | `MemoryDBRepository` |

This lets the whole UI run and be tested in Storybook without Chrome or an API key. Page-side helpers that are injected into the tab (reading the page, filling fields, clicking) are pure functions in `src/utils/html/pure/` with their own unit tests.

### Testing and CI

- Vitest unit tests for the store slices, the OpenAI stream handling and the DOM helpers
- Storybook stories run as browser tests (Vitest + Playwright), plus Chromatic visual regression tests
- ESLint (incl. SonarJS rules), Prettier, knip, Husky + lint-staged
- GitHub Actions: typecheck, lint, knip and tests with coverage on every push. Builds on `main` are published as the [`latest-chrome` release](https://github.com/denissokolov/chat-connect-web-extension/releases/tag/latest-chrome), and Storybook is deployed to [GitHub Pages](https://denissokolov.github.io/chat-connect-web-extension/).

## License

[MIT](LICENSE)
