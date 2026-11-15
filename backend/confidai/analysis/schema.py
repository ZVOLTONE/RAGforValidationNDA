"""Skema data & taksonomi risiko ConfidAI (PRD section 5.6 dan 9).

Semua enum di sini adalah daftar nilai yang DIPERBOLEHKAN. Validator (FR-07)
menolak nilai di luar daftar ini, sehingga output LLM tidak bisa menyelipkan
kategori atau level yang tidak dikenal.
"""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator


# --- Taksonomi (PRD 5) ---
class RiskCategory(str, Enum):
    third_party_access = "third_party_access"
    data_breach_exfiltration = "data_breach_exfiltration"
    insider_threat = "insider_threat"
    unauthorized_access = "unauthorized_access"
    ransomware_malware = "ransomware_malware"
    it_ot_security = "it_ot_security"
    # Kategori netral untuk klausul yang relevan hukum tapi bukan salah satu di atas.
    legal_compliance = "legal_compliance"


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class FindingType(str, Enum):
    potential_legal_issue = "potential_legal_issue"
    contractual_gap = "contractual_gap"
    weak_control = "weak_control"
    security_risk = "security_risk"
    no_issue_identified = "no_issue_identified"
    inconclusive = "inconclusive"


class Confidence(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class ValidationStatus(str, Enum):
    pending = "pending"
    validated = "validated"
    needs_review = "needs_review"
    rejected = "rejected"


# Rubrik ringkas (PRD "Risk Level"): level tidak boleh ditetapkan hanya dari
# pilihan kata dramatis LLM. Validator memakai ini untuk membatasi level ketika
# bukti/relevansi lemah.
RISK_LEVEL_RANK = {"low": 1, "medium": 2, "high": 3, "critical": 4}


class EvidenceItem(BaseModel):
    """Satu kutipan bukti yang menunjuk ke teks sumber (PRD 9.3)."""

    source_document_id: str
    page_number: int | None = None
    clause_id: str | None = None
    quote: str = ""

    @field_validator("quote")
    @classmethod
    def _strip(cls, v: str) -> str:
        return (v or "").strip()


class LegalReference(BaseModel):
    """Referensi hukum/keamanan yang BENAR-BENAR diambil dari knowledge base.

    Diisi oleh retrieval, bukan dikarang LLM (FR-04, FR-05). ``chunk_id`` adalah
    id chunk ChromaDB sehingga referensi dapat ditelusuri ke sumber.
    """

    source_id: str
    source_type: str = "legal_reference"
    document_title: str = ""
    source_file: str = ""
    article: str = ""           # mis. "Pasal 65"
    page_number: int | None = None
    version: str = ""
    chunk_id: str | None = None
    chunk_ids: list[str] = Field(default_factory=list)
    similarity: float | None = None
    excerpt: str = ""
    relevance_reason: str = ""
    applicability: str = "Bersyarat; periksa fakta dan peran para pihak."
    corpus_note: str = ""
    legal_reviewed: bool = False


class RiskFinding(BaseModel):
    """Satu temuan risiko (PRD 9.3). Field selaras dengan FR-08 & NFR-04."""

    finding_id: str
    clause_id: str
    document_id: str
    risk_category: RiskCategory
    risk_level: RiskLevel
    finding_type: FindingType
    reasoning_summary: str
    evidence: list[EvidenceItem] = Field(default_factory=list)
    legal_references: list[LegalReference] = Field(default_factory=list)
    recommendation: str = ""
    confidence: Confidence = Confidence.low
    # Provenance shown to reviewers: where the classification came from and
    # what evidence/policy supported it.
    analysis_method: str = "unknown"  # rule_based | llm | fallback
    model_name: str | None = None
    decision_basis: str = ""
    needs_human_review: bool = True
    validation_status: ValidationStatus = ValidationStatus.pending
    # Catatan validator (alasan status / peringatan). Transparansi FR-07.
    validation_notes: list[str] = Field(default_factory=list)
    page_number: int | None = None  # halaman utama untuk tampilan dashboard

    def to_public_dict(self) -> dict[str, Any]:
        d = self.model_dump(mode="json")
        return d


ALLOWED = {
    "risk_category": {e.value for e in RiskCategory},
    "risk_level": {e.value for e in RiskLevel},
    "finding_type": {e.value for e in FindingType},
    "confidence": {e.value for e in Confidence},
}
