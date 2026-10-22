# VLSplat project page

Static page (Nerfies style), served as-is by GitHub Pages. No build step — preview locally with:

```bash
python3 -m http.server 8000   # open http://localhost:8000
```

## Sections
1. Title, venue, authors, links (Paper / arXiv / Supp / Code are disabled until the URLs are added in `index.html`)
2. Qualitative results (Fig. 3 / Fig. 4 tabs) + abstract
3. Method: overview (Fig. 1), 3-step summary, refinement figure (Fig. 2)
4. **Render-level 3DGS segmentation** (ScanNet++): drag slider, LangSplatV2 vs. VLSplat on test views; Table 2
5. **Point-level 3D segmentation** (ScanNetV2): ground-truth orbit video, then a three.js split viewer
   (PanoGS vs. VLSplat / VLSplat†) with one shared orbit camera; Table 3
6. BibTeX

## Data
Scenes are listed in `static/js/config.js`; files follow these paths:

```
static/data/2d/<dataset>/<scene>/<view>/{rgb,ref,langsplatv2,ours}.webp
static/data/3d/<dataset>/<scene>/{panogs,ours_30k,ours_roi_30k}.ply
static/data/3d/<dataset>/videos/<scene>_gt_rgb_orbit.{mp4,webp}
```

PLYs are binary with float `x,y,z` and uchar `red,green,blue`, colored with the palette in `config.js`.
`.gitignore` only publishes the ScanNetV2 scenes listed in the config; add a `!` line for each new scene folder.
