/**
 * RENDER.JS - Pure frame rendering
 */
function drawGame() {
  if (!ctx) return;

  const pShakeX = (Math.random() - 0.5) * shakeIntensity;
  const pShakeY = (Math.random() - 0.5) * shakeIntensity;

  // 1. BACKGROUND
  let fC = Math.floor(screenFlash * 50);
  ctx.fillStyle = `rgb(${5 + fC}, ${5 + fC}, ${5 + fC})`;
  if (screenFlash > 0) screenFlash *= 0.82;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. GRID
  ctx.strokeStyle = "#121212";
  ctx.lineWidth = 1;
  ctx.beginPath();
  const gridOffsetX = Math.floor(camera.offsetX % 100);
  const gridOffsetY = Math.floor(camera.offsetY % 100);
  for (let x = -gridOffsetX; x < canvas.width; x += 100) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
  }
  for (let y = -gridOffsetY; y < canvas.height; y += 100) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }
  ctx.stroke();

  // 3. OBJECTS
  obstacles.forEach((o) => {
    const ox = o.worldX - camera.offsetX, oy = o.worldY - camera.offsetY;
    if (o.vertices) {
      ctx.fillStyle = o.color;
      ctx.beginPath();
      ctx.moveTo(ox + o.vertices[0].x, oy + o.vertices[0].y);
      for (let i = 1; i < o.vertices.length; i++)
        ctx.lineTo(ox + o.vertices[i].x, oy + o.vertices[i].y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (const seg of o.outlineSegments) {
        if (!seg.broken) {
          ctx.moveTo(ox + seg.x1, oy + seg.y1);
          ctx.lineTo(ox + seg.x2, oy + seg.y2);
        }
      }
      ctx.stroke();
    } else {
      ctx.fillStyle = o.color || "#555";
      ctx.fillRect(ox - o.radius, oy - o.radius, o.radius * 2, o.radius * 2);
      if (o.maxHp) {
        const bw = o.radius * 2, bh = 3;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(ox - bw / 2, oy - o.radius - 8, bw, bh);
        ctx.fillStyle = "#ff6f00";
        ctx.fillRect(ox - bw / 2, oy - o.radius - 8, (o.hp / o.maxHp) * bw, bh);
      }
    }
  });
  healthPacks.forEach((hp) => hp.draw(camera.offsetX, camera.offsetY));
  projectiles.forEach((p) => p.draw());
  grenades.forEach((g) => g.draw());
  fireTrails.forEach((ft) => ft.draw(camera.offsetX, camera.offsetY));
  smokeClouds.forEach((sc) => sc.draw(camera.offsetX, camera.offsetY));
  particles.forEach((p) => p.draw(camera.offsetX, camera.offsetY));
  expOrbs.forEach((orb) => orb.draw(camera.offsetX, camera.offsetY));
  coinOrbs.forEach((coin) => coin.draw(camera.offsetX, camera.offsetY));
  damageTexts.forEach((dt) => dt.draw(camera.offsetX, camera.offsetY));

  // 4. ENEMIES
  enemies.forEach((en) => {
    if (en.draw) {
      en.draw(camera.offsetX, camera.offsetY);
      return;
    }
    const screenX = en.worldX - camera.offsetX;
    const screenY = en.worldY - camera.offsetY;

    ctx.fillStyle = en.burning ? "#ff5722" : en.color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, en.radius, 0, Math.PI * 2);
    ctx.fill();

    if (en.burning) {
      ctx.strokeStyle = "#ff5722";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenX, screenY, en.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (en.hp < en.maxHp) {
      const barWidth = en.radius * 2;
      const barHeight = 4;
      const barY = screenY - en.radius - 10;
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);
      ctx.fillStyle = "#ff1744";
      const healthWidth = (en.hp / en.maxHp) * barWidth;
      ctx.fillRect(screenX - barWidth / 2, barY, healthWidth, barHeight);
    }
    if (en.aimAngle != null) {
      ctx.strokeStyle = "rgba(255,255,200,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(screenX + Math.cos(en.aimAngle) * (en.radius + 15), screenY + Math.sin(en.aimAngle) * (en.radius + 15));
      ctx.stroke();
    }
  });

  // 5. PLAYER
  const pSX = player.worldX - camera.offsetX + pShakeX;
  const pSY = player.worldY - camera.offsetY + pShakeY;
  const target = isAutoFire ? getNearestEnemy() : null;
  let drawAngle = target
    ? Math.atan2(target.worldY - player.worldY, target.worldX - player.worldX)
    : Math.atan2(
        mousePos.y - (player.worldY - camera.offsetY),
        mousePos.x - (player.worldX - camera.offsetX),
      );

  ctx.save();
  ctx.translate(pSX, pSY);
  ctx.rotate(drawAngle);
  ctx.fillStyle = "#555";
  ctx.fillRect(10, -3, 20, 6);
  ctx.fillRect(10, -3, 6, 12);
  ctx.restore();

  if (player.isUltActive) {
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = player.ultData?.type === 'shield' ? "#ff6f00" : "yellow";
    ctx.strokeStyle = player.ultData?.type === 'shield' ? "#ff6f00" : "yellow";
    ctx.lineWidth = player.ultData?.type === 'shield' ? 6 : 3;
    ctx.beginPath();
    ctx.arc(pSX, pSY, player.radius + (player.ultData?.type === 'shield' ? 8 : 2), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(pSX, pSY, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.ultData?.type === 'shield' ? "#ff6f00" : player.invulnerable ? "white" : player.color;
  ctx.fill();

  if (player.dashCooldown < player.dashMaxCooldown) {
    ctx.fillStyle = "#222";
    ctx.fillRect(pSX - 20, pSY + 25, 40, 4);
    ctx.fillStyle = "#2196f3";
    ctx.fillRect(
      pSX - 20,
      pSY + 25,
      (player.dashCooldown / player.dashMaxCooldown) * 40,
      4,
    );
  }

  // STEERING DEBUG RAYS
  if (showMonitor && steeringRays.length) {
    for (const r of steeringRays) {
      ctx.strokeStyle = r.blocked ? "rgba(255,0,0,0.4)" : "rgba(0,255,0,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(r.x1 - camera.x, r.y1 - camera.y);
      ctx.lineTo(r.x2 - camera.x, r.y2 - camera.y);
      ctx.stroke();
    }
  }

  // MONITOR OVERLAY
  if (showMonitor) {
    const lines = [
      "== MONITOR ==",
      "FPS:      " + currentFps,
      "chunk:    " + lastChunkX + ", " + lastChunkY,
      "obstacles:" + obstacles.length,
      "enemies:  " + enemies.length,
      "projectiles:" + projectiles.length,
      "particles:" + particles.length,
      "grenades: " + grenades.length,
      "expOrbs:  " + expOrbs.length,
      "coinOrbs: " + coinOrbs.length,
      "damageTxt:" + damageTexts.length,
      "healthPk: " + healthPacks.length,
      "smoke:    " + smokeClouds.length,
      "---------",
      "TOTAL obj:" + (obstacles.length + enemies.length + projectiles.length +
        particles.length + grenades.length + expOrbs.length + coinOrbs.length +
        damageTexts.length + healthPacks.length + smokeClouds.length),
      "MEM est:  " + (
        obstacles.length * 200 + enemies.length * 150 + projectiles.length * 80 +
        particles.length * 30 + grenades.length * 80 + expOrbs.length * 50 +
        coinOrbs.length * 50 + damageTexts.length * 60 + healthPacks.length * 40 +
        smokeClouds.length * 40
      ) + " B",
    ];
    const lineH = 16;
    const pad = 10;
    const w = 210;
    const h = lines.length * lineH + pad * 2;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(8, 8, w, h);
    ctx.fillStyle = "#0f0";
    ctx.font = "13px monospace";
    lines.forEach((l, i) => ctx.fillText(l, 14, 20 + i * lineH));
    ctx.restore();
  }
}
