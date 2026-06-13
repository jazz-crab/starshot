/**
 * ENEMIES.JS - Enemies, Boss, Waves and spawning
 */

// ===== BOSS =====
class Boss {
  constructor(wave) {
    this.type = "boss";
    this.radius = BOSS_BASE.radius;
    this.color = BOSS_BASE.color;
    this.hp = Math.ceil(BOSS_BASE.hpMult * wave);
    this.maxHp = this.hp;
    this.speed = BOSS_BASE.speed + wave * 0.05;
    this.damage = Math.ceil(BOSS_BASE.damageMult * (1 + wave * 0.1));
    this.score = BOSS_BASE.scoreMult * wave;
    this.xp = BOSS_BASE.xp;
    this.coins = Math.floor(BOSS_BASE.coinDrop + wave * 2);
    this.worldX = 0;
    this.worldY = 0;
    this.lastAttack = 0;
    this.kbVX = 0;
    this.kbVY = 0;
    this.isGolden = false;
    this.angle = 0;
    this.chargeTimer = 0;
    this.isCharging = false;
    this.chargeDir = { x: 0, y: 0 };
  }
  update() {
    this.worldX += this.kbVX;
    this.worldY += this.kbVY;
    this.kbVX *= 0.9;
    this.kbVY *= 0.9;

    const dx = player.worldX - this.worldX;
    const dy = player.worldY - this.worldY;
    const dist = Math.hypot(dx, dy);
    const a = Math.atan2(dy, dx);

    if (this.isCharging) {
      this.worldX += this.chargeDir.x * 6;
      this.worldY += this.chargeDir.y * 6;
      this.chargeTimer--;
      if (this.chargeTimer <= 0) {
        this.isCharging = false;
        this.chargeTimer = 60;
      }
    } else {
      if (dist > 200) {
        this.worldX += Math.cos(a) * this.speed;
        this.worldY += Math.sin(a) * this.speed;
      }
      this.chargeTimer--;
      if (this.chargeTimer <= 0 && dist < 400) {
        this.isCharging = true;
        this.chargeTimer = 20;
        this.chargeDir = { x: Math.cos(a), y: Math.sin(a) };
      }
    }
  }
  draw(camX, camY) {
    const sx = this.worldX - camX;
    const sy = this.worldY - camY;
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff0000";
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (this.hp < this.maxHp) {
      const barWidth = this.radius * 2;
      const barHeight = 6;
      const barY = sy - this.radius - 14;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(sx - barWidth / 2, barY, barWidth, barHeight);
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(sx - barWidth / 2, barY, (this.hp / this.maxHp) * barWidth, barHeight);
    }
  }
}

// ===== WAVE COMPOSITION =====
function getWaveComposition(wave) {
  const total = WAVE_CONFIG.baseEnemies + wave * WAVE_CONFIG.enemiesPerWave;
  const fastRatio = Math.max(0.2, 0.5 - wave * 0.02);
  const tankRatio = Math.min(0.3, Math.max(0, (wave - 2) * 0.05));
  const normalRatio = 1 - fastRatio - tankRatio;

  return {
    total,
    fast: Math.round(total * fastRatio),
    normal: Math.round(total * normalRatio),
    tank: total - Math.round(total * fastRatio) - Math.round(total * normalRatio),
  };
}

// ===== WAVE SPAWN =====
function startWave() {
  if (!gameActive) return;

  currentWave++;
  waveActive = true;
  waveCleared = false;
  waveEnemiesSpawned = 0;
  waveEnemiesKilled = 0;
  waveSpawnTimer = -WAVE_CONFIG.waveStartDelay;

  tempDmgBoost = 1;

  if (currentWave % WAVE_CONFIG.bossWaveInterval === 0) {
    isBossWave = true;
    waveEnemiesTotal = 1;
    spawnBoss();
  } else {
    isBossWave = false;
    const comp = getWaveComposition(currentWave);
    waveEnemiesTotal = comp.total;
  }
  updateUI();
}

function spawnBoss() {
  const side = Math.floor(Math.random() * 4);
  const margin = 100;
  let wx, wy;
  if (side === 0) {
    wx = camera.x - canvas.width / 2 + Math.random() * canvas.width;
    wy = camera.y - canvas.height / 2 - margin;
  } else if (side === 1) {
    wx = camera.x + canvas.width / 2 + margin;
    wy = camera.y - canvas.height / 2 + Math.random() * canvas.height;
  } else if (side === 2) {
    wx = camera.x - canvas.width / 2 + Math.random() * canvas.width;
    wy = camera.y + canvas.height / 2 + margin;
  } else {
    wx = camera.x - canvas.width / 2 - margin;
    wy = camera.y - canvas.height / 2 + Math.random() * canvas.height;
  }
  const boss = new Boss(currentWave);
  boss.worldX = wx;
  boss.worldY = wy;
  enemies.push(boss);
}

function spawnEnemy() {
  if (isPaused || !gameActive || !waveActive) return;

  const comp = getWaveComposition(currentWave);
  const pool = [];
  for (let i = 0; i < comp.fast; i++) pool.push(0);
  for (let i = 0; i < comp.normal; i++) pool.push(1);
  for (let i = 0; i < comp.tank; i++) pool.push(2);

  if (pool.length === 0) return;

  const idx = pool[Math.floor(Math.random() * pool.length)];
  const cfg = ENEMY_TYPES[idx];
  const hpMult = 1 + (currentWave - 1) * WAVE_CONFIG.hpScale;

  const margin = 80;
  const halfW = canvas.width / 2;
  const halfH = canvas.height / 2;
  let wx, wy;
  const side = Math.floor(Math.random() * 4);
  if (side === 0) {
    wx = camera.x - halfW + Math.random() * canvas.width;
    wy = camera.y - halfH - margin;
  } else if (side === 1) {
    wx = camera.x + halfW + margin;
    wy = camera.y - halfH + Math.random() * canvas.height;
  } else if (side === 2) {
    wx = camera.x - halfW + Math.random() * canvas.width;
    wy = camera.y + halfH + margin;
  } else {
    wx = camera.x - halfW - margin;
    wy = camera.y - halfH + Math.random() * canvas.height;
  }

  for (const o of obstacles) {
    if (!o.vertices) continue;
    const lx = wx - o.worldX;
    const ly = wy - o.worldY;
    if (isInsidePolygon(lx, ly, o.vertices) || getPolygonEdgeDist(wx, wy, o.vertices, o.worldX, o.worldY) < cfg.radius + 15) {
      const dx = o.worldX - player.worldX;
      const dy = o.worldY - player.worldY;
      const len = Math.hypot(dx, dy) || 1;
      const dirX = dx / len;
      const dirY = dy / len;
      const r = getRockRadiusInDirection(dirX, dirY, o.vertices);
      wx = o.worldX + dirX * (r + cfg.radius + 10);
      wy = o.worldY + dirY * (r + cfg.radius + 10);
      break;
    }
  }

  const scaledHp = Math.ceil(cfg.hp * hpMult);
  const isGolden = Math.random() < 0.1;
  enemies.push({
    ...JSON.parse(JSON.stringify(cfg)),
    hp: scaledHp,
    maxHp: scaledHp,
    isGolden: isGolden,
    color: isGolden ? "#ffd700" : cfg.color,
    worldX: wx,
    worldY: wy,
    lastAttack: 0,
    kbVX: 0,
    kbVY: 0,
  });
}

function handleEnemyDeath(en, index) {
  score += en.score;
  totalKills++;
  waveEnemiesKilled++;
  killsSinceLastHealthPack++;
  const pColor = en.isGolden ? "#ffeb3b" : en.color;
  for (let k = 0; k < 6; k++)
    particles.push(new Particle(en.worldX, en.worldY, pColor));

  const xpReward = en instanceof Boss ? en.xp : en.xp;
  for (let i = 0; i < xpReward; i++)
    expOrbs.push(new ExperienceOrb(en.worldX, en.worldY, 1));

  if (en.isGolden) {
    const amount = Math.floor(en.maxHp * 3);
    for (let i = 0; i < amount; i++)
      coinOrbs.push(new Coin(en.worldX, en.worldY, 1));
  }

  if (en instanceof Boss) {
    for (let i = 0; i < en.coins; i++)
      coinOrbs.push(new Coin(en.worldX, en.worldY, 1));
    for (let k = 0; k < 20; k++)
      particles.push(new Particle(en.worldX, en.worldY, "#ff0000"));
    playSound(80, "sawtooth", 0.6, 0.2);
    screenFlash = 8;
    shakeIntensity += 20;
  }

  if (Math.random() * 100 < (killsSinceLastHealthPack >= 30 ? 3 : 0)) {
    healthPacks.push(new HealthPack(en.worldX, en.worldY));
    killsSinceLastHealthPack = 0;
  }
  if (!player.isUltActive)
    player.ult = Math.min(player.maxUlt, player.ult + (en instanceof Boss ? 50 : en.xp) / 5);
  playSound(150, "square", 0.1, 0.03);
  enemies.splice(index, 1);
  updateUI();

  if (enemies.length === 0 && waveActive) {
    waveCleared = true;
    waveActive = false;
    updateUI();
    if (isBossWave) {
      showEvolutionTree();
    } else {
      showWaveAnnounce(currentWave + 1);
    }
  }
}
