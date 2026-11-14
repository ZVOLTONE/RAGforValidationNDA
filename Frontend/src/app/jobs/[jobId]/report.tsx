import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DisclaimerBanner } from '@/components/disclaimer-banner';
import { JobTabs } from '@/components/job-tabs';
import { Screen } from '@/components/screen';
import { InlineStatus, LoadingPanel, StatePanel } from '@/components/state-panel';
import { RiskBadge, ValidationBadge } from '@/components/status-badges';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LIMITATIONS, RISK_ORDER, RISK_META, categoryLabel } from '@/constants/design';
import { useAsyncData } from '@/hooks/use-async-data';
import { useDesign } from '@/hooks/use-design';
import { errorMessage, getFindings, getJob, getReport } from '@/services/api';
import type { Finding } from '@/types';
import { countByLevel, snippet, sortFindings } from '@/utils/findings';
import { formatDate } from '@/utils/format';
import { openExternalUrl } from '@/utils/open-url';

export default function ReportScreen() {
  const tokens = useDesign();
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const id = String(jobId);

  const jobData = useAsyncData(`report-job-${id}`, () => getJob(id));
  const reportData = useAsyncData(`report-${id}`, () => getReport(id));
  const findingsData = useAsyncData(`report-findings-${id}`, () => getFindings(id));

  const [downloading, setDownloading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const job = jobData.data;
  const report = reportData.data;
  const findings = findingsData.data ? sortFindings(findingsData.data) : [];
  const counts = countByLevel(findings);
  const ready = report?.status === 'completed' && !!report.download_url;

  const download = async () => {
    if (!report?.download_url) return;
    setDownloading(true);
    setActionError(null);
    try {
      await openExternalUrl(report.download_url);
    } catch (cause) {
      setActionError(errorMessage(cause));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Screen>
      {jobData.loading && !job ? <LoadingPanel label="Memuat laporan…" rows={3} /> : null}

      {jobData.error && !job ? (
        <StatePanel
          title="Laporan tidak dapat dimuat"
          message={jobData.error}
          actionLabel="Coba lagi"
          onAction={jobData.reload}
          tone="danger"
        />
      ) : null}

      {job ? (
        <>
          <JobTabs jobId={id} active="report" />

          <Card style={styles.header}>
            <Text style={[styles.docName, { color: tokens.text }]}>{job.document_name}</Text>
            <Text style={[styles.meta, { color: tokens.textSecondary }]}>
              Laporan analisis · Job ID {job.job_id}
            </Text>
            <View style={styles.headerActions}>
              <Button
                label="Unduh Laporan PDF"
                onPress={download}
                disabled={!ready}
                loading={downloading}
                accessibilityHint={
                  ready ? 'Membuka berkas laporan PDF' : 'Aktif setelah laporan selesai dibuat'
                }
              />
              {!ready ? (
                <Button
                  variant="secondary"
                  label="Muat ulang status"
                  onPress={reportData.reload}
                  small
                />
              ) : null}
            </View>
            {report?.status === 'generating_report' ? (
              <InlineStatus message="Laporan sedang dibuat. Tombol unduh aktif setelah proses selesai." />
            ) : null}
            {report?.status === 'failed' ? (
              <InlineStatus
                tone="danger"
                message="Pembuatan laporan gagal. Hasil analisis tetap tersedia di dashboard dan dapat Anda tinjau."
              />
            ) : null}
            {actionError ? <InlineStatus tone="danger" message={actionError} /> : null}
            {reportData.error ? (
              <InlineStatus
                tone="danger"
                message={`Status laporan tidak dapat dimuat: ${reportData.error}`}
              />
            ) : null}
          </Card>

          <DisclaimerBanner />

          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.text }]}>Identitas dokumen</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: tokens.textSecondary }]}>Dokumen</Text>
              <Text style={[styles.infoValue, { color: tokens.text }]}>{job.document_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: tokens.textSecondary }]}>Job ID</Text>
              <Text style={[styles.infoValue, { color: tokens.text }]}>{job.job_id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: tokens.textSecondary }]}>Tanggal analisis</Text>
              <Text style={[styles.infoValue, { color: tokens.text }]}>
                {formatDate(job.completed_at ?? job.created_at)}
              </Text>
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={[styles.aiLabel, { color: tokens.textSecondary }]}>Analisis AI</Text>
            <Text style={[styles.sectionTitle, { color: tokens.text }]}>Ringkasan eksekutif</Text>
            <Text style={[styles.body, { color: tokens.text }]}>
              {report?.executive_summary ??
                'Ringkasan eksekutif belum tersedia dari backend. Daftar temuan di bawah tetap dapat ditinjau.'}
            </Text>
          </Card>

          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.text }]}>Ringkasan level risiko</Text>
            {RISK_ORDER.map((level) => (
              <View key={level} style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: tokens.textSecondary }]}>
                  {RISK_META[level].label}
                </Text>
                <Text style={[styles.infoValue, { color: tokens.text }]}>{counts[level]}</Text>
              </View>
            ))}
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: tokens.textSecondary }]}>Total temuan</Text>
              <Text style={[styles.infoValue, { color: tokens.text }]}>{findings.length}</Text>
            </View>
          </Card>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.text }]}>Daftar temuan dan bukti</Text>
            {findings.length === 0 ? (
              <StatePanel
                title="Belum ada temuan pada laporan"
                message="Laporan tidak menyimpulkan dokumen aman. Analisis hanya mencakup teks yang berhasil diekstrak dan memerlukan peninjauan manusia."
              />
            ) : (
              findings.map((finding: Finding) => (
                <Card key={finding.finding_id} style={styles.findingCard}>
                  <View style={styles.findingTop}>
                    <Text style={[styles.findingId, { color: tokens.textSecondary }]}>
                      {finding.finding_id} · Klausul {finding.clause_number ?? '—'} · Hal.{' '}
                      {finding.evidence[0]?.page_number ?? '—'}
                    </Text>
                    <RiskBadge level={finding.risk_level} />
                  </View>
                  <Text style={[styles.findingCategory, { color: tokens.text }]}>
                    {categoryLabel(finding.risk_category)}
                  </Text>
                  <Text style={[styles.quoteText, { color: tokens.textSecondary }]}>
                    “{snippet(finding.evidence[0]?.quote ?? '', 180)}”
                  </Text>
                  <Text style={[styles.body, { color: tokens.text }]}>
                    {finding.reasoning_summary}
                  </Text>
                  <Text style={[styles.recommendation, { color: tokens.text }]}>
                    <Text style={{ fontWeight: '700' }}>Rekomendasi: </Text>
                    {finding.recommendation}
                  </Text>
                  <ValidationBadge status={finding.validation_status} />
                </Card>
              ))
            )}
          </View>

          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.text }]}>
              Keterbatasan dan kebutuhan peninjauan
            </Text>
            {(report?.limitations?.length ? report.limitations : LIMITATIONS).map((item) => (
              <Text key={item} style={[styles.body, { color: tokens.textSecondary }]}>
                • {item}
              </Text>
            ))}
          </Card>

          <Button
            variant="secondary"
            label="Kembali ke dashboard"
            onPress={() => router.push({ pathname: '/jobs/[jobId]/dashboard', params: { jobId: id } })}
          />
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
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  findingCard: {
    gap: 8,
  },
  findingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  findingId: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  findingCategory: {
    fontSize: 15,
    fontWeight: '700',
  },
  quoteText: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  recommendation: {
    fontSize: 13,
    lineHeight: 20,
  },
});
