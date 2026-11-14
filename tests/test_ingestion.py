"""Tes BE-06 (ingestion RAG). Ollama dipalsukan; Chroma memakai folder sementara."""

import hashlib

import pymupdf
import pytest

from app.document.extract import Page
from app.ingestion.chunker import ChunkConfig, chunk_pages
from app.ingestion.cleaner import clean_text
from app.ingestion.embeddings import OllamaEmbedder, SetupError
from app.ingestion.metadata import FIELDS, DocumentMeta, chunk_metadata
from app.ingestion.parser import parse_pdf, pages_with_text
from app.ingestion.pipeline import ingest_pdf, make_document_id, search_chunks
from app.vectorstore.chroma import StoreConfig, VectorStore

DIM = 8


def vec(text: str) -> list[float]:
    return [b / 255 for b in hashlib.sha256(text.encode("utf-8")).digest()[:DIM]]


class FakeEmbedder:
    """Embedding deterministik: teks sama -> vektor sama, tanpa jaringan."""

    def __init__(self) -> None:
        self.calls: list[list[str]] = []
        self.checked = 0

    def check(self) -> None:
        self.checked += 1

    def embed_documents(self, texts):
        self.calls.append(list(texts))
        return [vec(t) for t in texts]

    def embed_query(self, text):
        return vec(text)


@pytest.fixture
def store(tmp_path):
    return VectorStore(StoreConfig(path=str(tmp_path / "chroma"), collection="uji",
                                   embed_model="nomic-embed-text:latest"))


@pytest.fixture
def embedder():
    return FakeEmbedder()


def make_pdf(path, lines) -> str:
    with pymupdf.open() as pdf:
        page = pdf.new_page()
        for i, line in enumerate(lines):
            page.insert_text((72, 72 + i * 20), line)
        pdf.save(path)
    return str(path)


LAW = [
    "BAB I",
    "KETENTUAN UMUM",
    "Pasal 1",
    "(1) Setiap pihak wajib menjaga kerahasiaan informasi yang diterimanya.",
    "(2) Kewajiban ini berlaku selama perjanjian masih berjalan.",
    "Pasal 2",
    "(1) Pelaporan insiden dilakukan paling lambat tiga hari kerja.",
]


def test_parse_pdf_uses_existing_extractor(tmp_path) -> None:
    pdf = make_pdf(tmp_path / "uu.pdf", LAW)
    pages = parse_pdf(pdf)
    assert isinstance(pages, list) and pages
    assert all(isinstance(p, Page) for p in pages)
    assert pages[0].method == "pdf_text"
    assert "Pasal 1" in pages[0].text


def test_failed_page_does_not_discard_document(tmp_path, monkeypatch, store, embedder) -> None:
    pages = [
        Page(1, "failed", "OCR error", "", [], None, True, "RuntimeError: tesseract"),
        Page(2, "pdf_text", "teks digital", "Pasal 1\n(1) Isi pasal yang sah.", [], None, False, None),
    ]
    monkeypatch.setattr("app.ingestion.pipeline.parse_pdf", lambda path: pages)
    assert len(pages_with_text(pages)) == 1

    pdf = make_pdf(tmp_path / "sebagian.pdf", LAW)
    result = ingest_pdf(pdf, document_id="sebagian", store=store, embedder=embedder)

    assert result.status == "created"
    assert result.chunk_count >= 1
    assert "Isi pasal yang sah" in embedder.calls[0][0]


def test_clean_keeps_numbering_and_drops_page_artifacts() -> None:
    raw = "Pasal 1\n(1)   Isi   pasal.\n- 7 -\nHalaman 7 dari 76\na. huruf kecil\n\n\n\n(2) Ayat dua."
    cleaned = clean_text(raw)

    assert "Pasal 1" in cleaned
    assert "(1) Isi pasal." in cleaned
    assert "a. huruf kecil" in cleaned
    assert "(2) Ayat dua." in cleaned
    assert "- 7 -" not in cleaned and "Halaman 7" not in cleaned
    assert "   " not in cleaned


def test_chunk_keeps_original_text(tmp_path) -> None:
    page = Page(1, "pdf_text", "uji", "Pasal 1\n(1)  Isi   pasal.", [], None, False, None)
    chunks = chunk_pages([page], "dok")
    assert chunks[0].text == "Pasal 1\n(1) Isi pasal."
    assert chunks[0].original_text == "Pasal 1\n(1)  Isi   pasal."


def test_multiple_chunks_and_no_text_loss(tmp_path) -> None:
    pdf = make_pdf(tmp_path / "uu.pdf", LAW)
    pages = parse_pdf(pdf)
    chunks = chunk_pages(pages, "uu", ChunkConfig(max_chars=90))

    assert len(chunks) > 1
    assert "\n".join(c.text for c in chunks).replace("\n", " ").split() == \
           pages[0].text.replace("\n", " ").split()          # tidak ada teks hilang/ganda
    assert all(c.chunk_index == i for i, c in enumerate(chunks))


def test_chunk_boundaries_stay_on_clauses() -> None:
    pdf_pages = [Page(1, "pdf_text", "uji",
                      "Pasal 1\n(1) Satu ayat penuh.\n(2) Dua ayat penuh.\nPasal 2\n(1) Tiga ayat penuh.",
                      [], None, False, None)]
    chunks = chunk_pages(pdf_pages, "dok", ChunkConfig(max_chars=45))

    assert len(chunks) > 1
    for chunk in chunks[:-1]:
        assert chunk.text.rstrip().endswith(".")   # berhenti di ujung klausul, bukan tengah kalimat
        assert not chunk.text.endswith("(")


def test_chunk_ids_are_stable() -> None:
    pages = [Page(1, "pdf_text", "uji", LAW[2] + "\n" + "\n".join(LAW[3:]), [], None, False, None)]
    first = chunk_pages(pages, "uu-27-2022")
    second = chunk_pages(pages, "uu-27-2022")

    assert [c.chunk_id for c in first] == [c.chunk_id for c in second]
    assert first[0].chunk_id == "uu-27-2022__c000"
    assert len({c.chunk_id for c in first}) == len(first)


def test_metadata_is_complete_and_chroma_safe() -> None:
    pages = [Page(4, "ocr", "scan", "Pasal 9\n(1) Ketentuan penutup yang berlaku umum.", [], 88.0, False, None)]
    chunks = chunk_pages(pages, "uu", ChunkConfig(max_chars=50))
    doc = DocumentMeta(document_id="uu", source="uu.pdf", title="UU Uji",
                       reference_type="UU", doc_hash="abc123")
    meta = chunk_metadata(chunks[0], doc)

    assert set(FIELDS) <= set(meta)
    for key, value in meta.items():
        assert isinstance(value, (str, int, float, bool)) and value is not None
    assert meta["page_start"] == 4 and meta["page_end"] == 4
    assert meta["section"] == "Pasal 9"
    assert meta["source_id"] == meta["document_id"] == "uu"
    assert meta["doc_hash"] == "abc123"


class FakeSession:
    def __init__(self, models, embedding=None):
        self.models = models
        self.embedding = embedding or [[0.1, 0.2]]
        self.posts = []

    def get(self, url, timeout=None):
        models = self.models

        class Response:
            def raise_for_status(self): pass
            def json(self): return {"models": [{"name": m} for m in models]}

        return Response()

    def post(self, url, json=None, timeout=None):
        self.posts.append(json)
        embedding = self.embedding

        class Response:
            def raise_for_status(self): pass
            def json(self): return {"embeddings": embedding}

        return Response()


def test_ollama_embedder_prefixes_and_checks_model() -> None:
    session = FakeSession(models=["nomic-embed-text:latest"], embedding=[[0.1, 0.2], [0.3, 0.4]])
    embedder = OllamaEmbedder(model="nomic-embed-text:latest", url="http://uji:11434",
                              doc_prefix="search_document: ", query_prefix="search_query: ",
                              session=session)
    embedder.check()
    assert embedder.embed_documents(["satu", "dua"]) == [[0.1, 0.2], [0.3, 0.4]]
    assert session.posts[0]["input"] == ["search_document: satu", "search_document: dua"]
    assert session.posts[0]["model"] == "nomic-embed-text:latest"


def test_ollama_embedder_reports_missing_model() -> None:
    embedder = OllamaEmbedder(model="nomic-embed-text:latest", url="http://uji:11434",
                              session=FakeSession(models=["llama3"]))
    with pytest.raises(SetupError, match="ollama pull nomic-embed-text:latest"):
        embedder.check()


def test_ollama_embedder_reports_unreachable_server() -> None:
    class Dead:
        def get(self, url, timeout=None):
            raise RuntimeError("connection refused")

    with pytest.raises(SetupError, match="Ollama tidak bisa dihubungi"):
        OllamaEmbedder(url="http://uji:11434", session=Dead()).check()


def test_ingest_stores_and_retrieves_with_metadata(tmp_path, store, embedder) -> None:
    pdf = make_pdf(tmp_path / "UU 27-2022.pdf", LAW)
    result = ingest_pdf(pdf, title="UU PDP", reference_type="UU", store=store, embedder=embedder)

    assert result.status == "created"
    assert result.document_id == "uu-27-2022" == make_document_id("UU 27-2022.pdf")
    assert store.count() == result.chunk_count
    assert embedder.checked == 1

    expected = chunk_pages(parse_pdf(pdf), result.document_id)
    hits = search_chunks(expected[0].text, k=2, store=store, embedder=embedder)

    assert hits[0]["id"] == expected[0].chunk_id
    meta = hits[0]["metadata"]
    assert meta["document_id"] == "uu-27-2022"
    assert meta["title"] == "UU PDP"
    assert meta["reference_type"] == "UU"
    assert meta["source"] == "UU 27-2022.pdf"
    assert meta["page_start"] == 1
    assert "Pasal" in hits[0]["text"]


def test_reingest_unchanged_is_noop(tmp_path, store, embedder) -> None:
    pdf = make_pdf(tmp_path / "uu.pdf", LAW)
    ingest_pdf(pdf, document_id="uu", store=store, embedder=embedder)
    before = store.count()
    calls = len(embedder.calls)

    again = ingest_pdf(pdf, document_id="uu", store=store, embedder=embedder)

    assert again.status == "unchanged"
    assert store.count() == before
    assert len(embedder.calls) == calls      # tidak ada embedding ulang, tidak ada duplikat


def test_modified_document_replaces_its_stale_chunks(tmp_path, store, embedder) -> None:
    pdf = make_pdf(tmp_path / "uu.pdf", LAW)
    config = ChunkConfig(max_chars=80)
    first = ingest_pdf(pdf, document_id="uu", store=store, embedder=embedder, config=config)
    assert first.chunk_count > 1
    old_ids = set(store.document_chunks("uu"))

    make_pdf(tmp_path / "uu.pdf", ["Pasal 1", "(1) Satu pasal saja setelah revisi."])
    second = ingest_pdf(pdf, document_id="uu", store=store, embedder=embedder, config=config)

    assert second.status == "updated"
    assert second.chunk_count == 1
    assert store.count() == 1                       # chunk lama dibersihkan
    assert set(store.document_chunks("uu")) == {"uu__c000"}
    assert not (old_ids - {"uu__c000"}) & set(store.document_chunks("uu"))


def test_other_documents_are_untouched(tmp_path, store, embedder) -> None:
    a = make_pdf(tmp_path / "a.pdf", LAW)
    b = make_pdf(tmp_path / "b.pdf", ["Pasal 5", "(1) Dokumen lain yang tidak boleh berubah."])
    ingest_pdf(a, document_id="dok-a", store=store, embedder=embedder)
    ingest_pdf(b, document_id="dok-b", store=store, embedder=embedder)
    b_before = store.document_chunks("dok-b")
    a_before = store.document_chunks("dok-a")
    total_before = store.count()

    make_pdf(tmp_path / "a.pdf", ["Pasal 1", "(1) Dokumen A sudah direvisi seluruhnya."])
    ingest_pdf(a, document_id="dok-a", store=store, embedder=embedder)

    assert store.document_chunks("dok-b") == b_before      # dokumen lain tidak tersentuh
    assert store.count() == total_before                   # tidak ada chunk liar/tambahan
    assert store.document_chunks("dok-a") != a_before      # isi dokumen A terganti


def test_empty_extraction_writes_nothing(tmp_path, store, embedder) -> None:
    with pymupdf.open() as pdf:
        pdf.new_page()                              # halaman kosong: tidak ada teks
        pdf.save(tmp_path / "kosong.pdf")

    result = ingest_pdf(tmp_path / "kosong.pdf", document_id="kosong", store=store, embedder=embedder)

    assert result.status == "empty"
    assert result.chunk_count == 0
    assert store.count() == 0
    assert embedder.checked == 0 and embedder.calls == []


def test_store_reopens_persistently(tmp_path, embedder) -> None:
    path = str(tmp_path / "chroma")
    config = StoreConfig(path=path, collection="uji", embed_model="nomic-embed-text:latest")
    pdf = make_pdf(tmp_path / "uu.pdf", LAW)
    ingest_pdf(pdf, document_id="uu", store=VectorStore(config), embedder=embedder)

    reopened = VectorStore(config)
    assert reopened.count() == 1
    assert set(reopened.document_chunks("uu")) == {"uu__c000"}


def test_collection_refuses_mixed_embedding_models(tmp_path) -> None:
    path = str(tmp_path / "chroma")
    VectorStore(StoreConfig(path=path, collection="uji", embed_model="model-a")).collection
    with pytest.raises(ValueError, match="satu model"):
        VectorStore(StoreConfig(path=path, collection="uji", embed_model="model-b")).collection
