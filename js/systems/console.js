/**
 * CONSOLE.JS - Debug terminal
 */
let isConsoleOpen = false;
let consoleHistory = [];
let historyIndex = -1;
let consoleOutput = [];
let consoleBuffer = "";

const consoleInput = document.getElementById("console-input");
const consoleOutputEl = document.getElementById("console-output");
const consoleOverlay = document.getElementById("console-overlay");

const CONSOLE_COMMANDS = {
  help: { fn: cmdHelp, desc: "List available commands" },
  "set-hp": { fn: cmdSetHp, desc: "set-hp [N] — set HP" },
  "set-max-hp": { fn: cmdSetMaxHp, desc: "set-max-hp [N] — set max HP" },
  "add-hp": { fn: cmdAddHp, desc: "add-hp [N] — add HP" },
  "set-money": { fn: cmdSetMoney, desc: "set-money [N] — set coins" },
  "add-money": { fn: cmdAddMoney, desc: "add-money [N] — add coins" },
  "set-xp": { fn: cmdSetXp, desc: "set-xp [N] — set XP" },
  "add-xp": { fn: cmdAddXp, desc: "add-xp [N] — add XP" },
  "set-lvl": { fn: cmdSetLvl, desc: "set-lvl [N] — set level" },
  kill: { fn: cmdKill, desc: "Kill all enemies" },
  god: { fn: cmdGod, desc: "Toggle god mode" },
  wave: { fn: cmdWave, desc: "wave [N] — jump to wave N" },
  clear: { fn: cmdClear, desc: "Clear console" },
  "unlock-all": { fn: cmdUnlockAll, desc: "Unlock all characters" },
  heal: { fn: cmdHeal, desc: "Full HP restore" },
};

function codeToChar(code, shift) {
  if (code.startsWith("Key")) {
    const c = code[3].toLowerCase();
    return shift ? c.toUpperCase() : c;
  }
  if (code.startsWith("Digit")) {
    const d = code[5];
    if (!shift) return d;
    return { "1":"!", "2":"@", "3":"#", "4":"$", "5":"%", "6":"^", "7":"&", "8":"*", "9":"(", "0":")" }[d] || d;
  }
  const map = {
    Minus: ["-", "_"], Equal: ["=", "+"],
    BracketLeft: ["[", "{"], BracketRight: ["]", "}"],
    Backslash: ["\\", "|"], Semicolon: [";", ":"],
    Quote: ["'", "\""], Comma: [",", "<"],
    Period: [".", ">"], Slash: ["/", "?"],
    Backquote: ["`", "~"], Space: [" ", " "],
    IntlBackslash: ["\\", "|"],
  };
  if (map[code]) return shift ? map[code][1] : map[code][0];
  return null;
}

function updateConsoleDisplay() {
  consoleInput.textContent = consoleBuffer;
}

function toggleConsole() {
  isConsoleOpen = !isConsoleOpen;
  if (isConsoleOpen) {
    consoleOverlay.classList.remove("hidden");
    consoleBuffer = "";
    historyIndex = consoleHistory.length;
    updateConsoleDisplay();
    clearHeldKeys();
  } else {
    consoleOverlay.classList.add("hidden");
  }
}

function handleConsoleKeydown(e) {
  if (e.code === "Enter") {
    e.preventDefault();
    const line = consoleBuffer;
    consoleBuffer = "";
    historyIndex = consoleHistory.length;
    updateConsoleDisplay();
    executeCommand(line);
    return;
  }
  if (e.code === "Escape" || (e.ctrlKey && e.code === "KeyC")) {
    e.preventDefault();
    if (isConsoleOpen) toggleConsole();
    return;
  }
  if (e.code === "Backspace") {
    e.preventDefault();
    consoleBuffer = consoleBuffer.slice(0, -1);
    updateConsoleDisplay();
    return;
  }
  if (e.code === "ArrowUp") {
    e.preventDefault();
    if (consoleHistory.length === 0) return;
    historyIndex = Math.max(0, historyIndex - 1);
    consoleBuffer = consoleHistory[historyIndex];
    updateConsoleDisplay();
    return;
  }
  if (e.code === "ArrowDown") {
    e.preventDefault();
    if (historyIndex >= consoleHistory.length - 1) {
      historyIndex = consoleHistory.length;
      consoleBuffer = "";
    } else {
      historyIndex++;
      consoleBuffer = consoleHistory[historyIndex];
    }
    updateConsoleDisplay();
    return;
  }
  const ch = codeToChar(e.code, e.shiftKey);
  if (ch !== null) {
    e.preventDefault();
    consoleBuffer += ch;
    updateConsoleDisplay();
  }
}

function addOutput(text, color = "#aaa") {
  consoleOutput.push({ text, color });
  renderOutput();
}

function renderOutput() {
  consoleOutputEl.innerHTML = consoleOutput
    .map((o) => `<div class="console-line" style="color:${o.color}">${o.text}</div>`)
    .join("");
  consoleOutputEl.scrollTop = consoleOutputEl.scrollHeight;
}

function executeCommand(line) {
  const trimmed = line.trim();
  if (!trimmed) return;
  consoleHistory.push(trimmed);
  historyIndex = consoleHistory.length;
  addOutput("> " + trimmed, "#999");
  const cmdStr = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  const parts = cmdStr.split(/\s+/);
  const cmdName = parts[0].toLowerCase();
  const args = parts.slice(1);
  const cmd = CONSOLE_COMMANDS[cmdName];
  if (!cmd) {
    addOutput("Unknown command. Type help", "#ff5555");
    return;
  }
  try {
    const result = cmd.fn(args);
    if (result !== undefined && result !== null) {
      addOutput(result, "#00e5ff");
    }
  } catch (e) {
    addOutput("Error: " + e.message, "#ff5555");
  }
}

function cmdHelp() {
  const lines = Object.entries(CONSOLE_COMMANDS)
    .map(([name, cmd]) => "  " + name + " — " + cmd.desc)
    .join("\n");
  return "Available commands:\n" + lines;
}

function cmdSetHp(args) {
  const n = parseInt(args[0]);
  if (isNaN(n) || n < 0) return "Enter a number";
  player.hp = Math.min(n, player.maxHp);
  updateUI();
  return "HP = " + Math.ceil(player.hp);
}

function cmdSetMaxHp(args) {
  const n = parseInt(args[0]);
  if (isNaN(n) || n < 1) return "Enter a number > 0";
  player.maxHp = n;
  player.hp = Math.min(player.hp, player.maxHp);
  updateUI();
  return "Max HP = " + player.maxHp;
}

function cmdAddHp(args) {
  const n = parseInt(args[0]);
  if (isNaN(n)) return "Enter a number";
  player.hp = Math.min(player.hp + n, player.maxHp);
  updateUI();
  return "HP = " + Math.ceil(player.hp);
}

function cmdSetMoney(args) {
  const n = parseInt(args[0]);
  if (isNaN(n) || n < 0) return "Enter a number";
  coins = n;
  updateUI();
  return "Coins = " + Math.floor(coins);
}

function cmdAddMoney(args) {
  const n = parseInt(args[0]);
  if (isNaN(n)) return "Enter a number";
  coins += n;
  updateUI();
  return "Coins = " + Math.floor(coins);
}

function cmdSetXp(args) {
  const n = parseInt(args[0]);
  if (isNaN(n) || n < 0) return "Enter a number";
  player.xp = n;
  updateUI();
  return "XP = " + player.xp;
}

function cmdAddXp(args) {
  const n = parseInt(args[0]);
  if (isNaN(n)) return "Enter a number";
  player.xp += n;
  updateUI();
  return "XP = " + player.xp;
}

function cmdSetLvl(args) {
  const n = parseInt(args[0]);
  if (isNaN(n) || n < 1) return "Enter a number >= 1";
  player.level = n;
  updateUI();
  return "Level = " + player.level;
}

function cmdKill() {
  if (enemies.length === 0) return "No enemies";
  const count = enemies.length;
  for (let i = enemies.length - 1; i >= 0; i--) {
    handleEnemyDeath(enemies[i], i);
  }
  return "Killed " + count + " enemies";
}

function cmdGod() {
  isGodMode = !isGodMode;
  return "God mode: " + (isGodMode ? "ON" : "OFF");
}

function cmdWave(args) {
  const n = parseInt(args[0]);
  if (isNaN(n) || n < 1) return "Enter wave number (>=1)";
  enemies.length = 0;
  waveActive = false;
  waveCleared = false;
  isBossWave = false;
  currentWave = n - 1;
  startWave();
  return "Wave " + n;
}

function cmdClear() {
  consoleOutput = [];
  renderOutput();
}

function cmdUnlockAll() {
  for (const key of Object.keys(CHARACTERS)) {
    charUnlocked[key] = true;
  }
  if (savedProgress) {
    savedProgress.charUnlocked = { ...charUnlocked };
    dbSave(savedProgress);
  }
  return "All characters unlocked";
}

function cmdHeal() {
  player.hp = player.maxHp;
  player.invulnerable = false;
  updateUI();
  return "HP restored";
}
