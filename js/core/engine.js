/**
 * ENGINE.JS - Main game loop
 */
let lastTime = performance.now();
let dashTrailTick = 0;
let gameLoopInterval = null;
let fpsFrames = 0;
let fpsLastTime = performance.now();
let currentFps = 0;

function animate(now) {
  const dt = now - lastTime;
  lastTime = now;
  fpsFrames++;
  if (now - fpsLastTime >= 1000) {
    currentFps = fpsFrames;
    fpsFrames = 0;
    fpsLastTime = now;
  }
  requestAnimationFrame(animate);

  if (!isPaused && gameActive && !isCountingDown && !isConsoleOpen) {
    handleInputs();
    updateCamera();
    updateChunks();

    if (player.isDashing) {
      dashTrailTick++;
      if (dashTrailTick % 2 === 0) {
        particles.push(new AfterImage(player.worldX, player.worldY, player.radius));
      }
    } else {
      dashTrailTick = 0;
    }

    if (isMouseDown || player.isUltActive || (isAutoFire && getNearestEnemy()))
      tryShoot();
    if (player.ammo === 0 && !player.isReloading && !player.isUltActive)
      startReload();

    if (player.isUltActive || player.ultData) {
      player.ultTimer--;
      if (player.ultTimer <= 0) {
        player.isUltActive = false;
        if (player.ultData?.type === 'shield') {
          player.invulnerable = false;
          if (player.ultData.explodeDamage > 0) {
            for (let i = enemies.length - 1; i >= 0; i--) {
              const en = enemies[i];
              if (Math.hypot(player.worldX - en.worldX, player.worldY - en.worldY) < 150) {
                en.hp -= player.ultData.explodeDamage;
                if (en.hp <= 0) handleEnemyDeath(en, i);
              }
            }
          }
        }
        player.ultData = null;
      }
    }
    if (player.dashCooldown < player.dashMaxCooldown)
      player.dashCooldown += 1.2;
    if (player.specialCooldown > 0) player.specialCooldown--;

    shakeIntensity *= 0.88;

    // Update objects
    projectiles.forEach((p, i) => {
      p.update();
      if (p.dead) projectiles.splice(i, 1);
    });
    grenades.forEach((g, i) => {
      g.update();
      if (g.dead) grenades.splice(i, 1);
    });
    fireTrails.forEach((ft, i) => {
      ft.update();
      if (ft.dead) fireTrails.splice(i, 1);
    });
    smokeClouds.forEach((sc, i) => {
      sc.update();
      if (sc.dead) smokeClouds.splice(i, 1);
    });
    particles.forEach((p, i) => {
      p.update();
      if (p.alpha <= 0) particles.splice(i, 1);
    });
    expOrbs.forEach((orb, i) => {
      orb.update();
      if (orb.dead) expOrbs.splice(i, 1);
    });
    coinOrbs.forEach((coin, i) => {
      coin.update();
      if (coin.dead) coinOrbs.splice(i, 1);
    });
    damageTexts.forEach((dt_item, i) => {
      dt_item.update();
      if (dt_item.alpha <= 0) damageTexts.splice(i, 1);
    });

    updateEnemiesLogic();
    updateCharacterAbilities();
    updateWaveSpawn();
    updateUI();
  } else {
    updateConfirmLogic(dt);
  }
  drawGame();
}

// ===== WAVE SPAWN =====
function updateWaveSpawn() {
  if (!waveActive || isBossWave) return;
  if (waveEnemiesSpawned >= waveEnemiesTotal) return;

  const interval = Math.max(
    WAVE_CONFIG.spawnIntervalMin,
    WAVE_CONFIG.spawnIntervalBase - currentWave * WAVE_CONFIG.spawnIntervalDec,
  );

  waveSpawnTimer += 16; // ~1 frame at 60fps
  if (waveSpawnTimer >= interval) {
    waveSpawnTimer = 0;
    if (waveEnemiesSpawned < waveEnemiesTotal) {
      spawnEnemy();
      waveEnemiesSpawned++;
    }
  }
}

// ===== ENEMY LOGIC =====
function updateEnemiesLogic() {
  steeringRays = [];
  enemies.forEach((en, i) => {
    if (en instanceof Boss) {
      en.update();
      if (obstacles.length > 0) {
        const oc = checkCircleObstacleCollision(en.worldX, en.worldY, en.radius);
        const pushX = oc.x - en.worldX;
        const pushY = oc.y - en.worldY;
        en.worldX = oc.x;
        en.worldY = oc.y;
        en.kbVX += pushX * 0.5;
        en.kbVY += pushY * 0.5;
      }
      const margin = 150;
      const halfW = canvas.width / 2;
      const halfH = canvas.height / 2;
      const bdx = en.worldX - camera.x;
      const bdy = en.worldY - camera.y;
      if (Math.abs(bdx) > halfW + margin || Math.abs(bdy) > halfH + margin) {
        const a = Math.atan2(player.worldY - en.worldY, player.worldX - en.worldX);
        en.worldX += Math.cos(a) * en.speed * 3;
        en.worldY += Math.sin(a) * en.speed * 3;
        if (obstacles.length > 0) {
          const oc2 = checkCircleObstacleCollision(en.worldX, en.worldY, en.radius);
          en.worldX = oc2.x;
          en.worldY = oc2.y;
        }
      }
    } else {
      en.worldX += en.kbVX;
      en.worldY += en.kbVY;
      en.kbVX *= 0.9;
      en.kbVY *= 0.9;
      // Smoke cloud stealth — enemies can't see player
      let canSeePlayer = true;
      for (const sc of smokeClouds) {
        if (Math.hypot(player.worldX - sc.worldX, player.worldY - sc.worldY) < sc.radius) {
          canSeePlayer = false;
          break;
        }
      }
      let moveAngle;
      if (canSeePlayer) {
        moveAngle = getSteeringDirection(en, obstacles, enemies);
      } else {
        moveAngle = Math.atan2(en.kbVY || 1, en.kbVX || 1);
      }
      if (Date.now() - en.lastAttack > 600) {
        en.worldX += Math.cos(moveAngle) * en.speed;
        en.worldY += Math.sin(moveAngle) * en.speed;
      }
      // Obstacle collision
      if (obstacles.length > 0) {
        const oc = checkCircleObstacleCollision(en.worldX, en.worldY, en.radius);
        const pushX = oc.x - en.worldX;
        const pushY = oc.y - en.worldY;
        en.worldX = oc.x;
        en.worldY = oc.y;
        en.kbVX += pushX * 0.5;
        en.kbVY += pushY * 0.5;
      }
      // Off-screen nudge: pull far enemies back toward player
      const margin = 150;
      const halfW = canvas.width / 2;
      const halfH = canvas.height / 2;
      const dx = en.worldX - camera.x;
      const dy = en.worldY - camera.y;
      if (Math.abs(dx) > halfW + margin || Math.abs(dy) > halfH + margin) {
        const a = Math.atan2(player.worldY - en.worldY, player.worldX - en.worldX);
        en.worldX += Math.cos(a) * en.speed * 3;
        en.worldY += Math.sin(a) * en.speed * 3;
        if (obstacles.length > 0) {
          const oc2 = checkCircleObstacleCollision(en.worldX, en.worldY, en.radius);
          en.worldX = oc2.x;
          en.worldY = oc2.y;
        }
      }
    }

    const isBoss = en instanceof Boss;
    const dist = Math.hypot(player.worldX - en.worldX, player.worldY - en.worldY);
    if (
      dist < en.radius + player.radius &&
      !player.invulnerable &&
      !isGodMode
    ) {
      let dmg = en.damage;
      if (armor > 0) {
        armor--;
        dmg = Math.ceil(dmg * 0.5);
        updateUI();
      }
      damageTexts.push(
        new DamageText(
          player.worldX,
          player.worldY,
          "-" + dmg,
          "#ff0000",
        ),
      );
      player.hp -= dmg;
      const pushAngle = Math.atan2(player.worldY - en.worldY, player.worldX - en.worldX);
      player.kbX = Math.cos(pushAngle) * (isBoss ? 25 : 12);
      player.kbY = Math.sin(pushAngle) * (isBoss ? 25 : 12);
      player.invulnerable = true;
      setTimeout(() => (player.invulnerable = false), 400);
      en.lastAttack = Date.now();
      if (player.hp <= 0) showDeathScreen();
    }
  });

  // Separation
  for (let i = 0; i < enemies.length; i++) {
    for (let j = i + 1; j < enemies.length; j++) {
      const a = enemies[i], b = enemies[j];
      const dx = b.worldX - a.worldX;
      const dy = b.worldY - a.worldY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const overlap = a.radius + b.radius - dist;
      if (overlap > 0 && dist > 0) {
        const pushX = (dx / dist) * overlap * 0.5;
        const pushY = (dy / dist) * overlap * 0.5;
        a.worldX -= pushX;
        a.worldY -= pushY;
        b.worldX += pushX;
        b.worldY += pushY;
      }
    }
  }

  // Health packs
  healthPacks.forEach((hp, i) => {
    if (
      Math.hypot(player.worldX - hp.worldX, player.worldY - hp.worldY) <
      player.radius + hp.radius
    ) {
      player.hp = Math.min(
        player.maxHp,
        player.hp + player.maxHp * hp.healPercent,
      );
      playSound(800, "sine", 0.2, 0.05);
      healthPacks.splice(i, 1);
      updateUI();
    }
  });
}

// ===== GAME TIMER (compatibility) =====
setInterval(() => {
  if (!isPaused && gameActive && !isCountingDown && !isConsoleOpen) {
    gameTime++;
    if (gameTime % 30 === 0) {
      // Auto-save coins every 30 sec
      if (savedProgress) {
        savedProgress.coins = Math.floor(coins);
        dbSave(savedProgress);
      }
    }
    const m = Math.floor(gameTime / 60),
      s = gameTime % 60;
    const tEl = document.getElementById("timer-container");
    if (tEl)
      tEl.innerText = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
}, 1000);

document.addEventListener("DOMContentLoaded", () => {
  dbInit(() => {
    if (savedProgress) {
      coins = savedProgress.coins || 0;
      isAutoFire = savedProgress.settings?.autoFire || false;
      sfxVolume = savedProgress.settings?.sfxVolume ?? 1;
      musicVolume = savedProgress.settings?.musicVolume ?? 0.5;
      currentLang = savedProgress.settings?.lang || 'en';
      if (savedProgress.permaUpgrades) {
        permaUpgrades = { ...permaUpgrades, ...savedProgress.permaUpgrades };
      }
      if (savedProgress.charUnlocked) {
        charUnlocked = { ...savedProgress.charUnlocked };
      }
      updateUI();
    }
    applyLanguage();
    dbReady = true;
    requestAnimationFrame(animate);
  });
});
