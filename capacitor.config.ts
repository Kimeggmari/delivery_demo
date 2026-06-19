import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eggmari.foodneverarrives',
  appName: '음식만안와요',
  webDir: 'dist',
  android: {
    appendUserAgent: 'FoodNeverArrivesApp'
  }
};

export default config;
