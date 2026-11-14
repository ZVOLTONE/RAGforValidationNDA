import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { JobTabs } from '@/components/job-tabs';
import { PageCanvas } from '@/components/page-canvas';
import { QuoteBlock } from '@/components/quote-block';
import { Screen } from '@/components/screen';
import { InlineStatus, LoadingPanel, StatePanel } from '@/components/state-panel';
import { RiskBadge, ValidationBadge } from '@/components/status-badges';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RISK_META, RISK_ORDER, categoryLabel } from '@/constants/design';
import { useAsyncData } from '@/hooks/use-async-data';
import { useDesign } from '@/hooks/use-design';
import { getDocumentFileUrl, getViewerData } from '@/services/api';
import type { Finding } from '@/types';
import { findingPage, hasLocation, snippet, sortFindings } from '@/utils/findings';
import { openExternalUrl } from '@/utils/open-url';

export default function ViewerScreen() {
  const tokens = useDesign();
  const router = useRouter();
  const params = useLocalSearchParams<{ jobId: string; finding?: string; page?: string }>();
  const jobId = String(params.jobId);
  const selectedId = params.finding ? String(params.finding) : undefined;

  const data = useAsyncData(`viewer-${jobId}`, () => getViewerData(jobId));
  const { width } = useWindowDimensions();
  const wide = width >= 1000;

  const ordered = useMemo(
    () => (data.data ? sortFindings(data.data.findings) : []),
    [data.data],
  );

  const [currentPage, setCurrentPage] = useState<number>(() => Number(params.page) || 1);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!selectedId || !data.data) return;
    const target = data.data.findings.find((finding) => finding.finding_id === selectedId);
    const page = target ? findingPage(target) : undefined;
    if (page) setCurrentPage(page);
  }, [selectedId, data.data]);

  const stepFinding = useCallback(
    (delta: number) => {
      if (!ordered.length) return;
      const index = ordered.findIndex((finding) => finding.finding_id === selectedId);
      const nextIndex =
        index === -1
          ? delta > 0
            ? 0
            : ordered.length - 1
          : Math.min(Math.max(index + delta, 0), ordered.length - 1);
      const target = ordered[nextIndex];
      if (!target) return;
      router.setParams({
        finding: target.finding_id,
        page: String(findingPage(target) ?? currentPage),
      });
    },
    [ordered, selectedId, router, currentPage],
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') stepFinding(1);
      if (event.key === 'ArrowLeft') stepFinding(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stepFinding]);

  const job = data.data?.job;
  const pages = data.data?.pages ?? [];
  const pageCount = job?.page_count ?? pages.length ?? 1;
  const page = pages.find((item) => item.page_number === currentPage) ?? pages[0];
  const selected = ordered.find((finding) => finding.finding_id === selectedId);
  const baseWidth = Math.max(240, wide ? Math.min(640, width - 440) : width - 56);
  const canvasWidth = baseWidth * zoom;

  const selectFinding = (finding: Finding) => {
    router.setParams({
      finding: finding.finding_id,
      page: String(findingPage(finding) ?? currentPage),
    });
  };

  return (
    <Screen contentStyle={styles.screenContent}>
      {data.loading && !data.data ? <LoadingPanel label="Memuat dokumen dan temuan…" rows={4} /> : null}

      {data.error && !data.data ? (
        <StatePanel
          title="Viewer tidak dapat dimuat"
          message={data.error}
          actionLabel="Coba lagi"
          onAction={data.reload}
          tone="danger"
        />
      ) : null}

      {data.data ? (
        <>
          <JobTabs jobId={jobId} active="viewer" />

          <Card style={styles.toolbar}>
            <View style={styles.toolbarGroup}>
              <Button
                small
                variant="secondary"
                label="← Halaman"
                disabled={currentPage <= 1}
                onPress={() => setCurrentPage((value) => Math.max(1, value - 1))}
              />
              <Text style={[styles.pageLabel, { color: tokens.text }]}>
                Halaman {page?.page_number ?? currentPage} / {pageCount}
              </Text>
              <Button
                small
                variant="secondary"
                label="Halaman →"
                disabled={currentPage >= pageCount}
                onPress={() => setCurrentPage((value) => Math.min(pageCount, value + 1))}
              />
            </View>

            <View style={styles.toolbarGroup}>
              <Button
                small
                variant="secondary"
                label="−"
                accessibilityLabel="Perkecil"
                disabled={zoom <= 0.7}
                onPress={() => setZoom((value) => Math.max(0.7, Number((value - 0.2).toFixed(1))))}
              />
              <Text style={[styles.pageLabel, { color: tokens.text }]}>
                {Math.round(zoom * 100)}%
              </Text>
              <Button
                small
                variant="secondary"
                label="+"
                accessibilityLabel="Perbesar"
                disabled={zoom >= 2.4}
                onPress={() => setZoom((value) => Math.min(2.4, Number((value + 0.2).toFixed(1))))}
              />
            </View>

            <View style={styles.toolbarGroup}>
              <Button
                small
                variant="secondary"
                label="← Temuan"
                disabled={!ordered.length}
                onPress={() => stepFinding(-1)}
              />
              <Button
                small
                variant="secondary"
                label="Temuan →"
                disabled={!ordered.length}
                onPress={() => stepFinding(1)}
              />
              {job && getDocumentFileUrl(job.document_id) ? (
                <Button
                  small
                  variant="ghost"
                  label="Buka PDF asli"
                  onPress={() => {
                    const url = job ? getDocumentFileUrl(job.document_id) : undefined;
                    if (url) void openExternalUrl(url);
                  }}
                />
              ) : null}
            </View>
          </Card>

          <Card style={styles.legendCard}>
            <Text style={[styles.legendTitle, { color: tokens.textSecondary }]}>
              Legenda highlight
            </Text>
            <View style={styles.legendRow}>
              {RISK_ORDER.map((level) => (
                <View key={level} style={styles.legendItem}>
                  <View
                    style={[
                      styles.swatch,
                      {
                        backgroundColor: RISK_META[level].highlight,
                        borderColor: RISK_META[level].color,
                        borderWidth: level === 'critical' ? 2 : 1,
                      },
                    ]}
                  />
                  <Text style={[styles.legendLabel, { color: tokens.textSecondary }]}>
                    {level === 'low'
                      ? 'Perlu ditinjau'
                      : level === 'medium'
                        ? 'Sedang / kontrol lemah'
                        : level === 'high'
                          ? 'Tinggi'
                          : 'Kritis'}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {page?.low_quality ? (
            <InlineStatus
              tone="danger"
              message={`Halaman ${page.page_number} memiliki kualitas OCR rendah; posisi highlight pada halaman ini mungkin tidak pasti.`}
            />
          ) : null}

          <View style={[styles.layout, wide && styles.layoutWide]}>
            <View style={styles.pageColumn}>
              {page ? (
                <ScrollView horizontal contentContainerStyle={styles.pageScroll}>
                  <PageCanvas
                    page={page}
                    findings={ordered}
                    selectedId={selectedId}
                    width={canvasWidth}
                    onSelect={selectFinding}
                  />
                </ScrollView>
              ) : (
                <Card>
                  <Text style={[styles.panelText, { color: tokens.textSecondary }]}>
                    Pratinjau halaman tidak tersedia dari backend. Temuan tetap dapat dibaca pada
                    panel di samping.
                  </Text>
                </Card>
              )}
              <Text style={[styles.hint, { color: tokens.textSecondary }]}>
                Gunakan tombol panah kiri/kanan pada keyboard untuk berpindah temuan. Highlight
                semi-transparan agar teks tetap terbaca.
              </Text>
            </View>

            <View style={[styles.panel, wide && styles.panelWide]}>
              {selected ? (
                <Card style={styles.selectedCard}>
                  <Text style={[styles.panelTitle, { color: tokens.text }]}>
                    {selected.finding_id} · {categoryLabel(selected.risk_category)}
                  </Text>
                  <View style={styles.badgeRow}>
                    <RiskBadge level={selected.risk_level} />
                    <ValidationBadge status={selected.validation_status} />
                  </View>
                  {!hasLocation(selected) ? (
                    <InlineStatus
                      tone="danger"
                      message="Lokasi tidak dapat dipastikan — koordinat highlight tidak tersedia."
                    />
                  ) : null}
                  <Text style={[styles.panelText, { color: tokens.textSecondary }]}>
                    {snippet(selected.reasoning_summary, 200)}
                  </Text>
                  {selected.evidence[0] ? (
                    <QuoteBlock
                      quote={selected.evidence[0].quote}
                      pageNumber={selected.evidence[0].page_number}
                      clauseNumber={selected.clause_number}
                      label="Kutipan klausul"
                    />
                  ) : null}
                  <Button
                    small
                    label="Buka detail lengkap"
                    onPress={() =>
                      router.push({
                        pathname: '/jobs/[jobId]/findings/[findingId]',
                        params: { jobId, findingId: selected.finding_id },
                      })
                    }
                  />
                </Card>
              ) : (
                <Card>
                  <Text style={[styles.panelText, { color: tokens.textSecondary }]}>
                    Pilih highlight pada halaman atau temuan pada daftar untuk melihat detail
                    ringkas.
                  </Text>
                </Card>
              )}

              <Card style={styles.listCard}>
                <Text style={[styles.panelTitle, { color: tokens.text }]}>
                  Temuan ({ordered.length})
                </Text>
                {ordered.map((finding) => {
                  const active = finding.finding_id === selectedId;
                  return (
                    <Pressable
                      key={finding.finding_id}
                      onPress={() => selectFinding(finding)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [
                        styles.listRow,
                        {
                          borderColor: active ? tokens.primary : tokens.border,
                          backgroundColor: active ? tokens.primarySoft : tokens.surface,
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.listId, { color: tokens.text }]}>
                        {finding.finding_id}
                      </Text>
                      <Text style={[styles.listMeta, { color: tokens.textSecondary }]}>
                        {categoryLabel(finding.risk_category)} · Hal.{' '}
                        {findingPage(finding) ?? '—'}
                      </Text>
                      {!hasLocation(finding) ? (
                        <Text style={[styles.listMeta, { color: tokens.danger }]}>
                          Lokasi tidak pasti
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </Card>
            </View>
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    gap: 14,
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  toolbarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  legendCard: {
    gap: 8,
    padding: 12,
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 18,
    height: 14,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  layout: {
    gap: 14,
  },
  layoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pageColumn: {
    flex: 1,
    gap: 10,
    alignItems: 'center',
  },
  pageScroll: {
    paddingVertical: 4,
  },
  panel: {
    gap: 12,
    width: '100%',
  },
  panelWide: {
    width: 380,
  },
  selectedCard: {
    gap: 10,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  panelText: {
    fontSize: 13,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  listCard: {
    gap: 8,
    maxHeight: 420,
  },
  listRow: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 2,
  },
  listId: {
    fontSize: 12,
    fontWeight: '700',
  },
  listMeta: {
    fontSize: 11,
    fontWeight: '500',
  },
  hint: {
    fontSize: 11,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
