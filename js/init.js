var GAME_SCRIPTS = [
  "js/core/config.js",
  "js/core/state.js",
  "js/core/db.js",
  "js/core/localization.js",
  "js/entities/player.js",
  "js/entities/effects.js",
  "js/entities/weapons.js",
  "js/entities/enemies.js",
  "js/systems/audio.js",
  "js/systems/world.js",
  "js/systems/camera.js",
  "js/systems/combat.js",
  "js/systems/ai.js",
  // "tools/ai/innovations.js",
  // "tools/ai/network.js",
  // "tools/ai/genome.js",
  // "tools/ai/bridge.js",
  "js/systems/render.js",
  "js/ui/ui.js",
  "js/systems/console.js",
  "js/core/input.js",
  "js/core/engine.js",
];

var scriptIdx = 0;

function loadScript(src) {
  var s = document.createElement("script");
  s.src = src;
  s.onload = function () { scriptLoaded(); };
  s.onerror = function () { scriptLoaded(); };
  document.body.appendChild(s);
}

function scriptLoaded() {
  scriptIdx++;
  if (scriptIdx === 1) {
    // dom.js just loaded — build DOM before loading game scripts
    buildDOM();
  }
  if (scriptIdx < SCRIPTS.length) {
    loadScript(SCRIPTS[scriptIdx]);
  }
}

// Total script list: dom.js first, then all game scripts
var SCRIPTS = ["js/dom.js"].concat(GAME_SCRIPTS);
loadScript(SCRIPTS[0]);
