function updateCamera() {
  let targetX = camera.x;
  let targetY = camera.y;

  const isMoving =
    keys["KeyW"] ||
    keys["KeyS"] ||
    keys["KeyA"] ||
    keys["KeyD"] ||
    keys["ArrowUp"] ||
    keys["ArrowDown"] ||
    keys["ArrowLeft"] ||
    keys["ArrowRight"];

  let dx = player.worldX - camera.x;
  let dy = player.worldY - camera.y;

  if (isMoving) {
    if (Math.abs(dx) > camera.deadzoneX)
      targetX = player.worldX - Math.sign(dx) * camera.deadzoneX;
    if (Math.abs(dy) > camera.deadzoneY)
      targetY = player.worldY - Math.sign(dy) * camera.deadzoneY;
    camera.x += (targetX - camera.x) * camera.lerp;
    camera.y += (targetY - camera.y) * camera.lerp;
  } else {
    const returnSmoothing = 0.04;
    camera.x += (player.worldX - camera.x) * returnSmoothing;
    camera.y += (player.worldY - camera.y) * returnSmoothing;
  }

  if (Math.abs(camera.x - player.worldX) < 0.05) camera.x = player.worldX;
  if (Math.abs(camera.y - player.worldY) < 0.05) camera.y = player.worldY;

  camera.offsetX = camera.x - canvas.width / 2;
  camera.offsetY = camera.y - canvas.height / 2;
}
