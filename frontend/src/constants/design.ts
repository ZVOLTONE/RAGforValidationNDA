/**
 * Design token ConfidAI: level risiko, label enum, tahap proses, dan error.
 * Semua label UI berbahasa Indonesia; nilai enum tetap bahasa Inggris (PRD §12).
 */
import type { FindingType, JobStatus, RiskLevel, ValidationStatus } from '@/types';

export interface SymbolName {
  ios: string;
  android: string;
  web: string;
}

export interface RiskMeta {
  label: string;
  color: string;
  colorDark: string;
  soft: string;
  softDark: string;
  icon: SymbolName;
  /** Warna highlight di atas PDF (FR-09). */
  highlight: string;
}

export const RISK_ORDER: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

export const RISK_META: Record<RiskLevel, RiskMeta> = {
  low: {
    label: 'Rendah',
    color: '#10B981',
    colorDark: '#34D399',
    soft: '#E7F3E8',
    softDark: 'rgba(16, 185, 129, 0.15)',
    icon: { ios: 'info.circle', android: 'info', web: 'info' },
    highlight: 'rgba(16, 185, 129, 0.28)',
  },
  medium: {
    label: 'Sedang',
    color: '#F59E0B',
    colorDark: '#FBBF24',
    soft: '#FFF1E2',
    softDark: 'rgba(245, 158, 11, 0.15)',
    icon: { ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' },
    highlight: 'rgba(245, 158, 11, 0.28)',
  },
  high: {
    label: 'Tinggi',
    color: '#F97316',
    colorDark: '#FB923C',
    soft: '#FDEBEA',
    softDark: 'rgba(249, 115, 22, 0.15)',
    icon: { ios: 'shield.lefthalf.filled', android: 'shield', web: 'shield' },
    highlight: 'rgba(249, 115, 22, 0.28)',
  },
  critical: {
    label: 'Kritis',
    color: '#EF4444',
    colorDark: '#F87171',
    soft: '#F6E3E3',
    softDark: 'rgba(239, 68, 68, 0.15)',
    icon: { ios: 'octagon.fill', android: 'report', web: 'report' },
    highlight: 'rgba(239, 68, 68, 0.32)',
  },
};

export const FINDING_TYPE_META: Record<FindingType, { label: string }> = {
  potential_legal_issue: { label: 'Potensi isu hukum (perlu verifikasi)' },
  contractual_gap: { label: 'Kesenjangan kontraktual' },
  weak_control: { label: 'Kontrol lemah' },
  security_risk: { label: 'Risiko keamanan' },
  no_issue_identified: { label: 'Tidak ada isu teridentifikasi' },
  inconclusive: { label: 'Belum dapat disimpulkan' },
};

export const FINDING_TYPES: FindingType[] = [
  'potential_legal_issue',
  'contractual_gap',
  'weak_control',
  'security_risk',
  'inconclusive',
  'no_issue_identified',
];

export const CATEGORY_META: Record<string, string> = {
  third_party_access: 'Akses Pihak Ketiga',
  data_breach_exfiltration: 'Kebocoran/Eksfiltrasi Data',
  insider_threat: 'Ancaman Orang Dalam',
  unauthorized_access: 'Akses Tidak Sah',
  ransomware_malware: 'Risiko Ransomware/Malware',
  it_ot_security: 'Keamanan IT/OT',
};

export const CATEGORIES = Object.keys(CATEGORY_META);

export function categoryLabel(category: string): string {
  const known = CATEGORY_META[category];
  if (known) return known;
  return 'Lainnya';
}

export const VALIDATION_META: Record<
  ValidationStatus,
  { label: string; color: string; colorDark: string; soft: string; softDark: string; icon: SymbolName }
> = {
  validated: {
    label: 'Tervalidasi Sistem',
    color: '#10B981',
    colorDark: '#34D399',
    soft: '#E7F3E8',
    softDark: 'rgba(16, 185, 129, 0.15)',
    icon: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  },
  pending: {
    label: 'Menunggu Validasi',
    color: '#6B7280',
    colorDark: '#9CA3AF',
    soft: '#EDF2F7',
    softDark: 'rgba(107, 114, 128, 0.15)',
    icon: { ios: 'clock', android: 'schedule', web: 'schedule' },
  },
  needs_review: {
    label: 'Perlu Tinjauan Manusia',
    color: '#F59E0B',
    colorDark: '#FBBF24',
    soft: '#FFF3DA',
    softDark: 'rgba(245, 158, 11, 0.15)',
    icon: { ios: 'person.fill.questionmark', android: 'person_search', web: 'person_search' },
  },
  failed: {
    label: 'Gagal Validasi',
    color: '#EF4444',
    colorDark: '#F87171',
    soft: '#FDE1DF',
    softDark: 'rgba(239, 68, 68, 0.15)',
    icon: { ios: 'xmark.octagon.fill', android: 'error', web: 'error' },
  },
};

export const CONFIDENCE_LABEL: Record<string, string> = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
};

export const JOB_STATUS_META: Record<JobStatus, { label: string }> = {
  uploaded: { label: 'Terunggah' },
  queued: { label: 'Dalam antrean' },
  processing: { label: 'Sedang diproses' },
  validating: { label: 'Validasi bukti' },
  generating_report: { label: 'Menyusun laporan' },
  completed: { label: 'Selesai' },
  failed: { label: 'Gagal' },
};

export interface ProcessStage {
  key: string;
  label: string;
}

export const PROCESS_STAGES: ProcessStage[] = [
  { key: 'extraction', label: 'Ekstraksi dokumen' },
  { key: 'clauses', label: 'Identifikasi klausul' },
  { key: 'references', label: 'Pengambilan referensi' },
  { key: 'analysis', label: 'Analisis AI' },
  { key: 'validation', label: 'Validasi bukti' },
  { key: 'report', label: 'Pembuatan laporan' },
];

/** Indeks tahap aktif dari status/jenis tahap backend. */
export function activeStageIndex(status: JobStatus, stage?: string): number {
  if (stage) {
    const byStage = PROCESS_STAGES.findIndex((item) => item.key === stage);
    if (byStage >= 0) return byStage;
  }
  switch (status) {
    case 'uploaded':
    case 'queued':
      return 0;
    case 'processing':
      return 2;
    case 'validating':
      return 4;
    case 'generating_report':
      return 5;
    case 'completed':
      return PROCESS_STAGES.length;
    default:
      return 0;
  }
}

export const ERROR_MESSAGES: Record<string, string> = {
  invalid_file: 'File tidak dapat diproses. Pastikan dokumen adalah PDF yang valid.',
  extraction_failed: 'Teks dokumen tidak berhasil diekstrak. Coba unggah ulang berkas PDF lain.',
  ocr_failed:
    'Pembacaan teks (OCR) gagal pada dokumen ini. Coba unggah PDF dengan kualitas pindai lebih baik.',
  model_unavailable:
    'Layanan analisis AI sedang tidak tersedia. Silakan coba lagi beberapa saat lagi.',
  timeout: 'Proses analisis melebihi batas waktu. Silakan coba lagi.',
  report_generation_failed:
    'Laporan gagal dibuat. Hasil analisis tetap tersedia dan dapat ditinjau di dashboard.',
};

export function describeJobError(code?: string): string {
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  return 'Terjadi kendala saat memproses dokumen.';
}

export const DISCLAIMER_SHORT =
  'Hasil dihasilkan AI untuk membantu peninjauan manusia dan bukan nasihat hukum.';

export const LIMITATIONS: string[] = [
  'ConfidAI bukan pemantau jaringan, endpoint, atau sistem SIEM/SOC.',
  'ConfidAI tidak menentukan ada atau tidaknya pelanggaran hukum final.',
  'Setiap temuan memerlukan peninjauan manusia sebelum dijadikan dasar keputusan.',
  'Temuan hanya ditampilkan sebagai fakta bila memiliki kutipan dan nomor halaman yang valid.',
];
