obstacles.length = 0;
const CHUNK_SIZE = 2000;
const MIN_ROCK_SEP = 70;
const generatedChunks = {};
const chunkRocks = {};
let lastChunkX, lastChunkY;

function generateRock(x, y, size) {
  const numVertices = 6 + Math.floor(Math.random() * 5);
  const vertices = [];
  for (let i = 0; i < numVertices; i++) {
    const a = (i / numVertices) * Math.PI * 2;
    const r = size * (0.65 + Math.random() * 0.35);
    vertices.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  const outlineSegments = [];
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    const edgeLen = Math.hypot(b.x - a.x, b.y - a.y);
    const segCount = Math.max(1, Math.ceil(edgeLen / 8));
    for (let j = 0; j < segCount; j++) {
      const t1 = j / segCount;
      const t2 = (j + 1) / segCount;
      outlineSegments.push({
        x1: a.x + (b.x - a.x) * t1,
        y1: a.y + (b.y - a.y) * t1,
        x2: a.x + (b.x - a.x) * t2,
        y2: a.y + (b.y - a.y) * t2,
        broken: false,
      });
    }
  }
  const hp = Math.max(50, Math.floor(size * 2.5));
  return {
    worldX: x,
    worldY: y,
    vertices,
    size,
    hp,
    maxHp: hp,
    outlineSegments,
    color: "#5a5a5a",
  };
}

function isInsidePolygon(lx, ly, vertices) {
  let positive = 0, negative = 0;
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    const cross = (b.x - a.x) * (ly - a.y) - (b.y - a.y) * (lx - a.x);
    if (cross > 0) positive++;
    else if (cross < 0) negative++;
    if (positive > 0 && negative > 0) return false;
  }
  return true;
}

function destroyRock(o, index) {
  if (!o.vertices) return;
  for (let k = 0; k < 20; k++)
    particles.push(new Particle(o.worldX, o.worldY, o.color));
  shakeIntensity += 3;
  obstacles.splice(index, 1);
}

function getRockRadiusInDirection(dx, dy, vertices) {
  let maxT = 0;
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const denom = dx * ey - dy * ex;
    if (Math.abs(denom) < 1e-10) continue;
    const t = (a.x * ey - a.y * ex) / denom;
    const s = (a.x * dy - a.y * dx) / denom;
    if (t >= 0 && s >= 0 && s <= 1 && t > maxT) maxT = t;
  }
  return maxT;
}

function generateChunkRocks(cx, cy) {
  const key = `${cx},${cy}`;
  const centerX = cx * CHUNK_SIZE + CHUNK_SIZE / 2;
  const centerY = cy * CHUNK_SIZE + CHUNK_SIZE / 2;
  const rocks = [];

  function overlapsExisting(x, y, size) {
    for (const ok in chunkRocks) {
      const [ocx, ocy] = ok.split(',').map(Number);
      if (Math.abs(ocx - cx) > 2 || Math.abs(ocy - cy) > 2) continue;
      for (const o of chunkRocks[ok]) {
        if (Math.hypot(x - o.worldX, y - o.worldY) < size + (o.size || o.radius || 30) + MIN_ROCK_SEP)
          return true;
      }
    }
    for (const o of rocks) {
      if (Math.hypot(x - o.worldX, y - o.worldY) < size + (o.size || 30) + MIN_ROCK_SEP)
        return true;
    }
    return false;
  }

  const count = 5 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) {
    let x, y, size, valid;
    let attempts = 0;
    do {
      x = centerX - CHUNK_SIZE / 2 + Math.random() * CHUNK_SIZE;
      y = centerY - CHUNK_SIZE / 2 + Math.random() * CHUNK_SIZE;
      const sizeRoll = Math.random();
      if (sizeRoll < 0.2) size = 30 + Math.random() * 20;
      else if (sizeRoll < 0.5) size = 50 + Math.random() * 80;
      else if (sizeRoll < 0.8) size = 130 + Math.random() * 150;
      else size = 280 + Math.random() * 320;
      valid = Math.hypot(x, y) >= 350 + size && !overlapsExisting(x, y, size);
      attempts++;
    } while (!valid && attempts < 20);
    if (valid) { const r = generateRock(x, y, size); obstacles.push(r); rocks.push(r); }
  }
  chunkRocks[key] = rocks;
}

function removeChunkRocks(key) {
  const rocks = chunkRocks[key];
  if (!rocks) return;
  for (const r of rocks) {
    const idx = obstacles.indexOf(r);
    if (idx >= 0) obstacles.splice(idx, 1);
  }
  delete chunkRocks[key];
}

function updateChunks() {
  const cx = Math.floor(camera.x / CHUNK_SIZE);
  const cy = Math.floor(camera.y / CHUNK_SIZE);
  if (cx === lastChunkX && cy === lastChunkY) return;
  lastChunkX = cx; lastChunkY = cy;

  const halfW = canvas.width / 2;
  const halfH = canvas.height / 2;
  const buf = 2;
  const minX = camera.x - halfW - canvas.width * buf;
  const maxX = camera.x + halfW + canvas.width * buf;
  const minY = camera.y - halfH - canvas.height * buf;
  const maxY = camera.y + halfH + canvas.height * buf;
  const minCX = Math.floor(minX / CHUNK_SIZE);
  const maxCX = Math.floor(maxX / CHUNK_SIZE);
  const minCY = Math.floor(minY / CHUNK_SIZE);
  const maxCY = Math.floor(maxY / CHUNK_SIZE);
  const needed = {};
  for (let ncx = minCX; ncx <= maxCX; ncx++)
    for (let ncy = minCY; ncy <= maxCY; ncy++)
      needed[`${ncx},${ncy}`] = true;
  for (const key in needed)
    if (!generatedChunks[key]) { generateChunkRocks(...key.split(',').map(Number)); generatedChunks[key] = true; }
  for (const key in generatedChunks)
    if (!needed[key]) { removeChunkRocks(key); delete generatedChunks[key]; }
}

function getPolygonEdgeDist(worldX, worldY, vertices, ox, oy) {
  const lx = worldX - ox;
  const ly = worldY - oy;
  let minDist = Infinity;
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % vertices.length];
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const len2 = abx * abx + aby * aby;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((lx - a.x) * abx + (ly - a.y) * aby) / len2));
    const cx = a.x + abx * t;
    const cy = a.y + aby * t;
    const d = Math.hypot(lx - cx, ly - cy);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

function checkCircleObstacleCollision(x, y, radius) {
  let rx = x, ry = y;
  for (const o of obstacles) {
    if (o.vertices) {
      const lx = rx - o.worldX;
      const ly = ry - o.worldY;
      let bestNx = 0, bestNy = 0;
      let minDist = Infinity;
      for (let i = 0; i < o.vertices.length; i++) {
        const a = o.vertices[i];
        const b = o.vertices[(i + 1) % o.vertices.length];
        const abx = b.x - a.x;
        const aby = b.y - a.y;
        const len2 = abx * abx + aby * aby;
        const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((lx - a.x) * abx + (ly - a.y) * aby) / len2));
        const cx = a.x + abx * t;
        const cy = a.y + aby * t;
        const dx = lx - cx;
        const dy = ly - cy;
        const d = Math.hypot(dx, dy);
        if (d < minDist) {
          minDist = d;
          if (d > 0) {
            bestNx = dx / d;
            bestNy = dy / d;
          } else {
            const nx = aby;
            const ny = -abx;
            const nlen = Math.hypot(nx, ny);
            if (nlen > 0) {
              bestNx = nx / nlen;
              bestNy = ny / nlen;
            }
          }
        }
      }
      const inside = isInsidePolygon(lx, ly, o.vertices);
      if (inside) {
        rx -= bestNx * (minDist + radius);
        ry -= bestNy * (minDist + radius);
      } else if (minDist < radius) {
        const overlap = radius - minDist;
        rx += bestNx * overlap;
        ry += bestNy * overlap;
      }
    } else {
      const dx = x - o.worldX, dy = y - o.worldY;
      const dist = Math.hypot(dx, dy);
      const minDist = radius + o.radius;
      if (dist < minDist && dist > 0) {
        const overlap = minDist - dist;
        rx += (dx / dist) * overlap;
        ry += (dy / dist) * overlap;
      }
    }
  }
  return { x: rx, y: ry };
}
