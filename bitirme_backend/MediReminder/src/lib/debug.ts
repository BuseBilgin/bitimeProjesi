import { Platform } from 'react-native';
import Constants from 'expo-constants';

export async function getDebugInfo(): Promise<{
  platform: string;
  appVersion: string;
  expoVersion: string;
  debuggerHost?: string;
  linkingUri?: string;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    const platform = Platform.OS;
    const appVersion = Constants.expoConfig?.version || 'unknown';
    const expoVersion = Constants.expoGoConfig?.version || 'unknown';
    const debuggerHost = Constants.expoGoConfig?.debuggerHost;
    const linkingUri = Constants.linkingUri;

    // Check if we're in Expo Go
    const isExpoGo = Constants.expoConfig?.runtimeVersion === 'exposdk:50.0.0' || debuggerHost;

    return {
      platform,
      appVersion,
      expoVersion,
      debuggerHost,
      linkingUri,
      errors,
    };
  } catch (error) {
    errors.push(String(error));
    return {
      platform: Platform.OS,
      appVersion: 'unknown',
      expoVersion: 'unknown',
      errors,
    };
  }
}

export function formatDebugInfo(info: Awaited<ReturnType<typeof getDebugInfo>>): string {
  const lines = [
    `Platform: ${info.platform}`,
    `App Version: ${info.appVersion}`,
    `Expo Version: ${info.expoVersion}`,
  ];

  if (info.debuggerHost) {
    lines.push(`Debugger Host: ${info.debuggerHost}`);
  }

  if (info.linkingUri) {
    lines.push(`Linking URI: ${info.linkingUri}`);
  }

  if (info.errors.length > 0) {
    lines.push(`Errors: ${info.errors.join(', ')}`);
  }

  return lines.join('\n');
}

export const NETWORK_TROUBLESHOOTING_STEPS = [
  '1. Backend servisinin 3004 portunda çalıştığını kontrol edin',
  '   Komutu çalıştırın: npm run start',
  '',
  '2. Bilgisayarınızın IP adresini öğrenin',
  '   Mac/Linux: ifconfig | grep inet',
  '   Windows: ipconfig',
  '',
  '3. Cihazın aynı ağda olduğunu kontrol edin',
  '   • Bilgisayar ve cihaz aynı WiFi ağında olmalıdır',
  '',
  '4. Firewall ayarlarını kontrol edin',
  '   • 3004 portunun açık olduğunu kontrol edin',
  '',
  '5. .env dosyasını güncellemeniz gerekirse',
  '   MediReminder/.env dosyasında şu satırı ekleyin:',
  '   EXPO_PUBLIC_API_URL=http://<IP_ADRESI>:3004/api',
].join('\n');
