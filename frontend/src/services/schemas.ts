/**
 * Skema Zod untuk memvalidasi respons backend (PRD §8).
 * Respons tidak valid ditangani sebagai error aman, bukan ditampilkan mentah.
 */
import { z } from 'zod';

const riskLevel = z.enum(['low', 'medium', 'high', 'critical']).catch('medium');
const findingType = z
  .enum([
    'potential_legal_issue',
    'contractual_gap',
    'weak_control',
    'security_risk',
    'no_issue_identified',
    'inconclusive',
  ])
  .catch('inconclusive');
const validationStatus = z.enum(['pending', 'validated', 'needs_review', 'failed']).catch('pending');
const jobStatus = z
  .enum([
    'uploaded',
    'queued',
    'processing',
    'validating',
    'generating_report',
    'completed',
    'failed',
  ])
  .catch('queued');
const confidence = z.enum(['low', 'medium', 'high']).catch('low');

export const evidenceSchema = z.object({
  source_document_id: z.string().default(''),
  page_number: z.number(),
  quote: z.string(),
});

export const legalReferenceSchema = z.object({
  source_id: z.string().default(''),
  document_title: z.string().default(''),
  article: z.string().optional(),
  version: z.string().optional(),
  page_number: z.number().optional(),
  verified: z.boolean().default(false),
});

export const boundingBoxSchema = z.object({
  page: z.number(),
  x0: z.number(),
  y0: z.number(),
  x1: z.number(),
  y1: z.number(),
});

export const findingSchema = z.object({
  finding_id: z.string(),
  clause_id: z.string().default(''),
  clause_number: z.string().optional(),
  risk_category: z.string().default('unknown'),
  risk_level: riskLevel,
  finding_type: findingType,
  reasoning_summary: z.string().default(''),
  evidence: z.array(evidenceSchema).default([]),
  legal_references: z.array(legalReferenceSchema).default([]),
  recommendation: z.string().default(''),
  confidence,
  needs_human_review: z.boolean().default(false),
  validation_status: validationStatus,
  bounding_boxes: z.array(boundingBoxSchema).default([]),
});

export const extractionWarningSchema = z.object({
  page_number: z.number(),
  kind: z.enum(['low_quality', 'failed_extraction']).catch('low_quality'),
  message: z.string().optional(),
});

export const analysisJobSchema = z.object({
  job_id: z.string(),
  document_id: z.string().default(''),
  document_name: z.string().default('Dokumen tanpa nama'),
  status: jobStatus,
  stage: z.string().optional(),
  error_code: z.string().optional(),
  created_at: z.string().default(() => new Date().toISOString()),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  page_count: z.number().optional(),
  extraction_warnings: z.array(extractionWarningSchema).default([]),
});

const processStepSchema = z.object({
  stage: z.string(),
  status: z.enum(['queued', 'running', 'completed', 'failed']),
  message: z.string().optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

const backendProgressSchema = z.object({
  stage: z.string(),
  status: z.string(),
  message: z.string().optional(),
  percent: z.number().nullable().optional(),
  completed_units: z.number().nullable().optional(),
  total_units: z.number().nullable().optional(),
  updated_at: z.string().optional(),
  steps: z.array(processStepSchema).default([]),
});

export const backendFindingSchema = z.object({
  finding_id: z.string(),
  clause_id: z.string(),
  document_id: z.string(),
  risk_category: z.string(),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']).catch('low'),
  finding_type: findingType,
  reasoning_summary: z.string().default(''),
  evidence: z.array(z.object({
    source_document_id: z.string().default(''),
    page_number: z.number().nullable().optional(),
    clause_id: z.string().nullable().optional(),
    quote: z.string().default(''),
  })).default([]),
  legal_references: z.array(z.record(z.string(), z.unknown())).default([]),
  recommendation: z.string().default(''),
  confidence,
  analysis_method: z.enum(['rule_based', 'llm', 'fallback', 'unknown']).catch('unknown'),
  model_name: z.string().nullable().optional(),
  decision_basis: z.string().default(''),
  needs_human_review: z.boolean().default(true),
  validation_status: z.string().default('pending'),
  validation_notes: z.array(z.string()).default([]),
  page_number: z.number().nullable().optional(),
});

export const backendJobSchema = z.object({
  job_id: z.string(),
  document_id: z.string(),
  filename: z.string(),
  size_bytes: z.number(),
  page_count: z.number(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  stage: z.string(),
  created_at: z.string(),
  completed_at: z.string().optional(),
  error: z.string().optional(),
  progress: backendProgressSchema,
  analysis_progress: z.record(z.string(), z.unknown()).optional(),
  extraction_quality: z.record(z.string(), z.unknown()).optional(),
  extraction_pages: z.array(z.record(z.string(), z.unknown())).optional(),
  analysis_configuration: z.record(z.string(), z.unknown()).optional(),
  validation_summary: z.record(z.string(), z.number()).optional(),
  findings: z.array(backendFindingSchema).default([]),
  report_available: z.boolean().optional(),
  report_url: z.string().nullable().optional(),
}).passthrough();

export const jobSummarySchema = z.object({
  job_id: z.string().default(''),
  total: z.number().default(0),
  by_level: z.record(z.string(), z.number()).default({}),
  by_category: z.record(z.string(), z.number()).default({}),
  needs_review: z.number().default(0),
  extraction_warnings: z.array(extractionWarningSchema).default([]),
});

export const jobReportSchema = z.object({
  job_id: z.string().default(''),
  status: z.enum(['generating_report', 'completed', 'failed']).catch('generating_report'),
  generated_at: z.string().optional(),
  download_url: z.string().optional(),
  executive_summary: z.string().optional(),
  limitations: z.array(z.string()).default([]),
});

export const documentPageSchema = z.object({
  page_number: z.number(),
  width: z.number().default(612),
  height: z.number().default(792),
  image_url: z.string().optional(),
  low_quality: z.boolean().default(false),
});

export const uploadResultSchema = z.object({
  job_id: z.string(),
  document_id: z.string().default(''),
  status: jobStatus,
});

export const jobListSchema = z.object({ jobs: z.array(analysisJobSchema) });
export const findingListSchema = z.object({ findings: z.array(findingSchema) });
export const pageListSchema = z.object({ pages: z.array(documentPageSchema) });
