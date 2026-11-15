# Pemetaan klausul ke pasal hukum

## Prinsip output

ConfidAI menampilkan **pasal terkait untuk ditinjau**, bukan menyatakan bahwa
pasal telah dilanggar. Setiap referensi berasal dari teks batang tubuh yang
sudah diindeks, diambil memakai pasangan metadata `source_id` + `pasal_number`,
dan disimpan bersama kutipan serta ID chunk. Hasil vector top-k tidak langsung
dijadikan sitasi.

Nilai `applicability` menyatakan kondisi yang perlu diperiksa. Nilai
`legal_reviewed` tetap `false` sampai reviewer hukum memverifikasi penerapan
dan kesimpulan untuk fakta kasus tersebut. Rujukan ditambahkan setelah bukti
klausul lolos validasi; hipotesis legal yang belum final boleh menyertakan
kandidat pasal, tetapi statusnya tetap `needs_review`.

## Pemetaan saat ini

| Sinyal temuan | Pasal kandidat | Kondisi yang ditampilkan |
|---|---|---|
| Subkontraktor/pihak ketiga, dalam kontrak yang memuat Data Pribadi | UU PDP Pasal 51–52 | Hanya bila pihak ketiga bertindak sebagai Prosesor Data Pribadi. |
| Salin, akses, atau pengamanan Data Pribadi | UU PDP Pasal 35 dan/atau 39 | Hanya bila informasi termasuk Data Pribadi dan peran pihak memenuhi UU PDP. |
| Retensi/pemusnahan Data Pribadi | UU PDP Pasal 42 | Periksa tujuan pemrosesan, masa retensi, dan apakah pemrosesan masih diperlukan. |
| Dasar pemrosesan dan hak subjek data | UU PDP Pasal 20 dan/atau 14 | Periksa dasar pemrosesan serta pelaksanaan hak di luar isi NDA. |
| Transfer data lintas negara | UU PDP Pasal 56 | Periksa transfer yang terjadi dan pemenuhan syarat transfer. |
| Klausul respons insiden | UU PDP Pasal 46 | Hanya relevan jika terjadi kegagalan Pelindungan Data Pribadi. |
| Akses sistem, kontrol IT/OT, ransomware/malware | UU ITE Pasal 15 | Bersyarat pada status pihak sebagai Penyelenggara Sistem Elektronik; cek perubahan UU yang berlaku. |
| Tanggung jawab/kerugian kontraktual | KUH Perdata Pasal 1338/1243/1365 | Kontekstual; unsur wanprestasi/perbuatan melanggar hukum dan kerugian harus dinilai terpisah. |

Kode pemetaan dan alasan per pasal ada di `confidai/analysis/legal_linker.py`.
Untuk mengubah pemetaan, perbarui tabel ini dan aturan tersebut bersama-sama.

## Cakupan sumber

Koleksi proyek memuat UU Nomor 27 Tahun 2022, naskah UU Nomor 11 Tahun 2008,
dan KUH Perdata. Naskah UU ITE di koleksi belum menggabungkan UU Nomor 19
Tahun 2016 dan UU Nomor 1 Tahun 2024; report menandai batasan versi ini. Jangan
menjadikan sitasi UU ITE dari indeks tersebut sebagai kesimpulan hukum terkini
sebelum memperbarui sumber dan memverifikasi pasalnya.

