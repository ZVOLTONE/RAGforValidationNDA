# Hasil uji highlight PDF (BE-11)

Dibuat oleh `python -m eval.eval_highlight`. Dokumen: `data/samples/nda_contoh.pdf` dan versi scan-nya.
Kunci jawaban posisi dari `page.search_for()` PyMuPDF pada PDF digital (diputar 1,5 derajat untuk scan jelek).
Kutipan positif diambil dari teks asli, jadi pada scan satu salah baca OCR di dalam kutipan sudah cukup
membuat kutipan tidak ditemukan. Itu disengaja: lebih baik tidak ada highlight daripada highlight di tempat salah.
IoU scan lebih rendah dari digital karena kotak kata Tesseract memeluk huruf, sedangkan kunci jawaban memakai
tinggi baris penuh. Kata yang di-highlight tetap sama; cek visual ada di file hasil.

| Dokumen | Ketemu | IoU rata-rata | Tanpa highlight palsu | File hasil |
|---|---|---|---|---|
| digital | 5/5 | 0.99 | 7/7 | nda_contoh_highlight.pdf |
| scan bersih | 5/5 | 0.70 | 7/7 | nda_contoh_scan_bersih_highlight.pdf |
| scan jelek | 5/5 | 0.73 | 7/7 | nda_contoh_scan_jelek_highlight.pdf |

## Rincian

| Dokumen | Temuan | Hasil |
|---|---|---|
| digital | F-01 | IoU 1.00 |
| digital | F-02 | IoU 1.00 |
| digital | F-03 | IoU 0.99 |
| digital | F-04 | IoU 0.99 |
| digital | F-05 | IoU 0.99 |
| digital | N-01 (kutipan tidak ada di dokumen) | not_located: benar |
| digital | N-02 (kutipan benar tapi halaman salah) | not_located: benar |
| digital | N-03 (kutipan terlalu pendek) | too_short: benar |
| digital | N-04 (kutipan muncul berkali-kali) | ambiguous: benar |
| digital | N-05 (belum tervalidasi) | skipped: benar |
| digital | N-06 (finding_type inconclusive) | skipped: benar |
| digital | N-07 (halaman di luar dokumen) | bad_page: benar |
| scan bersih | F-01 | IoU 0.73 |
| scan bersih | F-02 | IoU 0.62 |
| scan bersih | F-03 | IoU 0.73 |
| scan bersih | F-04 | IoU 0.69 |
| scan bersih | F-05 | IoU 0.72 |
| scan bersih | N-01 (kutipan tidak ada di dokumen) | not_located: benar |
| scan bersih | N-02 (kutipan benar tapi halaman salah) | not_located: benar |
| scan bersih | N-03 (kutipan terlalu pendek) | too_short: benar |
| scan bersih | N-04 (kutipan muncul berkali-kali) | ambiguous: benar |
| scan bersih | N-05 (belum tervalidasi) | skipped: benar |
| scan bersih | N-06 (finding_type inconclusive) | skipped: benar |
| scan bersih | N-07 (halaman di luar dokumen) | bad_page: benar |
| scan jelek | F-01 | IoU 0.75 |
| scan jelek | F-02 | IoU 0.76 |
| scan jelek | F-03 | IoU 0.73 |
| scan jelek | F-04 | IoU 0.74 |
| scan jelek | F-05 | IoU 0.67 |
| scan jelek | N-01 (kutipan tidak ada di dokumen) | not_located: benar |
| scan jelek | N-02 (kutipan benar tapi halaman salah) | not_located: benar |
| scan jelek | N-03 (kutipan terlalu pendek) | too_short: benar |
| scan jelek | N-04 (kutipan muncul berkali-kali) | ambiguous: benar |
| scan jelek | N-05 (belum tervalidasi) | skipped: benar |
| scan jelek | N-06 (finding_type inconclusive) | skipped: benar |
| scan jelek | N-07 (halaman di luar dokumen) | bad_page: benar |
