import { StyleSheet, Text, View } from 'react-native';

import { useDesign } from '@/hooks/use-design';

const NODES = [
  { key: 'queued', label: 'Dokumen diterima' },
  { key: 'document_extraction', label: 'Ekstraksi / OCR' },
  { key: 'clause_identification', label: 'Segmentasi klausul' },
  { key: 'ai_analysis', label: 'Analisis risiko + UU' },
  { key: 'validating', label: 'Validasi bukti' },
  { key: 'artifact_generation', label: 'Laporan & hasil' },
];

interface PipelineNeuralGraphProps {
  stage?: string;
  status?: string;
  percent?: number;
  message?: string;
}

export default function PipelineNeuralGraph({ stage = 'queued', status = 'queued', percent = 0, message }: PipelineNeuralGraphProps) {
  const tokens = useDesign();
  const current = status === 'completed' ? NODES.length : NODES.findIndex((node) => node.key === stage);
  const activeIndex = current < 0 ? 0 : current;

  return (
    <View style={[styles.canvas, { backgroundColor: tokens.surfaceMuted, borderColor: tokens.border }]}>
      {NODES.map((node, index) => {
        const done = status === 'completed' || index < activeIndex;
        const active = status !== 'completed' && index === activeIndex;
        const failed = status === 'failed' && active;
        const color = failed ? tokens.danger : done || active ? tokens.primary : tokens.borderStrong;
        return (
          <View key={node.key} style={styles.nodeRow}>
            <View style={styles.rail}>
              <View style={[styles.node, { borderColor: color, backgroundColor: done ? color : tokens.surface }]}>
                <Text style={[styles.nodeText, { color: done ? tokens.onPrimary : color }]}>{done ? '✓' : index + 1}</Text>
              </View>
              {index < NODES.length - 1 ? <View style={[styles.connector, { backgroundColor: done ? tokens.primary : tokens.border }]} /> : null}
            </View>
            <View style={styles.nodeCopy}>
              <Text style={[styles.label, { color: active || done ? tokens.text : tokens.textSecondary }]}>{node.label}</Text>
              {active ? <Text style={[styles.hint, { color: failed ? tokens.danger : tokens.primary }]}>{message || (failed ? 'Tahap gagal' : `${percent}% · sedang berjalan`)}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { borderWidth: 1, borderRadius: 14, padding: 20 },
  nodeRow: { flexDirection: 'row', minHeight: 54, gap: 12 },
  rail: { width: 28, alignItems: 'center' },
  node: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  nodeText: { fontSize: 11, fontWeight: '700' },
  connector: { flex: 1, width: 2, minHeight: 20 },
  nodeCopy: { flex: 1, paddingTop: 3, paddingBottom: 12, gap: 3 },
  label: { fontSize: 14, fontWeight: '600' },
  hint: { fontSize: 12, lineHeight: 17 },
});
