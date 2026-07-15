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

  // ds-raw:__ds_raw__
  var require_ds_raw = __commonJS({
    "ds-raw:__ds_raw__"(exports, module) {
      init_define_import_meta_env();
      module.exports = window.HiveKUI;
    }
  });

  // .design-sync/previews/SearchResultsList.tsx
  var SearchResultsList_exports = {};
  __export(SearchResultsList_exports, {
    Default: () => Default
  });
  init_define_import_meta_env();
  var import_react = __toESM(require_react_shim());

  // ds-shim:ds
  var ds_exports = {};
  __export(ds_exports, {
    default: () => ds_default
  });
  init_define_import_meta_env();
  __reExport(ds_exports, __toESM(require_ds_raw()));
  var g = window.HiveKUI;
  var ds_default = "default" in g ? g.default : g;

  // .design-sync/previews/SearchResultsList.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var candidates = [
    {
      id: "sr1",
      name: "Mai Anh Beauty",
      type: "KOL",
      niche: "Làm đẹp",
      platform: "tiktok",
      followers: 86e4,
      engagementRate: 6.4,
      fitScore: 92,
      estimatedCpaUsd: 4.8,
      avgRoi: 4.7,
      estimatedCostPerPostUsd: 1200
    },
    {
      id: "sr2",
      name: "Trần Quốc Huy",
      type: "KOC",
      niche: "Công nghệ & Game",
      platform: "youtube",
      followers: 245e3,
      engagementRate: 5.1,
      fitScore: 84,
      estimatedCpaUsd: 5.6,
      avgRoi: 4.2,
      estimatedCostPerPostUsd: 780
    },
    {
      id: "sr3",
      name: "Phạm Ngọc Lan",
      type: "KOL",
      niche: "Thời trang",
      platform: "instagram",
      followers: 132e4,
      engagementRate: 4.3,
      fitScore: 88,
      estimatedCpaUsd: 6.1,
      avgRoi: 4.5,
      estimatedCostPerPostUsd: 1650
    }
  ];
  function Default() {
    const [selected, setSelected] = (0, import_react.useState)(["sr1"]);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: 1e3 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.SearchResultsList,
      {
        candidates,
        selectedCandidateIds: selected,
        onToggleCandidate: (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]),
        onInviteSelected: () => {
        }
      }
    ) });
  }
  return __toCommonJS(SearchResultsList_exports);
})();
