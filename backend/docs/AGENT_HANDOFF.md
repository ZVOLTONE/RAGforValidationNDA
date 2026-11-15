# Catatan Handoff Agent Berikutnya

Tanggal: 2026-11-15

## Permintaan yang dikerjakan

Menangani PDF scan pada `backend/samples/File Input` dengan Tesseract OCR serta memperbaiki
teks klausul yang patah karena pergantian halaman, whitespace, dan line-wrap.

## Perubahan kode

- `confidai/document/extract.py`: halaman dengan gambar yang mencakup >=50%
  area diarahkan ke OCR lebih dulu, termasuk halaman yang memiliki sebagian
  teks digital.
- `confidai/document/clause_splitter.py`: whitespace dinormalisasi ketika
  membentuk teks klausul; baris wrap dan pemenggalan kata disambungkan;
  `Undang-Undang` tetap mempertahankan tanda hubung; judul `PASAL` yang
  nomornya berada pada baris/halaman berikutnya dikenali sebagai satu heading.
- `README.md`: prasyarat Tesseract, data bahasa Indonesia, routing scan, dan
  perilaku pembersihan teks sudah diringkas.
- `docs/OCR_INPUT_PIPELINE.md`: dokumentasi implementasi, persyaratan, cara
  verifikasi, hasil verifikasi, serta batasan.

## Hasil pemeriksaan terakhir

- `compileall` untuk `confidai` dan `main.py`: berhasil.
- PDF digital `backend/samples/File Input/Dummy_NDA_Uji_Label_Risiko.pdf`: 4 halaman berhasil
  diekstrak melalui jalur `pdf_text`.
- Uji splitter sintetis: berhasil untuk `PASAL` + `5` lintas halaman,
  `keraha-` + `siaan`, whitespace, paragraf, dan `Undang-` + `Undang`.
- Uji router PDF gambar sintetis: memilih `ocr`.
- Uji OCR aktual berhenti dengan pesan `Tesseract tidak ditemukan` karena host
  belum memiliki binary Tesseract.

## Langkah lanjutan yang diperlukan

1. Pasang Tesseract dan bahasa Indonesia di mesin backend:
   `sudo apt-get install -y tesseract-ocr tesseract-ocr-ind`.
2. Pastikan `tesseract --list-langs` menampilkan `ind` dan `eng`.
3. Jalankan backend ekstraksi pada PDF scan nyata di `backend/samples/File Input`, lalu tinjau
   `method`, confidence, jumlah teks, urutan halaman, serta posisi highlight.
4. Jika deteksi gagal pada halaman yang terdiri dari banyak gambar kecil,
   evaluasi penghitungan gabungan cakupan gambar sebelum mengubah ambang.
5. Tinjau efek normalisasi pada kontrak nyata: newline tunggal kini dianggap
   line-wrap, sementara baris kosong menandai pemisah paragraf.

## Catatan lingkungan

Jangan jalankan Codex/backend sebagai root hanya untuk memasang OCR. Instal
paket sistem melalui perintah `sudo` terpisah dengan autentikasi administrator.
Pada sesi sebelumnya perintah instalasi tidak dapat diselesaikan karena
autentikasi `sudo` gagal; jangan menganggap OCR end-to-end sudah terverifikasi.

Rincian perilaku OCR ada di [OCR_INPUT_PIPELINE.md](OCR_INPUT_PIPELINE.md).
