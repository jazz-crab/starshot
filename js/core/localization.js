/**
 * LOCALIZATION.JS - All translatable strings
 */
const STRINGS = {
  en: {
    menu: {
      title: 'STARSHOT',
      startBattle: 'START BATTLE',
      shop: 'SHOP',
      stats: 'STATS',
      settings: 'SETTINGS',
      back: 'BACK',
    },
    chars: {
      choose: 'CHOOSE FIGHTER',
      details: '[RMB] DETAILS',
      dashLabel: 'Dash:',
      ultLabel: 'Ult:',
      specialLabel: 'Special:',
      unlock: 'SCORE {score} TO UNLOCK',
      close: 'CLOSE [ESC]',
      level: 'Level',
    },
    weapon: {
      wasp: 'WASP',
      pulsar: 'PULSAR',
      grizzly: 'GRIZZLY',
    },
    char: {
      assault: {
        name: 'ASSAULT',
        desc: 'Balanced fighter',
        abilities: {
          dash: { name: 'DASH', levels: ['Speed + invulnerability', '+5 damage on path', '+50% range'] },
          ult: { name: 'SHOCKWAVE', levels: ['Ammo + spread for 5 sec', '+50% duration', 'Damage 10 enemies'] },
          special: { name: 'GRENADE', levels: ['Frag grenade', '+2 fragments', '+50% blast radius'] },
        },
      },
      medic: {
        name: 'MEDIC',
        desc: 'Field medic',
        abilities: {
          dash: { name: 'DASH', levels: ['Speed + invulnerability', 'Heals 2 HP on path', '+3 HP heal'] },
          ult: { name: 'AURA', levels: ['Healing aura 5 sec', '+50% radius', '+2 HP/tick'] },
          special: { name: 'HEAL SHOT', levels: ['Uses ammo, heals 3 HP', 'Heals 5 HP', 'Cures bleeding'] },
        },
      },
      ninja: {
        name: 'NINJA',
        desc: 'Speed & precision',
        abilities: {
          dash: { name: 'TELEPORT', levels: ['Instant teleport 200px', '+50px range', 'Invisible 1 sec after'] },
          ult: { name: 'SHURIKENS', levels: ['12 shurikens in all directions', '+4 shurikens', 'Shurikens poison'] },
          special: { name: 'SMOKE', levels: ['Smoke screen 2 sec', '+1 sec duration', 'Enemies lose target'] },
        },
      },
      heavy: {
        name: 'HEAVY',
        desc: 'Juggernaut',
        abilities: {
          dash: { name: 'RAM', levels: ['Charge with knockback', '+10 damage', 'Knocks enemies down'] },
          ult: { name: 'SHIELD', levels: ['100% damage block 3 sec', '+2 sec duration', 'Shield explodes'] },
          special: { name: 'ARMOR WALL', levels: ['Blocks enemies', '+50% durability', 'Places 2 walls'] },
        },
      },
      pyro: {
        name: 'PYROMANCER',
        desc: 'Fire & chaos',
        abilities: {
          dash: { name: 'FIRE TRAIL', levels: ['Leaves fire trail', '+50% duration', 'Trail explodes'] },
          ult: { name: 'FIRE STORM', levels: ['360° fire for 5 sec', '+50% radius', 'Burn: 3 dmg/tick'] },
          special: { name: 'IGNITE ROUND', levels: ['Sets enemy on fire', 'Burns longer', 'Spreads to neighbors'] },
        },
      },
    },
    hud: {
      hp: 'HP',
      wave: 'Wave',
      score: 'SCORE',
      level: 'LEVEL',
      xp: 'XP',
      coins: 'COINS',
      autoOn: 'AUTO: ON (Y)',
      damage: 'DAMAGE',
      fireRate: 'FIRE RATE',
      magazine: 'MAGAZINE',
      reload: 'RELOAD',
      range: 'RANGE',
      bulletSpd: 'BULLET SPEED',
      knockback: 'KNOCKBACK',
      accuracy: 'ACCURACY',
      ult: 'ULTIMATE (Q)',
      ability: 'ABILITY (RMB):',
      ready: 'READY',
      ammo: 'AMMO',
    },
    pause: {
      title: 'PAUSE',
      resume: 'RESUME',
      mainMenu: 'MAIN MENU',
    },
    death: {
      title: 'DEFEATED',
      time: 'TIME',
      score: 'SCORE',
      coins: 'COINS',
      level: 'LEVEL',
      wave: 'WAVE',
      killed: 'KILLED',
      damage: 'DAMAGE',
      restart: 'RESTART',
      mainMenu: 'MAIN MENU',
    },
    stats: {
      title: 'STATISTICS',
      totalCoins: 'TOTAL COINS',
      bestScore: 'BEST SCORE',
      bestLevel: 'BEST LEVEL',
      bestTime: 'BEST TIME',
      totalKills: 'TOTAL KILLS',
      totalDamage: 'TOTAL DAMAGE',
      runs: 'RUNS',
    },
    settings: {
      title: 'SETTINGS',
      sfx: 'SFX VOLUME',
      music: 'MUSIC VOLUME',
      language: 'LANGUAGE',
    },
    shop: {
      title: 'SHOP',
      coins: 'COINS:',
      permaHp: 'MAX HEALTH +5',
      permaDmg: 'DAMAGE +5%',
      permaSpd: 'SPEED +0.3',
      max: 'MAX',
    },
    combat: {
      reloading: 'RELOADING...',
      evolution: 'EVOLUTION: {name}',
      chosen: 'CHOSEN',
      select: '[SELECT]',
    },
    mutation: {
      dash: [
        { label: 'ADRENALINE', desc: '+50% dash speed' },
        { label: 'TRAUMA', desc: 'Dash deals +10 damage' },
        { label: 'RECOVERY', desc: 'Dash heals 3 HP' },
      ],
      ult: [
        { label: 'ENERGY', desc: '+50% radius' },
        { label: 'DESTRUCTION', desc: '+15 damage' },
        { label: 'SLOW', desc: 'Slows enemies for 3 sec' },
      ],
      special: [
        { label: 'POWER UP', desc: '+50% efficiency' },
        { label: 'COOLDOWN', desc: '-30% cooldown' },
        { label: 'DOUBLE CHARGE', desc: '2 charges in a row' },
      ],
    },
    console: {
      unknownCmd: 'Unknown command. Type help',
      error: 'Error',
      noEnemies: 'No enemies',
      godOn: 'God mode: ON',
      godOff: 'God mode: OFF',
      allUnlocked: 'All characters unlocked',
      hpRestored: 'HP restored',
      enterNumber: 'Enter a number',
      enterPosNumber: 'Enter a number > 0',
      enterWave: 'Enter wave number (>=1)',
    },
  },

  ru: {
    menu: {
      title: 'STARSHOT',
      startBattle: 'НАЧАТЬ БОЙ',
      shop: 'МАГАЗИН',
      stats: 'СТАТИСТИКА',
      settings: 'НАСТРОЙКИ',
      back: 'НАЗАД',
    },
    chars: {
      choose: 'ВЫБЕРИ БОЙЦА',
      details: '[ПКМ] ПОДРОБНЕЕ',
      dashLabel: 'Рывок:',
      ultLabel: 'Ульт:',
      specialLabel: 'Способность:',
      unlock: 'НАБЕРИТЕ {score} ОЧКОВ',
      close: 'ЗАКРЫТЬ [ESC]',
      level: 'Уровень',
    },
    weapon: {
      wasp: 'ОСА',
      pulsar: 'ИМПУЛЬС',
      grizzly: 'ГРИЗЛИ',
    },
    char: {
      assault: {
        name: 'ШТУРМОВИК',
        desc: 'Сбалансированный боец',
        abilities: {
          dash: { name: 'РЫВОК', levels: ['Скорость + неуязвимость', '+5 урона по пути', '+50% дальности'] },
          ult: { name: 'УДАРНАЯ ВОЛНА', levels: ['Патроны + разброс на 5 сек', '+50% длительности', 'Урон 10 врагам'] },
          special: { name: 'ГРАНАТА', levels: ['Осколочная граната', '+2 осколка', '+50% радиус взрыва'] },
        },
      },
      medic: {
        name: 'МЕДИК',
        desc: 'Полевой медик',
        abilities: {
          dash: { name: 'РЫВОК', levels: ['Скорость + неуязвимость', '+2 ХП по пути', '+3 ХП лечения'] },
          ult: { name: 'АУРА', levels: ['Аура лечения 5 сек', '+50% радиус', '+2 ХП/тик'] },
          special: { name: 'ЛЕЧЕБНЫЙ ВЫСТРЕЛ', levels: ['Тратит патроны, лечит 3 ХП', 'Лечит 5 ХП', 'Останавливает кровь'] },
        },
      },
      ninja: {
        name: 'НИНДЗЯ',
        desc: 'Скорость и точность',
        abilities: {
          dash: { name: 'ТЕЛЕПОРТ', levels: ['Мгновенный телепорт 200px', '+50px дальность', 'Невидимость 1 сек'] },
          ult: { name: 'СЮРИКЕНЫ', levels: ['12 сюрикенов во все стороны', '+4 сюрикена', 'Сюрикены отравляют'] },
          special: { name: 'ДЫМ', levels: ['Дымовая завеса 2 сек', '+1 сек длительности', 'Враги теряют цель'] },
        },
      },
      heavy: {
        name: 'ГРОМИЛА',
        desc: 'Тяжёлая броня',
        abilities: {
          dash: { name: 'ТАРАН', levels: ['Рывок с отбрасыванием', '+10 урона', 'Сбивает врагов'] },
          ult: { name: 'ЩИТ', levels: ['Блок 100% урона 3 сек', '+2 сек длительности', 'Щит взрывается'] },
          special: { name: 'БРОНЕСТЕНА', levels: ['Блокирует врагов', '+50% прочности', 'Ставит 2 стены'] },
        },
      },
      pyro: {
        name: 'ПИРОМАНТ',
        desc: 'Огонь и хаос',
        abilities: {
          dash: { name: 'ОГНЕННЫЙ СЛЕД', levels: ['Оставляет огненный след', '+50% длительности', 'След взрывается'] },
          ult: { name: 'ОГНЕННАЯ БУРЯ', levels: ['Огонь 360° на 5 сек', '+50% радиус', 'Горение: 3 ур/тик'] },
          special: { name: 'ЗАЖИГАТЕЛЬНЫЙ', levels: ['Поджигает врага', 'Горит дольше', 'Перекидывается'] },
        },
      },
    },
    hud: {
      hp: 'HP',
      wave: 'Волна',
      score: 'СЧЁТ',
      level: 'УРОВЕНЬ',
      xp: 'ОПЫТ',
      coins: 'МОНЕТЫ',
      autoOn: 'АВТО: ВКЛ (Y)',
      damage: 'УРОН',
      fireRate: 'СКОРОСТЬ',
      magazine: 'МАГАЗИН',
      reload: 'ПЕРЕЗАРЯДКА',
      range: 'ДАЛЬНОСТЬ',
      bulletSpd: 'СКОРОСТЬ ПУЛИ',
      knockback: 'ОТБРОС',
      accuracy: 'ТОЧНОСТЬ',
      ult: 'УЛЬТА (Q)',
      ability: 'СПОСОБНОСТЬ (ПКМ):',
      ready: 'ГОТОВО',
      ammo: 'ПАТРОНЫ',
    },
    pause: {
      title: 'ПАУЗА',
      resume: 'ПРОДОЛЖИТЬ',
      mainMenu: 'ГЛАВНОЕ МЕНЮ',
    },
    death: {
      title: 'ПОРАЖЕНИЕ',
      time: 'ВРЕМЯ',
      score: 'СЧЁТ',
      coins: 'МОНЕТЫ',
      level: 'УРОВЕНЬ',
      wave: 'ВОЛНА',
      killed: 'УБИТО',
      damage: 'УРОН',
      restart: 'ЗАНОВО',
      mainMenu: 'ГЛАВНОЕ МЕНЮ',
    },
    stats: {
      title: 'СТАТИСТИКА',
      totalCoins: 'ВСЕГО МОНЕТ',
      bestScore: 'ЛУЧШИЙ СЧЁТ',
      bestLevel: 'ЛУЧШИЙ УРОВЕНЬ',
      bestTime: 'ЛУЧШЕЕ ВРЕМЯ',
      totalKills: 'ВСЕГО УБИТО',
      totalDamage: 'ВСЕГО УРОНА',
      runs: 'ЗАБЕГОВ',
    },
    settings: {
      title: 'НАСТРОЙКИ',
      sfx: 'ГРОМКОСТЬ ЗВУКОВ',
      music: 'ГРОМКОСТЬ МУЗЫКИ',
      language: 'ЯЗЫК',
    },
    shop: {
      title: 'МАГАЗИН',
      coins: 'МОНЕТЫ:',
      permaHp: 'МАКС ЗДОРОВЬЕ +5',
      permaDmg: 'УРОН +5%',
      permaSpd: 'СКОРОСТЬ +0.3',
      max: 'МАКС',
    },
    combat: {
      reloading: 'ПЕРЕЗАРЯДКА...',
      evolution: 'ЭВОЛЮЦИЯ: {name}',
      chosen: 'ВЫБРАНО',
      select: '[ВЫБРАТЬ]',
    },
    mutation: {
      dash: [
        { label: 'АДРЕНАЛИН', desc: '+50% скорость рывка' },
        { label: 'ТРАВМА', desc: 'Рывок наносит +10 урона' },
        { label: 'ВОССТАНОВЛЕНИЕ', desc: 'Рывок лечит 3 ХП' },
      ],
      ult: [
        { label: 'ЭНЕРГИЯ', desc: '+50% радиус' },
        { label: 'РАЗРУШЕНИЕ', desc: '+15 урона' },
        { label: 'ЗАМЕДЛЕНИЕ', desc: 'Замедляет врагов на 3 сек' },
      ],
      special: [
        { label: 'УСИЛЕНИЕ', desc: '+50% эффективность' },
        { label: 'ПЕРЕЗАРЯДКА', desc: '-30% перезарядка' },
        { label: 'ДВОЙНОЙ ЗАРЯД', desc: '2 заряда подряд' },
      ],
    },
    console: {
      unknownCmd: 'Неизвестная команда. Введите help',
      error: 'Ошибка',
      noEnemies: 'Нет врагов',
      godOn: 'Режим бога: ВКЛ',
      godOff: 'Режим бога: ВЫКЛ',
      allUnlocked: 'Все персонажи открыты',
      hpRestored: 'ХП восстановлено',
      enterNumber: 'Введите число',
      enterPosNumber: 'Введите число > 0',
      enterWave: 'Введите номер волны (>=1)',
    },
  },
};

let currentLang = 'en';

function getPath(obj, path) {
  const keys = path.split('.');
  let val = obj;
  for (const k of keys) {
    if (val == null) return undefined;
    val = val[k];
  }
  return val;
}

function t(path, vars) {
  const str = getPath(STRINGS[currentLang], path);
  if (str == null) return path;
  if (vars) {
    return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] !== undefined ? vars[k] : '{' + k + '}');
  }
  return str;
}

function getLangLabel(code) {
  return code === 'en' ? 'EN' : 'RU';
}

function applyLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const text = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  const langLabel = document.getElementById('lang-label');
  if (langLabel) langLabel.textContent = getLangLabel(currentLang);
  if (typeof updateUI === 'function' && gameActive) updateUI();
}
