import { useEffect, useMemo, useRef, useState } from "react";

/**
 * PipelineNeuralGraph — progres ConfidAI sebagai graf syaraf digital dengan bot bulat.
 *
 * - Semua node tampil sejak awal, TANPA garis antar node.
 * - Saat progres berpindah tahap, kamera zoom ke node tahap itu dan garis baru
 *   tumbuh dari node-node tahap tersebut.
 * - Node tahap aktif = bot bulat gradien yang berpikir. Tiap tahap punya warna
 *   dan mimik mata sendiri. Tahap yang selesai tetap menjadi bot kecil yang tersenyum.
 * - Saat selesai, kamera zoom out dan seluruh jaringan melayang pelan.
 *
 * Props: stage | status, percent (hanya untuk memilih sub-tahap), message, demo
 * Pakai: const p = useJobProgress(jobId); <PipelineNeuralGraph {...p} />
 */

export const STAGES = [
  { id: "upload",   label: "Upload PDF",         status: "queued",      hub: 0,  c: "#5cc8ff", hi: "#b4e9ff", lo: "#1c4f9e" }, // mengangguk
  { id: "extract",  label: "Ekstraksi / OCR",    status: "processing",  hub: 3,  c: "#34e0b4", hi: "#a2f5df", lo: "#0c6a68" }, // memindai
  { id: "segment",  label: "Segmentasi Klausul", status: "processing",  hub: 2,  c: "#9b84ff", hi: "#cfc2ff", lo: "#3a2f9e" }, // memotong
  { id: "screen",   label: "Screening Risiko",   status: "ai_analysis", hub: 4,  c: "#ffb547", hi: "#ffe3a8", lo: "#a35a10" }, // curiga
  { id: "validate", label: "Validasi Bukti",     status: "validating",  hub: 5,  c: "#9be34a", hi: "#d9f6a6", lo: "#3a7a14" }, // mengecek
  { id: "legal",    label: "Pemetaan Pasal UU",  status: "validating",  hub: 8,  c: "#ff72b0", hi: "#ffc2da", lo: "#9b2760" }, // hmm
  { id: "report",   label: "Findings & Report",  status: "completed",   hub: 10, c: "#ffd76a", hi: "#fff2c0", lo: "#a8741a" }, // menulis
];

// Mimik mata per tahap (satuan: fraksi jari-jari). Default: w .15, h .42, ex .37
const FACES = [
  (t) => ({ dy: Math.sin(t * 2.4) * 0.14 }),                                              // upload: mengangguk menerima
  (t) => ({ h: 0.24, dx: Math.sin(t * 3.4) * 0.18 }),                                     // OCR: menyipit, memindai kiri-kanan
  (t) => ({ ex: 0.24 + Math.abs(Math.sin(t * 1.5)) * 0.2 }),                              // klausul: mata merenggang, memotong
  (t) => ({ h: 0.27, w: 0.2, tilt: 14, dx: Math.sin(t * 1.1) * 0.1 }),                    // screening: curiga, alis miring
  (t) => ({ dy: Math.sin(t * 3) * 0.05, winkL: t % 2.8 < 0.4 }),                          // validasi: mengedip sebelah
  (t) => ({ dx: -0.12, dy: -0.12 + Math.sin(t * 0.8) * 0.03, hS: [1, 1.35], mouth: true }), // pasal UU: menengadah, "hmm"
  (t) => ({ h: 0.3, dy: 0.1, dx: Math.sin(t * 5) * 0.06 }),                               // report: melirik ke bawah, menulis
];

// Koordinat mengikuti gambar referensi (750×750). `s` = tahap saat node ikut aktif.
const NODES = [
  { x: 140, y: 19,  s: 0 }, { x: 519, y: 93,  s: 2 }, { x: 281, y: 119, s: 2 }, { x: 103, y: 220, s: 1 },
  { x: 276, y: 227, s: 3 }, { x: 426, y: 304, s: 4 }, { x: 550, y: 307, s: 3 }, { x: 164, y: 388, s: 1 },
  { x: 444, y: 515, s: 5 }, { x: 733, y: 598, s: 4 }, { x: 191, y: 633, s: 6 }, { x: 447, y: 659, s: 6 },
];
const L = (c) => c.charCodeAt(0) - 65;
const EDGES = "AB AD AG AI BC BE BG BI CD CE DF DH EG EH EI EK FH FI FJ FK GJ GK HI HK IJ IK IL KJ KL"
  .split(" ")
  .map((p) => {
    const a = L(p[0]), b = L(p[1]);
    return { a, b, s: Math.max(NODES[a].s, NODES[b].s) };
  });
const HUB_OF = {};
STAGES.forEach((s, i) => { HUB_OF[s.hub] = i; });

const FULL = { cx: 432, cy: 339, w: 1180 };
const ZOOM_W = 300;
const ASPECT = 0.625;

function resolve({ stage, status, percent = 0 }) {
  const byId = STAGES.findIndex((s) => s.id === stage);
  if (byId >= 0) return { index: byId, failed: status === "failed" };
  const p = Math.max(0, Math.min(100, percent));
  switch (status) {
    case "queued":      return { index: 0 };
    case "processing":  return { index: p < 50 ? 1 : 2 };
    case "ai_analysis": return { index: 3 };
    case "validating":  return { index: p < 50 ? 4 : 5 };
    case "completed":   return { index: STAGES.length };
    case "failed":      return { index: 0, failed: true };
    default:            return { index: 0 };
  }
}

/** Polling /jobs/:id/progress — sesuaikan nama field dengan respons backend Anda. */
export function useJobProgress(jobId, baseUrl = "http://127.0.0.1:8000", intervalMs = 1000) {
  const [state, setState] = useState({ status: "queued", percent: 0 });
  useEffect(() => {
    if (!jobId) return;
    let stop = false;
    const tick = async () => {
      try {
        const d = await (await fetch(`${baseUrl}/jobs/${jobId}/progress`)).json();
        if (stop) return;
        setState({ status: d.status, stage: d.stage, percent: d.percent ?? d.percentage ?? 0, message: d.message });
        if (d.status === "completed" || d.status === "failed") return;
      } catch { /* coba lagi */ }
      if (!stop) setTimeout(tick, intervalMs);
    };
    tick();
    return () => { stop = true; };
  }, [jobId, baseUrl, intervalMs]);
  return state;
}

// Kamera: interpolasi halus (zoom di ruang log) + melayang tipis; `amp` = gerak node setelah selesai
function useCamera(target, drift, alive) {
  const [v, setV] = useState({ ...FULL, t: 0, amp: 0 });
  const t = useRef(target), d = useRef(drift), al = useRef(alive);
  t.current = target; d.current = drift; al.current = alive;
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf, last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = reduce ? 1 : 1 - Math.exp(-dt * 2.2);
      const kAmp = reduce ? 0 : 1 - Math.exp(-dt * 1.2);
      const q = t.current;
      const amp = d.current ? q.w * 0.012 : 0;
      const ox = Math.sin(now / 1700) * amp, oy = Math.cos(now / 2300) * amp;
      setV((p) => ({
        t: now / 1000,
        amp: p.amp + ((al.current && !reduce ? 1 : 0) - p.amp) * kAmp,
        cx: p.cx + (q.cx + ox - p.cx) * k,
        cy: p.cy + (q.cy + oy - p.cy) * k,
        w: Math.exp(Math.log(p.w) + (Math.log(q.w) - Math.log(p.w)) * k),
      }));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return v;
}

const hex = () => "0x" + Math.floor(Math.random() * 65536).toString(16).padStart(4, "0").toUpperCase();

/** Bot bulat bergradien. mode: "think" | "happy" | "fail" */
function Bot({ cx, cy, r, u, t, i, mode }) {
  const st = STAGES[i];
  const f = { w: 0.15, h: 0.42, ex: 0.37, dx: 0, dy: 0, tilt: 0, ...(mode === "think" ? FACES[i](t) : {}) };
  const y0 = cy + Math.sin(t * (mode === "think" ? 2 : 1.5) + i) * (mode === "think" ? 0.04 : 0.06) * r;
  const eyeY = y0 - r * 0.34 + f.dy * r;
  const blink = t % 3.6 < 0.13 ? 0.1 : 1;
  const sw = Math.max(1.2 * u, r * 0.03);
  const white = "#fff";

  const eyes = [-1, 1].map((sd, k) => {
    const x = cx + sd * f.ex * r + f.dx * r;
    if (mode === "happy") {
      const a = 0.13 * r;
      return <path key={k} d={`M${x - a} ${eyeY + 0.1 * r} q${a} ${-0.3 * r} ${2 * a} 0`} stroke={white} strokeWidth={r * 0.1} strokeLinecap="round" fill="none" />;
    }
    if (mode === "fail") {
      const a = 0.1 * r;
      return <path key={k} d={`M${x - a} ${eyeY - a} l${2 * a} ${2 * a} m${-2 * a} 0 l${2 * a} ${-2 * a}`} stroke={white} strokeWidth={r * 0.09} strokeLinecap="round" fill="none" />;
    }
    const w = f.w * r;
    const h = f.h * r * (f.hS ? f.hS[k] : 1) * (f.winkL && sd === -1 ? 0.1 : blink);
    return <rect key={k} x={x - w / 2} y={eyeY - h / 2} width={w} height={h} rx={w / 2} fill={white} transform={`rotate(${sd * f.tilt} ${x} ${eyeY})`} />;
  });

  return (
    <g>
      {mode === "think" && [0, 0.9, 1.8].map((d) => (
        <circle key={d} cx={cx} cy={cy} r={r * 1.7} fill={`url(#png-h${i})`} stroke={st.c} strokeOpacity="0.12" strokeWidth={u} className="png-ripple" style={{ animationDelay: `${d}s` }} />
      ))}
      <circle cx={cx} cy={y0} r={r + 3 * u} fill="none" stroke={white} strokeOpacity="0.14" strokeWidth={5 * u} />
      <circle cx={cx} cy={y0} r={r} fill={mode === "fail" ? "#8a2a35" : `url(#png-b${i})`} />
      {mode !== "fail" && <ellipse cx={cx} cy={y0 + r * 0.38} rx={r * 0.86} ry={r * 0.3} fill={`url(#png-n${i})`} />}
      <circle cx={cx} cy={y0} r={r} fill="none" stroke={white} strokeOpacity="0.85" strokeWidth={sw} />
      {eyes}
      {mode === "think" && f.mouth && (
        <path d={`M${cx - 0.16 * r} ${y0 + 0.32 * r} q${0.08 * r} ${-0.07 * r} ${0.16 * r} 0 t${0.16 * r} 0`} stroke={white} strokeOpacity="0.8" strokeWidth={r * 0.05} fill="none" strokeLinecap="round" />
      )}
      {mode === "happy" && (
        <path d={`M${cx - 0.2 * r} ${y0 + 0.28 * r} q${0.2 * r} ${0.22 * r} ${0.4 * r} 0`} stroke={white} strokeOpacity="0.85" strokeWidth={r * 0.06} fill="none" strokeLinecap="round" />
      )}
      {mode === "think" && [[1.0, -0.85, 0.07], [1.28, -1.1, 0.1], [1.6, -1.4, 0.14]].map(([dx, dy, rr], k) => (
        <circle key={k} cx={cx + dx * r} cy={y0 + dy * r} r={rr * r} fill={st.c} className="png-dot" style={{ animationDelay: `${k * 0.28}s` }} />
      ))}
    </g>
  );
}

export default function PipelineNeuralGraph(props) {
  const isDemo = props.demo ?? (props.stage == null && props.status == null);
  const [tick, setTick] = useState(0);
  const [bits, setBits] = useState(() => Array.from({ length: 6 }, hex));

  useEffect(() => {
    if (!isDemo) return;
    const id = setInterval(() => setTick((t) => (t + 1) % (STAGES.length * 10 + 14)), 380);
    return () => clearInterval(id);
  }, [isDemo]);

  const { index, failed } = isDemo ? { index: Math.min(Math.floor(tick / 10), STAGES.length), failed: false } : resolve(props);
  const done = index >= STAGES.length;
  const thinking = !done && !failed;
  const si = Math.min(index, STAGES.length - 1);
  const stage = STAGES[si];
  const hub = NODES[stage.hub];

  useEffect(() => {
    if (!thinking) return;
    const id = setInterval(() => setBits(Array.from({ length: 6 }, hex)), 140);
    return () => clearInterval(id);
  }, [thinking]);

  const cam = useCamera(done ? FULL : { cx: hub.x, cy: hub.y, w: ZOOM_W }, thinking, done);
  const h = cam.w * ASPECT;
  const u = cam.w / 700; // 1 piksel layar ≈ u satuan dunia
  const pos = NODES.map((n, i) => ({
    x: n.x + (Math.sin(cam.t * 0.9 + i * 1.7) * 14 + Math.sin(cam.t * 0.37 + i * 3.1) * 8) * cam.amp,
    y: n.y + (Math.cos(cam.t * 0.8 + i * 2.3) * 14 + Math.cos(cam.t * 0.43 + i * 1.3) * 8) * cam.amp,
  }));
  const msg = props.message || (done ? "Analisis selesai. Hasil siap ditinjau." : failed ? "Tahap gagal. Periksa detail error pada job." : `${stage.label} sedang berjalan`);

  const C = { line: "#e8eef9", dim: "#2a3246", bad: "#ff6b6b" };
  const accent = failed ? C.bad : done ? "#9fe8ff" : stage.c;
  const revealed = useMemo(() => EDGES.map((e, i) => ({ ...e, i })).filter((e) => e.s <= index), [index]);
  const prev = index > 0 ? STAGES[Math.min(index, STAGES.length) - 1] : null;

  return (
    <div className="png-root" role="img" aria-label={`Progres pipeline: ${msg}`}>
      <style>{CSS}</style>
      <svg className="png-svg" viewBox={`${cam.cx - cam.w / 2} ${cam.cy - h / 2} ${cam.w} ${h}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          {STAGES.map((s, i) => (
            <g key={s.id}>
              <linearGradient id={`png-b${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={s.hi} /><stop offset="0.5" stopColor={s.c} /><stop offset="1" stopColor={s.lo} />
              </linearGradient>
              <radialGradient id={`png-n${i}`}>
                <stop offset="0" stopColor={s.lo} stopOpacity="0.75" /><stop offset="1" stopColor={s.lo} stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`png-h${i}`}>
                <stop offset="0.55" stopColor={s.c} stopOpacity="0" /><stop offset="1" stopColor={s.c} stopOpacity="0.22" />
              </radialGradient>
            </g>
          ))}
        </defs>

        {revealed.map((e) => {
          const A = pos[e.a], B = pos[e.b];
          const fresh = e.s === index && !done;
          return (
            <g key={`${e.a}-${e.b}`}>
              <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} pathLength="1" className="png-grow" stroke={C.line}
                strokeWidth={(fresh ? 1.6 : 1) * u} opacity={fresh || done ? 0.95 : 0.5} />
              {(thinking || done) && (
                <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} pathLength="1" className="png-fire" stroke={accent}
                  strokeWidth={2.4 * u} strokeLinecap="round" opacity={done ? 0.55 : 1}
                  style={{ animationDuration: `${1.3 + (e.i % 5) * 0.45}s`, animationDelay: `${-((e.i * 0.37) % 2.4)}s`, animationDirection: e.i % 2 ? "normal" : "reverse" }} />
              )}
            </g>
          );
        })}

        {/* node biasa; node hub yang sudah tercapai diganti bot */}
        {NODES.map((n, i) => {
          const hs = HUB_OF[i];
          if (hs !== undefined && hs <= index && !done) return null;
          const active = n.s === index && thinking;
          const reached = n.s <= index;
          return (
            <circle key={i} cx={pos[i].x} cy={pos[i].y} r={(reached ? 3.6 : 2.2) * u}
              fill={reached ? (active ? accent : "#fff") : C.dim}
              className={active ? "png-flick" : ""} style={active ? { animationDelay: `${-(i * 0.23)}s` } : undefined} />
          );
        })}

        {/* riak "tahap selesai" */}
        {prev && (
          <circle key={index} cx={pos[prev.hub].x} cy={pos[prev.hub].y} r={14 * u} fill="none" stroke={prev.c} strokeWidth={1.8 * u} className="png-burst" />
        )}

        {/* bot kecil untuk tahap yang selesai */}
        {/* saat selesai, bot mengecil lalu kembali menjadi node kecil */}
        {STAGES.map((s, i) => {
          const k = done ? 1 - cam.amp : 1;
          return i < index && k > 0.2 ? (
            <Bot key={s.id} cx={pos[s.hub].x} cy={pos[s.hub].y} r={14 * u * k} u={u} t={cam.t} i={i} mode="happy" />
          ) : null;
        })}

        {/* bot besar untuk tahap aktif */}
        {!done && (
          <g>
            <Bot cx={pos[stage.hub].x} cy={pos[stage.hub].y} r={34 * u} u={u} t={cam.t} i={si} mode={failed ? "fail" : "think"} />
            {thinking && bits.map((b, k) => {
              const a = (k / bits.length) * Math.PI * 2 + 0.5;
              const rr = 58 * u;
              return (
                <text key={k} x={pos[stage.hub].x + Math.cos(a) * rr} y={pos[stage.hub].y + Math.sin(a) * rr}
                  fontSize={7 * u} fill={accent} opacity="0.7" textAnchor={Math.cos(a) > 0 ? "start" : "end"}
                  fontFamily="ui-monospace, Menlo, Consolas, monospace">{b}</text>
              );
            })}
          </g>
        )}
      </svg>

      <div className="png-hud">
        <div className="png-title">{done ? "Selesai" : stage.label}</div>
        <div className="png-msg">{msg}</div>
      </div>
      <div className="png-steps" aria-hidden="true">
        {STAGES.map((s, i) => (
          <span key={s.id} title={s.label}
            style={{ background: i < index ? s.c : i === index && !done ? (failed ? C.bad : s.c) : undefined, opacity: i === index && !done ? 0.7 : 1 }} />
        ))}
      </div>
    </div>
  );
}

const CSS = `
.png-root{position:relative;background:#04060a;border-radius:14px;overflow:hidden;aspect-ratio:16/10;max-width:1000px;width:100%;font-family:"IBM Plex Sans",system-ui,sans-serif;color:#e8eef9}
.png-svg{width:100%;height:100%;display:block}
.png-grow{stroke-dasharray:1;stroke-dashoffset:1;animation:png-draw 1.1s .6s cubic-bezier(.3,.7,.2,1) forwards}
.png-fire{stroke-dasharray:.07 1.5;stroke-dashoffset:.07;animation:png-run 2s linear infinite}
.png-flick{animation:png-flick 1.1s steps(2,end) infinite}
.png-dot{animation:png-dotp 1.1s ease-in-out infinite}
.png-ripple{transform-box:fill-box;transform-origin:center;animation:png-ripple 2.7s ease-out infinite}
.png-burst{transform-box:fill-box;transform-origin:center;animation:png-burst 1.2s ease-out forwards}
.png-hud{position:absolute;left:18px;top:14px;right:18px;pointer-events:none}
.png-title{font-size:20px;font-weight:600;letter-spacing:.01em}
.png-msg{font-size:13px;color:#9fb0d0;margin-top:2px}
.png-steps{position:absolute;left:18px;right:18px;bottom:14px;display:flex;gap:6px}
.png-steps span{flex:1;height:3px;background:#1d2536;border-radius:2px;transition:background .4s}
@keyframes png-draw{to{stroke-dashoffset:0}}
@keyframes png-run{from{stroke-dashoffset:.07}to{stroke-dashoffset:-1.5}}
@keyframes png-flick{0%{opacity:1}35%{opacity:.35}60%{opacity:.9}100%{opacity:.5}}
@keyframes png-dotp{0%,100%{opacity:.15}40%{opacity:1}}
@keyframes png-ripple{from{transform:scale(.6);opacity:.9}to{transform:scale(1.35);opacity:0}}
@keyframes png-burst{from{transform:scale(1);opacity:.9}to{transform:scale(5);opacity:0}}
@media (prefers-reduced-motion:reduce){.png-root *{animation:none!important}.png-grow{stroke-dashoffset:0}.png-fire{display:none}}
`;
