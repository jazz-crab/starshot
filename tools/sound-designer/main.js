/* ============================================================
   main.js — Sound Designer logic
   ============================================================ */
// ─── state ───
const bank = [];
let isLooping = false;
let loopTimer = null;
let visMode = 'osc'; // 'osc' | 'spec'

// ─── DOM refs ───
const $ = id => document.getElementById(id);
const waveEl     = $('waveform');
const freqR      = $('freq');
const freqN      = $('freqNum');
const durR       = $('duration');
const durN       = $('durNum');
const volR       = $('volume');
const volN       = $('volNum');
const pvR        = $('pitchVar');
const pvN        = $('pvNum');
const echoToggle = $('echoToggle');
const echoSub    = $('echoSub');
const echoStatus = $('echoStatus');
const edR        = $('echoDelay');
const edN        = $('edNum');
const evR        = $('echoVol');
const evN        = $('evNum');
const loopToggle = $('loopToggle');
const loopStatus = $('loopStatus');
const playBtn    = $('playBtn');
const addBtn     = $('addBtn');
const codeOut    = $('codeOut');
const bankList   = $('bankList');
const clearBtn   = $('clearBtn');
const exportBtn  = $('exportBtn');
const visCanvas  = $('visCanvas');
const langToggle = $('langToggle');
const visTabs    = document.querySelectorAll('.vis-tab');

// ─── audio graph with analyser ───
let audioCtx = null;
let analyser = null;
let animId = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playRaw(freq, type, duration, vol, pitchVar, dest) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  const f = pitchVar > 0 ? freq * (1 + (Math.random() - 0.5) * pitchVar * 2) : freq;
  osc.frequency.setValueAtTime(f, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(f * 0.02, ctx.currentTime + duration);
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(dest || analyser);
  osc.start();
  osc.stop(ctx.currentTime + duration);
  return { osc, gain };
}

// ─── read values ───
function getVals() {
  const dur = parseFloat(durN.value) || 0.1;
  const vol = parseFloat(volN.value) || 0.01;
  const pv  = parseFloat(pvN.value) || 0;
  return {
    waveform: waveEl.value,
    freq:     parseInt(freqN.value, 10) || 440,
    duration: Math.max(0.01, dur),
    volume:   Math.max(0, vol),
    pitchVar: Math.max(0, pv),
    echo:     echoToggle.classList.contains('on'),
    echoDelay: parseInt(edN.value, 10) || 65,
    echoVol:  parseFloat(evN.value) || 0.01,
  };
}

function setSliderFromInput(slider, numEl, scale) {
  const v = parseFloat(numEl.value);
  if (!isNaN(v)) {
    const clamped = Math.max(slider.min, Math.min(slider.max, v * scale));
    slider.value = Math.round(clamped);
  }
}

function setInputFromSlider(slider, numEl, scale) {
  const v = parseInt(slider.value, 10) / scale;
  numEl.value = scale === 1 ? String(v) : v.toFixed(scale > 100 ? 3 : scale > 10 ? 2 : 1);
}

// ─── slider ↔ input sync ───
const BINDINGS = [
  ['freq',     'freqNum', 1],
  ['duration', 'durNum', 1000],
  ['volume',   'volNum', 1000],
  ['pitchVar', 'pvNum', 100],
  ['echoDelay','edNum', 1],
  ['echoVol',  'evNum', 1000],
];

BINDINGS.forEach(([sId, nId, scale]) => {
  const s = $(sId);
  const n = $(nId);
  s.addEventListener('input', () => { setInputFromSlider(s, n, scale); updateCode(); });
  n.addEventListener('input', () => { setSliderFromInput(s, n, scale); updateCode(); });
  n.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); s.value = Math.min(+s.max, +s.value + (+s.step || 1)); setInputFromSlider(s, n, scale); updateCode(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); s.value = Math.max(+s.min, +s.value - (+s.step || 1)); setInputFromSlider(s, n, scale); updateCode(); }
  });
});

document.querySelectorAll('.arrow-group button').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    const dir = btn.classList.contains('up') ? 1 : -1;
    const s = $(target);
    if (!s) return;
    const step = parseInt(s.step, 10) || 1;
    s.value = Math.max(+s.min, Math.min(+s.max, +s.value + dir * step));
    const binding = BINDINGS.find(b => b[0] === target);
    if (binding) { setInputFromSlider(s, $(binding[1]), binding[2]); }
    updateCode();
  });
});

// ─── echo toggle ───
echoToggle.addEventListener('click', () => {
  echoToggle.classList.toggle('on');
  echoSub.classList.toggle('open', echoToggle.classList.contains('on'));
  echoStatus.textContent = echoToggle.classList.contains('on') ? t('on') : t('off');
  updateCode();
});

waveEl.addEventListener('change', updateCode);

// ─── vis mode toggle ───
visTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    visTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    visMode = tab.dataset.mode;
    // reset hover for spectrum
    visHoverX = -1;
    visHoverY = -1;
  });
});

// ─── generate code ───
function genCode(v) {
  const freq = v.freq;
  const type = JSON.stringify(v.waveform);
  const dur  = v.duration.toFixed(2);
  const vol  = v.volume.toFixed(3);
  let args = `${freq}, ${type}, ${dur}, ${vol}`;
  if (v.pitchVar > 0) args += `, ${v.pitchVar.toFixed(2)}`;
  const main = `playSound(${args})`;
  if (!v.echo) return main;
  const echoArgs = `${freq}, ${type}, ${dur}, ${v.echoVol.toFixed(3)}`;
  const eArgs = v.pitchVar > 0 ? `${echoArgs}, ${v.pitchVar.toFixed(2)}` : echoArgs;
  return `${main}\nsetTimeout(() => playSound(${eArgs}), ${v.echoDelay})`;
}

function genArrayEntry(v) {
  let arr = `[${v.freq}, "${v.waveform}", ${v.duration.toFixed(2)}]`;
  if (v.pitchVar > 0) arr += `  // pitchVar: ${v.pitchVar.toFixed(2)}`;
  return arr;
}

function updateCode() {
  codeOut.textContent = genCode(getVals());
}

// ─── preview ───
function playPreview() {
  const v = getVals();
  playRaw(v.freq, v.waveform, v.duration, v.volume, v.pitchVar, analyser);
  if (v.echo) {
    setTimeout(() => playRaw(v.freq, v.waveform, v.duration, v.echoVol, v.pitchVar, analyser), v.echoDelay);
  }
}

playBtn.addEventListener('click', playPreview);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'INPUT') playPreview();
  if (e.key === ' ') { e.preventDefault(); playPreview(); }
});

// ─── loop / atmosphere ───
function loopTick() {
  if (!isLooping) return;
  const baseFreq = parseInt(freqN.value, 10) || 440;
  const baseDur  = parseFloat(durN.value) || 0.1;
  const baseVol  = parseFloat(volN.value) || 0.01;
  const basePv   = parseFloat(pvN.value) || 0;
  const types    = ['sine', 'square', 'sawtooth', 'triangle'];
  const freq = baseFreq * (0.5 + Math.random());
  const dur  = baseDur * (0.3 + Math.random() * 0.7);
  const vol  = baseVol * (0.3 + Math.random() * 0.7);
  const type = types[Math.floor(Math.random() * types.length)];
  const pv   = basePv > 0 ? basePv * (0.5 + Math.random()) : 0;
  playRaw(freq, type, Math.max(0.02, dur), Math.max(0.001, vol), pv, analyser);
  const nextDelay = Math.max(50, dur * 1000 * (0.3 + Math.random() * 0.7));
  loopTimer = setTimeout(loopTick, nextDelay);
}

loopToggle.addEventListener('click', () => {
  loopToggle.classList.toggle('on');
  isLooping = loopToggle.classList.contains('on');
  const statusText = isLooping ? t('on') : t('off');
  loopStatus.textContent = statusText;
  playBtn.disabled = isLooping;
  if (isLooping) { getCtx(); loopTick(); }
  else { clearTimeout(loopTimer); }
});

// ─── add to bank ───
addBtn.addEventListener('click', () => { bank.push(getVals()); renderBank(); });

function renderBank() {
  if (bank.length === 0) {
    bankList.innerHTML = `<div class="empty-bank">${t('noSounds')}</div>`;
    return;
  }
  bankList.innerHTML = '';
  bank.forEach((v, i) => {
    const div = document.createElement('div');
    div.className = 'bank-item';
    const call = document.createElement('span');
    call.className = 'call';
    call.textContent = genCode(v);
    const ba = document.createElement('div');
    ba.className = 'ba';
    const playSm = document.createElement('button');
    playSm.className = 'play-bn';
    playSm.textContent = '\u25B6';
    playSm.addEventListener('click', (e) => { e.stopPropagation();
      playRaw(v.freq, v.waveform, v.duration, v.volume, v.pitchVar, analyser);
      if (v.echo) setTimeout(() => playRaw(v.freq, v.waveform, v.duration, v.echoVol, v.pitchVar, analyser), v.echoDelay);
    });
    const copySm = document.createElement('button');
    copySm.textContent = t('copy');
    copySm.addEventListener('click', (e) => { e.stopPropagation();
      const text = genCode(v);
      copyText(text).then(() => { copySm.textContent = '\u2713'; setTimeout(() => { copySm.textContent = t('copy'); }, 1200); });
    });
    const delSm = document.createElement('button');
    delSm.className = 'del-bn';
    delSm.textContent = t('del');
    delSm.addEventListener('click', (e) => { e.stopPropagation(); bank.splice(i, 1); renderBank(); });
    ba.appendChild(playSm);
    ba.appendChild(copySm);
    ba.appendChild(delSm);
    div.appendChild(call);
    div.appendChild(ba);
    bankList.appendChild(div);
  });
}

clearBtn.addEventListener('click', () => { bank.length = 0; renderBank(); });

exportBtn.addEventListener('click', () => {
  if (bank.length === 0) return;
  let out = '// SOUND_DEFS — generated by Sound Designer\nconst SOUND_DEFS = [\n';
  bank.forEach(v => { out += `  ${genArrayEntry(v)},\n`; });
  out += '];\n\n// Play calls:\n';
  bank.forEach(v => { out += `  ${genCode(v)};\n`; });
  copyText(out).then(() => {
    const orig = exportBtn.textContent;
    exportBtn.textContent = '\u2713';
    setTimeout(() => { exportBtn.textContent = orig; }, 1500);
  });
});

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

// ─── visualization constants ───
const FFT_SIZE = 1024;
const SR = 44100; // nominal sample rate for frequency labels
const DB_GRID = [-90, -70, -50, -30];
const FREQ_GRID = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];

function fmtFreq(f) {
  return f >= 1000 ? (f / 1000).toFixed(f % 1000 === 0 ? 0 : 1).replace('.0', '') + 'k' : String(f);
}

let visHoverX = -1;
let visHoverY = -1;

function drawVis() {
  if (!analyser) { animId = requestAnimationFrame(drawVis); return; }
  const w = visCanvas.width;
  const h = visCanvas.height;
  const ctx = visCanvas.getContext('2d');
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, w, h);

  if (visMode === 'osc') {
    // ── Oscilloscope ──
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);
    // center line
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    // waveform
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / data.length) * w;
      const y = (data[i] / 255) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  } else {
    // ── Spectrum ──
    const specData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(specData);
    const halfBins = specData.length; // = fftSize/2

    // margins (proportional — scale with canvas size)
    const margin = Math.min(w, h) * 0.06;
    const plotL = Math.max(50, margin);
    const plotR = w - Math.max(10, margin * 0.5);
    const plotT = Math.max(20, margin * 0.5);
    const plotB = h - Math.max(30, margin * 0.8);
    const plotW = plotR - plotL;
    const plotH = plotB - plotT;

    // ── dB grid lines ──
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.font = '11px MonaspaceKrypton, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    DB_GRID.forEach(dB => {
      const v = (dB + 100) / 70 * 255;
      const y = plotT + (1 - v / 255) * plotH;
      if (y < plotT || y > plotB) return;
      ctx.beginPath();
      ctx.moveTo(plotL, y);
      ctx.lineTo(plotR, y);
      ctx.stroke();
      ctx.fillStyle = '#555';
      ctx.fillText(dB + 'dB', plotL - 8, y);
    });

    // ── freq grid lines ──
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    FREQ_GRID.forEach(f => {
      const bin = f / (SR / FFT_SIZE);
      const x = plotL + (bin / halfBins) * plotW;
      if (x < plotL || x > plotR) return;
      ctx.beginPath();
      ctx.moveTo(x, plotT);
      ctx.lineTo(x, plotB);
      ctx.stroke();
      ctx.fillStyle = '#555';
      ctx.fillText(fmtFreq(f), x, plotB + 5);
    });

    // ── spectrum bars ──
    const barsToShow = halfBins * 0.5;
    const barW = plotW / barsToShow;
    for (let i = 0; i < barsToShow; i++) {
      const v = specData[i] / 255;
      const x = plotL + (i / barsToShow) * plotW;
      const bh = v * plotH;
      ctx.fillStyle = i < 10
        ? `rgba(0,229,255,${0.3 + v * 0.7})`
        : `rgba(76,175,80,${0.3 + v * 0.7})`;
      ctx.fillRect(x, plotB - bh, Math.max(1, barW - 0.5), bh);
    }

    // ── axis labels ──
    ctx.fillStyle = '#444';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Hz', plotR, plotB + 5);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('dB', plotL - 8, plotT + 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('dB', plotL - 8, plotB);

    // ── border ──
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.strokeRect(plotL, plotT, plotW, plotH);

    // ── crosshair ──
    if (visHoverX >= 0 && visHoverY >= 0) {
      const cx = visHoverX * w;
      const cy = visHoverY * h;
      if (cx >= plotL && cx <= plotR && cy >= plotT && cy <= plotB) {
        const binFrac = (cx - plotL) / plotW * halfBins;
        const freqHz = binFrac * (SR / FFT_SIZE);
        const byteVal = 255 * (1 - (cy - plotT) / plotH);
        const dBval = -100 + (byteVal / 255) * 70;

        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(cx, plotT); ctx.lineTo(cx, plotB); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(plotL, cy); ctx.lineTo(plotR, cy); ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '12px MonaspaceKrypton, monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(fmtFreq(Math.round(freqHz)) + 'Hz', cx, plotB + 18);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(dBval) + 'dB', plotL - 10, cy);
      }
    }
  }

  animId = requestAnimationFrame(drawVis);
}

// ─── vis mouse events ───
visCanvas.addEventListener('mousemove', (e) => {
  if (visMode !== 'spec') { visHoverX = -1; visHoverY = -1; return; }
  const rect = visCanvas.getBoundingClientRect();
  visHoverX = (e.clientX - rect.left) / rect.width;
  visHoverY = (e.clientY - rect.top) / rect.height;
});
visCanvas.addEventListener('mouseleave', () => { visHoverX = -1; visHoverY = -1; });

// ─── canvas resize ───
function resizeCanvas() {
  const parent = visCanvas.parentElement;
  if (!parent) return;
  const rect = parent.getBoundingClientRect();
  const dpr = 2;
  visCanvas.width = rect.width * dpr;
  visCanvas.height = rect.height * dpr;
  visCanvas.style.width = rect.width + 'px';
  visCanvas.style.height = rect.height + 'px';
}

window.addEventListener('resize', resizeCanvas);

// ─── localization toggle ───
langToggle.addEventListener('click', () => {
  setLang(lang === 'en' ? 'ru' : 'en');
  renderBank();
});

// ─── init ───
function init() {
  BINDINGS.forEach(([sId, nId, scale]) => { setInputFromSlider($(sId), $(nId), scale); });
  updateCode();
  resizeCanvas();
  drawVis();
  setLang('en');
}

init();
