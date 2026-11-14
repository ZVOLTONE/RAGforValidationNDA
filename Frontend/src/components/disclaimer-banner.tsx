import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { DISCLAIMER_SHORT } from '@/constants/design';
import { useDesign } from '@/hooks/use-design';

/** Banner batasan analisis (PRD §9) — selalu tampil di dashboard dan laporan. */
export function DisclaimerBanner() {
  const tokens = useDesign();
  return (
    <View
      style={[styles.banner, { backgroundColor: tokens.warningSoft, borderColor: tokens.border }]}
      accessibilityRole="summary"
    >
      <SymbolView
        name={{ ios: 'info.circle', android: 'info', web: 'info' } as never}
        tintColor={tokens.dark ? '#FFD08A' : '#7A4B00'}
        size={16}
      />
      <Text style={[styles.text, { color: tokens.dark ? '#FFD08A' : '#5C3A00' }]}>
        {DISCLAIMER_SHORT} ConfidAI bukan pemantau jaringan dan tidak menentukan pelanggaran hukum
        final.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
});
