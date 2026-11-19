import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eggmari.foodneverarrives',
  appName: '음식만안와요',
  webDir: 'dist',
  android: {
    appendUserAgent: 'FoodNeverArrivesApp'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#fff7ed',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      androidScaleType: 'CENTER_CROP',
    },
  },
  experimental: {
    ios: {
      spm: {
        packageOptions: {
          '@capacitor-firebase/app-check': {
            symlink: true
          }
        }
      }
    }
  }
};

export default config;
