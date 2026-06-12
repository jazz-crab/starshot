/**
 * CONFIG.JS - Constants and balance settings
 */

// ===== WEAPONS =====
const WEAPONS = {
  wasp: {
    name: "WASP",
    magSize: 30,
    recoil: 0.4,
    reloadTime: 1000,
    fireRate: 80,
    spread: 0.2,
    pellets: 1,
    bSpeed: 18,
    damage: 4,
    range: 600,
    shake: 3,
    bulletRadius: 4,
    knockback: 2,
  },
  pulsar: {
    name: "PULSAR",
    magSize: 7,
    recoil: 4.0,
    reloadTime: 1200,
    fireRate: 500,
    spread: 0.02,
    pellets: 1,
    bSpeed: 30,
    damage: 25,
    range: 900,
    shake: 10,
    bulletRadius: 8,
    knockback: 30,
  },
  grizzly: {
    name: "GRIZZLY",
    magSize: 2,
    recoil: 7.0,
    reloadTime: 1400,
    fireRate: 700,
    spread: 0.5,
    pellets: 8,
    bSpeed: 14,
    damage: 5,
    range: 350,
    shake: 12,
    bulletRadius: 4,
    knockback: 15,
  },
};

// ===== ENEMIES =====
const ENEMY_TYPES = [
  {
    type: "fast",
    radius: 12,
    color: "#ff5252",
    hp: 5,
    speed: 3.8,
    score: 100,
    damage: 1,
    xp: 20,
  },
  {
    type: "normal",
    radius: 20,
    color: "#ff1744",
    hp: 15,
    speed: 2.2,
    score: 300,
    damage: 3,
    xp: 50,
  },
  {
    type: "tank",
    radius: 35,
    color: "#b71c1c",
    hp: 35,
    speed: 1.2,
    score: 1000,
    damage: 8,
    xp: 150,
  },
];

// ===== WAVES =====
const WAVE_CONFIG = {
  baseEnemies: 4,      // wave 1: 4 + 1*2 = 6 enemies
  enemiesPerWave: 2,   // +2 per wave
  spawnIntervalBase: 1200, // ms between spawns on wave 1
  spawnIntervalDec: 50,    // -50ms per wave
  spawnIntervalMin: 300,
  hpScale: 0.03,       // +3% HP per wave
  bossWaveInterval: 10,
};

// ===== BOSS =====
const BOSS_BASE = {
  radius: 50,
  color: "#ff0000",
  hpMult: 30,    // boss HP = 30 * wave
  damageMult: 5, // boss damage = 5 * (1 + wave * 0.1)
  speed: 0.8,
  scoreMult: 500,
  coinDrop: 30,  // base coins: 30 + wave * 2
  xp: 500,
};

// ===== PERMA SHOP =====
const PERMA_SHOP_ITEMS = {
  permaHp:  { label: "MAX HP +5",   baseCost: 50, costMult: 2.0, maxLevel: 5 },
  permaDmg: { label: "DAMAGE +5%",  baseCost: 75, costMult: 2.0, maxLevel: 5 },
  permaSpd: { label: "SPEED +0.3",  baseCost: 50, costMult: 2.0, maxLevel: 3 },
};

// ===== CHARACTERS =====
const CHARACTERS = {
  assault: {
    name: "ASSAULT",
    desc: "Balanced fighter",
    unlockScore: 0,
    color: "#00e5ff",
    abilities: {
      dash: { name: "DASH", maxLevel: 3, levels: [
        "Speed + invulnerability",
        "+5 damage on path",
        "+50% range",
      ]},
      ult: { name: "SHOCKWAVE", maxLevel: 3, levels: [
        "Ammo + spread for 5 sec",
        "+50% duration",
        "Damage 10 enemies",
      ]},
      special: { name: "GRENADE", maxLevel: 3, levels: [
        "Frag grenade",
        "+2 fragments",
        "+50% blast radius",
      ]},
    },
  },
  medic: {
    name: "MEDIC",
    desc: "Field medic",
    unlockScore: 1500,
    color: "#4caf50",
    abilities: {
      dash: { name: "DASH", maxLevel: 3, levels: [
        "Speed + invulnerability",
        "Heals 2 HP on path",
        "+3 HP heal",
      ]},
      ult: { name: "AURA", maxLevel: 3, levels: [
        "Healing aura 5 sec",
        "+50% radius",
        "+2 HP/tick",
      ]},
      special: { name: "HEAL SHOT", maxLevel: 3, levels: [
        "Uses ammo, heals 3 HP",
        "Heals 5 HP",
        "Cures bleeding",
      ]},
    },
  },
  ninja: {
    name: "NINJA",
    desc: "Speed & precision",
    unlockScore: 3000,
    color: "#9c27b0",
    abilities: {
      dash: { name: "TELEPORT", maxLevel: 3, levels: [
        "Instant teleport 200px",
        "+50px range",
        "Invisible 1 sec after",
      ]},
      ult: { name: "SHURIKENS", maxLevel: 3, levels: [
        "12 shurikens in all directions",
        "+4 shurikens",
        "Shurikens poison",
      ]},
      special: { name: "SMOKE", maxLevel: 3, levels: [
        "Smoke screen 2 sec",
        "+1 sec duration",
        "Enemies lose target",
      ]},
    },
  },
  heavy: {
    name: "HEAVY",
    desc: "Heavy armor",
    unlockScore: 5000,
    color: "#ff6f00",
    abilities: {
      dash: { name: "RAM", maxLevel: 3, levels: [
        "Charge with knockback",
        "+10 damage",
        "Knocks enemies down",
      ]},
      ult: { name: "SHIELD", maxLevel: 3, levels: [
        "100% damage block 3 sec",
        "+2 sec duration",
        "Shield explodes",
      ]},
      special: { name: "ARMOR WALL", maxLevel: 3, levels: [
        "Blocks enemies",
        "+50% durability",
        "Places 2 walls",
      ]},
    },
  },
  pyro: {
    name: "PYRO",
    desc: "Fire & chaos",
    unlockScore: 8000,
    color: "#ff5722",
    abilities: {
      dash: { name: "FIRE TRAIL", maxLevel: 3, levels: [
        "Leaves fire trail",
        "+50% duration",
        "Trail explodes",
      ]},
      ult: { name: "FIRE STORM", maxLevel: 3, levels: [
        "360° fire for 5 sec",
        "+50% radius",
        "Burn: 3 dmg/tick",
      ]},
      special: { name: "IGNITE ROUND", maxLevel: 3, levels: [
        "Sets enemy on fire",
        "Burns longer",
        "Spreads to neighbors",
      ]},
    },
  },
};

// ===== MUTATIONS (for boss evolution) =====
const MUTATIONS = {
  dash: [
    { label: "ADRENALINE", desc: "+50% dash speed" },
    { label: "TRAUMA", desc: "Dash deals +10 damage" },
    { label: "RECOVERY", desc: "Dash heals 3 HP" },
  ],
  ult: [
    { label: "ENERGY", desc: "+50% radius" },
    { label: "DESTRUCTION", desc: "+15 damage" },
    { label: "SLOW", desc: "Slows enemies for 3 sec" },
  ],
  special: [
    { label: "POWER UP", desc: "+50% efficiency" },
    { label: "COOLDOWN", desc: "-30% cooldown" },
    { label: "DOUBLE CHARGE", desc: "2 charges in a row" },
  ],
};
