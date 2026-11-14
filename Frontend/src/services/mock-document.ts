/**
 * Dokumen contoh (data ilustratif) untuk mode mock.
 * Koordinat blok dinormalisasi 0..1 terhadap ukuran halaman agar highlight
 * dapat diskalakan di viewer.
 */
import type { BoundingBox, DocumentPage, PageTextBlock } from '@/types';

const block = (
  id: string,
  text: string,
  top: number,
  height: number,
  fontSize = 10,
  bold = false,
  left = 0.12,
  width = 0.76,
): PageTextBlock => ({ id, text, top, height, fontSize, bold, left, width });

export const MOCK_PAGES: DocumentPage[] = [
  {
    page_number: 1,
    width: 612,
    height: 792,
    blocks: [
      block(
        'p1-title',
        'PERJANJIAN KERAHASIAAN (NON-DISCLOSURE AGREEMENT)',
        0.09,
        0.06,
        15,
        true,
        0.12,
        0.76,
      ),
      block('p1-number', 'Nomor: NDA/2026/ND-014', 0.17, 0.03, 9),
      block(
        'p1-parties',
        'Perjanjian ini dibuat pada 1 November 2026 antara PT Nusantara Digital (Pemberi) dan PT Mitra Awan Siber (Penerima).',
        0.24,
        0.05,
      ),
      block(
        'p1-purpose',
        'Para pihak sepakat untuk melindungi informasi rahasia yang dipertukarkan dalam rangka evaluasi layanan keamanan siber.',
        0.32,
        0.05,
      ),
      block(
        'p1-term',
        'Dokumen ini mengikat para pihak sejak tanggal berlaku hingga berakhirnya jangka waktu sebagaimana diatur dalam Pasal 8.',
        0.4,
        0.05,
      ),
    ],
  },
  {
    page_number: 2,
    width: 612,
    height: 792,
    blocks: [
      block('p2-h4', 'Pasal 4 — Definisi Informasi Rahasia', 0.06, 0.03, 12, true),
      block(
        'p2-4.1',
        '4.1 Informasi Rahasia mencakup seluruh data teknis, konfigurasi sistem, kredensial, serta laporan insiden yang diserahkan oleh salah satu pihak.',
        0.11,
        0.05,
      ),
      block('p2-h5', 'Pasal 5 — Kewajiban Penerima', 0.2, 0.03, 12, true),
      block(
        'p2-5.1',
        '5.1 Penerima wajib menjaga kerahasiaan informasi dan hanya menggunakan informasi tersebut untuk tujuan evaluasi layanan.',
        0.25,
        0.05,
      ),
      block(
        'p2-5.2',
        '5.2 Penerima wajib membatasi akses informasi rahasia hanya kepada personel yang memerlukan akses untuk pelaksanaan perjanjian.',
        0.32,
        0.05,
      ),
      block(
        'p2-5.3',
        '5.3 Penerima tidak diwajibkan menerapkan autentikasi multifaktor pada sistem yang menyimpan informasi rahasia.',
        0.4,
        0.05,
      ),
      block(
        'p2-5.4',
        '5.4 Penerima tidak diwajibkan menyelenggarakan pelatihan keamanan berkala bagi personel yang menangani informasi rahasia.',
        0.49,
        0.05,
      ),
      block(
        'p2-5.5',
        '5.5 Penerima wajib melaporkan perubahan personel yang memiliki akses istimewa kepada Pemberi.',
        0.58,
        0.05,
      ),
    ],
  },
  {
    page_number: 3,
    width: 612,
    height: 792,
    blocks: [
      block('p3-h6', 'Pasal 6 — Akses Pihak Ketiga', 0.06, 0.03, 12, true),
      block(
        'p3-6.1',
        '6.1 Penerima dapat melibatkan subkontraktor untuk memproses informasi rahasia tanpa persetujuan tertulis terlebih dahulu dari Pemberi.',
        0.11,
        0.06,
      ),
      block(
        'p3-6.2',
        '6.2 Penerima wajib menyampaikan pemberitahuan tertulis kepada Pemberi mengenai keterlibatan subkontraktor paling lambat 14 hari kerja setelah keterlibatan dimulai.',
        0.21,
        0.06,
      ),
      block(
        'p3-6.3',
        '6.3 Penerima bertanggung jawab atas kepatuhan subkontraktor terhadap ketentuan perjanjian ini.',
        0.3,
        0.05,
      ),
      block('p3-h7', 'Pasal 7 — Pelaporan Insiden', 0.38, 0.03, 12, true),
      block(
        'p3-7.1',
        '7.1 Penerima wajib melaporkan insiden keamanan yang berdampak pada informasi rahasia kepada Pemberi paling lambat 30 hari kalender setelah insiden diketahui.',
        0.43,
        0.06,
      ),
      block(
        'p3-7.2',
        '7.2 Laporan insiden memuat kronologi, dampak, dan langkah mitigasi yang telah dilakukan.',
        0.52,
        0.05,
      ),
      block(
        'p3-7.3',
        '7.3 Penerima wajib menyimpan salinan data insiden selama 1 tahun.',
        0.6,
        0.04,
      ),
      block(
        'p3-7.4',
        '7.4 Penerima wajib melakukan pencadangan data setiap 24 jam dan menyimpan cadangan secara terpisah dari sistem produksi.',
        0.68,
        0.06,
      ),
    ],
  },
  {
    page_number: 4,
    width: 612,
    height: 792,
    blocks: [
      block('p4-h8', 'Pasal 8 — Jangka Waktu', 0.05, 0.03, 12, true),
      block(
        'p4-8.1',
        '8.1 Perjanjian berlaku selama 3 tahun sejak tanggal berlaku dan dapat diperpanjang secara tertulis.',
        0.1,
        0.05,
      ),
      block('p4-h9', 'Pasal 9 — Audit dan Pemantauan', 0.18, 0.03, 12, true),
      block(
        'p4-9.1',
        '9.1 Pemberi berhak melakukan audit terhadap sistem Penerima satu kali dalam setahun dengan pemberitahuan 14 hari sebelumnya.',
        0.23,
        0.06,
      ),
      block(
        'p4-9.2',
        '9.2 Audit dilaksanakan pada jam kerja dan tidak mengganggu operasional layanan.',
        0.32,
        0.04,
      ),
      block(
        'p4-9.3',
        '9.3 Ketentuan audit pada Pasal 9 tidak mencakup lingkungan teknologi operasional (OT) Penerima.',
        0.4,
        0.05,
      ),
      block(
        'p4-9.4',
        '9.4 Penerima menyimpan catatan akses informasi rahasia selama 30 hari.',
        0.48,
        0.04,
      ),
      block('p4-h10', 'Pasal 10 — Pembatasan Tanggung Jawab', 0.56, 0.03, 12, true),
      block(
        'p4-10.1',
        '10.1 Tanggung jawab masing-masing pihak dibatasi pada kerugian langsung yang terbukti.',
        0.61,
        0.04,
      ),
      block(
        'p4-10.2',
        '10.2 Pembatasan tanggung jawab tidak berlaku terhadap pelanggaran kewajiban kerahasiaan.',
        0.69,
        0.05,
      ),
      block('p4-h11', 'Pasal 11 — Hukum yang Berlaku', 0.78, 0.03, 12, true),
      block(
        'p4-11.1',
        '11.1 Perjanjian ini tunduk pada hukum Republik Indonesia.',
        0.83,
        0.04,
      ),
    ],
  },
  {
    page_number: 5,
    width: 612,
    height: 792,
    low_quality: true,
    blocks: [
      block('p5-ha', 'Lampiran A — Daftar Subkontraktor', 0.07, 0.03, 12, true),
      block('p5-a1', 'A.1 PT Awan Data Nusantara — penyimpanan cadangan.', 0.13, 0.04),
      block('p5-a2', 'A.2 PT Sentra Analitik — pemantauan keamanan.', 0.2, 0.04),
      block(
        'p5-note',
        'Halaman ini dipindai dengan kualitas rendah sehingga sebagian teks tidak terbaca.',
        0.3,
        0.05,
      ),
    ],
  },
];

export function findPage(pageNumber: number): DocumentPage | undefined {
  return MOCK_PAGES.find((page) => page.page_number === pageNumber);
}

export function blockQuote(pageNumber: number, blockId: string): string {
  return findPage(pageNumber)?.blocks?.find((item) => item.id === blockId)?.text ?? '';
}

export function blockBox(pageNumber: number, blockId: string): BoundingBox {
  const item = findPage(pageNumber)?.blocks?.find((entry) => entry.id === blockId);
  if (!item) {
    return { page: pageNumber, x0: 0.1, y0: 0.1, x1: 0.9, y1: 0.15 };
  }
  return {
    page: pageNumber,
    x0: item.left,
    y0: item.top,
    x1: item.left + item.width,
    y1: item.top + item.height,
  };
}
