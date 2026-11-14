import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useDesign } from '@/hooks/use-design';

export type JobTabKey = 'dashboard' | 'viewer' | 'report';

const TABS: { key: JobTabKey; label: string; path: string }[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/jobs/[jobId]/dashboard' },
  { key: 'viewer', label: 'Viewer', path: '/jobs/[jobId]/viewer' },
  { key: 'report', label: 'Laporan', path: '/jobs/[jobId]/report' },
];

/** Tab di dalam sebuah pekerjaan (PRD §5). */
export function JobTabs({ jobId, active }: { jobId: string; active: JobTabKey }) {
  const router = useRouter();
  const tokens = useDesign();

  return (
    <View style={[styles.tabs, { borderBottomColor: tokens.border }]}>
      {TABS.map((tab) => {
        const selected = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() =>
              router.push({ pathname: tab.path as never, params: { jobId } as never })
            }
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.tab,
              selected && { borderBottomColor: tokens.primary },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? tokens.primary : tokens.textSecondary },
                selected && styles.selectedLabel,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: 24,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  tab: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedLabel: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
