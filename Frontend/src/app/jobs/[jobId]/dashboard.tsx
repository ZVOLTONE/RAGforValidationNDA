import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DisclaimerBanner } from '@/components/disclaimer-banner';
import { FindingFilters, type DashboardFilters } from '@/components/finding-filters';
import { CategoryBreakdown, RiskDistribution, SummaryCards } from '@/components/finding-summary';
import { FindingsTable } from '@/components/findings-table';
import { JobTabs } from '@/components/job-tabs';
import { Screen } from '@/components/screen';
import { InlineStatus, LoadingPanel, StatePanel } from '@/components/state-panel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAsyncData } from '@/hooks/use-async-data';
import { useDesign } from '@/hooks/use-design';
import { CATEGORY_META, categoryLabel } from '@/constants/design';
import {
  errorMessage,
  getFindings,
  getJob,
  getReport,
  getSummary,
  setFindingReview,
} from '@/services/api';
import type { Finding, ExtractionWarning } from '@/types';
import { sortFindings } from '@/utils/findings';
import { formatDate } from '@/utils/format';
import { openExternalUrl } from '@/utils/open-url';

export default function DashboardScreen() {
  const tokens = useDesign();
  const router = useRouter();
  const params = useLocalSearchParams<{
    jobId: string;
    level?: string;
    category?: string;
    finding_type?: string;
    validation_status?: string;
    show_no_issue?: string;
  }>();

  const jobId = String(params.jobId);
  const filters: DashboardFilters = {
    level: params.level || undefined,
    category: params.category || undefined,
    finding_type: params.finding_type || undefined,
    validation_status: params.validation_status || undefined,
  };
  const showNoIssue = params.show_no_issue !== '0';
  const filterKey = `${jobId}|${filters.level ?? ''}|${filters.category ?? ''}|${
    filters.finding_type ?? ''
  }|${filters.validation_status ?? ''}`;

  const jobData = useAsyncData(`job-${jobId}`, () => getJob(jobId));
  const summaryData = useAsyncData(`summary-${jobId}`, () => getSummary(jobId));
  const findingsData = useAsyncData(`findings-${filterKey}`, () => getFindings(jobId, filters));

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const reloadFindings = findingsData.reload;
  const loadedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (loadedOnce.current) reloadFindings();
      else loadedOnce.current = true;
    }, [reloadFindings]),
  );

  const job = jobData.data;
  const findings = findingsData.data ? sortFindings(findingsData.data) : null;

  const noIssueFindings =
    filters.finding_type && filters.finding_type !== 'no_issue_identified'
      ? []
      : (findings ?? []).filter((finding) => finding.finding_type === 'no_issue_identified');
  const riskFindings =
    filters.finding_type === 'no_issue_identified'
      ? []
      : (findings ?? []).filter((finding) => finding.finding_type !== 'no_issue_identified');

  const hasFilters = Object.values(filters).some(Boolean);
  const warnings: ExtractionWarning[] =
    summaryData.data?.extraction_warnings ?? job?.extraction_warnings ?? [];

  const updateFilters = (patch: Partial<DashboardFilters>) => {
    const next = { ...filters, ...patch };
    router.setParams({
      level: next.level ?? '',
      category: next.category ?? '',
      finding_type: next.finding_type ?? '',
      validation_status: next.validation_status ?? '',
    });
  };

  const resetFilters = () =>
    router.setParams({ level: '', category: '', finding_type: '', validation_status: '' });

  const toggleReview = async (finding: Finding) => {
    setUpdatingId(finding.finding_id);
    setActionError(null);
    try {
      await setFindingReview(finding.finding_id, !finding.needs_human_review);
      findingsData.reload();
      summaryData.reload();
    } catch (cause) {
      setActionError(errorMessage(cause));
    } finally {
      setUpdatingId(null);
    }
  };

  const openPdf = (finding: Finding) => {
    router.push({
      pathname: '/jobs/[jobId]/viewer',
      params: {
        jobId,
        finding: finding.finding_id,
        page: String(finding.bounding_boxes[0]?.page ?? finding.evidence[0]?.page_number ?? 1),
      },
    });
  };

  const downloadReport = async () => {
    setDownloading(true);
    setActionError(null);
    try {
      const report = await getReport(jobId);
      if (report.status === 'completed' && report.download_url) {
        await openExternalUrl(report.download_url);
      } else {
        router.push({ pathname: '/jobs/[jobId]/report', params: { jobId } });
      }
    } catch (cause) {
      setActionError(errorMessage(cause));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Screen>
      {jobData.loading && !job ? <LoadingPanel label="Memuat ringkasan analisis…" rows={3} /> : null}

      {jobData.error && !job ? (
        <StatePanel
          title="Dashboard tidak dapat dimuat"
          message={jobData.error}
          actionLabel="Coba lagi"
          onAction={jobData.reload}
          tone="danger"
        />
      ) : null}

      {job ? (
        <>
          <JobTabs jobId={jobId} active="dashboard" />

          <Card style={styles.header}>
            <Text style={[styles.docName, { color: tokens.text }]}>{job.document_name}</Text>
            <Text style={[styles.meta, { color: tokens.textSecondary }]}>
              Job ID {job.job_id} · Analisis {formatDate(job.completed_at ?? job.created_at)}
            </Text>
            <View style={styles.headerActions}>
              <Button
                label="Unduh laporan"
                onPress={downloadReport}
                loading={downloading}
                small
              />
              <Button
                variant="secondary"
                label="Buka viewer"
                small
                onPress={() =>
                  router.push({ pathname: '/jobs/[jobId]/viewer', params: { jobId } })
                }
              />
            </View>
          </Card>

          <DisclaimerBanner />

          {warnings.length > 0 ? (
            <Card style={styles.warningCard}>
              <Text style={[styles.warningTitle, { color: tokens.dark ? '#FFD08A' : '#7A4B00' }]}>
                Peringatan ekstraksi dokumen
              </Text>
              <Text style={[styles.meta, { color: tokens.textSecondary }]}>
                Sebagian halaman tidak terbaca dengan baik, sehingga analisis tidak dapat dianggap
                mencakup seluruh isi dokumen:
              </Text>
              {warnings.map((warning) => (
                <Text
                  key={`${warning.page_number}-${warning.kind}`}
                  style={[styles.meta, { color: tokens.text }]}
                >
                  • Halaman {warning.page_number} —{' '}
                  {warning.kind === 'low_quality' ? 'kualitas OCR rendah' : 'ekstraksi gagal'}
                  {warning.message ? `: ${warning.message}` : ''}
                </Text>
              ))}
            </Card>
          ) : null}

          {actionError ? <InlineStatus tone="danger" message={actionError} /> : null}

          {findingsData.loading && !findings ? (
            <LoadingPanel label="Memuat daftar temuan…" rows={5} />
          ) : null}

          {findings ? (
            <>
              <SummaryCards findings={findings} />

              <View style={styles.distributionRow}>
                <Card style={styles.distributionCard}>
                  <Text style={[styles.sectionTitle, { color: tokens.text }]}>
                    Distribusi tingkat risiko
                  </Text>
                  <RiskDistribution findings={findings} />
                </Card>
                <Card style={styles.distributionCard}>
                  <Text style={[styles.sectionTitle, { color: tokens.text }]}>
                    Jumlah per kategori
                  </Text>
                  <CategoryBreakdown findings={findings} />
                </Card>
              </View>

              {hasFilters ? (
                <InlineStatus message="Ringkasan dan distribusi mengikuti filter yang sedang aktif." />
              ) : null}

              <Card style={styles.filterCard}>
                <FindingFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />
              </Card>

              {findings.length === 0 && !hasFilters ? (
                <StatePanel
                  title="Belum ditemukan isu berdasarkan analisis saat ini"
                  message="Tidak adanya temuan tidak berarti dokumen aman. Analisis hanya mencakup teks yang berhasil diekstrak dan tetap memerlukan peninjauan manusia."
                  actionLabel="Unggah dokumen lain"
                  onAction={() => router.push('/')}
                />
              ) : null}

              {findings.length === 0 && hasFilters ? (
                <StatePanel
                  title="Tidak ada temuan yang cocok"
                  message="Tidak ada temuan yang sesuai dengan kombinasi filter saat ini. Ini bukan kesimpulan bahwa dokumen aman."
                  actionLabel="Reset filter"
                  onAction={resetFilters}
                />
              ) : null}

              {riskFindings.length > 0 ? (
                <View style={styles.listSection}>
                  <Text style={[styles.sectionTitle, { color: tokens.text }]}>
                    Daftar temuan ({riskFindings.length})
                  </Text>
                  <FindingsTable
                    findings={riskFindings}
                    updatingId={updatingId}
                    onOpen={(finding) =>
                      router.push({
                        pathname: '/jobs/[jobId]/findings/[findingId]',
                        params: { jobId, findingId: finding.finding_id },
                      })
                    }
                    onOpenPdf={openPdf}
                    onToggleReview={toggleReview}
                  />
                </View>
              ) : null}

              {noIssueFindings.length > 0 && !hasFilters ? (
                <Card style={styles.noIssueCard}>
                  <View style={styles.noIssueHeader}>
                    <Text style={[styles.sectionTitle, { color: tokens.text }]}>
                      Klausul tanpa isu ({noIssueFindings.length})
                    </Text>
                    <Button
                      small
                      variant="ghost"
                      label={showNoIssue ? 'Sembunyikan' : 'Tampilkan'}
                      onPress={() =>
                        router.setParams({ show_no_issue: showNoIssue ? '0' : '1' })
                      }
                    />
                  </View>
                  {showNoIssue
                    ? noIssueFindings.map((finding) => (
                        <View
                          key={finding.finding_id}
                          style={[styles.noIssueRow, { borderTopColor: tokens.border }]}
                        >
                          <Text style={[styles.meta, { color: tokens.textSecondary }]}>
                            {finding.finding_id} · Halaman{' '}
                            {finding.evidence[0]?.page_number ?? '—'} ·{' '}
                            {categoryLabel(finding.risk_category)}
                          </Text>
                          <Text style={[styles.noIssueText, { color: tokens.text }]}>
                            {finding.reasoning_summary}
                          </Text>
                        </View>
                      ))
                    : null}
                </Card>
              ) : null}

              {filters.category && !CATEGORY_META[filters.category] ? (
                <InlineStatus message="Kategori tidak dikenal ditampilkan sebagai “Lainnya”." />
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
  },
  docName: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    lineHeight: 18,
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  warningCard: {
    gap: 6,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  distributionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  distributionCard: {
    flexGrow: 1,
    flexBasis: 320,
    gap: 12,
  },
  filterCard: {
    padding: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  listSection: {
    gap: 10,
  },
  noIssueCard: {
    gap: 10,
  },
  noIssueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  noIssueRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 4,
  },
  noIssueText: {
    fontSize: 13,
    lineHeight: 19,
  },
});
