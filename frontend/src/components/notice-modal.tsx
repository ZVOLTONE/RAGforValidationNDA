import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useDesign } from '@/hooks/use-design';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NoticeModal({ isOpen, onClose }: NoticeModalProps) {
  const tokens = useDesign();

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: '#181816',
              borderColor: '#2a2a27',
            },
          ]}
        >
          {/* Top subtle glow accent line */}
          <View style={styles.glowLine} />

          {/* Close X Button at top-right */}
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Tutup dialog pemberitahuan"
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>

          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View style={styles.iconBox}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
            <View style={styles.headerText}>
              <View style={styles.badgeRow}>
                <View style={styles.miniBadge}>
                  <Text style={styles.miniBadgeText}>Mode Demo &amp; Lokal</Text>
                </View>
                <Text style={styles.subBadgeText}>Isolasi Data Penuh</Text>
              </View>
              <Text style={styles.title}>Pemberitahuan Arsitektur &amp; Isolasi Data</Text>
            </View>
          </View>

          {/* Body Content */}
          <View style={styles.body}>
            {/* Highlight quote box */}
            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>
                &ldquo;Proyek ConfidAI dirancang untuk dijalankan secara 100% lokal (on-premise) demi
                menjamin kerahasiaan dokumen pertahanan dan NDA siber sesuai regulasi UU PDP dan ISO 27001.&rdquo;
              </Text>
            </View>

            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text style={styles.bulletIcon}>⚡</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Arsitektur On-Premise Tertutup:</Text>
                  <Text style={styles.infoDesc}>
                    FastAPI lokal, Ollama LLM (Qwen 2.5 &amp; Qwen 3), ChromaDB RAG vektor, serta Tesseract OCR
                    berjalan di infrastruktur tertutup tanpa kebocoran ke cloud eksternal.
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.bulletIcon}>🛡️</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Data Uji Riil &amp; Verbatim:</Text>
                  <Text style={styles.infoDesc}>
                    Dokumen sampel <Text style={styles.codeText}>Dummy_NDA_3_TNI_Uji_Label_Risiko.pdf</Text> menghasilkan
                    37 temuan risiko dengan kutipan pasal autentik, segmentasi klausul hierarkis, serta validasi regulasi hukum.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Modal Footer CTA */}
          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Saya mengerti dan masuk ke aplikasi"
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
            >
              <Text style={styles.actionBtnText}>✓ Saya Mengerti &amp; Masuk ke Aplikasi</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 580,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  glowLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#14B8A6',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  closeBtnText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  miniBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5EEAD4',
  },
  subBadgeText: {
    fontSize: 11,
    color: '#71717A',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F5F5F2',
  },
  body: {
    gap: 14,
    marginBottom: 20,
  },
  quoteBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  quoteText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#FDE68A',
    fontStyle: 'italic',
  },
  infoList: {
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletIcon: {
    fontSize: 14,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E4E4E7',
  },
  infoDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#A1A1AA',
  },
  codeText: {
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
    color: '#F5F5F2',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#2a2a27',
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    backgroundColor: '#14B8A6',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#0A0A08',
    fontWeight: '700',
    fontSize: 13,
  },
  pressed: {
    opacity: 0.8,
  },
});
