/**
 * Satu-satunya tempat konfigurasi backend.
 *
 * Untuk memakai backend FastAPI asli:
 *   1. Ubah API_BASE_URL ke alamat backend.
 *   2. Set USE_MOCK_DATA = false.
 *
 * Tidak ada rahasia di berkas ini — hanya URL publik.
 */
export const API_BASE_URL = 'http://localhost:8000/api/v1';

/** Mode data contoh (ilustratif) agar alur dapat didemokan tanpa backend. */
export const USE_MOCK_DATA = true;

/** Batas ukuran unggahan di sisi klien (asumsi, lihat laporan). */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = '20 MB';

export const APP_NAME = 'ConfidAI';
