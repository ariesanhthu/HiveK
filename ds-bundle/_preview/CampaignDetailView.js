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

  // .design-sync/previews/CampaignDetailView.tsx
  var CampaignDetailView_exports = {};
  __export(CampaignDetailView_exports, {
    FullDetail: () => FullDetail
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

  // .design-sync/previews/CampaignDetailView.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  function img(w, h, bg, label) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='${w}' height='${h}' fill='${bg}'/><text x='50%' y='54%' font-family='Arial' font-size='${Math.round(h / 4)}' fill='white' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
  var detail = {
    id: "CDN-2024-0187",
    title: "Sữa Rửa Mặt Cocoon x Beauty KOLs",
    status: "active",
    externalIdLabel: "Mã chiến dịch: CDN-2024-0187",
    createdByLabel: "Tạo bởi Nguyễn Thu Trang",
    stats: [
      { id: "s1", label: "Ngân sách", value: "40 triệu", metaLabel: "Đã dùng 58%", metaVariant: "secondary", icon: "payments" },
      { id: "s2", label: "Thời gian", value: "18 ngày", metaLabel: "Còn 6 ngày", metaVariant: "warning", icon: "calendar_month" },
      { id: "s3", label: "KOL tham gia", value: "32", metaLabel: "4 chờ duyệt", metaVariant: "warning", icon: "groups" },
      { id: "s4", label: "Chuyển đổi", value: "1.240", metaLabel: "+18% tuần này", metaVariant: "success", icon: "shopping_cart" }
    ],
    kpis: [
      { id: "k1", label: "Tỷ lệ hoàn thành", valueLabel: "82%", percent: 82, strokeClass: "stroke-orange-500" },
      { id: "k2", label: "Tương tác mục tiêu", valueLabel: "6,4%", percent: 64, strokeClass: "stroke-emerald-500" },
      { id: "k3", label: "Ngân sách đã dùng", valueLabel: "58%", percent: 58, strokeClass: "stroke-sky-500" }
    ],
    creators: [
      { id: "c1", name: "Hoà Minzy", avatarUrl: img(80, 80, "#e63946", "HM"), reachLabel: "1,8 triệu", engagementLabel: "6,4%", status: "live" },
      { id: "c2", name: "Call Me Duy", avatarUrl: img(80, 80, "#457b9d", "CD"), reachLabel: "920K", engagementLabel: "8,1%", status: "live" },
      { id: "c3", name: "Trinh Phạm", avatarUrl: img(80, 80, "#f4a261", "TP"), reachLabel: "1,2 triệu", engagementLabel: "5,7%", status: "pending_post" }
    ],
    brief: {
      niches: ["Làm đẹp", "Skincare", "Review mỹ phẩm"],
      platforms: ["instagram", "tiktok", "youtube"],
      audience: "Nữ giới 18–30 tuổi tại các thành phố lớn, quan tâm chăm sóc da và mỹ phẩm thuần chay.",
      pdfBriefLabel: "Xem brief đầy đủ (PDF)"
    },
    recentContent: [
      { id: "ct1", thumbnailUrl: img(144, 144, "#e63946", "Reel"), title: "Unbox sữa rửa mặt Cocoon cà phê", authorName: "Hoà Minzy", timeLabel: "2 giờ trước", state: "pending_review" },
      { id: "ct2", thumbnailUrl: img(144, 144, "#2a9d8f", "Video"), title: "Trải nghiệm 7 ngày dùng bí đao", authorName: "Chan La Cà", timeLabel: "3 ngày trước", state: "approved" }
    ],
    totalContentCount: 27
  };
  function FullDetail() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: 1200 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.CampaignDetailView, { detail }) });
  }
  return __toCommonJS(CampaignDetailView_exports);
})();
