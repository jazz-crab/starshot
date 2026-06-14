/**
 * EFFECTS.JS - Visual effects: particles, damage text, coins, XP, health packs
 */

class DamageText {
  constructor(x, y, text, color = "white", type = "damage") {
    this.worldX = x;
    this.worldY = y;
    this.text = text;
    this.color = color;
    this.type = type;
    this.alpha = 1;
    this.vy = -2 - Math.random() * 2;
    this.vx = (Math.random() - 0.5) * 2;
    this.value =
      type === "xp" || type === "coin"
        ? parseInt(text.replace(/[^\d]/g, ""))
        : 0;
  }
  update() {
    this.worldX += this.vx;
    this.worldY += this.vy;
    this.alpha -= 0.02;
  }
  draw(camX, camY) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.font = "bold 16px MonaspaceKrypton, monospace";
    ctx.textAlign = "center";
    ctx.fillText(this.text, this.worldX - camX, this.worldY - camY);
    ctx.restore();
  }
}

class Particle {
  constructor(x, y, color) {
    this.worldX = x;
    this.worldY = y;
    this.color = color;
    this.alpha = 1;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
  }
  update() {
    this.worldX += this.vx;
    this.worldY += this.vy;
    this.vx *= 0.96;
    this.vy *= 0.96;
    this.alpha -= 0.03;
  }
  draw(camX, camY) {
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.worldX - camX, this.worldY - camY, 2, 2);
    ctx.globalAlpha = 1;
  }
}

class AfterImage {
  constructor(x, y, radius) {
    this.worldX = x;
    this.worldY = y;
    this.radius = radius;
    this.alpha = 0.6;
  }
  update() {
    this.alpha -= 0.04;
  }
  draw(camX, camY) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = "#4fc3f7";
    ctx.beginPath();
    ctx.arc(this.worldX - camX, this.worldY - camY, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class ExperienceOrb {
  constructor(x, y, amount) {
    this.worldX = x;
    this.worldY = y;
    this.amount = amount;
    const angle = Math.random() * Math.PI * 2;
    const force = 2 + Math.random() * 6;
    this.vx = Math.cos(angle) * force;
    this.vy = Math.sin(angle) * force;
    this.friction = 0.93;
    this.magnetSpeed = 0;
    this.birth = Date.now();
    this.dead = false;
  }
  update() {
    this.worldX += this.vx;
    this.worldY += this.vy;
    this.vx *= this.friction;
    this.vy *= this.friction;

    if (Date.now() - this.birth > 250) {
      const dx = player.worldX - this.worldX;
      const dy = player.worldY - this.worldY;
      const distSq = dx * dx + dy * dy;

      this.magnetSpeed += 0.5;
      const a = Math.atan2(dy, dx);
      this.worldX += Math.cos(a) * this.magnetSpeed;
      this.worldY += Math.sin(a) * this.magnetSpeed;

      if (distSq < 400) {
        this.collect();
        this.dead = true;
      }
    }
  }
  collect() {
    playSound(880, "sine", 0.06, 0.012);
    gainXp(this.amount);
    let txt = damageTexts.find((t) => t.type === "xp" && t.alpha > 0.7);
    if (txt) {
      txt.value += this.amount;
      txt.text = "+" + txt.value + " XP";
      txt.alpha = 1;
      txt.worldX = player.worldX;
      txt.worldY = player.worldY - 25;
    } else {
      damageTexts.push(
        new DamageText(
          player.worldX,
          player.worldY - 25,
          "+" + this.amount + " XP",
          "#00e5ff",
          "xp",
        ),
      );
    }
  }
  draw(camX, camY) {
    ctx.fillStyle = "#00e5ff";
    ctx.fillRect(this.worldX - camX - 1.5, this.worldY - camY - 1.5, 3, 3);
  }
}

class Coin {
  constructor(x, y, amount) {
    this.worldX = x;
    this.worldY = y;
    this.amount = amount;
    const angle = Math.random() * Math.PI * 2;
    const force = 3 + Math.random() * 7;
    this.vx = Math.cos(angle) * force;
    this.vy = Math.sin(angle) * force;
    this.friction = 0.94;
    this.magnetSpeed = 0;
    this.birth = Date.now();
    this.dead = false;
  }
  update() {
    this.worldX += this.vx;
    this.worldY += this.vy;
    this.vx *= this.friction;
    this.vy *= this.friction;

    if (Date.now() - this.birth > 250) {
      const dx = player.worldX - this.worldX;
      const dy = player.worldY - this.worldY;
      const distSq = dx * dx + dy * dy;

      this.magnetSpeed += 0.5;
      const a = Math.atan2(dy, dx);
      this.worldX += Math.cos(a) * this.magnetSpeed;
      this.worldY += Math.sin(a) * this.magnetSpeed;

      if (distSq < 300) {
        this.collect();
        this.dead = true;
      }
    }
  }
  collect() {
    coins += this.amount;
    playSound(1400, "triangle", 0.08, 0.015);
    let txt = damageTexts.find((t) => t.type === "coin" && t.alpha > 0.7);
    if (txt) {
      txt.value += this.amount;
      txt.text = "+" + txt.value + " ₽";
      txt.alpha = 1;
      txt.worldX = player.worldX;
      txt.worldY = player.worldY - 45;
    } else {
      let dTxt = new DamageText(
        player.worldX,
        player.worldY - 45,
        "+" + this.amount + " ₽",
        "#ffeb3b",
        "coin",
      );
      dTxt.value = this.amount;
      damageTexts.push(dTxt);
    }
  }
  draw(camX, camY) {
    ctx.fillStyle = "#ffeb3b";
    ctx.fillRect(this.worldX - camX - 2, this.worldY - camY - 2, 4, 4);
  }
}

class HealthPack {
  constructor(x, y) {
    this.worldX = x;
    this.worldY = y;
    this.radius = 12;
    this.healPercent = 0.1;
  }
  draw(camX, camY) {
    const x = this.worldX - camX,
      y = this.worldY - camY;
    ctx.fillStyle = "white";
    ctx.fillRect(x - 10, y - 10, 20, 20);
    ctx.fillStyle = "#ff1744";
    ctx.fillRect(x - 2, y - 7, 4, 14);
    ctx.fillRect(x - 7, y - 2, 14, 4);
  }
}
