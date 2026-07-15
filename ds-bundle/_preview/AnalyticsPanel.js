var __dsPreview = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // <define:import.meta.env>
  var init_define_import_meta_env = __esm({
    "<define:import.meta.env>"() {
    }
  });

  // ds-raw:__ds_raw__
  var require_ds_raw = __commonJS({
    "ds-raw:__ds_raw__"(exports, module) {
      init_define_import_meta_env();
      module.exports = window.HiveKUI;
    }
  });

  // shim:react-shim
  var require_react_shim = __commonJS({
    "shim:react-shim"(exports, module) {
      init_define_import_meta_env();
      var R = window.React;
      function np(p, k) {
        var o = {};
        for (var x in p) if (x !== "children") o[x] = p[x];
        if (k !== void 0) o.key = k;
        return o;
      }
      function jsx2(t, p, k) {
        var c = p && p.children;
        return c === void 0 ? R.createElement(t, np(p, k)) : R.createElement(t, np(p, k), c);
      }
      function jsxs(t, p, k) {
        return R.createElement.apply(R, [t, np(p, k)].concat(p.children));
      }
      module.exports = R;
      module.exports.jsx = jsx2;
      module.exports.jsxs = jsxs;
      module.exports.jsxDEV = function(t, p, k, s) {
        return (s ? jsxs : jsx2)(t, p, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // .design-sync/previews/AnalyticsPanel.tsx
  var AnalyticsPanel_exports = {};
  __export(AnalyticsPanel_exports, {
    Default: () => Default
  });
  init_define_import_meta_env();

  // ds-shim:ds
  var ds_exports = {};
  __export(ds_exports, {
    default: () => ds_default
  });
  init_define_import_meta_env();
  __reExport(ds_exports, __toESM(require_ds_raw()));
  var g = window.HiveKUI;
  var ds_default = "default" in g ? g.default : g;

  // .design-sync/previews/AnalyticsPanel.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  function avatar(hue) {
    return "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="72" height="72" fill="hsl(${hue},70%,88%)"/><circle cx="36" cy="28" r="15" fill="hsl(${hue},65%,55%)"/><rect x="14" y="46" width="44" height="26" rx="12" fill="hsl(${hue},65%,55%)"/></svg>`
    );
  }
  var profiles = [
    {
      id: "kol-01",
      name: "Nguyễn Linh Chi",
      niche: "Làm đẹp",
      platform: "TikTok",
      followers: 128e4,
      rating: 4.7,
      engagementRate: 6.42,
      avatarUrl: avatar(330),
      youtubeHandle: "linhchibeauty",
      sentimentScoreComponent: 82.5,
      engagementQuality: 78.1,
      topicAuthority: 74.9,
      controversyRisk: 1.8,
      kolScore: 87.64
    },
    {
      id: "kol-02",
      name: "Trần Minh Quang",
      niche: "Công nghệ",
      platform: "YouTube",
      followers: 542e3,
      rating: 4.4,
      engagementRate: 3.18,
      avatarUrl: avatar(210),
      youtubeHandle: "quangtech",
      sentimentScoreComponent: 71.2,
      engagementQuality: 64.8,
      topicAuthority: 88.3,
      controversyRisk: 6.9,
      kolScore: 72.09
    },
    {
      id: "kol-03",
      name: "Phạm Thu Hà",
      niche: "Đời sống",
      platform: "Instagram",
      followers: 89e4,
      rating: 4.5,
      engagementRate: 5.11,
      avatarUrl: avatar(20),
      youtubeHandle: "thuha.daily",
      sentimentScoreComponent: 76.4,
      engagementQuality: 71.2,
      topicAuthority: 69.5,
      controversyRisk: 4.2,
      kolScore: 80.31
    }
  ];
  var radarMetrics = [
    { metric: "Cảm xúc", value: 82.5 },
    { metric: "Tương tác", value: 78.1 },
    { metric: "Chuyên môn", value: 74.9 },
    { metric: "Độ tin cậy", value: 88.2 },
    { metric: "Tăng trưởng", value: 71.6 }
  ];
  var scoreHistogram = [
    { label: "40-50", count: 8 },
    { label: "50-60", count: 21 },
    { label: "60-70", count: 46 },
    { label: "70-80", count: 88 },
    { label: "80-90", count: 61 },
    { label: "90-100", count: 24 }
  ];
  var controversyHistogram = [
    { label: "0-2", count: 92 },
    { label: "2-4", count: 74 },
    { label: "4-6", count: 45 },
    { label: "6-8", count: 22 },
    { label: "8-10", count: 15 }
  ];
  var platformScores = [
    { platform: "TikTok", kolScore: 81.4 },
    { platform: "Instagram", kolScore: 74.2 },
    { platform: "YouTube", kolScore: 78.9 }
  ];
  var nicheEngagement = [
    { niche: "Làm đẹp", engagementRate: 6.4, fill: "#ec4899" },
    { niche: "Game", engagementRate: 4.8, fill: "#8b5cf6" },
    { niche: "Đời sống", engagementRate: 5.2, fill: "#3b82f6" },
    { niche: "Công nghệ", engagementRate: 3.1, fill: "#14b8a6" },
    { niche: "Thể hình", engagementRate: 4, fill: "#f59e0b" }
  ];
  var scatterPoints = [
    { name: "Linh Chi", niche: "Làm đẹp", engagementQuality: 78, kolScore: 87.6, followers: 128e4 },
    { name: "Minh Quang", niche: "Công nghệ", engagementQuality: 65, kolScore: 72.1, followers: 542e3 },
    { name: "Thu Hà", niche: "Đời sống", engagementQuality: 71, kolScore: 80.3, followers: 89e4 },
    { name: "Đức Anh", niche: "Game", engagementQuality: 58, kolScore: 66.4, followers: 32e4 },
    { name: "Bảo Ngọc", niche: "Thể hình", engagementQuality: 69, kolScore: 76.8, followers: 61e4 }
  ];
  var platformRisk = [
    { platform: "TikTok", min: 1.2, avg: 3.8, max: 7.4 },
    { platform: "Instagram", min: 1.8, avg: 4.6, max: 8.1 },
    { platform: "YouTube", min: 2.1, avg: 5.2, max: 9 }
  ];
  var audienceTree = [
    { label: "TikTok", followers: 412e4, kolScore: 81.4 },
    { label: "Instagram", followers: 268e4, kolScore: 74.2 },
    { label: "YouTube", followers: 194e4, kolScore: 78.9 }
  ];
  function Default() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: 1120 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.AnalyticsPanel,
      {
        profiles,
        selectedProfile: profiles[0],
        selectedProfileId: profiles[0].id,
        radarMetrics,
        scoreHistogram,
        controversyHistogram,
        platformScores,
        nicheEngagement,
        scatterPoints,
        platformRisk,
        audienceTree,
        onSelectedProfileChange: () => {
        }
      }
    ) });
  }
  return __toCommonJS(AnalyticsPanel_exports);
})();
