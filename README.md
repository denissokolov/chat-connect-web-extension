# chat-connect-web-extension

## Developent

Build the extension for production
```
npm run build
```

Watch for changes and rebuild automatically
```
npm run dev
```

Run all project checks
```
npm run check
```

## Installation in Google Chrome

1. **Build the extension**
   ```
   npm run build
   ```

2. **Open Chrome Extensions page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/` or go to Chrome menu → More tools → Extensions

3. **Enable Developer mode**
   - Toggle the "Developer mode" switch in the top-right corner of the extensions page

4. **Load the extension**
   - Click "Load unpacked" button
   - Navigate to your project folder and select the `dist` folder (or the build output folder)
   - Click "Select Folder"

5. **Verify installation**
   - The extension should now appear in your extensions list
   - You should see the extension icon in your Chrome toolbar

## Usage

Once installed, you can access the extension by clicking its icon in the Chrome toolbar.