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

  // .design-sync/previews/ParticipantsTab.tsx
  var ParticipantsTab_exports = {};
  __export(ParticipantsTab_exports, {
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

  // .design-sync/previews/ParticipantsTab.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var campaign = {
    id: "ontop-fashion-windbreaker",
    name: "ON TOP Jacket Drop",
    invite: { defaultCode: "ONTOP10" }
  };
  var participants = [
    {
      id: "p-owner",
      campaignId: "ontop-fashion-windbreaker",
      name: "Anh Thư",
      role: "owner",
      status: "joined",
      contactChannel: "email",
      contactValue: "anhthu@hivek.vn",
      inviteCode: "OWNER",
      inviteLink: "/campaigns/ontop/invite?code=OWNER",
      permissions: ["view_brief", "manage_posts", "manage_participants"]
    },
    {
      id: "p-mina",
      campaignId: "ontop-fashion-windbreaker",
      name: "Mina Outfit",
      role: "koc",
      status: "discussing",
      contactChannel: "instagram",
      contactValue: "@mina.outfit",
      inviteCode: "MINA10",
      inviteLink: "/campaigns/ontop/invite?code=MINA10",
      permissions: ["view_brief", "upload_media", "submit_draft"]
    },
    {
      id: "p-tu",
      campaignId: "ontop-fashion-windbreaker",
      name: "Tú Mix Đồ",
      role: "creator",
      status: "invited",
      contactChannel: "facebook",
      contactValue: "tumixdo",
      inviteCode: "TUMIX",
      inviteLink: "/campaigns/ontop/invite?code=TUMIX",
      permissions: ["view_brief", "submit_draft"]
    },
    {
      id: "p-review",
      campaignId: "ontop-fashion-windbreaker",
      name: "Hoàng Nam",
      role: "reviewer",
      status: "joined",
      contactChannel: "email",
      contactValue: "nam.review@hivek.vn",
      inviteCode: "REVIEW",
      inviteLink: "/campaigns/ontop/invite?code=REVIEW",
      permissions: ["view_brief", "manage_posts"]
    }
  ];
  function Default() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: 860 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ds_exports.ParticipantsTab,
      {
        campaign,
        participants,
        onAddParticipant: () => {
        },
        onCopyInviteLink: () => {
        },
        onRemoveParticipant: () => {
        }
      }
    ) });
  }
  return __toCommonJS(ParticipantsTab_exports);
})();
