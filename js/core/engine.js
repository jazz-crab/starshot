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

function bootGame() {
  resize();
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
    preloadSounds((progress) => {
      const pct = Math.round(progress * 100);
      document.getElementById("loading-bar-fill").style.width = pct + "%";
      document.getElementById("loading-percent").textContent = pct + "%";
    }).then(() => {
      document.getElementById("loading-bar-fill").style.width = "100%";
      document.getElementById("loading-percent").textContent = "100%";
      setTimeout(() => {
        document.getElementById("loading-screen").classList.add("hidden");
      }, 400);
    });
    requestAnimationFrame(animate);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootGame);
} else {
  bootGame();
}
