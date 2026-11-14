import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Screen } from '@/components/screen';
import { InlineStatus, LoadingPanel, StatePanel } from '@/components/state-panel';
import { JobStatusBadge } from '@/components/status-badges';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAsyncData } from '@/hooks/use-async-data';
import { useDesign } from '@/hooks/use-design';
import { deleteJob, errorMessage, listJobs } from '@/services/api';
import type { AnalysisJob } from '@/types';
import { formatDate } from '@/utils/format';

export default function JobsScreen() {
  const tokens = useDesign();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 860;

  const jobsData = useAsyncData('jobs', listJobs);
  const [pendingDelete, setPendingDelete] = useState<AnalysisJob | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const jobs = jobsData.data ?? [];

  const openJob = (job: AnalysisJob) => {
    if (job.status === 'completed') {
      router.push({ pathname: '/jobs/[jobId]/dashboard', params: { jobId: job.job_id } });
    } else {
      router.push({ pathname: '/jobs/[jobId]', params: { jobId: job.job_id } });
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteJob(pendingDelete.job_id);
      setPendingDelete(null);
      jobsData.reload();
    } catch (cause) {
      setActionError(errorMessage(cause));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: tokens.text }]}>Daftar pekerjaan</Text>
          <Text style={[styles.subtitle, { color: tokens.textSecondary }]}>
            Semua analisis yang tersimpan pada perangkat atau akun Anda.
          </Text>
        </View>
        <Button label="Unggah dokumen" onPress={() => router.push('/')} small />
      </View>

      {jobsData.loading && !jobsData.data ? <LoadingPanel label="Memuat pekerjaan…" rows={4} /> : null}

      {jobsData.error && !jobsData.data ? (
        <StatePanel
          title="Daftar pekerjaan tidak dapat dimuat"
          message={jobsData.error}
          actionLabel="Coba lagi"
          onAction={jobsData.reload}
          tone="danger"
        />
      ) : null}

      {actionError ? <InlineStatus tone="danger" message={actionError} /> : null}

      {jobsData.data && jobs.length === 0 ? (
        <StatePanel
          title="Belum ada pekerjaan"
          message="Unggah dokumen kontrak PDF untuk memulai analisis pertama Anda."
          actionLabel="Unggah dokumen"
          onAction={() => router.push('/')}
        />
      ) : null}

      {jobs.length > 0 && wide ? (
        <View style={[styles.table, { borderColor: tokens.border, backgroundColor: tokens.surface }]}>
          <View style={[styles.headerRow, { borderBottomColor: tokens.border }]}>
            {['Job ID', 'Dokumen', 'Status', 'Tanggal', 'Aksi'].map((label) => (
              <Text key={label} style={[styles.headerCell, { color: tokens.textSecondary }]}>
                {label}
              </Text>
            ))}
          </View>
          {jobs.map((job, index) => (
            <Pressable
              key={job.job_id}
              onPress={() => openJob(job)}
              accessibilityRole="button"
              accessibilityLabel={`Buka pekerjaan ${job.document_name}`}
              style={({ pressed }) => [
                styles.row,
                index < jobs.length - 1 && {
                  borderBottomColor: tokens.border,
                  borderBottomWidth: 1,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.cell, styles.colId, { color: tokens.textSecondary }]}>
                {job.job_id}
              </Text>
              <Text style={[styles.cell, styles.colDoc, { color: tokens.text }]}>
                {job.document_name}
              </Text>
              <View style={styles.colStatus}>
                <JobStatusBadge status={job.status} />
              </View>
              <Text style={[styles.cell, styles.colDate, { color: tokens.textSecondary }]}>
                {formatDate(job.created_at)}
              </Text>
              <View style={styles.colActions}>
                <Button small variant="ghost" label="Buka hasil" onPress={() => openJob(job)} />
                <Button
                  small
                  variant="ghost"
                  label="Laporan"
                  onPress={() =>
                    router.push({ pathname: '/jobs/[jobId]/report', params: { jobId: job.job_id } })
                  }
                />
                <Button
                  small
                  variant="ghost"
                  label="Hapus"
                  onPress={() => setPendingDelete(job)}
                />
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      {jobs.length > 0 && !wide ? (
        <View style={styles.cards}>
          {jobs.map((job) => (
            <Card key={job.job_id} style={styles.card}>
              <Pressable onPress={() => openJob(job)} accessibilityRole="button">
                <Text style={[styles.cardDoc, { color: tokens.text }]}>{job.document_name}</Text>
                <Text style={[styles.cardMeta, { color: tokens.textSecondary }]}>
                  {job.job_id} · {formatDate(job.created_at)}
                </Text>
              </Pressable>
              <JobStatusBadge status={job.status} />
              <View style={styles.cardActions}>
                <Button small variant="ghost" label="Buka hasil" onPress={() => openJob(job)} />
                <Button
                  small
                  variant="ghost"
                  label="Laporan"
                  onPress={() =>
                    router.push({ pathname: '/jobs/[jobId]/report', params: { jobId: job.job_id } })
                  }
                />
                <Button small variant="ghost" label="Hapus" onPress={() => setPendingDelete(job)} />
              </View>
            </Card>
          ))}
        </View>
      ) : null}

      <ConfirmDialog
        visible={!!pendingDelete}
        title="Hapus pekerjaan ini?"
        message={`File asli, hasil OCR, hasil analisis, dan laporan untuk “${
          pendingDelete?.document_name ?? ''
        }” akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus permanen"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  headerText: {
    flex: 1,
    gap: 4,
    minWidth: 220,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
  },
  table: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cell: {
    fontSize: 13,
  },
  colId: { flex: 1 },
  colDoc: { flex: 1.6, fontWeight: '600' },
  colStatus: { flex: 1 },
  colDate: { flex: 1 },
  colActions: { flex: 2, flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' },
  cards: {
    gap: 10,
  },
  card: {
    gap: 8,
  },
  cardDoc: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  pressed: {
    opacity: 0.85,
  },
});
