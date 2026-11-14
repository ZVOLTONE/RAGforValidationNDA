"""BE-06 tahap C: potong dokumen jadi chunk di batas hukum.

Batas diambil dari BE-05 (`split_clauses`), bukan regex baru: klausul sudah
dipisah per Pasal/ayat/huruf dan teksnya tidak berubah. Chunk = gabungan
beberapa klausul berurutan sampai `max_chars`, jadi tidak ada potongan di
tengah kalimat dan tidak ada teks yang hilang/ganda.

Pilihan ukuran: 1800 karakter (default, sama dengan loader lama) kira-kira satu
halaman; cukup besar untuk memuat satu Pasal beserta ayatnya, cukup kecil untuk
retrieval yang presisi. `overlap_chars` default 0 supaya teks tidak diduplikasi;
kalau diisi >0, potongan konteks tadi memang sengaja diulang di chunk berikutnya.
"""
from __future__ import annotations

from dataclasses import dataclass

from app.clause_splitter import split_clauses
from app.ingestion.cleaner import clean_text

HEADING_TYPES = {"bab", "bagian", "paragraf", "pasal"}


@dataclass(frozen=True)
class ChunkConfig:
    max_chars: int = 1800
    overlap_chars: int = 0


@dataclass
class Chunk:
    chunk_id: str
    text: str                 # teks bersih (yang di-embed)
    original_text: str        # teks apa adanya dari ekstraksi
    page_start: int
    page_end: int
    section: str | None       # "Pasal N" bila ada, kalau tidak "BAB ..." atau None
    chunk_index: int


def _sections(clauses) -> dict[str, str | None]:
    """Label bagian untuk tiap klausul: Pasal terdekat, lalu BAB, kalau tidak ada None."""
    by_id = {clause.clause_id: clause for clause in clauses}
    labels: dict[str, str | None] = {}
    for clause in clauses:
        label: str | None = None
        current = clause
        while current is not None:
            if current.clause_type == "pasal" and current.clause_number:
                label = current.clause_number
                break
            if current.clause_type == "bab" and current.clause_number:
                label = current.clause_number
                break
            current = by_id.get(current.parent_clause_id) if current.parent_clause_id else None
        labels[clause.clause_id] = label
    return {clause.clause_id: labels[clause.clause_id] for clause in clauses}


def _overlap_tail(text: str, limit: int) -> str:
    """Ambil ekor teks sepanjang <= limit tanpa memotong kata."""
    if limit <= 0 or not text:
        return ""
    tail = text[-limit:]
    if " " in tail:
        tail = tail.split(" ", 1)[1]
    return tail


def chunk_clauses(clauses, document_id: str, config: ChunkConfig | None = None) -> list[Chunk]:
    """Gabungkan klausul berurutan menjadi chunk; tiap klausul masuk tepat sekali."""
    config = config or ChunkConfig()
    sections = _sections(clauses)
    chunks: list[Chunk] = []

    # (teks asli, teks bersih, section, halaman, jenis klausul)
    buffer: list[tuple[str, str, str | None, list[int], str]] = []
    size = 0

    def flush() -> None:
        nonlocal buffer, size
        if not buffer:
            return
        pages = [page for _, _, _, page_numbers, _ in buffer for page in page_numbers]
        text = "\n".join(cleaned for _, cleaned, _, _, _ in buffer)
        original = "\n".join(raw for raw, _, _, _, _ in buffer)
        index = len(chunks)
        if chunks and config.overlap_chars:
            prefix = _overlap_tail(chunks[-1].text, config.overlap_chars)
            if prefix:
                text = f"{prefix}\n{text}"
        chunks.append(
            Chunk(
                chunk_id=f"{document_id}__c{index:03d}",
                text=text,
                original_text=original,
                page_start=min(pages) if pages else 0,
                page_end=max(pages) if pages else 0,
                section=buffer[0][2],
                chunk_index=index,
            )
        )
        buffer = []
        size = 0

    def add(entry) -> None:
        nonlocal size
        buffer.append(entry)
        size += (1 if size else 0) + len(entry[1])

    for clause in clauses:
        cleaned = clean_text(clause.text)
        if not cleaned.strip():
            continue                      # hanya baris kosong; tidak ada isi yang hilang
        entry = ((clause.text or "").strip("\n"), cleaned, sections.get(clause.clause_id),
                 list(clause.page_numbers), clause.clause_type)
        if buffer and size + 1 + len(cleaned) > config.max_chars:
            held = []
            # judul (Pasal/BAB) jangan berpisah dari isinya: pindahkan ke chunk berikutnya
            while len(buffer) > 1 and buffer[-1][4] in HEADING_TYPES:
                held.insert(0, buffer.pop())
            flush()
            for item in held:
                add(item)
        add(entry)

    flush()
    return chunks


def chunk_pages(pages, document_id: str, config: ChunkConfig | None = None) -> list[Chunk]:
    """Chunk langsung dari keluaran ekstraksi (BE-03/BE-04) untuk satu dokumen."""
    return chunk_clauses(split_clauses(pages, document_id=document_id), document_id, config)
