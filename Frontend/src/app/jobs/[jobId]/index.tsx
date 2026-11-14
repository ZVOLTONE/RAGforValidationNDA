import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProcessStepper } from '@/components/process-stepper';
import { Screen } from '@/components/screen';
import { InlineStatus, LoadingPanel, StatePanel } from '@/components/state-panel';
import { JobStatusBadge } from '@/components/status-badges';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { JOB_STATUS_META, describeJobError } from '@/constants/design';
import { useDesign } from '@/hooks/use-design';
import { useJobPolling } from '@/hooks/use-job-polling';
import { formatDateTime } from '@/utils/format';

export default function JobStatusScreen() {
  const tokens = useDesign();
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const id = String(jobId);
  const { job, error, loading, retry } = useJobPolling(id);

  useEffect(() => {
    if (job?.status !== 'completed') return;
    const timer = setTimeout(() => {
      router.replace({ pathname: '/jobs/[jobId]/dashboard', params: { jobId: id } });
    }, 900);
    return () => clearTimeout(timer);
  }, [job?.status, id, router]);

  return (
    <Screen>
      <View style={styles.topBar}>
        <Button variant="ghost" label="← Kembali ke daftar pekerjaan" onPress={() => router.replace('/jobs')} />
      </View>

      {loading && !job ? <LoadingPanel label="Memuat status pekerjaan…" rows={3} /> : null}

      {!job && error ? (
        <StatePanel
          title="Status pekerjaan tidak dapat dimuat"
          message={error}
          actionLabel="Coba lagi"
          onAction={retry}
          tone="danger"
        />
      ) : null}

      {job ? (
        <>
          <Card style={styles.headerCard}>
            <Text style={[styles.docName, { color: tokens.text }]}>{job.document_name}</Text>
            <View style={styles.metaRow}>
              <JobStatusBadge status={job.status} />
              <Text style={[styles.meta, { color: tokens.textSecondary }]}>
                Job ID {job.job_id}
              </Text>
            </View>
            <Text style={[styles.meta, { color: tokens.textSecondary }]}>
              Mulai: {formatDateTime(job.started_at ?? job.created_at)}
            </Text>
            {job.status === 'completed' ? (
              <InlineStatus tone="success" message="Analisis selesai. Mengalihkan ke dashboard…" />
            ) : job.status === 'failed' ? (
              <InlineStatus tone="danger" message="Pekerjaan gagal diproses." />
            ) : (
              <InlineStatus message={`Status: ${JOB_STATUS_META[job.status].label}`} />
            )}
          </Card>

          <Card style={styles.stepperCard}>
            <Text style={[styles.sectionTitle, { color: tokens.text }]}>Tahap pemrosesan</Text>
            <ProcessStepper status={job.status} stage={job.stage} />
          </Card>

          {job.status === 'failed' ? (
            <Card style={styles.failureCard}>
              <Text style={[styles.sectionTitle, { color: tokens.danger }]}>
                Analisis tidak dapat diselesaikan
              </Text>
              <Text style={[styles.meta, { color: tokens.textSecondary }]}>
                {describeJobError(job.error_code)} Job ID: {job.job_id}
              </Text>
              <View style={styles.actions}>
                <Button label="Unggah ulang dokumen" onPress={() => router.replace('/')} />
                <Button variant="secondary" label="Coba muat status" onPress={retry} />
              </View>
            </Card>
          ) : null}

          {job.status === 'completed' ? (
            <Button
              label="Lihat hasil"
              onPress={() =>
                router.replace({ pathname: '/jobs/[jobId]/dashboard', params: { jobId: id } })
              }
            />
          ) : null}

          {error && job.status !== 'failed' ? (
            <InlineStatus tone="danger" message={`${error} Mencoba menghubungkan ulang…`} />
          ) : null}
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
  docName: {
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  meta: {
    fontSize: 12,
    lineHeight: 18,
  },
  stepperCard: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  failureCard: {
    gap: 8,
    borderColor: '#E8A9A4',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
});
