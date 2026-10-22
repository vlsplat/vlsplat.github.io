// 3D point-level comparison: one WebGL canvas, two point clouds, shared camera.
// The left part of the canvas (scissor) draws the baseline, the right part ours,
// split by a draggable divider — the 3D analogue of the 2D slider.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PLYLoader } from "three/addons/loaders/PLYLoader.js";
import { POINT_3D as CFG } from "./config.js";

const root = document.getElementById("cmp3d");
const stage = root.querySelector(".pc-stage");
const handle = stage.querySelector(".cmp-handle");
const status = stage.querySelector(".pc-status");
const dsTabs = root.querySelector(".pc-datasets");
const scTabs = root.querySelector(".pc-scenes");
const referenceVideo = root.querySelector(".pc-reference-video");
const videoScene = root.querySelector(".pc-video-scene");
const videoStatus = root.querySelector(".pc-video-status");
const oursTabs = root.querySelector(".pc-ours-variants");
const sizeInput = root.querySelector(".pc-size");

stage.querySelector(".cmp-label-left").textContent = CFG.baseline.label;
stage.querySelector(".cmp-label-right").textContent = CFG.ours.label;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// PLYLoader converts vertex colors from sRGB to linear; encode back for display.
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setScissorTest(true);
stage.prepend(renderer.domElement);

const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);
camera.up.set(0, 0, 1); // ScanNet / Replica are Z-up
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const bg = new THREE.Color(0xffffff);
const sceneL = new THREE.Scene(); sceneL.background = bg;
const sceneR = new THREE.Scene(); sceneR.background = bg;
const material = new THREE.PointsMaterial({ size: 0.02, vertexColors: true, sizeAttenuation: true });

const loader = new PLYLoader();
const cache = new Map();
const load = url => {
  if (!cache.has(url)) cache.set(url, loader.loadAsync(url));
  return cache.get(url);
};

let state = { ds: 0, sc: 0, variant: 0, pos: 50 };
let token = 0;

function pills(container, items, active, onPick) {
  container.innerHTML = "";
  if (items.length < 2) { // nothing to choose between: show it as a plain label
    if (items.length) container.innerHTML = `<span class="dataset-label">${items[0]}</span>`;
    return;
  }
  items.forEach((label, i) => {
    const b = document.createElement("button");
    b.className = "pill" + (i === active ? " is-active" : "");
    b.textContent = label;
    b.onclick = () => onPick(i);
    container.appendChild(b);
  });
}

function setPoints(scene, geom) {
  scene.clear();
  scene.add(new THREE.Points(geom, material));
}

function frame(geom) {
  geom.computeBoundingSphere();
  const { center, radius } = geom.boundingSphere;
  controls.target.copy(center);
  camera.position.copy(center).add(new THREE.Vector3(radius * 0.9, -radius * 1.1, radius * 1.0));
  camera.near = radius / 100; camera.far = radius * 20;
  camera.updateProjectionMatrix();
  controls.update();
}

async function show(reframe) {
  const ds = CFG.datasets[state.ds];
  const sc = ds.scenes[state.sc];
  const baseline = CFG.baseline;
  const variants = CFG.oursVariants?.[sc] || [CFG.ours];
  if (state.variant >= variants.length) state.variant = 0;
  const ours = variants[state.variant];
  oursTabs.hidden = variants.length < 2;
  pills(oursTabs, variants.map(v => v.label), state.variant, i => {
    state.variant = i; show(false);
  });
  stage.querySelector(".cmp-label-right").textContent = ours.label;

  stage.querySelector(".cmp-label-left").textContent = baseline.label;
  document.querySelector(".pc-baseline-name").textContent = baseline.label;
  pills(dsTabs, CFG.datasets.map(d => d.name), state.ds, i => { state = { ...state, ds: i, sc: 0, variant: 0 }; show(true); });
  pills(scTabs, ds.scenes, state.sc, i => { state.sc = i; state.variant = 0; show(true); });

  const my = ++token;
  status.textContent = "Loading point clouds…";
  status.hidden = false;
  const base = `static/data/3d/${ds.dir}/${sc}/`;
  // Reference geometry is rendered offline; the public page loads video only.
  const videoBase = `static/data/3d/${ds.dir}/videos/${sc}_gt_rgb_orbit`;
  if (referenceVideo.dataset.scene !== `${ds.dir}/${sc}`) {
    referenceVideo.pause();
    referenceVideo.dataset.scene = `${ds.dir}/${sc}`;
    referenceVideo.poster = videoBase + ".webp?v=960";
    referenceVideo.src = videoBase + ".mp4?v=960";
    videoScene.textContent = sc;
    videoStatus.textContent = "Semantic GT · RGB mesh · 360° reference";
    referenceVideo.load();
  }
  try {
    // A baseline result that has not been exported yet must not block our own result.
    const [gl, gr] = await Promise.all([
      load(base + baseline.key + ".ply").catch(() => null),
      load(base + ours.key + ".ply"),
    ]);
    if (my !== token) return; // a newer request superseded this one
    if (gl) setPoints(sceneL, gl); else sceneL.clear();
    setPoints(sceneR, gr);
    if (reframe) frame(gr);
    status.textContent = `${baseline.label} result not available for ${sc} yet`;
    status.hidden = !!gl;
  } catch (err) {
    if (my === token) status.textContent = `Could not load ${base}: ${err.message ?? err}`;
  }
}

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);

function setPos(pct) {
  state.pos = Math.max(0, Math.min(100, pct));
  handle.style.left = `${state.pos}%`;
}

// The divider handle owns its own drag so it doesn't fight OrbitControls.
handle.addEventListener("pointerdown", e => {
  e.stopPropagation();
  handle.setPointerCapture(e.pointerId);
  const move = ev => {
    const r = stage.getBoundingClientRect();
    setPos(((ev.clientX - r.left) / r.width) * 100);
  };
  const up = () => { handle.removeEventListener("pointermove", move); handle.removeEventListener("pointerup", up); };
  handle.addEventListener("pointermove", move);
  handle.addEventListener("pointerup", up);
});
handle.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") setPos(state.pos - 2);
  if (e.key === "ArrowRight") setPos(state.pos + 2);
});

sizeInput.addEventListener("input", () => (material.size = sizeInput.value / 1000));

let running = false;
function loop() {
  if (!running) return;
  requestAnimationFrame(loop);
  controls.update();
  const w = stage.clientWidth, h = stage.clientHeight;
  const split = Math.round((w * state.pos) / 100);
  renderer.setViewport(0, 0, w, h);
  renderer.setScissor(0, 0, split, h);
  renderer.render(sceneL, camera);
  renderer.setScissor(split, 0, w - split, h);
  renderer.render(sceneR, camera);
}

referenceVideo.addEventListener("error", () => {
  videoStatus.textContent = "Reference video could not load. Select another scene or reload the page.";
});

// Only load data / render while the viewer is on screen.
let started = false;
new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting && !started) { started = true; resize(); show(true); }
  running = entry.isIntersecting;
  if (running) loop();
}).observe(root);
setPos(50);
