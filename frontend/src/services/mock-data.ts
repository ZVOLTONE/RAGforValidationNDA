/**
 * Mode data contoh (mock). Semua data di sini ilustratif dan hanya dipakai
 * ketika USE_MOCK_DATA = true — berguna untuk demo tanpa backend (PRD §12).
 */
import { LIMITATIONS } from '@/constants/design';
import type {
  AnalysisJob,
  DocumentPage,
  Finding,
  FindingFilterQuery,
  JobReport,
  JobSummary,
  RiskLevel,
  UploadFile,
  UploadResult,
  ViewerData,
} from '@/types';

import { MOCK_PAGES, blockBox, blockQuote } from './mock-document';

const iso = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString();

function createFindings(documentId: string): Finding[] {
  const withClause = (page: number, blockId: string) => ({
    source_document_id: documentId,
    page_number: page,
    quote: blockQuote(page, blockId),
  });

  const findings: Finding[] = [
    {
      finding_id: 'F-001',
      clause_id: 'CL-07-01',
      clause_number: '7.1',
      risk_category: 'data_breach_exfiltration',
      risk_level: 'critical',
      finding_type: 'contractual_gap',
      reasoning_summary:
        'Batas pelaporan insiden 30 hari kalender berpotensi melebihi kewajiban notifikasi insiden berdasarkan UU PDP dan praktik umum 72 jam. Tidak ada kewajiban notifikasi cepat kepada pihak terdampak.',
      evidence: [withClause(3, 'p3-7.1')],
      legal_references: [
        {
          source_id: 'UU-PDP-27-2022',
          document_title: 'UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi',
          article: 'Pasal 46',
          version: '2022',
          verified: true,
        },
        {
          source_id: 'NIST-SP-800-61',
          document_title: 'NIST SP 800-61 Rev. 2 — Computer Security Incident Handling Guide',
          article: 'Section 3.2.4',
          version: 'Rev. 2',
          verified: true,
        },
      ],
      recommendation:
        'Tetapkan kewajiban notifikasi insiden maksimal 72 jam kepada Pemberi dan pihak terdampak, lengkap dengan kanal pelaporan dan konsekuensi keterlambatan.',
      confidence: 'high',
      needs_human_review: false,
      validation_status: 'validated',
      bounding_boxes: [blockBox(3, 'p3-7.1')],
    },
    {
      finding_id: 'F-002',
      clause_id: 'CL-06-01',
      clause_number: '6.1',
      risk_category: 'third_party_access',
      risk_level: 'high',
      finding_type: 'weak_control',
      reasoning_summary:
        'Penerima dapat melibatkan subkontraktor tanpa persetujuan tertulis sebelumnya. Kewajiban pemberitahuan baru muncul setelah keterlibatan dimulai, sehingga Pemberi kehilangan kendali atas rantai pemrosesan data.',
      evidence: [withClause(3, 'p3-6.1')],
      legal_references: [
        {
          source_id: 'ISO-27001-A.5.19',
          document_title: 'ISO/IEC 27001:2022 — Information security for use of cloud services',
          article: 'A.5.19',
          version: '2022',
          verified: true,
        },
      ],
      recommendation:
        'Wajibkan persetujuan tertulis sebelum keterlibatan subkontraktor, sertakan daftar subkontraktor pada lampiran, dan hak audit atas subkontraktor.',
      confidence: 'high',
      needs_human_review: true,
      validation_status: 'pending',
      bounding_boxes: [blockBox(3, 'p3-6.1')],
    },
    {
      finding_id: 'F-003',
      clause_id: 'CL-05-03',
      clause_number: '5.3',
      risk_category: 'unauthorized_access',
      risk_level: 'high',
      finding_type: 'weak_control',
      reasoning_summary:
        'Klausul secara eksplisit membebaskan Penerima dari kewajiban autentikasi multifaktor pada sistem yang menyimpan informasi rahasia. Ini melemahkan kontrol akses terhadap data sensitif.',
      evidence: [withClause(2, 'p2-5.3')],
      legal_references: [
        {
          source_id: 'NIST-800-53-IA-2',
          document_title: 'NIST SP 800-53 Rev. 5 — Identification and Authentication',
          article: 'IA-2(1)',
          version: 'Rev. 5',
          verified: true,
        },
      ],
      recommendation:
        'Ganti pengecualian ini dengan kewajiban MFA untuk seluruh akses istimewa dan akses jarak jauh ke sistem yang memuat informasi rahasia.',
      confidence: 'high',
      needs_human_review: true,
      validation_status: 'needs_review',
      bounding_boxes: [blockBox(2, 'p2-5.3')],
    },
    {
      finding_id: 'F-004',
      clause_id: 'CL-10-02',
      clause_number: '10.2',
      risk_category: 'data_breach_exfiltration',
      risk_level: 'medium',
      finding_type: 'potential_legal_issue',
      reasoning_summary:
        'Pembatasan tanggung jawab tetap berlaku luas dan tidak secara tegas mengecualikan kerugian akibat kegagalan pelaporan insiden. Indikasi ini memerlukan verifikasi hukum lebih lanjut.',
      evidence: [withClause(4, 'p4-10.2')],
      legal_references: [
        {
          source_id: 'UU-PDP-27-2022',
          document_title: 'UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi',
          article: 'Pasal 46',
          version: '2022',
          verified: false,
        },
      ],
      recommendation:
        'Perjelas pengecualian pembatasan tanggung jawab untuk pelanggaran kewajiban kerahasiaan dan pelaporan insiden, lalu verifikasi dengan penasihat hukum.',
      confidence: 'medium',
      needs_human_review: true,
      validation_status: 'needs_review',
      bounding_boxes: [blockBox(4, 'p4-10.2')],
    },
    {
      finding_id: 'F-005',
      clause_id: 'CL-09-01',
      clause_number: '9.1',
      risk_category: 'it_ot_security',
      risk_level: 'medium',
      finding_type: 'contractual_gap',
      reasoning_summary:
        'Audit hanya dilakukan sekali setahun dengan pemberitahuan 14 hari. Tidak ada ketentuan audit akibat insiden atau akses mendadak bila terjadi indikasi pelanggaran.',
      evidence: [withClause(4, 'p4-9.1')],
      legal_references: [],
      recommendation:
        'Tambahkan hak audit sewaktu-waktu setelah insiden atau indikasi pelanggaran, dengan pemberitahuan yang lebih singkat.',
      confidence: 'medium',
      needs_human_review: false,
      validation_status: 'pending',
      bounding_boxes: [blockBox(4, 'p4-9.1')],
    },
    {
      finding_id: 'F-006',
      clause_id: 'CL-05-04',
      clause_number: '5.4',
      risk_category: 'insider_threat',
      risk_level: 'low',
      finding_type: 'weak_control',
      reasoning_summary:
        'Pelatihan keamanan berkala tidak diwajibkan bagi personel yang menangani informasi rahasia, sehingga kesadaran terhadap ancaman orang dalam terbatas.',
      evidence: [withClause(2, 'p2-5.4')],
      legal_references: [],
      recommendation:
        'Wajibkan pelatihan kesadaran keamanan minimal setahun sekali dan saat onboarding personel dengan akses informasi rahasia.',
      confidence: 'medium',
      needs_human_review: false,
      validation_status: 'validated',
      bounding_boxes: [blockBox(2, 'p2-5.4')],
    },
    {
      finding_id: 'F-007',
      clause_id: 'CL-07-04',
      clause_number: '7.4',
      risk_category: 'ransomware_malware',
      risk_level: 'low',
      finding_type: 'no_issue_identified',
      reasoning_summary:
        'Klausul mewajibkan pencadangan setiap 24 jam dan penyimpanan terpisah dari sistem produksi. Belum ditemukan isu berdasarkan analisis saat ini.',
      evidence: [withClause(3, 'p3-7.4')],
      legal_references: [],
      recommendation:
        'Tidak ada tindakan mendesak. Pertimbangkan uji pemulihan cadangan secara berkala.',
      confidence: 'medium',
      needs_human_review: false,
      validation_status: 'validated',
      bounding_boxes: [blockBox(3, 'p3-7.4')],
    },
    {
      finding_id: 'F-008',
      clause_id: 'CL-09-03',
      clause_number: '9.3',
      risk_category: 'it_ot_security',
      risk_level: 'low',
      finding_type: 'no_issue_identified',
      reasoning_summary:
        'Ruang lingkup audit dinyatakan tidak mencakup lingkungan OT. Belum ditemukan isu tambahan pada klausul ini berdasarkan analisis saat ini.',
      evidence: [withClause(4, 'p4-9.3')],
      legal_references: [],
      recommendation: 'Tidak ada tindakan mendesak untuk klausul ini.',
      confidence: 'low',
      needs_human_review: false,
      validation_status: 'validated',
      bounding_boxes: [blockBox(4, 'p4-9.3')],
    },
    {
      finding_id: 'F-009',
      clause_id: 'CL-09-04',
      clause_number: '9.4',
      risk_category: 'unauthorized_access',
      risk_level: 'medium',
      finding_type: 'inconclusive',
      reasoning_summary:
        'Retensi catatan akses hanya 30 hari, namun tidak jelas apakah berlaku untuk seluruh sistem atau hanya sebagian. Informasi tambahan diperlukan sebelum menyimpulkan.',
      evidence: [withClause(4, 'p4-9.4')],
      legal_references: [],
      recommendation:
        'Perjelas cakupan sistem dan perpanjang retensi log akses minimal 6 bulan untuk mendukung investigasi insiden.',
      confidence: 'low',
      needs_human_review: true,
      validation_status: 'validated',
      bounding_boxes: [],
    },
    {
      finding_id: 'F-010',
      clause_id: 'CL-06-04',
      clause_number: '6.4',
      risk_category: 'third_party_access',
      risk_level: 'high',
      finding_type: 'contractual_gap',
      reasoning_summary:
        'Draf klausul menyebut kewajiban persetujuan tertulis, namun kutipan tidak ditemukan pada teks yang berhasil diekstrak sehingga temuan ini belum dapat dipastikan.',
      evidence: [
        {
          source_document_id: documentId,
          page_number: 3,
          quote:
            'Penerima wajib mendapatkan persetujuan tertulis dari Pemberi sebelum melibatkan subkontraktor.',
        },
      ],
      legal_references: [],
      recommendation:
        'Periksa ulang Pasal 6 pada dokumen asli dan tambahkan kewajiban persetujuan tertulis secara eksplisit.',
      confidence: 'low',
      needs_human_review: true,
      validation_status: 'failed',
      bounding_boxes: [blockBox(3, 'p3-6.2')],
    },
  ];

  return findings;
}

type MockMode = 'static' | 'progress' | 'failing';

interface MockRecord {
  job: AnalysisJob;
  mode: MockMode;
  startedAt: number;
  findings: Finding[];
  pages: DocumentPage[];
}

const records = new Map<string, MockRecord>();

const documentIdFor = (jobId: string) => `doc-${jobId}`;

function seed(
  jobId: string,
  documentName: string,
  status: AnalysisJob['status'],
  createdOffsetMs: number,
  mode: MockMode,
  withFindings: boolean,
): void {
  const documentId = documentIdFor(jobId);
  records.set(jobId, {
    job: {
      job_id: jobId,
      document_id: documentId,
      document_name: documentName,
      status,
      created_at: iso(createdOffsetMs),
      started_at: iso(createdOffsetMs + 2_000),
      page_count: MOCK_PAGES.length,
      extraction_warnings: [],
    },
    mode,
    startedAt: Date.now() + createdOffsetMs,
    findings: withFindings ? createFindings(documentId) : [],
    pages: MOCK_PAGES,
  });
}

seed(
  'demo-nda-001',
  'NDA_Nusantara_Digital.pdf',
  'completed',
  -2 * 60 * 60 * 1000,
  'static',
  true,
);
seed('demo-proses-002', 'NDA_Vendor_Logistik.pdf', 'processing', -4_000, 'progress', true);
seed('demo-gagal-003', 'Scan_Kontrak_Kualitas_Rendah.pdf', 'failed', -26 * 60 * 60 * 1000, 'static', false);
seed('demo-kosong-004', 'NDA_Tanpa_Temuan.pdf', 'completed', -72 * 60 * 60 * 1000, 'static', false);

function syncStatus(record: MockRecord): AnalysisJob {
  if (record.mode === 'static') return record.job;

  const elapsed = (Date.now() - record.startedAt) / 1000;
  const job: AnalysisJob = { ...record.job };

  if (record.mode === 'failing') {
    if (elapsed > 7) {
      job.status = 'failed';
      job.error_code = 'ocr_failed';
      job.stage = undefined;
    } else {
      job.status = 'processing';
      job.stage = 'analysis';
    }
    return job;
  }

  if (elapsed < 2) {
    job.status = 'queued';
  } else if (elapsed < 5) {
    job.status = 'processing';
    job.stage = 'extraction';
  } else if (elapsed < 7) {
    job.status = 'processing';
    job.stage = 'clauses';
  } else if (elapsed < 9) {
    job.status = 'processing';
    job.stage = 'references';
  } else if (elapsed < 12) {
    job.status = 'processing';
    job.stage = 'analysis';
  } else if (elapsed < 14) {
    job.status = 'validating';
    job.stage = 'validation';
  } else if (elapsed < 17) {
    job.status = 'generating_report';
    job.stage = 'report';
  } else {
    job.status = 'completed';
    job.completed_at = new Date(record.startedAt + 17_000).toISOString();
  }
  return job;
}

function requireRecord(jobId: string): MockRecord {
  const record = records.get(jobId);
  if (!record) {
    throw new Error('Pekerjaan tidak ditemukan pada data contoh.');
  }
  return record;
}

export function getMockJob(jobId: string): AnalysisJob {
  return syncStatus(requireRecord(jobId));
}

export function listMockJobs(): AnalysisJob[] {
  return Array.from(records.values())
    .map(syncStatus)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function getMockFindings(jobId: string, filters: FindingFilterQuery = {}): Finding[] {
  const record = requireRecord(jobId);
  const job = syncStatus(record);
  if (job.status === 'failed') return [];
  return record.findings.filter((finding) => {
    if (filters.level && finding.risk_level !== filters.level) return false;
    if (filters.category && finding.risk_category !== filters.category) return false;
    if (filters.finding_type && finding.finding_type !== filters.finding_type) return false;
    if (filters.validation_status && finding.validation_status !== filters.validation_status) {
      return false;
    }
    return true;
  });
}

export function getMockFinding(findingId: string): Finding {
  for (const record of records.values()) {
    const match = record.findings.find((finding) => finding.finding_id === findingId);
    if (match) return match;
  }
  throw new Error('Temuan tidak ditemukan pada data contoh.');
}

export function setMockReview(findingId: string, needsReview: boolean): Finding {
  for (const record of records.values()) {
    const index = record.findings.findIndex((finding) => finding.finding_id === findingId);
    if (index >= 0) {
      const updated = { ...record.findings[index], needs_human_review: needsReview };
      record.findings[index] = updated;
      return updated;
    }
  }
  throw new Error('Temuan tidak ditemukan pada data contoh.');
}

export function getMockSummary(jobId: string): JobSummary {
  const findings = getMockFindings(jobId);
  const byLevel: Partial<Record<RiskLevel, number>> = {};
  const byCategory: Record<string, number> = {};
  for (const finding of findings) {
    byLevel[finding.risk_level] = (byLevel[finding.risk_level] ?? 0) + 1;
    byCategory[finding.risk_category] = (byCategory[finding.risk_category] ?? 0) + 1;
  }
  return {
    job_id: jobId,
    total: findings.length,
    by_level: byLevel,
    by_category: byCategory,
    needs_review: findings.filter((finding) => finding.needs_human_review).length,
    extraction_warnings: [
      {
        page_number: 5,
        kind: 'low_quality',
        message: 'Halaman 5 dipindai dengan kualitas rendah; sebagian teks tidak terbaca.',
      },
    ],
  };
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function buildMockReportHtml(job: AnalysisJob, findings: Finding[]): string {
  const rows = findings
    .map(
      (finding) => `<tr>
        <td>${escapeHtml(finding.finding_id)}</td>
        <td>${escapeHtml(finding.clause_number ?? '-')}</td>
        <td>${escapeHtml(finding.risk_level)}</td>
        <td>${escapeHtml(finding.reasoning_summary)}</td>
        <td>${escapeHtml(finding.recommendation)}</td>
      </tr>`,
    )
    .join('');
  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Laporan ConfidAI — ${escapeHtml(
    job.document_name,
  )}</title>
  <style>body{font-family:system-ui,sans-serif;margin:40px;color:#0d1b2a}h1{font-size:22px}
  table{border-collapse:collapse;width:100%;font-size:12px}td,th{border:1px solid #cbd5e1;padding:8px;text-align:left;vertical-align:top}
  .note{background:#fff4e5;border:1px solid #f0c48a;padding:12px;border-radius:8px;font-size:13px}</style></head>
  <body><h1>Laporan Analisis ConfidAI</h1>
  <p><strong>Dokumen:</strong> ${escapeHtml(job.document_name)}<br/>
  <strong>Job ID:</strong> ${escapeHtml(job.job_id)}<br/>
  <strong>Tanggal:</strong> ${escapeHtml(new Date().toLocaleString('id-ID'))}</p>
  <p class="note">Laporan contoh (data ilustratif). Hasil dihasilkan AI untuk membantu peninjauan manusia dan bukan nasihat hukum.</p>
  <h2>Ringkasan Temuan</h2>
  <table><thead><tr><th>ID</th><th>Klausul</th><th>Level</th><th>Alasan</th><th>Rekomendasi</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <h2>Keterbatasan</h2><ul>${LIMITATIONS.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
  </body></html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

export function getMockReport(jobId: string): JobReport {
  const record = requireRecord(jobId);
  const job = syncStatus(record);
  if (job.status === 'failed') {
    return { job_id: jobId, status: 'failed', limitations: LIMITATIONS };
  }
  if (job.status !== 'completed') {
    return { job_id: jobId, status: 'generating_report', limitations: LIMITATIONS };
  }
  return {
    job_id: jobId,
    status: 'completed',
    generated_at: job.completed_at ?? job.created_at,
    download_url: buildMockReportHtml(job, record.findings),
    executive_summary:
      'Dokumen mengandung beberapa potensi kesenjangan kontraktual pada pelaporan insiden, keterlibatan subkontraktor, dan kontrol akses. Tidak ada kesimpulan hukum final; temuan utama memerlukan peninjauan manusia.',
    limitations: LIMITATIONS,
  };
}

export function getMockPages(documentId: string): DocumentPage[] {
  for (const record of records.values()) {
    if (record.job.document_id === documentId) return record.pages;
  }
  return MOCK_PAGES;
}

export function getMockViewerData(jobId: string): ViewerData {
  const record = requireRecord(jobId);
  return {
    job: syncStatus(record),
    findings: record.findings,
    pages: record.pages,
  };
}

export function deleteMockJob(jobId: string): void {
  records.delete(jobId);
}

export function createMockJob(
  file: UploadFile,
  onProgress?: (fraction: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve) => {
    let progress = 0;
    const timer = setInterval(() => {
      progress = Math.min(1, progress + 0.18);
      onProgress?.(progress);
      if (progress < 1) return;
      clearInterval(timer);
      const jobId = `demo-${Date.now().toString(36)}`;
      const documentId = documentIdFor(jobId);
      const createdAt = new Date().toISOString();
      records.set(jobId, {
        job: {
          job_id: jobId,
          document_id: documentId,
          document_name: file.name,
          status: 'queued',
          created_at: createdAt,
          started_at: createdAt,
          page_count: MOCK_PAGES.length,
          extraction_warnings: [],
        },
        mode: 'progress',
        startedAt: Date.now(),
        findings: createFindings(documentId),
        pages: MOCK_PAGES,
      });
      resolve({ job_id: jobId, document_id: documentId, status: 'queued' });
    }, 130);
  });
}
/** Job contoh siap tampil untuk tombol "Lihat data contoh". */
export const DEMO_JOB_ID = 'demo-nda-001';
