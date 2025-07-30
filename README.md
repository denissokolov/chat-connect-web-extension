# Chat Connect Web Extension

[![CI workflow](https://github.com/denissokolov/chat-connect-web-extension/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/denissokolov/chat-connect-web-extension/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/denissokolov/chat-connect-web-extension.svg)](https://github.com/denissokolov/chat-connect-web-extension/blob/main/LICENSE)
[![Storybook](https://raw.githubusercontent.com/storybooks/brand/master/badge/badge-storybook.svg)](https://denissokolov.github.io/chat-connect-web-extension/)

## 🔗 Download Build

[Download latest build (ZIP)](https://github.com/denissokolov/chat-connect-web-extension/releases/latest/download/chat-connect-chrome.zip)

## Prerequisites

- Node.js (version 22 or higher)
- npm package manager
- Google Chrome browser

## Development

Install dependencies

```bash
npm install
```

Install browsers for running playwright tests

```
npx playwright install
```

Build the extension for production

```bash
npm run build
```

Watch for changes and rebuild automatically

```bash
npm run dev
```

Run all project checks

```bash
npm run check
```

Run Storybook locally

```bash
npm run storybook
```

## Useful resources

https://ui.shadcn.com/docs/components - component library

https://lucide.dev/icons/ - icon library

## Installation in Google Chrome

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Build the extension**

   ```bash
   npm run build
   ```

3. **Open Chrome Extensions page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/` or go to Chrome menu → More tools → Extensions

4. **Enable Developer mode**
   - Toggle the "Developer mode" switch in the top-right corner of the extensions page

5. **Load the extension**
   - Click "Load unpacked" button
   - Navigate to your project folder and select the `dist/chrome-mv3` folder (or the build output folder)
   - Click "Select Folder"

6. **Verify installation**
   - The extension should now appear in your extensions list
   - You should see the extension icon in your Chrome toolbar

## Usage

Once installed, you can access the extension by clicking its icon in the Chrome toolbar or using the keyboard shortcut:

- **Mac**: ⌘+Shift+Y
- **Windows/Linux**: Ctrl+Shift+Y

## Troubleshooting

- **Extension not loading**: Make sure you've built the project (`npm run build`) and are selecting the correct build output folder
- **Extension not appearing**: Check that Developer mode is enabled in Chrome extensions
- **Build errors**: Ensure all dependencies are installed (`npm install`) and you're using a compatible Node.js version

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests with `npm run check`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
