/** Tipe data inti sesuai PRD Frontend ConfidAI bagian 8.1. */

export type JobStatus =
  | 'uploaded'
  | 'queued'
  | 'processing'
  | 'validating'
  | 'generating_report'
  | 'completed'
  | 'failed';

export type BackendJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ProcessStep {
  stage: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  message?: string;
  started_at?: string;
  completed_at?: string;
  details?: Record<string, unknown>;
}

export interface BackendProgress {
  stage: string;
  status: string;
  message?: string;
  percent?: number | null;
  completed_units?: number | null;
  total_units?: number | null;
  updated_at?: string;
  steps: ProcessStep[];
}

export interface BackendFinding {
  finding_id: string;
  clause_id: string;
  document_id: string;
  risk_category: string;
  risk_level: RiskLevel;
  finding_type: FindingType;
  reasoning_summary: string;
  evidence: { source_document_id: string; page_number?: number | null; clause_id?: string | null; quote: string }[];
  legal_references: Record<string, unknown>[];
  recommendation: string;
  confidence: Confidence;
  analysis_method: 'rule_based' | 'llm' | 'fallback' | 'unknown';
  model_name?: string | null;
  decision_basis?: string;
  needs_human_review: boolean;
  validation_status: string;
  validation_notes: string[];
  page_number?: number | null;
}

export interface BackendJob {
  job_id: string;
  document_id: string;
  filename: string;
  size_bytes: number;
  page_count: number;
  status: BackendJobStatus;
  stage: string;
  created_at: string;
  completed_at?: string;
  error?: string;
  progress: BackendProgress;
  analysis_progress?: Record<string, unknown>;
  extraction_quality?: Record<string, unknown>;
  extraction_pages?: Record<string, unknown>[];
  analysis_configuration?: Record<string, unknown>;
  validation_summary?: Record<string, number>;
  findings: BackendFinding[];
  report_available?: boolean;
  report_url?: string | null;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type FindingType =
  | 'potential_legal_issue'
  | 'contractual_gap'
  | 'weak_control'
  | 'security_risk'
  | 'no_issue_identified'
  | 'inconclusive';

export type ValidationStatus = 'pending' | 'validated' | 'needs_review' | 'failed';

export type Confidence = 'low' | 'medium' | 'high';

export interface Evidence {
  source_document_id: string;
  page_number: number;
  quote: string;
}

export interface LegalReference {
  source_id: string;
  document_title: string;
  article?: string;
  version?: string;
  page_number?: number;
  verified: boolean;
}

export interface BoundingBox {
  page: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface Finding {
  finding_id: string;
  clause_id: string;
  clause_number?: string;
  risk_category: string;
  risk_level: RiskLevel;
  finding_type: FindingType;
  reasoning_summary: string;
  evidence: Evidence[];
  legal_references: LegalReference[];
  recommendation: string;
  confidence: Confidence;
  needs_human_review: boolean;
  validation_status: ValidationStatus;
  bounding_boxes: BoundingBox[];
}

export interface ExtractionWarning {
  page_number: number;
  kind: 'low_quality' | 'failed_extraction';
  message?: string;
}

export interface AnalysisJob {
  job_id: string;
  document_id: string;
  document_name: string;
  status: JobStatus;
  stage?: string;
  error_code?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  page_count?: number;
  extraction_warnings?: ExtractionWarning[];
}

export interface JobSummary {
  job_id: string;
  total: number;
  by_level: Partial<Record<RiskLevel, number>>;
  by_category: Record<string, number>;
  needs_review: number;
  extraction_warnings: ExtractionWarning[];
}

export interface JobReport {
  job_id: string;
  status: 'generating_report' | 'completed' | 'failed';
  generated_at?: string;
  download_url?: string;
  executive_summary?: string;
  limitations: string[];
}

export interface FindingFilterQuery {
  level?: string;
  category?: string;
  finding_type?: string;
  validation_status?: string;
}

/** Blok teks halaman hasil ekstraksi; dipakai mode data contoh untuk pratinjau. */
export interface PageTextBlock {
  id: string;
  text: string;
  top: number;
  left: number;
  width: number;
  height: number;
  fontSize: number;
  bold?: boolean;
}

export interface DocumentPage {
  page_number: number;
  width: number;
  height: number;
  image_url?: string;
  low_quality?: boolean;
  blocks?: PageTextBlock[];
}

export interface ViewerData {
  job: AnalysisJob;
  findings: Finding[];
  pages: DocumentPage[];
}

export interface UploadResult {
  job_id: string;
  document_id: string;
  status: JobStatus;
}

export interface UploadFile {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
  /** Objek File browser (web) untuk FormData; null di native. */
  file?: unknown;
}
