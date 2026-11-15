"""High precision, evidence grounded screening for explicit contract risks.

This complements (rather than replaces) the local LLM. The rules only promote
clauses whose text explicitly describes a risky permission or missing control.
They are particularly useful with small local models that otherwise collapse
distinct risk categories into one label.
"""

from __future__ import annotations

import re


_RULES: tuple[tuple[str, re.Pattern[str], dict[str, str]], ...] = (
    # Third party access and subcontractors.
    ("third_party_access", re.compile(r"subkontraktor|pihak ketiga|afiliasi|vendor", re.I), {
        "trigger": "tanpa persetujuan|tanpa.*(?:nondisclosure|kerahasiaan)|tidak mewajibkan.*(?:nondisclosure|kerahasiaan|perjanjian)|perjanjian.*kerahasiaan.*(?:tidak|tanpa)|dianggap perlu|bebas menunjuk|berhak menunjuk",
        "risk_category": "third_party_access", "risk_level": "high", "finding_type": "weak_control",
        "reasoning_summary": "Klausul memberi akses atau penggunaan pihak ketiga tanpa persetujuan atau perlindungan kerahasiaan yang setara.",
        "recommendation": "Batasi penggunaan pihak ketiga dengan persetujuan tertulis, prinsip least privilege, dan kewajiban kerahasiaan serta keamanan yang setara.",
    }),
    # Shared privileged credentials and remote/OT access.
    ("privileged_access", re.compile(r"akun administrator bersama|shared account|kredensial.*bersama|akun.*dipakai.*seluruh", re.I), {
        "trigger": r".", "risk_category": "unauthorized_access", "risk_level": "critical", "finding_type": "security_risk",
        "reasoning_summary": "Klausul mengizinkan penggunaan kredensial administrator bersama sehingga aktivitas tidak dapat diatribusikan dengan baik.",
        "recommendation": "Wajibkan akun individual, autentikasi multifaktor, hak akses minimum, dan pencatatan aktivitas.",
    }),
    ("ot_change", re.compile(r"\bOT\b|operational technology|firmware|perangkat OT", re.I), {
        "trigger": r"tanpa persetujuan|tanpa otorisasi|dapat melakukan perubahan|mengubah konfigurasi",
        "risk_category": "it_ot_security", "risk_level": "critical", "finding_type": "security_risk",
        "reasoning_summary": "Klausul mengizinkan perubahan pada lingkungan OT tanpa persetujuan atau otorisasi yang memadai.",
        "recommendation": "Wajibkan persetujuan perubahan, pengujian, jendela pemeliharaan, pencatatan, dan prosedur rollback untuk sistem OT.",
    }),
    ("remote_access", re.compile(r"akses jarak jauh|remote access|24\s*jam|24/7|terus-menerus", re.I), {
        "trigger": r"jaringan|sistem|akses|terus-menerus|24\s*jam|24/7",
        "risk_category": "unauthorized_access", "risk_level": "high", "finding_type": "weak_control",
        "reasoning_summary": "Klausul memberikan akses jarak jauh atau berkelanjutan tanpa pembatasan dan kontrol akses yang terukur.",
        "recommendation": "Batasi akses berdasarkan kebutuhan dan waktu, gunakan VPN/MFA, persetujuan akses, serta logging dan pemantauan.",
    }),
    ("missing_access_controls", re.compile(r"audit log|pencatatan aktivitas|segmentasi jaringan|autentikasi berlapis|multifactor|MFA", re.I), {
        "trigger": r"tidak mengatur|tidak menetapkan|tidak mewajibkan|tanpa|tidak ada",
        "risk_category": "it_ot_security", "risk_level": "high", "finding_type": "weak_control",
        "reasoning_summary": "Teks klausul secara eksplisit tidak mewajibkan kontrol pencatatan, segmentasi, atau autentikasi berlapis.",
        "recommendation": "Tetapkan kewajiban audit log yang ditinjau berkala, segmentasi jaringan, dan MFA untuk akses sensitif.",
    }),
    # Data handling, retention, and personal data.
    ("unrestricted_data_copy", re.compile(r"perangkat apa pun|perangkat pribadi|cloud pribadi|layanan cloud pribadi|menyalin.*data", re.I), {
        "trigger": r"diperbolehkan|dapat menyalin|perangkat apa pun|cloud pribadi|tanpa pembatasan",
        "risk_category": "data_breach_exfiltration", "risk_level": "high", "finding_type": "weak_control",
        "reasoning_summary": "Klausul membolehkan penyalinan informasi ke perangkat atau penyimpanan yang tidak dibatasi oleh kontrol organisasi.",
        "recommendation": "Batasi salinan ke perangkat terkelola dan terenkripsi; larang penyimpanan pribadi serta wajibkan kontrol DLP dan akses minimum.",
    }),
    ("unlimited_retention", re.compile(r"tanpa batas waktu|selamanya|tidak terbatas waktunya|retensi tanpa batas", re.I), {
        "trigger": r"menyimpan|salinan|informasi|data|retensi",
        "risk_category": "data_breach_exfiltration", "risk_level": "high", "finding_type": "weak_control",
        "reasoning_summary": "Klausul membolehkan penyimpanan data tanpa batas waktu, sehingga memperpanjang paparan setelah tujuan kerja sama berakhir.",
        "recommendation": "Tentukan masa retensi, pengembalian atau pemusnahan terverifikasi, dan pengecualian retensi yang terbatas.",
    }),
    ("no_data_destruction", re.compile(r"memusnahkan|menghapus|mengembalikan.*informasi|pemusnahan", re.I), {
        "trigger": r"tidak mewajibkan|tidak mengatur|tidak wajib|tidak perlu",
        "risk_category": "data_breach_exfiltration", "risk_level": "high", "finding_type": "contractual_gap",
        "reasoning_summary": "Klausul secara eksplisit tidak mewajibkan pengembalian atau pemusnahan informasi setelah kerja sama berakhir.",
        "recommendation": "Wajibkan pengembalian atau pemusnahan aman, termasuk salinan dan backup, dengan konfirmasi tertulis.",
    }),
    # An explicit missing processing basis in a personal-data clause is a
    # legal issue candidate, not merely a generic control weakness. Keep the
    # category tied to data handling and let legal_linker attach the statute.
    ("missing_personal_data_basis", re.compile(r"data pribadi|data personal|nomor identitas|identitas kependudukan|NIK|dasar pemrosesan", re.I), {
        "trigger": r"tidak mengatur|tidak mencantumkan|tanpa dasar",
        "risk_category": "data_breach_exfiltration", "risk_level": "high", "finding_type": "potential_legal_issue",
        "reasoning_summary": "Klausul data pribadi secara eksplisit tidak menetapkan dasar pemrosesan; kandidat isu hukum memerlukan verifikasi terhadap ketentuan yang berlaku.",
        "recommendation": "Tetapkan dan dokumentasikan dasar serta tujuan pemrosesan, peran para pihak, pengamanan, retensi, dan pemenuhan hak subjek data; minta tinjauan legal.",
    }),
    ("personal_data_transfer", re.compile(r"data pribadi|nomor identitas|identitas kependudukan|NIK|lintas batas|luar negeri|di luar wilayah Indonesia", re.I), {
        "trigger": r"memproses|memindahkan|mengakses|basis data|server|tidak mengatur|tanpa dasar|akses ke",
        "risk_category": "data_breach_exfiltration", "risk_level": "high", "finding_type": "weak_control",
        "reasoning_summary": "Klausul mencakup data pribadi atau pemindahan lintas negara, tetapi bukti klausul belum menetapkan kontrol pemrosesan yang memadai.",
        "recommendation": "Tentukan tujuan dan dasar pemrosesan, peran para pihak, pengamanan transfer lintas negara, retensi, serta mekanisme pemenuhan hak subjek data.",
    }),
    ("data_processing_gap", re.compile(r"dasar pemrosesan|hak subjek data|notifikasi kepada subjek data", re.I), {
        "trigger": r"tidak mengatur|tidak menetapkan|tidak mencantumkan",
        "risk_category": "data_breach_exfiltration", "risk_level": "high", "finding_type": "weak_control",
        "reasoning_summary": "Klausul pemrosesan data secara eksplisit tidak mengatur dasar dan tata kelola pemrosesan maupun hak subjek data.",
        "recommendation": "Tentukan dasar dan tujuan pemrosesan, tanggung jawab para pihak, hak subjek data, masa retensi, dan mekanisme notifikasi.",
    }),
    # Incident response, baseline security, liability, and personnel.
    ("weak_incident_notice", re.compile(r"insiden keamanan|insiden siber|kebocoran data|batas waktu pemberitahuan|format laporan|membantu investigasi", re.I), {
        "trigger": r"apabila dianggap perlu|jika dianggap perlu|tidak menetapkan.*batas waktu|batas waktu pemberitahuan|format laporan|tidak.*membantu investigasi",
        "risk_category": "ransomware_malware", "risk_level": "high", "finding_type": "contractual_gap",
        "reasoning_summary": "Klausul insiden membuat notifikasi bergantung pada penilaian sepihak atau tidak menetapkan tenggat dan dukungan respons.",
        "recommendation": "Tetapkan notifikasi segera dengan tenggat yang jelas, isi laporan minimum, kewajiban menjaga bukti, dan dukungan investigasi serta pemulihan.",
    }),
    ("missing_security_baseline", re.compile(r"patching|pembaruan keamanan|perangkat lunak berbahaya|pencadangan|backup|disaster recovery|pemulihan bencana", re.I), {
        "trigger": r"tidak mengatur|tidak menetapkan|tidak mewajibkan|tanpa|tidak ada",
        "risk_category": "it_ot_security", "risk_level": "medium", "finding_type": "weak_control",
        "reasoning_summary": "Klausul secara eksplisit tidak menetapkan kontrol dasar seperti patching, proteksi malware, backup, atau pemulihan bencana.",
        "recommendation": "Tetapkan standar minimum patching, proteksi malware, backup yang diuji, dan prosedur pemulihan bencana.",
    }),
    ("vague_security_standard", re.compile(r"standar industri(?: yang berlaku)?|praktik terbaik", re.I), {
        "trigger": r"wajar|layak|berlaku",
        "risk_category": "it_ot_security", "risk_level": "medium", "finding_type": "weak_control",
        "reasoning_summary": "Klausul hanya mensyaratkan standar industri atau praktik terbaik secara umum tanpa tolok ukur keamanan yang dapat diverifikasi.",
        "recommendation": "Tetapkan standar keamanan terukur, cakupan kontrol, bukti kepatuhan, dan hak audit berkala.",
    }),
    ("cyber_liability_exclusion", re.compile(r"serangan siber|ransomware|peretasan|malware|gangguan layanan", re.I), {
        "trigger": r"tidak bertanggung jawab|membebaskan(?:.*Pihak.*)?.*(?:tuntutan|gugatan)|mengalihkan.*tanggung jawab",
        "risk_category": "ransomware_malware", "risk_level": "high", "finding_type": "security_risk",
        "reasoning_summary": "Klausul mengecualikan atau mengalihkan tanggung jawab atas dampak serangan siber, ransomware, malware, atau gangguan layanan yang dipicu insiden siber.",
        "recommendation": "Seimbangkan batas tanggung jawab dengan pengecualian untuk pelanggaran kewajiban keamanan, kelalaian, dan insiden yang berada dalam kendali pihak penerima.",
    }),
    ("access_revocation", re.compile(r"pencabutan hak akses|mencabut.*akses|pencabutan akses", re.I), {
        "trigger": r"tidak mengatur|tidak menetapkan|tidak.*jangka waktu|tidak.*tata cara",
        "risk_category": "insider_threat", "risk_level": "medium", "finding_type": "contractual_gap",
        "reasoning_summary": "Klausul secara eksplisit tidak menetapkan tata cara atau waktu pencabutan akses personel yang tidak lagi bertugas.",
        "recommendation": "Wajibkan pencabutan akses segera saat personel keluar atau berganti peran dan lakukan review akses berkala.",
    }),
)


def screen_clause(text: str) -> dict[str, str] | None:
    """Return the first strong, text-grounded finding for a clause, if any."""
    normalized = re.sub(r"\s+", " ", text or "").strip()
    for name, cue, finding in _RULES:
        if cue.search(normalized) and re.search(finding["trigger"], normalized, re.I):
            result = {key: value for key, value in finding.items() if key != "trigger"}
            # Continuous access to an OT/SCADA environment has materially
            # greater impact than ordinary remote maintenance access.
            if name == "remote_access" and re.search(r"\bOT\b|SCADA|sistem kendali", normalized, re.I):
                result.update(
                    risk_level="critical",
                    finding_type="security_risk",
                    reasoning_summary="Klausul memberi akses berkelanjutan ke lingkungan IT/OT tanpa batas waktu akses dan kontrol otorisasi yang terukur.",
                )
            return result

    # The local 1.7B model often invents missing controls in ordinary NDA
    # language. These clauses are safe only when none of the explicit risk
    # rules above matched; return a grounded negative classification instead.
    safe_patterns = (
        r"\bberarti seluruh informasi\b",
        r"\bmencakup namun tidak terbatas pada\b",
        r"\bwajib menjaga kerahasiaan\b",
        r"\bhanya menggunakannya untuk tujuan\b",
        r"\bdilarang mengungkapkan.*tanpa persetujuan tertulis\b",
        r"\bwajib menerapkan langkah-langkah keamanan yang wajar\b",
        r"\btelah menjadi milik umum bukan karena pelanggaran\b",
        r"\btelah diketahui secara sah.*sebelum pengungkapan\b",
        r"\bwajib diungkapkan berdasarkan perintah pengadilan\b",
        r"\bterikat kewajiban kerahasiaan yang tidak kurang ketat\b",
        r"\bbertanggung jawab atas tindakan personelnya\b",
        r"\bberlaku sejak tanggal ditandatangani\b",
        r"\bkewajiban kerahasiaan.*tetap berlaku selama\b",
        r"\bdiatur dan ditafsirkan berdasarkan hukum\b",
        r"\bdiselesaikan terlebih dahulu melalui musyawarah\b",
        r"\bperubahan atas perjanjian ini hanya sah apabila dibuat secara tertulis\b",
        r"\bketentuan lainnya tetap berlaku\b",
    )
    if any(re.search(pattern, normalized, re.I) for pattern in safe_patterns):
        return {
            "risk_category": "legal_compliance",
            "risk_level": "low",
            "finding_type": "no_issue_identified",
            "reasoning_summary": "Klausul memuat definisi atau kewajiban kontraktual yang tidak memberi izin berbahaya maupun melemahkan kontrol keamanan secara eksplisit.",
            "recommendation": "Tidak ada tindakan keamanan siber khusus yang teridentifikasi dari klausul ini.",
        }
    return None
