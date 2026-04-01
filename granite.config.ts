import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'foodisnotcoming',
  brand: {
    displayName: '음식이안와요',
    primaryColor: '#ff9a1f',
    icon: 'http://localhost:5173/icon_600x600.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
  },
});