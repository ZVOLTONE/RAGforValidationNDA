# Hasil evaluasi retrieval (testset_pdp.json, 43 kasus, k=5)

Status set uji: DRAFT - pasal jawaban (gold) disusun Claude, WAJIB dicek Daniel sebelum dipakai untuk keputusan tim

| Model | Metode | Hit@5 | Recall@5 | MRR |
|---|---|---|---|---|
| nomic-embed-text:latest | vector | 0.30 | 0.23 | 0.21 |
| - | bm25 | 0.81 | 0.69 | 0.70 |
| nomic-embed-text:latest | hybrid | 0.65 | 0.52 | 0.38 |
| bge-m3 | vector | 0.84 | 0.74 | 0.66 |
| bge-m3 | hybrid | 0.84 | 0.78 | 0.74 |

## Kasus yang belum sempurna (Recall < 1)

| Model | Metode | Kasus | Gold | Ditemukan (top-k) |
|---|---|---|---|---|
| nomic-embed-text:latest | vector | pdp-01 | Pasal 51 | Pasal 6, Pasal 23, Pasal 7, Pasal 60, Pasal 27 |
| nomic-embed-text:latest | vector | pdp-02 | Pasal 51, Pasal 65, Pasal 20 | Pasal 60, Pasal 5, Pasal 27, Pasal 6 |
| nomic-embed-text:latest | vector | pdp-03 | Pasal 46 | Pasal 14, Pasal 27, Pasal 44, Pasal 45 |
| nomic-embed-text:latest | vector | pdp-04 | Pasal 46 | Pasal 33, Pasal 54, Pasal 3, Pasal 52, Pasal 35 |
| nomic-embed-text:latest | vector | pdp-05 | Pasal 43, Pasal 44, Pasal 42 | Pasal 37, Pasal 33, Pasal 27, Pasal 6 |
| nomic-embed-text:latest | vector | pdp-06 | Pasal 42, Pasal 44 | Pasal 60, Pasal 47, Pasal 27, Pasal 53, Pasal 37 |
| nomic-embed-text:latest | vector | pdp-07 | Pasal 56 | Pasal 60, Pasal 3, Pasal 33 |
| nomic-embed-text:latest | vector | pdp-08 | Pasal 28, Pasal 51 | Pasal 1, Pasal 6, Pasal 68, Pasal 60, Pasal 66 |
| nomic-embed-text:latest | vector | pdp-09 | Pasal 39, Pasal 35 | Pasal 47, Pasal 60, Pasal 53, Pasal 27 |
| nomic-embed-text:latest | vector | pdp-10 | Pasal 35, Pasal 39 | Pasal 47, Pasal 35, Pasal 27, Pasal 31, Pasal 29 |
| nomic-embed-text:latest | vector | pdp-11 | Pasal 36 | Pasal 47, Pasal 27, Pasal 68, Pasal 33, Pasal 60 |
| nomic-embed-text:latest | vector | pdp-12 | Pasal 37 | Pasal 60, Pasal 6, Pasal 3, Pasal 59 |
| nomic-embed-text:latest | vector | pdp-13 | Pasal 31 | Pasal 21, Pasal 27, Pasal 28, Pasal 24, Pasal 25 |
| nomic-embed-text:latest | vector | pdp-14 | Pasal 4, Pasal 34 | Pasal 60, Pasal 4, Pasal 6, Pasal 66, Pasal 35 |
| nomic-embed-text:latest | vector | pdp-15 | Pasal 22, Pasal 23, Pasal 20 | Pasal 10, Pasal 27, Pasal 3, Pasal 69, Pasal 65 |
| nomic-embed-text:latest | vector | pdp-16 | Pasal 40, Pasal 9 | Pasal 35, Pasal 7, Pasal 6, Pasal 60 |
| nomic-embed-text:latest | vector | pdp-17 | Pasal 10, Pasal 34 | Pasal 10, Pasal 53, Pasal 23, Pasal 35, Pasal 27 |
| nomic-embed-text:latest | vector | pdp-18 | Pasal 48 | Pasal 46, Pasal 27, Pasal 60, Pasal 6 |
| nomic-embed-text:latest | vector | pdp-20 | Pasal 51 | Pasal 6, Pasal 60, Pasal 66, Pasal 35, Pasal 27 |
| nomic-embed-text:latest | vector | pdp-21 | Pasal 65, Pasal 67 | Pasal 60, Pasal 7, Pasal 6, Pasal 35 |
| nomic-embed-text:latest | vector | pdp-23 | Pasal 30, Pasal 6 | Pasal 30, Pasal 29, Pasal 37, Pasal 31, Pasal 38 |
| nomic-embed-text:latest | vector | pdp-24 | Pasal 32, Pasal 7 | Pasal 14, Pasal 68, Pasal 27, Pasal 44, Pasal 23 |
| nomic-embed-text:latest | vector | pdp-25 | Pasal 45 | Pasal 33, Pasal 27, Pasal 21, Pasal 44 |
| nomic-embed-text:latest | vector | pdp-26 | Pasal 18 | Pasal 47, Pasal 6, Pasal 27, Pasal 23 |
| nomic-embed-text:latest | vector | pdp-28 | Pasal 21 | Pasal 60, Pasal 5, Pasal 1, Pasal 53, Pasal 23 |
| nomic-embed-text:latest | vector | pdp-30 | Pasal 55 | Pasal 1, Pasal 6, Pasal 33, Pasal 7, Pasal 68 |
| nomic-embed-text:latest | vector | pdp-31 | Pasal 52 | Pasal 27, Pasal 35, Pasal 16, Pasal 60 |
| nomic-embed-text:latest | vector | pdp-33 | Pasal 13, Pasal 7 | Pasal 33, Pasal 66, Pasal 68, Pasal 7 |
| nomic-embed-text:latest | vector | pdp-34 | Pasal 12, Pasal 47 | Pasal 60, Pasal 35, Pasal 6, Pasal 54 |
| nomic-embed-text:latest | vector | pdp-35 | Pasal 11, Pasal 41 | Pasal 53, Pasal 16, Pasal 27, Pasal 35, Pasal 18 |
| nomic-embed-text:latest | vector | pdp-36 | Pasal 34 | Pasal 27, Pasal 6, Pasal 60, Pasal 35 |
| nomic-embed-text:latest | vector | pdp-37 | Pasal 49 | Pasal 47, Pasal 38, Pasal 33, Pasal 37, Pasal 60 |
| nomic-embed-text:latest | vector | pdp-38 | Pasal 57 | Pasal 60, Pasal 68, Pasal 27, Pasal 1, Pasal 54 |
| nomic-embed-text:latest | vector | pdp-39 | Pasal 70 | Pasal 60, Pasal 53, Pasal 69, Pasal 5, Pasal 47 |
| nomic-embed-text:latest | vector | pdp-41 | Pasal 5, Pasal 21 | Pasal 5, Pasal 1, Pasal 23, Pasal 4, Pasal 45 |
| nomic-embed-text:latest | vector | pdp-43 | Pasal 42 | Pasal 27, Pasal 6, Pasal 60, Pasal 35 |
| - | bm25 | pdp-02 | Pasal 51, Pasal 65, Pasal 20 | Pasal 60, Pasal 20, Pasal 55, Pasal 40, Pasal 37 |
| - | bm25 | pdp-04 | Pasal 46 | Pasal 75, Pasal 20, Pasal 23, Pasal 33, Pasal 70 |
| - | bm25 | pdp-05 | Pasal 43, Pasal 44, Pasal 42 | Pasal 43, Pasal 8, Pasal 16, Pasal 56, Pasal 42 |
| - | bm25 | pdp-06 | Pasal 42, Pasal 44 | Pasal 71, Pasal 21, Pasal 32, Pasal 13 |
| - | bm25 | pdp-07 | Pasal 56 | Pasal 2, Pasal 59, Pasal 37, Pasal 3, Pasal 23 |
| - | bm25 | pdp-08 | Pasal 28, Pasal 51 | Pasal 13, Pasal 65, Pasal 67, Pasal 1, Pasal 66 |
| - | bm25 | pdp-09 | Pasal 39, Pasal 35 | Pasal 39, Pasal 47, Pasal 16, Pasal 53, Pasal 46 |
| - | bm25 | pdp-10 | Pasal 35, Pasal 39 | Pasal 35, Pasal 46, Pasal 33, Pasal 38, Pasal 16 |
| - | bm25 | pdp-12 | Pasal 37 | Pasal 39, Pasal 10, Pasal 12, Pasal 13, Pasal 3 |
| - | bm25 | pdp-14 | Pasal 4, Pasal 34 | Pasal 4, Pasal 33, Pasal 39 |
| - | bm25 | pdp-15 | Pasal 22, Pasal 23, Pasal 20 | Pasal 10, Pasal 9, Pasal 24, Pasal 13, Pasal 26 |
| - | bm25 | pdp-18 | Pasal 48 | Pasal 55, Pasal 34, Pasal 60, Pasal 46, Pasal 13 |
| - | bm25 | pdp-21 | Pasal 65, Pasal 67 | Pasal 65, Pasal 7, Pasal 60, Pasal 44 |
| - | bm25 | pdp-23 | Pasal 30, Pasal 6 | Pasal 30, Pasal 16, Pasal 21, Pasal 32 |
| - | bm25 | pdp-24 | Pasal 32, Pasal 7 | Pasal 14, Pasal 32, Pasal 20, Pasal 21, Pasal 60 |
| - | bm25 | pdp-25 | Pasal 45 | Pasal 16, Pasal 44, Pasal 56, Pasal 43, Pasal 42 |
| - | bm25 | pdp-33 | Pasal 13, Pasal 7 | Pasal 13, Pasal 60, Pasal 66, Pasal 22 |
| - | bm25 | pdp-34 | Pasal 12, Pasal 47 | Pasal 12, Pasal 60, Pasal 53, Pasal 46 |
| - | bm25 | pdp-35 | Pasal 11, Pasal 41 | Pasal 41, Pasal 60, Pasal 16, Pasal 70, Pasal 5 |
| nomic-embed-text:latest | hybrid | pdp-02 | Pasal 51, Pasal 65, Pasal 20 | Pasal 60, Pasal 5, Pasal 20, Pasal 55 |
| nomic-embed-text:latest | hybrid | pdp-03 | Pasal 46 | Pasal 14, Pasal 29, Pasal 24, Pasal 60, Pasal 47 |
| nomic-embed-text:latest | hybrid | pdp-04 | Pasal 46 | Pasal 33, Pasal 3, Pasal 35, Pasal 47, Pasal 52 |
| nomic-embed-text:latest | hybrid | pdp-05 | Pasal 43, Pasal 44, Pasal 42 | Pasal 33, Pasal 53, Pasal 1, Pasal 49, Pasal 37 |
| nomic-embed-text:latest | hybrid | pdp-06 | Pasal 42, Pasal 44 | Pasal 53, Pasal 1, Pasal 60, Pasal 71, Pasal 47 |
| nomic-embed-text:latest | hybrid | pdp-07 | Pasal 56 | Pasal 3, Pasal 59, Pasal 60, Pasal 23, Pasal 53 |
| nomic-embed-text:latest | hybrid | pdp-08 | Pasal 28, Pasal 51 | Pasal 1, Pasal 68, Pasal 66, Pasal 65, Pasal 33 |
| nomic-embed-text:latest | hybrid | pdp-09 | Pasal 39, Pasal 35 | Pasal 47, Pasal 39, Pasal 53, Pasal 60, Pasal 38 |
| nomic-embed-text:latest | hybrid | pdp-10 | Pasal 35, Pasal 39 | Pasal 35, Pasal 33, Pasal 38, Pasal 27, Pasal 29 |
| nomic-embed-text:latest | hybrid | pdp-12 | Pasal 37 | Pasal 3, Pasal 60, Pasal 6, Pasal 53, Pasal 5 |
| nomic-embed-text:latest | hybrid | pdp-14 | Pasal 4, Pasal 34 | Pasal 4, Pasal 33, Pasal 60, Pasal 53 |
| nomic-embed-text:latest | hybrid | pdp-15 | Pasal 22, Pasal 23, Pasal 20 | Pasal 10, Pasal 27, Pasal 26, Pasal 22, Pasal 9 |
| nomic-embed-text:latest | hybrid | pdp-16 | Pasal 40, Pasal 9 | Pasal 35, Pasal 27, Pasal 3, Pasal 26, Pasal 16 |
| nomic-embed-text:latest | hybrid | pdp-17 | Pasal 10, Pasal 34 | Pasal 10, Pasal 60, Pasal 59, Pasal 33 |
| nomic-embed-text:latest | hybrid | pdp-18 | Pasal 48 | Pasal 46, Pasal 60, Pasal 1, Pasal 24, Pasal 53 |
| nomic-embed-text:latest | hybrid | pdp-20 | Pasal 51 | Pasal 23, Pasal 60, Pasal 53, Pasal 6, Pasal 2 |
| nomic-embed-text:latest | hybrid | pdp-21 | Pasal 65, Pasal 67 | Pasal 60, Pasal 7, Pasal 65, Pasal 66 |
| nomic-embed-text:latest | hybrid | pdp-23 | Pasal 30, Pasal 6 | Pasal 30, Pasal 32, Pasal 21, Pasal 38, Pasal 40 |
| nomic-embed-text:latest | hybrid | pdp-24 | Pasal 32, Pasal 7 | Pasal 14, Pasal 60, Pasal 21, Pasal 18, Pasal 16 |
| nomic-embed-text:latest | hybrid | pdp-30 | Pasal 55 | Pasal 60, Pasal 1, Pasal 23, Pasal 3, Pasal 42 |
| nomic-embed-text:latest | hybrid | pdp-31 | Pasal 52 | Pasal 35, Pasal 16, Pasal 33, Pasal 27, Pasal 3 |
| nomic-embed-text:latest | hybrid | pdp-33 | Pasal 13, Pasal 7 | Pasal 66, Pasal 68, Pasal 60, Pasal 7 |
| nomic-embed-text:latest | hybrid | pdp-34 | Pasal 12, Pasal 47 | Pasal 60, Pasal 9, Pasal 16, Pasal 47, Pasal 59 |
| nomic-embed-text:latest | hybrid | pdp-35 | Pasal 11, Pasal 41 | Pasal 16, Pasal 60, Pasal 41, Pasal 18, Pasal 53 |
| nomic-embed-text:latest | hybrid | pdp-36 | Pasal 34 | Pasal 60, Pasal 53, Pasal 37, Pasal 16, Pasal 24 |
| nomic-embed-text:latest | hybrid | pdp-39 | Pasal 70 | Pasal 60, Pasal 47, Pasal 69, Pasal 53, Pasal 1 |
| bge-m3 | vector | pdp-01 | Pasal 51 | Pasal 23, Pasal 11, Pasal 18, Pasal 14, Pasal 3 |
| bge-m3 | vector | pdp-02 | Pasal 51, Pasal 65, Pasal 20 | Pasal 3, Pasal 65, Pasal 66, Pasal 67, Pasal 33 |
| bge-m3 | vector | pdp-06 | Pasal 42, Pasal 44 | Pasal 32, Pasal 67, Pasal 7, Pasal 30, Pasal 41 |
| bge-m3 | vector | pdp-08 | Pasal 28, Pasal 51 | Pasal 7, Pasal 13, Pasal 60, Pasal 5, Pasal 28 |
| bge-m3 | vector | pdp-09 | Pasal 39, Pasal 35 | Pasal 38, Pasal 39, Pasal 65, Pasal 33, Pasal 66 |
| bge-m3 | vector | pdp-10 | Pasal 35, Pasal 39 | Pasal 35, Pasal 36, Pasal 29, Pasal 27, Pasal 49 |
| bge-m3 | vector | pdp-14 | Pasal 4, Pasal 34 | Pasal 27, Pasal 28, Pasal 49, Pasal 4, Pasal 35 |
| bge-m3 | vector | pdp-15 | Pasal 22, Pasal 23, Pasal 20 | Pasal 10, Pasal 22, Pasal 28, Pasal 24, Pasal 51 |
| bge-m3 | vector | pdp-20 | Pasal 51 | Pasal 3, Pasal 38, Pasal 65, Pasal 23, Pasal 56 |
| bge-m3 | vector | pdp-21 | Pasal 65, Pasal 67 | Pasal 7, Pasal 66, Pasal 5, Pasal 28, Pasal 27 |
| bge-m3 | vector | pdp-24 | Pasal 32, Pasal 7 | Pasal 32, Pasal 30, Pasal 40, Pasal 41, Pasal 46 |
| bge-m3 | vector | pdp-31 | Pasal 52 | Pasal 36, Pasal 47, Pasal 54, Pasal 53, Pasal 27 |
| bge-m3 | vector | pdp-33 | Pasal 13, Pasal 7 | Pasal 33, Pasal 66, Pasal 56, Pasal 13, Pasal 55 |
| bge-m3 | vector | pdp-38 | Pasal 57 | Pasal 27, Pasal 38, Pasal 67, Pasal 75, Pasal 39 |
| bge-m3 | vector | pdp-39 | Pasal 70 | Pasal 27, Pasal 53, Pasal 49, Pasal 19, Pasal 51 |
| bge-m3 | hybrid | pdp-02 | Pasal 51, Pasal 65, Pasal 20 | Pasal 60, Pasal 55, Pasal 13, Pasal 56, Pasal 3 |
| bge-m3 | hybrid | pdp-06 | Pasal 42, Pasal 44 | Pasal 32, Pasal 21, Pasal 41, Pasal 55, Pasal 65 |
| bge-m3 | hybrid | pdp-08 | Pasal 28, Pasal 51 | Pasal 13, Pasal 55, Pasal 18, Pasal 56, Pasal 7 |
| bge-m3 | hybrid | pdp-09 | Pasal 39, Pasal 35 | Pasal 39, Pasal 38, Pasal 47, Pasal 3, Pasal 13 |
| bge-m3 | hybrid | pdp-12 | Pasal 37 | Pasal 60, Pasal 13, Pasal 6, Pasal 53, Pasal 7 |
| bge-m3 | hybrid | pdp-14 | Pasal 4, Pasal 34 | Pasal 4, Pasal 35, Pasal 53, Pasal 21, Pasal 54 |
| bge-m3 | hybrid | pdp-15 | Pasal 22, Pasal 23, Pasal 20 | Pasal 10, Pasal 24, Pasal 22, Pasal 13, Pasal 32 |
| bge-m3 | hybrid | pdp-21 | Pasal 65, Pasal 67 | Pasal 7, Pasal 65, Pasal 13, Pasal 60 |
| bge-m3 | hybrid | pdp-31 | Pasal 52 | Pasal 35, Pasal 54, Pasal 36, Pasal 47, Pasal 50 |
| bge-m3 | hybrid | pdp-35 | Pasal 11, Pasal 41 | Pasal 41, Pasal 16, Pasal 18, Pasal 43, Pasal 53 |
| bge-m3 | hybrid | pdp-38 | Pasal 57 | Pasal 60, Pasal 67, Pasal 53, Pasal 46, Pasal 27 |
| bge-m3 | hybrid | pdp-39 | Pasal 70 | Pasal 53, Pasal 60, Pasal 51, Pasal 48 |
