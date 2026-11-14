import { StyleSheet, Text, View } from 'react-native';

import { useDesign } from '@/hooks/use-design';

interface QuoteBlockProps {
  quote: string;
  pageNumber?: number;
  clauseNumber?: string;
  label?: string;
}

/** Kutipan klausul asli dirender sebagai teks biasa (tanpa HTML) dan tidak pernah diparafrase. */
export function QuoteBlock({
  quote,
  pageNumber,
  clauseNumber,
  label = 'Kutipan klausul (teks asli)',
}: QuoteBlockProps) {
  const tokens = useDesign();

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: tokens.quoteBackground, borderLeftColor: tokens.primary },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: tokens.textSecondary }]}>{label}</Text>
        <Text style={[styles.meta, { color: tokens.textSecondary }]}>
          {clauseNumber ? `Klausul ${clauseNumber} · ` : ''}Halaman {pageNumber ?? '—'}
        </Text>
      </View>
      <Text selectable style={[styles.quote, { color: tokens.text }]}>
        {quote || 'Kutipan tidak tersedia pada respons backend.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderLeftWidth: 3,
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  meta: {
    fontSize: 11,
    fontWeight: '600',
  },
  quote: {
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
