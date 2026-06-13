class Projectile {
  constructor(worldX, worldY, angle, speed, damage, range, knockback) {
    this.worldX = worldX;
    this.worldY = worldY;
    this.startX = worldX;
    this.startY = worldY;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.angle = angle;
    this.speed = speed;
    this.damage = damage;
    this.range = range;
    this.knockback = knockback;
    this.dead = false;
    this.radius = currentWep.bulletRadius;
    this.history = [];
    this.maxHistory = 6;
  }
  getTravelRatio() {
    return Math.min(
      1,
      Math.hypot(this.worldX - this.startX, this.worldY - this.startY) /
        this.range,
    );
  }
  getFadeMultiplier() {
    const t = this.getTravelRatio();
    const fadeProgress = Math.max(0, (t - 0.66) / 0.34);
    return 1 - fadeProgress;
  }
  update() {
    if (isPaused) return;
    const fadeMult = this.getFadeMultiplier();
    const t = this.getTravelRatio();
    const speedMult = 0.15 + 0.85 * (1 - t * t * t);
    this.vx = Math.cos(this.angle) * this.speed * speedMult;
    this.vy = Math.sin(this.angle) * this.speed * speedMult;

    this.maxHistory = Math.ceil(6 * fadeMult);
    this.history.push({ x: this.worldX, y: this.worldY });
    while (this.history.length > this.maxHistory) this.history.shift();
    const steps = 3;
    for (let s = 0; s < steps; s++) {
      this.worldX += this.vx / steps;
      this.worldY += this.vy / steps;
      const actualDmg = Math.max(
        1,
        Math.round(this.damage * fadeMult),
      );
      for (let i = enemies.length - 1; i >= 0; i--) {
        const en = enemies[i];
        if (
          Math.hypot(this.worldX - en.worldX, this.worldY - en.worldY) <
          en.radius + this.radius
        ) {
          damageTexts.push(
            new DamageText(en.worldX, en.worldY, "-" + actualDmg, "#ff4444"),
          );
          en.kbVX += Math.cos(this.angle) * this.knockback;
          en.kbVY += Math.sin(this.angle) * this.knockback;
          en.hp -= actualDmg;
          totalDamageDealt += actualDmg;
          if (player.nextShotIgnites) {
            en.burning = { timer: player.nextShotIgnites.duration, damage: player.nextShotIgnites.dmg, tickCounter: 0 };
            player.nextShotIgnites = null;
          }
          this.dead = true;
          if (en.hp <= 0) handleEnemyDeath(en, i);
          break;
        }
      }
      if (!this.dead) {
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const o = obstacles[i];
          let hit = false;
          if (o.vertices) {
            const lx = this.worldX - o.worldX;
            const ly = this.worldY - o.worldY;
            hit = isInsidePolygon(lx, ly, o.vertices) || getPolygonEdgeDist(this.worldX, this.worldY, o.vertices, o.worldX, o.worldY) < this.radius;
          } else {
            hit = Math.hypot(this.worldX - o.worldX, this.worldY - o.worldY) < o.radius + this.radius;
          }
          if (hit) {
            o.hp -= actualDmg;
            damageTexts.push(new DamageText(o.worldX, o.worldY, "-" + actualDmg, "#aaa"));
            this.dead = true;
            if (o.vertices) {
              const intact = o.outlineSegments.filter(s => !s.broken);
              if (intact.length > 0) {
                intact[Math.floor(Math.random() * intact.length)].broken = true;
              }
            }
            if (o.hp <= 0) {
              if (o.vertices) { destroyRock(o, i); } else { obstacles.splice(i, 1); }
            }
            break;
          }
        }
      }
      if (this.dead) break;
    }
    if (this.getTravelRatio() >= 1) this.dead = true;
  }
  draw() {
    const cx = camera.offsetX,
      cy = camera.offsetY;
    const alpha = Math.max(0.1, this.getFadeMultiplier());
    if (this.history.length > 1) {
      ctx.save();
      ctx.globalAlpha = alpha * 0.35;
      const pts = [...this.history, { x: this.worldX, y: this.worldY }];
      const n = pts.length;
      const verts = [];
      for (let i = 0; i < n; i++) {
        const p = pts[i];
        const w = (i / (n - 1)) * this.radius * 2;
        let dx = i < n - 1 ? pts[i + 1].x - p.x : p.x - pts[i - 1].x;
        let dy = i < n - 1 ? pts[i + 1].y - p.y : p.y - pts[i - 1].y;
        const len = Math.hypot(dx, dy);
        if (len === 0) continue;
        const px = (-dy / len) * (w / 2);
        const py = (dx / len) * (w / 2);
        verts.push({ x: p.x + px - cx, y: p.y + py - cy });
      }
      for (let i = n - 1; i >= 0; i--) {
        const p = pts[i];
        const w = (i / (n - 1)) * this.radius * 2;
        let dx = i < n - 1 ? pts[i + 1].x - p.x : p.x - pts[i - 1].x;
        let dy = i < n - 1 ? pts[i + 1].y - p.y : p.y - pts[i - 1].y;
        const len = Math.hypot(dx, dy);
        if (len === 0) continue;
        const px = (-dy / len) * (w / 2);
        const py = (dx / len) * (w / 2);
        verts.push({ x: p.x - px - cx, y: p.y - py - cy });
      }
      if (verts.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(verts[0].x, verts[0].y);
        for (let k = 1; k < verts.length; k++) ctx.lineTo(verts[k].x, verts[k].y);
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.worldX - cx, this.worldY - cy, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Grenade {
  constructor(x, y, angle) {
    this.worldX = x;
    this.worldY = y;
    this.vx = Math.cos(angle) * 12;
    this.vy = Math.sin(angle) * 12;
    this.timer = 60;
    this.dead = false;
  }
  update() {
    this.vx *= 0.95;
    this.vy *= 0.95;
    this.worldX += this.vx;
    this.worldY += this.vy;
    this.timer--;
    if (this.timer <= 0) {
      this.dead = true;
      this.explode();
    }
  }
  explode() {
    playSound(80, "sawtooth", 0.4, 0.1);
    screenFlash = 5;
    shakeIntensity += 15;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const en = enemies[i];
      if (Math.hypot(this.worldX - en.worldX, this.worldY - en.worldY) < 180) {
        const dmg = 20;
        damageTexts.push(
          new DamageText(en.worldX, en.worldY, "-" + dmg, "#ff8800"),
        );
        const a = Math.atan2(en.worldY - this.worldY, en.worldX - this.worldX);
        en.kbVX += Math.cos(a) * 35;
        en.kbVY += Math.sin(a) * 35;
        en.hp -= dmg;
        totalDamageDealt += dmg;
        if (en.hp <= 0) handleEnemyDeath(en, i);
      }
    }
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      let hit = false;
      if (o.vertices) {
        const lx = this.worldX - o.worldX;
        const ly = this.worldY - o.worldY;
        hit = isInsidePolygon(lx, ly, o.vertices) || getPolygonEdgeDist(this.worldX, this.worldY, o.vertices, o.worldX, o.worldY) < 180;
      } else {
        hit = Math.hypot(this.worldX - o.worldX, this.worldY - o.worldY) < 180 + (o.radius || 0);
      }
      if (hit) {
        o.hp -= 20;
        if (o.vertices) {
          const intact = o.outlineSegments.filter(s => !s.broken);
          if (intact.length > 0) {
            intact[Math.floor(Math.random() * intact.length)].broken = true;
          }
        }
        if (o.hp <= 0) {
          if (o.vertices) { destroyRock(o, i); } else { obstacles.splice(i, 1); }
        }
      }
    }
    for (let k = 0; k < 30; k++)
      particles.push(new Particle(this.worldX, this.worldY, "#ff5722"));
  }
  draw() {
    ctx.fillStyle = "#4caf50";
    ctx.beginPath();
    ctx.arc(
      this.worldX - camera.offsetX,
      this.worldY - camera.offsetY,
      7,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

// ===== FIRE TRAIL (Pyro dash) =====
class FireTrail {
  constructor(x, y) {
    this.worldX = x;
    this.worldY = y;
    this.timer = 30;
    this.radius = 16;
    this.dead = false;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const en = enemies[i];
      if (Math.hypot(this.worldX - en.worldX, this.worldY - en.worldY) < this.radius + en.radius) {
        en.hp -= 2;
        damageTexts.push(new DamageText(en.worldX, en.worldY, "-2", "#ff5722"));
        if (en.hp <= 0) handleEnemyDeath(en, i);
      }
    }
  }
  update() {
    this.timer--;
    if (this.timer <= 0) this.dead = true;
  }
  draw(camX, camY) {
    ctx.save();
    ctx.globalAlpha = this.timer / 30;
    ctx.fillStyle = "#ff5722";
    ctx.beginPath();
    ctx.arc(this.worldX - camX, this.worldY - camY, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ===== SMOKE CLOUD (Ninja special) =====
class SmokeCloud {
  constructor(x, y) {
    this.worldX = x;
    this.worldY = y;
    this.timer = 120;
    this.radius = 100;
    this.dead = false;
  }
  update() {
    this.timer--;
    if (this.timer <= 0) this.dead = true;
  }
  draw(camX, camY) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.timer / 60) * 0.4;
    ctx.fillStyle = "#9c27b0";
    ctx.beginPath();
    ctx.arc(this.worldX - camX, this.worldY - camY, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
