@echo off
REM Pintasan, bisa dijalankan dari folder mana pun tanpa mengaktifkan venv dulu:
REM   ocr <file.pdf> [--show 1] [--json hasil.json] [--force-ocr]   baca PDF (teks digital / OCR)
REM   ocr ukur [file_digital.pdf]                                   ukur akurasi OCR (eval.eval_ocr)
REM   ocr ukur --foto hal1.jpg hal2.jpg                             sama, plus foto HP asli vs nda_contoh.pdf
REM   ocr tandai <file.pdf> <temuan.json> [--out hasil.pdf]         highlight kutipan temuan (BE-11)
REM   ocr uji-tandai                                                uji ketepatan highlight (eval.eval_highlight)
set PYTHONPATH=%~dp0
set "PY=%~dp0..\venv\Scripts\python.exe"
if /i "%~1"=="ukur" (
    "%PY%" -m eval.eval_ocr %2 %3 %4 %5 %6 %7 %8 %9
) else if /i "%~1"=="tandai" (
    "%PY%" -m app.document.highlight %2 %3 %4 %5 %6 %7 %8 %9
) else if /i "%~1"=="uji-tandai" (
    "%PY%" -m eval.eval_highlight
) else (
    "%PY%" -m app.document.extract %*
)
