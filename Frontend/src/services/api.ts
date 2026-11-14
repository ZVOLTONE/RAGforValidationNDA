/**
 * Satu-satunya lapisan API client (PRD §8).
 * Ganti path backend hanya di sini; semua respons divalidasi dengan Zod.
 */
import { z } from 'zod';

import { API_BASE_URL, USE_MOCK_DATA } from '@/config';
import * as mock from '@/services/mock-data';
import {
  analysisJobSchema,
  findingListSchema,
  findingSchema,
  jobListSchema,
  jobReportSchema,
  jobSummarySchema,
  pageListSchema,
  uploadResultSchema,
} from '@/services/schemas';
import type {
  AnalysisJob,
  DocumentPage,
  Finding,
  FindingFilterQuery,
  JobReport,
  JobSummary,
  UploadFile,
  UploadResult,
  ViewerData,
} from '@/types';

const requestTimeoutMs = 20_000;

export type ApiErrorCode =
  | 'network'
  | 'unauthorized'
  | 'invalid_response'
  | 'http'
  | 'timeout'
  | 'not_found';

export class ApiError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Terjadi kendala. Silakan coba lagi.';
}

function parsePayload<S extends z.ZodTypeAny>(schema: S, payload: unknown): z.output<S> {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ApiError('invalid_response', 'Respons server tidak sesuai kontrak data.');
  }
  return result.data;
}

function readErrorCode(payload: unknown): string | undefined {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.error_code === 'string') return record.error_code;
    if (record.detail && typeof record.detail === 'object') {
      const detail = record.detail as Record<string, unknown>;
      if (typeof detail.error_code === 'string') return detail.error_code;
    }
  }
  return undefined;
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
    });

    if (response.status === 401 || response.status === 403) {
      throw new ApiError('unauthorized', 'Akses ke pekerjaan ini ditolak atau sesi tidak valid.');
    }
    if (response.status === 404) {
      throw new ApiError('not_found', 'Data yang diminta tidak ditemukan.');
    }

    let payload: unknown = null;
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        throw new ApiError('invalid_response', 'Format respons server tidak dikenali.');
      }
    }

    if (!response.ok) {
      const code = readErrorCode(payload);
      throw new ApiError('http', `Permintaan gagal (${response.status})${code ? `: ${code}` : ''}.`);
    }
    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('timeout', 'Permintaan melebihi batas waktu. Silakan coba lagi.');
    }
    throw new ApiError(
      'network',
      'Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.',
    );
  } finally {
    clearTimeout(timer);
  }
}

function buildQuery(filters: FindingFilterQuery): string {
  const params: string[] = [];
  (Object.keys(filters) as (keyof FindingFilterQuery)[]).forEach((key) => {
    const value = filters[key];
    if (value) params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  });
  return params.length ? `?${params.join('&')}` : '';
}

/** URL absolut untuk tautan unduhan/berkas yang dikirim relatif oleh backend. */
export function absoluteUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  return `${API_BASE_URL.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
}

export async function uploadJob(
  file: UploadFile,
  onProgress?: (fraction: number) => void,
): Promise<UploadResult> {
  if (USE_MOCK_DATA) return mock.createMockJob(file, onProgress);

  return new Promise<UploadResult>((resolve, reject) => {
    const form = new FormData();
    if (file.file) {
      form.append('file', file.file as Blob, file.name);
    } else {
      form.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType ?? 'application/pdf',
      } as unknown as Blob);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/jobs`);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.timeout = 120_000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) onProgress?.(event.loaded / event.total);
    };
    xhr.onerror = () =>
      reject(
        new ApiError(
          'network',
          'Unggahan gagal karena kendala jaringan. Berkas Anda masih tersimpan, silakan coba lagi.',
        ),
      );
    xhr.ontimeout = () =>
      reject(new ApiError('timeout', 'Unggahan melebihi batas waktu. Silakan coba lagi.'));
    xhr.onload = () => {
      if (xhr.status === 401 || xhr.status === 403) {
        reject(new ApiError('unauthorized', 'Akses ditolak. Sesi Anda mungkin tidak valid.'));
        return;
      }
      let payload: unknown = null;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        reject(new ApiError('invalid_response', 'Format respons server tidak dikenali.'));
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        const detail = readErrorCode(payload);
        reject(new ApiError('http', `Unggahan ditolak${detail ? ` (${detail})` : ''}.`));
        return;
      }
      try {
        resolve(parsePayload(uploadResultSchema, payload));
      } catch (error) {
        reject(error);
      }
    };
    xhr.send(form);
  });
}

export async function listJobs(): Promise<AnalysisJob[]> {
  if (USE_MOCK_DATA) return mock.listMockJobs();
  const data = await request('/jobs');
  const payload = Array.isArray(data) ? { jobs: data } : data;
  return parsePayload(jobListSchema, payload).jobs;
}

export async function getJob(jobId: string): Promise<AnalysisJob> {
  if (USE_MOCK_DATA) return mock.getMockJob(jobId);
  return parsePayload(analysisJobSchema, await request(`/jobs/${encodeURIComponent(jobId)}`));
}

export async function getSummary(jobId: string): Promise<JobSummary> {
  if (USE_MOCK_DATA) return mock.getMockSummary(jobId);
  return parsePayload(
    jobSummarySchema,
    await request(`/jobs/${encodeURIComponent(jobId)}/summary`),
  );
}

export async function getFindings(
  jobId: string,
  filters: FindingFilterQuery = {},
): Promise<Finding[]> {
  if (USE_MOCK_DATA) return mock.getMockFindings(jobId, filters);
  const data = await request(`/jobs/${encodeURIComponent(jobId)}/findings${buildQuery(filters)}`);
  const payload = Array.isArray(data) ? { findings: data } : data;
  return parsePayload(findingListSchema, payload).findings;
}

export async function getFinding(findingId: string): Promise<Finding> {
  if (USE_MOCK_DATA) return mock.getMockFinding(findingId);
  return parsePayload(
    findingSchema,
    await request(`/findings/${encodeURIComponent(findingId)}`),
  );
}

export async function setFindingReview(findingId: string, needsReview: boolean): Promise<Finding> {
  if (USE_MOCK_DATA) return mock.setMockReview(findingId, needsReview);
  return parsePayload(
    findingSchema,
    await request(`/findings/${encodeURIComponent(findingId)}/review`, {
      method: 'POST',
      body: JSON.stringify({ needs_human_review: needsReview }),
    }),
  );
}

export async function getReport(jobId: string): Promise<JobReport> {
  if (USE_MOCK_DATA) return mock.getMockReport(jobId);
  const payload = parsePayload(
    jobReportSchema,
    await request(`/jobs/${encodeURIComponent(jobId)}/report`),
  );
  return { ...payload, download_url: absoluteUrl(payload.download_url) };
}

export async function getDocumentPages(
  documentId: string,
  pageCount: number,
): Promise<DocumentPage[]> {
  if (USE_MOCK_DATA) return mock.getMockPages(documentId);
  const data = await request(
    `/documents/${encodeURIComponent(documentId)}/pages?page_count=${pageCount}`,
  );
  const payload = Array.isArray(data) ? { pages: data } : data;
  return parsePayload(pageListSchema, payload).pages;
}

export function getDocumentFileUrl(documentId: string): string | undefined {
  if (USE_MOCK_DATA) return undefined;
  return `${API_BASE_URL}/documents/${encodeURIComponent(documentId)}/file`;
}

export async function getViewerData(jobId: string): Promise<ViewerData> {
  if (USE_MOCK_DATA) return mock.getMockViewerData(jobId);

  const job = await getJob(jobId);
  const findings = await getFindings(jobId);
  let pages: DocumentPage[] = [];
  try {
    pages = await getDocumentPages(job.document_id, job.page_count ?? 1);
  } catch {
    pages = [];
  }
  return { job, findings, pages };
}

export async function deleteJob(jobId: string): Promise<void> {
  if (USE_MOCK_DATA) {
    mock.deleteMockJob(jobId);
    return;
  }
  await request(`/jobs/${encodeURIComponent(jobId)}`, { method: 'DELETE' });
}
