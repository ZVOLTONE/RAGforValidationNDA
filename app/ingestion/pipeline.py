"""BE-06: orkestrasi ingestion (parse -> chunk -> metadata -> embed -> Chroma).

Idempotensi:
- `document_id` stabil dari nama file (atau `--document-id`), `chunk_id` =
  `<document_id>__c000`, `__c001`, ... mengikuti urutan dokumen.
- Perubahan isi dideteksi lewat sha256 file (disimpan di metadata tiap chunk).
- Ingest ulang tanpa perubahan: tidak ada embedding, tidak ada tulis ke Chroma.
- Dokumen berubah: chunk dokumen itu di-upsert, id lamanya yang tidak dipakai
  lagi dihapus. Dokumen lain tidak disentuh (filter `document_id` di query).
- Nama file sama tetapi isi berbeda = dokumen yang sama, isi diganti.
"""
from __future__ import annotations

import argparse
import hashlib
import re
import sys
from dataclasses import dataclass
from pathlib import Path

from app.config import COLLECTION, EMBED_MODEL
from app.ingestion.chunker import ChunkConfig, chunk_pages
from app.ingestion.embeddings import OllamaEmbedder, SetupError
from app.ingestion.metadata import DocumentMeta, chunk_metadata
from app.ingestion.parser import parse_pdf
from app.vectorstore.chroma import StoreConfig, VectorStore


def document_hash(path: str | Path) -> str:
    """sha256 isi file, untuk mendeteksi dokumen yang berubah."""
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for block in iter(lambda: handle.read(1 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def make_document_id(name: str) -> str:
    """id dokumen stabil dari nama file: 'UU 27-2022.pdf' -> 'uu-27-2022'."""
    slug = re.sub(r"[^a-z0-9]+", "-", Path(name).stem.lower()).strip("-")
    return slug or "document"


@dataclass
class IngestResult:
    document_id: str
    status: str          # created | updated | unchanged | empty
    chunk_count: int
    removed: int = 0     # chunk lama yang dihapus karena tidak dipakai lagi
    pages: int = 0


def ingest_pdf(path: str | Path, *, document_id: str | None = None, title: str = "",
               reference_type: str = "", store: VectorStore | None = None,
               embedder: OllamaEmbedder | None = None,
               config: ChunkConfig | None = None) -> IngestResult:
    """Masukkan satu PDF ke koleksi. Aman dijalankan berulang."""
    path = Path(path)
    doc_hash = document_hash(path)
    doc_id = document_id or make_document_id(path.name)
    pages = parse_pdf(path)
    chunks = chunk_pages(pages, doc_id, config or ChunkConfig())
    store = store or VectorStore()

    if not chunks:
        # Semua halaman kosong/gagal: jangan hapus apa pun dan jangan panggil model.
        return IngestResult(doc_id, "empty", 0, 0, len(pages))

    ids = [chunk.chunk_id for chunk in chunks]
    existing = store.document_chunks(doc_id)

    if existing and set(existing) == set(ids) and all(h == doc_hash for h in existing.values()):
        return IngestResult(doc_id, "unchanged", len(chunks), 0, len(pages))

    embedder = embedder or OllamaEmbedder()
    embedder.check()  # SetupError jelas kalau Ollama mati / model belum di-pull

    document = DocumentMeta(document_id=doc_id, source=path.name, title=title,
                            reference_type=reference_type, doc_hash=doc_hash)
    vectors = embedder.embed_documents([chunk.text for chunk in chunks])
    store.upsert(ids, [chunk.text for chunk in chunks],
                 [chunk_metadata(chunk, document) for chunk in chunks], vectors)

    stale = sorted(set(existing) - set(ids))
    store.delete(stale)
    return IngestResult(doc_id, "updated" if existing else "created",
                        len(chunks), len(stale), len(pages))


def search_chunks(query: str, *, k: int = 5, store: VectorStore | None = None,
                  embedder: OllamaEmbedder | None = None,
                  where: dict | None = None) -> list[dict]:
    """Cari chunk relevan (embed query dengan model yang sama, lalu query Chroma)."""
    store = store or VectorStore()
    embedder = embedder or OllamaEmbedder()
    return store.query(embedder.embed_query(query), k=k, where=where)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Ingest referensi hukum ke ChromaDB (BE-06).")
    parser.add_argument("pdf", nargs="*", help="file PDF yang di-ingest")
    parser.add_argument("--document-id", help="id dokumen (default: nama file)")
    parser.add_argument("--title", default="", help="judul resmi dokumen")
    parser.add_argument("--reference-type", default="", help="mis. UU, PP, NDA")
    parser.add_argument("--collection", default=COLLECTION)
    parser.add_argument("--db", help="folder ChromaDB (default dari config)")
    parser.add_argument("--model", default=EMBED_MODEL)
    parser.add_argument("--max-chars", type=int, default=1800)
    parser.add_argument("--overlap", type=int, default=0)
    parser.add_argument("--search", metavar="QUERY", help="cari chunk, tidak melakukan ingest")
    parser.add_argument("-k", type=int, default=5)
    args = parser.parse_args(argv)

    store_config = StoreConfig(collection=args.collection, embed_model=args.model,
                               **({"path": args.db} if args.db else {}))
    store = VectorStore(store_config)
    embedder = OllamaEmbedder(model=args.model)

    try:
        if args.search:
            hits = search_chunks(args.search, k=args.k, store=store, embedder=embedder)
            for hit in hits:
                meta = hit["metadata"]
                print(f"[{hit['distance']}] {meta.get('source_id')} "
                      f"hal {meta.get('page_start')}-{meta.get('page_end')} "
                      f"({meta.get('section') or '-'}):\n  {hit['text'][:200]}...")
            return 0

        if not args.pdf:
            parser.error("beri minimal satu PDF, atau pakai --search")

        config = ChunkConfig(max_chars=args.max_chars, overlap_chars=args.overlap)
        for pdf in args.pdf:
            result = ingest_pdf(pdf, document_id=args.document_id, title=args.title,
                                reference_type=args.reference_type, store=store,
                                embedder=embedder, config=config)
            print(f"{result.status}: {result.document_id} "
                  f"({result.chunk_count} chunk dari {result.pages} halaman"
                  + (f", {result.removed} chunk lama dihapus" if result.removed else "") + ")")
        print(f"Total isi koleksi '{args.collection}': {store.count()}")
        return 0
    except SetupError as exc:
        print(f"GAGAL: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
