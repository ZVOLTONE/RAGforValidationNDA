from __future__ import annotations

import argparse
import json
from pathlib import Path

from app.config import COLLECTION
from app.rag.retrieval import METHODS, Retriever, copy_collection

HERE = Path(__file__).parent


def articles(hits: list[dict]) -> list[str]:
    out = []
    for h in hits:
        if h["article"] not in out:
            out.append(h["article"])
    return out


def score(found: list[str], gold: list[str]) -> tuple[float, float, float]:
    hit = float(any(g in found for g in gold))
    recall = sum(g in found for g in gold) / len(gold)
    rr = next((1 / i for i, a in enumerate(found, 1) if a in gold), 0.0)
    return hit, recall, rr


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--testset", default=str(HERE / "testset_pdp.json"))
    ap.add_argument("--models", default="nomic-embed-text:latest,bge-m3")
    ap.add_argument("-k", type=int, default=5)
    ap.add_argument("--out", default=str(HERE / "results.md"))
    a = ap.parse_args()

    ts = json.loads(Path(a.testset).read_text(encoding="utf-8"))
    rows, misses = [], []
    for model in a.models.split(","):
        col = COLLECTION if model == "nomic-embed-text:latest" else copy_collection(model)
        r = Retriever(col)
        for method in METHODS:
            if method == "bm25" and rows and any(x[1] == "bm25" for x in rows):
                continue
            name = "-" if method == "bm25" else model
            tot = [0.0, 0.0, 0.0]
            for c in ts["cases"]:
                found = articles(r.search(c["query"], a.k, method, ts["source"]))
                s = score(found, c["gold"])
                tot = [t + v for t, v in zip(tot, s)]
                if s[1] < 1:
                    misses.append(f"| {name} | {method} | {c['id']} | {', '.join(c['gold'])} | {', '.join(found)} |")
            n = len(ts["cases"])
            rows.append((name, method, *(t / n for t in tot)))
            print(f"{name:26} {method:7} Hit@{a.k}={rows[-1][2]:.2f} Recall@{a.k}={rows[-1][3]:.2f} MRR={rows[-1][4]:.2f}")

    lines = [f"# Hasil evaluasi retrieval ({Path(a.testset).name}, {len(ts['cases'])} kasus, k={a.k})", "",
             f"Status set uji: {ts['status']}", "",
             f"| Model | Metode | Hit@{a.k} | Recall@{a.k} | MRR |", "|---|---|---|---|---|"]
    lines += [f"| {m} | {me} | {h:.2f} | {rc:.2f} | {rr:.2f} |" for m, me, h, rc, rr in rows]
    lines += ["", "## Kasus yang belum sempurna (Recall < 1)", "",
              "| Model | Metode | Kasus | Gold | Ditemukan (top-k) |", "|---|---|---|---|---|", *misses]
    Path(a.out).write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\nRincian disimpan ke {a.out}")


if __name__ == "__main__":
    main()
