"""Paginated PDF analysis report with measured text wrapping."""

from __future__ import annotations

from pathlib import Path

import pymupdf


def _wrap_lines(text: str, width: float, size: float, fontname: str) -> list[str]:
    """Wrap text using the same font metrics used by PDF rendering."""
    font = pymupdf.Font(fontname)
    output: list[str] = []
    for paragraph in (text or "-").splitlines() or ["-"]:
        if not paragraph.strip():
            output.append("")
            continue
        line = ""
        for word in paragraph.split():
            candidate = f"{line} {word}" if line else word
            if font.text_length(candidate, fontsize=size) <= width:
                line = candidate
                continue
            if line:
                output.append(line)
            # Split unusually long unbroken tokens (for example a UUID).
            piece = ""
            for char in word:
                if piece and font.text_length(piece + char, fontsize=size) > width:
                    output.append(piece)
                    piece = char
                else:
                    piece += char
            line = piece
        if line:
            output.append(line)
    return output or [""]


def generate_report(
    path: str | Path,
    job: dict,
    findings: list[dict],
    annotated_source: str | Path | None = None,
) -> None:
    # The source and its highlight legend stay before the analysis pages.
    doc = pymupdf.open(str(annotated_source)) if annotated_source else pymupdf.open()
    if not annotated_source:
        doc.new_page()

    page = doc.new_page()
    margin = 48
    width = page.rect.width - margin * 2
    bottom = page.rect.height - 48
    y = 58

    def add_page() -> None:
        nonlocal page, y, bottom
        page = doc.new_page()
        bottom = page.rect.height - 48
        y = 58

    def draw_paragraph(text: str, *, size: float = 9, bold: bool = False,
                       gap_after: float = 0, color=(0.12, 0.14, 0.18)) -> None:
        nonlocal y
        # Extracted PDF lines are physical line wraps, not paragraph breaks.
        text = " ".join((text or "-").split())
        fontname = "hebo" if bold else "helv"
        lines = _wrap_lines(text, width, size, fontname)
        leading = size * 1.35
        for line in lines:
            if y + leading > bottom:
                add_page()
            if line:
                page.insert_text((margin, y), line, fontsize=size, fontname=fontname, color=color)
            y += leading
        y += gap_after

    draw_paragraph("ConfidAI — Laporan Analisis Kontrak", size=18, bold=True, gap_after=10)
    for line in (
        f"Dokumen: {job.get('filename', '-')}",
        f"Job ID: {job.get('job_id', '-')}",
        f"Status: {job.get('status', '-')}",
    ):
        draw_paragraph(line, size=9)
    y += 10
    draw_paragraph("Ringkasan temuan", size=13, bold=True, gap_after=3)
    counts = {
        level: sum(1 for finding in findings if finding.get("risk_level") == level)
        for level in ("critical", "high", "medium", "low")
    }
    draw_paragraph(" | ".join(f"{level}: {count}" for level, count in counts.items()), gap_after=10)

    for finding in findings:
        evidence = (finding.get("evidence") or [{}])[0]
        title = (
            f"{finding.get('finding_id', '-')} · "
            f"{finding.get('risk_level', '-').upper()} · "
            f"{finding.get('risk_category', '-') }"
        )
        body = [
            f"Jenis: {finding.get('finding_type', '-')}",
            f"Status validasi bukti: {finding.get('validation_status', '-')}",
            f"Alasan: {finding.get('reasoning_summary', '-')}",
            f"Bukti (hal. {evidence.get('page_number', '-')}): {evidence.get('quote', '-')}",
        ]
        legal_references = finding.get("legal_references") or []
        if legal_references:
            body.append("Pasal terkait dari koleksi UU (bukan penetapan pelanggaran):")
            body.append("Status tinjauan hukum: belum diverifikasi reviewer.")
            for reference in legal_references:
                title = reference.get("document_title") or reference.get("source_id", "Sumber hukum")
                article = reference.get("article") or "Pasal tidak tercantum"
                body.extend((
                    f"{title}, {article}. {reference.get('relevance_reason', '')}",
                    f"Penerapan: {reference.get('applicability', 'Perlu verifikasi reviewer.')}",
                    f"Kutipan UU: {reference.get('excerpt', '-')}",
                    f"Sumber: {reference.get('source_id', '-')} · {reference.get('source_file', '-')} · chunk {', '.join(reference.get('chunk_ids') or [reference.get('chunk_id') or '-'])}.",
                    f"Catatan versi: {reference.get('corpus_note', '-')}",
                ))
        body.append(f"Rekomendasi: {finding.get('recommendation', '-')}")

        # Keep a finding together when it fits on a page; otherwise start it on
        # a fresh page. The measured lines prevent text from colliding below.
        title_lines = _wrap_lines(title, width, 10.5, "hebo")
        body_lines = [_wrap_lines(text, width, 9, "helv") for text in body]
        needed = len(title_lines) * 14.2 + 5 + sum(len(lines) * 12.15 for lines in body_lines) + 12
        if y + needed > bottom and y > 58:
            add_page()

        draw_paragraph(title, size=10.5, bold=True, gap_after=5)
        for text in body:
            draw_paragraph(text, size=9)
        y += 12

    if y + 90 > bottom:
        add_page()
    y += 8
    draw_paragraph("Batasan analisis", size=13, bold=True, gap_after=4)
    draw_paragraph(
        "ConfidAI adalah alat bantu peninjauan. Temuan menunjukkan potensi kesenjangan "
        "kontraktual, bukan bukti bahwa serangan atau pelanggaran hukum telah terjadi. "
        "Temuan low ditandai kuning hanya jika tervalidasi dan actionable; temuan "
        "inconclusive, no_issue_identified, dan needs_review tidak diberi highlight risiko. "
        "Semua hasil memerlukan peninjauan manusia.",
        size=9,
    )

    doc.save(str(path), garbage=1, deflate=True)
    doc.close()
