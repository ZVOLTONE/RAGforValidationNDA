# ConfidAI Frontend

Frontend hybrid untuk web desktop, iOS, dan Android menggunakan Expo SDK 58,
React Native, dan Expo Router. Mode API backend aktif secara default.

## Menjalankan

```bash
npm ci
npm run web
```

Untuk Android atau iOS:

```bash
npm run android
npm run ios
```

Salin `.env.example` ke `.env` bila alamat backend berbeda. Web/iOS simulator
umumnya memakai `http://localhost:8000`; Android emulator memakai
`http://10.0.2.2:8000`. Pada perangkat fisik, isi `EXPO_PUBLIC_API_URL` dengan
alamat LAN komputer backend. Backend harus mengizinkan origin frontend melalui
`FRONTEND_ORIGINS`.

## Alur transparansi

Halaman `/jobs/[jobId]` memantau status backend, menampilkan graph proses,
log hasil tiap tahap, keluaran temuan parsial, dan tautan laporan PDF setelah
laporan tersedia. Graph animasi web mengambil inspirasi dari
`PipelineNeuralGraph.jsx`; fallback React Native menyediakan peta tahap untuk
Android dan iOS.

Output menunjukkan metode analisis, nama model, confidence, alasan ringkas,
kutipan sumber, hasil validasi, serta kebutuhan review manusia. Hasil AI tetap
perlu ditinjau dan tidak menyatakan pelanggaran hukum final.
