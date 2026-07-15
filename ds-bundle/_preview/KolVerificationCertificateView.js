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

  // .design-sync/previews/KolVerificationCertificateView.tsx
  var KolVerificationCertificateView_exports = {};
  __export(KolVerificationCertificateView_exports, {
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

  // .design-sync/previews/KolVerificationCertificateView.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var avatarUrl = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112"><rect width="112" height="112" fill="#fbcfe8"/><circle cx="56" cy="44" r="24" fill="#db2777"/><rect x="24" y="72" width="64" height="40" rx="18" fill="#db2777"/></svg>'
  );
  var data = {
    slug: "nguyen-linh-chi",
    displayName: "Nguyễn Linh Chi",
    roleLabel: "Beauty Creator · TikTok & Instagram",
    verificationId: "HK-2026-0417-LC",
    issueDateLabel: "08 tháng 7, 2026",
    aggregateRating: 4.7,
    avatarUrl,
    competencies: [
      { key: "authentic", title: "Xác thực", subtext: "Audience thật > 94%, không bot" },
      { key: "impact", title: "Hiệu quả", subtext: "CVR chiến dịch trung bình 3.8%" },
      { key: "history", title: "Lịch sử", subtext: "32 chiến dịch hoàn thành" }
    ],
    checks: [
      { id: "c1", label: "Đã xác minh danh tính qua CCCD và số điện thoại", passed: true },
      { id: "c2", label: "Chỉ số tương tác được kiểm chứng độc lập", passed: true },
      { id: "c3", label: "Không có vi phạm brand-safety trong 12 tháng", passed: true },
      { id: "c4", label: "Sở hữu kênh được xác nhận qua OAuth nền tảng", passed: true }
    ],
    partnerFeedback: [
      {
        id: "f1",
        quote: "Linh Chi giao nội dung đúng hạn, chất lượng cao và tỷ lệ chuyển đổi vượt kỳ vọng cho dòng serum mới của chúng tôi.",
        partnerName: "La Roche-Posay VN",
        rating: "5.0 / 5"
      },
      {
        id: "f2",
        quote: "Tương tác chân thực, cộng đồng phản hồi tích cực. Sẽ tiếp tục hợp tác trong các đợt ra mắt tới.",
        partnerName: "Hasaki Beauty",
        rating: "4.6 / 5"
      }
    ],
    issuingAuthority: "HiveK Creator Trust Authority",
    digitalSignatureLabel: "Chữ ký số bởi HiveK Verification Engine",
    signatureHash: "sha256:9f3c8a1e7b204d6f8e2a5c9d1b0f4e7a6c3d8b2f1a5e9c0d7b4f2a8e1c6d3b9f"
  };
  function Default() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.KolVerificationCertificateView, { data, verifyUrl: "https://hivek.vn/verify/HK-2026-0417-LC" });
  }
  return __toCommonJS(KolVerificationCertificateView_exports);
})();
