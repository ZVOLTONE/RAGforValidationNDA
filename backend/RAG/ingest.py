"""Orchestrator pipeline ingestion referensi hukum & keamanan siber.

Alur (sesuai PRD section 8.3 - RAG Indexing):
  1. Muat dokumen referensi yang telah dikurasi.
  2. Parsing + pembersihan teks.
  3. Pecah dokumen per Pasal/bagian (chunking).
  4. Tambahkan metadata sumber.
  5. Buat embedding dengan nomic-embed-text:latest (konsisten).
  6. Simpan embedding + metadata ke ChromaDB.

Idempotensi:
  Setiap chunk punya ID deterministik (hash dari identitas sumber + lokasi
  struktur + indeks sub-chunk + hash isi teks). Menjalankan ulang ingestion
  akan melakukan upsert pada ID yang sama, sehingga tidak terjadi duplikasi
  yang tidak terkendali. Jika isi teks berubah, hash isi berubah -> dianggap
  chunk baru; chunk lama yang sudah tidak ada dapat dibersihkan dengan opsi
  --prune.

Penjagaan konsistensi embedding:
  Nama model embedding disimpan di metadata koleksi. Bila model berubah,
  pipeline memberi peringatan dan (dengan --reset) membangun ulang koleksi,
  sesuai FR-04 ("Perubahan model embedding ditangani dengan pembuatan ulang").
"""

from __future__ import annotations

import argparse
import hashlib
import sys
from pathlib import Path

import chromadb
from chromadb.config import Settings

import config
from embeddings import OllamaEmbedder
from parser import Chunk, parse_document


def _stable_id(meta: dict, text: str) -> str:
    """ID deterministik untuk satu chunk.

    Menggabungkan identitas sumber + lokasi struktural + indeks sub-chunk,
    lalu menambahkan sidik jari isi teks. Dengan ini, ingest ulang atas
    dokumen yang sama menghasilkan ID identik (upsert, tanpa duplikasi).
    """
    loc = "|".join(
        str(meta.get(k, ""))
        for k in ("source_id", "section", "pasal", "chunk_index")
    )
    content_hash = hashlib.sha1(text.encode("utf-8")).hexdigest()[:12]
    return f"{loc}#{content_hash}"


def get_collection(client: chromadb.ClientAPI, reset: bool):
    """Ambil (atau buat ulang) koleksi ChromaDB.

    Metadata koleksi menyimpan nama model embedding agar konsistensi
    terpantau. Jarak kosinus dipakai (cocok untuk similarity teks).
    """
    name = config.CHROMA_COLLECTION
    if reset:
        try:
            client.delete_collection(name)
            print(f"[reset] Koleksi '{name}' dihapus.")
        except Exception:
            pass

    collection = client.get_or_create_collection(
        name=name,
        metadata={
            "hnsw:space": "cosine",
            "embedding_model": config.MODEL_NAME,
            "embedding_scheme": config.EMBEDDING_SCHEME,
            "description": "Referensi hukum & keamanan siber untuk ConfidAI RAG",
        },
    )

    # Peringatan konsistensi model.
    existing_model = (collection.metadata or {}).get("embedding_model")
    existing_scheme = (collection.metadata or {}).get("embedding_scheme", "legacy_unprefixed")
    if existing_model and existing_model != config.MODEL_NAME:
        print(
            f"[WARNING] Koleksi dibuat dengan model '{existing_model}' "
            f"namun config memakai '{config.MODEL_NAME}'. "
            f"Jalankan ulang dengan --reset untuk membangun ulang embedding."
        )
    if collection.count() and existing_scheme != config.EMBEDDING_SCHEME:
        raise RuntimeError(
            f"Koleksi memakai embedding scheme '{existing_scheme}', sedangkan konfigurasi memakai "
            f"'{config.EMBEDDING_SCHEME}'. Untuk menghindari vektor campuran, bangun indeks baru "
            "atau jalankan ingestion dengan --reset setelah memastikan backup koleksi tersedia."
        )
    return collection


def ingest_file(
    collection,
    embedder: OllamaEmbedder,
    file_path: Path,
    batch_size: int = 32,
    offset: int = 0,
    limit: int | None = None,
) -> list[str]:
    """Parse, embed, dan simpan satu berkas. Mengembalikan daftar ID chunk."""
    print(f"\n== Memproses: {file_path.name} ==")
    chunks: list[Chunk] = parse_document(
        file_path, config.MAX_CHUNK_CHARS, config.CHUNK_OVERLAP_CHARS
    )
    print(f"  Chunk dihasilkan: {len(chunks)}")
    if not chunks:
        print("  (tidak ada chunk, lewati)")
        return []

    end = None if limit is None else offset + limit
    chunks = chunks[offset:end]
    if not chunks:
        print(f"  (tidak ada chunk pada rentang offset={offset}, limit={limit})")
        return []
    print(f"  Rentang chunk: offset={offset}, jumlah={len(chunks)}")

    ids = [_stable_id(c.metadata, c.text) for c in chunks]

    # Deduplikasi dalam satu batch bila ada ID identik (teks persis sama).
    seen: dict[str, int] = {}
    for idx, _id in enumerate(ids):
        if _id in seen:
            # Buat unik dengan menambahkan offset indeks asli.
            ids[idx] = f"{_id}-{idx}"
        seen[ids[idx]] = idx

    all_ids: list[str] = []
    total = len(chunks)
    for start in range(0, total, batch_size):
        batch = chunks[start : start + batch_size]
        batch_ids = ids[start : start + batch_size]
        texts = [c.text for c in batch]
        metas = [c.metadata for c in batch]

        vectors = embedder.embed_many(texts)

        # Upsert: idempoten terhadap ID yang sama.
        collection.upsert(
            ids=batch_ids,
            embeddings=vectors,
            documents=texts,
            metadatas=metas,
        )
        all_ids.extend(batch_ids)
        print(f"  Disimpan {min(start + batch_size, total)}/{total} chunk")

    return all_ids


def prune_stale(collection, source_id: str, keep_ids: set[str]) -> int:
    """Hapus chunk lama dari source_id yang tidak lagi ada di keep_ids.

    Mencegah akumulasi sisa ketika isi dokumen berubah pada ingest ulang.
    """
    existing = collection.get(where={"source_id": source_id})
    existing_ids = existing.get("ids", [])
    stale = [i for i in existing_ids if i not in keep_ids]
    if stale:
        collection.delete(ids=stale)
        print(f"[prune] Menghapus {len(stale)} chunk usang untuk source_id={source_id}")
    return len(stale)


def main() -> int:
    ap = argparse.ArgumentParser(description="Ingestion referensi hukum ke ChromaDB")
    ap.add_argument(
        "files",
        nargs="*",
        help="Berkas referensi (.txt). Default: UU_Nomor_11_Tahun_2008.txt",
    )
    ap.add_argument(
        "--reset",
        action="store_true",
        help="Hapus & bangun ulang koleksi (mis. saat ganti model embedding).",
    )
    ap.add_argument(
        "--prune",
        action="store_true",
        help="Hapus chunk usang dari source yang sama setelah ingest.",
    )
    ap.add_argument("--offset", type=int, default=0, help="Lewati N chunk awal (untuk melanjutkan proses panjang).")
    ap.add_argument("--limit", type=int, default=None, help="Maksimum chunk yang diproses pada proses ini.")
    args = ap.parse_args()

    print("Konfigurasi:")
    print(config.summary())

    files = args.files or [str(config.PROJECT_ROOT / "UU_Nomor_11_Tahun_2008.txt")]
    paths = [Path(f) for f in files]
    for p in paths:
        if not p.exists():
            print(f"[ERROR] Berkas tidak ditemukan: {p}")
            return 1

    # Verifikasi Ollama & model sebelum mulai (gagal cepat).
    embedder = OllamaEmbedder()
    embedder.health_check()
    print(f"\n[ok] Ollama siap, model embedding: {embedder.model}")

    client = chromadb.PersistentClient(
        path=config.CHROMA_PERSIST_DIR,
        settings=Settings(anonymized_telemetry=False, allow_reset=True),
    )
    collection = get_collection(client, reset=args.reset)

    # Kelompokkan ID yang dihasilkan per source_id untuk opsi prune.
    produced_by_source: dict[str, set[str]] = {}
    for path in paths:
        produced = ingest_file(collection, embedder, path, offset=args.offset, limit=args.limit)
        # Ambil source_id dari chunk pertama via metadata koleksi.
        if produced:
            rec = collection.get(ids=[produced[0]])
            src = rec["metadatas"][0]["source_id"]
            produced_by_source.setdefault(src, set()).update(produced)

    if args.prune:
        for src, keep in produced_by_source.items():
            prune_stale(collection, src, keep)

    total = collection.count()
    print(f"\n[selesai] Total dokumen di koleksi '{config.CHROMA_COLLECTION}': {total}")
    print(f"Lokasi persisten: {config.CHROMA_PERSIST_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
