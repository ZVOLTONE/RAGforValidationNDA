import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { SymbolName } from '@/constants/design';

interface BadgeProps {
  label: string;
  color: string;
  background: string;
  icon?: SymbolName;
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
}

/** Label teks selalu tampil — warna bukan satu-satunya penanda (PRD §1.3). */
export function Badge({ label, color, background, icon, borderColor, style }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: background, borderColor: borderColor ?? 'transparent' },
        style,
      ]}
    >
      {icon ? <SymbolView name={icon as never} tintColor={color} size={12} /> : null}
      <Text style={[styles.label, { color }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
});
