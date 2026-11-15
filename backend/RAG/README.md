# RAG Ingestion Pipeline — ConfidAI

Pipeline ingestion referensi hukum & keamanan siber: parsing dokumen →
pembersihan teks → chunking → metadata → embedding (`nomic-embed-text:latest`
via Ollama) → penyimpanan ke ChromaDB. Output: koleksi ChromaDB yang siap
dipakai untuk retrieval (RAG) sesuai PRD section 8.3.

Nomic menggunakan prefiks `search_document: ` untuk embedding saat ingestion
dan `search_query: ` untuk embedding query. Koleksi aktif
`legal_security_references_nomic_prefixed_v1` telah dibangun dengan skema ini;
koleksi baseline `legal_security_references` tetap tersimpan sebagai cadangan.
Metadata skema diperiksa agar vektor lama dan baru tidak tercampur.

## Struktur

| File | Peran |
|---|---|
| `config.py` | Konfigurasi terpusat, dibaca dari `backend/.env` atau `.env` di root repositori. |
| `parser.py` | Parsing + pembersihan teks, segmentasi per Pasal/bagian. |
| `embeddings.py` | Client embedding Ollama (`nomic-embed-text:latest`). |
| `ingest.py` | Orchestrator: parse → embed → simpan ke ChromaDB (idempoten). |
| `retrieval_service.py` | Service retrieval top-k untuk klausul yang sedang dianalisis. |
| `query.py` | Utilitas retrieval untuk verifikasi koleksi. |
| `requirements.txt` | Dependensi Python. |

## Prasyarat

- Python 3.10+
- [Ollama](https://ollama.com) berjalan di `OLLAMA_BASE_URL` (default `http://localhost:11434`)
- Model embedding sudah di-pull:
  ```bash
  ollama pull nomic-embed-text:latest
  ```

Konfigurasi dibaca dari `backend/.env` (utama) atau `.env` di root repositori:

```
MODEL_NAME=nomic-embed-text:latest
OLLAMA_BASE_URL=http://localhost:11434
CHROMA_COLLECTION=legal_security_references_nomic_prefixed_v1
```

Opsional (punya default): `CHROMA_PERSIST_DIR`, `CHROMA_COLLECTION`,
`MAX_CHUNK_CHARS`, `CHUNK_OVERLAP_CHARS`.

## Setup

Jalankan dari root repository:

```bash
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
```

## Menjalankan ingestion

```bash
# Jalankan dari root repo. Tiga sumber hukum yang disiapkan proyek.
.venv/bin/python backend/RAG/ingest.py \
  backend/UU/KITAB_UNDANG-UNDANG_HUKUM_PERDATA.md \
  backend/UU/UU_Nomor_11_Tahun_2008.md \
  backend/UU/uu-27-2022.md --prune

# Berkas lain
.venv/bin/python backend/RAG/ingest.py /path/ke/referensi_lain.txt

# Bangun ulang koleksi (mis. setelah ganti model embedding)
.venv/bin/python backend/RAG/ingest.py --reset

# Bersihkan chunk usang dari dokumen yang isinya berubah
.venv/bin/python backend/RAG/ingest.py --prune

# Dokumen besar dapat dilanjutkan per batch tanpa mengulang embedding.
# Jangan gunakan --prune pada batch parsial.
.venv/bin/python backend/RAG/ingest.py backend/UU/KITAB_UNDANG-UNDANG_HUKUM_PERDATA.md \
  --offset 1800 --limit 300
```

## Retrieval dari aplikasi

Gunakan `ReferenceSearchService` untuk mencari referensi dari klausul yang
sedang dianalisis. Service menggunakan `OllamaEmbedder` dan konfigurasi model
yang sama dengan ingestion. Hasil berisi teks sumber, metadata, cosine
distance, serta similarity (`1 - distance`). Jika koleksi belum ada, kosong,
atau query tidak mengembalikan dokumen, `search()` menghasilkan daftar kosong.
Jika skema prefiks indeks tidak cocok dengan skema query, service gagal dengan
pesan yang meminta indeks dibangun ulang; ia tidak mencampur vektor berbeda.

```python
from retrieval_service import ReferenceSearchService

service = ReferenceSearchService()
references = service.search("akses ilegal ke sistem elektronik", top_k=5)
for reference in references:
    print(reference.text, reference.metadata, reference.similarity)
```

`top_k` harus integer positif dan klausul tidak boleh kosong.

## Verifikasi retrieval

```bash
.venv/bin/python backend/RAG/query.py "akses ilegal ke sistem elektronik tanpa hak" -k 3
.venv/bin/python backend/RAG/query.py "perlindungan data pribadi" -k 2
```

## Desain & pemenuhan acceptance criteria

1. **Parsing & chunking** — `parser.py` membersihkan teks lalu memecah per
   `Pasal`. Pasal yang panjang dipecah menjadi sub-chunk dengan overlap
   (`MAX_CHUNK_CHARS`, `CHUNK_OVERLAP_CHARS`) agar batas model embedding aman.

2. **Metadata lengkap** — tiap chunk menyimpan:
   `source_id`, `source_type`, `reference_type` (`pasal`/`penjelasan`),
   `document_title`, `document_number`, `jurisdiction`, `pasal`, `pasal_number`,
   `bab`, `bab_title`, `bagian`, `section` (batang tubuh vs penjelasan),
   `chunk_index`, `chunk_total`, `source_file`.

3. **Embedding konsisten** — hanya `nomic-embed-text:latest` dipakai, baik saat
   ingest maupun query. Nama model disimpan di metadata koleksi; `ingest.py`
   memperingatkan bila model berbeda dan menyediakan `--reset` untuk membangun
   ulang.

4. **Tersimpan & dapat diambil** — disimpan ke `PersistentClient` ChromaDB
   (jarak kosinus). `query.py` membuktikan retrieval mengembalikan dokumen +
   metadata + skor similarity.

5. **Idempoten (tanpa duplikasi liar)** — setiap chunk punya ID deterministik
   (`source_id|section|pasal|chunk_index#hash_isi`). Ingest ulang melakukan
   `upsert`, sehingga jumlah dokumen tetap. Opsi `--prune` menghapus sisa chunk
   lama ketika isi dokumen berubah.

## Menambah referensi baru

Untuk KUHP, UU PDP, atau standar keamanan: tambahkan cabang deteksi di
`parse_document()` pada `parser.py`. Dokumen teks dengan penanda `Pasal N`
sudah ditangani oleh parser UU generik. Pastikan `source_id` unik per dokumen
agar ID chunk dan opsi `--prune` bekerja per-sumber.
