import { Platform } from 'react-native';

/**
 * Satu-satunya tempat konfigurasi backend.
 *
 * URL dapat ditimpa melalui EXPO_PUBLIC_API_URL untuk simulator/perangkat.
 * Android emulator memakai host bridge 10.0.2.2; device fisik perlu alamat LAN.
 *
 * Tidak ada rahasia di berkas ini — hanya URL publik.
 */
const localBackend = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || localBackend).replace(/\/$/, '');

/** Mode data contoh (ilustratif) agar alur dapat didemokan tanpa backend. */
export const USE_MOCK_DATA = false;

/** Batas ukuran unggahan di sisi klien (asumsi, lihat laporan). */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = '20 MB';

export const APP_NAME = 'ConfidAI';

