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

  // .design-sync/previews/PostContentPanel.tsx
  var PostContentPanel_exports = {};
  __export(PostContentPanel_exports, {
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

  // .design-sync/previews/PostContentPanel.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var post = {
    id: "p1",
    day: 1,
    dateLabel: "Thứ 2 · 15/06",
    time: "20:00",
    title: "Teaser áo khoác gió ON TOP",
    goal: "Tạo nhận biết sản phẩm mới + kéo comment hỏi size",
    platform: "facebook",
    accountId: "fb-ontop",
    content: "Có những ngày chỉ cần một chiếc áo khoác gọn là outfit nhìn chỉn chu hơn hẳn. ON TOP Jacket nhẹ, dễ phối, hợp đi học, đi làm lẫn cafe cuối tuần. Comment chiều cao/cân nặng, tụi mình gợi ý size và cách phối phù hợp nha.",
    firstComment: "Ai cần tư vấn size cứ comment chiều cao/cân nặng bên dưới nhé!",
    suggestedReplies: ["Bạn cao bao nhiêu để shop tư vấn size?", "Inbox shop để nhận mã OTOP10 nha", "Áo còn đủ màu bạn nhé"],
    mediaAsset: void 0,
    mediaPrompt: "Ảnh hero outfit streetwear tối giản, nền phố sạch, màu áo nổi rõ.",
    status: "needs-review",
    reviewer: "Hoàng Nam",
    reviewNote: "",
    scheduledAt: "2026-06-15T20:00",
    hashtags: ["#ONTOP", "#Aokhoacgio"]
  };
  var accounts = [
    { id: "fb-ontop", platform: "facebook", name: "ON TOP Official" },
    { id: "fb-ontop-shop", platform: "facebook", name: "ON TOP Shop HCM" }
  ];
  function Default() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: 820 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.PostContentPanel,
      {
        post,
        accounts,
        onPostChange: () => {
        },
        onPlatformChange: () => {
        },
        onOptimizeContent: () => {
        },
        onGenerateMedia: () => {
        },
        onAddSuggestedReply: () => {
        }
      }
    ) });
  }
  return __toCommonJS(PostContentPanel_exports);
})();
