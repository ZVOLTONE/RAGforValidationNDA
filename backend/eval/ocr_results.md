# Akurasi OCR (Tesseract)

Kunci jawaban = teks PDF digital. Versi scan dibuat dari PDF yang sama lalu dibaca lewat `app.document.extract`. Akurasi = 1 - (jumlah huruf/kata salah, hilang, atau berlebih) / jumlah huruf/kata asli.

| Dokumen | Scan | Kondisi | Hal | Akurasi huruf | Akurasi kata | Keyakinan Tesseract | Detik/hal |
|---|---|---|---|---|---|---|---|
| nda_contoh | bersih | 200 dpi, lurus | 2 | 99.8% | 98.1% | 94.7 | 1.9 |
| nda_contoh | jelek | 150 dpi, miring 1,5 derajat, buram, JPEG kualitas rendah | 2 | 99.5% | 95.9% | 94.8 | 1.9 |

## Contoh kesalahan (14)

Format: "teks asli" -> "hasil OCR"

- nda_contoh bersih hal 1: "Pertama";" -> "Pertama":"
- nda_contoh bersih hal 2: "security@contohsentosa.co.id." -> "security @contohsentosa.co.id."
- nda_contoh bersih hal 2: "kejadian;" -> "kejadian,"
- nda_contoh bersih hal 2: "terdampak;" -> "terdampak,"
- nda_contoh jelek hal 1: "017/NDA/PCS-VDN/XI/2026" -> "017/NDA/PCS-VDN/X1/2026"
- nda_contoh jelek hal 1: "Pertama";" -> "Pertama","
- nda_contoh jelek hal 1: "1" -> "|"
- nda_contoh jelek hal 1: ""Informasi" -> "“Informasi"
- nda_contoh jelek hal 1: ""Insiden" -> "“Insiden"
- nda_contoh jelek hal 1: "27001;" -> "27001:"
- nda_contoh jelek hal 1: "pekerjaan;" -> "pekerjaan,"
- nda_contoh jelek hal 2: "security@contohsentosa.co.id." -> "security @contohsentosa.co.id."
- nda_contoh jelek hal 2: "kejadian;" -> "kejadian,"
- nda_contoh jelek hal 2: "terdampak;" -> "terdampak,"
