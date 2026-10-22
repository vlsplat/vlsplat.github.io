// Decorative hero background: a sparse, slowly rotating "segmented room" point
// cloud drawn in the semantic palette. Pure 2D canvas, no dependencies.
import { PALETTE } from "./config.js";

const canvas = document.querySelector(".hero-cloud");
const ctx = canvas.getContext("2d");
const color = Object.fromEntries(PALETTE);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Seeded RNG so the cloud looks the same on every load.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pts = [];
const box = (n, [x0, y0, z0], [x1, y1, z1], label) => {
  for (let i = 0; i < n; i++)
    pts.push([x0 + rand() * (x1 - x0), y0 + rand() * (y1 - y0), z0 + rand() * (z1 - z0), color[label]]);
};

// Room centred at the origin, z-up, roughly 6 x 5 x 2.6 m.
box(900, [-3, -2.5, 0], [3, 2.5, 0], "floor");
box(350, [-3, 2.5, 0], [3, 2.5, 2.6], "wall");
box(300, [-3, -2.5, 0], [-3, 2.5, 2.6], "wall");
box(80,  [-1.2, 2.5, 1.0], [0.4, 2.5, 2.0], "window");
box(50,  [-3, -1.2, 1.1], [-3, -0.3, 1.7], "picture");
box(160, [-1, -0.5, 0.75], [1, 0.5, 0.75], "desk");
box(40,  [-0.3, 0.3, 0.75], [0.3, 0.35, 1.1], "monitor");
box(120, [-2.95, 1.2, 0], [-2.4, 2.4, 1.8], "cabinet");
box(140, [1.6, -2.3, 0.4], [2.9, -1.4, 0.55], "sofa");
for (const [cx, cy] of [[-0.6, -1], [0.6, -1], [-0.6, 1], [0.6, 1]]) {
  box(35, [cx - 0.22, cy - 0.22, 0.45], [cx + 0.22, cy + 0.22, 0.45], "chair");
  box(25, [cx - 0.22, cy + Math.sign(cy) * 0.22, 0.45], [cx + 0.22, cy + Math.sign(cy) * 0.22, 0.95], "chair");
}

let w = 0, h = 0, dpr = 1;
function resize() {
  dpr = Math.min(devicePixelRatio, 2);
  w = canvas.clientWidth; h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw(t) {
  ctx.clearRect(0, 0, w, h);
  const a = t * 0.00006 + 0.6, ca = Math.cos(a), sa = Math.sin(a);
  const tilt = 0.95, ct = Math.cos(tilt), st = Math.sin(tilt);
  const scale = Math.min(w * 0.9, h * 1.5) / 9, cam = 9;
  const proj = pts.map(([x, y, z, c]) => {
    const xr = x * ca - y * sa, yr = x * sa + y * ca, zc = z - 1.0;
    const yv = yr * ct - zc * st, zv = yr * st + zc * ct; // tilt camera down
    const s = cam / (cam + yv);
    return [w / 2 + xr * s * scale, h * 0.52 - zv * s * scale, s, c, yv];
  }).sort((p, q) => q[4] - p[4]); // far to near
  for (const [px, py, s, c] of proj) {
    ctx.globalAlpha = 0.25 + 0.5 * (s - 0.6);
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(px, py, 1.6 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

let visible = true;
function loop(t) {
  if (!visible) return;
  draw(t);
  if (!reduceMotion) requestAnimationFrame(loop);
}

new ResizeObserver(() => { resize(); draw(performance.now()); }).observe(canvas);
new IntersectionObserver(([e]) => {
  visible = e.isIntersecting;
  if (visible) requestAnimationFrame(loop);
}).observe(canvas);
