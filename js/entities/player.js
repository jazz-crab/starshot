/**
 * PLAYER.JS - Player, game start, character selection
 */
const player = {
  worldX: 0,
  worldY: 0,
  radius: 18,
  color: "#4fc3f7",
  hp: 10,
  maxHp: 10,
  level: 1,
  xp: 0,
  nextLevelXp: 100,
  ult: 0,
  maxUlt: 100,
  isUltActive: false,
  ammo: 0,
  isReloading: false,
  lastShot: 0,
  invulnerable: false,
  dashCooldown: 100,
  dashMaxCooldown: 100,
  isDashing: false,
  vx: 0,
  vy: 0,
  maxSpeed: 5,
  accel: 0.7,
  friction: 0.9,
  kbX: 0,
  kbY: 0,
  grenadeCooldown: 0,
  maxGrenadeCooldown: 180,
};

window.startFirstGame = function () {
  if (!dbReady) return;
  document.getElementById("start-title").innerText = "CHOOSE FIGHTER";
  const btns = document.getElementById("start-buttons");
  btns.innerHTML = "";
  btns.className = "char-grid";

  const tooltip = document.createElement("div");
  tooltip.id = "char-tooltip";
  tooltip.style.display = "none";
  document.body.appendChild(tooltip);

  for (const key of Object.keys(CHARACTERS)) {
    const ch = CHARACTERS[key];
    const unlocked = charUnlocked[key];
    const btn = document.createElement("button");
    btn.className = unlocked ? "char-btn" : "char-btn locked";
    btn.textContent = ch.name;
    if (unlocked) {
      btn.onclick = () => pickCharacter(key);
    }
    btn.addEventListener("mouseenter", () => showCharTooltip(key, btn));
    btn.addEventListener("mouseleave", () => { tooltip.style.display = "none"; });
    btn.addEventListener("contextmenu", (e) => { e.preventDefault(); e.stopPropagation(); showCharInfo(key); });
    btns.appendChild(btn);
  }
};

window.showCharTooltip = function (key, btn) {
  const ch = CHARACTERS[key];
  const unlocked = charUnlocked[key];
  const tooltip = document.getElementById("char-tooltip");
  let html = `<div class="tt-name">${ch.name}<span class="tt-hint"> [RMB] DETAILS</span></div>
<div class="tt-desc">${ch.desc}</div>
<div class="tt-abilities">
  <span class="tt-ability">Dash: ${ch.abilities.dash.name}</span>
  <span class="tt-ability">Ult: ${ch.abilities.ult.name}</span>
  <span class="tt-ability">Special: ${ch.abilities.special.name}</span>
</div>`;
  if (!unlocked) {
    html += `<hr class="tt-hr"><div class="tt-locked">SCORE ${ch.unlockScore} TO UNLOCK</div>`;
  }
  tooltip.innerHTML = html;
  tooltip.style.display = "block";
  const r = btn.getBoundingClientRect();
  const th = tooltip.offsetHeight;
  let top = r.top - th - 12;
  if (top < 8) top = r.bottom + 12;
  tooltip.style.left = Math.max(8, Math.min(window.innerWidth - tooltip.offsetWidth - 8, r.left + r.width / 2 - tooltip.offsetWidth / 2)) + "px";
  tooltip.style.top = top + "px";
};

window.showCharInfo = function (key) {
  const ch = CHARACTERS[key];
  const unlocked = charUnlocked[key];
  document.getElementById("char-info-title").textContent = ch.name;
  document.getElementById("char-info-desc").textContent = ch.desc;
  let html = "";
  for (const [abKey, ab] of Object.entries(ch.abilities)) {
    html += `<div class="ci-ability">
      <div class="ci-ability-name">${ab.name}</div>`;
    ab.levels.forEach((lvl, i) => {
      html += `<div class="ci-ability-level">Lv.${i + 1}: ${lvl}</div>`;
    });
    html += `</div>`;
  }
  document.getElementById("char-info-abilities").innerHTML = html;
  const lockEl = document.getElementById("char-info-locked");
  if (!unlocked) {
    lockEl.textContent = `SCORE ${ch.unlockScore} TO UNLOCK`;
    lockEl.classList.remove("hidden");
  } else {
    lockEl.classList.add("hidden");
  }
  document.getElementById("char-info-screen").classList.remove("hidden");
};

window.closeCharInfo = function () {
  document.getElementById("char-info-screen").classList.add("hidden");
};

window.pickCharacter = function (charKey) {
  resize();
  currentCharacter = charKey;
  const ch = CHARACTERS[charKey];
  if (!characterAbilityLevels[charKey]) {
    characterAbilityLevels[charKey] = { dash: 1, ult: 1, special: 1 };
  }
  // Always UZI as starting weapon
  currentWep = JSON.parse(JSON.stringify(WEAPONS.uzi));
  player.ammo = currentWep.magSize;
  applyPermaUpgrades();
  player.hp = player.maxHp;

  startScreen.classList.add("hidden");
  document.getElementById("start-buttons").className = "button-container";
  document.getElementById("ui").classList.remove("hidden");

  const tt = document.getElementById("char-tooltip");
  if (tt) tt.remove();

  gameActive = true;
  currentWave = 0;
  isPaused = false;

  startWave();
  updateUI();
};

window.evolveWeapon = function () {
  // No longer used — replaced by ability mutation
};
