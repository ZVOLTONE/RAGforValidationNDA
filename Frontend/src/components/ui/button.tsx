import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useDesign } from '@/hooks/use-design';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress?: (event?: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  small = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const tokens = useDesign();

  const palette: Record<ButtonVariant, { background: string; border: string; text: string }> = {
    primary: { background: tokens.primary, border: tokens.primary, text: tokens.onPrimary },
    secondary: { background: tokens.surface, border: tokens.borderStrong, text: tokens.text },
    ghost: { background: 'transparent', border: 'transparent', text: tokens.primary },
    danger: { background: tokens.dangerSoft, border: tokens.danger, text: tokens.danger },
  };
  const colors = palette[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={
        isDisabled
          ? undefined
          : (event) => {
              // Mencegah aksi di dalam baris ikut memicu buka baris (terutama di web).
              event.stopPropagation();
              onPress?.(event);
            }
      }
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        small ? styles.small : styles.regular,
        { backgroundColor: colors.background, borderColor: colors.border },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={colors.text} /> : null}
      <Text
        style={[styles.label, small && styles.labelSmall, { color: colors.text }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  regular: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 13,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
