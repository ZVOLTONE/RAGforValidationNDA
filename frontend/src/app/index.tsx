import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FileDropZone } from '@/components/file-drop-zone';
import { Screen } from '@/components/screen';
import { InlineStatus } from '@/components/state-panel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL, USE_MOCK_DATA } from '@/config';
import { DEMO_JOB_ID } from '@/services/mock-data';
import { errorMessage, uploadJob } from '@/services/api';
import { useDesign } from '@/hooks/use-design';
import type { UploadFile } from '@/types';
import { formatFileSize } from '@/utils/format';

function validatePdf(file: UploadFile): string | null {
  if (!/\.pdf$/i.test(file.name)) {
    return 'Hanya berkas PDF yang dapat dianalisis. Pilih berkas dengan ekstensi .pdf.';
  }
  const mime = file.mimeType?.toLowerCase();
  if (mime && mime !== 'application/pdf' && mime !== 'application/x-pdf' && mime !== 'application/octet-stream') {
    return 'Tipe berkas tidak dikenali sebagai PDF. Pilih berkas PDF yang valid.';
  }
  if (file.size && file.size > MAX_UPLOAD_BYTES) {
    return `Ukuran berkas melebihi batas ${MAX_UPLOAD_LABEL}.`;
  }
  return null;
}

export default function UploadScreen() {
  const tokens = useDesign();
  const router = useRouter();

  const [file, setFile] = useState<UploadFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = (next: UploadFile) => {
    setFile(next);
    setFileError(validatePdf(next));
    setUploadError(null);
    setProgress(0);
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;
      handleFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? undefined,
        size: asset.size ?? undefined,
        file: (asset as { file?: unknown }).file,
      });
    } catch {
      setFileError('Berkas tidak dapat dibuka. Silakan pilih berkas kembali.');
    }
  };

  const startUpload = async () => {
    if (!file || uploading || fileError) return;
    setUploading(true);
    setUploadError(null);
    setProgress(0);
    try {
      const result = await uploadJob(file, (fraction) => setProgress(fraction));
      router.replace({ pathname: '/jobs/[jobId]', params: { jobId: result.job_id } });
    } catch (cause) {
      setUploadError(errorMessage(cause));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={[styles.eyebrow, { color: tokens.primary }]}>
          ANALISIS KONTRAK · KEAMANAN SIBER
        </Text>
        <Text style={[styles.title, { color: tokens.text }]}>
          Unggah kontrak, periksa setiap temuan beserta buktinya.
        </Text>
        <Text style={[styles.subtitle, { color: tokens.textSecondary }]}>
          ConfidAI menampilkan klausul berisiko, kutipan sumber, nomor halaman, dan status validasi
          sehingga setiap temuan dapat Anda periksa sendiri.
        </Text>
      </View>

      <FileDropZone onFileDropped={handleFile}>
        <View
          style={[
            styles.dropzone,
            {
              backgroundColor: tokens.surface,
              borderColor: fileError ? tokens.danger : tokens.borderStrong,
            },
          ]}
        >
          <SymbolView
            name={{ ios: 'doc.badge.arrow.up', android: 'upload_file', web: 'upload_file' } as never}
            tintColor={tokens.primary}
            size={30}
          />
          <Text style={[styles.dropTitle, { color: tokens.text }]}>
            Tarik & lepas berkas PDF di sini
          </Text>
          <Text style={[styles.dropHint, { color: tokens.textSecondary }]}>
            atau pilih berkas dari perangkat Anda
          </Text>
          <Button
            variant="secondary"
            label={file ? 'Ganti file' : 'Pilih file PDF'}
            onPress={pickFile}
            disabled={uploading}
          />
          <Text style={[styles.dropMeta, { color: tokens.textSecondary }]}>
            Hanya PDF · maksimal {MAX_UPLOAD_LABEL}
          </Text>
        </View>
      </FileDropZone>

      {file ? (
        <Card style={styles.fileCard}>
          <View style={styles.fileRow}>
            <SymbolView
              name={{ ios: 'doc.text', android: 'description', web: 'description' } as never}
              tintColor={tokens.textSecondary}
              size={20}
            />
            <View style={styles.fileInfo}>
              <Text style={[styles.fileName, { color: tokens.text }]} numberOfLines={1}>
                {file.name}
              </Text>
              <Text style={[styles.fileMeta, { color: tokens.textSecondary }]}>
                {formatFileSize(file.size)}
                {fileError ? ' · tidak valid' : ' · siap dianalisis'}
              </Text>
            </View>
          </View>
        </Card>
      ) : null}

      {fileError ? <InlineStatus tone="danger" message={fileError} /> : null}

      <Card style={styles.privacyCard}>
        <Text style={[styles.privacyTitle, { color: tokens.text }]}>Privasi dan pemrosesan</Text>
        <Text style={[styles.privacyText, { color: tokens.textSecondary }]}>
          Tipe dan ukuran berkas divalidasi di perangkat sebelum dikirim. Dokumen diproses oleh
          backend yang dikonfigurasi untuk pekerjaan analisis ini. Pastikan Anda memiliki wewenang
          untuk mengirim dokumen tersebut dan mengikuti kebijakan organisasi Anda.
        </Text>
      </Card>

      {uploading ? (
        <View style={styles.progressBlock}>
          <View style={[styles.progressTrack, { backgroundColor: tokens.surfaceMuted }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(progress * 100)}%`, backgroundColor: tokens.primary },
              ]}
            />
          </View>
          <InlineStatus message={`Mengunggah dokumen… ${Math.round(progress * 100)}%`} />
        </View>
      ) : null}

      {uploadError ? (
        <Card style={styles.errorCard}>
          <Text style={[styles.errorTitle, { color: tokens.danger }]}>Unggahan belum berhasil</Text>
          <Text style={[styles.privacyText, { color: tokens.textSecondary }]}>
            {uploadError} Berkas yang Anda pilih tetap tersimpan di halaman ini.
          </Text>
        </Card>
      ) : null}

      <Button
        label={
          uploading ? 'Mengunggah…' : uploadError ? 'Coba lagi' : 'Mulai Analisis'
        }
        onPress={startUpload}
        disabled={!file || !!fileError || uploading}
        loading={uploading}
        style={styles.submit}
      />

      {USE_MOCK_DATA ? (
        <View style={styles.demoBlock}>
          <Button
            variant="ghost"
            label="Lihat contoh hasil analisis (data ilustratif)"
            onPress={() =>
              router.push({ pathname: '/jobs/[jobId]/dashboard', params: { jobId: DEMO_JOB_ID } })
            }
          />
        </View>
      ) : null}

      <Button variant="ghost" label="Buka daftar pekerjaan" onPress={() => router.push('/jobs')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 8,
    paddingTop: 4,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    maxWidth: 720,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 25,
    maxWidth: 720,
  },
  dropzone: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 44,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  dropTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  dropHint: {
    fontSize: 14,
  },
  dropMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  fileCard: {
    padding: 14,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fileInfo: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
  },
  fileMeta: {
    fontSize: 12,
  },
  privacyCard: {
    gap: 6,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  progressBlock: {
    gap: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  errorCard: {
    gap: 4,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  submit: {
    alignSelf: 'stretch',
  },
  demoBlock: {
    alignItems: 'center',
  },
});
