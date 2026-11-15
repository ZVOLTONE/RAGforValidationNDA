# Status Requirement RAG — ConfidAI

Tanggal audit: 14 November 2026

Dokumen ini membedakan requirement yang sudah benar-benar diverifikasi dari
fitur yang masih berupa rencana atau belum menjadi bagian dari implementasi
RAG aktif.

## Ringkasan

Core RAG untuk tiga dokumen di folder `UU` sudah selesai dan dapat digunakan:

| Sumber | Chunk | Status |
|---|---:|---|
| `UU/UU_Nomor_11_Tahun_2008.md` | 111 | Selesai |
| `UU/uu-27-2022.md` | 156 | Selesai |
| `UU/KITAB_UNDANG-UNDANG_HUKUM_PERDATA.md` | 2.023 | Selesai |
| **Total** | **2.290** | **Selesai** |

Koleksi aktif: `backend/RAG/chroma_store/legal_security_references_nomic_prefixed_v1`
dengan model `nomic-embed-text:latest` dan prefiks task khusus Nomic. Semua
2.290 ID embedding unik; koleksi baseline `legal_security_references` tetap
disimpan sebagai cadangan.

## Requirement yang sudah selesai

| Requirement | Implementasi / bukti |
|---|---|
| Parsing dokumen hukum | `parser.py` mendukung teks polos dan Markdown heading (`BAB`, `Pasal`, `PENJELASAN`). |
| Segmentasi per pasal | Pasal panjang dipecah menjadi chunk maksimal 1.800 karakter dengan overlap 200 karakter. |
| Pemisahan batang tubuh dan penjelasan | Metadata `section` bernilai `batang_tubuh` atau `penjelasan`. |
| Identitas sumber | `source_id` terpisah: `UU_11_2008`, `UU_27_2022`, dan `KUH_PERDATA`. |
| Metadata chunk | Menyimpan sumber, judul, nomor pasal, BAB, bagian, section, indeks chunk, dan nama file. |
| Embedding | Ollama aktif; `nomic-embed-text:latest` memakai prefiks `search_document:` saat ingest dan `search_query:` saat retrieval. |
| Vector database | ChromaDB persistent aktif pada `backend/RAG/chroma_store`. |
| Idempotensi | ID deterministik dan `upsert` digunakan saat ingestion. |
| Retrieval baseline | `retrieval_service.py` dan `query.py` mengembalikan teks, metadata, distance, dan similarity. |
| Pasal hukum yang dapat ditelusuri | Analisis menggunakan pemetaan risiko terkurasi lalu mengambil teks pasal tepat dari metadata `source_id` + `pasal_number`; finding menyimpan kutipan, applicability, sumber, dan chunk ID. |
| Validasi koleksi | Chroma count = 2.290; jumlah ID unik = 2.290; metadata model sudah tersimpan. |

## Requirement yang masih sebagian

### 1. Cakupan referensi hukum

PRD menyebut KUHP, UU ITE beserta perubahan, dan UU PDP. Folder `UU` yang
tersedia saat ini berisi:

- KUH Perdata — bukan KUHP;
- UU ITE Nomor 11 Tahun 2008;
- UU PDP Nomor 27 Tahun 2022.

Dengan demikian, tiga file yang disiapkan pengguna sudah di-ingest, tetapi
cakupan legal yang tertulis di PRD belum lengkap. UU ITE perubahan dan KUHP
belum ada di koleksi aktif.

### 2. Metode retrieval

Pencarian top-k bebas masih memakai vector search. Pasal yang ditempelkan ke
finding memakai lookup metadata terkurasi agar hasil tetangga semantik yang
keliru tidak ditampilkan sebagai dasar hukum. Belum tersedia di
`RAG/retrieval_service.py`:

- BM25;
- hybrid retrieval/vector + BM25;
- RRF untuk menggabungkan ranking;
- reranking;
- filter `source_id` pada API service;
- ambang similarity minimum.

Fitur ini belum menghalangi baseline RAG, tetapi dibutuhkan untuk target
relevansi retrieval yang lebih kuat di PRD.

### 3. Evaluasi retrieval

Smoke test sudah berhasil untuk topik data pribadi, perjanjian, dan informasi
elektronik. Namun belum ada evaluasi terukur Recall@k/Precision@k untuk semua
tiga sumber dalam folder `UU`. Dataset evaluasi yang tersedia di `Clone`
berfokus pada UU PDP dan belum menjadi test suite aktif proyek ini.

Setelah prefiks Nomic dibetulkan, smoke query data pribadi lintas negara
mengembalikan chunk UU PDP dan UU ITE, tetapi ranking top-3 masih mencampur
konteks yang kurang tepat. Hasil ini bukan bukti Recall@k; gold set dan evaluasi
ranking tetap diperlukan.

### 4. Konsistensi model embedding

Nama model disimpan dan perbedaan model diberi warning. Sistem belum memblokir
query atau ingestion ketika model koleksi berbeda. Saat mengganti model,
operator masih harus menjalankan `--reset` secara manual.

### 5. Metadata lokasi halaman

Dokumen sumber berupa Markdown sehingga metadata `page_number` tidak tersedia.
Lokasi yang tersedia saat ini adalah nama file, BAB, bagian, section, dan
nomor pasal. Nomor halaman harus ditambahkan apabila sumber PDF resmi ikut
dimasukkan.

## Requirement yang belum diimplementasikan

- HYDE; di PRD memang belum diwajibkan untuk MVP.
- Reranker khusus hukum.
- Referensi standar keamanan siber selain sumber UU.
- Kontrol akses/enkripsi khusus untuk koleksi ChromaDB.
- Retensi dan penghapusan otomatis untuk embedding.
- Dashboard monitoring kualitas retrieval.
- Evaluasi otomatis tiga sumber dengan gold set yang ditinjau manusia.

## Cara memverifikasi koleksi

Jalankan perintah berikut dari root repository:

```bash
.venv/bin/python - <<'PY'
import chromadb
from chromadb.config import Settings

client = chromadb.PersistentClient(
    path="/home/zvolt/NDACyberSec/backend/RAG/chroma_store",
    settings=Settings(anonymized_telemetry=False),
)
collection = client.get_collection("legal_security_references")
print(collection.count())
print(collection.metadata)
PY

.venv/bin/python backend/RAG/query.py "perlindungan data pribadi dan kewajiban prosesor" -k 5
.venv/bin/python backend/RAG/query.py "perjanjian dan kewajiban para pihak" -k 5
.venv/bin/python backend/RAG/query.py "informasi elektronik dan sistem elektronik" -k 5
```

## Kesimpulan

RAG ingestion dan vector retrieval baseline untuk tiga dokumen yang disiapkan
sudah selesai. Prefiks Nomic kini konsisten pada koleksi baru dan koleksi lama
dipertahankan sebagai cadangan. RAG belum dapat disebut memenuhi seluruh requirement PRD sampai
cakupan hukum diperluas dan evaluasi retrieval serta hybrid retrieval selesai.

Prioritas lanjutan yang disarankan:

1. Tambahkan KUHP dan UU ITE perubahan yang sudah diverifikasi.
2. Implementasikan BM25 + hybrid RRF.
3. Buat test set untuk tiga sumber dan ukur Recall@5.
4. Tambahkan filter sumber dan validasi model embedding otomatis.

## Smoke test prototype

Pada `backend/samples/File Input/sample_NDA.pdf`:

- PDF terbaca: 3 halaman;
- semua halaman berhasil diekstrak tanpa OCR;
- 3 klausul berhasil dibuat;
- API upload mengembalikan HTTP 202 dan `job_id`;
- job fallback berhasil menjadi `completed`;
- 3 finding tersimpan;
- laporan PDF berhasil dibuat dan diunduh (5.274 byte).

Inferensi Qwen melalui Ollama juga tersedia, tetapi model lokal membutuhkan
waktu cukup lama. API membatasi konteks klausul dan memiliki fallback
`inconclusive` agar job tetap menghasilkan output yang aman ketika model gagal
atau timeout.
