from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from app.rag.retrieval import Retriever
from eval.eval_retrieval import articles

HERE = Path(__file__).parent


def build(ts: dict, r: Retriever, k: int) -> str:
    body: dict[str, str] = {}
    for d, m in zip(r.docs, r.metas):
        if m["section"] == "batang_tubuh":
            body[m["article"]] = body.get(m["article"], "") + d

    def flat(a: str) -> str:
        t = " ".join(body.get(a, "(teks tidak ada di database)").split())
        return re.sub(rf"^{a}\s*", "", t)

    def ayat(a: str) -> str:
        t = re.sub(r"(?<!ayat)\s+(\(\d+\))\s", r"\n\1 ", flat(a)).strip()
        return "\n".join(f"  > {line}" for line in t.splitlines())

    def short(a: str, n: int = 220) -> str:
        t = flat(a)
        return t if len(t) <= n else t[:n] + "…"

    rows, sections = [], []
    for c in ts["cases"]:
        found = articles(r.search(c["query"], k, "hybrid", ts["source"]))
        got = [g for g in c["gold"] if g in found]
        icon = "✅" if len(got) == len(c["gold"]) else ("⚠️" if got else "❌")
        rows.append(f"| [{c['id']}](#{c['id']}) | {c['query']} | {', '.join(c['gold'])} | {icon} {len(got)}/{len(c['gold'])} |")
        s = [f"## {c['id']}", "", f"**📄 Klausul kontrak:** {c['query']}", "",
             f"**Hasil sistem:** {icon} menemukan {len(got)} dari {len(c['gold'])} pasal kunci"
             f" · urutan temuan: {', '.join(found) or '-'}", ""]
        if c["note"]:
            s += [f"**💬 Alasan Claude memilih kunci ini:** {c['note']}", ""]
        s += ["### 🟡 KUNCI JAWABAN (gold) — benar relevan?", ""]
        for g in c["gold"]:
            mark = f"✅ ditemukan (peringkat {found.index(g) + 1})" if g in found else "❌ tidak ditemukan"
            s += [f"- [ ] **{g}** · {mark}", ayat(g), ""]
        extra = [a for a in found if a not in c["gold"]]
        if extra:
            s += ["### ⚪ Temuan sistem di luar kunci — ada yang ternyata relevan?", ""]
            s += [f"- [ ] **{a}** (peringkat {found.index(a) + 1}): {short(a)}" for a in extra]
            s += [""]
        s += ["---", ""]
        sections += s

    head = ["# Lembar cek kunci jawaban UU PDP", "",
            "## Cara pakai", "",
            "1. Baca **📄 Klausul kontrak**, lalu tanya: *kalau klausul ini ada di kontrak, pasal mana yang akan aku kutip sebagai bukti?*",
            "2. Bagian **🟡 KUNCI JAWABAN**: centang `[x]` kalau pasal itu memang relevan. Yang tidak relevan, hapus dari `gold` di `eval/testset_pdp.json`.",
            "3. Bagian **⚪ Temuan sistem**: centang `[x]` kalau ternyata relevan juga, lalu tambahkan ke `gold`.",
            "4. Nilai dengan hukum, bukan dengan skor. Jangan ubah kunci supaya angkanya naik.",
            "5. Selesai semua: `python -m eval.eval_retrieval` (dari root repo), lalu ubah `status` di JSON.", "",
            f"**Arti tanda:** ✅ semua pasal kunci ketemu · ⚠️ sebagian ketemu · ❌ tidak ada yang ketemu. "
            f"Sistem = {r.model} hybrid, {k} hasil teratas. Teks pasal hasil OCR, jadi ada typo/kalimat terpotong dari sumbernya.", "",
            "## Ringkasan", "", "| Kasus | Klausul | Kunci | Hasil |", "|---|---|---|---|", *rows, "", "---", ""]
    return "\n".join(head + sections) + "\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--testset", default=str(HERE / "testset_pdp.json"))
    ap.add_argument("--collection", default="legal_references__bge-m3")
    ap.add_argument("-k", type=int, default=5)
    ap.add_argument("--out", default=str(HERE / "cek_kunci_pdp.md"))
    a = ap.parse_args()
    ts = json.loads(Path(a.testset).read_text(encoding="utf-8"))
    Path(a.out).write_text(build(ts, Retriever(a.collection), a.k), encoding="utf-8")
    print(f"Lembar cek disimpan ke {a.out}")


if __name__ == "__main__":
    main()
