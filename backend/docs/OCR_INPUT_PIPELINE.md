# OCR dan Penanganan Teks PDF

## Tujuan

Backend menerima PDF digital dan PDF hasil pemindaian. Halaman scan harus
dikenali dengan OCR agar teks, nomor halaman, dan koordinat kata tetap dapat
digunakan oleh segmentasi klausul serta penyorot bukti.

## Persyaratan sistem

Python dependency `pytesseract` tercantum di `requirements.txt`, tetapi paket
Python tersebut hanya menjadi penghubung. Binary Tesseract perlu dipasang di
host yang menjalankan backend. Di Debian/Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y tesseract-ocr tesseract-ocr-ind
```

Pastikan binary dan data bahasa tersedia:

```bash
tesseract --version
tesseract --list-langs
```

Bahasa Indonesia (`ind`) disarankan. Backend memakai `ind+eng` jika kedua data
bahasa tersedia, atau `eng` sebagai fallback dan mencetak peringatan jika data
Indonesia tidak ada. Jika binary tidak berada di `PATH`, isi `TESSERACT_CMD`
di `.env` dengan path binary Tesseract.

Tidak perlu menjalankan seluruh Codex sebagai root. Pemasangan paket sistem
dilakukan terpisah oleh administrator mesin dengan hak `sudo`.

## Pemilihan jalur per halaman

`confidai/document/extract.py` memutuskan jalur ekstraksi setiap halaman:

- Jika gabungan area gambar yang terlihat mencakup sekurangnya 50% halaman,
  halaman diarahkan ke OCR. Cakupan dihitung sebagai area gabungan agar scan
  yang tersimpan dalam beberapa potongan gambar juga terdeteksi, tanpa
  menghitung area tumpang-tindih berulang. Pemeriksaan dilakukan sebelum jalur
  teks digital, sehingga scan dengan header/footer digital atau lapisan OCR
  tersembunyi yang tidak lengkap tetap diproses ulang.
- Halaman tanpa gambar scan yang memiliki sekurangnya 40 karakter teks terlihat
  dibaca langsung dari PDF.
- Teks digital yang terlalu sedikit diarahkan ke OCR.
- Halaman kosong ditandai `empty`. Kegagalan OCR pada satu halaman ditandai
  `failed` dan tidak menghentikan ekstraksi halaman lainnya.

Hasil OCR mencakup teks per halaman, kotak koordinat kata, confidence, metode,
dan flag `needs_review`. Confidence rata-rata di bawah 60 memerlukan tinjauan
manual. Koordinat disimpan dalam satuan point PDF agar konsisten dengan highlight.

## Pembersihan baris dan pemotongan klausul

`confidai/document/clause_splitter.py` membersihkan whitespace saat membentuk
teks klausul:

- Spasi berulang, tab, form feed, non-breaking space, narrow no-break space,
  figure space, zero-width space, dan soft hyphen dibersihkan.
- Line-wrap biasa dan pemenggalan kata dengan tanda hubung disambungkan.
  Contoh: `keraha-` diikuti `siaan` menjadi `kerahasiaan`.
- Tanda hubung leksikal dipertahankan, termasuk `Undang-` diikuti `Undang`.
- Baris kosong tetap menjadi pemisah paragraf.
- Label heading yang nomornya ada di baris/halaman berikutnya, misalnya
  `PASAL` lalu `5`, diklasifikasikan bersama, termasuk jika ada baris kosong
  pada batas halaman. Baris sumber tetap ditambahkan agar nomor halaman dan
  cakupan koordinat tidak dibuang.

Ekstraksi semua halaman dilakukan dahulu, lalu hasil halaman diberikan sebagai
satu aliran baris ke splitter sebelum tahap identifikasi/analisis agent. Dengan
demikian, lanjutan teks di halaman berikutnya tetap menjadi klausul yang sama
sampai ditemukan heading/klausul baru; normalisasi tidak mengubah urutan halaman.

Perapian ini hanya mengubah whitespace/pemenggalan baris dan tidak memparafrase
teks klausul. Koordinat highlight tetap berasal dari kata yang diekstrak dan
tidak dihitung ulang dari teks yang sudah dirapikan.

## Cara memverifikasi

Dari root repository:

```bash
PYTHONPATH=backend .venv/bin/python -m compileall -q backend/confidai backend/main.py
PYTHONPATH=backend .venv/bin/python -m confidai.document.extract "backend/samples/File Input/NAMA_SCAN.pdf" --show 1
```

Untuk menguji router OCR tanpa bergantung pada kualitas pengenalan, gunakan PDF
yang halamannya berupa gambar penuh. Ringkasan ekstraksi harus menunjukkan
`method=ocr`. Bila Tesseract belum terpasang, halaman akan menjadi `failed`
dengan pesan instalasi yang eksplisit.

## Status verifikasi saat dokumentasi dibuat

- Kompilasi Python berhasil.
- PDF NDA digital di `backend/samples/File Input/Dummy_NDA_Uji_Label_Risiko.pdf` berhasil
  diekstrak sebagai `pdf_text`.
- Uji sintetis memastikan halaman gambar diarahkan ke OCR.
- Uji sintetis memastikan heading terpisah antarhalaman, baris wrap,
  pemenggalan kata, dan bentuk `Undang-Undang` ditangani.
- OCR end-to-end pada host belum berhasil dijalankan karena binary Tesseract
  tidak terpasang. Instalasi sebelumnya memerlukan autentikasi `sudo` yang
  tidak tersedia pada sesi tersebut. Setelah pemasangan, ulangi uji scan nyata.

## Batasan yang perlu diperhatikan

- Deteksi scan memakai cakupan gambar terbesar pada satu halaman. Halaman yang
  tersusun dari banyak gambar kecil tanpa satu gambar dominan mungkin tidak
  memenuhi ambang 50%.
- OCR dapat salah mengenali karakter atau urutan kolom. Periksa confidence,
  teks hasil ekstraksi, serta highlight pada dokumen scan.
- Penyambungan otomatis mengasumsikan newline tunggal adalah line-wrap. Untuk
  dokumen dengan jeda baris yang bermakna tetapi tanpa baris kosong, tinjau
  tampilan output sebelum digunakan sebagai kutipan hukum/kontrak.
