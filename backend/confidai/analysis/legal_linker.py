"""Attach traceable, conditional statutory references to risk findings.

References are selected from a small curated article map and fetched by exact
source/article metadata from the local legal corpus. This module does not
decide that a contract or party has violated a law.
"""

from __future__ import annotations

import re

from confidai.analysis.schema import FindingType, LegalReference, RiskFinding

_PERSONAL_DATA = re.compile(
    r"data pribadi|data pelanggan|data karyawan|nomor identitas|identitas kependudukan|\bnik\b",
    re.I,
)
_DUTY_TEXT = {
    ("UU_27_2022", 14): "Mengatur mekanisme pelaksanaan hak Subjek Data Pribadi melalui permohonan kepada Pengendali.",
    ("UU_27_2022", 20): "Mengatur kewajiban Pengendali memiliki dasar pemrosesan Data Pribadi.",
    ("UU_27_2022", 35): "Mengatur langkah teknis dan operasional untuk melindungi keamanan Data Pribadi.",
    ("UU_27_2022", 38): "Mengatur kewajiban melindungi Data Pribadi dari pemrosesan yang tidak sah.",
    ("UU_27_2022", 39): "Mengatur pencegahan akses tidak sah atas Data Pribadi dan keamanan sistem pemrosesannya.",
    ("UU_27_2022", 42): "Mengatur penghentian pemrosesan ketika tujuan tercapai atau masa retensi berakhir.",
    ("UU_27_2022", 46): "Mengatur pemberitahuan jika terjadi kegagalan Pelindungan Data Pribadi.",
    ("UU_27_2022", 51): "Mengatur pemrosesan Data Pribadi oleh Prosesor berdasarkan perintah Pengendali.",
    ("UU_27_2022", 52): "Memberlakukan kewajiban perlindungan tertentu kepada Prosesor Data Pribadi.",
    ("UU_27_2022", 56): "Mengatur persyaratan transfer Data Pribadi ke luar wilayah Indonesia.",
    ("UU_11_2008", 15): "Mengatur kewajiban Penyelenggara Sistem Elektronik mengoperasikan sistem secara andal, aman, dan bertanggung jawab.",
    ("KUH_PERDATA", 1243): "Mengatur ganti rugi akibat tidak dipenuhinya perikatan setelah syarat kelalaian terpenuhi.",
    ("KUH_PERDATA", 1338): "Mengatur kekuatan mengikat persetujuan yang sah dan pelaksanaan dengan itikad baik.",
    ("KUH_PERDATA", 1365): "Mengatur ganti rugi atas perbuatan melanggar hukum yang menimbulkan kerugian.",
}


def _candidate_articles(finding: RiskFinding, clause_text: str, document_text: str) -> list[tuple[str, int]]:
    text = re.sub(r"\s+", " ", clause_text or "").lower()
    whole_document = re.sub(r"\s+", " ", document_text or "")
    has_personal_data = bool(_PERSONAL_DATA.search(whole_document))
    category = finding.risk_category.value
    candidates: list[tuple[str, int]] = []
    liability_clause = bool(re.search(
        r"tanggung jawab|kerugian|membebaskan|tidak bertanggung jawab|pengalihan tanggung jawab", text
    ))

    if liability_clause and (category in {"ransomware_malware", "legal_compliance"}
                             or finding.finding_type == FindingType.contractual_gap):
        return [("KUH_PERDATA", 1338), ("KUH_PERDATA", 1243), ("KUH_PERDATA", 1365)]

    if category == "third_party_access" and has_personal_data:
        candidates += [("UU_27_2022", 51), ("UU_27_2022", 52)]
    elif category == "data_breach_exfiltration" and has_personal_data:
        if re.search(r"dasar pemrosesan|hak subjek data", text):
            candidates.append(("UU_27_2022", 20))
        if re.search(r"hak subjek data", text):
            candidates.append(("UU_27_2022", 14))
        if re.search(r"luar negeri|lintas batas|di luar wilayah", text):
            candidates.append(("UU_27_2022", 56))
        if re.search(r"retensi|tanpa batas waktu|memusnahkan|menghapus|mengembalikan", text):
            candidates.append(("UU_27_2022", 42))
        if re.search(r"insiden|kegagalan pelindungan|kebocoran data", text):
            candidates.append(("UU_27_2022", 46))
        if re.search(r"subkontraktor|prosesor|pihak ketiga", text):
            candidates += [("UU_27_2022", 51), ("UU_27_2022", 52)]
        if re.search(r"akses|keamanan|menyalin|perangkat|kredensial", text):
            candidates += [("UU_27_2022", 35), ("UU_27_2022", 39)]
        if not candidates:
            candidates += [("UU_27_2022", 35), ("UU_27_2022", 39)]
    elif category == "unauthorized_access":
        if has_personal_data:
            candidates.append(("UU_27_2022", 39))
        if re.search(r"sistem|jaringan|akun|akses|kredensial", text):
            candidates.append(("UU_11_2008", 15))
    elif category == "it_ot_security":
        candidates.append(("UU_11_2008", 15))
        if has_personal_data:
            if re.search(r"insiden|kegagalan pelindungan|kebocoran data", text):
                candidates.append(("UU_27_2022", 46))
            elif re.search(r"akses|akun|kredensial|log|segmentasi", text):
                candidates.append(("UU_27_2022", 39))
            else:
                candidates.append(("UU_27_2022", 35))
    elif category == "ransomware_malware":
        candidates.append(("UU_11_2008", 15))
        if has_personal_data:
            candidates.append(("UU_27_2022", 46 if "insiden" in text else 35))
    elif category == "insider_threat" and has_personal_data:
        candidates.append(("UU_27_2022", 39))

    # Keep the most directly relevant citations first and avoid repetitive lists.
    return list(dict.fromkeys(candidates))[:2]


def attach_legal_references(
    finding: RiskFinding,
    clause_text: str,
    document_text: str,
    reference_service,
) -> None:
    """Attach exact source passages; preserve findings if the corpus is unavailable."""
    if finding.finding_type in {FindingType.no_issue_identified, FindingType.inconclusive}:
        return
    candidates = _candidate_articles(finding, clause_text, document_text)
    if not candidates:
        return

    by_source: dict[str, list[int]] = {}
    for source_id, number in candidates:
        by_source.setdefault(source_id, []).append(number)
    try:
        retrieved = reference_service.get_articles(by_source)
    except Exception as exc:
        finding.validation_notes.append(
            f"pasal terkait tidak dapat diambil dari koleksi UU ({type(exc).__name__})"
        )
        finding.needs_human_review = True
        return

    by_key = {
        (str(result.metadata.get("source_id", "")), int(result.metadata.get("pasal_number", -1))): result
        for result in retrieved
    }
    for source_id, number in candidates:
        result = by_key.get((source_id, number))
        if result is None:
            continue
        metadata = result.metadata
        if source_id == "UU_27_2022":
            if number == 46:
                applicability = "Bersyarat: berlaku jika insiden melibatkan kegagalan Pelindungan Data Pribadi; teks kontrak sendiri tidak membuktikan insiden."
            elif number == 56:
                applicability = "Bersyarat: perlu dipastikan terjadi transfer Data Pribadi lintas negara dan persyaratan transfernya terpenuhi."
            elif number in {51, 52}:
                applicability = "Bersyarat: berlaku jika pihak ketiga bertindak sebagai Prosesor Data Pribadi; akses informasi rahasia saja belum membuktikan peran tersebut."
            elif number == 20:
                applicability = "Bersyarat: periksa dasar pemrosesan yang sebenarnya dan peran Pengendali Data Pribadi; ketiadaan di NDA ini belum membuktikan ketiadaan di luar kontrak."
            else:
                applicability = "Bersyarat: ketentuan ini relevan jika informasi yang diproses termasuk Data Pribadi dan pihak terkait memiliki peran yang diatur UU PDP."
        elif source_id == "UU_11_2008":
            applicability = "Bersyarat: perlu dipastikan pihak yang dimaksud memenuhi status Penyelenggara Sistem Elektronik dan ketentuan ini berlaku pada fakta kasus."
        else:
            applicability = "Kontekstual: penerapan bergantung pada kontrak, pelaksanaan, unsur kelalaian/wanprestasi, dan fakta kerugian."

        if source_id == "UU_11_2008":
            corpus_note = "Korpus memuat UU 11/2008; verifikasi perubahan UU 19/2016 dan UU 1/2024 sebelum menyimpulkan hukum yang berlaku."
        elif source_id == "UU_27_2022":
            corpus_note = "Rujukan mengikuti teks UU 27/2022 dalam korpus proyek; cek aturan pelaksana dan perkembangan putusan terkait."
        else:
            corpus_note = "Rujukan mengikuti salinan KUH Perdata dalam korpus proyek; penerapan perlu ditinjau berdasarkan fakta dan hukum yang berlaku."

        finding.legal_references.append(LegalReference(
            source_id=source_id,
            source_type="legal_reference",
            document_title=str(metadata.get("document_title") or metadata.get("document_number") or source_id),
            source_file=str(metadata.get("source_file") or ""),
            article=str(metadata.get("pasal") or f"Pasal {number}"),
            version=str(metadata.get("document_number") or ""),
            chunk_id=result.chunk_id,
            chunk_ids=list(result.chunk_ids),
            similarity=result.similarity,
            excerpt=result.text[:520].rsplit(" ", 1)[0].strip() + (" …" if len(result.text) > 520 else ""),
            relevance_reason=_DUTY_TEXT.get((source_id, number), "Ketentuan ini perlu diperiksa terhadap fakta dan klausul terkait."),
            applicability=applicability,
            corpus_note=corpus_note,
        ))
