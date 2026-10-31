# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# ConfidAI — AI-Powered Cybersecurity Contract Intelligence

**Versi:** 1.0  
**Tanggal:** 23 Oktober 2026  
**Status:** Draft untuk implementasi  
**Kategori Hackathon:** Dukungan Teknologi  
**Target Pengembangan:** Kartika Cyber Hackathon 2026

---

# 1. Executive Summary

## 1.1. Latar Belakang

Kerja sama antara organisasi dan penyedia layanan teknologi dapat melibatkan pertukaran informasi rahasia, pemberian akses sistem, pemrosesan data, penggunaan pihak ketiga, serta pemeliharaan infrastruktur teknologi informasi dan operasional.

Perjanjian seperti Non-Disclosure Agreement (NDA) dan kontrak kerja sama teknologi berperan dalam mengatur tanggung jawab dan batasan tersebut. Namun, pemeriksaan dokumen secara manual membutuhkan waktu dan dapat menyulitkan proses identifikasi klausul yang berpotensi menimbulkan risiko keamanan.

ConfidAI dikembangkan sebagai sistem berbasis kecerdasan buatan untuk membantu menganalisis dokumen kontrak, mengidentifikasi kesenjangan perlindungan keamanan siber, memeriksa relevansi ketentuan hukum, serta menghasilkan laporan yang dapat ditelusuri kembali ke dokumen sumber.

Untuk mendukung kebutuhan analisis tersebut, ConfidAI menggunakan kombinasi Large Language Model (LLM), Retrieval-Augmented Generation (RAG), pemrosesan dokumen, dan validasi bukti.

Dalam konteks Kartika Cyber Hackathon 2026, ConfidAI diarahkan untuk mendukung evaluasi risiko keamanan sebelum atau selama kerja sama dengan penyedia teknologi, khususnya ketika kerja sama tersebut berkaitan dengan akses sistem, pengelolaan informasi sensitif, dan lingkungan IT/OT.

## 1.2. Product Vision

Menjadi asisten analisis kontrak berbasis AI yang membantu organisasi mengidentifikasi potensi risiko keamanan siber dan kelemahan perlindungan kontraktual secara lebih cepat, transparan, dan dapat ditelusuri.

## 1.3. Product Mission

ConfidAI bertujuan untuk:

1. Mengotomatisasi ekstraksi dan pengelompokan klausul kontrak.
2. Mengidentifikasi potensi risiko keamanan informasi dan keamanan siber.
3. Menghubungkan temuan dengan sumber hukum atau referensi keamanan yang relevan.
4. Menampilkan bukti dan lokasi klausul yang mendasari setiap temuan.
5. Menghasilkan laporan PDF untuk membantu proses peninjauan dan pengambilan keputusan.

## 1.4. Product Positioning

ConfidAI merupakan **AI-assisted cybersecurity contract analyzer**, bukan sistem pemantauan jaringan atau pendeteksi serangan siber secara langsung.

Sistem menganalisis informasi yang tersedia dalam dokumen kontrak. Sistem tidak dapat memastikan bahwa suatu organisasi sedang mengalami ransomware, kompromi sistem IT/OT, atau eksfiltrasi data hanya berdasarkan isi NDA.

Hasil analisis ditujukan untuk membantu peninjauan oleh manusia dan bukan menggantikan penilaian hukum profesional.

---

# 2. Problem Statement

## 2.1. Masalah Utama

Pemeriksaan kontrak yang berkaitan dengan kerja sama teknologi memiliki beberapa tantangan:

- Dokumen dapat memiliki banyak halaman dan struktur yang berbeda.
- Klausul penting tersebar di beberapa bagian kontrak.
- Informasi terkait keamanan siber tidak selalu disusun menggunakan istilah yang seragam.
- Referensi hukum perlu diperiksa berdasarkan isi dan keberlakuannya.
- Kesenjangan kontrol kontraktual sulit dirangkum secara konsisten.
- Temuan risiko perlu dikaitkan dengan bukti spesifik agar dapat diverifikasi.
- Dokumen hasil pemindaian memerlukan OCR sebelum dapat dianalisis.

## 2.2. Solusi yang Ditawarkan

ConfidAI menyediakan satu alur kerja terpadu:

1. Pengguna mengunggah dokumen.
2. Sistem mengekstrak teks menggunakan parser PDF atau OCR.
3. Sistem mengidentifikasi dan mengelompokkan klausul.
4. RAG mengambil referensi hukum dan keamanan yang relevan.
5. Model AI menganalisis klausul berdasarkan bukti yang ditemukan.
6. Sistem memvalidasi format hasil dan keterlacakan bukti.
7. Temuan ditampilkan dalam dashboard.
8. Sistem memberikan anotasi pada PDF asli dan menghasilkan laporan.

## 2.3. Nilai Produk

Nilai utama ConfidAI bukan hanya menghasilkan ringkasan kontrak, tetapi menghubungkan tiga komponen:

**Klausul kontrak → Risiko yang teridentifikasi → Bukti dan referensi pendukung.**

Hubungan ini menjadi dasar agar hasil analisis lebih mudah diperiksa dan tidak sekadar berupa opini yang dihasilkan LLM.

---

# 3. Target Pengguna

## 3.1. Primary Users

### A. Cybersecurity Analyst

Membutuhkan bantuan untuk meninjau ketentuan kontraktual yang berkaitan dengan keamanan informasi, akses pihak ketiga, pengelolaan data, dan respons insiden.

### B. IT/OT Security Reviewer

Membutuhkan dukungan untuk mengidentifikasi apakah dokumen kerja sama telah mengatur aspek keamanan yang relevan dengan akses dan pemeliharaan sistem teknologi.

### C. Legal and Compliance Reviewer

Membutuhkan alat bantu untuk menemukan klausul yang perlu ditinjau lebih lanjut dan memeriksa referensi hukum yang relevan.

## 3.2. Secondary Users

- Procurement atau vendor management.
- Project manager yang menangani kerja sama teknologi.
- Tim evaluasi risiko pihak ketiga.
- Organisasi yang ingin melakukan peninjauan awal terhadap NDA atau kontrak teknologi.

## 3.3. User Needs

Pengguna membutuhkan sistem yang dapat menjawab pertanyaan berikut:

- Klausul mana yang berpotensi menimbulkan risiko keamanan?
- Apakah kontrak mengatur penggunaan pihak ketiga?
- Apakah terdapat ketentuan mengenai pembatasan akses dan pencabutan akses?
- Apakah tanggung jawab ketika terjadi insiden keamanan sudah diatur?
- Apakah ketentuan mengenai data pribadi relevan dengan kerja sama ini?
- Apa bukti yang mendasari setiap temuan?
- Bagian mana dari dokumen yang perlu diperiksa lebih lanjut?

---

# 4. Product Scope

## 4.1. In Scope — MVP

Fitur yang wajib tersedia pada MVP:

1. Upload dokumen PDF.
2. Deteksi PDF digital dan PDF hasil pemindaian.
3. Ekstraksi teks dan OCR jika diperlukan.
4. Konversi hasil ekstraksi menjadi representasi dokumen terstruktur.
5. Identifikasi dan segmentasi klausul.
6. Penyimpanan referensi hukum dan keamanan menggunakan ChromaDB.
7. Retrieval referensi menggunakan embedding.
8. Analisis klausul menggunakan Qwen3 1.7B.
9. Identifikasi risiko keamanan siber berbasis kontrak.
10. Validasi hasil analisis dan struktur JSON.
11. Dashboard hasil analisis.
12. Highlight pada PDF asli.
13. Pembuatan dan pengunduhan laporan PDF.
14. Penanganan kegagalan pemrosesan.
15. Penghapusan dokumen dan data pekerjaan sesuai kebijakan retensi.

## 4.2. Out of Scope — MVP

Fitur berikut tidak menjadi prioritas versi pertama:

- Deteksi serangan siber langsung dari lalu lintas jaringan.
- Pemantauan endpoint secara real-time.
- Pemindaian kerentanan jaringan.
- Deteksi malware berdasarkan file executable.
- Integrasi langsung dengan SIEM atau SOC.
- Pemblokiran serangan secara otomatis.
- Penentuan pelanggaran hukum secara final.
- Penandatanganan kontrak elektronik.
- Pelatihan model bahasa dari dokumen NDA milik pengguna.
- Sistem multi-tenant kompleks sebelum kebutuhan dasarnya teruji.

## 4.3. Batasan Klaim Produk

ConfidAI tidak boleh menyatakan bahwa suatu serangan telah terjadi hanya karena kontrak tidak memiliki klausul yang relevan.

Sebagai contoh:

Temuan:
"Kontrak tidak ditemukan mengatur batas waktu pelaporan insiden keamanan."

Interpretasi yang diperbolehkan:
"Terdapat potensi kesenjangan kontraktual terkait kewajiban pelaporan insiden."

Interpretasi yang tidak diperbolehkan:
"Organisasi telah mengalami serangan siber."

Ketiadaan klausul merupakan temuan tentang dokumen, bukan bukti bahwa insiden benar-benar terjadi.

---

# 5. Threat Model dan Kategori Risiko

ConfidAI memusatkan analisis pada risiko yang dapat dinilai atau disimpulkan secara wajar dari isi kontrak.

## 5.1. Third-Party Access Risk

Tujuan:
Mengidentifikasi ketentuan yang berkaitan dengan akses pihak ketiga terhadap informasi atau sistem organisasi.

Aspek yang diperiksa:

- Pemberian akses kepada vendor atau subkontraktor.
- Batasan penggunaan akses.
- Kewajiban menjaga kerahasiaan.
- Persetujuan penggunaan pihak ketiga.
- Pencabutan akses setelah kerja sama berakhir.
- Tanggung jawab pihak ketiga terhadap keamanan informasi.

## 5.2. Data Breach and Data Exfiltration Risk

Tujuan:
Menilai apakah kontrak mengatur perlindungan informasi dan tanggung jawab ketika terjadi pengungkapan atau pengambilan data tanpa otorisasi.

Aspek yang diperiksa:

- Pembatasan penggunaan informasi rahasia.
- Pembatasan penyalinan dan pengungkapan data.
- Kewajiban menjaga keamanan informasi.
- Pemberitahuan ketika terjadi insiden.
- Pengembalian atau penghapusan data.
- Tanggung jawab ketika terjadi kebocoran.

## 5.3. Insider Threat and Unauthorized Access Risk

Tujuan:
Mengidentifikasi potensi risiko yang berkaitan dengan penyalahgunaan akses oleh individu yang memiliki atau pernah memiliki akses sah.

Aspek yang diperiksa:

- Batasan akses berdasarkan kebutuhan.
- Kewajiban personel menjaga kerahasiaan.
- Penggunaan akun dan kredensial.
- Pencabutan hak akses.
- Larangan penggunaan informasi di luar tujuan kerja sama.
- Tanggung jawab atas tindakan personel dan subkontraktor.

## 5.4. Ransomware and Malware-Related Contractual Risk

Tujuan:
Mengidentifikasi apakah kontrak mengatur kewajiban keamanan yang relevan untuk mengurangi dampak insiden malware atau ransomware.

Aspek yang diperiksa:

- Tanggung jawab pemeliharaan keamanan.
- Kewajiban pelaporan insiden.
- Dukungan investigasi dan pemulihan.
- Kewajiban menjaga kerahasiaan selama penanganan insiden.
- Tanggung jawab para pihak ketika layanan terdampak.

Catatan: analisis kontrak tidak dapat menentukan apakah malware atau ransomware benar-benar ada.

## 5.5. IT/OT Security Risk

Tujuan:
Membantu meninjau klausul yang berpotensi berkaitan dengan akses dan pengelolaan sistem IT/OT.

Aspek yang diperiksa, jika relevan dengan ruang lingkup kontrak:

- Akses jarak jauh oleh vendor.
- Otorisasi aktivitas pemeliharaan.
- Pembatasan akses terhadap sistem.
- Pengelolaan kredensial.
- Tanggung jawab atas perubahan konfigurasi.
- Penanganan insiden yang berdampak pada ketersediaan layanan.
- Kewajiban pengujian dan pemulihan yang disepakati.

ConfidAI tidak melakukan pemeriksaan teknis terhadap konfigurasi jaringan atau sistem kontrol industri.

## 5.6. Risk Matrix

Setiap temuan mempunyai atribut terpisah:

- `risk_category`
- `risk_level`
- `finding_type`
- `confidence`
- `evidence`
- `legal_references`
- `recommendation`

Kategori risiko tidak boleh langsung menentukan tingkat keparahan tanpa mempertimbangkan konteks.

### Risk Level

**Low**
Potensi risiko terbatas berdasarkan bukti yang ditemukan.

**Medium**
Terdapat kelemahan atau ketidakjelasan yang membutuhkan peninjauan.

**High**
Terdapat potensi dampak signifikan berdasarkan konteks kontrak dan bukti yang tersedia.

**Critical**
Dampak potensial sangat tinggi dan memerlukan peninjauan segera berdasarkan kriteria yang ditetapkan organisasi.

Penetapan level harus mengikuti rubrik penilaian yang terdokumentasi. Sistem tidak boleh menetapkan level hanya berdasarkan pilihan kata yang dramatis dari LLM.

### Finding Type

- `potential_legal_issue`
- `contractual_gap`
- `weak_control`
- `security_risk`
- `no_issue_identified`
- `inconclusive`

Kategori `potential_legal_issue` menunjukkan indikasi yang membutuhkan verifikasi, bukan putusan final bahwa pelanggaran hukum telah terjadi.

---

# 6. Functional Requirements

## FR-01: Document Upload

**Deskripsi:** Pengguna dapat mengunggah dokumen untuk dianalisis.

Persyaratan:

- Menerima PDF.
- Memvalidasi format dan ukuran file.
- Membuat ID unik untuk setiap pekerjaan analisis.
- Menyimpan metadata file.
- Menolak file yang tidak valid.
- Menampilkan status pekerjaan.

Acceptance criteria:

- File PDF yang valid dapat diterima.
- File yang tidak sesuai format ditolak dengan pesan yang jelas.
- Setiap pekerjaan memiliki ID unik.
- Dokumen tidak dapat diakses oleh pengguna yang tidak berwenang.

## FR-02: Document Extraction

**Deskripsi:** Sistem mengekstrak teks dari dokumen.

Alur:

1. Memeriksa apakah PDF memiliki teks yang dapat diekstrak.
2. Menggunakan parser PDF untuk mengekstrak teks digital.
3. Menjalankan OCR pada halaman yang membutuhkan pengenalan teks.
4. Menyimpan teks, nomor halaman, dan koordinat bila tersedia.
5. Menandai halaman dengan kualitas ekstraksi rendah.

Acceptance criteria:

- Sistem tidak menjalankan OCR tanpa kebutuhan.
- Nomor halaman tetap terhubung dengan teks yang diekstrak.
- Halaman yang gagal diekstrak ditandai.
- Sistem tidak melanjutkan analisis seolah-olah dokumen lengkap ketika ekstraksi gagal secara signifikan.

## FR-03: Clause Segmentation

**Deskripsi:** Sistem memecah dokumen menjadi unit klausul yang dapat dianalisis.

Persyaratan:

- Mempertahankan teks asli klausul.
- Mengidentifikasi nomor atau judul klausul jika tersedia.
- Menyimpan lokasi klausul.
- Mendukung klausul yang terdiri dari beberapa paragraf.
- Menyediakan ID klausul yang unik dalam satu dokumen.

Acceptance criteria:

- Setiap temuan dapat ditelusuri ke klausul sumber.
- Teks asli tidak diganti oleh parafrasa AI.
- Jika batas klausul tidak dapat ditentukan dengan yakin, sistem menandainya untuk peninjauan.

## FR-04: Knowledge Base and RAG

**Deskripsi:** Sistem mencari referensi hukum dan keamanan yang relevan untuk mendukung analisis.

Teknologi awal:

- ChromaDB sebagai vector database.
- `nomic-embed-text:latest` sebagai embedding model.
- Ollama untuk menjalankan model secara lokal.
- Referensi hukum dan keamanan yang dikurasi.

Persyaratan:

- Menyimpan teks sumber dan metadata.
- Membedakan sumber hukum dari referensi keamanan.
- Menyimpan identitas dokumen, pasal atau bagian, versi, dan informasi halaman bila tersedia.
- Mengambil referensi yang relevan berdasarkan klausul.
- Menyimpan identitas sumber yang digunakan untuk setiap temuan.
- Menghindari pencampuran dokumen kontrak milik pengguna berbeda.

Acceptance criteria:

- Setiap referensi yang ditampilkan dapat dilacak ke sumber.
- Sistem tidak mengarang sumber atau nomor pasal.
- Referensi yang tidak ditemukan tidak boleh dianggap tersedia.
- Perubahan model embedding ditangani dengan pembuatan ulang embedding yang diperlukan.

## FR-05: Legal Analysis

**Deskripsi:** Sistem menganalisis klausul terhadap referensi hukum yang relevan.

Cakupan awal:

- KUHP.
- UU ITE beserta perubahan yang berlaku.
- UU Perlindungan Data Pribadi.
- Peraturan lain yang relevan dengan ruang lingkup kontrak, apabila sumbernya tersedia dan telah diverifikasi.

Persyaratan:

- Analisis harus menggunakan sumber yang relevan.
- Sistem harus membedakan kewajiban hukum dan rekomendasi praktik keamanan.
- Setiap indikasi masalah harus disertai alasan dan bukti.
- Sistem harus mengakui ketidakpastian.
- Nomor pasal dan kutipan harus diverifikasi terhadap sumber.
- Analisis tidak boleh menganggap semua klausul yang tidak lengkap sebagai pelanggaran hukum.

Acceptance criteria:

- Setiap indikasi masalah hukum mempunyai referensi yang dapat diperiksa.
- Temuan tanpa bukti memadai ditandai `inconclusive`.
- Sistem tidak menyatakan pelanggaran final hanya berdasarkan output model.

## FR-06: Cybersecurity Risk Analysis

**Deskripsi:** Sistem menganalisis risiko keamanan yang berkaitan dengan isi kontrak.

Kategori awal:

- Third-party access.
- Data breach dan data exfiltration.
- Insider threat.
- Unauthorized access.
- Ransomware dan malware-related contractual risk.
- IT/OT security risk.

Persyaratan:

- Mencari klausul yang relevan.
- Menentukan jenis temuan.
- Menjelaskan hubungan antara klausul dan risiko.
- Memberikan rekomendasi perbaikan.
- Menyimpan bukti yang mendukung analisis.

Acceptance criteria:

- Temuan tidak dibuat tanpa bukti atau dasar penilaian yang terdokumentasi.
- Sistem tidak menyatakan telah mendeteksi serangan nyata.
- Ketiadaan klausul dibedakan dari ketidakmampuan menemukan klausul.

## FR-07: Evidence Validation

**Deskripsi:** Sistem memvalidasi keluaran analisis sebelum ditampilkan.

Pemeriksaan:

- JSON sesuai skema.
- Kutipan bukti sesuai dengan teks dokumen.
- Referensi sumber benar-benar tersedia.
- Nomor halaman dan klausul valid.
- Kategori risiko termasuk dalam daftar yang diperbolehkan.
- Kesimpulan didukung oleh bukti.
- Ketidakpastian ditandai dengan benar.

Acceptance criteria:

- JSON tidak valid tidak diteruskan sebagai hasil final.
- Kutipan yang tidak ditemukan ditandai untuk diperiksa.
- Referensi yang tidak dapat diverifikasi tidak ditampilkan sebagai fakta terkonfirmasi.

## FR-08: Risk Dashboard

**Deskripsi:** Pengguna dapat melihat ringkasan hasil analisis.

Informasi yang ditampilkan:

- Nama dokumen.
- Status pekerjaan.
- Jumlah temuan berdasarkan kategori.
- Tingkat risiko.
- Jenis temuan.
- Nomor halaman.
- Kutipan klausul.
- Alasan temuan.
- Referensi pendukung.
- Rekomendasi.
- Status verifikasi.

Fitur tambahan:

- Filter berdasarkan kategori.
- Filter berdasarkan tingkat risiko.
- Membuka lokasi klausul.
- Menampilkan detail temuan.
- Menandai temuan untuk peninjauan manusia.

Acceptance criteria:

- Pengguna dapat membuka setiap temuan dan melihat bukti sumbernya.
- Dashboard membedakan temuan terverifikasi dan temuan yang masih membutuhkan peninjauan.

## FR-09: PDF Annotation

**Deskripsi:** Sistem memberikan anotasi pada PDF asli.

Skema warna awal:

- Kuning: perlu ditinjau.
- Oranye: risiko sedang atau kontrol lemah.
- Merah: risiko tinggi berdasarkan bukti dan rubrik.
- Tanpa highlight: tidak ada temuan yang perlu ditandai berdasarkan analisis saat ini.

Persyaratan:

- Mempertahankan PDF asli.
- Menggunakan koordinat teks atau OCR jika tersedia.
- Menghubungkan anotasi dengan ID temuan.
- Menyediakan legenda warna.
- Menghindari highlight yang menutupi teks.
- Menandai jika posisi anotasi tidak dapat dipastikan.

Acceptance criteria:

- Highlight sesuai dengan lokasi klausul.
- Sistem tidak membuat ulang dokumen sumber hanya dari Markdown untuk mempertahankan posisi klausul.
- Temuan yang koordinatnya tidak tersedia tetap dapat dilihat melalui laporan.

## FR-10: Report Generation

**Deskripsi:** Sistem membuat laporan PDF hasil analisis.

Struktur laporan:

1. Identitas dokumen.
2. Ringkasan eksekutif.
3. Ringkasan tingkat risiko.
4. Daftar temuan.
5. Bukti klausul.
6. Referensi hukum dan keamanan.
7. Rekomendasi.
8. Keterbatasan analisis.
9. Catatan bahwa hasil memerlukan peninjauan manusia.

Acceptance criteria:

- Laporan dapat diunduh.
- Setiap temuan memiliki ID yang konsisten.
- Referensi dapat ditelusuri.
- Laporan menyatakan keterbatasan sistem.
- Kegagalan pembuatan laporan tidak menghapus hasil analisis yang telah berhasil disimpan.

## FR-11: Job Processing

**Deskripsi:** Sistem memproses dokumen melalui pekerjaan asinkron.

Status pekerjaan:

- `uploaded`
- `queued`
- `processing`
- `validating`
- `generating_report`
- `completed`
- `failed`

Persyaratan:

- Endpoint upload tidak menunggu seluruh analisis selesai.
- Pekerjaan memiliki ID yang dapat digunakan untuk memeriksa status.
- Worker mempunyai batas waktu dan batas penggunaan sumber daya.
- Kegagalan tahap tertentu dicatat.
- Retry dilakukan secara terkontrol.
- Hasil sementara dipertahankan sesuai kebijakan retensi.

Acceptance criteria:

- Request upload dapat selesai sebelum analisis penuh selesai.
- Pengguna dapat memeriksa status pekerjaan.
- Pekerjaan gagal menampilkan pesan yang aman dan dapat dipahami.
- Proses yang gagal tidak menyebabkan pengulangan tanpa batas.

---

# 7. Non-Functional Requirements

## NFR-01: Security

- Semua akses dokumen harus melalui mekanisme otorisasi.
- Dokumen dan laporan hanya boleh diakses oleh pihak berwenang.
- Kredensial tidak boleh disimpan dalam kode sumber.
- File upload harus divalidasi.
- Endpoint harus memiliki pembatasan penggunaan yang sesuai.
- Data sensitif tidak boleh masuk ke log secara tidak sengaja.
- Dokumen dan file sementara harus memiliki kebijakan retensi dan penghapusan.

## NFR-02: Privacy

- Dokumen kontrak tidak boleh digunakan untuk pelatihan model tanpa persetujuan yang sesuai.
- Sistem harus menjelaskan kapan dokumen diproses secara lokal dan kapan dikirim ke server.
- Data pengguna tidak boleh tercampur antarpekerjaan.
- Penghapusan dokumen harus mencakup salinan yang dikelola aplikasi sesuai kebijakan retensi.
- Cache, hasil OCR, dan hasil analisis juga harus dipertimbangkan dalam kebijakan penghapusan.

## NFR-03: Reliability

- Kegagalan OCR tidak boleh menyebabkan seluruh sistem berhenti tanpa pesan.
- Kegagalan LLM harus dapat ditangani.
- Hasil analisis dan status pekerjaan perlu disimpan secara konsisten.
- Pekerjaan yang gagal harus dapat diidentifikasi dan, bila aman, dijalankan ulang.

## NFR-04: Explainability

Setiap temuan harus menyertakan:

- Klausul yang dianalisis.
- Bukti sumber.
- Alasan singkat.
- Referensi pendukung.
- Jenis temuan.
- Tingkat risiko.
- Status verifikasi.

## NFR-05: Performance

Target performa ditentukan melalui pengujian pada perangkat dan konfigurasi yang digunakan.

Target awal pengujian:

- Upload dan pembuatan job tidak menunggu seluruh proses analisis.
- Status pekerjaan dapat diperiksa tanpa menjalankan ulang analisis.
- Tahap OCR, retrieval, analisis, dan laporan memiliki pencatatan waktu terpisah.
- Sistem mampu menangani dokumen uji yang telah ditentukan tanpa kehabisan memori.

Waktu analisis akhir ditetapkan setelah benchmark dilakukan. Tidak ada klaim waktu pemrosesan tetap sebelum pengujian pada dokumen nyata.

---

# 8. Technical Architecture

## 8.1. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React/Next.js atau React Native | Antarmuka pengguna |
| Backend API | FastAPI | Upload, status pekerjaan, hasil analisis |
| LLM Runtime | Ollama | Menjalankan model bahasa lokal |
| LLM | `qwen3:1.7b` | Klasifikasi, ekstraksi, dan analisis awal |
| Embedding Model | `nomic-embed-text:latest` | Membuat embedding teks |
| Vector Database | ChromaDB | Menyimpan embedding dan melakukan vector search |
| PDF Extraction | PyMuPDF | Ekstraksi teks dan informasi lokasi |
| OCR Baseline | Tesseract | OCR dokumen hasil pemindaian |
| Advanced OCR Candidate | Baidu Unlimited-OCR | Kandidat OCR untuk pengujian |
| Job Queue | Redis + Celery | Pemrosesan asinkron |
| Metadata Storage | Database relasional atau penyimpanan terstruktur | Status pekerjaan, metadata, dan hasil analisis |
| Report Generation | Library PDF yang mendukung anotasi | Highlight dan pembuatan laporan |

Pemilihan framework frontend dan database metadata dapat ditetapkan berdasarkan kondisi repository yang sudah ada.

## 8.2. Document Processing Pipeline

```text
User Upload
    |
    v
File Validation
    |
    v
Create Analysis Job
    |
    v
PDF Inspection
    |
    +---------------------------+
    |                           |
    v                           v
Digital PDF                 Scanned PDF
    |                           |
    v                           v
Text Extraction             OCR Processing
    |                           |
    +-------------+-------------+
                  |
                  v
          Structured Document
                  |
                  v
            Clause Splitter
                  |
                  v
             Clause Records
                  |
                  v
          RAG Retrieval per Clause
                  |
                  v
            AI Analysis
                  |
                  v
           Evidence Validation
                  |
                  v
            Risk Aggregation
                  |
                  v
          Dashboard + PDF Report
```

## 8.3. RAG Pipeline

### Indexing

1. Memuat dokumen referensi yang telah dikurasi.
2. Mengekstrak teks.
3. Memecah dokumen berdasarkan pasal atau bagian.
4. Menambahkan metadata sumber.
5. Membuat embedding menggunakan `nomic-embed-text:latest`.
6. Menyimpan embedding dan metadata ke ChromaDB.

### Retrieval

1. Mengambil teks klausul.
2. Membentuk query pencarian.
3. Menjalankan vector search.
4. Menjalankan pencarian kata kunci jika diimplementasikan.
5. Menggabungkan hasil pencarian.
6. Melakukan reranking jika diperlukan.
7. Mengirimkan konteks terpilih ke Qwen.

### HYDE

HYDE tidak diwajibkan pada MVP.

HYDE akan diuji setelah baseline retrieval tersedia. Sistem harus membandingkan kualitas retrieval biasa dengan retrieval yang menggunakan teks hipotetis.

Teks hipotetis tidak boleh disimpan atau diperlakukan sebagai sumber hukum otoritatif.

## 8.4. Agent Architecture

Implementasi awal tidak harus menggunakan empat agent independen.

Gunakan beberapa komponen analisis dengan tanggung jawab yang jelas:

**Component A — Clause Classifier**
- Mengelompokkan klausul.
- Mengidentifikasi topik utama.

**Component B — Legal Analyzer**
- Mengambil referensi hukum.
- Menganalisis relevansi klausul.
- Menghasilkan indikasi masalah hukum beserta bukti.

**Component C — Cybersecurity Risk Analyzer**
- Mengidentifikasi risiko kontraktual terkait keamanan.
- Menghasilkan alasan dan rekomendasi.

**Component D — Evidence Validator**
- Memeriksa kutipan.
- Memeriksa referensi.
- Memvalidasi JSON.
- Menandai hasil yang tidak cukup didukung.

Komponen A–D dapat diimplementasikan sebagai fungsi Python dan pemanggilan LLM sesuai kebutuhan. Tujuannya bukan memaksimalkan jumlah agent, tetapi memastikan setiap hasil dapat diuji.

---

# 9. Data Model

## 9.1. Analysis Job

Contoh struktur:

```json
{
  "job_id": "JOB-001",
  "document_id": "DOC-001",
  "status": "processing",
  "created_at": "2026-10-23T10:00:00+07:00",
  "completed_at": null,
  "error_code": null
}
```

## 9.2. Clause Record

```json
{
  "clause_id": "CLAUSE-001",
  "document_id": "DOC-001",
  "page_number": 5,
  "clause_number": "5.2",
  "clause_text": "Original clause text",
  "extraction_method": "pdf_text",
  "bounding_boxes": []
}
```

## 9.3. Risk Finding

```json
{
  "finding_id": "FINDING-001",
  "clause_id": "CLAUSE-001",
  "risk_category": "third_party_access",
  "risk_level": "medium",
  "finding_type": "contractual_gap",
  "reasoning_summary": "The clause may not sufficiently define third-party access limitations.",
  "evidence": [
    {
      "source_document_id": "DOC-001",
      "page_number": 5,
      "quote": "Exact quotation from the source clause"
    }
  ],
  "legal_references": [],
  "recommendation": "Review whether third-party access conditions should be explicitly defined.",
  "confidence": "medium",
  "needs_human_review": true,
  "validation_status": "pending"
}
```

Contoh di atas merupakan struktur data ilustratif. Isinya tidak menunjukkan hasil analisis terhadap kontrak nyata.

## 9.4. ChromaDB Metadata

Contoh metadata untuk referensi hukum:

```json
{
  "source_id": "LAW-001",
  "source_type": "legal_reference",
  "document_title": "Official legal source title",
  "article": "Article identifier",
  "page_number": 12,
  "version": "verified_version"
}
```

Metadata harus sesuai dengan sumber asli. Sistem tidak boleh mengarang judul dokumen, nomor pasal, atau versi peraturan.

Dokumen NDA yang diunggah pengguna tidak boleh otomatis dimasukkan ke koleksi referensi hukum bersama.

---

# 10. UX/UI Requirements

## 10.1. Screen 1 — Upload Document

Komponen:

- Area upload.
- Informasi format yang didukung.
- Status upload.
- Informasi singkat mengenai privasi dokumen.
- Tombol memulai analisis.

## 10.2. Screen 2 — Processing Status

Komponen:

- Job ID.
- Nama dokumen.
- Tahap pemrosesan.
- Status terkini.
- Informasi kegagalan jika terjadi.
- Tombol kembali ke daftar pekerjaan.

Tahap yang ditampilkan:

1. Document extraction.
2. Clause identification.
3. Reference retrieval.
4. AI analysis.
5. Evidence validation.
6. Report generation.

## 10.3. Screen 3 — Risk Dashboard

Komponen:

- Ringkasan temuan.
- Distribusi tingkat risiko.
- Filter kategori.
- Daftar klausul.
- Status verifikasi.
- Tombol melihat detail temuan.

## 10.4. Screen 4 — Finding Detail

Komponen:

- Nomor halaman.
- Kutipan klausul asli.
- Kategori risiko.
- Tingkat risiko.
- Alasan temuan.
- Referensi pendukung.
- Rekomendasi.
- Status validasi.
- Tombol membuka PDF pada lokasi terkait.

## 10.5. Screen 5 — PDF Viewer

Komponen:

- PDF asli.
- Highlight klausul.
- Legenda warna.
- Navigasi antar-temuan.
- Panel detail temuan.

## 10.6. Screen 6 — Report

Komponen:

- Ringkasan hasil.
- Daftar temuan.
- Referensi.
- Tanggal analisis.
- Batasan analisis.
- Tombol unduh laporan.

---

# 11. Evaluation Strategy

Evaluasi merupakan bagian wajib dari pengembangan AI ConfidAI.

## 11.1. Test Dataset

Buat kumpulan dokumen uji yang mencakup:

- PDF digital.
- PDF hasil pemindaian.
- Dokumen dengan tabel.
- Klausul dengan risiko yang telah ditentukan.
- Klausul yang sudah memadai.
- Klausul ambigu.
- Klausul yang memerlukan referensi hukum.
- Dokumen yang tidak mengandung isu keamanan yang relevan.

Gunakan dokumen yang sah untuk pengujian dan jangan menggunakan informasi rahasia tanpa izin.

## 11.2. Retrieval Evaluation

Metrik:

- Recall@k.
- Precision@k.
- MRR atau metrik ranking yang sesuai.

Tujuan:
Menilai apakah referensi relevan muncul pada hasil pencarian teratas.

## 11.3. Analysis Evaluation

Metrik:

- Precision temuan risiko.
- Recall temuan risiko.
- False-positive rate.
- Ketepatan kategori risiko.
- Ketepatan referensi hukum.
- Persentase temuan dengan bukti valid.
- Persentase output JSON yang valid.

## 11.4. OCR Evaluation

Uji:

- Word Error Rate atau Character Error Rate.
- Ketepatan nomor pasal.
- Ketepatan nomor halaman.
- Keberhasilan ekstraksi pada dokumen dengan tabel.
- Dampak kesalahan OCR terhadap hasil analisis.

## 11.5. PDF Annotation Evaluation

Uji:

- Ketepatan halaman.
- Ketepatan posisi highlight.
- Kesesuaian highlight dengan klausul.
- Keberhasilan anotasi pada dokumen multi-kolom atau hasil pemindaian.

## 11.6. Acceptance Thresholds

Sebelum pengujian, tetapkan ambang minimum untuk setiap metrik. Nilai akhir harus didasarkan pada hasil pengukuran, bukan asumsi.

Target awal yang dapat digunakan untuk pengujian internal:

- JSON valid: minimal 98%.
- Kutipan bukti yang cocok dengan sumber: minimal 95%.
- Precision temuan risiko: minimal 80%.
- Recall referensi relevan pada top-5: minimal 80%.

Angka tersebut adalah **target awal yang diusulkan**, bukan hasil performa ConfidAI yang sudah terbukti. Untuk evaluasi hukum, setiap kesalahan kritis pada referensi harus diperiksa secara terpisah meskipun metrik agregat memenuhi target.

---

# 12. Privacy and Security Requirements

Dokumen NDA berpotensi memuat informasi sensitif.

Karena itu, ConfidAI harus menerapkan prinsip berikut:

1. Dokumen hanya dapat diakses oleh pengguna yang berwenang.
2. File sementara memiliki kebijakan penghapusan.
3. Log tidak menyimpan seluruh isi dokumen tanpa kebutuhan.
4. Dokumen tidak dikirim ke layanan eksternal tanpa pemberitahuan dan dasar pemrosesan yang sesuai.
5. Penyimpanan embedding tetap diperlakukan sebagai data yang berpotensi sensitif.
6. Hasil analisis dan laporan mengikuti kontrol akses yang sama dengan dokumen sumber.
7. Instruksi yang ditemukan di dalam dokumen tidak boleh otomatis diperlakukan sebagai instruksi sistem bagi LLM.
8. Sistem harus menangani risiko prompt injection dari isi dokumen.
9. Kegagalan pemrosesan tidak boleh menyebabkan kebocoran informasi melalui pesan kesalahan.
10. Penghapusan harus mempertimbangkan file asli, hasil OCR, hasil analisis, cache, laporan, dan salinan sementara.

Apabila ConfidAI dipakai untuk organisasi dengan persyaratan keamanan yang lebih tinggi, kontrol akses, enkripsi, audit log, dan kebijakan retensi harus disesuaikan dengan lingkungan implementasinya.

---

# 13. Project Roadmap

Target pengembangan mengikuti tenggat submission Kartika Cyber Hackathon 2026 pada 15 November 2026.

## Phase 1 — Scope and Architecture
**23–25 Oktober 2026**

- Finalisasi ruang lingkup MVP.
- Finalisasi kategori risiko.
- Menetapkan struktur JSON.
- Menentukan struktur koleksi ChromaDB.
- Menyiapkan dataset pengujian.
- Menetapkan arsitektur backend.

Deliverable:
- Architecture diagram.
- Data model.
- Risk taxonomy.
- Test plan.

## Phase 2 — Document Processing
**26–30 Oktober 2026**

- Implementasi upload.
- Ekstraksi PDF digital.
- OCR untuk dokumen hasil pemindaian.
- Segmentasi klausul.
- Penyimpanan metadata.
- Job processing dasar.

Deliverable:
- Pipeline dokumen yang dapat diuji.

## Phase 3 — RAG and AI Analysis
**31 Oktober–4 November 2026**

- Menyiapkan referensi hukum dan keamanan.
- Membuat embedding.
- Integrasi ChromaDB.
- Implementasi retrieval.
- Integrasi Qwen3.
- Implementasi analisis klausul.
- Validasi JSON dan bukti.

Deliverable:
- Pipeline analisis berbasis RAG.

## Phase 4 — Dashboard and Reporting
**5–8 November 2026**

- Dashboard risiko.
- Detail temuan.
- PDF viewer.
- Highlight PDF asli.
- Pembuatan laporan.

Deliverable:
- MVP end-to-end.

## Phase 5 — Evaluation
**9–11 November 2026**

- Pengujian retrieval.
- Pengujian analisis risiko.
- Pengujian OCR.
- Pengujian highlight.
- Pengujian dokumen ambigu.
- Perbaikan false positives.

Deliverable:
- Evaluation report.

## Phase 6 — Submission Preparation
**12–13 November 2026**

- Finalisasi dokumentasi teknis.
- Finalisasi diagram arsitektur.
- Pembuatan slide.
- Pembuatan video demo.
- Penyusunan penjelasan keterbatasan sistem.

Deliverable:
- Dokumentasi dan materi demo.

## Phase 7 — Final QA and Submission
**14–15 November 2026**

- Pengujian end-to-end.
- Pemeriksaan repository.
- Pemeriksaan konfigurasi.
- Pengujian demo dari kondisi bersih.
- Finalisasi seluruh berkas submission.

Deliverable:
- Prototype siap diserahkan sebelum tenggat.

Roadmap ini merupakan rencana awal. Jika waktu implementasi tidak mencukupi, prioritaskan alur upload, ekstraksi, RAG, bukti temuan, dan laporan sebelum menambahkan HYDE atau reranking.

---

# 14. Success Metrics

ConfidAI dinyatakan memenuhi tujuan MVP apabila:

1. Pengguna dapat mengunggah dokumen dan menerima hasil analisis.
2. Sistem dapat memproses PDF digital dan PDF hasil pemindaian.
3. Temuan risiko dapat ditelusuri ke klausul sumber.
4. Referensi hukum dan keamanan dapat diverifikasi.
5. Hasil analisis tersedia dalam struktur JSON yang valid.
6. Pengguna dapat melihat temuan melalui dashboard.
7. Sistem dapat menghasilkan laporan PDF.
8. Highlight mengarah ke lokasi klausul yang benar atau secara eksplisit menyatakan ketika lokasi tidak dapat dipastikan.
9. Proses analisis tidak bergantung pada satu request panjang yang berpotensi timeout.
10. Evaluasi menunjukkan performa terhadap dataset pengujian yang terdokumentasi.

## Indikator Keberhasilan untuk Hackathon

- Relevansi dengan keamanan IT/OT dan kerja sama teknologi.
- Kejelasan kontribusi AI.
- Fungsi prototype yang dapat didemonstrasikan.
- Kualitas bukti dan keterlacakan.
- Kelayakan implementasi.
- Dokumentasi teknis yang dapat dipahami juri.

---

# 15. Risks and Mitigations

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Hallucination LLM | Temuan atau referensi hukum salah | RAG, validasi sumber, dan peninjauan manusia |
| Kualitas OCR rendah | Klausul salah diekstrak | Tandai kualitas ekstraksi dan uji OCR |
| False positives | Klausul aman dianggap berisiko | Dataset negatif dan evaluasi precision |
| False negatives | Risiko penting tidak ditemukan | Evaluasi recall dan pengujian kasus |
| Model terlalu kecil | Analisis tidak konsisten | Batasi tugas, validasi output, dan bandingkan model |
| Retrieval tidak relevan | Analisis menggunakan konteks salah | Hybrid retrieval dan evaluasi ranking |
| Timeout | Analisis berhenti sebelum selesai | Worker dan job queue |
| PDF highlight salah | Pengguna melihat lokasi yang keliru | Pertahankan koordinat dari dokumen asli |
| Kebocoran dokumen | Informasi rahasia terpapar | Kontrol akses, retensi, dan penghapusan |
| Prompt injection | Isi dokumen memengaruhi instruksi model | Pisahkan instruksi sistem dari konten dokumen |
| Referensi hukum kedaluwarsa | Analisis tidak sesuai peraturan berlaku | Verifikasi sumber, versi, dan tanggal keberlakuan |

---

# 16. Future Development

Setelah MVP stabil, fitur berikut dapat dipertimbangkan:

### 16.1. HYDE
Menguji apakah query hipotetis meningkatkan kualitas pencarian referensi.

### 16.2. Reranking
Mengurutkan ulang hasil retrieval berdasarkan relevansi terhadap klausul.

### 16.3. OCR Comparison
Membandingkan Tesseract dan Baidu Unlimited-OCR berdasarkan kualitas, waktu, serta kebutuhan komputasi.

### 16.4. Clause Comparison
Membandingkan versi kontrak untuk mengidentifikasi perubahan klausul yang memengaruhi risiko.

### 16.5. Risk Policy Configuration
Memungkinkan organisasi menentukan kontrol keamanan yang wajib diperiksa sesuai kebijakannya.

### 16.6. IT/OT Contract Checklist
Menyediakan daftar pemeriksaan khusus untuk kontrak yang melibatkan akses jarak jauh, pemeliharaan, atau layanan sistem IT/OT.

### 16.7. Integration with Security Operations
Integrasi dengan sistem keamanan lain dapat dipertimbangkan di masa depan, tetapi membutuhkan data, kontrol akses, dan pipeline yang berbeda dari analisis kontrak.

---

# 17. Final Product Definition

ConfidAI adalah sistem analisis kontrak berbasis AI yang menggabungkan pemrosesan dokumen, RAG, dan analisis risiko untuk membantu organisasi meninjau potensi kelemahan kontraktual terkait keamanan siber.

Sistem menggunakan:

- FastAPI sebagai backend.
- Ollama dengan Qwen3 1.7B untuk analisis awal.
- `nomic-embed-text:latest` untuk embedding.
- ChromaDB untuk penyimpanan dan pencarian vektor.
- PyMuPDF untuk ekstraksi dan pemrosesan PDF.
- Tesseract sebagai baseline OCR.
- Baidu Unlimited-OCR sebagai kandidat OCR lanjutan.
- Pemrosesan asinkron untuk pekerjaan yang membutuhkan waktu lebih lama.

Keluaran utama ConfidAI adalah daftar temuan yang terstruktur, bukti klausul, referensi pendukung, rekomendasi, anotasi PDF, dan laporan analisis.

Prinsip utama produk:

**No evidence, no definitive finding.**

Setiap kesimpulan harus dapat ditelusuri ke dokumen sumber atau referensi yang relevan. Ketika bukti tidak mencukupi, sistem harus menyatakan ketidakpastian daripada mengarang kesimpulan.

Dengan prinsip tersebut, ConfidAI berfungsi sebagai alat bantu analisis keamanan kontraktual yang transparan dan dapat dievaluasi, bukan sekadar chatbot yang memberikan opini mengenai dokumen.