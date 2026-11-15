import { Modal, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { useDesign } from '@/hooks/use-design';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Dialog konfirmasi lintas platform (Alert bawaan tidak menampilkan tombol di web). */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  busy = false,
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const tokens = useDesign();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.backdrop, { backgroundColor: tokens.overlay }]}>
        <View
          style={[styles.dialog, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
          accessibilityViewIsModal
        >
          <Text style={[styles.title, { color: tokens.text }]}>{title}</Text>
          <Text style={[styles.message, { color: tokens.textSecondary }]}>{message}</Text>
          <View style={styles.actions}>
            <Button
              variant="secondary"
              label={cancelLabel}
              onPress={onCancel}
              disabled={busy}
              small
            />
            <Button
              variant={destructive ? 'danger' : 'primary'}
              label={confirmLabel}
              onPress={onConfirm}
              loading={busy}
              small
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
});
