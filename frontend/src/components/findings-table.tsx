import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { ReviewFlag, RiskBadge, ValidationBadge } from '@/components/status-badges';
import { Button } from '@/components/ui/button';
import { FINDING_TYPE_META, categoryLabel } from '@/constants/design';
import { useDesign } from '@/hooks/use-design';
import type { Finding } from '@/types';
import { findingPage, hasLocation, snippet } from '@/utils/findings';

interface FindingsTableProps {
  findings: Finding[];
  onOpen: (finding: Finding) => void;
  onOpenPdf: (finding: Finding) => void;
  onToggleReview: (finding: Finding) => void;
  updatingId?: string | null;
}

/** Daftar temuan: tabel di layar lebar, kartu di layar sempit (PRD §7.3). */
export function FindingsTable({
  findings,
  onOpen,
  onOpenPdf,
  onToggleReview,
  updatingId,
}: FindingsTableProps) {
  const { width } = useWindowDimensions();
  const tokens = useDesign();
  const wide = width >= 900;

  if (!findings.length) return null;

  if (!wide) {
    return (
      <View style={styles.cardList}>
        {findings.map((finding) => (
          <View
            key={finding.finding_id}
            style={[
              styles.mobileCard,
              { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <Pressable
              onPress={() => onOpen(finding)}
              accessibilityRole="button"
              accessibilityLabel={`Buka detail temuan ${finding.finding_id}`}
              style={({ pressed }) => [styles.mobileContent, pressed && styles.pressed]}
            >
            <View style={styles.mobileTop}>
              <Text style={[styles.id, { color: tokens.textSecondary }]}>{finding.finding_id}</Text>
              <RiskBadge level={finding.risk_level} />
            </View>
            <Text style={[styles.mobileCategory, { color: tokens.text }]}>
              {categoryLabel(finding.risk_category)}
            </Text>
            <Text style={[styles.mobileMeta, { color: tokens.textSecondary }]}>
              {FINDING_TYPE_META[finding.finding_type].label} · Halaman{' '}
              {findingPage(finding) ?? '—'}
            </Text>
            <Text style={[styles.mobileSnippet, { color: tokens.text }]}>
              {snippet(finding.reasoning_summary, 180)}
            </Text>
            <View style={styles.badgesWrap}>
              <ValidationBadge status={finding.validation_status} />
              {finding.needs_human_review ? <ReviewFlag /> : null}
            </View>
            </Pressable>
            <View style={styles.actionsRow}>
              <Button
                small
                variant="ghost"
                label="Lihat di PDF"
                disabled={!hasLocation(finding)}
                onPress={() => onOpenPdf(finding)}
              />
              <Button
                small
                variant="ghost"
                label={finding.needs_human_review ? 'Batalkan tanda' : 'Tandai tinjau'}
                loading={updatingId === finding.finding_id}
                onPress={() => onToggleReview(finding)}
              />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.table, { borderColor: tokens.border, backgroundColor: tokens.surface }]}>
      <View style={[styles.headerRow, { borderBottomColor: tokens.border }]}>
        <Text style={[styles.headerCell, styles.colId, { color: tokens.textSecondary }]}>ID</Text>
        <Text style={[styles.headerCell, styles.colCategory, { color: tokens.textSecondary }]}>
          Kategori
        </Text>
        <Text style={[styles.headerCell, styles.colLevel, { color: tokens.textSecondary }]}>
          Level
        </Text>
        <Text style={[styles.headerCell, styles.colType, { color: tokens.textSecondary }]}>
          Jenis
        </Text>
        <Text style={[styles.headerCell, styles.colPage, { color: tokens.textSecondary }]}>
          Hal.
        </Text>
        <Text style={[styles.headerCell, styles.colReason, { color: tokens.textSecondary }]}>
          Potongan alasan
        </Text>
        <Text style={[styles.headerCell, styles.colValidation, { color: tokens.textSecondary }]}>
          Validasi
        </Text>
        <Text style={[styles.headerCell, styles.colActions, { color: tokens.textSecondary }]}>
          Aksi
        </Text>
      </View>

      {findings.map((finding, index) => (
        <View
          key={finding.finding_id}
          style={[
            styles.row,
            index < findings.length - 1 && { borderBottomColor: tokens.border, borderBottomWidth: 1 },
          ]}
        >
          <Pressable
            onPress={() => onOpen(finding)}
            accessibilityRole="button"
            accessibilityLabel={`Buka detail temuan ${finding.finding_id}`}
            style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
          >
          <Text style={[styles.cell, styles.colId, { color: tokens.text }]}>{finding.finding_id}</Text>
          <Text style={[styles.cell, styles.colCategory, { color: tokens.text }]}>
            {categoryLabel(finding.risk_category)}
          </Text>
          <View style={styles.colLevel}>
            <RiskBadge level={finding.risk_level} />
          </View>
          <Text style={[styles.cell, styles.colType, { color: tokens.textSecondary }]}>
            {FINDING_TYPE_META[finding.finding_type].label}
          </Text>
          <Text style={[styles.cell, styles.colPage, { color: tokens.text }]}>
            {findingPage(finding) ?? '—'}
          </Text>
          <Text style={[styles.cell, styles.colReason, { color: tokens.text }]} numberOfLines={2}>
            {snippet(finding.reasoning_summary, 150)}
          </Text>
          <View style={styles.colValidation}>
            <ValidationBadge status={finding.validation_status} />
            {finding.needs_human_review ? (
              <View style={styles.reviewFlag}>
                <ReviewFlag />
              </View>
            ) : null}
          </View>
          </Pressable>
          <View style={styles.colActions}>
            <Button
              small
              variant="ghost"
              label="Lihat di PDF"
              disabled={!hasLocation(finding)}
              onPress={() => onOpenPdf(finding)}
            />
            <Button
              small
              variant="ghost"
              label={finding.needs_human_review ? 'Batalkan tanda' : 'Tandai tinjau'}
              loading={updatingId === finding.finding_id}
              onPress={() => onToggleReview(finding)}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
    alignItems: 'center',
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  cell: {
    fontSize: 13,
    lineHeight: 19,
  },
  colId: { flex: 0.7 },
  colCategory: { flex: 1.5 },
  colLevel: { flex: 0.9 },
  colType: { flex: 1.5 },
  colPage: { flex: 0.4 },
  colReason: { flex: 2.2 },
  colValidation: { flex: 1.4, gap: 6 },
  colActions: { flex: 2, gap: 6, alignItems: 'flex-start' },
  reviewFlag: {
    marginTop: 2,
  },
  pressed: {
    opacity: 0.85,
  },
  cardList: {
    gap: 10,
  },
  mobileCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  mobileContent: {
    gap: 8,
  },
  mobileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  id: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  mobileCategory: {
    fontSize: 15,
    fontWeight: '700',
  },
  mobileMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  mobileSnippet: {
    fontSize: 13,
    lineHeight: 19,
  },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
});
