// 2D render-level comparison: draggable before/after slider on fixed views, the 2D twin of the 3D viewer.
// Header (dataset / scene pills + GT reference), stage (baseline | VLSplat with a variant switch), view thumbnails.
import { RENDER_2D as CFG } from "./config.js";

const root = document.getElementById("cmp2d");
const stage = root.querySelector(".cmp-stage");
const imgL = stage.querySelector(".cmp-left img");
const imgR = stage.querySelector(".cmp-right img");
const layerR = stage.querySelector(".cmp-right");
const handle = stage.querySelector(".cmp-handle");
const status = stage.querySelector(".pc-status");
const dsTabs = root.querySelector(".cmp-datasets");
const scTabs = root.querySelector(".cmp-scenes");
const oursTabs = root.querySelector(".pc-ours-variants");
const thumbs = root.querySelector(".cmp-thumbs");
const refImg = root.querySelector(".cmp2d-ref-img");
const viewName = root.querySelector(".cmp2d-view-name");
const refStatus = root.querySelector(".cmp2d-status");

stage.querySelector(".cmp-label-left").textContent = CFG.baseline.label;
stage.querySelector(".cmp-label-right").textContent = CFG.ours.label;
root.querySelector(".cmp2d-baseline-name").textContent = CFG.baseline.label;

let state = { ds: 0, sc: 0, view: 0, variant: 0, pos: 50 };

const path = (ds, sc, view, key) => `static/data/2d/${ds.dir}/${sc.id}/${view}/${key}.${CFG.ext}`;

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

function render() {
  const ds = CFG.datasets[state.ds];
  const sc = ds.scenes[state.sc];
  const view = sc.views[state.view];
  const variant = CFG.oursVariants[state.variant];

  pills(dsTabs, CFG.datasets.map(d => d.name), state.ds, i => { state = { ...state, ds: i, sc: 0, view: 0 }; render(); });
  pills(scTabs, ds.scenes.map(s => s.id), state.sc, i => { state = { ...state, sc: i, view: 0 }; render(); });
  oursTabs.hidden = CFG.oursVariants.length < 2;
  if (!oursTabs.hidden) pills(oursTabs, CFG.oursVariants.map(v => v.label), state.variant, i => { state.variant = i; render(); });

  thumbs.innerHTML = "";
  viewName.textContent = sc.id;
  stage.classList.toggle("is-empty", !view);
  if (!view) { // no renders for this scene yet
    imgL.removeAttribute("src"); imgR.removeAttribute("src"); refImg.removeAttribute("src");
    refStatus.textContent = "No render available yet";
    status.hidden = false;
    status.textContent = `2D renders for ${sc.id} are not available yet`;
    return;
  }
  status.hidden = true;
  refStatus.textContent = `Semantic GT (left) · RGB (right) · view ${view}`;
  imgL.src = path(ds, sc, view, CFG.baseline.key);
  imgR.src = path(ds, sc, view, variant.key);
  refImg.src = path(ds, sc, view, "ref");

  sc.views.forEach((v, i) => {
    const img = document.createElement("img");
    img.src = path(ds, sc, v, "rgb");
    img.alt = `view ${v}`;
    img.className = i === state.view ? "is-active" : "";
    img.onclick = () => { state.view = i; render(); };
    thumbs.appendChild(img);
  });
}

function setPos(pct) {
  state.pos = Math.max(0, Math.min(100, pct));
  layerR.style.clipPath = `inset(0 0 0 ${state.pos}%)`;
  handle.style.left = `${state.pos}%`;
  handle.setAttribute("aria-valuenow", Math.round(state.pos));
}

// Drag anywhere on the stage (mouse + touch via pointer events); the variant buttons keep their own clicks.
let dragging = false;
const fromEvent = e => {
  const r = stage.getBoundingClientRect();
  setPos(((e.clientX - r.left) / r.width) * 100);
};
stage.addEventListener("pointerdown", e => {
  if (e.target.closest(".pc-ours-controls")) return;
  dragging = true; stage.setPointerCapture(e.pointerId); fromEvent(e);
});
stage.addEventListener("pointermove", e => dragging && fromEvent(e));
stage.addEventListener("pointerup", () => (dragging = false));
handle.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") setPos(state.pos - 2);
  if (e.key === "ArrowRight") setPos(state.pos + 2);
});

render();
setPos(50);
