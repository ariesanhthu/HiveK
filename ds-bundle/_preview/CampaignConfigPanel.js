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

  // .design-sync/previews/CampaignConfigPanel.tsx
  var CampaignConfigPanel_exports = {};
  __export(CampaignConfigPanel_exports, {
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

  // .design-sync/previews/CampaignConfigPanel.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var img = (label, hue) => `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500'><rect width='400' height='500' fill='hsl(${hue} 45% 88%)'/><rect x='24' y='24' width='352' height='452' rx='16' fill='hsl(${hue} 40% 78%)'/><text x='200' y='260' font-family='sans-serif' font-size='22' font-weight='700' fill='hsl(${hue} 35% 38%)' text-anchor='middle'>${label}</text></svg>`
  )}`;
  var campaign = {
    id: "ontop-fashion-windbreaker",
    name: "ON TOP Jacket Drop",
    status: "reviewing",
    objective: "sales",
    platforms: ["facebook", "threads", "instagram"],
    accountIds: ["fb-ontop", "threads-ontop", "ig-ontop"],
    productIds: ["lightweight-windbreaker"],
    productName: "Áo khoác gió ON TOP",
    description: "Chiến dịch ra mắt áo khoác gió ON TOP cho người trẻ cần một item gọn, dễ phối, đi học đi làm đi chơi đều dùng được.",
    keyMessage: "Nhẹ nhưng chỉn chu: cản gió, chống thấm nhẹ, phối được nhiều outfit hằng ngày.",
    targetAudience: "Nam nữ 18-28 tuổi thành phố, thích streetwear tối giản.",
    usp: "Form unisex, chất liệu nhẹ, màu trung tính dễ phối.",
    offer: "Freeship đơn đầu + voucher 10% với mã OTOP10.",
    cta: "Comment size để được tư vấn phối đồ",
    tone: {
      preset: "youthful",
      formality: 2,
      emojiLevel: "low",
      language: "vi",
      perspective: "brand",
      requiredKeywords: ["áo khoác gió", "unisex"],
      bannedKeywords: ["rẻ nhất"],
      suggestedHashtags: ["#ONTOP", "#OOTD"]
    },
    media: [
      { id: "m1", type: "image", url: img("Lookbook phố", 20), name: "Lookbook streetwear", role: "lifestyle" },
      { id: "m2", type: "image", url: img("Flatlay áo", 210), name: "Flatlay áo khoác", role: "product" }
    ],
    platformContent: [
      {
        platform: "facebook",
        postingStyle: "Bài bán hàng storytelling ngắn, CTA comment size.",
        primaryFormat: "Album 4 ảnh",
        contentAngle: "Một item cho ngày đi học, đi làm và đi chơi.",
        mediaDirection: "Ảnh 1 hero outfit, ảnh 2 chất liệu, ảnh 3 phối đồ, ảnh 4 CTA.",
        caption: "Có những ngày chỉ cần một chiếc áo khoác gọn là outfit nhìn chỉn chu hơn hẳn. ON TOP Jacket nhẹ, dễ phối. Comment chiều cao/cân nặng để tụi mình gợi ý size.",
        hashtags: ["#ONTOP", "#Aokhoacgio"]
      },
      {
        platform: "threads",
        postingStyle: "Conversation-first, ngắn, kéo comment.",
        primaryFormat: "Text + 1 ảnh",
        contentAngle: "Áo khoác nào mặc được cả tuần?",
        mediaDirection: "Một ảnh outfit tối giản, nền sạch.",
        caption: "Một chiếc áo khoác gió dễ phối cứu khá nhiều ngày không biết mặc gì. Team thích màu basic hay màu nổi?",
        hashtags: ["#ONTOP", "#OOTD"]
      },
      {
        platform: "instagram",
        postingStyle: "Visual-first, hook 1 dòng, CTA DM.",
        primaryFormat: "Carousel 5 ảnh",
        contentAngle: "3 cách phối áo khoác gió ON TOP.",
        mediaDirection: "Full outfit, detail khóa, phối jeans, phối short, CTA DM.",
        caption: "3 outfit với một chiếc jacket nhẹ. Lưu lại và DM ONTOP để tư vấn size.",
        hashtags: ["#ONTOP", "#MinimalStreetwear"]
      }
    ],
    commentReplyExamples: [
      { id: "q1", intent: "size", question: "Mình cao 1m68 nặng 58kg mặc size nào?", answer: "Bạn tham khảo size M nếu thích form vừa, hoặc L cho oversize nhẹ. Gửi thêm số đo vai/ngực để ON TOP check kỹ nha." },
      { id: "q2", intent: "material", question: "Áo này có chống nước không shop?", answer: "Áo chống thấm nhẹ, hợp mưa nhỏ hoặc đi đường gió. Mưa lớn lâu thì vẫn nên dùng áo mưa chuyên dụng nhé." },
      { id: "q3", intent: "pricing", question: "Giá bao nhiêu, có mã giảm không?", answer: "Bạn comment mã OTOP10 hoặc nhắn tin, tụi mình gửi giá hiện tại kèm voucher đơn đầu." }
    ],
    postingPlan: [],
    tracking: { impressions: 0, reach: 0, engagementRate: 0, clicks: 0, comments: 0, leads: 0, conversionRate: 0, spend: 0, revenue: 0 },
    aiConfig: { numberOfPosts: 9, variantsPerPost: 3, creativity: 4, contentStrategies: [], generateCaption: true, generateHashtags: true, generateCta: true, generateMediaPrompt: true, generateSchedule: true, suggestCreators: true, approvalMode: "per_post" },
    invite: { enabled: true, defaultCode: "ONTOP10", inviteLink: "/campaigns/ontop/invite?code=ONTOP10", permissions: ["view_brief"] },
    createdAt: "",
    updatedAt: ""
  };
  function Default() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: 880 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.CampaignConfigPanel, { campaign }) });
  }
  return __toCommonJS(CampaignConfigPanel_exports);
})();
