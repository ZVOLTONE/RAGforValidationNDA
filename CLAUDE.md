# ConfidAI — konteks proyek

## Proyek
- Lomba: Kartika Cyber Hackathon 2026 (PUSSIBERAD x CODEPOLITAN). Submission 15 Nov 2026 23:59 WIB; final offline 24 Nov 2026.
- ConfidAI: menganalisis NDA/kontrak vendor, mencari klausul lemah atau yang tidak ada (subkontraktor, akses, pelaporan insiden, penghapusan data), memberi bukti (kutipan klausul + pasal UU), highlight PDF asli, dan laporan PDF.
- Prinsip: "no evidence, no definitive finding". Tidak boleh menyatakan pelanggaran hukum final atau bahwa serangan sudah terjadi.
- Stack (PRD): FastAPI, Ollama (qwen3:1.7b), nomic-embed-text:latest, ChromaDB, PyMuPDF, Tesseract.
- Tim (Trello "RAGforValidationNDA"): Jayden Samuel Kurniawan (Jayz), Daniel Yehuda, Yudhistira Ari Nugroho (Yudhis).
- Juri harus bisa mencoba karya lewat link publik, jadi rencana deployment perlu diputuskan.

## BE-06: indexing referensi hukum ke ChromaDB
- Pembagian: KUHP = Jayden, ITE = Yudhis, PDP = Daniel.
- UU PDP (UU 27/2022) selesai: 76/76 pasal, 99 chunk di koleksi `legal_references`.
- Belum: KUHP (UU 1/2023 + UU 1/2026 Penyesuaian Pidana) dan ITE (UU 11/2008, 19/2016, 1/2024).
- ChromaDB tersimpan lokal (`./chroma_db`, di-gitignore). Untuk berbagi: zip folder `chroma_db`, atau ingest ulang dengan skrip + PDF yang sama.

## Struktur
- `backend/app/config.py`: baca `.env` di root (OLLAMA_URL, EMBED_MODEL, CHROMA_DB, COLLECTION) + `PREFIXES` per model. Path relatif di `.env` dihitung dari root proyek.
- `backend/app/rag/ingest.py` (BE-06): PDF UU -> ekstrak per halaman (OCR kalau halaman berupa gambar) -> bersihkan kop halaman -> chunk per Pasal (batang tubuh & penjelasan dipisah) -> embedding via Ollama -> simpan ke ChromaDB. Ingest ulang mengganti data lama (tidak dobel).
- `backend/app/rag/retrieval.py` (BE-07): kelas `Retriever` dengan `search(query, k, method, source)`; method `vector`/`bm25`/`hybrid` (RRF). Model embedding dibaca dari metadata koleksi. `copy_collection(model)` menyalin chunk ke koleksi model lain tanpa proses PDF ulang (mis. `legal_references__bge-m3`).
- `backend/eval/`: `testset_pdp.json` (43 kasus, gold masih DRAFT, perlu dicek Daniel), `eval_retrieval.py` -> `results.md`, `cek_kunci.py` -> `cek_kunci_pdp.md` (lembar cek manual).
- `backend/requirements.txt`: library backend. Nanti FastAPI masuk `backend/app/main.py`.
- `docs/`: PRD, user flow, rulebook & S&K lomba. `data/legal/`: PDF UU sumber (dari peraturan.bpk.go.id).
- Root: `.env.example`, `.gitignore`, `.vscode/settings.json` (interpreter venv, terminal CMD mulai di `backend`), `chroma_db/` (gitignore).

## Perintah (Windows CMD)
- Aktifkan venv dari root: `venv\Scripts\activate`, lalu `cd backend`. Semua perintah Python di bawah dijalankan dari folder `backend` dengan `python -m`.
- Install library: `python -m pip install -r requirements.txt` (selalu lewat `python -m pip` supaya masuk ke venv).
- Konfigurasi: `copy .env.example .env` di root.
- Ollama harus jalan dulu. Model: `ollama pull nomic-embed-text`, `ollama pull bge-m3`.
- Dry run: `python -m app.rag.ingest ..\data\legal\<pdf> --source-id <ID> --title "<judul resmi>" --short "<singkatan>" --version "<versi>" --dry-run --show "1,4"`
- Simpan: perintah yang sama tanpa `--dry-run`. Catatan putusan MK: `--status "53=..."`.
- UU perubahan yang memakai "Pasal I, II" (UU ITE 19/2016, 1/2024): tambah `--roman-pasal`.
- Cari: `python -m app.rag.retrieval "<kalimat>" --method hybrid --collection legal_references__bge-m3 --source UU-27-2022` (`--method vector` untuk vektor saja).
- Evaluasi: `python -m eval.eval_retrieval`. Lembar cek gold: `python -m eval.cek_kunci`.

## Jebakan yang sudah ditemui
- PDF dari BPK adalah hasil scan + lapisan teks OCR: "Pasal I"=1, "Pasal 7O"=70, "Pasa722"/"PasaJ22"=22, "Pasal2T"=27, "Pasal T2"=72, "PENJEI,ASAN"=PENJELASAN, nomor halaman "-t7-". Skrip sudah menangani ini. Selalu dry-run dulu dan pastikan jumlah pasal cocok (PDP 76, KUHP baru 624).
- Typo OCR di dalam kalimat (mis. "Persetqjuan") tetap ada; ini keterbatasan sumber.
- OCR memotong sebagian pasal (mis. Pasal 17, 64, 65 ayat 3, 76), jadi sebagian kegagalan retrieval berasal dari data, bukan model.
- Model embedding untuk indexing dan query harus sama; ganti model = ingest ulang semua.
- nomic butuh prefiks `search_document: ` (dokumen) dan `search_query: ` (query). bge-m3 tanpa prefiks (diatur `PREFIXES` di `app/config.py`).
- nomic-embed-text lemah untuk teks hukum Indonesia. Eval 31 Okt 2026 (43 kasus PDP, k=5, Recall@5): nomic vektor 0,23; BM25 0,69; nomic hybrid 0,52; bge-m3 vektor 0,74; bge-m3 hybrid 0,78 (target PRD 0,80). Gold masih draft.

## Langkah berikutnya
1. Cek gold di `backend/eval/testset_pdp.json`, jalankan ulang eval, putuskan model (kandidat kuat: bge-m3) SEBELUM KUHP/ITE di-ingest.
2. Kalau bge-m3 dipilih: set `EMBED_MODEL=bge-m3` di `.env`, ingest ulang ke koleksi baru.
3. Naikkan Recall ke >=0,80: perbaiki teks pasal yang terpotong OCR, coba reranking/HyDE (AI-06 pakai set uji yang sama).
4. Buat repo GitHub bersama.
