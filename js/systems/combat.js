/**
 * COMBAT.JS - Combat logic
 */

function tryShoot() {
  const now = Date.now();
  if (!player.isUltActive) {
    if (
      player.isReloading ||
      now - player.lastShot < currentWep.fireRate ||
      isPaused
    )
      return;
    if (player.ammo <= 0) {
      startReload();
      return;
    }
    player.ammo--;
  } else {
    if (now - player.lastShot < currentWep.fireRate * 0.7) return;
  }

  player.lastShot = now;
  screenFlash = Math.min(screenFlash + 0.08, 0.25);
  shakeIntensity += currentWep.shake;
  playSound(400, "triangle", 0.05);

  let targetAngle;
  const pSY = player.worldY - camera.offsetY;
  const pSX = player.worldX - camera.offsetX;

  if (isAutoFire) {
    const target = getNearestEnemy();
    targetAngle = target
      ? Math.atan2(target.worldY - player.worldY, target.worldX - player.worldX)
      : Math.atan2(mousePos.y - pSY, mousePos.x - pSX);
  } else {
    targetAngle = Math.atan2(mousePos.y - pSY, mousePos.x - pSX);
  }

  player.kbX -= Math.cos(targetAngle) * (currentWep.recoil || 0);
  player.kbY -= Math.sin(targetAngle) * (currentWep.recoil || 0);

  createProjectiles(0, targetAngle);
  if (player.isUltActive) {
    createProjectiles(Math.PI / 12, targetAngle);
    createProjectiles(-Math.PI / 12, targetAngle);
  }
  updateUI();
}

function startReload() {
  if (!currentWep) return;
  if (
    player.isReloading ||
    player.ammo === currentWep.magSize ||
    player.isUltActive
  )
    return;

  player.isReloading = true;
  if (reloadEl) reloadEl.textContent = t('combat.reloading');

  const rTime = currentWep.reloadTime || 1000;

  setTimeout(() => {
    player.ammo = currentWep.magSize;
    player.isReloading = false;
    if (reloadEl) reloadEl.innerText = "";
    updateUI();
  }, rTime);
}

function createProjectiles(offset, baseAngle) {
  const dmgMult = tempDmgBoost * (1 + (permaUpgrades.permaDmg || 0) * 0.05);
  const angle = baseAngle + offset;
  for (let i = 0; i < currentWep.pellets; i++) {
    const a = angle + (Math.random() - 0.5) * currentWep.spread;
    let s =
      currentWep.bSpeed *
      (currentWep.key === 'grizzly' ? 0.7 + Math.random() * 0.6 : 1);
    projectiles.push(
      new Projectile(
        player.worldX,
        player.worldY,
        a,
        s,
        Math.round(currentWep.damage * dmgMult),
        currentWep.range,
        currentWep.knockback,
      ),
    );
  }
}

function getNearestEnemy() {
  if (enemies.length === 0) return null;
  let minD = Infinity,
    nearest = null;
  enemies.forEach((en) => {
    let d = Math.hypot(player.worldX - en.worldX, player.worldY - en.worldY);
    if (d < minD) {
      minD = d;
      nearest = en;
    }
  });
  return nearest;
}

function activateUlt() {
  player.isUltActive = true;
  player.ammo = currentWep.magSize;
  playSound(600, "sawtooth", 0.3, 0.05);
}

// ===== AUTO UPGRADE ON LEVEL UP =====
function applyAutoUpgrade() {
  if (!currentWep) return;
  const mult = 1.05;
  const slowMult = 1.01;
  player.maxHp = Math.ceil(player.maxHp * 1.1);
  currentWep.damage = Math.ceil(currentWep.damage * mult);
  currentWep.magSize = Math.ceil(currentWep.magSize * mult);
  currentWep.range += Math.ceil(currentWep.range * 0.05);
  currentWep.bSpeed = Math.ceil(currentWep.bSpeed * slowMult);
  currentWep.knockback = Math.ceil(currentWep.knockback * slowMult);
  currentWep.fireRate = Math.max(50, Math.floor(currentWep.fireRate / mult));
  currentWep.reloadTime = Math.max(200, Math.floor(currentWep.reloadTime / mult));
  currentWep.spread = Math.max(0.01, currentWep.spread * 0.95);
}

// ===== XP / LEVEL UP =====
function gainXp(amount) {
  player.xp += amount;
  if (player.xp >= player.nextLevelXp) {
    player.level++;
    player.xp = 0;
    player.nextLevelXp += 100;
    applyAutoUpgrade();
    playSound(500, "sine", 0.3, 0.05);
  }
  updateUI();
}

// ===== CHARACTER EVOLUTION (after boss) =====
function showEvolutionTree() {
  const ch = CHARACTERS[currentCharacter];
  startScreen.classList.remove("hidden");
  document.getElementById("start-title").textContent =
    t('combat.evolution', { name: t('char.' + currentCharacter + '.name') });

  const btns = document.getElementById("start-buttons");
  btns.className = "evo-tree";
  const muts = abilityMutations[currentCharacter] || {};

  btns.innerHTML = ["dash", "ult", "special"].map((abKey) => {
    const abName = t('char.' + currentCharacter + '.abilities.' + abKey + '.name');
    const opts = MUTATIONS[abKey].map((m, i) => {
      const already = muts[abKey] !== undefined && muts[abKey] === i;
      const mLang = STRINGS[currentLang].mutation[abKey][i];
      return `<div class="evo-card ${already ? "evo-chosen" : ""}" onclick="${already ? '' : "pickEvolution('" + abKey + "', " + i + ")"}">
        <div class="evo-card-title">${mLang.label}</div>
        <div class="evo-card-desc">${mLang.desc}</div>
        <div class="evo-card-action">${already ? t('combat.chosen') : t('combat.select')}</div>
      </div>`;
    }).join("");
    return `<div class="evo-column">
      <div class="evo-ability-header">${abName}</div>
      ${opts}
    </div>`;
  }).join("");

  startScreen.querySelectorAll(".evo-card:not(.evo-chosen)").forEach((c) => {
    c.classList.add("focused");
  });
}

window.pickEvolution = function (abilityKey, mutIdx) {
  abilityMutations[currentCharacter] = abilityMutations[currentCharacter] || {};
  abilityMutations[currentCharacter][abilityKey] = mutIdx;
  startScreen.classList.add("hidden");
  document.getElementById("start-buttons").className = "button-container";
  isPaused = false;
  clearHeldKeys();
  updateUI();
  showWaveAnnounce(currentWave + 1);
};

// ===== SPECIAL ABILITY (RMB) =====
function useCharacterSpecial() {
  if (player.grenadeCooldown > 0) return;
  const pSX = player.worldX - camera.offsetX,
    pSY = player.worldY - camera.offsetY;
  const mouseAngle = Math.atan2(mousePos.y - pSY, mousePos.x - pSX);
  if (currentCharacter === "assault") {
    grenades.push(new Grenade(player.worldX, player.worldY, mouseAngle));
  }
  player.grenadeCooldown = player.maxGrenadeCooldown;
  playSound(300, "sine", 0.1, 0.05);
}
