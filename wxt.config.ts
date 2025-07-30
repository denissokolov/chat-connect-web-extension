import { defineConfig } from 'wxt'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  modules: ['@wxt-dev/module-react'],
  // @ts-expect-error - plugins has wrong type
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'Chat Connect',
    host_permissions: ['<all_urls>'],
    permissions: ['sidePanel', 'activeTab', 'scripting', 'storage'],
    commands: {
      _execute_action: {
        suggested_key: {
          default: 'Ctrl+Shift+Y',
          mac: 'Command+Shift+Y',
        },
      },
    },
    action: {
      default_title: 'Chat Connect', // This is needed for the shortcut to work.
    },
  },
  zip: {
    name: 'chat-connect',
    artifactTemplate: '{{name}}-{{browser}}.zip',
  },
})
