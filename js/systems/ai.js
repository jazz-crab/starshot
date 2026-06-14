/**
 * AI.JS - Enemy AI: steering, ranged combat, and future neural network
 */

let steeringRays = [];

const ENEMY_ACCEL = 0.08;
const ENEMY_FRICTION = 0.93;

function getSteeringDirection(enemy, obstacles, enemies, desiredAngle) {
  if (desiredAngle == null) {
    desiredAngle = Math.atan2(player.worldY - enemy.worldY, player.worldX - enemy.worldX);
  }
  const lookAhead = 60 + enemy.radius;
  const candidates = [0, 0.3, -0.3, 0.6, -0.6, 1.0, -1.0, 1.5, -1.5];

  for (const offset of candidates) {
    const angle = desiredAngle + offset;
    const lx = enemy.worldX + Math.cos(angle) * lookAhead;
    const ly = enemy.worldY + Math.sin(angle) * lookAhead;

    let blocked = false;

    for (const o of obstacles) {
      if (!o.vertices) continue;
      const relX = lx - o.worldX;
      const relY = ly - o.worldY;
      if (isInsidePolygon(relX, relY, o.vertices)) {
        blocked = true;
        break;
      }
      if (getPolygonEdgeDist(lx, ly, o.vertices, o.worldX, o.worldY) < enemy.radius + 5) {
        blocked = true;
        break;
      }
    }
    if (blocked) continue;

    for (const other of enemies) {
      if (other === enemy) continue;
      if (Math.hypot(lx - other.worldX, ly - other.worldY) < enemy.radius + other.radius + 8) {
        blocked = true;
        break;
      }
    }

    if (!blocked) {
      if (showMonitor) steeringRays.push({ x1: enemy.worldX, y1: enemy.worldY, x2: lx, y2: ly, blocked: false });
      return angle;
    }
    if (showMonitor) steeringRays.push({ x1: enemy.worldX, y1: enemy.worldY, x2: lx, y2: ly, blocked: true });
  }

  return desiredAngle;
}

function hasLineOfSight(x1, y1, x2, y2) {
  const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 20);
  for (let s = 1; s < steps; s++) {
    const t = s / steps;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    for (const o of obstacles) {
      if (!o.vertices) continue;
      const lx = px - o.worldX;
      const ly = py - o.worldY;
      if (isInsidePolygon(lx, ly, o.vertices)) return false;
    }
  }
  return true;
}

function findNearestCover(enemy, excludeRock) {
  let best = null;
  let bestDist = Infinity;
  for (const o of obstacles) {
    if (!o.vertices || o === excludeRock) continue;
    const dist = Math.hypot(enemy.worldX - o.worldX, enemy.worldY - o.worldY);
    if (dist < bestDist) {
      bestDist = dist;
      best = o;
    }
  }
  return best;
}

function getCoverPosition(rock, enemy) {
  const a = Math.atan2(rock.worldY - player.worldY, rock.worldX - player.worldX);
  const dist = (rock.size || 30) + enemy.radius + 20;
  return {
    x: rock.worldX + Math.cos(a) * dist,
    y: rock.worldY + Math.sin(a) * dist,
  };
}

function createEnemyShot(en, now) {
  en.lastShot = now;
  const a = en.aimAngle + (Math.random() - 0.5) * (en.shootSpread || 0.2);
  projectiles.push(new Projectile(
    en.worldX, en.worldY,
    a,
    en.bulletSpeed || 10,
    en.bulletDamage || 2,
    en.shootRange,
    en.bulletKnockback || 2,
    en.bulletRadius || 3,
    'enemy'
  ));
  playSound(500 + Math.random() * 200, "square", 0.04, 0.02);
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

function checkDodge(en) {
  if (en.dodgeCooldown > 0) return null;

  // Dodge incoming player projectiles
  for (const p of projectiles) {
    if (p.source === 'enemy') continue;
    const dx = en.worldX - p.worldX;
    const dy = en.worldY - p.worldY;
    const dist = Math.hypot(dx, dy);
    if (dist < 250 && dist > 0) {
      const projAngle = Math.atan2(dy, dx);
      if (angleDiff(p.angle, projAngle) < 0.4) {
        return projAngle + Math.PI / 2 * (Math.random() < 0.5 ? 1 : -1);
      }
    }
  }
  return null;
}

function enemyMove(en, moveAngle) {
  if (moveAngle == null) return;
  const tvx = Math.cos(moveAngle) * en.speed;
  const tvy = Math.sin(moveAngle) * en.speed;
  en.vx += (tvx - en.vx) * ENEMY_ACCEL;
  en.vy += (tvy - en.vy) * ENEMY_ACCEL;
}

function updateEnemiesLogic() {
  steeringRays = [];
  const now = Date.now();
  enemies.forEach((en, i) => {
    en.aimAngle = en.shootRange ? Math.atan2(player.worldY - en.worldY, player.worldX - en.worldX) : null;

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
      // Merge knockback into velocity
      en.vx += en.kbVX;
      en.vy += en.kbVY;
      en.kbVX = 0;
      en.kbVY = 0;

      let canSeePlayer = true;
      for (const sc of smokeClouds) {
        if (Math.hypot(player.worldX - sc.worldX, player.worldY - sc.worldY) < sc.radius) {
          canSeePlayer = false;
          break;
        }
      }

      const distToPlayer = Math.hypot(player.worldX - en.worldX, player.worldY - en.worldY);

      // Dodge check
      if (en.dodgeCooldown != null) en.dodgeCooldown--;
      if (en.dodgeTimer != null) en.dodgeTimer--;

      let finalAngle = null;
      if (en.dodgeTimer > 0) {
        finalAngle = en.dodgeAngle;
      } else {
        // Decision timer — не меняем направление каждый кадр
        if (en.decisionTimer == null || en.decisionTimer <= 0) {
          en.decisionTimer = 8 + Math.floor(Math.random() * 16);
          en.moveAngle = computeMoveAngle(en, now, canSeePlayer, distToPlayer);
          const dodgeAngle = checkDodge(en);
          if (dodgeAngle != null) {
            en.dodgeAngle = dodgeAngle;
            en.dodgeTimer = 8 + Math.floor(Math.random() * 6);
            en.dodgeCooldown = 25 + Math.floor(Math.random() * 15);
            en.moveAngle = dodgeAngle;
          }
        } else {
          en.decisionTimer--;
        }
        finalAngle = en.moveAngle;
      }

      if (finalAngle != null && now - en.lastAttack > 600) {
        enemyMove(en, finalAngle);
      }

      // Apply velocity then friction
      en.worldX += en.vx;
      en.worldY += en.vy;
      en.vx *= ENEMY_FRICTION;
      en.vy *= ENEMY_FRICTION;

      // Obstacle collision (push velocity instead of direct position)
      if (obstacles.length > 0 && (en.vx !== 0 || en.vy !== 0)) {
        const oc = checkCircleObstacleCollision(en.worldX, en.worldY, en.radius);
        const pushX = oc.x - en.worldX;
        const pushY = oc.y - en.worldY;
        if (Math.abs(pushX) > 0.1 || Math.abs(pushY) > 0.1) {
          en.worldX = oc.x;
          en.worldY = oc.y;
          en.vx += pushX * 0.5;
          en.vy += pushY * 0.5;
        }
      }

      // Off-screen nudge
      const margin = 150;
      const halfW = canvas.width / 2;
      const halfH = canvas.height / 2;
      const dx = en.worldX - camera.x;
      const dy = en.worldY - camera.y;
      if (Math.abs(dx) > halfW + margin || Math.abs(dy) > halfH + margin) {
        const a = Math.atan2(player.worldY - en.worldY, player.worldX - en.worldX);
        en.vx += Math.cos(a) * en.speed * 0.3;
        en.vy += Math.sin(a) * en.speed * 0.3;
        if (obstacles.length > 0) {
          const oc2 = checkCircleObstacleCollision(en.worldX, en.worldY, en.radius);
          en.worldX = oc2.x;
          en.worldY = oc2.y;
        }
      }

      // === Ranged attack ===
      if (en.shootRange && en.shootCooldown && distToPlayer < en.shootRange) {
        const neuralOK = en._neuralShoot !== undefined ? en._neuralShoot : true;
        en._neuralShoot = undefined;
        if (neuralOK && now - en.lastShot >= en.shootCooldown && canSeePlayer && hasLineOfSight(en.worldX, en.worldY, player.worldX, player.worldY)) {
          createEnemyShot(en, now);
        }
      }
    }

    // Contact damage
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
      playSound(200, "square", 0.12, 0.06);
      const pushAngle = Math.atan2(player.worldY - en.worldY, player.worldX - en.worldX);
      player.kbX = Math.cos(pushAngle) * (isBoss ? 25 : 12);
      player.kbY = Math.sin(pushAngle) * (isBoss ? 25 : 12);
      player.invulnerable = true;
      setTimeout(() => (player.invulnerable = false), 400);
      en.lastAttack = now;
      if (player.hp <= 0) showDeathScreen();
    }
  });

  // Separation (velocity-based)
  for (let i = 0; i < enemies.length; i++) {
    for (let j = i + 1; j < enemies.length; j++) {
      const a = enemies[i], b = enemies[j];
      const dx = b.worldX - a.worldX;
      const dy = b.worldY - a.worldY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const overlap = a.radius + b.radius - dist;
      if (overlap > 0 && dist > 0) {
        const pushX = (dx / dist) * overlap * 0.3;
        const pushY = (dy / dist) * overlap * 0.3;
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

function computeMoveAngle(en, now, canSeePlayer, distToPlayer) {
  if (typeof NEURAL_AI !== 'undefined' && NEURAL_AI.active && en.isNeural) {
    const result = NEURAL_AI.activate(en, player, obstacles, projectiles);
    if (result) {
      en._neuralShoot = result.shoot;
      return Math.atan2(result.moveY, result.moveX);
    }
  }
  if (en.shootRange) {
    if (!en.aiState) {
      en.aiState = Math.random() < 0.4 && obstacles.length > 0 ? 'cover' : 'chase';
      en.aiTimer = 0;
    }
    en.aiTimer--;

    switch (en.aiState) {
      case 'chase': {
        const wantCover = en.hp < en.maxHp * 0.7 || distToPlayer < en.shootRange * 0.4;
        if (wantCover && obstacles.length > 0) {
          const rock = findNearestCover(en);
          if (rock) {
            en.coverRock = rock;
            en.aiState = 'cover';
            en.aiTimer = 120;
            break;
          }
        }
        if (en.preferredDist && distToPlayer < en.preferredDist) {
          return getSteeringDirection(en, obstacles, enemies, Math.atan2(en.worldY - player.worldY, en.worldX - player.worldX));
        } else if (canSeePlayer) {
          return getSteeringDirection(en, obstacles, enemies);
        } else {
          return Math.atan2(en.vy || 1, en.vx || 1);
        }
      }

      case 'cover': {
        if (!en.coverRock || !en.coverRock.vertices) { en.aiState = 'chase'; break; }
        const pos = getCoverPosition(en.coverRock, en);
        const d = Math.hypot(pos.x - en.worldX, pos.y - en.worldY);
        if (d < 30 || en.aiTimer <= 0) {
          en.aiState = 'hide';
          en.aiTimer = 40 + Math.floor(Math.random() * 80);
          return null;
        }
        return getSteeringDirection(en, obstacles, enemies, Math.atan2(pos.y - en.worldY, pos.x - en.worldX));
      }

      case 'hide': {
        if (en.aiTimer <= 0) {
          en.aiState = 'fight';
          en.aiTimer = 0;
          en.shotsInFight = 0;
        }
        return null;
      }

      case 'fight': {
        const hasLos = canSeePlayer && hasLineOfSight(en.worldX, en.worldY, player.worldX, player.worldY);
        if (hasLos) {
          if (en.shotsInFight >= 2 + Math.floor(Math.random() * 2)) {
            const newRock = findNearestCover(en, en.coverRock);
            if (newRock) { en.coverRock = newRock; en.aiState = 'cover'; en.aiTimer = 120; }
            else { en.aiState = 'chase'; }
            return null;
          }
          return null;
        }
        if (en.aiTimer < -120) { en.aiState = 'chase'; return null; }
        if (en.aiTimer < -40) {
          const rock = findNearestCover(en);
          if (rock) { en.coverRock = rock; en.aiState = 'cover'; en.aiTimer = 90; }
          else { en.aiState = 'chase'; }
          return null;
        }
        return getSteeringDirection(en, obstacles, enemies);
      }
    }
  } else {
    // Melee
    if (canSeePlayer) {
      if (en.preferredDist && distToPlayer < en.preferredDist) {
        return getSteeringDirection(en, obstacles, enemies, Math.atan2(en.worldY - player.worldY, en.worldX - player.worldX));
      }
      return getSteeringDirection(en, obstacles, enemies);
    }
    return Math.atan2(en.vy || 1, en.vx || 1);
  }
  return null;
}
