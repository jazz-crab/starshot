/**
 * DB.JS - IndexedDB for progress storage
 */

const DB_NAME = "PetrovichGameDB";
const DB_VERSION = 1;
const STORE_NAME = "progress";

const DEFAULT_PROGRESS = {
  id: "main",
  coins: 0,
  bestScore: 0,
  bestLevel: 1,
  bestTime: 0,
  totalKills: 0,
  totalDamage: 0,
  playsCount: 0,
  unlockedWeapons: ["pistol"],
  permaUpgrades: { permaHp: 0, permaDmg: 0, permaSpd: 0 },
  charUnlocked: { assault: true },
  settings: {
    autoFire: false,
    sfxVolume: 1,
    musicVolume: 0.5,
  },
};

let savedProgress = null;

function getSavedProgress() {
  return savedProgress;
}

function dbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME))
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function dbLoad() {
  return dbOpen().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get("main");
      req.onsuccess = () => {
        db.close();
        resolve(req.result);
      };
      req.onerror = (e) => {
        db.close();
        reject(e.target.error);
      };
    });
  });
}

function dbSave(data) {
  return dbOpen().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(data);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = (e) => {
        db.close();
        reject(e.target.error);
      };
    });
  });
}

function dbInit(callback) {
  dbLoad()
    .then((data) => {
      savedProgress = { ...DEFAULT_PROGRESS, ...(data || {}) };
      if (callback) callback(savedProgress);
    })
    .catch(() => {
      savedProgress = { ...DEFAULT_PROGRESS };
      if (callback) callback(savedProgress);
    });
}
