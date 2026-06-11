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
  healthPacks.forEach((hp) => hp.draw(camera.offsetX, camera.offsetY));
  projectiles.forEach((p) => p.draw());
  grenades.forEach((g) => g.draw());
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

    ctx.fillStyle = en.color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, en.radius, 0, Math.PI * 2);
    ctx.fill();

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
    ctx.shadowColor = "yellow";
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pSX, pSY, player.radius + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(pSX, pSY, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.invulnerable ? "white" : player.color;
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
}
