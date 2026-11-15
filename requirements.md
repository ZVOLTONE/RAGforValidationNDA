# Requirements dan setup ConfidAI

## Kebutuhan sistem

- Python 3.11 atau lebih baru.
- Node.js 22 atau lebih baru dan npm.
- Ollama berjalan lokal dengan model `nomic-embed-text:latest` dan `qwen3:1.7b`.
- Tesseract OCR untuk dokumen PDF scan. Pada Linux, pasang juga data bahasa Inggris dan Indonesia.
- Windows: PowerShell, Python, Node.js, dan Tesseract tersedia di `PATH`.

Dependensi Python aplikasi ada di [backend/requirements.txt](backend/requirements.txt); dependensi frontend dan versinya terkunci pada `frontend/package-lock.json`.

## Linux (Ubuntu/Debian)

Pasang kebutuhan sistem:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip tesseract-ocr tesseract-ocr-eng tesseract-ocr-ind
```

Pasang Node.js 22+ dan Ollama melalui installer resmi masing-masing. Setelah itu, dari root proyek:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
cp .env.example .env
cd frontend
npm ci
cd ..
```

Tarik model yang dipakai backend jika belum tersedia:

```bash
ollama pull nomic-embed-text:latest
ollama pull qwen3:1.7b
```

Jalankan dua aplikasi bersama-sama:

```bash
python3 run.py
```

## Windows (PowerShell)

Pasang Python 3.11+, Node.js 22+, Ollama, dan Tesseract OCR. Pastikan pilihan untuk menambahkan Python, Node.js, dan Tesseract ke `PATH` aktif. Pada setup Tesseract, sertakan data bahasa Inggris dan Indonesia.

Dari root proyek:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
Copy-Item .env.example .env
Set-Location frontend
npm ci
Set-Location ..
```

Tarik model dan jalankan:

```powershell
ollama pull nomic-embed-text:latest
ollama pull qwen3:1.7b
py -3.11 run.py
```

## Konfigurasi lokal

`.env` berada di root dan sengaja diabaikan Git. Sesuaikan URL Ollama atau koleksi ChromaDB di file tersebut. Frontend dapat memakai `frontend/.env` untuk alamat API, misalnya `EXPO_PUBLIC_API_URL=http://localhost:8000`; gunakan alamat LAN komputer untuk perangkat fisik. Contoh konfigurasi frontend tersedia di `frontend/.env.example`.

Skrip `run.py` menggunakan `.venv` bila tersedia, memulai API di port 8000 dan Expo web di 8081, lalu menghentikan keduanya saat `Ctrl+C`. Port dapat diubah, misalnya `python run.py --api-port 8010 --web-port 8090`.

Rincian endpoint dan alur OCR tersedia di [backend/README.md](backend/README.md) dan [panduan OCR](backend/docs/OCR_INPUT_PIPELINE.md).
