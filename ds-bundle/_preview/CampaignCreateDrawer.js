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

  // .design-sync/previews/CampaignCreateDrawer.tsx
  var CampaignCreateDrawer_exports = {};
  __export(CampaignCreateDrawer_exports, {
    Open: () => Open
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

  // .design-sync/previews/CampaignCreateDrawer.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var defaultForm = {
    name: "ON TOP Jacket Drop",
    objective: "sales",
    platforms: ["facebook", "threads", "instagram"],
    productName: "Áo khoác gió ON TOP",
    cta: "Comment size để được tư vấn",
    landingUrl: "https://ontop.brand",
    description: "Chiến dịch ra mắt áo khoác gió ON TOP cho người trẻ cần một item gọn, dễ phối.",
    keyMessage: "Nhẹ nhưng chỉn chu: cản gió, chống thấm nhẹ, phối được nhiều outfit.",
    targetAudience: "Nam nữ 18-28 tuổi thành phố, thích streetwear tối giản.",
    customerInsight: "Khách muốn áo nhìn gọn, lên ảnh đẹp nhưng vẫn hữu dụng.",
    usp: "Form unisex, chất liệu nhẹ, màu trung tính dễ phối.",
    offer: "Freeship đơn đầu + voucher 10% với mã OTOP10.",
    tonePreset: "youthful",
    formality: 2,
    emojiLevel: "low",
    language: "vi",
    perspective: "brand",
    requiredKeywords: "áo khoác gió, unisex",
    bannedKeywords: "rẻ nhất, chống nước 100%",
    suggestedHashtags: "#ONTOP, #OOTD",
    numberOfPosts: 9,
    variantsPerPost: 3,
    creativity: 4,
    approvalMode: "per_post",
    inviteEnabled: true,
    inviteCode: "ONTOP10"
  };
  function Open() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { position: "relative", width: 1e3, height: 760, overflow: "hidden" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.CampaignCreateDrawer,
      {
        isOpen: true,
        mode: "create",
        defaultForm,
        onClose: () => {
        },
        onCreateCampaign: () => {
        }
      }
    ) });
  }
  return __toCommonJS(CampaignCreateDrawer_exports);
})();
