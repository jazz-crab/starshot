/**
 * STATE.JS - Global game state
 */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let coins = 0;
let isPaused = true;
let isCountingDown = false;
let gameActive = false;
let screenFlash = 0;
let shakeIntensity = 0;
let gameTime = 0;
let difficultyLevel = 1;
let lastDifficultyUpdate = 0;

const keys = {};
let isMouseDown = false;
let isAutoFire = false;
let mousePos = { x: 0, y: 0 };

// Object arrays
const projectiles = [];
const enemies = [];
const particles = [];
const obstacles = [];
const grenades = [];
const expOrbs = [];
const coinOrbs = [];
const healthPacks = [];
const damageTexts = [];

// Camera
const camera = {
  x: 0,
  y: 0,
  lerp: 0.08,
  deadzoneX: 50,
  deadzoneY: 40,
  offsetX: 0,
  offsetY: 0,
};

let currentWep = null;
let killsSinceLastHealthPack = 0;
let bonusHealthPackChance = 0;
let upgradePoints = 0;
let totalKills = 0;
let totalDamageDealt = 0;

let sfxVolume = 1;
let musicVolume = 0.5;

// ===== WAVES =====
let currentWave = 1;
let waveActive = false;
let waveCleared = false;
let waveEnemiesTotal = 0;
let waveEnemiesSpawned = 0;
let waveEnemiesKilled = 0;
let waveSpawnTimer = 0;
let isBossWave = false;

// ===== CHARACTER =====
let currentCharacter = "assault";
let characterAbilityLevels = { assault: { dash: 1, ult: 1, special: 1 } };
let abilityMutations = {};
let charUnlocked = { assault: true };

// ===== PERMA SHOP =====
let armor = 0;
let tempDmgBoost = 1;

let isGodMode = false;
let dbReady = false;
let permaUpgrades = { permaHp: 0, permaDmg: 0, permaSpd: 0 };

function resetGameState() {
  projectiles.length = 0;
  enemies.length = 0;
  particles.length = 0;
  obstacles.length = 0;
  grenades.length = 0;
  expOrbs.length = 0;
  coinOrbs.length = 0;
  healthPacks.length = 0;
  damageTexts.length = 0;

  player.worldX = 0;
  player.worldY = 0;
  player.hp = player.maxHp;
  player.level = 1;
  player.xp = 0;
  player.nextLevelXp = 100;
  player.ult = 0;
  player.isUltActive = false;
  player.ammo = 0;
  player.isReloading = false;
  player.lastShot = 0;
  player.invulnerable = false;
  player.dashCooldown = player.dashMaxCooldown;
  player.isDashing = false;
  player.vx = 0;
  player.vy = 0;
  player.kbX = 0;
  player.kbY = 0;
  player.grenadeCooldown = 0;

  currentWep = null;
  score = 0;
  gameTime = 0;
  difficultyLevel = 1;
  upgradePoints = 0;
  totalKills = 0;
  totalDamageDealt = 0;
  killsSinceLastHealthPack = 0;
  screenFlash = 0;
  shakeIntensity = 0;
  isPaused = true;
  isCountingDown = false;
  gameActive = false;
  isMouseDown = false;
  isAutoFire = false;

  currentWave = 1;
  waveActive = false;
  waveCleared = false;
  waveEnemiesTotal = 0;
  waveEnemiesSpawned = 0;
  waveEnemiesKilled = 0;
  waveSpawnTimer = 0;
  isBossWave = false;

  armor = 0;
  tempDmgBoost = 1;
  isGodMode = false;

  currentCharacter = "assault";
  characterAbilityLevels = { assault: { dash: 1, ult: 1, special: 1 } };
  abilityMutations = {};

  camera.x = 0;
  camera.y = 0;
  camera.offsetX = 0;
  camera.offsetY = 0;

  if (savedProgress) {
    coins = savedProgress.coins;
    if (savedProgress.permaUpgrades) {
      permaUpgrades = { ...permaUpgrades, ...savedProgress.permaUpgrades };
    }
    if (savedProgress.charUnlocked) {
      charUnlocked = { ...savedProgress.charUnlocked };
    }
  } else coins = 0;
}

// Applies permanent upgrades to the character
function applyPermaUpgrades() {
  const hpBonus = (permaUpgrades.permaHp || 0) * 5;
  player.maxHp = 10 + hpBonus;
  const spdBonus = (permaUpgrades.permaSpd || 0) * 0.3;
  player.maxSpeed = 5 + spdBonus;
}

// Checks and unlocks new characters based on high score
function checkCharacterUnlocks(scoreVal) {
  let newUnlock = false;
  for (const key of Object.keys(CHARACTERS)) {
    if (!charUnlocked[key] && scoreVal >= CHARACTERS[key].unlockScore) {
      charUnlocked[key] = true;
      newUnlock = true;
    }
  }
  if (newUnlock && savedProgress) {
    savedProgress.charUnlocked = { ...charUnlocked };
  }
  return newUnlock;
}
