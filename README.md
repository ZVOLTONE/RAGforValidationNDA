# ConfidAI
## [Link Demo](https://demo-nda.vercel.app/)
[Link Demo](Arsitektur.png)

Repositori ini mengelompokkan layanan analisis dan aplikasi hybrid dalam dua
direktori:

```text
backend/   FastAPI, OCR, analisis kontrak, RAG, koleksi hukum, dan sampel
frontend/  Expo + React Native untuk web desktop, iOS, dan Android
```

## Menjalankan backend

Siapkan environment Python dari root:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
```

Konfigurasi backend memakai `.env` di root jika tersedia. Jalankan API:

```bash
PYTHONPATH=backend .venv/bin/python -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```

Untuk menjalankan backend dan frontend web sekaligus di Linux atau Windows, siapkan dependensi sekali lalu jalankan `python run.py`. Panduan lengkap ada di [requirements.md](requirements.md).

Dokumen PDF hasil scan memerlukan Tesseract dan data bahasa Indonesia. Lihat
[panduan OCR](backend/docs/OCR_INPUT_PIPELINE.md). Sampel NDA dan kunci evaluasi
tersedia di `backend/samples/`.

## Menjalankan frontend Expo

```bash
cd frontend
npm ci
npm run web
```

Untuk menjalankan di simulator/perangkat:

```bash
npm run android
npm run ios
```

Frontend membaca `EXPO_PUBLIC_API_URL`. Nilai default adalah
`http://localhost:8000` untuk web/iOS simulator dan `http://10.0.2.2:8000`
untuk Android emulator. Pada ponsel fisik, set variabel tersebut ke alamat LAN
komputer backend. Origin web lokal sudah diizinkan backend; origin tambahan
diatur melalui `FRONTEND_ORIGINS` pada `.env`.

Halaman analisis menampilkan graph pipeline, log tekstual per tahap, keluaran
temuan, alasan, metode/model, keyakinan, bukti, hasil validasi, serta tautan
laporan setelah PDF selesai dibuat. Semua temuan tetap memerlukan tinjauan
manusia; sistem tidak menetapkan pelanggaran hukum final.

Di halaman **Daftar pekerjaan**, progres dapat dihapus satu per satu atau
seluruhnya. Penghapusan meminta konfirmasi dan menghapus data progres, PDF
unggahan, serta file hasil analisis dari storage backend.

## Dokumentasi teknis

- [Arsitektur dan penggunaan backend](backend/README.md)
- [Alur OCR](backend/docs/OCR_INPUT_PIPELINE.md)
- [Pemetaan referensi hukum](backend/RAG/LEGAL_MAPPING.md)
- [Status requirements RAG](backend/RAG/README.md)
- [Requirements dan setup Linux/Windows](requirements.md)
