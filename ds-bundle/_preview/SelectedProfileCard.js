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

  // .design-sync/previews/SelectedProfileCard.tsx
  var SelectedProfileCard_exports = {};
  __export(SelectedProfileCard_exports, {
    BeautyKol: () => BeautyKol,
    TechKol: () => TechKol
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

  // .design-sync/previews/SelectedProfileCard.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  function avatar(hue) {
    return "data:image/svg+xml;utf8," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="hsl(${hue},70%,88%)"/><circle cx="48" cy="38" r="20" fill="hsl(${hue},65%,55%)"/><rect x="20" y="62" width="56" height="34" rx="16" fill="hsl(${hue},65%,55%)"/></svg>`
    );
  }
  var linhChi = {
    id: "kol-01",
    name: "Nguyễn Linh Chi",
    niche: "Làm đẹp",
    platform: "TikTok",
    followers: 128e4,
    rating: 4.7,
    engagementRate: 6.42,
    avatarUrl: avatar(330),
    youtubeHandle: "@linhchibeauty",
    sentimentScoreComponent: 82.5,
    engagementQuality: 78.1,
    topicAuthority: 74.9,
    controversyRisk: 12.3,
    kolScore: 87.64
  };
  var minhQuang = {
    id: "kol-02",
    name: "Trần Minh Quang",
    niche: "Công nghệ",
    platform: "YouTube",
    followers: 542e3,
    rating: 4.4,
    engagementRate: 3.18,
    avatarUrl: avatar(210),
    youtubeHandle: "@quangtech",
    sentimentScoreComponent: 71.2,
    engagementQuality: 64.8,
    topicAuthority: 88.3,
    controversyRisk: 34.6,
    kolScore: 72.09
  };
  function BeautyKol() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: 360 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.SelectedProfileCard, { profile: linhChi }) });
  }
  function TechKol() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: 360 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.SelectedProfileCard, { profile: minhQuang }) });
  }
  return __toCommonJS(SelectedProfileCard_exports);
})();
