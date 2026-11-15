"""Run the ConfidAI API and Expo web app together on Linux, macOS, or Windows."""

from __future__ import annotations

import argparse
import os
import shutil
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def python_executable() -> str:
    candidates = (
        ROOT / ".venv" / "Scripts" / "python.exe",
        ROOT / ".venv" / "bin" / "python",
    )
    return str(next((path for path in candidates if path.exists()), Path(sys.executable)))


def print_output(name: str, stream) -> None:
    for line in iter(stream.readline, ""):
        print(f"[{name}] {line.rstrip()}", flush=True)
    stream.close()


def main() -> int:
    parser = argparse.ArgumentParser(description="Jalankan backend dan frontend ConfidAI.")
    parser.add_argument("--api-port", type=int, default=8000, help="Port backend (default: 8000)")
    parser.add_argument("--web-port", type=int, default=8081, help="Port Expo web (default: 8081)")
    args = parser.parse_args()
    if not 1 <= args.api_port <= 65535 or not 1 <= args.web_port <= 65535:
        parser.error("port harus berada pada rentang 1–65535")
    if args.api_port == args.web_port:
        parser.error("port backend dan frontend harus berbeda")

    npm = shutil.which("npm")
    if not npm:
        parser.error("npm tidak ditemukan. Instal Node.js 22+ dan npm terlebih dahulu.")
    if not (ROOT / "frontend" / "node_modules").is_dir():
        parser.error("dependensi frontend belum terpasang. Jalankan `npm ci` di folder frontend.")

    env = os.environ.copy()
    backend_path = str(ROOT / "backend")
    existing_pythonpath = env.get("PYTHONPATH")
    env["PYTHONPATH"] = backend_path + (os.pathsep + existing_pythonpath if existing_pythonpath else "")

    frontend_command = (
        ["cmd.exe", "/d", "/s", "/c", f"npm run web -- --port {args.web_port}"]
        if os.name == "nt"
        else [npm, "run", "web", "--", "--port", str(args.web_port)]
    )

    commands = [
        (
            "backend",
            [
                python_executable(), "-m", "uvicorn", "main:app", "--app-dir", "backend",
                "--host", "0.0.0.0", "--port", str(args.api_port), "--reload",
            ],
            ROOT,
        ),
        (
            "frontend",
            frontend_command,
            ROOT / "frontend",
        ),
    ]
    processes: list[tuple[str, subprocess.Popen[str]]] = []
    readers: list[threading.Thread] = []
    try:
        for name, command, cwd in commands:
            process = subprocess.Popen(
                command,
                cwd=cwd,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
                errors="replace",
                bufsize=1,
            )
            processes.append((name, process))
            reader = threading.Thread(target=print_output, args=(name, process.stdout), daemon=True)
            reader.start()
            readers.append(reader)

        print(f"Backend : http://localhost:{args.api_port}", flush=True)
        print(f"Frontend: http://localhost:{args.web_port}", flush=True)
        print("Tekan Ctrl+C untuk menghentikan keduanya.", flush=True)

        while True:
            for name, process in processes:
                code = process.poll()
                if code is not None:
                    print(f"[{name}] berhenti dengan exit code {code}; menghentikan proses lain.", flush=True)
                    return code or 0
            time.sleep(0.25)
    except KeyboardInterrupt:
        print("\nMenghentikan ConfidAI…", flush=True)
        return 0
    finally:
        for _, process in processes:
            if process.poll() is None:
                process.send_signal(signal.SIGTERM)
        for _, process in processes:
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
        for reader in readers:
            reader.join(timeout=1)


if __name__ == "__main__":
    raise SystemExit(main())
