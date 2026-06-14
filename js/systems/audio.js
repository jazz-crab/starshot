/**
 * AUDIO.JS - Audio engine with pre-rendered sound cache
 */
let audioCtx = null;
const soundCache = new Map();

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

const SOUND_DEFS = [
  [400, "triangle", 0.05],     // shoot
  [80, "sawtooth", 0.4],       // grenade
  [150, "square", 0.1],        // enemy death
  [200, "square", 0.1],        // shop denied
  [300, "sine", 0.1],          // special ability
  [440, "triangle", 0.1],      // dash
  [500, "sine", 0.3],          // level up
  [600, "sawtooth", 0.3],      // ultimate
  [600, "sine", 0.3],          // shop buy
  [800, "sine", 0.2],          // health pack
  [80, "sawtooth", 0.6],       // boss death
  [880, "square", 0.04],       // button hover
  [660, "square", 0.08],       // button click
  [200, "square", 0.12],       // player hit
  [1400, "triangle", 0.08],    // coin pickup
  [880, "sine", 0.06],         // XP pickup
  [523, "square", 0.08],       // countdown tick
  [440, "square", 0.12],       // countdown echo
];

function renderSound(freq, type, duration) {
  const sampleRate = 44100;
  const length = Math.ceil(sampleRate * duration);
  const offlineCtx = new OfflineAudioContext(1, length, sampleRate);
  const osc = offlineCtx.createOscillator();
  const gain = offlineCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, 0);
  osc.frequency.exponentialRampToValueAtTime(10, duration);
  gain.gain.setValueAtTime(1, 0);
  gain.gain.linearRampToValueAtTime(0, duration);
  osc.connect(gain);
  gain.connect(offlineCtx.destination);
  osc.start(0);
  osc.stop(duration);
  return offlineCtx.startRendering();
}

function preloadSounds(onProgress) {
  const total = SOUND_DEFS.length;
  let done = 0;
  return Promise.all(SOUND_DEFS.map(([freq, type, duration]) => {
    const key = `${freq}_${type}_${duration}`;
    return renderSound(freq, type, duration).then((buffer) => {
      soundCache.set(key, buffer);
      done++;
      if (onProgress) onProgress(done / total);
    });
  }));
}

function playSound(freq, type = "sine", duration = 0.1, vol = 0.01, pitchVar = 0) {
  const ctx = getCtx();
  const key = `${freq}_${type}_${duration}`;
  const buffer = soundCache.get(key);

  if (buffer) {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    if (pitchVar > 0) {
      source.playbackRate.value = 1 + (Math.random() - 0.5) * pitchVar * 2;
    }
    const gain = ctx.createGain();
    gain.gain.value = vol * sfxVolume;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    return;
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + duration);
  gain.gain.setValueAtTime(vol * sfxVolume, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}
