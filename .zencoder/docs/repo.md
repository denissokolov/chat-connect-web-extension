# Chat Connect Web Extension Information

## Summary

Chat Connect is a browser extension that provides a chat interface in the browser's side panel. It allows users to interact with AI assistants while browsing the web, accessible via a toolbar icon or keyboard shortcut (⌘+Shift+Y on Mac, Ctrl+Shift+Y on Windows/Linux).

## Structure

- **src/**: Core application code including React components, services, and utilities
  - **components/**: UI components including Chat and Settings interfaces
  - **services/**: Service modules for browser and assistant interactions
  - **stores/**: State management using Zustand
- **public/**: Static assets and manifest.json for the extension
- **.storybook/**: Storybook configuration for component development
- **.github/**: CI/CD workflows

## Language & Runtime

**Language**: TypeScript/JavaScript
**Version**: TypeScript ~5.8.3
**Build System**: Vite 6.3.5
**Package Manager**: npm

## Dependencies

**Main Dependencies**:

- React 19.1.0 and React DOM 19.1.0
- OpenAI 5.6.0 for AI integration
- Zustand 5.0.5 for state management
- Tailwind CSS 4.1.10 for styling
- Radix UI components for accessible UI elements

**Development Dependencies**:

- Vite 6.3.5 for building
- Vitest 3.2.4 for testing
- Storybook 9.0.12 for component development
- ESLint 9.29.0 and Prettier 3.5.3 for code quality
- Playwright 1.53.1 for browser testing

## Build & Installation

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development with auto-rebuild
npm run dev
```

## Testing

**Framework**: Vitest
**Test Location**: Files with .test.ts extension
**Configuration**: vitest.config.ts
**Projects**: Unit tests and Storybook tests
**Run Command**:

```bash
# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run Storybook tests
npm run test:storybook

# Run with UI
npm run test:ui
```

## Browser Extension

**Manifest Version**: 3
**Target Browser**: Chrome (target: chrome114)
**Entry Points**:

- Background script: src/background.ts
- Side panel: sidepanel.html (src/panel.tsx)
- Settings page: settings.html (src/settings.tsx)
  **Permissions**: sidePanel, activeTab, scripting, storage
