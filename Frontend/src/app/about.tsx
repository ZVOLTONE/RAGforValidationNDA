import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FINDING_TYPE_META, LIMITATIONS, VALIDATION_META } from '@/constants/design';
import { useDesign } from '@/hooks/use-design';
import type { ValidationStatus } from '@/types';

export default function AboutScreen() {
  const tokens = useDesign();
  const statuses = Object.keys(VALIDATION_META) as ValidationStatus[];

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={[styles.title, { color: tokens.text }]}>Batasan analisis</Text>
        <Text style={[styles.subtitle, { color: tokens.textSecondary }]}>
          ConfidAI membantu peninjauan kontrak, bukan menggantikan penilaian hukum profesional.
          Setiap temuan menyertakan bukti dan status validasi agar dapat Anda periksa sendiri.
        </Text>
      </View>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: tokens.text }]}>Yang tidak dilakukan sistem</Text>
        {LIMITATIONS.map((item) => (
          <Text key={item} style={[styles.body, { color: tokens.textSecondary }]}>
            • {item}
          </Text>
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: tokens.text }]}>Aturan penyajian hasil</Text>
        <Text style={[styles.body, { color: tokens.textSecondary }]}>
          Tidak ada temuan pasti tanpa bukti. Temuan tanpa kutipan dan nomor halaman yang valid tidak
          ditampilkan sebagai fakta terkonfirmasi. Antarmuka tidak menyatakan bahwa suatu organisasi
          telah mengalami serangan siber, tidak menyatakan dokumen melanggar hukum, dan tidak
          menyebut dokumen aman ketika tidak ada temuan.
        </Text>
        <Text style={[styles.body, { color: tokens.textSecondary }]}>
          Referensi hukum yang belum terverifikasi selalu diberi label “Belum terverifikasi”.
          Ketidakpastian seperti status inconclusive, kualitas OCR rendah, dan lokasi highlight yang
          tidak pasti ditandai secara eksplisit.
        </Text>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: tokens.text }]}>Membaca status validasi</Text>
        {statuses.map((status) => (
          <View key={status} style={styles.statusRow}>
            <Badge
              label={VALIDATION_META[status].label}
              color={tokens.dark ? VALIDATION_META[status].colorDark : VALIDATION_META[status].color}
              background={tokens.dark ? VALIDATION_META[status].softDark : VALIDATION_META[status].soft}
              icon={VALIDATION_META[status].icon}
            />
            <Text style={[styles.body, styles.statusText, { color: tokens.textSecondary }]}>
              {status === 'validated'
                ? 'Kutipan cocok dengan sumber dan lolos validasi sistem.'
                : status === 'pending'
                  ? 'Validasi bukti belum dijalankan atau masih menunggu.'
                  : status === 'needs_review'
                    ? 'Temuan perlu dipastikan oleh peninjau manusia.'
                    : 'Kutipan tidak cocok dengan sumber; jangan dianggap fakta.'}
            </Text>
          </View>
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: tokens.text }]}>Jenis temuan</Text>
        {Object.entries(FINDING_TYPE_META).map(([key, meta]) => (
          <Text key={key} style={[styles.body, { color: tokens.textSecondary }]}>
            • <Text style={{ color: tokens.text, fontWeight: '600' }}>{meta.label}</Text> — nilai
            data: {key}
          </Text>
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: tokens.text }]}>Privasi</Text>
        <Text style={[styles.body, { color: tokens.textSecondary }]}>
          Isi dokumen dan kutipan klausul diperlakukan sebagai data sensitif: tidak dicatat ke log
          konsol, tidak dikirim ke layanan analitik pihak ketiga, dan dirender sebagai teks biasa
          untuk mencegah eksekusi HTML. Dokumen tidak digunakan untuk pelatihan model.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 760,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
  },
  statusRow: {
    gap: 6,
    marginBottom: 4,
  },
  statusText: {
    paddingLeft: 2,
  },
});
