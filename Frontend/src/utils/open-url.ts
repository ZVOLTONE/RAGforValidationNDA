import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

/** Membuka tautan unduhan/pratinjau di tab baru (web) atau browser in-app (native). */
export async function openExternalUrl(url: string): Promise<void> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Chrome memblokir navigasi tingkat atas ke data:, jadi ubah ke Blob URL.
    if (url.startsWith('data:')) {
      const separator = url.indexOf(',');
      const header = separator >= 0 ? url.slice(0, separator) : '';
      const mime = /data:([^;,]+)/.exec(header)?.[1] ?? 'text/html';
      const body = separator >= 0 ? decodeURIComponent(url.slice(separator + 1)) : '';
      const blobUrl = URL.createObjectURL(new Blob([body], { type: mime }));
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  await WebBrowser.openBrowserAsync(url);
}
