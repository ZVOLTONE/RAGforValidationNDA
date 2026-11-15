# ConfidAI Backend

Backend prototype untuk menganalisis NDA/kontrak terhadap risiko keamanan siber, referensi hukum, dan bukti klausul sumber.

Pipeline utama:

```text
Upload PDF → Ekstraksi/OCR → Segmentasi Klausul → Screening Risiko + Ollama
→ Validasi Bukti → Pemetaan Pasal UU terkontrol → Findings / Report PDF
```

Analisis mengambil pasal kandidat dari koleksi UU berdasarkan pemetaan risiko
yang eksplisit dan mencocokkan `source_id` serta nomor pasal ke teks batang tubuh.
Output menyertakan kutipan, alasan relevansi, kondisi penerapan, nama file, dan
ID chunk. Ini adalah pasal terkait untuk ditinjau, bukan penetapan bahwa hukum
telah dilanggar; perubahan/peraturan pelaksana yang belum ada di korpus harus
diperiksa reviewer. Kriteria pemetaan dan syarat per pasal didokumentasikan di
[RAG/LEGAL_MAPPING.md](RAG/LEGAL_MAPPING.md).

## Prasyarat

- Python 3.11 atau lebih baru
- Docker dengan Ollama container pada port `11434`
- Model `nomic-embed-text:latest` dan `qwen3:1.7b`
- Tesseract untuk PDF hasil scan

Untuk Linux Debian/Ubuntu, pasang binary Tesseract beserta data bahasa Indonesia:

```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-ind
```

Backend akan memilih OCR pada halaman yang setidaknya 50% tertutup gambar,
termasuk scan yang memiliki teks digital parsial. Pastikan `tesseract` tersedia
di `PATH`; bila lokasinya berbeda, set `TESSERACT_CMD` di `.env`. OCR memakai
bahasa Indonesia dan Inggris bila keduanya tersedia. Teks hasil ekstraksi
menyambungkan baris yang terbungkus dan kata yang terpotong tanda hubung,
mempertahankan pemisah paragraf, serta mengenali judul seperti `Pasal` yang
nomornya jatuh pada baris/halaman berikutnya. Halaman OCR dengan keyakinan
rendah tetap ditandai untuk pemeriksaan manual.

Detail implementasi, verifikasi, dan batasan tersedia di
[docs/OCR_INPUT_PIPELINE.md](docs/OCR_INPUT_PIPELINE.md). Catatan untuk agent
berikutnya tersedia di [docs/AGENT_HANDOFF.md](docs/AGENT_HANDOFF.md).

```bash
docker ps
docker exec ollama ollama list
```

## Konfigurasi

File `.env` di root:

```env
MODEL_NAME=nomic-embed-text:latest
OLLAMA_BASE_URL=http://localhost:11434
LLM_MODEL=qwen3:1.7b
CHROMA_COLLECTION=legal_security_references_nomic_prefixed_v1
```

Analisis menggabungkan screening bukti eksplisit untuk pola risiko kontrak
dengan klasifikasi Ollama pada klausul lain. Keluaran yang tidak cukup didukung
bukti tetap ditandai `needs_review`.

## Instalasi

Dari root proyek:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
source .venv/bin/activate
```

## Menjalankan backend

```bash
PYTHONPATH=backend .venv/bin/python -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

## Analisis NDA

Upload dokumen:

```bash
curl -X POST \
  -F "file=@backend/samples/File Input/sample_NDA.pdf" \
  http://127.0.0.1:8000/jobs
```

Gunakan `job_id` dari respons untuk mengecek status dan hasil:

```bash
curl http://127.0.0.1:8000/jobs/<JOB_ID>
curl http://127.0.0.1:8000/jobs/<JOB_ID>/progress
curl http://127.0.0.1:8000/jobs/<JOB_ID>/clauses
curl http://127.0.0.1:8000/jobs/<JOB_ID>/findings
```

Respons `/progress` cocok untuk polling UI dan berisi tahap aktif, status,
pesan, persentase serta jumlah unit yang selesai. Endpoint `/jobs/<JOB_ID>`
menyediakan ringkasan tahap, kualitas ekstraksi per halaman, konfigurasi
analisis, ringkasan validasi, status artefak, dan riwayat tahap. Temuan
menyertakan `analysis_method` (`rule_based`, `llm`, atau `fallback`),
`model_name`, `decision_basis`, kutipan bukti, confidence, catatan validasi,
referensi hukum, serta `needs_human_review`. `decision_basis` adalah alasan
ringkas yang dapat ditampilkan ke reviewer, bukan penalaran internal model.
Temuan parsial tersedia selama analisis berlangsung. Kegagalan tahap
dikembalikan dengan `status=failed`, `stage`, `error`, dan detail tahap gagal.

Hapus satu pekerjaan atau seluruh pekerjaan beserta foldernya di
`confidai_data/`:

```bash
curl -X DELETE http://127.0.0.1:8000/jobs/<JOB_ID>
curl -X DELETE http://127.0.0.1:8000/jobs
```

Endpoint pertama menghapus progres, PDF unggahan, dan semua artefak untuk satu
`JOB_ID`. Endpoint kedua menghapus semua pekerjaan yang terdaftar serta folder
pekerjaan tersisa di direktori data. Pekerjaan yang sedang berjalan juga
dikeluarkan pada checkpoint pemrosesan berikutnya; foldernya dibersihkan lagi
ketika proses tersebut selesai.

Untuk origin frontend di luar localhost port 3000/5173/8081, atur daftar origin
dipisahkan koma melalui `FRONTEND_ORIGINS` sebelum menjalankan backend.

Status normal:

```text
queued → processing → ai_analysis → validating → completed
```

Download report PDF. Halaman awal memuat NDA asli dengan highlight dan legenda
warna; halaman setelahnya memuat ringkasan serta detail analisis:

```bash
curl -o report.pdf http://127.0.0.1:8000/jobs/<JOB_ID>/report
```

Highlight hanya dibuat untuk temuan yang tervalidasi dan memiliki bukti yang
berhasil ditemukan di halaman sumber. Temuan `inconclusive` tetap dijelaskan
di bagian analisis, tanpa highlight risiko yang dapat memberi kesan kepastian.
Endpoint `/jobs/<JOB_ID>/highlight` tetap tersedia untuk mengunduh PDF sumber
beranotasi saja.

## RAG referensi hukum

Koleksi aktif berada di `backend/RAG/chroma_store`:

- UU ITE: 111 chunk
- UU PDP: 156 chunk
- KUH Perdata: 2.023 chunk

Query manual:

```bash
cd backend/RAG
../../.venv/bin/python query.py "perlindungan data pribadi" -k 5
../../.venv/bin/python query.py "informasi elektronik dan sistem elektronik" -k 5
```

Rebuild ingestion:

```bash
cd backend/RAG
../../.venv/bin/python ingest.py \
  ../UU/KITAB_UNDANG-UNDANG_HUKUM_PERDATA.md \
  ../UU/UU_Nomor_11_Tahun_2008.md \
  ../UU/uu-27-2022.md --prune
```

Status requirement RAG ada di [RAG/REQUIREMENTS_STATUS.md](RAG/REQUIREMENTS_STATUS.md).

## Penyimpanan output

```text
backend/confidai_data/<JOB_ID>/
├── original.pdf
├── job.json
├── report.pdf
└── highlighted.pdf
```

PDF asli tidak ditimpa oleh proses highlight.

## Catatan keamanan

- Dokumen diproses lokal melalui Ollama.
- Jangan commit `.env`, dokumen kontrak, atau `confidai_data`.
- Temuan tanpa bukti cukup ditandai `inconclusive` atau `needs_review`.
- Sistem tidak menyatakan serangan siber atau pelanggaran hukum final.
- Semua hasil memerlukan peninjauan manusia.

## Troubleshooting

### Ollama tidak terhubung

```bash
curl http://localhost:11434/api/tags
docker ps
```

Pastikan `.env` memakai `OLLAMA_BASE_URL=http://localhost:11434`.

### Model belum tersedia

```bash
docker exec ollama ollama pull nomic-embed-text:latest
docker exec ollama ollama pull qwen3:1.7b
```

### Job `inconclusive`

Model mungkin tidak tersedia, timeout, atau bukti belum cukup. Hasil ekstraksi
dan klausul tetap dipertahankan, tetapi sistem tidak membuat kesimpulan
definitif tanpa evidence.
