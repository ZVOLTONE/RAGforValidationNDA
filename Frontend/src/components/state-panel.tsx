import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDesign } from '@/hooks/use-design';

interface StatePanelProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'danger';
}

/** Keadaan kosong / error yang informatif — tanpa klaim "dokumen aman". */
export function StatePanel({ title, message, actionLabel, onAction, tone = 'neutral' }: StatePanelProps) {
  const tokens = useDesign();
  return (
    <Card style={styles.panel}>
      <Text style={[styles.title, { color: tone === 'danger' ? tokens.danger : tokens.text }]}>
        {title}
      </Text>
      <Text style={[styles.message, { color: tokens.textSecondary }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Button variant="secondary" label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </Card>
  );
}

export function LoadingPanel({ rows = 4, label = 'Memuat data…' }: { rows?: number; label?: string }) {
  const tokens = useDesign();
  return (
    <Card style={styles.loading}>
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.message, { color: tokens.textSecondary }]}
      >
        {label}
      </Text>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.skeletonRow}>
          <Skeleton width={70} height={14} />
          <Skeleton width="100%" height={14} style={styles.skeletonLine} />
        </View>
      ))}
    </Card>
  );
}

export function InlineStatus({ message, tone = 'neutral' }: { message: string; tone?: 'neutral' | 'success' | 'danger' }) {
  const tokens = useDesign();
  const color =
    tone === 'danger'
      ? tokens.danger
      : tone === 'success'
        ? tokens.dark
          ? '#9CDC9F'
          : '#1B5E20'
        : tokens.textSecondary;
  return (
    <Text accessibilityLiveRegion="polite" style={[styles.inline, { color }]}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
  },
  action: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  loading: {
    gap: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonLine: {
    flex: 1,
  },
  inline: {
    fontSize: 12,
    fontWeight: '600',
  },
});
