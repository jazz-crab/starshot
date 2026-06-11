/**
 * AUDIO.JS - Audio engine
 */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, type = "sine", duration = 0.1, vol = 0.01) {
  if (audioCtx.state === "suspended") audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(
    10,
    audioCtx.currentTime + duration,
  );

  gain.gain.setValueAtTime(vol * sfxVolume, audioCtx.currentTime);
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}
