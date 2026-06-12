/**
 * INPUT.JS - Fixed input handling
 */
function handleInputs() {
  if (isPaused || isCountingDown || isConsoleOpen) return;

  let moveX = 0;
  let moveY = 0;

  if (keys["KeyW"] || keys["ArrowUp"]) moveY -= 1;
  if (keys["KeyS"] || keys["ArrowDown"]) moveY += 1;
  if (keys["KeyA"] || keys["ArrowLeft"]) moveX -= 1;
  if (keys["KeyD"] || keys["ArrowRight"]) moveX += 1;

  if (moveX !== 0 || moveY !== 0) {
    const mag = Math.sqrt(moveX * moveX + moveY * moveY);
    player.vx += (moveX / mag) * player.accel;
    player.vy += (moveY / mag) * player.accel;
  }

  player.vx *= player.friction;
  player.vy *= player.friction;

  if (!player.isDashing) {
    const spd = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
    if (spd > player.maxSpeed) {
      player.vx = (player.vx / spd) * player.maxSpeed;
      player.vy = (player.vy / spd) * player.maxSpeed;
    }
  }

  if (Math.abs(player.vx) < 0.01) player.vx = 0;
  if (Math.abs(player.vy) < 0.01) player.vy = 0;

  player.worldX += player.vx;
  player.worldY += player.vy;

  player.worldX += player.kbX;
  player.worldY += player.kbY;
  player.kbX *= 0.85;
  player.kbY *= 0.85;
  if (Math.abs(player.kbX) < 0.1) player.kbX = 0;
  if (Math.abs(player.kbY) < 0.1) player.kbY = 0;

  if (obstacles.length > 0) {
    const oc = checkCircleObstacleCollision(player.worldX, player.worldY, player.radius);
    if (oc.x !== player.worldX || oc.y !== player.worldY) {
      player.worldX = oc.x;
      player.worldY = oc.y;
      player.vx *= 0.5;
      player.vy *= 0.5;
    }
  }
}

function clearHeldKeys() {
  for (let key in keys) delete keys[key];
  isMouseDown = false;
}

window.addEventListener("blur", clearHeldKeys);

window.addEventListener("keydown", (e) => {
  // Console intercepts everything
  if (isConsoleOpen) {
    handleConsoleKeydown(e);
    return;
  }

  // Open console
  if (e.code === "Slash") {
    e.preventDefault();
    toggleConsole();
    return;
  }
  if (e.key === ">") {
    e.preventDefault();
    toggleConsole();
    return;
  }

  // System keys
  if (
    [
      "Space",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
    ].includes(e.code)
  ) {
    e.preventDefault();
  }

  keys[e.code] = true;

  if (e.code === "KeyR") startReload();
  if (e.code === "KeyY") {
    isAutoFire = !isAutoFire;
    updateUI();
  }
  if (e.code === "Escape") {
    // Close character info
    const ciScreen = document.getElementById("char-info-screen");
    if (ciScreen && !ciScreen.classList.contains("hidden")) {
      e.preventDefault();
      closeCharInfo();
      return;
    }
    // Close settings / stats / shop
    if (!document.getElementById("settings-screen").classList.contains("hidden")) {
      e.preventDefault();
      closeSettingsScreen();
      return;
    }
    if (!document.getElementById("stats-screen").classList.contains("hidden")) {
      e.preventDefault();
      closeStatsScreen();
      return;
    }
    if (!document.getElementById("perma-shop-screen").classList.contains("hidden")) {
      e.preventDefault();
      closePermaShop();
      return;
    }
    // From character select — back to main menu
    const sb = document.getElementById("start-buttons");
    if (sb && sb.className === "char-grid") {
      e.preventDefault();
      goToMainMenu();
      return;
    }
    // During evolution/upgrade — do nothing
    if (sb && sb.className === "evo-tree") {
      return;
    }
    togglePauseGame();
  }
  if (e.code === "Space" && !isPaused && gameActive && !isCountingDown) {
    if (player.dashCooldown >= player.dashMaxCooldown) {
      let dx = 0, dy = 0;
      if (keys["KeyW"] || keys["ArrowUp"]) dy = -1;
      if (keys["KeyS"] || keys["ArrowDown"]) dy = 1;
      if (keys["KeyA"] || keys["ArrowLeft"]) dx = -1;
      if (keys["KeyD"] || keys["ArrowRight"]) dx = 1;
      if (dx === 0 && dy === 0) {
        const a = Math.atan2(mousePos.y - (player.worldY - camera.offsetY), mousePos.x - (player.worldX - camera.offsetX));
        dx = Math.cos(a);
        dy = Math.sin(a);
      } else {
        const mag = Math.sqrt(dx * dx + dy * dy);
        dx /= mag;
        dy /= mag;
      }
      useCharacterDash(dx, dy);
    }
  }
  if (
    e.code === "KeyQ" &&
    player.ult >= player.maxUlt &&
    !player.isUltActive &&
    !player.ultData &&
    gameActive &&
    !isPaused
  ) {
    activateCharacterUlt();
  }
});

window.addEventListener("keyup", (e) => {
  delete keys[e.code];
});

window.addEventListener("mousedown", (e) => {
  if (e.target.closest("button")) return;
  if (e.button === 0) isMouseDown = true;
  if (e.button === 2 && !isPaused && !isCountingDown && gameActive) {
    useCharacterSpecial();
  }
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 0) isMouseDown = false;
});
window.addEventListener("mousemove", (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});
window.addEventListener("contextmenu", (e) => e.preventDefault());

function updateConfirmLogic(dt) {}
