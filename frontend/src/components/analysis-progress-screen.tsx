import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import PipelineNeuralGraph from '@/components/pipeline-neural-graph';
import { Screen } from '@/components/screen';
import { InlineStatus, LoadingPanel, StatePanel } from '@/components/state-panel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDesign } from '@/hooks/use-design';
import { useJobPolling } from '@/hooks/use-job-polling';
import { absoluteUrl } from '@/services/api';
import type { BackendFinding, BackendJob, ProcessStep } from '@/types';
import { openExternalUrl } from '@/utils/open-url';

const STAGE_LABEL: Record<string, string> = {
  queued: 'Dokumen diterima',
  document_extraction: 'Ekstraksi dokumen dan OCR',
  clause_identification: 'Segmentasi klausul',
  ai_analysis: 'Analisis risiko dan referensi hukum',
  validating: 'Validasi bukti',
  artifact_generation: 'Pembuatan laporan',
  completed: 'Pemrosesan selesai',
};

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function resultLines(step: ProcessStep): string[] {
  const details = step.details ?? {};
  if (step.stage === 'document_extraction') {
    const quality = details.quality as Record<string, unknown> | undefined;
    const pages = numberValue(quality?.total_pages);
    const usable = numberValue(quality?.usable_pages);
    const ocr = numberValue(quality?.ocr_pages && Array.isArray(quality.ocr_pages) ? quality.ocr_pages.length : undefined);
    return [
      pages !== undefined ? `${usable ?? 0} dari ${pages} halaman berhasil dibaca.` : 'Ekstraksi halaman selesai.',
      ocr !== undefined ? `${ocr} halaman menggunakan OCR.` : 'Metode ekstraksi tersedia pada rincian halaman.',
    ];
  }
  if (step.stage === 'clause_identification') {
    return [
      `${numberValue(details.clause_count) ?? 0} klausul berhasil diidentifikasi.`,
      `${numberValue(details.needs_review_count) ?? 0} klausul ditandai untuk pemeriksaan.`
    ];
  }
  if (step.stage === 'ai_analysis') {
    const methods = details.analysis_method_counts as Record<string, unknown> | undefined;
    const llm = stringValue(details.llm_model) ?? 'tidak tersedia';
    return [
      `${numberValue(details.findings_count) ?? 0} keluaran analisis dibuat.`,
      `Model: ${llm}; rule-based ${numberValue(methods?.rule_based) ?? 0}, model ${numberValue(methods?.llm) ?? 0}, fallback ${numberValue(methods?.fallback) ?? 0}.`,
      'Pemetaan referensi hukum berlangsung di dalam proses analisis klausul.'
    ];
  }
  if (step.stage === 'validating') {
    return [
      `${numberValue(details.validated) ?? 0} temuan tervalidasi sistem.`,
      `${numberValue(details.needs_review) ?? 0} temuan memerlukan tinjauan manusia.`
    ];
  }
  if (step.stage === 'artifact_generation') {
    return [
      details.report_available ? 'Dokumen laporan PDF siap dibuka.' : 'Laporan belum tersedia.',
      `${numberValue(details.highlighted_quotes) ?? 0} kutipan berhasil ditandai pada dokumen sumber.`
    ];
  }
  return [step.message ?? 'Tahap selesai.'];
}

function statusLabel(status: string): string {
  if (status === 'completed') return 'Selesai';
  if (status === 'failed') return 'Gagal';
  if (status === 'running') return 'Berlangsung';
  return 'Menunggu';
}

function ProcessLog({ job }: { job: BackendJob }) {
  const tokens = useDesign();
  const steps = job.progress?.steps ?? [];
  const currentAnalysis = job.analysis_progress;
  return (
    <View style={styles.logList}>
      {steps.map((step, index) => (
        <View key={`${step.stage}-${index}`} style={[styles.logItem, { borderBottomColor: tokens.border }]}>
          <View style={styles.logHeading}>
            <Text style={[styles.logTitle, { color: tokens.text }]}>{STAGE_LABEL[step.stage] ?? step.stage}</Text>
            <Text style={[styles.logStatus, { color: step.status === 'failed' ? tokens.danger : step.status === 'completed' ? '#267044' : tokens.primary }]}>
              {statusLabel(step.status)}
            </Text>
          </View>
          <Text selectable style={[styles.logMessage, { color: tokens.textSecondary }]}>{step.message}</Text>
          {step.details ? resultLines(step).map((line) => (
            <Text selectable key={line} style={[styles.logResult, { color: tokens.text }]}>{line}</Text>
          )) : null}
          {step.stage === 'ai_analysis' && step.status === 'running' && currentAnalysis ? (
            <Text selectable style={[styles.logResult, { color: tokens.primary }]}>
              Klausul {stringValue(currentAnalysis.current_clause_id) ?? '—'} · {numberValue(currentAnalysis.completed_clauses) ?? 0}/{numberValue(currentAnalysis.total_clauses) ?? 0} selesai · {numberValue(currentAnalysis.findings_so_far) ?? 0} keluaran sementara
            </Text>
          ) : null}
        </View>
      ))}
      {!steps.length ? (
        <Text style={[styles.logMessage, { color: tokens.textSecondary }]}>
          {job.progress?.message ?? 'Menunggu proses dimulai.'}
        </Text>
      ) : null}
    </View>
  );
}

function FindingOutput({ finding, index }: { finding: BackendFinding; index: number }) {
  const tokens = useDesign();
  const evidence = finding.evidence[0];
  const sourceLabel = finding.analysis_method === 'rule_based'
    ? 'Aturan screening'
    : finding.analysis_method === 'llm'
      ? `Model ${finding.model_name ?? 'AI'}`
      : 'Fallback';
  return (
    <View style={[styles.findingRow, { borderBottomColor: tokens.border }]}>
      <View style={styles.findingTop}>
        <Text style={[styles.findingNumber, { color: tokens.textSecondary }]}>Temuan {String(index + 1).padStart(2, '0')}</Text>
        <Text style={[styles.findingRisk, { color: finding.risk_level === 'critical' || finding.risk_level === 'high' ? tokens.danger : tokens.primary }]}>
          {finding.risk_level.toUpperCase()}
        </Text>
      </View>
      <Text style={[styles.findingType, { color: tokens.text }]}>{finding.finding_type.replaceAll('_', ' ')} · {finding.risk_category.replaceAll('_', ' ')}</Text>
      <Text selectable style={[styles.findingBasis, { color: tokens.textSecondary }]}>{finding.reasoning_summary || finding.decision_basis}</Text>
      {evidence?.quote ? <Text selectable style={[styles.quote, { color: tokens.text, backgroundColor: tokens.surfaceMuted }]}>{`“${evidence.quote}”`}</Text> : null}
      <View style={styles.findingMeta}>
        <Text style={[styles.metaText, { color: tokens.textSecondary }]}>{sourceLabel} · keyakinan {finding.confidence}</Text>
        <Text style={[styles.metaText, { color: finding.needs_human_review ? '#8A5A00' : '#267044' }]}>
          {finding.needs_human_review ? 'Perlu tinjauan manusia' : 'Tinjauan selesai'}
        </Text>
      </View>
    </View>
  );
}

export default function AnalysisProgressScreen() {
  const tokens = useDesign();
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const id = String(jobId);
  const { job, error, loading, retry } = useJobPolling(id);
  const [reportError, setReportError] = useState<string | null>(null);
  const [openingReport, setOpeningReport] = useState(false);

  const openReport = async () => {
    if (!job?.report_url) return;
    setOpeningReport(true);
    setReportError(null);
    try {
      const url = absoluteUrl(job.report_url);
      if (url) await openExternalUrl(url);
    } catch {
      setReportError('Dokumen hasil belum dapat dibuka. Coba lagi dari perangkat Anda.');
    } finally {
      setOpeningReport(false);
    }
  };

  return (
    <Screen contentStyle={styles.screenContent}>
      <View style={styles.pageHeading}>
        <View style={styles.headingCopy}>
          <Text style={[styles.eyebrow, { color: tokens.primary }]}>ANALISIS DOKUMEN</Text>
          <Text style={[styles.pageTitle, { color: tokens.text }]}>Status pemrosesan</Text>
          <Text style={[styles.pageSubtitle, { color: tokens.textSecondary }]}>Setiap tahap dan keluaran dicatat agar proses analisis dapat ditinjau.</Text>
        </View>
        <Button variant="secondary" label="Daftar pekerjaan" small onPress={() => router.replace('/jobs')} />
      </View>

      {loading && !job ? <LoadingPanel label="Menghubungkan ke backend…" rows={3} /> : null}
      {!job && error ? <StatePanel title="Status tidak dapat dimuat" message={error} actionLabel="Coba lagi" onAction={retry} tone="danger" /> : null}

      {job ? (
        <>
          <Card style={styles.jobHeader}>
            <View style={styles.jobIdentity}>
              <View style={[styles.fileMark, { backgroundColor: tokens.primarySoft }]}><Text style={[styles.fileMarkText, { color: tokens.primary }]}>PDF</Text></View>
              <View style={styles.headingCopy}>
                <Text style={[styles.documentName, { color: tokens.text }]} numberOfLines={1}>{job.filename}</Text>
                <Text style={[styles.metaText, { color: tokens.textSecondary }]}>{job.page_count} halaman · ID {job.job_id}</Text>
              </View>
            </View>
            <View style={[styles.statusPill, { backgroundColor: job.status === 'failed' ? tokens.dangerSoft : job.status === 'completed' ? '#E8F4EC' : tokens.primarySoft }]}>
              {job.status === 'processing' || job.status === 'queued' ? <ActivityIndicator size="small" color={tokens.primary} /> : null}
              <Text style={[styles.statusText, { color: job.status === 'failed' ? tokens.danger : job.status === 'completed' ? '#267044' : tokens.primary }]}>
                {job.status === 'completed' ? 'Selesai' : job.status === 'failed' ? 'Gagal' : job.status === 'queued' ? 'Dalam antrean' : 'Sedang diproses'}
              </Text>
            </View>
          </Card>

          <View style={styles.mainGrid}>
            <Card style={styles.graphCard}>
              <View style={styles.cardHeading}>
                <Text style={[styles.sectionTitle, { color: tokens.text }]}>Peta proses</Text>
                <Text style={[styles.metaText, { color: tokens.textSecondary }]}>{job.progress?.percent ?? 0}% tahap aktif</Text>
              </View>
              <PipelineNeuralGraph stage={job.stage} status={job.status} percent={job.progress?.percent ?? 0} message={job.progress?.message} />
              <Text style={[styles.graphCaption, { color: tokens.textSecondary }]}>
                Referensi hukum dipetakan selama analisis AI per klausul; validasi bukti dilaporkan sebagai tahap terpisah.
              </Text>
            </Card>

            <Card style={styles.logCard}>
              <View style={styles.cardHeading}>
                <Text style={[styles.sectionTitle, { color: tokens.text }]}>Log proses</Text>
                <Text style={[styles.metaText, { color: tokens.textSecondary }]} selectable>{job.progress?.updated_at ? new Date(job.progress.updated_at).toLocaleTimeString() : '—'}</Text>
              </View>
              <ProcessLog job={job} />
              {job.status === 'failed' ? (
                <View style={[styles.errorBox, { backgroundColor: tokens.dangerSoft }]}>
                  <Text style={[styles.errorTitle, { color: tokens.danger }]}>Proses dihentikan</Text>
                  <Text selectable style={[styles.logMessage, { color: tokens.text }]}>{job.error ?? 'Backend tidak memberikan rincian error.'}</Text>
                </View>
              ) : null}
            </Card>
          </View>

          {job.status === 'completed' ? (
            <Card style={styles.resultDocument}>
              <View style={styles.resultCopy}>
                <Text style={[styles.eyebrow, { color: tokens.primary }]}>DOKUMEN HASIL</Text>
                <Text style={[styles.resultTitle, { color: tokens.text }]}>Laporan analisis siap ditinjau</Text>
                <Text style={[styles.metaText, { color: tokens.textSecondary }]}>
                  {job.findings.length} keluaran · {job.validation_summary?.needs_review ?? 0} perlu tinjauan · {job.validation_summary?.validated ?? 0} tervalidasi sistem
                </Text>
                <Text style={[styles.resultNote, { color: tokens.textSecondary }]}>Laporan ini merupakan bantuan analisis. Verifikasi bukti dan referensi sebelum mengambil keputusan.</Text>
              </View>
              <Button label={openingReport ? 'Membuka dokumen…' : 'Buka laporan PDF'} loading={openingReport} disabled={!job.report_available} onPress={openReport} />
              {!job.report_available ? <Text style={[styles.metaText, { color: tokens.textSecondary }]}>Laporan PDF belum tersedia.</Text> : null}
            </Card>
          ) : null}
          {reportError ? <InlineStatus tone="danger" message={reportError} /> : null}

          {job.findings.length ? (
            <Card style={styles.outputsCard}>
              <View style={styles.cardHeading}>
                <Text style={[styles.sectionTitle, { color: tokens.text }]}>Keluaran analisis</Text>
                <Text style={[styles.metaText, { color: tokens.textSecondary }]}>{job.findings.length} temuan tercatat</Text>
              </View>
              {job.findings.map((finding, index) => <FindingOutput key={finding.finding_id} finding={finding} index={index} />)}
            </Card>
          ) : null}

          <View style={[styles.ethicsNote, { borderColor: tokens.border, backgroundColor: tokens.surfaceMuted }]}>
            <Text style={[styles.ethicsTitle, { color: tokens.text }]}>Transparansi dan batasan</Text>
            <Text selectable style={[styles.metaText, { color: tokens.textSecondary }]}>Status model, metode, keyakinan, kutipan bukti, dan validasi ditampilkan per keluaran. Sistem tidak menetapkan pelanggaran hukum final; tinjauan manusia tetap diperlukan.</Text>
          </View>
        </>
      ) : null}
      {error && job ? <InlineStatus tone="danger" message={`${error} Mencoba menghubungkan kembali…`} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { maxWidth: 1360, gap: 18 },
  pageHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  headingCopy: { flex: 1, minWidth: 220, gap: 4 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  pageTitle: { fontSize: 26, lineHeight: 34, fontWeight: '700' },
  pageSubtitle: { fontSize: 13, lineHeight: 19 },
  jobHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' },
  jobIdentity: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 220 },
  fileMark: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  fileMarkText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  documentName: { fontSize: 16, fontWeight: '700' },
  metaText: { fontSize: 11, lineHeight: 17 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '700' },
  mainGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: 16 },
  graphCard: { flexGrow: 1, flexBasis: 560, minWidth: 320, gap: 14 },
  logCard: { flexGrow: 1, flexBasis: 420, minWidth: 310, gap: 12 },
  cardHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  graphCaption: { fontSize: 11, lineHeight: 17 },
  logList: { gap: 0 },
  logItem: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 5 },
  logHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  logTitle: { flex: 1, fontSize: 12, fontWeight: '700' },
  logStatus: { fontSize: 10, fontWeight: '700' },
  logMessage: { fontSize: 11, lineHeight: 16 },
  logResult: { fontSize: 11, lineHeight: 16 },
  errorBox: { padding: 12, borderRadius: 10, gap: 4, marginTop: 6 },
  errorTitle: { fontSize: 12, fontWeight: '700' },
  resultDocument: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap', borderColor: '#B7D8C1' },
  resultCopy: { flex: 1, minWidth: 240, gap: 5 },
  resultTitle: { fontSize: 18, fontWeight: '700' },
  resultNote: { maxWidth: 720, fontSize: 11, lineHeight: 17 },
  outputsCard: { gap: 4 },
  findingRow: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 6 },
  findingTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  findingNumber: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  findingRisk: { fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  findingType: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  findingBasis: { fontSize: 12, lineHeight: 18 },
  quote: { fontSize: 11, lineHeight: 17, padding: 10, borderRadius: 8 },
  findingMeta: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  ethicsNote: { padding: 13, borderWidth: 1, borderRadius: 10, gap: 5 },
  ethicsTitle: { fontSize: 12, fontWeight: '700' },
});
