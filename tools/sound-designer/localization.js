const L = {
  en: {
    title: 'Sound Designer',
    waveform: 'Waveform',
    sine: 'sine',
    square: 'square',
    sawtooth: 'sawtooth',
    triangle: 'triangle',
    frequency: 'Frequency',
    duration: 'Duration',
    volume: 'Volume',
    pitchVar: 'Pitch Var',
    echo: 'Echo',
    echoDelay: 'Echo Delay',
    echoVol: 'Echo Vol',
    on: 'on',
    off: 'off',
    play: 'Play',
    stop: 'Stop',
    addToBank: 'Add to Bank',
    codeOutput: 'Code Output',
    copy: 'Copy',
    copied: 'Copied!',
    soundBank: 'Sound Bank',
    clear: 'Clear',
    del: 'Del',
    loopMode: 'Loop / Atmosphere',
    loopDesc: 'Continuous randomized ambient',
    oscilloscope: 'Oscilloscope',
    spectrum: 'Spectrum',
    Hz: 'Hz',
    s: 's',
    ms: 'ms',
    soundDefs: 'SOUND_DEFS entry',
    noSounds: 'No sounds yet',
    exportAll: 'Export All',
  },
  ru: {
    title: 'Конструктор звуков',
    waveform: 'Форма волны',
    sine: 'синус',
    square: 'меандр',
    sawtooth: 'пила',
    triangle: 'треугольник',
    frequency: 'Частота',
    duration: 'Длительность',
    volume: 'Громкость',
    pitchVar: 'Разброс',
    echo: 'Эхо',
    echoDelay: 'Задержка эха',
    echoVol: 'Громкость эха',
    on: 'вкл',
    off: 'выкл',
    play: 'Слушать',
    stop: 'Стоп',
    addToBank: 'В банк',
    codeOutput: 'Код',
    copy: 'Копировать',
    copied: 'Скопировано!',
    soundBank: 'Банк звуков',
    clear: 'Очистить',
    del: 'Удалить',
    loopMode: 'Цикл / Атмосфера',
    loopDesc: 'Непрерывный случайный эмбиент',
    oscilloscope: 'Осциллограф',
    spectrum: 'Спектр',
    Hz: 'Гц',
    s: 'с',
    ms: 'мс',
    soundDefs: 'Запись для SOUND_DEFS',
    noSounds: 'Пока нет звуков',
    exportAll: 'Экспорт',
  },
};

let lang = 'en';

function t(key) {
  const v = L[lang]?.[key];
  return v !== undefined ? v : key;
}

function setLang(code) {
  lang = code;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (el.tagName === 'INPUT') {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });
  const toggle = document.getElementById('langToggle');
  if (toggle) toggle.textContent = lang === 'en' ? 'RU' : 'EN';
}
