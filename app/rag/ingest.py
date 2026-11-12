from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass

import pymupdf
import requests

from app.config import CHROMA_DB, COLLECTION, DOC_PREFIX, EMBED_MODEL, OLLAMA_URL

MAX_CHARS = 1800

PASAL = re.compile(r"^[ \t]*Pasa[lI1J7|]?[ \t]*([0-9IlOTZVXLCDM]{1,4}[A-HJ-NP-SU-Y]?)[ \t]*$", re.M)
BAB = re.compile(r"^\s*BAB\s+([IVXLCDM1l]+)\s*$", re.M)
PENJELASAN = re.compile(r"^\s*PENJE\S{1,3}ASAN\b", re.M)
ROMAN = re.compile(r"[IVXLCDM]+")
CLOSING = re.compile(r"^\s*Agar\b", re.M)
NOISE = re.compile(
    r"^\s*("
    r"SK\s*No\.?\s*[0-9A-Za-z ]{3,}"
    r"|[PF]R[EI]S[IlL]DEN"
    r"|RE\S{2,9}\s+IN\S{3,8}"
    r"|Pasa[l1I]?"
    r"|-?\s*[0-9tlILO]{1,3}\s*-"
    r"|\d{1,3}"
    r"|.{1,45}(\.\s*){3}"
    r")\s*$")
CUKUP = re.compile(r"C\w{1,3}p\s*jelas\.?", re.I)


def is_cukup_jelas(body: str) -> bool:
    rest = body.split("\n", 1)[1] if "\n" in body else ""
    rest = re.sub(r"(Ayat|Huruf)\s*\S+", " ", rest)
    rest = CUKUP.sub(" ", rest)
    return len(re.sub(r"[\W_]", "", rest)) < 15


def fix_ocr_text(text: str) -> str:
    text = re.sub(r"\(([lI])\)", "(1)", text)
    text = re.sub(r"\((\d)[lI1]\B", r"(\1)", text)
    text = re.sub(r"(?m)^l(\d)l(?=\s)", r"(\1)", text)
    return text


def norm_pasal(raw: str, roman: bool) -> str | None:
    if roman and ROMAN.fullmatch(raw):
        return raw
    m = re.fullmatch(r"([0-9IlOTZ]+)([A-HJ-NP-SU-Y]?)", raw)
    if not m or not re.search(r"\d", m.group(1) + ("1" if m.group(1) in ("I", "l") else "")):
        return None
    num = m.group(1).translate(str.maketrans({"I": "1", "l": "1", "O": "0", "T": "7", "Z": "2"}))
    return str(int(num)) + m.group(2)


def _num(p: str) -> int:
    d = re.match(r"\d+", p)
    return int(d.group()) if d else -1
AYAT = re.compile(r"(?m)^\s*\((\d+)\)\s")
PAGE_MARK = "\n<<<HAL {}>>>\n"
PAGE_RE = re.compile(r"<<<HAL (\d+)>>>")


def extract_pages(path: str) -> list[tuple[int, str, str]]:
    out = []
    with pymupdf.open(path) as doc:
        for i, page in enumerate(doc, start=1):
            text = page.get_text("text")
            if len(text.strip()) >= 40:
                out.append((i, text, "pdf_text"))
                continue
            import io
            import pytesseract
            from PIL import Image
            img = Image.open(io.BytesIO(page.get_pixmap(dpi=300).tobytes("png")))
            langs = "ind" if "ind" in pytesseract.get_languages() else "eng"
            out.append((i, pytesseract.image_to_string(img, lang=langs), f"ocr_{langs}"))
    return out


def clean(pages: list[tuple[int, str, str]]) -> str:
    from collections import Counter
    counts = Counter()
    for _, t, _ in pages:
        counts.update({l.strip() for l in t.splitlines() if l.strip()})
    n = len(pages)
    repeated = {l for l, c in counts.items()
                if n >= 3 and c / n >= 0.5 and len(l) < 80 and not re.match(r"^(Pasal|BAB)\b", l)}
    parts = []
    for no, t, _ in pages:
        lines = [l for l in t.splitlines()
                 if l.strip() not in repeated and not NOISE.match(l)]
        parts.append(PAGE_MARK.format(no) + "\n".join(lines))
    text = "".join(parts)
    text = re.sub(r"([a-z])-\n([a-z])", r"\1\2", text)
    text = fix_ocr_text(text)
    return re.sub(r"[ \t]+", " ", text)


@dataclass
class Chunk:
    id: str
    text: str
    meta: dict


def _page_at(text: str, pos: int) -> int:
    pages = [int(m.group(1)) for m in PAGE_RE.finditer(text, 0, pos + 1)]
    return pages[-1] if pages else 1


def _bab_at(text: str, pos: int) -> str:
    last = None
    for m in BAB.finditer(text, 0, pos):
        last = m
    if not last:
        return ""
    title = PAGE_RE.sub("", text[last.end():]).strip().split("\n", 1)[0].strip()
    return f"BAB {last.group(1)} {title}".strip()


def _split(body: str) -> list[str]:
    if len(body) <= MAX_CHARS:
        return [body]
    starts = [m.start() for m in AYAT.finditer(body)]
    if not starts:
        return [body[i:i + MAX_CHARS] for i in range(0, len(body), MAX_CHARS)]
    if starts[0] != 0:
        starts = [0] + starts
    pieces = [body[a:b] for a, b in zip(starts, starts[1:] + [len(body)])]
    out, cur = [], ""
    for p in pieces:
        if cur and len(cur) + len(p) > MAX_CHARS:
            out.append(cur)
            cur = ""
        cur += p
    return [o.strip() for o in out + [cur] if o.strip()]


def find_penjelasan(text: str, matches: list, roman: bool) -> int | None:
    best, reset = -1, None
    for m in matches:
        n = _num(norm_pasal(m.group(1), roman) or "")
        if n < 0:
            continue
        if best >= 10 and n <= 2:
            reset = m.start()
            break
        best = max(best, n)
    heads = [h.start() for h in PENJELASAN.finditer(text)]
    if reset is not None:
        before = [h for h in heads if h < reset]
        return before[-1] if before else reset
    after_first = [h for h in heads if matches and h > matches[0].start()]
    return after_first[0] if after_first else None


def chunk_law(text: str, base_meta: dict, status: dict[str, str], roman: bool = False):
    sid = base_meta["source_id"]
    all_m = list(PASAL.finditer(text))
    pen = find_penjelasan(text, all_m, roman)
    regions = [("batang_tubuh", 0, pen if pen is not None else len(text))]
    if pen is not None:
        regions.append(("penjelasan", pen, len(text)))
    chunks: list[Chunk] = []
    skipped: list[str] = []
    for section, start, end in regions:
        matches, last = [], 0
        for m in all_m:
            if not (start <= m.start() < end):
                continue
            p = norm_pasal(m.group(1), roman)
            n = _num(p) if p else -1
            if roman and p and ROMAN.fullmatch(p):
                matches.append(m)
            elif n > last:
                matches.append(m)
                last = n
            else:
                skipped.append(m.group(0).strip())
        if section == "batang_tubuh" and matches:
            cl = CLOSING.search(text, matches[-1].end(), end)
            if cl:
                end = cl.start()
        for j, m in enumerate(matches):
            stop = matches[j + 1].start() if j + 1 < len(matches) else end
            nb = BAB.search(text, m.end(), stop)
            if nb:
                stop = nb.start()
            pasal = norm_pasal(m.group(1), roman)
            if pasal is None:
                skipped.append(m.group(0).strip())
                continue
            body = PAGE_RE.sub("", text[m.start():stop]).strip()
            body = re.sub(r"\n{2,}", "\n", body)
            body = f"Pasal {pasal}\n" + (body.split("\n", 1)[1] if "\n" in body else "")
            if section == "penjelasan" and is_cukup_jelas(body):
                continue
            note = status.get(pasal, "") if section == "batang_tubuh" else ""
            for k, part in enumerate(_split(body)):
                if k:
                    part = f"Pasal {pasal} (lanjutan)\n{part}"
                if note:
                    part = f"[CATATAN STATUS: {note}]\n{part}"
                meta = {**base_meta,
                        "article": f"Pasal {pasal}",
                        "section": section,
                        "chapter": _bab_at(text, m.start()) if section == "batang_tubuh" else "",
                        "page_number": _page_at(text, m.start()),
                        "part": k,
                        "status_note": note}
                chunks.append(Chunk(f"{sid}::{section}::pasal-{pasal}::{k}", part, meta))
    if skipped:
        print(f"Info: {len(skipped)} judul pasal dilewati (tidak berurutan/tak terbaca): {skipped[:8]}")
    seen: dict[str, int] = {}
    for c in chunks:
        if c.id in seen:
            seen[c.id] += 1
            c.id += f"#{seen[c.id]}"
        else:
            seen[c.id] = 0
    return chunks


def report(chunks: list[Chunk]) -> list[str]:
    body = [c for c in chunks if c.meta["section"] == "batang_tubuh"]
    nums = sorted({c.meta["article"].split()[1] for c in body if c.meta["part"] == 0},
                  key=lambda p: (_num(p), p))
    pen = sum(c.meta["section"] == "penjelasan" for c in chunks)
    print(f"{len(chunks)} chunk ({len(body)} batang tubuh, {pen} penjelasan). "
          f"Pasal: {nums[0] if nums else '-'} .. {nums[-1] if nums else '-'} ({len(nums)} pasal unik)")
    problems = []
    ints = sorted({_num(p) for p in nums if _num(p) > 0})
    if ints:
        missing = sorted(set(range(1, ints[-1] + 1)) - set(ints))
        if missing:
            problems.append(f"Nomor pasal batang tubuh yang hilang: {missing[:20]}")
    dups = [c.id for c in body if "#" in c.id]
    if dups:
        problems.append(f"Pasal batang tubuh terdeteksi ganda: {dups[:10]}")
    for p in problems:
        print("CEK:", p)
    return problems


def check_ollama(url: str):
    try:
        tags = requests.get(f"{url}/api/tags", timeout=10).json()
    except requests.RequestException:
        sys.exit(f"Ollama tidak bisa dihubungi di {url}. Buka aplikasi Ollama dari Start menu "
                 "(atau jalankan 'ollama serve' di CMD lain), lalu ulangi.")
    names = {m.get("name") for m in tags.get("models", [])}
    if EMBED_MODEL not in names:
        sys.exit(f"Model {EMBED_MODEL} belum ada. Jalankan: ollama pull {EMBED_MODEL}")


def embed(texts: list[str], url: str, batch: int = 16) -> list[list[float]]:
    vecs = []
    for i in range(0, len(texts), batch):
        r = requests.post(f"{url}/api/embed",
                          json={"model": EMBED_MODEL, "input": texts[i:i + batch]}, timeout=600)
        r.raise_for_status()
        vecs.extend(r.json()["embeddings"])
    return vecs


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("--source-id", required=True, help="contoh: UU-27-2022")
    ap.add_argument("--title", required=True, help="judul resmi lengkap")
    ap.add_argument("--short", default="", help="contoh: UU PDP")
    ap.add_argument("--version", required=True, help="versi yang diverifikasi")
    ap.add_argument("--status", action="append", default=[],
                    help='catatan per pasal, format "53=teks catatan" (boleh berulang)')
    ap.add_argument("--db", default=CHROMA_DB)
    ap.add_argument("--ollama", default=OLLAMA_URL)
    ap.add_argument("--dry-run", action="store_true", help="hanya tampilkan chunk, tanpa embed/simpan")
    ap.add_argument("--roman-pasal", action="store_true",
                    help="HANYA untuk UU perubahan yang memakai 'Pasal I', 'Pasal II' (mis. UU ITE 19/2016, 1/2024)")
    ap.add_argument("--force", action="store_true", help="tetap simpan walau ada peringatan")
    ap.add_argument("--show", default="", help='tampilkan chunk pasal tertentu saat dry-run, mis. "1,4,53"')
    a = ap.parse_args(argv)

    status = dict(s.split("=", 1) for s in a.status)
    pages = extract_pages(a.pdf)
    ocr_pages = [p for p, _, m in pages if m != "pdf_text"]
    print(f"{len(pages)} halaman; OCR pada {len(ocr_pages)} halaman {ocr_pages[:10]}")

    base = {"source_id": a.source_id, "source_type": "legal_reference",
            "document_title": a.title, "short_name": a.short, "version": a.version,
            "embed_model": EMBED_MODEL}
    chunks = chunk_law(clean(pages), base, status, roman=a.roman_pasal)
    if not chunks:
        sys.exit("Tidak ada 'Pasal' terdeteksi. Cek hasil ekstraksi/OCR.")
    problems = report(chunks)
    if problems and not a.dry_run and not a.force:
        sys.exit("Ada masalah di atas. Perbaiki dulu, atau jalankan ulang dengan --force kalau sudah dicek.")

    if a.dry_run:
        want = {f"Pasal {p.strip()}" for p in a.show.split(",") if p.strip()}
        sample = [c for c in chunks if c.meta["article"] in want] if want else chunks[:3] + chunks[-2:]
        for c in sample:
            print("\n---", c.id, "| hal", c.meta["page_number"], "|", c.meta["chapter"])
            print(c.text[:400])
        return

    check_ollama(a.ollama)
    import chromadb
    client = chromadb.PersistentClient(path=a.db)
    col = client.get_or_create_collection(COLLECTION, metadata={"hnsw:space": "cosine",
                                                               "embed_model": EMBED_MODEL})
    if col.metadata.get("embed_model") != EMBED_MODEL:
        sys.exit(f"Koleksi dibuat dengan {col.metadata.get('embed_model')}, bukan {EMBED_MODEL}. "
                 "Model embedding tidak boleh dicampur.")
    col.delete(where={"source_id": a.source_id})
    vecs = embed([DOC_PREFIX + f"{a.short or a.title} {c.meta['article']}\n{c.text}"
                  for c in chunks], a.ollama)
    col.add(ids=[c.id for c in chunks], documents=[c.text for c in chunks],
            metadatas=[c.meta for c in chunks], embeddings=vecs)
    print(f"Tersimpan: {len(chunks)} chunk ke koleksi '{COLLECTION}' di {a.db}. "
          f"Total isi koleksi: {col.count()}")


if __name__ == "__main__":
    main()
