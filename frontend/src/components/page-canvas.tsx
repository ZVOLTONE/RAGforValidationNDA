import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RISK_META } from '@/constants/design';
import { useDesign } from '@/hooks/use-design';
import type { DocumentPage, Finding } from '@/types';

interface PageCanvasProps {
  page: DocumentPage;
  findings: Finding[];
  selectedId?: string;
  width: number;
  onSelect: (finding: Finding) => void;
}

/** Halaman dokumen + overlay highlight semi-transparan (PRD §7.5). */
export function PageCanvas({ page, findings, selectedId, width, onSelect }: PageCanvasProps) {
  const tokens = useDesign();
  const scale = width / page.width;

  const highlights = findings.flatMap((finding) =>
    finding.bounding_boxes
      .filter((box) => box.page === page.page_number)
      .map((box) => ({ finding, box })),
  );

  return (
    <View
      style={[
        styles.page,
        {
          width,
          aspectRatio: page.width / page.height,
          borderColor: tokens.border,
        },
      ]}
    >
      {page.image_url ? (
        <Image
          source={{ uri: page.image_url }}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          accessibilityLabel={`Halaman ${page.page_number} dokumen`}
        />
      ) : (
        <View style={StyleSheet.absoluteFill}>
          {(page.blocks ?? []).map((block) => (
            <Text
              key={block.id}
              style={{
                position: 'absolute',
                left: `${block.left * 100}%`,
                top: `${block.top * 100}%`,
                width: `${block.width * 100}%`,
                fontSize: Math.max(4, block.fontSize * scale),
                lineHeight: Math.max(6, block.fontSize * scale * 1.4),
                fontWeight: block.bold ? '700' : '400',
                color: '#1B2733',
              }}
            >
              {block.text}
            </Text>
          ))}
        </View>
      )}

      {highlights.map(({ finding, box }) => {
        const meta = RISK_META[finding.risk_level];
        const selected = finding.finding_id === selectedId;
        const critical = finding.risk_level === 'critical';
        return (
          <Pressable
            key={`${finding.finding_id}-${box.page}-${box.x0}`}
            onPress={() => onSelect(finding)}
            accessibilityRole="button"
            accessibilityLabel={`Temuan ${finding.finding_id}, level ${meta.label}. Tampilkan detail.`}
            style={[
              styles.highlight,
              {
                left: `${box.x0 * 100}%`,
                top: `${box.y0 * 100}%`,
                width: `${Math.max(box.x1 - box.x0, 0.02) * 100}%`,
                height: `${Math.max(box.y1 - box.y0, 0.015) * 100}%`,
                backgroundColor: meta.highlight,
                borderColor: selected ? meta.color : 'transparent',
                borderWidth: critical ? 2 : 1,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    borderRadius: 2,
  },
});
