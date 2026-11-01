# Lembar cek kunci jawaban UU PDP

## Cara pakai

1. Baca **📄 Klausul kontrak**, lalu tanya: *kalau klausul ini ada di kontrak, pasal mana yang akan aku kutip sebagai bukti?*
2. Bagian **🟡 KUNCI JAWABAN**: centang `[x]` kalau pasal itu memang relevan. Yang tidak relevan, hapus dari `gold` di `backend/eval/testset_pdp.json`.
3. Bagian **⚪ Temuan sistem**: centang `[x]` kalau ternyata relevan juga, lalu tambahkan ke `gold`.
4. Nilai dengan hukum, bukan dengan skor. Jangan ubah kunci supaya angkanya naik.
5. Selesai semua: `python -m eval.eval_retrieval` (dari folder `backend`), lalu ubah `status` di JSON.

**Arti tanda:** ✅ semua pasal kunci ketemu · ⚠️ sebagian ketemu · ❌ tidak ada yang ketemu. Sistem = bge-m3 hybrid, 5 hasil teratas. Teks pasal hasil OCR, jadi ada typo/kalimat terpotong dari sumbernya.

## Ringkasan

| Kasus | Klausul | Kunci | Hasil |
|---|---|---|---|
| [pdp-01](#pdp-01) | Vendor boleh menunjuk subkontraktor untuk memproses data pelanggan tanpa persetujuan tertulis dari perusahaan. | Pasal 51 | ✅ 1/1 |
| [pdp-02](#pdp-02) | Vendor membagikan data pribadi ke pihak ketiga tanpa persetujuan. | Pasal 20, Pasal 65 | ❌ 0/2 |
| [pdp-03](#pdp-03) | Jika terjadi kebocoran data, vendor akan memberi tahu perusahaan dalam waktu 14 hari kerja. | Pasal 46 | ✅ 1/1 |
| [pdp-04](#pdp-04) | Perjanjian tidak mengatur kewajiban pelaporan insiden keamanan kepada pemilik data. | Pasal 46 | ✅ 1/1 |
| [pdp-05](#pdp-05) | Setelah kontrak berakhir, vendor tidak wajib menghapus atau mengembalikan data pribadi. | Pasal 43, Pasal 44, Pasal 42 | ✅ 3/3 |
| [pdp-06](#pdp-06) | Vendor dapat menyimpan data pelanggan tanpa batas waktu. | Pasal 42, Pasal 44 | ❌ 0/2 |
| [pdp-07](#pdp-07) | Data pribadi pelanggan akan disimpan di server penyedia cloud yang berlokasi di luar negeri. | Pasal 56 | ✅ 1/1 |
| [pdp-08](#pdp-08) | Vendor dapat menggunakan data yang diterima untuk keperluan pemasaran produknya sendiri. | Pasal 28, Pasal 51 | ❌ 0/2 |
| [pdp-09](#pdp-09) | Vendor tidak bertanggung jawab atas akses tidak sah ke sistem yang menyimpan data. | Pasal 35, Pasal 39, Pasal 52 | ⚠️ 1/3 |
| [pdp-10](#pdp-10) | Vendor wajib menerapkan enkripsi dan kontrol keamanan teknis untuk melindungi data. | Pasal 35, Pasal 39 | ✅ 2/2 |
| [pdp-11](#pdp-11) | Karyawan vendor yang mengakses data wajib menjaga kerahasiaan informasi tersebut. | Pasal 36 | ✅ 1/1 |
| [pdp-12](#pdp-12) | Perusahaan berhak mengaudit dan mengawasi vendor yang memproses data atas namanya. | Pasal 37 | ❌ 0/1 |
| [pdp-13](#pdp-13) | Vendor wajib mencatat log seluruh aktivitas pemrosesan data. | Pasal 31 | ✅ 1/1 |
| [pdp-14](#pdp-14) | Vendor akan memproses data kesehatan dan data biometrik karyawan. | Pasal 4, Pasal 34 | ⚠️ 1/2 |
| [pdp-15](#pdp-15) | Persetujuan pengguna dianggap telah diberikan secara otomatis dengan menggunakan layanan. | Pasal 22, Pasal 23, Pasal 20 | ⚠️ 1/3 |
| [pdp-16](#pdp-16) | Pengguna dapat menarik persetujuan kapan saja dan vendor harus berhenti memproses datanya. | Pasal 40, Pasal 9 | ✅ 2/2 |
| [pdp-17](#pdp-17) | Vendor menggunakan sistem pengambilan keputusan otomatis dan profiling terhadap pelanggan. | Pasal 10, Pasal 34 | ✅ 2/2 |
| [pdp-18](#pdp-18) | Jika vendor diakuisisi atau melakukan merger, data pribadi akan dialihkan ke perusahaan baru. | Pasal 48 | ✅ 1/1 |
| [pdp-19](#pdp-19) | Vendor tidak menunjuk petugas pelindungan data pribadi. | Pasal 53 | ✅ 1/1 |
| [pdp-20](#pdp-20) | Vendor memproses data di luar instruksi perusahaan. | Pasal 51 | ✅ 1/1 |
| [pdp-21](#pdp-21) | Vendor dapat menjual data pribadi pelanggan untuk memperoleh keuntungan. | Pasal 65, Pasal 67 | ⚠️ 1/2 |
| [pdp-22](#pdp-22) | Vendor akan memproses data pribadi anak di bawah umur. | Pasal 25 | ✅ 1/1 |
| [pdp-23](#pdp-23) | Vendor wajib memperbaiki data pribadi yang tidak akurat dalam waktu 30 hari setelah permintaan. | Pasal 30, Pasal 6 | ✅ 2/2 |
| [pdp-24](#pdp-24) | Permintaan akses data oleh pemilik data akan ditanggapi vendor dalam 14 hari. | Pasal 32, Pasal 7 | ✅ 2/2 |
| [pdp-25](#pdp-25) | Vendor tidak wajib memberitahu pemilik data setelah datanya dihapus atau dimusnahkan. | Pasal 45 | ✅ 1/1 |
| [pdp-26](#pdp-26) | Vendor dan perusahaan bersama-sama menentukan tujuan pemrosesan data pelanggan tanpa perjanjian pembagian peran dan tanggung jawab. | Pasal 18 | ✅ 1/1 |
| [pdp-27](#pdp-27) | Vendor tidak perlu menyimpan bukti persetujuan yang diberikan pengguna. | Pasal 24 | ✅ 1/1 |
| [pdp-28](#pdp-28) | Formulir persetujuan tidak menjelaskan tujuan, jenis data, dan jangka waktu penyimpanan data. | Pasal 21 | ✅ 1/1 |
| [pdp-29](#pdp-29) | Vendor memasang kamera CCTV dengan pengenalan wajah di area publik untuk mengidentifikasi pengunjung. | Pasal 17 | ✅ 1/1 |
| [pdp-30](#pdp-30) | Data pelanggan dapat dipindahkan ke perusahaan afiliasi vendor yang berada di Indonesia. | Pasal 55 | ✅ 1/1 |
| [pdp-31](#pdp-31) | Vendor sebagai pemroses data tidak tunduk pada kewajiban keamanan dan kerahasiaan yang berlaku bagi pengendali data. | Pasal 52 | ❌ 0/1 |
| [pdp-32](#pdp-32) | Vendor tidak wajib memastikan keakuratan dan konsistensi data yang diolahnya. | Pasal 29, Pasal 52 | ⚠️ 1/2 |
| [pdp-33](#pdp-33) | Pengguna tidak dapat meminta salinan datanya atau memindahkan datanya ke penyedia lain. | Pasal 13, Pasal 7 | ✅ 2/2 |
| [pdp-34](#pdp-34) | Vendor tidak menanggung ganti rugi kepada pemilik data atas pelanggaran pemrosesan data pribadi. | Pasal 12 | ✅ 1/1 |
| [pdp-35](#pdp-35) | Pemilik data tidak dapat meminta penundaan atau pembatasan pemrosesan datanya. | Pasal 11, Pasal 41 | ⚠️ 1/2 |
| [pdp-36](#pdp-36) | Vendor tidak melakukan penilaian dampak pelindungan data sebelum memproses data dalam skala besar. | Pasal 34 | ✅ 1/1 |
| [pdp-37](#pdp-37) | Vendor tidak wajib mengikuti perintah lembaga pengawas pelindungan data pribadi. | Pasal 49 | ✅ 1/1 |
| [pdp-38](#pdp-38) | Pelanggaran ketentuan pelindungan data oleh vendor hanya dikenai teguran tanpa sanksi denda. | Pasal 57 | ❌ 0/1 |
| [pdp-39](#pdp-39) | Jika vendor berbentuk badan usaha melakukan tindak pidana data pribadi, hanya karyawan pelaksana yang bertanggung jawab. | Pasal 70 | ❌ 0/1 |
| [pdp-40](#pdp-40) | Vendor diberi waktu tiga tahun sejak undang-undang berlaku untuk menyesuaikan sistem pemrosesan datanya. | Pasal 74 | ✅ 1/1 |
| [pdp-41](#pdp-41) | Vendor tidak memberikan informasi identitas, dasar hukum, dan tujuan penggunaan data kepada pemilik data. | Pasal 5, Pasal 21 | ✅ 2/2 |
| [pdp-42](#pdp-42) | Vendor boleh memproses data pribadi penyandang disabilitas tanpa persetujuan yang bersangkutan atau walinya. | Pasal 26 | ✅ 1/1 |
| [pdp-43](#pdp-43) | Data pribadi tetap diproses vendor setelah tujuan kontrak tercapai. | Pasal 42, Pasal 43 | ⚠️ 1/2 |

---

## pdp-01

**📄 Klausul kontrak:** Vendor boleh menunjuk subkontraktor untuk memproses data pelanggan tanpa persetujuan tertulis dari perusahaan.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 51, Pasal 22, Pasal 60, Pasal 38, Pasal 26

**💬 Alasan Claude memilih kunci ini:** 51 ayat (4)-(5): prosesor wajib persetujuan tertulis pengendali sebelum melibatkan prosesor lain

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 51** · ✅ ditemukan (peringkat 1)
  > (1) Dalam hal Pengendali Data Pribadi menunjuk Prosesor Data Pribadi, Prosesor Data Pribadi wajib melakukan pemrosesan Data Pribadi berdasarkan perintah Pengendali Data Pribadi.
  > (2) Pemrosesan Data Pribadi sebagaimana dimaksud pada ayat (1), dilaksanakan sesuai ketentuan yang diatur dalam Undang-Undang ini.
  > (3) Pemrosesan Data Pribadi sebagaimana dimaksud pada ayat (1) termasuk dalam tanggung jawab Pengendali Data Pribadi.
  > (4) Prosesor Data Pribadi dapat melibatkan Prosesor Data Pribadi lain dalam melakukan pemrosesan Data Pribadi.
  > (5) Prosesor Data Pribadi wajib mendapatkan persetqiuan tertulis dari Pengendali Data Pribadi sebelum melibatkan Prosesor Data Pribadi lain sebagaimana dimaksud pada ayat (4).
  > (6) Dalam hal Prosesor Data Pribadi melakukan pemrosesan Data Pribadi di luar perintah dan tujuan yang ditetapkan Pengendali Data Pribadi, pemosesan Data Pribadi menjadi tanggung jawab Prosesor Data Pribadi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 22** (peringkat 2): (1) Persetujuan pemrosesan Data Pribadi dilakukan melalui persetujuan tertulis atau terekam. (2) Persetqiuan sebagaimana dimaksud pada ayat (1) dapat disampaikan secara elektronik atau nonelektronik. (3) Persetqjuan seba…
- [ ] **Pasal 60** (peringkat 3): Lembaga sebagaimana dimaksud dalam Pasal 58 ayat (2) berwenang: a.. merumuskan dan menetapkan kebijakan di bidang Pelindungan Data Pribadi; b. melakukan . . . b. melakukan pengawasan terhadap kepatuhan Pengendali Data Pr…
- [ ] **Pasal 38** (peringkat 4): Pengendali Data Pribadi wajib melindungi Data Pribadi dari pemrosesan yang tidak sah.
- [ ] **Pasal 26** (peringkat 5): (1) Pemrosesan Data Pribadi disabilitas ' diselenggarakan secara khusus. secara disabilitas dilakukan (2) Pemrosesan Data Pribadi penyandang sebagaimana dimaksud pada ayat (1) melalui komunikasi dengan cara tertentu sesu…

---

## pdp-02

**📄 Klausul kontrak:** Vendor membagikan data pribadi ke pihak ketiga tanpa persetujuan.

**Hasil sistem:** ❌ menemukan 0 dari 2 pasal kunci · urutan temuan: Pasal 60, Pasal 55, Pasal 13, Pasal 56, Pasal 3

**💬 Alasan Claude memilih kunci ini:** 51 dibuang: 'pihak ketiga' terlalu umum, belum tentu subkontraktor (keputusan Daniel)

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 20** · ❌ tidak ditemukan
  > (1) Pengendali Data Pribadi wajib memiliki dasar pemrosesan Data Pribadi.
  > (2) Dasar pernmsesan Data Pribadi sebagaimana dimaksud pada ayat (1) meliputi: a. persetujuan yang sah secara eksplisit dari Subjek Data Pribadi untuk 1 (sahr) atau beberapa tujuan tertentu yang telah disampait<an oleh Pengendali Data Pribadi kepada Subjek Data Pribadi; b. pemenuhan kewajiban perjanjian dalam hal Subjek Data Pribadi merupakan salah satu pihak atau untuk memenuhi permintaan Subjek Data Pribadi pada saat akan melalrukan pedanjian; c. pemenuhan kewajiban hukum dari Pengendali Data Pribadi sesuai dengan ketentuan peraturan perundang-undangan; d. pemenuhan pelindungan kepentingan vital Subjek Data Pribadi; e. pelaksanaan tugas dalam rangka kepentJngan umum, pelayanan publik, atau pelaksanaan . kewenangan Pengendali Data Pribadi berdasarkan peraturan perundang-undangan; dan/atau f. pemenuhan kepentingan yang sah lainnya dengan memperhatikan tujuan, kebututran, dan keseimbangan kepentingan Pengendali Data Pribadi dan hak Subjek Data Pribadi.

- [ ] **Pasal 65** · ❌ tidak ditemukan
  > (1) Setiap Orang dilarang secara melawan hukum memperoleh atau mengumpulkan Data Pribadi yang bukan miliknya dengan maksud untuk menguntungkan diri sendiri atau orang lain yang dapat mengakibatkan kerugian Subjek Data Pribadi.
  > (2) Setiap Orang dilarang secara melawan hukum mengungkapkan Data Pribadi yang bukan miliknya. dilarang secara melawan hukum Data Pribadi yang bukan miliknya.
  > (3) Setiap Orang Pasal 66. . .

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 60** (peringkat 1): Lembaga sebagaimana dimaksud dalam Pasal 58 ayat (2) berwenang: a.. merumuskan dan menetapkan kebijakan di bidang Pelindungan Data Pribadi; b. melakukan . . . b. melakukan pengawasan terhadap kepatuhan Pengendali Data Pr…
- [ ] **Pasal 55** (peringkat 2): (1) Pengendali Data Pribadi dapat melakukan transfer . Data Pribadi kepada Pengendali Data Pribadi lainnya dalam wilayah hukum Negara Republik Indonesia. a. (2) Pengendali . . . (2) Pengendali Data Pribadi yang melakukan…
- [ ] **Pasal 13** (peringkat 3): (1) Subjek Data Pribadi berhak mendapatkan dan/atau menggunakan Data Pribadi tentang dirinya dari Pengendali Data Pribadi dalam bentuk yang sesuai dengan struktur dan/ atau format yang lazim digunakan atau dapat dibaca o…
- [ ] **Pasal 56** (peringkat 4): (1) Pengendali Data Pribadi dapat melakukan transfer Data Pribadi kepada Pengendali Data Pribadi dan/atau Prosesor Data Pribadi di luar wilayah hukum Negara Republik Indonesia sesuai dengan ketentuan yang diatur dalarn U…
- [ ] **Pasal 3** (peringkat 5): Undang-Undang ini berasaskan : a. b. kepastian hukum; c. kepentingan umum; d. kemanfaatan; e. kehati-hatian; f. keseimbangan; g. pertanggungjawaban; dan h. kerahasiaan.

---

## pdp-03

**📄 Klausul kontrak:** Jika terjadi kebocoran data, vendor akan memberi tahu perusahaan dalam waktu 14 hari kerja.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 46, Pasal 21, Pasal 32, Pasal 14, Pasal 71

**💬 Alasan Claude memilih kunci ini:** 46 ayat (1): pemberitahuan tertulis paling lambat 3 x 24 jam

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 46** · ✅ ditemukan (peringkat 1)
  > (1) Dalam hal terjadi kegagalan Pelindungan Data Pribadi, Pengendali Data Pribadi wajib pemberitahuan secara tertulis paling lambat 3 x 24 (tiga kali dua puluh empat) jam kepada: a. Subjek Data Pribadi; dan b. lembaga.
  > (2) Pemberitahuan tertulis sebagaimana dimaksud pada ayat (1) minimal memuat: Data Pribadi yang terungkap; kapan dan bagaimana Data Pribadi terungkap; dan upaya penanganan dan pemulihan atas terungkapnya Data Pribadi oleh Pengendali Data Pribadi.
  > (3) Dalam hal tertentu, Pengendali Data Pribadi wajib memberitahukan kepada masyarakat mengenai kegagalan Pelindungan Data Pribadi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 21** (peringkat 2): (1) Dalam hal pemrosesan Data Pribadi berdasarkan persetujuan sebagaimana dimaksud dalam Pasal 2O ayat (21 huruf a, Pengendali Data Pribadi wajib menyampaikan Informasi mengenai: a. legalitas dari pemrosesan Data Pribadi…
- [ ] **Pasal 32** (peringkat 3): (1) Pengendali Data Pribadi wajib memberikan akses kepada Subjek Data Pribadi terhadap Data Pribadi yang diproses beserta rekam jejak pemrosesan Data Pribadi sesuai dengan jangka waktu penyimpanan Data Pribadi. (2) Akses…
- [ ] **Pasal 14** (peringkat 4): Pelaksanaan hak Subjek Data Pribadi sebagaimana dimaksud dalam Pasal 6 sampai dengan Pasal 11 diajukan melalui permohonan tercatat yang disampaikan secara elektronik atau nonelektronik kepada Pengendali Data Pribadi.
- [ ] **Pasal 71** (peringkat 5): (1) Dalam hal pengadilan menjatuhkan putusan pidana denda, terpidana diberikan jangka waktu 1 (satu) bulan sejak putusan telah memperoleh kekuatan hukum tetap untuk membayar denda tersebut. (2) Dalam hal terdapat alasan …

---

## pdp-04

**📄 Klausul kontrak:** Perjanjian tidak mengatur kewajiban pelaporan insiden keamanan kepada pemilik data.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 33, Pasal 23, Pasal 47, Pasal 46, Pasal 50

**💬 Alasan Claude memilih kunci ini:** klausul yang tidak ada (missing clause)

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 46** · ✅ ditemukan (peringkat 4)
  > (1) Dalam hal terjadi kegagalan Pelindungan Data Pribadi, Pengendali Data Pribadi wajib pemberitahuan secara tertulis paling lambat 3 x 24 (tiga kali dua puluh empat) jam kepada: a. Subjek Data Pribadi; dan b. lembaga.
  > (2) Pemberitahuan tertulis sebagaimana dimaksud pada ayat (1) minimal memuat: Data Pribadi yang terungkap; kapan dan bagaimana Data Pribadi terungkap; dan upaya penanganan dan pemulihan atas terungkapnya Data Pribadi oleh Pengendali Data Pribadi.
  > (3) Dalam hal tertentu, Pengendali Data Pribadi wajib memberitahukan kepada masyarakat mengenai kegagalan Pelindungan Data Pribadi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 33** (peringkat 1): Pengendali Data Pribadi wajib menolak memberikan akses perubahan terhadap Data Fribadi kepada Subjek Data Pribadi dalam hal: a. membahayakan keamanan, kesehatan fisik, atau kesehatan mental Subjek Data Pribadi dan/ atau …
- [ ] **Pasal 23** (peringkat 2): Klausul perjanjian yang di dalamnya terdapat permintaan pemrosesan Data Pribadi yang tidak memuat persetqjuan yang sah secara eksplisit dari Subjek Data Pribadi dinyatakan batal demi hukum.
- [ ] **Pasal 47** (peringkat 3): Pengendali Data Pribadi wajib bertanggung jawab atas pemrosesan Data Pribadi dan menunjukkan pertanggungiawaban dalam kewajiban pelaksanaan prinsip Pelindungan Data Pribadi.
- [ ] **Pasal 50** (peringkat 5): (1) Kewajiban Pengendali Data Pribadi sebagaimana dimaksud dalam Pasal 30, Pasal 32, Pasal 36, PasaJ42, Pasal 43 ayat (1) huruf a sampai dengan huruf c, Pasal 44 ayat (1) huruf b, Pasal 45, dan Pasal 46 ayat (1) huruf a,…

---

## pdp-05

**📄 Klausul kontrak:** Setelah kontrak berakhir, vendor tidak wajib menghapus atau mengembalikan data pribadi.

**Hasil sistem:** ✅ menemukan 3 dari 3 pasal kunci · urutan temuan: Pasal 43, Pasal 8, Pasal 42, Pasal 44, Pasal 30

**💬 Alasan Claude memilih kunci ini:** penghapusan, pemusnahan, pengakhiran pemrosesan

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 43** · ✅ ditemukan (peringkat 1)
  > (1) Pengendali Data Pribadi wajib menghapus Data Pribadi dalam hal: a. Data Pribadi tidak lagi diperlukan untuk pencapaian tujuan pemrosesan Data Pribadi; b. Subjek Data Pribadi telah melakukan penarikan kembali persetqiuan pemrosesan Data Pribadi; c. terdapat permintaan dari Subjek Data Pribadi; atau d. Data Pribadi diperoleh dan/ atau diproses dengan cara melawan hukum. (21 Data Pribadi sebagaimana dimaksud pada ayat (1) dilakukan sesuai dengan ketentuan peraturan perundang-undangan.

- [ ] **Pasal 44** · ✅ ditemukan (peringkat 4)
  > (1) Pengendali Data Pribadi wajib memusnahkan Data Pribadi dalam hal: a. telah habis masa retensinya dan berketerangan dimusnahkan berdasarkarr jadwal retensi arsip; . b. terdapat permintaan dari Subjek Data Pribadi; c. tidak berkaitan dengan penyelesaian proses hukum suatu perkara; dan/ atau d. Data Pribadi diperoleh dan/ atau diproses dengan cara melawan hukum.
  > (2) Pemusnahan Data Pribadi sebagaimana dimaksud pada ayat (1) dilakukan sesuai dengan ketentuan peraturan perundang-undangan. Pasal 45. . . PRES]DEN

- [ ] **Pasal 42** · ✅ ditemukan (peringkat 3)
  > (1) Pengendali Data Pribadi wajib mengakhiri pemrosesan Data Pribadi dalam hal: terdapat ketentuan undangan yang tidak UBLIK INDONESIA a. telah mencapai masa retensi; b. tujuan pemrosesan Data Pribadi telah tercapai; atau c. terdapat permintaan dari Subjek Data Pribadi.
  > (2) Pengakhiran pemrosesan Data Pribadi sebagaimana dimaksud pada ayat (1) dilakukan sesuai dengan ketentuan peraturan perundang-undangan.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 8** (peringkat 2): Subjek Data Pribadi berhak untuk mengakhiri pemrosesan, menghapus, dan/ atau memusnahkan Data Pribadi tentang dirinya sesuai dengan ketentuan peraturan perundang-undangan.
- [ ] **Pasal 30** (peringkat 5): (1) Pengendali Data Pribadi wajib memperbarui dan/ atau ' memperbaiki kesalahan dan/atau ketidakakuratan Data Fribadi paling lambat 3 x 24 (tiga kali dua puluh empat) jam terhitung sejak Pengendali Data Pribadi menerima …

---

## pdp-06

**📄 Klausul kontrak:** Vendor dapat menyimpan data pelanggan tanpa batas waktu.

**Hasil sistem:** ❌ menemukan 0 dari 2 pasal kunci · urutan temuan: Pasal 32, Pasal 21, Pasal 41, Pasal 55, Pasal 65

**💬 Alasan Claude memilih kunci ini:** masa retensi

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 42** · ❌ tidak ditemukan
  > (1) Pengendali Data Pribadi wajib mengakhiri pemrosesan Data Pribadi dalam hal: terdapat ketentuan undangan yang tidak UBLIK INDONESIA a. telah mencapai masa retensi; b. tujuan pemrosesan Data Pribadi telah tercapai; atau c. terdapat permintaan dari Subjek Data Pribadi.
  > (2) Pengakhiran pemrosesan Data Pribadi sebagaimana dimaksud pada ayat (1) dilakukan sesuai dengan ketentuan peraturan perundang-undangan.

- [ ] **Pasal 44** · ❌ tidak ditemukan
  > (1) Pengendali Data Pribadi wajib memusnahkan Data Pribadi dalam hal: a. telah habis masa retensinya dan berketerangan dimusnahkan berdasarkarr jadwal retensi arsip; . b. terdapat permintaan dari Subjek Data Pribadi; c. tidak berkaitan dengan penyelesaian proses hukum suatu perkara; dan/ atau d. Data Pribadi diperoleh dan/ atau diproses dengan cara melawan hukum.
  > (2) Pemusnahan Data Pribadi sebagaimana dimaksud pada ayat (1) dilakukan sesuai dengan ketentuan peraturan perundang-undangan. Pasal 45. . . PRES]DEN

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 32** (peringkat 1): (1) Pengendali Data Pribadi wajib memberikan akses kepada Subjek Data Pribadi terhadap Data Pribadi yang diproses beserta rekam jejak pemrosesan Data Pribadi sesuai dengan jangka waktu penyimpanan Data Pribadi. (2) Akses…
- [ ] **Pasal 21** (peringkat 2): (1) Dalam hal pemrosesan Data Pribadi berdasarkan persetujuan sebagaimana dimaksud dalam Pasal 2O ayat (21 huruf a, Pengendali Data Pribadi wajib menyampaikan Informasi mengenai: a. legalitas dari pemrosesan Data Pribadi…
- [ ] **Pasal 41** (peringkat 3): (1) Pengendali Data Pribadi wajib melakukan penundaan dan pembatasan pemrosesan Data Fribadi baik sebagian maupun seluruhnya paling lambat 3 x 24 (tiga kali dua puluh empat) jam terhitung sejak Pengendali Data Pribadi me…
- [ ] **Pasal 55** (peringkat 4): (1) Pengendali Data Pribadi dapat melakukan transfer . Data Pribadi kepada Pengendali Data Pribadi lainnya dalam wilayah hukum Negara Republik Indonesia. a. (2) Pengendali . . . (2) Pengendali Data Pribadi yang melakukan…
- [ ] **Pasal 65** (peringkat 5): (1) Setiap Orang dilarang secara melawan hukum memperoleh atau mengumpulkan Data Pribadi yang bukan miliknya dengan maksud untuk menguntungkan diri sendiri atau orang lain yang dapat mengakibatkan kerugian Subjek Data Pr…

---

## pdp-07

**📄 Klausul kontrak:** Data pribadi pelanggan akan disimpan di server penyedia cloud yang berlokasi di luar negeri.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 2, Pasal 56, Pasal 55, Pasal 37, Pasal 59

**💬 Alasan Claude memilih kunci ini:** transfer ke luar wilayah hukum RI

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 56** · ✅ ditemukan (peringkat 2)
  > (1) Pengendali Data Pribadi dapat melakukan transfer Data Pribadi kepada Pengendali Data Pribadi dan/atau Prosesor Data Pribadi di luar wilayah hukum Negara Republik Indonesia sesuai dengan ketentuan yang diatur dalarn Undang- Undang ini.
  > (2) Dalam melakukan transfer Data Pribadi sebagaimana dimaksud pada ayat (1), Pengendali Data Pribadi wajib memastikan negara tempat kedudukan Pengendali Data Pribadi dan/ atau Prosesor Data Pribadi yang . menerima transfer Data Pribadi memiliki tingkat Pelindungan Data Pribadi yang setara atau lebih tinggi dari yang diatur dalam Undang-Undang ini.
  > (3) Dalam hal ketentuan sebagaimana dimaksud pada ayat (21 tidak terpenuhi, Pengendali Data Pribadi wajib memastikan terdapat Pelindungan Data Pribadi yang memadai dan bersifat mengikat.
  > (4) Dalam hal ketentuan sebagaimana dimaksud pada ayat (21 dan ayat (3) tidak terpenuhi, Pengendali Data Pribadi wajib mendapatkan persetqiuan Subjek Data Pribadi.
  > (5) Ketentuan lebih lanjut mengenai transfer Data Pribadi ' diatur dalam Peraturan Pemerintah.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 2** (peringkat 1): (1) Undang-Undang ini berlaku untuk Setiap Orang, Badan Publik, dan Organisasi Internasional yang melakukan perbuatan hukum sebagaimana diatur dalam Undang-Undang ini: a. yang berada di wilayah hukum Negara Republik Indo…
- [ ] **Pasal 55** (peringkat 3): (1) Pengendali Data Pribadi dapat melakukan transfer . Data Pribadi kepada Pengendali Data Pribadi lainnya dalam wilayah hukum Negara Republik Indonesia. a. (2) Pengendali . . . (2) Pengendali Data Pribadi yang melakukan…
- [ ] **Pasal 37** (peringkat 4): Pengendali Data Pribadi wajib melakukan pengawasan terhadap setiap pihak yang terlibat dalam pemrosesan Data Pribadi di bawah kendali Pengendali Data Pribadi.
- [ ] **Pasal 59** (peringkat 5): l,embaga sebagaimana dimaksud dalam Pasal 58 ayat (2) melaksanakan: a. perumusan dan penetapan kebijakan dan strategi Pelindungan Data Pribadi yang menjadi panduan bagi Subjek Data Pribadi, Pengendali Data Pribadi, dan '…

---

## pdp-08

**📄 Klausul kontrak:** Vendor dapat menggunakan data yang diterima untuk keperluan pemasaran produknya sendiri.

**Hasil sistem:** ❌ menemukan 0 dari 2 pasal kunci · urutan temuan: Pasal 13, Pasal 55, Pasal 18, Pasal 56, Pasal 7

**💬 Alasan Claude memilih kunci ini:** pembatasan tujuan; 51 ayat (6) pemrosesan di luar perintah

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 28** · ❌ tidak ditemukan
  > Pengendali Data Pribadi wajib melakukan pemrosesan Data Pribadi sesuai dengan tujuan pemrosesan Data Pribadi. .

- [ ] **Pasal 51** · ❌ tidak ditemukan
  > (1) Dalam hal Pengendali Data Pribadi menunjuk Prosesor Data Pribadi, Prosesor Data Pribadi wajib melakukan pemrosesan Data Pribadi berdasarkan perintah Pengendali Data Pribadi.
  > (2) Pemrosesan Data Pribadi sebagaimana dimaksud pada ayat (1), dilaksanakan sesuai ketentuan yang diatur dalam Undang-Undang ini.
  > (3) Pemrosesan Data Pribadi sebagaimana dimaksud pada ayat (1) termasuk dalam tanggung jawab Pengendali Data Pribadi.
  > (4) Prosesor Data Pribadi dapat melibatkan Prosesor Data Pribadi lain dalam melakukan pemrosesan Data Pribadi.
  > (5) Prosesor Data Pribadi wajib mendapatkan persetqiuan tertulis dari Pengendali Data Pribadi sebelum melibatkan Prosesor Data Pribadi lain sebagaimana dimaksud pada ayat (4).
  > (6) Dalam hal Prosesor Data Pribadi melakukan pemrosesan Data Pribadi di luar perintah dan tujuan yang ditetapkan Pengendali Data Pribadi, pemosesan Data Pribadi menjadi tanggung jawab Prosesor Data Pribadi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 13** (peringkat 1): (1) Subjek Data Pribadi berhak mendapatkan dan/atau menggunakan Data Pribadi tentang dirinya dari Pengendali Data Pribadi dalam bentuk yang sesuai dengan struktur dan/ atau format yang lazim digunakan atau dapat dibaca o…
- [ ] **Pasal 55** (peringkat 2): (1) Pengendali Data Pribadi dapat melakukan transfer . Data Pribadi kepada Pengendali Data Pribadi lainnya dalam wilayah hukum Negara Republik Indonesia. a. (2) Pengendali . . . (2) Pengendali Data Pribadi yang melakukan…
- [ ] **Pasal 18** (peringkat 3): (1) Pemrosesan Data Pribadi dapat dilalrukan oleh 2 (dua) atau lebih Pengendali Data Pribadi. (2) Dalam hal Pemrosesan Data Pribadi dilakukan oleh 2 (dua) atau lebih Pengendali Data Pribadi harus memenuhi syarat minimal:…
- [ ] **Pasal 56** (peringkat 4): (1) Pengendali Data Pribadi dapat melakukan transfer Data Pribadi kepada Pengendali Data Pribadi dan/atau Prosesor Data Pribadi di luar wilayah hukum Negara Republik Indonesia sesuai dengan ketentuan yang diatur dalarn U…
- [ ] **Pasal 7** (peringkat 5): Subjek Data Pribadi berhak mendapatkan akses dan memperoleh salinan Data Pribadi tentang dirinya sesuai dengan ketentuan peraturan perundang-undangan.

---

## pdp-09

**📄 Klausul kontrak:** Vendor tidak bertanggung jawab atas akses tidak sah ke sistem yang menyimpan data.

**Hasil sistem:** ⚠️ menemukan 1 dari 3 pasal kunci · urutan temuan: Pasal 39, Pasal 38, Pasal 47, Pasal 3, Pasal 13

**💬 Alasan Claude memilih kunci ini:** 52 memberlakukan kewajiban keamanan pengendali ke prosesor/vendor (keputusan Daniel)

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 35** · ❌ tidak ditemukan
  > Pengendali Data Pribadi wajib melindungi dan memastikan keamanan Data Pribadi yang diprosesnya, dengan melakukan: a. pen]rusunan . . . a. penyusunan dan penerapan langkah teknis ' operasional untuk melindungi Data Pribadi dari gangguan pemrosesan Data Pribadi yang bertentangan dengan ketentuan peraturan perundang-undangan; dan b. penentuan tingkat keamanan Data Pribadi dengan memperhatikan sifat dan risiko dari Data Pribadi yang harus dilindungi dalam pemrosesan Data Pribadi.

- [ ] **Pasal 39** · ✅ ditemukan (peringkat 1)
  > (1) Pengendali Data Pribadi wajib mencegah Data Pribadi diakses secara tidak sah.
  > (2) Pencegahan sebagaimana dimaksud pada ayat (1) dilakukan dengan sistem keamanan terhadap Data Pribadi yang diproses dan/ atau memproses Data Pribadi sistem elektronik secara andal, aman, dan bertanggung jawab.
  > (3) Pencegahan sebagaimana dimaksud pada ayat (21 dilakukan sesuai dengan ketentuan peraturan perundang-undangan.

- [ ] **Pasal 52** · ❌ tidak ditemukan
  > Ketentuan mengenai kewajiban Pengendali Data Pribadi sebagaimana dimaksud dalam Pasal 29, Pasal 31, Pasal 35, Pasal 36, Pasal 37, Pasal 38, dan Pasal 39 berlaku juga terhadap Prosesor Data Pribadi. Bagran Bagian Keempat Pejabat atau Petugas yang Melaksanakan Fungsi Pelindungan Data Pribadi

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 38** (peringkat 2): Pengendali Data Pribadi wajib melindungi Data Pribadi dari pemrosesan yang tidak sah.
- [ ] **Pasal 47** (peringkat 3): Pengendali Data Pribadi wajib bertanggung jawab atas pemrosesan Data Pribadi dan menunjukkan pertanggungiawaban dalam kewajiban pelaksanaan prinsip Pelindungan Data Pribadi.
- [ ] **Pasal 3** (peringkat 4): Undang-Undang ini berasaskan : a. b. kepastian hukum; c. kepentingan umum; d. kemanfaatan; e. kehati-hatian; f. keseimbangan; g. pertanggungjawaban; dan h. kerahasiaan.
- [ ] **Pasal 13** (peringkat 5): (1) Subjek Data Pribadi berhak mendapatkan dan/atau menggunakan Data Pribadi tentang dirinya dari Pengendali Data Pribadi dalam bentuk yang sesuai dengan struktur dan/ atau format yang lazim digunakan atau dapat dibaca o…

---

## pdp-10

**📄 Klausul kontrak:** Vendor wajib menerapkan enkripsi dan kontrol keamanan teknis untuk melindungi data.

**Hasil sistem:** ✅ menemukan 2 dari 2 pasal kunci · urutan temuan: Pasal 35, Pasal 38, Pasal 39, Pasal 29, Pasal 27

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 35** · ✅ ditemukan (peringkat 1)
  > Pengendali Data Pribadi wajib melindungi dan memastikan keamanan Data Pribadi yang diprosesnya, dengan melakukan: a. pen]rusunan . . . a. penyusunan dan penerapan langkah teknis ' operasional untuk melindungi Data Pribadi dari gangguan pemrosesan Data Pribadi yang bertentangan dengan ketentuan peraturan perundang-undangan; dan b. penentuan tingkat keamanan Data Pribadi dengan memperhatikan sifat dan risiko dari Data Pribadi yang harus dilindungi dalam pemrosesan Data Pribadi.

- [ ] **Pasal 39** · ✅ ditemukan (peringkat 3)
  > (1) Pengendali Data Pribadi wajib mencegah Data Pribadi diakses secara tidak sah.
  > (2) Pencegahan sebagaimana dimaksud pada ayat (1) dilakukan dengan sistem keamanan terhadap Data Pribadi yang diproses dan/ atau memproses Data Pribadi sistem elektronik secara andal, aman, dan bertanggung jawab.
  > (3) Pencegahan sebagaimana dimaksud pada ayat (21 dilakukan sesuai dengan ketentuan peraturan perundang-undangan.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 38** (peringkat 2): Pengendali Data Pribadi wajib melindungi Data Pribadi dari pemrosesan yang tidak sah.
- [ ] **Pasal 29** (peringkat 4): (1) Pengendali Data Pribadi wajib memastikan akurasi, kelengkapan, dan konsistensi Data Pribadi sesuai dengan ketentuan peraturan perundang-undangan. (2) Dalam . . . (2) Dalam memastikan akurasi, kelengkapan, dan konsist…
- [ ] **Pasal 27** (peringkat 5): Pengendali Data Pribadi wajib melakukan pemrosesan Data Pribadi secara terbatas dan spesifik, sah secara hukum, dan transparan.

---

## pdp-11

**📄 Klausul kontrak:** Karyawan vendor yang mengakses data wajib menjaga kerahasiaan informasi tersebut.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 36, Pasal 21, Pasal 35, Pasal 37, Pasal 38

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 36** · ✅ ditemukan (peringkat 1)
  > Dalam melakukan pemrosesan Data Pribadi, Pengendali Data Pribadi wajib menjaga kerahasiaan Data Pribadi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 21** (peringkat 2): (1) Dalam hal pemrosesan Data Pribadi berdasarkan persetujuan sebagaimana dimaksud dalam Pasal 2O ayat (21 huruf a, Pengendali Data Pribadi wajib menyampaikan Informasi mengenai: a. legalitas dari pemrosesan Data Pribadi…
- [ ] **Pasal 35** (peringkat 3): Pengendali Data Pribadi wajib melindungi dan memastikan keamanan Data Pribadi yang diprosesnya, dengan melakukan: a. pen]rusunan . . . a. penyusunan dan penerapan langkah teknis ' operasional untuk melindungi Data Pribad…
- [ ] **Pasal 37** (peringkat 4): Pengendali Data Pribadi wajib melakukan pengawasan terhadap setiap pihak yang terlibat dalam pemrosesan Data Pribadi di bawah kendali Pengendali Data Pribadi.
- [ ] **Pasal 38** (peringkat 5): Pengendali Data Pribadi wajib melindungi Data Pribadi dari pemrosesan yang tidak sah.

---

## pdp-12

**📄 Klausul kontrak:** Perusahaan berhak mengaudit dan mengawasi vendor yang memproses data atas namanya.

**Hasil sistem:** ❌ menemukan 0 dari 1 pasal kunci · urutan temuan: Pasal 60, Pasal 13, Pasal 6, Pasal 53, Pasal 7

**💬 Alasan Claude memilih kunci ini:** pengawasan pihak yang terlibat pemrosesan

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 37** · ❌ tidak ditemukan
  > Pengendali Data Pribadi wajib melakukan pengawasan terhadap setiap pihak yang terlibat dalam pemrosesan Data Pribadi di bawah kendali Pengendali Data Pribadi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 60** (peringkat 1): Lembaga sebagaimana dimaksud dalam Pasal 58 ayat (2) berwenang: a.. merumuskan dan menetapkan kebijakan di bidang Pelindungan Data Pribadi; b. melakukan . . . b. melakukan pengawasan terhadap kepatuhan Pengendali Data Pr…
- [ ] **Pasal 13** (peringkat 2): (1) Subjek Data Pribadi berhak mendapatkan dan/atau menggunakan Data Pribadi tentang dirinya dari Pengendali Data Pribadi dalam bentuk yang sesuai dengan struktur dan/ atau format yang lazim digunakan atau dapat dibaca o…
- [ ] **Pasal 6** (peringkat 3): Subjek Data Pribadi berhak melengkapi, memperbarui, dan/atau memperbaiki kesalahan dan/atau ketidakakuratan Data Pribadi tentang dirinya sesuai dengan tujuan pemrosesan Data Pribadi. Pasal 7. . . UBLIK INDONESlA
- [ ] **Pasal 53** (peringkat 4): [CATATAN STATUS: Putusan MK: kata 'dan' pada ayat (1) huruf b dimaknai 'dan/atau'] Pasal 53 (1) Pengendali Data Pribadi dan Prosesor Data Pribadi wajib menunjuk pejabat atau petugas yang melaksanakan fungsi Pelindungan D…
- [ ] **Pasal 7** (peringkat 5): Subjek Data Pribadi berhak mendapatkan akses dan memperoleh salinan Data Pribadi tentang dirinya sesuai dengan ketentuan peraturan perundang-undangan.

---

## pdp-13

**📄 Klausul kontrak:** Vendor wajib mencatat log seluruh aktivitas pemrosesan data.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 31, Pasal 28, Pasal 36, Pasal 37, Pasal 51

**💬 Alasan Claude memilih kunci ini:** perekaman kegiatan pemrosesan

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 31** · ✅ ditemukan (peringkat 1)
  > Pengendali Data Pribadi wajib melakukan perekaman terhadap seluruh kegiatan pemrosesan Data Pribadi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 28** (peringkat 2): Pengendali Data Pribadi wajib melakukan pemrosesan Data Pribadi sesuai dengan tujuan pemrosesan Data Pribadi. .
- [ ] **Pasal 36** (peringkat 3): Dalam melakukan pemrosesan Data Pribadi, Pengendali Data Pribadi wajib menjaga kerahasiaan Data Pribadi.
- [ ] **Pasal 37** (peringkat 4): Pengendali Data Pribadi wajib melakukan pengawasan terhadap setiap pihak yang terlibat dalam pemrosesan Data Pribadi di bawah kendali Pengendali Data Pribadi.
- [ ] **Pasal 51** (peringkat 5): (1) Dalam hal Pengendali Data Pribadi menunjuk Prosesor Data Pribadi, Prosesor Data Pribadi wajib melakukan pemrosesan Data Pribadi berdasarkan perintah Pengendali Data Pribadi. (2) Pemrosesan Data Pribadi sebagaimana di…

---

## pdp-14

**📄 Klausul kontrak:** Vendor akan memproses data kesehatan dan data biometrik karyawan.

**Hasil sistem:** ⚠️ menemukan 1 dari 2 pasal kunci · urutan temuan: Pasal 4, Pasal 35, Pasal 53, Pasal 21, Pasal 54

**💬 Alasan Claude memilih kunci ini:** data spesifik; penilaian dampak risiko tinggi

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 4** · ✅ ditemukan (peringkat 1)
  > (1) Data Pribadi terdiri atas: a. Data Pribadi yang bersifat spesifik; dan b. Data Pribadi yang bersifat umum.
  > (2) Data Pribadi yang bersifat spesifik sebagaimana dimaksud pada ayat (1) huruf a meliputi: . a. data dan informasi kesehatan; b. data biometrik; c. data genetika; d. catatan kejahatan; e. data anak; f. data ker.rangan pribadi; dan/ atau g. data lainnya sesuai dengan ketentuan peraturan perundang-undangan.
  > (3) Data Pribadi yang bersifat umum sebagaimana dimaksud pada ayat (1) huruf b meliputi: a. nama lengkap; b. jenis kelamin; c. d. e. f. agama; status perkawinan; dan/ atau Data Pribadi yang dikombinasikan mengidentifikasi seseorang. untuk

- [ ] **Pasal 34** · ❌ tidak ditemukan
  > (1) Pengendali Data Pribadi wajib melakukan penilaian dampak Pelindungan Data Pribadi dalam hal pemrosesan Data Pribadi memiliki potensi risiko tinggi terhadap Subjek Data Pribadi.
  > (2) Pemrosesan Data Pribadi memiliki potensi risiko tinggi sebagaimana dimaksud pada ayat (1) meliputi: a. pengambilan keputusan secara otomatis yang memiliki akibat hukum atau dampak yang . signifikan terhadap Subjek Data Pribadi; b. pemrosesan atas Data Pribadi yang bersifat spesifik; c. pemrosesan Data Pribadi dalam skala besar; d. pemrosesan Data Pribadi untuk kegiatan evaluasi, penskoran, atau pemantauan yang sistematis terhadap Subjek Data Pribadi; e. pemrosesan Data Pribadi untuk kegiatan pencocokan atau penggabungan sekelompok data; f. penggunaan teknologi baru dalam pemrosesan Data Pribadi; dan/ atau g. pemrosescrn Data Pribadi yang membatasi pelaksanaan hak Subjek Data Pribadi.
  > (3) Ketentuan lebih lanjut mengenai penilaian dampak Pelindungan Data Pribadi diatur dalam Peraturan Pemerintah.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 35** (peringkat 2): Pengendali Data Pribadi wajib melindungi dan memastikan keamanan Data Pribadi yang diprosesnya, dengan melakukan: a. pen]rusunan . . . a. penyusunan dan penerapan langkah teknis ' operasional untuk melindungi Data Pribad…
- [ ] **Pasal 53** (peringkat 3): [CATATAN STATUS: Putusan MK: kata 'dan' pada ayat (1) huruf b dimaknai 'dan/atau'] Pasal 53 (1) Pengendali Data Pribadi dan Prosesor Data Pribadi wajib menunjuk pejabat atau petugas yang melaksanakan fungsi Pelindungan D…
- [ ] **Pasal 21** (peringkat 4): (1) Dalam hal pemrosesan Data Pribadi berdasarkan persetujuan sebagaimana dimaksud dalam Pasal 2O ayat (21 huruf a, Pengendali Data Pribadi wajib menyampaikan Informasi mengenai: a. legalitas dari pemrosesan Data Pribadi…
- [ ] **Pasal 54** (peringkat 5): (1) Pejabat atau petugas yang melaksanakan fungsi Pelindungan Data Pribadi memiliki tugas paling sedikit: a menginformasikan dan memberikan saran kepada Pengendali Data Pribadi atau Frosesor Data Pribadi agar mematuhi ke…

---

## pdp-15

**📄 Klausul kontrak:** Persetujuan pengguna dianggap telah diberikan secara otomatis dengan menggunakan layanan.

**Hasil sistem:** ⚠️ menemukan 1 dari 3 pasal kunci · urutan temuan: Pasal 10, Pasal 24, Pasal 22, Pasal 13, Pasal 32

**💬 Alasan Claude memilih kunci ini:** persetujuan tertulis/terekam, eksplisit; klausul tanpa persetujuan sah batal demi hukum

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 22** · ✅ ditemukan (peringkat 3)
  > (1) Persetujuan pemrosesan Data Pribadi dilakukan melalui persetujuan tertulis atau terekam.
  > (2) Persetqiuan sebagaimana dimaksud pada ayat (1) dapat disampaikan secara elektronik atau nonelektronik.
  > (3) Persetqjuan sebagaimana dimaksud pada ayat (1) mempunyai kekuatan hukum yang sama. (4). Dalam hal persetqluan sebagaimana dimaksud pada ayat (1) memuat tujuan lain, permintaan persetqjuan harus memenuhi ketentuan: a. dapat dibedakan secara jelas dengan hal lainnya; b. dibuat dengan forrnat yang dapat dipahami dan mudah diakses; dan c. menggunalan bahasa yang sederhana dan jelas.
  > (5) Persetqjuan yang tidak memenuhi ketentuan sebagaimana dimaksud pada ayat (1) dan ayat (4) dinyatakan batal demi hukum. '

- [ ] **Pasal 23** · ❌ tidak ditemukan
  > Klausul perjanjian yang di dalamnya terdapat permintaan pemrosesan Data Pribadi yang tidak memuat persetqjuan yang sah secara eksplisit dari Subjek Data Pribadi dinyatakan batal demi hukum.

- [ ] **Pasal 20** · ❌ tidak ditemukan
  > (1) Pengendali Data Pribadi wajib memiliki dasar pemrosesan Data Pribadi.
  > (2) Dasar pernmsesan Data Pribadi sebagaimana dimaksud pada ayat (1) meliputi: a. persetujuan yang sah secara eksplisit dari Subjek Data Pribadi untuk 1 (sahr) atau beberapa tujuan tertentu yang telah disampait<an oleh Pengendali Data Pribadi kepada Subjek Data Pribadi; b. pemenuhan kewajiban perjanjian dalam hal Subjek Data Pribadi merupakan salah satu pihak atau untuk memenuhi permintaan Subjek Data Pribadi pada saat akan melalrukan pedanjian; c. pemenuhan kewajiban hukum dari Pengendali Data Pribadi sesuai dengan ketentuan peraturan perundang-undangan; d. pemenuhan pelindungan kepentingan vital Subjek Data Pribadi; e. pelaksanaan tugas dalam rangka kepentJngan umum, pelayanan publik, atau pelaksanaan . kewenangan Pengendali Data Pribadi berdasarkan peraturan perundang-undangan; dan/atau f. pemenuhan kepentingan yang sah lainnya dengan memperhatikan tujuan, kebututran, dan keseimbangan kepentingan Pengendali Data Pribadi dan hak Subjek Data Pribadi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 10** (peringkat 1): (1) Subjek Data Pribadi berhak untuk mengajukan keberatan atas tindakan pengambilan keputusan yang hanya didasarkan pada pemrosesan secara otomatis, termasuk pemrofilan, yang menimbulkan akibat hukum atau berdampak signi…
- [ ] **Pasal 24** (peringkat 2): Dalam melakukan pemrosesan Data Pribadi, Pengendali Data Pribadi wajib menunjukkan bukti persetqjuan yang telah diberikan oleh Subjek Data Pribadi. PRESIOEN
- [ ] **Pasal 13** (peringkat 4): (1) Subjek Data Pribadi berhak mendapatkan dan/atau menggunakan Data Pribadi tentang dirinya dari Pengendali Data Pribadi dalam bentuk yang sesuai dengan struktur dan/ atau format yang lazim digunakan atau dapat dibaca o…
- [ ] **Pasal 32** (peringkat 5): (1) Pengendali Data Pribadi wajib memberikan akses kepada Subjek Data Pribadi terhadap Data Pribadi yang diproses beserta rekam jejak pemrosesan Data Pribadi sesuai dengan jangka waktu penyimpanan Data Pribadi. (2) Akses…

---

## pdp-16

**📄 Klausul kontrak:** Pengguna dapat menarik persetujuan kapan saja dan vendor harus berhenti memproses datanya.

**Hasil sistem:** ✅ menemukan 2 dari 2 pasal kunci · urutan temuan: Pasal 40, Pasal 9, Pasal 35, Pasal 21, Pasal 13

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 40** · ✅ ditemukan (peringkat 1)
  > (1) Pengendali Data Pribadi wajib menghentikan pemrosesan Data Pribadi dalam hal Subjek Data Pribadi menarik kembali persetujuan pemrosesan Data Pribadi.
  > (2) Penghentian pemrosesan Data Pribadi sebagaimana dimaksud pada ayat (1) dilakukan paling lambat 3 x 24 (tiga kali dua puluh empat) jam terhitung sejak Pengendali Data Pribadi menerima permintaan penarikan kembdi persetqiuan pemrosesan Data Pribadi.

- [ ] **Pasal 9** · ✅ ditemukan (peringkat 2)
  > Subjek Data Pribadi berhak menarik kembali persetqjuan pemrosesan Data Pribadi tentang dirinya yang telah diberikan kepada Pengendali Data Pribadi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 35** (peringkat 3): Pengendali Data Pribadi wajib melindungi dan memastikan keamanan Data Pribadi yang diprosesnya, dengan melakukan: a. pen]rusunan . . . a. penyusunan dan penerapan langkah teknis ' operasional untuk melindungi Data Pribad…
- [ ] **Pasal 21** (peringkat 4): (1) Dalam hal pemrosesan Data Pribadi berdasarkan persetujuan sebagaimana dimaksud dalam Pasal 2O ayat (21 huruf a, Pengendali Data Pribadi wajib menyampaikan Informasi mengenai: a. legalitas dari pemrosesan Data Pribadi…
- [ ] **Pasal 13** (peringkat 5): (1) Subjek Data Pribadi berhak mendapatkan dan/atau menggunakan Data Pribadi tentang dirinya dari Pengendali Data Pribadi dalam bentuk yang sesuai dengan struktur dan/ atau format yang lazim digunakan atau dapat dibaca o…

---

## pdp-17

**📄 Klausul kontrak:** Vendor menggunakan sistem pengambilan keputusan otomatis dan profiling terhadap pelanggan.

**Hasil sistem:** ✅ menemukan 2 dari 2 pasal kunci · urutan temuan: Pasal 10, Pasal 34, Pasal 59, Pasal 13, Pasal 60

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 10** · ✅ ditemukan (peringkat 1)
  > (1) Subjek Data Pribadi berhak untuk mengajukan keberatan atas tindakan pengambilan keputusan yang hanya didasarkan pada pemrosesan secara otomatis, termasuk pemrofilan, yang menimbulkan akibat hukum atau berdampak signifrkan pada Subjek Data Pribadi.
  > (2) Ketentuan lebih lanjut mengenai pengajuan keberatan atas pemrosesan secara otomatis sebagaimana dimaksud pada ayat (1) diatur dalam Peraturan Pemerintah.

- [ ] **Pasal 34** · ✅ ditemukan (peringkat 2)
  > (1) Pengendali Data Pribadi wajib melakukan penilaian dampak Pelindungan Data Pribadi dalam hal pemrosesan Data Pribadi memiliki potensi risiko tinggi terhadap Subjek Data Pribadi.
  > (2) Pemrosesan Data Pribadi memiliki potensi risiko tinggi sebagaimana dimaksud pada ayat (1) meliputi: a. pengambilan keputusan secara otomatis yang memiliki akibat hukum atau dampak yang . signifikan terhadap Subjek Data Pribadi; b. pemrosesan atas Data Pribadi yang bersifat spesifik; c. pemrosesan Data Pribadi dalam skala besar; d. pemrosesan Data Pribadi untuk kegiatan evaluasi, penskoran, atau pemantauan yang sistematis terhadap Subjek Data Pribadi; e. pemrosesan Data Pribadi untuk kegiatan pencocokan atau penggabungan sekelompok data; f. penggunaan teknologi baru dalam pemrosesan Data Pribadi; dan/ atau g. pemrosescrn Data Pribadi yang membatasi pelaksanaan hak Subjek Data Pribadi.
  > (3) Ketentuan lebih lanjut mengenai penilaian dampak Pelindungan Data Pribadi diatur dalam Peraturan Pemerintah.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 59** (peringkat 3): l,embaga sebagaimana dimaksud dalam Pasal 58 ayat (2) melaksanakan: a. perumusan dan penetapan kebijakan dan strategi Pelindungan Data Pribadi yang menjadi panduan bagi Subjek Data Pribadi, Pengendali Data Pribadi, dan '…
- [ ] **Pasal 13** (peringkat 4): (1) Subjek Data Pribadi berhak mendapatkan dan/atau menggunakan Data Pribadi tentang dirinya dari Pengendali Data Pribadi dalam bentuk yang sesuai dengan struktur dan/ atau format yang lazim digunakan atau dapat dibaca o…
- [ ] **Pasal 60** (peringkat 5): Lembaga sebagaimana dimaksud dalam Pasal 58 ayat (2) berwenang: a.. merumuskan dan menetapkan kebijakan di bidang Pelindungan Data Pribadi; b. melakukan . . . b. melakukan pengawasan terhadap kepatuhan Pengendali Data Pr…

---

## pdp-18

**📄 Klausul kontrak:** Jika vendor diakuisisi atau melakukan merger, data pribadi akan dialihkan ke perusahaan baru.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 55, Pasal 48, Pasal 56, Pasal 43, Pasal 1

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 48** · ✅ ditemukan (peringkat 2)
  > (1) Pengendali Data Pribadi berbentuk badan hukum yang melakukan penggabungan, pemisahan, pengambilalihan, peleburan, atau pembubaran badan hukum wajib pemberitahuan pengalihan Data Pribadi kepada Subjek Data Pribadi.
  > (2) Pemberitahuan . . . a. b. c.
  > (2) Pemberitahuan pengalihan Data Pribadi sebagaimana dimaksud pada ayat (1) dilakukan sebelum dan sesudah penggabungan, pemisahan, pengambilalihan, peleburan, atau pembubaran badan hukum.
  > (3) Dalam hal Pengendali Data Pribadi berbentuk badan hukum melakukan pembubaran atau dibubarkan, penyimpanan, pentransferan, pemusnahan Data Pribadi dilalsanakan sesuai dengan ketentuan peraturan perundang-undangan.
  > (4) Penyimpanan, pentransferan, penghapusan, atau pemusnahan Data Pribadi sebagaimana dimaksud 'pada ayat (3) diberitahukan kepada Subjek Data Pribadi.
  > (5) Ketentuan lebih lanjut mengenai tata cara pemberitahuan sebagaimana dimaksud pada ayat (1), ayat (21, dan ayat (4) diatur dalam Peraturan Pemerintah.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 55** (peringkat 1): (1) Pengendali Data Pribadi dapat melakukan transfer . Data Pribadi kepada Pengendali Data Pribadi lainnya dalam wilayah hukum Negara Republik Indonesia. a. (2) Pengendali . . . (2) Pengendali Data Pribadi yang melakukan…
- [ ] **Pasal 56** (peringkat 3): (1) Pengendali Data Pribadi dapat melakukan transfer Data Pribadi kepada Pengendali Data Pribadi dan/atau Prosesor Data Pribadi di luar wilayah hukum Negara Republik Indonesia sesuai dengan ketentuan yang diatur dalarn U…
- [ ] **Pasal 43** (peringkat 4): (1) Pengendali Data Pribadi wajib menghapus Data Pribadi dalam hal: a. Data Pribadi tidak lagi diperlukan untuk pencapaian tujuan pemrosesan Data Pribadi; b. Subjek Data Pribadi telah melakukan penarikan kembali persetqi…
- [ ] **Pasal 1** (peringkat 5): Dalam Undang-Undang ini yang dimaksud dengan: 1. Data Pribadi adalah data tentang ora.ng perseorangan yang teridentifikasi atau dapat diidentifikasi secara tersendiri atau dikombinasi dengan informasi lainnya baik secara…

---

## pdp-19

**📄 Klausul kontrak:** Vendor tidak menunjuk petugas pelindungan data pribadi.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 53, Pasal 54, Pasal 46

**💬 Alasan Claude memilih kunci ini:** DPO

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 53** · ✅ ditemukan (peringkat 1)
  > [CATATAN STATUS: Putusan MK: kata 'dan' pada ayat (1) huruf b dimaknai 'dan/atau'] Pasal 53
  > (1) Pengendali Data Pribadi dan Prosesor Data Pribadi wajib menunjuk pejabat atau petugas yang melaksanakan fungsi Pelindungan Data Pribadi dalam hal: a. pemros(:san Data Pribadi untuk kepentingan pelayanan publik; b. kegiatan inti Pengendali Data Pribadi memiliki sifat, ruang lingkup, dan/ atau tujuan yang memerlukan pemantauan secara teratur dan sistematis atas Data Pribadi dengan skala besar; ' dan c. kegiatan inti Pengendali Data Pribadi terdiri dari pemrosesan Data Pribadi dalam skala besar untuk Data Pribadi yang bersifat spesifik dan/ atau Data Pribadi yang berkaitan dengan tindak pidana.
  > (2) Pejabat atau petugas yang melaksanakan fungsi Pelindungan Data Pribadi sebagaimana dimaksud pada ayat (1) ditunjuk berdasarkan profesionalitas, pengetahuan mengenai hukum, praktik Pelindungan Data Pribadi, dan kemampuan untuk memenuhi tugas-tugasnya. (3). Pejabat atau petugas yang melaksanakan fungsi Pelindungan Data Pribadi sebagaimana dimaksud pada ayat (2) dapat berasal dari dalam dan/ atau luar Pengendali Data Pribadi atau Prosesor Data Pribadi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 54** (peringkat 2): (1) Pejabat atau petugas yang melaksanakan fungsi Pelindungan Data Pribadi memiliki tugas paling sedikit: a menginformasikan dan memberikan saran kepada Pengendali Data Pribadi atau Frosesor Data Pribadi agar mematuhi ke…
- [ ] **Pasal 46** (peringkat 3): (1) Dalam hal terjadi kegagalan Pelindungan Data Pribadi, Pengendali Data Pribadi wajib pemberitahuan secara tertulis paling lambat 3 x 24 (tiga kali dua puluh empat) jam kepada: a. Subjek Data Pribadi; dan b. lembaga. (…

---

## pdp-20

**📄 Klausul kontrak:** Vendor memproses data di luar instruksi perusahaan.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 56, Pasal 51, Pasal 23, Pasal 59, Pasal 55

**💬 Alasan Claude memilih kunci ini:** 51 ayat (1) dan (6)

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 51** · ✅ ditemukan (peringkat 2)
  > (1) Dalam hal Pengendali Data Pribadi menunjuk Prosesor Data Pribadi, Prosesor Data Pribadi wajib melakukan pemrosesan Data Pribadi berdasarkan perintah Pengendali Data Pribadi.
  > (2) Pemrosesan Data Pribadi sebagaimana dimaksud pada ayat (1), dilaksanakan sesuai ketentuan yang diatur dalam Undang-Undang ini.
  > (3) Pemrosesan Data Pribadi sebagaimana dimaksud pada ayat (1) termasuk dalam tanggung jawab Pengendali Data Pribadi.
  > (4) Prosesor Data Pribadi dapat melibatkan Prosesor Data Pribadi lain dalam melakukan pemrosesan Data Pribadi.
  > (5) Prosesor Data Pribadi wajib mendapatkan persetqiuan tertulis dari Pengendali Data Pribadi sebelum melibatkan Prosesor Data Pribadi lain sebagaimana dimaksud pada ayat (4).
  > (6) Dalam hal Prosesor Data Pribadi melakukan pemrosesan Data Pribadi di luar perintah dan tujuan yang ditetapkan Pengendali Data Pribadi, pemosesan Data Pribadi menjadi tanggung jawab Prosesor Data Pribadi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 56** (peringkat 1): (1) Pengendali Data Pribadi dapat melakukan transfer Data Pribadi kepada Pengendali Data Pribadi dan/atau Prosesor Data Pribadi di luar wilayah hukum Negara Republik Indonesia sesuai dengan ketentuan yang diatur dalarn U…
- [ ] **Pasal 23** (peringkat 3): Klausul perjanjian yang di dalamnya terdapat permintaan pemrosesan Data Pribadi yang tidak memuat persetqjuan yang sah secara eksplisit dari Subjek Data Pribadi dinyatakan batal demi hukum.
- [ ] **Pasal 59** (peringkat 4): l,embaga sebagaimana dimaksud dalam Pasal 58 ayat (2) melaksanakan: a. perumusan dan penetapan kebijakan dan strategi Pelindungan Data Pribadi yang menjadi panduan bagi Subjek Data Pribadi, Pengendali Data Pribadi, dan '…
- [ ] **Pasal 55** (peringkat 5): (1) Pengendali Data Pribadi dapat melakukan transfer . Data Pribadi kepada Pengendali Data Pribadi lainnya dalam wilayah hukum Negara Republik Indonesia. a. (2) Pengendali . . . (2) Pengendali Data Pribadi yang melakukan…

---

## pdp-21

**📄 Klausul kontrak:** Vendor dapat menjual data pribadi pelanggan untuk memperoleh keuntungan.

**Hasil sistem:** ⚠️ menemukan 1 dari 2 pasal kunci · urutan temuan: Pasal 7, Pasal 65, Pasal 13, Pasal 60

**💬 Alasan Claude memilih kunci ini:** larangan + pidana

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 65** · ✅ ditemukan (peringkat 2)
  > (1) Setiap Orang dilarang secara melawan hukum memperoleh atau mengumpulkan Data Pribadi yang bukan miliknya dengan maksud untuk menguntungkan diri sendiri atau orang lain yang dapat mengakibatkan kerugian Subjek Data Pribadi.
  > (2) Setiap Orang dilarang secara melawan hukum mengungkapkan Data Pribadi yang bukan miliknya. dilarang secara melawan hukum Data Pribadi yang bukan miliknya.
  > (3) Setiap Orang Pasal 66. . .

- [ ] **Pasal 67** · ❌ tidak ditemukan
  > (1) Setiap Orang yang dengan sengaja dan melawan hukum memperoleh atau mengumpulkan Data Pribadi yang bukan mililoeya dengan maksud untuk menguntungkan diri sendiri atau orang lain yang dapat mengakibatkan kerugian Subjek Data Pribadi sebagaimana dimaksud dalam Pasal 65 ayat (1) dipidana dengan pidana penjara paling lama 5 (lima) tahun dan/atau pidana denda paling banyak Rp5.000.000.000,00 (lima miliar rupiah).
  > (2) Setiap Orang yang dengan sengaja dan melawan hukum mengunglapkan Data Pribadi yang bukan miliknya sebagaimana dimaksud dalam Pasal 65 ayat (2) dipidana dengan pidana penjara paling lama 4 (empat) tahun dan/atau pidana denda paling banyak Rp4.000.000.000,00 (empat miliar rupiah).
  > (3) Setiap Orang yang dengan senqaja dan melawan hukum menggunakan Data Pribadi yang bukan miliknya sebagaimana dimaksud dalam Pasal 65 ayat (3) dipidana dengan pidana penjara paling lama 5 (lima) tahun dan/atau pidana denda paling banyak Rp5.00O.OOO.000,00 (lima miliar rupiah).

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 7** (peringkat 1): Subjek Data Pribadi berhak mendapatkan akses dan memperoleh salinan Data Pribadi tentang dirinya sesuai dengan ketentuan peraturan perundang-undangan.
- [ ] **Pasal 13** (peringkat 3): (1) Subjek Data Pribadi berhak mendapatkan dan/atau menggunakan Data Pribadi tentang dirinya dari Pengendali Data Pribadi dalam bentuk yang sesuai dengan struktur dan/ atau format yang lazim digunakan atau dapat dibaca o…
- [ ] **Pasal 60** (peringkat 4): Lembaga sebagaimana dimaksud dalam Pasal 58 ayat (2) berwenang: a.. merumuskan dan menetapkan kebijakan di bidang Pelindungan Data Pribadi; b. melakukan . . . b. melakukan pengawasan terhadap kepatuhan Pengendali Data Pr…

---

## pdp-22

**📄 Klausul kontrak:** Vendor akan memproses data pribadi anak di bawah umur.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 25, Pasal 37, Pasal 59, Pasal 21, Pasal 51

**💬 Alasan Claude memilih kunci ini:** persetujuan orang tua/wali

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 25** · ✅ ditemukan (peringkat 1)
  > (1) Pemrosesan Data Pribadi anak khusus.
  > (2) Pemrosesan Data Pribadi anak sebagaimana dimaksud pada ayat (1) wajib mendapat persetqjuan dari orang tua anak dan/ atau wali anak sesuai dengan ketentuan peraturan perundang-undangan.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 37** (peringkat 2): Pengendali Data Pribadi wajib melakukan pengawasan terhadap setiap pihak yang terlibat dalam pemrosesan Data Pribadi di bawah kendali Pengendali Data Pribadi.
- [ ] **Pasal 59** (peringkat 3): l,embaga sebagaimana dimaksud dalam Pasal 58 ayat (2) melaksanakan: a. perumusan dan penetapan kebijakan dan strategi Pelindungan Data Pribadi yang menjadi panduan bagi Subjek Data Pribadi, Pengendali Data Pribadi, dan '…
- [ ] **Pasal 21** (peringkat 4): (1) Dalam hal pemrosesan Data Pribadi berdasarkan persetujuan sebagaimana dimaksud dalam Pasal 2O ayat (21 huruf a, Pengendali Data Pribadi wajib menyampaikan Informasi mengenai: a. legalitas dari pemrosesan Data Pribadi…
- [ ] **Pasal 51** (peringkat 5): (1) Dalam hal Pengendali Data Pribadi menunjuk Prosesor Data Pribadi, Prosesor Data Pribadi wajib melakukan pemrosesan Data Pribadi berdasarkan perintah Pengendali Data Pribadi. (2) Pemrosesan Data Pribadi sebagaimana di…

---

## pdp-23

**📄 Klausul kontrak:** Vendor wajib memperbaiki data pribadi yang tidak akurat dalam waktu 30 hari setelah permintaan.

**Hasil sistem:** ✅ menemukan 2 dari 2 pasal kunci · urutan temuan: Pasal 30, Pasal 21, Pasal 32, Pasal 6, Pasal 41

**💬 Alasan Claude memilih kunci ini:** 30 ayat (1): paling lambat 3 x 24 jam

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 30** · ✅ ditemukan (peringkat 1)
  > (1) Pengendali Data Pribadi wajib memperbarui dan/ atau ' memperbaiki kesalahan dan/atau ketidakakuratan Data Fribadi paling lambat 3 x 24 (tiga kali dua puluh empat) jam terhitung sejak Pengendali Data Pribadi menerima permintaan pembaruan dan/atau perbaikan Data Pribadi.
  > (2) Pengendali Data Pribadi wajib memberitahukan hasil pembaruan dan/atau perbaikan Data Pribadi kepada Subjek Data Pribadi.

- [ ] **Pasal 6** · ✅ ditemukan (peringkat 4)
  > Subjek Data Pribadi berhak melengkapi, memperbarui, dan/atau memperbaiki kesalahan dan/atau ketidakakuratan Data Pribadi tentang dirinya sesuai dengan tujuan pemrosesan Data Pribadi. Pasal 7. . . UBLIK INDONESlA

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 21** (peringkat 2): (1) Dalam hal pemrosesan Data Pribadi berdasarkan persetujuan sebagaimana dimaksud dalam Pasal 2O ayat (21 huruf a, Pengendali Data Pribadi wajib menyampaikan Informasi mengenai: a. legalitas dari pemrosesan Data Pribadi…
- [ ] **Pasal 32** (peringkat 3): (1) Pengendali Data Pribadi wajib memberikan akses kepada Subjek Data Pribadi terhadap Data Pribadi yang diproses beserta rekam jejak pemrosesan Data Pribadi sesuai dengan jangka waktu penyimpanan Data Pribadi. (2) Akses…
- [ ] **Pasal 41** (peringkat 5): (1) Pengendali Data Pribadi wajib melakukan penundaan dan pembatasan pemrosesan Data Fribadi baik sebagian maupun seluruhnya paling lambat 3 x 24 (tiga kali dua puluh empat) jam terhitung sejak Pengendali Data Pribadi me…

---

## pdp-24

**📄 Klausul kontrak:** Permintaan akses data oleh pemilik data akan ditanggapi vendor dalam 14 hari.

**Hasil sistem:** ✅ menemukan 2 dari 2 pasal kunci · urutan temuan: Pasal 32, Pasal 14, Pasal 21, Pasal 40, Pasal 7

**💬 Alasan Claude memilih kunci ini:** 32 ayat (2): akses paling lambat 3 x 24 jam

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 32** · ✅ ditemukan (peringkat 1)
  > (1) Pengendali Data Pribadi wajib memberikan akses kepada Subjek Data Pribadi terhadap Data Pribadi yang diproses beserta rekam jejak pemrosesan Data Pribadi sesuai dengan jangka waktu penyimpanan Data Pribadi.
  > (2) Akses sebagaimana dimaksud pada ayat (1) diberikan paling lambat 3 x 24 (tiga kali dua puluh empat) jam terhitung sejak Pengendali Data Pribadi menerima permintaan akses.

- [ ] **Pasal 7** · ✅ ditemukan (peringkat 5)
  > Subjek Data Pribadi berhak mendapatkan akses dan memperoleh salinan Data Pribadi tentang dirinya sesuai dengan ketentuan peraturan perundang-undangan.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 14** (peringkat 2): Pelaksanaan hak Subjek Data Pribadi sebagaimana dimaksud dalam Pasal 6 sampai dengan Pasal 11 diajukan melalui permohonan tercatat yang disampaikan secara elektronik atau nonelektronik kepada Pengendali Data Pribadi.
- [ ] **Pasal 21** (peringkat 3): (1) Dalam hal pemrosesan Data Pribadi berdasarkan persetujuan sebagaimana dimaksud dalam Pasal 2O ayat (21 huruf a, Pengendali Data Pribadi wajib menyampaikan Informasi mengenai: a. legalitas dari pemrosesan Data Pribadi…
- [ ] **Pasal 40** (peringkat 4): (1) Pengendali Data Pribadi wajib menghentikan pemrosesan Data Pribadi dalam hal Subjek Data Pribadi menarik kembali persetujuan pemrosesan Data Pribadi. (2) Penghentian pemrosesan Data Pribadi sebagaimana dimaksud pada …

---

## pdp-25

**📄 Klausul kontrak:** Vendor tidak wajib memberitahu pemilik data setelah datanya dihapus atau dimusnahkan.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 44, Pasal 43, Pasal 45, Pasal 56, Pasal 30

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 45** · ✅ ditemukan (peringkat 3)
  > Pengendali Data Pribadi wajib memberitahukan penghapusan dan/atau pemusnahan Data Pribadi kepada Subjek Data Pribadi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 44** (peringkat 1): (1) Pengendali Data Pribadi wajib memusnahkan Data Pribadi dalam hal: a. telah habis masa retensinya dan berketerangan dimusnahkan berdasarkarr jadwal retensi arsip; . b. terdapat permintaan dari Subjek Data Pribadi; c. …
- [ ] **Pasal 43** (peringkat 2): (1) Pengendali Data Pribadi wajib menghapus Data Pribadi dalam hal: a. Data Pribadi tidak lagi diperlukan untuk pencapaian tujuan pemrosesan Data Pribadi; b. Subjek Data Pribadi telah melakukan penarikan kembali persetqi…
- [ ] **Pasal 56** (peringkat 4): (1) Pengendali Data Pribadi dapat melakukan transfer Data Pribadi kepada Pengendali Data Pribadi dan/atau Prosesor Data Pribadi di luar wilayah hukum Negara Republik Indonesia sesuai dengan ketentuan yang diatur dalarn U…
- [ ] **Pasal 30** (peringkat 5): (1) Pengendali Data Pribadi wajib memperbarui dan/ atau ' memperbaiki kesalahan dan/atau ketidakakuratan Data Fribadi paling lambat 3 x 24 (tiga kali dua puluh empat) jam terhitung sejak Pengendali Data Pribadi menerima …

---

## pdp-26

**📄 Klausul kontrak:** Vendor dan perusahaan bersama-sama menentukan tujuan pemrosesan data pelanggan tanpa perjanjian pembagian peran dan tanggung jawab.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 18, Pasal 51, Pasal 47, Pasal 20, Pasal 1

**💬 Alasan Claude memilih kunci ini:** pengendali bersama

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 18** · ✅ ditemukan (peringkat 1)
  > (1) Pemrosesan Data Pribadi dapat dilalrukan oleh 2 (dua) atau lebih Pengendali Data Pribadi.
  > (2) Dalam hal Pemrosesan Data Pribadi dilakukan oleh 2 (dua) atau lebih Pengendali Data Pribadi harus memenuhi syarat minimal: a. terdapat perjanjian antara para Pengendali Data Pribadi yang memuat peran, tanggung jawab, dan hubungan antar-Pengendali Data Pribadi; b. terdapat tujuan yang saling berkaitan dan cara pemrosesan Data Pribadi yang ditentukan secara bersama; dan c. terdapat narahubung yang ditunjuk secara bersama-sama.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 51** (peringkat 2): (1) Dalam hal Pengendali Data Pribadi menunjuk Prosesor Data Pribadi, Prosesor Data Pribadi wajib melakukan pemrosesan Data Pribadi berdasarkan perintah Pengendali Data Pribadi. (2) Pemrosesan Data Pribadi sebagaimana di…
- [ ] **Pasal 47** (peringkat 3): Pengendali Data Pribadi wajib bertanggung jawab atas pemrosesan Data Pribadi dan menunjukkan pertanggungiawaban dalam kewajiban pelaksanaan prinsip Pelindungan Data Pribadi.
- [ ] **Pasal 20** (peringkat 4): (1) Pengendali Data Pribadi wajib memiliki dasar pemrosesan Data Pribadi. (2) Dasar pernmsesan Data Pribadi sebagaimana dimaksud pada ayat (1) meliputi: a. persetujuan yang sah secara eksplisit dari Subjek Data Pribadi u…
- [ ] **Pasal 1** (peringkat 5): Dalam Undang-Undang ini yang dimaksud dengan: 1. Data Pribadi adalah data tentang ora.ng perseorangan yang teridentifikasi atau dapat diidentifikasi secara tersendiri atau dikombinasi dengan informasi lainnya baik secara…

---

## pdp-27

**📄 Klausul kontrak:** Vendor tidak perlu menyimpan bukti persetujuan yang diberikan pengguna.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 24, Pasal 22, Pasal 38, Pasal 9, Pasal 23

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 24** · ✅ ditemukan (peringkat 1)
  > Dalam melakukan pemrosesan Data Pribadi, Pengendali Data Pribadi wajib menunjukkan bukti persetqjuan yang telah diberikan oleh Subjek Data Pribadi. PRESIOEN

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 22** (peringkat 2): (1) Persetujuan pemrosesan Data Pribadi dilakukan melalui persetujuan tertulis atau terekam. (2) Persetqiuan sebagaimana dimaksud pada ayat (1) dapat disampaikan secara elektronik atau nonelektronik. (3) Persetqjuan seba…
- [ ] **Pasal 38** (peringkat 3): Pengendali Data Pribadi wajib melindungi Data Pribadi dari pemrosesan yang tidak sah.
- [ ] **Pasal 9** (peringkat 4): Subjek Data Pribadi berhak menarik kembali persetqjuan pemrosesan Data Pribadi tentang dirinya yang telah diberikan kepada Pengendali Data Pribadi.
- [ ] **Pasal 23** (peringkat 5): Klausul perjanjian yang di dalamnya terdapat permintaan pemrosesan Data Pribadi yang tidak memuat persetqjuan yang sah secara eksplisit dari Subjek Data Pribadi dinyatakan batal demi hukum.

---

## pdp-28

**📄 Klausul kontrak:** Formulir persetujuan tidak menjelaskan tujuan, jenis data, dan jangka waktu penyimpanan data.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 21, Pasal 22, Pasal 27, Pasal 16

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 21** · ✅ ditemukan (peringkat 1)
  > (1) Dalam hal pemrosesan Data Pribadi berdasarkan persetujuan sebagaimana dimaksud dalam Pasal 2O ayat (21 huruf a, Pengendali Data Pribadi wajib menyampaikan Informasi mengenai: a. legalitas dari pemrosesan Data Pribadi; b. tujuan pemrosesan Data Pribadi; c. jenis dan relevansi Data Pribadi yang akan diproses; d. jangka waktu retensi dokumen yang memuat Data Pribadi; e. rincian mengenai Informasi yang f. jangka waktu pemrosesan Data Pribadi; dan C. hak Subjek Data Pribadi.
  > (2) Dalam . . . PRESIEIEN
  > (2) Dalam hal terdapat perubahan Informasi sebagaimana dimaksud pada ayat (1), Pengendali Data Pribadi wajib . memberitahukan kepada Subjek Data Pribadi sebelum terjadi perubahan Informasi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 22** (peringkat 2): (1) Persetujuan pemrosesan Data Pribadi dilakukan melalui persetujuan tertulis atau terekam. (2) Persetqiuan sebagaimana dimaksud pada ayat (1) dapat disampaikan secara elektronik atau nonelektronik. (3) Persetqjuan seba…
- [ ] **Pasal 27** (peringkat 3): Pengendali Data Pribadi wajib melakukan pemrosesan Data Pribadi secara terbatas dan spesifik, sah secara hukum, dan transparan.
- [ ] **Pasal 16** (peringkat 4): (1) Pemrosesan Data Pribadi meliputi: ' a. pemerolehan dan pengumpulan; b. pengolahan dan penganalisisan; c. penyimpanan; d. perbaikan dan pembaruan; e. penampilan, pengumuman, transfer, penyebarluasan, atau pengungkapan…

---

## pdp-29

**📄 Klausul kontrak:** Vendor memasang kamera CCTV dengan pengenalan wajah di area publik untuk mengidentifikasi pengunjung.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 17, Pasal 10, Pasal 1, Pasal 37, Pasal 19

**💬 Alasan Claude memilih kunci ini:** teks OCR Pasal 17 sebagian hilang

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 17** · ✅ ditemukan (peringkat 1)
  > (1) Pemasangan alat pemroses atau pengolah data visual di tempat umum dan/ atau pada fasilitas pelayanan publik dilakukan dengan ketentuan: a. untuk tujuan keamanan, pencegahan bencana, dan/atau pengumpulan, analisis, dan pengaturan Informasi lalu lintas; b. harus Informasi pada area yang telah dipasang alat pemroses atau pengolah data visual; dan c. tidak digunakan untuk seseorang.
  > (2) Ketentuan sebagaimana dimaksud pada ayat (1) huruf b dan huruf c dikecualikan untuk pencegahan tindak pidana dan proses penegakan hukum sesuai dengan ketentuan peraturan perundang-undangan. perusakan, dan/atau lalu lintas atau Pasal 18. . . BLIK INDONESIA

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 10** (peringkat 2): (1) Subjek Data Pribadi berhak untuk mengajukan keberatan atas tindakan pengambilan keputusan yang hanya didasarkan pada pemrosesan secara otomatis, termasuk pemrofilan, yang menimbulkan akibat hukum atau berdampak signi…
- [ ] **Pasal 1** (peringkat 3): Dalam Undang-Undang ini yang dimaksud dengan: 1. Data Pribadi adalah data tentang ora.ng perseorangan yang teridentifikasi atau dapat diidentifikasi secara tersendiri atau dikombinasi dengan informasi lainnya baik secara…
- [ ] **Pasal 37** (peringkat 4): Pengendali Data Pribadi wajib melakukan pengawasan terhadap setiap pihak yang terlibat dalam pemrosesan Data Pribadi di bawah kendali Pengendali Data Pribadi.
- [ ] **Pasal 19** (peringkat 5): Pengendali Data Pribadi dan Prosesor Data Pribadi meliputi: a. Setiap Orang; b. Badan Publik; dan c. Organisasi Internasional. Bagian Kedua Kewajiban Pengendali Data Pribadi

---

## pdp-30

**📄 Klausul kontrak:** Data pelanggan dapat dipindahkan ke perusahaan afiliasi vendor yang berada di Indonesia.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 55, Pasal 2, Pasal 56, Pasal 13, Pasal 60

**💬 Alasan Claude memilih kunci ini:** transfer dalam negeri

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 55** · ✅ ditemukan (peringkat 1)
  > (1) Pengendali Data Pribadi dapat melakukan transfer . Data Pribadi kepada Pengendali Data Pribadi lainnya dalam wilayah hukum Negara Republik Indonesia. a.
  > (2) Pengendali . . .
  > (2) Pengendali Data Pribadi yang melakukan transfer Data Pribadi dan yang menerima transfer Data Pribadi wajib melakukan Pelindungan Data Pribadi sebagaimana dimaksud dalam Undang-Undang ini. Bagian Kedua Transfer Data Pribadi ke Luar Wilayah Hukum Negara Republik Indonesia

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 2** (peringkat 2): (1) Undang-Undang ini berlaku untuk Setiap Orang, Badan Publik, dan Organisasi Internasional yang melakukan perbuatan hukum sebagaimana diatur dalam Undang-Undang ini: a. yang berada di wilayah hukum Negara Republik Indo…
- [ ] **Pasal 56** (peringkat 3): (1) Pengendali Data Pribadi dapat melakukan transfer Data Pribadi kepada Pengendali Data Pribadi dan/atau Prosesor Data Pribadi di luar wilayah hukum Negara Republik Indonesia sesuai dengan ketentuan yang diatur dalarn U…
- [ ] **Pasal 13** (peringkat 4): (1) Subjek Data Pribadi berhak mendapatkan dan/atau menggunakan Data Pribadi tentang dirinya dari Pengendali Data Pribadi dalam bentuk yang sesuai dengan struktur dan/ atau format yang lazim digunakan atau dapat dibaca o…
- [ ] **Pasal 60** (peringkat 5): Lembaga sebagaimana dimaksud dalam Pasal 58 ayat (2) berwenang: a.. merumuskan dan menetapkan kebijakan di bidang Pelindungan Data Pribadi; b. melakukan . . . b. melakukan pengawasan terhadap kepatuhan Pengendali Data Pr…

---

## pdp-31

**📄 Klausul kontrak:** Vendor sebagai pemroses data tidak tunduk pada kewajiban keamanan dan kerahasiaan yang berlaku bagi pengendali data.

**Hasil sistem:** ❌ menemukan 0 dari 1 pasal kunci · urutan temuan: Pasal 35, Pasal 54, Pasal 36, Pasal 47, Pasal 50

**💬 Alasan Claude memilih kunci ini:** 52 memberlakukan 29, 31, 35-39 ke prosesor

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 52** · ❌ tidak ditemukan
  > Ketentuan mengenai kewajiban Pengendali Data Pribadi sebagaimana dimaksud dalam Pasal 29, Pasal 31, Pasal 35, Pasal 36, Pasal 37, Pasal 38, dan Pasal 39 berlaku juga terhadap Prosesor Data Pribadi. Bagran Bagian Keempat Pejabat atau Petugas yang Melaksanakan Fungsi Pelindungan Data Pribadi

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 35** (peringkat 1): Pengendali Data Pribadi wajib melindungi dan memastikan keamanan Data Pribadi yang diprosesnya, dengan melakukan: a. pen]rusunan . . . a. penyusunan dan penerapan langkah teknis ' operasional untuk melindungi Data Pribad…
- [ ] **Pasal 54** (peringkat 2): (1) Pejabat atau petugas yang melaksanakan fungsi Pelindungan Data Pribadi memiliki tugas paling sedikit: a menginformasikan dan memberikan saran kepada Pengendali Data Pribadi atau Frosesor Data Pribadi agar mematuhi ke…
- [ ] **Pasal 36** (peringkat 3): Dalam melakukan pemrosesan Data Pribadi, Pengendali Data Pribadi wajib menjaga kerahasiaan Data Pribadi.
- [ ] **Pasal 47** (peringkat 4): Pengendali Data Pribadi wajib bertanggung jawab atas pemrosesan Data Pribadi dan menunjukkan pertanggungiawaban dalam kewajiban pelaksanaan prinsip Pelindungan Data Pribadi.
- [ ] **Pasal 50** (peringkat 5): (1) Kewajiban Pengendali Data Pribadi sebagaimana dimaksud dalam Pasal 30, Pasal 32, Pasal 36, PasaJ42, Pasal 43 ayat (1) huruf a sampai dengan huruf c, Pasal 44 ayat (1) huruf b, Pasal 45, dan Pasal 46 ayat (1) huruf a,…

---

## pdp-32

**📄 Klausul kontrak:** Vendor tidak wajib memastikan keakuratan dan konsistensi data yang diolahnya.

**Hasil sistem:** ⚠️ menemukan 1 dari 2 pasal kunci · urutan temuan: Pasal 29, Pasal 35, Pasal 54, Pasal 56, Pasal 21

**💬 Alasan Claude memilih kunci ini:** 52 memberlakukan Pasal 29 ke prosesor/vendor (keputusan Daniel)

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 29** · ✅ ditemukan (peringkat 1)
  > (1) Pengendali Data Pribadi wajib memastikan akurasi, kelengkapan, dan konsistensi Data Pribadi sesuai dengan ketentuan peraturan perundang-undangan.
  > (2) Dalam . . .
  > (2) Dalam memastikan akurasi, kelengkapan, dan konsistensi Data Pribadi sebagaimana dimaksud pada ayat (1) Pengendali Data Pribadi wajib melakukan verifikasi.

- [ ] **Pasal 52** · ❌ tidak ditemukan
  > Ketentuan mengenai kewajiban Pengendali Data Pribadi sebagaimana dimaksud dalam Pasal 29, Pasal 31, Pasal 35, Pasal 36, Pasal 37, Pasal 38, dan Pasal 39 berlaku juga terhadap Prosesor Data Pribadi. Bagran Bagian Keempat Pejabat atau Petugas yang Melaksanakan Fungsi Pelindungan Data Pribadi

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 35** (peringkat 2): Pengendali Data Pribadi wajib melindungi dan memastikan keamanan Data Pribadi yang diprosesnya, dengan melakukan: a. pen]rusunan . . . a. penyusunan dan penerapan langkah teknis ' operasional untuk melindungi Data Pribad…
- [ ] **Pasal 54** (peringkat 3): (1) Pejabat atau petugas yang melaksanakan fungsi Pelindungan Data Pribadi memiliki tugas paling sedikit: a menginformasikan dan memberikan saran kepada Pengendali Data Pribadi atau Frosesor Data Pribadi agar mematuhi ke…
- [ ] **Pasal 56** (peringkat 4): (1) Pengendali Data Pribadi dapat melakukan transfer Data Pribadi kepada Pengendali Data Pribadi dan/atau Prosesor Data Pribadi di luar wilayah hukum Negara Republik Indonesia sesuai dengan ketentuan yang diatur dalarn U…
- [ ] **Pasal 21** (peringkat 5): (1) Dalam hal pemrosesan Data Pribadi berdasarkan persetujuan sebagaimana dimaksud dalam Pasal 2O ayat (21 huruf a, Pengendali Data Pribadi wajib menyampaikan Informasi mengenai: a. legalitas dari pemrosesan Data Pribadi…

---

## pdp-33

**📄 Klausul kontrak:** Pengguna tidak dapat meminta salinan datanya atau memindahkan datanya ke penyedia lain.

**Hasil sistem:** ✅ menemukan 2 dari 2 pasal kunci · urutan temuan: Pasal 13, Pasal 66, Pasal 55, Pasal 60, Pasal 7

**💬 Alasan Claude memilih kunci ini:** portabilitas

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 13** · ✅ ditemukan (peringkat 1)
  > (1) Subjek Data Pribadi berhak mendapatkan dan/atau menggunakan Data Pribadi tentang dirinya dari Pengendali Data Pribadi dalam bentuk yang sesuai dengan struktur dan/ atau format yang lazim digunakan atau dapat dibaca oleh sistem elektronik.
  > (2) Subjek Data Pribadi berhak dan Data Pribadi tentang dirinya ke Pengendali Data Pribadi lainnya, sepanjang sistem yang digunakan dapat saling berkomunikasi secara aman sesuai dengan prinsip Pelindungan Data Pribadi berdasarkan Undang-Undang ini.
  > (3) Ketentuan lebih lanjut mengenai hak Subjek Data Pribadi untuk menggunakan dan Data Pribadi sebagaimana dimaksud pada ayat (2) diatur dalam Peraturan Pemerintah.

- [ ] **Pasal 7** · ✅ ditemukan (peringkat 5)
  > Subjek Data Pribadi berhak mendapatkan akses dan memperoleh salinan Data Pribadi tentang dirinya sesuai dengan ketentuan peraturan perundang-undangan.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 66** (peringkat 2): Setiap Orang dilarang membuat Data Pribadi palsu atau memalsul<an Data Pribadi dengan maksud r.rntuk diri sendiri atau orang lain yang dapat mengakibatkan kerugian bagi orang lain.
- [ ] **Pasal 55** (peringkat 3): (1) Pengendali Data Pribadi dapat melakukan transfer . Data Pribadi kepada Pengendali Data Pribadi lainnya dalam wilayah hukum Negara Republik Indonesia. a. (2) Pengendali . . . (2) Pengendali Data Pribadi yang melakukan…
- [ ] **Pasal 60** (peringkat 4): Lembaga sebagaimana dimaksud dalam Pasal 58 ayat (2) berwenang: a.. merumuskan dan menetapkan kebijakan di bidang Pelindungan Data Pribadi; b. melakukan . . . b. melakukan pengawasan terhadap kepatuhan Pengendali Data Pr…

---

## pdp-34

**📄 Klausul kontrak:** Vendor tidak menanggung ganti rugi kepada pemilik data atas pelanggaran pemrosesan data pribadi.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 12, Pasal 47, Pasal 38, Pasal 34, Pasal 9

**💬 Alasan Claude memilih kunci ini:** 47 dibuang karena terlalu umum (keputusan Daniel)

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 12** · ✅ ditemukan (peringkat 1)
  > (1) Subjek Data Pribadi berhak menggugat dan menerima ganti rugi atas pelanggaran pemrosesan Data Pribadi tentang dirinya sesuai dengan ketentuan peraturan perundang-undangan.
  > (2) Ketentuan . . .
  > (2) Ketentuan lebih lanjut mengenai pelanggaran pemrosesan Data Pribadi dan tata cara pengenaan ganti rugi sebagaimana dimaksud pada ayat (1) diatur dalam Peraturan Pemerintah.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 47** (peringkat 2): Pengendali Data Pribadi wajib bertanggung jawab atas pemrosesan Data Pribadi dan menunjukkan pertanggungiawaban dalam kewajiban pelaksanaan prinsip Pelindungan Data Pribadi.
- [ ] **Pasal 38** (peringkat 3): Pengendali Data Pribadi wajib melindungi Data Pribadi dari pemrosesan yang tidak sah.
- [ ] **Pasal 34** (peringkat 4): (1) Pengendali Data Pribadi wajib melakukan penilaian dampak Pelindungan Data Pribadi dalam hal pemrosesan Data Pribadi memiliki potensi risiko tinggi terhadap Subjek Data Pribadi. (2) Pemrosesan Data Pribadi memiliki po…
- [ ] **Pasal 9** (peringkat 5): Subjek Data Pribadi berhak menarik kembali persetqjuan pemrosesan Data Pribadi tentang dirinya yang telah diberikan kepada Pengendali Data Pribadi.

---

## pdp-35

**📄 Klausul kontrak:** Pemilik data tidak dapat meminta penundaan atau pembatasan pemrosesan datanya.

**Hasil sistem:** ⚠️ menemukan 1 dari 2 pasal kunci · urutan temuan: Pasal 41, Pasal 16, Pasal 18, Pasal 43, Pasal 53

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 11** · ❌ tidak ditemukan
  > Subjek Data Pribadi berhak menunda atau membatasi pemrosesan Data Pribadi secara sesual dengan tujuan pemrosesan Data Pribadi.

- [ ] **Pasal 41** · ✅ ditemukan (peringkat 1)
  > (1) Pengendali Data Pribadi wajib melakukan penundaan dan pembatasan pemrosesan Data Fribadi baik sebagian maupun seluruhnya paling lambat 3 x 24 (tiga kali dua puluh empat) jam terhitung sejak Pengendali Data Pribadi menerima permintaan penundaan dan pembatasan pemrosesan Data Pribadi.
  > (2) Penundaan dan pembatasan pemrosesan Data Pribadi sebagaimana dimaksud pada ayat (1) dikecualikan . dalam hal: a peraturan perundangdilakukan penundaan dan Pribadi; pemrosesan Data b. dapat membahayakan keselamatan pihak lain; dan/ata.u c. Subjek Data Pribadi terikat perjanjian tertulis dengan Pengendali Data Pribadi yang tidak dilalrukan dan pembatasan pemrosesan Data Pribadi.
  > (3) Pengendali Data Pribadi wajib memberitahukan telah dilaksanakan penundaan dan pembatasan pemrosesan Data Pribadi kepada Subjek Data Pribadi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 16** (peringkat 2): (1) Pemrosesan Data Pribadi meliputi: ' a. pemerolehan dan pengumpulan; b. pengolahan dan penganalisisan; c. penyimpanan; d. perbaikan dan pembaruan; e. penampilan, pengumuman, transfer, penyebarluasan, atau pengungkapan…
- [ ] **Pasal 18** (peringkat 3): (1) Pemrosesan Data Pribadi dapat dilalrukan oleh 2 (dua) atau lebih Pengendali Data Pribadi. (2) Dalam hal Pemrosesan Data Pribadi dilakukan oleh 2 (dua) atau lebih Pengendali Data Pribadi harus memenuhi syarat minimal:…
- [ ] **Pasal 43** (peringkat 4): (1) Pengendali Data Pribadi wajib menghapus Data Pribadi dalam hal: a. Data Pribadi tidak lagi diperlukan untuk pencapaian tujuan pemrosesan Data Pribadi; b. Subjek Data Pribadi telah melakukan penarikan kembali persetqi…
- [ ] **Pasal 53** (peringkat 5): [CATATAN STATUS: Putusan MK: kata 'dan' pada ayat (1) huruf b dimaknai 'dan/atau'] Pasal 53 (1) Pengendali Data Pribadi dan Prosesor Data Pribadi wajib menunjuk pejabat atau petugas yang melaksanakan fungsi Pelindungan D…

---

## pdp-36

**📄 Klausul kontrak:** Vendor tidak melakukan penilaian dampak pelindungan data sebelum memproses data dalam skala besar.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 34, Pasal 53, Pasal 54, Pasal 60

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 34** · ✅ ditemukan (peringkat 1)
  > (1) Pengendali Data Pribadi wajib melakukan penilaian dampak Pelindungan Data Pribadi dalam hal pemrosesan Data Pribadi memiliki potensi risiko tinggi terhadap Subjek Data Pribadi.
  > (2) Pemrosesan Data Pribadi memiliki potensi risiko tinggi sebagaimana dimaksud pada ayat (1) meliputi: a. pengambilan keputusan secara otomatis yang memiliki akibat hukum atau dampak yang . signifikan terhadap Subjek Data Pribadi; b. pemrosesan atas Data Pribadi yang bersifat spesifik; c. pemrosesan Data Pribadi dalam skala besar; d. pemrosesan Data Pribadi untuk kegiatan evaluasi, penskoran, atau pemantauan yang sistematis terhadap Subjek Data Pribadi; e. pemrosesan Data Pribadi untuk kegiatan pencocokan atau penggabungan sekelompok data; f. penggunaan teknologi baru dalam pemrosesan Data Pribadi; dan/ atau g. pemrosescrn Data Pribadi yang membatasi pelaksanaan hak Subjek Data Pribadi.
  > (3) Ketentuan lebih lanjut mengenai penilaian dampak Pelindungan Data Pribadi diatur dalam Peraturan Pemerintah.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 53** (peringkat 2): [CATATAN STATUS: Putusan MK: kata 'dan' pada ayat (1) huruf b dimaknai 'dan/atau'] Pasal 53 (1) Pengendali Data Pribadi dan Prosesor Data Pribadi wajib menunjuk pejabat atau petugas yang melaksanakan fungsi Pelindungan D…
- [ ] **Pasal 54** (peringkat 3): (1) Pejabat atau petugas yang melaksanakan fungsi Pelindungan Data Pribadi memiliki tugas paling sedikit: a menginformasikan dan memberikan saran kepada Pengendali Data Pribadi atau Frosesor Data Pribadi agar mematuhi ke…
- [ ] **Pasal 60** (peringkat 4): Lembaga sebagaimana dimaksud dalam Pasal 58 ayat (2) berwenang: a.. merumuskan dan menetapkan kebijakan di bidang Pelindungan Data Pribadi; b. melakukan . . . b. melakukan pengawasan terhadap kepatuhan Pengendali Data Pr…

---

## pdp-37

**📄 Klausul kontrak:** Vendor tidak wajib mengikuti perintah lembaga pengawas pelindungan data pribadi.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 49, Pasal 60, Pasal 38, Pasal 56, Pasal 47

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 49** · ✅ ditemukan (peringkat 1)
  > Pengendali Data Pribadi dan/ atau Prosesor Data Pribadi wajib melaksanakan perintah lembaga dalam rangka penyelenggaraan Pelindungan Data Pribadi sesuai dengan Undang-Undang ini.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 60** (peringkat 2): Lembaga sebagaimana dimaksud dalam Pasal 58 ayat (2) berwenang: a.. merumuskan dan menetapkan kebijakan di bidang Pelindungan Data Pribadi; b. melakukan . . . b. melakukan pengawasan terhadap kepatuhan Pengendali Data Pr…
- [ ] **Pasal 38** (peringkat 3): Pengendali Data Pribadi wajib melindungi Data Pribadi dari pemrosesan yang tidak sah.
- [ ] **Pasal 56** (peringkat 4): (1) Pengendali Data Pribadi dapat melakukan transfer Data Pribadi kepada Pengendali Data Pribadi dan/atau Prosesor Data Pribadi di luar wilayah hukum Negara Republik Indonesia sesuai dengan ketentuan yang diatur dalarn U…
- [ ] **Pasal 47** (peringkat 5): Pengendali Data Pribadi wajib bertanggung jawab atas pemrosesan Data Pribadi dan menunjukkan pertanggungiawaban dalam kewajiban pelaksanaan prinsip Pelindungan Data Pribadi.

---

## pdp-38

**📄 Klausul kontrak:** Pelanggaran ketentuan pelindungan data oleh vendor hanya dikenai teguran tanpa sanksi denda.

**Hasil sistem:** ❌ menemukan 0 dari 1 pasal kunci · urutan temuan: Pasal 60, Pasal 67, Pasal 53, Pasal 46, Pasal 27

**💬 Alasan Claude memilih kunci ini:** sanksi administratif, denda maks 2%

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 57** · ❌ tidak ditemukan
  > (1) Pelanggaran terhadap ketentuan Pasal 2O ayat (1), ' Pasal 21, Pasal 24, Pasal 25 ayat (2), Pasal 26ayat(31, Pasal 27, Pasal 28, Pasal 29, Pasal 30, Pasal 31, Pasal 32 ayat (1), Pasal 33, Pasal 34 ayat (1), Pasal 35, Pasal 36, Pasal 37, Pasal 38, Pasal 39 ayat (1), Pasal 4O ayat (1), Pasal 41 ayat (1) dan ayat (3), Pasal 42 ayat (1), Pasal 43 ayat (1), Pasal 44 ayat (1), Pasal 45, Pasal 46 ayat (1) dan ayat (3), Pasal 47, Pasal 48 ayat (1), Pasal 49, Pasal 51 ayat (1) dan ayat (5), Pasal 52, Pasal 53 ayat (1), Pasal 55 ayat (21, dan Pasal 56 ayat (2) sampai dengan ayat (4) dikenai sanksi administratif.
  > (2) Sanksi administratif sebagaimana dimaksud pada ayat (1) berupa: a. peringatantertulis; b. penghentian sementara kegiatan pemrosesan Data Pribadi; c. penghapusan atau pemusnahan Data Pribadi; dan/atau d. dendaadministratif.
  > (3) Sanksi administratif berupa denda administratif sebagaimana dimaksud pada ayat (2) huruf d paling tinggi 2 (dua) persen dari perrdapatan tahunan atau . penerimaan tahunan terhadap variabel pelanggaran.
  > (4) Penjatuhan sanksi administratif sebagaimana dimaksud pada ayat (2) diberikan oleh lembaga.
  > (5) Ketentuan lebih lanjut mengenai tata cara pengenaan sanksi administratif selagaimana dimaksud pada ayat (3) diatur dalam Peraturan Pemerintah. BAB IX. . . UALIK INDONES BAB Ix KELEMBAGAAN

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 60** (peringkat 1): Lembaga sebagaimana dimaksud dalam Pasal 58 ayat (2) berwenang: a.. merumuskan dan menetapkan kebijakan di bidang Pelindungan Data Pribadi; b. melakukan . . . b. melakukan pengawasan terhadap kepatuhan Pengendali Data Pr…
- [ ] **Pasal 67** (peringkat 2): (1) Setiap Orang yang dengan sengaja dan melawan hukum memperoleh atau mengumpulkan Data Pribadi yang bukan mililoeya dengan maksud untuk menguntungkan diri sendiri atau orang lain yang dapat mengakibatkan kerugian Subje…
- [ ] **Pasal 53** (peringkat 3): [CATATAN STATUS: Putusan MK: kata 'dan' pada ayat (1) huruf b dimaknai 'dan/atau'] Pasal 53 (1) Pengendali Data Pribadi dan Prosesor Data Pribadi wajib menunjuk pejabat atau petugas yang melaksanakan fungsi Pelindungan D…
- [ ] **Pasal 46** (peringkat 4): (1) Dalam hal terjadi kegagalan Pelindungan Data Pribadi, Pengendali Data Pribadi wajib pemberitahuan secara tertulis paling lambat 3 x 24 (tiga kali dua puluh empat) jam kepada: a. Subjek Data Pribadi; dan b. lembaga. (…
- [ ] **Pasal 27** (peringkat 5): Pengendali Data Pribadi wajib melakukan pemrosesan Data Pribadi secara terbatas dan spesifik, sah secara hukum, dan transparan.

---

## pdp-39

**📄 Klausul kontrak:** Jika vendor berbentuk badan usaha melakukan tindak pidana data pribadi, hanya karyawan pelaksana yang bertanggung jawab.

**Hasil sistem:** ❌ menemukan 0 dari 1 pasal kunci · urutan temuan: Pasal 53, Pasal 60, Pasal 51, Pasal 48

**💬 Alasan Claude memilih kunci ini:** pidana korporasi

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 70** · ❌ tidak ditemukan
  > (1) Dafam hal tindak pidana sebagaimana dimaksud dalam Pasal 67 dan Pasal 68 dilakukan oleh Korporasi, pidana dapat dljatuhkan kepada pengurus, pemegang kendali, pemberi perintah, pemilik manfaat, dan/ atau Korporasi.
  > (2) Pidana yang dapat d[jatuhkan terhadap Korporasi hanya pidana denda.
  > (3) Pidana denda yang dijatuhkan kepada Korporasi paling banyak 10 (sepuluh) kali dari maksimal pidana denda yang diancamkan.
  > (4) Selain dijatuhi pidana denda sebagaimana dimaksud pada ayat (2), Korporasi dapat dijatuhi pidana ' tambahan berupa: a. perampasan keuntungan dan/ atau harta kekayaan yang diperoleh atau hasil dari tindak pidana; b. pembekuan seluruh atau sebagian usaha Korporasi; c. pelarangan permanen melakukan perbuatan tertentu; d. penutupan seluruh atau sebagian tempat usaha dan/ atau kegiatan Korporasi; e. melaksanakan kewajiban yang telah dilalaikan; f. pembayaran ganti kerugian; g. pencabutan izin; dan/atala h. pembubaranKorporasi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 53** (peringkat 1): [CATATAN STATUS: Putusan MK: kata 'dan' pada ayat (1) huruf b dimaknai 'dan/atau'] Pasal 53 (1) Pengendali Data Pribadi dan Prosesor Data Pribadi wajib menunjuk pejabat atau petugas yang melaksanakan fungsi Pelindungan D…
- [ ] **Pasal 60** (peringkat 2): Lembaga sebagaimana dimaksud dalam Pasal 58 ayat (2) berwenang: a.. merumuskan dan menetapkan kebijakan di bidang Pelindungan Data Pribadi; b. melakukan . . . b. melakukan pengawasan terhadap kepatuhan Pengendali Data Pr…
- [ ] **Pasal 51** (peringkat 3): (1) Dalam hal Pengendali Data Pribadi menunjuk Prosesor Data Pribadi, Prosesor Data Pribadi wajib melakukan pemrosesan Data Pribadi berdasarkan perintah Pengendali Data Pribadi. (2) Pemrosesan Data Pribadi sebagaimana di…
- [ ] **Pasal 48** (peringkat 4): (1) Pengendali Data Pribadi berbentuk badan hukum yang melakukan penggabungan, pemisahan, pengambilalihan, peleburan, atau pembubaran badan hukum wajib pemberitahuan pengalihan Data Pribadi kepada Subjek Data Pribadi. (2…

---

## pdp-40

**📄 Klausul kontrak:** Vendor diberi waktu tiga tahun sejak undang-undang berlaku untuk menyesuaikan sistem pemrosesan datanya.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 74, Pasal 32, Pasal 30, Pasal 40, Pasal 13

**💬 Alasan Claude memilih kunci ini:** masa penyesuaian 2 tahun

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 74** · ✅ ditemukan (peringkat 1)
  > Pada saat Undang-Undang ini mulai berlaku, Pengendali Data Pribadi, Prosesor Data Pribadi, dan pihak lain yang terkait dengan pemrosesan Data Pribadi, wajib menyesuaikan dengan ketentuan pemrosesan Data Pribadi berdasarkan Undang-Undang ini paling lama 2 (dua) tahun sejak Undang-Undang ini diundangkan.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 32** (peringkat 2): (1) Pengendali Data Pribadi wajib memberikan akses kepada Subjek Data Pribadi terhadap Data Pribadi yang diproses beserta rekam jejak pemrosesan Data Pribadi sesuai dengan jangka waktu penyimpanan Data Pribadi. (2) Akses…
- [ ] **Pasal 30** (peringkat 3): (1) Pengendali Data Pribadi wajib memperbarui dan/ atau ' memperbaiki kesalahan dan/atau ketidakakuratan Data Fribadi paling lambat 3 x 24 (tiga kali dua puluh empat) jam terhitung sejak Pengendali Data Pribadi menerima …
- [ ] **Pasal 40** (peringkat 4): (1) Pengendali Data Pribadi wajib menghentikan pemrosesan Data Pribadi dalam hal Subjek Data Pribadi menarik kembali persetujuan pemrosesan Data Pribadi. (2) Penghentian pemrosesan Data Pribadi sebagaimana dimaksud pada …
- [ ] **Pasal 13** (peringkat 5): (1) Subjek Data Pribadi berhak mendapatkan dan/atau menggunakan Data Pribadi tentang dirinya dari Pengendali Data Pribadi dalam bentuk yang sesuai dengan struktur dan/ atau format yang lazim digunakan atau dapat dibaca o…

---

## pdp-41

**📄 Klausul kontrak:** Vendor tidak memberikan informasi identitas, dasar hukum, dan tujuan penggunaan data kepada pemilik data.

**Hasil sistem:** ✅ menemukan 2 dari 2 pasal kunci · urutan temuan: Pasal 5, Pasal 21, Pasal 33, Pasal 1, Pasal 27

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 5** · ✅ ditemukan (peringkat 1)
  > Subjek Data Pribadi berhak mendapatkan Informasi tentang kejelasan identitas, dasar kepentingan hukum, tujuan permintaan dan penggu.naan Data Pribadi, dan akuntabilitas pihak yang meminta Data Pribadi.

- [ ] **Pasal 21** · ✅ ditemukan (peringkat 2)
  > (1) Dalam hal pemrosesan Data Pribadi berdasarkan persetujuan sebagaimana dimaksud dalam Pasal 2O ayat (21 huruf a, Pengendali Data Pribadi wajib menyampaikan Informasi mengenai: a. legalitas dari pemrosesan Data Pribadi; b. tujuan pemrosesan Data Pribadi; c. jenis dan relevansi Data Pribadi yang akan diproses; d. jangka waktu retensi dokumen yang memuat Data Pribadi; e. rincian mengenai Informasi yang f. jangka waktu pemrosesan Data Pribadi; dan C. hak Subjek Data Pribadi.
  > (2) Dalam . . . PRESIEIEN
  > (2) Dalam hal terdapat perubahan Informasi sebagaimana dimaksud pada ayat (1), Pengendali Data Pribadi wajib . memberitahukan kepada Subjek Data Pribadi sebelum terjadi perubahan Informasi.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 33** (peringkat 3): Pengendali Data Pribadi wajib menolak memberikan akses perubahan terhadap Data Fribadi kepada Subjek Data Pribadi dalam hal: a. membahayakan keamanan, kesehatan fisik, atau kesehatan mental Subjek Data Pribadi dan/ atau …
- [ ] **Pasal 1** (peringkat 4): Dalam Undang-Undang ini yang dimaksud dengan: 1. Data Pribadi adalah data tentang ora.ng perseorangan yang teridentifikasi atau dapat diidentifikasi secara tersendiri atau dikombinasi dengan informasi lainnya baik secara…
- [ ] **Pasal 27** (peringkat 5): Pengendali Data Pribadi wajib melakukan pemrosesan Data Pribadi secara terbatas dan spesifik, sah secara hukum, dan transparan.

---

## pdp-42

**📄 Klausul kontrak:** Vendor boleh memproses data pribadi penyandang disabilitas tanpa persetujuan yang bersangkutan atau walinya.

**Hasil sistem:** ✅ menemukan 1 dari 1 pasal kunci · urutan temuan: Pasal 26, Pasal 65, Pasal 18, Pasal 60, Pasal 34

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 26** · ✅ ditemukan (peringkat 1)
  > (1) Pemrosesan Data Pribadi disabilitas ' diselenggarakan secara khusus. secara disabilitas dilakukan
  > (2) Pemrosesan Data Pribadi penyandang sebagaimana dimaksud pada ayat (1) melalui komunikasi dengan cara tertentu sesuai dengan ketentuan undangan.
  > (3) Pemrosesalr Data Pribadi penyandang disabilitas sebagaimana dimaksud pada ayat (2) wajib mendapat persetujuan dari penyandang disabilitas dan/ atau wali penyandang disabilitas sesuai dengan ketentuan peraturan perundang-undangan.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 65** (peringkat 2): (1) Setiap Orang dilarang secara melawan hukum memperoleh atau mengumpulkan Data Pribadi yang bukan miliknya dengan maksud untuk menguntungkan diri sendiri atau orang lain yang dapat mengakibatkan kerugian Subjek Data Pr…
- [ ] **Pasal 18** (peringkat 3): (1) Pemrosesan Data Pribadi dapat dilalrukan oleh 2 (dua) atau lebih Pengendali Data Pribadi. (2) Dalam hal Pemrosesan Data Pribadi dilakukan oleh 2 (dua) atau lebih Pengendali Data Pribadi harus memenuhi syarat minimal:…
- [ ] **Pasal 60** (peringkat 4): Lembaga sebagaimana dimaksud dalam Pasal 58 ayat (2) berwenang: a.. merumuskan dan menetapkan kebijakan di bidang Pelindungan Data Pribadi; b. melakukan . . . b. melakukan pengawasan terhadap kepatuhan Pengendali Data Pr…
- [ ] **Pasal 34** (peringkat 5): (1) Pengendali Data Pribadi wajib melakukan penilaian dampak Pelindungan Data Pribadi dalam hal pemrosesan Data Pribadi memiliki potensi risiko tinggi terhadap Subjek Data Pribadi. (2) Pemrosesan Data Pribadi memiliki po…

---

## pdp-43

**📄 Klausul kontrak:** Data pribadi tetap diproses vendor setelah tujuan kontrak tercapai.

**Hasil sistem:** ⚠️ menemukan 1 dari 2 pasal kunci · urutan temuan: Pasal 42, Pasal 28, Pasal 75, Pasal 27, Pasal 21

**💬 Alasan Claude memilih kunci ini:** 43 ayat (1) huruf a: hapus data yang tidak diperlukan lagi (keputusan Daniel)

### 🟡 KUNCI JAWABAN (gold) — benar relevan?

- [ ] **Pasal 42** · ✅ ditemukan (peringkat 1)
  > (1) Pengendali Data Pribadi wajib mengakhiri pemrosesan Data Pribadi dalam hal: terdapat ketentuan undangan yang tidak UBLIK INDONESIA a. telah mencapai masa retensi; b. tujuan pemrosesan Data Pribadi telah tercapai; atau c. terdapat permintaan dari Subjek Data Pribadi.
  > (2) Pengakhiran pemrosesan Data Pribadi sebagaimana dimaksud pada ayat (1) dilakukan sesuai dengan ketentuan peraturan perundang-undangan.

- [ ] **Pasal 43** · ❌ tidak ditemukan
  > (1) Pengendali Data Pribadi wajib menghapus Data Pribadi dalam hal: a. Data Pribadi tidak lagi diperlukan untuk pencapaian tujuan pemrosesan Data Pribadi; b. Subjek Data Pribadi telah melakukan penarikan kembali persetqiuan pemrosesan Data Pribadi; c. terdapat permintaan dari Subjek Data Pribadi; atau d. Data Pribadi diperoleh dan/ atau diproses dengan cara melawan hukum. (21 Data Pribadi sebagaimana dimaksud pada ayat (1) dilakukan sesuai dengan ketentuan peraturan perundang-undangan.

### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?

- [ ] **Pasal 28** (peringkat 2): Pengendali Data Pribadi wajib melakukan pemrosesan Data Pribadi sesuai dengan tujuan pemrosesan Data Pribadi. .
- [ ] **Pasal 75** (peringkat 3): Pada saat Undang-Undang ini mulai berlaku, semua ketentuan peraturan perundang-undangan yang mengatur mengenai Pelindungan Data Pribadi, dinyatakan masih tetap berlaku sepanjang tidak bertentangan dengan ketentuan dalam …
- [ ] **Pasal 27** (peringkat 4): Pengendali Data Pribadi wajib melakukan pemrosesan Data Pribadi secara terbatas dan spesifik, sah secara hukum, dan transparan.
- [ ] **Pasal 21** (peringkat 5): (1) Dalam hal pemrosesan Data Pribadi berdasarkan persetujuan sebagaimana dimaksud dalam Pasal 2O ayat (21 huruf a, Pengendali Data Pribadi wajib menyampaikan Informasi mengenai: a. legalitas dari pemrosesan Data Pribadi…

---

