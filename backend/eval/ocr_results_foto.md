# Akurasi OCR (Tesseract)

Kunci jawaban = teks PDF digital. Versi scan dibuat dari PDF yang sama lalu dibaca lewat `app.document.extract`. Akurasi = 1 - (jumlah huruf/kata salah, hilang, atau berlebih) / jumlah huruf/kata asli.

| Dokumen | Scan | Kondisi | Hal | Akurasi huruf | Akurasi kata | Keyakinan Tesseract | Detik/hal |
|---|---|---|---|---|---|---|---|
| nda_contoh | foto | hal1.jpeg, hal2.jpeg | 2 | 80.3% | 66.2% | 87.5 | 4.8 |

## Contoh kesalahan (30)

Format: "teks asli" -> "hasil OCR"

- nda_contoh foto hal 1: "" -> "R"
- nda_contoh foto hal 1: "1." -> "I."
- nda_contoh foto hal 1: "Pertama"; dan" -> "Pertama""
- nda_contoh foto hal 1: "disebut" -> "Han"
- nda_contoh foto hal 1: "Kedua"." -> ""
- nda_contoh foto hal 1: "1 Definisi (1) "Informasi Rahasia" (Confidential Information) adalah setiap data, dokumen, kode sumber, dan data pribadi yang diungkapkan Pihak Pertama kepada Pihak Kedua." -> "| “Tiga"
- nda_contoh foto hal 1: "Keamanan" adalah" -> "Kn Fatah"
- nda_contoh foto hal 1: "sah, kebocoran," -> "au kebocor an,"
- nda_contoh foto hal 1: "" -> "u"
- nda_contoh foto hal 1: "Informasi Rahasia." -> "Informe REA"
- nda_contoh foto hal 1: "" -> "SOL:"
- nda_contoh foto hal 1: "ISO/IEC 27001;" -> "ISO 2/001;"
- nda_contoh foto hal 1: "memerlukan" -> "memer lukan"
- nda_contoh foto hal 1: "pekerjaan;" -> "pekerjaan, P a."
- nda_contoh foto hal 1: "Indonesia." -> "Indonesi se egal"
- nda_contoh foto hal 1: "5" -> "3"
- nda_contoh foto hal 1: "sejak tanggal" -> "sej: jak tangs"
- nda_contoh foto hal 2: "menyerahkan" -> "rabi aa c : 1g eke erahkan"
- nda_contoh foto hal 2: "sebelumnya." -> "sebelumnya"
- nda_contoh foto hal 2: "x" -> ""
- nda_contoh foto hal 2: "security@contohsentosa.co.id." -> "security @contohsentosa.co.id."
- nda_contoh foto hal 2: "a." -> "+"
- nda_contoh foto hal 2: "kejadian;" -> "kejadian:"
- nda_contoh foto hal 2: "terdampak;" -> "terdampak:"
- nda_contoh foto hal 2: "c." -> "»"
- nda_contoh foto hal 2: "Pasal 5" -> ""
- nda_contoh foto hal 2: "ini" -> "1"
- nda_contoh foto hal 2: "denda" -> "den urangi hak Pihak Pertama untuk menuntu la"
- nda_contoh foto hal 2: "" -> "iap kejadi t ganti rugi sebesar 100%"
- nda_contoh foto hal 2: "mengurangi hak Pihak Pertama untuk menuntut ganti rugi sebesar 100%" -> "meng"
