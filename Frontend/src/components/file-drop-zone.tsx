import { createElement, type ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import type { UploadFile } from '@/types';

interface FileDropZoneProps {
  children: ReactNode;
  onFileDropped: (file: UploadFile) => void;
}

/** Area drag-and-drop di web; di native hanya wadah biasa (pemilihan via tombol). */
export function FileDropZone({ children, onFileDropped }: FileDropZoneProps) {
  if (Platform.OS === 'web') {
    const handleDrop = (event: {
      preventDefault: () => void;
      dataTransfer?: { files?: { [index: number]: { name: string; type: string; size: number } | undefined; length: number } | null };
    }) => {
      event.preventDefault();
      const dropped = event.dataTransfer?.files?.[0];
      if (!dropped) return;
      onFileDropped({
        uri: '',
        name: dropped.name,
        mimeType: dropped.type,
        size: dropped.size,
        file: dropped,
      });
    };

    return createElement(
      'div',
      {
        onDragOver: (event: { preventDefault: () => void }) => event.preventDefault(),
        onDrop: handleDrop,
        style: { width: '100%' },
      },
      children,
    );
  }

  return <View style={styles.wrapper}>{children}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
});
