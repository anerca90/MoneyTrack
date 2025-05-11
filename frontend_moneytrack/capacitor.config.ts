import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moneytrack.app',
  appName: 'moneytrack',
  webDir: 'build',
  server: {
    url: 'http://192.168.1.90:3000',
    cleartext: true
  }
};

export default config;