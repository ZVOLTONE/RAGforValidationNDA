@echo off
REM Pintasan: ocr <file.pdf> [--show 1] [--json hasil.json] [--force-ocr]
REM Bisa dijalankan dari folder mana pun, tanpa perlu mengaktifkan venv dulu.
set PYTHONPATH=%~dp0
"%~dp0..\venv\Scripts\python.exe" -m app.document.extract %*
