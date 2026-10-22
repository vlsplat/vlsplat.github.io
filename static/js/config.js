// ---------------------------------------------------------------------------
// VLSplat project page — data configuration
// Edit this file to add/remove scenes. Paths are relative to index.html.
// ---------------------------------------------------------------------------

// Semantic palette (sampled from the paper figures) shown in the legend (keep in sync with the colors you use
// when exporting renders / point clouds, see tools/export_pointcloud.py).
export const PALETTE = [
  ["wall",      "#89b0d4"],
  ["floor",     "#abe790"],
  ["ceiling",   "#cfcfcf"],
  ["bed",       "#ff6a1b"],
  ["cabinet",   "#2e6bd3"],
  ["chair",     "#de2626"],
  ["curtain",   "#01a337"],
  ["desk",      "#ffd400"],
  ["door",      "#a05a1c"],
  ["monitor",   "#f377da"],
  ["picture",   "#ff9b14"],
  ["sofa",      "#8a60d1"],
  ["window",    "#2db7d3"],
  ["unlabeled", "#373737"],
];

// ---------------------------------------------------------------------------
// 2D render-level comparison (test views):  LangSplatV2  |  VLSplat (Ours)
//   static/data/2d/<dataset>/<scene>/<view>/{rgb,ref,langsplatv2,ours}.webp
// A scene with an empty `views` list shows a "not available yet" note.
// ---------------------------------------------------------------------------
export const RENDER_2D = {
  baseline: { key: "langsplatv2", label: "LangSplatV2" },
  ours:     { key: "ours",        label: "VLSplat (Ours)" },
  oursVariants: [{ key: "ours", label: "VLSplat" }], // one entry = no variant switch
  ext: "webp",
  datasets: [
    {
      name: "ScanNet++",
      dir: "scannetpp",
      scenes: [
        { id: "8b5caf3398", views: ["DSC02799", "DSC02800", "DSC02805"] },
        { id: "09bced689e", views: ["DSC08693", "DSC08683", "DSC08692"] },
        { id: "1ae9e5d2a6", views: ["DSC06898", "DSC06908", "DSC06900"] },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 3D point-level comparison:  PanoGS  |  VLSplat (Ours)
//   static/data/3d/<dataset>/<scene>/{panogs,opengaussian,ours}.ply
//   static/data/3d/<dataset>/videos/<scene>_gt_rgb_orbit.{mp4,webp}
// Binary PLY with float x,y,z and uchar red,green,blue (vertex colors).
// ---------------------------------------------------------------------------
export const POINT_3D = {
  baseline: { key: "panogs", label: "PanoGS" },
  ours:     { key: "ours",   label: "VLSplat (Ours)" },
  oursVariants: {
    scene0070_00: [
      { key: "ours_30k", label: "VLSplat" },
      { key: "ours_roi_30k", label: "VLSplat†" },
    ],
    scene0590_00: [
      { key: "ours_30k", label: "VLSplat" },
      { key: "ours_roi_30k", label: "VLSplat†" },
    ],
    scene0200_00: [
      { key: "ours_30k", label: "VLSplat" },
      { key: "ours_roi_30k", label: "VLSplat†" },
    ],
  },
  datasets: [
    { name: "ScanNetV2", dir: "scannetv2", scenes: ["scene0070_00", "scene0200_00", "scene0590_00"] },
  ],
};
