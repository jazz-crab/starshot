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
  playSound(400, "triangle", 0.05, 0.01, 0.1);

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

// ===== CHARACTER DASH (Space) =====
function useCharacterDash(dx, dy) {
  const level = characterAbilityLevels[currentCharacter]?.dash || 1;
  player.dashCooldown = 0;
  player.invulnerable = true;
  switch (currentCharacter) {
    case 'assault':
      player.vx = dx * player.maxSpeed * 8;
      player.vy = dy * player.maxSpeed * 8;
      player.isDashing = true;
      player.dashData = { damage: level >= 2 ? 5 : 0 };
      setTimeout(() => {
        player.isDashing = false;
        player.invulnerable = false;
        player.dashData = null;
      }, 160);
      break;
    case 'medic': {
      player.vx = dx * player.maxSpeed * 8;
      player.vy = dy * player.maxSpeed * 8;
      player.isDashing = true;
      const healAmt = level * 2;
      player.hp = Math.min(player.maxHp, player.hp + healAmt);
      damageTexts.push(new DamageText(player.worldX, player.worldY, "+" + healAmt, "#4caf50"));
      setTimeout(() => {
        player.isDashing = false;
        player.invulnerable = false;
      }, 160);
      break;
    }
    case 'ninja': {
      const dist = 150 + (level - 1) * 50;
      player.worldX += dx * dist;
      player.worldY += dy * dist;
      player.vx = 0;
      player.vy = 0;
      for (let i = 0; i < 15; i++)
        particles.push(new Particle(player.worldX, player.worldY, "#9c27b0"));
      player.isDashing = false;
      const invTime = level >= 3 ? 1000 : 160;
      setTimeout(() => { player.invulnerable = false; }, invTime);
      break;
    }
    case 'heavy':
      player.vx = dx * player.maxSpeed * 8;
      player.vy = dy * player.maxSpeed * 8;
      player.isDashing = true;
      player.dashData = { knockback: 20, damage: level >= 2 ? 10 : 0 };
      setTimeout(() => {
        player.isDashing = false;
        player.invulnerable = false;
        player.dashData = null;
      }, 160);
      break;
    case 'pyro':
      player.vx = dx * player.maxSpeed * 8;
      player.vy = dy * player.maxSpeed * 8;
      player.isDashing = true;
      player.dashData = { fireTrail: true };
      setTimeout(() => {
        player.isDashing = false;
        player.invulnerable = false;
        player.dashData = null;
      }, 160);
      break;
  }
  playSound(440, "triangle", 0.1, 0.05);
  updateUI();
}

// ===== CHARACTER ULT (Q) =====
function activateCharacterUlt() {
  const level = characterAbilityLevels[currentCharacter]?.ult || 1;
  player.ult = 0;
  switch (currentCharacter) {
    case 'assault':
      player.isUltActive = true;
      player.ammo = currentWep.magSize;
      player.ultTimer = 300;
      player.ultData = null;
      break;
    case 'medic':
      player.isUltActive = true;
      player.ultTimer = 300;
      player.ultData = { type: 'healAura', healPerTick: level * 2, radius: 150 + (level >= 2 ? 75 : 0), tickTimer: 0 };
      break;
    case 'ninja': {
      const count = 12 + (level >= 2 ? 4 : 0);
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 / count) * i;
        projectiles.push(new Projectile(player.worldX, player.worldY, a, 20, 8, 400, 5));
      }
      player.isUltActive = false;
      player.ultTimer = 30;
      player.ultData = { type: 'cooldown' };
      break;
    }
    case 'heavy':
      player.isUltActive = true;
      player.invulnerable = true;
      player.ultTimer = 180;
      player.ultData = { type: 'shield', explodeDamage: level >= 3 ? 30 : 0 };
      break;
    case 'pyro':
      player.isUltActive = true;
      player.ultTimer = 300;
      player.ultData = { type: 'fireStorm', damage: 3 * level, radius: 150 + (level >= 2 ? 75 : 0), tickTimer: 0 };
      break;
  }
  playSound(600, "sawtooth", 0.3, 0.05);
  updateUI();
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
// ===== FRAME UPDATE FOR ONGOING ABILITY EFFECTS =====
function updateCharacterAbilities() {
  // Dash damage / knockback
  if (player.isDashing && player.dashData) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const en = enemies[i];
      const dist = Math.hypot(player.worldX - en.worldX, player.worldY - en.worldY);
      if (dist < player.radius + en.radius + 10) {
        if (player.dashData.damage) {
          en.hp -= player.dashData.damage;
          damageTexts.push(new DamageText(en.worldX, en.worldY, "-" + player.dashData.damage, "#ff4444"));
          if (en.hp <= 0) { handleEnemyDeath(en, i); continue; }
        }
        if (player.dashData.knockback) {
          const a2 = Math.atan2(en.worldY - player.worldY, en.worldX - player.worldX);
          en.kbVX += Math.cos(a2) * player.dashData.knockback;
          en.kbVY += Math.sin(a2) * player.dashData.knockback;
        }
      }
    }
    // Fire trail during pyro dash
    if (currentCharacter === 'pyro') {
      fireTrails.push(new FireTrail(player.worldX, player.worldY));
    }
  }

  // Ult ongoing effects
  if (player.ultData) {
    switch (player.ultData.type) {
      case 'healAura':
        player.ultData.tickTimer++;
        if (player.ultData.tickTimer >= 30) {
          player.ultData.tickTimer = 0;
          const h = player.ultData.healPerTick;
          player.hp = Math.min(player.maxHp, player.hp + h);
          for (let i = 0; i < 3; i++)
            particles.push(new Particle(player.worldX + (Math.random() - 0.5) * 60, player.worldY + (Math.random() - 0.5) * 60, "#4caf50"));
        }
        break;
      case 'fireStorm':
        player.ultData.tickTimer++;
        if (player.ultData.tickTimer >= 15) {
          player.ultData.tickTimer = 0;
          const r = player.ultData.radius;
          const d = player.ultData.damage;
          for (let i = enemies.length - 1; i >= 0; i--) {
            const en = enemies[i];
            if (Math.hypot(player.worldX - en.worldX, player.worldY - en.worldY) < r) {
              en.hp -= d;
              damageTexts.push(new DamageText(en.worldX, en.worldY, "-" + d, "#ff5722"));
              if (en.hp <= 0) { handleEnemyDeath(en, i); continue; }
              for (let k = 0; k < 2; k++) particles.push(new Particle(en.worldX, en.worldY, "#ff5722"));
            }
          }
          for (let k = 0; k < 12; k++) {
            const a = (Math.PI * 2 / 12) * k;
            particles.push(new Particle(player.worldX + Math.cos(a) * r, player.worldY + Math.sin(a) * r, "#ff5722"));
          }
        }
        break;
      case 'shield':
        if (Math.random() < 0.15) {
          const a = Math.random() * Math.PI * 2;
          particles.push(new Particle(player.worldX + Math.cos(a) * (player.radius + 15), player.worldY + Math.sin(a) * (player.radius + 15), "#ff6f00"));
        }
        break;
    }
  }

  // Burning DOT
  for (let i = enemies.length - 1; i >= 0; i--) {
    const en = enemies[i];
    if (en.burning) {
      en.burning.timer--;
      en.burning.tickCounter++;
      if (en.burning.tickCounter >= 30) {
        en.burning.tickCounter = 0;
        en.hp -= en.burning.damage;
        damageTexts.push(new DamageText(en.worldX, en.worldY, "-" + en.burning.damage, "#ff5722"));
        particles.push(new Particle(en.worldX, en.worldY, "#ff5722"));
        if (en.hp <= 0) { handleEnemyDeath(en, i); continue; }
      }
      if (en.burning.timer <= 0) {
        delete en.burning;
      }
    }
  }
}

// ===== SPECIAL ABILITY (RMB) =====
function useCharacterSpecial() {
  if (player.specialCooldown > 0) return;
  const level = characterAbilityLevels[currentCharacter]?.special || 1;
  const pSX = player.worldX - camera.offsetX,
    pSY = player.worldY - camera.offsetY;
  const mouseAngle = Math.atan2(mousePos.y - pSY, mousePos.x - pSX);
  switch (currentCharacter) {
    case 'assault':
      grenades.push(new Grenade(player.worldX, player.worldY, mouseAngle));
      break;
    case 'medic':
      if (player.ammo <= 0) return;
      player.ammo--;
      {
        const heal = level * 3;
        player.hp = Math.min(player.maxHp, player.hp + heal);
        damageTexts.push(new DamageText(player.worldX, player.worldY, "+" + heal, "#4caf50"));
      }
      break;
    case 'ninja':
      smokeClouds.push(new SmokeCloud(player.worldX, player.worldY));
      for (let i = 0; i < 20; i++)
        particles.push(new Particle(player.worldX, player.worldY, "#9c27b0"));
      break;
    case 'heavy': {
      const wDist = 60;
      obstacles.push({
        worldX: player.worldX + Math.cos(mouseAngle) * wDist,
        worldY: player.worldY + Math.sin(mouseAngle) * wDist,
        radius: 20,
        hp: 50 + (level - 1) * 25,
        maxHp: 50 + (level - 1) * 25,
        color: "#ff6f00",
      });
      break;
    }
    case 'pyro':
      player.nextShotIgnites = { duration: 180, dmg: level * 1 };
      break;
  }
  player.specialCooldown = player.maxSpecialCooldown;
  playSound(300, "sine", 0.1, 0.05);
}
