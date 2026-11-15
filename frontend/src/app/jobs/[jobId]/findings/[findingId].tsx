import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { JobTabs } from '@/components/job-tabs';
import { QuoteBlock } from '@/components/quote-block';
import { Screen } from '@/components/screen';
import { InlineStatus, LoadingPanel, StatePanel } from '@/components/state-panel';
import { BadgeRow, FindingTypeBadge, ReviewFlag, RiskBadge, ValidationBadge } from '@/components/status-badges';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CONFIDENCE_LABEL, LIMITATIONS, categoryLabel } from '@/constants/design';
import { useAsyncData } from '@/hooks/use-async-data';
import { useDesign } from '@/hooks/use-design';
import { errorMessage, getFinding, getFindings, setFindingReview } from '@/services/api';
import { findingPage, hasLocation, sortFindings } from '@/utils/findings';

export default function FindingDetailScreen() {
  const tokens = useDesign();
  const router = useRouter();
  const { jobId, findingId } = useLocalSearchParams<{ jobId: string; findingId: string }>();
  const id = String(findingId);

  const findingData = useAsyncData(`finding-${id}`, () => getFinding(id));
  const siblingsData = useAsyncData(`findings-${jobId}`, () => getFindings(String(jobId)));

  const [reviewOverride, setReviewOverride] = useState<{ findingId: string; value: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const finding = findingData.data;
  const needsReview = finding
    ? reviewOverride?.findingId === finding.finding_id
      ? reviewOverride.value
      : finding.needs_human_review
    : null;
  const ordered = siblingsData.data ? sortFindings(siblingsData.data) : [];
  const index = ordered.findIndex((item) => item.finding_id === id);
  const previous = index > 0 ? ordered[index - 1] : null;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null;

  const toggleReview = async () => {
    if (!finding || needsReview === null) return;
    setSaving(true);
    setActionError(null);
    try {
      const updated = await setFindingReview(finding.finding_id, !needsReview);
      setReviewOverride({ findingId: finding.finding_id, value: updated.needs_human_review });
      siblingsData.reload();
    } catch (cause) {
      setActionError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  const goToFinding = (targetId: string) => {
    router.replace({
      pathname: '/jobs/[jobId]/findings/[findingId]',
      params: { jobId: String(jobId), findingId: targetId },
    });
  };

  return (
    <Screen>
      <View style={styles.topBar}>
        <Button
          variant="ghost"
          label="← Kembali ke dashboard"
          onPress={() =>
            router.push({ pathname: '/jobs/[jobId]/dashboard', params: { jobId: String(jobId) } })
          }
        />
      </View>

      {findingData.loading && !finding ? (
        <LoadingPanel label="Memuat detail temuan…" rows={5} />
      ) : null}

      {findingData.error && !finding ? (
        <StatePanel
          title="Temuan tidak dapat dimuat"
          message={findingData.error}
          actionLabel="Coba lagi"
          onAction={findingData.reload}
          tone="danger"
        />
      ) : null}

      {finding ? (
        <>
          <Card style={styles.headerCard}>
            <View style={styles.headerTop}>
              <Text style={[styles.findingId, { color: tokens.textSecondary }]}>
                {finding.finding_id}
              </Text>
              <Text style={[styles.meta, { color: tokens.textSecondary }]}>
                Klausul {finding.clause_number ?? '—'} · Halaman{' '}
                {finding.evidence[0]?.page_number ?? '—'}
              </Text>
            </View>
            <Text style={[styles.category, { color: tokens.text }]}>
              {categoryLabel(finding.risk_category)}
            </Text>
            <BadgeRow>
              <RiskBadge level={finding.risk_level} />
              <FindingTypeBadge type={finding.finding_type} />
              <ValidationBadge status={finding.validation_status} />
              {needsReview ? <ReviewFlag /> : null}
            </BadgeRow>
          </Card>

          {finding.validation_status === 'failed' ? (
            <Card style={[styles.alertCard, { borderColor: tokens.danger }]}>
              <Text style={[styles.alertTitle, { color: tokens.danger }]}>Bukti tidak cocok</Text>
              <Text style={[styles.body, { color: tokens.textSecondary }]}>
                Kutipan pada temuan ini tidak cocok dengan sumber yang berhasil diekstrak. Jangan
                anggap temuan ini sebagai fakta terkonfirmasi; periksa dokumen asli terlebih dahulu.
              </Text>
            </Card>
          ) : null}

          {finding.finding_type === 'potential_legal_issue' ? (
            <Card style={styles.infoCard}>
              <Text style={[styles.body, { color: tokens.text }]}>
                Indikasi yang memerlukan verifikasi, bukan putusan pelanggaran.
              </Text>
            </Card>
          ) : null}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.text }]}>Bukti klausul</Text>
            {finding.evidence.length ? (
              finding.evidence.map((evidence, position) => (
                <QuoteBlock
                  key={`${evidence.page_number}-${position}`}
                  quote={evidence.quote}
                  pageNumber={evidence.page_number}
                  clauseNumber={finding.clause_number}
                />
              ))
            ) : (
              <InlineStatus tone="danger" message="Kutipan sumber tidak tersedia pada respons backend." />
            )}
          </View>

          <Card style={styles.sectionCard}>
            <Text style={[styles.aiLabel, { color: tokens.textSecondary }]}>Analisis AI</Text>
            <Text style={[styles.sectionTitle, { color: tokens.text }]}>Alasan temuan</Text>
            <Text style={[styles.body, { color: tokens.text }]}>{finding.reasoning_summary}</Text>
          </Card>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: tokens.text }]}>
              Referensi hukum dan keamanan
            </Text>
            {finding.legal_references.length ? (
              finding.legal_references.map((reference) => (
                <Card key={reference.source_id + reference.document_title} style={styles.referenceCard}>
                  <Text style={[styles.referenceTitle, { color: tokens.text }]}>
                    {reference.document_title}
                  </Text>
                  <Text style={[styles.meta, { color: tokens.textSecondary }]}>
                    {reference.article ? `${reference.article} · ` : ''}
                    {reference.version ? `Versi ${reference.version} · ` : ''}
                    {reference.page_number ? `Halaman ${reference.page_number}` : 'Halaman tidak tersedia'}
                  </Text>
                  <View
                    style={[
                      styles.verifiedBadge,
                      {
                        backgroundColor: reference.verified
                          ? tokens.dark
                            ? '#16301B'
                            : '#E7F3E8'
                          : tokens.warningSoft,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.verifiedText,
                        {
                          color: reference.verified
                            ? tokens.dark
                              ? '#9CDC9F'
                              : '#1B5E20'
                            : tokens.dark
                              ? '#FFD08A'
                              : '#7A4B00',
                        },
                      ]}
                    >
                      {reference.verified ? 'Terverifikasi' : 'Belum terverifikasi'}
                    </Text>
                  </View>
                </Card>
              ))
            ) : (
              <InlineStatus message="Tidak ada referensi yang disertakan untuk temuan ini." />
            )}
          </View>

          <Card style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: tokens.text }]}>Rekomendasi</Text>
            <Text style={[styles.body, { color: tokens.text }]}>{finding.recommendation}</Text>
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: tokens.text }]}>
              Kepercayaan dan batasan
            </Text>
            <Text style={[styles.body, { color: tokens.text }]}>
              Tingkat kepercayaan: {CONFIDENCE_LABEL[finding.confidence]}. Status bukti:{' '}
              {finding.validation_status === 'validated'
                ? 'kutipan cocok dengan sumber'
                : finding.validation_status === 'failed'
                  ? 'kutipan tidak cocok dengan sumber'
                  : 'menunggu kepastian peninjau manusia'}.
            </Text>
            {LIMITATIONS.map((limitation) => (
              <Text key={limitation} style={[styles.meta, { color: tokens.textSecondary }]}>
                • {limitation}
              </Text>
            ))}
          </Card>

          {actionError ? <InlineStatus tone="danger" message={actionError} /> : null}

          {!hasLocation(finding) ? (
            <InlineStatus message="Lokasi highlight tidak dapat dipastikan pada dokumen. Anda tetap dapat membaca temuan ini beserta kutipannya." />
          ) : null}

          <View style={styles.actions}>
            <Button
              label="Buka di PDF"
              onPress={() =>
                router.push({
                  pathname: '/jobs/[jobId]/viewer',
                  params: {
                    jobId: String(jobId),
                    finding: finding.finding_id,
                    page: String(findingPage(finding) ?? 1),
                  },
                })
              }
              disabled={!hasLocation(finding)}
              accessibilityHint={
                hasLocation(finding)
                  ? 'Membuka viewer pada halaman klausul'
                  : 'Koordinat highlight tidak tersedia'
              }
            />
            <Button
              variant="secondary"
              label={needsReview ? 'Batalkan tanda peninjauan' : 'Tandai untuk peninjauan manusia'}
              onPress={toggleReview}
              loading={saving}
            />
            <Button
              variant="ghost"
              label="Kembali ke dashboard"
              onPress={() =>
                router.push({
                  pathname: '/jobs/[jobId]/dashboard',
                  params: { jobId: String(jobId) },
                })
              }
            />
          </View>

          <View style={styles.navRow}>
            <Button
              small
              variant="secondary"
              label="← Temuan sebelumnya"
              disabled={!previous}
              onPress={() => previous && goToFinding(previous.finding_id)}
            />
            <Button
              small
              variant="secondary"
              label="Temuan berikutnya →"
              disabled={!next}
              onPress={() => next && goToFinding(next.finding_id)}
            />
          </View>

          <JobTabs jobId={String(jobId)} active="dashboard" />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
  },
  headerCard: {
    gap: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  findingId: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  category: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    lineHeight: 18,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
  },
  section: {
    gap: 10,
  },
  sectionCard: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  alertCard: {
    gap: 6,
    borderWidth: 1.5,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  infoCard: {
    gap: 4,
  },
  referenceCard: {
    gap: 6,
  },
  referenceTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  verifiedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  navRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
});
