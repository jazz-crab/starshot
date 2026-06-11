/**
 * UI.JS - Interface, mouse navigation, notifications
 */

// HUD element references
const scoreEl = document.getElementById("score"),
  levelEl = document.getElementById("level"),
  coinsEl = document.getElementById("coins");
const ammoEl = document.getElementById("ammo"),
  magEl = document.getElementById("mag-size"),
  reloadEl = document.getElementById("reloading-label");
const hpBar = document.getElementById("hp-bar-fill"),
  waveBar = document.getElementById("wave-bar-fill"),
  waveBarLabel = document.getElementById("wave-bar-label"),
  ultBar = document.getElementById("ult-bar-fill");

// Screens and overlays
const pauseScreen = document.getElementById("pause-screen"),
  upgradeMenu = document.getElementById("upgrade-menu"),
  startScreen = document.getElementById("start-screen"),
  deathScreen = document.getElementById("death-screen"),
  statsScreen = document.getElementById("stats-screen"),
  settingsScreen = document.getElementById("settings-screen"),
  permaShopScreen = document.getElementById("perma-shop-screen"),
  autoStatusEl = document.getElementById("auto-status"),
  resumeOverlay = document.getElementById("resume-overlay"),
  resumeCounterEl = document.getElementById("resume-counter");

// Stat text values
const hpVal = document.getElementById("hp-val"),
  hpMax = document.getElementById("hp-max"),
  xpVal = document.getElementById("xp-val");

// Weapon stat HUD fields
const hudDmg = document.getElementById("hud-dmg"),
  hudFire = document.getElementById("hud-firerate"),
  hudMag = document.getElementById("hud-mag"),
  hudReload = document.getElementById("hud-reload"),
  hudRange = document.getElementById("hud-range"),
  hudBSpeed = document.getElementById("hud-bspeed"),
  hudKB = document.getElementById("hud-kb"),
  hudSpread = document.getElementById("hud-spread");

function updateUI() {
  scoreEl.innerText = Math.floor(score);
  levelEl.innerText = player.level;
  if (coinsEl) coinsEl.innerText = Math.floor(coins);

  if (currentWep) {
    ammoEl.innerText = player.ammo;
    if (magEl) magEl.innerText = currentWep.magSize;
  }

  hpBar.style.width = (player.hp / player.maxHp) * 100 + "%";
  hpVal.innerText = Math.ceil(player.hp);
  hpMax.innerText = player.maxHp;

  // Wave bar
  if (waveBar) {
    if (waveActive || waveCleared) {
      const pct = waveEnemiesTotal > 0 ? (waveEnemiesKilled / waveEnemiesTotal) * 100 : 0;
      waveBar.style.width = pct + "%";
    } else {
      waveBar.style.width = "0%";
    }
    if (waveBarLabel)
      waveBarLabel.innerText = `Wave: ${currentWave}`;
  }
  // XP text at top
  if (xpVal)
    xpVal.innerText = Math.floor(player.xp) + " / " + player.nextLevelXp;

  if (ultBar) ultBar.style.width = (player.ult / player.maxUlt) * 100 + "%";

  const menuTitle = upgradeMenu.querySelector("h2");
  if (menuTitle) menuTitle.innerHTML = `WEAPON UPGRADE (${upgradePoints})`;

  if (currentWep) {
    hudDmg.innerText = currentWep.damage;
    hudFire.innerText = currentWep.fireRate + "ms";
    hudMag.innerText = currentWep.magSize;
    hudReload.innerText = (currentWep.reloadTime / 1000).toFixed(1) + "s";
    hudRange.innerText = currentWep.range;
    hudBSpeed.innerText = currentWep.bSpeed;
    hudKB.innerText = currentWep.knockback;
    hudSpread.innerText = (100 - currentWep.spread * 100).toFixed(0) + "%";
  }

  autoStatusEl.classList.toggle("hidden", !isAutoFire);

  if (player.hp / player.maxHp < 0.25)
    document.body.classList.add("low-hp-active");
  else document.body.classList.remove("low-hp-active");
}

function togglePauseGame() {
  if (
    !gameActive ||
    isCountingDown ||
    !upgradeMenu.classList.contains("hidden")
  )
    return;
  if (isPaused) {
    pauseScreen.classList.add("hidden");
    startWorldResumeTimer();
  } else {
    isPaused = true;
    pauseScreen.classList.remove("hidden");
  }
}

window.resumeGame = function () {
  if (!isPaused) return;
  pauseScreen.classList.add("hidden");
  startWorldResumeTimer();
};

window.pauseToMainMenu = function () {
  pauseScreen.classList.add("hidden");
  isPaused = false;
  goToMainMenu();
};

function startWorldResumeTimer() {
  isCountingDown = true;
  resumeOverlay.classList.remove("hidden");
  let count = 3;
  resumeCounterEl.innerText = count;

  const itv = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(itv);
      resumeOverlay.classList.add("hidden");
      isCountingDown = false;
      isPaused = false;
    } else {
      resumeCounterEl.innerText = count;
      if (typeof playSound === "function") {
        playSound(200, "sine", 0.1, 0.02);
      }
    }
  }, 500);
}

function wrapButton(btn, type) {
  if (btn.querySelector(".btn-fill")) return;
  const html = btn.innerHTML;
  btn.innerHTML = `
        <span class="btn-text-base">${html}</span>
        <div class="btn-fill ${type}-btn-fill">
            <span class="btn-text-overlay">${html}</span>
        </div>
    `;
  btn.onmouseenter = () => btn.classList.add("focused");
  btn.onmouseleave = () => btn.classList.remove("focused");
}

document.addEventListener("DOMContentLoaded", () => {
  startScreen.querySelectorAll("button").forEach((b) => wrapButton(b, "start"));
  const hints = document.querySelectorAll(".hint");
  hints.forEach((h) => {
    if (h.closest("#upgrade-menu")) h.classList.add("hidden");
  });
});

// ===== DEATH =====
window.showDeathScreen = function () {
  gameActive = false;
  isPaused = true;
  clearHeldKeys();
  waveActive = false;

  if (savedProgress) {
    savedProgress.coins = Math.floor(coins);
    const newBest = Math.floor(score) > savedProgress.bestScore;
    savedProgress.bestScore = Math.max(
      savedProgress.bestScore,
      Math.floor(score),
    );
    savedProgress.bestLevel = Math.max(
      savedProgress.bestLevel,
      player.level,
    );
    savedProgress.bestTime = Math.max(
      savedProgress.bestTime,
      gameTime,
    );
    savedProgress.totalKills += totalKills;
    savedProgress.totalDamage += Math.floor(totalDamageDealt);
    savedProgress.playsCount += 1;
    checkCharacterUnlocks(Math.floor(score));
    dbSave(savedProgress);
  }

  document.getElementById("ui").classList.add("hidden");
  deathScreen.classList.remove("hidden");

  const m = Math.floor(gameTime / 60),
    s = gameTime % 60;
  document.getElementById("stat-time").innerText =
    `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  document.getElementById("stat-score").innerText = Math.floor(score);
  document.getElementById("stat-coins").innerText = Math.floor(coins);
  document.getElementById("stat-level").innerText = player.level;
  document.getElementById("stat-kills").innerText = totalKills;
  document.getElementById("stat-damage").innerText = Math.floor(
    totalDamageDealt,
  );
  document.getElementById("stat-wave").innerText = currentWave;

  deathScreen.querySelectorAll("button").forEach((b) => wrapButton(b, "start"));
};

window.restartGame = function () {
  resetGameState();
  startFirstGame();
};

window.goToMainMenu = function () {
  resetGameState();
  deathScreen.classList.add("hidden");
  permaShopScreen.classList.add("hidden");
  const btns = document.getElementById("start-buttons");
  btns.className = "button-container";
  document.getElementById("start-title").innerText = "STARSHOT";
  btns.innerHTML = `
    <button onclick="startFirstGame()">START BATTLE</button>
    <button onclick="showPermaShop()">SHOP</button>
    <button onclick="showStatsScreen()">STATS</button>
    <button onclick="showSettingsScreen()">SETTINGS</button>
  `;
  startScreen.querySelectorAll("button").forEach((b) => wrapButton(b, "start"));
  startScreen.classList.remove("hidden");
  updateUI();
};

window.showStatsScreen = function () {
  startScreen.classList.add("hidden");
  if (savedProgress) {
    document.getElementById("stats-coins").innerText = Math.floor(savedProgress.coins);
    document.getElementById("stats-best-score").innerText = Math.floor(savedProgress.bestScore);
    document.getElementById("stats-best-level").innerText = savedProgress.bestLevel;
    const m = Math.floor(savedProgress.bestTime / 60),
      s = savedProgress.bestTime % 60;
    document.getElementById("stats-best-time").innerText =
      `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    document.getElementById("stats-total-kills").innerText = savedProgress.totalKills;
    document.getElementById("stats-total-damage").innerText = Math.floor(savedProgress.totalDamage);
    document.getElementById("stats-plays").innerText = savedProgress.playsCount;
  }
  statsScreen.classList.remove("hidden");
  statsScreen.querySelectorAll("button").forEach((b) => wrapButton(b, "start"));
};

window.closeStatsScreen = function () {
  statsScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
};

window.showSettingsScreen = function () {
  startScreen.classList.add("hidden");
  document.getElementById("sfx-vol-label").innerText = Math.round(sfxVolume * 100) + "%";
  document.getElementById("music-vol-label").innerText = Math.round(musicVolume * 100) + "%";
  settingsScreen.classList.remove("hidden");
  settingsScreen.querySelectorAll("button").forEach((b) => wrapButton(b, "start"));
};

window.closeSettingsScreen = function () {
  settingsScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
};

window.adjustSfxVolume = function (delta) {
  sfxVolume = Math.max(0, Math.min(1, +(sfxVolume + delta).toFixed(1)));
  document.getElementById("sfx-vol-label").innerText = Math.round(sfxVolume * 100) + "%";
  if (savedProgress) {
    savedProgress.settings.sfxVolume = sfxVolume;
    dbSave(savedProgress);
  }
};

window.adjustMusicVolume = function (delta) {
  musicVolume = Math.max(0, Math.min(1, +(musicVolume + delta).toFixed(1)));
  document.getElementById("music-vol-label").innerText = Math.round(musicVolume * 100) + "%";
  if (savedProgress) {
    savedProgress.settings.musicVolume = musicVolume;
    dbSave(savedProgress);
  }
};

// ===== PERMA SHOP =====
window.showPermaShop = function () {
  startScreen.classList.add("hidden");
  updatePermaShopButtons();
  permaShopScreen.classList.remove("hidden");
  permaShopScreen.querySelectorAll("button:not(.close-btn)").forEach((b) => wrapButton(b, "start"));
};

function updatePermaShopButtons() {
  for (const [key, item] of Object.entries(PERMA_SHOP_ITEMS)) {
    const btn = document.getElementById("pshop-" + key);
    if (!btn) continue;
    const level = permaUpgrades[key] || 0;
    const cost = Math.floor(item.baseCost * Math.pow(item.costMult, level));
    const maxed = level >= item.maxLevel;
    btn.disabled = maxed || coins < cost;
    btn.style.opacity = btn.disabled ? "0.4" : "1";
    let text;
    if (maxed) {
      text = `${item.label} — MAX`;
    } else {
      text = `${item.label} [${level}/${item.maxLevel}] (${cost}💰)`;
    }
    const textBase = btn.querySelector(".btn-text-base");
    const textOverlay = btn.querySelector(".btn-text-overlay");
    if (textBase && textOverlay) {
      textBase.innerText = text;
      textOverlay.innerText = text;
    } else {
      btn.innerText = text;
    }
  }
  document.getElementById("pshop-coins").innerText = Math.floor(coins);
}

window.buyPermaShopItem = function (key) {
  const item = PERMA_SHOP_ITEMS[key];
  if (!item) return;
  const level = permaUpgrades[key] || 0;
  if (level >= item.maxLevel) return;
  const cost = Math.floor(item.baseCost * Math.pow(item.costMult, level));
  if (coins < cost) {
    playSound(200, "square", 0.1, 0.05);
    return;
  }

  coins -= cost;
  permaUpgrades[key] = level + 1;

  if (savedProgress) {
    savedProgress.coins = Math.floor(coins);
    savedProgress.permaUpgrades = { ...permaUpgrades };
    dbSave(savedProgress);
  }

  playSound(600, "sine", 0.3, 0.05);
  updatePermaShopButtons();
};

window.closePermaShop = function () {
  permaShopScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
};

// ===== WAVE ANNOUNCE =====
let waveAnnounceTimer = null;

function showWaveAnnounce(waveNum) {
  if (waveAnnounceTimer) {
    clearTimeout(waveAnnounceTimer);
    waveAnnounceTimer = null;
  }
  const el = document.getElementById("wave-announce");
  const label = document.getElementById("wave-bar-label");

  // Build flip structure: old number flips out, new flips in
  const oldNum = label.innerText.replace("Wave: ", "");
  el.innerHTML = 'Wave: <span class="flip-wrap"><span class="flip-old">' + oldNum + '</span><span class="flip-new">' + waveNum + '</span></span>';

  label.style.opacity = "0";

  // Start from the bottom bar
  el.classList.remove("hidden");
  el.style.transition = "none";
  el.style.opacity = "0";
  el.style.bottom = "0";
  el.style.transform = "translateX(-50%) scale(1)";

  // Force reflow, then rise just above bar
  void el.offsetWidth;
  el.style.transition = "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)";
  el.style.opacity = "1";
  el.style.bottom = "50px";
  el.style.transform = "translateX(-50%) scale(2.5)";

  waveAnnounceTimer = setTimeout(() => {
    // Trigger the flip
    const oldEl = el.querySelector(".flip-old");
    const newEl = el.querySelector(".flip-new");
    if (oldEl) oldEl.classList.add("flip-out");
    if (newEl) newEl.classList.add("flip-in");

    setTimeout(() => {
      // Fall back to bottom bar
      el.style.transition = "all 0.3s ease-in";
      el.style.opacity = "0";
      el.style.bottom = "0";
      el.style.transform = "translateX(-50%) scale(1)";

      setTimeout(() => {
        el.classList.add("hidden");
        el.style.transition = "";
        el.innerHTML = "";
        label.innerText = "Wave: " + waveNum;
        label.style.opacity = "1";
        startWave();
      }, 300);
    }, 700);
  }, 400);
}

// ===== UPGRADE POINT ANIMATION =====
function showUpgradePointAnim() {
  const el = document.createElement("div");
  el.className = "upgrade-point-fly";
  el.innerText = "+1";
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

// ===== RESIZE =====
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (gameActive) updateUI();
}

window.addEventListener("resize", resize);
window.addEventListener("load", () => setTimeout(resize, 100));
