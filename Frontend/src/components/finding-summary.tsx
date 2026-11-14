import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { RISK_META, RISK_ORDER, categoryLabel } from '@/constants/design';
import { useDesign } from '@/hooks/use-design';
import type { Finding } from '@/types';
import { countByCategory, countByLevel } from '@/utils/findings';

interface SummaryProps {
  findings: Finding[];
}

/** Kartu ringkasan dashboard (PRD §7.3). Angka dihitung dari daftar yang sedang tampil. */
export function SummaryCards({ findings }: SummaryProps) {
  const tokens = useDesign();
  const counts = countByLevel(findings);
  const reviewCount = findings.filter((finding) => finding.needs_human_review).length;

  const cards = [
    { key: 'total', label: 'Total temuan', value: findings.length, color: tokens.text },
    ...RISK_ORDER.map((level) => ({
      key: level,
      label: RISK_META[level].label,
      value: counts[level],
      color: tokens.dark ? RISK_META[level].colorDark : RISK_META[level].color,
    })),
    {
      key: 'review',
      label: 'Perlu ditinjau',
      value: reviewCount,
      color: tokens.dark ? '#FFD08A' : '#7A4B00',
    },
  ];

  return (
    <View style={styles.grid}>
      {cards.map((card) => (
        <Card key={card.key} style={styles.card}>
          <Text style={[styles.value, { color: card.color }]}>{card.value}</Text>
          <Text style={[styles.label, { color: tokens.textSecondary }]}>{card.label}</Text>
        </Card>
      ))}
    </View>
  );
}

export function RiskDistribution({ findings }: SummaryProps) {
  const tokens = useDesign();
  const counts = countByLevel(findings);
  const max = Math.max(1, ...RISK_ORDER.map((level) => counts[level]));

  return (
    <View style={styles.block}>
      {RISK_ORDER.map((level) => {
        const meta = RISK_META[level];
        const percent = Math.round((counts[level] / max) * 100);
        return (
          <View key={level} style={styles.barRow}>
            <Text style={[styles.barLabel, { color: tokens.textSecondary }]}>{meta.label}</Text>
            <View style={[styles.barTrack, { backgroundColor: tokens.surfaceMuted }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.max(percent, counts[level] > 0 ? 4 : 0)}%`,
                    backgroundColor: tokens.dark ? meta.colorDark : meta.color,
                  },
                ]}
              />
            </View>
            <Text style={[styles.barValue, { color: tokens.text }]}>{counts[level]}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function CategoryBreakdown({ findings }: SummaryProps) {
  const tokens = useDesign();
  const rows = countByCategory(findings);

  return (
    <View style={styles.block}>
      {rows.length === 0 ? (
        <Text style={[styles.emptyText, { color: tokens.textSecondary }]}>
          Belum ada kategori pada filter saat ini.
        </Text>
      ) : (
        rows.map((row) => (
          <View key={row.category} style={styles.categoryRow}>
            <Text style={[styles.categoryLabel, { color: tokens.text }]}>
              {categoryLabel(row.category)}
            </Text>
            <Text style={[styles.categoryValue, { color: tokens.textSecondary }]}>{row.total}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    flexGrow: 1,
    flexBasis: 132,
    minWidth: 120,
    padding: 14,
    gap: 4,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  block: {
    gap: 10,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barLabel: {
    width: 56,
    fontSize: 12,
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  barValue: {
    width: 24,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  categoryValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
  },
});
