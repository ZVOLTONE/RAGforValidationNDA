"""Evidence-first validation for findings returned by the LLM."""

from __future__ import annotations

import re

from confidai.analysis.schema import FindingType, RiskFinding, RiskLevel, ValidationStatus

_ABSENCE_CLAIM = (
    "tidak ada klausul", "tidak terdapat klausul", "tidak disebutkan",
    "tidak menyebut",
    "tidak diatur", "tidak ada ketentuan", "tidak ada bukti",
    "belum diatur", "tidak mengatur",
)
_UNCERTAIN_CLAIM = (
    "inconclusive", "tidak cukup bukti", "bukti belum cukup",
    "tidak ada kejadian", "tidak ada indikasi", "konteks tidak jelas",
)
_CATEGORY_TERMS = {
    "third_party_access": ("pihak ketiga", "vendor", "subkontraktor", "afiliasi", "penyedia layanan"),
    "data_breach_exfiltration": ("data pribadi", "kebocoran", "menyalin", "memusnahkan", "pengungkapan", "pemindahan data", "memindahkan data", "nomor identitas", "identitas kependudukan", "dasar pemrosesan", "hak subjek data", "tanpa batas waktu", "retensi", "perangkat apa pun", "cloud pribadi"),
    "insider_threat": ("personel", "pegawai", "karyawan", "pencabutan hak akses", "mengundurkan diri", "dimutasi"),
    "unauthorized_access": ("akses tanpa otorisasi", "akses jarak jauh", "kredensial", "akun administrator", "akun bersama", "autentikasi"),
    "ransomware_malware": (
        "malware", "ransomware", "serangan siber", "peretasan", "gangguan layanan",
        "insiden keamanan", "insiden siber", "batas waktu pemberitahuan", "format laporan",
        "membantu investigasi",
    ),
    "it_ot_security": ("sistem ot", "perangkat ot", "audit log", "segmentasi jaringan", "patching", "pencadangan", "keamanan sistem", "insiden keamanan", "respons insiden", "pemulihan"),
}


def validate_finding(finding: RiskFinding, clauses: dict[str, object]) -> RiskFinding:
    """Validate source references before a finding becomes actionable.

    A model can classify a risk, but it cannot make a missing or invented quote
    authoritative. Findings that cannot be tied to the uploaded document remain
    explicitly inconclusive.
    """
    notes = list(finding.validation_notes)
    clause = clauses.get(finding.clause_id)
    if clause is None:
        notes.append("clause_id tidak ditemukan pada dokumen sumber")
    if not finding.evidence:
        notes.append("tidak ada kutipan bukti")
    else:
        source_text = getattr(clause, "text", "") if clause else ""
        for evidence in finding.evidence:
            if evidence.source_document_id != finding.document_id:
                notes.append("source_document_id tidak sama dengan dokumen analisis")
            if evidence.clause_id and evidence.clause_id != finding.clause_id:
                notes.append("clause_id pada bukti tidak sama dengan temuan")
            if evidence.quote and source_text and evidence.quote.lower() not in source_text.lower():
                notes.append("kutipan tidak ditemukan persis pada teks klausul")

    # A clause quote proves what that clause says; it cannot prove that an
    # absent control is missing from the entire contract. That requires a
    # document-wide checklist, which this analyzer has not run yet.
    explicit_absence_in_source = bool(clause and any(
        phrase in getattr(clause, "text", "").lower()
        for phrase in ("tidak mengatur", "tidak mewajibkan", "tidak menetapkan", "tidak mencantumkan")
    ))
    if not explicit_absence_in_source and any(
        phrase in finding.reasoning_summary.lower() for phrase in _ABSENCE_CLAIM
    ):
        notes.append("klaim ketiadaan klausul memerlukan pemeriksaan dokumen secara menyeluruh")
    if any(phrase in finding.reasoning_summary.lower() for phrase in _UNCERTAIN_CLAIM):
        notes.append("model menyatakan bukti atau konteks tidak cukup")

    category = getattr(finding.risk_category, "value", str(finding.risk_category))
    terms = _CATEGORY_TERMS.get(category)
    if clause is not None and terms:
        text = re.sub(r"\s+", " ", getattr(clause, "text", "")).lower()
        if not any(term in text for term in terms):
            notes.append("kategori risiko tidak terkait langsung dengan isi klausul")

    # Retrieved statutory text is a relevant reference, not proof that a
    # violation occurred. A human legal review must verify the legal conclusion.
    if finding.finding_type == FindingType.potential_legal_issue:
        if not finding.legal_references:
            notes.append("pasal terkait dari koleksi hukum tidak ditemukan")
        elif not any(reference.legal_reviewed for reference in finding.legal_references):
            notes.append("pasal terkait ditemukan, tetapi kesimpulan hukum belum diverifikasi reviewer")

    if notes:
        finding.validation_status = ValidationStatus.needs_review
        finding.needs_human_review = True
        finding.validation_notes = list(dict.fromkeys(notes))
        if (not finding.evidence
                or any("ketiadaan klausul" in note or "kategori risiko" in note or "pasal terkait dari koleksi" in note or "bukti atau konteks tidak cukup" in note for note in notes)):
            finding.finding_type = FindingType.inconclusive
            finding.risk_level = RiskLevel.low
    else:
        finding.validation_status = ValidationStatus.validated
        finding.validation_notes = ["kutipan dan klausul sumber terverifikasi"]
    return finding
