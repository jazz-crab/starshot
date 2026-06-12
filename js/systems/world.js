/**
 * WORLD.JS - Obstacle collision
 */
obstacles.length = 0;
function generateMap() {
  obstacles.length = 0;
}
function checkCircleObstacleCollision(x, y, radius) {
  let rx = x, ry = y;
  for (const o of obstacles) {
    const dx = x - o.worldX, dy = y - o.worldY;
    const dist = Math.hypot(dx, dy);
    const minDist = radius + o.radius;
    if (dist < minDist && dist > 0) {
      const overlap = minDist - dist;
      rx += (dx / dist) * overlap;
      ry += (dy / dist) * overlap;
    }
  }
  return { x: rx, y: ry };
}
