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
  var __copyProps = (to2, from2, except, desc) => {
    if (from2 && typeof from2 === "object" || typeof from2 === "function") {
      for (let key of __getOwnPropNames(from2))
        if (!__hasOwnProp.call(to2, key) && key !== except)
          __defProp(to2, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
    }
    return to2;
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
      function jsxs2(t, p, k) {
        return R.createElement.apply(R, [t, np(p, k)].concat(p.children));
      }
      module.exports = R;
      module.exports.jsx = jsx2;
      module.exports.jsxs = jsxs2;
      module.exports.jsxDEV = function(t, p, k, s) {
        return (s ? jsxs2 : jsx2)(t, p, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // shim:react-dom-shim
  var require_react_dom_shim = __commonJS({
    "shim:react-dom-shim"(exports, module) {
      init_define_import_meta_env();
      var D = window.ReactDOM;
      var n = function() {
      };
      module.exports = Object.assign({ preload: n, preinit: n, preconnect: n, prefetchDNS: n, preloadModule: n, preinitModule: n }, D);
    }
  });

  // node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
  var require_use_sync_external_store_shim_development = __commonJS({
    "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      (function() {
        function is3(x, y) {
          return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
        }
        function useSyncExternalStore$2(subscribe, getSnapshot) {
          didWarnOld18Alpha || void 0 === React31.startTransition || (didWarnOld18Alpha = true, console.error(
            "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
          ));
          var value = getSnapshot();
          if (!didWarnUncachedGetSnapshot) {
            var cachedValue = getSnapshot();
            objectIs(value, cachedValue) || (console.error(
              "The result of getSnapshot should be cached to avoid an infinite loop"
            ), didWarnUncachedGetSnapshot = true);
          }
          cachedValue = useState12({
            inst: { value, getSnapshot }
          });
          var inst = cachedValue[0].inst, forceUpdate = cachedValue[1];
          useLayoutEffect9(
            function() {
              inst.value = value;
              inst.getSnapshot = getSnapshot;
              checkIfSnapshotChanged(inst) && forceUpdate({ inst });
            },
            [subscribe, value, getSnapshot]
          );
          useEffect17(
            function() {
              checkIfSnapshotChanged(inst) && forceUpdate({ inst });
              return subscribe(function() {
                checkIfSnapshotChanged(inst) && forceUpdate({ inst });
              });
            },
            [subscribe]
          );
          useDebugValue2(value);
          return value;
        }
        function checkIfSnapshotChanged(inst) {
          var latestGetSnapshot = inst.getSnapshot;
          inst = inst.value;
          try {
            var nextValue = latestGetSnapshot();
            return !objectIs(inst, nextValue);
          } catch (error) {
            return true;
          }
        }
        function useSyncExternalStore$1(subscribe, getSnapshot) {
          return getSnapshot();
        }
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
        var React31 = require_react_shim(), objectIs = "function" === typeof Object.is ? Object.is : is3, useState12 = React31.useState, useEffect17 = React31.useEffect, useLayoutEffect9 = React31.useLayoutEffect, useDebugValue2 = React31.useDebugValue, didWarnOld18Alpha = false, didWarnUncachedGetSnapshot = false, shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
        exports.useSyncExternalStore = void 0 !== React31.useSyncExternalStore ? React31.useSyncExternalStore : shim;
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
      })();
    }
  });

  // node_modules/use-sync-external-store/shim/index.js
  var require_shim = __commonJS({
    "node_modules/use-sync-external-store/shim/index.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      if (false) {
        module.exports = null;
      } else {
        module.exports = require_use_sync_external_store_shim_development();
      }
    }
  });

  // node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js
  var require_with_selector_development = __commonJS({
    "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      (function() {
        function is3(x, y) {
          return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
        }
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
        var React31 = require_react_shim(), shim = require_shim(), objectIs = "function" === typeof Object.is ? Object.is : is3, useSyncExternalStore2 = shim.useSyncExternalStore, useRef18 = React31.useRef, useEffect17 = React31.useEffect, useMemo11 = React31.useMemo, useDebugValue2 = React31.useDebugValue;
        exports.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
          var instRef = useRef18(null);
          if (null === instRef.current) {
            var inst = { hasValue: false, value: null };
            instRef.current = inst;
          } else inst = instRef.current;
          instRef = useMemo11(
            function() {
              function memoizedSelector(nextSnapshot) {
                if (!hasMemo) {
                  hasMemo = true;
                  memoizedSnapshot = nextSnapshot;
                  nextSnapshot = selector(nextSnapshot);
                  if (void 0 !== isEqual && inst.hasValue) {
                    var currentSelection = inst.value;
                    if (isEqual(currentSelection, nextSnapshot))
                      return memoizedSelection = currentSelection;
                  }
                  return memoizedSelection = nextSnapshot;
                }
                currentSelection = memoizedSelection;
                if (objectIs(memoizedSnapshot, nextSnapshot))
                  return currentSelection;
                var nextSelection = selector(nextSnapshot);
                if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
                  return memoizedSnapshot = nextSnapshot, currentSelection;
                memoizedSnapshot = nextSnapshot;
                return memoizedSelection = nextSelection;
              }
              var hasMemo = false, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
              return [
                function() {
                  return memoizedSelector(getSnapshot());
                },
                null === maybeGetServerSnapshot ? void 0 : function() {
                  return memoizedSelector(maybeGetServerSnapshot());
                }
              ];
            },
            [getSnapshot, getServerSnapshot, selector, isEqual]
          );
          var value = useSyncExternalStore2(subscribe, instRef[0], instRef[1]);
          useEffect17(
            function() {
              inst.hasValue = true;
              inst.value = value;
            },
            [value]
          );
          useDebugValue2(value);
          return value;
        };
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
      })();
    }
  });

  // node_modules/use-sync-external-store/shim/with-selector.js
  var require_with_selector = __commonJS({
    "node_modules/use-sync-external-store/shim/with-selector.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      if (false) {
        module.exports = null;
      } else {
        module.exports = require_with_selector_development();
      }
    }
  });

  // node_modules/use-sync-external-store/cjs/use-sync-external-store-with-selector.development.js
  var require_use_sync_external_store_with_selector_development = __commonJS({
    "node_modules/use-sync-external-store/cjs/use-sync-external-store-with-selector.development.js"(exports) {
      "use strict";
      init_define_import_meta_env();
      (function() {
        function is3(x, y) {
          return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
        }
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
        var React31 = require_react_shim(), objectIs = "function" === typeof Object.is ? Object.is : is3, useSyncExternalStore2 = React31.useSyncExternalStore, useRef18 = React31.useRef, useEffect17 = React31.useEffect, useMemo11 = React31.useMemo, useDebugValue2 = React31.useDebugValue;
        exports.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
          var instRef = useRef18(null);
          if (null === instRef.current) {
            var inst = { hasValue: false, value: null };
            instRef.current = inst;
          } else inst = instRef.current;
          instRef = useMemo11(
            function() {
              function memoizedSelector(nextSnapshot) {
                if (!hasMemo) {
                  hasMemo = true;
                  memoizedSnapshot = nextSnapshot;
                  nextSnapshot = selector(nextSnapshot);
                  if (void 0 !== isEqual && inst.hasValue) {
                    var currentSelection = inst.value;
                    if (isEqual(currentSelection, nextSnapshot))
                      return memoizedSelection = currentSelection;
                  }
                  return memoizedSelection = nextSnapshot;
                }
                currentSelection = memoizedSelection;
                if (objectIs(memoizedSnapshot, nextSnapshot))
                  return currentSelection;
                var nextSelection = selector(nextSnapshot);
                if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
                  return memoizedSnapshot = nextSnapshot, currentSelection;
                memoizedSnapshot = nextSnapshot;
                return memoizedSelection = nextSelection;
              }
              var hasMemo = false, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
              return [
                function() {
                  return memoizedSelector(getSnapshot());
                },
                null === maybeGetServerSnapshot ? void 0 : function() {
                  return memoizedSelector(maybeGetServerSnapshot());
                }
              ];
            },
            [getSnapshot, getServerSnapshot, selector, isEqual]
          );
          var value = useSyncExternalStore2(subscribe, instRef[0], instRef[1]);
          useEffect17(
            function() {
              inst.hasValue = true;
              inst.value = value;
            },
            [value]
          );
          useDebugValue2(value);
          return value;
        };
        "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
      })();
    }
  });

  // node_modules/use-sync-external-store/with-selector.js
  var require_with_selector2 = __commonJS({
    "node_modules/use-sync-external-store/with-selector.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      if (false) {
        module.exports = null;
      } else {
        module.exports = require_use_sync_external_store_with_selector_development();
      }
    }
  });

  // node_modules/decimal.js-light/decimal.js
  var require_decimal = __commonJS({
    "node_modules/decimal.js-light/decimal.js"(exports, module) {
      init_define_import_meta_env();
      (function(globalScope) {
        "use strict";
        var MAX_DIGITS = 1e9, Decimal3 = {
          // These values must be integers within the stated ranges (inclusive).
          // Most of these values can be changed during run-time using `Decimal.config`.
          // The maximum number of significant digits of the result of a calculation or base conversion.
          // E.g. `Decimal.config({ precision: 20 });`
          precision: 20,
          // 1 to MAX_DIGITS
          // The rounding mode used by default by `toInteger`, `toDecimalPlaces`, `toExponential`,
          // `toFixed`, `toPrecision` and `toSignificantDigits`.
          //
          // ROUND_UP         0 Away from zero.
          // ROUND_DOWN       1 Towards zero.
          // ROUND_CEIL       2 Towards +Infinity.
          // ROUND_FLOOR      3 Towards -Infinity.
          // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
          // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
          // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
          // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
          // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
          //
          // E.g.
          // `Decimal.rounding = 4;`
          // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
          rounding: 4,
          // 0 to 8
          // The exponent value at and beneath which `toString` returns exponential notation.
          // JavaScript numbers: -7
          toExpNeg: -7,
          // 0 to -MAX_E
          // The exponent value at and above which `toString` returns exponential notation.
          // JavaScript numbers: 21
          toExpPos: 21,
          // 0 to MAX_E
          // The natural logarithm of 10.
          // 115 digits
          LN10: "2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286"
        }, external = true, decimalError = "[DecimalError] ", invalidArgument = decimalError + "Invalid argument: ", exponentOutOfRange = decimalError + "Exponent out of range: ", mathfloor = Math.floor, mathpow = Math.pow, isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, ONE, BASE = 1e7, LOG_BASE = 7, MAX_SAFE_INTEGER = 9007199254740991, MAX_E = mathfloor(MAX_SAFE_INTEGER / LOG_BASE), P = {};
        P.absoluteValue = P.abs = function() {
          var x = new this.constructor(this);
          if (x.s) x.s = 1;
          return x;
        };
        P.comparedTo = P.cmp = function(y) {
          var i, j, xdL, ydL, x = this;
          y = new x.constructor(y);
          if (x.s !== y.s) return x.s || -y.s;
          if (x.e !== y.e) return x.e > y.e ^ x.s < 0 ? 1 : -1;
          xdL = x.d.length;
          ydL = y.d.length;
          for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
            if (x.d[i] !== y.d[i]) return x.d[i] > y.d[i] ^ x.s < 0 ? 1 : -1;
          }
          return xdL === ydL ? 0 : xdL > ydL ^ x.s < 0 ? 1 : -1;
        };
        P.decimalPlaces = P.dp = function() {
          var x = this, w = x.d.length - 1, dp = (w - x.e) * LOG_BASE;
          w = x.d[w];
          if (w) for (; w % 10 == 0; w /= 10) dp--;
          return dp < 0 ? 0 : dp;
        };
        P.dividedBy = P.div = function(y) {
          return divide(this, new this.constructor(y));
        };
        P.dividedToIntegerBy = P.idiv = function(y) {
          var x = this, Ctor = x.constructor;
          return round2(divide(x, new Ctor(y), 0, 1), Ctor.precision);
        };
        P.equals = P.eq = function(y) {
          return !this.cmp(y);
        };
        P.exponent = function() {
          return getBase10Exponent(this);
        };
        P.greaterThan = P.gt = function(y) {
          return this.cmp(y) > 0;
        };
        P.greaterThanOrEqualTo = P.gte = function(y) {
          return this.cmp(y) >= 0;
        };
        P.isInteger = P.isint = function() {
          return this.e > this.d.length - 2;
        };
        P.isNegative = P.isneg = function() {
          return this.s < 0;
        };
        P.isPositive = P.ispos = function() {
          return this.s > 0;
        };
        P.isZero = function() {
          return this.s === 0;
        };
        P.lessThan = P.lt = function(y) {
          return this.cmp(y) < 0;
        };
        P.lessThanOrEqualTo = P.lte = function(y) {
          return this.cmp(y) < 1;
        };
        P.logarithm = P.log = function(base) {
          var r2, x = this, Ctor = x.constructor, pr = Ctor.precision, wpr = pr + 5;
          if (base === void 0) {
            base = new Ctor(10);
          } else {
            base = new Ctor(base);
            if (base.s < 1 || base.eq(ONE)) throw Error(decimalError + "NaN");
          }
          if (x.s < 1) throw Error(decimalError + (x.s ? "NaN" : "-Infinity"));
          if (x.eq(ONE)) return new Ctor(0);
          external = false;
          r2 = divide(ln(x, wpr), ln(base, wpr), wpr);
          external = true;
          return round2(r2, pr);
        };
        P.minus = P.sub = function(y) {
          var x = this;
          y = new x.constructor(y);
          return x.s == y.s ? subtract(x, y) : add(x, (y.s = -y.s, y));
        };
        P.modulo = P.mod = function(y) {
          var q, x = this, Ctor = x.constructor, pr = Ctor.precision;
          y = new Ctor(y);
          if (!y.s) throw Error(decimalError + "NaN");
          if (!x.s) return round2(new Ctor(x), pr);
          external = false;
          q = divide(x, y, 0, 1).times(y);
          external = true;
          return x.minus(q);
        };
        P.naturalExponential = P.exp = function() {
          return exp(this);
        };
        P.naturalLogarithm = P.ln = function() {
          return ln(this);
        };
        P.negated = P.neg = function() {
          var x = new this.constructor(this);
          x.s = -x.s || 0;
          return x;
        };
        P.plus = P.add = function(y) {
          var x = this;
          y = new x.constructor(y);
          return x.s == y.s ? add(x, y) : subtract(x, (y.s = -y.s, y));
        };
        P.precision = P.sd = function(z) {
          var e, sd, w, x = this;
          if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);
          e = getBase10Exponent(x) + 1;
          w = x.d.length - 1;
          sd = w * LOG_BASE + 1;
          w = x.d[w];
          if (w) {
            for (; w % 10 == 0; w /= 10) sd--;
            for (w = x.d[0]; w >= 10; w /= 10) sd++;
          }
          return z && e > sd ? e : sd;
        };
        P.squareRoot = P.sqrt = function() {
          var e, n, pr, r2, s, t, wpr, x = this, Ctor = x.constructor;
          if (x.s < 1) {
            if (!x.s) return new Ctor(0);
            throw Error(decimalError + "NaN");
          }
          e = getBase10Exponent(x);
          external = false;
          s = Math.sqrt(+x);
          if (s == 0 || s == 1 / 0) {
            n = digitsToString(x.d);
            if ((n.length + e) % 2 == 0) n += "0";
            s = Math.sqrt(n);
            e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);
            if (s == 1 / 0) {
              n = "5e" + e;
            } else {
              n = s.toExponential();
              n = n.slice(0, n.indexOf("e") + 1) + e;
            }
            r2 = new Ctor(n);
          } else {
            r2 = new Ctor(s.toString());
          }
          pr = Ctor.precision;
          s = wpr = pr + 3;
          for (; ; ) {
            t = r2;
            r2 = t.plus(divide(x, t, wpr + 2)).times(0.5);
            if (digitsToString(t.d).slice(0, wpr) === (n = digitsToString(r2.d)).slice(0, wpr)) {
              n = n.slice(wpr - 3, wpr + 1);
              if (s == wpr && n == "4999") {
                round2(t, pr + 1, 0);
                if (t.times(t).eq(x)) {
                  r2 = t;
                  break;
                }
              } else if (n != "9999") {
                break;
              }
              wpr += 4;
            }
          }
          external = true;
          return round2(r2, pr);
        };
        P.times = P.mul = function(y) {
          var carry, e, i, k, r2, rL, t, xdL, ydL, x = this, Ctor = x.constructor, xd = x.d, yd = (y = new Ctor(y)).d;
          if (!x.s || !y.s) return new Ctor(0);
          y.s *= x.s;
          e = x.e + y.e;
          xdL = xd.length;
          ydL = yd.length;
          if (xdL < ydL) {
            r2 = xd;
            xd = yd;
            yd = r2;
            rL = xdL;
            xdL = ydL;
            ydL = rL;
          }
          r2 = [];
          rL = xdL + ydL;
          for (i = rL; i--; ) r2.push(0);
          for (i = ydL; --i >= 0; ) {
            carry = 0;
            for (k = xdL + i; k > i; ) {
              t = r2[k] + yd[i] * xd[k - i - 1] + carry;
              r2[k--] = t % BASE | 0;
              carry = t / BASE | 0;
            }
            r2[k] = (r2[k] + carry) % BASE | 0;
          }
          for (; !r2[--rL]; ) r2.pop();
          if (carry) ++e;
          else r2.shift();
          y.d = r2;
          y.e = e;
          return external ? round2(y, Ctor.precision) : y;
        };
        P.toDecimalPlaces = P.todp = function(dp, rm) {
          var x = this, Ctor = x.constructor;
          x = new Ctor(x);
          if (dp === void 0) return x;
          checkInt32(dp, 0, MAX_DIGITS);
          if (rm === void 0) rm = Ctor.rounding;
          else checkInt32(rm, 0, 8);
          return round2(x, dp + getBase10Exponent(x) + 1, rm);
        };
        P.toExponential = function(dp, rm) {
          var str, x = this, Ctor = x.constructor;
          if (dp === void 0) {
            str = toString2(x, true);
          } else {
            checkInt32(dp, 0, MAX_DIGITS);
            if (rm === void 0) rm = Ctor.rounding;
            else checkInt32(rm, 0, 8);
            x = round2(new Ctor(x), dp + 1, rm);
            str = toString2(x, true, dp + 1);
          }
          return str;
        };
        P.toFixed = function(dp, rm) {
          var str, y, x = this, Ctor = x.constructor;
          if (dp === void 0) return toString2(x);
          checkInt32(dp, 0, MAX_DIGITS);
          if (rm === void 0) rm = Ctor.rounding;
          else checkInt32(rm, 0, 8);
          y = round2(new Ctor(x), dp + getBase10Exponent(x) + 1, rm);
          str = toString2(y.abs(), false, dp + getBase10Exponent(y) + 1);
          return x.isneg() && !x.isZero() ? "-" + str : str;
        };
        P.toInteger = P.toint = function() {
          var x = this, Ctor = x.constructor;
          return round2(new Ctor(x), getBase10Exponent(x) + 1, Ctor.rounding);
        };
        P.toNumber = function() {
          return +this;
        };
        P.toPower = P.pow = function(y) {
          var e, k, pr, r2, sign, yIsInt, x = this, Ctor = x.constructor, guard = 12, yn = +(y = new Ctor(y));
          if (!y.s) return new Ctor(ONE);
          x = new Ctor(x);
          if (!x.s) {
            if (y.s < 1) throw Error(decimalError + "Infinity");
            return x;
          }
          if (x.eq(ONE)) return x;
          pr = Ctor.precision;
          if (y.eq(ONE)) return round2(x, pr);
          e = y.e;
          k = y.d.length - 1;
          yIsInt = e >= k;
          sign = x.s;
          if (!yIsInt) {
            if (sign < 0) throw Error(decimalError + "NaN");
          } else if ((k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
            r2 = new Ctor(ONE);
            e = Math.ceil(pr / LOG_BASE + 4);
            external = false;
            for (; ; ) {
              if (k % 2) {
                r2 = r2.times(x);
                truncate(r2.d, e);
              }
              k = mathfloor(k / 2);
              if (k === 0) break;
              x = x.times(x);
              truncate(x.d, e);
            }
            external = true;
            return y.s < 0 ? new Ctor(ONE).div(r2) : round2(r2, pr);
          }
          sign = sign < 0 && y.d[Math.max(e, k)] & 1 ? -1 : 1;
          x.s = 1;
          external = false;
          r2 = y.times(ln(x, pr + guard));
          external = true;
          r2 = exp(r2);
          r2.s = sign;
          return r2;
        };
        P.toPrecision = function(sd, rm) {
          var e, str, x = this, Ctor = x.constructor;
          if (sd === void 0) {
            e = getBase10Exponent(x);
            str = toString2(x, e <= Ctor.toExpNeg || e >= Ctor.toExpPos);
          } else {
            checkInt32(sd, 1, MAX_DIGITS);
            if (rm === void 0) rm = Ctor.rounding;
            else checkInt32(rm, 0, 8);
            x = round2(new Ctor(x), sd, rm);
            e = getBase10Exponent(x);
            str = toString2(x, sd <= e || e <= Ctor.toExpNeg, sd);
          }
          return str;
        };
        P.toSignificantDigits = P.tosd = function(sd, rm) {
          var x = this, Ctor = x.constructor;
          if (sd === void 0) {
            sd = Ctor.precision;
            rm = Ctor.rounding;
          } else {
            checkInt32(sd, 1, MAX_DIGITS);
            if (rm === void 0) rm = Ctor.rounding;
            else checkInt32(rm, 0, 8);
          }
          return round2(new Ctor(x), sd, rm);
        };
        P.toString = P.valueOf = P.val = P.toJSON = function() {
          var x = this, e = getBase10Exponent(x), Ctor = x.constructor;
          return toString2(x, e <= Ctor.toExpNeg || e >= Ctor.toExpPos);
        };
        function add(x, y) {
          var carry, d, e, i, k, len, xd, yd, Ctor = x.constructor, pr = Ctor.precision;
          if (!x.s || !y.s) {
            if (!y.s) y = new Ctor(x);
            return external ? round2(y, pr) : y;
          }
          xd = x.d;
          yd = y.d;
          k = x.e;
          e = y.e;
          xd = xd.slice();
          i = k - e;
          if (i) {
            if (i < 0) {
              d = xd;
              i = -i;
              len = yd.length;
            } else {
              d = yd;
              e = k;
              len = xd.length;
            }
            k = Math.ceil(pr / LOG_BASE);
            len = k > len ? k + 1 : len + 1;
            if (i > len) {
              i = len;
              d.length = 1;
            }
            d.reverse();
            for (; i--; ) d.push(0);
            d.reverse();
          }
          len = xd.length;
          i = yd.length;
          if (len - i < 0) {
            i = len;
            d = yd;
            yd = xd;
            xd = d;
          }
          for (carry = 0; i; ) {
            carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
            xd[i] %= BASE;
          }
          if (carry) {
            xd.unshift(carry);
            ++e;
          }
          for (len = xd.length; xd[--len] == 0; ) xd.pop();
          y.d = xd;
          y.e = e;
          return external ? round2(y, pr) : y;
        }
        function checkInt32(i, min2, max2) {
          if (i !== ~~i || i < min2 || i > max2) {
            throw Error(invalidArgument + i);
          }
        }
        function digitsToString(d) {
          var i, k, ws, indexOfLastWord = d.length - 1, str = "", w = d[0];
          if (indexOfLastWord > 0) {
            str += w;
            for (i = 1; i < indexOfLastWord; i++) {
              ws = d[i] + "";
              k = LOG_BASE - ws.length;
              if (k) str += getZeroString(k);
              str += ws;
            }
            w = d[i];
            ws = w + "";
            k = LOG_BASE - ws.length;
            if (k) str += getZeroString(k);
          } else if (w === 0) {
            return "0";
          }
          for (; w % 10 === 0; ) w /= 10;
          return str + w;
        }
        var divide = /* @__PURE__ */ (function() {
          function multiplyInteger(x, k) {
            var temp, carry = 0, i = x.length;
            for (x = x.slice(); i--; ) {
              temp = x[i] * k + carry;
              x[i] = temp % BASE | 0;
              carry = temp / BASE | 0;
            }
            if (carry) x.unshift(carry);
            return x;
          }
          function compare(a, b, aL, bL) {
            var i, r2;
            if (aL != bL) {
              r2 = aL > bL ? 1 : -1;
            } else {
              for (i = r2 = 0; i < aL; i++) {
                if (a[i] != b[i]) {
                  r2 = a[i] > b[i] ? 1 : -1;
                  break;
                }
              }
            }
            return r2;
          }
          function subtract2(a, b, aL) {
            var i = 0;
            for (; aL--; ) {
              a[aL] -= i;
              i = a[aL] < b[aL] ? 1 : 0;
              a[aL] = i * BASE + a[aL] - b[aL];
            }
            for (; !a[0] && a.length > 1; ) a.shift();
          }
          return function(x, y, pr, dp) {
            var cmp, e, i, k, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0, yL, yz, Ctor = x.constructor, sign = x.s == y.s ? 1 : -1, xd = x.d, yd = y.d;
            if (!x.s) return new Ctor(x);
            if (!y.s) throw Error(decimalError + "Division by zero");
            e = x.e - y.e;
            yL = yd.length;
            xL = xd.length;
            q = new Ctor(sign);
            qd = q.d = [];
            for (i = 0; yd[i] == (xd[i] || 0); ) ++i;
            if (yd[i] > (xd[i] || 0)) --e;
            if (pr == null) {
              sd = pr = Ctor.precision;
            } else if (dp) {
              sd = pr + (getBase10Exponent(x) - getBase10Exponent(y)) + 1;
            } else {
              sd = pr;
            }
            if (sd < 0) return new Ctor(0);
            sd = sd / LOG_BASE + 2 | 0;
            i = 0;
            if (yL == 1) {
              k = 0;
              yd = yd[0];
              sd++;
              for (; (i < xL || k) && sd--; i++) {
                t = k * BASE + (xd[i] || 0);
                qd[i] = t / yd | 0;
                k = t % yd | 0;
              }
            } else {
              k = BASE / (yd[0] + 1) | 0;
              if (k > 1) {
                yd = multiplyInteger(yd, k);
                xd = multiplyInteger(xd, k);
                yL = yd.length;
                xL = xd.length;
              }
              xi = yL;
              rem = xd.slice(0, yL);
              remL = rem.length;
              for (; remL < yL; ) rem[remL++] = 0;
              yz = yd.slice();
              yz.unshift(0);
              yd0 = yd[0];
              if (yd[1] >= BASE / 2) ++yd0;
              do {
                k = 0;
                cmp = compare(yd, rem, yL, remL);
                if (cmp < 0) {
                  rem0 = rem[0];
                  if (yL != remL) rem0 = rem0 * BASE + (rem[1] || 0);
                  k = rem0 / yd0 | 0;
                  if (k > 1) {
                    if (k >= BASE) k = BASE - 1;
                    prod = multiplyInteger(yd, k);
                    prodL = prod.length;
                    remL = rem.length;
                    cmp = compare(prod, rem, prodL, remL);
                    if (cmp == 1) {
                      k--;
                      subtract2(prod, yL < prodL ? yz : yd, prodL);
                    }
                  } else {
                    if (k == 0) cmp = k = 1;
                    prod = yd.slice();
                  }
                  prodL = prod.length;
                  if (prodL < remL) prod.unshift(0);
                  subtract2(rem, prod, remL);
                  if (cmp == -1) {
                    remL = rem.length;
                    cmp = compare(yd, rem, yL, remL);
                    if (cmp < 1) {
                      k++;
                      subtract2(rem, yL < remL ? yz : yd, remL);
                    }
                  }
                  remL = rem.length;
                } else if (cmp === 0) {
                  k++;
                  rem = [0];
                }
                qd[i++] = k;
                if (cmp && rem[0]) {
                  rem[remL++] = xd[xi] || 0;
                } else {
                  rem = [xd[xi]];
                  remL = 1;
                }
              } while ((xi++ < xL || rem[0] !== void 0) && sd--);
            }
            if (!qd[0]) qd.shift();
            q.e = e;
            return round2(q, dp ? pr + getBase10Exponent(q) + 1 : pr);
          };
        })();
        function exp(x, sd) {
          var denominator, guard, pow2, sum, t, wpr, i = 0, k = 0, Ctor = x.constructor, pr = Ctor.precision;
          if (getBase10Exponent(x) > 16) throw Error(exponentOutOfRange + getBase10Exponent(x));
          if (!x.s) return new Ctor(ONE);
          if (sd == null) {
            external = false;
            wpr = pr;
          } else {
            wpr = sd;
          }
          t = new Ctor(0.03125);
          while (x.abs().gte(0.1)) {
            x = x.times(t);
            k += 5;
          }
          guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
          wpr += guard;
          denominator = pow2 = sum = new Ctor(ONE);
          Ctor.precision = wpr;
          for (; ; ) {
            pow2 = round2(pow2.times(x), wpr);
            denominator = denominator.times(++i);
            t = sum.plus(divide(pow2, denominator, wpr));
            if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
              while (k--) sum = round2(sum.times(sum), wpr);
              Ctor.precision = pr;
              return sd == null ? (external = true, round2(sum, pr)) : sum;
            }
            sum = t;
          }
        }
        function getBase10Exponent(x) {
          var e = x.e * LOG_BASE, w = x.d[0];
          for (; w >= 10; w /= 10) e++;
          return e;
        }
        function getLn10(Ctor, sd, pr) {
          if (sd > Ctor.LN10.sd()) {
            external = true;
            if (pr) Ctor.precision = pr;
            throw Error(decimalError + "LN10 precision limit exceeded");
          }
          return round2(new Ctor(Ctor.LN10), sd);
        }
        function getZeroString(k) {
          var zs = "";
          for (; k--; ) zs += "0";
          return zs;
        }
        function ln(y, sd) {
          var c, c0, denominator, e, numerator, sum, t, wpr, x2, n = 1, guard = 10, x = y, xd = x.d, Ctor = x.constructor, pr = Ctor.precision;
          if (x.s < 1) throw Error(decimalError + (x.s ? "NaN" : "-Infinity"));
          if (x.eq(ONE)) return new Ctor(0);
          if (sd == null) {
            external = false;
            wpr = pr;
          } else {
            wpr = sd;
          }
          if (x.eq(10)) {
            if (sd == null) external = true;
            return getLn10(Ctor, wpr);
          }
          wpr += guard;
          Ctor.precision = wpr;
          c = digitsToString(xd);
          c0 = c.charAt(0);
          e = getBase10Exponent(x);
          if (Math.abs(e) < 15e14) {
            while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
              x = x.times(y);
              c = digitsToString(x.d);
              c0 = c.charAt(0);
              n++;
            }
            e = getBase10Exponent(x);
            if (c0 > 1) {
              x = new Ctor("0." + c);
              e++;
            } else {
              x = new Ctor(c0 + "." + c.slice(1));
            }
          } else {
            t = getLn10(Ctor, wpr + 2, pr).times(e + "");
            x = ln(new Ctor(c0 + "." + c.slice(1)), wpr - guard).plus(t);
            Ctor.precision = pr;
            return sd == null ? (external = true, round2(x, pr)) : x;
          }
          sum = numerator = x = divide(x.minus(ONE), x.plus(ONE), wpr);
          x2 = round2(x.times(x), wpr);
          denominator = 3;
          for (; ; ) {
            numerator = round2(numerator.times(x2), wpr);
            t = sum.plus(divide(numerator, new Ctor(denominator), wpr));
            if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
              sum = sum.times(2);
              if (e !== 0) sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ""));
              sum = divide(sum, new Ctor(n), wpr);
              Ctor.precision = pr;
              return sd == null ? (external = true, round2(sum, pr)) : sum;
            }
            sum = t;
            denominator += 2;
          }
        }
        function parseDecimal(x, str) {
          var e, i, len;
          if ((e = str.indexOf(".")) > -1) str = str.replace(".", "");
          if ((i = str.search(/e/i)) > 0) {
            if (e < 0) e = i;
            e += +str.slice(i + 1);
            str = str.substring(0, i);
          } else if (e < 0) {
            e = str.length;
          }
          for (i = 0; str.charCodeAt(i) === 48; ) ++i;
          for (len = str.length; str.charCodeAt(len - 1) === 48; ) --len;
          str = str.slice(i, len);
          if (str) {
            len -= i;
            e = e - i - 1;
            x.e = mathfloor(e / LOG_BASE);
            x.d = [];
            i = (e + 1) % LOG_BASE;
            if (e < 0) i += LOG_BASE;
            if (i < len) {
              if (i) x.d.push(+str.slice(0, i));
              for (len -= LOG_BASE; i < len; ) x.d.push(+str.slice(i, i += LOG_BASE));
              str = str.slice(i);
              i = LOG_BASE - str.length;
            } else {
              i -= len;
            }
            for (; i--; ) str += "0";
            x.d.push(+str);
            if (external && (x.e > MAX_E || x.e < -MAX_E)) throw Error(exponentOutOfRange + e);
          } else {
            x.s = 0;
            x.e = 0;
            x.d = [0];
          }
          return x;
        }
        function round2(x, sd, rm) {
          var i, j, k, n, rd, doRound, w, xdi, xd = x.d;
          for (n = 1, k = xd[0]; k >= 10; k /= 10) n++;
          i = sd - n;
          if (i < 0) {
            i += LOG_BASE;
            j = sd;
            w = xd[xdi = 0];
          } else {
            xdi = Math.ceil((i + 1) / LOG_BASE);
            k = xd.length;
            if (xdi >= k) return x;
            w = k = xd[xdi];
            for (n = 1; k >= 10; k /= 10) n++;
            i %= LOG_BASE;
            j = i - LOG_BASE + n;
          }
          if (rm !== void 0) {
            k = mathpow(10, n - j - 1);
            rd = w / k % 10 | 0;
            doRound = sd < 0 || xd[xdi + 1] !== void 0 || w % k;
            doRound = rm < 4 ? (rd || doRound) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || doRound || rm == 6 && // Check whether the digit to the left of the rounding digit is odd.
            (i > 0 ? j > 0 ? w / mathpow(10, n - j) : 0 : xd[xdi - 1]) % 10 & 1 || rm == (x.s < 0 ? 8 : 7));
          }
          if (sd < 1 || !xd[0]) {
            if (doRound) {
              k = getBase10Exponent(x);
              xd.length = 1;
              sd = sd - k - 1;
              xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
              x.e = mathfloor(-sd / LOG_BASE) || 0;
            } else {
              xd.length = 1;
              xd[0] = x.e = x.s = 0;
            }
            return x;
          }
          if (i == 0) {
            xd.length = xdi;
            k = 1;
            xdi--;
          } else {
            xd.length = xdi + 1;
            k = mathpow(10, LOG_BASE - i);
            xd[xdi] = j > 0 ? (w / mathpow(10, n - j) % mathpow(10, j) | 0) * k : 0;
          }
          if (doRound) {
            for (; ; ) {
              if (xdi == 0) {
                if ((xd[0] += k) == BASE) {
                  xd[0] = 1;
                  ++x.e;
                }
                break;
              } else {
                xd[xdi] += k;
                if (xd[xdi] != BASE) break;
                xd[xdi--] = 0;
                k = 1;
              }
            }
          }
          for (i = xd.length; xd[--i] === 0; ) xd.pop();
          if (external && (x.e > MAX_E || x.e < -MAX_E)) {
            throw Error(exponentOutOfRange + getBase10Exponent(x));
          }
          return x;
        }
        function subtract(x, y) {
          var d, e, i, j, k, len, xd, xe, xLTy, yd, Ctor = x.constructor, pr = Ctor.precision;
          if (!x.s || !y.s) {
            if (y.s) y.s = -y.s;
            else y = new Ctor(x);
            return external ? round2(y, pr) : y;
          }
          xd = x.d;
          yd = y.d;
          e = y.e;
          xe = x.e;
          xd = xd.slice();
          k = xe - e;
          if (k) {
            xLTy = k < 0;
            if (xLTy) {
              d = xd;
              k = -k;
              len = yd.length;
            } else {
              d = yd;
              e = xe;
              len = xd.length;
            }
            i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;
            if (k > i) {
              k = i;
              d.length = 1;
            }
            d.reverse();
            for (i = k; i--; ) d.push(0);
            d.reverse();
          } else {
            i = xd.length;
            len = yd.length;
            xLTy = i < len;
            if (xLTy) len = i;
            for (i = 0; i < len; i++) {
              if (xd[i] != yd[i]) {
                xLTy = xd[i] < yd[i];
                break;
              }
            }
            k = 0;
          }
          if (xLTy) {
            d = xd;
            xd = yd;
            yd = d;
            y.s = -y.s;
          }
          len = xd.length;
          for (i = yd.length - len; i > 0; --i) xd[len++] = 0;
          for (i = yd.length; i > k; ) {
            if (xd[--i] < yd[i]) {
              for (j = i; j && xd[--j] === 0; ) xd[j] = BASE - 1;
              --xd[j];
              xd[i] += BASE;
            }
            xd[i] -= yd[i];
          }
          for (; xd[--len] === 0; ) xd.pop();
          for (; xd[0] === 0; xd.shift()) --e;
          if (!xd[0]) return new Ctor(0);
          y.d = xd;
          y.e = e;
          return external ? round2(y, pr) : y;
        }
        function toString2(x, isExp, sd) {
          var k, e = getBase10Exponent(x), str = digitsToString(x.d), len = str.length;
          if (isExp) {
            if (sd && (k = sd - len) > 0) {
              str = str.charAt(0) + "." + str.slice(1) + getZeroString(k);
            } else if (len > 1) {
              str = str.charAt(0) + "." + str.slice(1);
            }
            str = str + (e < 0 ? "e" : "e+") + e;
          } else if (e < 0) {
            str = "0." + getZeroString(-e - 1) + str;
            if (sd && (k = sd - len) > 0) str += getZeroString(k);
          } else if (e >= len) {
            str += getZeroString(e + 1 - len);
            if (sd && (k = sd - e - 1) > 0) str = str + "." + getZeroString(k);
          } else {
            if ((k = e + 1) < len) str = str.slice(0, k) + "." + str.slice(k);
            if (sd && (k = sd - len) > 0) {
              if (e + 1 === len) str += ".";
              str += getZeroString(k);
            }
          }
          return x.s < 0 ? "-" + str : str;
        }
        function truncate(arr, len) {
          if (arr.length > len) {
            arr.length = len;
            return true;
          }
        }
        function clone(obj) {
          var i, p, ps;
          function Decimal4(value) {
            var x = this;
            if (!(x instanceof Decimal4)) return new Decimal4(value);
            x.constructor = Decimal4;
            if (value instanceof Decimal4) {
              x.s = value.s;
              x.e = value.e;
              x.d = (value = value.d) ? value.slice() : value;
              return;
            }
            if (typeof value === "number") {
              if (value * 0 !== 0) {
                throw Error(invalidArgument + value);
              }
              if (value > 0) {
                x.s = 1;
              } else if (value < 0) {
                value = -value;
                x.s = -1;
              } else {
                x.s = 0;
                x.e = 0;
                x.d = [0];
                return;
              }
              if (value === ~~value && value < 1e7) {
                x.e = 0;
                x.d = [value];
                return;
              }
              return parseDecimal(x, value.toString());
            } else if (typeof value !== "string") {
              throw Error(invalidArgument + value);
            }
            if (value.charCodeAt(0) === 45) {
              value = value.slice(1);
              x.s = -1;
            } else {
              x.s = 1;
            }
            if (isDecimal.test(value)) parseDecimal(x, value);
            else throw Error(invalidArgument + value);
          }
          Decimal4.prototype = P;
          Decimal4.ROUND_UP = 0;
          Decimal4.ROUND_DOWN = 1;
          Decimal4.ROUND_CEIL = 2;
          Decimal4.ROUND_FLOOR = 3;
          Decimal4.ROUND_HALF_UP = 4;
          Decimal4.ROUND_HALF_DOWN = 5;
          Decimal4.ROUND_HALF_EVEN = 6;
          Decimal4.ROUND_HALF_CEIL = 7;
          Decimal4.ROUND_HALF_FLOOR = 8;
          Decimal4.clone = clone;
          Decimal4.config = Decimal4.set = config2;
          if (obj === void 0) obj = {};
          if (obj) {
            ps = ["precision", "rounding", "toExpNeg", "toExpPos", "LN10"];
            for (i = 0; i < ps.length; ) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
          }
          Decimal4.config(obj);
          return Decimal4;
        }
        function config2(obj) {
          if (!obj || typeof obj !== "object") {
            throw Error(decimalError + "Object expected");
          }
          var i, p, v, ps = [
            "precision",
            1,
            MAX_DIGITS,
            "rounding",
            0,
            8,
            "toExpNeg",
            -1 / 0,
            0,
            "toExpPos",
            0,
            1 / 0
          ];
          for (i = 0; i < ps.length; i += 3) {
            if ((v = obj[p = ps[i]]) !== void 0) {
              if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
              else throw Error(invalidArgument + p + ": " + v);
            }
          }
          if ((v = obj[p = "LN10"]) !== void 0) {
            if (v == Math.LN10) this[p] = new this(v);
            else throw Error(invalidArgument + p + ": " + v);
          }
          return this;
        }
        Decimal3 = clone(Decimal3);
        Decimal3["default"] = Decimal3.Decimal = Decimal3;
        ONE = new Decimal3(1);
        if (typeof define == "function" && define.amd) {
          define(function() {
            return Decimal3;
          });
        } else if (typeof module != "undefined" && module.exports) {
          module.exports = Decimal3;
        } else {
          if (!globalScope) {
            globalScope = typeof self != "undefined" && self && self.self == self ? self : Function("return this")();
          }
          globalScope.Decimal = Decimal3;
        }
      })(exports);
    }
  });

  // node_modules/eventemitter3/index.js
  var require_eventemitter3 = __commonJS({
    "node_modules/eventemitter3/index.js"(exports, module) {
      "use strict";
      init_define_import_meta_env();
      var has2 = Object.prototype.hasOwnProperty;
      var prefix2 = "~";
      function Events() {
      }
      if (Object.create) {
        Events.prototype = /* @__PURE__ */ Object.create(null);
        if (!new Events().__proto__) prefix2 = false;
      }
      function EE(fn, context, once) {
        this.fn = fn;
        this.context = context;
        this.once = once || false;
      }
      function addListener2(emitter, event, fn, context, once) {
        if (typeof fn !== "function") {
          throw new TypeError("The listener must be a function");
        }
        var listener2 = new EE(fn, context || emitter, once), evt = prefix2 ? prefix2 + event : event;
        if (!emitter._events[evt]) emitter._events[evt] = listener2, emitter._eventsCount++;
        else if (!emitter._events[evt].fn) emitter._events[evt].push(listener2);
        else emitter._events[evt] = [emitter._events[evt], listener2];
        return emitter;
      }
      function clearEvent(emitter, evt) {
        if (--emitter._eventsCount === 0) emitter._events = new Events();
        else delete emitter._events[evt];
      }
      function EventEmitter2() {
        this._events = new Events();
        this._eventsCount = 0;
      }
      EventEmitter2.prototype.eventNames = function eventNames() {
        var names = [], events, name;
        if (this._eventsCount === 0) return names;
        for (name in events = this._events) {
          if (has2.call(events, name)) names.push(prefix2 ? name.slice(1) : name);
        }
        if (Object.getOwnPropertySymbols) {
          return names.concat(Object.getOwnPropertySymbols(events));
        }
        return names;
      };
      EventEmitter2.prototype.listeners = function listeners(event) {
        var evt = prefix2 ? prefix2 + event : event, handlers = this._events[evt];
        if (!handlers) return [];
        if (handlers.fn) return [handlers.fn];
        for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
          ee[i] = handlers[i].fn;
        }
        return ee;
      };
      EventEmitter2.prototype.listenerCount = function listenerCount(event) {
        var evt = prefix2 ? prefix2 + event : event, listeners = this._events[evt];
        if (!listeners) return 0;
        if (listeners.fn) return 1;
        return listeners.length;
      };
      EventEmitter2.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
        var evt = prefix2 ? prefix2 + event : event;
        if (!this._events[evt]) return false;
        var listeners = this._events[evt], len = arguments.length, args, i;
        if (listeners.fn) {
          if (listeners.once) this.removeListener(event, listeners.fn, void 0, true);
          switch (len) {
            case 1:
              return listeners.fn.call(listeners.context), true;
            case 2:
              return listeners.fn.call(listeners.context, a1), true;
            case 3:
              return listeners.fn.call(listeners.context, a1, a2), true;
            case 4:
              return listeners.fn.call(listeners.context, a1, a2, a3), true;
            case 5:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
            case 6:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
          }
          for (i = 1, args = new Array(len - 1); i < len; i++) {
            args[i - 1] = arguments[i];
          }
          listeners.fn.apply(listeners.context, args);
        } else {
          var length = listeners.length, j;
          for (i = 0; i < length; i++) {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, void 0, true);
            switch (len) {
              case 1:
                listeners[i].fn.call(listeners[i].context);
                break;
              case 2:
                listeners[i].fn.call(listeners[i].context, a1);
                break;
              case 3:
                listeners[i].fn.call(listeners[i].context, a1, a2);
                break;
              case 4:
                listeners[i].fn.call(listeners[i].context, a1, a2, a3);
                break;
              default:
                if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                  args[j - 1] = arguments[j];
                }
                listeners[i].fn.apply(listeners[i].context, args);
            }
          }
        }
        return true;
      };
      EventEmitter2.prototype.on = function on(event, fn, context) {
        return addListener2(this, event, fn, context, false);
      };
      EventEmitter2.prototype.once = function once(event, fn, context) {
        return addListener2(this, event, fn, context, true);
      };
      EventEmitter2.prototype.removeListener = function removeListener2(event, fn, context, once) {
        var evt = prefix2 ? prefix2 + event : event;
        if (!this._events[evt]) return this;
        if (!fn) {
          clearEvent(this, evt);
          return this;
        }
        var listeners = this._events[evt];
        if (listeners.fn) {
          if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
            clearEvent(this, evt);
          }
        } else {
          for (var i = 0, events = [], length = listeners.length; i < length; i++) {
            if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
              events.push(listeners[i]);
            }
          }
          if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
          else clearEvent(this, evt);
        }
        return this;
      };
      EventEmitter2.prototype.removeAllListeners = function removeAllListeners(event) {
        var evt;
        if (event) {
          evt = prefix2 ? prefix2 + event : event;
          if (this._events[evt]) clearEvent(this, evt);
        } else {
          this._events = new Events();
          this._eventsCount = 0;
        }
        return this;
      };
      EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
      EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
      EventEmitter2.prefixed = prefix2;
      EventEmitter2.EventEmitter = EventEmitter2;
      if ("undefined" !== typeof module) {
        module.exports = EventEmitter2;
      }
    }
  });

  // shim:react-is-shim
  var require_react_is_shim = __commonJS({
    "shim:react-is-shim"(exports) {
      init_define_import_meta_env();
      var R = window.React;
      var FWD = /* @__PURE__ */ Symbol.for("react.forward_ref");
      var MEMO = /* @__PURE__ */ Symbol.for("react.memo");
      var PORTAL = /* @__PURE__ */ Symbol.for("react.portal");
      var LAZY = /* @__PURE__ */ Symbol.for("react.lazy");
      function tt(o) {
        return o != null && typeof o === "object" ? R.isValidElement(o) ? o.type && o.type.$$typeof || o.type : o.$$typeof : void 0;
      }
      exports.typeOf = tt;
      exports.isElement = R.isValidElement;
      exports.isValidElementType = function(t) {
        return typeof t === "string" || typeof t === "function" || t === R.Fragment || t === R.Suspense || t === R.StrictMode || t === R.Profiler || t != null && typeof t === "object" && t.$$typeof != null;
      };
      exports.isFragment = function(o) {
        return R.isValidElement(o) && o.type === R.Fragment;
      };
      exports.isSuspense = function(o) {
        return R.isValidElement(o) && o.type === R.Suspense;
      };
      exports.isPortal = function(o) {
        return o != null && o.$$typeof === PORTAL;
      };
      exports.isForwardRef = function(o) {
        return tt(o) === FWD;
      };
      exports.isMemo = function(o) {
        return tt(o) === MEMO;
      };
      exports.isLazy = function(o) {
        return tt(o) === LAZY;
      };
      exports.isContextProvider = exports.isContextConsumer = exports.isProfiler = exports.isStrictMode = function() {
        return false;
      };
      exports.ForwardRef = FWD;
      exports.Memo = MEMO;
      exports.Portal = PORTAL;
      exports.Lazy = LAZY;
      exports.Fragment = R.Fragment;
      exports.Suspense = R.Suspense;
      exports.StrictMode = R.StrictMode;
      exports.Profiler = R.Profiler;
    }
  });

  // .design-sync/previews/ChartTooltip.tsx
  var ChartTooltip_exports = {};
  __export(ChartTooltip_exports, {
    ActiveTooltip: () => ActiveTooltip
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

  // node_modules/recharts/es6/index.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/container/Surface.js
  init_define_import_meta_env();
  var React = __toESM(require_react_shim());
  var import_react3 = __toESM(require_react_shim());

  // node_modules/clsx/dist/clsx.mjs
  init_define_import_meta_env();
  function r(e) {
    var t, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    } else for (f in e) e[f] && (n && (n += " "), n += f);
    return n;
  }
  function clsx() {
    for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
    return n;
  }

  // node_modules/recharts/es6/util/svgPropertiesAndEvents.js
  init_define_import_meta_env();
  var import_react2 = __toESM(require_react_shim());

  // node_modules/recharts/es6/util/excludeEventProps.js
  init_define_import_meta_env();
  var EventKeys = ["dangerouslySetInnerHTML", "onCopy", "onCopyCapture", "onCut", "onCutCapture", "onPaste", "onPasteCapture", "onCompositionEnd", "onCompositionEndCapture", "onCompositionStart", "onCompositionStartCapture", "onCompositionUpdate", "onCompositionUpdateCapture", "onFocus", "onFocusCapture", "onBlur", "onBlurCapture", "onChange", "onChangeCapture", "onBeforeInput", "onBeforeInputCapture", "onInput", "onInputCapture", "onReset", "onResetCapture", "onSubmit", "onSubmitCapture", "onInvalid", "onInvalidCapture", "onLoad", "onLoadCapture", "onError", "onErrorCapture", "onKeyDown", "onKeyDownCapture", "onKeyPress", "onKeyPressCapture", "onKeyUp", "onKeyUpCapture", "onAbort", "onAbortCapture", "onCanPlay", "onCanPlayCapture", "onCanPlayThrough", "onCanPlayThroughCapture", "onDurationChange", "onDurationChangeCapture", "onEmptied", "onEmptiedCapture", "onEncrypted", "onEncryptedCapture", "onEnded", "onEndedCapture", "onLoadedData", "onLoadedDataCapture", "onLoadedMetadata", "onLoadedMetadataCapture", "onLoadStart", "onLoadStartCapture", "onPause", "onPauseCapture", "onPlay", "onPlayCapture", "onPlaying", "onPlayingCapture", "onProgress", "onProgressCapture", "onRateChange", "onRateChangeCapture", "onSeeked", "onSeekedCapture", "onSeeking", "onSeekingCapture", "onStalled", "onStalledCapture", "onSuspend", "onSuspendCapture", "onTimeUpdate", "onTimeUpdateCapture", "onVolumeChange", "onVolumeChangeCapture", "onWaiting", "onWaitingCapture", "onAuxClick", "onAuxClickCapture", "onClick", "onClickCapture", "onContextMenu", "onContextMenuCapture", "onDoubleClick", "onDoubleClickCapture", "onDrag", "onDragCapture", "onDragEnd", "onDragEndCapture", "onDragEnter", "onDragEnterCapture", "onDragExit", "onDragExitCapture", "onDragLeave", "onDragLeaveCapture", "onDragOver", "onDragOverCapture", "onDragStart", "onDragStartCapture", "onDrop", "onDropCapture", "onMouseDown", "onMouseDownCapture", "onMouseEnter", "onMouseLeave", "onMouseMove", "onMouseMoveCapture", "onMouseOut", "onMouseOutCapture", "onMouseOver", "onMouseOverCapture", "onMouseUp", "onMouseUpCapture", "onSelect", "onSelectCapture", "onTouchCancel", "onTouchCancelCapture", "onTouchEnd", "onTouchEndCapture", "onTouchMove", "onTouchMoveCapture", "onTouchStart", "onTouchStartCapture", "onPointerDown", "onPointerDownCapture", "onPointerMove", "onPointerMoveCapture", "onPointerUp", "onPointerUpCapture", "onPointerCancel", "onPointerCancelCapture", "onPointerEnter", "onPointerEnterCapture", "onPointerLeave", "onPointerLeaveCapture", "onPointerOver", "onPointerOverCapture", "onPointerOut", "onPointerOutCapture", "onGotPointerCapture", "onGotPointerCaptureCapture", "onLostPointerCapture", "onLostPointerCaptureCapture", "onScroll", "onScrollCapture", "onWheel", "onWheelCapture", "onAnimationStart", "onAnimationStartCapture", "onAnimationEnd", "onAnimationEndCapture", "onAnimationIteration", "onAnimationIterationCapture", "onTransitionEnd", "onTransitionEndCapture"];
  function isEventKey(key) {
    if (typeof key !== "string") {
      return false;
    }
    var allowedEventKeys = EventKeys;
    return allowedEventKeys.includes(key);
  }

  // node_modules/recharts/es6/util/svgPropertiesNoEvents.js
  init_define_import_meta_env();
  var import_react = __toESM(require_react_shim());
  var SVGElementPropKeys = [
    "aria-activedescendant",
    "aria-atomic",
    "aria-autocomplete",
    "aria-busy",
    "aria-checked",
    "aria-colcount",
    "aria-colindex",
    "aria-colspan",
    "aria-controls",
    "aria-current",
    "aria-describedby",
    "aria-details",
    "aria-disabled",
    "aria-errormessage",
    "aria-expanded",
    "aria-flowto",
    "aria-haspopup",
    "aria-hidden",
    "aria-invalid",
    "aria-keyshortcuts",
    "aria-label",
    "aria-labelledby",
    "aria-level",
    "aria-live",
    "aria-modal",
    "aria-multiline",
    "aria-multiselectable",
    "aria-orientation",
    "aria-owns",
    "aria-placeholder",
    "aria-posinset",
    "aria-pressed",
    "aria-readonly",
    "aria-relevant",
    "aria-required",
    "aria-roledescription",
    "aria-rowcount",
    "aria-rowindex",
    "aria-rowspan",
    "aria-selected",
    "aria-setsize",
    "aria-sort",
    "aria-valuemax",
    "aria-valuemin",
    "aria-valuenow",
    "aria-valuetext",
    "className",
    "color",
    "height",
    "id",
    "lang",
    "max",
    "media",
    "method",
    "min",
    "name",
    "style",
    /*
     * removed 'type' SVGElementPropKey because we do not currently use any SVG elements
     * that can use it, and it conflicts with the recharts prop 'type'
     * https://github.com/recharts/recharts/pull/3327
     * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/type
     */
    // 'type',
    "target",
    "width",
    "role",
    "tabIndex",
    "accentHeight",
    "accumulate",
    "additive",
    "alignmentBaseline",
    "allowReorder",
    "alphabetic",
    "amplitude",
    "arabicForm",
    "ascent",
    "attributeName",
    "attributeType",
    "autoReverse",
    "azimuth",
    "baseFrequency",
    "baselineShift",
    "baseProfile",
    "bbox",
    "begin",
    "bias",
    "by",
    "calcMode",
    "capHeight",
    "clip",
    "clipPath",
    "clipPathUnits",
    "clipRule",
    "colorInterpolation",
    "colorInterpolationFilters",
    "colorProfile",
    "colorRendering",
    "contentScriptType",
    "contentStyleType",
    "cursor",
    "cx",
    "cy",
    "d",
    "decelerate",
    "descent",
    "diffuseConstant",
    "direction",
    "display",
    "divisor",
    "dominantBaseline",
    "dur",
    "dx",
    "dy",
    "edgeMode",
    "elevation",
    "enableBackground",
    "end",
    "exponent",
    "externalResourcesRequired",
    "fill",
    "fillOpacity",
    "fillRule",
    "filter",
    "filterRes",
    "filterUnits",
    "floodColor",
    "floodOpacity",
    "focusable",
    "fontFamily",
    "fontSize",
    "fontSizeAdjust",
    "fontStretch",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "format",
    "from",
    "fx",
    "fy",
    "g1",
    "g2",
    "glyphName",
    "glyphOrientationHorizontal",
    "glyphOrientationVertical",
    "glyphRef",
    "gradientTransform",
    "gradientUnits",
    "hanging",
    "horizAdvX",
    "horizOriginX",
    "href",
    "ideographic",
    "imageRendering",
    "in2",
    "in",
    "intercept",
    "k1",
    "k2",
    "k3",
    "k4",
    "k",
    "kernelMatrix",
    "kernelUnitLength",
    "kerning",
    "keyPoints",
    "keySplines",
    "keyTimes",
    "lengthAdjust",
    "letterSpacing",
    "lightingColor",
    "limitingConeAngle",
    "local",
    "markerEnd",
    "markerHeight",
    "markerMid",
    "markerStart",
    "markerUnits",
    "markerWidth",
    "mask",
    "maskContentUnits",
    "maskUnits",
    "mathematical",
    "mode",
    "numOctaves",
    "offset",
    "opacity",
    "operator",
    "order",
    "orient",
    "orientation",
    "origin",
    "overflow",
    "overlinePosition",
    "overlineThickness",
    "paintOrder",
    "panose1",
    "pathLength",
    "patternContentUnits",
    "patternTransform",
    "patternUnits",
    "pointerEvents",
    "pointsAtX",
    "pointsAtY",
    "pointsAtZ",
    "preserveAlpha",
    "preserveAspectRatio",
    "primitiveUnits",
    "r",
    "radius",
    "refX",
    "refY",
    "renderingIntent",
    "repeatCount",
    "repeatDur",
    "requiredExtensions",
    "requiredFeatures",
    "restart",
    "result",
    "rotate",
    "rx",
    "ry",
    "seed",
    "shapeRendering",
    "slope",
    "spacing",
    "specularConstant",
    "specularExponent",
    "speed",
    "spreadMethod",
    "startOffset",
    "stdDeviation",
    "stemh",
    "stemv",
    "stitchTiles",
    "stopColor",
    "stopOpacity",
    "strikethroughPosition",
    "strikethroughThickness",
    "string",
    "stroke",
    "strokeDasharray",
    "strokeDashoffset",
    "strokeLinecap",
    "strokeLinejoin",
    "strokeMiterlimit",
    "strokeOpacity",
    "strokeWidth",
    "surfaceScale",
    "systemLanguage",
    "tableValues",
    "targetX",
    "targetY",
    "textAnchor",
    "textDecoration",
    "textLength",
    "textRendering",
    "to",
    "transform",
    "u1",
    "u2",
    "underlinePosition",
    "underlineThickness",
    "unicode",
    "unicodeBidi",
    "unicodeRange",
    "unitsPerEm",
    "vAlphabetic",
    "values",
    "vectorEffect",
    "version",
    "vertAdvY",
    "vertOriginX",
    "vertOriginY",
    "vHanging",
    "vIdeographic",
    "viewTarget",
    "visibility",
    "vMathematical",
    "widths",
    "wordSpacing",
    "writingMode",
    "x1",
    "x2",
    "x",
    "xChannelSelector",
    "xHeight",
    "xlinkActuate",
    "xlinkArcrole",
    "xlinkHref",
    "xlinkRole",
    "xlinkShow",
    "xlinkTitle",
    "xlinkType",
    "xmlBase",
    "xmlLang",
    "xmlns",
    "xmlnsXlink",
    "xmlSpace",
    "y1",
    "y2",
    "y",
    "yChannelSelector",
    "z",
    "zoomAndPan",
    "ref",
    "key",
    "angle"
  ];
  var SVGElementPropKeySet = new Set(SVGElementPropKeys);
  function isSvgElementPropKey(key) {
    if (typeof key !== "string") {
      return false;
    }
    return SVGElementPropKeySet.has(key);
  }
  function isDataAttribute(key) {
    return typeof key === "string" && key.startsWith("data-");
  }
  function svgPropertiesNoEvents(obj) {
    if (typeof obj !== "object" || obj === null) {
      return {};
    }
    var result = {};
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (isSvgElementPropKey(key) || isDataAttribute(key)) {
          result[key] = obj[key];
        }
      }
    }
    return result;
  }
  function svgPropertiesNoEventsFromUnknown(input) {
    if (input == null) {
      return null;
    }
    if (/* @__PURE__ */ (0, import_react.isValidElement)(input) && typeof input.props === "object" && input.props !== null) {
      var p = input.props;
      return svgPropertiesNoEvents(p);
    }
    if (typeof input === "object" && !Array.isArray(input)) {
      return svgPropertiesNoEvents(input);
    }
    return null;
  }

  // node_modules/recharts/es6/util/svgPropertiesAndEvents.js
  function svgPropertiesAndEvents(obj) {
    var result = {};
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (isSvgElementPropKey(key) || isDataAttribute(key) || isEventKey(key)) {
          result[key] = obj[key];
        }
      }
    }
    return result;
  }

  // node_modules/recharts/es6/container/Surface.js
  var _excluded = ["children", "width", "height", "viewBox", "className", "style", "title", "desc"];
  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }
  function _objectWithoutProperties(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var Surface = /* @__PURE__ */ (0, import_react3.forwardRef)((props, ref) => {
    var children = props.children, width = props.width, height = props.height, viewBox = props.viewBox, className = props.className, style = props.style, title = props.title, desc = props.desc, others = _objectWithoutProperties(props, _excluded);
    var svgView = viewBox || {
      width,
      height,
      x: 0,
      y: 0
    };
    var layerClass = clsx("recharts-surface", className);
    return /* @__PURE__ */ React.createElement("svg", _extends({}, svgPropertiesAndEvents(others), {
      className: layerClass,
      width,
      height,
      style,
      viewBox: "".concat(svgView.x, " ").concat(svgView.y, " ").concat(svgView.width, " ").concat(svgView.height),
      ref
    }), /* @__PURE__ */ React.createElement("title", null, title), /* @__PURE__ */ React.createElement("desc", null, desc), children);
  });

  // node_modules/recharts/es6/container/Layer.js
  init_define_import_meta_env();
  var React2 = __toESM(require_react_shim());
  var _excluded2 = ["children", "className"];
  function _extends2() {
    return _extends2 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends2.apply(null, arguments);
  }
  function _objectWithoutProperties2(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose2(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose2(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var Layer = /* @__PURE__ */ React2.forwardRef((props, ref) => {
    var children = props.children, className = props.className, others = _objectWithoutProperties2(props, _excluded2);
    var layerClass = clsx("recharts-layer", className);
    return /* @__PURE__ */ React2.createElement("g", _extends2({
      className: layerClass
    }, svgPropertiesAndEvents(others), {
      ref
    }), children);
  });

  // node_modules/recharts/es6/context/legendPortalContext.js
  init_define_import_meta_env();
  var import_react4 = __toESM(require_react_shim());
  var LegendPortalContext = /* @__PURE__ */ (0, import_react4.createContext)(null);

  // node_modules/victory-vendor/es/d3-shape.js
  init_define_import_meta_env();

  // node_modules/d3-shape/src/index.js
  init_define_import_meta_env();

  // node_modules/d3-shape/src/constant.js
  init_define_import_meta_env();
  function constant_default(x) {
    return function constant() {
      return x;
    };
  }

  // node_modules/d3-shape/src/array.js
  init_define_import_meta_env();
  var slice = Array.prototype.slice;
  function array_default(x) {
    return typeof x === "object" && "length" in x ? x : Array.from(x);
  }

  // node_modules/d3-shape/src/stack.js
  init_define_import_meta_env();

  // node_modules/d3-shape/src/offset/none.js
  init_define_import_meta_env();
  function none_default(series, order) {
    if (!((n = series.length) > 1)) return;
    for (var i = 1, j, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
      s0 = s1, s1 = series[order[i]];
      for (j = 0; j < m; ++j) {
        s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
      }
    }
  }

  // node_modules/d3-shape/src/order/none.js
  init_define_import_meta_env();
  function none_default2(series) {
    var n = series.length, o = new Array(n);
    while (--n >= 0) o[n] = n;
    return o;
  }

  // node_modules/d3-shape/src/stack.js
  function stackValue(d, key) {
    return d[key];
  }
  function stackSeries(key) {
    const series = [];
    series.key = key;
    return series;
  }
  function stack_default() {
    var keys = constant_default([]), order = none_default2, offset = none_default, value = stackValue;
    function stack(data2) {
      var sz = Array.from(keys.apply(this, arguments), stackSeries), i, n = sz.length, j = -1, oz;
      for (const d of data2) {
        for (i = 0, ++j; i < n; ++i) {
          (sz[i][j] = [0, +value(d, sz[i].key, j, data2)]).data = d;
        }
      }
      for (i = 0, oz = array_default(order(sz)); i < n; ++i) {
        sz[oz[i]].index = i;
      }
      offset(sz, oz);
      return sz;
    }
    stack.keys = function(_) {
      return arguments.length ? (keys = typeof _ === "function" ? _ : constant_default(Array.from(_)), stack) : keys;
    };
    stack.value = function(_) {
      return arguments.length ? (value = typeof _ === "function" ? _ : constant_default(+_), stack) : value;
    };
    stack.order = function(_) {
      return arguments.length ? (order = _ == null ? none_default2 : typeof _ === "function" ? _ : constant_default(Array.from(_)), stack) : order;
    };
    stack.offset = function(_) {
      return arguments.length ? (offset = _ == null ? none_default : _, stack) : offset;
    };
    return stack;
  }

  // node_modules/d3-shape/src/offset/expand.js
  init_define_import_meta_env();
  function expand_default(series, order) {
    if (!((n = series.length) > 0)) return;
    for (var i, n, j = 0, m = series[0].length, y; j < m; ++j) {
      for (y = i = 0; i < n; ++i) y += series[i][j][1] || 0;
      if (y) for (i = 0; i < n; ++i) series[i][j][1] /= y;
    }
    none_default(series, order);
  }

  // node_modules/d3-shape/src/offset/silhouette.js
  init_define_import_meta_env();
  function silhouette_default(series, order) {
    if (!((n = series.length) > 0)) return;
    for (var j = 0, s0 = series[order[0]], n, m = s0.length; j < m; ++j) {
      for (var i = 0, y = 0; i < n; ++i) y += series[i][j][1] || 0;
      s0[j][1] += s0[j][0] = -y / 2;
    }
    none_default(series, order);
  }

  // node_modules/d3-shape/src/offset/wiggle.js
  init_define_import_meta_env();
  function wiggle_default(series, order) {
    if (!((n = series.length) > 0) || !((m = (s0 = series[order[0]]).length) > 0)) return;
    for (var y = 0, j = 1, s0, m, n; j < m; ++j) {
      for (var i = 0, s1 = 0, s2 = 0; i < n; ++i) {
        var si = series[order[i]], sij0 = si[j][1] || 0, sij1 = si[j - 1][1] || 0, s3 = (sij0 - sij1) / 2;
        for (var k = 0; k < i; ++k) {
          var sk = series[order[k]], skj0 = sk[j][1] || 0, skj1 = sk[j - 1][1] || 0;
          s3 += skj0 - skj1;
        }
        s1 += sij0, s2 += s3 * sij0;
      }
      s0[j - 1][1] += s0[j - 1][0] = y;
      if (s1) y -= s2 / s1;
    }
    s0[j - 1][1] += s0[j - 1][0] = y;
    none_default(series, order);
  }

  // node_modules/recharts/es6/util/DataUtils.js
  init_define_import_meta_env();

  // node_modules/es-toolkit/compat/get.mjs
  init_define_import_meta_env();

  // node_modules/es-toolkit/dist/compat/object/get.mjs
  init_define_import_meta_env();

  // node_modules/es-toolkit/dist/_internal/isUnsafeProperty.mjs
  init_define_import_meta_env();
  function isUnsafeProperty(key) {
    return key === "__proto__";
  }

  // node_modules/es-toolkit/dist/compat/_internal/isDeepKey.mjs
  init_define_import_meta_env();
  function isDeepKey(key) {
    switch (typeof key) {
      case "number":
      case "symbol":
        return false;
      case "string":
        return key.includes(".") || key.includes("[") || key.includes("]");
    }
  }

  // node_modules/es-toolkit/dist/compat/_internal/toKey.mjs
  init_define_import_meta_env();
  function toKey(value) {
    if (typeof value === "string" || typeof value === "symbol") return value;
    if (Object.is(value?.valueOf?.(), -0)) return "-0";
    return String(value);
  }

  // node_modules/es-toolkit/dist/compat/util/toPath.mjs
  init_define_import_meta_env();

  // node_modules/es-toolkit/dist/compat/util/toString.mjs
  init_define_import_meta_env();
  function toString(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(toString).join(",");
    const result = String(value);
    if (result === "0" && Object.is(Number(value), -0)) return "-0";
    return result;
  }

  // node_modules/es-toolkit/dist/compat/util/toPath.mjs
  function toPath(deepKey) {
    if (Array.isArray(deepKey)) return deepKey.map(toKey);
    if (typeof deepKey === "symbol") return [deepKey];
    deepKey = toString(deepKey);
    const result = [];
    const length = deepKey.length;
    if (length === 0) return result;
    let index = 0;
    let key = "";
    let quoteChar = "";
    let bracket = false;
    if (deepKey.charCodeAt(0) === 46) result.push("");
    while (index < length) {
      const char = deepKey[index];
      if (quoteChar) if (char === "\\" && index + 1 < length) {
        index++;
        key += deepKey[index];
      } else if (char === quoteChar) quoteChar = "";
      else key += char;
      else if (bracket) if (char === '"' || char === "'") quoteChar = char;
      else if (char === "]") {
        bracket = false;
        result.push(key);
        key = "";
      } else key += char;
      else if (char === "[") {
        bracket = true;
        if (key) {
          result.push(key);
          key = "";
        }
      } else if (char === ".") {
        if (key) {
          result.push(key);
          key = "";
        }
        const next = deepKey[index + 1];
        if (next === void 0 || next === ".") result.push("");
      } else key += char;
      index++;
    }
    if (key) result.push(key);
    return result;
  }

  // node_modules/es-toolkit/dist/compat/object/get.mjs
  function get(object, path, defaultValue) {
    if (object == null) return defaultValue;
    switch (typeof path) {
      case "string": {
        if (isUnsafeProperty(path)) return defaultValue;
        const result = object[path];
        if (result === void 0) if (isDeepKey(path) && !Object.hasOwn(object, path)) return get(object, toPath(path), defaultValue);
        else return defaultValue;
        return result;
      }
      case "number":
      case "symbol": {
        if (typeof path === "number") path = toKey(path);
        const result = object[path];
        if (result === void 0) return defaultValue;
        return result;
      }
      default: {
        if (Array.isArray(path)) return getWithPath(object, path, defaultValue);
        if (Object.is(path?.valueOf(), -0)) path = "-0";
        else path = String(path);
        if (isUnsafeProperty(path)) return defaultValue;
        const result = object[path];
        if (result === void 0) return defaultValue;
        return result;
      }
    }
  }
  function getWithPath(object, path, defaultValue) {
    if (path.length === 0) return defaultValue;
    let current2 = object;
    for (let index = 0; index < path.length; index++) {
      if (current2 == null) return defaultValue;
      if (isUnsafeProperty(path[index])) return defaultValue;
      current2 = current2[path[index]];
    }
    if (current2 === void 0) return defaultValue;
    return current2;
  }

  // node_modules/recharts/es6/util/round.js
  init_define_import_meta_env();
  var defaultRoundPrecision = 4;
  function round(num) {
    var roundPrecision = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : defaultRoundPrecision;
    var factor = 10 ** roundPrecision;
    var rounded = Math.round(num * factor) / factor;
    if (Object.is(rounded, -0)) {
      return 0;
    }
    return rounded;
  }
  function roundTemplateLiteral(strings) {
    for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      values[_key - 1] = arguments[_key];
    }
    return strings.reduce((result, string, i) => {
      var value = values[i - 1];
      if (typeof value === "string") {
        return result + value + string;
      }
      if (value !== void 0) {
        return result + round(value) + string;
      }
      return result + string;
    }, "");
  }

  // node_modules/recharts/es6/util/DataUtils.js
  var mathSign = (value) => {
    if (value === 0) {
      return 0;
    }
    if (value > 0) {
      return 1;
    }
    return -1;
  };
  var isNan = (value) => {
    return typeof value == "number" && value != +value;
  };
  var isPercent = (value) => typeof value === "string" && value.length > 1 && value.indexOf("%") === value.length - 1;
  var isNumber = (value) => (typeof value === "number" || value instanceof Number) && !isNan(value);
  var isNumOrStr = (value) => isNumber(value) || typeof value === "string";
  var idCounter = 0;
  var uniqueId = (prefix2) => {
    var id = ++idCounter;
    return "".concat(prefix2 || "").concat(id);
  };
  var getPercentValue = function getPercentValue2(percent, totalValue) {
    var defaultValue = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
    var validate = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false;
    if (!isNumber(percent) && typeof percent !== "string") {
      return defaultValue;
    }
    var value;
    if (isPercent(percent)) {
      if (totalValue == null) {
        return defaultValue;
      }
      var index = percent.indexOf("%");
      value = totalValue * parseFloat(percent.slice(0, index)) / 100;
    } else {
      value = +percent;
    }
    if (isNan(value)) {
      value = defaultValue;
    }
    if (validate && totalValue != null && value > totalValue) {
      value = totalValue;
    }
    return value;
  };
  var hasDuplicate = (ary) => {
    if (!Array.isArray(ary)) {
      return false;
    }
    var len = ary.length;
    var cache = {};
    for (var i = 0; i < len; i++) {
      if (!cache[String(ary[i])]) {
        cache[String(ary[i])] = true;
      } else {
        return true;
      }
    }
    return false;
  };
  function interpolate(start, end, animationElapsedTime) {
    if (isNumber(start) && isNumber(end)) {
      return round(start + animationElapsedTime * (end - start));
    }
    return end;
  }
  function findEntryInArray(ary, specifiedKey, specifiedValue) {
    if (!ary || !ary.length) {
      return void 0;
    }
    return ary.find((entry) => entry && (typeof specifiedKey === "function" ? specifiedKey(entry) : get(entry, specifiedKey)) === specifiedValue);
  }
  var isNullish = (value) => {
    return value === null || typeof value === "undefined";
  };
  var upperFirst = (value) => {
    if (isNullish(value)) {
      return value;
    }
    return "".concat(value.charAt(0).toUpperCase()).concat(value.slice(1));
  };
  function isNotNil(value) {
    return value != null;
  }
  function noop() {
  }

  // node_modules/recharts/es6/util/types.js
  init_define_import_meta_env();
  var import_react5 = __toESM(require_react_shim());
  var getEventHandlerOfChild = (originalHandler, data2, index) => (e) => {
    originalHandler(data2, index, e);
    return null;
  };
  var adaptEventsOfChild = (props, data2, index) => {
    if (props === null || typeof props !== "object" && typeof props !== "function") {
      return null;
    }
    var out = null;
    Object.keys(props).forEach((key) => {
      var item = props[key];
      if (isEventKey(key) && typeof item === "function") {
        if (!out) out = {};
        out[key] = getEventHandlerOfChild(item, data2, index);
      }
    });
    return out;
  };

  // node_modules/recharts/es6/util/resolveDefaultProps.js
  init_define_import_meta_env();
  function ownKeys(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys(Object(t), true).forEach(function(r3) {
        _defineProperty(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty(e, r2, t) {
    return (r2 = _toPropertyKey(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function resolveDefaultProps(realProps, defaultProps) {
    var resolvedProps = _objectSpread({}, realProps);
    var dp = defaultProps;
    var keys = Object.keys(defaultProps);
    var withDefaults = keys.reduce((acc, key) => {
      if (acc[key] === void 0 && dp[key] !== void 0) {
        acc[key] = dp[key];
      }
      return acc;
    }, resolvedProps);
    return withDefaults;
  }

  // node_modules/es-toolkit/dist/_internal/isEqualsSameValueZero.mjs
  init_define_import_meta_env();
  function isEqualsSameValueZero(value, other) {
    return value === other || Number.isNaN(value) && Number.isNaN(other);
  }

  // node_modules/es-toolkit/dist/compat/predicate/isObject.mjs
  init_define_import_meta_env();
  function isObject(value) {
    return value !== null && (typeof value === "object" || typeof value === "function");
  }

  // node_modules/es-toolkit/dist/compat/_internal/isIndex.mjs
  init_define_import_meta_env();
  var IS_UNSIGNED_INTEGER = /^(?:0|[1-9]\d*)$/;
  function isIndex(value, length = Number.MAX_SAFE_INTEGER) {
    switch (typeof value) {
      case "number":
        return Number.isInteger(value) && value >= 0 && value < length;
      case "symbol":
        return false;
      case "string":
        return IS_UNSIGNED_INTEGER.test(value);
    }
  }

  // node_modules/es-toolkit/dist/compat/predicate/isArrayLike.mjs
  init_define_import_meta_env();

  // node_modules/es-toolkit/dist/predicate/isLength.mjs
  init_define_import_meta_env();
  function isLength(value) {
    return Number.isSafeInteger(value) && value >= 0;
  }

  // node_modules/es-toolkit/dist/compat/predicate/isArrayLike.mjs
  function isArrayLike(value) {
    return value != null && typeof value !== "function" && isLength(value.length);
  }

  // node_modules/recharts/es6/state/hooks.js
  init_define_import_meta_env();
  var import_with_selector = __toESM(require_with_selector());
  var import_react7 = __toESM(require_react_shim());

  // node_modules/recharts/es6/state/RechartsReduxContext.js
  init_define_import_meta_env();
  var import_react6 = __toESM(require_react_shim());
  var RechartsReduxContext = /* @__PURE__ */ (0, import_react6.createContext)(null);

  // node_modules/recharts/es6/state/hooks.js
  var noopDispatch = (a) => a;
  var useAppDispatch = () => {
    var context = (0, import_react7.useContext)(RechartsReduxContext);
    if (context) {
      return context.store.dispatch;
    }
    return noopDispatch;
  };
  var noop2 = () => {
  };
  var addNestedSubNoop = () => noop2;
  var refEquality = (a, b) => a === b;
  function useAppSelector(selector) {
    var context = (0, import_react7.useContext)(RechartsReduxContext);
    var outOfContextSelector = (0, import_react7.useMemo)(() => {
      if (!context) {
        return noop2;
      }
      return (state) => {
        if (state == null) {
          return void 0;
        }
        return selector(state);
      };
    }, [context, selector]);
    return (0, import_with_selector.useSyncExternalStoreWithSelector)(context ? context.subscription.addNestedSub : addNestedSubNoop, context ? context.store.getState : noop2, context ? context.store.getState : noop2, outOfContextSelector, refEquality);
  }

  // node_modules/recharts/es6/state/selectors/legendSelectors.js
  init_define_import_meta_env();

  // node_modules/reselect/dist/reselect.mjs
  init_define_import_meta_env();
  var runIdentityFunctionCheck = (resultFunc, inputSelectorsResults, outputSelectorResult) => {
    if (inputSelectorsResults.length === 1 && inputSelectorsResults[0] === outputSelectorResult) {
      let isInputSameAsOutput = false;
      try {
        const emptyObject = {};
        if (resultFunc(emptyObject) === emptyObject) isInputSameAsOutput = true;
      } catch {
      }
      if (isInputSameAsOutput) {
        let stack = void 0;
        try {
          throw new Error();
        } catch (e) {
          ;
          ({ stack } = e);
        }
        console.warn(
          "The result function returned its own inputs without modification. e.g\n`createSelector([state => state.todos], todos => todos)`\nThis could lead to inefficient memoization and unnecessary re-renders.\nEnsure transformation logic is in the result function, and extraction logic is in the input selectors.",
          { stack }
        );
      }
    }
  };
  var runInputStabilityCheck = (inputSelectorResultsObject, options, inputSelectorArgs) => {
    const { memoize, memoizeOptions } = options;
    const { inputSelectorResults, inputSelectorResultsCopy } = inputSelectorResultsObject;
    const createAnEmptyObject = memoize(() => ({}), ...memoizeOptions);
    const areInputSelectorResultsEqual = createAnEmptyObject.apply(null, inputSelectorResults) === createAnEmptyObject.apply(null, inputSelectorResultsCopy);
    if (!areInputSelectorResultsEqual) {
      let stack = void 0;
      try {
        throw new Error();
      } catch (e) {
        ;
        ({ stack } = e);
      }
      console.warn(
        "An input selector returned a different result when passed same arguments.\nThis means your output selector will likely run more frequently than intended.\nAvoid returning a new reference inside your input selector, e.g.\n`createSelector([state => state.todos.map(todo => todo.id)], todoIds => todoIds.length)`",
        {
          arguments: inputSelectorArgs,
          firstInputs: inputSelectorResults,
          secondInputs: inputSelectorResultsCopy,
          stack
        }
      );
    }
  };
  var globalDevModeChecks = {
    inputStabilityCheck: "once",
    identityFunctionCheck: "once"
  };
  function assertIsFunction(func, errorMessage = `expected a function, instead received ${typeof func}`) {
    if (typeof func !== "function") {
      throw new TypeError(errorMessage);
    }
  }
  function assertIsArrayOfFunctions(array, errorMessage = `expected all items to be functions, instead received the following types: `) {
    if (!array.every((item) => typeof item === "function")) {
      const itemTypes = array.map(
        (item) => typeof item === "function" ? `function ${item.name || "unnamed"}()` : typeof item
      ).join(", ");
      throw new TypeError(`${errorMessage}[${itemTypes}]`);
    }
  }
  var ensureIsArray = (item) => {
    return Array.isArray(item) ? item : [item];
  };
  function getDependencies(createSelectorArgs) {
    const dependencies = Array.isArray(createSelectorArgs[0]) ? createSelectorArgs[0] : createSelectorArgs;
    assertIsArrayOfFunctions(
      dependencies,
      `createSelector expects all input-selectors to be functions, but received the following types: `
    );
    return dependencies;
  }
  function collectInputSelectorResults(dependencies, inputSelectorArgs) {
    const inputSelectorResults = [];
    const { length } = dependencies;
    for (let i = 0; i < length; i++) {
      inputSelectorResults.push(dependencies[i].apply(null, inputSelectorArgs));
    }
    return inputSelectorResults;
  }
  var getDevModeChecksExecutionInfo = (firstRun, devModeChecks) => {
    const { identityFunctionCheck, inputStabilityCheck } = {
      ...globalDevModeChecks,
      ...devModeChecks
    };
    return {
      identityFunctionCheck: {
        shouldRun: identityFunctionCheck === "always" || identityFunctionCheck === "once" && firstRun,
        run: runIdentityFunctionCheck
      },
      inputStabilityCheck: {
        shouldRun: inputStabilityCheck === "always" || inputStabilityCheck === "once" && firstRun,
        run: runInputStabilityCheck
      }
    };
  };
  var StrongRef = class {
    constructor(value) {
      this.value = value;
    }
    deref() {
      return this.value;
    }
  };
  var getWeakRef = () => typeof WeakRef === "undefined" ? StrongRef : WeakRef;
  var Ref = /* @__PURE__ */ getWeakRef();
  var UNTERMINATED = 0;
  var TERMINATED = 1;
  function createCacheNode() {
    return {
      s: UNTERMINATED,
      v: void 0,
      o: null,
      p: null
    };
  }
  function maybeDeref(r2) {
    if (r2 instanceof Ref) {
      return r2.deref();
    }
    return r2;
  }
  function weakMapMemoize(func, options = {}) {
    let fnNode = createCacheNode();
    const { resultEqualityCheck } = options;
    let lastResult2;
    let resultsCount = 0;
    function memoized() {
      let cacheNode = fnNode;
      const { length } = arguments;
      for (let i = 0, l = length; i < l; i++) {
        const arg = arguments[i];
        if (typeof arg === "function" || typeof arg === "object" && arg !== null) {
          let objectCache = cacheNode.o;
          if (objectCache === null) {
            cacheNode.o = objectCache = /* @__PURE__ */ new WeakMap();
          }
          const objectNode = objectCache.get(arg);
          if (objectNode === void 0) {
            cacheNode = createCacheNode();
            objectCache.set(arg, cacheNode);
          } else {
            cacheNode = objectNode;
          }
        } else {
          let primitiveCache = cacheNode.p;
          if (primitiveCache === null) {
            cacheNode.p = primitiveCache = /* @__PURE__ */ new Map();
          }
          const primitiveNode = primitiveCache.get(arg);
          if (primitiveNode === void 0) {
            cacheNode = createCacheNode();
            primitiveCache.set(arg, cacheNode);
          } else {
            cacheNode = primitiveNode;
          }
        }
      }
      const terminatedNode = cacheNode;
      let result;
      if (cacheNode.s === TERMINATED) {
        result = cacheNode.v;
      } else {
        result = func.apply(null, arguments);
        resultsCount++;
        if (resultEqualityCheck) {
          const lastResultValue = maybeDeref(lastResult2);
          if (lastResultValue != null && resultEqualityCheck(lastResultValue, result)) {
            result = lastResultValue;
            resultsCount !== 0 && resultsCount--;
          }
          const needsWeakRef = typeof result === "object" && result !== null || typeof result === "function";
          lastResult2 = needsWeakRef ? /* @__PURE__ */ new Ref(result) : result;
        }
      }
      terminatedNode.s = TERMINATED;
      terminatedNode.v = result;
      return result;
    }
    memoized.clearCache = () => {
      fnNode = createCacheNode();
      memoized.resetResultsCount();
    };
    memoized.resultsCount = () => resultsCount;
    memoized.resetResultsCount = () => {
      resultsCount = 0;
    };
    return memoized;
  }
  function createSelectorCreator(memoizeOrOptions, ...memoizeOptionsFromArgs) {
    const createSelectorCreatorOptions = typeof memoizeOrOptions === "function" ? {
      memoize: memoizeOrOptions,
      memoizeOptions: memoizeOptionsFromArgs
    } : memoizeOrOptions;
    const createSelector2 = (...createSelectorArgs) => {
      let recomputations = 0;
      let dependencyRecomputations = 0;
      let lastResult2;
      let directlyPassedOptions = {};
      let resultFunc = createSelectorArgs.pop();
      if (typeof resultFunc === "object") {
        directlyPassedOptions = resultFunc;
        resultFunc = createSelectorArgs.pop();
      }
      assertIsFunction(
        resultFunc,
        `createSelector expects an output function after the inputs, but received: [${typeof resultFunc}]`
      );
      const combinedOptions = {
        ...createSelectorCreatorOptions,
        ...directlyPassedOptions
      };
      const {
        memoize,
        memoizeOptions = [],
        argsMemoize = weakMapMemoize,
        argsMemoizeOptions = []
      } = combinedOptions;
      const finalMemoizeOptions = ensureIsArray(memoizeOptions);
      const finalArgsMemoizeOptions = ensureIsArray(argsMemoizeOptions);
      const dependencies = getDependencies(createSelectorArgs);
      const memoizedResultFunc = memoize(function recomputationWrapper() {
        recomputations++;
        return resultFunc.apply(
          null,
          arguments
        );
      }, ...finalMemoizeOptions);
      let firstRun = true;
      const selector = argsMemoize(function dependenciesChecker() {
        dependencyRecomputations++;
        const inputSelectorResults = collectInputSelectorResults(
          dependencies,
          arguments
        );
        lastResult2 = memoizedResultFunc.apply(null, inputSelectorResults);
        if (true) {
          const { devModeChecks = {} } = combinedOptions;
          const { identityFunctionCheck, inputStabilityCheck } = getDevModeChecksExecutionInfo(firstRun, devModeChecks);
          if (identityFunctionCheck.shouldRun) {
            identityFunctionCheck.run(
              resultFunc,
              inputSelectorResults,
              lastResult2
            );
          }
          if (inputStabilityCheck.shouldRun) {
            const inputSelectorResultsCopy = collectInputSelectorResults(
              dependencies,
              arguments
            );
            inputStabilityCheck.run(
              { inputSelectorResults, inputSelectorResultsCopy },
              { memoize, memoizeOptions: finalMemoizeOptions },
              arguments
            );
          }
          if (firstRun) firstRun = false;
        }
        return lastResult2;
      }, ...finalArgsMemoizeOptions);
      return Object.assign(selector, {
        resultFunc,
        memoizedResultFunc,
        dependencies,
        dependencyRecomputations: () => dependencyRecomputations,
        resetDependencyRecomputations: () => {
          dependencyRecomputations = 0;
        },
        lastResult: () => lastResult2,
        recomputations: () => recomputations,
        resetRecomputations: () => {
          recomputations = 0;
        },
        memoize,
        argsMemoize
      });
    };
    Object.assign(createSelector2, {
      withTypes: () => createSelector2
    });
    return createSelector2;
  }
  var createSelector = /* @__PURE__ */ createSelectorCreator(weakMapMemoize);

  // node_modules/es-toolkit/compat/sortBy.mjs
  init_define_import_meta_env();

  // node_modules/es-toolkit/dist/compat/array/sortBy.mjs
  init_define_import_meta_env();

  // node_modules/es-toolkit/dist/array/flatten.mjs
  init_define_import_meta_env();
  function flatten(arr, depth = 1) {
    const result = [];
    const flooredDepth = Math.floor(depth);
    const recursive = (arr2, currentDepth) => {
      for (let i = 0; i < arr2.length; i++) {
        const item = arr2[i];
        if (Array.isArray(item) && currentDepth < flooredDepth) recursive(item, currentDepth + 1);
        else result.push(item);
      }
    };
    recursive(arr, 0);
    return result;
  }

  // node_modules/es-toolkit/dist/compat/_internal/isIterateeCall.mjs
  init_define_import_meta_env();
  function isIterateeCall(value, index, object) {
    if (!isObject(object)) return false;
    if (typeof index === "number" && isArrayLike(object) && isIndex(index) && index < object.length || typeof index === "string" && index in object) return isEqualsSameValueZero(object[index], value);
    return false;
  }

  // node_modules/es-toolkit/dist/compat/array/orderBy.mjs
  init_define_import_meta_env();

  // node_modules/es-toolkit/dist/compat/_internal/compareValues.mjs
  init_define_import_meta_env();
  function getPriority(a) {
    if (typeof a === "symbol") return 1;
    if (a === null) return 2;
    if (a === void 0) return 3;
    if (a !== a) return 4;
    return 0;
  }
  var compareValues = (a, b, order) => {
    if (a !== b) {
      const aPriority = getPriority(a);
      const bPriority = getPriority(b);
      if (aPriority === bPriority && aPriority === 0) {
        if (a < b) return order === "desc" ? 1 : -1;
        if (a > b) return order === "desc" ? -1 : 1;
      }
      return order === "desc" ? bPriority - aPriority : aPriority - bPriority;
    }
    return 0;
  };

  // node_modules/es-toolkit/dist/compat/_internal/isKey.mjs
  init_define_import_meta_env();

  // node_modules/es-toolkit/dist/compat/predicate/isSymbol.mjs
  init_define_import_meta_env();
  function isSymbol(value) {
    return typeof value === "symbol" || value instanceof Symbol;
  }

  // node_modules/es-toolkit/dist/compat/_internal/isKey.mjs
  var regexIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  var regexIsPlainProp = /^\w*$/;
  function isKey(value, object) {
    if (Array.isArray(value)) return false;
    if (typeof value === "number" || typeof value === "boolean" || value == null || isSymbol(value)) return true;
    return typeof value === "string" && (regexIsPlainProp.test(value) || !regexIsDeepProp.test(value)) || object != null && Object.hasOwn(object, value);
  }

  // node_modules/es-toolkit/dist/compat/array/orderBy.mjs
  function orderBy(collection, criteria, orders, guard) {
    if (collection == null) return [];
    orders = guard ? void 0 : orders;
    if (!Array.isArray(collection)) collection = Object.values(collection);
    if (!Array.isArray(criteria)) criteria = criteria == null ? [null] : [criteria];
    if (criteria.length === 0) criteria = [null];
    if (!Array.isArray(orders)) orders = orders == null ? [] : [orders];
    orders = orders.map((order) => String(order));
    const getValueByNestedPath = (object, path) => {
      let target = object;
      for (let i = 0; i < path.length && target != null; ++i) target = target[path[i]];
      return target;
    };
    const getValueByCriterion = (criterion, object) => {
      if (object == null || criterion == null) return object;
      if (typeof criterion === "object" && "key" in criterion) {
        if (Object.hasOwn(object, criterion.key)) return object[criterion.key];
        return getValueByNestedPath(object, criterion.path);
      }
      if (typeof criterion === "function") return criterion(object);
      if (Array.isArray(criterion)) return getValueByNestedPath(object, criterion);
      if (typeof object === "object") return object[criterion];
      return object;
    };
    const preparedCriteria = criteria.map((criterion) => {
      if (Array.isArray(criterion) && criterion.length === 1) criterion = criterion[0];
      if (criterion == null || typeof criterion === "function" || Array.isArray(criterion) || isKey(criterion)) return criterion;
      return {
        key: criterion,
        path: toPath(criterion)
      };
    });
    return collection.map((item) => ({
      original: item,
      criteria: preparedCriteria.map((criterion) => getValueByCriterion(criterion, item))
    })).slice().sort((a, b) => {
      for (let i = 0; i < preparedCriteria.length; i++) {
        const comparedResult = compareValues(a.criteria[i], b.criteria[i], orders[i]);
        if (comparedResult !== 0) return comparedResult;
      }
      return 0;
    }).map((item) => item.original);
  }

  // node_modules/es-toolkit/dist/compat/array/sortBy.mjs
  function sortBy(collection, ...criteria) {
    const length = criteria.length;
    if (length > 1 && isIterateeCall(collection, criteria[0], criteria[1])) criteria = [];
    else if (length > 2 && isIterateeCall(criteria[0], criteria[1], criteria[2])) criteria = [criteria[0]];
    return orderBy(collection, flatten(criteria), ["asc"]);
  }

  // node_modules/recharts/es6/state/selectors/legendSelectors.js
  var selectLegendSettings = (state) => state.legend.settings;
  var selectLegendSize = (state) => state.legend.size;
  var selectAllLegendPayload2DArray = (state) => state.legend.payload;
  var selectLegendPayload = createSelector([selectAllLegendPayload2DArray, selectLegendSettings], (payloads, _ref2) => {
    var itemSorter = _ref2.itemSorter;
    var flat = payloads.flat(1);
    return itemSorter ? sortBy(flat, itemSorter) : flat;
  });

  // node_modules/recharts/es6/context/chartLayoutContext.js
  init_define_import_meta_env();
  var import_react10 = __toESM(require_react_shim());

  // node_modules/recharts/es6/state/layoutSlice.js
  init_define_import_meta_env();

  // node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs
  init_define_import_meta_env();

  // node_modules/redux/dist/redux.mjs
  init_define_import_meta_env();
  var $$observable = /* @__PURE__ */ (() => typeof Symbol === "function" && Symbol.observable || "@@observable")();
  var symbol_observable_default = $$observable;
  var randomString = () => Math.random().toString(36).substring(7).split("").join(".");
  var ActionTypes = {
    INIT: `@@redux/INIT${/* @__PURE__ */ randomString()}`,
    REPLACE: `@@redux/REPLACE${/* @__PURE__ */ randomString()}`,
    PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
  };
  var actionTypes_default = ActionTypes;
  function isPlainObject(obj) {
    if (typeof obj !== "object" || obj === null)
      return false;
    let proto = obj;
    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(obj) === proto || Object.getPrototypeOf(obj) === null;
  }
  function miniKindOf(val) {
    if (val === void 0)
      return "undefined";
    if (val === null)
      return "null";
    const type = typeof val;
    switch (type) {
      case "boolean":
      case "string":
      case "number":
      case "symbol":
      case "function": {
        return type;
      }
    }
    if (Array.isArray(val))
      return "array";
    if (isDate(val))
      return "date";
    if (isError(val))
      return "error";
    const constructorName = ctorName(val);
    switch (constructorName) {
      case "Symbol":
      case "Promise":
      case "WeakMap":
      case "WeakSet":
      case "Map":
      case "Set":
        return constructorName;
    }
    return Object.prototype.toString.call(val).slice(8, -1).toLowerCase().replace(/\s/g, "");
  }
  function ctorName(val) {
    return typeof val.constructor === "function" ? val.constructor.name : null;
  }
  function isError(val) {
    return val instanceof Error || typeof val.message === "string" && val.constructor && typeof val.constructor.stackTraceLimit === "number";
  }
  function isDate(val) {
    if (val instanceof Date)
      return true;
    return typeof val.toDateString === "function" && typeof val.getDate === "function" && typeof val.setDate === "function";
  }
  function kindOf(val) {
    let typeOfVal = typeof val;
    if (true) {
      typeOfVal = miniKindOf(val);
    }
    return typeOfVal;
  }
  function createStore(reducer, preloadedState, enhancer) {
    if (typeof reducer !== "function") {
      throw new Error(false ? formatProdErrorMessage(2) : `Expected the root reducer to be a function. Instead, received: '${kindOf(reducer)}'`);
    }
    if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function" && typeof arguments[3] === "function") {
      throw new Error(false ? formatProdErrorMessage(0) : "It looks like you are passing several store enhancers to createStore(). This is not supported. Instead, compose them together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.");
    }
    if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
      enhancer = preloadedState;
      preloadedState = void 0;
    }
    if (typeof enhancer !== "undefined") {
      if (typeof enhancer !== "function") {
        throw new Error(false ? formatProdErrorMessage(1) : `Expected the enhancer to be a function. Instead, received: '${kindOf(enhancer)}'`);
      }
      return enhancer(createStore)(reducer, preloadedState);
    }
    let currentReducer = reducer;
    let currentState = preloadedState;
    let currentListeners = /* @__PURE__ */ new Map();
    let nextListeners = currentListeners;
    let listenerIdCounter = 0;
    let isDispatching = false;
    function ensureCanMutateNextListeners() {
      if (nextListeners === currentListeners) {
        nextListeners = /* @__PURE__ */ new Map();
        currentListeners.forEach((listener2, key) => {
          nextListeners.set(key, listener2);
        });
      }
    }
    function getState() {
      if (isDispatching) {
        throw new Error(false ? formatProdErrorMessage(3) : "You may not call store.getState() while the reducer is executing. The reducer has already received the state as an argument. Pass it down from the top reducer instead of reading it from the store.");
      }
      return currentState;
    }
    function subscribe(listener2) {
      if (typeof listener2 !== "function") {
        throw new Error(false ? formatProdErrorMessage(4) : `Expected the listener to be a function. Instead, received: '${kindOf(listener2)}'`);
      }
      if (isDispatching) {
        throw new Error(false ? formatProdErrorMessage(5) : "You may not call store.subscribe() while the reducer is executing. If you would like to be notified after the store has been updated, subscribe from a component and invoke store.getState() in the callback to access the latest state. See https://redux.js.org/api/store#subscribelistener for more details.");
      }
      let isSubscribed = true;
      ensureCanMutateNextListeners();
      const listenerId = listenerIdCounter++;
      nextListeners.set(listenerId, listener2);
      return function unsubscribe() {
        if (!isSubscribed) {
          return;
        }
        if (isDispatching) {
          throw new Error(false ? formatProdErrorMessage(6) : "You may not unsubscribe from a store listener while the reducer is executing. See https://redux.js.org/api/store#subscribelistener for more details.");
        }
        isSubscribed = false;
        ensureCanMutateNextListeners();
        nextListeners.delete(listenerId);
        currentListeners = null;
      };
    }
    function dispatch(action) {
      if (!isPlainObject(action)) {
        throw new Error(false ? formatProdErrorMessage(7) : `Actions must be plain objects. Instead, the actual type was: '${kindOf(action)}'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.`);
      }
      if (typeof action.type === "undefined") {
        throw new Error(false ? formatProdErrorMessage(8) : 'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.');
      }
      if (typeof action.type !== "string") {
        throw new Error(false ? formatProdErrorMessage(17) : `Action "type" property must be a string. Instead, the actual type was: '${kindOf(action.type)}'. Value was: '${action.type}' (stringified)`);
      }
      if (isDispatching) {
        throw new Error(false ? formatProdErrorMessage(9) : "Reducers may not dispatch actions.");
      }
      try {
        isDispatching = true;
        currentState = currentReducer(currentState, action);
      } finally {
        isDispatching = false;
      }
      const listeners = currentListeners = nextListeners;
      listeners.forEach((listener2) => {
        listener2();
      });
      return action;
    }
    function replaceReducer(nextReducer) {
      if (typeof nextReducer !== "function") {
        throw new Error(false ? formatProdErrorMessage(10) : `Expected the nextReducer to be a function. Instead, received: '${kindOf(nextReducer)}`);
      }
      currentReducer = nextReducer;
      dispatch({
        type: actionTypes_default.REPLACE
      });
    }
    function observable() {
      const outerSubscribe = subscribe;
      return {
        /**
         * The minimal observable subscription method.
         * @param observer Any object that can be used as an observer.
         * The observer object should have a `next` method.
         * @returns An object with an `unsubscribe` method that can
         * be used to unsubscribe the observable from the store, and prevent further
         * emission of values from the observable.
         */
        subscribe(observer) {
          if (typeof observer !== "object" || observer === null) {
            throw new Error(false ? formatProdErrorMessage(11) : `Expected the observer to be an object. Instead, received: '${kindOf(observer)}'`);
          }
          function observeState() {
            const observerAsObserver = observer;
            if (observerAsObserver.next) {
              observerAsObserver.next(getState());
            }
          }
          observeState();
          const unsubscribe = outerSubscribe(observeState);
          return {
            unsubscribe
          };
        },
        [symbol_observable_default]() {
          return this;
        }
      };
    }
    dispatch({
      type: actionTypes_default.INIT
    });
    const store = {
      dispatch,
      subscribe,
      getState,
      replaceReducer,
      [symbol_observable_default]: observable
    };
    return store;
  }
  function warning(message) {
    if (typeof console !== "undefined" && typeof console.error === "function") {
      console.error(message);
    }
    try {
      throw new Error(message);
    } catch (e) {
    }
  }
  function getUnexpectedStateShapeWarningMessage(inputState, reducers2, action, unexpectedKeyCache) {
    const reducerKeys = Object.keys(reducers2);
    const argumentName = action && action.type === actionTypes_default.INIT ? "preloadedState argument passed to createStore" : "previous state received by the reducer";
    if (reducerKeys.length === 0) {
      return "Store does not have a valid reducer. Make sure the argument passed to combineReducers is an object whose values are reducers.";
    }
    if (!isPlainObject(inputState)) {
      return `The ${argumentName} has unexpected type of "${kindOf(inputState)}". Expected argument to be an object with the following keys: "${reducerKeys.join('", "')}"`;
    }
    const unexpectedKeys = Object.keys(inputState).filter((key) => !reducers2.hasOwnProperty(key) && !unexpectedKeyCache[key]);
    unexpectedKeys.forEach((key) => {
      unexpectedKeyCache[key] = true;
    });
    if (action && action.type === actionTypes_default.REPLACE)
      return;
    if (unexpectedKeys.length > 0) {
      return `Unexpected ${unexpectedKeys.length > 1 ? "keys" : "key"} "${unexpectedKeys.join('", "')}" found in ${argumentName}. Expected to find one of the known reducer keys instead: "${reducerKeys.join('", "')}". Unexpected keys will be ignored.`;
    }
  }
  function assertReducerShape(reducers2) {
    Object.keys(reducers2).forEach((key) => {
      const reducer = reducers2[key];
      const initialState15 = reducer(void 0, {
        type: actionTypes_default.INIT
      });
      if (typeof initialState15 === "undefined") {
        throw new Error(false ? formatProdErrorMessage(12) : `The slice reducer for key "${key}" returned undefined during initialization. If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined. If you don't want to set a value for this reducer, you can use null instead of undefined.`);
      }
      if (typeof reducer(void 0, {
        type: actionTypes_default.PROBE_UNKNOWN_ACTION()
      }) === "undefined") {
        throw new Error(false ? formatProdErrorMessage(13) : `The slice reducer for key "${key}" returned undefined when probed with a random type. Don't try to handle '${actionTypes_default.INIT}' or other actions in "redux/*" namespace. They are considered private. Instead, you must return the current state for any unknown actions, unless it is undefined, in which case you must return the initial state, regardless of the action type. The initial state may not be undefined, but can be null.`);
      }
    });
  }
  function combineReducers(reducers2) {
    const reducerKeys = Object.keys(reducers2);
    const finalReducers = {};
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i];
      if (true) {
        if (typeof reducers2[key] === "undefined") {
          warning(`No reducer provided for key "${key}"`);
        }
      }
      if (typeof reducers2[key] === "function") {
        finalReducers[key] = reducers2[key];
      }
    }
    const finalReducerKeys = Object.keys(finalReducers);
    let unexpectedKeyCache;
    if (true) {
      unexpectedKeyCache = {};
    }
    let shapeAssertionError;
    try {
      assertReducerShape(finalReducers);
    } catch (e) {
      shapeAssertionError = e;
    }
    return function combination(state = {}, action) {
      if (shapeAssertionError) {
        throw shapeAssertionError;
      }
      if (true) {
        const warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
        if (warningMessage) {
          warning(warningMessage);
        }
      }
      let hasChanged = false;
      const nextState = {};
      for (let i = 0; i < finalReducerKeys.length; i++) {
        const key = finalReducerKeys[i];
        const reducer = finalReducers[key];
        const previousStateForKey = state[key];
        const nextStateForKey = reducer(previousStateForKey, action);
        if (typeof nextStateForKey === "undefined") {
          const actionType = action && action.type;
          throw new Error(false ? formatProdErrorMessage(14) : `When called with an action of type ${actionType ? `"${String(actionType)}"` : "(unknown type)"}, the slice reducer for key "${key}" returned undefined. To ignore an action, you must explicitly return the previous state. If you want this reducer to hold no value, you can return null instead of undefined.`);
        }
        nextState[key] = nextStateForKey;
        hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
      }
      hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
      return hasChanged ? nextState : state;
    };
  }
  function compose(...funcs) {
    if (funcs.length === 0) {
      return (arg) => arg;
    }
    if (funcs.length === 1) {
      return funcs[0];
    }
    return funcs.reduce((a, b) => (...args) => a(b(...args)));
  }
  function applyMiddleware(...middlewares) {
    return (createStore2) => (reducer, preloadedState) => {
      const store = createStore2(reducer, preloadedState);
      let dispatch = () => {
        throw new Error(false ? formatProdErrorMessage(15) : "Dispatching while constructing your middleware is not allowed. Other middleware would not be applied to this dispatch.");
      };
      const middlewareAPI = {
        getState: store.getState,
        dispatch: (action, ...args) => dispatch(action, ...args)
      };
      const chain = middlewares.map((middleware) => middleware(middlewareAPI));
      dispatch = compose(...chain)(store.dispatch);
      return {
        ...store,
        dispatch
      };
    };
  }
  function isAction(action) {
    return isPlainObject(action) && "type" in action && typeof action.type === "string";
  }

  // node_modules/immer/dist/immer.mjs
  init_define_import_meta_env();
  var NOTHING = /* @__PURE__ */ Symbol.for("immer-nothing");
  var DRAFTABLE = /* @__PURE__ */ Symbol.for("immer-draftable");
  var DRAFT_STATE = /* @__PURE__ */ Symbol.for("immer-state");
  var errors = true ? [
    // All error codes, starting by 0:
    function(plugin) {
      return `The plugin for '${plugin}' has not been loaded into Immer. To enable the plugin, import and call \`enable${plugin}()\` when initializing your application.`;
    },
    function(thing) {
      return `produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '${thing}'`;
    },
    "This object has been frozen and should not be mutated",
    function(data2) {
      return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + data2;
    },
    "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
    "Immer forbids circular references",
    "The first or second argument to `produce` must be a function",
    "The third argument to `produce` must be a function or undefined",
    "First argument to `createDraft` must be a plain object, an array, or an immerable object",
    "First argument to `finishDraft` must be a draft returned by `createDraft`",
    function(thing) {
      return `'current' expects a draft, got: ${thing}`;
    },
    "Object.defineProperty() cannot be used on an Immer draft",
    "Object.setPrototypeOf() cannot be used on an Immer draft",
    "Immer only supports deleting array indices",
    "Immer only supports setting array indices and the 'length' property",
    function(thing) {
      return `'original' expects a draft, got: ${thing}`;
    }
    // Note: if more errors are added, the errorOffset in Patches.ts should be increased
    // See Patches.ts for additional errors
  ] : [];
  function die(error, ...args) {
    if (true) {
      const e = errors[error];
      const msg = isFunction(e) ? e.apply(null, args) : e;
      throw new Error(`[Immer] ${msg}`);
    }
    throw new Error(
      `[Immer] minified error nr: ${error}. Full error at: https://bit.ly/3cXEKWf`
    );
  }
  var O = Object;
  var getPrototypeOf = O.getPrototypeOf;
  var CONSTRUCTOR = "constructor";
  var PROTOTYPE = "prototype";
  var CONFIGURABLE = "configurable";
  var ENUMERABLE = "enumerable";
  var WRITABLE = "writable";
  var VALUE = "value";
  var isDraft = (value) => !!value && !!value[DRAFT_STATE];
  function isDraftable(value) {
    if (!value)
      return false;
    return isPlainObject2(value) || isArray(value) || !!value[DRAFTABLE] || !!value[CONSTRUCTOR]?.[DRAFTABLE] || isMap(value) || isSet(value);
  }
  var objectCtorString = O[PROTOTYPE][CONSTRUCTOR].toString();
  var cachedCtorStrings = /* @__PURE__ */ new WeakMap();
  function isPlainObject2(value) {
    if (!value || !isObjectish(value))
      return false;
    const proto = getPrototypeOf(value);
    if (proto === null || proto === O[PROTOTYPE])
      return true;
    const Ctor = O.hasOwnProperty.call(proto, CONSTRUCTOR) && proto[CONSTRUCTOR];
    if (Ctor === Object)
      return true;
    if (!isFunction(Ctor))
      return false;
    let ctorString = cachedCtorStrings.get(Ctor);
    if (ctorString === void 0) {
      ctorString = Function.toString.call(Ctor);
      cachedCtorStrings.set(Ctor, ctorString);
    }
    return ctorString === objectCtorString;
  }
  function each(obj, iter, strict = true) {
    if (getArchtype(obj) === 0) {
      const keys = strict ? Reflect.ownKeys(obj) : O.keys(obj);
      keys.forEach((key) => {
        iter(key, obj[key], obj);
      });
    } else {
      obj.forEach((entry, index) => iter(index, entry, obj));
    }
  }
  function getArchtype(thing) {
    const state = thing[DRAFT_STATE];
    return state ? state.type_ : isArray(thing) ? 1 : isMap(thing) ? 2 : isSet(thing) ? 3 : 0;
  }
  var has = (thing, prop, type = getArchtype(thing)) => type === 2 ? thing.has(prop) : O[PROTOTYPE].hasOwnProperty.call(thing, prop);
  var get2 = (thing, prop, type = getArchtype(thing)) => (
    // @ts-ignore
    type === 2 ? thing.get(prop) : thing[prop]
  );
  var set = (thing, propOrOldValue, value, type = getArchtype(thing)) => {
    if (type === 2)
      thing.set(propOrOldValue, value);
    else if (type === 3) {
      thing.add(value);
    } else
      thing[propOrOldValue] = value;
  };
  function is(x, y) {
    if (x === y) {
      return x !== 0 || 1 / x === 1 / y;
    } else {
      return x !== x && y !== y;
    }
  }
  var isArray = Array.isArray;
  var isMap = (target) => target instanceof Map;
  var isSet = (target) => target instanceof Set;
  var isObjectish = (target) => typeof target === "object";
  var isFunction = (target) => typeof target === "function";
  var isBoolean = (target) => typeof target === "boolean";
  function isArrayIndex(value) {
    const n = +value;
    return Number.isInteger(n) && String(n) === value;
  }
  var latest = (state) => state.copy_ || state.base_;
  var getFinalValue = (state) => state.modified_ ? state.copy_ : state.base_;
  function shallowCopy(base, strict) {
    if (isMap(base)) {
      return new Map(base);
    }
    if (isSet(base)) {
      return new Set(base);
    }
    if (isArray(base))
      return Array[PROTOTYPE].slice.call(base);
    const isPlain2 = isPlainObject2(base);
    if (strict === true || strict === "class_only" && !isPlain2) {
      const descriptors = O.getOwnPropertyDescriptors(base);
      delete descriptors[DRAFT_STATE];
      let keys = Reflect.ownKeys(descriptors);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const desc = descriptors[key];
        if (desc[WRITABLE] === false) {
          desc[WRITABLE] = true;
          desc[CONFIGURABLE] = true;
        }
        if (desc.get || desc.set)
          descriptors[key] = {
            [CONFIGURABLE]: true,
            [WRITABLE]: true,
            // could live with !!desc.set as well here...
            [ENUMERABLE]: desc[ENUMERABLE],
            [VALUE]: base[key]
          };
      }
      return O.create(getPrototypeOf(base), descriptors);
    } else {
      const proto = getPrototypeOf(base);
      if (proto !== null && isPlain2) {
        return { ...base };
      }
      const obj = O.create(proto);
      return O.assign(obj, base);
    }
  }
  function freeze(obj, deep = false) {
    if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj))
      return obj;
    if (getArchtype(obj) > 1) {
      O.defineProperties(obj, {
        set: dontMutateMethodOverride,
        add: dontMutateMethodOverride,
        clear: dontMutateMethodOverride,
        delete: dontMutateMethodOverride
      });
    }
    O.freeze(obj);
    if (deep)
      each(
        obj,
        (_key, value) => {
          freeze(value, true);
        },
        false
      );
    return obj;
  }
  function dontMutateFrozenCollections() {
    die(2);
  }
  var dontMutateMethodOverride = {
    [VALUE]: dontMutateFrozenCollections
  };
  function isFrozen(obj) {
    if (obj === null || !isObjectish(obj))
      return true;
    return O.isFrozen(obj);
  }
  var PluginMapSet = "MapSet";
  var PluginPatches = "Patches";
  var PluginArrayMethods = "ArrayMethods";
  var plugins = {};
  function getPlugin(pluginKey) {
    const plugin = plugins[pluginKey];
    if (!plugin) {
      die(0, pluginKey);
    }
    return plugin;
  }
  var isPluginLoaded = (pluginKey) => !!plugins[pluginKey];
  var currentScope;
  var getCurrentScope = () => currentScope;
  var createScope = (parent_, immer_) => ({
    drafts_: [],
    parent_,
    immer_,
    // Whenever the modified draft contains a draft from another scope, we
    // need to prevent auto-freezing so the unowned draft can be finalized.
    canAutoFreeze_: true,
    unfinalizedDrafts_: 0,
    handledSet_: /* @__PURE__ */ new Set(),
    processedForPatches_: /* @__PURE__ */ new Set(),
    mapSetPlugin_: isPluginLoaded(PluginMapSet) ? getPlugin(PluginMapSet) : void 0,
    arrayMethodsPlugin_: isPluginLoaded(PluginArrayMethods) ? getPlugin(PluginArrayMethods) : void 0
  });
  function usePatchesInScope(scope, patchListener) {
    if (patchListener) {
      scope.patchPlugin_ = getPlugin(PluginPatches);
      scope.patches_ = [];
      scope.inversePatches_ = [];
      scope.patchListener_ = patchListener;
    }
  }
  function revokeScope(scope) {
    leaveScope(scope);
    scope.drafts_.forEach(revokeDraft);
    scope.drafts_ = null;
  }
  function leaveScope(scope) {
    if (scope === currentScope) {
      currentScope = scope.parent_;
    }
  }
  var enterScope = (immer2) => currentScope = createScope(currentScope, immer2);
  function revokeDraft(draft) {
    const state = draft[DRAFT_STATE];
    if (state.type_ === 0 || state.type_ === 1)
      state.revoke_();
    else
      state.revoked_ = true;
  }
  function processResult(result, scope) {
    scope.unfinalizedDrafts_ = scope.drafts_.length;
    const baseDraft = scope.drafts_[0];
    const isReplaced = result !== void 0 && result !== baseDraft;
    if (isReplaced) {
      if (baseDraft[DRAFT_STATE].modified_) {
        revokeScope(scope);
        die(4);
      }
      if (isDraftable(result)) {
        result = finalize(scope, result);
      }
      const { patchPlugin_ } = scope;
      if (patchPlugin_) {
        patchPlugin_.generateReplacementPatches_(
          baseDraft[DRAFT_STATE].base_,
          result,
          scope
        );
      }
    } else {
      result = finalize(scope, baseDraft);
    }
    maybeFreeze(scope, result, true);
    revokeScope(scope);
    if (scope.patches_) {
      scope.patchListener_(scope.patches_, scope.inversePatches_);
    }
    return result !== NOTHING ? result : void 0;
  }
  function finalize(rootScope, value) {
    if (isFrozen(value))
      return value;
    const state = value[DRAFT_STATE];
    if (!state) {
      const finalValue = handleValue(value, rootScope.handledSet_, rootScope);
      return finalValue;
    }
    if (!isSameScope(state, rootScope)) {
      return value;
    }
    if (!state.modified_) {
      return state.base_;
    }
    if (!state.finalized_) {
      const { callbacks_ } = state;
      if (callbacks_) {
        while (callbacks_.length > 0) {
          const callback = callbacks_.pop();
          callback(rootScope);
        }
      }
      generatePatchesAndFinalize(state, rootScope);
    }
    return state.copy_;
  }
  function maybeFreeze(scope, value, deep = false) {
    if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
      freeze(value, deep);
    }
  }
  function markStateFinalized(state) {
    state.finalized_ = true;
    state.scope_.unfinalizedDrafts_--;
  }
  var isSameScope = (state, rootScope) => state.scope_ === rootScope;
  var EMPTY_LOCATIONS_RESULT = [];
  function updateDraftInParent(parent, draftValue, finalizedValue, originalKey) {
    const parentCopy = latest(parent);
    const parentType = parent.type_;
    if (originalKey !== void 0) {
      const currentValue = get2(parentCopy, originalKey, parentType);
      if (currentValue === draftValue) {
        set(parentCopy, originalKey, finalizedValue, parentType);
        return;
      }
    }
    if (!parent.draftLocations_) {
      const draftLocations = parent.draftLocations_ = /* @__PURE__ */ new Map();
      each(parentCopy, (key, value) => {
        if (isDraft(value)) {
          const keys = draftLocations.get(value) || [];
          keys.push(key);
          draftLocations.set(value, keys);
        }
      });
    }
    const locations = parent.draftLocations_.get(draftValue) ?? EMPTY_LOCATIONS_RESULT;
    for (const location of locations) {
      set(parentCopy, location, finalizedValue, parentType);
    }
  }
  function registerChildFinalizationCallback(parent, child, key) {
    parent.callbacks_.push(function childCleanup(rootScope) {
      const state = child;
      if (!state || !isSameScope(state, rootScope)) {
        return;
      }
      rootScope.mapSetPlugin_?.fixSetContents(state);
      const finalizedValue = getFinalValue(state);
      updateDraftInParent(parent, state.draft_ ?? state, finalizedValue, key);
      generatePatchesAndFinalize(state, rootScope);
    });
  }
  function generatePatchesAndFinalize(state, rootScope) {
    const shouldFinalize = state.modified_ && !state.finalized_ && (state.type_ === 3 || state.type_ === 1 && state.allIndicesReassigned_ || (state.assigned_?.size ?? 0) > 0);
    if (shouldFinalize) {
      const { patchPlugin_ } = rootScope;
      if (patchPlugin_) {
        const basePath = patchPlugin_.getPath(state);
        if (basePath) {
          patchPlugin_.generatePatches_(state, basePath, rootScope);
        }
      }
      markStateFinalized(state);
    }
  }
  function handleCrossReference(target, key, value) {
    const { scope_ } = target;
    if (isDraft(value)) {
      const state = value[DRAFT_STATE];
      if (isSameScope(state, scope_)) {
        state.callbacks_.push(function crossReferenceCleanup() {
          prepareCopy(target);
          const finalizedValue = getFinalValue(state);
          updateDraftInParent(target, value, finalizedValue, key);
        });
      }
    } else if (isDraftable(value)) {
      target.callbacks_.push(function nestedDraftCleanup() {
        const targetCopy = latest(target);
        if (target.type_ === 3) {
          if (targetCopy.has(value)) {
            handleValue(value, scope_.handledSet_, scope_);
          }
        } else {
          if (get2(targetCopy, key, target.type_) === value) {
            if (scope_.drafts_.length > 1 && (target.assigned_.get(key) ?? false) === true && target.copy_) {
              handleValue(
                get2(target.copy_, key, target.type_),
                scope_.handledSet_,
                scope_
              );
            }
          }
        }
      });
    }
  }
  function handleValue(target, handledSet, rootScope) {
    if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
      return target;
    }
    if (isDraft(target) || handledSet.has(target) || !isDraftable(target) || isFrozen(target)) {
      return target;
    }
    handledSet.add(target);
    each(target, (key, value) => {
      if (isDraft(value)) {
        const state = value[DRAFT_STATE];
        if (isSameScope(state, rootScope)) {
          const updatedValue = getFinalValue(state);
          set(target, key, updatedValue, target.type_);
          markStateFinalized(state);
        }
      } else if (isDraftable(value)) {
        handleValue(value, handledSet, rootScope);
      }
    });
    return target;
  }
  function createProxyProxy(base, parent) {
    const baseIsArray = isArray(base);
    const state = {
      type_: baseIsArray ? 1 : 0,
      // Track which produce call this is associated with.
      scope_: parent ? parent.scope_ : getCurrentScope(),
      // True for both shallow and deep changes.
      modified_: false,
      // Used during finalization.
      finalized_: false,
      // Track which properties have been assigned (true) or deleted (false).
      // actually instantiated in `prepareCopy()`
      assigned_: void 0,
      // The parent draft state.
      parent_: parent,
      // The base state.
      base_: base,
      // The base proxy.
      draft_: null,
      // set below
      // The base copy with any updated values.
      copy_: null,
      // Called by the `produce` function.
      revoke_: null,
      isManual_: false,
      // `callbacks` actually gets assigned in `createProxy`
      callbacks_: void 0
    };
    let target = state;
    let traps = objectTraps;
    if (baseIsArray) {
      target = [state];
      traps = arrayTraps;
    }
    const { revoke, proxy } = Proxy.revocable(target, traps);
    state.draft_ = proxy;
    state.revoke_ = revoke;
    return [proxy, state];
  }
  var objectTraps = {
    get(state, prop) {
      if (prop === DRAFT_STATE)
        return state;
      if (prop === "constructor" || prop === "__proto__") {
        const source2 = latest(state);
        const value2 = source2[prop];
        return new Proxy(value2 || {}, {
          get: (target, key) => {
            if (key === "__proto__" || key === "prototype") {
              return Object.freeze(/* @__PURE__ */ Object.create(null));
            }
            return Reflect.get(target, key);
          },
          set: () => {
            return true;
          },
          apply: (target, thisArg, args) => {
            return Reflect.apply(target, thisArg, args);
          }
        });
      }
      let arrayPlugin = state.scope_.arrayMethodsPlugin_;
      const isArrayWithStringProp = state.type_ === 1 && typeof prop === "string";
      if (isArrayWithStringProp) {
        if (arrayPlugin?.isArrayOperationMethod(prop)) {
          return arrayPlugin.createMethodInterceptor(state, prop);
        }
      }
      const source = latest(state);
      if (!has(source, prop, state.type_)) {
        return readPropFromProto(state, source, prop);
      }
      const value = source[prop];
      if (state.finalized_ || !isDraftable(value)) {
        return value;
      }
      if (isArrayWithStringProp && state.operationMethod && arrayPlugin?.isMutatingArrayMethod(
        state.operationMethod
      ) && isArrayIndex(prop)) {
        return value;
      }
      if (value === peek(state.base_, prop)) {
        prepareCopy(state);
        const childKey = state.type_ === 1 ? +prop : prop;
        const childDraft = createProxy(state.scope_, value, state, childKey);
        return state.copy_[childKey] = childDraft;
      }
      return value;
    },
    has(state, prop) {
      if (prop === "constructor" || prop === "__proto__" || prop === "prototype") {
        return false;
      }
      return prop in latest(state);
    },
    ownKeys(state) {
      return Reflect.ownKeys(latest(state));
    },
    set(state, prop, value) {
      if (prop === "constructor" || prop === "__proto__" || prop === "prototype") {
        return true;
      }
      const desc = getDescriptorFromProto(latest(state), prop);
      if (desc?.set) {
        desc.set.call(state.draft_, value);
        return true;
      }
      if (!state.modified_) {
        const current2 = peek(latest(state), prop);
        const currentState = current2?.[DRAFT_STATE];
        if (currentState && currentState.base_ === value) {
          state.copy_[prop] = value;
          state.assigned_.set(prop, false);
          return true;
        }
        if (is(value, current2) && (value !== void 0 || has(state.base_, prop, state.type_)))
          return true;
        prepareCopy(state);
        markChanged(state);
      }
      if (state.copy_[prop] === value && // special case: handle new props with value 'undefined'
      (value !== void 0 || has(state.copy_, prop, state.type_)) || // special case: NaN
      Number.isNaN(value) && Number.isNaN(state.copy_[prop]))
        return true;
      state.copy_[prop] = value;
      state.assigned_.set(prop, true);
      handleCrossReference(state, prop, value);
      return true;
    },
    deleteProperty(state, prop) {
      prepareCopy(state);
      if (peek(state.base_, prop) !== void 0 || prop in state.base_) {
        state.assigned_.set(prop, false);
        markChanged(state);
      } else {
        state.assigned_.delete(prop);
      }
      if (state.copy_) {
        delete state.copy_[prop];
      }
      return true;
    },
    // Note: We never coerce `desc.value` into an Immer draft, because we can't make
    // the same guarantee in ES5 mode.
    getOwnPropertyDescriptor(state, prop) {
      const owner = latest(state);
      const desc = Reflect.getOwnPropertyDescriptor(owner, prop);
      if (!desc)
        return desc;
      return {
        [WRITABLE]: true,
        [CONFIGURABLE]: state.type_ !== 1 || prop !== "length",
        [ENUMERABLE]: desc[ENUMERABLE],
        [VALUE]: owner[prop]
      };
    },
    defineProperty() {
      die(11);
    },
    getPrototypeOf(state) {
      return getPrototypeOf(state.base_);
    },
    setPrototypeOf() {
      die(12);
    }
  };
  var arrayTraps = {};
  for (let key in objectTraps) {
    let fn = objectTraps[key];
    arrayTraps[key] = function() {
      const args = arguments;
      args[0] = args[0][0];
      return fn.apply(this, args);
    };
  }
  arrayTraps.deleteProperty = function(state, prop) {
    if (isNaN(parseInt(prop)))
      die(13);
    return arrayTraps.set.call(this, state, prop, void 0);
  };
  arrayTraps.set = function(state, prop, value) {
    if (prop !== "length" && isNaN(parseInt(prop)))
      die(14);
    return objectTraps.set.call(this, state[0], prop, value, state[0]);
  };
  function peek(draft, prop) {
    const state = draft[DRAFT_STATE];
    const source = state ? latest(state) : draft;
    return source[prop];
  }
  function readPropFromProto(state, source, prop) {
    const desc = getDescriptorFromProto(source, prop);
    return desc ? VALUE in desc ? desc[VALUE] : (
      // This is a very special case, if the prop is a getter defined by the
      // prototype, we should invoke it with the draft as context!
      desc.get?.call(state.draft_)
    ) : void 0;
  }
  function getDescriptorFromProto(source, prop) {
    if (!(prop in source))
      return void 0;
    let proto = getPrototypeOf(source);
    while (proto) {
      const desc = Object.getOwnPropertyDescriptor(proto, prop);
      if (desc)
        return desc;
      proto = getPrototypeOf(proto);
    }
    return void 0;
  }
  function markChanged(state) {
    if (!state.modified_) {
      state.modified_ = true;
      if (state.parent_) {
        markChanged(state.parent_);
      }
    }
  }
  function prepareCopy(state) {
    if (!state.copy_) {
      state.assigned_ = /* @__PURE__ */ new Map();
      state.copy_ = shallowCopy(
        state.base_,
        state.scope_.immer_.useStrictShallowCopy_
      );
    }
  }
  var Immer2 = class {
    constructor(config2) {
      this.autoFreeze_ = true;
      this.useStrictShallowCopy_ = false;
      this.useStrictIteration_ = false;
      this.produce = (base, recipe, patchListener) => {
        if (isFunction(base) && !isFunction(recipe)) {
          const defaultBase = recipe;
          recipe = base;
          const self2 = this;
          return function curriedProduce(base2 = defaultBase, ...args) {
            return self2.produce(base2, (draft) => recipe.call(this, draft, ...args));
          };
        }
        if (!isFunction(recipe))
          die(6);
        if (patchListener !== void 0 && !isFunction(patchListener))
          die(7);
        let result;
        if (isDraftable(base)) {
          const scope = enterScope(this);
          const proxy = createProxy(scope, base, void 0);
          let hasError = true;
          try {
            result = recipe(proxy);
            hasError = false;
          } finally {
            if (hasError)
              revokeScope(scope);
            else
              leaveScope(scope);
          }
          usePatchesInScope(scope, patchListener);
          return processResult(result, scope);
        } else if (!base || !isObjectish(base)) {
          result = recipe(base);
          if (result === void 0)
            result = base;
          if (result === NOTHING)
            result = void 0;
          if (this.autoFreeze_)
            freeze(result, true);
          if (patchListener) {
            const p = [];
            const ip = [];
            getPlugin(PluginPatches).generateReplacementPatches_(base, result, {
              patches_: p,
              inversePatches_: ip
            });
            patchListener(p, ip);
          }
          return result;
        } else
          die(1, base);
      };
      this.produceWithPatches = (base, recipe) => {
        if (isFunction(base)) {
          return (state, ...args) => this.produceWithPatches(state, (draft) => base(draft, ...args));
        }
        let patches, inversePatches;
        const result = this.produce(base, recipe, (p, ip) => {
          patches = p;
          inversePatches = ip;
        });
        return [result, patches, inversePatches];
      };
      if (isBoolean(config2?.autoFreeze))
        this.setAutoFreeze(config2.autoFreeze);
      if (isBoolean(config2?.useStrictShallowCopy))
        this.setUseStrictShallowCopy(config2.useStrictShallowCopy);
      if (isBoolean(config2?.useStrictIteration))
        this.setUseStrictIteration(config2.useStrictIteration);
    }
    createDraft(base) {
      if (!isDraftable(base))
        die(8);
      if (isDraft(base))
        base = current(base);
      const scope = enterScope(this);
      const proxy = createProxy(scope, base, void 0);
      proxy[DRAFT_STATE].isManual_ = true;
      leaveScope(scope);
      return proxy;
    }
    finishDraft(draft, patchListener) {
      const state = draft && draft[DRAFT_STATE];
      if (!state || !state.isManual_)
        die(9);
      const { scope_: scope } = state;
      usePatchesInScope(scope, patchListener);
      return processResult(void 0, scope);
    }
    /**
     * Pass true to automatically freeze all copies created by Immer.
     *
     * By default, auto-freezing is enabled.
     */
    setAutoFreeze(value) {
      this.autoFreeze_ = value;
    }
    /**
     * Pass true to enable strict shallow copy.
     *
     * By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
     */
    setUseStrictShallowCopy(value) {
      this.useStrictShallowCopy_ = value;
    }
    /**
     * Pass false to use faster iteration that skips non-enumerable properties
     * but still handles symbols for compatibility.
     *
     * By default, strict iteration is enabled (includes all own properties).
     */
    setUseStrictIteration(value) {
      this.useStrictIteration_ = value;
    }
    shouldUseStrictIteration() {
      return this.useStrictIteration_;
    }
    applyPatches(base, patches) {
      let i;
      for (i = patches.length - 1; i >= 0; i--) {
        const patch = patches[i];
        if (patch.path.length === 0 && patch.op === "replace") {
          base = patch.value;
          break;
        }
      }
      if (i > -1) {
        patches = patches.slice(i + 1);
      }
      const applyPatchesImpl = getPlugin(PluginPatches).applyPatches_;
      if (isDraft(base)) {
        return applyPatchesImpl(base, patches);
      }
      return this.produce(
        base,
        (draft) => applyPatchesImpl(draft, patches)
      );
    }
  };
  function createProxy(rootScope, value, parent, key) {
    const [draft, state] = isMap(value) ? getPlugin(PluginMapSet).proxyMap_(value, parent) : isSet(value) ? getPlugin(PluginMapSet).proxySet_(value, parent) : createProxyProxy(value, parent);
    const scope = parent?.scope_ ?? getCurrentScope();
    scope.drafts_.push(draft);
    state.callbacks_ = parent?.callbacks_ ?? [];
    state.key_ = key;
    if (parent && key !== void 0) {
      registerChildFinalizationCallback(parent, state, key);
    } else {
      state.callbacks_.push(function rootDraftCleanup(rootScope2) {
        rootScope2.mapSetPlugin_?.fixSetContents(state);
        const { patchPlugin_ } = rootScope2;
        if (state.modified_ && patchPlugin_) {
          patchPlugin_.generatePatches_(state, [], rootScope2);
        }
      });
    }
    return draft;
  }
  function current(value) {
    if (!isDraft(value))
      die(10, value);
    return currentImpl(value);
  }
  function currentImpl(value) {
    if (!isDraftable(value) || isFrozen(value))
      return value;
    const state = value[DRAFT_STATE];
    let copy3;
    let strict = true;
    if (state) {
      if (!state.modified_)
        return state.base_;
      state.finalized_ = true;
      copy3 = shallowCopy(value, state.scope_.immer_.useStrictShallowCopy_);
      strict = state.scope_.immer_.shouldUseStrictIteration();
    } else {
      copy3 = shallowCopy(value, true);
    }
    each(
      copy3,
      (key, childValue) => {
        set(copy3, key, currentImpl(childValue));
      },
      strict
    );
    if (state) {
      state.finalized_ = false;
    }
    return copy3;
  }
  var immer = new Immer2();
  var produce = immer.produce;
  var castDraft = (value) => value;

  // node_modules/redux-thunk/dist/redux-thunk.mjs
  init_define_import_meta_env();
  function createThunkMiddleware(extraArgument) {
    const middleware = ({ dispatch, getState }) => (next) => (action) => {
      if (typeof action === "function") {
        return action(dispatch, getState, extraArgument);
      }
      return next(action);
    };
    return middleware;
  }
  var thunk = createThunkMiddleware();
  var withExtraArgument = createThunkMiddleware;

  // node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs
  var composeWithDevTools = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : function() {
    if (arguments.length === 0) return void 0;
    if (typeof arguments[0] === "object") return compose;
    return compose.apply(null, arguments);
  };
  var devToolsEnhancer = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__ : function() {
    return function(noop32) {
      return noop32;
    };
  };
  var hasMatchFunction = (v) => {
    return v && typeof v.match === "function";
  };
  function createAction(type, prepareAction) {
    function actionCreator(...args) {
      if (prepareAction) {
        let prepared = prepareAction(...args);
        if (!prepared) {
          throw new Error(false ? formatProdErrorMessage(0) : "prepareAction did not return an object");
        }
        return {
          type,
          payload: prepared.payload,
          ..."meta" in prepared && {
            meta: prepared.meta
          },
          ..."error" in prepared && {
            error: prepared.error
          }
        };
      }
      return {
        type,
        payload: args[0]
      };
    }
    actionCreator.toString = () => `${type}`;
    actionCreator.type = type;
    actionCreator.match = (action) => isAction(action) && action.type === type;
    return actionCreator;
  }
  function isActionCreator(action) {
    return typeof action === "function" && "type" in action && // hasMatchFunction only wants Matchers but I don't see the point in rewriting it
    hasMatchFunction(action);
  }
  function getMessage(type) {
    const splitType = type ? `${type}`.split("/") : [];
    const actionName = splitType[splitType.length - 1] || "actionCreator";
    return `Detected an action creator with type "${type || "unknown"}" being dispatched.
Make sure you're calling the action creator before dispatching, i.e. \`dispatch(${actionName}())\` instead of \`dispatch(${actionName})\`. This is necessary even if the action has no payload.`;
  }
  function createActionCreatorInvariantMiddleware(options = {}) {
    if (false) {
      return () => (next) => (action) => next(action);
    }
    const {
      isActionCreator: isActionCreator2 = isActionCreator
    } = options;
    return () => (next) => (action) => {
      if (isActionCreator2(action)) {
        console.warn(getMessage(action.type));
      }
      return next(action);
    };
  }
  function getTimeMeasureUtils(maxDelay, fnName) {
    let elapsed = 0;
    return {
      measureTime(fn) {
        const started = Date.now();
        try {
          return fn();
        } finally {
          const finished = Date.now();
          elapsed += finished - started;
        }
      },
      warnIfExceeded() {
        if (elapsed > maxDelay) {
          console.warn(`${fnName} took ${elapsed}ms, which is more than the warning threshold of ${maxDelay}ms. 
If your state or actions are very large, you may want to disable the middleware as it might cause too much of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
It is disabled in production builds, so you don't need to worry about that.`);
        }
      }
    };
  }
  var Tuple = class _Tuple extends Array {
    constructor(...items) {
      super(...items);
      Object.setPrototypeOf(this, _Tuple.prototype);
    }
    static get [Symbol.species]() {
      return _Tuple;
    }
    concat(...arr) {
      return super.concat.apply(this, arr);
    }
    prepend(...arr) {
      if (arr.length === 1 && Array.isArray(arr[0])) {
        return new _Tuple(...arr[0].concat(this));
      }
      return new _Tuple(...arr.concat(this));
    }
  };
  function freezeDraftable(val) {
    return isDraftable(val) ? produce(val, () => {
    }) : val;
  }
  function getOrInsertComputed(map2, key, compute) {
    if (map2.has(key)) return map2.get(key);
    return map2.set(key, compute(key)).get(key);
  }
  function isImmutableDefault(value) {
    return typeof value !== "object" || value == null || Object.isFrozen(value);
  }
  function trackForMutations(isImmutable, ignoredPaths, obj) {
    const trackedProperties = trackProperties(isImmutable, ignoredPaths, obj);
    return {
      detectMutations() {
        return detectMutations(isImmutable, ignoredPaths, trackedProperties, obj);
      }
    };
  }
  function trackProperties(isImmutable, ignoredPaths = [], obj, path = "", checkedObjects = /* @__PURE__ */ new Set()) {
    const tracked = {
      value: obj
    };
    if (!isImmutable(obj) && !checkedObjects.has(obj)) {
      checkedObjects.add(obj);
      tracked.children = {};
      const hasIgnoredPaths = ignoredPaths.length > 0;
      for (const key in obj) {
        const nestedPath = path ? path + "." + key : key;
        if (hasIgnoredPaths) {
          const hasMatches = ignoredPaths.some((ignored) => {
            if (ignored instanceof RegExp) {
              return ignored.test(nestedPath);
            }
            return nestedPath === ignored;
          });
          if (hasMatches) {
            continue;
          }
        }
        tracked.children[key] = trackProperties(isImmutable, ignoredPaths, obj[key], nestedPath);
      }
    }
    return tracked;
  }
  function detectMutations(isImmutable, ignoredPaths = [], trackedProperty, obj, sameParentRef = false, path = "") {
    const prevObj = trackedProperty ? trackedProperty.value : void 0;
    const sameRef = prevObj === obj;
    if (sameParentRef && !sameRef && !Number.isNaN(obj)) {
      return {
        wasMutated: true,
        path
      };
    }
    if (isImmutable(prevObj) || isImmutable(obj)) {
      return {
        wasMutated: false
      };
    }
    const keysToDetect = {};
    for (let key in trackedProperty.children) {
      keysToDetect[key] = true;
    }
    for (let key in obj) {
      keysToDetect[key] = true;
    }
    const hasIgnoredPaths = ignoredPaths.length > 0;
    for (let key in keysToDetect) {
      const nestedPath = path ? path + "." + key : key;
      if (hasIgnoredPaths) {
        const hasMatches = ignoredPaths.some((ignored) => {
          if (ignored instanceof RegExp) {
            return ignored.test(nestedPath);
          }
          return nestedPath === ignored;
        });
        if (hasMatches) {
          continue;
        }
      }
      const result = detectMutations(isImmutable, ignoredPaths, trackedProperty.children[key], obj[key], sameRef, nestedPath);
      if (result.wasMutated) {
        return result;
      }
    }
    return {
      wasMutated: false
    };
  }
  function createImmutableStateInvariantMiddleware(options = {}) {
    if (false) {
      return () => (next) => (action) => next(action);
    } else {
      let stringify2 = function(obj, serializer, indent, decycler) {
        return JSON.stringify(obj, getSerialize2(serializer, decycler), indent);
      }, getSerialize2 = function(serializer, decycler) {
        let stack = [], keys = [];
        if (!decycler) decycler = function(_, value) {
          if (stack[0] === value) return "[Circular ~]";
          return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
        };
        return function(key, value) {
          if (stack.length > 0) {
            var thisPos = stack.indexOf(this);
            ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
            ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
            if (~stack.indexOf(value)) value = decycler.call(this, key, value);
          } else stack.push(value);
          return serializer == null ? value : serializer.call(this, key, value);
        };
      };
      var stringify = stringify2, getSerialize = getSerialize2;
      let {
        isImmutable = isImmutableDefault,
        ignoredPaths,
        warnAfter = 32
      } = options;
      const track = trackForMutations.bind(null, isImmutable, ignoredPaths);
      return ({
        getState
      }) => {
        let state = getState();
        let tracker = track(state);
        let result;
        return (next) => (action) => {
          const measureUtils = getTimeMeasureUtils(warnAfter, "ImmutableStateInvariantMiddleware");
          measureUtils.measureTime(() => {
            state = getState();
            result = tracker.detectMutations();
            tracker = track(state);
            if (result.wasMutated) {
              throw new Error(false ? formatProdErrorMessage(19) : `A state mutation was detected between dispatches, in the path '${result.path || ""}'.  This may cause incorrect behavior. (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)`);
            }
          });
          const dispatchedAction = next(action);
          measureUtils.measureTime(() => {
            state = getState();
            result = tracker.detectMutations();
            tracker = track(state);
            if (result.wasMutated) {
              throw new Error(false ? formatProdErrorMessage(20) : `A state mutation was detected inside a dispatch, in the path: ${result.path || ""}. Take a look at the reducer(s) handling the action ${stringify2(action)}. (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)`);
            }
          });
          measureUtils.warnIfExceeded();
          return dispatchedAction;
        };
      };
    }
  }
  function isPlain(val) {
    const type = typeof val;
    return val == null || type === "string" || type === "boolean" || type === "number" || Array.isArray(val) || isPlainObject(val);
  }
  function findNonSerializableValue(value, path = "", isSerializable = isPlain, getEntries, ignoredPaths = [], cache) {
    let foundNestedSerializable;
    if (!isSerializable(value)) {
      return {
        keyPath: path || "<root>",
        value
      };
    }
    if (typeof value !== "object" || value === null) {
      return false;
    }
    if (cache?.has(value)) return false;
    const entries = getEntries != null ? getEntries(value) : Object.entries(value);
    const hasIgnoredPaths = ignoredPaths.length > 0;
    for (const [key, nestedValue] of entries) {
      const nestedPath = path ? path + "." + key : key;
      if (hasIgnoredPaths) {
        const hasMatches = ignoredPaths.some((ignored) => {
          if (ignored instanceof RegExp) {
            return ignored.test(nestedPath);
          }
          return nestedPath === ignored;
        });
        if (hasMatches) {
          continue;
        }
      }
      if (!isSerializable(nestedValue)) {
        return {
          keyPath: nestedPath,
          value: nestedValue
        };
      }
      if (typeof nestedValue === "object") {
        foundNestedSerializable = findNonSerializableValue(nestedValue, nestedPath, isSerializable, getEntries, ignoredPaths, cache);
        if (foundNestedSerializable) {
          return foundNestedSerializable;
        }
      }
    }
    if (cache && isNestedFrozen(value)) cache.add(value);
    return false;
  }
  function isNestedFrozen(value) {
    if (!Object.isFrozen(value)) return false;
    for (const nestedValue of Object.values(value)) {
      if (typeof nestedValue !== "object" || nestedValue === null) continue;
      if (!isNestedFrozen(nestedValue)) return false;
    }
    return true;
  }
  function createSerializableStateInvariantMiddleware(options = {}) {
    if (false) {
      return () => (next) => (action) => next(action);
    } else {
      const {
        isSerializable = isPlain,
        getEntries,
        ignoredActions = [],
        ignoredActionPaths = ["meta.arg", "meta.baseQueryMeta"],
        ignoredPaths = [],
        warnAfter = 32,
        ignoreState = false,
        ignoreActions = false,
        disableCache = false
      } = options;
      const cache = !disableCache && WeakSet ? /* @__PURE__ */ new WeakSet() : void 0;
      return (storeAPI) => (next) => (action) => {
        if (!isAction(action)) {
          return next(action);
        }
        const result = next(action);
        const measureUtils = getTimeMeasureUtils(warnAfter, "SerializableStateInvariantMiddleware");
        if (!ignoreActions && !(ignoredActions.length && ignoredActions.indexOf(action.type) !== -1)) {
          measureUtils.measureTime(() => {
            const foundActionNonSerializableValue = findNonSerializableValue(action, "", isSerializable, getEntries, ignoredActionPaths, cache);
            if (foundActionNonSerializableValue) {
              const {
                keyPath,
                value
              } = foundActionNonSerializableValue;
              console.error(`A non-serializable value was detected in an action, in the path: \`${keyPath}\`. Value:`, value, "\nTake a look at the logic that dispatched this action: ", action, "\n(See https://redux.js.org/faq/actions#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants)", "\n(To allow non-serializable values see: https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data)");
            }
          });
        }
        if (!ignoreState) {
          measureUtils.measureTime(() => {
            const state = storeAPI.getState();
            const foundStateNonSerializableValue = findNonSerializableValue(state, "", isSerializable, getEntries, ignoredPaths, cache);
            if (foundStateNonSerializableValue) {
              const {
                keyPath,
                value
              } = foundStateNonSerializableValue;
              console.error(`A non-serializable value was detected in the state, in the path: \`${keyPath}\`. Value:`, value, `
Take a look at the reducer(s) handling this action type: ${action.type}.
(See https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)`);
            }
          });
          measureUtils.warnIfExceeded();
        }
        return result;
      };
    }
  }
  function isBoolean2(x) {
    return typeof x === "boolean";
  }
  var buildGetDefaultMiddleware = () => function getDefaultMiddleware(options) {
    const {
      thunk: thunk2 = true,
      immutableCheck = true,
      serializableCheck = true,
      actionCreatorCheck = true
    } = options ?? {};
    let middlewareArray = new Tuple();
    if (thunk2) {
      if (isBoolean2(thunk2)) {
        middlewareArray.push(thunk);
      } else {
        middlewareArray.push(withExtraArgument(thunk2.extraArgument));
      }
    }
    if (true) {
      if (immutableCheck) {
        let immutableOptions = {};
        if (!isBoolean2(immutableCheck)) {
          immutableOptions = immutableCheck;
        }
        middlewareArray.unshift(createImmutableStateInvariantMiddleware(immutableOptions));
      }
      if (serializableCheck) {
        let serializableOptions = {};
        if (!isBoolean2(serializableCheck)) {
          serializableOptions = serializableCheck;
        }
        middlewareArray.push(createSerializableStateInvariantMiddleware(serializableOptions));
      }
      if (actionCreatorCheck) {
        let actionCreatorOptions = {};
        if (!isBoolean2(actionCreatorCheck)) {
          actionCreatorOptions = actionCreatorCheck;
        }
        middlewareArray.unshift(createActionCreatorInvariantMiddleware(actionCreatorOptions));
      }
    }
    return middlewareArray;
  };
  var SHOULD_AUTOBATCH = "RTK_autoBatch";
  var prepareAutoBatched = () => (payload) => ({
    payload,
    meta: {
      [SHOULD_AUTOBATCH]: true
    }
  });
  var createQueueWithTimer = (timeout) => {
    return (notify) => {
      setTimeout(notify, timeout);
    };
  };
  var createRafWithFallbackTimer = (raf, timeout) => {
    return (notify) => {
      let called = false;
      const callback = () => {
        if (called) return;
        called = true;
        cancelAnimationFrame(rafId4);
        clearTimeout(timerId);
        notify();
      };
      const rafId4 = raf(callback);
      const timerId = setTimeout(callback, timeout);
    };
  };
  var autoBatchEnhancer = (options = {
    type: "raf"
  }) => (next) => (...args) => {
    const store = next(...args);
    let notifying = true;
    let shouldNotifyAtEndOfTick = false;
    let notificationQueued = false;
    const listeners = /* @__PURE__ */ new Set();
    const queueCallback = options.type === "tick" ? queueMicrotask : options.type === "raf" ? (
      // requestAnimationFrame won't exist in SSR environments. Fall back to a vague approximation just to keep from erroring.
      typeof window !== "undefined" && window.requestAnimationFrame ? createRafWithFallbackTimer(window.requestAnimationFrame, 100) : createQueueWithTimer(10)
    ) : options.type === "callback" ? options.queueNotification : createQueueWithTimer(options.timeout);
    const notifyListeners = () => {
      notificationQueued = false;
      if (shouldNotifyAtEndOfTick) {
        shouldNotifyAtEndOfTick = false;
        listeners.forEach((l) => l());
      }
    };
    return Object.assign({}, store, {
      // Override the base `store.subscribe` method to keep original listeners
      // from running if we're delaying notifications
      subscribe(listener2) {
        const wrappedListener = () => notifying && listener2();
        const unsubscribe = store.subscribe(wrappedListener);
        listeners.add(listener2);
        return () => {
          unsubscribe();
          listeners.delete(listener2);
        };
      },
      // Override the base `store.dispatch` method so that we can check actions
      // for the `shouldAutoBatch` flag and determine if batching is active
      dispatch(action) {
        try {
          notifying = !action?.meta?.[SHOULD_AUTOBATCH];
          shouldNotifyAtEndOfTick = !notifying;
          if (shouldNotifyAtEndOfTick) {
            if (!notificationQueued) {
              notificationQueued = true;
              queueCallback(notifyListeners);
            }
          }
          return store.dispatch(action);
        } finally {
          notifying = true;
        }
      }
    });
  };
  var buildGetDefaultEnhancers = (middlewareEnhancer) => function getDefaultEnhancers(options) {
    const {
      autoBatch = true
    } = options ?? {};
    let enhancerArray = new Tuple(middlewareEnhancer);
    if (autoBatch) {
      enhancerArray.push(autoBatchEnhancer(typeof autoBatch === "object" ? autoBatch : void 0));
    }
    return enhancerArray;
  };
  function configureStore(options) {
    const getDefaultMiddleware = buildGetDefaultMiddleware();
    const {
      reducer = void 0,
      middleware,
      devTools = true,
      duplicateMiddlewareCheck = true,
      preloadedState = void 0,
      enhancers = void 0
    } = options || {};
    let rootReducer2;
    if (typeof reducer === "function") {
      rootReducer2 = reducer;
    } else if (isPlainObject(reducer)) {
      rootReducer2 = combineReducers(reducer);
    } else {
      throw new Error(false ? formatProdErrorMessage(1) : "`reducer` is a required argument, and must be a function or an object of functions that can be passed to combineReducers");
    }
    if (middleware && typeof middleware !== "function") {
      throw new Error(false ? formatProdErrorMessage(2) : "`middleware` field must be a callback");
    }
    let finalMiddleware;
    if (typeof middleware === "function") {
      finalMiddleware = middleware(getDefaultMiddleware);
      if (!Array.isArray(finalMiddleware)) {
        throw new Error(false ? formatProdErrorMessage(3) : "when using a middleware builder function, an array of middleware must be returned");
      }
    } else {
      finalMiddleware = getDefaultMiddleware();
    }
    if (finalMiddleware.some((item) => typeof item !== "function")) {
      throw new Error(false ? formatProdErrorMessage(4) : "each middleware provided to configureStore must be a function");
    }
    if (duplicateMiddlewareCheck) {
      let middlewareReferences = /* @__PURE__ */ new Set();
      finalMiddleware.forEach((middleware2) => {
        if (middlewareReferences.has(middleware2)) {
          throw new Error(false ? formatProdErrorMessage(42) : "Duplicate middleware references found when creating the store. Ensure that each middleware is only included once.");
        }
        middlewareReferences.add(middleware2);
      });
    }
    let finalCompose = compose;
    if (devTools) {
      finalCompose = composeWithDevTools({
        // Enable capture of stack traces for dispatched Redux actions
        trace: true,
        ...typeof devTools === "object" && devTools
      });
    }
    const middlewareEnhancer = applyMiddleware(...finalMiddleware);
    const getDefaultEnhancers = buildGetDefaultEnhancers(middlewareEnhancer);
    if (enhancers && typeof enhancers !== "function") {
      throw new Error(false ? formatProdErrorMessage(5) : "`enhancers` field must be a callback");
    }
    let storeEnhancers = typeof enhancers === "function" ? enhancers(getDefaultEnhancers) : getDefaultEnhancers();
    if (!Array.isArray(storeEnhancers)) {
      throw new Error(false ? formatProdErrorMessage(6) : "`enhancers` callback must return an array");
    }
    if (storeEnhancers.some((item) => typeof item !== "function")) {
      throw new Error(false ? formatProdErrorMessage(7) : "each enhancer provided to configureStore must be a function");
    }
    if (finalMiddleware.length && !storeEnhancers.includes(middlewareEnhancer)) {
      console.error("middlewares were provided, but middleware enhancer was not included in final enhancers - make sure to call `getDefaultEnhancers`");
    }
    const composedEnhancer = finalCompose(...storeEnhancers);
    return createStore(rootReducer2, preloadedState, composedEnhancer);
  }
  function executeReducerBuilderCallback(builderCallback) {
    const actionsMap = {};
    const actionMatchers = [];
    let defaultCaseReducer;
    const builder = {
      addCase(typeOrActionCreator, reducer) {
        if (true) {
          if (actionMatchers.length > 0) {
            throw new Error(false ? formatProdErrorMessage(26) : "`builder.addCase` should only be called before calling `builder.addMatcher`");
          }
          if (defaultCaseReducer) {
            throw new Error(false ? formatProdErrorMessage(27) : "`builder.addCase` should only be called before calling `builder.addDefaultCase`");
          }
        }
        const type = typeof typeOrActionCreator === "string" ? typeOrActionCreator : typeOrActionCreator.type;
        if (!type) {
          throw new Error(false ? formatProdErrorMessage(28) : "`builder.addCase` cannot be called with an empty action type");
        }
        if (type in actionsMap) {
          throw new Error(false ? formatProdErrorMessage(29) : `\`builder.addCase\` cannot be called with two reducers for the same action type '${type}'`);
        }
        actionsMap[type] = reducer;
        return builder;
      },
      addAsyncThunk(asyncThunk, reducers2) {
        if (true) {
          if (defaultCaseReducer) {
            throw new Error(false ? formatProdErrorMessage(43) : "`builder.addAsyncThunk` should only be called before calling `builder.addDefaultCase`");
          }
        }
        if (reducers2.pending) actionsMap[asyncThunk.pending.type] = reducers2.pending;
        if (reducers2.rejected) actionsMap[asyncThunk.rejected.type] = reducers2.rejected;
        if (reducers2.fulfilled) actionsMap[asyncThunk.fulfilled.type] = reducers2.fulfilled;
        if (reducers2.settled) actionMatchers.push({
          matcher: asyncThunk.settled,
          reducer: reducers2.settled
        });
        return builder;
      },
      addMatcher(matcher, reducer) {
        if (true) {
          if (defaultCaseReducer) {
            throw new Error(false ? formatProdErrorMessage(30) : "`builder.addMatcher` should only be called before calling `builder.addDefaultCase`");
          }
        }
        actionMatchers.push({
          matcher,
          reducer
        });
        return builder;
      },
      addDefaultCase(reducer) {
        if (true) {
          if (defaultCaseReducer) {
            throw new Error(false ? formatProdErrorMessage(31) : "`builder.addDefaultCase` can only be called once");
          }
        }
        defaultCaseReducer = reducer;
        return builder;
      }
    };
    builderCallback(builder);
    return [actionsMap, actionMatchers, defaultCaseReducer];
  }
  function isStateFunction(x) {
    return typeof x === "function";
  }
  function createReducer(initialState15, mapOrBuilderCallback) {
    if (true) {
      if (typeof mapOrBuilderCallback === "object") {
        throw new Error(false ? formatProdErrorMessage(8) : "The object notation for `createReducer` has been removed. Please use the 'builder callback' notation instead: https://redux-toolkit.js.org/api/createReducer");
      }
    }
    let [actionsMap, finalActionMatchers, finalDefaultCaseReducer] = executeReducerBuilderCallback(mapOrBuilderCallback);
    let getInitialState;
    if (isStateFunction(initialState15)) {
      getInitialState = () => freezeDraftable(initialState15());
    } else {
      const frozenInitialState = freezeDraftable(initialState15);
      getInitialState = () => frozenInitialState;
    }
    function reducer(state = getInitialState(), action) {
      let caseReducers = [actionsMap[action.type], ...finalActionMatchers.filter(({
        matcher
      }) => matcher(action)).map(({
        reducer: reducer2
      }) => reducer2)];
      if (caseReducers.filter((cr) => !!cr).length === 0) {
        caseReducers = [finalDefaultCaseReducer];
      }
      return caseReducers.reduce((previousState, caseReducer) => {
        if (caseReducer) {
          if (isDraft(previousState)) {
            const draft = previousState;
            const result = caseReducer(draft, action);
            if (result === void 0) {
              return previousState;
            }
            return result;
          } else if (!isDraftable(previousState)) {
            const result = caseReducer(previousState, action);
            if (result === void 0) {
              if (previousState === null) {
                return previousState;
              }
              throw Error("A case reducer on a non-draftable value must not return undefined");
            }
            return result;
          } else {
            return produce(previousState, (draft) => {
              return caseReducer(draft, action);
            });
          }
        }
        return previousState;
      }, state);
    }
    reducer.getInitialState = getInitialState;
    return reducer;
  }
  var matches = (matcher, action) => {
    if (hasMatchFunction(matcher)) {
      return matcher.match(action);
    } else {
      return matcher(action);
    }
  };
  function isAnyOf(...matchers) {
    return (action) => {
      return matchers.some((matcher) => matches(matcher, action));
    };
  }
  var urlAlphabet = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW";
  var nanoid = (size = 21) => {
    let id = "";
    let i = size;
    while (i--) {
      id += urlAlphabet[Math.random() * 64 | 0];
    }
    return id;
  };
  var commonProperties = ["name", "message", "stack", "code"];
  var RejectWithValue = class {
    constructor(payload, meta) {
      this.payload = payload;
      this.meta = meta;
    }
    payload;
    meta;
    /*
    type-only property to distinguish between RejectWithValue and FulfillWithMeta
    does not exist at runtime
    */
    _type;
  };
  var FulfillWithMeta = class {
    constructor(payload, meta) {
      this.payload = payload;
      this.meta = meta;
    }
    payload;
    meta;
    /*
    type-only property to distinguish between RejectWithValue and FulfillWithMeta
    does not exist at runtime
    */
    _type;
  };
  var miniSerializeError = (value) => {
    if (typeof value === "object" && value !== null) {
      const simpleError = {};
      for (const property of commonProperties) {
        if (typeof value[property] === "string") {
          simpleError[property] = value[property];
        }
      }
      return simpleError;
    }
    return {
      message: String(value)
    };
  };
  var externalAbortMessage = "External signal was aborted";
  var createAsyncThunk = /* @__PURE__ */ (() => {
    function createAsyncThunk2(typePrefix, payloadCreator, options) {
      const fulfilled = createAction(typePrefix + "/fulfilled", (payload, requestId, arg, meta) => ({
        payload,
        meta: {
          ...meta || {},
          arg,
          requestId,
          requestStatus: "fulfilled"
        }
      }));
      const pending = createAction(typePrefix + "/pending", (requestId, arg, meta) => ({
        payload: void 0,
        meta: {
          ...meta || {},
          arg,
          requestId,
          requestStatus: "pending"
        }
      }));
      const rejected = createAction(typePrefix + "/rejected", (error, requestId, arg, payload, meta) => ({
        payload,
        error: (options && options.serializeError || miniSerializeError)(error || "Rejected"),
        meta: {
          ...meta || {},
          arg,
          requestId,
          rejectedWithValue: !!payload,
          requestStatus: "rejected",
          aborted: error?.name === "AbortError",
          condition: error?.name === "ConditionError"
        }
      }));
      function actionCreator(arg, {
        signal
      } = {}) {
        return (dispatch, getState, extra) => {
          const requestId = options?.idGenerator ? options.idGenerator(arg) : nanoid();
          const abortController = new AbortController();
          let abortHandler;
          let abortReason;
          function abort(reason) {
            abortReason = reason;
            abortController.abort();
          }
          if (signal) {
            if (signal.aborted) {
              abort(externalAbortMessage);
            } else {
              signal.addEventListener("abort", () => abort(externalAbortMessage), {
                once: true
              });
            }
          }
          const promise = (async function() {
            let finalAction;
            try {
              let conditionResult = options?.condition?.(arg, {
                getState,
                extra
              });
              if (isThenable(conditionResult)) {
                conditionResult = await conditionResult;
              }
              if (conditionResult === false || abortController.signal.aborted) {
                throw {
                  name: "ConditionError",
                  message: "Aborted due to condition callback returning false."
                };
              }
              const abortedPromise = new Promise((_, reject) => {
                abortHandler = () => {
                  reject({
                    name: "AbortError",
                    message: abortReason || "Aborted"
                  });
                };
                abortController.signal.addEventListener("abort", abortHandler, {
                  once: true
                });
              });
              dispatch(pending(requestId, arg, options?.getPendingMeta?.({
                requestId,
                arg
              }, {
                getState,
                extra
              })));
              finalAction = await Promise.race([abortedPromise, Promise.resolve(payloadCreator(arg, {
                dispatch,
                getState,
                extra,
                requestId,
                signal: abortController.signal,
                abort,
                rejectWithValue: ((value, meta) => {
                  return new RejectWithValue(value, meta);
                }),
                fulfillWithValue: ((value, meta) => {
                  return new FulfillWithMeta(value, meta);
                })
              })).then((result) => {
                if (result instanceof RejectWithValue) {
                  throw result;
                }
                if (result instanceof FulfillWithMeta) {
                  return fulfilled(result.payload, requestId, arg, result.meta);
                }
                return fulfilled(result, requestId, arg);
              })]);
            } catch (err) {
              finalAction = err instanceof RejectWithValue ? rejected(null, requestId, arg, err.payload, err.meta) : rejected(err, requestId, arg);
            } finally {
              if (abortHandler) {
                abortController.signal.removeEventListener("abort", abortHandler);
              }
            }
            const skipDispatch = options && !options.dispatchConditionRejection && rejected.match(finalAction) && finalAction.meta.condition;
            if (!skipDispatch) {
              dispatch(finalAction);
            }
            return finalAction;
          })();
          return Object.assign(promise, {
            abort,
            requestId,
            arg,
            unwrap() {
              return promise.then(unwrapResult);
            }
          });
        };
      }
      return Object.assign(actionCreator, {
        pending,
        rejected,
        fulfilled,
        settled: isAnyOf(rejected, fulfilled),
        typePrefix
      });
    }
    createAsyncThunk2.withTypes = () => createAsyncThunk2;
    return createAsyncThunk2;
  })();
  function unwrapResult(action) {
    if (action.meta && action.meta.rejectedWithValue) {
      throw action.payload;
    }
    if (action.error) {
      throw action.error;
    }
    return action.payload;
  }
  function isThenable(value) {
    return value !== null && typeof value === "object" && typeof value.then === "function";
  }
  var asyncThunkSymbol = /* @__PURE__ */ Symbol.for("rtk-slice-createasyncthunk");
  var asyncThunkCreator = {
    [asyncThunkSymbol]: createAsyncThunk
  };
  function getType(slice2, actionKey) {
    return `${slice2}/${actionKey}`;
  }
  function buildCreateSlice({
    creators
  } = {}) {
    const cAT = creators?.asyncThunk?.[asyncThunkSymbol];
    return function createSlice2(options) {
      const {
        name,
        reducerPath = name
      } = options;
      if (!name) {
        throw new Error(false ? formatProdErrorMessage(11) : "`name` is a required option for createSlice");
      }
      if (typeof process !== "undefined" && true) {
        if (options.initialState === void 0) {
          console.error("You must provide an `initialState` value that is not `undefined`. You may have misspelled `initialState`");
        }
      }
      const reducers2 = (typeof options.reducers === "function" ? options.reducers(buildReducerCreators()) : options.reducers) || {};
      const reducerNames = Object.keys(reducers2);
      const context = {
        sliceCaseReducersByName: {},
        sliceCaseReducersByType: {},
        actionCreators: {},
        sliceMatchers: []
      };
      const contextMethods = {
        addCase(typeOrActionCreator, reducer2) {
          const type = typeof typeOrActionCreator === "string" ? typeOrActionCreator : typeOrActionCreator.type;
          if (!type) {
            throw new Error(false ? formatProdErrorMessage(12) : "`context.addCase` cannot be called with an empty action type");
          }
          if (type in context.sliceCaseReducersByType) {
            throw new Error(false ? formatProdErrorMessage(13) : "`context.addCase` cannot be called with two reducers for the same action type: " + type);
          }
          context.sliceCaseReducersByType[type] = reducer2;
          return contextMethods;
        },
        addMatcher(matcher, reducer2) {
          context.sliceMatchers.push({
            matcher,
            reducer: reducer2
          });
          return contextMethods;
        },
        exposeAction(name2, actionCreator) {
          context.actionCreators[name2] = actionCreator;
          return contextMethods;
        },
        exposeCaseReducer(name2, reducer2) {
          context.sliceCaseReducersByName[name2] = reducer2;
          return contextMethods;
        }
      };
      reducerNames.forEach((reducerName) => {
        const reducerDefinition = reducers2[reducerName];
        const reducerDetails = {
          reducerName,
          type: getType(name, reducerName),
          createNotation: typeof options.reducers === "function"
        };
        if (isAsyncThunkSliceReducerDefinition(reducerDefinition)) {
          handleThunkCaseReducerDefinition(reducerDetails, reducerDefinition, contextMethods, cAT);
        } else {
          handleNormalReducerDefinition(reducerDetails, reducerDefinition, contextMethods);
        }
      });
      function buildReducer() {
        if (true) {
          if (typeof options.extraReducers === "object") {
            throw new Error(false ? formatProdErrorMessage(14) : "The object notation for `createSlice.extraReducers` has been removed. Please use the 'builder callback' notation instead: https://redux-toolkit.js.org/api/createSlice");
          }
        }
        const [extraReducers = {}, actionMatchers = [], defaultCaseReducer = void 0] = typeof options.extraReducers === "function" ? executeReducerBuilderCallback(options.extraReducers) : [options.extraReducers];
        const finalCaseReducers = {
          ...extraReducers,
          ...context.sliceCaseReducersByType
        };
        return createReducer(options.initialState, (builder) => {
          for (let key in finalCaseReducers) {
            builder.addCase(key, finalCaseReducers[key]);
          }
          for (let sM of context.sliceMatchers) {
            builder.addMatcher(sM.matcher, sM.reducer);
          }
          for (let m of actionMatchers) {
            builder.addMatcher(m.matcher, m.reducer);
          }
          if (defaultCaseReducer) {
            builder.addDefaultCase(defaultCaseReducer);
          }
        });
      }
      const selectSelf = (state) => state;
      const injectedSelectorCache = /* @__PURE__ */ new Map();
      const injectedStateCache = /* @__PURE__ */ new WeakMap();
      let _reducer;
      function reducer(state, action) {
        if (!_reducer) _reducer = buildReducer();
        return _reducer(state, action);
      }
      function getInitialState() {
        if (!_reducer) _reducer = buildReducer();
        return _reducer.getInitialState();
      }
      function makeSelectorProps(reducerPath2, injected = false) {
        function selectSlice(state) {
          let sliceState = state[reducerPath2];
          if (typeof sliceState === "undefined") {
            if (injected) {
              sliceState = getOrInsertComputed(injectedStateCache, selectSlice, getInitialState);
            } else if (true) {
              throw new Error(false ? formatProdErrorMessage(15) : "selectSlice returned undefined for an uninjected slice reducer");
            }
          }
          return sliceState;
        }
        function getSelectors(selectState = selectSelf) {
          const selectorCache = getOrInsertComputed(injectedSelectorCache, injected, () => /* @__PURE__ */ new WeakMap());
          return getOrInsertComputed(selectorCache, selectState, () => {
            const map2 = {};
            for (const [name2, selector] of Object.entries(options.selectors ?? {})) {
              map2[name2] = wrapSelector(selector, selectState, () => getOrInsertComputed(injectedStateCache, selectState, getInitialState), injected);
            }
            return map2;
          });
        }
        return {
          reducerPath: reducerPath2,
          getSelectors,
          get selectors() {
            return getSelectors(selectSlice);
          },
          selectSlice
        };
      }
      const slice2 = {
        name,
        reducer,
        actions: context.actionCreators,
        caseReducers: context.sliceCaseReducersByName,
        getInitialState,
        ...makeSelectorProps(reducerPath),
        injectInto(injectable, {
          reducerPath: pathOpt,
          ...config2
        } = {}) {
          const newReducerPath = pathOpt ?? reducerPath;
          injectable.inject({
            reducerPath: newReducerPath,
            reducer
          }, config2);
          return {
            ...slice2,
            ...makeSelectorProps(newReducerPath, true)
          };
        }
      };
      return slice2;
    };
  }
  function wrapSelector(selector, selectState, getInitialState, injected) {
    function wrapper(rootState, ...args) {
      let sliceState = selectState(rootState);
      if (typeof sliceState === "undefined") {
        if (injected) {
          sliceState = getInitialState();
        } else if (true) {
          throw new Error(false ? formatProdErrorMessage(16) : "selectState returned undefined for an uninjected slice reducer");
        }
      }
      return selector(sliceState, ...args);
    }
    wrapper.unwrapped = selector;
    return wrapper;
  }
  var createSlice = /* @__PURE__ */ buildCreateSlice();
  function buildReducerCreators() {
    function asyncThunk(payloadCreator, config2) {
      return {
        _reducerDefinitionType: "asyncThunk",
        payloadCreator,
        ...config2
      };
    }
    asyncThunk.withTypes = () => asyncThunk;
    return {
      reducer(caseReducer) {
        return Object.assign({
          // hack so the wrapping function has the same name as the original
          // we need to create a wrapper so the `reducerDefinitionType` is not assigned to the original
          [caseReducer.name](...args) {
            return caseReducer(...args);
          }
        }[caseReducer.name], {
          _reducerDefinitionType: "reducer"
          /* reducer */
        });
      },
      preparedReducer(prepare, reducer) {
        return {
          _reducerDefinitionType: "reducerWithPrepare",
          prepare,
          reducer
        };
      },
      asyncThunk
    };
  }
  function handleNormalReducerDefinition({
    type,
    reducerName,
    createNotation
  }, maybeReducerWithPrepare, context) {
    let caseReducer;
    let prepareCallback;
    if ("reducer" in maybeReducerWithPrepare) {
      if (createNotation && !isCaseReducerWithPrepareDefinition(maybeReducerWithPrepare)) {
        throw new Error(false ? formatProdErrorMessage(17) : "Please use the `create.preparedReducer` notation for prepared action creators with the `create` notation.");
      }
      caseReducer = maybeReducerWithPrepare.reducer;
      prepareCallback = maybeReducerWithPrepare.prepare;
    } else {
      caseReducer = maybeReducerWithPrepare;
    }
    context.addCase(type, caseReducer).exposeCaseReducer(reducerName, caseReducer).exposeAction(reducerName, prepareCallback ? createAction(type, prepareCallback) : createAction(type));
  }
  function isAsyncThunkSliceReducerDefinition(reducerDefinition) {
    return reducerDefinition._reducerDefinitionType === "asyncThunk";
  }
  function isCaseReducerWithPrepareDefinition(reducerDefinition) {
    return reducerDefinition._reducerDefinitionType === "reducerWithPrepare";
  }
  function handleThunkCaseReducerDefinition({
    type,
    reducerName
  }, reducerDefinition, context, cAT) {
    if (!cAT) {
      throw new Error(false ? formatProdErrorMessage(18) : "Cannot use `create.asyncThunk` in the built-in `createSlice`. Use `buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } })` to create a customised version of `createSlice`.");
    }
    const {
      payloadCreator,
      fulfilled,
      pending,
      rejected,
      settled,
      options
    } = reducerDefinition;
    const thunk2 = cAT(type, payloadCreator, options);
    context.exposeAction(reducerName, thunk2);
    if (fulfilled) {
      context.addCase(thunk2.fulfilled, fulfilled);
    }
    if (pending) {
      context.addCase(thunk2.pending, pending);
    }
    if (rejected) {
      context.addCase(thunk2.rejected, rejected);
    }
    if (settled) {
      context.addMatcher(thunk2.settled, settled);
    }
    context.exposeCaseReducer(reducerName, {
      fulfilled: fulfilled || noop3,
      pending: pending || noop3,
      rejected: rejected || noop3,
      settled: settled || noop3
    });
  }
  function noop3() {
  }
  var task = "task";
  var listener = "listener";
  var completed = "completed";
  var cancelled = "cancelled";
  var taskCancelled = `task-${cancelled}`;
  var taskCompleted = `task-${completed}`;
  var listenerCancelled = `${listener}-${cancelled}`;
  var listenerCompleted = `${listener}-${completed}`;
  var TaskAbortError = class {
    constructor(code) {
      this.code = code;
      this.message = `${task} ${cancelled} (reason: ${code})`;
    }
    code;
    name = "TaskAbortError";
    message;
  };
  var assertFunction = (func, expected) => {
    if (typeof func !== "function") {
      throw new TypeError(false ? formatProdErrorMessage(32) : `${expected} is not a function`);
    }
  };
  var noop22 = () => {
  };
  var catchRejection = (promise, onError = noop22) => {
    promise.catch(onError);
    return promise;
  };
  var addAbortSignalListener = (abortSignal, callback) => {
    abortSignal.addEventListener("abort", callback, {
      once: true
    });
    return () => abortSignal.removeEventListener("abort", callback);
  };
  var validateActive = (signal) => {
    if (signal.aborted) {
      throw new TaskAbortError(signal.reason);
    }
  };
  function raceWithSignal(signal, promise) {
    let cleanup = noop22;
    return new Promise((resolve, reject) => {
      const notifyRejection = () => reject(new TaskAbortError(signal.reason));
      if (signal.aborted) {
        notifyRejection();
        return;
      }
      cleanup = addAbortSignalListener(signal, notifyRejection);
      promise.finally(() => cleanup()).then(resolve, reject);
    }).finally(() => {
      cleanup = noop22;
    });
  }
  var runTask = async (task2, cleanUp) => {
    try {
      await Promise.resolve();
      const value = await task2();
      return {
        status: "ok",
        value
      };
    } catch (error) {
      return {
        status: error instanceof TaskAbortError ? "cancelled" : "rejected",
        error
      };
    } finally {
      cleanUp?.();
    }
  };
  var createPause = (signal) => {
    return (promise) => {
      return catchRejection(raceWithSignal(signal, promise).then((output) => {
        validateActive(signal);
        return output;
      }));
    };
  };
  var createDelay = (signal) => {
    const pause = createPause(signal);
    return (timeoutMs) => {
      return pause(new Promise((resolve) => setTimeout(resolve, timeoutMs)));
    };
  };
  var {
    assign
  } = Object;
  var INTERNAL_NIL_TOKEN = {};
  var alm = "listenerMiddleware";
  var createFork = (parentAbortSignal, parentBlockingPromises) => {
    const linkControllers = (controller) => addAbortSignalListener(parentAbortSignal, () => controller.abort(parentAbortSignal.reason));
    return (taskExecutor, opts) => {
      assertFunction(taskExecutor, "taskExecutor");
      const childAbortController = new AbortController();
      linkControllers(childAbortController);
      const result = runTask(async () => {
        validateActive(parentAbortSignal);
        validateActive(childAbortController.signal);
        const result2 = await taskExecutor({
          pause: createPause(childAbortController.signal),
          delay: createDelay(childAbortController.signal),
          signal: childAbortController.signal
        });
        validateActive(childAbortController.signal);
        return result2;
      }, () => childAbortController.abort(taskCompleted));
      if (opts?.autoJoin) {
        parentBlockingPromises.push(result.catch(noop22));
      }
      return {
        result: createPause(parentAbortSignal)(result),
        cancel() {
          childAbortController.abort(taskCancelled);
        }
      };
    };
  };
  var createTakePattern = (startListening, signal) => {
    const take = async (predicate, timeout) => {
      validateActive(signal);
      let unsubscribe = () => {
      };
      const tuplePromise = new Promise((resolve, reject) => {
        let stopListening = startListening({
          predicate,
          effect: (action, listenerApi) => {
            listenerApi.unsubscribe();
            resolve([action, listenerApi.getState(), listenerApi.getOriginalState()]);
          }
        });
        unsubscribe = () => {
          stopListening();
          reject();
        };
      });
      const promises = [tuplePromise];
      if (timeout != null) {
        promises.push(new Promise((resolve) => setTimeout(resolve, timeout, null)));
      }
      try {
        const output = await raceWithSignal(signal, Promise.race(promises));
        validateActive(signal);
        return output;
      } finally {
        unsubscribe();
      }
    };
    return ((predicate, timeout) => catchRejection(take(predicate, timeout)));
  };
  var getListenerEntryPropsFrom = (options) => {
    let {
      type,
      actionCreator,
      matcher,
      predicate,
      effect
    } = options;
    if (type) {
      predicate = createAction(type).match;
    } else if (actionCreator) {
      type = actionCreator.type;
      predicate = actionCreator.match;
    } else if (matcher) {
      predicate = matcher;
    } else if (predicate) {
    } else {
      throw new Error(false ? formatProdErrorMessage(21) : "Creating or removing a listener requires one of the known fields for matching an action");
    }
    assertFunction(effect, "options.listener");
    return {
      predicate,
      type,
      effect
    };
  };
  var createListenerEntry = /* @__PURE__ */ assign((options) => {
    const {
      type,
      predicate,
      effect
    } = getListenerEntryPropsFrom(options);
    const entry = {
      id: nanoid(),
      effect,
      type,
      predicate,
      pending: /* @__PURE__ */ new Set(),
      unsubscribe: () => {
        throw new Error(false ? formatProdErrorMessage(22) : "Unsubscribe not initialized");
      }
    };
    return entry;
  }, {
    withTypes: () => createListenerEntry
  });
  var findListenerEntry = (listenerMap, options) => {
    const {
      type,
      effect,
      predicate
    } = getListenerEntryPropsFrom(options);
    return Array.from(listenerMap.values()).find((entry) => {
      const matchPredicateOrType = typeof type === "string" ? entry.type === type : entry.predicate === predicate;
      return matchPredicateOrType && entry.effect === effect;
    });
  };
  var cancelActiveListeners = (entry) => {
    entry.pending.forEach((controller) => {
      controller.abort(listenerCancelled);
    });
  };
  var createClearListenerMiddleware = (listenerMap, executingListeners) => {
    return () => {
      for (const listener2 of executingListeners.keys()) {
        cancelActiveListeners(listener2);
      }
      listenerMap.clear();
    };
  };
  var safelyNotifyError = (errorHandler, errorToNotify, errorInfo) => {
    try {
      errorHandler(errorToNotify, errorInfo);
    } catch (errorHandlerError) {
      setTimeout(() => {
        throw errorHandlerError;
      }, 0);
    }
  };
  var addListener = /* @__PURE__ */ assign(/* @__PURE__ */ createAction(`${alm}/add`), {
    withTypes: () => addListener
  });
  var clearAllListeners = /* @__PURE__ */ createAction(`${alm}/removeAll`);
  var removeListener = /* @__PURE__ */ assign(/* @__PURE__ */ createAction(`${alm}/remove`), {
    withTypes: () => removeListener
  });
  var defaultErrorHandler = (...args) => {
    console.error(`${alm}/error`, ...args);
  };
  var createListenerMiddleware = (middlewareOptions = {}) => {
    const listenerMap = /* @__PURE__ */ new Map();
    const executingListeners = /* @__PURE__ */ new Map();
    const trackExecutingListener = (entry) => {
      const count = executingListeners.get(entry) ?? 0;
      executingListeners.set(entry, count + 1);
    };
    const untrackExecutingListener = (entry) => {
      const count = executingListeners.get(entry) ?? 1;
      if (count === 1) {
        executingListeners.delete(entry);
      } else {
        executingListeners.set(entry, count - 1);
      }
    };
    const {
      extra,
      onError = defaultErrorHandler
    } = middlewareOptions;
    assertFunction(onError, "onError");
    const insertEntry = (entry) => {
      entry.unsubscribe = () => listenerMap.delete(entry.id);
      listenerMap.set(entry.id, entry);
      return (cancelOptions) => {
        entry.unsubscribe();
        if (cancelOptions?.cancelActive) {
          cancelActiveListeners(entry);
        }
      };
    };
    const startListening = ((options) => {
      const entry = findListenerEntry(listenerMap, options) ?? createListenerEntry(options);
      return insertEntry(entry);
    });
    assign(startListening, {
      withTypes: () => startListening
    });
    const stopListening = (options) => {
      const entry = findListenerEntry(listenerMap, options);
      if (entry) {
        entry.unsubscribe();
        if (options.cancelActive) {
          cancelActiveListeners(entry);
        }
      }
      return !!entry;
    };
    assign(stopListening, {
      withTypes: () => stopListening
    });
    const notifyListener = async (entry, action, api, getOriginalState) => {
      const internalTaskController = new AbortController();
      const take = createTakePattern(startListening, internalTaskController.signal);
      const autoJoinPromises = [];
      try {
        entry.pending.add(internalTaskController);
        trackExecutingListener(entry);
        await Promise.resolve(entry.effect(
          action,
          // Use assign() rather than ... to avoid extra helper functions added to bundle
          assign({}, api, {
            getOriginalState,
            condition: (predicate, timeout) => take(predicate, timeout).then(Boolean),
            take,
            delay: createDelay(internalTaskController.signal),
            pause: createPause(internalTaskController.signal),
            extra,
            signal: internalTaskController.signal,
            fork: createFork(internalTaskController.signal, autoJoinPromises),
            unsubscribe: entry.unsubscribe,
            subscribe: () => {
              listenerMap.set(entry.id, entry);
            },
            cancelActiveListeners: () => {
              entry.pending.forEach((controller, _, set2) => {
                if (controller !== internalTaskController) {
                  controller.abort(listenerCancelled);
                  set2.delete(controller);
                }
              });
            },
            cancel: () => {
              internalTaskController.abort(listenerCancelled);
              entry.pending.delete(internalTaskController);
            },
            throwIfCancelled: () => {
              validateActive(internalTaskController.signal);
            }
          })
        ));
      } catch (listenerError) {
        if (!(listenerError instanceof TaskAbortError)) {
          safelyNotifyError(onError, listenerError, {
            raisedBy: "effect"
          });
        }
      } finally {
        await Promise.all(autoJoinPromises);
        internalTaskController.abort(listenerCompleted);
        untrackExecutingListener(entry);
        entry.pending.delete(internalTaskController);
      }
    };
    const clearListenerMiddleware = createClearListenerMiddleware(listenerMap, executingListeners);
    const middleware = (api) => (next) => (action) => {
      if (!isAction(action)) {
        return next(action);
      }
      if (addListener.match(action)) {
        return startListening(action.payload);
      }
      if (clearAllListeners.match(action)) {
        clearListenerMiddleware();
        return;
      }
      if (removeListener.match(action)) {
        return stopListening(action.payload);
      }
      let originalState = api.getState();
      const getOriginalState = () => {
        if (originalState === INTERNAL_NIL_TOKEN) {
          throw new Error(false ? formatProdErrorMessage(23) : `${alm}: getOriginalState can only be called synchronously`);
        }
        return originalState;
      };
      let result;
      try {
        result = next(action);
        if (listenerMap.size > 0) {
          const currentState = api.getState();
          const listenerEntries = Array.from(listenerMap.values());
          for (const entry of listenerEntries) {
            let runListener = false;
            try {
              runListener = entry.predicate(action, currentState, originalState);
            } catch (predicateError) {
              runListener = false;
              safelyNotifyError(onError, predicateError, {
                raisedBy: "predicate"
              });
            }
            if (!runListener) {
              continue;
            }
            notifyListener(entry, action, api, getOriginalState);
          }
        }
      } finally {
        originalState = INTERNAL_NIL_TOKEN;
      }
      return result;
    };
    return {
      middleware,
      startListening,
      stopListening,
      clearListeners: clearListenerMiddleware
    };
  };

  // node_modules/recharts/es6/state/layoutSlice.js
  var initialState = {
    layoutType: "horizontal",
    width: 0,
    height: 0,
    margin: {
      top: 5,
      right: 5,
      bottom: 5,
      left: 5
    },
    scale: 1
  };
  var chartLayoutSlice = createSlice({
    name: "chartLayout",
    initialState,
    reducers: {
      setLayout(state, action) {
        state.layoutType = action.payload;
      },
      setChartSize(state, action) {
        state.width = action.payload.width;
        state.height = action.payload.height;
      },
      setMargin(state, action) {
        var _action$payload$top, _action$payload$right, _action$payload$botto, _action$payload$left;
        state.margin.top = (_action$payload$top = action.payload.top) !== null && _action$payload$top !== void 0 ? _action$payload$top : 0;
        state.margin.right = (_action$payload$right = action.payload.right) !== null && _action$payload$right !== void 0 ? _action$payload$right : 0;
        state.margin.bottom = (_action$payload$botto = action.payload.bottom) !== null && _action$payload$botto !== void 0 ? _action$payload$botto : 0;
        state.margin.left = (_action$payload$left = action.payload.left) !== null && _action$payload$left !== void 0 ? _action$payload$left : 0;
      },
      setScale(state, action) {
        state.scale = action.payload;
      }
    }
  });
  var _chartLayoutSlice$act = chartLayoutSlice.actions;
  var setMargin = _chartLayoutSlice$act.setMargin;
  var setLayout = _chartLayoutSlice$act.setLayout;
  var setChartSize = _chartLayoutSlice$act.setChartSize;
  var setScale = _chartLayoutSlice$act.setScale;
  var chartLayoutReducer = chartLayoutSlice.reducer;

  // node_modules/recharts/es6/state/selectors/selectChartOffsetInternal.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/util/ChartUtils.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/util/getSliced.js
  init_define_import_meta_env();
  function getSliced(arr, startIndex, endIndex) {
    if (!Array.isArray(arr)) {
      return arr;
    }
    if (arr && startIndex + endIndex !== 0) {
      return arr.slice(startIndex, endIndex + 1);
    }
    return arr;
  }

  // node_modules/recharts/es6/util/isWellBehavedNumber.js
  init_define_import_meta_env();
  function isWellBehavedNumber(n) {
    return Number.isFinite(n);
  }
  function isPositiveNumber(n) {
    return typeof n === "number" && n > 0 && Number.isFinite(n);
  }

  // node_modules/recharts/es6/util/ChartUtils.js
  function ownKeys2(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys2(Object(t), true).forEach(function(r3) {
        _defineProperty2(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys2(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty2(e, r2, t) {
    return (r2 = _toPropertyKey2(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey2(t) {
    var i = _toPrimitive2(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive2(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function getValueByDataKey(obj, dataKey, defaultValue) {
    if (isNullish(obj) || isNullish(dataKey)) {
      return defaultValue;
    }
    if (isNumOrStr(dataKey)) {
      return get(obj, dataKey, defaultValue);
    }
    if (typeof dataKey === "function") {
      return dataKey(obj);
    }
    return defaultValue;
  }
  var appendOffsetOfLegend = (offset, legendSettings, legendSize) => {
    if (legendSettings && legendSize) {
      var boxWidth = legendSize.width, boxHeight = legendSize.height;
      var align = legendSettings.align, verticalAlign = legendSettings.verticalAlign, layout = legendSettings.layout;
      if ((layout === "vertical" || layout === "horizontal" && verticalAlign === "middle") && align !== "center" && isNumber(offset[align])) {
        return _objectSpread2(_objectSpread2({}, offset), {}, {
          [align]: offset[align] + (boxWidth || 0)
        });
      }
      if ((layout === "horizontal" || layout === "vertical" && align === "center") && verticalAlign !== "middle" && isNumber(offset[verticalAlign])) {
        return _objectSpread2(_objectSpread2({}, offset), {}, {
          [verticalAlign]: offset[verticalAlign] + (boxHeight || 0)
        });
      }
    }
    return offset;
  };
  var isCategoricalAxis = (layout, axisType) => layout === "horizontal" && axisType === "xAxis" || layout === "vertical" && axisType === "yAxis" || layout === "centric" && axisType === "angleAxis" || layout === "radial" && axisType === "radiusAxis";
  var getCoordinatesOfGrid = (ticks2, minValue, maxValue, syncWithTicks) => {
    if (syncWithTicks) {
      return ticks2.map((entry) => entry.coordinate);
    }
    var hasMin, hasMax;
    var values = ticks2.map((entry) => {
      if (entry.coordinate === minValue) {
        hasMin = true;
      }
      if (entry.coordinate === maxValue) {
        hasMax = true;
      }
      return entry.coordinate;
    });
    if (!hasMin) {
      values.push(minValue);
    }
    if (!hasMax) {
      values.push(maxValue);
    }
    return values;
  };
  var getTicksOfAxis = (axis, isGrid, isAll) => {
    if (!axis) {
      return null;
    }
    var duplicateDomain = axis.duplicateDomain, type = axis.type, range3 = axis.range, scale = axis.scale, realScaleType = axis.realScaleType, isCategorical = axis.isCategorical, categoricalDomain = axis.categoricalDomain, tickCount = axis.tickCount, ticks2 = axis.ticks, niceTicks = axis.niceTicks, axisType = axis.axisType;
    if (!scale) {
      return null;
    }
    var offsetForBand = realScaleType === "scaleBand" && scale.bandwidth ? scale.bandwidth() / 2 : 2;
    var offset = (isGrid || isAll) && type === "category" && scale.bandwidth ? scale.bandwidth() / offsetForBand : 0;
    offset = axisType === "angleAxis" && range3 && range3.length >= 2 ? mathSign(range3[0] - range3[1]) * 2 * offset : offset;
    if (isGrid && (ticks2 || niceTicks)) {
      var result = (ticks2 || niceTicks || []).map((entry, index) => {
        var scaleContent = duplicateDomain ? duplicateDomain.indexOf(entry) : entry;
        var scaled = scale.map(scaleContent);
        if (!isWellBehavedNumber(scaled)) {
          return null;
        }
        return {
          // If the scaleContent is not a number, the coordinate will be NaN.
          // That could be the case for example with a PointScale and a string as domain.
          coordinate: scaled + offset,
          value: entry,
          offset,
          index
        };
      }).filter(isNotNil);
      return result;
    }
    if (isCategorical && categoricalDomain) {
      return categoricalDomain.map((entry, index) => {
        var scaled = scale.map(entry);
        if (!isWellBehavedNumber(scaled)) {
          return null;
        }
        return {
          coordinate: scaled + offset,
          value: entry,
          index,
          offset
        };
      }).filter(isNotNil);
    }
    if (scale.ticks && !isAll && tickCount != null) {
      return scale.ticks(tickCount).map((entry, index) => {
        var scaled = scale.map(entry);
        if (!isWellBehavedNumber(scaled)) {
          return null;
        }
        return {
          coordinate: scaled + offset,
          value: entry,
          index,
          offset
        };
      }).filter(isNotNil);
    }
    return scale.domain().map((entry, index) => {
      var scaled = scale.map(entry);
      if (!isWellBehavedNumber(scaled)) {
        return null;
      }
      return {
        coordinate: scaled + offset,
        // @ts-expect-error can't use Date as an index
        value: duplicateDomain ? duplicateDomain[entry] : entry,
        index,
        offset
      };
    }).filter(isNotNil);
  };
  var truncateByDomain = (value, domain) => {
    if (!domain || domain.length !== 2 || !isNumber(domain[0]) || !isNumber(domain[1])) {
      return value;
    }
    var minValue = Math.min(domain[0], domain[1]);
    var maxValue = Math.max(domain[0], domain[1]);
    var result = [value[0], value[1]];
    if (!isNumber(value[0]) || value[0] < minValue) {
      result[0] = minValue;
    }
    if (!isNumber(value[1]) || value[1] > maxValue) {
      result[1] = maxValue;
    }
    if (result[0] > maxValue) {
      result[0] = maxValue;
    }
    if (result[1] < minValue) {
      result[1] = minValue;
    }
    return result;
  };
  var offsetSign = (series) => {
    var _series$;
    var n = series.length;
    if (n <= 0) {
      return;
    }
    var m = (_series$ = series[0]) === null || _series$ === void 0 ? void 0 : _series$.length;
    if (m == null || m <= 0) {
      return;
    }
    for (var j = 0; j < m; ++j) {
      var positive = 0;
      var negative = 0;
      for (var i = 0; i < n; ++i) {
        var row = series[i];
        var col = row === null || row === void 0 ? void 0 : row[j];
        if (col == null) {
          continue;
        }
        var series1 = col[1];
        var series0 = col[0];
        var value = isNan(series1) ? series0 : series1;
        if (value >= 0) {
          col[0] = positive;
          positive += value;
          col[1] = positive;
        } else {
          col[0] = negative;
          negative += value;
          col[1] = negative;
        }
      }
    }
  };
  var offsetPositive = (series) => {
    var _series$2;
    var n = series.length;
    if (n <= 0) {
      return;
    }
    var m = (_series$2 = series[0]) === null || _series$2 === void 0 ? void 0 : _series$2.length;
    if (m == null || m <= 0) {
      return;
    }
    for (var j = 0; j < m; ++j) {
      var positive = 0;
      for (var i = 0; i < n; ++i) {
        var row = series[i];
        var col = row === null || row === void 0 ? void 0 : row[j];
        if (col == null) {
          continue;
        }
        var value = isNan(col[1]) ? col[0] : col[1];
        if (value >= 0) {
          col[0] = positive;
          positive += value;
          col[1] = positive;
        } else {
          col[0] = 0;
          col[1] = 0;
        }
      }
    }
  };
  var STACK_OFFSET_MAP = {
    sign: offsetSign,
    // @ts-expect-error definitelytyped types are incorrect
    expand: expand_default,
    // @ts-expect-error definitelytyped types are incorrect
    none: none_default,
    // @ts-expect-error definitelytyped types are incorrect
    silhouette: silhouette_default,
    // @ts-expect-error definitelytyped types are incorrect
    wiggle: wiggle_default,
    positive: offsetPositive
  };
  var getStackedData = (data2, dataKeys, offsetType) => {
    var _STACK_OFFSET_MAP$off;
    var offsetAccessor = (_STACK_OFFSET_MAP$off = STACK_OFFSET_MAP[offsetType]) !== null && _STACK_OFFSET_MAP$off !== void 0 ? _STACK_OFFSET_MAP$off : none_default;
    var stack = stack_default().keys(dataKeys).value((d, key) => Number(getValueByDataKey(d, key, 0))).order(none_default2).offset(offsetAccessor);
    var result = stack(data2);
    result.forEach((series, seriesIndex) => {
      series.forEach((point2, pointIndex) => {
        var value = getValueByDataKey(data2[pointIndex], dataKeys[seriesIndex], 0);
        if (Array.isArray(value) && value.length === 2 && isNumber(value[0]) && isNumber(value[1])) {
          point2[0] = value[0];
          point2[1] = value[1];
        }
      });
    });
    return result;
  };
  function getNormalizedStackId(publicStackId) {
    return publicStackId == null ? void 0 : String(publicStackId);
  }
  var getCateCoordinateOfBar = (_ref2) => {
    var axis = _ref2.axis, ticks2 = _ref2.ticks, offset = _ref2.offset, bandSize = _ref2.bandSize, entry = _ref2.entry, index = _ref2.index;
    if (axis.type === "category") {
      return ticks2[index] ? ticks2[index].coordinate + offset : null;
    }
    var value = getValueByDataKey(entry, axis.dataKey, axis.scale.domain()[index]);
    if (isNullish(value)) {
      return null;
    }
    var scaled = axis.scale.map(value);
    if (!isNumber(scaled)) {
      return null;
    }
    return scaled - bandSize / 2 + offset;
  };
  var getBaseValueOfBar = (_ref3) => {
    var numericAxis = _ref3.numericAxis;
    var domain = numericAxis.scale.domain();
    if (numericAxis.type === "number") {
      var minValue = Math.min(domain[0], domain[1]);
      var maxValue = Math.max(domain[0], domain[1]);
      if (minValue <= 0 && maxValue >= 0) {
        return 0;
      }
      if (maxValue < 0) {
        return maxValue;
      }
      return minValue;
    }
    return domain[0];
  };
  var getDomainOfSingle = (data2) => {
    var flat = data2.flat(2).filter(isNumber);
    return [Math.min(...flat), Math.max(...flat)];
  };
  var makeDomainFinite = (domain) => {
    return [domain[0] === Infinity ? 0 : domain[0], domain[1] === -Infinity ? 0 : domain[1]];
  };
  var getDomainOfStackGroups = (stackGroups, startIndex, endIndex) => {
    if (stackGroups == null || Object.keys(stackGroups).length === 0) {
      return void 0;
    }
    return makeDomainFinite(Object.keys(stackGroups).reduce((result, stackId) => {
      var group = stackGroups[stackId];
      if (!group) {
        return result;
      }
      var stackedData = group.stackedData;
      var domain = stackedData.reduce((res, entry) => {
        var sliced = getSliced(entry, startIndex, endIndex);
        var s = getDomainOfSingle(sliced);
        if (!isWellBehavedNumber(s[0]) || !isWellBehavedNumber(s[1])) {
          return res;
        }
        return [Math.min(res[0], s[0]), Math.max(res[1], s[1])];
      }, [Infinity, -Infinity]);
      return [Math.min(domain[0], result[0]), Math.max(domain[1], result[1])];
    }, [Infinity, -Infinity]));
  };
  var MIN_VALUE_REG = /^dataMin[\s]*-[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/;
  var MAX_VALUE_REG = /^dataMax[\s]*\+[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/;
  var getBandSizeOfAxis = (axis, ticks2, isBar) => {
    if (axis && axis.scale && axis.scale.bandwidth) {
      var bandWidth = axis.scale.bandwidth();
      if (!isBar || bandWidth > 0) {
        return bandWidth;
      }
    }
    if (axis && ticks2 && ticks2.length >= 2) {
      var orderedTicks = sortBy(ticks2, (o) => o.coordinate);
      var bandSize = Infinity;
      for (var i = 1, len = orderedTicks.length; i < len; i++) {
        var cur = orderedTicks[i];
        var prev = orderedTicks[i - 1];
        bandSize = Math.min(((cur === null || cur === void 0 ? void 0 : cur.coordinate) || 0) - ((prev === null || prev === void 0 ? void 0 : prev.coordinate) || 0), bandSize);
      }
      return bandSize === Infinity ? 0 : bandSize;
    }
    return isBar ? void 0 : 0;
  };
  function getTooltipEntry(_ref4) {
    var tooltipEntrySettings = _ref4.tooltipEntrySettings, dataKey = _ref4.dataKey, payload = _ref4.payload, value = _ref4.value, name = _ref4.name;
    return _objectSpread2(_objectSpread2({}, tooltipEntrySettings), {}, {
      dataKey,
      payload,
      value,
      name
    });
  }
  function getTooltipNameProp(nameFromItem, dataKey) {
    if (nameFromItem != null) {
      return String(nameFromItem);
    }
    if (typeof dataKey === "string") {
      return dataKey;
    }
    return void 0;
  }
  var calculateCartesianTooltipPos = (coordinate, layout) => {
    if (layout === "horizontal") {
      return coordinate.relativeX;
    }
    if (layout === "vertical") {
      return coordinate.relativeY;
    }
    return void 0;
  };
  var calculatePolarTooltipPos = (rangeObj, layout) => {
    if (layout === "centric") {
      return rangeObj.angle;
    }
    return rangeObj.radius;
  };

  // node_modules/recharts/es6/state/selectors/containerSelectors.js
  init_define_import_meta_env();
  var selectChartWidth = (state) => state.layout.width;
  var selectChartHeight = (state) => state.layout.height;
  var selectContainerScale = (state) => state.layout.scale;
  var selectMargin = (state) => state.layout.margin;

  // node_modules/recharts/es6/state/selectors/selectAllAxes.js
  init_define_import_meta_env();
  var selectAllXAxes = createSelector((state) => state.cartesianAxis.xAxis, (xAxisMap) => {
    return Object.values(xAxisMap);
  });
  var selectAllYAxes = createSelector((state) => state.cartesianAxis.yAxis, (yAxisMap) => {
    return Object.values(yAxisMap);
  });

  // node_modules/recharts/es6/util/Constants.js
  init_define_import_meta_env();
  var DATA_ITEM_INDEX_ATTRIBUTE_NAME = "data-recharts-item-index";
  var DATA_ITEM_GRAPHICAL_ITEM_ID_ATTRIBUTE_NAME = "data-recharts-item-id";
  var DEFAULT_Y_AXIS_WIDTH = 60;

  // node_modules/recharts/es6/state/selectors/selectChartOffsetInternal.js
  function ownKeys3(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread3(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys3(Object(t), true).forEach(function(r3) {
        _defineProperty3(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys3(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty3(e, r2, t) {
    return (r2 = _toPropertyKey3(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey3(t) {
    var i = _toPrimitive3(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive3(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var selectBrushHeight = (state) => state.brush.height;
  function selectLeftAxesOffset(state) {
    var yAxes = selectAllYAxes(state);
    return yAxes.reduce((result, entry) => {
      if (entry.orientation === "left" && !entry.mirror && !entry.hide) {
        var width = typeof entry.width === "number" ? entry.width : DEFAULT_Y_AXIS_WIDTH;
        return result + width;
      }
      return result;
    }, 0);
  }
  function selectRightAxesOffset(state) {
    var yAxes = selectAllYAxes(state);
    return yAxes.reduce((result, entry) => {
      if (entry.orientation === "right" && !entry.mirror && !entry.hide) {
        var width = typeof entry.width === "number" ? entry.width : DEFAULT_Y_AXIS_WIDTH;
        return result + width;
      }
      return result;
    }, 0);
  }
  function selectTopAxesOffset(state) {
    var xAxes = selectAllXAxes(state);
    return xAxes.reduce((result, entry) => {
      if (entry.orientation === "top" && !entry.mirror && !entry.hide) {
        return result + entry.height;
      }
      return result;
    }, 0);
  }
  function selectBottomAxesOffset(state) {
    var xAxes = selectAllXAxes(state);
    return xAxes.reduce((result, entry) => {
      if (entry.orientation === "bottom" && !entry.mirror && !entry.hide) {
        return result + entry.height;
      }
      return result;
    }, 0);
  }
  var selectChartOffsetInternal = createSelector([selectChartWidth, selectChartHeight, selectMargin, selectBrushHeight, selectLeftAxesOffset, selectRightAxesOffset, selectTopAxesOffset, selectBottomAxesOffset, selectLegendSettings, selectLegendSize], (chartWidth, chartHeight, margin, brushHeight, leftAxesOffset, rightAxesOffset, topAxesOffset, bottomAxesOffset, legendSettings, legendSize) => {
    var offsetH = {
      left: (margin.left || 0) + leftAxesOffset,
      right: (margin.right || 0) + rightAxesOffset
    };
    var offsetV = {
      top: (margin.top || 0) + topAxesOffset,
      bottom: (margin.bottom || 0) + bottomAxesOffset
    };
    var offset = _objectSpread3(_objectSpread3({}, offsetV), offsetH);
    var brushBottom = offset.bottom;
    offset.bottom += brushHeight;
    offset = appendOffsetOfLegend(offset, legendSettings, legendSize);
    var offsetWidth = chartWidth - offset.left - offset.right;
    var offsetHeight = chartHeight - offset.top - offset.bottom;
    return _objectSpread3(_objectSpread3({
      brushBottom
    }, offset), {}, {
      // never return negative values for height and width
      width: Math.max(offsetWidth, 0),
      height: Math.max(offsetHeight, 0)
    });
  });
  var selectChartViewBox = createSelector(selectChartOffsetInternal, (offset) => ({
    x: offset.left,
    y: offset.top,
    width: offset.width,
    height: offset.height
  }));
  var selectAxisViewBox = createSelector(selectChartWidth, selectChartHeight, (width, height) => ({
    x: 0,
    y: 0,
    width,
    height
  }));

  // node_modules/recharts/es6/context/PanoramaContext.js
  init_define_import_meta_env();
  var React3 = __toESM(require_react_shim());
  var import_react8 = __toESM(require_react_shim());
  var PanoramaContext = /* @__PURE__ */ (0, import_react8.createContext)(null);
  var useIsPanorama = () => (0, import_react8.useContext)(PanoramaContext) != null;

  // node_modules/recharts/es6/state/selectors/brushSelectors.js
  init_define_import_meta_env();
  var selectBrushSettings = (state) => state.brush;
  var selectBrushDimensions = createSelector([selectBrushSettings, selectChartOffsetInternal, selectMargin], (brushSettings, offset, margin) => ({
    height: brushSettings.height,
    x: isNumber(brushSettings.x) ? brushSettings.x : offset.left,
    y: isNumber(brushSettings.y) ? brushSettings.y : offset.top + offset.height + offset.brushBottom - ((margin === null || margin === void 0 ? void 0 : margin.bottom) || 0),
    width: isNumber(brushSettings.width) ? brushSettings.width : offset.width
  }));

  // node_modules/recharts/es6/component/ResponsiveContainer.js
  init_define_import_meta_env();
  var React4 = __toESM(require_react_shim());
  var import_react9 = __toESM(require_react_shim());

  // node_modules/recharts/es6/util/LogUtils.js
  init_define_import_meta_env();
  var isDev = true;
  var warn = function warn2(condition, format2) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }
    if (isDev && typeof console !== "undefined" && console.warn) {
      if (format2 === void 0) {
        console.warn("LogUtils requires an error message argument");
      }
      if (!condition) {
        if (format2 === void 0) {
          console.warn("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");
        } else {
          var argIndex = 0;
          console.warn(format2.replace(/%s/g, () => args[argIndex++]));
        }
      }
    }
  };

  // node_modules/recharts/es6/component/responsiveContainerUtils.js
  init_define_import_meta_env();
  var defaultResponsiveContainerProps = {
    width: "100%",
    height: "100%",
    debounce: 0,
    minWidth: 0,
    initialDimension: {
      width: -1,
      height: -1
    }
  };

  // node_modules/recharts/es6/component/ResponsiveContainer.js
  var ResponsiveContainerContext = /* @__PURE__ */ (0, import_react9.createContext)(defaultResponsiveContainerProps.initialDimension);
  var useResponsiveContainerContext = () => (0, import_react9.useContext)(ResponsiveContainerContext);

  // node_modules/recharts/es6/context/chartLayoutContext.js
  function cartesianViewBoxToTrapezoid(box) {
    if (!box) {
      return void 0;
    }
    return {
      x: box.x,
      y: box.y,
      upperWidth: "upperWidth" in box ? box.upperWidth : box.width,
      lowerWidth: "lowerWidth" in box ? box.lowerWidth : box.width,
      width: box.width,
      height: box.height
    };
  }
  var useViewBox = () => {
    var _useAppSelector;
    var panorama = useIsPanorama();
    var rootViewBox = useAppSelector(selectChartViewBox);
    var brushDimensions = useAppSelector(selectBrushDimensions);
    var brushPadding = (_useAppSelector = useAppSelector(selectBrushSettings)) === null || _useAppSelector === void 0 ? void 0 : _useAppSelector.padding;
    if (!panorama || !brushDimensions || !brushPadding) {
      return rootViewBox;
    }
    return {
      width: brushDimensions.width - brushPadding.left - brushPadding.right,
      height: brushDimensions.height - brushPadding.top - brushPadding.bottom,
      x: brushPadding.left,
      y: brushPadding.top
    };
  };
  var manyComponentsThrowErrorsIfOffsetIsUndefined = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    brushBottom: 0
  };
  var useOffsetInternal = () => {
    var _useAppSelector2;
    return (_useAppSelector2 = useAppSelector(selectChartOffsetInternal)) !== null && _useAppSelector2 !== void 0 ? _useAppSelector2 : manyComponentsThrowErrorsIfOffsetIsUndefined;
  };
  var useChartWidth = () => {
    return useAppSelector(selectChartWidth);
  };
  var useChartHeight = () => {
    return useAppSelector(selectChartHeight);
  };
  var selectChartLayout = (state) => state.layout.layoutType;
  var useChartLayout = () => useAppSelector(selectChartLayout);
  var useCartesianChartLayout = () => {
    var layout = useChartLayout();
    if (layout === "horizontal" || layout === "vertical") {
      return layout;
    }
    return void 0;
  };
  var selectPolarChartLayout = (state) => {
    var layout = state.layout.layoutType;
    if (layout === "centric" || layout === "radial") {
      return layout;
    }
    return void 0;
  };
  var useIsInChartContext = () => {
    var layout = useChartLayout();
    return layout !== void 0;
  };
  var ReportChartSize = (props) => {
    var dispatch = useAppDispatch();
    var isPanorama = useIsPanorama();
    var widthFromProps = props.width, heightFromProps = props.height;
    var responsiveContainerCalculations = useResponsiveContainerContext();
    var width = widthFromProps;
    var height = heightFromProps;
    if (responsiveContainerCalculations) {
      width = responsiveContainerCalculations.width > 0 ? responsiveContainerCalculations.width : widthFromProps;
      height = responsiveContainerCalculations.height > 0 ? responsiveContainerCalculations.height : heightFromProps;
    }
    (0, import_react10.useEffect)(() => {
      if (!isPanorama && isPositiveNumber(width) && isPositiveNumber(height)) {
        dispatch(setChartSize({
          width,
          height
        }));
      }
    }, [dispatch, isPanorama, width, height]);
    return null;
  };

  // node_modules/recharts/es6/state/legendSlice.js
  init_define_import_meta_env();
  var initialState2 = {
    settings: {
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
      itemSorter: "value"
    },
    size: {
      width: 0,
      height: 0
    },
    payload: []
  };
  var legendSlice = createSlice({
    name: "legend",
    initialState: initialState2,
    reducers: {
      setLegendSize(state, action) {
        state.size.width = action.payload.width;
        state.size.height = action.payload.height;
      },
      setLegendSettings(state, action) {
        state.settings.align = action.payload.align;
        state.settings.layout = action.payload.layout;
        state.settings.verticalAlign = action.payload.verticalAlign;
        state.settings.itemSorter = action.payload.itemSorter;
      },
      addLegendPayload: {
        reducer(state, action) {
          state.payload.push(castDraft(action.payload));
        },
        prepare: prepareAutoBatched()
      },
      replaceLegendPayload: {
        reducer(state, action) {
          var _action$payload = action.payload, prev = _action$payload.prev, next = _action$payload.next;
          var index = current(state).payload.indexOf(castDraft(prev));
          if (index > -1) {
            state.payload[index] = castDraft(next);
          }
        },
        prepare: prepareAutoBatched()
      },
      removeLegendPayload: {
        reducer(state, action) {
          var index = current(state).payload.indexOf(castDraft(action.payload));
          if (index > -1) {
            state.payload.splice(index, 1);
          }
        },
        prepare: prepareAutoBatched()
      }
    }
  });
  var _legendSlice$actions = legendSlice.actions;
  var setLegendSize = _legendSlice$actions.setLegendSize;
  var setLegendSettings = _legendSlice$actions.setLegendSettings;
  var addLegendPayload = _legendSlice$actions.addLegendPayload;
  var replaceLegendPayload = _legendSlice$actions.replaceLegendPayload;
  var removeLegendPayload = _legendSlice$actions.removeLegendPayload;
  var legendReducer = legendSlice.reducer;

  // node_modules/recharts/es6/util/propsAreEqual.js
  init_define_import_meta_env();

  // node_modules/react-redux/dist/react-redux.mjs
  init_define_import_meta_env();
  var React5 = __toESM(require_react_shim(), 1);
  var import_with_selector2 = __toESM(require_with_selector2(), 1);
  var REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref");
  var REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo");
  var ForwardRef = REACT_FORWARD_REF_TYPE;
  var Memo = REACT_MEMO_TYPE;
  function defaultNoopBatch(callback) {
    callback();
  }
  function createListenerCollection() {
    let first = null;
    let last = null;
    return {
      clear() {
        first = null;
        last = null;
      },
      notify() {
        defaultNoopBatch(() => {
          let listener2 = first;
          while (listener2) {
            listener2.callback();
            listener2 = listener2.next;
          }
        });
      },
      get() {
        const listeners = [];
        let listener2 = first;
        while (listener2) {
          listeners.push(listener2);
          listener2 = listener2.next;
        }
        return listeners;
      },
      subscribe(callback) {
        let isSubscribed = true;
        const listener2 = last = {
          callback,
          next: null,
          prev: last
        };
        if (listener2.prev) {
          listener2.prev.next = listener2;
        } else {
          first = listener2;
        }
        return function unsubscribe() {
          if (!isSubscribed || first === null) return;
          isSubscribed = false;
          if (listener2.next) {
            listener2.next.prev = listener2.prev;
          } else {
            last = listener2.prev;
          }
          if (listener2.prev) {
            listener2.prev.next = listener2.next;
          } else {
            first = listener2.next;
          }
        };
      }
    };
  }
  var nullListeners = {
    notify() {
    },
    get: () => []
  };
  function createSubscription(store, parentSub) {
    let unsubscribe;
    let listeners = nullListeners;
    let subscriptionsAmount = 0;
    let selfSubscribed = false;
    function addNestedSub(listener2) {
      trySubscribe();
      const cleanupListener = listeners.subscribe(listener2);
      let removed = false;
      return () => {
        if (!removed) {
          removed = true;
          cleanupListener();
          tryUnsubscribe();
        }
      };
    }
    function notifyNestedSubs() {
      listeners.notify();
    }
    function handleChangeWrapper() {
      if (subscription.onStateChange) {
        subscription.onStateChange();
      }
    }
    function isSubscribed() {
      return selfSubscribed;
    }
    function trySubscribe() {
      subscriptionsAmount++;
      if (!unsubscribe) {
        unsubscribe = parentSub ? parentSub.addNestedSub(handleChangeWrapper) : store.subscribe(handleChangeWrapper);
        listeners = createListenerCollection();
      }
    }
    function tryUnsubscribe() {
      subscriptionsAmount--;
      if (unsubscribe && subscriptionsAmount === 0) {
        unsubscribe();
        unsubscribe = void 0;
        listeners.clear();
        listeners = nullListeners;
      }
    }
    function trySubscribeSelf() {
      if (!selfSubscribed) {
        selfSubscribed = true;
        trySubscribe();
      }
    }
    function tryUnsubscribeSelf() {
      if (selfSubscribed) {
        selfSubscribed = false;
        tryUnsubscribe();
      }
    }
    const subscription = {
      addNestedSub,
      notifyNestedSubs,
      handleChangeWrapper,
      isSubscribed,
      trySubscribe: trySubscribeSelf,
      tryUnsubscribe: tryUnsubscribeSelf,
      getListeners: () => listeners
    };
    return subscription;
  }
  var canUseDOM = () => !!(typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined");
  var isDOM = /* @__PURE__ */ canUseDOM();
  var isRunningInReactNative = () => typeof navigator !== "undefined" && navigator.product === "ReactNative";
  var isReactNative = /* @__PURE__ */ isRunningInReactNative();
  var getUseIsomorphicLayoutEffect = () => isDOM || isReactNative ? React5.useLayoutEffect : React5.useEffect;
  var useIsomorphicLayoutEffect = /* @__PURE__ */ getUseIsomorphicLayoutEffect();
  function is2(x, y) {
    if (x === y) {
      return x !== 0 || y !== 0 || 1 / x === 1 / y;
    } else {
      return x !== x && y !== y;
    }
  }
  function shallowEqual(objA, objB) {
    if (is2(objA, objB)) return true;
    if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
      return false;
    }
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;
    for (let i = 0; i < keysA.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !is2(objA[keysA[i]], objB[keysA[i]])) {
        return false;
      }
    }
    return true;
  }
  var FORWARD_REF_STATICS = {
    $$typeof: true,
    render: true,
    defaultProps: true,
    displayName: true,
    propTypes: true
  };
  var MEMO_STATICS = {
    $$typeof: true,
    compare: true,
    defaultProps: true,
    displayName: true,
    propTypes: true,
    type: true
  };
  var TYPE_STATICS = {
    [ForwardRef]: FORWARD_REF_STATICS,
    [Memo]: MEMO_STATICS
  };
  var objectPrototype = Object.prototype;
  var ContextKey = /* @__PURE__ */ Symbol.for(`react-redux-context`);
  var gT = typeof globalThis !== "undefined" ? globalThis : (
    /* fall back to a per-module scope (pre-8.1 behaviour) if `globalThis` is not available */
    {}
  );
  function getContext() {
    if (!React5.createContext) return {};
    const contextMap = gT[ContextKey] ??= /* @__PURE__ */ new Map();
    let realContext = contextMap.get(React5.createContext);
    if (!realContext) {
      realContext = React5.createContext(
        null
      );
      if (true) {
        realContext.displayName = "ReactRedux";
      }
      contextMap.set(React5.createContext, realContext);
    }
    return realContext;
  }
  var ReactReduxContext = /* @__PURE__ */ getContext();
  function Provider(providerProps) {
    const { children, context, serverState, store } = providerProps;
    const contextValue = React5.useMemo(() => {
      const subscription = createSubscription(store);
      const baseContextValue = {
        store,
        subscription,
        getServerState: serverState ? () => serverState : void 0
      };
      if (false) {
        return baseContextValue;
      } else {
        const { identityFunctionCheck = "once", stabilityCheck = "once" } = providerProps;
        return /* @__PURE__ */ Object.assign(baseContextValue, {
          stabilityCheck,
          identityFunctionCheck
        });
      }
    }, [store, serverState]);
    const previousState = React5.useMemo(() => store.getState(), [store]);
    useIsomorphicLayoutEffect(() => {
      const { subscription } = contextValue;
      subscription.onStateChange = subscription.notifyNestedSubs;
      subscription.trySubscribe();
      if (previousState !== store.getState()) {
        subscription.notifyNestedSubs();
      }
      return () => {
        subscription.tryUnsubscribe();
        subscription.onStateChange = void 0;
      };
    }, [contextValue, previousState]);
    const Context = context || ReactReduxContext;
    return /* @__PURE__ */ React5.createElement(Context.Provider, { value: contextValue }, children);
  }
  var Provider_default = Provider;

  // node_modules/recharts/es6/util/propsAreEqual.js
  var propsToShallowCompare = /* @__PURE__ */ new Set([
    "axisLine",
    "tickLine",
    "activeBar",
    "activeDot",
    "activeLabel",
    "activeShape",
    "allowEscapeViewBox",
    "background",
    "cursor",
    "dot",
    "label",
    "line",
    "margin",
    "padding",
    "position",
    "shape",
    "style",
    "tick",
    "wrapperStyle",
    // radius can be an array of 4 numbers, easy to compare shallowly
    "radius",
    "throttledEvents"
  ]);
  function sameValueZero(x, y) {
    if (x == null && y == null) {
      return true;
    }
    if (typeof x === "number" && typeof y === "number") {
      return x === y || x !== x && y !== y;
    }
    return x === y;
  }
  function propsAreEqual(prevProps, nextProps) {
    var allKeys = /* @__PURE__ */ new Set([...Object.keys(prevProps), ...Object.keys(nextProps)]);
    for (var key of allKeys) {
      if (propsToShallowCompare.has(key)) {
        if (prevProps[key] == null && nextProps[key] == null) {
          continue;
        }
        if (!shallowEqual(prevProps[key], nextProps[key])) {
          return false;
        }
      } else if (!sameValueZero(prevProps[key], nextProps[key])) {
        return false;
      }
    }
    return true;
  }

  // node_modules/recharts/es6/util/usePrefersReducedMotion.js
  init_define_import_meta_env();
  var import_react11 = __toESM(require_react_shim());

  // node_modules/recharts/es6/util/Global.js
  init_define_import_meta_env();
  var parseIsSsrByDefault = () => !(typeof window !== "undefined" && window.document && Boolean(window.document.createElement) && window.setTimeout);
  var Global = {
    devToolsEnabled: true,
    isSsr: parseIsSsrByDefault()
  };

  // node_modules/recharts/es6/util/usePrefersReducedMotion.js
  function _slicedToArray(r2, e) {
    return _arrayWithHoles(r2) || _iterableToArrayLimit(r2, e) || _unsupportedIterableToArray(r2, e) || _nonIterableRest();
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles(r2) {
    if (Array.isArray(r2)) return r2;
  }
  function usePrefersReducedMotion() {
    var _useState = (0, import_react11.useState)(() => {
      if (Global.isSsr) {
        return false;
      }
      if (!window.matchMedia) {
        return false;
      }
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }), _useState2 = _slicedToArray(_useState, 2), prefersReducedMotion = _useState2[0], setPrefersReducedMotion = _useState2[1];
    (0, import_react11.useEffect)(() => {
      if (!window.matchMedia) {
        return;
      }
      var mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      var handleChange = () => {
        setPrefersReducedMotion(mediaQuery.matches);
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }, []);
    return prefersReducedMotion;
  }

  // node_modules/recharts/es6/context/accessibilityContext.js
  init_define_import_meta_env();
  var useAccessibilityLayer = () => {
    var _useAppSelector;
    return (_useAppSelector = useAppSelector((state) => state.rootProps.accessibilityLayer)) !== null && _useAppSelector !== void 0 ? _useAppSelector : true;
  };

  // node_modules/recharts/es6/shape/Rectangle.js
  init_define_import_meta_env();
  var React6 = __toESM(require_react_shim());
  var import_react15 = __toESM(require_react_shim());

  // node_modules/recharts/es6/animation/JavascriptAnimate.js
  init_define_import_meta_env();
  var import_react13 = __toESM(require_react_shim());

  // node_modules/recharts/es6/animation/easing.js
  init_define_import_meta_env();
  var ACCURACY = 1e-4;
  var cubicBezierFactor = (c1, c2) => [0, 3 * c1, 3 * c2 - 6 * c1, 3 * c1 - 3 * c2 + 1];
  var evaluatePolynomial = (params, animationElapsedTime) => params.map((param, i) => param * animationElapsedTime ** i).reduce((pre, curr) => pre + curr);
  var cubicBezier = (c1, c2) => (animationElapsedTime) => {
    var params = cubicBezierFactor(c1, c2);
    return evaluatePolynomial(params, animationElapsedTime);
  };
  var derivativeCubicBezier = (c1, c2) => (animationElapsedTime) => {
    var params = cubicBezierFactor(c1, c2);
    var newParams = [...params.map((param, i) => param * i).slice(1), 0];
    return evaluatePolynomial(newParams, animationElapsedTime);
  };
  var parseCubicBezier = (easing) => {
    var _easingParts$;
    var easingParts = easing.split("(");
    if (easingParts.length !== 2 || easingParts[0] !== "cubic-bezier") {
      return null;
    }
    var numbers2 = (_easingParts$ = easingParts[1]) === null || _easingParts$ === void 0 || (_easingParts$ = _easingParts$.split(")")[0]) === null || _easingParts$ === void 0 ? void 0 : _easingParts$.split(",");
    if (numbers2 == null || numbers2.length !== 4) {
      return null;
    }
    var coords = numbers2.map((x) => parseFloat(x));
    return [coords[0], coords[1], coords[2], coords[3]];
  };
  var getBezierCoordinates = function getBezierCoordinates2() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length === 1) {
      switch (args[0]) {
        case "linear":
          return [0, 0, 1, 1];
        case "ease":
          return [0.25, 0.1, 0.25, 1];
        case "ease-in":
          return [0.42, 0, 1, 1];
        case "ease-out":
          return [0.42, 0, 0.58, 1];
        case "ease-in-out":
          return [0, 0, 0.58, 1];
        default: {
          var easing = parseCubicBezier(args[0]);
          if (easing) {
            return easing;
          }
        }
      }
    }
    if (args.length === 4) {
      return args;
    }
    return [0, 0, 1, 1];
  };
  var createBezierEasing = (x1, y1, x2, y2) => {
    var curveX = cubicBezier(x1, x2);
    var curveY = cubicBezier(y1, y2);
    var derCurveX = derivativeCubicBezier(x1, x2);
    var rangeValue = (value) => {
      if (value > 1) {
        return 1;
      }
      if (value < 0) {
        return 0;
      }
      return value;
    };
    var bezier = (_animationElapsedTime) => {
      var animationElapsedTime = _animationElapsedTime > 1 ? 1 : _animationElapsedTime;
      var x = animationElapsedTime;
      for (var i = 0; i < 8; ++i) {
        var evalT = curveX(x) - animationElapsedTime;
        var derVal = derCurveX(x);
        if (Math.abs(evalT - animationElapsedTime) < ACCURACY || derVal < ACCURACY) {
          return curveY(x);
        }
        x = rangeValue(x - evalT / derVal);
      }
      return curveY(x);
    };
    bezier.isStepper = false;
    return bezier;
  };
  var configBezier = function configBezier2() {
    return createBezierEasing(...getBezierCoordinates(...arguments));
  };
  var createSpringEasing = function createSpringEasing2() {
    var config2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var _config$stiff = config2.stiff, stiff = _config$stiff === void 0 ? 100 : _config$stiff, _config$damping = config2.damping, damping = _config$damping === void 0 ? 8 : _config$damping, _config$dt = config2.dt, dt = _config$dt === void 0 ? 16.67 : _config$dt;
    var destX = 1;
    var positions = [0];
    var currX = 0;
    var currV = 0;
    var maxIterations = 1e4;
    var iterations = 0;
    while (iterations < maxIterations) {
      var FSpring = -(currX - destX) * stiff;
      var FDamping = currV * damping;
      currV += (FSpring - FDamping) * dt / 1e3;
      currX += currV * dt / 1e3;
      positions.push(currX);
      if (Math.abs(currX - destX) < ACCURACY && Math.abs(currV) < ACCURACY) {
        break;
      }
      iterations++;
    }
    positions[positions.length - 1] = destX;
    var maxIndex = positions.length - 1;
    return (t) => {
      var _positions$index, _positions, _positions$index2;
      if (t <= 0) return 0;
      if (t >= 1) return destX;
      var exactFrame = t * maxIndex;
      var index = Math.floor(exactFrame);
      var fraction = exactFrame - index;
      return ((_positions$index = positions[index]) !== null && _positions$index !== void 0 ? _positions$index : 0) + (((_positions = positions[index + 1]) !== null && _positions !== void 0 ? _positions : 0) - ((_positions$index2 = positions[index]) !== null && _positions$index2 !== void 0 ? _positions$index2 : 0)) * fraction;
    };
  };
  var createEasingFunction = (easing) => {
    if (typeof easing === "string") {
      switch (easing) {
        case "ease":
        case "ease-in-out":
        case "ease-out":
        case "ease-in":
        case "linear":
          return configBezier(easing);
        case "spring":
          return createSpringEasing();
        default:
          if (easing.split("(")[0] === "cubic-bezier") {
            return configBezier(easing);
          }
      }
    }
    if (typeof easing === "function") {
      return easing;
    }
    return null;
  };

  // node_modules/recharts/es6/animation/useAnimationController.js
  init_define_import_meta_env();
  var import_react12 = __toESM(require_react_shim());

  // node_modules/recharts/es6/animation/AnimationControllerImpl.js
  init_define_import_meta_env();
  var animationControllerImpl = (timeoutController, animationHandle, listener2) => {
    var cancellable;
    var nextUpdate = (now) => {
      var timeRemaining = animationHandle.tick(now);
      if (animationHandle.getState() === "active") {
        listener2(animationHandle.getInterpolated());
        if (animationHandle.getProgress() === 1) {
          animationHandle.complete();
          cancellable = void 0;
          return;
        }
        cancellable = timeoutController.setTimeout(nextUpdate, timeRemaining);
        return;
      }
      cancellable = timeoutController.setTimeout(nextUpdate, timeRemaining);
    };
    cancellable = timeoutController.setTimeout(nextUpdate, 0);
    return () => {
      var _cancellable;
      return (_cancellable = cancellable) === null || _cancellable === void 0 ? void 0 : _cancellable();
    };
  };

  // node_modules/recharts/es6/animation/useAnimationController.js
  var AnimationControllerContext = /* @__PURE__ */ (0, import_react12.createContext)(animationControllerImpl);
  var AnimationControllerProvider = AnimationControllerContext.Provider;
  function useAnimationController(animationControllerFromProps) {
    var animationControllerFromContext = (0, import_react12.useContext)(AnimationControllerContext);
    return (0, import_react12.useMemo)(() => animationControllerFromProps !== null && animationControllerFromProps !== void 0 ? animationControllerFromProps : animationControllerFromContext, [animationControllerFromProps, animationControllerFromContext]);
  }

  // node_modules/recharts/es6/animation/AnimationHandle.js
  init_define_import_meta_env();
  function _defineProperty4(e, r2, t) {
    return (r2 = _toPropertyKey4(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey4(t) {
    var i = _toPrimitive4(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive4(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var INIT = "init";
  var PENDING = "pending";
  var ACTIVE = "active";
  var COMPLETED = "completed";
  function duration(time2) {
    return Math.max(0, time2);
  }
  var RechartsAnimation = class {
    /**
     * Returns the absolute time after the animationBegin delay has been completed,
     * and when the animationDuration started ticking.
     */
    getAnimationStartedTime() {
      return this.animationStartedTime;
    }
    /**
     * Returns the absolute time of when the animation began - now it will wait for {animationBegin} ms before the transition starts
     */
    getBeginStartedTime() {
      return this.beginStartedTime;
    }
    constructor(param) {
      var _param$onAnimationSta;
      _defineProperty4(this, "state", INIT);
      this.animationId = param.animationId;
      this.onAnimationEnd = param.onAnimationEnd;
      this.animationDuration = duration(param.animationDuration);
      this.animationBegin = duration(param.animationBegin);
      this.progress = 0;
      this.from = param.from;
      this.to = param.to;
      this.easing = param.easing;
      (_param$onAnimationSta = param.onAnimationStart) === null || _param$onAnimationSta === void 0 || _param$onAnimationSta.call(param);
    }
    /**
     * Returns the state machine current state
     * - `init`:       animation had just been created. It immediately calls `onAnimationStart`
     * - `pending`:    animation is now paused for `animationBegin` milliseconds until the transition begins
     * - `active`:     animation is transitioning items on screen
     * - `completed`:  animation has completed its transition and executed `onAnimationEnd`.
     *                 This state is final and the animation is no longer allowed to transition to other states.
     */
    getState() {
      return this.state;
    }
    /**
     * Returns the easing input or function
     */
    getEasing() {
      return this.easing;
    }
    /**
     * Returns the configuration - the duration of the transition.
     * Does not change in time, does not change when state changes, this is a static value.
     */
    getAnimationDuration() {
      return this.animationDuration;
    }
    /**
     * Sets the current time of the animation. The animation sets its internal state and progress accordingly.
     * This is current, absolute time; not additive!
     * This allows you to essentially "travel back in time" based on the value you pass in here.
     *
     * Returns the (relative) time remaining until the current activity is over.
     * Meaning: if the state is in a middle of a delay, returns the time left until the delay is finished.
     * If the state is in the middle of a transition, returns time left until that transition is complete.
     * This is useful because it's the same number you can take and put into setTimeout(fn, X)
     * as that's how much time we need to wait until the next state transition happens.
     */
    tick(now) {
      if (this.getState() === INIT) {
        this.state = PENDING;
        this.beginStartedTime = now;
        return this.animationBegin;
      }
      if (this.getState() === PENDING) {
        if (this.beginStartedTime == null) {
          throw new Error();
        }
        var _timeElapsed = now - this.beginStartedTime;
        if (_timeElapsed >= this.animationBegin) {
          this.state = ACTIVE;
          this.animationStartedTime = now;
          return this.nextAnimationUpdate(0);
        }
        return duration(this.animationBegin - _timeElapsed);
      }
      if (this.getState() === ACTIVE) {
        if (this.animationStartedTime == null) {
          throw new Error();
        }
        var _timeElapsed2 = now - this.animationStartedTime;
        this.setProgress(_timeElapsed2 / this.animationDuration);
        return this.nextAnimationUpdate(_timeElapsed2);
      }
      return 0;
    }
    setProgress(newProgress) {
      this.progress = Math.min(1, Math.max(0, newProgress));
    }
    /**
     * Returns an abstract "progress" which is number between 0 and 1 which shows the distance of transition.
     * This progress depends on the animation state:
     * - `init`: 0
     * - `pending`: 0
     * - `active`: transitioning between [0, 1] based on the time elapsed
     * - `completed`: 1
     *
     * The progress is hard-capped to be between 0 and 1 (inclusive) to avoid overshooting caused by coarse timers.
     * For this reason, the easing function must be applied _after_ this animation state,
     * so that one has a chance to construct dynamic "overshoot" animations.
     *
     * The progress is linear with time.
     * If you wish for easing, use `getInterpolated()` instead.
     */
    getProgress() {
      return this.progress;
    }
    /**
     * Completes the animation. Completed animation:
     * - cannot be manipulated anymore
     * - its progress is set to 1
     * - tick function doesn't do anything
     * - getState() always returns 'completed'
     */
    complete() {
      this.progress = 1;
      if (this.state === "active") {
        var _this$onAnimationEnd;
        (_this$onAnimationEnd = this.onAnimationEnd) === null || _this$onAnimationEnd === void 0 || _this$onAnimationEnd.call(this);
      }
      this.state = COMPLETED;
    }
    /**
     * Returns the starting value of the animation.
     * Does not include progress, easing, interpolation, none of that - just the static starting value
     */
    getFrom() {
      return this.from;
    }
    /**
     * Returns the end value of the animation.
     * Does not include progress, easing, interpolation, none of that - just the static end value
     */
    getTo() {
      return this.to;
    }
    /**
     * Unique identifier of an animation
     */
    getAnimationId() {
      return this.animationId;
    }
    /**
     * Returns the configuration - the duration of delay in between animation initialization, and transition.
     * Does not change in time, does not change when state changes, this is a static value.
     */
    getAnimationBegin() {
      return this.animationBegin;
    }
    /**
     * Returns value of the transition at the current time.
     * The exact details differ based on the animation type
     */
    /**
     * Returns the duration of time of when the controller should ask for the next update
     */
  };
  var JavascriptAnimation = class extends RechartsAnimation {
    // eslint-disable-next-line class-methods-use-this
    nextAnimationUpdate() {
      return 0;
    }
    /**
     * Returns value of the animation after its easing function had been applied.
     * This value, unlike getProgress(), can escape the [0..1] range
     * because this is entirely within the easing function control. Spring typically does this.
     */
    getInterpolated() {
      return this.easing(interpolate(this.getFrom(), this.getTo(), this.getProgress()));
    }
  };

  // node_modules/recharts/es6/animation/timeoutController.js
  init_define_import_meta_env();
  var RequestAnimationFrameTimeoutController = class {
    setTimeout(callback) {
      var delay = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
      var startTime = performance.now();
      var requestId = null;
      var executeCallback = (now) => {
        if (now - startTime >= delay) {
          callback(now);
        } else {
          requestId = requestAnimationFrame(executeCallback);
        }
      };
      requestId = requestAnimationFrame(executeCallback);
      return () => {
        if (requestId != null) {
          cancelAnimationFrame(requestId);
        }
      };
    }
  };

  // node_modules/recharts/es6/animation/JavascriptAnimate.js
  function _slicedToArray2(r2, e) {
    return _arrayWithHoles2(r2) || _iterableToArrayLimit2(r2, e) || _unsupportedIterableToArray2(r2, e) || _nonIterableRest2();
  }
  function _nonIterableRest2() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray2(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray2(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray2(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray2(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit2(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles2(r2) {
    if (Array.isArray(r2)) return r2;
  }
  var defaultJavascriptAnimateProps = {
    begin: 0,
    duration: 1e3,
    easing: "ease",
    isActive: true,
    canBegin: true,
    onAnimationEnd: () => {
    },
    onAnimationStart: () => {
    }
  };
  var from = 0;
  var to = 1;
  function JavascriptAnimate(outsideProps) {
    var props = resolveDefaultProps(outsideProps, defaultJavascriptAnimateProps);
    var animationId = props.animationId, isActiveProp = props.isActive, canBegin = props.canBegin, duration2 = props.duration, easing = props.easing, begin = props.begin, onAnimationEnd = props.onAnimationEnd, onAnimationStart = props.onAnimationStart, children = props.children;
    var prefersReducedMotion = usePrefersReducedMotion();
    var isActive = isActiveProp === "auto" ? !Global.isSsr && !prefersReducedMotion : isActiveProp;
    var animationController = useAnimationController(props.animationController);
    var _useState = (0, import_react13.useState)(isActive ? from : to), _useState2 = _slicedToArray2(_useState, 2), style = _useState2[0], setStyle = _useState2[1];
    (0, import_react13.useEffect)(() => {
      if (!isActive) {
        setStyle(to);
      }
    }, [isActive]);
    (0, import_react13.useEffect)(() => {
      var easingFunction = createEasingFunction(easing);
      if (!isActive || !canBegin || easingFunction == null) {
        return noop;
      }
      var timeoutController = new RequestAnimationFrameTimeoutController();
      var animation = new JavascriptAnimation({
        animationId,
        easing: easingFunction,
        animationDuration: duration2,
        animationBegin: begin,
        onAnimationStart,
        onAnimationEnd,
        from,
        to
      });
      return animationController(timeoutController, animation, setStyle);
    }, [animationController, animationId, isActive, canBegin, duration2, easing, begin, onAnimationStart, onAnimationEnd]);
    return children(Number(style));
  }

  // node_modules/recharts/es6/util/useAnimationId.js
  init_define_import_meta_env();
  var import_react14 = __toESM(require_react_shim());
  function useAnimationId(input) {
    var prefix2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "animation-";
    var animationId = (0, import_react14.useRef)(uniqueId(prefix2));
    var prevProps = (0, import_react14.useRef)(input);
    if (prevProps.current !== input) {
      animationId.current = uniqueId(prefix2);
      prevProps.current = input;
    }
    return animationId.current;
  }

  // node_modules/recharts/es6/animation/util.js
  init_define_import_meta_env();
  var getDashCase = (name) => name.replace(/([A-Z])/g, (v) => "-".concat(v.toLowerCase()));
  var getTransitionVal = (props, duration2, easing) => props.map((prop) => "".concat(getDashCase(prop), " ").concat(duration2, "ms ").concat(easing)).join(",");

  // node_modules/recharts/es6/shape/Rectangle.js
  var _excluded3 = ["radius"];
  var _excluded22 = ["radius"];
  var _templateObject;
  var _templateObject2;
  var _templateObject3;
  var _templateObject4;
  var _templateObject5;
  var _templateObject6;
  var _templateObject7;
  var _templateObject8;
  var _templateObject9;
  var _templateObject0;
  function ownKeys4(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread4(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys4(Object(t), true).forEach(function(r3) {
        _defineProperty5(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys4(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty5(e, r2, t) {
    return (r2 = _toPropertyKey5(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey5(t) {
    var i = _toPrimitive5(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive5(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function _extends3() {
    return _extends3 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends3.apply(null, arguments);
  }
  function _objectWithoutProperties3(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose3(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose3(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function _slicedToArray3(r2, e) {
    return _arrayWithHoles3(r2) || _iterableToArrayLimit3(r2, e) || _unsupportedIterableToArray3(r2, e) || _nonIterableRest3();
  }
  function _nonIterableRest3() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray3(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray3(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray3(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray3(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit3(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles3(r2) {
    if (Array.isArray(r2)) return r2;
  }
  function _taggedTemplateLiteral(e, t) {
    return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
  }
  var getRectanglePath = (x, y, width, height, radius) => {
    var roundedWidth = round(width);
    var roundedHeight = round(height);
    var maxRadius = Math.min(Math.abs(roundedWidth) / 2, Math.abs(roundedHeight) / 2);
    var ySign = roundedHeight >= 0 ? 1 : -1;
    var xSign = roundedWidth >= 0 ? 1 : -1;
    var clockWise = roundedHeight >= 0 && roundedWidth >= 0 || roundedHeight < 0 && roundedWidth < 0 ? 1 : 0;
    var path;
    if (maxRadius > 0 && Array.isArray(radius)) {
      var newRadius = [0, 0, 0, 0];
      for (var i = 0, len = 4; i < len; i++) {
        var _radius$i;
        var r2 = (_radius$i = radius[i]) !== null && _radius$i !== void 0 ? _radius$i : 0;
        newRadius[i] = r2 > maxRadius ? maxRadius : r2;
      }
      path = roundTemplateLiteral(_templateObject || (_templateObject = _taggedTemplateLiteral(["M", ",", ""])), x, y + ySign * newRadius[0]);
      if (newRadius[0] > 0) {
        path += roundTemplateLiteral(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["A ", ",", ",0,0,", ",", ",", ""])), newRadius[0], newRadius[0], clockWise, x + xSign * newRadius[0], y);
      }
      path += roundTemplateLiteral(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["L ", ",", ""])), x + width - xSign * newRadius[1], y);
      if (newRadius[1] > 0) {
        path += roundTemplateLiteral(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["A ", ",", ",0,0,", ",\n        ", ",", ""])), newRadius[1], newRadius[1], clockWise, x + width, y + ySign * newRadius[1]);
      }
      path += roundTemplateLiteral(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["L ", ",", ""])), x + width, y + height - ySign * newRadius[2]);
      if (newRadius[2] > 0) {
        path += roundTemplateLiteral(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["A ", ",", ",0,0,", ",\n        ", ",", ""])), newRadius[2], newRadius[2], clockWise, x + width - xSign * newRadius[2], y + height);
      }
      path += roundTemplateLiteral(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["L ", ",", ""])), x + xSign * newRadius[3], y + height);
      if (newRadius[3] > 0) {
        path += roundTemplateLiteral(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["A ", ",", ",0,0,", ",\n        ", ",", ""])), newRadius[3], newRadius[3], clockWise, x, y + height - ySign * newRadius[3]);
      }
      path += "Z";
    } else if (maxRadius > 0 && radius === +radius && radius > 0) {
      var _newRadius = Math.min(maxRadius, radius);
      path = roundTemplateLiteral(_templateObject9 || (_templateObject9 = _taggedTemplateLiteral(["M ", ",", "\n            A ", ",", ",0,0,", ",", ",", "\n            L ", ",", "\n            A ", ",", ",0,0,", ",", ",", "\n            L ", ",", "\n            A ", ",", ",0,0,", ",", ",", "\n            L ", ",", "\n            A ", ",", ",0,0,", ",", ",", " Z"])), x, y + ySign * _newRadius, _newRadius, _newRadius, clockWise, x + xSign * _newRadius, y, x + width - xSign * _newRadius, y, _newRadius, _newRadius, clockWise, x + width, y + ySign * _newRadius, x + width, y + height - ySign * _newRadius, _newRadius, _newRadius, clockWise, x + width - xSign * _newRadius, y + height, x + xSign * _newRadius, y + height, _newRadius, _newRadius, clockWise, x, y + height - ySign * _newRadius);
    } else {
      path = roundTemplateLiteral(_templateObject0 || (_templateObject0 = _taggedTemplateLiteral(["M ", ",", " h ", " v ", " h ", " Z"])), x, y, width, height, -width);
    }
    return path;
  };
  var defaultRectangleProps = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    radius: 0,
    isAnimationActive: false,
    isUpdateAnimationActive: false,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: "ease"
  };
  var Rectangle = (rectangleProps) => {
    var props = resolveDefaultProps(rectangleProps, defaultRectangleProps);
    var pathRef = (0, import_react15.useRef)(null);
    var _useState = (0, import_react15.useState)(-1), _useState2 = _slicedToArray3(_useState, 2), totalLength = _useState2[0], setTotalLength = _useState2[1];
    (0, import_react15.useEffect)(() => {
      if (pathRef.current && pathRef.current.getTotalLength) {
        try {
          var pathTotalLength = pathRef.current.getTotalLength();
          if (pathTotalLength) {
            setTotalLength(pathTotalLength);
          }
        } catch (_unused) {
        }
      }
    }, []);
    var x = props.x, y = props.y, width = props.width, height = props.height, radius = props.radius, className = props.className;
    var animationEasing = props.animationEasing, animationDuration = props.animationDuration, animationBegin = props.animationBegin, isAnimationActive = props.isAnimationActive, isUpdateAnimationActive = props.isUpdateAnimationActive;
    var prevWidthRef = (0, import_react15.useRef)(width);
    var prevHeightRef = (0, import_react15.useRef)(height);
    var prevXRef = (0, import_react15.useRef)(x);
    var prevYRef = (0, import_react15.useRef)(y);
    var animationIdInput = (0, import_react15.useMemo)(() => ({
      x,
      y,
      width,
      height,
      radius
    }), [x, y, width, height, radius]);
    var animationId = useAnimationId(animationIdInput, "rectangle-");
    if (x !== +x || y !== +y || width !== +width || height !== +height || width === 0 || height === 0) {
      return null;
    }
    var layerClass = clsx("recharts-rectangle", className);
    if (!isUpdateAnimationActive) {
      var _svgPropertiesAndEven = svgPropertiesAndEvents(props), _ = _svgPropertiesAndEven.radius, otherPathProps = _objectWithoutProperties3(_svgPropertiesAndEven, _excluded3);
      return /* @__PURE__ */ React6.createElement("path", _extends3({}, otherPathProps, {
        x: round(x),
        y: round(y),
        width: round(width),
        height: round(height),
        radius: typeof radius === "number" ? radius : void 0,
        className: layerClass,
        d: getRectanglePath(x, y, width, height, radius)
      }));
    }
    var prevWidth = prevWidthRef.current;
    var prevHeight = prevHeightRef.current;
    var prevX = prevXRef.current;
    var prevY = prevYRef.current;
    var from2 = "0px ".concat(totalLength === -1 ? 1 : totalLength, "px");
    var to2 = "".concat(totalLength, "px ").concat(totalLength, "px");
    var transition = getTransitionVal(["strokeDasharray"], animationDuration, typeof animationEasing === "string" ? animationEasing : defaultRectangleProps.animationEasing);
    return /* @__PURE__ */ React6.createElement(JavascriptAnimate, {
      animationId,
      key: animationId,
      canBegin: totalLength > 0,
      duration: animationDuration,
      easing: animationEasing,
      isActive: isUpdateAnimationActive,
      begin: animationBegin
    }, (animationElapsedTime) => {
      var currWidth = interpolate(prevWidth, width, animationElapsedTime);
      var currHeight = interpolate(prevHeight, height, animationElapsedTime);
      var currX = interpolate(prevX, x, animationElapsedTime);
      var currY = interpolate(prevY, y, animationElapsedTime);
      if (pathRef.current) {
        prevWidthRef.current = currWidth;
        prevHeightRef.current = currHeight;
        prevXRef.current = currX;
        prevYRef.current = currY;
      }
      var animationStyle;
      if (!isAnimationActive) {
        animationStyle = {
          strokeDasharray: to2
        };
      } else if (animationElapsedTime > 0) {
        animationStyle = {
          transition,
          strokeDasharray: to2
        };
      } else {
        animationStyle = {
          strokeDasharray: from2
        };
      }
      var _svgPropertiesAndEven2 = svgPropertiesAndEvents(props), _2 = _svgPropertiesAndEven2.radius, otherPathProps2 = _objectWithoutProperties3(_svgPropertiesAndEven2, _excluded22);
      return /* @__PURE__ */ React6.createElement("path", _extends3({}, otherPathProps2, {
        radius: typeof radius === "number" ? radius : void 0,
        className: layerClass,
        d: getRectanglePath(currX, currY, currWidth, currHeight, radius),
        ref: pathRef,
        style: _objectSpread4(_objectSpread4({}, animationStyle), props.style)
      }));
    });
  };

  // node_modules/recharts/es6/util/PolarUtils.js
  init_define_import_meta_env();
  function ownKeys5(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread5(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys5(Object(t), true).forEach(function(r3) {
        _defineProperty6(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys5(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty6(e, r2, t) {
    return (r2 = _toPropertyKey6(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey6(t) {
    var i = _toPrimitive6(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive6(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var RADIAN = Math.PI / 180;
  var radianToDegree = (angleInRadian) => angleInRadian * 180 / Math.PI;
  var polarToCartesian = (cx, cy, radius, angle) => ({
    x: cx + Math.cos(-RADIAN * angle) * radius,
    y: cy + Math.sin(-RADIAN * angle) * radius
  });
  var getMaxRadius = function getMaxRadius2(width, height) {
    var offset = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: 0,
      height: 0,
      brushBottom: 0
    };
    return Math.min(Math.abs(width - (offset.left || 0) - (offset.right || 0)), Math.abs(height - (offset.top || 0) - (offset.bottom || 0))) / 2;
  };
  var distanceBetweenPoints = (point2, anotherPoint) => {
    var x1 = point2.x, y1 = point2.y;
    var x2 = anotherPoint.x, y2 = anotherPoint.y;
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  };
  var getAngleOfPoint = (_ref2, _ref22) => {
    var x = _ref2.x, y = _ref2.y;
    var cx = _ref22.cx, cy = _ref22.cy;
    var radius = distanceBetweenPoints({
      x,
      y
    }, {
      x: cx,
      y: cy
    });
    if (radius <= 0) {
      return {
        radius,
        angle: 0
      };
    }
    var cos = (x - cx) / radius;
    var angleInRadian = Math.acos(cos);
    if (y > cy) {
      angleInRadian = 2 * Math.PI - angleInRadian;
    }
    return {
      radius,
      angle: radianToDegree(angleInRadian),
      angleInRadian
    };
  };
  var formatAngleOfSector = (_ref3) => {
    var startAngle = _ref3.startAngle, endAngle = _ref3.endAngle;
    var startCnt = Math.floor(startAngle / 360);
    var endCnt = Math.floor(endAngle / 360);
    var min2 = Math.min(startCnt, endCnt);
    return {
      startAngle: startAngle - min2 * 360,
      endAngle: endAngle - min2 * 360
    };
  };
  var reverseFormatAngleOfSector = (angle, _ref4) => {
    var startAngle = _ref4.startAngle, endAngle = _ref4.endAngle;
    var startCnt = Math.floor(startAngle / 360);
    var endCnt = Math.floor(endAngle / 360);
    var min2 = Math.min(startCnt, endCnt);
    return angle + min2 * 360;
  };
  var inRangeOfSector = (_ref5, viewBox) => {
    var x = _ref5.relativeX, y = _ref5.relativeY;
    var _getAngleOfPoint = getAngleOfPoint({
      x,
      y
    }, viewBox), radius = _getAngleOfPoint.radius, angle = _getAngleOfPoint.angle;
    var innerRadius = viewBox.innerRadius, outerRadius = viewBox.outerRadius;
    if (radius < innerRadius || radius > outerRadius) {
      return null;
    }
    if (radius === 0) {
      return null;
    }
    var _formatAngleOfSector = formatAngleOfSector(viewBox), startAngle = _formatAngleOfSector.startAngle, endAngle = _formatAngleOfSector.endAngle;
    var formatAngle = angle;
    var inRange;
    if (startAngle <= endAngle) {
      while (formatAngle > endAngle) {
        formatAngle -= 360;
      }
      while (formatAngle < startAngle) {
        formatAngle += 360;
      }
      inRange = formatAngle >= startAngle && formatAngle <= endAngle;
    } else {
      while (formatAngle > startAngle) {
        formatAngle -= 360;
      }
      while (formatAngle < endAngle) {
        formatAngle += 360;
      }
      inRange = formatAngle >= endAngle && formatAngle <= startAngle;
    }
    if (inRange) {
      return _objectSpread5(_objectSpread5({}, viewBox), {}, {
        radius,
        angle: reverseFormatAngleOfSector(formatAngle, viewBox)
      });
    }
    return null;
  };

  // node_modules/recharts/es6/state/selectors/axisSelectors.js
  init_define_import_meta_env();

  // node_modules/es-toolkit/compat/range.mjs
  init_define_import_meta_env();

  // node_modules/es-toolkit/dist/compat/math/range.mjs
  init_define_import_meta_env();

  // node_modules/es-toolkit/dist/compat/util/toFinite.mjs
  init_define_import_meta_env();

  // node_modules/es-toolkit/dist/compat/util/toNumber.mjs
  init_define_import_meta_env();
  function toNumber(value) {
    if (isSymbol(value)) return NaN;
    return Number(value);
  }

  // node_modules/es-toolkit/dist/compat/util/toFinite.mjs
  function toFinite(value) {
    if (!value) return value === 0 ? value : 0;
    value = toNumber(value);
    if (value === Infinity || value === -Infinity) return (value < 0 ? -1 : 1) * Number.MAX_VALUE;
    return value === value ? value : 0;
  }

  // node_modules/es-toolkit/dist/compat/math/range.mjs
  function range(start, end, step) {
    if (step && typeof step !== "number" && isIterateeCall(start, end, step)) end = step = void 0;
    start = toFinite(start);
    if (end === void 0) {
      end = start;
      start = 0;
    } else end = toFinite(end);
    step = step === void 0 ? start < end ? 1 : -1 : toFinite(step);
    const length = Math.max(Math.ceil((end - start) / (step || 1)), 0);
    const result = new Array(length);
    for (let index = 0; index < length; index++) {
      result[index] = start;
      start += step;
    }
    return result;
  }

  // node_modules/recharts/es6/state/selectors/dataSelectors.js
  init_define_import_meta_env();
  var selectChartDataWithIndexes = (state) => state.chartData;
  var selectChartDataAndAlwaysIgnoreIndexes = createSelector([selectChartDataWithIndexes], (dataState) => {
    var dataEndIndex = dataState.chartData != null ? dataState.chartData.length - 1 : 0;
    return {
      chartData: dataState.chartData,
      computedData: dataState.computedData,
      dataEndIndex,
      dataStartIndex: 0
    };
  });
  var selectChartDataWithIndexesIfNotInPanoramaPosition4 = (state, _unused1, _unused2, isPanorama) => {
    if (isPanorama) {
      return selectChartDataAndAlwaysIgnoreIndexes(state);
    }
    return selectChartDataWithIndexes(state);
  };
  var selectChartDataWithIndexesIfNotInPanoramaPosition3 = (state, _unused1, isPanorama) => {
    if (isPanorama) {
      return selectChartDataAndAlwaysIgnoreIndexes(state);
    }
    return selectChartDataWithIndexes(state);
  };
  var selectChartDataSliceIfNotInPanorama = createSelector([selectChartDataWithIndexesIfNotInPanoramaPosition4], (_ref2) => {
    var chartData = _ref2.chartData, dataStartIndex = _ref2.dataStartIndex, dataEndIndex = _ref2.dataEndIndex;
    return chartData != null ? chartData.slice(dataStartIndex, dataEndIndex + 1) : [];
  });
  var selectChartDataSliceIgnoringIndexes = createSelector([selectChartDataAndAlwaysIgnoreIndexes], (_ref2) => {
    var chartData = _ref2.chartData, dataStartIndex = _ref2.dataStartIndex, dataEndIndex = _ref2.dataEndIndex;
    return chartData != null ? chartData.slice(dataStartIndex, dataEndIndex + 1) : [];
  });
  var selectChartDataSliceWithIndexes = createSelector([selectChartDataWithIndexes], (_ref3) => {
    var chartData = _ref3.chartData, dataStartIndex = _ref3.dataStartIndex, dataEndIndex = _ref3.dataEndIndex;
    return chartData != null ? chartData.slice(dataStartIndex, dataEndIndex + 1) : [];
  });

  // node_modules/recharts/es6/util/isDomainSpecifiedByUser.js
  init_define_import_meta_env();
  function _slicedToArray4(r2, e) {
    return _arrayWithHoles4(r2) || _iterableToArrayLimit4(r2, e) || _unsupportedIterableToArray4(r2, e) || _nonIterableRest4();
  }
  function _nonIterableRest4() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray4(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray4(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray4(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray4(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit4(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles4(r2) {
    if (Array.isArray(r2)) return r2;
  }
  function isWellFormedNumberDomain(v) {
    if (Array.isArray(v) && v.length === 2) {
      var _v = _slicedToArray4(v, 2), min2 = _v[0], max2 = _v[1];
      if (isWellBehavedNumber(min2) && isWellBehavedNumber(max2)) {
        return true;
      }
    }
    return false;
  }
  function extendDomain(providedDomain, boundaryDomain, allowDataOverflow) {
    if (allowDataOverflow) {
      return providedDomain;
    }
    return [Math.min(providedDomain[0], boundaryDomain[0]), Math.max(providedDomain[1], boundaryDomain[1])];
  }
  function numericalDomainSpecifiedWithoutRequiringData(userDomain, allowDataOverflow) {
    if (!allowDataOverflow) {
      return void 0;
    }
    if (typeof userDomain === "function") {
      return void 0;
    }
    if (Array.isArray(userDomain) && userDomain.length === 2) {
      var _userDomain = _slicedToArray4(userDomain, 2), providedMin = _userDomain[0], providedMax = _userDomain[1];
      var finalMin, finalMax;
      if (isWellBehavedNumber(providedMin)) {
        finalMin = providedMin;
      } else if (typeof providedMin === "function") {
        return void 0;
      }
      if (isWellBehavedNumber(providedMax)) {
        finalMax = providedMax;
      } else if (typeof providedMax === "function") {
        return void 0;
      }
      var candidate = [finalMin, finalMax];
      if (isWellFormedNumberDomain(candidate)) {
        return candidate;
      }
    }
    return void 0;
  }
  function parseNumericalUserDomain(userDomain, dataDomain, allowDataOverflow) {
    if (!allowDataOverflow && dataDomain == null) {
      return void 0;
    }
    if (typeof userDomain === "function" && dataDomain != null) {
      try {
        var result = userDomain(dataDomain, allowDataOverflow);
        if (isWellFormedNumberDomain(result)) {
          return extendDomain(result, dataDomain, allowDataOverflow);
        }
      } catch (_unused) {
      }
    }
    if (Array.isArray(userDomain) && userDomain.length === 2) {
      var _userDomain2 = _slicedToArray4(userDomain, 2), providedMin = _userDomain2[0], providedMax = _userDomain2[1];
      var finalMin, finalMax;
      if (providedMin === "auto") {
        if (dataDomain != null) {
          finalMin = Math.min(...dataDomain);
        }
      } else if (isNumber(providedMin)) {
        finalMin = providedMin;
      } else if (typeof providedMin === "function") {
        try {
          if (dataDomain != null) {
            finalMin = providedMin(dataDomain === null || dataDomain === void 0 ? void 0 : dataDomain[0]);
          }
        } catch (_unused2) {
        }
      } else if (typeof providedMin === "string" && MIN_VALUE_REG.test(providedMin)) {
        var match = MIN_VALUE_REG.exec(providedMin);
        if (match == null || match[1] == null || dataDomain == null) {
          finalMin = void 0;
        } else {
          var value = +match[1];
          finalMin = dataDomain[0] - value;
        }
      } else {
        finalMin = dataDomain === null || dataDomain === void 0 ? void 0 : dataDomain[0];
      }
      if (providedMax === "auto") {
        if (dataDomain != null) {
          finalMax = Math.max(...dataDomain);
        }
      } else if (isNumber(providedMax)) {
        finalMax = providedMax;
      } else if (typeof providedMax === "function") {
        try {
          if (dataDomain != null) {
            finalMax = providedMax(dataDomain === null || dataDomain === void 0 ? void 0 : dataDomain[1]);
          }
        } catch (_unused3) {
        }
      } else if (typeof providedMax === "string" && MAX_VALUE_REG.test(providedMax)) {
        var _match = MAX_VALUE_REG.exec(providedMax);
        if (_match == null || _match[1] == null || dataDomain == null) {
          finalMax = void 0;
        } else {
          var _value = +_match[1];
          finalMax = dataDomain[1] + _value;
        }
      } else {
        finalMax = dataDomain === null || dataDomain === void 0 ? void 0 : dataDomain[1];
      }
      var candidate = [finalMin, finalMax];
      if (isWellFormedNumberDomain(candidate)) {
        if (dataDomain == null) {
          return candidate;
        }
        return extendDomain(candidate, dataDomain, allowDataOverflow);
      }
    }
    return void 0;
  }

  // node_modules/recharts/es6/util/scale/index.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/util/scale/getNiceTickValues.js
  init_define_import_meta_env();
  var import_decimal2 = __toESM(require_decimal());

  // node_modules/recharts/es6/util/scale/util/arithmetic.js
  init_define_import_meta_env();
  var import_decimal = __toESM(require_decimal());
  function getDigitCount(value) {
    var result;
    if (value === 0) {
      result = 1;
    } else {
      result = Math.floor(new import_decimal.default(value).abs().log(10).toNumber()) + 1;
    }
    return result;
  }
  function rangeStep(start, end, step) {
    var num = new import_decimal.default(start);
    var i = 0;
    var result = [];
    while (num.lt(end) && i < 1e5) {
      result.push(num.toNumber());
      num = num.add(step);
      i++;
    }
    return result;
  }

  // node_modules/recharts/es6/util/scale/getNiceTickValues.js
  function _slicedToArray5(r2, e) {
    return _arrayWithHoles5(r2) || _iterableToArrayLimit5(r2, e) || _unsupportedIterableToArray5(r2, e) || _nonIterableRest5();
  }
  function _nonIterableRest5() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray5(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray5(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray5(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray5(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit5(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles5(r2) {
    if (Array.isArray(r2)) return r2;
  }
  var getValidInterval = (_ref2) => {
    var _ref22 = _slicedToArray5(_ref2, 2), min2 = _ref22[0], max2 = _ref22[1];
    var validMin = min2, validMax = max2;
    if (min2 > max2) {
      validMin = max2;
      validMax = min2;
    }
    return [validMin, validMax];
  };
  var getAdaptiveStep = (roughStep, allowDecimals, correctionFactor) => {
    if (roughStep.lte(0)) {
      return new import_decimal2.default(0);
    }
    var digitCount = getDigitCount(roughStep.toNumber());
    var digitCountValue = new import_decimal2.default(10).pow(digitCount);
    var stepRatio = roughStep.div(digitCountValue);
    var stepRatioScale = digitCount !== 1 ? 0.05 : 0.1;
    var amendStepRatio = new import_decimal2.default(Math.ceil(stepRatio.div(stepRatioScale).toNumber())).add(correctionFactor).mul(stepRatioScale);
    var formatStep = amendStepRatio.mul(digitCountValue);
    return allowDecimals ? new import_decimal2.default(formatStep.toNumber()) : new import_decimal2.default(Math.ceil(formatStep.toNumber()));
  };
  var getSnap125Step = (roughStep, allowDecimals, correctionFactor) => {
    var _NICE_STEPS$niceIdx;
    if (roughStep.lte(0)) {
      return new import_decimal2.default(0);
    }
    var NICE_STEPS = [1, 2, 2.5, 5];
    var roughNum = roughStep.toNumber();
    var exponent = Math.floor(new import_decimal2.default(roughNum).abs().log(10).toNumber());
    var magnitude = new import_decimal2.default(10).pow(exponent);
    var normalized = roughStep.div(magnitude).toNumber();
    var niceIdx = NICE_STEPS.findIndex((s) => s >= normalized - 1e-10);
    if (niceIdx === -1) {
      magnitude = magnitude.mul(10);
      niceIdx = 0;
    }
    niceIdx += correctionFactor;
    if (niceIdx >= NICE_STEPS.length) {
      var extraMag = Math.floor(niceIdx / NICE_STEPS.length);
      niceIdx %= NICE_STEPS.length;
      magnitude = magnitude.mul(new import_decimal2.default(10).pow(extraMag));
    }
    var niceStep = (_NICE_STEPS$niceIdx = NICE_STEPS[niceIdx]) !== null && _NICE_STEPS$niceIdx !== void 0 ? _NICE_STEPS$niceIdx : 1;
    var formatStep = new import_decimal2.default(niceStep).mul(magnitude);
    return allowDecimals ? formatStep : new import_decimal2.default(Math.ceil(formatStep.toNumber()));
  };
  var getTickOfSingleValue = (value, tickCount, allowDecimals) => {
    var step = new import_decimal2.default(1);
    var middle = new import_decimal2.default(value);
    if (!middle.isint() && allowDecimals) {
      var absVal = Math.abs(value);
      if (absVal < 1) {
        step = new import_decimal2.default(10).pow(getDigitCount(value) - 1);
        middle = new import_decimal2.default(Math.floor(middle.div(step).toNumber())).mul(step);
      } else if (absVal > 1) {
        middle = new import_decimal2.default(Math.floor(value));
      }
    } else if (value === 0) {
      middle = new import_decimal2.default(Math.floor((tickCount - 1) / 2));
    } else if (!allowDecimals) {
      middle = new import_decimal2.default(Math.floor(value));
    }
    var middleIndex = Math.floor((tickCount - 1) / 2);
    var ticks2 = [];
    for (var i = 0; i < tickCount; i++) {
      ticks2.push(middle.add(new import_decimal2.default(i - middleIndex).mul(step)).toNumber());
    }
    return ticks2;
  };
  var _calculateStep = function calculateStep(min2, max2, tickCount, allowDecimals) {
    var correctionFactor = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0;
    var stepFn = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : getAdaptiveStep;
    if (!Number.isFinite((max2 - min2) / (tickCount - 1))) {
      return {
        step: new import_decimal2.default(0),
        tickMin: new import_decimal2.default(0),
        tickMax: new import_decimal2.default(0)
      };
    }
    var step = stepFn(new import_decimal2.default(max2).sub(min2).div(tickCount - 1), allowDecimals, correctionFactor);
    var middle;
    if (min2 <= 0 && max2 >= 0) {
      middle = new import_decimal2.default(0);
    } else {
      middle = new import_decimal2.default(min2).add(max2).div(2);
      middle = middle.sub(new import_decimal2.default(middle).mod(step));
    }
    var belowCount = Math.ceil(middle.sub(min2).div(step).toNumber());
    var upCount = Math.ceil(new import_decimal2.default(max2).sub(middle).div(step).toNumber());
    var scaleCount = belowCount + upCount + 1;
    if (scaleCount > tickCount) {
      return _calculateStep(min2, max2, tickCount, allowDecimals, correctionFactor + 1, stepFn);
    }
    if (scaleCount < tickCount) {
      upCount = max2 > 0 ? upCount + (tickCount - scaleCount) : upCount;
      belowCount = max2 > 0 ? belowCount : belowCount + (tickCount - scaleCount);
    }
    return {
      step,
      tickMin: middle.sub(new import_decimal2.default(belowCount).mul(step)),
      tickMax: middle.add(new import_decimal2.default(upCount).mul(step))
    };
  };
  var getNiceTickValues = function getNiceTickValues2(_ref3) {
    var _ref4 = _slicedToArray5(_ref3, 2), min2 = _ref4[0], max2 = _ref4[1];
    var tickCount = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 6;
    var allowDecimals = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
    var niceTicksMode = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "auto";
    var count = Math.max(tickCount, 2);
    var _getValidInterval = getValidInterval([min2, max2]), _getValidInterval2 = _slicedToArray5(_getValidInterval, 2), cormin = _getValidInterval2[0], cormax = _getValidInterval2[1];
    if (cormin === -Infinity || cormax === Infinity) {
      var _values = cormax === Infinity ? [cormin, ...Array(tickCount - 1).fill(Infinity)] : [...Array(tickCount - 1).fill(-Infinity), cormax];
      return min2 > max2 ? _values.reverse() : _values;
    }
    if (cormin === cormax) {
      return getTickOfSingleValue(cormin, tickCount, allowDecimals);
    }
    var stepFn = niceTicksMode === "snap125" ? getSnap125Step : getAdaptiveStep;
    var _calculateStep2 = _calculateStep(cormin, cormax, count, allowDecimals, 0, stepFn), step = _calculateStep2.step, tickMin = _calculateStep2.tickMin, tickMax = _calculateStep2.tickMax;
    var values = rangeStep(tickMin, tickMax.add(new import_decimal2.default(0.1).mul(step)), step);
    return min2 > max2 ? values.reverse() : values;
  };
  var getTickValuesFixedDomain = function getTickValuesFixedDomain2(_ref5, tickCount) {
    var _ref6 = _slicedToArray5(_ref5, 2), min2 = _ref6[0], max2 = _ref6[1];
    var allowDecimals = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
    var niceTicksMode = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "auto";
    var _getValidInterval3 = getValidInterval([min2, max2]), _getValidInterval4 = _slicedToArray5(_getValidInterval3, 2), cormin = _getValidInterval4[0], cormax = _getValidInterval4[1];
    if (cormin === -Infinity || cormax === Infinity) {
      return [min2, max2];
    }
    if (cormin === cormax) {
      return [cormin];
    }
    var stepFn = niceTicksMode === "snap125" ? getSnap125Step : getAdaptiveStep;
    var count = Math.max(tickCount, 2);
    var step = stepFn(new import_decimal2.default(cormax).sub(cormin).div(count - 1), allowDecimals, 0);
    var values = [...rangeStep(new import_decimal2.default(cormin), new import_decimal2.default(cormax), step), cormax];
    if (allowDecimals === false) {
      values = values.map((value) => Math.round(value));
      var last = values.length - 1;
      if (last > 0 && values[last] === values[last - 1]) {
        values = values.slice(0, last);
      }
    }
    return min2 > max2 ? values.reverse() : values;
  };

  // node_modules/recharts/es6/state/selectors/rootPropsSelectors.js
  init_define_import_meta_env();
  var selectRootMaxBarSize = (state) => state.rootProps.maxBarSize;
  var selectBarGap = (state) => state.rootProps.barGap;
  var selectBarCategoryGap = (state) => state.rootProps.barCategoryGap;
  var selectRootBarSize = (state) => state.rootProps.barSize;
  var selectStackOffsetType = (state) => state.rootProps.stackOffset;
  var selectReverseStackOrder = (state) => state.rootProps.reverseStackOrder;
  var selectChartName = (state) => state.options.chartName;
  var selectSyncId = (state) => state.rootProps.syncId;
  var selectSyncMethod = (state) => state.rootProps.syncMethod;
  var selectEventEmitter = (state) => state.options.eventEmitter;

  // node_modules/recharts/es6/state/selectors/polarAxisSelectors.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/polar/defaultPolarAngleAxisProps.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/zIndex/DefaultZIndexes.js
  init_define_import_meta_env();
  var DefaultZIndexes = {
    /**
     * CartesianGrid and PolarGrid
     */
    grid: -100,
    /**
     * Background of Bar and RadialBar.
     * This is not visible by default but can be enabled by setting background={true} on Bar or RadialBar.
     */
    barBackground: -50,
    /*
     * other chart elements or custom elements without specific zIndex
     * render in here, at zIndex 0
     */
    /**
     * Area, Pie, Radar, and ReferenceArea
     */
    area: 100,
    /**
     * Cursor is embedded inside Tooltip and controlled by it.
     * The Tooltip itself has a separate portal and is not included in the zIndex system;
     * Cursor is the decoration inside the chart area. CursorRectangle is a rectangle box.
     * It renders below bar so that in a stacked bar chart the cursor rectangle does not hide the other bars.
     */
    cursorRectangle: 200,
    /**
     * Bar and RadialBar
     */
    bar: 300,
    /**
     * Line and ReferenceLine, and ErrorBor
     */
    line: 400,
    /**
     * XAxis and YAxis and PolarAngleAxis and PolarRadiusAxis ticks and lines and children
     */
    axis: 500,
    /**
     * Scatter and ReferenceDot,
     * and Dots of Line and Area and Radar if they have dot=true
     */
    scatter: 600,
    /**
     * Hovering over a Bar or RadialBar renders a highlight rectangle
     */
    activeBar: 1e3,
    /**
     * Cursor is embedded inside Tooltip and controlled by it.
     * The Tooltip itself has a separate portal and is not included in the zIndex system;
     * Cursor is the decoration inside the chart area, usually a cross or a box.
     * CursorLine is a line cursor rendered in Line, Area, Scatter, Radar charts.
     * It renders above the Line and Scatter so that it is always visible.
     * It renders below active dot so that the dot is always visible and shows the current point.
     * We're also assuming that the active dot is small enough that it does not fully cover the cursor line.
     *
     * This also applies to the radial cursor in RadialBarChart.
     */
    cursorLine: 1100,
    /**
     * Hovering over a Point in Line, Area, Scatter, Radar renders a highlight dot
     */
    activeDot: 1200,
    /**
     * LabelList and Label, including Axis labels
     */
    label: 2e3
  };

  // node_modules/recharts/es6/polar/defaultPolarAngleAxisProps.js
  var defaultPolarAngleAxisProps = {
    allowDecimals: false,
    allowDuplicatedCategory: true,
    // if I set this to false then Tooltip synchronisation stops working in Radar, wtf
    allowDataOverflow: false,
    angle: 0,
    angleAxisId: 0,
    axisLine: true,
    axisLineType: "polygon",
    cx: 0,
    cy: 0,
    hide: false,
    includeHidden: false,
    label: false,
    niceTicks: "auto",
    orientation: "outer",
    reversed: false,
    scale: "auto",
    tick: true,
    tickLine: true,
    tickSize: 8,
    type: "auto",
    zIndex: DefaultZIndexes.axis
  };

  // node_modules/recharts/es6/polar/defaultPolarRadiusAxisProps.js
  init_define_import_meta_env();
  var defaultPolarRadiusAxisProps = {
    allowDataOverflow: false,
    allowDecimals: false,
    allowDuplicatedCategory: true,
    angle: 0,
    axisLine: true,
    includeHidden: false,
    hide: false,
    niceTicks: "auto",
    label: false,
    orientation: "right",
    radiusAxisId: 0,
    reversed: false,
    scale: "auto",
    stroke: "#ccc",
    tick: true,
    tickCount: 5,
    tickLine: true,
    type: "auto",
    zIndex: DefaultZIndexes.axis
  };

  // node_modules/recharts/es6/state/selectors/combiners/combineAxisRangeWithReverse.js
  init_define_import_meta_env();
  var combineAxisRangeWithReverse = (axisSettings, axisRange) => {
    if (!axisSettings || !axisRange) {
      return void 0;
    }
    if (axisSettings !== null && axisSettings !== void 0 && axisSettings.reversed) {
      return [axisRange[1], axisRange[0]];
    }
    return axisRange;
  };

  // node_modules/recharts/es6/util/getAxisTypeBasedOnLayout.js
  init_define_import_meta_env();
  function getAxisTypeBasedOnLayout(layout, axisType, axisDomainType) {
    if (axisDomainType !== "auto") {
      return axisDomainType;
    }
    if (layout == null) {
      return void 0;
    }
    return isCategoricalAxis(layout, axisType) ? "category" : "number";
  }

  // node_modules/recharts/es6/state/selectors/polarAxisSelectors.js
  function ownKeys6(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread6(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys6(Object(t), true).forEach(function(r3) {
        _defineProperty7(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys6(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty7(e, r2, t) {
    return (r2 = _toPropertyKey7(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey7(t) {
    var i = _toPrimitive7(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive7(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var implicitAngleAxis = {
    allowDataOverflow: defaultPolarAngleAxisProps.allowDataOverflow,
    allowDecimals: defaultPolarAngleAxisProps.allowDecimals,
    allowDuplicatedCategory: false,
    // defaultPolarAngleAxisProps.allowDuplicatedCategory has it set to true but the actual axis rendering ignores the prop because reasons,
    dataKey: void 0,
    domain: void 0,
    id: defaultPolarAngleAxisProps.angleAxisId,
    includeHidden: false,
    name: void 0,
    reversed: defaultPolarAngleAxisProps.reversed,
    scale: defaultPolarAngleAxisProps.scale,
    tick: defaultPolarAngleAxisProps.tick,
    tickCount: void 0,
    ticks: void 0,
    type: defaultPolarAngleAxisProps.type,
    unit: void 0,
    niceTicks: "auto"
  };
  var implicitRadiusAxis = {
    allowDataOverflow: defaultPolarRadiusAxisProps.allowDataOverflow,
    allowDecimals: defaultPolarRadiusAxisProps.allowDecimals,
    allowDuplicatedCategory: defaultPolarRadiusAxisProps.allowDuplicatedCategory,
    dataKey: void 0,
    domain: void 0,
    id: defaultPolarRadiusAxisProps.radiusAxisId,
    includeHidden: defaultPolarRadiusAxisProps.includeHidden,
    name: void 0,
    reversed: defaultPolarRadiusAxisProps.reversed,
    scale: defaultPolarRadiusAxisProps.scale,
    tick: defaultPolarRadiusAxisProps.tick,
    tickCount: defaultPolarRadiusAxisProps.tickCount,
    ticks: void 0,
    type: defaultPolarRadiusAxisProps.type,
    unit: void 0,
    niceTicks: "auto"
  };
  var selectAngleAxisNoDefaults = (state, angleAxisId) => {
    if (angleAxisId == null) {
      return void 0;
    }
    return state.polarAxis.angleAxis[angleAxisId];
  };
  var selectAngleAxis = createSelector([selectAngleAxisNoDefaults, selectPolarChartLayout], (angleAxisSettings, layout) => {
    var _getAxisTypeBasedOnLa;
    if (angleAxisSettings != null) {
      return angleAxisSettings;
    }
    var evaluatedType = (_getAxisTypeBasedOnLa = getAxisTypeBasedOnLayout(layout, "angleAxis", implicitAngleAxis.type)) !== null && _getAxisTypeBasedOnLa !== void 0 ? _getAxisTypeBasedOnLa : "category";
    return _objectSpread6(_objectSpread6({}, implicitAngleAxis), {}, {
      type: evaluatedType
    });
  });
  var selectRadiusAxisNoDefaults = (state, radiusAxisId) => {
    return state.polarAxis.radiusAxis[radiusAxisId];
  };
  var selectRadiusAxis = createSelector([selectRadiusAxisNoDefaults, selectPolarChartLayout], (radiusAxisSettings, layout) => {
    var _getAxisTypeBasedOnLa2;
    if (radiusAxisSettings != null) {
      return radiusAxisSettings;
    }
    var evaluatedType = (_getAxisTypeBasedOnLa2 = getAxisTypeBasedOnLayout(layout, "radiusAxis", implicitRadiusAxis.type)) !== null && _getAxisTypeBasedOnLa2 !== void 0 ? _getAxisTypeBasedOnLa2 : "category";
    return _objectSpread6(_objectSpread6({}, implicitRadiusAxis), {}, {
      type: evaluatedType
    });
  });
  var selectPolarOptions = (state) => state.polarOptions;
  var selectMaxRadius = createSelector([selectChartWidth, selectChartHeight, selectChartOffsetInternal], getMaxRadius);
  var selectInnerRadius = createSelector([selectPolarOptions, selectMaxRadius], (polarChartOptions, maxRadius) => {
    if (polarChartOptions == null) {
      return void 0;
    }
    return getPercentValue(polarChartOptions.innerRadius, maxRadius, 0);
  });
  var selectOuterRadius = createSelector([selectPolarOptions, selectMaxRadius], (polarChartOptions, maxRadius) => {
    if (polarChartOptions == null) {
      return void 0;
    }
    return getPercentValue(polarChartOptions.outerRadius, maxRadius, maxRadius * 0.8);
  });
  var combineAngleAxisRange = (polarOptions) => {
    if (polarOptions == null) {
      return [0, 0];
    }
    var startAngle = polarOptions.startAngle, endAngle = polarOptions.endAngle;
    return [startAngle, endAngle];
  };
  var selectAngleAxisRange = createSelector([selectPolarOptions], combineAngleAxisRange);
  var selectAngleAxisRangeWithReversed = createSelector([selectAngleAxis, selectAngleAxisRange], combineAxisRangeWithReverse);
  var selectRadiusAxisRange = createSelector([selectMaxRadius, selectInnerRadius, selectOuterRadius], (maxRadius, innerRadius, outerRadius) => {
    if (maxRadius == null || innerRadius == null || outerRadius == null) {
      return void 0;
    }
    return [innerRadius, outerRadius];
  });
  var selectRadiusAxisRangeWithReversed = createSelector([selectRadiusAxis, selectRadiusAxisRange], combineAxisRangeWithReverse);
  var selectPolarViewBox = createSelector([selectChartLayout, selectPolarOptions, selectInnerRadius, selectOuterRadius, selectChartWidth, selectChartHeight], (layout, polarOptions, innerRadius, outerRadius, width, height) => {
    if (layout !== "centric" && layout !== "radial" || polarOptions == null || innerRadius == null || outerRadius == null) {
      return void 0;
    }
    var cx = polarOptions.cx, cy = polarOptions.cy, startAngle = polarOptions.startAngle, endAngle = polarOptions.endAngle;
    return {
      cx: getPercentValue(cx, width, width / 2),
      cy: getPercentValue(cy, height, height / 2),
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      clockWise: false
      // this property look useful, why not use it?
    };
  });

  // node_modules/recharts/es6/state/selectors/pickAxisType.js
  init_define_import_meta_env();
  var pickAxisType = (_state, axisType) => axisType;

  // node_modules/recharts/es6/state/selectors/pickAxisId.js
  init_define_import_meta_env();
  var pickAxisId = (_state, _axisType, axisId) => axisId;

  // node_modules/recharts/es6/util/stacks/getStackSeriesIdentifier.js
  init_define_import_meta_env();
  function getStackSeriesIdentifier(graphicalItem) {
    return graphicalItem === null || graphicalItem === void 0 ? void 0 : graphicalItem.id;
  }

  // node_modules/recharts/es6/state/selectors/combiners/combineDisplayedStackedData.js
  init_define_import_meta_env();
  function combineDisplayedStackedData(stackedGraphicalItems, _ref2, tooltipAxisSettings) {
    var _ref$chartData = _ref2.chartData, chartData = _ref$chartData === void 0 ? [] : _ref$chartData;
    var allowDuplicatedCategory = tooltipAxisSettings.allowDuplicatedCategory, tooltipDataKey = tooltipAxisSettings.dataKey;
    var knownItemsByDataKey = /* @__PURE__ */ new Map();
    stackedGraphicalItems.forEach((item) => {
      var _item$data;
      var resolvedData = (_item$data = item.data) !== null && _item$data !== void 0 ? _item$data : chartData;
      if (resolvedData == null || resolvedData.length === 0) {
        return;
      }
      var stackIdentifier = getStackSeriesIdentifier(item);
      resolvedData.forEach((entry, index) => {
        var tooltipValue = tooltipDataKey == null || allowDuplicatedCategory ? index : String(getValueByDataKey(entry, tooltipDataKey, null));
        var numericValue = getValueByDataKey(entry, item.dataKey, 0);
        var curr;
        if (knownItemsByDataKey.has(tooltipValue)) {
          curr = knownItemsByDataKey.get(tooltipValue);
        } else {
          curr = {};
        }
        Object.assign(curr, {
          [stackIdentifier]: numericValue
        });
        knownItemsByDataKey.set(tooltipValue, curr);
      });
    });
    return Array.from(knownItemsByDataKey.values());
  }

  // node_modules/recharts/es6/state/types/StackedGraphicalItem.js
  init_define_import_meta_env();
  function isStacked(graphicalItem) {
    return "stackId" in graphicalItem && graphicalItem.stackId != null && graphicalItem.dataKey != null;
  }

  // node_modules/recharts/es6/state/selectors/numberDomainEqualityCheck.js
  init_define_import_meta_env();
  var numberDomainEqualityCheck = (a, b) => {
    if (a === b) {
      return true;
    }
    if (a == null || b == null) {
      return false;
    }
    return a[0] === b[0] && a[1] === b[1];
  };

  // node_modules/recharts/es6/state/selectors/arrayEqualityCheck.js
  init_define_import_meta_env();
  function emptyArraysAreEqualCheck(a, b) {
    if (Array.isArray(a) && Array.isArray(b) && a.length === 0 && b.length === 0) {
      return true;
    }
    return a === b;
  }
  function arrayContentsAreEqualCheck(a, b) {
    if (a.length === b.length) {
      for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  // node_modules/recharts/es6/state/selectors/selectTooltipAxisType.js
  init_define_import_meta_env();
  var selectTooltipAxisType = (state) => {
    var layout = selectChartLayout(state);
    if (layout === "horizontal") {
      return "xAxis";
    }
    if (layout === "vertical") {
      return "yAxis";
    }
    if (layout === "centric") {
      return "angleAxis";
    }
    return "radiusAxis";
  };

  // node_modules/recharts/es6/state/selectors/selectTooltipAxisId.js
  init_define_import_meta_env();
  var selectTooltipAxisId = (state) => state.tooltip.settings.axisId;

  // node_modules/recharts/es6/util/scale/RechartsScale.js
  init_define_import_meta_env();
  function rechartsScaleFactory(d3Scale) {
    if (d3Scale == null) {
      return void 0;
    }
    var ticksFn = d3Scale.ticks;
    var bandwidthFn = d3Scale.bandwidth;
    var d3Range = d3Scale.range();
    var range3 = [Math.min(...d3Range), Math.max(...d3Range)];
    return {
      domain: () => d3Scale.domain(),
      range: (function(_range) {
        function range4() {
          return _range.apply(this, arguments);
        }
        range4.toString = function() {
          return _range.toString();
        };
        return range4;
      })(() => range3),
      rangeMin: () => range3[0],
      rangeMax: () => range3[1],
      isInRange(value) {
        var first = range3[0];
        var last = range3[1];
        return first <= last ? value >= first && value <= last : value >= last && value <= first;
      },
      bandwidth: bandwidthFn ? () => bandwidthFn.call(d3Scale) : void 0,
      ticks: ticksFn ? (count) => ticksFn.call(d3Scale, count) : void 0,
      map: (input, options) => {
        var baseValue = d3Scale(input);
        if (baseValue == null) {
          return void 0;
        }
        if (d3Scale.bandwidth && options !== null && options !== void 0 && options.position) {
          var bandWidth = d3Scale.bandwidth();
          switch (options.position) {
            case "middle":
              baseValue += bandWidth / 2;
              break;
            case "end":
              baseValue += bandWidth;
              break;
            default:
              break;
          }
        }
        return baseValue;
      }
    };
  }

  // node_modules/recharts/es6/state/selectors/combiners/combineCheckedDomain.js
  init_define_import_meta_env();
  var combineCheckedDomain = (realScaleType, axisDomain) => {
    if (axisDomain == null) {
      return void 0;
    }
    switch (realScaleType) {
      case "linear": {
        if (!isWellFormedNumberDomain(axisDomain)) {
          var min2, max2;
          for (var i = 0; i < axisDomain.length; i++) {
            var value = axisDomain[i];
            if (!isWellBehavedNumber(value)) {
              continue;
            }
            if (min2 === void 0 || value < min2) {
              min2 = value;
            }
            if (max2 === void 0 || value > max2) {
              max2 = value;
            }
          }
          if (min2 !== void 0 && max2 !== void 0) {
            return [min2, max2];
          }
          return void 0;
        }
        return axisDomain;
      }
      default:
        return axisDomain;
    }
  };

  // node_modules/recharts/es6/state/selectors/combiners/combineConfiguredScale.js
  init_define_import_meta_env();

  // node_modules/victory-vendor/es/d3-scale.js
  var d3_scale_exports = {};
  __export(d3_scale_exports, {
    scaleBand: () => band,
    scaleDiverging: () => diverging,
    scaleDivergingLog: () => divergingLog,
    scaleDivergingPow: () => divergingPow,
    scaleDivergingSqrt: () => divergingSqrt,
    scaleDivergingSymlog: () => divergingSymlog,
    scaleIdentity: () => identity2,
    scaleImplicit: () => implicit,
    scaleLinear: () => linear2,
    scaleLog: () => log,
    scaleOrdinal: () => ordinal,
    scalePoint: () => point,
    scalePow: () => pow,
    scaleQuantile: () => quantile2,
    scaleQuantize: () => quantize,
    scaleRadial: () => radial,
    scaleSequential: () => sequential,
    scaleSequentialLog: () => sequentialLog,
    scaleSequentialPow: () => sequentialPow,
    scaleSequentialQuantile: () => sequentialQuantile,
    scaleSequentialSqrt: () => sequentialSqrt,
    scaleSequentialSymlog: () => sequentialSymlog,
    scaleSqrt: () => sqrt,
    scaleSymlog: () => symlog,
    scaleThreshold: () => threshold,
    scaleTime: () => time,
    scaleUtc: () => utcTime,
    tickFormat: () => tickFormat
  });
  init_define_import_meta_env();

  // node_modules/d3-scale/src/index.js
  init_define_import_meta_env();

  // node_modules/d3-scale/src/band.js
  init_define_import_meta_env();

  // node_modules/d3-array/src/index.js
  init_define_import_meta_env();

  // node_modules/d3-array/src/bisect.js
  init_define_import_meta_env();

  // node_modules/d3-array/src/ascending.js
  init_define_import_meta_env();
  function ascending(a, b) {
    return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  // node_modules/d3-array/src/bisector.js
  init_define_import_meta_env();

  // node_modules/d3-array/src/descending.js
  init_define_import_meta_env();
  function descending(a, b) {
    return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
  }

  // node_modules/d3-array/src/bisector.js
  function bisector(f) {
    let compare1, compare2, delta;
    if (f.length !== 2) {
      compare1 = ascending;
      compare2 = (d, x) => ascending(f(d), x);
      delta = (d, x) => f(d) - x;
    } else {
      compare1 = f === ascending || f === descending ? f : zero;
      compare2 = f;
      delta = f;
    }
    function left(a, x, lo = 0, hi = a.length) {
      if (lo < hi) {
        if (compare1(x, x) !== 0) return hi;
        do {
          const mid = lo + hi >>> 1;
          if (compare2(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        } while (lo < hi);
      }
      return lo;
    }
    function right(a, x, lo = 0, hi = a.length) {
      if (lo < hi) {
        if (compare1(x, x) !== 0) return hi;
        do {
          const mid = lo + hi >>> 1;
          if (compare2(a[mid], x) <= 0) lo = mid + 1;
          else hi = mid;
        } while (lo < hi);
      }
      return lo;
    }
    function center(a, x, lo = 0, hi = a.length) {
      const i = left(a, x, lo, hi - 1);
      return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
    }
    return { left, center, right };
  }
  function zero() {
    return 0;
  }

  // node_modules/d3-array/src/number.js
  init_define_import_meta_env();
  function number(x) {
    return x === null ? NaN : +x;
  }
  function* numbers(values, valueof) {
    if (valueof === void 0) {
      for (let value of values) {
        if (value != null && (value = +value) >= value) {
          yield value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
          yield value;
        }
      }
    }
  }

  // node_modules/d3-array/src/bisect.js
  var ascendingBisect = bisector(ascending);
  var bisectRight = ascendingBisect.right;
  var bisectLeft = ascendingBisect.left;
  var bisectCenter = bisector(number).center;
  var bisect_default = bisectRight;

  // node_modules/internmap/src/index.js
  init_define_import_meta_env();
  var InternMap = class extends Map {
    constructor(entries, key = keyof) {
      super();
      Object.defineProperties(this, { _intern: { value: /* @__PURE__ */ new Map() }, _key: { value: key } });
      if (entries != null) for (const [key2, value] of entries) this.set(key2, value);
    }
    get(key) {
      return super.get(intern_get(this, key));
    }
    has(key) {
      return super.has(intern_get(this, key));
    }
    set(key, value) {
      return super.set(intern_set(this, key), value);
    }
    delete(key) {
      return super.delete(intern_delete(this, key));
    }
  };
  function intern_get({ _intern, _key }, value) {
    const key = _key(value);
    return _intern.has(key) ? _intern.get(key) : value;
  }
  function intern_set({ _intern, _key }, value) {
    const key = _key(value);
    if (_intern.has(key)) return _intern.get(key);
    _intern.set(key, value);
    return value;
  }
  function intern_delete({ _intern, _key }, value) {
    const key = _key(value);
    if (_intern.has(key)) {
      value = _intern.get(key);
      _intern.delete(key);
    }
    return value;
  }
  function keyof(value) {
    return value !== null && typeof value === "object" ? value.valueOf() : value;
  }

  // node_modules/d3-array/src/sort.js
  init_define_import_meta_env();
  function compareDefined(compare = ascending) {
    if (compare === ascending) return ascendingDefined;
    if (typeof compare !== "function") throw new TypeError("compare is not a function");
    return (a, b) => {
      const x = compare(a, b);
      if (x || x === 0) return x;
      return (compare(b, b) === 0) - (compare(a, a) === 0);
    };
  }
  function ascendingDefined(a, b) {
    return (a == null || !(a >= a)) - (b == null || !(b >= b)) || (a < b ? -1 : a > b ? 1 : 0);
  }

  // node_modules/d3-array/src/ticks.js
  init_define_import_meta_env();
  var e10 = Math.sqrt(50);
  var e5 = Math.sqrt(10);
  var e2 = Math.sqrt(2);
  function tickSpec(start, stop, count) {
    const step = (stop - start) / Math.max(0, count), power = Math.floor(Math.log10(step)), error = step / Math.pow(10, power), factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
    let i1, i2, inc;
    if (power < 0) {
      inc = Math.pow(10, -power) / factor;
      i1 = Math.round(start * inc);
      i2 = Math.round(stop * inc);
      if (i1 / inc < start) ++i1;
      if (i2 / inc > stop) --i2;
      inc = -inc;
    } else {
      inc = Math.pow(10, power) * factor;
      i1 = Math.round(start / inc);
      i2 = Math.round(stop / inc);
      if (i1 * inc < start) ++i1;
      if (i2 * inc > stop) --i2;
    }
    if (i2 < i1 && 0.5 <= count && count < 2) return tickSpec(start, stop, count * 2);
    return [i1, i2, inc];
  }
  function ticks(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    if (!(count > 0)) return [];
    if (start === stop) return [start];
    const reverse = stop < start, [i1, i2, inc] = reverse ? tickSpec(stop, start, count) : tickSpec(start, stop, count);
    if (!(i2 >= i1)) return [];
    const n = i2 - i1 + 1, ticks2 = new Array(n);
    if (reverse) {
      if (inc < 0) for (let i = 0; i < n; ++i) ticks2[i] = (i2 - i) / -inc;
      else for (let i = 0; i < n; ++i) ticks2[i] = (i2 - i) * inc;
    } else {
      if (inc < 0) for (let i = 0; i < n; ++i) ticks2[i] = (i1 + i) / -inc;
      else for (let i = 0; i < n; ++i) ticks2[i] = (i1 + i) * inc;
    }
    return ticks2;
  }
  function tickIncrement(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    return tickSpec(start, stop, count)[2];
  }
  function tickStep(start, stop, count) {
    stop = +stop, start = +start, count = +count;
    const reverse = stop < start, inc = reverse ? tickIncrement(stop, start, count) : tickIncrement(start, stop, count);
    return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
  }

  // node_modules/d3-array/src/quantile.js
  init_define_import_meta_env();

  // node_modules/d3-array/src/max.js
  init_define_import_meta_env();
  function max(values, valueof) {
    let max2;
    if (valueof === void 0) {
      for (const value of values) {
        if (value != null && (max2 < value || max2 === void 0 && value >= value)) {
          max2 = value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null && (max2 < value || max2 === void 0 && value >= value)) {
          max2 = value;
        }
      }
    }
    return max2;
  }

  // node_modules/d3-array/src/min.js
  init_define_import_meta_env();
  function min(values, valueof) {
    let min2;
    if (valueof === void 0) {
      for (const value of values) {
        if (value != null && (min2 > value || min2 === void 0 && value >= value)) {
          min2 = value;
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null && (min2 > value || min2 === void 0 && value >= value)) {
          min2 = value;
        }
      }
    }
    return min2;
  }

  // node_modules/d3-array/src/quickselect.js
  init_define_import_meta_env();
  function quickselect(array, k, left = 0, right = Infinity, compare) {
    k = Math.floor(k);
    left = Math.floor(Math.max(0, left));
    right = Math.floor(Math.min(array.length - 1, right));
    if (!(left <= k && k <= right)) return array;
    compare = compare === void 0 ? ascendingDefined : compareDefined(compare);
    while (right > left) {
      if (right - left > 600) {
        const n = right - left + 1;
        const m = k - left + 1;
        const z = Math.log(n);
        const s = 0.5 * Math.exp(2 * z / 3);
        const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
        const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
        const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
        quickselect(array, k, newLeft, newRight, compare);
      }
      const t = array[k];
      let i = left;
      let j = right;
      swap(array, left, k);
      if (compare(array[right], t) > 0) swap(array, left, right);
      while (i < j) {
        swap(array, i, j), ++i, --j;
        while (compare(array[i], t) < 0) ++i;
        while (compare(array[j], t) > 0) --j;
      }
      if (compare(array[left], t) === 0) swap(array, left, j);
      else ++j, swap(array, j, right);
      if (j <= k) left = j + 1;
      if (k <= j) right = j - 1;
    }
    return array;
  }
  function swap(array, i, j) {
    const t = array[i];
    array[i] = array[j];
    array[j] = t;
  }

  // node_modules/d3-array/src/quantile.js
  function quantile(values, p, valueof) {
    values = Float64Array.from(numbers(values, valueof));
    if (!(n = values.length) || isNaN(p = +p)) return;
    if (p <= 0 || n < 2) return min(values);
    if (p >= 1) return max(values);
    var n, i = (n - 1) * p, i0 = Math.floor(i), value0 = max(quickselect(values, i0).subarray(0, i0 + 1)), value1 = min(values.subarray(i0 + 1));
    return value0 + (value1 - value0) * (i - i0);
  }
  function quantileSorted(values, p, valueof = number) {
    if (!(n = values.length) || isNaN(p = +p)) return;
    if (p <= 0 || n < 2) return +valueof(values[0], 0, values);
    if (p >= 1) return +valueof(values[n - 1], n - 1, values);
    var n, i = (n - 1) * p, i0 = Math.floor(i), value0 = +valueof(values[i0], i0, values), value1 = +valueof(values[i0 + 1], i0 + 1, values);
    return value0 + (value1 - value0) * (i - i0);
  }

  // node_modules/d3-array/src/range.js
  init_define_import_meta_env();
  function range2(start, stop, step) {
    start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;
    var i = -1, n = Math.max(0, Math.ceil((stop - start) / step)) | 0, range3 = new Array(n);
    while (++i < n) {
      range3[i] = start + i * step;
    }
    return range3;
  }

  // node_modules/d3-scale/src/init.js
  init_define_import_meta_env();
  function initRange(domain, range3) {
    switch (arguments.length) {
      case 0:
        break;
      case 1:
        this.range(domain);
        break;
      default:
        this.range(range3).domain(domain);
        break;
    }
    return this;
  }
  function initInterpolator(domain, interpolator) {
    switch (arguments.length) {
      case 0:
        break;
      case 1: {
        if (typeof domain === "function") this.interpolator(domain);
        else this.range(domain);
        break;
      }
      default: {
        this.domain(domain);
        if (typeof interpolator === "function") this.interpolator(interpolator);
        else this.range(interpolator);
        break;
      }
    }
    return this;
  }

  // node_modules/d3-scale/src/ordinal.js
  init_define_import_meta_env();
  var implicit = /* @__PURE__ */ Symbol("implicit");
  function ordinal() {
    var index = new InternMap(), domain = [], range3 = [], unknown = implicit;
    function scale(d) {
      let i = index.get(d);
      if (i === void 0) {
        if (unknown !== implicit) return unknown;
        index.set(d, i = domain.push(d) - 1);
      }
      return range3[i % range3.length];
    }
    scale.domain = function(_) {
      if (!arguments.length) return domain.slice();
      domain = [], index = new InternMap();
      for (const value of _) {
        if (index.has(value)) continue;
        index.set(value, domain.push(value) - 1);
      }
      return scale;
    };
    scale.range = function(_) {
      return arguments.length ? (range3 = Array.from(_), scale) : range3.slice();
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    scale.copy = function() {
      return ordinal(domain, range3).unknown(unknown);
    };
    initRange.apply(scale, arguments);
    return scale;
  }

  // node_modules/d3-scale/src/band.js
  function band() {
    var scale = ordinal().unknown(void 0), domain = scale.domain, ordinalRange = scale.range, r0 = 0, r1 = 1, step, bandwidth, round2 = false, paddingInner = 0, paddingOuter = 0, align = 0.5;
    delete scale.unknown;
    function rescale() {
      var n = domain().length, reverse = r1 < r0, start = reverse ? r1 : r0, stop = reverse ? r0 : r1;
      step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
      if (round2) step = Math.floor(step);
      start += (stop - start - step * (n - paddingInner)) * align;
      bandwidth = step * (1 - paddingInner);
      if (round2) start = Math.round(start), bandwidth = Math.round(bandwidth);
      var values = range2(n).map(function(i) {
        return start + step * i;
      });
      return ordinalRange(reverse ? values.reverse() : values);
    }
    scale.domain = function(_) {
      return arguments.length ? (domain(_), rescale()) : domain();
    };
    scale.range = function(_) {
      return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
    };
    scale.rangeRound = function(_) {
      return [r0, r1] = _, r0 = +r0, r1 = +r1, round2 = true, rescale();
    };
    scale.bandwidth = function() {
      return bandwidth;
    };
    scale.step = function() {
      return step;
    };
    scale.round = function(_) {
      return arguments.length ? (round2 = !!_, rescale()) : round2;
    };
    scale.padding = function(_) {
      return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
    };
    scale.paddingInner = function(_) {
      return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
    };
    scale.paddingOuter = function(_) {
      return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
    };
    scale.align = function(_) {
      return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
    };
    scale.copy = function() {
      return band(domain(), [r0, r1]).round(round2).paddingInner(paddingInner).paddingOuter(paddingOuter).align(align);
    };
    return initRange.apply(rescale(), arguments);
  }
  function pointish(scale) {
    var copy3 = scale.copy;
    scale.padding = scale.paddingOuter;
    delete scale.paddingInner;
    delete scale.paddingOuter;
    scale.copy = function() {
      return pointish(copy3());
    };
    return scale;
  }
  function point() {
    return pointish(band.apply(null, arguments).paddingInner(1));
  }

  // node_modules/d3-scale/src/identity.js
  init_define_import_meta_env();

  // node_modules/d3-scale/src/linear.js
  init_define_import_meta_env();

  // node_modules/d3-scale/src/continuous.js
  init_define_import_meta_env();

  // node_modules/d3-interpolate/src/index.js
  init_define_import_meta_env();

  // node_modules/d3-interpolate/src/value.js
  init_define_import_meta_env();

  // node_modules/d3-color/src/index.js
  init_define_import_meta_env();

  // node_modules/d3-color/src/color.js
  init_define_import_meta_env();

  // node_modules/d3-color/src/define.js
  init_define_import_meta_env();
  function define_default(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }
  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  // node_modules/d3-color/src/color.js
  function Color() {
  }
  var darker = 0.7;
  var brighter = 1 / darker;
  var reI = "\\s*([+-]?\\d+)\\s*";
  var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
  var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
  var reHex = /^#([0-9a-f]{3,8})$/;
  var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
  var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
  var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
  var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
  var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
  var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
  var named = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  };
  define_default(Color, color, {
    copy(channels) {
      return Object.assign(new this.constructor(), this, channels);
    },
    displayable() {
      return this.rgb().displayable();
    },
    hex: color_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHex8: color_formatHex8,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });
  function color_formatHex() {
    return this.rgb().formatHex();
  }
  function color_formatHex8() {
    return this.rgb().formatHex8();
  }
  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }
  function color_formatRgb() {
    return this.rgb().formatRgb();
  }
  function color(format2) {
    var m, l;
    format2 = (format2 + "").trim().toLowerCase();
    return (m = reHex.exec(format2)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format2)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format2)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format2)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format2)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format2) ? rgbn(named[format2]) : format2 === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
  }
  function rgbn(n) {
    return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
  }
  function rgba(r2, g2, b, a) {
    if (a <= 0) r2 = g2 = b = NaN;
    return new Rgb(r2, g2, b, a);
  }
  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb();
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }
  function rgb(r2, g2, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r2) : new Rgb(r2, g2, b, opacity == null ? 1 : opacity);
  }
  function Rgb(r2, g2, b, opacity) {
    this.r = +r2;
    this.g = +g2;
    this.b = +b;
    this.opacity = +opacity;
  }
  define_default(Rgb, rgb, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb() {
      return this;
    },
    clamp() {
      return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
    },
    displayable() {
      return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatHex8: rgb_formatHex8,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));
  function rgb_formatHex() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
  }
  function rgb_formatHex8() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
  }
  function rgb_formatRgb() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
  }
  function clampa(opacity) {
    return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
  }
  function clampi(value) {
    return Math.max(0, Math.min(255, Math.round(value) || 0));
  }
  function hex(value) {
    value = clampi(value);
    return (value < 16 ? "0" : "") + value.toString(16);
  }
  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }
  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl();
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r2 = o.r / 255, g2 = o.g / 255, b = o.b / 255, min2 = Math.min(r2, g2, b), max2 = Math.max(r2, g2, b), h = NaN, s = max2 - min2, l = (max2 + min2) / 2;
    if (s) {
      if (r2 === max2) h = (g2 - b) / s + (g2 < b) * 6;
      else if (g2 === max2) h = (b - r2) / s + 2;
      else h = (r2 - g2) / s + 4;
      s /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }
  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }
  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }
  define_default(Hsl, hsl, extend(Color, {
    brighter(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb() {
      var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    clamp() {
      return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
    },
    displayable() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl() {
      const a = clampa(this.opacity);
      return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
    }
  }));
  function clamph(value) {
    value = (value || 0) % 360;
    return value < 0 ? value + 360 : value;
  }
  function clampt(value) {
    return Math.max(0, Math.min(1, value || 0));
  }
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
  }

  // node_modules/d3-interpolate/src/rgb.js
  init_define_import_meta_env();

  // node_modules/d3-interpolate/src/basis.js
  init_define_import_meta_env();
  function basis(t12, v0, v1, v2, v3) {
    var t2 = t12 * t12, t3 = t2 * t12;
    return ((1 - 3 * t12 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t12 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
  }
  function basis_default(values) {
    var n = values.length - 1;
    return function(t) {
      var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  // node_modules/d3-interpolate/src/basisClosed.js
  init_define_import_meta_env();
  function basisClosed_default(values) {
    var n = values.length;
    return function(t) {
      var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  // node_modules/d3-interpolate/src/color.js
  init_define_import_meta_env();

  // node_modules/d3-interpolate/src/constant.js
  init_define_import_meta_env();
  var constant_default2 = (x) => () => x;

  // node_modules/d3-interpolate/src/color.js
  function linear(a, d) {
    return function(t) {
      return a + t * d;
    };
  }
  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }
  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant_default2(isNaN(a) ? b : a);
    };
  }
  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant_default2(isNaN(a) ? b : a);
  }

  // node_modules/d3-interpolate/src/rgb.js
  var rgb_default = (function rgbGamma(y) {
    var color2 = gamma(y);
    function rgb2(start, end) {
      var r2 = color2((start = rgb(start)).r, (end = rgb(end)).r), g2 = color2(start.g, end.g), b = color2(start.b, end.b), opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.r = r2(t);
        start.g = g2(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }
    rgb2.gamma = rgbGamma;
    return rgb2;
  })(1);
  function rgbSpline(spline) {
    return function(colors) {
      var n = colors.length, r2 = new Array(n), g2 = new Array(n), b = new Array(n), i, color2;
      for (i = 0; i < n; ++i) {
        color2 = rgb(colors[i]);
        r2[i] = color2.r || 0;
        g2[i] = color2.g || 0;
        b[i] = color2.b || 0;
      }
      r2 = spline(r2);
      g2 = spline(g2);
      b = spline(b);
      color2.opacity = 1;
      return function(t) {
        color2.r = r2(t);
        color2.g = g2(t);
        color2.b = b(t);
        return color2 + "";
      };
    };
  }
  var rgbBasis = rgbSpline(basis_default);
  var rgbBasisClosed = rgbSpline(basisClosed_default);

  // node_modules/d3-interpolate/src/array.js
  init_define_import_meta_env();

  // node_modules/d3-interpolate/src/numberArray.js
  init_define_import_meta_env();
  function numberArray_default(a, b) {
    if (!b) b = [];
    var n = a ? Math.min(b.length, a.length) : 0, c = b.slice(), i;
    return function(t) {
      for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
      return c;
    };
  }
  function isNumberArray(x) {
    return ArrayBuffer.isView(x) && !(x instanceof DataView);
  }

  // node_modules/d3-interpolate/src/array.js
  function genericArray(a, b) {
    var nb = b ? b.length : 0, na = a ? Math.min(nb, a.length) : 0, x = new Array(na), c = new Array(nb), i;
    for (i = 0; i < na; ++i) x[i] = value_default(a[i], b[i]);
    for (; i < nb; ++i) c[i] = b[i];
    return function(t) {
      for (i = 0; i < na; ++i) c[i] = x[i](t);
      return c;
    };
  }

  // node_modules/d3-interpolate/src/date.js
  init_define_import_meta_env();
  function date_default(a, b) {
    var d = /* @__PURE__ */ new Date();
    return a = +a, b = +b, function(t) {
      return d.setTime(a * (1 - t) + b * t), d;
    };
  }

  // node_modules/d3-interpolate/src/number.js
  init_define_import_meta_env();
  function number_default(a, b) {
    return a = +a, b = +b, function(t) {
      return a * (1 - t) + b * t;
    };
  }

  // node_modules/d3-interpolate/src/object.js
  init_define_import_meta_env();
  function object_default(a, b) {
    var i = {}, c = {}, k;
    if (a === null || typeof a !== "object") a = {};
    if (b === null || typeof b !== "object") b = {};
    for (k in b) {
      if (k in a) {
        i[k] = value_default(a[k], b[k]);
      } else {
        c[k] = b[k];
      }
    }
    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }

  // node_modules/d3-interpolate/src/string.js
  init_define_import_meta_env();
  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
  var reB = new RegExp(reA.source, "g");
  function zero2(b) {
    return function() {
      return b;
    };
  }
  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }
  function string_default(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
    a = a + "", b = b + "";
    while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) {
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs;
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        if (s[i]) s[i] += bm;
        else s[++i] = bm;
      } else {
        s[++i] = null;
        q.push({ i, x: number_default(am, bm) });
      }
      bi = reB.lastIndex;
    }
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs;
      else s[++i] = bs;
    }
    return s.length < 2 ? q[0] ? one(q[0].x) : zero2(b) : (b = q.length, function(t) {
      for (var i2 = 0, o; i2 < b; ++i2) s[(o = q[i2]).i] = o.x(t);
      return s.join("");
    });
  }

  // node_modules/d3-interpolate/src/value.js
  function value_default(a, b) {
    var t = typeof b, c;
    return b == null || t === "boolean" ? constant_default2(b) : (t === "number" ? number_default : t === "string" ? (c = color(b)) ? (b = c, rgb_default) : string_default : b instanceof color ? rgb_default : b instanceof Date ? date_default : isNumberArray(b) ? numberArray_default : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object_default : number_default)(a, b);
  }

  // node_modules/d3-interpolate/src/round.js
  init_define_import_meta_env();
  function round_default(a, b) {
    return a = +a, b = +b, function(t) {
      return Math.round(a * (1 - t) + b * t);
    };
  }

  // node_modules/d3-interpolate/src/piecewise.js
  init_define_import_meta_env();
  function piecewise(interpolate2, values) {
    if (values === void 0) values = interpolate2, interpolate2 = value_default;
    var i = 0, n = values.length - 1, v = values[0], I = new Array(n < 0 ? 0 : n);
    while (i < n) I[i] = interpolate2(v, v = values[++i]);
    return function(t) {
      var i2 = Math.max(0, Math.min(n - 1, Math.floor(t *= n)));
      return I[i2](t - i2);
    };
  }

  // node_modules/d3-scale/src/constant.js
  init_define_import_meta_env();
  function constants(x) {
    return function() {
      return x;
    };
  }

  // node_modules/d3-scale/src/number.js
  init_define_import_meta_env();
  function number2(x) {
    return +x;
  }

  // node_modules/d3-scale/src/continuous.js
  var unit = [0, 1];
  function identity(x) {
    return x;
  }
  function normalize(a, b) {
    return (b -= a = +a) ? function(x) {
      return (x - a) / b;
    } : constants(isNaN(b) ? NaN : 0.5);
  }
  function clamper(a, b) {
    var t;
    if (a > b) t = a, a = b, b = t;
    return function(x) {
      return Math.max(a, Math.min(b, x));
    };
  }
  function bimap(domain, range3, interpolate2) {
    var d0 = domain[0], d1 = domain[1], r0 = range3[0], r1 = range3[1];
    if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate2(r1, r0);
    else d0 = normalize(d0, d1), r0 = interpolate2(r0, r1);
    return function(x) {
      return r0(d0(x));
    };
  }
  function polymap(domain, range3, interpolate2) {
    var j = Math.min(domain.length, range3.length) - 1, d = new Array(j), r2 = new Array(j), i = -1;
    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range3 = range3.slice().reverse();
    }
    while (++i < j) {
      d[i] = normalize(domain[i], domain[i + 1]);
      r2[i] = interpolate2(range3[i], range3[i + 1]);
    }
    return function(x) {
      var i2 = bisect_default(domain, x, 1, j) - 1;
      return r2[i2](d[i2](x));
    };
  }
  function copy(source, target) {
    return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
  }
  function transformer() {
    var domain = unit, range3 = unit, interpolate2 = value_default, transform, untransform, unknown, clamp = identity, piecewise2, output, input;
    function rescale() {
      var n = Math.min(domain.length, range3.length);
      if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
      piecewise2 = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }
    function scale(x) {
      return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise2(domain.map(transform), range3, interpolate2)))(transform(clamp(x)));
    }
    scale.invert = function(y) {
      return clamp(untransform((input || (input = piecewise2(range3, domain.map(transform), number_default)))(y)));
    };
    scale.domain = function(_) {
      return arguments.length ? (domain = Array.from(_, number2), rescale()) : domain.slice();
    };
    scale.range = function(_) {
      return arguments.length ? (range3 = Array.from(_), rescale()) : range3.slice();
    };
    scale.rangeRound = function(_) {
      return range3 = Array.from(_), interpolate2 = round_default, rescale();
    };
    scale.clamp = function(_) {
      return arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity;
    };
    scale.interpolate = function(_) {
      return arguments.length ? (interpolate2 = _, rescale()) : interpolate2;
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    return function(t, u) {
      transform = t, untransform = u;
      return rescale();
    };
  }
  function continuous() {
    return transformer()(identity, identity);
  }

  // node_modules/d3-scale/src/tickFormat.js
  init_define_import_meta_env();

  // node_modules/d3-format/src/index.js
  init_define_import_meta_env();

  // node_modules/d3-format/src/defaultLocale.js
  init_define_import_meta_env();

  // node_modules/d3-format/src/locale.js
  init_define_import_meta_env();

  // node_modules/d3-format/src/exponent.js
  init_define_import_meta_env();

  // node_modules/d3-format/src/formatDecimal.js
  init_define_import_meta_env();
  function formatDecimal_default(x) {
    return Math.abs(x = Math.round(x)) >= 1e21 ? x.toLocaleString("en").replace(/,/g, "") : x.toString(10);
  }
  function formatDecimalParts(x, p) {
    if (!isFinite(x) || x === 0) return null;
    var i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e"), coefficient = x.slice(0, i);
    return [
      coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
      +x.slice(i + 1)
    ];
  }

  // node_modules/d3-format/src/exponent.js
  function exponent_default(x) {
    return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
  }

  // node_modules/d3-format/src/formatGroup.js
  init_define_import_meta_env();
  function formatGroup_default(grouping, thousands) {
    return function(value, width) {
      var i = value.length, t = [], j = 0, g2 = grouping[0], length = 0;
      while (i > 0 && g2 > 0) {
        if (length + g2 + 1 > width) g2 = Math.max(1, width - length);
        t.push(value.substring(i -= g2, i + g2));
        if ((length += g2 + 1) > width) break;
        g2 = grouping[j = (j + 1) % grouping.length];
      }
      return t.reverse().join(thousands);
    };
  }

  // node_modules/d3-format/src/formatNumerals.js
  init_define_import_meta_env();
  function formatNumerals_default(numerals) {
    return function(value) {
      return value.replace(/[0-9]/g, function(i) {
        return numerals[+i];
      });
    };
  }

  // node_modules/d3-format/src/formatSpecifier.js
  init_define_import_meta_env();
  var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
  function formatSpecifier(specifier) {
    if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
    var match;
    return new FormatSpecifier({
      fill: match[1],
      align: match[2],
      sign: match[3],
      symbol: match[4],
      zero: match[5],
      width: match[6],
      comma: match[7],
      precision: match[8] && match[8].slice(1),
      trim: match[9],
      type: match[10]
    });
  }
  formatSpecifier.prototype = FormatSpecifier.prototype;
  function FormatSpecifier(specifier) {
    this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
    this.align = specifier.align === void 0 ? ">" : specifier.align + "";
    this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
    this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
    this.zero = !!specifier.zero;
    this.width = specifier.width === void 0 ? void 0 : +specifier.width;
    this.comma = !!specifier.comma;
    this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
    this.trim = !!specifier.trim;
    this.type = specifier.type === void 0 ? "" : specifier.type + "";
  }
  FormatSpecifier.prototype.toString = function() {
    return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
  };

  // node_modules/d3-format/src/formatTrim.js
  init_define_import_meta_env();
  function formatTrim_default(s) {
    out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s[i]) {
        case ".":
          i0 = i1 = i;
          break;
        case "0":
          if (i0 === 0) i0 = i;
          i1 = i;
          break;
        default:
          if (!+s[i]) break out;
          if (i0 > 0) i0 = 0;
          break;
      }
    }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
  }

  // node_modules/d3-format/src/formatTypes.js
  init_define_import_meta_env();

  // node_modules/d3-format/src/formatPrefixAuto.js
  init_define_import_meta_env();
  var prefixExponent;
  function formatPrefixAuto_default(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d) return prefixExponent = void 0, x.toPrecision(p);
    var coefficient = d[0], exponent = d[1], i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1, n = coefficient.length;
    return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0];
  }

  // node_modules/d3-format/src/formatRounded.js
  init_define_import_meta_env();
  function formatRounded_default(x, p) {
    var d = formatDecimalParts(x, p);
    if (!d) return x + "";
    var coefficient = d[0], exponent = d[1];
    return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1) : coefficient + new Array(exponent - coefficient.length + 2).join("0");
  }

  // node_modules/d3-format/src/formatTypes.js
  var formatTypes_default = {
    "%": (x, p) => (x * 100).toFixed(p),
    "b": (x) => Math.round(x).toString(2),
    "c": (x) => x + "",
    "d": formatDecimal_default,
    "e": (x, p) => x.toExponential(p),
    "f": (x, p) => x.toFixed(p),
    "g": (x, p) => x.toPrecision(p),
    "o": (x) => Math.round(x).toString(8),
    "p": (x, p) => formatRounded_default(x * 100, p),
    "r": formatRounded_default,
    "s": formatPrefixAuto_default,
    "X": (x) => Math.round(x).toString(16).toUpperCase(),
    "x": (x) => Math.round(x).toString(16)
  };

  // node_modules/d3-format/src/identity.js
  init_define_import_meta_env();
  function identity_default(x) {
    return x;
  }

  // node_modules/d3-format/src/locale.js
  var map = Array.prototype.map;
  var prefixes = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
  function locale_default(locale3) {
    var group = locale3.grouping === void 0 || locale3.thousands === void 0 ? identity_default : formatGroup_default(map.call(locale3.grouping, Number), locale3.thousands + ""), currencyPrefix = locale3.currency === void 0 ? "" : locale3.currency[0] + "", currencySuffix = locale3.currency === void 0 ? "" : locale3.currency[1] + "", decimal = locale3.decimal === void 0 ? "." : locale3.decimal + "", numerals = locale3.numerals === void 0 ? identity_default : formatNumerals_default(map.call(locale3.numerals, String)), percent = locale3.percent === void 0 ? "%" : locale3.percent + "", minus = locale3.minus === void 0 ? "−" : locale3.minus + "", nan = locale3.nan === void 0 ? "NaN" : locale3.nan + "";
    function newFormat(specifier, options) {
      specifier = formatSpecifier(specifier);
      var fill = specifier.fill, align = specifier.align, sign = specifier.sign, symbol = specifier.symbol, zero3 = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type = specifier.type;
      if (type === "n") comma = true, type = "g";
      else if (!formatTypes_default[type]) precision === void 0 && (precision = 12), trim = true, type = "g";
      if (zero3 || fill === "0" && align === "=") zero3 = true, fill = "0", align = "=";
      var prefix2 = (options && options.prefix !== void 0 ? options.prefix : "") + (symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : ""), suffix2 = (symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "") + (options && options.suffix !== void 0 ? options.suffix : "");
      var formatType = formatTypes_default[type], maybeSuffix = /[defgprs%]/.test(type);
      precision = precision === void 0 ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
      function format2(value) {
        var valuePrefix = prefix2, valueSuffix = suffix2, i, n, c;
        if (type === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;
          var valueNegative = value < 0 || 1 / value < 0;
          value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
          if (trim) value = formatTrim_default(value);
          if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;
          valuePrefix = (valueNegative ? sign === "(" ? sign : minus : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
          valueSuffix = (type === "s" && !isNaN(value) && prefixExponent !== void 0 ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");
          if (maybeSuffix) {
            i = -1, n = value.length;
            while (++i < n) {
              if (c = value.charCodeAt(i), 48 > c || c > 57) {
                valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                value = value.slice(0, i);
                break;
              }
            }
          }
        }
        if (comma && !zero3) value = group(value, Infinity);
        var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
        if (comma && zero3) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
        switch (align) {
          case "<":
            value = valuePrefix + value + valueSuffix + padding;
            break;
          case "=":
            value = valuePrefix + padding + value + valueSuffix;
            break;
          case "^":
            value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
            break;
          default:
            value = padding + valuePrefix + value + valueSuffix;
            break;
        }
        return numerals(value);
      }
      format2.toString = function() {
        return specifier + "";
      };
      return format2;
    }
    function formatPrefix2(specifier, value) {
      var e = Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3, k = Math.pow(10, -e), f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier), { suffix: prefixes[8 + e / 3] });
      return function(value2) {
        return f(k * value2);
      };
    }
    return {
      format: newFormat,
      formatPrefix: formatPrefix2
    };
  }

  // node_modules/d3-format/src/defaultLocale.js
  var locale;
  var format;
  var formatPrefix;
  defaultLocale({
    thousands: ",",
    grouping: [3],
    currency: ["$", ""]
  });
  function defaultLocale(definition) {
    locale = locale_default(definition);
    format = locale.format;
    formatPrefix = locale.formatPrefix;
    return locale;
  }

  // node_modules/d3-format/src/precisionFixed.js
  init_define_import_meta_env();
  function precisionFixed_default(step) {
    return Math.max(0, -exponent_default(Math.abs(step)));
  }

  // node_modules/d3-format/src/precisionPrefix.js
  init_define_import_meta_env();
  function precisionPrefix_default(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3 - exponent_default(Math.abs(step)));
  }

  // node_modules/d3-format/src/precisionRound.js
  init_define_import_meta_env();
  function precisionRound_default(step, max2) {
    step = Math.abs(step), max2 = Math.abs(max2) - step;
    return Math.max(0, exponent_default(max2) - exponent_default(step)) + 1;
  }

  // node_modules/d3-scale/src/tickFormat.js
  function tickFormat(start, stop, count, specifier) {
    var step = tickStep(start, stop, count), precision;
    specifier = formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s": {
        var value = Math.max(Math.abs(start), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = precisionPrefix_default(step, value))) specifier.precision = precision;
        return formatPrefix(specifier, value);
      }
      case "":
      case "e":
      case "g":
      case "p":
      case "r": {
        if (specifier.precision == null && !isNaN(precision = precisionRound_default(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
        break;
      }
      case "f":
      case "%": {
        if (specifier.precision == null && !isNaN(precision = precisionFixed_default(step))) specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
    }
    return format(specifier);
  }

  // node_modules/d3-scale/src/linear.js
  function linearish(scale) {
    var domain = scale.domain;
    scale.ticks = function(count) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };
    scale.tickFormat = function(count, specifier) {
      var d = domain();
      return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };
    scale.nice = function(count) {
      if (count == null) count = 10;
      var d = domain();
      var i0 = 0;
      var i1 = d.length - 1;
      var start = d[i0];
      var stop = d[i1];
      var prestep;
      var step;
      var maxIter = 10;
      if (stop < start) {
        step = start, start = stop, stop = step;
        step = i0, i0 = i1, i1 = step;
      }
      while (maxIter-- > 0) {
        step = tickIncrement(start, stop, count);
        if (step === prestep) {
          d[i0] = start;
          d[i1] = stop;
          return domain(d);
        } else if (step > 0) {
          start = Math.floor(start / step) * step;
          stop = Math.ceil(stop / step) * step;
        } else if (step < 0) {
          start = Math.ceil(start * step) / step;
          stop = Math.floor(stop * step) / step;
        } else {
          break;
        }
        prestep = step;
      }
      return scale;
    };
    return scale;
  }
  function linear2() {
    var scale = continuous();
    scale.copy = function() {
      return copy(scale, linear2());
    };
    initRange.apply(scale, arguments);
    return linearish(scale);
  }

  // node_modules/d3-scale/src/identity.js
  function identity2(domain) {
    var unknown;
    function scale(x) {
      return x == null || isNaN(x = +x) ? unknown : x;
    }
    scale.invert = scale;
    scale.domain = scale.range = function(_) {
      return arguments.length ? (domain = Array.from(_, number2), scale) : domain.slice();
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    scale.copy = function() {
      return identity2(domain).unknown(unknown);
    };
    domain = arguments.length ? Array.from(domain, number2) : [0, 1];
    return linearish(scale);
  }

  // node_modules/d3-scale/src/log.js
  init_define_import_meta_env();

  // node_modules/d3-scale/src/nice.js
  init_define_import_meta_env();
  function nice(domain, interval) {
    domain = domain.slice();
    var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], t;
    if (x1 < x0) {
      t = i0, i0 = i1, i1 = t;
      t = x0, x0 = x1, x1 = t;
    }
    domain[i0] = interval.floor(x0);
    domain[i1] = interval.ceil(x1);
    return domain;
  }

  // node_modules/d3-scale/src/log.js
  function transformLog(x) {
    return Math.log(x);
  }
  function transformExp(x) {
    return Math.exp(x);
  }
  function transformLogn(x) {
    return -Math.log(-x);
  }
  function transformExpn(x) {
    return -Math.exp(-x);
  }
  function pow10(x) {
    return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
  }
  function powp(base) {
    return base === 10 ? pow10 : base === Math.E ? Math.exp : (x) => Math.pow(base, x);
  }
  function logp(base) {
    return base === Math.E ? Math.log : base === 10 && Math.log10 || base === 2 && Math.log2 || (base = Math.log(base), (x) => Math.log(x) / base);
  }
  function reflect(f) {
    return (x, k) => -f(-x, k);
  }
  function loggish(transform) {
    const scale = transform(transformLog, transformExp);
    const domain = scale.domain;
    let base = 10;
    let logs;
    let pows;
    function rescale() {
      logs = logp(base), pows = powp(base);
      if (domain()[0] < 0) {
        logs = reflect(logs), pows = reflect(pows);
        transform(transformLogn, transformExpn);
      } else {
        transform(transformLog, transformExp);
      }
      return scale;
    }
    scale.base = function(_) {
      return arguments.length ? (base = +_, rescale()) : base;
    };
    scale.domain = function(_) {
      return arguments.length ? (domain(_), rescale()) : domain();
    };
    scale.ticks = (count) => {
      const d = domain();
      let u = d[0];
      let v = d[d.length - 1];
      const r2 = v < u;
      if (r2) [u, v] = [v, u];
      let i = logs(u);
      let j = logs(v);
      let k;
      let t;
      const n = count == null ? 10 : +count;
      let z = [];
      if (!(base % 1) && j - i < n) {
        i = Math.floor(i), j = Math.ceil(j);
        if (u > 0) for (; i <= j; ++i) {
          for (k = 1; k < base; ++k) {
            t = i < 0 ? k / pows(-i) : k * pows(i);
            if (t < u) continue;
            if (t > v) break;
            z.push(t);
          }
        }
        else for (; i <= j; ++i) {
          for (k = base - 1; k >= 1; --k) {
            t = i > 0 ? k / pows(-i) : k * pows(i);
            if (t < u) continue;
            if (t > v) break;
            z.push(t);
          }
        }
        if (z.length * 2 < n) z = ticks(u, v, n);
      } else {
        z = ticks(i, j, Math.min(j - i, n)).map(pows);
      }
      return r2 ? z.reverse() : z;
    };
    scale.tickFormat = (count, specifier) => {
      if (count == null) count = 10;
      if (specifier == null) specifier = base === 10 ? "s" : ",";
      if (typeof specifier !== "function") {
        if (!(base % 1) && (specifier = formatSpecifier(specifier)).precision == null) specifier.trim = true;
        specifier = format(specifier);
      }
      if (count === Infinity) return specifier;
      const k = Math.max(1, base * count / scale.ticks().length);
      return (d) => {
        let i = d / pows(Math.round(logs(d)));
        if (i * base < base - 0.5) i *= base;
        return i <= k ? specifier(d) : "";
      };
    };
    scale.nice = () => {
      return domain(nice(domain(), {
        floor: (x) => pows(Math.floor(logs(x))),
        ceil: (x) => pows(Math.ceil(logs(x)))
      }));
    };
    return scale;
  }
  function log() {
    const scale = loggish(transformer()).domain([1, 10]);
    scale.copy = () => copy(scale, log()).base(scale.base());
    initRange.apply(scale, arguments);
    return scale;
  }

  // node_modules/d3-scale/src/symlog.js
  init_define_import_meta_env();
  function transformSymlog(c) {
    return function(x) {
      return Math.sign(x) * Math.log1p(Math.abs(x / c));
    };
  }
  function transformSymexp(c) {
    return function(x) {
      return Math.sign(x) * Math.expm1(Math.abs(x)) * c;
    };
  }
  function symlogish(transform) {
    var c = 1, scale = transform(transformSymlog(c), transformSymexp(c));
    scale.constant = function(_) {
      return arguments.length ? transform(transformSymlog(c = +_), transformSymexp(c)) : c;
    };
    return linearish(scale);
  }
  function symlog() {
    var scale = symlogish(transformer());
    scale.copy = function() {
      return copy(scale, symlog()).constant(scale.constant());
    };
    return initRange.apply(scale, arguments);
  }

  // node_modules/d3-scale/src/pow.js
  init_define_import_meta_env();
  function transformPow(exponent) {
    return function(x) {
      return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
    };
  }
  function transformSqrt(x) {
    return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
  }
  function transformSquare(x) {
    return x < 0 ? -x * x : x * x;
  }
  function powish(transform) {
    var scale = transform(identity, identity), exponent = 1;
    function rescale() {
      return exponent === 1 ? transform(identity, identity) : exponent === 0.5 ? transform(transformSqrt, transformSquare) : transform(transformPow(exponent), transformPow(1 / exponent));
    }
    scale.exponent = function(_) {
      return arguments.length ? (exponent = +_, rescale()) : exponent;
    };
    return linearish(scale);
  }
  function pow() {
    var scale = powish(transformer());
    scale.copy = function() {
      return copy(scale, pow()).exponent(scale.exponent());
    };
    initRange.apply(scale, arguments);
    return scale;
  }
  function sqrt() {
    return pow.apply(null, arguments).exponent(0.5);
  }

  // node_modules/d3-scale/src/radial.js
  init_define_import_meta_env();
  function square(x) {
    return Math.sign(x) * x * x;
  }
  function unsquare(x) {
    return Math.sign(x) * Math.sqrt(Math.abs(x));
  }
  function radial() {
    var squared = continuous(), range3 = [0, 1], round2 = false, unknown;
    function scale(x) {
      var y = unsquare(squared(x));
      return isNaN(y) ? unknown : round2 ? Math.round(y) : y;
    }
    scale.invert = function(y) {
      return squared.invert(square(y));
    };
    scale.domain = function(_) {
      return arguments.length ? (squared.domain(_), scale) : squared.domain();
    };
    scale.range = function(_) {
      return arguments.length ? (squared.range((range3 = Array.from(_, number2)).map(square)), scale) : range3.slice();
    };
    scale.rangeRound = function(_) {
      return scale.range(_).round(true);
    };
    scale.round = function(_) {
      return arguments.length ? (round2 = !!_, scale) : round2;
    };
    scale.clamp = function(_) {
      return arguments.length ? (squared.clamp(_), scale) : squared.clamp();
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    scale.copy = function() {
      return radial(squared.domain(), range3).round(round2).clamp(squared.clamp()).unknown(unknown);
    };
    initRange.apply(scale, arguments);
    return linearish(scale);
  }

  // node_modules/d3-scale/src/quantile.js
  init_define_import_meta_env();
  function quantile2() {
    var domain = [], range3 = [], thresholds = [], unknown;
    function rescale() {
      var i = 0, n = Math.max(1, range3.length);
      thresholds = new Array(n - 1);
      while (++i < n) thresholds[i - 1] = quantileSorted(domain, i / n);
      return scale;
    }
    function scale(x) {
      return x == null || isNaN(x = +x) ? unknown : range3[bisect_default(thresholds, x)];
    }
    scale.invertExtent = function(y) {
      var i = range3.indexOf(y);
      return i < 0 ? [NaN, NaN] : [
        i > 0 ? thresholds[i - 1] : domain[0],
        i < thresholds.length ? thresholds[i] : domain[domain.length - 1]
      ];
    };
    scale.domain = function(_) {
      if (!arguments.length) return domain.slice();
      domain = [];
      for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d);
      domain.sort(ascending);
      return rescale();
    };
    scale.range = function(_) {
      return arguments.length ? (range3 = Array.from(_), rescale()) : range3.slice();
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    scale.quantiles = function() {
      return thresholds.slice();
    };
    scale.copy = function() {
      return quantile2().domain(domain).range(range3).unknown(unknown);
    };
    return initRange.apply(scale, arguments);
  }

  // node_modules/d3-scale/src/quantize.js
  init_define_import_meta_env();
  function quantize() {
    var x0 = 0, x1 = 1, n = 1, domain = [0.5], range3 = [0, 1], unknown;
    function scale(x) {
      return x != null && x <= x ? range3[bisect_default(domain, x, 0, n)] : unknown;
    }
    function rescale() {
      var i = -1;
      domain = new Array(n);
      while (++i < n) domain[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1);
      return scale;
    }
    scale.domain = function(_) {
      return arguments.length ? ([x0, x1] = _, x0 = +x0, x1 = +x1, rescale()) : [x0, x1];
    };
    scale.range = function(_) {
      return arguments.length ? (n = (range3 = Array.from(_)).length - 1, rescale()) : range3.slice();
    };
    scale.invertExtent = function(y) {
      var i = range3.indexOf(y);
      return i < 0 ? [NaN, NaN] : i < 1 ? [x0, domain[0]] : i >= n ? [domain[n - 1], x1] : [domain[i - 1], domain[i]];
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : scale;
    };
    scale.thresholds = function() {
      return domain.slice();
    };
    scale.copy = function() {
      return quantize().domain([x0, x1]).range(range3).unknown(unknown);
    };
    return initRange.apply(linearish(scale), arguments);
  }

  // node_modules/d3-scale/src/threshold.js
  init_define_import_meta_env();
  function threshold() {
    var domain = [0.5], range3 = [0, 1], unknown, n = 1;
    function scale(x) {
      return x != null && x <= x ? range3[bisect_default(domain, x, 0, n)] : unknown;
    }
    scale.domain = function(_) {
      return arguments.length ? (domain = Array.from(_), n = Math.min(domain.length, range3.length - 1), scale) : domain.slice();
    };
    scale.range = function(_) {
      return arguments.length ? (range3 = Array.from(_), n = Math.min(domain.length, range3.length - 1), scale) : range3.slice();
    };
    scale.invertExtent = function(y) {
      var i = range3.indexOf(y);
      return [domain[i - 1], domain[i]];
    };
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    scale.copy = function() {
      return threshold().domain(domain).range(range3).unknown(unknown);
    };
    return initRange.apply(scale, arguments);
  }

  // node_modules/d3-scale/src/time.js
  init_define_import_meta_env();

  // node_modules/d3-time/src/index.js
  init_define_import_meta_env();

  // node_modules/d3-time/src/interval.js
  init_define_import_meta_env();
  var t0 = /* @__PURE__ */ new Date();
  var t1 = /* @__PURE__ */ new Date();
  function timeInterval(floori, offseti, count, field) {
    function interval(date2) {
      return floori(date2 = arguments.length === 0 ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(+date2)), date2;
    }
    interval.floor = (date2) => {
      return floori(date2 = /* @__PURE__ */ new Date(+date2)), date2;
    };
    interval.ceil = (date2) => {
      return floori(date2 = new Date(date2 - 1)), offseti(date2, 1), floori(date2), date2;
    };
    interval.round = (date2) => {
      const d0 = interval(date2), d1 = interval.ceil(date2);
      return date2 - d0 < d1 - date2 ? d0 : d1;
    };
    interval.offset = (date2, step) => {
      return offseti(date2 = /* @__PURE__ */ new Date(+date2), step == null ? 1 : Math.floor(step)), date2;
    };
    interval.range = (start, stop, step) => {
      const range3 = [];
      start = interval.ceil(start);
      step = step == null ? 1 : Math.floor(step);
      if (!(start < stop) || !(step > 0)) return range3;
      let previous;
      do
        range3.push(previous = /* @__PURE__ */ new Date(+start)), offseti(start, step), floori(start);
      while (previous < start && start < stop);
      return range3;
    };
    interval.filter = (test) => {
      return timeInterval((date2) => {
        if (date2 >= date2) while (floori(date2), !test(date2)) date2.setTime(date2 - 1);
      }, (date2, step) => {
        if (date2 >= date2) {
          if (step < 0) while (++step <= 0) {
            while (offseti(date2, -1), !test(date2)) {
            }
          }
          else while (--step >= 0) {
            while (offseti(date2, 1), !test(date2)) {
            }
          }
        }
      });
    };
    if (count) {
      interval.count = (start, end) => {
        t0.setTime(+start), t1.setTime(+end);
        floori(t0), floori(t1);
        return Math.floor(count(t0, t1));
      };
      interval.every = (step) => {
        step = Math.floor(step);
        return !isFinite(step) || !(step > 0) ? null : !(step > 1) ? interval : interval.filter(field ? (d) => field(d) % step === 0 : (d) => interval.count(0, d) % step === 0);
      };
    }
    return interval;
  }

  // node_modules/d3-time/src/millisecond.js
  init_define_import_meta_env();
  var millisecond = timeInterval(() => {
  }, (date2, step) => {
    date2.setTime(+date2 + step);
  }, (start, end) => {
    return end - start;
  });
  millisecond.every = (k) => {
    k = Math.floor(k);
    if (!isFinite(k) || !(k > 0)) return null;
    if (!(k > 1)) return millisecond;
    return timeInterval((date2) => {
      date2.setTime(Math.floor(date2 / k) * k);
    }, (date2, step) => {
      date2.setTime(+date2 + step * k);
    }, (start, end) => {
      return (end - start) / k;
    });
  };
  var milliseconds = millisecond.range;

  // node_modules/d3-time/src/second.js
  init_define_import_meta_env();

  // node_modules/d3-time/src/duration.js
  init_define_import_meta_env();
  var durationSecond = 1e3;
  var durationMinute = durationSecond * 60;
  var durationHour = durationMinute * 60;
  var durationDay = durationHour * 24;
  var durationWeek = durationDay * 7;
  var durationMonth = durationDay * 30;
  var durationYear = durationDay * 365;

  // node_modules/d3-time/src/second.js
  var second = timeInterval((date2) => {
    date2.setTime(date2 - date2.getMilliseconds());
  }, (date2, step) => {
    date2.setTime(+date2 + step * durationSecond);
  }, (start, end) => {
    return (end - start) / durationSecond;
  }, (date2) => {
    return date2.getUTCSeconds();
  });
  var seconds = second.range;

  // node_modules/d3-time/src/minute.js
  init_define_import_meta_env();
  var timeMinute = timeInterval((date2) => {
    date2.setTime(date2 - date2.getMilliseconds() - date2.getSeconds() * durationSecond);
  }, (date2, step) => {
    date2.setTime(+date2 + step * durationMinute);
  }, (start, end) => {
    return (end - start) / durationMinute;
  }, (date2) => {
    return date2.getMinutes();
  });
  var timeMinutes = timeMinute.range;
  var utcMinute = timeInterval((date2) => {
    date2.setUTCSeconds(0, 0);
  }, (date2, step) => {
    date2.setTime(+date2 + step * durationMinute);
  }, (start, end) => {
    return (end - start) / durationMinute;
  }, (date2) => {
    return date2.getUTCMinutes();
  });
  var utcMinutes = utcMinute.range;

  // node_modules/d3-time/src/hour.js
  init_define_import_meta_env();
  var timeHour = timeInterval((date2) => {
    date2.setTime(date2 - date2.getMilliseconds() - date2.getSeconds() * durationSecond - date2.getMinutes() * durationMinute);
  }, (date2, step) => {
    date2.setTime(+date2 + step * durationHour);
  }, (start, end) => {
    return (end - start) / durationHour;
  }, (date2) => {
    return date2.getHours();
  });
  var timeHours = timeHour.range;
  var utcHour = timeInterval((date2) => {
    date2.setUTCMinutes(0, 0, 0);
  }, (date2, step) => {
    date2.setTime(+date2 + step * durationHour);
  }, (start, end) => {
    return (end - start) / durationHour;
  }, (date2) => {
    return date2.getUTCHours();
  });
  var utcHours = utcHour.range;

  // node_modules/d3-time/src/day.js
  init_define_import_meta_env();
  var timeDay = timeInterval(
    (date2) => date2.setHours(0, 0, 0, 0),
    (date2, step) => date2.setDate(date2.getDate() + step),
    (start, end) => (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay,
    (date2) => date2.getDate() - 1
  );
  var timeDays = timeDay.range;
  var utcDay = timeInterval((date2) => {
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setUTCDate(date2.getUTCDate() + step);
  }, (start, end) => {
    return (end - start) / durationDay;
  }, (date2) => {
    return date2.getUTCDate() - 1;
  });
  var utcDays = utcDay.range;
  var unixDay = timeInterval((date2) => {
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setUTCDate(date2.getUTCDate() + step);
  }, (start, end) => {
    return (end - start) / durationDay;
  }, (date2) => {
    return Math.floor(date2 / durationDay);
  });
  var unixDays = unixDay.range;

  // node_modules/d3-time/src/week.js
  init_define_import_meta_env();
  function timeWeekday(i) {
    return timeInterval((date2) => {
      date2.setDate(date2.getDate() - (date2.getDay() + 7 - i) % 7);
      date2.setHours(0, 0, 0, 0);
    }, (date2, step) => {
      date2.setDate(date2.getDate() + step * 7);
    }, (start, end) => {
      return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
    });
  }
  var timeSunday = timeWeekday(0);
  var timeMonday = timeWeekday(1);
  var timeTuesday = timeWeekday(2);
  var timeWednesday = timeWeekday(3);
  var timeThursday = timeWeekday(4);
  var timeFriday = timeWeekday(5);
  var timeSaturday = timeWeekday(6);
  var timeSundays = timeSunday.range;
  var timeMondays = timeMonday.range;
  var timeTuesdays = timeTuesday.range;
  var timeWednesdays = timeWednesday.range;
  var timeThursdays = timeThursday.range;
  var timeFridays = timeFriday.range;
  var timeSaturdays = timeSaturday.range;
  function utcWeekday(i) {
    return timeInterval((date2) => {
      date2.setUTCDate(date2.getUTCDate() - (date2.getUTCDay() + 7 - i) % 7);
      date2.setUTCHours(0, 0, 0, 0);
    }, (date2, step) => {
      date2.setUTCDate(date2.getUTCDate() + step * 7);
    }, (start, end) => {
      return (end - start) / durationWeek;
    });
  }
  var utcSunday = utcWeekday(0);
  var utcMonday = utcWeekday(1);
  var utcTuesday = utcWeekday(2);
  var utcWednesday = utcWeekday(3);
  var utcThursday = utcWeekday(4);
  var utcFriday = utcWeekday(5);
  var utcSaturday = utcWeekday(6);
  var utcSundays = utcSunday.range;
  var utcMondays = utcMonday.range;
  var utcTuesdays = utcTuesday.range;
  var utcWednesdays = utcWednesday.range;
  var utcThursdays = utcThursday.range;
  var utcFridays = utcFriday.range;
  var utcSaturdays = utcSaturday.range;

  // node_modules/d3-time/src/month.js
  init_define_import_meta_env();
  var timeMonth = timeInterval((date2) => {
    date2.setDate(1);
    date2.setHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setMonth(date2.getMonth() + step);
  }, (start, end) => {
    return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
  }, (date2) => {
    return date2.getMonth();
  });
  var timeMonths = timeMonth.range;
  var utcMonth = timeInterval((date2) => {
    date2.setUTCDate(1);
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setUTCMonth(date2.getUTCMonth() + step);
  }, (start, end) => {
    return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
  }, (date2) => {
    return date2.getUTCMonth();
  });
  var utcMonths = utcMonth.range;

  // node_modules/d3-time/src/year.js
  init_define_import_meta_env();
  var timeYear = timeInterval((date2) => {
    date2.setMonth(0, 1);
    date2.setHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setFullYear(date2.getFullYear() + step);
  }, (start, end) => {
    return end.getFullYear() - start.getFullYear();
  }, (date2) => {
    return date2.getFullYear();
  });
  timeYear.every = (k) => {
    return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : timeInterval((date2) => {
      date2.setFullYear(Math.floor(date2.getFullYear() / k) * k);
      date2.setMonth(0, 1);
      date2.setHours(0, 0, 0, 0);
    }, (date2, step) => {
      date2.setFullYear(date2.getFullYear() + step * k);
    });
  };
  var timeYears = timeYear.range;
  var utcYear = timeInterval((date2) => {
    date2.setUTCMonth(0, 1);
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setUTCFullYear(date2.getUTCFullYear() + step);
  }, (start, end) => {
    return end.getUTCFullYear() - start.getUTCFullYear();
  }, (date2) => {
    return date2.getUTCFullYear();
  });
  utcYear.every = (k) => {
    return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : timeInterval((date2) => {
      date2.setUTCFullYear(Math.floor(date2.getUTCFullYear() / k) * k);
      date2.setUTCMonth(0, 1);
      date2.setUTCHours(0, 0, 0, 0);
    }, (date2, step) => {
      date2.setUTCFullYear(date2.getUTCFullYear() + step * k);
    });
  };
  var utcYears = utcYear.range;

  // node_modules/d3-time/src/ticks.js
  init_define_import_meta_env();
  function ticker(year, month, week, day, hour, minute) {
    const tickIntervals = [
      [second, 1, durationSecond],
      [second, 5, 5 * durationSecond],
      [second, 15, 15 * durationSecond],
      [second, 30, 30 * durationSecond],
      [minute, 1, durationMinute],
      [minute, 5, 5 * durationMinute],
      [minute, 15, 15 * durationMinute],
      [minute, 30, 30 * durationMinute],
      [hour, 1, durationHour],
      [hour, 3, 3 * durationHour],
      [hour, 6, 6 * durationHour],
      [hour, 12, 12 * durationHour],
      [day, 1, durationDay],
      [day, 2, 2 * durationDay],
      [week, 1, durationWeek],
      [month, 1, durationMonth],
      [month, 3, 3 * durationMonth],
      [year, 1, durationYear]
    ];
    function ticks2(start, stop, count) {
      const reverse = stop < start;
      if (reverse) [start, stop] = [stop, start];
      const interval = count && typeof count.range === "function" ? count : tickInterval(start, stop, count);
      const ticks3 = interval ? interval.range(start, +stop + 1) : [];
      return reverse ? ticks3.reverse() : ticks3;
    }
    function tickInterval(start, stop, count) {
      const target = Math.abs(stop - start) / count;
      const i = bisector(([, , step2]) => step2).right(tickIntervals, target);
      if (i === tickIntervals.length) return year.every(tickStep(start / durationYear, stop / durationYear, count));
      if (i === 0) return millisecond.every(Math.max(tickStep(start, stop, count), 1));
      const [t, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
      return t.every(step);
    }
    return [ticks2, tickInterval];
  }
  var [utcTicks, utcTickInterval] = ticker(utcYear, utcMonth, utcSunday, unixDay, utcHour, utcMinute);
  var [timeTicks, timeTickInterval] = ticker(timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute);

  // node_modules/d3-time-format/src/index.js
  init_define_import_meta_env();

  // node_modules/d3-time-format/src/defaultLocale.js
  init_define_import_meta_env();

  // node_modules/d3-time-format/src/locale.js
  init_define_import_meta_env();
  function localDate(d) {
    if (0 <= d.y && d.y < 100) {
      var date2 = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
      date2.setFullYear(d.y);
      return date2;
    }
    return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
  }
  function utcDate(d) {
    if (0 <= d.y && d.y < 100) {
      var date2 = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
      date2.setUTCFullYear(d.y);
      return date2;
    }
    return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
  }
  function newDate(y, m, d) {
    return { y, m, d, H: 0, M: 0, S: 0, L: 0 };
  }
  function formatLocale(locale3) {
    var locale_dateTime = locale3.dateTime, locale_date = locale3.date, locale_time = locale3.time, locale_periods = locale3.periods, locale_weekdays = locale3.days, locale_shortWeekdays = locale3.shortDays, locale_months = locale3.months, locale_shortMonths = locale3.shortMonths;
    var periodRe = formatRe(locale_periods), periodLookup = formatLookup(locale_periods), weekdayRe = formatRe(locale_weekdays), weekdayLookup = formatLookup(locale_weekdays), shortWeekdayRe = formatRe(locale_shortWeekdays), shortWeekdayLookup = formatLookup(locale_shortWeekdays), monthRe = formatRe(locale_months), monthLookup = formatLookup(locale_months), shortMonthRe = formatRe(locale_shortMonths), shortMonthLookup = formatLookup(locale_shortMonths);
    var formats = {
      "a": formatShortWeekday,
      "A": formatWeekday,
      "b": formatShortMonth,
      "B": formatMonth,
      "c": null,
      "d": formatDayOfMonth,
      "e": formatDayOfMonth,
      "f": formatMicroseconds,
      "g": formatYearISO,
      "G": formatFullYearISO,
      "H": formatHour24,
      "I": formatHour12,
      "j": formatDayOfYear,
      "L": formatMilliseconds,
      "m": formatMonthNumber,
      "M": formatMinutes,
      "p": formatPeriod,
      "q": formatQuarter,
      "Q": formatUnixTimestamp,
      "s": formatUnixTimestampSeconds,
      "S": formatSeconds,
      "u": formatWeekdayNumberMonday,
      "U": formatWeekNumberSunday,
      "V": formatWeekNumberISO,
      "w": formatWeekdayNumberSunday,
      "W": formatWeekNumberMonday,
      "x": null,
      "X": null,
      "y": formatYear,
      "Y": formatFullYear,
      "Z": formatZone,
      "%": formatLiteralPercent
    };
    var utcFormats = {
      "a": formatUTCShortWeekday,
      "A": formatUTCWeekday,
      "b": formatUTCShortMonth,
      "B": formatUTCMonth,
      "c": null,
      "d": formatUTCDayOfMonth,
      "e": formatUTCDayOfMonth,
      "f": formatUTCMicroseconds,
      "g": formatUTCYearISO,
      "G": formatUTCFullYearISO,
      "H": formatUTCHour24,
      "I": formatUTCHour12,
      "j": formatUTCDayOfYear,
      "L": formatUTCMilliseconds,
      "m": formatUTCMonthNumber,
      "M": formatUTCMinutes,
      "p": formatUTCPeriod,
      "q": formatUTCQuarter,
      "Q": formatUnixTimestamp,
      "s": formatUnixTimestampSeconds,
      "S": formatUTCSeconds,
      "u": formatUTCWeekdayNumberMonday,
      "U": formatUTCWeekNumberSunday,
      "V": formatUTCWeekNumberISO,
      "w": formatUTCWeekdayNumberSunday,
      "W": formatUTCWeekNumberMonday,
      "x": null,
      "X": null,
      "y": formatUTCYear,
      "Y": formatUTCFullYear,
      "Z": formatUTCZone,
      "%": formatLiteralPercent
    };
    var parses = {
      "a": parseShortWeekday,
      "A": parseWeekday,
      "b": parseShortMonth,
      "B": parseMonth,
      "c": parseLocaleDateTime,
      "d": parseDayOfMonth,
      "e": parseDayOfMonth,
      "f": parseMicroseconds,
      "g": parseYear,
      "G": parseFullYear,
      "H": parseHour24,
      "I": parseHour24,
      "j": parseDayOfYear,
      "L": parseMilliseconds,
      "m": parseMonthNumber,
      "M": parseMinutes,
      "p": parsePeriod,
      "q": parseQuarter,
      "Q": parseUnixTimestamp,
      "s": parseUnixTimestampSeconds,
      "S": parseSeconds,
      "u": parseWeekdayNumberMonday,
      "U": parseWeekNumberSunday,
      "V": parseWeekNumberISO,
      "w": parseWeekdayNumberSunday,
      "W": parseWeekNumberMonday,
      "x": parseLocaleDate,
      "X": parseLocaleTime,
      "y": parseYear,
      "Y": parseFullYear,
      "Z": parseZone,
      "%": parseLiteralPercent
    };
    formats.x = newFormat(locale_date, formats);
    formats.X = newFormat(locale_time, formats);
    formats.c = newFormat(locale_dateTime, formats);
    utcFormats.x = newFormat(locale_date, utcFormats);
    utcFormats.X = newFormat(locale_time, utcFormats);
    utcFormats.c = newFormat(locale_dateTime, utcFormats);
    function newFormat(specifier, formats2) {
      return function(date2) {
        var string = [], i = -1, j = 0, n = specifier.length, c, pad2, format2;
        if (!(date2 instanceof Date)) date2 = /* @__PURE__ */ new Date(+date2);
        while (++i < n) {
          if (specifier.charCodeAt(i) === 37) {
            string.push(specifier.slice(j, i));
            if ((pad2 = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
            else pad2 = c === "e" ? " " : "0";
            if (format2 = formats2[c]) c = format2(date2, pad2);
            string.push(c);
            j = i + 1;
          }
        }
        string.push(specifier.slice(j, i));
        return string.join("");
      };
    }
    function newParse(specifier, Z) {
      return function(string) {
        var d = newDate(1900, void 0, 1), i = parseSpecifier(d, specifier, string += "", 0), week, day;
        if (i != string.length) return null;
        if ("Q" in d) return new Date(d.Q);
        if ("s" in d) return new Date(d.s * 1e3 + ("L" in d ? d.L : 0));
        if (Z && !("Z" in d)) d.Z = 0;
        if ("p" in d) d.H = d.H % 12 + d.p * 12;
        if (d.m === void 0) d.m = "q" in d ? d.q : 0;
        if ("V" in d) {
          if (d.V < 1 || d.V > 53) return null;
          if (!("w" in d)) d.w = 1;
          if ("Z" in d) {
            week = utcDate(newDate(d.y, 0, 1)), day = week.getUTCDay();
            week = day > 4 || day === 0 ? utcMonday.ceil(week) : utcMonday(week);
            week = utcDay.offset(week, (d.V - 1) * 7);
            d.y = week.getUTCFullYear();
            d.m = week.getUTCMonth();
            d.d = week.getUTCDate() + (d.w + 6) % 7;
          } else {
            week = localDate(newDate(d.y, 0, 1)), day = week.getDay();
            week = day > 4 || day === 0 ? timeMonday.ceil(week) : timeMonday(week);
            week = timeDay.offset(week, (d.V - 1) * 7);
            d.y = week.getFullYear();
            d.m = week.getMonth();
            d.d = week.getDate() + (d.w + 6) % 7;
          }
        } else if ("W" in d || "U" in d) {
          if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
          day = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
          d.m = 0;
          d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day + 5) % 7 : d.w + d.U * 7 - (day + 6) % 7;
        }
        if ("Z" in d) {
          d.H += d.Z / 100 | 0;
          d.M += d.Z % 100;
          return utcDate(d);
        }
        return localDate(d);
      };
    }
    function parseSpecifier(d, specifier, string, j) {
      var i = 0, n = specifier.length, m = string.length, c, parse;
      while (i < n) {
        if (j >= m) return -1;
        c = specifier.charCodeAt(i++);
        if (c === 37) {
          c = specifier.charAt(i++);
          parse = parses[c in pads ? specifier.charAt(i++) : c];
          if (!parse || (j = parse(d, string, j)) < 0) return -1;
        } else if (c != string.charCodeAt(j++)) {
          return -1;
        }
      }
      return j;
    }
    function parsePeriod(d, string, i) {
      var n = periodRe.exec(string.slice(i));
      return n ? (d.p = periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseShortWeekday(d, string, i) {
      var n = shortWeekdayRe.exec(string.slice(i));
      return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseWeekday(d, string, i) {
      var n = weekdayRe.exec(string.slice(i));
      return n ? (d.w = weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseShortMonth(d, string, i) {
      var n = shortMonthRe.exec(string.slice(i));
      return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseMonth(d, string, i) {
      var n = monthRe.exec(string.slice(i));
      return n ? (d.m = monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function parseLocaleDateTime(d, string, i) {
      return parseSpecifier(d, locale_dateTime, string, i);
    }
    function parseLocaleDate(d, string, i) {
      return parseSpecifier(d, locale_date, string, i);
    }
    function parseLocaleTime(d, string, i) {
      return parseSpecifier(d, locale_time, string, i);
    }
    function formatShortWeekday(d) {
      return locale_shortWeekdays[d.getDay()];
    }
    function formatWeekday(d) {
      return locale_weekdays[d.getDay()];
    }
    function formatShortMonth(d) {
      return locale_shortMonths[d.getMonth()];
    }
    function formatMonth(d) {
      return locale_months[d.getMonth()];
    }
    function formatPeriod(d) {
      return locale_periods[+(d.getHours() >= 12)];
    }
    function formatQuarter(d) {
      return 1 + ~~(d.getMonth() / 3);
    }
    function formatUTCShortWeekday(d) {
      return locale_shortWeekdays[d.getUTCDay()];
    }
    function formatUTCWeekday(d) {
      return locale_weekdays[d.getUTCDay()];
    }
    function formatUTCShortMonth(d) {
      return locale_shortMonths[d.getUTCMonth()];
    }
    function formatUTCMonth(d) {
      return locale_months[d.getUTCMonth()];
    }
    function formatUTCPeriod(d) {
      return locale_periods[+(d.getUTCHours() >= 12)];
    }
    function formatUTCQuarter(d) {
      return 1 + ~~(d.getUTCMonth() / 3);
    }
    return {
      format: function(specifier) {
        var f = newFormat(specifier += "", formats);
        f.toString = function() {
          return specifier;
        };
        return f;
      },
      parse: function(specifier) {
        var p = newParse(specifier += "", false);
        p.toString = function() {
          return specifier;
        };
        return p;
      },
      utcFormat: function(specifier) {
        var f = newFormat(specifier += "", utcFormats);
        f.toString = function() {
          return specifier;
        };
        return f;
      },
      utcParse: function(specifier) {
        var p = newParse(specifier += "", true);
        p.toString = function() {
          return specifier;
        };
        return p;
      }
    };
  }
  var pads = { "-": "", "_": " ", "0": "0" };
  var numberRe = /^\s*\d+/;
  var percentRe = /^%/;
  var requoteRe = /[\\^$*+?|[\]().{}]/g;
  function pad(value, fill, width) {
    var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
  }
  function requote(s) {
    return s.replace(requoteRe, "\\$&");
  }
  function formatRe(names) {
    return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
  }
  function formatLookup(names) {
    return new Map(names.map((name, i) => [name.toLowerCase(), i]));
  }
  function parseWeekdayNumberSunday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.w = +n[0], i + n[0].length) : -1;
  }
  function parseWeekdayNumberMonday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.u = +n[0], i + n[0].length) : -1;
  }
  function parseWeekNumberSunday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.U = +n[0], i + n[0].length) : -1;
  }
  function parseWeekNumberISO(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.V = +n[0], i + n[0].length) : -1;
  }
  function parseWeekNumberMonday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.W = +n[0], i + n[0].length) : -1;
  }
  function parseFullYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 4));
    return n ? (d.y = +n[0], i + n[0].length) : -1;
  }
  function parseYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2e3), i + n[0].length) : -1;
  }
  function parseZone(d, string, i) {
    var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
    return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
  }
  function parseQuarter(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
  }
  function parseMonthNumber(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
  }
  function parseDayOfMonth(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.d = +n[0], i + n[0].length) : -1;
  }
  function parseDayOfYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 3));
    return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
  }
  function parseHour24(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.H = +n[0], i + n[0].length) : -1;
  }
  function parseMinutes(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.M = +n[0], i + n[0].length) : -1;
  }
  function parseSeconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? (d.S = +n[0], i + n[0].length) : -1;
  }
  function parseMilliseconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 3));
    return n ? (d.L = +n[0], i + n[0].length) : -1;
  }
  function parseMicroseconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 6));
    return n ? (d.L = Math.floor(n[0] / 1e3), i + n[0].length) : -1;
  }
  function parseLiteralPercent(d, string, i) {
    var n = percentRe.exec(string.slice(i, i + 1));
    return n ? i + n[0].length : -1;
  }
  function parseUnixTimestamp(d, string, i) {
    var n = numberRe.exec(string.slice(i));
    return n ? (d.Q = +n[0], i + n[0].length) : -1;
  }
  function parseUnixTimestampSeconds(d, string, i) {
    var n = numberRe.exec(string.slice(i));
    return n ? (d.s = +n[0], i + n[0].length) : -1;
  }
  function formatDayOfMonth(d, p) {
    return pad(d.getDate(), p, 2);
  }
  function formatHour24(d, p) {
    return pad(d.getHours(), p, 2);
  }
  function formatHour12(d, p) {
    return pad(d.getHours() % 12 || 12, p, 2);
  }
  function formatDayOfYear(d, p) {
    return pad(1 + timeDay.count(timeYear(d), d), p, 3);
  }
  function formatMilliseconds(d, p) {
    return pad(d.getMilliseconds(), p, 3);
  }
  function formatMicroseconds(d, p) {
    return formatMilliseconds(d, p) + "000";
  }
  function formatMonthNumber(d, p) {
    return pad(d.getMonth() + 1, p, 2);
  }
  function formatMinutes(d, p) {
    return pad(d.getMinutes(), p, 2);
  }
  function formatSeconds(d, p) {
    return pad(d.getSeconds(), p, 2);
  }
  function formatWeekdayNumberMonday(d) {
    var day = d.getDay();
    return day === 0 ? 7 : day;
  }
  function formatWeekNumberSunday(d, p) {
    return pad(timeSunday.count(timeYear(d) - 1, d), p, 2);
  }
  function dISO(d) {
    var day = d.getDay();
    return day >= 4 || day === 0 ? timeThursday(d) : timeThursday.ceil(d);
  }
  function formatWeekNumberISO(d, p) {
    d = dISO(d);
    return pad(timeThursday.count(timeYear(d), d) + (timeYear(d).getDay() === 4), p, 2);
  }
  function formatWeekdayNumberSunday(d) {
    return d.getDay();
  }
  function formatWeekNumberMonday(d, p) {
    return pad(timeMonday.count(timeYear(d) - 1, d), p, 2);
  }
  function formatYear(d, p) {
    return pad(d.getFullYear() % 100, p, 2);
  }
  function formatYearISO(d, p) {
    d = dISO(d);
    return pad(d.getFullYear() % 100, p, 2);
  }
  function formatFullYear(d, p) {
    return pad(d.getFullYear() % 1e4, p, 4);
  }
  function formatFullYearISO(d, p) {
    var day = d.getDay();
    d = day >= 4 || day === 0 ? timeThursday(d) : timeThursday.ceil(d);
    return pad(d.getFullYear() % 1e4, p, 4);
  }
  function formatZone(d) {
    var z = d.getTimezoneOffset();
    return (z > 0 ? "-" : (z *= -1, "+")) + pad(z / 60 | 0, "0", 2) + pad(z % 60, "0", 2);
  }
  function formatUTCDayOfMonth(d, p) {
    return pad(d.getUTCDate(), p, 2);
  }
  function formatUTCHour24(d, p) {
    return pad(d.getUTCHours(), p, 2);
  }
  function formatUTCHour12(d, p) {
    return pad(d.getUTCHours() % 12 || 12, p, 2);
  }
  function formatUTCDayOfYear(d, p) {
    return pad(1 + utcDay.count(utcYear(d), d), p, 3);
  }
  function formatUTCMilliseconds(d, p) {
    return pad(d.getUTCMilliseconds(), p, 3);
  }
  function formatUTCMicroseconds(d, p) {
    return formatUTCMilliseconds(d, p) + "000";
  }
  function formatUTCMonthNumber(d, p) {
    return pad(d.getUTCMonth() + 1, p, 2);
  }
  function formatUTCMinutes(d, p) {
    return pad(d.getUTCMinutes(), p, 2);
  }
  function formatUTCSeconds(d, p) {
    return pad(d.getUTCSeconds(), p, 2);
  }
  function formatUTCWeekdayNumberMonday(d) {
    var dow = d.getUTCDay();
    return dow === 0 ? 7 : dow;
  }
  function formatUTCWeekNumberSunday(d, p) {
    return pad(utcSunday.count(utcYear(d) - 1, d), p, 2);
  }
  function UTCdISO(d) {
    var day = d.getUTCDay();
    return day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
  }
  function formatUTCWeekNumberISO(d, p) {
    d = UTCdISO(d);
    return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
  }
  function formatUTCWeekdayNumberSunday(d) {
    return d.getUTCDay();
  }
  function formatUTCWeekNumberMonday(d, p) {
    return pad(utcMonday.count(utcYear(d) - 1, d), p, 2);
  }
  function formatUTCYear(d, p) {
    return pad(d.getUTCFullYear() % 100, p, 2);
  }
  function formatUTCYearISO(d, p) {
    d = UTCdISO(d);
    return pad(d.getUTCFullYear() % 100, p, 2);
  }
  function formatUTCFullYear(d, p) {
    return pad(d.getUTCFullYear() % 1e4, p, 4);
  }
  function formatUTCFullYearISO(d, p) {
    var day = d.getUTCDay();
    d = day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
    return pad(d.getUTCFullYear() % 1e4, p, 4);
  }
  function formatUTCZone() {
    return "+0000";
  }
  function formatLiteralPercent() {
    return "%";
  }
  function formatUnixTimestamp(d) {
    return +d;
  }
  function formatUnixTimestampSeconds(d) {
    return Math.floor(+d / 1e3);
  }

  // node_modules/d3-time-format/src/defaultLocale.js
  var locale2;
  var timeFormat;
  var timeParse;
  var utcFormat;
  var utcParse;
  defaultLocale2({
    dateTime: "%x, %X",
    date: "%-m/%-d/%Y",
    time: "%-I:%M:%S %p",
    periods: ["AM", "PM"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  });
  function defaultLocale2(definition) {
    locale2 = formatLocale(definition);
    timeFormat = locale2.format;
    timeParse = locale2.parse;
    utcFormat = locale2.utcFormat;
    utcParse = locale2.utcParse;
    return locale2;
  }

  // node_modules/d3-scale/src/time.js
  function date(t) {
    return new Date(t);
  }
  function number3(t) {
    return t instanceof Date ? +t : +/* @__PURE__ */ new Date(+t);
  }
  function calendar(ticks2, tickInterval, year, month, week, day, hour, minute, second2, format2) {
    var scale = continuous(), invert = scale.invert, domain = scale.domain;
    var formatMillisecond = format2(".%L"), formatSecond = format2(":%S"), formatMinute = format2("%I:%M"), formatHour = format2("%I %p"), formatDay = format2("%a %d"), formatWeek = format2("%b %d"), formatMonth = format2("%B"), formatYear2 = format2("%Y");
    function tickFormat2(date2) {
      return (second2(date2) < date2 ? formatMillisecond : minute(date2) < date2 ? formatSecond : hour(date2) < date2 ? formatMinute : day(date2) < date2 ? formatHour : month(date2) < date2 ? week(date2) < date2 ? formatDay : formatWeek : year(date2) < date2 ? formatMonth : formatYear2)(date2);
    }
    scale.invert = function(y) {
      return new Date(invert(y));
    };
    scale.domain = function(_) {
      return arguments.length ? domain(Array.from(_, number3)) : domain().map(date);
    };
    scale.ticks = function(interval) {
      var d = domain();
      return ticks2(d[0], d[d.length - 1], interval == null ? 10 : interval);
    };
    scale.tickFormat = function(count, specifier) {
      return specifier == null ? tickFormat2 : format2(specifier);
    };
    scale.nice = function(interval) {
      var d = domain();
      if (!interval || typeof interval.range !== "function") interval = tickInterval(d[0], d[d.length - 1], interval == null ? 10 : interval);
      return interval ? domain(nice(d, interval)) : scale;
    };
    scale.copy = function() {
      return copy(scale, calendar(ticks2, tickInterval, year, month, week, day, hour, minute, second2, format2));
    };
    return scale;
  }
  function time() {
    return initRange.apply(calendar(timeTicks, timeTickInterval, timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute, second, timeFormat).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]), arguments);
  }

  // node_modules/d3-scale/src/utcTime.js
  init_define_import_meta_env();
  function utcTime() {
    return initRange.apply(calendar(utcTicks, utcTickInterval, utcYear, utcMonth, utcSunday, utcDay, utcHour, utcMinute, second, utcFormat).domain([Date.UTC(2e3, 0, 1), Date.UTC(2e3, 0, 2)]), arguments);
  }

  // node_modules/d3-scale/src/sequential.js
  init_define_import_meta_env();
  function transformer2() {
    var x0 = 0, x1 = 1, t02, t12, k10, transform, interpolator = identity, clamp = false, unknown;
    function scale(x) {
      return x == null || isNaN(x = +x) ? unknown : interpolator(k10 === 0 ? 0.5 : (x = (transform(x) - t02) * k10, clamp ? Math.max(0, Math.min(1, x)) : x));
    }
    scale.domain = function(_) {
      return arguments.length ? ([x0, x1] = _, t02 = transform(x0 = +x0), t12 = transform(x1 = +x1), k10 = t02 === t12 ? 0 : 1 / (t12 - t02), scale) : [x0, x1];
    };
    scale.clamp = function(_) {
      return arguments.length ? (clamp = !!_, scale) : clamp;
    };
    scale.interpolator = function(_) {
      return arguments.length ? (interpolator = _, scale) : interpolator;
    };
    function range3(interpolate2) {
      return function(_) {
        var r0, r1;
        return arguments.length ? ([r0, r1] = _, interpolator = interpolate2(r0, r1), scale) : [interpolator(0), interpolator(1)];
      };
    }
    scale.range = range3(value_default);
    scale.rangeRound = range3(round_default);
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    return function(t) {
      transform = t, t02 = t(x0), t12 = t(x1), k10 = t02 === t12 ? 0 : 1 / (t12 - t02);
      return scale;
    };
  }
  function copy2(source, target) {
    return target.domain(source.domain()).interpolator(source.interpolator()).clamp(source.clamp()).unknown(source.unknown());
  }
  function sequential() {
    var scale = linearish(transformer2()(identity));
    scale.copy = function() {
      return copy2(scale, sequential());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function sequentialLog() {
    var scale = loggish(transformer2()).domain([1, 10]);
    scale.copy = function() {
      return copy2(scale, sequentialLog()).base(scale.base());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function sequentialSymlog() {
    var scale = symlogish(transformer2());
    scale.copy = function() {
      return copy2(scale, sequentialSymlog()).constant(scale.constant());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function sequentialPow() {
    var scale = powish(transformer2());
    scale.copy = function() {
      return copy2(scale, sequentialPow()).exponent(scale.exponent());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function sequentialSqrt() {
    return sequentialPow.apply(null, arguments).exponent(0.5);
  }

  // node_modules/d3-scale/src/sequentialQuantile.js
  init_define_import_meta_env();
  function sequentialQuantile() {
    var domain = [], interpolator = identity;
    function scale(x) {
      if (x != null && !isNaN(x = +x)) return interpolator((bisect_default(domain, x, 1) - 1) / (domain.length - 1));
    }
    scale.domain = function(_) {
      if (!arguments.length) return domain.slice();
      domain = [];
      for (let d of _) if (d != null && !isNaN(d = +d)) domain.push(d);
      domain.sort(ascending);
      return scale;
    };
    scale.interpolator = function(_) {
      return arguments.length ? (interpolator = _, scale) : interpolator;
    };
    scale.range = function() {
      return domain.map((d, i) => interpolator(i / (domain.length - 1)));
    };
    scale.quantiles = function(n) {
      return Array.from({ length: n + 1 }, (_, i) => quantile(domain, i / n));
    };
    scale.copy = function() {
      return sequentialQuantile(interpolator).domain(domain);
    };
    return initInterpolator.apply(scale, arguments);
  }

  // node_modules/d3-scale/src/diverging.js
  init_define_import_meta_env();
  function transformer3() {
    var x0 = 0, x1 = 0.5, x2 = 1, s = 1, t02, t12, t2, k10, k21, interpolator = identity, transform, clamp = false, unknown;
    function scale(x) {
      return isNaN(x = +x) ? unknown : (x = 0.5 + ((x = +transform(x)) - t12) * (s * x < s * t12 ? k10 : k21), interpolator(clamp ? Math.max(0, Math.min(1, x)) : x));
    }
    scale.domain = function(_) {
      return arguments.length ? ([x0, x1, x2] = _, t02 = transform(x0 = +x0), t12 = transform(x1 = +x1), t2 = transform(x2 = +x2), k10 = t02 === t12 ? 0 : 0.5 / (t12 - t02), k21 = t12 === t2 ? 0 : 0.5 / (t2 - t12), s = t12 < t02 ? -1 : 1, scale) : [x0, x1, x2];
    };
    scale.clamp = function(_) {
      return arguments.length ? (clamp = !!_, scale) : clamp;
    };
    scale.interpolator = function(_) {
      return arguments.length ? (interpolator = _, scale) : interpolator;
    };
    function range3(interpolate2) {
      return function(_) {
        var r0, r1, r2;
        return arguments.length ? ([r0, r1, r2] = _, interpolator = piecewise(interpolate2, [r0, r1, r2]), scale) : [interpolator(0), interpolator(0.5), interpolator(1)];
      };
    }
    scale.range = range3(value_default);
    scale.rangeRound = range3(round_default);
    scale.unknown = function(_) {
      return arguments.length ? (unknown = _, scale) : unknown;
    };
    return function(t) {
      transform = t, t02 = t(x0), t12 = t(x1), t2 = t(x2), k10 = t02 === t12 ? 0 : 0.5 / (t12 - t02), k21 = t12 === t2 ? 0 : 0.5 / (t2 - t12), s = t12 < t02 ? -1 : 1;
      return scale;
    };
  }
  function diverging() {
    var scale = linearish(transformer3()(identity));
    scale.copy = function() {
      return copy2(scale, diverging());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function divergingLog() {
    var scale = loggish(transformer3()).domain([0.1, 1, 10]);
    scale.copy = function() {
      return copy2(scale, divergingLog()).base(scale.base());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function divergingSymlog() {
    var scale = symlogish(transformer3());
    scale.copy = function() {
      return copy2(scale, divergingSymlog()).constant(scale.constant());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function divergingPow() {
    var scale = powish(transformer3());
    scale.copy = function() {
      return copy2(scale, divergingPow()).exponent(scale.exponent());
    };
    return initInterpolator.apply(scale, arguments);
  }
  function divergingSqrt() {
    return divergingPow.apply(null, arguments).exponent(0.5);
  }

  // node_modules/recharts/es6/state/selectors/combiners/combineConfiguredScale.js
  function getD3ScaleFromType(realScaleType) {
    var scales = d3_scale_exports;
    if (realScaleType in scales && typeof scales[realScaleType] === "function") {
      return scales[realScaleType]();
    }
    var name = "scale".concat(upperFirst(realScaleType));
    if (name in scales && typeof scales[name] === "function") {
      return scales[name]();
    }
    return void 0;
  }
  function combineConfiguredScaleInternal(scale, axisDomain, axisRange) {
    if (typeof scale === "function") {
      return scale.copy().domain(axisDomain).range(axisRange);
    }
    if (scale == null) {
      return void 0;
    }
    var d3ScaleFunction = getD3ScaleFromType(scale);
    if (d3ScaleFunction == null) {
      return void 0;
    }
    d3ScaleFunction.domain(axisDomain).range(axisRange);
    return d3ScaleFunction;
  }
  function combineConfiguredScale(axis, realScaleType, axisDomain, axisRange) {
    if (axisDomain == null || axisRange == null) {
      return void 0;
    }
    if (typeof axis.scale === "function") {
      return combineConfiguredScaleInternal(axis.scale, axisDomain, axisRange);
    }
    return combineConfiguredScaleInternal(realScaleType, axisDomain, axisRange);
  }

  // node_modules/recharts/es6/state/selectors/combiners/combineRealScaleType.js
  init_define_import_meta_env();
  function getD3ScaleName(name) {
    return "scale".concat(upperFirst(name));
  }
  function isSupportedScaleName(name) {
    return getD3ScaleName(name) in d3_scale_exports;
  }
  var combineRealScaleType = (axisConfig, hasBar, chartType) => {
    if (axisConfig == null) {
      return void 0;
    }
    var scale = axisConfig.scale, type = axisConfig.type;
    if (scale === "auto") {
      if (type === "category" && chartType && (chartType.indexOf("LineChart") >= 0 || chartType.indexOf("AreaChart") >= 0 || chartType.indexOf("ComposedChart") >= 0 && !hasBar)) {
        return "point";
      }
      if (type === "category") {
        return "band";
      }
      return "linear";
    }
    if (typeof scale === "string") {
      return isSupportedScaleName(scale) ? scale : "point";
    }
    return void 0;
  };

  // node_modules/recharts/es6/util/scale/createCategoricalInverse.js
  init_define_import_meta_env();
  function bisect(haystack, needle) {
    var lo = 0;
    var hi = haystack.length;
    var ascending2 = haystack[0] < haystack[haystack.length - 1];
    while (lo < hi) {
      var mid = Math.floor((lo + hi) / 2);
      if (ascending2 ? haystack[mid] < needle : haystack[mid] > needle) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }
  function createCategoricalInverse(scale, allDataPointsOnAxis) {
    if (!scale) {
      return void 0;
    }
    var domain = allDataPointsOnAxis !== null && allDataPointsOnAxis !== void 0 ? allDataPointsOnAxis : scale.domain();
    var pixelPositions = domain.map((d) => {
      var _scale;
      return (_scale = scale(d)) !== null && _scale !== void 0 ? _scale : 0;
    });
    var range3 = scale.range();
    if (domain.length === 0 || range3.length < 2) {
      return void 0;
    }
    return (pixelValue) => {
      var _pixelPositions, _pixelPositions$index;
      var index = bisect(pixelPositions, pixelValue);
      if (index <= 0) {
        return domain[0];
      }
      if (index >= domain.length) {
        return domain[domain.length - 1];
      }
      var leftPixel = (_pixelPositions = pixelPositions[index - 1]) !== null && _pixelPositions !== void 0 ? _pixelPositions : 0;
      var rightPixel = (_pixelPositions$index = pixelPositions[index]) !== null && _pixelPositions$index !== void 0 ? _pixelPositions$index : 0;
      if (Math.abs(pixelValue - leftPixel) <= Math.abs(pixelValue - rightPixel)) {
        return domain[index - 1];
      }
      return domain[index];
    };
  }

  // node_modules/recharts/es6/state/selectors/combiners/combineInverseScaleFunction.js
  init_define_import_meta_env();
  function combineInverseScaleFunction(configuredScale) {
    if (configuredScale == null) {
      return void 0;
    }
    if ("invert" in configuredScale && typeof configuredScale.invert === "function") {
      return configuredScale.invert.bind(configuredScale);
    }
    return createCategoricalInverse(configuredScale, void 0);
  }

  // node_modules/recharts/es6/state/selectors/axisSelectors.js
  function ownKeys7(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread7(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys7(Object(t), true).forEach(function(r3) {
        _defineProperty8(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys7(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty8(e, r2, t) {
    return (r2 = _toPropertyKey8(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey8(t) {
    var i = _toPrimitive8(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive8(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function _slicedToArray6(r2, e) {
    return _arrayWithHoles6(r2) || _iterableToArrayLimit6(r2, e) || _unsupportedIterableToArray6(r2, e) || _nonIterableRest6();
  }
  function _nonIterableRest6() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray6(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray6(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray6(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray6(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit6(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles6(r2) {
    if (Array.isArray(r2)) return r2;
  }
  var defaultNumericDomain = [0, "auto"];
  var implicitXAxis = {
    allowDataOverflow: false,
    allowDecimals: true,
    allowDuplicatedCategory: true,
    angle: 0,
    dataKey: void 0,
    domain: void 0,
    height: 30,
    hide: true,
    id: 0,
    includeHidden: false,
    interval: "preserveEnd",
    minTickGap: 5,
    mirror: false,
    name: void 0,
    orientation: "bottom",
    padding: {
      left: 0,
      right: 0
    },
    reversed: false,
    scale: "auto",
    tick: true,
    tickCount: 5,
    tickFormatter: void 0,
    ticks: void 0,
    type: "category",
    unit: void 0,
    niceTicks: "auto"
  };
  var selectXAxisSettingsNoDefaults = (state, axisId) => {
    return state.cartesianAxis.xAxis[axisId];
  };
  var selectXAxisSettings = (state, axisId) => {
    var axis = selectXAxisSettingsNoDefaults(state, axisId);
    if (axis == null) {
      return implicitXAxis;
    }
    return axis;
  };
  var implicitYAxis = {
    allowDataOverflow: false,
    allowDecimals: true,
    allowDuplicatedCategory: true,
    angle: 0,
    dataKey: void 0,
    domain: defaultNumericDomain,
    hide: true,
    id: 0,
    includeHidden: false,
    interval: "preserveEnd",
    minTickGap: 5,
    mirror: false,
    name: void 0,
    orientation: "left",
    padding: {
      top: 0,
      bottom: 0
    },
    reversed: false,
    scale: "auto",
    tick: true,
    tickCount: 5,
    tickFormatter: void 0,
    ticks: void 0,
    type: "number",
    unit: void 0,
    niceTicks: "auto",
    width: DEFAULT_Y_AXIS_WIDTH
  };
  var selectYAxisSettingsNoDefaults = (state, axisId) => {
    return state.cartesianAxis.yAxis[axisId];
  };
  var selectYAxisSettings = (state, axisId) => {
    var axis = selectYAxisSettingsNoDefaults(state, axisId);
    if (axis == null) {
      return implicitYAxis;
    }
    return axis;
  };
  var implicitZAxis = {
    domain: [0, "auto"],
    includeHidden: false,
    reversed: false,
    allowDataOverflow: false,
    allowDuplicatedCategory: false,
    dataKey: void 0,
    id: 0,
    name: "",
    range: [64, 64],
    scale: "auto",
    type: "number",
    unit: ""
  };
  var selectZAxisSettings = (state, axisId) => {
    var axis = state.cartesianAxis.zAxis[axisId];
    if (axis == null) {
      return implicitZAxis;
    }
    return axis;
  };
  var selectBaseAxis = (state, axisType, axisId) => {
    switch (axisType) {
      case "xAxis": {
        return selectXAxisSettings(state, axisId);
      }
      case "yAxis": {
        return selectYAxisSettings(state, axisId);
      }
      case "zAxis": {
        return selectZAxisSettings(state, axisId);
      }
      case "angleAxis": {
        return selectAngleAxis(state, axisId);
      }
      case "radiusAxis": {
        return selectRadiusAxis(state, axisId);
      }
      default:
        throw new Error("Unexpected axis type: ".concat(axisType));
    }
  };
  var selectCartesianAxisSettings = (state, axisType, axisId) => {
    switch (axisType) {
      case "xAxis": {
        return selectXAxisSettings(state, axisId);
      }
      case "yAxis": {
        return selectYAxisSettings(state, axisId);
      }
      default:
        throw new Error("Unexpected axis type: ".concat(axisType));
    }
  };
  var selectRenderableAxisSettings = (state, axisType, axisId) => {
    switch (axisType) {
      case "xAxis": {
        return selectXAxisSettings(state, axisId);
      }
      case "yAxis": {
        return selectYAxisSettings(state, axisId);
      }
      case "angleAxis": {
        return selectAngleAxis(state, axisId);
      }
      case "radiusAxis": {
        return selectRadiusAxis(state, axisId);
      }
      default:
        throw new Error("Unexpected axis type: ".concat(axisType));
    }
  };
  var selectHasBar = (state) => state.graphicalItems.cartesianItems.some((item) => item.type === "bar") || state.graphicalItems.polarItems.some((item) => item.type === "radialBar");
  function itemAxisPredicate(axisType, axisId) {
    return (item) => {
      switch (axisType) {
        case "xAxis":
          return "xAxisId" in item && item.xAxisId === axisId;
        case "yAxis":
          return "yAxisId" in item && item.yAxisId === axisId;
        case "zAxis":
          return "zAxisId" in item && item.zAxisId === axisId;
        case "angleAxis":
          return "angleAxisId" in item && item.angleAxisId === axisId;
        case "radiusAxis":
          return "radiusAxisId" in item && item.radiusAxisId === axisId;
        default:
          return false;
      }
    };
  }
  var selectUnfilteredCartesianItems = (state) => state.graphicalItems.cartesianItems;
  var selectAxisPredicate = createSelector([pickAxisType, pickAxisId], itemAxisPredicate);
  var combineGraphicalItemsSettings = (graphicalItems, axisSettings, axisPredicate) => graphicalItems.filter(axisPredicate).filter((item) => {
    if ((axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.includeHidden) === true) {
      return true;
    }
    return !item.hide;
  });
  var selectCartesianItemsSettings = createSelector([selectUnfilteredCartesianItems, selectBaseAxis, selectAxisPredicate], combineGraphicalItemsSettings, {
    memoizeOptions: {
      resultEqualityCheck: emptyArraysAreEqualCheck
    }
  });
  var selectStackedCartesianItemsSettings = createSelector([selectCartesianItemsSettings], (cartesianItems) => {
    return cartesianItems.filter((item) => item.type === "area" || item.type === "bar").filter(isStacked);
  });
  var filterGraphicalNotStackedItems = (cartesianItems) => cartesianItems.filter((item) => !("stackId" in item) || item.stackId === void 0);
  var selectCartesianItemsSettingsExceptStacked = createSelector([selectCartesianItemsSettings], filterGraphicalNotStackedItems);
  var combineGraphicalItemsData = (cartesianItems) => cartesianItems.map((item) => item.data).filter(Boolean).flat(1);
  var selectAnyCartesianItemsUsesChartData = createSelector([selectCartesianItemsSettings], (items) => items.some((item) => !item.data));
  var selectCartesianGraphicalItemsData = createSelector([selectCartesianItemsSettings], combineGraphicalItemsData, {
    memoizeOptions: {
      resultEqualityCheck: emptyArraysAreEqualCheck
    }
  });
  var combineDisplayedData = (graphicalItemsData, _ref2) => {
    var _ref$chartData = _ref2.chartData, chartData = _ref$chartData === void 0 ? [] : _ref$chartData, dataStartIndex = _ref2.dataStartIndex, dataEndIndex = _ref2.dataEndIndex;
    if (graphicalItemsData.length > 0) {
      return graphicalItemsData;
    }
    return chartData.slice(dataStartIndex, dataEndIndex + 1);
  };
  var selectDisplayedData = createSelector([selectCartesianGraphicalItemsData, selectChartDataWithIndexesIfNotInPanoramaPosition4], combineDisplayedData);
  var combineAppliedValues = (data2, axisSettings, items) => {
    if ((axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.dataKey) != null) {
      return data2.map((item) => ({
        value: getValueByDataKey(item, axisSettings.dataKey)
      }));
    }
    if (items.length > 0) {
      return items.map((item) => item.dataKey).flatMap((dataKey) => data2.map((entry) => ({
        value: getValueByDataKey(entry, dataKey)
      })));
    }
    return data2.map((entry) => ({
      value: entry
    }));
  };
  var combineAllAppliedValues = (displayedData, axisSettings, items, _ref2, anyItemUsesChartData, graphicalItemsData) => {
    var _ref2$chartData = _ref2.chartData, chartData = _ref2$chartData === void 0 ? [] : _ref2$chartData, dataStartIndex = _ref2.dataStartIndex, dataEndIndex = _ref2.dataEndIndex;
    var appliedValues = combineAppliedValues(displayedData, axisSettings, items);
    if (anyItemUsesChartData && (axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.dataKey) != null && graphicalItemsData.length > 0) {
      var chartDataSlice2 = chartData.slice(dataStartIndex, dataEndIndex + 1);
      var chartAppliedValues = chartDataSlice2.map((item) => ({
        value: getValueByDataKey(item, axisSettings.dataKey)
      })).filter((av) => av.value != null);
      return [...chartAppliedValues, ...appliedValues];
    }
    return appliedValues;
  };
  var selectAllAppliedValues = createSelector([selectDisplayedData, selectBaseAxis, selectCartesianItemsSettings, selectChartDataWithIndexesIfNotInPanoramaPosition4, selectAnyCartesianItemsUsesChartData, selectCartesianGraphicalItemsData], combineAllAppliedValues);
  function makeNumber(val) {
    if (isNumOrStr(val) || val instanceof Date) {
      var n = Number(val);
      if (isWellBehavedNumber(n)) {
        return n;
      }
    }
    return void 0;
  }
  function makeDomain(val) {
    if (Array.isArray(val)) {
      var attempt = [makeNumber(val[0]), makeNumber(val[1])];
      if (isWellFormedNumberDomain(attempt)) {
        return attempt;
      }
      return void 0;
    }
    var n = makeNumber(val);
    if (n == null) {
      return void 0;
    }
    return [n, n];
  }
  function onlyAllowNumbers(data2) {
    return data2.map(makeNumber).filter(isNotNil);
  }
  function sortBy2(a, b) {
    var aNum = makeNumber(a);
    var bNum = makeNumber(b);
    if (aNum == null && bNum == null) {
      return 0;
    }
    if (aNum == null) {
      return -1;
    }
    if (bNum == null) {
      return 1;
    }
    return aNum - bNum;
  }
  var selectSortedDataPoints = createSelector([selectAllAppliedValues], (appliedData) => {
    return appliedData === null || appliedData === void 0 ? void 0 : appliedData.map((item) => item.value).sort(sortBy2);
  });
  function isErrorBarRelevantForAxisType(axisType, errorBar) {
    switch (axisType) {
      case "xAxis":
        return errorBar.direction === "x";
      case "yAxis":
        return errorBar.direction === "y";
      default:
        return false;
    }
  }
  function getErrorDomainByDataKey(entry, appliedValue, relevantErrorBars) {
    if (!relevantErrorBars) {
      return [];
    }
    if (!relevantErrorBars.length) {
      return [];
    }
    var appliedNumericValue;
    if (typeof appliedValue === "number" && !isNan(appliedValue)) {
      appliedNumericValue = appliedValue;
    } else if (Array.isArray(appliedValue)) {
      var numericRangeValues = onlyAllowNumbers(appliedValue);
      if (numericRangeValues.length > 0) {
        appliedNumericValue = Math.max(...numericRangeValues);
      }
    }
    if (appliedNumericValue == null) {
      return [];
    }
    return onlyAllowNumbers(relevantErrorBars.flatMap((eb) => {
      var errorValue = getValueByDataKey(entry, eb.dataKey);
      var lowBound, highBound;
      if (Array.isArray(errorValue)) {
        var _errorValue = _slicedToArray6(errorValue, 2);
        lowBound = _errorValue[0];
        highBound = _errorValue[1];
      } else {
        lowBound = highBound = errorValue;
      }
      if (!isWellBehavedNumber(lowBound) || !isWellBehavedNumber(highBound)) {
        return void 0;
      }
      return [appliedNumericValue - lowBound, appliedNumericValue + highBound];
    }));
  }
  var selectTooltipAxis = (state) => {
    var axisType = selectTooltipAxisType(state);
    var axisId = selectTooltipAxisId(state);
    return selectRenderableAxisSettings(state, axisType, axisId);
  };
  var selectTooltipAxisDataKey = createSelector([selectTooltipAxis], (axis) => axis === null || axis === void 0 ? void 0 : axis.dataKey);
  var selectDisplayedStackedData = createSelector([selectStackedCartesianItemsSettings, selectChartDataWithIndexesIfNotInPanoramaPosition4, selectTooltipAxis], combineDisplayedStackedData);
  var combineStackGroups = (displayedData, items, stackOffsetType, reverseStackOrder) => {
    var initialItemsGroups = {};
    var itemsGroup = items.reduce((acc, item) => {
      if (item.stackId == null) {
        return acc;
      }
      var stack = acc[item.stackId];
      if (stack == null) {
        stack = [];
      }
      stack.push(item);
      acc[item.stackId] = stack;
      return acc;
    }, initialItemsGroups);
    return Object.fromEntries(Object.entries(itemsGroup).map((_ref3) => {
      var _ref4 = _slicedToArray6(_ref3, 2), stackId = _ref4[0], graphicalItems = _ref4[1];
      var orderedGraphicalItems = reverseStackOrder ? [...graphicalItems].reverse() : graphicalItems;
      var dataKeys = orderedGraphicalItems.map(getStackSeriesIdentifier);
      return [stackId, {
        // @ts-expect-error getStackedData requires that the input is array of objects, Recharts does not test for that
        stackedData: getStackedData(displayedData, dataKeys, stackOffsetType),
        graphicalItems: orderedGraphicalItems
      }];
    }));
  };
  var selectStackGroups = createSelector([selectDisplayedStackedData, selectStackedCartesianItemsSettings, selectStackOffsetType, selectReverseStackOrder], combineStackGroups);
  var combineDomainOfStackGroups = (stackGroups, _ref5, axisType, domainFromUserPreference) => {
    var dataStartIndex = _ref5.dataStartIndex, dataEndIndex = _ref5.dataEndIndex;
    if (domainFromUserPreference != null) {
      return void 0;
    }
    if (axisType === "zAxis") {
      return void 0;
    }
    return getDomainOfStackGroups(stackGroups, dataStartIndex, dataEndIndex);
  };
  var selectAllowsDataOverflow = createSelector([selectBaseAxis], (axisSettings) => axisSettings.allowDataOverflow);
  var getDomainDefinition = (axisSettings) => {
    var _axisSettings$domain;
    if (axisSettings == null || !("domain" in axisSettings)) {
      return defaultNumericDomain;
    }
    if (axisSettings.domain != null) {
      return axisSettings.domain;
    }
    if ("ticks" in axisSettings && axisSettings.ticks != null) {
      if (axisSettings.type === "number") {
        var allValues = onlyAllowNumbers(axisSettings.ticks);
        return [Math.min(...allValues), Math.max(...allValues)];
      }
      if (axisSettings.type === "category") {
        return axisSettings.ticks.map(String);
      }
    }
    return (_axisSettings$domain = axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.domain) !== null && _axisSettings$domain !== void 0 ? _axisSettings$domain : defaultNumericDomain;
  };
  var selectDomainDefinition = createSelector([selectBaseAxis], getDomainDefinition);
  var selectDomainFromUserPreference = createSelector([selectDomainDefinition, selectAllowsDataOverflow], numericalDomainSpecifiedWithoutRequiringData);
  var selectDomainOfStackGroups = createSelector([selectStackGroups, selectChartDataWithIndexes, pickAxisType, selectDomainFromUserPreference], combineDomainOfStackGroups, {
    memoizeOptions: {
      resultEqualityCheck: numberDomainEqualityCheck
    }
  });
  var selectAllErrorBarSettings = (state) => state.errorBars;
  var combineRelevantErrorBarSettings = (cartesianItemsSettings, allErrorBarSettings, axisType) => {
    return cartesianItemsSettings.flatMap((item) => {
      return allErrorBarSettings[item.id];
    }).filter(Boolean).filter((e) => {
      return isErrorBarRelevantForAxisType(axisType, e);
    });
  };
  var mergeDomains = function mergeDomains2() {
    for (var _len = arguments.length, domains = new Array(_len), _key = 0; _key < _len; _key++) {
      domains[_key] = arguments[_key];
    }
    var allDomains = domains.filter(Boolean);
    if (allDomains.length === 0) {
      return void 0;
    }
    var allValues = allDomains.flat();
    var min2 = Math.min(...allValues);
    var max2 = Math.max(...allValues);
    return [min2, max2];
  };
  var combineDomainOfAllAppliedNumericalValuesIncludingErrorValues = function combineDomainOfAllAppliedNumericalValuesIncludingErrorValues2(displayedData, axisSettings, items, errorBars, axisType) {
    var chartDataSlice2 = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : [];
    var lowerEnd, upperEnd;
    if (items.length > 0) {
      items.forEach((item) => {
        var _errorBars$item$id;
        var itemData = item.data != null ? [...item.data] : chartDataSlice2;
        var relevantErrorBars = (_errorBars$item$id = errorBars[item.id]) === null || _errorBars$item$id === void 0 ? void 0 : _errorBars$item$id.filter((errorBar) => isErrorBarRelevantForAxisType(axisType, errorBar));
        itemData.forEach((entry) => {
          var _axisSettings$dataKey;
          var valueByDataKey = getValueByDataKey(entry, (_axisSettings$dataKey = axisSettings.dataKey) !== null && _axisSettings$dataKey !== void 0 ? _axisSettings$dataKey : item.dataKey);
          var errorDomain = getErrorDomainByDataKey(entry, valueByDataKey, relevantErrorBars);
          if (errorDomain.length >= 2) {
            var localLower = Math.min(...errorDomain);
            var localUpper = Math.max(...errorDomain);
            if (lowerEnd == null || localLower < lowerEnd) {
              lowerEnd = localLower;
            }
            if (upperEnd == null || localUpper > upperEnd) {
              upperEnd = localUpper;
            }
          }
          var dataValueDomain = makeDomain(valueByDataKey);
          if (dataValueDomain != null) {
            lowerEnd = lowerEnd == null ? dataValueDomain[0] : Math.min(lowerEnd, dataValueDomain[0]);
            upperEnd = upperEnd == null ? dataValueDomain[1] : Math.max(upperEnd, dataValueDomain[1]);
          }
        });
      });
    }
    if ((axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.dataKey) != null && items.length === 0) {
      displayedData.forEach((item) => {
        var dataValueDomain = makeDomain(getValueByDataKey(item, axisSettings.dataKey));
        if (dataValueDomain != null) {
          lowerEnd = lowerEnd == null ? dataValueDomain[0] : Math.min(lowerEnd, dataValueDomain[0]);
          upperEnd = upperEnd == null ? dataValueDomain[1] : Math.max(upperEnd, dataValueDomain[1]);
        }
      });
    }
    if (isWellBehavedNumber(lowerEnd) && isWellBehavedNumber(upperEnd)) {
      return [lowerEnd, upperEnd];
    }
    return void 0;
  };
  var selectDomainOfAllAppliedNumericalValuesIncludingErrorValues = createSelector([selectDisplayedData, selectBaseAxis, selectCartesianItemsSettingsExceptStacked, selectAllErrorBarSettings, pickAxisType, selectChartDataSliceIfNotInPanorama], combineDomainOfAllAppliedNumericalValuesIncludingErrorValues, {
    memoizeOptions: {
      resultEqualityCheck: numberDomainEqualityCheck
    }
  });
  function onlyAllowNumbersAndStringsAndDates(item) {
    var value = item.value;
    if (isNumOrStr(value) || value instanceof Date) {
      return value;
    }
    return void 0;
  }
  var computeDomainOfTypeCategory = (allDataSquished, axisSettings, isCategorical) => {
    var categoricalDomain = allDataSquished.map(onlyAllowNumbersAndStringsAndDates).filter((v) => v != null);
    if (isCategorical && (axisSettings.dataKey == null || axisSettings.allowDuplicatedCategory && hasDuplicate(categoricalDomain))) {
      return range(0, allDataSquished.length);
    }
    if (axisSettings.allowDuplicatedCategory) {
      return categoricalDomain;
    }
    return Array.from(new Set(categoricalDomain));
  };
  var selectReferenceDots = (state) => state.referenceElements.dots;
  var filterReferenceElements = (elements, axisType, axisId) => {
    return elements.filter((el) => el.ifOverflow === "extendDomain").filter((el) => {
      if (axisType === "xAxis") {
        return el.xAxisId === axisId;
      }
      return el.yAxisId === axisId;
    });
  };
  var selectReferenceDotsByAxis = createSelector([selectReferenceDots, pickAxisType, pickAxisId], filterReferenceElements);
  var selectReferenceAreas = (state) => state.referenceElements.areas;
  var selectReferenceAreasByAxis = createSelector([selectReferenceAreas, pickAxisType, pickAxisId], filterReferenceElements);
  var selectReferenceLines = (state) => state.referenceElements.lines;
  var selectReferenceLinesByAxis = createSelector([selectReferenceLines, pickAxisType, pickAxisId], filterReferenceElements);
  var combineDotsDomain = (dots, axisType) => {
    if (dots == null) {
      return void 0;
    }
    var allCoords = onlyAllowNumbers(dots.map((dot) => axisType === "xAxis" ? dot.x : dot.y));
    if (allCoords.length === 0) {
      return void 0;
    }
    return [Math.min(...allCoords), Math.max(...allCoords)];
  };
  var selectReferenceDotsDomain = createSelector(selectReferenceDotsByAxis, pickAxisType, combineDotsDomain);
  var combineAreasDomain = (areas, axisType) => {
    if (areas == null) {
      return void 0;
    }
    var allCoords = onlyAllowNumbers(areas.flatMap((area) => [axisType === "xAxis" ? area.x1 : area.y1, axisType === "xAxis" ? area.x2 : area.y2]));
    if (allCoords.length === 0) {
      return void 0;
    }
    return [Math.min(...allCoords), Math.max(...allCoords)];
  };
  var selectReferenceAreasDomain = createSelector([selectReferenceAreasByAxis, pickAxisType], combineAreasDomain);
  function extractXCoordinates(line) {
    var _line$segment;
    if (line.x != null) {
      return onlyAllowNumbers([line.x]);
    }
    var segmentCoordinates = (_line$segment = line.segment) === null || _line$segment === void 0 ? void 0 : _line$segment.map((s) => s.x);
    if (segmentCoordinates == null || segmentCoordinates.length === 0) {
      return [];
    }
    return onlyAllowNumbers(segmentCoordinates);
  }
  function extractYCoordinates(line) {
    var _line$segment2;
    if (line.y != null) {
      return onlyAllowNumbers([line.y]);
    }
    var segmentCoordinates = (_line$segment2 = line.segment) === null || _line$segment2 === void 0 ? void 0 : _line$segment2.map((s) => s.y);
    if (segmentCoordinates == null || segmentCoordinates.length === 0) {
      return [];
    }
    return onlyAllowNumbers(segmentCoordinates);
  }
  var combineLinesDomain = (lines, axisType) => {
    if (lines == null) {
      return void 0;
    }
    var allCoords = lines.flatMap((line) => axisType === "xAxis" ? extractXCoordinates(line) : extractYCoordinates(line));
    if (allCoords.length === 0) {
      return void 0;
    }
    return [Math.min(...allCoords), Math.max(...allCoords)];
  };
  var selectReferenceLinesDomain = createSelector([selectReferenceLinesByAxis, pickAxisType], combineLinesDomain);
  var selectReferenceElementsDomain = createSelector(selectReferenceDotsDomain, selectReferenceLinesDomain, selectReferenceAreasDomain, (dotsDomain, linesDomain, areasDomain) => {
    return mergeDomains(dotsDomain, areasDomain, linesDomain);
  });
  var combineNumericalDomain = (axisSettings, domainDefinition, domainFromUserPreference, domainOfStackGroups, dataAndErrorBarsDomain, referenceElementsDomain, layout, axisType, numericTicksDomain) => {
    if (domainFromUserPreference != null) {
      return domainFromUserPreference;
    }
    var shouldIncludeDomainOfStackGroups = layout === "vertical" && axisType === "xAxis" || layout === "horizontal" && axisType === "yAxis";
    var mergedDomains = shouldIncludeDomainOfStackGroups ? mergeDomains(domainOfStackGroups, referenceElementsDomain, dataAndErrorBarsDomain) : mergeDomains(referenceElementsDomain, dataAndErrorBarsDomain);
    var parsedDomain = parseNumericalUserDomain(domainDefinition, mergedDomains, axisSettings.allowDataOverflow);
    if (parsedDomain != null) {
      return parsedDomain;
    }
    if (axisSettings.allowDataOverflow && mergedDomains == null && numericTicksDomain != null) {
      return numericTicksDomain;
    }
    return parsedDomain;
  };
  var combineNumericTicksDomain = (axisSettings) => {
    if (axisSettings == null || axisSettings.type !== "number" || !("ticks" in axisSettings) || axisSettings.ticks == null) {
      return void 0;
    }
    var numericTicks = onlyAllowNumbers(axisSettings.ticks);
    if (numericTicks.length === 0) {
      return void 0;
    }
    return [Math.min(...numericTicks), Math.max(...numericTicks)];
  };
  var selectNumericTicksDomain = createSelector([selectBaseAxis], combineNumericTicksDomain, {
    memoizeOptions: {
      resultEqualityCheck: numberDomainEqualityCheck
    }
  });
  var selectNumericalDomain = createSelector([selectBaseAxis, selectDomainDefinition, selectDomainFromUserPreference, selectDomainOfStackGroups, selectDomainOfAllAppliedNumericalValuesIncludingErrorValues, selectReferenceElementsDomain, selectChartLayout, pickAxisType, selectNumericTicksDomain], combineNumericalDomain, {
    memoizeOptions: {
      resultEqualityCheck: numberDomainEqualityCheck
    }
  });
  var expandDomain = [0, 1];
  var combineAxisDomain = (axisSettings, layout, displayedData, allAppliedValues, stackOffsetType, axisType, numericalDomain) => {
    if ((axisSettings == null || displayedData == null || displayedData.length === 0) && numericalDomain === void 0) {
      return void 0;
    }
    var dataKey = axisSettings.dataKey, type = axisSettings.type;
    var isCategorical = isCategoricalAxis(layout, axisType);
    if (isCategorical && dataKey == null) {
      var _displayedData$length;
      return range(0, (_displayedData$length = displayedData === null || displayedData === void 0 ? void 0 : displayedData.length) !== null && _displayedData$length !== void 0 ? _displayedData$length : 0);
    }
    if (type === "category") {
      return computeDomainOfTypeCategory(allAppliedValues, axisSettings, isCategorical);
    }
    if (stackOffsetType === "expand" && !isCategorical) {
      return expandDomain;
    }
    return numericalDomain;
  };
  var selectAxisDomain = createSelector([selectBaseAxis, selectChartLayout, selectDisplayedData, selectAllAppliedValues, selectStackOffsetType, pickAxisType, selectNumericalDomain], combineAxisDomain);
  var selectRealScaleType = createSelector([selectBaseAxis, selectHasBar, selectChartName], combineRealScaleType);
  var combineNiceTicks = (axisDomain, axisSettings, realScaleType) => {
    var niceTicks = axisSettings.niceTicks;
    if (niceTicks === "none") {
      return void 0;
    }
    var domainDefinition = getDomainDefinition(axisSettings);
    var hasDomainAutoKeyword = Array.isArray(domainDefinition) && (domainDefinition[0] === "auto" || domainDefinition[1] === "auto");
    if ((niceTicks === "snap125" || niceTicks === "adaptive") && axisSettings != null && axisSettings.tickCount && isWellFormedNumberDomain(axisDomain)) {
      if (hasDomainAutoKeyword) {
        return getNiceTickValues(axisDomain, axisSettings.tickCount, axisSettings.allowDecimals, niceTicks);
      }
      if (axisSettings.type === "number") {
        return getTickValuesFixedDomain(axisDomain, axisSettings.tickCount, axisSettings.allowDecimals, niceTicks);
      }
    }
    if (niceTicks === "auto" && realScaleType === "linear" && axisSettings != null && axisSettings.tickCount) {
      if (hasDomainAutoKeyword && isWellFormedNumberDomain(axisDomain)) {
        return getNiceTickValues(axisDomain, axisSettings.tickCount, axisSettings.allowDecimals, "adaptive");
      }
      if (axisSettings.type === "number" && isWellFormedNumberDomain(axisDomain)) {
        return getTickValuesFixedDomain(axisDomain, axisSettings.tickCount, axisSettings.allowDecimals, "adaptive");
      }
    }
    return void 0;
  };
  var selectNiceTicks = createSelector([selectAxisDomain, selectRenderableAxisSettings, selectRealScaleType], combineNiceTicks);
  var combineAxisDomainWithNiceTicks = (axisSettings, domain, niceTicks, axisType) => {
    if (
      /*
       * Angle axis for some reason uses nice ticks when rendering axis tick labels,
       * but doesn't use nice ticks for extending domain like all the other axes do.
       * Not really sure why? Is there a good reason,
       * or is it just because someone added support for nice ticks to the other axes and forgot this one?
       */
      axisType !== "angleAxis" && (axisSettings === null || axisSettings === void 0 ? void 0 : axisSettings.type) === "number" && isWellFormedNumberDomain(domain) && Array.isArray(niceTicks) && niceTicks.length > 0
    ) {
      var _niceTicks$, _niceTicks;
      var minFromDomain = domain[0];
      var minFromTicks = (_niceTicks$ = niceTicks[0]) !== null && _niceTicks$ !== void 0 ? _niceTicks$ : 0;
      var maxFromDomain = domain[1];
      var maxFromTicks = (_niceTicks = niceTicks[niceTicks.length - 1]) !== null && _niceTicks !== void 0 ? _niceTicks : 0;
      return [Math.min(minFromDomain, minFromTicks), Math.max(maxFromDomain, maxFromTicks)];
    }
    return domain;
  };
  var selectAxisDomainIncludingNiceTicks = createSelector([selectBaseAxis, selectAxisDomain, selectNiceTicks, pickAxisType], combineAxisDomainWithNiceTicks);
  var selectSmallestDistanceBetweenValues = createSelector(selectAllAppliedValues, selectBaseAxis, (allDataSquished, axisSettings) => {
    if (!axisSettings || axisSettings.type !== "number") {
      return void 0;
    }
    var smallestDistanceBetweenValues = Infinity;
    var sortedValues = Array.from(onlyAllowNumbers(allDataSquished.map((d) => d.value))).sort((a, b) => a - b);
    var first = sortedValues[0];
    var last = sortedValues[sortedValues.length - 1];
    if (first == null || last == null) {
      return Infinity;
    }
    var diff = last - first;
    if (diff === 0) {
      return Infinity;
    }
    for (var i = 0; i < sortedValues.length - 1; i++) {
      var curr = sortedValues[i];
      var next = sortedValues[i + 1];
      if (curr == null || next == null) {
        continue;
      }
      var distance = next - curr;
      smallestDistanceBetweenValues = Math.min(smallestDistanceBetweenValues, distance);
    }
    return smallestDistanceBetweenValues / diff;
  });
  var selectCalculatedPadding = createSelector(selectSmallestDistanceBetweenValues, selectChartLayout, selectBarCategoryGap, selectChartOffsetInternal, (_1, _2, _3, _4, padding) => padding, (smallestDistanceInPercent, layout, barCategoryGap, offset, padding) => {
    if (!isWellBehavedNumber(smallestDistanceInPercent)) {
      return 0;
    }
    var rangeWidth = layout === "vertical" ? offset.height : offset.width;
    if (padding === "gap") {
      return smallestDistanceInPercent * rangeWidth / 2;
    }
    if (padding === "no-gap") {
      var gap = getPercentValue(barCategoryGap, smallestDistanceInPercent * rangeWidth);
      var halfBand = smallestDistanceInPercent * rangeWidth / 2;
      return halfBand - gap - (halfBand - gap) / rangeWidth * gap;
    }
    return 0;
  });
  var selectCalculatedXAxisPadding = (state, axisId, isPanorama) => {
    var xAxisSettings = selectXAxisSettings(state, axisId);
    if (xAxisSettings == null || typeof xAxisSettings.padding !== "string") {
      return 0;
    }
    return selectCalculatedPadding(state, "xAxis", axisId, isPanorama, xAxisSettings.padding);
  };
  var selectCalculatedYAxisPadding = (state, axisId, isPanorama) => {
    var yAxisSettings = selectYAxisSettings(state, axisId);
    if (yAxisSettings == null || typeof yAxisSettings.padding !== "string") {
      return 0;
    }
    return selectCalculatedPadding(state, "yAxis", axisId, isPanorama, yAxisSettings.padding);
  };
  var selectXAxisPadding = createSelector(selectXAxisSettings, selectCalculatedXAxisPadding, (xAxisSettings, calculated) => {
    var _padding$left, _padding$right;
    if (xAxisSettings == null) {
      return {
        left: 0,
        right: 0
      };
    }
    var padding = xAxisSettings.padding;
    if (typeof padding === "string") {
      return {
        left: calculated,
        right: calculated
      };
    }
    return {
      left: ((_padding$left = padding.left) !== null && _padding$left !== void 0 ? _padding$left : 0) + calculated,
      right: ((_padding$right = padding.right) !== null && _padding$right !== void 0 ? _padding$right : 0) + calculated
    };
  });
  var selectYAxisPadding = createSelector(selectYAxisSettings, selectCalculatedYAxisPadding, (yAxisSettings, calculated) => {
    var _padding$top, _padding$bottom;
    if (yAxisSettings == null) {
      return {
        top: 0,
        bottom: 0
      };
    }
    var padding = yAxisSettings.padding;
    if (typeof padding === "string") {
      return {
        top: calculated,
        bottom: calculated
      };
    }
    return {
      top: ((_padding$top = padding.top) !== null && _padding$top !== void 0 ? _padding$top : 0) + calculated,
      bottom: ((_padding$bottom = padding.bottom) !== null && _padding$bottom !== void 0 ? _padding$bottom : 0) + calculated
    };
  });
  var selectXAxisRange = createSelector([selectChartOffsetInternal, selectXAxisPadding, selectBrushDimensions, selectBrushSettings, (_state, _axisId, isPanorama) => isPanorama], (offset, padding, brushDimensions, _ref6, isPanorama) => {
    var brushPadding = _ref6.padding;
    if (isPanorama) {
      return [brushPadding.left, brushDimensions.width - brushPadding.right];
    }
    return [offset.left + padding.left, offset.left + offset.width - padding.right];
  });
  var selectYAxisRange = createSelector([selectChartOffsetInternal, selectChartLayout, selectYAxisPadding, selectBrushDimensions, selectBrushSettings, (_state, _axisId, isPanorama) => isPanorama], (offset, layout, padding, brushDimensions, _ref7, isPanorama) => {
    var brushPadding = _ref7.padding;
    if (isPanorama) {
      return [brushDimensions.height - brushPadding.bottom, brushPadding.top];
    }
    if (layout === "horizontal") {
      return [offset.top + offset.height - padding.bottom, offset.top + padding.top];
    }
    return [offset.top + padding.top, offset.top + offset.height - padding.bottom];
  });
  var selectAxisRange = (state, axisType, axisId, isPanorama) => {
    var _selectZAxisSettings;
    switch (axisType) {
      case "xAxis":
        return selectXAxisRange(state, axisId, isPanorama);
      case "yAxis":
        return selectYAxisRange(state, axisId, isPanorama);
      case "zAxis":
        return (_selectZAxisSettings = selectZAxisSettings(state, axisId)) === null || _selectZAxisSettings === void 0 ? void 0 : _selectZAxisSettings.range;
      case "angleAxis":
        return selectAngleAxisRange(state);
      case "radiusAxis":
        return selectRadiusAxisRange(state, axisId);
      default:
        return void 0;
    }
  };
  var selectAxisRangeWithReverse = createSelector([selectBaseAxis, selectAxisRange], combineAxisRangeWithReverse);
  var selectCheckedAxisDomain = createSelector([selectRealScaleType, selectAxisDomainIncludingNiceTicks], combineCheckedDomain);
  var selectConfiguredScale = createSelector([selectBaseAxis, selectRealScaleType, selectCheckedAxisDomain, selectAxisRangeWithReverse], combineConfiguredScale);
  var combineCategoricalDomain = (layout, appliedValues, axis, axisType) => {
    if (axis == null || axis.dataKey == null) {
      return void 0;
    }
    var type = axis.type, scale = axis.scale;
    var isCategorical = isCategoricalAxis(layout, axisType);
    if (isCategorical && (type === "number" || scale !== "auto")) {
      return appliedValues.map((d) => d.value);
    }
    return void 0;
  };
  var selectCategoricalDomain = createSelector([selectChartLayout, selectAllAppliedValues, selectRenderableAxisSettings, pickAxisType], combineCategoricalDomain);
  var selectAxisScale = createSelector([selectConfiguredScale], rechartsScaleFactory);
  var selectAxisInverseScale = createSelector([selectConfiguredScale], combineInverseScaleFunction);
  var selectAxisInverseDataSnapScale = createSelector([selectConfiguredScale, selectSortedDataPoints], createCategoricalInverse);
  var selectErrorBarsSettings = createSelector([selectCartesianItemsSettings, selectAllErrorBarSettings, pickAxisType], combineRelevantErrorBarSettings);
  function compareIds(a, b) {
    if (a.id < b.id) {
      return -1;
    }
    if (a.id > b.id) {
      return 1;
    }
    return 0;
  }
  var pickAxisOrientation = (_state, orientation) => orientation;
  var pickMirror = (_state, _orientation, mirror) => mirror;
  var selectAllXAxesWithOffsetType = createSelector(selectAllXAxes, pickAxisOrientation, pickMirror, (allAxes, orientation, mirror) => allAxes.filter((axis) => axis.orientation === orientation).filter((axis) => axis.mirror === mirror).sort(compareIds));
  var selectAllYAxesWithOffsetType = createSelector(selectAllYAxes, pickAxisOrientation, pickMirror, (allAxes, orientation, mirror) => allAxes.filter((axis) => axis.orientation === orientation).filter((axis) => axis.mirror === mirror).sort(compareIds));
  var getXAxisSize = (offset, axisSettings) => {
    return {
      width: offset.width,
      height: axisSettings.height
    };
  };
  var getYAxisSize = (offset, axisSettings) => {
    var width = typeof axisSettings.width === "number" ? axisSettings.width : DEFAULT_Y_AXIS_WIDTH;
    return {
      width,
      height: offset.height
    };
  };
  var selectXAxisSize = createSelector(selectChartOffsetInternal, selectXAxisSettings, getXAxisSize);
  var combineXAxisPositionStartingPoint = (offset, orientation, chartHeight) => {
    switch (orientation) {
      case "top":
        return offset.top;
      case "bottom":
        return chartHeight - offset.bottom;
      default:
        return 0;
    }
  };
  var combineYAxisPositionStartingPoint = (offset, orientation, chartWidth) => {
    switch (orientation) {
      case "left":
        return offset.left;
      case "right":
        return chartWidth - offset.right;
      default:
        return 0;
    }
  };
  var selectAllXAxesOffsetSteps = createSelector(selectChartHeight, selectChartOffsetInternal, selectAllXAxesWithOffsetType, pickAxisOrientation, pickMirror, (chartHeight, offset, allAxesWithSameOffsetType, orientation, mirror) => {
    var steps = {};
    var position;
    allAxesWithSameOffsetType.forEach((axis) => {
      var axisSize = getXAxisSize(offset, axis);
      if (position == null) {
        position = combineXAxisPositionStartingPoint(offset, orientation, chartHeight);
      }
      var needSpace = orientation === "top" && !mirror || orientation === "bottom" && mirror;
      steps[axis.id] = position - Number(needSpace) * axisSize.height;
      position += (needSpace ? -1 : 1) * axisSize.height;
    });
    return steps;
  });
  var selectAllYAxesOffsetSteps = createSelector(selectChartWidth, selectChartOffsetInternal, selectAllYAxesWithOffsetType, pickAxisOrientation, pickMirror, (chartWidth, offset, allAxesWithSameOffsetType, orientation, mirror) => {
    var steps = {};
    var position;
    allAxesWithSameOffsetType.forEach((axis) => {
      var axisSize = getYAxisSize(offset, axis);
      if (position == null) {
        position = combineYAxisPositionStartingPoint(offset, orientation, chartWidth);
      }
      var needSpace = orientation === "left" && !mirror || orientation === "right" && mirror;
      steps[axis.id] = position - Number(needSpace) * axisSize.width;
      position += (needSpace ? -1 : 1) * axisSize.width;
    });
    return steps;
  });
  var selectXAxisOffsetSteps = (state, axisId) => {
    var axisSettings = selectXAxisSettings(state, axisId);
    if (axisSettings == null) {
      return void 0;
    }
    return selectAllXAxesOffsetSteps(state, axisSettings.orientation, axisSettings.mirror);
  };
  var selectXAxisPosition = createSelector([selectChartOffsetInternal, selectXAxisSettings, selectXAxisOffsetSteps, (_, axisId) => axisId], (offset, axisSettings, allSteps, axisId) => {
    if (axisSettings == null) {
      return void 0;
    }
    var stepOfThisAxis = allSteps === null || allSteps === void 0 ? void 0 : allSteps[axisId];
    if (stepOfThisAxis == null) {
      return {
        x: offset.left,
        y: 0
      };
    }
    return {
      x: offset.left,
      y: stepOfThisAxis
    };
  });
  var selectYAxisOffsetSteps = (state, axisId) => {
    var axisSettings = selectYAxisSettings(state, axisId);
    if (axisSettings == null) {
      return void 0;
    }
    return selectAllYAxesOffsetSteps(state, axisSettings.orientation, axisSettings.mirror);
  };
  var selectYAxisPosition = createSelector([selectChartOffsetInternal, selectYAxisSettings, selectYAxisOffsetSteps, (_, axisId) => axisId], (offset, axisSettings, allSteps, axisId) => {
    if (axisSettings == null) {
      return void 0;
    }
    var stepOfThisAxis = allSteps === null || allSteps === void 0 ? void 0 : allSteps[axisId];
    if (stepOfThisAxis == null) {
      return {
        x: 0,
        y: offset.top
      };
    }
    return {
      x: stepOfThisAxis,
      y: offset.top
    };
  });
  var selectYAxisSize = createSelector(selectChartOffsetInternal, selectYAxisSettings, (offset, axisSettings) => {
    var width = typeof axisSettings.width === "number" ? axisSettings.width : DEFAULT_Y_AXIS_WIDTH;
    return {
      width,
      height: offset.height
    };
  });
  var selectCartesianAxisSize = (state, axisType, axisId) => {
    switch (axisType) {
      case "xAxis": {
        return selectXAxisSize(state, axisId).width;
      }
      case "yAxis": {
        return selectYAxisSize(state, axisId).height;
      }
      default: {
        return void 0;
      }
    }
  };
  var combineDuplicateDomain = (chartLayout, appliedValues, axis, axisType) => {
    if (axis == null) {
      return void 0;
    }
    var allowDuplicatedCategory = axis.allowDuplicatedCategory, type = axis.type, dataKey = axis.dataKey;
    var isCategorical = isCategoricalAxis(chartLayout, axisType);
    var allData = appliedValues.map((av) => av.value);
    var validData = allData.filter((v) => v != null);
    if (dataKey && isCategorical && type === "category" && allowDuplicatedCategory && hasDuplicate(validData)) {
      return allData;
    }
    return void 0;
  };
  var selectDuplicateDomain = createSelector([selectChartLayout, selectAllAppliedValues, selectBaseAxis, pickAxisType], combineDuplicateDomain);
  var selectAxisPropsNeededForCartesianGridTicksGenerator = createSelector([selectChartLayout, selectCartesianAxisSettings, selectRealScaleType, selectAxisScale, selectDuplicateDomain, selectCategoricalDomain, selectAxisRange, selectNiceTicks, pickAxisType], (layout, axis, realScaleType, scale, duplicateDomain, categoricalDomain, axisRange, niceTicks, axisType) => {
    if (axis == null) {
      return void 0;
    }
    var isCategorical = isCategoricalAxis(layout, axisType);
    return {
      angle: axis.angle,
      interval: axis.interval,
      minTickGap: axis.minTickGap,
      orientation: axis.orientation,
      tick: axis.tick,
      tickCount: axis.tickCount,
      tickFormatter: axis.tickFormatter,
      ticks: axis.ticks,
      type: axis.type,
      unit: axis.unit,
      axisType,
      categoricalDomain,
      duplicateDomain,
      isCategorical,
      niceTicks,
      range: axisRange,
      realScaleType,
      scale
    };
  });
  var combineAxisTicks = (layout, axis, realScaleType, scale, niceTicks, axisRange, duplicateDomain, categoricalDomain, axisType) => {
    if (axis == null || scale == null) {
      return void 0;
    }
    var isCategorical = isCategoricalAxis(layout, axisType);
    var type = axis.type, ticks2 = axis.ticks, tickCount = axis.tickCount;
    var offsetForBand = (
      // @ts-expect-error This is testing for `scaleBand` but for band axis the type is reported as `band` so this looks like a dead code with a workaround elsewhere?
      realScaleType === "scaleBand" && typeof scale.bandwidth === "function" ? scale.bandwidth() / 2 : 2
    );
    var offset = type === "category" && scale.bandwidth ? scale.bandwidth() / offsetForBand : 0;
    offset = axisType === "angleAxis" && axisRange != null && axisRange.length >= 2 ? mathSign(axisRange[0] - axisRange[1]) * 2 * offset : offset;
    var ticksOrNiceTicks = ticks2 || niceTicks;
    if (ticksOrNiceTicks) {
      return ticksOrNiceTicks.map((entry, index) => {
        var scaleContent = duplicateDomain ? duplicateDomain.indexOf(entry) : entry;
        var scaled = scale.map(scaleContent);
        if (!isWellBehavedNumber(scaled)) {
          return null;
        }
        return {
          index,
          coordinate: scaled + offset,
          value: entry,
          offset
        };
      }).filter(isNotNil);
    }
    if (isCategorical && categoricalDomain) {
      return categoricalDomain.map((entry, index) => {
        var scaled = scale.map(entry);
        if (!isWellBehavedNumber(scaled)) {
          return null;
        }
        return {
          coordinate: scaled + offset,
          value: entry,
          index,
          offset
        };
      }).filter(isNotNil);
    }
    if (scale.ticks) {
      return scale.ticks(tickCount).map((entry, index) => {
        var scaled = scale.map(entry);
        if (!isWellBehavedNumber(scaled)) {
          return null;
        }
        return {
          coordinate: scaled + offset,
          value: entry,
          index,
          offset
        };
      }).filter(isNotNil);
    }
    return scale.domain().map((entry, index) => {
      var scaled = scale.map(entry);
      if (!isWellBehavedNumber(scaled)) {
        return null;
      }
      return {
        coordinate: scaled + offset,
        // @ts-expect-error can't use Date as index
        value: duplicateDomain ? duplicateDomain[entry] : entry,
        index,
        offset
      };
    }).filter(isNotNil);
  };
  var selectTicksOfAxis = createSelector([selectChartLayout, selectRenderableAxisSettings, selectRealScaleType, selectAxisScale, selectNiceTicks, selectAxisRange, selectDuplicateDomain, selectCategoricalDomain, pickAxisType], combineAxisTicks);
  var combineGraphicalItemTicks = (layout, axis, scale, axisRange, duplicateDomain, categoricalDomain, axisType) => {
    if (axis == null || scale == null || axisRange == null || axisRange[0] === axisRange[1]) {
      return void 0;
    }
    var isCategorical = isCategoricalAxis(layout, axisType);
    var tickCount = axis.tickCount;
    var offset = 0;
    offset = axisType === "angleAxis" && (axisRange === null || axisRange === void 0 ? void 0 : axisRange.length) >= 2 ? mathSign(axisRange[0] - axisRange[1]) * 2 * offset : offset;
    if (isCategorical && categoricalDomain) {
      return categoricalDomain.map((entry, index) => {
        var scaled = scale.map(entry);
        if (!isWellBehavedNumber(scaled)) {
          return null;
        }
        return {
          coordinate: scaled + offset,
          value: entry,
          index,
          offset
        };
      }).filter(isNotNil);
    }
    if (scale.ticks) {
      return scale.ticks(tickCount).map((entry, index) => {
        var scaled = scale.map(entry);
        if (!isWellBehavedNumber(scaled)) {
          return null;
        }
        return {
          coordinate: scaled + offset,
          value: entry,
          index,
          offset
        };
      }).filter(isNotNil);
    }
    return scale.domain().map((entry, index) => {
      var scaled = scale.map(entry);
      if (!isWellBehavedNumber(scaled)) {
        return null;
      }
      return {
        coordinate: scaled + offset,
        // @ts-expect-error can't use unknown as index
        value: duplicateDomain ? duplicateDomain[entry] : entry,
        index,
        offset
      };
    }).filter(isNotNil);
  };
  var selectTicksOfGraphicalItem = createSelector([selectChartLayout, selectRenderableAxisSettings, selectAxisScale, selectAxisRange, selectDuplicateDomain, selectCategoricalDomain, pickAxisType], combineGraphicalItemTicks);
  var selectAxisWithScale = createSelector(selectBaseAxis, selectAxisScale, (axis, scale) => {
    if (axis == null || scale == null) {
      return void 0;
    }
    return _objectSpread7(_objectSpread7({}, axis), {}, {
      scale
    });
  });
  var selectZAxisConfiguredScale = createSelector([selectBaseAxis, selectRealScaleType, selectAxisDomain, selectAxisRangeWithReverse], combineConfiguredScale);
  var selectZAxisScale = createSelector([selectZAxisConfiguredScale], rechartsScaleFactory);
  var selectZAxisWithScale = createSelector((state, _axisType, axisId) => selectZAxisSettings(state, axisId), selectZAxisScale, (axis, scale) => {
    if (axis == null || scale == null) {
      return void 0;
    }
    return _objectSpread7(_objectSpread7({}, axis), {}, {
      scale
    });
  });
  var selectChartDirection = createSelector([selectChartLayout, selectAllXAxes, selectAllYAxes], (layout, allXAxes, allYAxes) => {
    switch (layout) {
      case "horizontal": {
        return allXAxes.some((axis) => axis.reversed) ? "right-to-left" : "left-to-right";
      }
      case "vertical": {
        return allYAxes.some((axis) => axis.reversed) ? "bottom-to-top" : "top-to-bottom";
      }
      // TODO: make this better. For now, right arrow triggers "forward", left arrow "back"
      // however, the tooltip moves an unintuitive direction because of how the indices are rendered
      case "centric":
      case "radial": {
        return "left-to-right";
      }
      default: {
        return void 0;
      }
    }
  });
  var selectRenderedTicksOfAxis = (state, axisType, axisId) => {
    var _state$renderedTicks$;
    return (_state$renderedTicks$ = state.renderedTicks[axisType]) === null || _state$renderedTicks$ === void 0 ? void 0 : _state$renderedTicks$[axisId];
  };
  var selectAxisInverseTickSnapScale = createSelector([selectRenderedTicksOfAxis], (ticks2) => {
    if (!ticks2 || ticks2.length === 0) {
      return void 0;
    }
    return (pixelValue) => {
      var _closestTick;
      var minDistance = Infinity;
      var closestTick = ticks2[0];
      for (var tick of ticks2) {
        var distance = Math.abs(tick.coordinate - pixelValue);
        if (distance < minDistance) {
          minDistance = distance;
          closestTick = tick;
        }
      }
      return (_closestTick = closestTick) === null || _closestTick === void 0 ? void 0 : _closestTick.value;
    };
  });

  // node_modules/recharts/es6/state/selectors/tooltipSelectors.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/state/selectors/selectTooltipEventType.js
  init_define_import_meta_env();
  var selectDefaultTooltipEventType = (state) => state.options.defaultTooltipEventType;
  var selectValidateTooltipEventTypes = (state) => state.options.validateTooltipEventTypes;
  function combineTooltipEventType(shared, defaultTooltipEventType, validateTooltipEventTypes) {
    if (shared == null) {
      return defaultTooltipEventType;
    }
    var eventType = shared ? "axis" : "item";
    if (validateTooltipEventTypes == null) {
      return defaultTooltipEventType;
    }
    return validateTooltipEventTypes.includes(eventType) ? eventType : defaultTooltipEventType;
  }
  function selectTooltipEventType(state, shared) {
    var defaultTooltipEventType = selectDefaultTooltipEventType(state);
    var validateTooltipEventTypes = selectValidateTooltipEventTypes(state);
    return combineTooltipEventType(shared, defaultTooltipEventType, validateTooltipEventTypes);
  }

  // node_modules/recharts/es6/state/selectors/combiners/combineActiveLabel.js
  init_define_import_meta_env();
  var combineActiveLabel = (tooltipTicks, activeIndex) => {
    var _tooltipTicks$n;
    var n = Number(activeIndex);
    if (isNan(n) || activeIndex == null) {
      return void 0;
    }
    return n >= 0 ? tooltipTicks === null || tooltipTicks === void 0 || (_tooltipTicks$n = tooltipTicks[n]) === null || _tooltipTicks$n === void 0 ? void 0 : _tooltipTicks$n.value : void 0;
  };

  // node_modules/recharts/es6/state/selectors/selectTooltipSettings.js
  init_define_import_meta_env();
  var selectTooltipSettings = (state) => state.tooltip.settings;

  // node_modules/recharts/es6/state/selectors/combiners/combineTooltipInteractionState.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/state/tooltipSlice.js
  init_define_import_meta_env();
  var noInteraction = {
    active: false,
    index: null,
    dataKey: void 0,
    graphicalItemId: void 0,
    coordinate: void 0
  };
  var initialState3 = {
    itemInteraction: {
      click: noInteraction,
      hover: noInteraction
    },
    axisInteraction: {
      click: noInteraction,
      hover: noInteraction
    },
    keyboardInteraction: noInteraction,
    syncInteraction: {
      active: false,
      index: null,
      dataKey: void 0,
      label: void 0,
      coordinate: void 0,
      sourceViewBox: void 0,
      graphicalItemId: void 0
    },
    tooltipItemPayloads: [],
    settings: {
      shared: void 0,
      trigger: "hover",
      axisId: 0,
      active: false,
      defaultIndex: void 0
    }
  };
  var tooltipSlice = createSlice({
    name: "tooltip",
    initialState: initialState3,
    reducers: {
      addTooltipEntrySettings: {
        reducer(state, action) {
          state.tooltipItemPayloads.push(castDraft(action.payload));
        },
        prepare: prepareAutoBatched()
      },
      replaceTooltipEntrySettings: {
        reducer(state, action) {
          var _action$payload = action.payload, prev = _action$payload.prev, next = _action$payload.next;
          var index = current(state).tooltipItemPayloads.indexOf(castDraft(prev));
          if (index > -1) {
            state.tooltipItemPayloads[index] = castDraft(next);
          }
        },
        prepare: prepareAutoBatched()
      },
      removeTooltipEntrySettings: {
        reducer(state, action) {
          var index = current(state).tooltipItemPayloads.indexOf(castDraft(action.payload));
          if (index > -1) {
            state.tooltipItemPayloads.splice(index, 1);
          }
        },
        prepare: prepareAutoBatched()
      },
      setTooltipSettingsState(state, action) {
        state.settings = action.payload;
      },
      setActiveMouseOverItemIndex(state, action) {
        state.syncInteraction.active = false;
        state.syncInteraction.sourceViewBox = void 0;
        state.keyboardInteraction.active = false;
        state.itemInteraction.hover.active = true;
        state.itemInteraction.hover.index = action.payload.activeIndex;
        state.itemInteraction.hover.dataKey = action.payload.activeDataKey;
        state.itemInteraction.hover.graphicalItemId = action.payload.activeGraphicalItemId;
        state.itemInteraction.hover.coordinate = action.payload.activeCoordinate;
      },
      mouseLeaveChart(state) {
        state.itemInteraction.hover.active = false;
        state.axisInteraction.hover.active = false;
      },
      mouseLeaveItem(state) {
        state.itemInteraction.hover.active = false;
      },
      setActiveClickItemIndex(state, action) {
        state.syncInteraction.active = false;
        state.syncInteraction.sourceViewBox = void 0;
        state.itemInteraction.click.active = true;
        state.keyboardInteraction.active = false;
        state.itemInteraction.click.index = action.payload.activeIndex;
        state.itemInteraction.click.dataKey = action.payload.activeDataKey;
        state.itemInteraction.click.graphicalItemId = action.payload.activeGraphicalItemId;
        state.itemInteraction.click.coordinate = action.payload.activeCoordinate;
      },
      setMouseOverAxisIndex(state, action) {
        state.syncInteraction.active = false;
        state.syncInteraction.sourceViewBox = void 0;
        state.axisInteraction.hover.active = true;
        state.keyboardInteraction.active = false;
        state.axisInteraction.hover.index = action.payload.activeIndex;
        state.axisInteraction.hover.dataKey = action.payload.activeDataKey;
        state.axisInteraction.hover.coordinate = action.payload.activeCoordinate;
      },
      setMouseClickAxisIndex(state, action) {
        state.syncInteraction.active = false;
        state.syncInteraction.sourceViewBox = void 0;
        state.keyboardInteraction.active = false;
        state.axisInteraction.click.active = true;
        state.axisInteraction.click.index = action.payload.activeIndex;
        state.axisInteraction.click.dataKey = action.payload.activeDataKey;
        state.axisInteraction.click.coordinate = action.payload.activeCoordinate;
      },
      setSyncInteraction(state, action) {
        state.syncInteraction = action.payload;
      },
      setKeyboardInteraction(state, action) {
        state.keyboardInteraction.active = action.payload.active;
        state.keyboardInteraction.index = action.payload.activeIndex;
        state.keyboardInteraction.coordinate = action.payload.activeCoordinate;
      }
    }
  });
  var _tooltipSlice$actions = tooltipSlice.actions;
  var addTooltipEntrySettings = _tooltipSlice$actions.addTooltipEntrySettings;
  var replaceTooltipEntrySettings = _tooltipSlice$actions.replaceTooltipEntrySettings;
  var removeTooltipEntrySettings = _tooltipSlice$actions.removeTooltipEntrySettings;
  var setTooltipSettingsState = _tooltipSlice$actions.setTooltipSettingsState;
  var setActiveMouseOverItemIndex = _tooltipSlice$actions.setActiveMouseOverItemIndex;
  var mouseLeaveItem = _tooltipSlice$actions.mouseLeaveItem;
  var mouseLeaveChart = _tooltipSlice$actions.mouseLeaveChart;
  var setActiveClickItemIndex = _tooltipSlice$actions.setActiveClickItemIndex;
  var setMouseOverAxisIndex = _tooltipSlice$actions.setMouseOverAxisIndex;
  var setMouseClickAxisIndex = _tooltipSlice$actions.setMouseClickAxisIndex;
  var setSyncInteraction = _tooltipSlice$actions.setSyncInteraction;
  var setKeyboardInteraction = _tooltipSlice$actions.setKeyboardInteraction;
  var tooltipReducer = tooltipSlice.reducer;

  // node_modules/recharts/es6/state/selectors/combiners/combineTooltipInteractionState.js
  function ownKeys8(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread8(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys8(Object(t), true).forEach(function(r3) {
        _defineProperty9(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys8(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty9(e, r2, t) {
    return (r2 = _toPropertyKey9(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey9(t) {
    var i = _toPrimitive9(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive9(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function chooseAppropriateMouseInteraction(tooltipState, tooltipEventType, trigger) {
    if (tooltipEventType === "axis") {
      if (trigger === "click") {
        return tooltipState.axisInteraction.click;
      }
      return tooltipState.axisInteraction.hover;
    }
    if (trigger === "click") {
      return tooltipState.itemInteraction.click;
    }
    return tooltipState.itemInteraction.hover;
  }
  function hasBeenActivePreviously(tooltipInteractionState) {
    return tooltipInteractionState.index != null;
  }
  var combineTooltipInteractionState = (tooltipState, tooltipEventType, trigger, defaultIndex) => {
    if (tooltipEventType == null) {
      return noInteraction;
    }
    var appropriateMouseInteraction = chooseAppropriateMouseInteraction(tooltipState, tooltipEventType, trigger);
    if (appropriateMouseInteraction == null) {
      return noInteraction;
    }
    if (appropriateMouseInteraction.active) {
      return appropriateMouseInteraction;
    }
    if (tooltipState.keyboardInteraction.active) {
      return tooltipState.keyboardInteraction;
    }
    if (tooltipState.syncInteraction.active && tooltipState.syncInteraction.index != null) {
      return tooltipState.syncInteraction;
    }
    var activeFromProps = tooltipState.settings.active === true;
    if (hasBeenActivePreviously(appropriateMouseInteraction)) {
      if (activeFromProps) {
        return _objectSpread8(_objectSpread8({}, appropriateMouseInteraction), {}, {
          active: true
        });
      }
    } else if (defaultIndex != null) {
      return {
        active: true,
        coordinate: void 0,
        dataKey: void 0,
        index: defaultIndex,
        graphicalItemId: void 0
      };
    }
    return _objectSpread8(_objectSpread8({}, noInteraction), {}, {
      coordinate: appropriateMouseInteraction.coordinate
    });
  };

  // node_modules/recharts/es6/state/selectors/combiners/combineActiveTooltipIndex.js
  init_define_import_meta_env();
  function toFiniteNumber(value) {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : void 0;
    }
    if (value instanceof Date) {
      var numericValue = value.valueOf();
      return Number.isFinite(numericValue) ? numericValue : void 0;
    }
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : void 0;
  }
  function isValueWithinNumberDomain(value, domain) {
    var numericValue = toFiniteNumber(value);
    var lowerBound = domain[0];
    var upperBound = domain[1];
    if (numericValue === void 0) {
      return false;
    }
    var min2 = Math.min(lowerBound, upperBound);
    var max2 = Math.max(lowerBound, upperBound);
    return numericValue >= min2 && numericValue <= max2;
  }
  function isValueWithinDomain(entry, axisDataKey, domain) {
    if (domain == null || axisDataKey == null) {
      return true;
    }
    var value = getValueByDataKey(entry, axisDataKey);
    if (value == null) {
      return true;
    }
    if (!isWellFormedNumberDomain(domain)) {
      return true;
    }
    return isValueWithinNumberDomain(value, domain);
  }
  var combineActiveTooltipIndex = (tooltipInteraction, chartData, axisDataKey, domain) => {
    var desiredIndex = tooltipInteraction === null || tooltipInteraction === void 0 ? void 0 : tooltipInteraction.index;
    if (desiredIndex == null) {
      return null;
    }
    var indexAsNumber = Number(desiredIndex);
    if (!isWellBehavedNumber(indexAsNumber)) {
      return desiredIndex;
    }
    var lowerLimit = 0;
    var upperLimit = Infinity;
    if (chartData.length > 0) {
      upperLimit = chartData.length - 1;
    }
    var clampedIndex = Math.max(lowerLimit, Math.min(indexAsNumber, upperLimit));
    var entry = chartData[clampedIndex];
    if (entry == null) {
      return String(clampedIndex);
    }
    if (!isValueWithinDomain(entry, axisDataKey, domain)) {
      return null;
    }
    return String(clampedIndex);
  };

  // node_modules/recharts/es6/state/selectors/combiners/combineCoordinateForDefaultIndex.js
  init_define_import_meta_env();
  var combineCoordinateForDefaultIndex = (width, height, layout, offset, tooltipTicks, defaultIndex, tooltipConfigurations) => {
    if (defaultIndex == null) {
      return void 0;
    }
    var firstConfiguration = tooltipConfigurations[0];
    var maybePosition = firstConfiguration === null || firstConfiguration === void 0 ? void 0 : firstConfiguration.getPosition(defaultIndex);
    if (maybePosition != null) {
      return maybePosition;
    }
    var tick = tooltipTicks === null || tooltipTicks === void 0 ? void 0 : tooltipTicks[Number(defaultIndex)];
    if (!tick) {
      return void 0;
    }
    switch (layout) {
      case "horizontal": {
        return {
          x: tick.coordinate,
          y: (offset.top + height) / 2
        };
      }
      default: {
        return {
          x: (offset.left + width) / 2,
          y: tick.coordinate
        };
      }
    }
  };

  // node_modules/recharts/es6/state/selectors/combiners/combineTooltipPayloadConfigurations.js
  init_define_import_meta_env();
  var combineTooltipPayloadConfigurations = (tooltipState, tooltipEventType, trigger, defaultIndex) => {
    if (tooltipEventType === "axis") {
      return tooltipState.tooltipItemPayloads;
    }
    if (tooltipState.tooltipItemPayloads.length === 0) {
      return [];
    }
    var filterByGraphicalItemId;
    if (trigger === "hover") {
      filterByGraphicalItemId = tooltipState.itemInteraction.hover.graphicalItemId;
    } else {
      filterByGraphicalItemId = tooltipState.itemInteraction.click.graphicalItemId;
    }
    if (tooltipState.syncInteraction.active && filterByGraphicalItemId == null) {
      return tooltipState.tooltipItemPayloads;
    }
    if (filterByGraphicalItemId == null && (defaultIndex != null || tooltipState.keyboardInteraction.active)) {
      var firstItemPayload = tooltipState.tooltipItemPayloads[0];
      if (firstItemPayload != null) {
        return [firstItemPayload];
      }
      return [];
    }
    return tooltipState.tooltipItemPayloads.filter((tpc) => {
      var _tpc$settings;
      return ((_tpc$settings = tpc.settings) === null || _tpc$settings === void 0 ? void 0 : _tpc$settings.graphicalItemId) === filterByGraphicalItemId;
    });
  };

  // node_modules/recharts/es6/state/selectors/selectTooltipPayloadSearcher.js
  init_define_import_meta_env();
  var selectTooltipPayloadSearcher = (state) => state.options.tooltipPayloadSearcher;

  // node_modules/recharts/es6/state/selectors/selectTooltipState.js
  init_define_import_meta_env();
  var selectTooltipState = (state) => state.tooltip;

  // node_modules/recharts/es6/state/selectors/combiners/combineTooltipPayload.js
  init_define_import_meta_env();
  function ownKeys9(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread9(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys9(Object(t), true).forEach(function(r3) {
        _defineProperty10(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys9(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty10(e, r2, t) {
    return (r2 = _toPropertyKey10(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey10(t) {
    var i = _toPrimitive10(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive10(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function parseName(value) {
    if (typeof value === "string" || typeof value === "number") {
      return value;
    }
    return void 0;
  }
  function parseUnit(value) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return value;
    }
    return void 0;
  }
  function parseDataKey(value) {
    if (typeof value === "string" || typeof value === "number") {
      return value;
    }
    if (typeof value === "function") {
      return (obj) => value(obj);
    }
    return void 0;
  }
  function parseColor(value) {
    if (typeof value === "string") {
      return value;
    }
    return void 0;
  }
  function parseTooltipPayloadItem(item) {
    if (item == null || typeof item !== "object") {
      return void 0;
    }
    var name = "name" in item ? parseName(item.name) : void 0;
    var unit2 = "unit" in item ? parseUnit(item.unit) : void 0;
    var dataKey = "dataKey" in item ? parseDataKey(item.dataKey) : void 0;
    var payload = "payload" in item ? item.payload : void 0;
    var color2 = "color" in item ? parseColor(item.color) : void 0;
    var fill = "fill" in item ? parseColor(item.fill) : void 0;
    return {
      name,
      unit: unit2,
      dataKey,
      payload,
      color: color2,
      fill
    };
  }
  function selectFinalData(dataDefinedOnItem, dataDefinedOnChart) {
    if (dataDefinedOnItem != null) {
      return dataDefinedOnItem;
    }
    return dataDefinedOnChart;
  }
  var combineTooltipPayload = (tooltipPayloadConfigurations, activeIndex, chartDataState, tooltipAxisDataKey, activeLabel, tooltipPayloadSearcher, tooltipEventType) => {
    if (activeIndex == null || tooltipPayloadSearcher == null) {
      return void 0;
    }
    var chartData = chartDataState.chartData, computedData = chartDataState.computedData, dataStartIndex = chartDataState.dataStartIndex, dataEndIndex = chartDataState.dataEndIndex;
    var init = [];
    return tooltipPayloadConfigurations.reduce((agg, _ref2) => {
      var _settings$dataKey;
      var dataDefinedOnItem = _ref2.dataDefinedOnItem, settings = _ref2.settings;
      var finalData = selectFinalData(dataDefinedOnItem, chartData);
      var sliced = Array.isArray(finalData) ? getSliced(finalData, dataStartIndex, dataEndIndex) : finalData;
      var finalDataKey = (_settings$dataKey = settings === null || settings === void 0 ? void 0 : settings.dataKey) !== null && _settings$dataKey !== void 0 ? _settings$dataKey : tooltipAxisDataKey;
      var finalNameKey = settings === null || settings === void 0 ? void 0 : settings.nameKey;
      var tooltipPayload;
      if (tooltipAxisDataKey && Array.isArray(sliced) && /*
       * findEntryInArray won't work for Scatter because Scatter provides an array of arrays
       * as tooltip payloads and findEntryInArray is not prepared to handle that.
       * Sad but also ScatterChart only allows 'item' tooltipEventType
       * and also this is only a problem if there are multiple Scatters and each has its own data array
       * so let's fix that some other time.
       */
      !Array.isArray(sliced[0]) && /*
       * If the tooltipEventType is 'axis', we should search for the dataKey in the sliced data
       * because thanks to allowDuplicatedCategory=false, the order of elements in the array
       * no longer matches the order of elements in the original data
       * and so we need to search by the active dataKey + label rather than by index.
       *
       * The same happens if multiple graphical items are present in the chart
       * and each of them has its own data array. Those arrays get concatenated
       * and again the tooltip index no longer matches the original data.
       *
       * On the other hand the tooltipEventType 'item' should always search by index
       * because we get the index from interacting over the individual elements
       * which is always accurate, irrespective of the allowDuplicatedCategory setting.
       */
      tooltipEventType === "axis") {
        tooltipPayload = findEntryInArray(sliced, tooltipAxisDataKey, activeLabel);
      } else {
        tooltipPayload = tooltipPayloadSearcher(sliced, activeIndex, computedData, finalNameKey);
      }
      if (Array.isArray(tooltipPayload)) {
        tooltipPayload.forEach((item) => {
          var _parsedItem$color, _parsedItem$fill;
          var parsedItem = parseTooltipPayloadItem(item);
          var itemName = parsedItem === null || parsedItem === void 0 ? void 0 : parsedItem.name;
          var itemDataKey = parsedItem === null || parsedItem === void 0 ? void 0 : parsedItem.dataKey;
          var itemPayload = parsedItem === null || parsedItem === void 0 ? void 0 : parsedItem.payload;
          var newSettings = _objectSpread9(_objectSpread9({}, settings), {}, {
            name: itemName,
            unit: parsedItem === null || parsedItem === void 0 ? void 0 : parsedItem.unit,
            // Preserve item-level color/fill from graphical items.
            color: (_parsedItem$color = parsedItem === null || parsedItem === void 0 ? void 0 : parsedItem.color) !== null && _parsedItem$color !== void 0 ? _parsedItem$color : settings === null || settings === void 0 ? void 0 : settings.color,
            fill: (_parsedItem$fill = parsedItem === null || parsedItem === void 0 ? void 0 : parsedItem.fill) !== null && _parsedItem$fill !== void 0 ? _parsedItem$fill : settings === null || settings === void 0 ? void 0 : settings.fill
          });
          agg.push(getTooltipEntry({
            tooltipEntrySettings: newSettings,
            dataKey: itemDataKey,
            payload: itemPayload,
            value: getValueByDataKey(itemPayload, itemDataKey),
            name: itemName == null ? void 0 : String(itemName)
          }));
        });
      } else {
        var _getValueByDataKey;
        agg.push(getTooltipEntry({
          tooltipEntrySettings: settings,
          dataKey: finalDataKey,
          payload: tooltipPayload,
          // getValueByDataKey does not validate the output type
          value: getValueByDataKey(tooltipPayload, finalDataKey),
          // getValueByDataKey does not validate the output type
          name: (_getValueByDataKey = getValueByDataKey(tooltipPayload, finalNameKey)) !== null && _getValueByDataKey !== void 0 ? _getValueByDataKey : settings === null || settings === void 0 ? void 0 : settings.name
        }));
      }
      return agg;
    }, init);
  };

  // node_modules/recharts/es6/state/selectors/tooltipSelectors.js
  var selectTooltipAxisRealScaleType = createSelector([selectTooltipAxis, selectHasBar, selectChartName], combineRealScaleType);
  var selectAllUnfilteredGraphicalItems = createSelector([(state) => state.graphicalItems.cartesianItems, (state) => state.graphicalItems.polarItems], (cartesianItems, polarItems) => [...cartesianItems, ...polarItems]);
  var selectTooltipAxisPredicate = createSelector([selectTooltipAxisType, selectTooltipAxisId], itemAxisPredicate);
  var selectAllGraphicalItemsSettings = createSelector([selectAllUnfilteredGraphicalItems, selectTooltipAxis, selectTooltipAxisPredicate], combineGraphicalItemsSettings, {
    memoizeOptions: {
      resultEqualityCheck: emptyArraysAreEqualCheck
    }
  });
  var selectAllStackedGraphicalItemsSettings = createSelector([selectAllGraphicalItemsSettings], (graphicalItems) => graphicalItems.filter(isStacked));
  var selectTooltipGraphicalItemsData = createSelector([selectAllGraphicalItemsSettings], combineGraphicalItemsData, {
    memoizeOptions: {
      resultEqualityCheck: emptyArraysAreEqualCheck
    }
  });
  var selectAnyTooltipItemUsesChartData = createSelector([selectAllGraphicalItemsSettings], (items) => items.some((item) => !item.data));
  var selectTooltipDisplayedData = createSelector([selectTooltipGraphicalItemsData, selectChartDataWithIndexes], combineDisplayedData);
  var selectTooltipStackedData = createSelector([selectAllStackedGraphicalItemsSettings, selectChartDataWithIndexes, selectTooltipAxis], combineDisplayedStackedData);
  var selectAllTooltipAppliedValues = createSelector([selectTooltipDisplayedData, selectTooltipAxis, selectAllGraphicalItemsSettings, selectChartDataWithIndexes, selectAnyTooltipItemUsesChartData, selectTooltipGraphicalItemsData], combineAllAppliedValues);
  var selectTooltipAxisDomainDefinition = createSelector([selectTooltipAxis], getDomainDefinition);
  var selectTooltipDataOverflow = createSelector([selectTooltipAxis], (axisSettings) => axisSettings.allowDataOverflow);
  var selectTooltipDomainFromUserPreferences = createSelector([selectTooltipAxisDomainDefinition, selectTooltipDataOverflow], numericalDomainSpecifiedWithoutRequiringData);
  var selectAllStackedGraphicalItems = createSelector([selectAllGraphicalItemsSettings], (graphicalItems) => graphicalItems.filter(isStacked));
  var selectTooltipStackGroups = createSelector([selectTooltipStackedData, selectAllStackedGraphicalItems, selectStackOffsetType, selectReverseStackOrder], combineStackGroups);
  var selectTooltipDomainOfStackGroups = createSelector([selectTooltipStackGroups, selectChartDataWithIndexes, selectTooltipAxisType, selectTooltipDomainFromUserPreferences], combineDomainOfStackGroups);
  var selectTooltipItemsSettingsExceptStacked = createSelector([selectAllGraphicalItemsSettings], filterGraphicalNotStackedItems);
  var selectDomainOfAllAppliedNumericalValuesIncludingErrorValues2 = createSelector([selectTooltipDisplayedData, selectTooltipAxis, selectTooltipItemsSettingsExceptStacked, selectAllErrorBarSettings, selectTooltipAxisType, selectChartDataSliceWithIndexes], combineDomainOfAllAppliedNumericalValuesIncludingErrorValues, {
    memoizeOptions: {
      resultEqualityCheck: numberDomainEqualityCheck
    }
  });
  var selectReferenceDotsByTooltipAxis = createSelector([selectReferenceDots, selectTooltipAxisType, selectTooltipAxisId], filterReferenceElements);
  var selectTooltipReferenceDotsDomain = createSelector([selectReferenceDotsByTooltipAxis, selectTooltipAxisType], combineDotsDomain);
  var selectReferenceAreasByTooltipAxis = createSelector([selectReferenceAreas, selectTooltipAxisType, selectTooltipAxisId], filterReferenceElements);
  var selectTooltipReferenceAreasDomain = createSelector([selectReferenceAreasByTooltipAxis, selectTooltipAxisType], combineAreasDomain);
  var selectReferenceLinesByTooltipAxis = createSelector([selectReferenceLines, selectTooltipAxisType, selectTooltipAxisId], filterReferenceElements);
  var selectTooltipReferenceLinesDomain = createSelector([selectReferenceLinesByTooltipAxis, selectTooltipAxisType], combineLinesDomain);
  var selectTooltipReferenceElementsDomain = createSelector([selectTooltipReferenceDotsDomain, selectTooltipReferenceLinesDomain, selectTooltipReferenceAreasDomain], mergeDomains);
  var selectTooltipNumericalDomain = createSelector([selectTooltipAxis, selectTooltipAxisDomainDefinition, selectTooltipDomainFromUserPreferences, selectTooltipDomainOfStackGroups, selectDomainOfAllAppliedNumericalValuesIncludingErrorValues2, selectTooltipReferenceElementsDomain, selectChartLayout, selectTooltipAxisType], combineNumericalDomain);
  var selectTooltipAxisDomain = createSelector([selectTooltipAxis, selectChartLayout, selectTooltipDisplayedData, selectAllTooltipAppliedValues, selectStackOffsetType, selectTooltipAxisType, selectTooltipNumericalDomain], combineAxisDomain);
  var selectTooltipNiceTicks = createSelector([selectTooltipAxisDomain, selectTooltipAxis, selectTooltipAxisRealScaleType], combineNiceTicks);
  var selectTooltipAxisDomainIncludingNiceTicks = createSelector([selectTooltipAxis, selectTooltipAxisDomain, selectTooltipNiceTicks, selectTooltipAxisType], combineAxisDomainWithNiceTicks);
  var selectTooltipAxisRange = (state) => {
    var axisType = selectTooltipAxisType(state);
    var axisId = selectTooltipAxisId(state);
    var isPanorama = false;
    return selectAxisRange(state, axisType, axisId, isPanorama);
  };
  var selectTooltipAxisRangeWithReverse = createSelector([selectTooltipAxis, selectTooltipAxisRange], combineAxisRangeWithReverse);
  var selectTooltipConfiguredScale = createSelector([selectTooltipAxis, selectTooltipAxisRealScaleType, selectTooltipAxisDomainIncludingNiceTicks, selectTooltipAxisRangeWithReverse], combineConfiguredScale);
  var selectTooltipAxisScale = createSelector([selectTooltipConfiguredScale], rechartsScaleFactory);
  var selectTooltipDuplicateDomain = createSelector([selectChartLayout, selectAllTooltipAppliedValues, selectTooltipAxis, selectTooltipAxisType], combineDuplicateDomain);
  var selectTooltipCategoricalDomain = createSelector([selectChartLayout, selectAllTooltipAppliedValues, selectTooltipAxis, selectTooltipAxisType], combineCategoricalDomain);
  var combineTicksOfTooltipAxis = (layout, axis, realScaleType, scale, range3, duplicateDomain, categoricalDomain, axisType) => {
    if (!axis) {
      return void 0;
    }
    var type = axis.type;
    var isCategorical = isCategoricalAxis(layout, axisType);
    if (!scale) {
      return void 0;
    }
    var offsetForBand = realScaleType === "scaleBand" && scale.bandwidth ? scale.bandwidth() / 2 : 2;
    var offset = type === "category" && scale.bandwidth ? scale.bandwidth() / offsetForBand : 0;
    offset = axisType === "angleAxis" && range3 != null && (range3 === null || range3 === void 0 ? void 0 : range3.length) >= 2 ? mathSign(range3[0] - range3[1]) * 2 * offset : offset;
    if (isCategorical && categoricalDomain) {
      return categoricalDomain.map((entry, index) => {
        var scaled = scale.map(entry);
        if (!isWellBehavedNumber(scaled)) {
          return null;
        }
        return {
          coordinate: scaled + offset,
          value: entry,
          index,
          offset
        };
      }).filter(isNotNil);
    }
    return scale.domain().map((entry, index) => {
      var scaled = scale.map(entry);
      if (!isWellBehavedNumber(scaled)) {
        return null;
      }
      return {
        coordinate: scaled + offset,
        // @ts-expect-error can't use Date as an index
        value: duplicateDomain ? duplicateDomain[entry] : entry,
        index,
        offset
      };
    }).filter(isNotNil);
  };
  var selectTooltipAxisTicks = createSelector([selectChartLayout, selectTooltipAxis, selectTooltipAxisRealScaleType, selectTooltipAxisScale, selectTooltipAxisRange, selectTooltipDuplicateDomain, selectTooltipCategoricalDomain, selectTooltipAxisType], combineTicksOfTooltipAxis);
  var selectTooltipEventType2 = createSelector([selectDefaultTooltipEventType, selectValidateTooltipEventTypes, selectTooltipSettings], (defaultTooltipEventType, validateTooltipEventType, settings) => combineTooltipEventType(settings.shared, defaultTooltipEventType, validateTooltipEventType));
  var selectTooltipTrigger = (state) => state.tooltip.settings.trigger;
  var selectDefaultIndex = (state) => state.tooltip.settings.defaultIndex;
  var selectTooltipInteractionState = createSelector([selectTooltipState, selectTooltipEventType2, selectTooltipTrigger, selectDefaultIndex], combineTooltipInteractionState);
  var selectActiveTooltipIndex = createSelector([selectTooltipInteractionState, selectTooltipDisplayedData, selectTooltipAxisDataKey, selectTooltipAxisDomain], combineActiveTooltipIndex);
  var selectActiveLabel = createSelector([selectTooltipAxisTicks, selectActiveTooltipIndex], combineActiveLabel);
  var selectActiveTooltipDataKey = createSelector([selectTooltipInteractionState], (tooltipInteraction) => {
    if (!tooltipInteraction) {
      return void 0;
    }
    return tooltipInteraction.dataKey;
  });
  var selectActiveTooltipGraphicalItemId = createSelector([selectTooltipInteractionState], (tooltipInteraction) => {
    if (!tooltipInteraction) {
      return void 0;
    }
    return tooltipInteraction.graphicalItemId;
  });
  var selectTooltipPayloadConfigurations = createSelector([selectTooltipState, selectTooltipEventType2, selectTooltipTrigger, selectDefaultIndex], combineTooltipPayloadConfigurations);
  var selectTooltipCoordinateForDefaultIndex = createSelector([selectChartWidth, selectChartHeight, selectChartLayout, selectChartOffsetInternal, selectTooltipAxisTicks, selectDefaultIndex, selectTooltipPayloadConfigurations], combineCoordinateForDefaultIndex);
  var selectActiveTooltipCoordinate = createSelector([selectTooltipInteractionState, selectTooltipCoordinateForDefaultIndex], (tooltipInteractionState, defaultIndexCoordinate) => {
    if (tooltipInteractionState !== null && tooltipInteractionState !== void 0 && tooltipInteractionState.coordinate) {
      return tooltipInteractionState.coordinate;
    }
    return defaultIndexCoordinate;
  });
  var selectIsTooltipActive = createSelector([selectTooltipInteractionState], (tooltipInteractionState) => {
    var _tooltipInteractionSt;
    return (_tooltipInteractionSt = tooltipInteractionState === null || tooltipInteractionState === void 0 ? void 0 : tooltipInteractionState.active) !== null && _tooltipInteractionSt !== void 0 ? _tooltipInteractionSt : false;
  });
  var selectActiveTooltipPayload = createSelector([selectTooltipPayloadConfigurations, selectActiveTooltipIndex, selectChartDataWithIndexes, selectTooltipAxisDataKey, selectActiveLabel, selectTooltipPayloadSearcher, selectTooltipEventType2], combineTooltipPayload);
  var selectActiveTooltipDataPoints = createSelector([selectActiveTooltipPayload], (payload) => {
    if (payload == null) {
      return void 0;
    }
    var dataPoints = payload.map((p) => p.payload).filter((p) => p != null);
    return Array.from(new Set(dataPoints));
  });

  // node_modules/recharts/es6/state/selectors/selectors.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/util/getActiveCoordinate.js
  init_define_import_meta_env();
  function ownKeys10(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread10(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys10(Object(t), true).forEach(function(r3) {
        _defineProperty11(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys10(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty11(e, r2, t) {
    return (r2 = _toPropertyKey11(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey11(t) {
    var i = _toPrimitive11(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive11(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var getActiveCartesianCoordinate = (layout, tooltipTicks, activeIndex, pointer) => {
    var entry = tooltipTicks.find((tick) => tick && tick.index === activeIndex);
    if (entry) {
      if (layout === "horizontal") {
        return {
          x: entry.coordinate,
          y: pointer.relativeY
        };
      }
      if (layout === "vertical") {
        return {
          x: pointer.relativeX,
          y: entry.coordinate
        };
      }
    }
    return {
      x: 0,
      y: 0
    };
  };
  var getActivePolarCoordinate = (layout, tooltipTicks, activeIndex, rangeObj) => {
    var entry = tooltipTicks.find((tick) => tick && tick.index === activeIndex);
    if (entry) {
      if (layout === "centric") {
        var _angle = entry.coordinate;
        var _radius = rangeObj.radius;
        return _objectSpread10(_objectSpread10(_objectSpread10({}, rangeObj), polarToCartesian(rangeObj.cx, rangeObj.cy, _radius, _angle)), {}, {
          angle: _angle,
          radius: _radius
        });
      }
      var radius = entry.coordinate;
      var angle = rangeObj.angle;
      return _objectSpread10(_objectSpread10(_objectSpread10({}, rangeObj), polarToCartesian(rangeObj.cx, rangeObj.cy, radius, angle)), {}, {
        angle,
        radius
      });
    }
    return {
      angle: 0,
      clockWise: false,
      cx: 0,
      cy: 0,
      endAngle: 0,
      innerRadius: 0,
      outerRadius: 0,
      radius: 0,
      startAngle: 0,
      x: 0,
      y: 0
    };
  };
  function isInCartesianRange(pointer, offset) {
    var x = pointer.relativeX, y = pointer.relativeY;
    return x >= offset.left && x <= offset.left + offset.width && y >= offset.top && y <= offset.top + offset.height;
  }
  var calculateActiveTickIndex = (coordinate, ticks2, unsortedTicks, axisType, range3) => {
    var _ticks$length;
    var len = (_ticks$length = ticks2 === null || ticks2 === void 0 ? void 0 : ticks2.length) !== null && _ticks$length !== void 0 ? _ticks$length : 0;
    if (len <= 1 || coordinate == null) {
      return 0;
    }
    if (axisType === "angleAxis" && range3 != null && Math.abs(Math.abs(range3[1] - range3[0]) - 360) <= 1e-6) {
      for (var i = 0; i < len; i++) {
        var _unsortedTicks, _unsortedTicks2, _unsortedTicks$i, _unsortedTicks$, _unsortedTicks3;
        var before = i > 0 ? (_unsortedTicks = unsortedTicks[i - 1]) === null || _unsortedTicks === void 0 ? void 0 : _unsortedTicks.coordinate : (_unsortedTicks2 = unsortedTicks[len - 1]) === null || _unsortedTicks2 === void 0 ? void 0 : _unsortedTicks2.coordinate;
        var cur = (_unsortedTicks$i = unsortedTicks[i]) === null || _unsortedTicks$i === void 0 ? void 0 : _unsortedTicks$i.coordinate;
        var after = i >= len - 1 ? (_unsortedTicks$ = unsortedTicks[0]) === null || _unsortedTicks$ === void 0 ? void 0 : _unsortedTicks$.coordinate : (_unsortedTicks3 = unsortedTicks[i + 1]) === null || _unsortedTicks3 === void 0 ? void 0 : _unsortedTicks3.coordinate;
        var sameDirectionCoord = void 0;
        if (before == null || cur == null || after == null) {
          continue;
        }
        if (mathSign(cur - before) !== mathSign(after - cur)) {
          var diffInterval = [];
          if (mathSign(after - cur) === mathSign(range3[1] - range3[0])) {
            sameDirectionCoord = after;
            var curInRange = cur + range3[1] - range3[0];
            diffInterval[0] = Math.min(curInRange, (curInRange + before) / 2);
            diffInterval[1] = Math.max(curInRange, (curInRange + before) / 2);
          } else {
            sameDirectionCoord = before;
            var afterInRange = after + range3[1] - range3[0];
            diffInterval[0] = Math.min(cur, (afterInRange + cur) / 2);
            diffInterval[1] = Math.max(cur, (afterInRange + cur) / 2);
          }
          var sameInterval = [Math.min(cur, (sameDirectionCoord + cur) / 2), Math.max(cur, (sameDirectionCoord + cur) / 2)];
          if (coordinate > sameInterval[0] && coordinate <= sameInterval[1] || coordinate >= diffInterval[0] && coordinate <= diffInterval[1]) {
            var _unsortedTicks$i2;
            return (_unsortedTicks$i2 = unsortedTicks[i]) === null || _unsortedTicks$i2 === void 0 ? void 0 : _unsortedTicks$i2.index;
          }
        } else {
          var minValue = Math.min(before, after);
          var maxValue = Math.max(before, after);
          if (coordinate > (minValue + cur) / 2 && coordinate <= (maxValue + cur) / 2) {
            var _unsortedTicks$i3;
            return (_unsortedTicks$i3 = unsortedTicks[i]) === null || _unsortedTicks$i3 === void 0 ? void 0 : _unsortedTicks$i3.index;
          }
        }
      }
    } else if (ticks2) {
      for (var _i = 0; _i < len; _i++) {
        var curr = ticks2[_i];
        if (curr == null) {
          continue;
        }
        var next = ticks2[_i + 1];
        var prev = ticks2[_i - 1];
        if (_i === 0 && next != null && coordinate <= (curr.coordinate + next.coordinate) / 2) {
          return curr.index;
        }
        if (_i === len - 1 && prev != null && coordinate > (curr.coordinate + prev.coordinate) / 2) {
          return curr.index;
        }
        if (_i > 0 && _i < len - 1 && prev != null && next != null && coordinate > (curr.coordinate + prev.coordinate) / 2 && coordinate <= (curr.coordinate + next.coordinate) / 2) {
          return curr.index;
        }
      }
    }
    return -1;
  };

  // node_modules/recharts/es6/state/selectors/selectors.js
  var pickTooltipEventType = (_state, tooltipEventType) => tooltipEventType;
  var pickTrigger = (_state, _tooltipEventType, trigger) => trigger;
  var pickDefaultIndex = (_state, _tooltipEventType, _trigger, defaultIndex) => defaultIndex;
  var selectOrderedTooltipTicks = createSelector(selectTooltipAxisTicks, (ticks2) => sortBy(ticks2, (o) => o.coordinate));
  var selectTooltipInteractionState2 = createSelector([selectTooltipState, pickTooltipEventType, pickTrigger, pickDefaultIndex], combineTooltipInteractionState);
  var selectActiveIndex = createSelector([selectTooltipInteractionState2, selectTooltipDisplayedData, selectTooltipAxisDataKey, selectTooltipAxisDomain], combineActiveTooltipIndex);
  var selectTooltipPayloadConfigurations2 = createSelector([selectTooltipState, pickTooltipEventType, pickTrigger, pickDefaultIndex], combineTooltipPayloadConfigurations);
  var selectCoordinateForDefaultIndex = createSelector([selectChartWidth, selectChartHeight, selectChartLayout, selectChartOffsetInternal, selectTooltipAxisTicks, pickDefaultIndex, selectTooltipPayloadConfigurations2], combineCoordinateForDefaultIndex);
  var selectActiveCoordinate = createSelector([selectTooltipInteractionState2, selectCoordinateForDefaultIndex], (tooltipInteractionState, defaultIndexCoordinate) => {
    var _tooltipInteractionSt;
    return (_tooltipInteractionSt = tooltipInteractionState.coordinate) !== null && _tooltipInteractionSt !== void 0 ? _tooltipInteractionSt : defaultIndexCoordinate;
  });
  var selectActiveLabel2 = createSelector([selectTooltipAxisTicks, selectActiveIndex], combineActiveLabel);
  var selectTooltipPayload = createSelector([selectTooltipPayloadConfigurations2, selectActiveIndex, selectChartDataWithIndexes, selectTooltipAxisDataKey, selectActiveLabel2, selectTooltipPayloadSearcher, pickTooltipEventType], combineTooltipPayload);
  var selectIsTooltipActive2 = createSelector([selectTooltipInteractionState2, selectActiveIndex], (tooltipInteractionState, activeIndex) => {
    return {
      isActive: tooltipInteractionState.active && activeIndex != null,
      activeIndex
    };
  });
  var combineActiveCartesianProps = (chartEvent, layout, tooltipAxisType, tooltipAxisRange, tooltipTicks, orderedTooltipTicks, offset) => {
    if (!chartEvent || !tooltipAxisType || !tooltipAxisRange || !tooltipTicks) {
      return void 0;
    }
    if (!isInCartesianRange(chartEvent, offset)) {
      return void 0;
    }
    var pos = calculateCartesianTooltipPos(chartEvent, layout);
    var activeIndex = calculateActiveTickIndex(pos, orderedTooltipTicks, tooltipTicks, tooltipAxisType, tooltipAxisRange);
    var activeCoordinate = getActiveCartesianCoordinate(layout, tooltipTicks, activeIndex, chartEvent);
    return {
      activeIndex: String(activeIndex),
      activeCoordinate
    };
  };
  var combineActivePolarProps = (chartEvent, layout, polarViewBox, tooltipAxisType, tooltipAxisRange, tooltipTicks, orderedTooltipTicks) => {
    if (!chartEvent || !tooltipAxisType || !tooltipAxisRange || !tooltipTicks || !polarViewBox) {
      return void 0;
    }
    var rangeObj = inRangeOfSector(chartEvent, polarViewBox);
    if (!rangeObj) {
      return void 0;
    }
    var pos = calculatePolarTooltipPos(rangeObj, layout);
    var activeIndex = calculateActiveTickIndex(pos, orderedTooltipTicks, tooltipTicks, tooltipAxisType, tooltipAxisRange);
    var activeCoordinate = getActivePolarCoordinate(layout, tooltipTicks, activeIndex, rangeObj);
    return {
      activeIndex: String(activeIndex),
      activeCoordinate
    };
  };
  var combineActiveProps = (chartEvent, layout, polarViewBox, tooltipAxisType, tooltipAxisRange, tooltipTicks, orderedTooltipTicks, offset) => {
    if (!chartEvent || !layout || !tooltipAxisType || !tooltipAxisRange || !tooltipTicks) {
      return void 0;
    }
    if (layout === "horizontal" || layout === "vertical") {
      return combineActiveCartesianProps(chartEvent, layout, tooltipAxisType, tooltipAxisRange, tooltipTicks, orderedTooltipTicks, offset);
    }
    return combineActivePolarProps(chartEvent, layout, polarViewBox, tooltipAxisType, tooltipAxisRange, tooltipTicks, orderedTooltipTicks);
  };

  // node_modules/recharts/es6/zIndex/ZIndexLayer.js
  init_define_import_meta_env();
  var import_react16 = __toESM(require_react_shim());
  var import_react_dom = __toESM(require_react_dom_shim());

  // node_modules/recharts/es6/zIndex/zIndexSelectors.js
  init_define_import_meta_env();
  var selectZIndexPortalElement = createSelector((state) => state.zIndex.zIndexMap, (_, zIndex) => zIndex, (_, _zIndex, isPanorama) => isPanorama, (zIndexMap, zIndex, isPanorama) => {
    if (zIndex == null) {
      return void 0;
    }
    var entry = zIndexMap[zIndex];
    if (entry == null) {
      return void 0;
    }
    if (isPanorama) {
      return entry.panoramaElement;
    }
    return entry.element;
  });
  var selectAllRegisteredZIndexes = createSelector((state) => state.zIndex.zIndexMap, (zIndexMap) => {
    var allNumbers = Object.keys(zIndexMap).map((zIndexStr) => parseInt(zIndexStr, 10)).concat(Object.values(DefaultZIndexes));
    var uniqueNumbers = Array.from(new Set(allNumbers));
    return uniqueNumbers.sort((a, b) => a - b);
  }, {
    memoizeOptions: {
      resultEqualityCheck: arrayContentsAreEqualCheck
    }
  });

  // node_modules/recharts/es6/state/zIndexSlice.js
  init_define_import_meta_env();
  function ownKeys11(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread11(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys11(Object(t), true).forEach(function(r3) {
        _defineProperty12(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys11(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty12(e, r2, t) {
    return (r2 = _toPropertyKey12(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey12(t) {
    var i = _toPrimitive12(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive12(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var seed = {};
  var initialState4 = {
    zIndexMap: Object.values(DefaultZIndexes).reduce((acc, current2) => _objectSpread11(_objectSpread11({}, acc), {}, {
      [current2]: {
        element: void 0,
        panoramaElement: void 0,
        consumers: 0
      }
    }), seed)
  };
  var defaultZIndexSet = new Set(Object.values(DefaultZIndexes));
  function isDefaultZIndex(zIndex) {
    return defaultZIndexSet.has(zIndex);
  }
  var zIndexSlice = createSlice({
    name: "zIndex",
    initialState: initialState4,
    reducers: {
      registerZIndexPortal: {
        reducer: (state, action) => {
          var zIndex = action.payload.zIndex;
          if (state.zIndexMap[zIndex]) {
            state.zIndexMap[zIndex].consumers += 1;
          } else {
            state.zIndexMap[zIndex] = {
              consumers: 1,
              element: void 0,
              panoramaElement: void 0
            };
          }
        },
        prepare: prepareAutoBatched()
      },
      unregisterZIndexPortal: {
        reducer: (state, action) => {
          var zIndex = action.payload.zIndex;
          if (state.zIndexMap[zIndex]) {
            state.zIndexMap[zIndex].consumers -= 1;
            if (state.zIndexMap[zIndex].consumers <= 0 && !isDefaultZIndex(zIndex)) {
              delete state.zIndexMap[zIndex];
            }
          }
        },
        prepare: prepareAutoBatched()
      },
      registerZIndexPortalElement: {
        reducer: (state, action) => {
          var _action$payload = action.payload, zIndex = _action$payload.zIndex, element = _action$payload.element, isPanorama = _action$payload.isPanorama;
          if (state.zIndexMap[zIndex]) {
            if (isPanorama) {
              state.zIndexMap[zIndex].panoramaElement = castDraft(element);
            } else {
              state.zIndexMap[zIndex].element = castDraft(element);
            }
          } else {
            state.zIndexMap[zIndex] = {
              consumers: 0,
              element: isPanorama ? void 0 : castDraft(element),
              panoramaElement: isPanorama ? castDraft(element) : void 0
            };
          }
        },
        prepare: prepareAutoBatched()
      },
      unregisterZIndexPortalElement: {
        reducer: (state, action) => {
          var zIndex = action.payload.zIndex;
          if (state.zIndexMap[zIndex]) {
            if (action.payload.isPanorama) {
              state.zIndexMap[zIndex].panoramaElement = void 0;
            } else {
              state.zIndexMap[zIndex].element = void 0;
            }
          }
        },
        prepare: prepareAutoBatched()
      }
    }
  });
  var _zIndexSlice$actions = zIndexSlice.actions;
  var registerZIndexPortal = _zIndexSlice$actions.registerZIndexPortal;
  var unregisterZIndexPortal = _zIndexSlice$actions.unregisterZIndexPortal;
  var registerZIndexPortalElement = _zIndexSlice$actions.registerZIndexPortalElement;
  var unregisterZIndexPortalElement = _zIndexSlice$actions.unregisterZIndexPortalElement;
  var zIndexReducer = zIndexSlice.reducer;

  // node_modules/recharts/es6/zIndex/ZIndexLayer.js
  function ZIndexLayer(_ref2) {
    var zIndex = _ref2.zIndex, children = _ref2.children;
    var isInChartContext = useIsInChartContext();
    var shouldRenderInPortal = isInChartContext && zIndex !== void 0 && zIndex !== 0;
    var isPanorama = useIsPanorama();
    var lastPortalElementRef = (0, import_react16.useRef)(void 0);
    var registeredZIndexesRef = (0, import_react16.useRef)(/* @__PURE__ */ new Set());
    var dispatch = useAppDispatch();
    var portalElement = useAppSelector((state) => selectZIndexPortalElement(state, zIndex, isPanorama));
    (0, import_react16.useLayoutEffect)(() => {
      if (!shouldRenderInPortal) {
        var registered = registeredZIndexesRef.current;
        registered.forEach((z) => {
          dispatch(unregisterZIndexPortal({
            zIndex: z
          }));
        });
        registered.clear();
        lastPortalElementRef.current = void 0;
        return;
      }
      if (!registeredZIndexesRef.current.has(zIndex)) {
        dispatch(registerZIndexPortal({
          zIndex
        }));
        registeredZIndexesRef.current.add(zIndex);
      }
      if (portalElement) {
        lastPortalElementRef.current = portalElement;
        var _registered = registeredZIndexesRef.current;
        _registered.forEach((z) => {
          if (z !== zIndex) {
            dispatch(unregisterZIndexPortal({
              zIndex: z
            }));
            _registered.delete(z);
          }
        });
      }
    }, [dispatch, zIndex, shouldRenderInPortal, portalElement]);
    (0, import_react16.useLayoutEffect)(() => {
      var registered = registeredZIndexesRef.current;
      return () => {
        registered.forEach((z) => {
          dispatch(unregisterZIndexPortal({
            zIndex: z
          }));
        });
        registered.clear();
      };
    }, [dispatch]);
    if (!shouldRenderInPortal) {
      return children;
    }
    var targetElement = portalElement !== null && portalElement !== void 0 ? portalElement : lastPortalElementRef.current;
    if (!targetElement) {
      return null;
    }
    return /* @__PURE__ */ (0, import_react_dom.createPortal)(children, targetElement);
  }

  // node_modules/recharts/es6/context/tooltipPortalContext.js
  init_define_import_meta_env();
  var import_react17 = __toESM(require_react_shim());
  var TooltipPortalContext = /* @__PURE__ */ (0, import_react17.createContext)(null);

  // node_modules/recharts/es6/synchronisation/useChartSynchronisation.js
  init_define_import_meta_env();
  var import_react18 = __toESM(require_react_shim());

  // node_modules/recharts/es6/util/Events.js
  init_define_import_meta_env();

  // node_modules/eventemitter3/index.mjs
  init_define_import_meta_env();
  var import_index = __toESM(require_eventemitter3(), 1);
  var eventemitter3_default = import_index.default;

  // node_modules/recharts/es6/util/Events.js
  var eventCenter = new eventemitter3_default();
  var TOOLTIP_SYNC_EVENT = "recharts.syncEvent.tooltip";
  var BRUSH_SYNC_EVENT = "recharts.syncEvent.brush";

  // node_modules/recharts/es6/state/optionsSlice.js
  init_define_import_meta_env();
  var arrayTooltipSearcher = (data2, strIndex) => {
    if (!strIndex) return void 0;
    if (!Array.isArray(data2)) return void 0;
    var numIndex = Number.parseInt(strIndex, 10);
    if (isNan(numIndex)) {
      return void 0;
    }
    return data2[numIndex];
  };
  var initialState5 = {
    chartName: "",
    tooltipPayloadSearcher: () => void 0,
    eventEmitter: void 0,
    defaultTooltipEventType: "axis"
  };
  var optionsSlice = createSlice({
    name: "options",
    initialState: initialState5,
    reducers: {
      createEventEmitter: (state) => {
        if (state.eventEmitter == null) {
          state.eventEmitter = /* @__PURE__ */ Symbol("rechartsEventEmitter");
        }
      }
    }
  });
  var optionsReducer = optionsSlice.reducer;
  var createEventEmitter = optionsSlice.actions.createEventEmitter;

  // node_modules/recharts/es6/state/chartDataSlice.js
  init_define_import_meta_env();
  var initialChartDataState = {
    chartData: void 0,
    computedData: void 0,
    dataStartIndex: 0,
    dataEndIndex: 0
  };
  var chartDataSlice = createSlice({
    name: "chartData",
    initialState: initialChartDataState,
    reducers: {
      setChartData(state, action) {
        state.chartData = castDraft(action.payload);
        if (action.payload == null) {
          state.dataStartIndex = 0;
          state.dataEndIndex = 0;
          return;
        }
        if (action.payload.length > 0 && state.dataEndIndex !== action.payload.length - 1) {
          state.dataEndIndex = action.payload.length - 1;
        }
      },
      setComputedData(state, action) {
        state.computedData = action.payload;
      },
      setDataStartEndIndexes(state, action) {
        var _action$payload = action.payload, startIndex = _action$payload.startIndex, endIndex = _action$payload.endIndex;
        if (startIndex != null) {
          state.dataStartIndex = startIndex;
        }
        if (endIndex != null) {
          state.dataEndIndex = endIndex;
        }
      }
    }
  });
  var _chartDataSlice$actio = chartDataSlice.actions;
  var setChartData = _chartDataSlice$actio.setChartData;
  var setDataStartEndIndexes = _chartDataSlice$actio.setDataStartEndIndexes;
  var setComputedData = _chartDataSlice$actio.setComputedData;
  var chartDataReducer = chartDataSlice.reducer;

  // node_modules/recharts/es6/synchronisation/useChartSynchronisation.js
  var _excluded4 = ["x", "y"];
  function ownKeys12(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread12(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys12(Object(t), true).forEach(function(r3) {
        _defineProperty13(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys12(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty13(e, r2, t) {
    return (r2 = _toPropertyKey13(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey13(t) {
    var i = _toPrimitive13(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive13(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function _objectWithoutProperties4(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose4(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose4(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function useTooltipSyncEventsListener() {
    var mySyncId = useAppSelector(selectSyncId);
    var myEventEmitter = useAppSelector(selectEventEmitter);
    var dispatch = useAppDispatch();
    var syncMethod = useAppSelector(selectSyncMethod);
    var tooltipTicks = useAppSelector(selectTooltipAxisTicks);
    var layout = useChartLayout();
    var viewBox = useViewBox();
    var className = useAppSelector((state) => state.rootProps.className);
    (0, import_react18.useEffect)(() => {
      if (mySyncId == null) {
        return noop;
      }
      var listener2 = (incomingSyncId, action, emitter) => {
        if (myEventEmitter === emitter) {
          return;
        }
        if (mySyncId !== incomingSyncId) {
          return;
        }
        if (action.payload.active === false) {
          dispatch(setSyncInteraction({
            active: false,
            coordinate: void 0,
            dataKey: void 0,
            index: null,
            label: void 0,
            sourceViewBox: void 0,
            graphicalItemId: void 0
          }));
          return;
        }
        if (syncMethod === "index") {
          var _action$payload;
          if (viewBox && action !== null && action !== void 0 && (_action$payload = action.payload) !== null && _action$payload !== void 0 && _action$payload.coordinate && action.payload.sourceViewBox) {
            var _action$payload$coord = action.payload.coordinate, _x = _action$payload$coord.x, _y = _action$payload$coord.y, otherCoordinateProps = _objectWithoutProperties4(_action$payload$coord, _excluded4);
            var _action$payload$sourc = action.payload.sourceViewBox, sourceX = _action$payload$sourc.x, sourceY = _action$payload$sourc.y, sourceWidth = _action$payload$sourc.width, sourceHeight = _action$payload$sourc.height;
            var scaledCoordinate = _objectSpread12(_objectSpread12({}, otherCoordinateProps), {}, {
              x: viewBox.x + (sourceWidth ? (_x - sourceX) / sourceWidth : 0) * viewBox.width,
              y: viewBox.y + (sourceHeight ? (_y - sourceY) / sourceHeight : 0) * viewBox.height
            });
            dispatch(_objectSpread12(_objectSpread12({}, action), {}, {
              payload: _objectSpread12(_objectSpread12({}, action.payload), {}, {
                coordinate: scaledCoordinate
              })
            }));
          } else {
            dispatch(action);
          }
          return;
        }
        if (tooltipTicks == null) {
          return;
        }
        var activeTick;
        if (typeof syncMethod === "function") {
          var syncMethodParam = {
            activeTooltipIndex: action.payload.index == null ? void 0 : Number(action.payload.index),
            isTooltipActive: action.payload.active,
            activeIndex: action.payload.index == null ? void 0 : Number(action.payload.index),
            activeLabel: action.payload.label,
            activeDataKey: action.payload.dataKey,
            activeCoordinate: action.payload.coordinate
          };
          var activeTooltipIndex = syncMethod(tooltipTicks, syncMethodParam);
          activeTick = tooltipTicks[activeTooltipIndex];
        } else if (syncMethod === "value") {
          activeTick = tooltipTicks.find((tick) => String(tick.value) === action.payload.label);
        }
        var coordinate = action.payload.coordinate;
        if (coordinate == null || viewBox == null) {
          dispatch(setSyncInteraction({
            active: false,
            coordinate: void 0,
            dataKey: void 0,
            index: null,
            label: void 0,
            sourceViewBox: void 0,
            graphicalItemId: void 0
          }));
          return;
        }
        if (activeTick == null) {
          dispatch(setSyncInteraction({
            active: false,
            coordinate: void 0,
            dataKey: void 0,
            index: null,
            label: void 0,
            sourceViewBox: action.payload.sourceViewBox,
            graphicalItemId: void 0
          }));
          return;
        }
        var x = coordinate.x, y = coordinate.y;
        var validateChartX = Math.min(x, viewBox.x + viewBox.width);
        var validateChartY = Math.min(y, viewBox.y + viewBox.height);
        var activeCoordinate = {
          x: layout === "horizontal" ? activeTick.coordinate : validateChartX,
          y: layout === "horizontal" ? validateChartY : activeTick.coordinate
        };
        var syncAction = setSyncInteraction({
          active: action.payload.active,
          coordinate: activeCoordinate,
          dataKey: action.payload.dataKey,
          index: String(activeTick.index),
          label: action.payload.label,
          sourceViewBox: action.payload.sourceViewBox,
          graphicalItemId: action.payload.graphicalItemId
        });
        dispatch(syncAction);
      };
      eventCenter.on(TOOLTIP_SYNC_EVENT, listener2);
      return () => {
        eventCenter.off(TOOLTIP_SYNC_EVENT, listener2);
      };
    }, [className, dispatch, myEventEmitter, mySyncId, syncMethod, tooltipTicks, layout, viewBox]);
  }
  function useBrushSyncEventsListener() {
    var mySyncId = useAppSelector(selectSyncId);
    var myEventEmitter = useAppSelector(selectEventEmitter);
    var dispatch = useAppDispatch();
    (0, import_react18.useEffect)(() => {
      if (mySyncId == null) {
        return noop;
      }
      var listener2 = (incomingSyncId, action, emitter) => {
        if (myEventEmitter === emitter) {
          return;
        }
        if (mySyncId === incomingSyncId) {
          dispatch(setDataStartEndIndexes(action));
        }
      };
      eventCenter.on(BRUSH_SYNC_EVENT, listener2);
      return () => {
        eventCenter.off(BRUSH_SYNC_EVENT, listener2);
      };
    }, [dispatch, myEventEmitter, mySyncId]);
  }
  function useSynchronisedEventsFromOtherCharts() {
    var dispatch = useAppDispatch();
    (0, import_react18.useEffect)(() => {
      dispatch(createEventEmitter());
    }, [dispatch]);
    useTooltipSyncEventsListener();
    useBrushSyncEventsListener();
  }

  // node_modules/recharts/es6/component/Cell.js
  init_define_import_meta_env();
  var Cell = (_props) => null;
  Cell.displayName = "Cell";

  // node_modules/recharts/es6/component/Text.js
  init_define_import_meta_env();
  var React7 = __toESM(require_react_shim());
  var import_react19 = __toESM(require_react_shim());

  // node_modules/recharts/es6/util/DOMUtils.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/util/LRUCache.js
  init_define_import_meta_env();
  function _defineProperty14(e, r2, t) {
    return (r2 = _toPropertyKey14(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey14(t) {
    var i = _toPrimitive14(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive14(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var LRUCache = class {
    constructor(maxSize) {
      _defineProperty14(this, "cache", /* @__PURE__ */ new Map());
      this.maxSize = maxSize;
    }
    get(key) {
      var value = this.cache.get(key);
      if (value !== void 0) {
        this.cache.delete(key);
        this.cache.set(key, value);
      }
      return value;
    }
    set(key, value) {
      if (this.cache.has(key)) {
        this.cache.delete(key);
      } else if (this.cache.size >= this.maxSize) {
        var firstKey = this.cache.keys().next().value;
        if (firstKey != null) {
          this.cache.delete(firstKey);
        }
      }
      this.cache.set(key, value);
    }
    clear() {
      this.cache.clear();
    }
    size() {
      return this.cache.size;
    }
  };

  // node_modules/recharts/es6/util/DOMUtils.js
  function ownKeys13(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread13(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys13(Object(t), true).forEach(function(r3) {
        _defineProperty15(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys13(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty15(e, r2, t) {
    return (r2 = _toPropertyKey15(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey15(t) {
    var i = _toPrimitive15(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive15(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var defaultConfig = {
    cacheSize: 2e3,
    enableCache: true
  };
  var currentConfig = _objectSpread13({}, defaultConfig);
  var stringCache = new LRUCache(currentConfig.cacheSize);
  var SPAN_STYLE = {
    position: "absolute",
    top: "-20000px",
    left: 0,
    padding: 0,
    margin: 0,
    border: "none",
    whiteSpace: "pre"
  };
  var MEASUREMENT_SPAN_ID = "recharts_measurement_span";
  function createCacheKey(text, style) {
    var fontSize = style.fontSize || "";
    var fontFamily = style.fontFamily || "";
    var fontWeight = style.fontWeight || "";
    var fontStyle = style.fontStyle || "";
    var letterSpacing = style.letterSpacing || "";
    var textTransform = style.textTransform || "";
    return "".concat(text, "|").concat(fontSize, "|").concat(fontFamily, "|").concat(fontWeight, "|").concat(fontStyle, "|").concat(letterSpacing, "|").concat(textTransform);
  }
  var measureTextWithDOM = (text, style) => {
    try {
      var measurementSpan = document.getElementById(MEASUREMENT_SPAN_ID);
      if (!measurementSpan) {
        measurementSpan = document.createElement("span");
        measurementSpan.setAttribute("id", MEASUREMENT_SPAN_ID);
        measurementSpan.setAttribute("aria-hidden", "true");
        document.body.appendChild(measurementSpan);
      }
      Object.assign(measurementSpan.style, SPAN_STYLE, style);
      measurementSpan.textContent = "".concat(text);
      var rect = measurementSpan.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height
      };
    } catch (_unused) {
      return {
        width: 0,
        height: 0
      };
    }
  };
  var getStringSize = function getStringSize2(text) {
    var style = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (text === void 0 || text === null || Global.isSsr) {
      return {
        width: 0,
        height: 0
      };
    }
    if (!currentConfig.enableCache) {
      return measureTextWithDOM(text, style);
    }
    var cacheKey = createCacheKey(text, style);
    var cachedResult = stringCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    var result = measureTextWithDOM(text, style);
    stringCache.set(cacheKey, result);
    return result;
  };

  // node_modules/recharts/es6/util/ReduceCSSCalc.js
  init_define_import_meta_env();
  var _DecimalCSS;
  function _slicedToArray7(r2, e) {
    return _arrayWithHoles7(r2) || _iterableToArrayLimit7(r2, e) || _unsupportedIterableToArray7(r2, e) || _nonIterableRest7();
  }
  function _nonIterableRest7() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray7(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray7(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray7(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray7(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit7(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles7(r2) {
    if (Array.isArray(r2)) return r2;
  }
  function _defineProperty16(e, r2, t) {
    return (r2 = _toPropertyKey16(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey16(t) {
    var i = _toPrimitive16(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive16(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var MULTIPLY_OR_DIVIDE_REGEX = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([*/])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/;
  var ADD_OR_SUBTRACT_REGEX = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([+-])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/;
  var CSS_LENGTH_UNIT_REGEX = /^(px|cm|vh|vw|em|rem|%|mm|in|pt|pc|ex|ch|vmin|vmax|Q)$/;
  var NUM_SPLIT_REGEX = /(-?\d+(?:\.\d+)?)([a-zA-Z%]+)?/;
  var CONVERSION_RATES = {
    cm: 96 / 2.54,
    mm: 96 / 25.4,
    pt: 96 / 72,
    pc: 96 / 6,
    in: 96,
    Q: 96 / (2.54 * 40),
    px: 1
  };
  var FIXED_CSS_LENGTH_UNITS = ["cm", "mm", "pt", "pc", "in", "Q", "px"];
  function isSupportedUnit(unit2) {
    return FIXED_CSS_LENGTH_UNITS.includes(unit2);
  }
  var STR_NAN = "NaN";
  function convertToPx(value, unit2) {
    return value * CONVERSION_RATES[unit2];
  }
  var DecimalCSS = class _DecimalCSS2 {
    static parse(str) {
      var _NUM_SPLIT_REGEX$exec;
      var _ref2 = (_NUM_SPLIT_REGEX$exec = NUM_SPLIT_REGEX.exec(str)) !== null && _NUM_SPLIT_REGEX$exec !== void 0 ? _NUM_SPLIT_REGEX$exec : [], _ref22 = _slicedToArray7(_ref2, 3), numStr = _ref22[1], unit2 = _ref22[2];
      if (numStr == null) {
        return _DecimalCSS2.NaN;
      }
      return new _DecimalCSS2(parseFloat(numStr), unit2 !== null && unit2 !== void 0 ? unit2 : "");
    }
    constructor(num, unit2) {
      this.num = num;
      this.unit = unit2;
      this.num = num;
      this.unit = unit2;
      if (isNan(num)) {
        this.unit = "";
      }
      if (unit2 !== "" && !CSS_LENGTH_UNIT_REGEX.test(unit2)) {
        this.num = NaN;
        this.unit = "";
      }
      if (isSupportedUnit(unit2)) {
        this.num = convertToPx(num, unit2);
        this.unit = "px";
      }
    }
    add(other) {
      if (this.unit !== other.unit) {
        return new _DecimalCSS2(NaN, "");
      }
      return new _DecimalCSS2(this.num + other.num, this.unit);
    }
    subtract(other) {
      if (this.unit !== other.unit) {
        return new _DecimalCSS2(NaN, "");
      }
      return new _DecimalCSS2(this.num - other.num, this.unit);
    }
    multiply(other) {
      if (this.unit !== "" && other.unit !== "" && this.unit !== other.unit) {
        return new _DecimalCSS2(NaN, "");
      }
      return new _DecimalCSS2(this.num * other.num, this.unit || other.unit);
    }
    divide(other) {
      if (this.unit !== "" && other.unit !== "" && this.unit !== other.unit) {
        return new _DecimalCSS2(NaN, "");
      }
      return new _DecimalCSS2(this.num / other.num, this.unit || other.unit);
    }
    toString() {
      return "".concat(this.num).concat(this.unit);
    }
    isNaN() {
      return isNan(this.num);
    }
  };
  _DecimalCSS = DecimalCSS;
  _defineProperty16(DecimalCSS, "NaN", new _DecimalCSS(NaN, ""));
  function calculateArithmetic(expr) {
    if (expr == null || expr.includes(STR_NAN)) {
      return STR_NAN;
    }
    var newExpr = expr;
    while (newExpr.includes("*") || newExpr.includes("/")) {
      var _MULTIPLY_OR_DIVIDE_R;
      var _ref3 = (_MULTIPLY_OR_DIVIDE_R = MULTIPLY_OR_DIVIDE_REGEX.exec(newExpr)) !== null && _MULTIPLY_OR_DIVIDE_R !== void 0 ? _MULTIPLY_OR_DIVIDE_R : [], _ref4 = _slicedToArray7(_ref3, 4), leftOperand = _ref4[1], operator = _ref4[2], rightOperand = _ref4[3];
      var lTs = DecimalCSS.parse(leftOperand !== null && leftOperand !== void 0 ? leftOperand : "");
      var rTs = DecimalCSS.parse(rightOperand !== null && rightOperand !== void 0 ? rightOperand : "");
      var result = operator === "*" ? lTs.multiply(rTs) : lTs.divide(rTs);
      if (result.isNaN()) {
        return STR_NAN;
      }
      newExpr = newExpr.replace(MULTIPLY_OR_DIVIDE_REGEX, result.toString());
    }
    while (newExpr.includes("+") || /.-\d+(?:\.\d+)?/.test(newExpr)) {
      var _ADD_OR_SUBTRACT_REGE;
      var _ref5 = (_ADD_OR_SUBTRACT_REGE = ADD_OR_SUBTRACT_REGEX.exec(newExpr)) !== null && _ADD_OR_SUBTRACT_REGE !== void 0 ? _ADD_OR_SUBTRACT_REGE : [], _ref6 = _slicedToArray7(_ref5, 4), _leftOperand = _ref6[1], _operator = _ref6[2], _rightOperand = _ref6[3];
      var _lTs = DecimalCSS.parse(_leftOperand !== null && _leftOperand !== void 0 ? _leftOperand : "");
      var _rTs = DecimalCSS.parse(_rightOperand !== null && _rightOperand !== void 0 ? _rightOperand : "");
      var _result = _operator === "+" ? _lTs.add(_rTs) : _lTs.subtract(_rTs);
      if (_result.isNaN()) {
        return STR_NAN;
      }
      newExpr = newExpr.replace(ADD_OR_SUBTRACT_REGEX, _result.toString());
    }
    return newExpr;
  }
  var PARENTHESES_REGEX = /\(([^()]*)\)/;
  function calculateParentheses(expr) {
    var newExpr = expr;
    var match;
    while ((match = PARENTHESES_REGEX.exec(newExpr)) != null) {
      var _match = match, _match2 = _slicedToArray7(_match, 2), parentheticalExpression = _match2[1];
      newExpr = newExpr.replace(PARENTHESES_REGEX, calculateArithmetic(parentheticalExpression));
    }
    return newExpr;
  }
  function evaluateExpression(expression) {
    var newExpr = expression.replace(/\s+/g, "");
    newExpr = calculateParentheses(newExpr);
    newExpr = calculateArithmetic(newExpr);
    return newExpr;
  }
  function safeEvaluateExpression(expression) {
    try {
      return evaluateExpression(expression);
    } catch (_unused) {
      return STR_NAN;
    }
  }
  function reduceCSSCalc(expression) {
    var result = safeEvaluateExpression(expression.slice(5, -1));
    if (result === STR_NAN) {
      return "";
    }
    return result;
  }

  // node_modules/recharts/es6/component/Text.js
  var _excluded5 = ["x", "y", "lineHeight", "capHeight", "fill", "scaleToFit", "textAnchor", "verticalAnchor"];
  var _excluded23 = ["dx", "dy", "angle", "className", "breakAll"];
  function _extends4() {
    return _extends4 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends4.apply(null, arguments);
  }
  function _objectWithoutProperties5(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose5(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose5(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function _slicedToArray8(r2, e) {
    return _arrayWithHoles8(r2) || _iterableToArrayLimit8(r2, e) || _unsupportedIterableToArray8(r2, e) || _nonIterableRest8();
  }
  function _nonIterableRest8() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray8(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray8(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray8(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray8(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit8(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles8(r2) {
    if (Array.isArray(r2)) return r2;
  }
  var BREAKING_SPACES = /[ \f\n\r\t\v\u2028\u2029]+/;
  var calculateWordWidths = (_ref2) => {
    var children = _ref2.children, breakAll = _ref2.breakAll, style = _ref2.style;
    try {
      var words = [];
      if (!isNullish(children)) {
        if (breakAll) {
          words = children.toString().split("");
        } else {
          words = children.toString().split(BREAKING_SPACES);
        }
      }
      var wordsWithComputedWidth = words.map((word) => ({
        word,
        width: getStringSize(word, style).width
      }));
      var spaceWidth = breakAll ? 0 : getStringSize(" ", style).width;
      return {
        wordsWithComputedWidth,
        spaceWidth
      };
    } catch (_unused) {
      return null;
    }
  };
  function isValidTextAnchor(value) {
    return value === "start" || value === "middle" || value === "end" || value === "inherit";
  }
  function isRenderableText(val) {
    return isNullish(val) || typeof val === "string" || typeof val === "number" || typeof val === "boolean";
  }
  var calculate = (words, lineWidth, spaceWidth, scaleToFit) => words.reduce((result, _ref2) => {
    var word = _ref2.word, width = _ref2.width;
    var currentLine = result[result.length - 1];
    if (currentLine && width != null && (lineWidth == null || scaleToFit || currentLine.width + width + spaceWidth < Number(lineWidth))) {
      currentLine.words.push(word);
      currentLine.width += width + spaceWidth;
    } else {
      var newLine = {
        words: [word],
        width
      };
      result.push(newLine);
    }
    return result;
  }, []);
  var findLongestLine = (words) => words.reduce((a, b) => a.width > b.width ? a : b);
  var suffix = "…";
  var checkOverflow = (text, index, breakAll, style, maxLines, lineWidth, spaceWidth, scaleToFit) => {
    var tempText = text.slice(0, index);
    var words = calculateWordWidths({
      breakAll,
      style,
      children: tempText + suffix
    });
    if (!words) {
      return [false, []];
    }
    var result = calculate(words.wordsWithComputedWidth, lineWidth, spaceWidth, scaleToFit);
    var doesOverflow = result.length > maxLines || findLongestLine(result).width > Number(lineWidth);
    return [doesOverflow, result];
  };
  var calculateWordsByLines = (_ref3, initialWordsWithComputedWith, spaceWidth, lineWidth, scaleToFit) => {
    var maxLines = _ref3.maxLines, children = _ref3.children, style = _ref3.style, breakAll = _ref3.breakAll;
    var shouldLimitLines = isNumber(maxLines);
    var text = String(children);
    var originalResult = calculate(initialWordsWithComputedWith, lineWidth, spaceWidth, scaleToFit);
    if (!shouldLimitLines || scaleToFit) {
      return originalResult;
    }
    var overflows = originalResult.length > maxLines || findLongestLine(originalResult).width > Number(lineWidth);
    if (!overflows) {
      return originalResult;
    }
    var start = 0;
    var end = text.length - 1;
    var iterations = 0;
    var trimmedResult;
    while (start <= end && iterations <= text.length - 1) {
      var middle = Math.floor((start + end) / 2);
      var prev = middle - 1;
      var _checkOverflow = checkOverflow(text, prev, breakAll, style, maxLines, lineWidth, spaceWidth, scaleToFit), _checkOverflow2 = _slicedToArray8(_checkOverflow, 2), doesPrevOverflow = _checkOverflow2[0], result = _checkOverflow2[1];
      var _checkOverflow3 = checkOverflow(text, middle, breakAll, style, maxLines, lineWidth, spaceWidth, scaleToFit), _checkOverflow4 = _slicedToArray8(_checkOverflow3, 1), doesMiddleOverflow = _checkOverflow4[0];
      if (!doesPrevOverflow && !doesMiddleOverflow) {
        start = middle + 1;
      }
      if (doesPrevOverflow && doesMiddleOverflow) {
        end = middle - 1;
      }
      if (!doesPrevOverflow && doesMiddleOverflow) {
        trimmedResult = result;
        break;
      }
      iterations++;
    }
    return trimmedResult || originalResult;
  };
  var getWordsWithoutCalculate = (children) => {
    var words = !isNullish(children) ? children.toString().split(BREAKING_SPACES) : [];
    return [{
      words,
      width: void 0
    }];
  };
  var getWordsByLines = (_ref4) => {
    var width = _ref4.width, scaleToFit = _ref4.scaleToFit, children = _ref4.children, style = _ref4.style, breakAll = _ref4.breakAll, maxLines = _ref4.maxLines;
    if ((width || scaleToFit) && !Global.isSsr) {
      var wordsWithComputedWidth, spaceWidth;
      var wordWidths = calculateWordWidths({
        breakAll,
        children,
        style
      });
      if (wordWidths) {
        var wcw = wordWidths.wordsWithComputedWidth, sw = wordWidths.spaceWidth;
        wordsWithComputedWidth = wcw;
        spaceWidth = sw;
      } else {
        return getWordsWithoutCalculate(children);
      }
      return calculateWordsByLines({
        breakAll,
        children,
        maxLines,
        style
      }, wordsWithComputedWidth, spaceWidth, width, Boolean(scaleToFit));
    }
    return getWordsWithoutCalculate(children);
  };
  var DEFAULT_FILL = "#808080";
  var textDefaultProps = {
    angle: 0,
    breakAll: false,
    // Magic number from d3
    capHeight: "0.71em",
    fill: DEFAULT_FILL,
    lineHeight: "1em",
    scaleToFit: false,
    textAnchor: "start",
    // Maintain compat with existing charts / default SVG behavior
    verticalAnchor: "end",
    x: 0,
    y: 0
  };
  var Text = /* @__PURE__ */ (0, import_react19.forwardRef)((outsideProps, ref) => {
    var _resolveDefaultProps = resolveDefaultProps(outsideProps, textDefaultProps), propsX = _resolveDefaultProps.x, propsY = _resolveDefaultProps.y, lineHeight = _resolveDefaultProps.lineHeight, capHeight = _resolveDefaultProps.capHeight, fill = _resolveDefaultProps.fill, scaleToFit = _resolveDefaultProps.scaleToFit, textAnchor = _resolveDefaultProps.textAnchor, verticalAnchor = _resolveDefaultProps.verticalAnchor, props = _objectWithoutProperties5(_resolveDefaultProps, _excluded5);
    var wordsByLines = (0, import_react19.useMemo)(() => {
      return getWordsByLines({
        breakAll: props.breakAll,
        children: props.children,
        maxLines: props.maxLines,
        scaleToFit,
        style: props.style,
        width: props.width
      });
    }, [props.breakAll, props.children, props.maxLines, scaleToFit, props.style, props.width]);
    var dx = props.dx, dy = props.dy, angle = props.angle, className = props.className, breakAll = props.breakAll, textProps = _objectWithoutProperties5(props, _excluded23);
    if (!isNumOrStr(propsX) || !isNumOrStr(propsY) || wordsByLines.length === 0) {
      return null;
    }
    var x = Number(propsX) + (isNumber(dx) ? dx : 0);
    var y = Number(propsY) + (isNumber(dy) ? dy : 0);
    if (!isWellBehavedNumber(x) || !isWellBehavedNumber(y)) {
      return null;
    }
    var startDy;
    switch (verticalAnchor) {
      case "start":
        startDy = reduceCSSCalc("calc(".concat(capHeight, ")"));
        break;
      case "middle":
        startDy = reduceCSSCalc("calc(".concat((wordsByLines.length - 1) / 2, " * -").concat(lineHeight, " + (").concat(capHeight, " / 2))"));
        break;
      default:
        startDy = reduceCSSCalc("calc(".concat(wordsByLines.length - 1, " * -").concat(lineHeight, ")"));
        break;
    }
    var transforms = [];
    var firstLine = wordsByLines[0];
    if (scaleToFit && firstLine != null) {
      var lineWidth = firstLine.width;
      var width = props.width;
      transforms.push("scale(".concat(isNumber(width) && isNumber(lineWidth) ? width / lineWidth : 1, ")"));
    }
    if (angle) {
      transforms.push("rotate(".concat(angle, ", ").concat(x, ", ").concat(y, ")"));
    }
    if (transforms.length) {
      textProps.transform = transforms.join(" ");
    }
    return /* @__PURE__ */ React7.createElement("text", _extends4({}, svgPropertiesAndEvents(textProps), {
      ref,
      x,
      y,
      className: clsx("recharts-text", className),
      textAnchor,
      fill: fill.includes("url") ? DEFAULT_FILL : fill
    }), wordsByLines.map((line, index) => {
      var words = line.words.join(breakAll ? "" : " ");
      return (
        // duplicate words will cause duplicate keys which is why we add the array index here
        /* @__PURE__ */ React7.createElement("tspan", {
          x,
          dy: index === 0 ? startDy : lineHeight,
          key: "".concat(words, "-").concat(index)
        }, words)
      );
    }));
  });
  Text.displayName = "Text";

  // node_modules/recharts/es6/component/Label.js
  init_define_import_meta_env();
  var React8 = __toESM(require_react_shim());
  var import_react20 = __toESM(require_react_shim());

  // node_modules/recharts/es6/cartesian/getCartesianPosition.js
  init_define_import_meta_env();
  function ownKeys14(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread14(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys14(Object(t), true).forEach(function(r3) {
        _defineProperty17(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys14(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty17(e, r2, t) {
    return (r2 = _toPropertyKey17(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey17(t) {
    var i = _toPrimitive17(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive17(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var getCartesianPosition = (options) => {
    var viewBox = options.viewBox, position = options.position, _options$offset = options.offset, offset = _options$offset === void 0 ? 0 : _options$offset, parentViewBoxFromOptions = options.parentViewBox, clamp = options.clamp;
    var _cartesianViewBoxToTr = cartesianViewBoxToTrapezoid(viewBox), x = _cartesianViewBoxToTr.x, y = _cartesianViewBoxToTr.y, height = _cartesianViewBoxToTr.height, upperWidth = _cartesianViewBoxToTr.upperWidth, lowerWidth = _cartesianViewBoxToTr.lowerWidth;
    var upperX = x;
    var lowerX = x + (upperWidth - lowerWidth) / 2;
    var middleX = (upperX + lowerX) / 2;
    var midHeightWidth = (upperWidth + lowerWidth) / 2;
    var centerX = upperX + upperWidth / 2;
    var verticalSign = height >= 0 ? 1 : -1;
    var verticalOffset = verticalSign * offset;
    var verticalEnd = verticalSign > 0 ? "end" : "start";
    var verticalStart = verticalSign > 0 ? "start" : "end";
    var horizontalSign = upperWidth >= 0 ? 1 : -1;
    var horizontalOffset = horizontalSign * offset;
    var horizontalEnd = horizontalSign > 0 ? "end" : "start";
    var horizontalStart = horizontalSign > 0 ? "start" : "end";
    var parentViewBox = parentViewBoxFromOptions;
    if (position === "top") {
      var result = {
        x: upperX + upperWidth / 2,
        y: y - verticalOffset,
        horizontalAnchor: "middle",
        verticalAnchor: verticalEnd
      };
      if (clamp && parentViewBox) {
        result.height = Math.max(y - parentViewBox.y, 0);
        result.width = upperWidth;
      }
      return result;
    }
    if (position === "bottom") {
      var _result = {
        x: lowerX + lowerWidth / 2,
        y: y + height + verticalOffset,
        horizontalAnchor: "middle",
        verticalAnchor: verticalStart
      };
      if (clamp && parentViewBox) {
        _result.height = Math.max(parentViewBox.y + parentViewBox.height - (y + height), 0);
        _result.width = lowerWidth;
      }
      return _result;
    }
    if (position === "left") {
      var _result2 = {
        x: middleX - horizontalOffset,
        y: y + height / 2,
        horizontalAnchor: horizontalEnd,
        verticalAnchor: "middle"
      };
      if (clamp && parentViewBox) {
        _result2.width = Math.max(_result2.x - parentViewBox.x, 0);
        _result2.height = height;
      }
      return _result2;
    }
    if (position === "right") {
      var _result3 = {
        x: middleX + midHeightWidth + horizontalOffset,
        y: y + height / 2,
        horizontalAnchor: horizontalStart,
        verticalAnchor: "middle"
      };
      if (clamp && parentViewBox) {
        _result3.width = Math.max(parentViewBox.x + parentViewBox.width - _result3.x, 0);
        _result3.height = height;
      }
      return _result3;
    }
    var sizeAttrs = clamp && parentViewBox ? {
      width: midHeightWidth,
      height
    } : {};
    if (position === "insideLeft") {
      return _objectSpread14({
        x: middleX + horizontalOffset,
        y: y + height / 2,
        horizontalAnchor: horizontalStart,
        verticalAnchor: "middle"
      }, sizeAttrs);
    }
    if (position === "insideRight") {
      return _objectSpread14({
        x: middleX + midHeightWidth - horizontalOffset,
        y: y + height / 2,
        horizontalAnchor: horizontalEnd,
        verticalAnchor: "middle"
      }, sizeAttrs);
    }
    if (position === "insideTop") {
      return _objectSpread14({
        x: upperX + upperWidth / 2,
        y: y + verticalOffset,
        horizontalAnchor: "middle",
        verticalAnchor: verticalStart
      }, sizeAttrs);
    }
    if (position === "insideBottom") {
      return _objectSpread14({
        x: lowerX + lowerWidth / 2,
        y: y + height - verticalOffset,
        horizontalAnchor: "middle",
        verticalAnchor: verticalEnd
      }, sizeAttrs);
    }
    if (position === "insideTopLeft") {
      return _objectSpread14({
        x: upperX + horizontalOffset,
        y: y + verticalOffset,
        horizontalAnchor: horizontalStart,
        verticalAnchor: verticalStart
      }, sizeAttrs);
    }
    if (position === "insideTopRight") {
      return _objectSpread14({
        x: upperX + upperWidth - horizontalOffset,
        y: y + verticalOffset,
        horizontalAnchor: horizontalEnd,
        verticalAnchor: verticalStart
      }, sizeAttrs);
    }
    if (position === "insideBottomLeft") {
      return _objectSpread14({
        x: lowerX + horizontalOffset,
        y: y + height - verticalOffset,
        horizontalAnchor: horizontalStart,
        verticalAnchor: verticalEnd
      }, sizeAttrs);
    }
    if (position === "insideBottomRight") {
      return _objectSpread14({
        x: lowerX + lowerWidth - horizontalOffset,
        y: y + height - verticalOffset,
        horizontalAnchor: horizontalEnd,
        verticalAnchor: verticalEnd
      }, sizeAttrs);
    }
    if (!!position && typeof position === "object" && (isNumber(position.x) || isPercent(position.x)) && (isNumber(position.y) || isPercent(position.y))) {
      return _objectSpread14({
        x: x + getPercentValue(position.x, midHeightWidth),
        y: y + getPercentValue(position.y, height),
        horizontalAnchor: "end",
        verticalAnchor: "end"
      }, sizeAttrs);
    }
    return _objectSpread14({
      x: centerX,
      y: y + height / 2,
      horizontalAnchor: "middle",
      verticalAnchor: "middle"
    }, sizeAttrs);
  };

  // node_modules/recharts/es6/component/Label.js
  var _excluded6 = ["labelRef"];
  var _excluded24 = ["content"];
  function _objectWithoutProperties6(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose6(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose6(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function ownKeys15(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread15(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys15(Object(t), true).forEach(function(r3) {
        _defineProperty18(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys15(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty18(e, r2, t) {
    return (r2 = _toPropertyKey18(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey18(t) {
    var i = _toPrimitive18(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive18(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function _extends5() {
    return _extends5 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends5.apply(null, arguments);
  }
  var CartesianLabelContext = /* @__PURE__ */ (0, import_react20.createContext)(null);
  var CartesianLabelContextProvider = (_ref2) => {
    var x = _ref2.x, y = _ref2.y, upperWidth = _ref2.upperWidth, lowerWidth = _ref2.lowerWidth, width = _ref2.width, height = _ref2.height, children = _ref2.children;
    var viewBox = (0, import_react20.useMemo)(() => ({
      x,
      y,
      upperWidth,
      lowerWidth,
      width,
      height
    }), [x, y, upperWidth, lowerWidth, width, height]);
    return /* @__PURE__ */ React8.createElement(CartesianLabelContext.Provider, {
      value: viewBox
    }, children);
  };
  var useCartesianLabelContext = () => {
    var labelChildContext = (0, import_react20.useContext)(CartesianLabelContext);
    var chartContext = useViewBox();
    return labelChildContext || (chartContext ? cartesianViewBoxToTrapezoid(chartContext) : void 0);
  };
  var PolarLabelContext = /* @__PURE__ */ (0, import_react20.createContext)(null);
  var usePolarLabelContext = () => {
    var labelChildContext = (0, import_react20.useContext)(PolarLabelContext);
    var chartContext = useAppSelector(selectPolarViewBox);
    return labelChildContext || chartContext;
  };
  var getLabel = (props) => {
    var value = props.value, formatter = props.formatter;
    var label = isNullish(props.children) ? value : props.children;
    if (typeof formatter === "function") {
      return formatter(label);
    }
    return label;
  };
  var isLabelContentAFunction = (content) => {
    return content != null && typeof content === "function";
  };
  var getDeltaAngle = (startAngle, endAngle) => {
    var sign = mathSign(endAngle - startAngle);
    var deltaAngle = Math.min(Math.abs(endAngle - startAngle), 360);
    return sign * deltaAngle;
  };
  var renderRadialLabel = (labelProps, position, label, attrs, viewBox) => {
    var offset = labelProps.offset, className = labelProps.className;
    var cx = viewBox.cx, cy = viewBox.cy, innerRadius = viewBox.innerRadius, outerRadius = viewBox.outerRadius, startAngle = viewBox.startAngle, endAngle = viewBox.endAngle, clockWise = viewBox.clockWise;
    var radius = (innerRadius + outerRadius) / 2;
    var deltaAngle = getDeltaAngle(startAngle, endAngle);
    var sign = deltaAngle >= 0 ? 1 : -1;
    var labelAngle, direction;
    switch (position) {
      case "insideStart":
        labelAngle = startAngle + sign * offset;
        direction = clockWise;
        break;
      case "insideEnd":
        labelAngle = endAngle - sign * offset;
        direction = !clockWise;
        break;
      case "end":
        labelAngle = endAngle + sign * offset;
        direction = clockWise;
        break;
      default:
        throw new Error("Unsupported position ".concat(position));
    }
    direction = deltaAngle <= 0 ? direction : !direction;
    var startPoint = polarToCartesian(cx, cy, radius, labelAngle);
    var endPoint = polarToCartesian(cx, cy, radius, labelAngle + (direction ? 1 : -1) * 359);
    var path = "M".concat(startPoint.x, ",").concat(startPoint.y, "\n    A").concat(radius, ",").concat(radius, ",0,1,").concat(direction ? 0 : 1, ",\n    ").concat(endPoint.x, ",").concat(endPoint.y);
    var id = isNullish(labelProps.id) ? uniqueId("recharts-radial-line-") : labelProps.id;
    return /* @__PURE__ */ React8.createElement("text", _extends5({}, attrs, {
      dominantBaseline: "central",
      className: clsx("recharts-radial-bar-label", className)
    }), /* @__PURE__ */ React8.createElement("defs", null, /* @__PURE__ */ React8.createElement("path", {
      id,
      d: path
    })), /* @__PURE__ */ React8.createElement("textPath", {
      xlinkHref: "#".concat(id)
    }, label));
  };
  var getAttrsOfPolarLabel = (viewBox, offset, position) => {
    var cx = viewBox.cx, cy = viewBox.cy, innerRadius = viewBox.innerRadius, outerRadius = viewBox.outerRadius, startAngle = viewBox.startAngle, endAngle = viewBox.endAngle;
    var midAngle = (startAngle + endAngle) / 2;
    if (position === "outside") {
      var _polarToCartesian = polarToCartesian(cx, cy, outerRadius + offset, midAngle), _x = _polarToCartesian.x, _y = _polarToCartesian.y;
      return {
        x: _x,
        y: _y,
        textAnchor: _x >= cx ? "start" : "end",
        verticalAnchor: "middle"
      };
    }
    if (position === "center") {
      return {
        x: cx,
        y: cy,
        textAnchor: "middle",
        verticalAnchor: "middle"
      };
    }
    if (position === "centerTop") {
      return {
        x: cx,
        y: cy,
        textAnchor: "middle",
        verticalAnchor: "start"
      };
    }
    if (position === "centerBottom") {
      return {
        x: cx,
        y: cy,
        textAnchor: "middle",
        verticalAnchor: "end"
      };
    }
    var r2 = (innerRadius + outerRadius) / 2;
    var _polarToCartesian2 = polarToCartesian(cx, cy, r2, midAngle), x = _polarToCartesian2.x, y = _polarToCartesian2.y;
    return {
      x,
      y,
      textAnchor: "middle",
      verticalAnchor: "middle"
    };
  };
  var isPolar = (viewBox) => viewBox != null && "cx" in viewBox && isNumber(viewBox.cx);
  var defaultLabelProps = {
    angle: 0,
    offset: 5,
    zIndex: DefaultZIndexes.label,
    position: "middle",
    textBreakAll: false
  };
  function polarViewBoxToTrapezoid(viewBox) {
    if (!isPolar(viewBox)) {
      return viewBox;
    }
    var cx = viewBox.cx, cy = viewBox.cy, outerRadius = viewBox.outerRadius;
    var diameter = outerRadius * 2;
    return {
      x: cx - outerRadius,
      y: cy - outerRadius,
      width: diameter,
      upperWidth: diameter,
      lowerWidth: diameter,
      height: diameter
    };
  }
  function Label(outerProps) {
    var props = resolveDefaultProps(outerProps, defaultLabelProps);
    var viewBoxFromProps = props.viewBox, parentViewBox = props.parentViewBox, position = props.position, value = props.value, children = props.children, content = props.content, _props$className = props.className, className = _props$className === void 0 ? "" : _props$className, textBreakAll = props.textBreakAll, labelRef = props.labelRef;
    var polarViewBox = usePolarLabelContext();
    var cartesianViewBox = useCartesianLabelContext();
    var resolvedViewBox = position === "center" ? cartesianViewBox : polarViewBox !== null && polarViewBox !== void 0 ? polarViewBox : cartesianViewBox;
    var viewBox, label, positionAttrs;
    if (viewBoxFromProps == null) {
      viewBox = resolvedViewBox;
    } else if (isPolar(viewBoxFromProps)) {
      viewBox = viewBoxFromProps;
    } else {
      viewBox = cartesianViewBoxToTrapezoid(viewBoxFromProps);
    }
    var cartesianBox = polarViewBoxToTrapezoid(viewBox);
    if (!viewBox || isNullish(value) && isNullish(children) && !/* @__PURE__ */ (0, import_react20.isValidElement)(content) && typeof content !== "function") {
      return null;
    }
    var propsWithViewBox = _objectSpread15(_objectSpread15({}, props), {}, {
      viewBox
    });
    if (/* @__PURE__ */ (0, import_react20.isValidElement)(content)) {
      var _ = propsWithViewBox.labelRef, propsWithoutLabelRef = _objectWithoutProperties6(propsWithViewBox, _excluded6);
      return /* @__PURE__ */ (0, import_react20.cloneElement)(content, propsWithoutLabelRef);
    }
    if (typeof content === "function") {
      var _2 = propsWithViewBox.content, propsForContent = _objectWithoutProperties6(propsWithViewBox, _excluded24);
      label = /* @__PURE__ */ (0, import_react20.createElement)(content, propsForContent);
      if (/* @__PURE__ */ (0, import_react20.isValidElement)(label)) {
        return label;
      }
    } else {
      label = getLabel(props);
    }
    var attrs = svgPropertiesAndEvents(props);
    if (isPolar(viewBox)) {
      if (position === "insideStart" || position === "insideEnd" || position === "end") {
        return renderRadialLabel(props, position, label, attrs, viewBox);
      }
      positionAttrs = getAttrsOfPolarLabel(viewBox, props.offset, props.position);
    } else {
      if (!cartesianBox) {
        return null;
      }
      var cartesianResult = getCartesianPosition({
        viewBox: cartesianBox,
        position,
        offset: props.offset,
        parentViewBox: isPolar(parentViewBox) ? void 0 : parentViewBox,
        clamp: true
      });
      positionAttrs = _objectSpread15(_objectSpread15({
        x: cartesianResult.x,
        y: cartesianResult.y,
        textAnchor: cartesianResult.horizontalAnchor,
        verticalAnchor: cartesianResult.verticalAnchor
      }, cartesianResult.width !== void 0 ? {
        width: cartesianResult.width
      } : {}), cartesianResult.height !== void 0 ? {
        height: cartesianResult.height
      } : {});
    }
    return /* @__PURE__ */ React8.createElement(ZIndexLayer, {
      zIndex: props.zIndex
    }, /* @__PURE__ */ React8.createElement(Text, _extends5({
      ref: labelRef,
      className: clsx("recharts-label", className)
    }, attrs, positionAttrs, {
      /*
       * textAnchor is decided by default based on the `position`
       * but we allow overriding via props for precise control.
       */
      textAnchor: isValidTextAnchor(attrs.textAnchor) ? attrs.textAnchor : positionAttrs.textAnchor,
      breakAll: textBreakAll
    }), label));
  }
  Label.displayName = "Label";
  var parseLabel = (label, viewBox, labelRef) => {
    if (!label) {
      return null;
    }
    var commonProps = {
      viewBox,
      labelRef
    };
    if (label === true) {
      return /* @__PURE__ */ React8.createElement(Label, _extends5({
        key: "label-implicit"
      }, commonProps));
    }
    if (isNumOrStr(label)) {
      return /* @__PURE__ */ React8.createElement(Label, _extends5({
        key: "label-implicit",
        value: label
      }, commonProps));
    }
    if (/* @__PURE__ */ (0, import_react20.isValidElement)(label)) {
      if (label.type === Label) {
        return /* @__PURE__ */ (0, import_react20.cloneElement)(label, _objectSpread15({
          key: "label-implicit"
        }, commonProps));
      }
      return /* @__PURE__ */ React8.createElement(Label, _extends5({
        key: "label-implicit",
        content: label
      }, commonProps));
    }
    if (isLabelContentAFunction(label)) {
      return /* @__PURE__ */ React8.createElement(Label, _extends5({
        key: "label-implicit",
        content: label
      }, commonProps));
    }
    if (label && typeof label === "object") {
      return /* @__PURE__ */ React8.createElement(Label, _extends5({}, label, {
        key: "label-implicit"
      }, commonProps));
    }
    return null;
  };
  function CartesianLabelFromLabelProp(_ref3) {
    var label = _ref3.label, labelRef = _ref3.labelRef;
    var viewBox = useCartesianLabelContext();
    return parseLabel(label, viewBox, labelRef) || null;
  }

  // node_modules/recharts/es6/component/LabelList.js
  init_define_import_meta_env();
  var React9 = __toESM(require_react_shim());
  var import_react21 = __toESM(require_react_shim());
  var _excluded7 = ["valueAccessor"];
  var _excluded25 = ["dataKey", "clockWise", "id", "textBreakAll", "zIndex"];
  function _extends6() {
    return _extends6 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends6.apply(null, arguments);
  }
  function _objectWithoutProperties7(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose7(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose7(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var defaultAccessor = (entry) => {
    var val = Array.isArray(entry.value) ? entry.value[entry.value.length - 1] : entry.value;
    if (isRenderableText(val)) {
      return val;
    }
    return void 0;
  };
  var CartesianLabelListContext = /* @__PURE__ */ (0, import_react21.createContext)(void 0);
  var CartesianLabelListContextProvider = CartesianLabelListContext.Provider;
  var PolarLabelListContext = /* @__PURE__ */ (0, import_react21.createContext)(void 0);
  var PolarLabelListContextProvider = PolarLabelListContext.Provider;
  function useCartesianLabelListContext() {
    return (0, import_react21.useContext)(CartesianLabelListContext);
  }
  function usePolarLabelListContext() {
    return (0, import_react21.useContext)(PolarLabelListContext);
  }
  function LabelList(_ref2) {
    var _ref$valueAccessor = _ref2.valueAccessor, valueAccessor = _ref$valueAccessor === void 0 ? defaultAccessor : _ref$valueAccessor, restProps = _objectWithoutProperties7(_ref2, _excluded7);
    var dataKey = restProps.dataKey, clockWise = restProps.clockWise, id = restProps.id, textBreakAll = restProps.textBreakAll, zIndex = restProps.zIndex, others = _objectWithoutProperties7(restProps, _excluded25);
    var cartesianData = useCartesianLabelListContext();
    var polarData = usePolarLabelListContext();
    var data2 = cartesianData || polarData;
    if (!data2 || !data2.length) {
      return null;
    }
    return /* @__PURE__ */ React9.createElement(ZIndexLayer, {
      zIndex: zIndex !== null && zIndex !== void 0 ? zIndex : DefaultZIndexes.label
    }, /* @__PURE__ */ React9.createElement(Layer, {
      className: "recharts-label-list"
    }, data2.map((entry, index) => {
      var _restProps$fill;
      var value = isNullish(dataKey) ? valueAccessor(entry, index) : getValueByDataKey(entry.payload, dataKey);
      var idProps = isNullish(id) ? {} : {
        id: "".concat(id, "-").concat(index)
      };
      return /* @__PURE__ */ React9.createElement(Label, _extends6({
        key: "label-".concat(index)
      }, svgPropertiesAndEvents(entry), others, idProps, {
        /*
         * Prefer to use the explicit fill from LabelList props.
         * Only in an absence of that, fall back to the fill of the entry.
         * The entry fill can be quite difficult to see especially in Bar, Pie, RadialBar in inside positions.
         * On the other hand it's quite convenient in Scatter, Line, or when the position is outside the Bar, Pie filled shapes.
         */
        fill: (_restProps$fill = restProps.fill) !== null && _restProps$fill !== void 0 ? _restProps$fill : entry.fill,
        parentViewBox: entry.parentViewBox,
        value,
        textBreakAll,
        viewBox: entry.viewBox,
        index,
        zIndex: 0
      }));
    })));
  }
  LabelList.displayName = "LabelList";
  function LabelListFromLabelProp(_ref2) {
    var label = _ref2.label;
    if (!label) {
      return null;
    }
    if (label === true) {
      return /* @__PURE__ */ React9.createElement(LabelList, {
        key: "labelList-implicit"
      });
    }
    if (/* @__PURE__ */ React9.isValidElement(label) || isLabelContentAFunction(label)) {
      return /* @__PURE__ */ React9.createElement(LabelList, {
        key: "labelList-implicit",
        content: label
      });
    }
    if (typeof label === "object") {
      return /* @__PURE__ */ React9.createElement(LabelList, _extends6({
        key: "labelList-implicit"
      }, label, {
        type: String(label.type)
      }));
    }
    return null;
  }

  // node_modules/recharts/es6/state/polarAxisSlice.js
  init_define_import_meta_env();
  var initialState6 = {
    radiusAxis: {},
    angleAxis: {}
  };
  var polarAxisSlice = createSlice({
    name: "polarAxis",
    initialState: initialState6,
    reducers: {
      addRadiusAxis(state, action) {
        state.radiusAxis[action.payload.id] = castDraft(action.payload);
      },
      removeRadiusAxis(state, action) {
        delete state.radiusAxis[action.payload.id];
      },
      addAngleAxis(state, action) {
        state.angleAxis[action.payload.id] = castDraft(action.payload);
      },
      removeAngleAxis(state, action) {
        delete state.angleAxis[action.payload.id];
      }
    }
  });
  var _polarAxisSlice$actio = polarAxisSlice.actions;
  var addRadiusAxis = _polarAxisSlice$actio.addRadiusAxis;
  var removeRadiusAxis = _polarAxisSlice$actio.removeRadiusAxis;
  var addAngleAxis = _polarAxisSlice$actio.addAngleAxis;
  var removeAngleAxis = _polarAxisSlice$actio.removeAngleAxis;
  var polarAxisReducer = polarAxisSlice.reducer;

  // node_modules/recharts/es6/util/getClassNameFromUnknown.js
  init_define_import_meta_env();
  function getClassNameFromUnknown(u) {
    if (u && typeof u === "object" && "className" in u && typeof u.className === "string") {
      return u.className;
    }
    return "";
  }

  // node_modules/recharts/es6/util/ReactUtils.js
  init_define_import_meta_env();
  var import_react22 = __toESM(require_react_shim());
  var import_react_is = __toESM(require_react_is_shim());
  var getDisplayName = (Comp) => {
    if (typeof Comp === "string") {
      return Comp;
    }
    if (!Comp) {
      return "";
    }
    return Comp.displayName || Comp.name || "Component";
  };
  var lastChildren = null;
  var lastResult = null;
  var toArray = (children) => {
    if (children === lastChildren && Array.isArray(lastResult)) {
      return lastResult;
    }
    var result = [];
    import_react22.Children.forEach(children, (child) => {
      if (isNullish(child)) return;
      if ((0, import_react_is.isFragment)(child)) {
        result = result.concat(toArray(child.props.children));
      } else {
        result.push(child);
      }
    });
    lastResult = result;
    lastChildren = children;
    return result;
  };
  function findAllByType(children, type) {
    var result = [];
    var types = [];
    if (Array.isArray(type)) {
      types = type.map((t) => getDisplayName(t));
    } else {
      types = [getDisplayName(type)];
    }
    toArray(children).forEach((child) => {
      var childType = get(child, "type.displayName") || get(child, "type.name");
      if (childType && types.indexOf(childType) !== -1) {
        result.push(child);
      }
    });
    return result;
  }

  // node_modules/recharts/es6/util/ActiveShapeUtils.js
  init_define_import_meta_env();
  var React10 = __toESM(require_react_shim());
  var import_react23 = __toESM(require_react_shim());
  function ownKeys16(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread16(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys16(Object(t), true).forEach(function(r3) {
        _defineProperty19(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys16(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty19(e, r2, t) {
    return (r2 = _toPropertyKey19(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey19(t) {
    var i = _toPrimitive19(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive19(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function mergeShapeProps(option, props) {
    return _objectSpread16(_objectSpread16({}, props), option);
  }
  function getPropsFromShapeOption(option) {
    if (/* @__PURE__ */ (0, import_react23.isValidElement)(option)) {
      return option.props;
    }
    return option;
  }
  function renderWithShapeElement(option, props) {
    return /* @__PURE__ */ (0, import_react23.cloneElement)(option, mergeShapeProps(getPropsFromShapeOption(option), props));
  }
  function getShapeIndex(shapeProps) {
    if (!("index" in shapeProps)) {
      return void 0;
    }
    var index = shapeProps.index;
    return typeof index === "number" || typeof index === "string" ? index : void 0;
  }
  function isActiveShape(shapeProps) {
    return "isActive" in shapeProps && shapeProps.isActive === true;
  }
  function Shape(_ref2) {
    var option = _ref2.option, DefaultShape = _ref2.DefaultShape, shapeProps = _ref2.shapeProps, _ref$activeClassName = _ref2.activeClassName, activeClassName = _ref$activeClassName === void 0 ? "recharts-active-shape" : _ref$activeClassName, _ref$inActiveClassNam = _ref2.inActiveClassName, inActiveClassName = _ref$inActiveClassNam === void 0 ? "recharts-shape" : _ref$inActiveClassNam;
    var index = getShapeIndex(shapeProps);
    var shape;
    if (/* @__PURE__ */ (0, import_react23.isValidElement)(option)) {
      shape = renderWithShapeElement(option, shapeProps);
    } else if (option === DefaultShape) {
      shape = /* @__PURE__ */ React10.createElement(DefaultShape, shapeProps);
    } else if (typeof option === "function") {
      shape = option(shapeProps, index);
    } else if (typeof option === "object") {
      shape = /* @__PURE__ */ React10.createElement(DefaultShape, mergeShapeProps(option, shapeProps));
    } else {
      shape = /* @__PURE__ */ React10.createElement(DefaultShape, shapeProps);
    }
    if (isActiveShape(shapeProps)) {
      return /* @__PURE__ */ React10.createElement(Layer, {
        className: activeClassName
      }, shape);
    }
    return /* @__PURE__ */ React10.createElement(Layer, {
      className: inActiveClassName
    }, shape);
  }

  // node_modules/recharts/es6/context/tooltipContext.js
  init_define_import_meta_env();
  var useMouseEnterItemDispatch = (onMouseEnterFromProps, dataKey, graphicalItemId) => {
    var dispatch = useAppDispatch();
    return (data2, index) => (event) => {
      onMouseEnterFromProps === null || onMouseEnterFromProps === void 0 || onMouseEnterFromProps(data2, index, event);
      dispatch(setActiveMouseOverItemIndex({
        activeIndex: String(index),
        activeDataKey: dataKey,
        activeCoordinate: data2.tooltipPosition,
        activeGraphicalItemId: graphicalItemId
      }));
    };
  };
  var useMouseLeaveItemDispatch = (onMouseLeaveFromProps) => {
    var dispatch = useAppDispatch();
    return (data2, index) => (event) => {
      onMouseLeaveFromProps === null || onMouseLeaveFromProps === void 0 || onMouseLeaveFromProps(data2, index, event);
      dispatch(mouseLeaveItem());
    };
  };
  var useMouseClickItemDispatch = (onMouseClickFromProps, dataKey, graphicalItemId) => {
    var dispatch = useAppDispatch();
    return (data2, index) => (event) => {
      onMouseClickFromProps === null || onMouseClickFromProps === void 0 || onMouseClickFromProps(data2, index, event);
      dispatch(setActiveClickItemIndex({
        activeIndex: String(index),
        activeDataKey: dataKey,
        activeCoordinate: data2.tooltipPosition,
        activeGraphicalItemId: graphicalItemId
      }));
    };
  };

  // node_modules/recharts/es6/state/SetTooltipEntrySettings.js
  init_define_import_meta_env();
  var import_react24 = __toESM(require_react_shim());
  function SetTooltipEntrySettings(_ref2) {
    var tooltipEntrySettings = _ref2.tooltipEntrySettings;
    var dispatch = useAppDispatch();
    var isPanorama = useIsPanorama();
    var prevSettingsRef = (0, import_react24.useRef)(null);
    (0, import_react24.useLayoutEffect)(() => {
      if (isPanorama) {
        return;
      }
      if (prevSettingsRef.current === null) {
        dispatch(addTooltipEntrySettings(tooltipEntrySettings));
      } else if (prevSettingsRef.current !== tooltipEntrySettings) {
        dispatch(replaceTooltipEntrySettings({
          prev: prevSettingsRef.current,
          next: tooltipEntrySettings
        }));
      }
      prevSettingsRef.current = tooltipEntrySettings;
    }, [tooltipEntrySettings, dispatch, isPanorama]);
    (0, import_react24.useLayoutEffect)(() => {
      return () => {
        if (prevSettingsRef.current) {
          dispatch(removeTooltipEntrySettings(prevSettingsRef.current));
          prevSettingsRef.current = null;
        }
      };
    }, [dispatch]);
    return null;
  }

  // node_modules/recharts/es6/state/SetLegendPayload.js
  init_define_import_meta_env();
  var import_react25 = __toESM(require_react_shim());
  function SetLegendPayload(_ref2) {
    var legendPayload = _ref2.legendPayload;
    var dispatch = useAppDispatch();
    var isPanorama = useIsPanorama();
    var prevPayloadRef = (0, import_react25.useRef)(null);
    (0, import_react25.useLayoutEffect)(() => {
      if (isPanorama) {
        return;
      }
      if (prevPayloadRef.current === null) {
        dispatch(addLegendPayload(legendPayload));
      } else if (prevPayloadRef.current !== legendPayload) {
        dispatch(replaceLegendPayload({
          prev: prevPayloadRef.current,
          next: legendPayload
        }));
      }
      prevPayloadRef.current = legendPayload;
    }, [dispatch, isPanorama, legendPayload]);
    (0, import_react25.useLayoutEffect)(() => {
      return () => {
        if (prevPayloadRef.current) {
          dispatch(removeLegendPayload(prevPayloadRef.current));
          prevPayloadRef.current = null;
        }
      };
    }, [dispatch]);
    return null;
  }

  // node_modules/recharts/es6/animation/AnimatedItems.js
  init_define_import_meta_env();
  var React11 = __toESM(require_react_shim());
  var import_react27 = __toESM(require_react_shim());

  // node_modules/recharts/es6/animation/matchBy.js
  init_define_import_meta_env();
  function _slicedToArray9(r2, e) {
    return _arrayWithHoles9(r2) || _iterableToArrayLimit9(r2, e) || _unsupportedIterableToArray9(r2, e) || _nonIterableRest9();
  }
  function _nonIterableRest9() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray9(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray9(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray9(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray9(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit9(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles9(r2) {
    if (Array.isArray(r2)) return r2;
  }
  var matchByIndex = "index";
  var matchAppend = "append";
  function tagAlignedItems(alignedPrevItems, nextItems) {
    var removedPrevItems = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
    var tagged = [];
    for (var prev of removedPrevItems) {
      tagged.push({
        status: "removed",
        prev
      });
    }
    for (var i = 0; i < nextItems.length; i++) {
      var _prev = alignedPrevItems[i];
      var next = nextItems[i];
      if (_prev != null) {
        tagged.push({
          status: "matched",
          prev: _prev,
          next
        });
      } else {
        tagged.push({
          status: "added",
          next
        });
      }
    }
    return tagged;
  }
  function matchByIndexImpl(prevItems, nextItems) {
    var factor = prevItems.length / nextItems.length;
    var alignedPrevItems = nextItems.map((_, i) => prevItems[Math.floor(i * factor)]);
    return tagAlignedItems(alignedPrevItems, nextItems);
  }
  function matchAppendImpl(prevItems, nextItems) {
    var alignedPrevItems = nextItems.map((_, i) => prevItems[i]);
    return tagAlignedItems(alignedPrevItems, nextItems);
  }
  function buildPrevKeyMap(prevItems, matchBy) {
    var prevMap = /* @__PURE__ */ new Map();
    for (var i = 0; i < prevItems.length; i++) {
      var _item = prevItems[i];
      if (_item == null) continue;
      var key = matchBy(_item, i);
      if (key != null && !prevMap.has(key)) {
        prevMap.set(key, _item);
      }
    }
    return prevMap;
  }
  function matchByKey(prevItems, nextItems, matchBy) {
    var prevMap = buildPrevKeyMap(prevItems, matchBy);
    var matchedKeys = /* @__PURE__ */ new Set();
    var alignedPrevItems = nextItems.map((next, i) => {
      var key2 = matchBy(next, i);
      if (key2 != null) {
        var prev = prevMap.get(key2);
        if (prev !== void 0) {
          matchedKeys.add(key2);
          return prev;
        }
      }
      return void 0;
    });
    var removedPrevItems = [];
    for (var _ref3 of prevMap) {
      var _ref2 = _slicedToArray9(_ref3, 2);
      var key = _ref2[0];
      var _item2 = _ref2[1];
      if (!matchedKeys.has(key)) {
        removedPrevItems.push(_item2);
      }
    }
    return tagAlignedItems(alignedPrevItems, nextItems, removedPrevItems);
  }
  function matchAnimationItems(prevItems, nextItems, matchBy) {
    if (nextItems == null) {
      return null;
    }
    if (prevItems == null) {
      return nextItems.map((next) => ({
        status: "added",
        next
      }));
    }
    if (matchBy === matchByIndex) {
      return matchByIndexImpl(prevItems, nextItems);
    }
    if (matchBy === matchAppend) {
      return matchAppendImpl(prevItems, nextItems);
    }
    return matchByKey(prevItems, nextItems, matchBy);
  }

  // node_modules/recharts/es6/animation/useAnimationStartSnapshot.js
  init_define_import_meta_env();
  var import_react26 = __toESM(require_react_shim());
  function useAnimationStartSnapshot(animationInput, previousValueRef) {
    var previousAnimationInputRef = (0, import_react26.useRef)(animationInput);
    var startValueRef = (0, import_react26.useRef)(previousValueRef.current);
    var isReadyToCommitRef = (0, import_react26.useRef)(true);
    if (previousAnimationInputRef.current !== animationInput) {
      previousAnimationInputRef.current = animationInput;
      startValueRef.current = previousValueRef.current;
      isReadyToCommitRef.current = false;
    }
    var syncStepValue = (0, import_react26.useCallback)(function(stepValue, animationElapsedTime) {
      var canCommit = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
      if (animationElapsedTime === 0) {
        isReadyToCommitRef.current = true;
        return;
      }
      if (animationElapsedTime === 1) {
        startValueRef.current = stepValue;
      }
      if (animationElapsedTime > 0 && isReadyToCommitRef.current && canCommit) {
        previousValueRef.current = stepValue;
      }
    }, [previousValueRef]);
    return {
      startValue: startValueRef.current,
      syncStepValue
    };
  }

  // node_modules/recharts/es6/animation/AnimatedItems.js
  function _slicedToArray10(r2, e) {
    return _arrayWithHoles10(r2) || _iterableToArrayLimit10(r2, e) || _unsupportedIterableToArray10(r2, e) || _nonIterableRest10();
  }
  function _nonIterableRest10() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray10(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray10(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray10(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray10(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit10(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles10(r2) {
    if (Array.isArray(r2)) return r2;
  }
  function useAnimationCallbacks(onAnimationStart, onAnimationEnd) {
    var _useState = (0, import_react27.useState)(false), _useState2 = _slicedToArray10(_useState, 2), isAnimating = _useState2[0], setIsAnimating = _useState2[1];
    var handleAnimationStart = (0, import_react27.useCallback)(() => {
      if (typeof onAnimationStart === "function") {
        onAnimationStart();
      }
      setIsAnimating(true);
    }, [onAnimationStart]);
    var handleAnimationEnd = (0, import_react27.useCallback)(() => {
      if (typeof onAnimationEnd === "function") {
        onAnimationEnd();
      }
      setIsAnimating(false);
    }, [onAnimationEnd]);
    return {
      isAnimating,
      handleAnimationStart,
      handleAnimationEnd
    };
  }
  function AnimatedItems(props) {
    var _animationStartItems$;
    var animationInput = props.animationInput, animationIdPrefix = props.animationIdPrefix, items = props.items, previousItemsRef = props.previousItemsRef, isAnimationActive = props.isAnimationActive, animationBegin = props.animationBegin, animationDuration = props.animationDuration, animationEasing = props.animationEasing, onAnimationStart = props.onAnimationStart, onAnimationEnd = props.onAnimationEnd, animationInterpolateFn = props.animationInterpolateFn, animationMatchBy = props.animationMatchBy, shouldUpdatePreviousRef = props.shouldUpdatePreviousRef, children = props.children, layout = props.layout;
    var animationId = useAnimationId(animationInput, animationIdPrefix);
    var animationStartItems = useAnimationStartSnapshot(animationId, previousItemsRef);
    var rawPrevItems = (_animationStartItems$ = animationStartItems.startValue) !== null && _animationStartItems$ !== void 0 ? _animationStartItems$ : null;
    var animationItems = matchAnimationItems(rawPrevItems, items, animationMatchBy !== null && animationMatchBy !== void 0 ? animationMatchBy : matchByIndex);
    return /* @__PURE__ */ React11.createElement(JavascriptAnimate, {
      animationId,
      begin: animationBegin,
      duration: animationDuration,
      isActive: isAnimationActive,
      easing: animationEasing,
      onAnimationEnd,
      onAnimationStart,
      key: animationId
    }, (animationElapsedTime) => {
      var isEntrance = rawPrevItems == null;
      var stepData = items == null ? items : animationInterpolateFn(animationItems, animationElapsedTime, layout);
      var canUpdate = shouldUpdatePreviousRef ? shouldUpdatePreviousRef(animationElapsedTime) : animationElapsedTime > 0;
      animationStartItems.syncStepValue(stepData, animationElapsedTime, canUpdate);
      if (stepData == null) {
        return null;
      }
      return children(stepData, animationElapsedTime, isEntrance);
    });
  }

  // node_modules/recharts/es6/context/RegisterGraphicalItemId.js
  init_define_import_meta_env();
  var React13 = __toESM(require_react_shim());
  var import_react28 = __toESM(require_react_shim());

  // node_modules/recharts/es6/util/useUniqueId.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/util/useId.js
  init_define_import_meta_env();
  var React12 = __toESM(require_react_shim());
  var _ref;
  function _slicedToArray11(r2, e) {
    return _arrayWithHoles11(r2) || _iterableToArrayLimit11(r2, e) || _unsupportedIterableToArray11(r2, e) || _nonIterableRest11();
  }
  function _nonIterableRest11() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray11(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray11(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray11(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray11(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit11(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles11(r2) {
    if (Array.isArray(r2)) return r2;
  }
  var useIdFallback = () => {
    var _React$useState = React12.useState(() => uniqueId("uid-")), _React$useState2 = _slicedToArray11(_React$useState, 1), id = _React$useState2[0];
    return id;
  };
  var useId = (_ref = React12["useId".toString()]) !== null && _ref !== void 0 ? _ref : useIdFallback;

  // node_modules/recharts/es6/util/useUniqueId.js
  function useUniqueId(prefix2, customId) {
    var generatedId = useId();
    if (customId) {
      return customId;
    }
    return prefix2 ? "".concat(prefix2, "-").concat(generatedId) : generatedId;
  }

  // node_modules/recharts/es6/context/RegisterGraphicalItemId.js
  var GraphicalItemIdContext = /* @__PURE__ */ (0, import_react28.createContext)(void 0);
  var RegisterGraphicalItemId = (_ref2) => {
    var id = _ref2.id, type = _ref2.type, children = _ref2.children;
    var resolvedId = useUniqueId("recharts-".concat(type), id);
    return /* @__PURE__ */ React13.createElement(GraphicalItemIdContext.Provider, {
      value: resolvedId
    }, children(resolvedId));
  };

  // node_modules/recharts/es6/state/SetGraphicalItem.js
  init_define_import_meta_env();
  var import_react29 = __toESM(require_react_shim());

  // node_modules/recharts/es6/state/graphicalItemsSlice.js
  init_define_import_meta_env();
  var initialState7 = {
    cartesianItems: [],
    polarItems: []
  };
  var graphicalItemsSlice = createSlice({
    name: "graphicalItems",
    initialState: initialState7,
    reducers: {
      addCartesianGraphicalItem: {
        reducer(state, action) {
          state.cartesianItems.push(castDraft(action.payload));
        },
        prepare: prepareAutoBatched()
      },
      replaceCartesianGraphicalItem: {
        reducer(state, action) {
          var _action$payload = action.payload, prev = _action$payload.prev, next = _action$payload.next;
          var index = current(state).cartesianItems.indexOf(castDraft(prev));
          if (index > -1) {
            state.cartesianItems[index] = castDraft(next);
          }
        },
        prepare: prepareAutoBatched()
      },
      removeCartesianGraphicalItem: {
        reducer(state, action) {
          var index = current(state).cartesianItems.indexOf(castDraft(action.payload));
          if (index > -1) {
            state.cartesianItems.splice(index, 1);
          }
        },
        prepare: prepareAutoBatched()
      },
      addPolarGraphicalItem: {
        reducer(state, action) {
          state.polarItems.push(castDraft(action.payload));
        },
        prepare: prepareAutoBatched()
      },
      removePolarGraphicalItem: {
        reducer(state, action) {
          var index = current(state).polarItems.indexOf(castDraft(action.payload));
          if (index > -1) {
            state.polarItems.splice(index, 1);
          }
        },
        prepare: prepareAutoBatched()
      },
      replacePolarGraphicalItem: {
        reducer(state, action) {
          var _action$payload2 = action.payload, prev = _action$payload2.prev, next = _action$payload2.next;
          var index = current(state).polarItems.indexOf(castDraft(prev));
          if (index > -1) {
            state.polarItems[index] = castDraft(next);
          }
        },
        prepare: prepareAutoBatched()
      }
    }
  });
  var _graphicalItemsSlice$ = graphicalItemsSlice.actions;
  var addCartesianGraphicalItem = _graphicalItemsSlice$.addCartesianGraphicalItem;
  var replaceCartesianGraphicalItem = _graphicalItemsSlice$.replaceCartesianGraphicalItem;
  var removeCartesianGraphicalItem = _graphicalItemsSlice$.removeCartesianGraphicalItem;
  var addPolarGraphicalItem = _graphicalItemsSlice$.addPolarGraphicalItem;
  var removePolarGraphicalItem = _graphicalItemsSlice$.removePolarGraphicalItem;
  var replacePolarGraphicalItem = _graphicalItemsSlice$.replacePolarGraphicalItem;
  var graphicalItemsReducer = graphicalItemsSlice.reducer;

  // node_modules/recharts/es6/state/SetGraphicalItem.js
  var SetCartesianGraphicalItemImpl = (props) => {
    var dispatch = useAppDispatch();
    var prevPropsRef = (0, import_react29.useRef)(null);
    (0, import_react29.useLayoutEffect)(() => {
      if (prevPropsRef.current === null) {
        dispatch(addCartesianGraphicalItem(props));
      } else if (prevPropsRef.current !== props) {
        dispatch(replaceCartesianGraphicalItem({
          prev: prevPropsRef.current,
          next: props
        }));
      }
      prevPropsRef.current = props;
    }, [dispatch, props]);
    (0, import_react29.useLayoutEffect)(() => {
      return () => {
        if (prevPropsRef.current) {
          dispatch(removeCartesianGraphicalItem(prevPropsRef.current));
          prevPropsRef.current = null;
        }
      };
    }, [dispatch]);
    return null;
  };
  var SetCartesianGraphicalItem = /* @__PURE__ */ (0, import_react29.memo)(SetCartesianGraphicalItemImpl);

  // node_modules/recharts/es6/hooks.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/state/cartesianAxisSlice.js
  init_define_import_meta_env();
  function ownKeys17(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread17(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys17(Object(t), true).forEach(function(r3) {
        _defineProperty20(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys17(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty20(e, r2, t) {
    return (r2 = _toPropertyKey20(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey20(t) {
    var i = _toPrimitive20(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive20(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var defaultAxisId = 0;
  var initialState8 = {
    xAxis: {},
    yAxis: {},
    zAxis: {}
  };
  var cartesianAxisSlice = createSlice({
    name: "cartesianAxis",
    initialState: initialState8,
    reducers: {
      addXAxis: {
        reducer(state, action) {
          state.xAxis[action.payload.id] = castDraft(action.payload);
        },
        prepare: prepareAutoBatched()
      },
      replaceXAxis: {
        reducer(state, action) {
          var _action$payload = action.payload, prev = _action$payload.prev, next = _action$payload.next;
          if (state.xAxis[prev.id] !== void 0) {
            if (prev.id !== next.id) {
              delete state.xAxis[prev.id];
            }
            state.xAxis[next.id] = castDraft(next);
          }
        },
        prepare: prepareAutoBatched()
      },
      removeXAxis: {
        reducer(state, action) {
          delete state.xAxis[action.payload.id];
        },
        prepare: prepareAutoBatched()
      },
      addYAxis: {
        reducer(state, action) {
          state.yAxis[action.payload.id] = castDraft(action.payload);
        },
        prepare: prepareAutoBatched()
      },
      replaceYAxis: {
        reducer(state, action) {
          var _action$payload2 = action.payload, prev = _action$payload2.prev, next = _action$payload2.next;
          if (state.yAxis[prev.id] !== void 0) {
            if (prev.id !== next.id) {
              delete state.yAxis[prev.id];
            }
            state.yAxis[next.id] = castDraft(next);
          }
        },
        prepare: prepareAutoBatched()
      },
      removeYAxis: {
        reducer(state, action) {
          delete state.yAxis[action.payload.id];
        },
        prepare: prepareAutoBatched()
      },
      addZAxis: {
        reducer(state, action) {
          state.zAxis[action.payload.id] = castDraft(action.payload);
        },
        prepare: prepareAutoBatched()
      },
      replaceZAxis: {
        reducer(state, action) {
          var _action$payload3 = action.payload, prev = _action$payload3.prev, next = _action$payload3.next;
          if (state.zAxis[prev.id] !== void 0) {
            if (prev.id !== next.id) {
              delete state.zAxis[prev.id];
            }
            state.zAxis[next.id] = castDraft(next);
          }
        },
        prepare: prepareAutoBatched()
      },
      removeZAxis: {
        reducer(state, action) {
          delete state.zAxis[action.payload.id];
        },
        prepare: prepareAutoBatched()
      },
      updateYAxisWidth(state, action) {
        var _action$payload4 = action.payload, id = _action$payload4.id, width = _action$payload4.width;
        var axis = state.yAxis[id];
        if (axis) {
          var _history$;
          var history = axis.widthHistory || [];
          if (history.length === 3 && history[0] === history[2] && width === history[1] && width !== axis.width && Math.abs(width - ((_history$ = history[0]) !== null && _history$ !== void 0 ? _history$ : 0)) <= 1) {
            return;
          }
          var newHistory = [...history, width].slice(-3);
          state.yAxis[id] = _objectSpread17(_objectSpread17({}, axis), {}, {
            width,
            widthHistory: newHistory
          });
        }
      }
    }
  });
  var _cartesianAxisSlice$a = cartesianAxisSlice.actions;
  var addXAxis = _cartesianAxisSlice$a.addXAxis;
  var replaceXAxis = _cartesianAxisSlice$a.replaceXAxis;
  var removeXAxis = _cartesianAxisSlice$a.removeXAxis;
  var addYAxis = _cartesianAxisSlice$a.addYAxis;
  var replaceYAxis = _cartesianAxisSlice$a.replaceYAxis;
  var removeYAxis = _cartesianAxisSlice$a.removeYAxis;
  var addZAxis = _cartesianAxisSlice$a.addZAxis;
  var replaceZAxis = _cartesianAxisSlice$a.replaceZAxis;
  var removeZAxis = _cartesianAxisSlice$a.removeZAxis;
  var updateYAxisWidth = _cartesianAxisSlice$a.updateYAxisWidth;
  var cartesianAxisReducer = cartesianAxisSlice.reducer;

  // node_modules/recharts/es6/state/selectors/selectChartOffset.js
  init_define_import_meta_env();
  var selectChartOffset = createSelector([selectChartOffsetInternal], (offsetInternal) => {
    return {
      top: offsetInternal.top,
      bottom: offsetInternal.bottom,
      left: offsetInternal.left,
      right: offsetInternal.right
    };
  });

  // node_modules/recharts/es6/state/selectors/selectPlotArea.js
  init_define_import_meta_env();
  var selectPlotArea = createSelector([selectChartOffset, selectChartWidth, selectChartHeight], (offset, chartWidth, chartHeight) => {
    if (!offset || chartWidth == null || chartHeight == null) {
      return void 0;
    }
    return {
      x: offset.left,
      y: offset.top,
      width: Math.max(0, chartWidth - offset.left - offset.right),
      height: Math.max(0, chartHeight - offset.top - offset.bottom)
    };
  });

  // node_modules/recharts/es6/hooks.js
  var usePlotArea = () => {
    return useAppSelector(selectPlotArea);
  };

  // node_modules/recharts/es6/state/selectors/combiners/combineBarSizeList.js
  init_define_import_meta_env();
  function _slicedToArray12(r2, e) {
    return _arrayWithHoles12(r2) || _iterableToArrayLimit12(r2, e) || _unsupportedIterableToArray12(r2, e) || _nonIterableRest12();
  }
  function _nonIterableRest12() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray12(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray12(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray12(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray12(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit12(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles12(r2) {
    if (Array.isArray(r2)) return r2;
  }
  var getBarSize = (globalSize, totalSize, selfSize) => {
    var barSize = selfSize !== null && selfSize !== void 0 ? selfSize : globalSize;
    if (isNullish(barSize)) {
      return void 0;
    }
    return getPercentValue(barSize, totalSize, 0);
  };
  var combineBarSizeList = (allBars, globalSize, totalSize) => {
    var initialValue = {};
    var stackedBars = allBars.filter(isStacked);
    var unstackedBars = allBars.filter((b) => b.stackId == null);
    var groupByStack = stackedBars.reduce((acc, bar) => {
      var s = acc[bar.stackId];
      if (s == null) {
        s = [];
      }
      s.push(bar);
      acc[bar.stackId] = s;
      return acc;
    }, initialValue);
    var stackedSizeList = Object.entries(groupByStack).map((_ref2) => {
      var _bars$;
      var _ref22 = _slicedToArray12(_ref2, 2), stackId = _ref22[0], bars = _ref22[1];
      var dataKeys = bars.map((b) => b.dataKey);
      var barSize = getBarSize(globalSize, totalSize, (_bars$ = bars[0]) === null || _bars$ === void 0 ? void 0 : _bars$.barSize);
      return {
        stackId,
        dataKeys,
        barSize
      };
    });
    var unstackedSizeList = unstackedBars.map((b) => {
      var dataKeys = [b.dataKey].filter((dk) => dk != null);
      var barSize = getBarSize(globalSize, totalSize, b.barSize);
      return {
        stackId: void 0,
        dataKeys,
        barSize
      };
    });
    return [...stackedSizeList, ...unstackedSizeList];
  };

  // node_modules/recharts/es6/state/selectors/combiners/combineAllBarPositions.js
  init_define_import_meta_env();
  function ownKeys18(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread18(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys18(Object(t), true).forEach(function(r3) {
        _defineProperty21(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys18(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty21(e, r2, t) {
    return (r2 = _toPropertyKey21(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey21(t) {
    var i = _toPrimitive21(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive21(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function getBarPositions(barGap, barCategoryGap, bandSize, sizeList, maxBarSize) {
    var _sizeList$;
    var len = sizeList.length;
    if (len < 1) {
      return void 0;
    }
    var realBarGap = getPercentValue(barGap, bandSize, 0, true);
    var result;
    var initialValue = [];
    if (isWellBehavedNumber((_sizeList$ = sizeList[0]) === null || _sizeList$ === void 0 ? void 0 : _sizeList$.barSize)) {
      var useFull = false;
      var fullBarSize = bandSize / len;
      var sum = sizeList.reduce((res, entry) => res + (entry.barSize || 0), 0);
      sum += (len - 1) * realBarGap;
      if (sum >= bandSize) {
        sum -= (len - 1) * realBarGap;
        realBarGap = 0;
      }
      if (sum >= bandSize && fullBarSize > 0) {
        useFull = true;
        fullBarSize *= 0.9;
        sum = len * fullBarSize;
      }
      var offset = Math.round((bandSize - sum) / 2);
      var prev = {
        offset: offset - realBarGap,
        size: 0
      };
      result = sizeList.reduce((res, entry) => {
        var _entry$barSize;
        var newPosition = {
          stackId: entry.stackId,
          dataKeys: entry.dataKeys,
          position: {
            offset: prev.offset + prev.size + realBarGap,
            size: useFull ? fullBarSize : (_entry$barSize = entry.barSize) !== null && _entry$barSize !== void 0 ? _entry$barSize : 0
          }
        };
        var newRes = [...res, newPosition];
        prev = newPosition.position;
        return newRes;
      }, initialValue);
    } else {
      var _offset = getPercentValue(barCategoryGap, bandSize, 0, true);
      if (bandSize - 2 * _offset - (len - 1) * realBarGap <= 0) {
        realBarGap = 0;
      }
      var originalSize = (bandSize - 2 * _offset - (len - 1) * realBarGap) / len;
      if (originalSize > 1) {
        originalSize = Math.round(originalSize);
      }
      var size = isWellBehavedNumber(maxBarSize) ? Math.min(originalSize, maxBarSize) : originalSize;
      result = sizeList.reduce((res, entry, i) => [...res, {
        stackId: entry.stackId,
        dataKeys: entry.dataKeys,
        position: {
          offset: _offset + (originalSize + realBarGap) * i + (originalSize - size) / 2,
          size
        }
      }], initialValue);
    }
    return result;
  }
  var combineAllBarPositions = (sizeList, globalMaxBarSize, barGap, barCategoryGap, barBandSize, bandSize, childMaxBarSize) => {
    var maxBarSize = isNullish(childMaxBarSize) ? globalMaxBarSize : childMaxBarSize;
    var allBarPositions = getBarPositions(barGap, barCategoryGap, barBandSize !== bandSize ? barBandSize : bandSize, sizeList, maxBarSize);
    if (barBandSize !== bandSize && allBarPositions != null) {
      allBarPositions = allBarPositions.map((pos) => _objectSpread18(_objectSpread18({}, pos), {}, {
        position: _objectSpread18(_objectSpread18({}, pos.position), {}, {
          offset: pos.position.offset - barBandSize / 2
        })
      }));
    }
    return allBarPositions;
  };

  // node_modules/recharts/es6/state/selectors/combiners/combineStackedData.js
  init_define_import_meta_env();
  var combineStackedData = (stackGroups, barSettings) => {
    var stackSeriesIdentifier = getStackSeriesIdentifier(barSettings);
    if (!stackGroups || stackSeriesIdentifier == null || barSettings == null) {
      return void 0;
    }
    var stackId = barSettings.stackId;
    if (stackId == null) {
      return void 0;
    }
    var stackGroup = stackGroups[stackId];
    if (!stackGroup) {
      return void 0;
    }
    var stackedData = stackGroup.stackedData;
    if (!stackedData) {
      return void 0;
    }
    return stackedData.find((sd) => sd.key === stackSeriesIdentifier);
  };

  // node_modules/recharts/es6/state/selectors/combiners/combineBarPosition.js
  init_define_import_meta_env();
  var combineBarPosition = (allBarPositions, barSettings) => {
    if (allBarPositions == null || barSettings == null) {
      return void 0;
    }
    var position = allBarPositions.find((p) => p.stackId === barSettings.stackId && barSettings.dataKey != null && p.dataKeys.includes(barSettings.dataKey));
    if (position == null) {
      return void 0;
    }
    return position.position;
  };

  // node_modules/recharts/es6/zIndex/getZIndexFromUnknown.js
  init_define_import_meta_env();
  function getZIndexFromUnknown(input, defaultZIndex) {
    if (input && typeof input === "object" && "zIndex" in input && typeof input.zIndex === "number" && isWellBehavedNumber(input.zIndex)) {
      return input.zIndex;
    }
    return defaultZIndex;
  }

  // node_modules/recharts/es6/context/chartDataContext.js
  init_define_import_meta_env();
  var import_react30 = __toESM(require_react_shim());
  var ChartDataContextProvider = (props) => {
    var chartData = props.chartData;
    var dispatch = useAppDispatch();
    var isPanorama = useIsPanorama();
    (0, import_react30.useEffect)(() => {
      if (isPanorama) {
        return () => {
        };
      }
      dispatch(setChartData(chartData));
      return () => {
        dispatch(setChartData(void 0));
      };
    }, [chartData, dispatch, isPanorama]);
    return null;
  };

  // node_modules/recharts/es6/state/brushSlice.js
  init_define_import_meta_env();
  var initialState9 = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  };
  var brushSlice = createSlice({
    name: "brush",
    initialState: initialState9,
    reducers: {
      setBrushSettings(_state, action) {
        if (action.payload == null) {
          return initialState9;
        }
        return action.payload;
      }
    }
  });
  var setBrushSettings = brushSlice.actions.setBrushSettings;
  var brushReducer = brushSlice.reducer;

  // node_modules/recharts/es6/util/CartesianUtils.js
  init_define_import_meta_env();
  function normalizeAngle(angle) {
    return (angle % 180 + 180) % 180;
  }
  var getAngledRectangleWidth = function getAngledRectangleWidth2(_ref4) {
    var width = _ref4.width, height = _ref4.height;
    var angle = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
    var normalizedAngle = normalizeAngle(angle);
    var angleRadians = normalizedAngle * Math.PI / 180;
    var angleThreshold = Math.atan(height / width);
    var angledWidth = angleRadians > angleThreshold && angleRadians < Math.PI - angleThreshold ? height / Math.sin(angleRadians) : width / Math.cos(angleRadians);
    return Math.abs(angledWidth);
  };

  // node_modules/recharts/es6/state/referenceElementsSlice.js
  init_define_import_meta_env();
  var initialState10 = {
    dots: [],
    areas: [],
    lines: []
  };
  var referenceElementsSlice = createSlice({
    name: "referenceElements",
    initialState: initialState10,
    reducers: {
      addDot: (state, action) => {
        state.dots.push(action.payload);
      },
      removeDot: (state, action) => {
        var index = current(state).dots.findIndex((dot) => dot === action.payload);
        if (index !== -1) {
          state.dots.splice(index, 1);
        }
      },
      addArea: (state, action) => {
        state.areas.push(action.payload);
      },
      removeArea: (state, action) => {
        var index = current(state).areas.findIndex((area) => area === action.payload);
        if (index !== -1) {
          state.areas.splice(index, 1);
        }
      },
      addLine: (state, action) => {
        state.lines.push(castDraft(action.payload));
      },
      removeLine: (state, action) => {
        var index = current(state).lines.findIndex((line) => line === action.payload);
        if (index !== -1) {
          state.lines.splice(index, 1);
        }
      }
    }
  });
  var _referenceElementsSli = referenceElementsSlice.actions;
  var addDot = _referenceElementsSli.addDot;
  var removeDot = _referenceElementsSli.removeDot;
  var addArea = _referenceElementsSli.addArea;
  var removeArea = _referenceElementsSli.removeArea;
  var addLine = _referenceElementsSli.addLine;
  var removeLine = _referenceElementsSli.removeLine;
  var referenceElementsReducer = referenceElementsSlice.reducer;

  // node_modules/recharts/es6/container/ClipPathProvider.js
  init_define_import_meta_env();
  var React14 = __toESM(require_react_shim());
  var import_react31 = __toESM(require_react_shim());
  function _slicedToArray13(r2, e) {
    return _arrayWithHoles13(r2) || _iterableToArrayLimit13(r2, e) || _unsupportedIterableToArray13(r2, e) || _nonIterableRest13();
  }
  function _nonIterableRest13() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray13(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray13(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray13(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray13(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit13(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles13(r2) {
    if (Array.isArray(r2)) return r2;
  }
  var ClipPathIdContext = /* @__PURE__ */ (0, import_react31.createContext)(void 0);
  var ClipPathProvider = (_ref2) => {
    var children = _ref2.children;
    var _useState = (0, import_react31.useState)("".concat(uniqueId("recharts"), "-clip")), _useState2 = _slicedToArray13(_useState, 1), clipPathId = _useState2[0];
    var plotArea = usePlotArea();
    if (plotArea == null) {
      return null;
    }
    var x = plotArea.x, y = plotArea.y, width = plotArea.width, height = plotArea.height;
    return /* @__PURE__ */ React14.createElement(ClipPathIdContext.Provider, {
      value: clipPathId
    }, /* @__PURE__ */ React14.createElement("defs", null, /* @__PURE__ */ React14.createElement("clipPath", {
      id: clipPathId
    }, /* @__PURE__ */ React14.createElement("rect", {
      x,
      y,
      height,
      width
    }))), children);
  };

  // node_modules/recharts/es6/cartesian/CartesianAxis.js
  init_define_import_meta_env();
  var React15 = __toESM(require_react_shim());
  var import_react32 = __toESM(require_react_shim());

  // node_modules/recharts/es6/cartesian/getTicks.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/util/TickUtils.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/util/getEveryNth.js
  init_define_import_meta_env();
  function getEveryNth(array, n) {
    if (n < 1) {
      return [];
    }
    if (n === 1) {
      return array;
    }
    var result = [];
    for (var i = 0; i < array.length; i += n) {
      var item = array[i];
      if (item !== void 0) {
        result.push(item);
      }
    }
    return result;
  }

  // node_modules/recharts/es6/util/TickUtils.js
  function getAngledTickWidth(contentSize, unitSize, angle) {
    var size = {
      width: contentSize.width + unitSize.width,
      height: contentSize.height + unitSize.height
    };
    return getAngledRectangleWidth(size, angle);
  }
  function getTickBoundaries(viewBox, sign, sizeKey) {
    var isWidth = sizeKey === "width";
    var x = viewBox.x, y = viewBox.y, width = viewBox.width, height = viewBox.height;
    if (sign === 1) {
      return {
        start: isWidth ? x : y,
        end: isWidth ? x + width : y + height
      };
    }
    return {
      start: isWidth ? x + width : y + height,
      end: isWidth ? x : y
    };
  }
  function isVisible(sign, tickPosition, getSize, start, end) {
    if (sign * tickPosition < sign * start || sign * tickPosition > sign * end) {
      return false;
    }
    var size = getSize();
    return sign * (tickPosition - sign * size / 2 - start) >= 0 && sign * (tickPosition + sign * size / 2 - end) <= 0;
  }
  function getNumberIntervalTicks(ticks2, interval) {
    return getEveryNth(ticks2, interval + 1);
  }

  // node_modules/recharts/es6/cartesian/getEquidistantTicks.js
  init_define_import_meta_env();
  function getEquidistantTicks(sign, boundaries, getTickSize, ticks2, minTickGap) {
    var result = (ticks2 || []).slice();
    var initialStart = boundaries.start, end = boundaries.end;
    var index = 0;
    var stepsize = 1;
    var start = initialStart;
    var _loop = function _loop2() {
      var entry = ticks2 === null || ticks2 === void 0 ? void 0 : ticks2[index];
      if (entry === void 0) {
        return {
          v: getEveryNth(ticks2, stepsize)
        };
      }
      var i = index;
      var size;
      var getSize = () => {
        if (size === void 0) {
          size = getTickSize(entry, i);
        }
        return size;
      };
      var tickCoord = entry.coordinate;
      var isShow = index === 0 || isVisible(sign, tickCoord, getSize, start, end);
      if (!isShow) {
        index = 0;
        start = initialStart;
        stepsize += 1;
      }
      if (isShow) {
        start = tickCoord + sign * (getSize() / 2 + minTickGap);
        index += stepsize;
      }
    }, _ret;
    while (stepsize <= result.length) {
      _ret = _loop();
      if (_ret) return _ret.v;
    }
    return [];
  }
  function getEquidistantPreserveEndTicks(sign, boundaries, getTickSize, ticks2, minTickGap) {
    var result = (ticks2 || []).slice();
    var len = result.length;
    if (len === 0) {
      return [];
    }
    var initialStart = boundaries.start, end = boundaries.end;
    for (var stepsize = 1; stepsize <= len; stepsize++) {
      var offset = (len - 1) % stepsize;
      var start = initialStart;
      var ok = true;
      var _loop2 = function _loop22() {
        var entry = ticks2[index];
        if (entry == null) {
          return 0;
        }
        var i = index;
        var size;
        var getSize = () => {
          if (size === void 0) {
            size = getTickSize(entry, i);
          }
          return size;
        };
        var tickCoord = entry.coordinate;
        var isShow = index === offset || isVisible(sign, tickCoord, getSize, start, end);
        if (!isShow) {
          ok = false;
          return 1;
        }
        if (isShow) {
          start = tickCoord + sign * (getSize() / 2 + minTickGap);
        }
      }, _ret2;
      for (var index = offset; index < len; index += stepsize) {
        _ret2 = _loop2();
        if (_ret2 === 0) continue;
        if (_ret2 === 1) break;
      }
      if (ok) {
        var finalTicks = [];
        for (var _index = offset; _index < len; _index += stepsize) {
          var tick = ticks2[_index];
          if (tick != null) {
            finalTicks.push(tick);
          }
        }
        return finalTicks;
      }
    }
    return [];
  }

  // node_modules/recharts/es6/cartesian/getTicks.js
  function ownKeys19(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread19(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys19(Object(t), true).forEach(function(r3) {
        _defineProperty22(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys19(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty22(e, r2, t) {
    return (r2 = _toPropertyKey22(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey22(t) {
    var i = _toPrimitive22(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive22(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function getTicksEnd(sign, boundaries, getTickSize, ticks2, minTickGap) {
    var result = (ticks2 || []).slice();
    var len = result.length;
    var start = boundaries.start;
    var end = boundaries.end;
    var _loop = function _loop2(i2) {
      var initialEntry = result[i2];
      if (initialEntry == null) {
        return 1;
      }
      var entry = initialEntry;
      var size;
      var getSize = () => {
        if (size === void 0) {
          size = getTickSize(initialEntry, i2);
        }
        return size;
      };
      if (i2 === len - 1) {
        var gap = sign * (entry.coordinate + sign * getSize() / 2 - end);
        result[i2] = entry = _objectSpread19(_objectSpread19({}, entry), {}, {
          tickCoord: gap > 0 ? entry.coordinate - gap * sign : entry.coordinate
        });
      } else {
        result[i2] = entry = _objectSpread19(_objectSpread19({}, entry), {}, {
          tickCoord: entry.coordinate
        });
      }
      if (entry.tickCoord != null) {
        var isShow = isVisible(sign, entry.tickCoord, getSize, start, end);
        if (isShow) {
          end = entry.tickCoord - sign * (getSize() / 2 + minTickGap);
          result[i2] = _objectSpread19(_objectSpread19({}, entry), {}, {
            isShow: true
          });
        }
      }
    };
    for (var i = len - 1; i >= 0; i--) {
      if (_loop(i)) continue;
    }
    return result;
  }
  function getTicksStart(sign, boundaries, getTickSize, ticks2, minTickGap, preserveEnd) {
    var result = (ticks2 || []).slice();
    var len = result.length;
    var start = boundaries.start, end = boundaries.end;
    if (preserveEnd) {
      var tail = ticks2[len - 1];
      if (tail != null) {
        var tailSize = getTickSize(tail, len - 1);
        var tailGap = sign * (tail.coordinate + sign * tailSize / 2 - end);
        result[len - 1] = tail = _objectSpread19(_objectSpread19({}, tail), {}, {
          tickCoord: tailGap > 0 ? tail.coordinate - tailGap * sign : tail.coordinate
        });
        if (tail.tickCoord != null) {
          var isTailShow = isVisible(sign, tail.tickCoord, () => tailSize, start, end);
          if (isTailShow) {
            end = tail.tickCoord - sign * (tailSize / 2 + minTickGap);
            result[len - 1] = _objectSpread19(_objectSpread19({}, tail), {}, {
              isShow: true
            });
          }
        }
      }
    }
    var count = preserveEnd ? len - 1 : len;
    var _loop2 = function _loop22(i2) {
      var initialEntry = result[i2];
      if (initialEntry == null) {
        return 1;
      }
      var entry = initialEntry;
      var size;
      var getSize = () => {
        if (size === void 0) {
          size = getTickSize(initialEntry, i2);
        }
        return size;
      };
      if (i2 === 0) {
        var gap = sign * (entry.coordinate - sign * getSize() / 2 - start);
        result[i2] = entry = _objectSpread19(_objectSpread19({}, entry), {}, {
          tickCoord: gap < 0 ? entry.coordinate - gap * sign : entry.coordinate
        });
      } else {
        result[i2] = entry = _objectSpread19(_objectSpread19({}, entry), {}, {
          tickCoord: entry.coordinate
        });
      }
      if (entry.tickCoord != null) {
        var isShow = isVisible(sign, entry.tickCoord, getSize, start, end);
        if (isShow) {
          start = entry.tickCoord + sign * (getSize() / 2 + minTickGap);
          result[i2] = _objectSpread19(_objectSpread19({}, entry), {}, {
            isShow: true
          });
        }
      }
    };
    for (var i = 0; i < count; i++) {
      if (_loop2(i)) continue;
    }
    return result;
  }
  function getTicks(props, fontSize, letterSpacing) {
    var tick = props.tick, ticks2 = props.ticks, viewBox = props.viewBox, minTickGap = props.minTickGap, orientation = props.orientation, interval = props.interval, tickFormatter = props.tickFormatter, unit2 = props.unit, angle = props.angle;
    if (!ticks2 || !ticks2.length || !tick) {
      return [];
    }
    if (isNumber(interval) || Global.isSsr) {
      var _getNumberIntervalTic;
      return (_getNumberIntervalTic = getNumberIntervalTicks(ticks2, isNumber(interval) ? interval : 0)) !== null && _getNumberIntervalTic !== void 0 ? _getNumberIntervalTic : [];
    }
    var candidates = [];
    var sizeKey = orientation === "top" || orientation === "bottom" ? "width" : "height";
    var unitSize = unit2 && sizeKey === "width" ? getStringSize(unit2, {
      fontSize,
      letterSpacing
    }) : {
      width: 0,
      height: 0
    };
    var getTickSize = (content, index) => {
      var value = typeof tickFormatter === "function" ? tickFormatter(content.value, index) : content.value;
      return sizeKey === "width" ? getAngledTickWidth(getStringSize(value, {
        fontSize,
        letterSpacing
      }), unitSize, angle) : getStringSize(value, {
        fontSize,
        letterSpacing
      })[sizeKey];
    };
    var tick0 = ticks2[0];
    var tick1 = ticks2[1];
    var sign = ticks2.length >= 2 && tick0 != null && tick1 != null ? mathSign(tick1.coordinate - tick0.coordinate) : 1;
    var boundaries = getTickBoundaries(viewBox, sign, sizeKey);
    if (interval === "equidistantPreserveStart") {
      return getEquidistantTicks(sign, boundaries, getTickSize, ticks2, minTickGap);
    }
    if (interval === "equidistantPreserveEnd") {
      return getEquidistantPreserveEndTicks(sign, boundaries, getTickSize, ticks2, minTickGap);
    }
    if (interval === "preserveStart" || interval === "preserveStartEnd") {
      candidates = getTicksStart(sign, boundaries, getTickSize, ticks2, minTickGap, interval === "preserveStartEnd");
    } else {
      candidates = getTicksEnd(sign, boundaries, getTickSize, ticks2, minTickGap);
    }
    return candidates.filter((entry) => entry.isShow);
  }

  // node_modules/recharts/es6/util/YAxisUtils.js
  init_define_import_meta_env();
  var getCalculatedYAxisWidth = (_ref2) => {
    var ticks2 = _ref2.ticks, label = _ref2.label, _ref$labelGapWithTick = _ref2.labelGapWithTick, labelGapWithTick = _ref$labelGapWithTick === void 0 ? 5 : _ref$labelGapWithTick, _ref$tickSize = _ref2.tickSize, tickSize = _ref$tickSize === void 0 ? 0 : _ref$tickSize, _ref$tickMargin = _ref2.tickMargin, tickMargin = _ref$tickMargin === void 0 ? 0 : _ref$tickMargin;
    var maxTickWidth = 0;
    if (ticks2) {
      Array.from(ticks2).forEach((tickNode) => {
        if (tickNode) {
          var bbox = tickNode.getBoundingClientRect();
          if (bbox.width > maxTickWidth) {
            maxTickWidth = bbox.width;
          }
        }
      });
      var labelWidth = label ? label.getBoundingClientRect().width : 0;
      var tickWidth = tickSize + tickMargin;
      var updatedYAxisWidth = maxTickWidth + tickWidth + labelWidth + (label ? labelGapWithTick : 0);
      return Math.round(updatedYAxisWidth);
    }
    return 0;
  };

  // node_modules/recharts/es6/state/renderedTicksSlice.js
  init_define_import_meta_env();
  var initialState11 = {
    xAxis: {},
    yAxis: {}
  };
  var renderedTicksSlice = createSlice({
    name: "renderedTicks",
    initialState: initialState11,
    reducers: {
      setRenderedTicks: (state, action) => {
        var _action$payload = action.payload, axisType = _action$payload.axisType, axisId = _action$payload.axisId, ticks2 = _action$payload.ticks;
        state[axisType][axisId] = castDraft(ticks2);
      },
      removeRenderedTicks: (state, action) => {
        var _action$payload2 = action.payload, axisType = _action$payload2.axisType, axisId = _action$payload2.axisId;
        delete state[axisType][axisId];
      }
    }
  });
  var _renderedTicksSlice$a = renderedTicksSlice.actions;
  var setRenderedTicks = _renderedTicksSlice$a.setRenderedTicks;
  var removeRenderedTicks = _renderedTicksSlice$a.removeRenderedTicks;
  var renderedTicksReducer = renderedTicksSlice.reducer;

  // node_modules/recharts/es6/cartesian/CartesianAxis.js
  var _excluded8 = ["axisLine", "width", "height", "className", "hide", "ticks", "axisType", "axisId"];
  function _slicedToArray14(r2, e) {
    return _arrayWithHoles14(r2) || _iterableToArrayLimit14(r2, e) || _unsupportedIterableToArray14(r2, e) || _nonIterableRest14();
  }
  function _nonIterableRest14() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray14(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray14(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray14(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray14(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit14(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles14(r2) {
    if (Array.isArray(r2)) return r2;
  }
  function _objectWithoutProperties8(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose8(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose8(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function _extends7() {
    return _extends7 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends7.apply(null, arguments);
  }
  function ownKeys20(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread20(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys20(Object(t), true).forEach(function(r3) {
        _defineProperty23(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys20(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty23(e, r2, t) {
    return (r2 = _toPropertyKey23(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey23(t) {
    var i = _toPrimitive23(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive23(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var defaultCartesianAxisProps = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    viewBox: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    },
    // The orientation of axis
    orientation: "bottom",
    // The ticks
    ticks: [],
    stroke: "#666",
    tickLine: true,
    axisLine: true,
    tick: true,
    mirror: false,
    minTickGap: 5,
    // The width or height of tick
    tickSize: 6,
    tickMargin: 2,
    interval: "preserveEnd",
    zIndex: DefaultZIndexes.axis
  };
  function AxisLine(axisLineProps) {
    var x = axisLineProps.x, y = axisLineProps.y, width = axisLineProps.width, height = axisLineProps.height, orientation = axisLineProps.orientation, mirror = axisLineProps.mirror, axisLine = axisLineProps.axisLine, otherSvgProps = axisLineProps.otherSvgProps;
    if (!axisLine) {
      return null;
    }
    var props = _objectSpread20(_objectSpread20(_objectSpread20({}, otherSvgProps), svgPropertiesNoEvents(axisLine)), {}, {
      fill: "none"
    });
    if (orientation === "top" || orientation === "bottom") {
      var needHeight = +(orientation === "top" && !mirror || orientation === "bottom" && mirror);
      props = _objectSpread20(_objectSpread20({}, props), {}, {
        x1: x,
        y1: y + needHeight * height,
        x2: x + width,
        y2: y + needHeight * height
      });
    } else {
      var needWidth = +(orientation === "left" && !mirror || orientation === "right" && mirror);
      props = _objectSpread20(_objectSpread20({}, props), {}, {
        x1: x + needWidth * width,
        y1: y,
        x2: x + needWidth * width,
        y2: y + height
      });
    }
    return /* @__PURE__ */ React15.createElement("line", _extends7({}, props, {
      className: clsx("recharts-cartesian-axis-line", get(axisLine, "className"))
    }));
  }
  function getTickLineCoord(data2, x, y, width, height, orientation, tickSize, mirror, tickMargin) {
    var x1, x2, y1, y2, tx, ty;
    var sign = mirror ? -1 : 1;
    var finalTickSize = data2.tickSize || tickSize;
    var tickCoord = isNumber(data2.tickCoord) ? data2.tickCoord : data2.coordinate;
    switch (orientation) {
      case "top":
        x1 = x2 = data2.coordinate;
        y2 = y + +!mirror * height;
        y1 = y2 - sign * finalTickSize;
        ty = y1 - sign * tickMargin;
        tx = tickCoord;
        break;
      case "left":
        y1 = y2 = data2.coordinate;
        x2 = x + +!mirror * width;
        x1 = x2 - sign * finalTickSize;
        tx = x1 - sign * tickMargin;
        ty = tickCoord;
        break;
      case "right":
        y1 = y2 = data2.coordinate;
        x2 = x + +mirror * width;
        x1 = x2 + sign * finalTickSize;
        tx = x1 + sign * tickMargin;
        ty = tickCoord;
        break;
      default:
        x1 = x2 = data2.coordinate;
        y2 = y + +mirror * height;
        y1 = y2 + sign * finalTickSize;
        ty = y1 + sign * tickMargin;
        tx = tickCoord;
        break;
    }
    return {
      line: {
        x1,
        y1,
        x2,
        y2
      },
      tick: {
        x: tx,
        y: ty
      }
    };
  }
  function getTickTextAnchor(orientation, mirror) {
    switch (orientation) {
      case "left":
        return mirror ? "start" : "end";
      case "right":
        return mirror ? "end" : "start";
      default:
        return "middle";
    }
  }
  function getTickVerticalAnchor(orientation, mirror) {
    switch (orientation) {
      case "left":
      case "right":
        return "middle";
      case "top":
        return mirror ? "start" : "end";
      default:
        return mirror ? "end" : "start";
    }
  }
  function TickItem(props) {
    var option = props.option, tickProps = props.tickProps, value = props.value;
    var tickItem;
    var combinedClassName = clsx(tickProps.className, "recharts-cartesian-axis-tick-value");
    if (/* @__PURE__ */ React15.isValidElement(option)) {
      tickItem = /* @__PURE__ */ React15.cloneElement(option, _objectSpread20(_objectSpread20({}, tickProps), {}, {
        className: combinedClassName
      }));
    } else if (typeof option === "function") {
      tickItem = option(_objectSpread20(_objectSpread20({}, tickProps), {}, {
        className: combinedClassName
      }));
    } else {
      var className = "recharts-cartesian-axis-tick-value";
      if (typeof option !== "boolean") {
        className = clsx(className, getClassNameFromUnknown(option));
      }
      tickItem = /* @__PURE__ */ React15.createElement(Text, _extends7({}, tickProps, {
        className
      }), value);
    }
    return tickItem;
  }
  function RenderedTicksReporter(_ref2) {
    var ticks2 = _ref2.ticks, axisType = _ref2.axisType, axisId = _ref2.axisId;
    var dispatch = useAppDispatch();
    (0, import_react32.useEffect)(() => {
      if (axisId == null || axisType == null) {
        return noop;
      }
      var tickItems = ticks2.map((tick) => ({
        value: tick.value,
        coordinate: tick.coordinate,
        offset: tick.offset,
        index: tick.index
      }));
      dispatch(setRenderedTicks({
        ticks: tickItems,
        axisId,
        axisType
      }));
      return () => {
        dispatch(removeRenderedTicks({
          axisId,
          axisType
        }));
      };
    }, [dispatch, ticks2, axisId, axisType]);
    return null;
  }
  var Ticks = /* @__PURE__ */ (0, import_react32.forwardRef)((props, ref) => {
    var _props$ticks = props.ticks, ticks2 = _props$ticks === void 0 ? [] : _props$ticks, tick = props.tick, tickLine = props.tickLine, stroke = props.stroke, tickFormatter = props.tickFormatter, unit2 = props.unit, padding = props.padding, tickTextProps = props.tickTextProps, orientation = props.orientation, mirror = props.mirror, x = props.x, y = props.y, width = props.width, height = props.height, tickSize = props.tickSize, tickMargin = props.tickMargin, fontSize = props.fontSize, letterSpacing = props.letterSpacing, getTicksConfig = props.getTicksConfig, events = props.events, axisType = props.axisType, axisId = props.axisId;
    var finalTicks = getTicks(_objectSpread20(_objectSpread20({}, getTicksConfig), {}, {
      ticks: ticks2
    }), fontSize, letterSpacing);
    var axisProps = svgPropertiesNoEvents(getTicksConfig);
    var customTickProps = svgPropertiesNoEventsFromUnknown(tick);
    var textAnchor = isValidTextAnchor(axisProps.textAnchor) ? axisProps.textAnchor : getTickTextAnchor(orientation, mirror);
    var verticalAnchor = getTickVerticalAnchor(orientation, mirror);
    var tickLinePropsObject = {};
    if (typeof tickLine === "object") {
      tickLinePropsObject = tickLine;
    }
    var tickLineProps = _objectSpread20(_objectSpread20({}, axisProps), {}, {
      fill: "none"
    }, tickLinePropsObject);
    var tickLineCoords = finalTicks.map((entry) => _objectSpread20({
      entry
    }, getTickLineCoord(entry, x, y, width, height, orientation, tickSize, mirror, tickMargin)));
    var tickLines = tickLineCoords.map((_ref2) => {
      var entry = _ref2.entry, lineCoord = _ref2.line;
      return /* @__PURE__ */ React15.createElement(Layer, {
        className: "recharts-cartesian-axis-tick",
        key: "tick-".concat(entry.value, "-").concat(entry.coordinate, "-").concat(entry.tickCoord)
      }, tickLine && /* @__PURE__ */ React15.createElement("line", _extends7({}, tickLineProps, lineCoord, {
        className: clsx("recharts-cartesian-axis-tick-line", get(tickLine, "className"))
      })));
    });
    var tickLabels = tickLineCoords.map((_ref3, i) => {
      var _ref4, _tickTextProps$angle;
      var entry = _ref3.entry, tickCoord = _ref3.tick;
      var tickProps = _objectSpread20(_objectSpread20(_objectSpread20(_objectSpread20({
        verticalAnchor
      }, axisProps), {}, {
        textAnchor,
        stroke: "none",
        fill: stroke
      }, tickCoord), {}, {
        index: i,
        payload: entry,
        visibleTicksCount: finalTicks.length,
        tickFormatter,
        padding
      }, tickTextProps), {}, {
        angle: (_ref4 = (_tickTextProps$angle = tickTextProps === null || tickTextProps === void 0 ? void 0 : tickTextProps.angle) !== null && _tickTextProps$angle !== void 0 ? _tickTextProps$angle : axisProps.angle) !== null && _ref4 !== void 0 ? _ref4 : 0
      });
      var finalTickProps = _objectSpread20(_objectSpread20({}, tickProps), customTickProps);
      return /* @__PURE__ */ React15.createElement(Layer, _extends7({
        className: "recharts-cartesian-axis-tick-label",
        key: "tick-label-".concat(entry.value, "-").concat(entry.coordinate, "-").concat(entry.tickCoord)
      }, adaptEventsOfChild(events, entry, i)), tick && /* @__PURE__ */ React15.createElement(TickItem, {
        option: tick,
        tickProps: finalTickProps,
        value: "".concat(typeof tickFormatter === "function" ? tickFormatter(entry.value, i) : entry.value).concat(unit2 || "")
      }));
    });
    return /* @__PURE__ */ React15.createElement("g", {
      className: "recharts-cartesian-axis-ticks recharts-".concat(axisType, "-ticks")
    }, /* @__PURE__ */ React15.createElement(RenderedTicksReporter, {
      ticks: finalTicks,
      axisId,
      axisType
    }), tickLabels.length > 0 && /* @__PURE__ */ React15.createElement(ZIndexLayer, {
      zIndex: DefaultZIndexes.label
    }, /* @__PURE__ */ React15.createElement("g", {
      className: "recharts-cartesian-axis-tick-labels recharts-".concat(axisType, "-tick-labels"),
      ref
    }, tickLabels)), tickLines.length > 0 && /* @__PURE__ */ React15.createElement("g", {
      className: "recharts-cartesian-axis-tick-lines recharts-".concat(axisType, "-tick-lines")
    }, tickLines));
  });
  var CartesianAxisComponent = /* @__PURE__ */ (0, import_react32.forwardRef)((props, ref) => {
    var axisLine = props.axisLine, width = props.width, height = props.height, className = props.className, hide = props.hide, ticks2 = props.ticks, axisType = props.axisType, axisId = props.axisId, rest = _objectWithoutProperties8(props, _excluded8);
    var _useState = (0, import_react32.useState)(""), _useState2 = _slicedToArray14(_useState, 2), fontSize = _useState2[0], setFontSize = _useState2[1];
    var _useState3 = (0, import_react32.useState)(""), _useState4 = _slicedToArray14(_useState3, 2), letterSpacing = _useState4[0], setLetterSpacing = _useState4[1];
    var tickRefs = (0, import_react32.useRef)(null);
    (0, import_react32.useImperativeHandle)(ref, () => ({
      getCalculatedWidth: () => {
        var _props$labelRef;
        return getCalculatedYAxisWidth({
          ticks: tickRefs.current,
          label: (_props$labelRef = props.labelRef) === null || _props$labelRef === void 0 ? void 0 : _props$labelRef.current,
          labelGapWithTick: 5,
          tickSize: props.tickSize,
          tickMargin: props.tickMargin
        });
      }
    }));
    var layerRef = (0, import_react32.useCallback)((el) => {
      if (el) {
        var tickNodes = el.getElementsByClassName("recharts-cartesian-axis-tick-value");
        tickRefs.current = tickNodes;
        var tick = tickNodes[0];
        if (tick) {
          var computedStyle = window.getComputedStyle(tick);
          var calculatedFontSize = computedStyle.fontSize;
          var calculatedLetterSpacing = computedStyle.letterSpacing;
          if (calculatedFontSize !== fontSize || calculatedLetterSpacing !== letterSpacing) {
            setFontSize(calculatedFontSize);
            setLetterSpacing(calculatedLetterSpacing);
          }
        }
      }
    }, [fontSize, letterSpacing]);
    if (hide) {
      return null;
    }
    if (width != null && width <= 0 || height != null && height <= 0) {
      return null;
    }
    return /* @__PURE__ */ React15.createElement(ZIndexLayer, {
      zIndex: props.zIndex
    }, /* @__PURE__ */ React15.createElement(Layer, {
      className: clsx("recharts-cartesian-axis", className)
    }, /* @__PURE__ */ React15.createElement(AxisLine, {
      x: props.x,
      y: props.y,
      width,
      height,
      orientation: props.orientation,
      mirror: props.mirror,
      axisLine,
      otherSvgProps: svgPropertiesNoEvents(props)
    }), /* @__PURE__ */ React15.createElement(Ticks, {
      ref: layerRef,
      axisType,
      events: rest,
      fontSize,
      getTicksConfig: props,
      height: props.height,
      letterSpacing,
      mirror: props.mirror,
      orientation: props.orientation,
      padding: props.padding,
      stroke: props.stroke,
      tick: props.tick,
      tickFormatter: props.tickFormatter,
      tickLine: props.tickLine,
      tickMargin: props.tickMargin,
      tickSize: props.tickSize,
      tickTextProps: props.tickTextProps,
      ticks: ticks2,
      unit: props.unit,
      width: props.width,
      x: props.x,
      y: props.y,
      axisId
    }), /* @__PURE__ */ React15.createElement(CartesianLabelContextProvider, {
      x: props.x,
      y: props.y,
      width: props.width,
      height: props.height,
      lowerWidth: props.width,
      upperWidth: props.width
    }, /* @__PURE__ */ React15.createElement(CartesianLabelFromLabelProp, {
      label: props.label,
      labelRef: props.labelRef
    }), props.children)));
  });
  var CartesianAxis = /* @__PURE__ */ React15.forwardRef((outsideProps, ref) => {
    var props = resolveDefaultProps(outsideProps, defaultCartesianAxisProps);
    return /* @__PURE__ */ React15.createElement(CartesianAxisComponent, _extends7({}, props, {
      ref
    }));
  });
  CartesianAxis.displayName = "CartesianAxis";

  // node_modules/recharts/es6/cartesian/CartesianGrid.js
  init_define_import_meta_env();
  var React16 = __toESM(require_react_shim());
  var _excluded9 = ["x1", "y1", "x2", "y2", "key"];
  var _excluded26 = ["offset"];
  var _excluded32 = ["xAxisId", "yAxisId"];
  var _excluded42 = ["xAxisId", "yAxisId"];
  function ownKeys21(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread21(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys21(Object(t), true).forEach(function(r3) {
        _defineProperty24(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys21(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty24(e, r2, t) {
    return (r2 = _toPropertyKey24(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey24(t) {
    var i = _toPrimitive24(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive24(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function _extends8() {
    return _extends8 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends8.apply(null, arguments);
  }
  function _objectWithoutProperties9(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose9(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose9(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var Background = (props) => {
    var fill = props.fill;
    if (!fill || fill === "none") {
      return null;
    }
    var fillOpacity = props.fillOpacity, x = props.x, y = props.y, width = props.width, height = props.height, ry = props.ry;
    return /* @__PURE__ */ React16.createElement("rect", {
      x,
      y,
      ry,
      width,
      height,
      stroke: "none",
      fill,
      fillOpacity,
      className: "recharts-cartesian-grid-bg"
    });
  };
  function LineItem(_ref2) {
    var option = _ref2.option, lineItemProps = _ref2.lineItemProps;
    var lineItem;
    if (/* @__PURE__ */ React16.isValidElement(option)) {
      lineItem = /* @__PURE__ */ React16.cloneElement(option, lineItemProps);
    } else if (typeof option === "function") {
      lineItem = option(lineItemProps);
    } else {
      var _svgPropertiesNoEvent;
      var x1 = lineItemProps.x1, y1 = lineItemProps.y1, x2 = lineItemProps.x2, y2 = lineItemProps.y2, key = lineItemProps.key, others = _objectWithoutProperties9(lineItemProps, _excluded9);
      var _ref22 = (_svgPropertiesNoEvent = svgPropertiesNoEvents(others)) !== null && _svgPropertiesNoEvent !== void 0 ? _svgPropertiesNoEvent : {}, __ = _ref22.offset, restOfFilteredProps = _objectWithoutProperties9(_ref22, _excluded26);
      lineItem = /* @__PURE__ */ React16.createElement("line", _extends8({}, restOfFilteredProps, {
        x1,
        y1,
        x2,
        y2,
        fill: "none",
        key
      }));
    }
    return lineItem;
  }
  function HorizontalGridLines(props) {
    var x = props.x, width = props.width, _props$horizontal = props.horizontal, horizontal = _props$horizontal === void 0 ? true : _props$horizontal, horizontalPoints = props.horizontalPoints;
    if (!horizontal || !horizontalPoints || !horizontalPoints.length) {
      return null;
    }
    var xAxisId = props.xAxisId, yAxisId = props.yAxisId, otherLineItemProps = _objectWithoutProperties9(props, _excluded32);
    var items = horizontalPoints.map((entry, i) => {
      var lineItemProps = _objectSpread21(_objectSpread21({}, otherLineItemProps), {}, {
        x1: x,
        y1: entry,
        x2: x + width,
        y2: entry,
        key: "line-".concat(i),
        index: i
      });
      return /* @__PURE__ */ React16.createElement(LineItem, {
        key: "line-".concat(i),
        option: horizontal,
        lineItemProps
      });
    });
    return /* @__PURE__ */ React16.createElement("g", {
      className: "recharts-cartesian-grid-horizontal"
    }, items);
  }
  function VerticalGridLines(props) {
    var y = props.y, height = props.height, _props$vertical = props.vertical, vertical = _props$vertical === void 0 ? true : _props$vertical, verticalPoints = props.verticalPoints;
    if (!vertical || !verticalPoints || !verticalPoints.length) {
      return null;
    }
    var xAxisId = props.xAxisId, yAxisId = props.yAxisId, otherLineItemProps = _objectWithoutProperties9(props, _excluded42);
    var items = verticalPoints.map((entry, i) => {
      var lineItemProps = _objectSpread21(_objectSpread21({}, otherLineItemProps), {}, {
        x1: entry,
        y1: y,
        x2: entry,
        y2: y + height,
        key: "line-".concat(i),
        index: i
      });
      return /* @__PURE__ */ React16.createElement(LineItem, {
        option: vertical,
        lineItemProps,
        key: "line-".concat(i)
      });
    });
    return /* @__PURE__ */ React16.createElement("g", {
      className: "recharts-cartesian-grid-vertical"
    }, items);
  }
  function HorizontalStripes(props) {
    var horizontalFill = props.horizontalFill, fillOpacity = props.fillOpacity, x = props.x, y = props.y, width = props.width, height = props.height, horizontalPoints = props.horizontalPoints, _props$horizontal2 = props.horizontal, horizontal = _props$horizontal2 === void 0 ? true : _props$horizontal2;
    if (!horizontal || !horizontalFill || !horizontalFill.length || horizontalPoints == null) {
      return null;
    }
    var roundedSortedHorizontalPoints = horizontalPoints.map((e) => Math.round(e + y - y)).sort((a, b) => a - b);
    if (y !== roundedSortedHorizontalPoints[0]) {
      roundedSortedHorizontalPoints.unshift(0);
    }
    var items = roundedSortedHorizontalPoints.map((entry, i) => {
      var nextPoint = roundedSortedHorizontalPoints[i + 1];
      var lastStripe = nextPoint == null;
      var lineHeight = lastStripe ? y + height - entry : nextPoint - entry;
      if (lineHeight <= 0) {
        return null;
      }
      var colorIndex = i % horizontalFill.length;
      return /* @__PURE__ */ React16.createElement("rect", {
        key: "react-".concat(i),
        y: entry,
        x,
        height: lineHeight,
        width,
        stroke: "none",
        fill: horizontalFill[colorIndex],
        fillOpacity,
        className: "recharts-cartesian-grid-bg"
      });
    });
    return /* @__PURE__ */ React16.createElement("g", {
      className: "recharts-cartesian-gridstripes-horizontal"
    }, items);
  }
  function VerticalStripes(props) {
    var _props$vertical2 = props.vertical, vertical = _props$vertical2 === void 0 ? true : _props$vertical2, verticalFill = props.verticalFill, fillOpacity = props.fillOpacity, x = props.x, y = props.y, width = props.width, height = props.height, verticalPoints = props.verticalPoints;
    if (!vertical || !verticalFill || !verticalFill.length) {
      return null;
    }
    var roundedSortedVerticalPoints = verticalPoints.map((e) => Math.round(e + x - x)).sort((a, b) => a - b);
    if (x !== roundedSortedVerticalPoints[0]) {
      roundedSortedVerticalPoints.unshift(0);
    }
    var items = roundedSortedVerticalPoints.map((entry, i) => {
      var nextPoint = roundedSortedVerticalPoints[i + 1];
      var lastStripe = nextPoint == null;
      var lineWidth = lastStripe ? x + width - entry : nextPoint - entry;
      if (lineWidth <= 0) {
        return null;
      }
      var colorIndex = i % verticalFill.length;
      return /* @__PURE__ */ React16.createElement("rect", {
        key: "react-".concat(i),
        x: entry,
        y,
        width: lineWidth,
        height,
        stroke: "none",
        fill: verticalFill[colorIndex],
        fillOpacity,
        className: "recharts-cartesian-grid-bg"
      });
    });
    return /* @__PURE__ */ React16.createElement("g", {
      className: "recharts-cartesian-gridstripes-vertical"
    }, items);
  }
  var defaultVerticalCoordinatesGenerator = (_ref3, syncWithTicks) => {
    var xAxis = _ref3.xAxis, width = _ref3.width, height = _ref3.height, offset = _ref3.offset;
    return getCoordinatesOfGrid(getTicks(_objectSpread21(_objectSpread21(_objectSpread21({}, defaultCartesianAxisProps), xAxis), {}, {
      ticks: getTicksOfAxis(xAxis, true),
      viewBox: {
        x: 0,
        y: 0,
        width,
        height
      }
    })), offset.left, offset.left + offset.width, syncWithTicks);
  };
  var defaultHorizontalCoordinatesGenerator = (_ref4, syncWithTicks) => {
    var yAxis = _ref4.yAxis, width = _ref4.width, height = _ref4.height, offset = _ref4.offset;
    return getCoordinatesOfGrid(getTicks(_objectSpread21(_objectSpread21(_objectSpread21({}, defaultCartesianAxisProps), yAxis), {}, {
      ticks: getTicksOfAxis(yAxis, true),
      viewBox: {
        x: 0,
        y: 0,
        width,
        height
      }
    })), offset.top, offset.top + offset.height, syncWithTicks);
  };
  var defaultCartesianGridProps = {
    horizontal: true,
    vertical: true,
    // The ordinates of horizontal grid lines
    horizontalPoints: [],
    // The abscissas of vertical grid lines
    verticalPoints: [],
    stroke: "#ccc",
    fill: "none",
    // The fill of colors of grid lines
    verticalFill: [],
    horizontalFill: [],
    xAxisId: 0,
    yAxisId: 0,
    syncWithTicks: false,
    zIndex: DefaultZIndexes.grid
  };
  function CartesianGrid(props) {
    var chartWidth = useChartWidth();
    var chartHeight = useChartHeight();
    var offset = useOffsetInternal();
    var propsIncludingDefaults = _objectSpread21(_objectSpread21({}, resolveDefaultProps(props, defaultCartesianGridProps)), {}, {
      x: isNumber(props.x) ? props.x : offset.left,
      y: isNumber(props.y) ? props.y : offset.top,
      width: isNumber(props.width) ? props.width : offset.width,
      height: isNumber(props.height) ? props.height : offset.height
    });
    var xAxisId = propsIncludingDefaults.xAxisId, yAxisId = propsIncludingDefaults.yAxisId, x = propsIncludingDefaults.x, y = propsIncludingDefaults.y, width = propsIncludingDefaults.width, height = propsIncludingDefaults.height, syncWithTicks = propsIncludingDefaults.syncWithTicks, horizontalValues = propsIncludingDefaults.horizontalValues, verticalValues = propsIncludingDefaults.verticalValues;
    var isPanorama = useIsPanorama();
    var xAxis = useAppSelector((state) => selectAxisPropsNeededForCartesianGridTicksGenerator(state, "xAxis", xAxisId, isPanorama));
    var yAxis = useAppSelector((state) => selectAxisPropsNeededForCartesianGridTicksGenerator(state, "yAxis", yAxisId, isPanorama));
    if (!isPositiveNumber(width) || !isPositiveNumber(height) || !isNumber(x) || !isNumber(y)) {
      return null;
    }
    var verticalCoordinatesGenerator = propsIncludingDefaults.verticalCoordinatesGenerator || defaultVerticalCoordinatesGenerator;
    var horizontalCoordinatesGenerator = propsIncludingDefaults.horizontalCoordinatesGenerator || defaultHorizontalCoordinatesGenerator;
    var horizontalPoints = propsIncludingDefaults.horizontalPoints, verticalPoints = propsIncludingDefaults.verticalPoints;
    if ((!horizontalPoints || !horizontalPoints.length) && typeof horizontalCoordinatesGenerator === "function") {
      var isHorizontalValues = horizontalValues && horizontalValues.length;
      var generatorResult = horizontalCoordinatesGenerator({
        yAxis: yAxis ? _objectSpread21(_objectSpread21({}, yAxis), {}, {
          ticks: isHorizontalValues ? horizontalValues : yAxis.ticks
        }) : void 0,
        width: chartWidth !== null && chartWidth !== void 0 ? chartWidth : width,
        height: chartHeight !== null && chartHeight !== void 0 ? chartHeight : height,
        offset
      }, isHorizontalValues ? true : syncWithTicks);
      warn(Array.isArray(generatorResult), "horizontalCoordinatesGenerator should return Array but instead it returned [".concat(typeof generatorResult, "]"));
      if (Array.isArray(generatorResult)) {
        horizontalPoints = generatorResult;
      }
    }
    if ((!verticalPoints || !verticalPoints.length) && typeof verticalCoordinatesGenerator === "function") {
      var isVerticalValues = verticalValues && verticalValues.length;
      var _generatorResult = verticalCoordinatesGenerator({
        xAxis: xAxis ? _objectSpread21(_objectSpread21({}, xAxis), {}, {
          ticks: isVerticalValues ? verticalValues : xAxis.ticks
        }) : void 0,
        width: chartWidth !== null && chartWidth !== void 0 ? chartWidth : width,
        height: chartHeight !== null && chartHeight !== void 0 ? chartHeight : height,
        offset
      }, isVerticalValues ? true : syncWithTicks);
      warn(Array.isArray(_generatorResult), "verticalCoordinatesGenerator should return Array but instead it returned [".concat(typeof _generatorResult, "]"));
      if (Array.isArray(_generatorResult)) {
        verticalPoints = _generatorResult;
      }
    }
    return /* @__PURE__ */ React16.createElement(ZIndexLayer, {
      zIndex: propsIncludingDefaults.zIndex
    }, /* @__PURE__ */ React16.createElement("g", {
      className: "recharts-cartesian-grid"
    }, /* @__PURE__ */ React16.createElement(Background, {
      fill: propsIncludingDefaults.fill,
      fillOpacity: propsIncludingDefaults.fillOpacity,
      x: propsIncludingDefaults.x,
      y: propsIncludingDefaults.y,
      width: propsIncludingDefaults.width,
      height: propsIncludingDefaults.height,
      ry: propsIncludingDefaults.ry
    }), /* @__PURE__ */ React16.createElement(HorizontalStripes, _extends8({}, propsIncludingDefaults, {
      horizontalPoints
    })), /* @__PURE__ */ React16.createElement(VerticalStripes, _extends8({}, propsIncludingDefaults, {
      verticalPoints
    })), /* @__PURE__ */ React16.createElement(HorizontalGridLines, _extends8({}, propsIncludingDefaults, {
      offset,
      horizontalPoints,
      xAxis,
      yAxis
    })), /* @__PURE__ */ React16.createElement(VerticalGridLines, _extends8({}, propsIncludingDefaults, {
      offset,
      verticalPoints,
      xAxis,
      yAxis
    }))));
  }
  CartesianGrid.displayName = "CartesianGrid";

  // node_modules/recharts/es6/context/ErrorBarContext.js
  init_define_import_meta_env();
  var React17 = __toESM(require_react_shim());
  var import_react33 = __toESM(require_react_shim());

  // node_modules/recharts/es6/state/errorBarSlice.js
  init_define_import_meta_env();
  var initialState12 = {};
  var errorBarSlice = createSlice({
    name: "errorBars",
    initialState: initialState12,
    reducers: {
      addErrorBar: (state, action) => {
        var _action$payload = action.payload, itemId = _action$payload.itemId, errorBar = _action$payload.errorBar;
        if (!state[itemId]) {
          state[itemId] = [];
        }
        state[itemId].push(errorBar);
      },
      replaceErrorBar: (state, action) => {
        var _action$payload2 = action.payload, itemId = _action$payload2.itemId, prev = _action$payload2.prev, next = _action$payload2.next;
        if (state[itemId]) {
          state[itemId] = state[itemId].map((e) => e.dataKey === prev.dataKey && e.direction === prev.direction ? next : e);
        }
      },
      removeErrorBar: (state, action) => {
        var _action$payload3 = action.payload, itemId = _action$payload3.itemId, errorBar = _action$payload3.errorBar;
        if (state[itemId]) {
          state[itemId] = state[itemId].filter((e) => e.dataKey !== errorBar.dataKey || e.direction !== errorBar.direction);
        }
      }
    }
  });
  var _errorBarSlice$action = errorBarSlice.actions;
  var addErrorBar = _errorBarSlice$action.addErrorBar;
  var replaceErrorBar = _errorBarSlice$action.replaceErrorBar;
  var removeErrorBar = _errorBarSlice$action.removeErrorBar;
  var errorBarReducer = errorBarSlice.reducer;

  // node_modules/recharts/es6/context/ErrorBarContext.js
  var _excluded10 = ["children"];
  function _objectWithoutProperties10(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose10(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose10(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var initialContextState = {
    data: [],
    xAxisId: "xAxis-0",
    yAxisId: "yAxis-0",
    dataPointFormatter: () => ({
      x: 0,
      y: 0,
      value: 0
    }),
    errorBarOffset: 0
  };
  var ErrorBarContext = /* @__PURE__ */ (0, import_react33.createContext)(initialContextState);
  function SetErrorBarContext(props) {
    var children = props.children, rest = _objectWithoutProperties10(props, _excluded10);
    return /* @__PURE__ */ React17.createElement(ErrorBarContext.Provider, {
      value: rest
    }, children);
  }

  // node_modules/recharts/es6/cartesian/GraphicalItemClipPath.js
  init_define_import_meta_env();
  var React18 = __toESM(require_react_shim());
  function useNeedsClip(xAxisId, yAxisId) {
    var _xAxis$allowDataOverf, _yAxis$allowDataOverf;
    var xAxis = useAppSelector((state) => selectXAxisSettings(state, xAxisId));
    var yAxis = useAppSelector((state) => selectYAxisSettings(state, yAxisId));
    var needClipX = (_xAxis$allowDataOverf = xAxis === null || xAxis === void 0 ? void 0 : xAxis.allowDataOverflow) !== null && _xAxis$allowDataOverf !== void 0 ? _xAxis$allowDataOverf : implicitXAxis.allowDataOverflow;
    var needClipY = (_yAxis$allowDataOverf = yAxis === null || yAxis === void 0 ? void 0 : yAxis.allowDataOverflow) !== null && _yAxis$allowDataOverf !== void 0 ? _yAxis$allowDataOverf : implicitYAxis.allowDataOverflow;
    var needClip = needClipX || needClipY;
    return {
      needClip,
      needClipX,
      needClipY
    };
  }
  function GraphicalItemClipPath(_ref2) {
    var xAxisId = _ref2.xAxisId, yAxisId = _ref2.yAxisId, clipPathId = _ref2.clipPathId;
    var plotArea = usePlotArea();
    var _useNeedsClip = useNeedsClip(xAxisId, yAxisId), needClipX = _useNeedsClip.needClipX, needClipY = _useNeedsClip.needClipY, needClip = _useNeedsClip.needClip;
    var xAxisRange = useAppSelector((state) => selectXAxisRange(state, xAxisId, false));
    var yAxisRange = useAppSelector((state) => selectYAxisRange(state, yAxisId, false));
    if (!needClip || !plotArea) {
      return null;
    }
    var x = plotArea.x, y = plotArea.y, width = plotArea.width, height = plotArea.height;
    var clipX = needClipX && xAxisRange ? Math.min(xAxisRange[0], xAxisRange[1]) : x - width / 2;
    var clipY = needClipY && yAxisRange ? Math.min(yAxisRange[0], yAxisRange[1]) : y - height / 2;
    var clipWidth = needClipX && xAxisRange ? Math.abs(xAxisRange[1] - xAxisRange[0]) : width * 2;
    var clipHeight = needClipY && yAxisRange ? Math.abs(yAxisRange[1] - yAxisRange[0]) : height * 2;
    return /* @__PURE__ */ React18.createElement("clipPath", {
      id: "clipPath-".concat(clipPathId)
    }, /* @__PURE__ */ React18.createElement("rect", {
      x: clipX,
      y: clipY,
      width: clipWidth,
      height: clipHeight
    }));
  }

  // node_modules/recharts/es6/state/selectors/graphicalItemSelectors.js
  init_define_import_meta_env();
  function selectXAxisIdFromGraphicalItemId(state, id) {
    var _state$graphicalItems, _state$graphicalItems2;
    return (_state$graphicalItems = (_state$graphicalItems2 = state.graphicalItems.cartesianItems.find((item) => item.id === id)) === null || _state$graphicalItems2 === void 0 ? void 0 : _state$graphicalItems2.xAxisId) !== null && _state$graphicalItems !== void 0 ? _state$graphicalItems : defaultAxisId;
  }
  function selectYAxisIdFromGraphicalItemId(state, id) {
    var _state$graphicalItems3, _state$graphicalItems4;
    return (_state$graphicalItems3 = (_state$graphicalItems4 = state.graphicalItems.cartesianItems.find((item) => item.id === id)) === null || _state$graphicalItems4 === void 0 ? void 0 : _state$graphicalItems4.yAxisId) !== null && _state$graphicalItems3 !== void 0 ? _state$graphicalItems3 : defaultAxisId;
  }

  // node_modules/recharts/es6/cartesian/Bar.js
  init_define_import_meta_env();
  var React21 = __toESM(require_react_shim());
  var import_react35 = __toESM(require_react_shim());

  // node_modules/recharts/es6/util/BarUtils.js
  init_define_import_meta_env();
  var React19 = __toESM(require_react_shim());

  // node_modules/tiny-invariant/dist/esm/tiny-invariant.js
  init_define_import_meta_env();
  var isProduction = false;
  var prefix = "Invariant failed";
  function invariant(condition, message) {
    if (condition) {
      return;
    }
    if (isProduction) {
      throw new Error(prefix);
    }
    var provided = typeof message === "function" ? message() : message;
    var value = provided ? "".concat(prefix, ": ").concat(provided) : prefix;
    throw new Error(value);
  }

  // node_modules/recharts/es6/util/BarUtils.js
  var _excluded11 = ["option"];
  function _objectWithoutProperties11(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose11(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose11(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var defaultBarShape = Rectangle;
  function BarRectangle(_ref2) {
    var option = _ref2.option, shapeProps = _objectWithoutProperties11(_ref2, _excluded11);
    return /* @__PURE__ */ React19.createElement(Shape, {
      option,
      DefaultShape: defaultBarShape,
      shapeProps,
      activeClassName: "recharts-active-bar",
      inActiveClassName: "recharts-inactive-bar"
    });
  }
  var minPointSizeCallback = function minPointSizeCallback2(minPointSize) {
    var defaultValue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
    return (value, index) => {
      if (isNumber(minPointSize)) return minPointSize;
      var isValueNumberOrNil = isNumber(value) || isNullish(value);
      if (isValueNumberOrNil) {
        return minPointSize(value, index);
      }
      !isValueNumberOrNil ? true ? invariant(false, "minPointSize callback function received a value with type of ".concat(typeof value, ". Currently only numbers or null/undefined are supported.")) : invariant(false) : void 0;
      return defaultValue;
    };
  };

  // node_modules/recharts/es6/state/selectors/barSelectors.js
  init_define_import_meta_env();
  var pickIsPanorama = (_state, _id, isPanorama) => isPanorama;
  var pickBarId = (_state, id) => id;
  var selectSynchronisedBarSettings = createSelector([selectUnfilteredCartesianItems, pickBarId], (graphicalItems, id) => graphicalItems.filter((item) => item.type === "bar").find((item) => item.id === id));
  var selectMaxBarSize = createSelector([selectSynchronisedBarSettings], (barSettings) => barSettings === null || barSettings === void 0 ? void 0 : barSettings.maxBarSize);
  var pickCells = (_state, _id, _isPanorama, cells) => cells;
  var selectAllVisibleBars = createSelector([selectChartLayout, selectUnfilteredCartesianItems, selectXAxisIdFromGraphicalItemId, selectYAxisIdFromGraphicalItemId, pickIsPanorama], (layout, allItems, xAxisId, yAxisId, isPanorama) => allItems.filter((i) => {
    if (layout === "horizontal") {
      return i.xAxisId === xAxisId;
    }
    return i.yAxisId === yAxisId;
  }).filter((i) => i.isPanorama === isPanorama).filter((i) => i.hide === false).filter((i) => i.type === "bar"));
  var selectBarStackGroups = (state, id, isPanorama) => {
    var layout = selectChartLayout(state);
    var xAxisId = selectXAxisIdFromGraphicalItemId(state, id);
    var yAxisId = selectYAxisIdFromGraphicalItemId(state, id);
    if (xAxisId == null || yAxisId == null) {
      return void 0;
    }
    if (layout === "horizontal") {
      return selectStackGroups(state, "yAxis", yAxisId, isPanorama);
    }
    return selectStackGroups(state, "xAxis", xAxisId, isPanorama);
  };
  var selectBarCartesianAxisSize = (state, id) => {
    var layout = selectChartLayout(state);
    var xAxisId = selectXAxisIdFromGraphicalItemId(state, id);
    var yAxisId = selectYAxisIdFromGraphicalItemId(state, id);
    if (xAxisId == null || yAxisId == null) {
      return void 0;
    }
    if (layout === "horizontal") {
      return selectCartesianAxisSize(state, "xAxis", xAxisId);
    }
    return selectCartesianAxisSize(state, "yAxis", yAxisId);
  };
  var selectBarSizeList = createSelector([selectAllVisibleBars, selectRootBarSize, selectBarCartesianAxisSize], combineBarSizeList);
  var selectBarBandSize = (state, id, isPanorama) => {
    var _ref2, _getBandSizeOfAxis;
    var barSettings = selectSynchronisedBarSettings(state, id);
    if (barSettings == null) {
      return 0;
    }
    var xAxisId = selectXAxisIdFromGraphicalItemId(state, id);
    var yAxisId = selectYAxisIdFromGraphicalItemId(state, id);
    if (xAxisId == null || yAxisId == null) {
      return 0;
    }
    var layout = selectChartLayout(state);
    var globalMaxBarSize = selectRootMaxBarSize(state);
    var childMaxBarSize = barSettings.maxBarSize;
    var maxBarSize = isNullish(childMaxBarSize) ? globalMaxBarSize : childMaxBarSize;
    var axis, ticks2;
    if (layout === "horizontal") {
      axis = selectAxisWithScale(state, "xAxis", xAxisId, isPanorama);
      ticks2 = selectTicksOfGraphicalItem(state, "xAxis", xAxisId, isPanorama);
    } else {
      axis = selectAxisWithScale(state, "yAxis", yAxisId, isPanorama);
      ticks2 = selectTicksOfGraphicalItem(state, "yAxis", yAxisId, isPanorama);
    }
    return (_ref2 = (_getBandSizeOfAxis = getBandSizeOfAxis(axis, ticks2, true)) !== null && _getBandSizeOfAxis !== void 0 ? _getBandSizeOfAxis : maxBarSize) !== null && _ref2 !== void 0 ? _ref2 : 0;
  };
  var selectAxisBandSize = (state, id, isPanorama) => {
    var layout = selectChartLayout(state);
    var xAxisId = selectXAxisIdFromGraphicalItemId(state, id);
    var yAxisId = selectYAxisIdFromGraphicalItemId(state, id);
    if (xAxisId == null || yAxisId == null) {
      return void 0;
    }
    var axis, ticks2;
    if (layout === "horizontal") {
      axis = selectAxisWithScale(state, "xAxis", xAxisId, isPanorama);
      ticks2 = selectTicksOfGraphicalItem(state, "xAxis", xAxisId, isPanorama);
    } else {
      axis = selectAxisWithScale(state, "yAxis", yAxisId, isPanorama);
      ticks2 = selectTicksOfGraphicalItem(state, "yAxis", yAxisId, isPanorama);
    }
    return getBandSizeOfAxis(axis, ticks2);
  };
  var selectAllBarPositions = createSelector([selectBarSizeList, selectRootMaxBarSize, selectBarGap, selectBarCategoryGap, selectBarBandSize, selectAxisBandSize, selectMaxBarSize], combineAllBarPositions);
  var selectXAxisWithScale = (state, id, isPanorama) => {
    var xAxisId = selectXAxisIdFromGraphicalItemId(state, id);
    if (xAxisId == null) {
      return void 0;
    }
    return selectAxisWithScale(state, "xAxis", xAxisId, isPanorama);
  };
  var selectYAxisWithScale = (state, id, isPanorama) => {
    var yAxisId = selectYAxisIdFromGraphicalItemId(state, id);
    if (yAxisId == null) {
      return void 0;
    }
    return selectAxisWithScale(state, "yAxis", yAxisId, isPanorama);
  };
  var selectXAxisTicks = (state, id, isPanorama) => {
    var xAxisId = selectXAxisIdFromGraphicalItemId(state, id);
    if (xAxisId == null) {
      return void 0;
    }
    return selectTicksOfGraphicalItem(state, "xAxis", xAxisId, isPanorama);
  };
  var selectYAxisTicks = (state, id, isPanorama) => {
    var yAxisId = selectYAxisIdFromGraphicalItemId(state, id);
    if (yAxisId == null) {
      return void 0;
    }
    return selectTicksOfGraphicalItem(state, "yAxis", yAxisId, isPanorama);
  };
  var selectBarPosition = createSelector([selectAllBarPositions, selectSynchronisedBarSettings], combineBarPosition);
  var selectStackedDataOfItem = createSelector([selectBarStackGroups, selectSynchronisedBarSettings], combineStackedData);
  var selectBarRectangles = createSelector([selectChartOffsetInternal, selectAxisViewBox, selectXAxisWithScale, selectYAxisWithScale, selectXAxisTicks, selectYAxisTicks, selectBarPosition, selectChartLayout, selectChartDataWithIndexesIfNotInPanoramaPosition3, selectAxisBandSize, selectStackedDataOfItem, selectSynchronisedBarSettings, pickCells], (offset, axisViewBox, xAxis, yAxis, xAxisTicks, yAxisTicks, pos, layout, _ref2, bandSize, stackedData, barSettings, cells) => {
    var chartData = _ref2.chartData, dataStartIndex = _ref2.dataStartIndex, dataEndIndex = _ref2.dataEndIndex;
    if (barSettings == null || pos == null || axisViewBox == null || layout !== "horizontal" && layout !== "vertical" || xAxis == null || yAxis == null || xAxisTicks == null || yAxisTicks == null || bandSize == null) {
      return void 0;
    }
    var data2 = barSettings.data;
    var displayedData;
    if (data2 != null && data2.length > 0) {
      displayedData = data2;
    } else {
      displayedData = chartData === null || chartData === void 0 ? void 0 : chartData.slice(dataStartIndex, dataEndIndex + 1);
    }
    if (displayedData == null) {
      return void 0;
    }
    return computeBarRectangles({
      layout,
      barSettings,
      pos,
      parentViewBox: axisViewBox,
      bandSize,
      xAxis,
      yAxis,
      xAxisTicks,
      yAxisTicks,
      stackedData,
      displayedData,
      offset,
      cells,
      dataStartIndex
    });
  });

  // node_modules/recharts/es6/cartesian/BarStack.js
  init_define_import_meta_env();
  var React20 = __toESM(require_react_shim());
  var import_react34 = __toESM(require_react_shim());
  var _excluded12 = ["index"];
  function _extends9() {
    return _extends9 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends9.apply(null, arguments);
  }
  function _objectWithoutProperties12(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose12(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose12(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var BarStackContext = /* @__PURE__ */ (0, import_react34.createContext)(void 0);
  var useStackId = (childStackId) => {
    var stackSettings = (0, import_react34.useContext)(BarStackContext);
    if (stackSettings != null) {
      return stackSettings.stackId;
    }
    if (childStackId == null) {
      return void 0;
    }
    return getNormalizedStackId(childStackId);
  };
  var getClipPathId = (stackId, index) => {
    return "recharts-bar-stack-clip-path-".concat(stackId, "-").concat(index);
  };
  var useBarStackClipPathUrl = (index) => {
    var barStackContext = (0, import_react34.useContext)(BarStackContext);
    if (barStackContext == null) {
      return void 0;
    }
    var stackId = barStackContext.stackId;
    return "url(#".concat(getClipPathId(stackId, index), ")");
  };
  var BarStackClipLayer = (_ref2) => {
    var index = _ref2.index, rest = _objectWithoutProperties12(_ref2, _excluded12);
    var clipPathUrl = useBarStackClipPathUrl(index);
    return /* @__PURE__ */ React20.createElement(Layer, _extends9({
      className: "recharts-bar-stack-layer",
      clipPath: clipPathUrl
    }, rest));
  };

  // node_modules/recharts/es6/cartesian/Bar.js
  var _excluded13 = ["onMouseEnter", "onMouseLeave", "onClick"];
  var _excluded27 = ["value", "background", "tooltipPosition"];
  var _excluded33 = ["id"];
  var _excluded43 = ["onMouseEnter", "onClick", "onMouseLeave"];
  function _slicedToArray15(r2, e) {
    return _arrayWithHoles15(r2) || _iterableToArrayLimit15(r2, e) || _unsupportedIterableToArray15(r2, e) || _nonIterableRest15();
  }
  function _nonIterableRest15() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray15(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray15(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray15(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray15(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit15(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles15(r2) {
    if (Array.isArray(r2)) return r2;
  }
  function _extends10() {
    return _extends10 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends10.apply(null, arguments);
  }
  function ownKeys22(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread22(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys22(Object(t), true).forEach(function(r3) {
        _defineProperty25(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys22(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty25(e, r2, t) {
    return (r2 = _toPropertyKey25(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey25(t) {
    var i = _toPrimitive25(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive25(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function _objectWithoutProperties13(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose13(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose13(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var computeLegendPayloadFromBarData = (props) => {
    var dataKey = props.dataKey, name = props.name, fill = props.fill, legendType = props.legendType, hide = props.hide;
    return [{
      inactive: hide,
      dataKey,
      type: legendType,
      color: fill,
      value: getTooltipNameProp(name, dataKey),
      payload: props
    }];
  };
  var SetBarTooltipEntrySettings = /* @__PURE__ */ React21.memo((_ref2) => {
    var dataKey = _ref2.dataKey, stroke = _ref2.stroke, strokeWidth = _ref2.strokeWidth, fill = _ref2.fill, name = _ref2.name, hide = _ref2.hide, unit2 = _ref2.unit, formatter = _ref2.formatter, tooltipType = _ref2.tooltipType, id = _ref2.id;
    var tooltipEntrySettings = {
      dataDefinedOnItem: void 0,
      getPosition: noop,
      settings: {
        stroke,
        strokeWidth,
        fill,
        dataKey,
        nameKey: void 0,
        name: getTooltipNameProp(name, dataKey),
        hide,
        type: tooltipType,
        color: fill,
        unit: unit2,
        formatter,
        graphicalItemId: id
      }
    };
    return /* @__PURE__ */ React21.createElement(SetTooltipEntrySettings, {
      tooltipEntrySettings
    });
  });
  function BarBackground(props) {
    var activeIndex = useAppSelector(selectActiveTooltipIndex);
    var data2 = props.data, dataKey = props.dataKey, backgroundFromProps = props.background, allOtherBarProps = props.allOtherBarProps;
    var onMouseEnterFromProps = allOtherBarProps.onMouseEnter, onMouseLeaveFromProps = allOtherBarProps.onMouseLeave, onItemClickFromProps = allOtherBarProps.onClick, restOfAllOtherProps = _objectWithoutProperties13(allOtherBarProps, _excluded13);
    var onMouseEnterFromContext = useMouseEnterItemDispatch(onMouseEnterFromProps, dataKey, allOtherBarProps.id);
    var onMouseLeaveFromContext = useMouseLeaveItemDispatch(onMouseLeaveFromProps);
    var onClickFromContext = useMouseClickItemDispatch(onItemClickFromProps, dataKey, allOtherBarProps.id);
    if (!backgroundFromProps || data2 == null) {
      return null;
    }
    var backgroundProps = svgPropertiesNoEventsFromUnknown(backgroundFromProps);
    return /* @__PURE__ */ React21.createElement(ZIndexLayer, {
      zIndex: getZIndexFromUnknown(backgroundFromProps, DefaultZIndexes.barBackground)
    }, data2.map((entry, i) => {
      var value = entry.value, backgroundFromDataEntry = entry.background, tooltipPosition = entry.tooltipPosition, rest = _objectWithoutProperties13(entry, _excluded27);
      if (!backgroundFromDataEntry) {
        return null;
      }
      var onMouseEnter = onMouseEnterFromContext(entry, entry.originalDataIndex);
      var onMouseLeave = onMouseLeaveFromContext(entry, entry.originalDataIndex);
      var onClick = onClickFromContext(entry, entry.originalDataIndex);
      var barRectangleProps = _objectSpread22(_objectSpread22(_objectSpread22(_objectSpread22(_objectSpread22({
        option: backgroundFromProps,
        isActive: String(entry.originalDataIndex) === activeIndex
      }, rest), {}, {
        // @ts-expect-error backgroundProps is contributing unknown props
        fill: "#eee"
      }, backgroundFromDataEntry), backgroundProps), adaptEventsOfChild(restOfAllOtherProps, entry, i)), {}, {
        onMouseEnter,
        onMouseLeave,
        onClick,
        dataKey,
        index: i,
        className: "recharts-bar-background-rectangle"
      });
      return /* @__PURE__ */ React21.createElement(BarRectangle, _extends10({
        key: "background-bar-".concat(i)
      }, barRectangleProps));
    }));
  }
  function BarLabelListProvider(_ref2) {
    var showLabels = _ref2.showLabels, children = _ref2.children, rects = _ref2.rects;
    var labelListEntries = rects === null || rects === void 0 ? void 0 : rects.map((entry) => {
      var viewBox = {
        x: entry.x,
        y: entry.y,
        width: entry.width,
        lowerWidth: entry.width,
        upperWidth: entry.width,
        height: entry.height
      };
      return _objectSpread22(_objectSpread22({}, viewBox), {}, {
        value: entry.value,
        payload: entry.payload,
        parentViewBox: entry.parentViewBox,
        viewBox,
        fill: entry.fill
      });
    });
    return /* @__PURE__ */ React21.createElement(CartesianLabelListContextProvider, {
      value: showLabels ? labelListEntries : void 0
    }, children);
  }
  function BarRectangleWithActiveState(props) {
    var shape = props.shape, activeBar = props.activeBar, baseProps = props.baseProps, entry = props.entry, index = props.index, dataKey = props.dataKey;
    var activeIndex = useAppSelector(selectActiveTooltipIndex);
    var activeDataKey = useAppSelector(selectActiveTooltipDataKey);
    var isActive = activeBar && String(entry.originalDataIndex) === activeIndex && (activeDataKey == null || dataKey === activeDataKey);
    var _useState = (0, import_react35.useState)(false), _useState2 = _slicedToArray15(_useState, 2), stayInLayer = _useState2[0], setStayInLayer = _useState2[1];
    var _useState3 = (0, import_react35.useState)(false), _useState4 = _slicedToArray15(_useState3, 2), hasMountedActive = _useState4[0], setHasMountedActive = _useState4[1];
    (0, import_react35.useEffect)(() => {
      var rafId4;
      if (isActive) {
        setStayInLayer(true);
        rafId4 = requestAnimationFrame(() => {
          setHasMountedActive(true);
        });
      } else {
        setHasMountedActive(false);
      }
      return () => {
        cancelAnimationFrame(rafId4);
      };
    }, [isActive]);
    var handleTransitionEnd = (0, import_react35.useCallback)(() => {
      if (!isActive) {
        setStayInLayer(false);
      }
    }, [isActive]);
    var isVisuallyActive = isActive && hasMountedActive;
    var shouldRenderInLayer = isActive || stayInLayer;
    var option;
    if (isActive) {
      if (activeBar === true) {
        option = shape;
      } else {
        option = activeBar;
      }
    } else {
      option = shape;
    }
    var content = /* @__PURE__ */ React21.createElement(BarRectangle, _extends10({}, baseProps, {
      name: String(baseProps.name)
    }, entry, {
      isActive: isVisuallyActive,
      option,
      index,
      dataKey,
      animationElapsedTime: props.animationElapsedTime,
      isAnimating: props.isAnimating,
      isEntrance: props.isEntrance,
      onTransitionEnd: handleTransitionEnd
    }));
    if (shouldRenderInLayer) {
      return /* @__PURE__ */ React21.createElement(ZIndexLayer, {
        zIndex: DefaultZIndexes.activeBar
      }, /* @__PURE__ */ React21.createElement(BarStackClipLayer, {
        index: entry.originalDataIndex
      }, content));
    }
    return content;
  }
  function BarRectangleNeverActive(props) {
    var shape = props.shape, baseProps = props.baseProps, entry = props.entry, index = props.index, dataKey = props.dataKey;
    return /* @__PURE__ */ React21.createElement(BarRectangle, _extends10({}, baseProps, {
      name: String(baseProps.name)
    }, entry, {
      isActive: false,
      option: shape,
      index,
      dataKey,
      animationElapsedTime: props.animationElapsedTime,
      isAnimating: props.isAnimating,
      isEntrance: props.isEntrance
    }));
  }
  function BarRectangles(_ref3) {
    var _svgPropertiesNoEvent;
    var data2 = _ref3.data, props = _ref3.props, animationElapsedTime = _ref3.animationElapsedTime, isAnimating = _ref3.isAnimating, isEntrance = _ref3.isEntrance;
    var _ref4 = (_svgPropertiesNoEvent = svgPropertiesNoEvents(props)) !== null && _svgPropertiesNoEvent !== void 0 ? _svgPropertiesNoEvent : {}, id = _ref4.id, baseProps = _objectWithoutProperties13(_ref4, _excluded33);
    var shape = props.shape, dataKey = props.dataKey, activeBar = props.activeBar;
    var onMouseEnterFromProps = props.onMouseEnter, onItemClickFromProps = props.onClick, onMouseLeaveFromProps = props.onMouseLeave, restOfAllOtherProps = _objectWithoutProperties13(props, _excluded43);
    var onMouseEnterFromContext = useMouseEnterItemDispatch(onMouseEnterFromProps, dataKey, id);
    var onMouseLeaveFromContext = useMouseLeaveItemDispatch(onMouseLeaveFromProps);
    var onClickFromContext = useMouseClickItemDispatch(onItemClickFromProps, dataKey, id);
    if (!data2) {
      return null;
    }
    return /* @__PURE__ */ React21.createElement(React21.Fragment, null, data2.map((entry, i) => {
      return /* @__PURE__ */ React21.createElement(BarStackClipLayer, _extends10({
        index: entry.originalDataIndex,
        key: "rectangle-".concat(entry === null || entry === void 0 ? void 0 : entry.x, "-").concat(entry === null || entry === void 0 ? void 0 : entry.y, "-").concat(entry === null || entry === void 0 ? void 0 : entry.value, "-").concat(i),
        className: "recharts-bar-rectangle"
      }, adaptEventsOfChild(restOfAllOtherProps, entry, i), {
        onMouseEnter: onMouseEnterFromContext(entry, entry.originalDataIndex),
        onMouseLeave: onMouseLeaveFromContext(entry, entry.originalDataIndex),
        onClick: onClickFromContext(entry, entry.originalDataIndex)
      }), activeBar ? /* @__PURE__ */ React21.createElement(BarRectangleWithActiveState, {
        shape,
        activeBar,
        baseProps,
        entry,
        index: i,
        dataKey,
        animationElapsedTime,
        isAnimating,
        isEntrance
      }) : (
        /*
         * If the `activeBar` prop is falsy, then let's call the variant without hooks.
         * Using the `selectActiveTooltipIndex` selector is usually fast
         * but in charts with large-ish amount of data even the few nanoseconds add up to a noticeable jank.
         * If the activeBar is false then we don't need to know which index is active - because we won't use it anyway.
         * So let's just skip the hooks altogether. That way, React can skip rendering the component,
         * and can skip the tree reconciliation for its children too.
         * Because we can't call hooks conditionally, we need to have a separate component for that.
         */
        /* @__PURE__ */ React21.createElement(BarRectangleNeverActive, {
          shape,
          baseProps,
          entry,
          index: i,
          dataKey,
          animationElapsedTime,
          isAnimating,
          isEntrance
        })
      ));
    }));
  }
  var defaultBarAnimateItems = (items, animationElapsedTime, layout) => {
    if (items == null) return [];
    if (animationElapsedTime === 1) {
      return items.flatMap((item) => item.status === "removed" ? [] : [item.next]);
    }
    return items.flatMap((item) => {
      if (item.status === "removed") {
        if (layout === "horizontal") {
          return [_objectSpread22(_objectSpread22({}, item.prev), {}, {
            height: interpolate(item.prev.height, 0, animationElapsedTime),
            y: interpolate(item.prev.y, item.prev.y + item.prev.height, animationElapsedTime)
          })];
        }
        return [_objectSpread22(_objectSpread22({}, item.prev), {}, {
          width: interpolate(item.prev.width, 0, animationElapsedTime)
        })];
      }
      if (item.status === "matched") {
        return [_objectSpread22(_objectSpread22({}, item.next), {}, {
          x: interpolate(item.prev.x, item.next.x, animationElapsedTime),
          y: interpolate(item.prev.y, item.next.y, animationElapsedTime),
          width: interpolate(item.prev.width, item.next.width, animationElapsedTime),
          height: interpolate(item.prev.height, item.next.height, animationElapsedTime)
        })];
      }
      var next = item.next;
      if (layout === "horizontal") {
        return [_objectSpread22(_objectSpread22({}, next), {}, {
          height: interpolate(0, next.height, animationElapsedTime),
          y: interpolate(next.stackedBarStart, next.y, animationElapsedTime)
        })];
      }
      return [_objectSpread22(_objectSpread22({}, next), {}, {
        width: interpolate(0, next.width, animationElapsedTime),
        x: interpolate(next.stackedBarStart, next.x, animationElapsedTime)
      })];
    });
  };
  function RectanglesWithAnimation(_ref5) {
    var props = _ref5.props, previousRectanglesRef = _ref5.previousRectanglesRef;
    var data2 = props.data, isAnimationActive = props.isAnimationActive, animationBegin = props.animationBegin, animationDuration = props.animationDuration, animationEasing = props.animationEasing, animationInterpolateFn = props.animationInterpolateFn, layout = props.layout;
    var _useAnimationCallback = useAnimationCallbacks(props.onAnimationStart, props.onAnimationEnd), isAnimating = _useAnimationCallback.isAnimating, handleAnimationStart = _useAnimationCallback.handleAnimationStart, handleAnimationEnd = _useAnimationCallback.handleAnimationEnd;
    return /* @__PURE__ */ React21.createElement(BarLabelListProvider, {
      showLabels: !isAnimating,
      rects: data2
    }, /* @__PURE__ */ React21.createElement(AnimatedItems, {
      animationInput: data2,
      animationIdPrefix: "recharts-bar-",
      items: data2,
      previousItemsRef: previousRectanglesRef,
      isAnimationActive,
      animationBegin,
      animationDuration,
      animationEasing,
      onAnimationStart: handleAnimationStart,
      onAnimationEnd: handleAnimationEnd,
      animationInterpolateFn,
      animationMatchBy: props.animationMatchBy,
      layout
    }, (stepData, animationElapsedTime, isEntrance) => /* @__PURE__ */ React21.createElement(Layer, null, /* @__PURE__ */ React21.createElement(BarRectangles, {
      props,
      data: stepData,
      animationElapsedTime,
      isAnimating: isAnimating || animationElapsedTime < 1,
      isEntrance
    }))), /* @__PURE__ */ React21.createElement(LabelListFromLabelProp, {
      label: props.label
    }), props.children);
  }
  function RenderRectangles(props) {
    var previousRectanglesRef = (0, import_react35.useRef)(null);
    return /* @__PURE__ */ React21.createElement(RectanglesWithAnimation, {
      previousRectanglesRef,
      props
    });
  }
  var defaultMinPointSize = 0;
  var errorBarDataPointFormatter = (dataPoint, dataKey) => {
    var value = Array.isArray(dataPoint.value) ? dataPoint.value[1] : dataPoint.value;
    return {
      x: dataPoint.x,
      y: dataPoint.y,
      value,
      // getValueByDataKey does not validate the output type
      errorVal: getValueByDataKey(dataPoint, dataKey)
    };
  };
  var BarWithState = class extends import_react35.PureComponent {
    render() {
      var _this$props = this.props, hide = _this$props.hide, data2 = _this$props.data, dataKey = _this$props.dataKey, className = _this$props.className, xAxisId = _this$props.xAxisId, yAxisId = _this$props.yAxisId, needClip = _this$props.needClip, background = _this$props.background, id = _this$props.id;
      if (hide || data2 == null) {
        return null;
      }
      var layerClass = clsx("recharts-bar", className);
      var clipPathId = id;
      return /* @__PURE__ */ React21.createElement(Layer, {
        className: layerClass,
        id
      }, needClip && /* @__PURE__ */ React21.createElement("defs", null, /* @__PURE__ */ React21.createElement(GraphicalItemClipPath, {
        clipPathId,
        xAxisId,
        yAxisId
      })), /* @__PURE__ */ React21.createElement(Layer, {
        className: "recharts-bar-rectangles",
        clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : void 0
      }, /* @__PURE__ */ React21.createElement(BarBackground, {
        data: data2,
        dataKey,
        background,
        allOtherBarProps: this.props
      }), /* @__PURE__ */ React21.createElement(RenderRectangles, this.props)));
    }
  };
  var defaultBarProps = {
    activeBar: false,
    animationBegin: 0,
    animationDuration: 400,
    animationEasing: "ease",
    animationInterpolateFn: defaultBarAnimateItems,
    animationMatchBy: matchAppend,
    background: false,
    hide: false,
    isAnimationActive: "auto",
    label: false,
    legendType: "rect",
    minPointSize: defaultMinPointSize,
    shape: defaultBarShape,
    xAxisId: 0,
    yAxisId: 0,
    zIndex: DefaultZIndexes.bar
  };
  function BarImpl(props) {
    var xAxisId = props.xAxisId, yAxisId = props.yAxisId, hide = props.hide, legendType = props.legendType, minPointSize = props.minPointSize, activeBar = props.activeBar, animationBegin = props.animationBegin, animationDuration = props.animationDuration, animationEasing = props.animationEasing, isAnimationActive = props.isAnimationActive;
    var _useNeedsClip = useNeedsClip(xAxisId, yAxisId), needClip = _useNeedsClip.needClip;
    var layout = useChartLayout();
    var isPanorama = useIsPanorama();
    var cells = findAllByType(props.children, Cell);
    var rects = useAppSelector((state) => selectBarRectangles(state, props.id, isPanorama, cells));
    if (layout !== "vertical" && layout !== "horizontal") {
      return null;
    }
    var errorBarOffset;
    var firstDataPoint = rects === null || rects === void 0 ? void 0 : rects[0];
    if (firstDataPoint == null || firstDataPoint.height == null || firstDataPoint.width == null) {
      errorBarOffset = 0;
    } else {
      errorBarOffset = layout === "vertical" ? firstDataPoint.height / 2 : firstDataPoint.width / 2;
    }
    return /* @__PURE__ */ React21.createElement(SetErrorBarContext, {
      xAxisId,
      yAxisId,
      data: rects,
      dataPointFormatter: errorBarDataPointFormatter,
      errorBarOffset
    }, /* @__PURE__ */ React21.createElement(BarWithState, _extends10({}, props, {
      layout,
      needClip,
      data: rects,
      xAxisId,
      yAxisId,
      hide,
      legendType,
      minPointSize,
      activeBar,
      animationBegin,
      animationDuration,
      animationEasing,
      isAnimationActive
    })));
  }
  function computeBarRectangles(_ref6) {
    var layout = _ref6.layout, _ref6$barSettings = _ref6.barSettings, dataKey = _ref6$barSettings.dataKey, minPointSizeProp = _ref6$barSettings.minPointSize, hasCustomShape = _ref6$barSettings.hasCustomShape, pos = _ref6.pos, bandSize = _ref6.bandSize, xAxis = _ref6.xAxis, yAxis = _ref6.yAxis, xAxisTicks = _ref6.xAxisTicks, yAxisTicks = _ref6.yAxisTicks, stackedData = _ref6.stackedData, displayedData = _ref6.displayedData, offset = _ref6.offset, cells = _ref6.cells, parentViewBox = _ref6.parentViewBox, dataStartIndex = _ref6.dataStartIndex;
    var numericAxis = layout === "horizontal" ? yAxis : xAxis;
    var stackedDomain = stackedData ? numericAxis.scale.domain() : null;
    var baseValue = getBaseValueOfBar({
      numericAxis
    });
    var stackedBarStart = numericAxis.scale.map(baseValue);
    return displayedData.map((entry, index) => {
      var value, x, y, width, height, background;
      if (stackedData) {
        var untruncatedValue = stackedData[index + dataStartIndex];
        if (untruncatedValue == null) {
          return null;
        }
        value = truncateByDomain(untruncatedValue, stackedDomain);
      } else {
        value = getValueByDataKey(entry, dataKey);
        if (!Array.isArray(value)) {
          value = [baseValue, value];
        }
      }
      var minPointSize = minPointSizeCallback(minPointSizeProp, defaultMinPointSize)(value[1], index);
      if (layout === "horizontal") {
        var _ref7;
        var baseValueScale = yAxis.scale.map(value[0]);
        var currentValueScale = yAxis.scale.map(value[1]);
        if (baseValueScale == null || currentValueScale == null) {
          return null;
        }
        x = getCateCoordinateOfBar({
          axis: xAxis,
          ticks: xAxisTicks,
          bandSize,
          offset: pos.offset,
          entry,
          index
        });
        y = (_ref7 = currentValueScale !== null && currentValueScale !== void 0 ? currentValueScale : baseValueScale) !== null && _ref7 !== void 0 ? _ref7 : void 0;
        width = pos.size;
        var computedHeight = baseValueScale - currentValueScale;
        height = isNan(computedHeight) ? 0 : computedHeight;
        background = {
          x,
          y: offset.top,
          width,
          height: offset.height
        };
        if (Math.abs(minPointSize) > 0 && Math.abs(height) < Math.abs(minPointSize)) {
          var delta = mathSign(height || minPointSize) * (Math.abs(minPointSize) - Math.abs(height));
          y -= delta;
          height += delta;
        }
      } else {
        var _baseValueScale = xAxis.scale.map(value[0]);
        var _currentValueScale = xAxis.scale.map(value[1]);
        if (_baseValueScale == null || _currentValueScale == null) {
          return null;
        }
        x = _baseValueScale;
        y = getCateCoordinateOfBar({
          axis: yAxis,
          ticks: yAxisTicks,
          bandSize,
          offset: pos.offset,
          entry,
          index
        });
        width = _currentValueScale - _baseValueScale;
        height = pos.size;
        background = {
          x: offset.left,
          y,
          width: offset.width,
          height
        };
        if (Math.abs(minPointSize) > 0 && Math.abs(width) < Math.abs(minPointSize)) {
          var _delta = mathSign(width || minPointSize) * (Math.abs(minPointSize) - Math.abs(width));
          width += _delta;
        }
      }
      if (x == null || y == null || width == null || height == null || !hasCustomShape && (width === 0 || height === 0)) {
        return null;
      }
      var barRectangleItem = _objectSpread22(_objectSpread22({}, entry), {}, {
        stackedBarStart,
        x,
        y,
        width,
        height,
        value: stackedData ? value : value[1],
        payload: entry,
        background,
        tooltipPosition: {
          x: x + width / 2,
          y: y + height / 2
        },
        parentViewBox,
        originalDataIndex: index
      }, cells && cells[index] && cells[index].props);
      return barRectangleItem;
    }).filter(Boolean);
  }
  function BarFn(outsideProps) {
    var props = resolveDefaultProps(outsideProps, defaultBarProps);
    var stackId = useStackId(props.stackId);
    var isPanorama = useIsPanorama();
    return /* @__PURE__ */ React21.createElement(RegisterGraphicalItemId, {
      id: props.id,
      type: "bar"
    }, (id) => /* @__PURE__ */ React21.createElement(React21.Fragment, null, /* @__PURE__ */ React21.createElement(SetLegendPayload, {
      legendPayload: computeLegendPayloadFromBarData(props)
    }), /* @__PURE__ */ React21.createElement(SetBarTooltipEntrySettings, {
      dataKey: props.dataKey,
      stroke: props.stroke,
      strokeWidth: props.strokeWidth,
      fill: props.fill,
      name: props.name,
      hide: props.hide,
      unit: props.unit,
      formatter: props.formatter,
      tooltipType: props.tooltipType,
      id
    }), /* @__PURE__ */ React21.createElement(SetCartesianGraphicalItem, {
      type: "bar",
      id,
      data: void 0,
      xAxisId: props.xAxisId,
      yAxisId: props.yAxisId,
      zAxisId: 0,
      dataKey: props.dataKey,
      stackId,
      hide: props.hide,
      barSize: props.barSize,
      minPointSize: props.minPointSize,
      maxBarSize: props.maxBarSize,
      isPanorama,
      hasCustomShape: props.shape != null && props.shape !== defaultBarShape
    }), /* @__PURE__ */ React21.createElement(ZIndexLayer, {
      zIndex: props.zIndex
    }, /* @__PURE__ */ React21.createElement(BarImpl, _extends10({}, props, {
      id
    })))));
  }
  var Bar = /* @__PURE__ */ React21.memo(BarFn, propsAreEqual);
  Bar.displayName = "Bar";

  // node_modules/recharts/es6/cartesian/XAxis.js
  init_define_import_meta_env();
  var React22 = __toESM(require_react_shim());
  var import_react36 = __toESM(require_react_shim());

  // node_modules/recharts/es6/util/axisPropsAreEqual.js
  init_define_import_meta_env();
  var _excluded14 = ["domain", "range"];
  var _excluded28 = ["domain", "range"];
  function _objectWithoutProperties14(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose14(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose14(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function shortArraysAreEqual(arr1, arr2) {
    if (arr1 === arr2) {
      return true;
    }
    if (Array.isArray(arr1) && arr1.length === 2 && Array.isArray(arr2) && arr2.length === 2) {
      return arr1[0] === arr2[0] && arr1[1] === arr2[1];
    }
    return false;
  }
  function axisPropsAreEqual(prevProps, nextProps) {
    if (prevProps === nextProps) {
      return true;
    }
    var prevDomain = prevProps.domain, prevRange = prevProps.range, prevRest = _objectWithoutProperties14(prevProps, _excluded14);
    var nextDomain = nextProps.domain, nextRange = nextProps.range, nextRest = _objectWithoutProperties14(nextProps, _excluded28);
    if (!shortArraysAreEqual(prevDomain, nextDomain)) {
      return false;
    }
    if (!shortArraysAreEqual(prevRange, nextRange)) {
      return false;
    }
    return propsAreEqual(prevRest, nextRest);
  }

  // node_modules/recharts/es6/cartesian/XAxis.js
  var _excluded15 = ["type"];
  var _excluded29 = ["dangerouslySetInnerHTML", "ticks", "scale"];
  var _excluded34 = ["id", "scale"];
  function _extends11() {
    return _extends11 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends11.apply(null, arguments);
  }
  function ownKeys23(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread23(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys23(Object(t), true).forEach(function(r3) {
        _defineProperty26(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys23(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty26(e, r2, t) {
    return (r2 = _toPropertyKey26(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey26(t) {
    var i = _toPrimitive26(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive26(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function _objectWithoutProperties15(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose15(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose15(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function SetXAxisSettings(props) {
    var dispatch = useAppDispatch();
    var prevSettingsRef = (0, import_react36.useRef)(null);
    var layout = useCartesianChartLayout();
    var typeFromProps = props.type, restProps = _objectWithoutProperties15(props, _excluded15);
    var evaluatedType = getAxisTypeBasedOnLayout(layout, "xAxis", typeFromProps);
    var settings = (0, import_react36.useMemo)(() => {
      if (evaluatedType == null) {
        return void 0;
      }
      return _objectSpread23(_objectSpread23({}, restProps), {}, {
        type: evaluatedType
      });
    }, [restProps, evaluatedType]);
    (0, import_react36.useLayoutEffect)(() => {
      if (settings == null) {
        return;
      }
      if (prevSettingsRef.current === null) {
        dispatch(addXAxis(settings));
      } else if (prevSettingsRef.current !== settings) {
        dispatch(replaceXAxis({
          prev: prevSettingsRef.current,
          next: settings
        }));
      }
      prevSettingsRef.current = settings;
    }, [settings, dispatch]);
    (0, import_react36.useLayoutEffect)(() => {
      return () => {
        if (prevSettingsRef.current) {
          dispatch(removeXAxis(prevSettingsRef.current));
          prevSettingsRef.current = null;
        }
      };
    }, [dispatch]);
    return null;
  }
  var XAxisImpl = (props) => {
    var xAxisId = props.xAxisId, className = props.className;
    var viewBox = useAppSelector(selectAxisViewBox);
    var isPanorama = useIsPanorama();
    var axisType = "xAxis";
    var cartesianTickItems = useAppSelector((state) => selectTicksOfAxis(state, axisType, xAxisId, isPanorama));
    var axisSize = useAppSelector((state) => selectXAxisSize(state, xAxisId));
    var position = useAppSelector((state) => selectXAxisPosition(state, xAxisId));
    var synchronizedSettings = useAppSelector((state) => selectXAxisSettingsNoDefaults(state, xAxisId));
    if (axisSize == null || position == null || synchronizedSettings == null) {
      return null;
    }
    var dangerouslySetInnerHTML = props.dangerouslySetInnerHTML, ticks2 = props.ticks, del = props.scale, allOtherProps = _objectWithoutProperties15(props, _excluded29);
    var id = synchronizedSettings.id, del2 = synchronizedSettings.scale, restSynchronizedSettings = _objectWithoutProperties15(synchronizedSettings, _excluded34);
    return /* @__PURE__ */ React22.createElement(CartesianAxis, _extends11({}, allOtherProps, restSynchronizedSettings, {
      x: position.x,
      y: position.y,
      width: axisSize.width,
      height: axisSize.height,
      className: clsx("recharts-".concat(axisType, " ").concat(axisType), className),
      viewBox,
      ticks: cartesianTickItems,
      axisType,
      axisId: xAxisId
    }));
  };
  var xAxisDefaultProps = {
    allowDataOverflow: implicitXAxis.allowDataOverflow,
    allowDecimals: implicitXAxis.allowDecimals,
    allowDuplicatedCategory: implicitXAxis.allowDuplicatedCategory,
    angle: implicitXAxis.angle,
    axisLine: defaultCartesianAxisProps.axisLine,
    height: implicitXAxis.height,
    hide: false,
    includeHidden: implicitXAxis.includeHidden,
    interval: implicitXAxis.interval,
    label: false,
    minTickGap: implicitXAxis.minTickGap,
    mirror: implicitXAxis.mirror,
    orientation: implicitXAxis.orientation,
    padding: implicitXAxis.padding,
    reversed: implicitXAxis.reversed,
    scale: implicitXAxis.scale,
    tick: implicitXAxis.tick,
    tickCount: implicitXAxis.tickCount,
    tickLine: defaultCartesianAxisProps.tickLine,
    tickSize: defaultCartesianAxisProps.tickSize,
    type: implicitXAxis.type,
    niceTicks: implicitXAxis.niceTicks,
    xAxisId: 0
  };
  var XAxisSettingsDispatcher = (outsideProps) => {
    var props = resolveDefaultProps(outsideProps, xAxisDefaultProps);
    return /* @__PURE__ */ React22.createElement(React22.Fragment, null, /* @__PURE__ */ React22.createElement(SetXAxisSettings, {
      allowDataOverflow: props.allowDataOverflow,
      allowDecimals: props.allowDecimals,
      allowDuplicatedCategory: props.allowDuplicatedCategory,
      angle: props.angle,
      dataKey: props.dataKey,
      domain: props.domain,
      height: props.height,
      hide: props.hide,
      id: props.xAxisId,
      includeHidden: props.includeHidden,
      interval: props.interval,
      minTickGap: props.minTickGap,
      mirror: props.mirror,
      name: props.name,
      orientation: props.orientation,
      padding: props.padding,
      reversed: props.reversed,
      scale: props.scale,
      tick: props.tick,
      tickCount: props.tickCount,
      tickFormatter: props.tickFormatter,
      ticks: props.ticks,
      type: props.type,
      unit: props.unit,
      niceTicks: props.niceTicks
    }), /* @__PURE__ */ React22.createElement(XAxisImpl, props));
  };
  var XAxis = /* @__PURE__ */ React22.memo(XAxisSettingsDispatcher, axisPropsAreEqual);
  XAxis.displayName = "XAxis";

  // node_modules/recharts/es6/cartesian/YAxis.js
  init_define_import_meta_env();
  var React23 = __toESM(require_react_shim());
  var import_react37 = __toESM(require_react_shim());
  var _excluded16 = ["type"];
  var _excluded210 = ["dangerouslySetInnerHTML", "ticks", "scale"];
  var _excluded35 = ["id", "scale"];
  function _extends12() {
    return _extends12 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends12.apply(null, arguments);
  }
  function ownKeys24(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread24(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys24(Object(t), true).forEach(function(r3) {
        _defineProperty27(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys24(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty27(e, r2, t) {
    return (r2 = _toPropertyKey27(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey27(t) {
    var i = _toPrimitive27(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive27(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function _objectWithoutProperties16(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose16(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose16(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function SetYAxisSettings(props) {
    var dispatch = useAppDispatch();
    var prevSettingsRef = (0, import_react37.useRef)(null);
    var layout = useCartesianChartLayout();
    var typeFromProps = props.type, restProps = _objectWithoutProperties16(props, _excluded16);
    var evaluatedType = getAxisTypeBasedOnLayout(layout, "yAxis", typeFromProps);
    var settings = (0, import_react37.useMemo)(() => {
      if (evaluatedType == null) {
        return void 0;
      }
      return _objectSpread24(_objectSpread24({}, restProps), {}, {
        type: evaluatedType
      });
    }, [evaluatedType, restProps]);
    (0, import_react37.useLayoutEffect)(() => {
      if (settings == null) {
        return;
      }
      if (prevSettingsRef.current === null) {
        dispatch(addYAxis(settings));
      } else if (prevSettingsRef.current !== settings) {
        dispatch(replaceYAxis({
          prev: prevSettingsRef.current,
          next: settings
        }));
      }
      prevSettingsRef.current = settings;
    }, [settings, dispatch]);
    (0, import_react37.useLayoutEffect)(() => {
      return () => {
        if (prevSettingsRef.current) {
          dispatch(removeYAxis(prevSettingsRef.current));
          prevSettingsRef.current = null;
        }
      };
    }, [dispatch]);
    return null;
  }
  function YAxisImpl(props) {
    var yAxisId = props.yAxisId, className = props.className, width = props.width, label = props.label;
    var cartesianAxisRef = (0, import_react37.useRef)(null);
    var labelRef = (0, import_react37.useRef)(null);
    var viewBox = useAppSelector(selectAxisViewBox);
    var isPanorama = useIsPanorama();
    var dispatch = useAppDispatch();
    var axisType = "yAxis";
    var axisSize = useAppSelector((state) => selectYAxisSize(state, yAxisId));
    var position = useAppSelector((state) => selectYAxisPosition(state, yAxisId));
    var cartesianTickItems = useAppSelector((state) => selectTicksOfAxis(state, axisType, yAxisId, isPanorama));
    var synchronizedSettings = useAppSelector((state) => selectYAxisSettingsNoDefaults(state, yAxisId));
    (0, import_react37.useLayoutEffect)(() => {
      if (width !== "auto" || !axisSize || isLabelContentAFunction(label) || /* @__PURE__ */ (0, import_react37.isValidElement)(label) || synchronizedSettings == null) {
        return;
      }
      var axisComponent = cartesianAxisRef.current;
      if (!axisComponent) {
        return;
      }
      var updatedYAxisWidth = axisComponent.getCalculatedWidth();
      if (Math.round(axisSize.width) !== Math.round(updatedYAxisWidth)) {
        dispatch(updateYAxisWidth({
          id: yAxisId,
          width: updatedYAxisWidth
        }));
      }
    }, [
      // The dependency on cartesianAxisRef.current is not needed because useLayoutEffect will run after every render.
      // The ref will be populated by then.
      // To re-run this effect when ticks change, we can depend on the ticks array from the store.
      cartesianTickItems,
      axisSize,
      dispatch,
      label,
      yAxisId,
      width,
      synchronizedSettings
    ]);
    if (axisSize == null || position == null || synchronizedSettings == null) {
      return null;
    }
    var dangerouslySetInnerHTML = props.dangerouslySetInnerHTML, ticks2 = props.ticks, del = props.scale, allOtherProps = _objectWithoutProperties16(props, _excluded210);
    var id = synchronizedSettings.id, del2 = synchronizedSettings.scale, restSynchronizedSettings = _objectWithoutProperties16(synchronizedSettings, _excluded35);
    return /* @__PURE__ */ React23.createElement(CartesianAxis, _extends12({}, allOtherProps, restSynchronizedSettings, {
      ref: cartesianAxisRef,
      labelRef,
      x: position.x,
      y: position.y,
      tickTextProps: width === "auto" ? {
        width: void 0
      } : {
        width
      },
      width: axisSize.width,
      height: axisSize.height,
      className: clsx("recharts-".concat(axisType, " ").concat(axisType), className),
      viewBox,
      ticks: cartesianTickItems,
      axisType,
      axisId: yAxisId
    }));
  }
  var yAxisDefaultProps = {
    allowDataOverflow: implicitYAxis.allowDataOverflow,
    allowDecimals: implicitYAxis.allowDecimals,
    allowDuplicatedCategory: implicitYAxis.allowDuplicatedCategory,
    angle: implicitYAxis.angle,
    axisLine: defaultCartesianAxisProps.axisLine,
    hide: false,
    includeHidden: implicitYAxis.includeHidden,
    interval: implicitYAxis.interval,
    label: false,
    minTickGap: implicitYAxis.minTickGap,
    mirror: implicitYAxis.mirror,
    orientation: implicitYAxis.orientation,
    padding: implicitYAxis.padding,
    reversed: implicitYAxis.reversed,
    scale: implicitYAxis.scale,
    tick: implicitYAxis.tick,
    tickCount: implicitYAxis.tickCount,
    tickLine: defaultCartesianAxisProps.tickLine,
    tickSize: defaultCartesianAxisProps.tickSize,
    type: implicitYAxis.type,
    niceTicks: implicitYAxis.niceTicks,
    width: implicitYAxis.width,
    yAxisId: 0
  };
  var YAxisSettingsDispatcher = (outsideProps) => {
    var props = resolveDefaultProps(outsideProps, yAxisDefaultProps);
    return /* @__PURE__ */ React23.createElement(React23.Fragment, null, /* @__PURE__ */ React23.createElement(SetYAxisSettings, {
      interval: props.interval,
      id: props.yAxisId,
      scale: props.scale,
      type: props.type,
      domain: props.domain,
      allowDataOverflow: props.allowDataOverflow,
      dataKey: props.dataKey,
      allowDuplicatedCategory: props.allowDuplicatedCategory,
      allowDecimals: props.allowDecimals,
      tickCount: props.tickCount,
      padding: props.padding,
      includeHidden: props.includeHidden,
      reversed: props.reversed,
      ticks: props.ticks,
      width: props.width,
      orientation: props.orientation,
      mirror: props.mirror,
      hide: props.hide,
      unit: props.unit,
      name: props.name,
      angle: props.angle,
      minTickGap: props.minTickGap,
      tick: props.tick,
      tickFormatter: props.tickFormatter,
      niceTicks: props.niceTicks
    }), /* @__PURE__ */ React23.createElement(YAxisImpl, props));
  };
  var YAxis = /* @__PURE__ */ React23.memo(YAxisSettingsDispatcher, axisPropsAreEqual);
  YAxis.displayName = "YAxis";

  // node_modules/recharts/es6/chart/CartesianChart.js
  init_define_import_meta_env();
  var React29 = __toESM(require_react_shim());
  var import_react47 = __toESM(require_react_shim());

  // node_modules/recharts/es6/state/RechartsStoreProvider.js
  init_define_import_meta_env();
  var React24 = __toESM(require_react_shim());
  var import_react38 = __toESM(require_react_shim());

  // node_modules/recharts/es6/state/store.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/state/mouseEventsMiddleware.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/state/selectors/selectActivePropsFromChartPointer.js
  init_define_import_meta_env();
  var pickChartPointer = (_state, chartPointer) => chartPointer;
  var selectActivePropsFromChartPointer = createSelector([pickChartPointer, selectChartLayout, selectPolarViewBox, selectTooltipAxisType, selectTooltipAxisRangeWithReverse, selectTooltipAxisTicks, selectOrderedTooltipTicks, selectChartOffsetInternal], combineActiveProps);

  // node_modules/recharts/es6/util/getRelativeCoordinate.js
  init_define_import_meta_env();
  function isSvgPointer(pointer) {
    return "getBBox" in pointer.currentTarget && typeof pointer.currentTarget.getBBox === "function";
  }
  function getRelativeCoordinate(event) {
    var rect = event.currentTarget.getBoundingClientRect();
    var scaleX, scaleY;
    if (isSvgPointer(event)) {
      var bbox = event.currentTarget.getBBox();
      scaleX = bbox.width > 0 ? rect.width / bbox.width : 1;
      scaleY = bbox.height > 0 ? rect.height / bbox.height : 1;
    } else {
      var element = event.currentTarget;
      scaleX = element.offsetWidth > 0 ? rect.width / element.offsetWidth : 1;
      scaleY = element.offsetHeight > 0 ? rect.height / element.offsetHeight : 1;
    }
    var getCoordinates = (clientX, clientY) => ({
      /*
       * Here it's important to use:
       * - event.clientX and event.clientY to get the mouse position relative to the viewport, including scroll.
       * - pageX and pageY are not used because they are relative to the whole document, and ignore scroll.
       * - rect.left and rect.top are used to get the position of the chart relative to the viewport.
       * - offsetX and offsetY are not used because they are relative to the offset parent
       *  which may or may not be the same as the clientX and clientY, depending on the position of the chart in the DOM
       *  and surrounding element styles. CSS position: relative, absolute, fixed, will change the offset parent.
       * - scaleX and scaleY are necessary for when the chart element is scaled using CSS `transform: scale(N)`.
       */
      relativeX: Math.round((clientX - rect.left) / scaleX),
      relativeY: Math.round((clientY - rect.top) / scaleY)
    });
    if ("touches" in event) {
      return Array.from(event.touches).map((touch) => getCoordinates(touch.clientX, touch.clientY));
    }
    return getCoordinates(event.clientX, event.clientY);
  }

  // node_modules/recharts/es6/state/mouseEventsMiddleware.js
  var mouseClickAction = createAction("mouseClick");
  var mouseClickMiddleware = createListenerMiddleware();
  mouseClickMiddleware.startListening({
    actionCreator: mouseClickAction,
    effect: (action, listenerApi) => {
      var mousePointer = action.payload;
      var activeProps = selectActivePropsFromChartPointer(listenerApi.getState(), getRelativeCoordinate(mousePointer));
      if ((activeProps === null || activeProps === void 0 ? void 0 : activeProps.activeIndex) != null) {
        listenerApi.dispatch(setMouseClickAxisIndex({
          activeIndex: activeProps.activeIndex,
          activeDataKey: void 0,
          activeCoordinate: activeProps.activeCoordinate
        }));
      }
    }
  });
  var mouseMoveAction = createAction("mouseMove");
  var mouseMoveMiddleware = createListenerMiddleware();
  var rafId = null;
  var timeoutId = null;
  var latestChartPointer = null;
  mouseMoveMiddleware.startListening({
    actionCreator: mouseMoveAction,
    effect: (action, listenerApi) => {
      var mousePointer = action.payload;
      var state = listenerApi.getState();
      var _state$eventSettings = state.eventSettings, throttleDelay = _state$eventSettings.throttleDelay, throttledEvents = _state$eventSettings.throttledEvents;
      var isThrottled = throttledEvents === "all" || (throttledEvents === null || throttledEvents === void 0 ? void 0 : throttledEvents.includes("mousemove"));
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (timeoutId !== null && (typeof throttleDelay !== "number" || !isThrottled)) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      latestChartPointer = getRelativeCoordinate(mousePointer);
      var callback = () => {
        var currentState = listenerApi.getState();
        var tooltipEventType = selectTooltipEventType(currentState, currentState.tooltip.settings.shared);
        if (!latestChartPointer) {
          rafId = null;
          timeoutId = null;
          return;
        }
        if (tooltipEventType === "axis") {
          var activeProps = selectActivePropsFromChartPointer(currentState, latestChartPointer);
          if ((activeProps === null || activeProps === void 0 ? void 0 : activeProps.activeIndex) != null) {
            listenerApi.dispatch(setMouseOverAxisIndex({
              activeIndex: activeProps.activeIndex,
              activeDataKey: void 0,
              activeCoordinate: activeProps.activeCoordinate
            }));
          } else {
            listenerApi.dispatch(mouseLeaveChart());
          }
        }
        rafId = null;
        timeoutId = null;
      };
      if (!isThrottled) {
        callback();
        return;
      }
      if (throttleDelay === "raf") {
        rafId = requestAnimationFrame(callback);
      } else if (typeof throttleDelay === "number") {
        if (timeoutId === null) {
          timeoutId = setTimeout(callback, throttleDelay);
        }
      }
    }
  });

  // node_modules/recharts/es6/state/reduxDevtoolsJsonStringifyReplacer.js
  init_define_import_meta_env();
  function reduxDevtoolsJsonStringifyReplacer(key, value) {
    if (value instanceof HTMLElement) {
      return "HTMLElement <".concat(value.tagName, ' class="').concat(value.className, '">');
    }
    if (value === window) {
      return "global.window";
    }
    if (key === "children" && typeof value === "object" && value !== null) {
      return "<<CHILDREN>>";
    }
    return value;
  }

  // node_modules/recharts/es6/state/rootPropsSlice.js
  init_define_import_meta_env();
  var initialState13 = {
    accessibilityLayer: true,
    barCategoryGap: "10%",
    barGap: 4,
    barSize: void 0,
    className: void 0,
    maxBarSize: void 0,
    stackOffset: "none",
    syncId: void 0,
    syncMethod: "index",
    baseValue: void 0,
    reverseStackOrder: false
  };
  var rootPropsSlice = createSlice({
    name: "rootProps",
    initialState: initialState13,
    reducers: {
      updateOptions: (state, action) => {
        var _action$payload$barGa;
        state.accessibilityLayer = action.payload.accessibilityLayer;
        state.barCategoryGap = action.payload.barCategoryGap;
        state.barGap = (_action$payload$barGa = action.payload.barGap) !== null && _action$payload$barGa !== void 0 ? _action$payload$barGa : initialState13.barGap;
        state.barSize = action.payload.barSize;
        state.maxBarSize = action.payload.maxBarSize;
        state.stackOffset = action.payload.stackOffset;
        state.syncId = action.payload.syncId;
        state.syncMethod = action.payload.syncMethod;
        state.className = action.payload.className;
        state.baseValue = action.payload.baseValue;
        state.reverseStackOrder = action.payload.reverseStackOrder;
      }
    }
  });
  var rootPropsReducer = rootPropsSlice.reducer;
  var updateOptions = rootPropsSlice.actions.updateOptions;

  // node_modules/recharts/es6/state/polarOptionsSlice.js
  init_define_import_meta_env();
  var initialState14 = null;
  var reducers = {
    updatePolarOptions: (state, action) => {
      if (state === null) {
        return action.payload;
      }
      state.startAngle = action.payload.startAngle;
      state.endAngle = action.payload.endAngle;
      state.cx = action.payload.cx;
      state.cy = action.payload.cy;
      state.innerRadius = action.payload.innerRadius;
      state.outerRadius = action.payload.outerRadius;
      return state;
    }
  };
  var polarOptionsSlice = createSlice({
    name: "polarOptions",
    initialState: initialState14,
    reducers
  });
  var updatePolarOptions = polarOptionsSlice.actions.updatePolarOptions;
  var polarOptionsReducer = polarOptionsSlice.reducer;

  // node_modules/recharts/es6/state/keyboardEventsMiddleware.js
  init_define_import_meta_env();
  var keyDownAction = createAction("keyDown");
  var focusAction = createAction("focus");
  var blurAction = createAction("blur");
  var keyboardEventsMiddleware = createListenerMiddleware();
  var rafId2 = null;
  var timeoutId2 = null;
  var latestKeyboardActionPayload = null;
  keyboardEventsMiddleware.startListening({
    actionCreator: keyDownAction,
    effect: (action, listenerApi) => {
      latestKeyboardActionPayload = action.payload;
      if (rafId2 !== null) {
        cancelAnimationFrame(rafId2);
        rafId2 = null;
      }
      var state = listenerApi.getState();
      var _state$eventSettings = state.eventSettings, throttleDelay = _state$eventSettings.throttleDelay, throttledEvents = _state$eventSettings.throttledEvents;
      var isThrottled = throttledEvents === "all" || throttledEvents.includes("keydown");
      if (timeoutId2 !== null && (typeof throttleDelay !== "number" || !isThrottled)) {
        clearTimeout(timeoutId2);
        timeoutId2 = null;
      }
      var callback = () => {
        try {
          var currentState = listenerApi.getState();
          var accessibilityLayerIsActive = currentState.rootProps.accessibilityLayer !== false;
          if (!accessibilityLayerIsActive) {
            return;
          }
          var keyboardInteraction = currentState.tooltip.keyboardInteraction;
          var key = latestKeyboardActionPayload;
          if (key !== "ArrowRight" && key !== "ArrowLeft" && key !== "Enter") {
            return;
          }
          var resolvedIndex = combineActiveTooltipIndex(keyboardInteraction, selectTooltipDisplayedData(currentState), selectTooltipAxisDataKey(currentState), selectTooltipAxisDomain(currentState));
          var currentIndex = resolvedIndex == null ? -1 : Number(resolvedIndex);
          var isOutsideDomain = !Number.isFinite(currentIndex) || currentIndex < 0;
          var tooltipTicks = selectTooltipAxisTicks(currentState);
          var displayedData = selectTooltipDisplayedData(currentState);
          var tooltipEventType = selectTooltipEventType(currentState, currentState.tooltip.settings.shared);
          if (key === "Enter") {
            if (isOutsideDomain) {
              return;
            }
            var _coordinate = selectCoordinateForDefaultIndex(currentState, tooltipEventType, "hover", String(keyboardInteraction.index));
            listenerApi.dispatch(setKeyboardInteraction({
              active: !keyboardInteraction.active,
              activeIndex: keyboardInteraction.index,
              activeCoordinate: _coordinate
            }));
            return;
          }
          var direction = selectChartDirection(currentState);
          var directionMultiplier = direction === "left-to-right" ? 1 : -1;
          var movement = key === "ArrowRight" ? 1 : -1;
          var nextIndex;
          if (isOutsideDomain) {
            var axisDataKey = selectTooltipAxisDataKey(currentState);
            var domain = selectTooltipAxisDomain(currentState);
            var effectiveMovement = movement * directionMultiplier;
            var mkInteraction = (i2) => ({
              active: false,
              index: String(i2),
              dataKey: void 0,
              graphicalItemId: void 0,
              coordinate: void 0
            });
            nextIndex = -1;
            if (effectiveMovement > 0) {
              for (var i = 0; i < displayedData.length; i++) {
                if (combineActiveTooltipIndex(mkInteraction(i), displayedData, axisDataKey, domain) != null) {
                  nextIndex = i;
                  break;
                }
              }
            } else {
              for (var _i = displayedData.length - 1; _i >= 0; _i--) {
                if (combineActiveTooltipIndex(mkInteraction(_i), displayedData, axisDataKey, domain) != null) {
                  nextIndex = _i;
                  break;
                }
              }
            }
            if (nextIndex < 0) {
              return;
            }
          } else {
            nextIndex = currentIndex + movement * directionMultiplier;
            var dataLength = (tooltipTicks === null || tooltipTicks === void 0 ? void 0 : tooltipTicks.length) || displayedData.length;
            if (dataLength === 0 || nextIndex >= dataLength || nextIndex < 0) {
              return;
            }
          }
          var coordinate = selectCoordinateForDefaultIndex(currentState, tooltipEventType, "hover", String(nextIndex));
          listenerApi.dispatch(setKeyboardInteraction({
            active: true,
            activeIndex: nextIndex.toString(),
            activeCoordinate: coordinate
          }));
        } finally {
          rafId2 = null;
          timeoutId2 = null;
        }
      };
      if (!isThrottled) {
        callback();
        return;
      }
      if (throttleDelay === "raf") {
        rafId2 = requestAnimationFrame(callback);
      } else if (typeof throttleDelay === "number") {
        if (timeoutId2 === null) {
          callback();
          latestKeyboardActionPayload = null;
          timeoutId2 = setTimeout(() => {
            if (latestKeyboardActionPayload) {
              callback();
            } else {
              timeoutId2 = null;
              rafId2 = null;
            }
          }, throttleDelay);
        }
      }
    }
  });
  keyboardEventsMiddleware.startListening({
    actionCreator: focusAction,
    effect: (_action, listenerApi) => {
      var state = listenerApi.getState();
      var accessibilityLayerIsActive = state.rootProps.accessibilityLayer !== false;
      if (!accessibilityLayerIsActive) {
        return;
      }
      var keyboardInteraction = state.tooltip.keyboardInteraction;
      if (keyboardInteraction.active) {
        return;
      }
      if (keyboardInteraction.index == null) {
        var nextIndex = "0";
        var tooltipEventType = selectTooltipEventType(state, state.tooltip.settings.shared);
        var coordinate = selectCoordinateForDefaultIndex(state, tooltipEventType, "hover", String(nextIndex));
        listenerApi.dispatch(setKeyboardInteraction({
          active: true,
          activeIndex: nextIndex,
          activeCoordinate: coordinate
        }));
      }
    }
  });
  keyboardEventsMiddleware.startListening({
    actionCreator: blurAction,
    effect: (_action, listenerApi) => {
      var state = listenerApi.getState();
      var accessibilityLayerIsActive = state.rootProps.accessibilityLayer !== false;
      if (!accessibilityLayerIsActive) {
        return;
      }
      var keyboardInteraction = state.tooltip.keyboardInteraction;
      if (keyboardInteraction.active) {
        listenerApi.dispatch(setKeyboardInteraction({
          active: false,
          activeIndex: keyboardInteraction.index,
          activeCoordinate: keyboardInteraction.coordinate
        }));
      }
    }
  });

  // node_modules/recharts/es6/state/externalEventsMiddleware.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/util/createEventProxy.js
  init_define_import_meta_env();
  function createEventProxy(reactEvent) {
    reactEvent.persist();
    var currentTarget = reactEvent.currentTarget;
    return new Proxy(reactEvent, {
      get: (target, prop) => {
        if (prop === "currentTarget") {
          return currentTarget;
        }
        var value = Reflect.get(target, prop);
        if (typeof value === "function") {
          return value.bind(target);
        }
        return value;
      }
    });
  }

  // node_modules/recharts/es6/state/externalEventsMiddleware.js
  var externalEventAction = createAction("externalEvent");
  var externalEventsMiddleware = createListenerMiddleware();
  var rafIdMap = /* @__PURE__ */ new Map();
  var timeoutIdMap = /* @__PURE__ */ new Map();
  var latestEventMap = /* @__PURE__ */ new Map();
  externalEventsMiddleware.startListening({
    actionCreator: externalEventAction,
    effect: (action, listenerApi) => {
      var _action$payload = action.payload, handler = _action$payload.handler, reactEvent = _action$payload.reactEvent;
      if (handler == null) {
        return;
      }
      var eventType = reactEvent.type;
      var eventProxy = createEventProxy(reactEvent);
      latestEventMap.set(eventType, {
        handler,
        reactEvent: eventProxy
      });
      var existingRafId = rafIdMap.get(eventType);
      if (existingRafId !== void 0) {
        cancelAnimationFrame(existingRafId);
        rafIdMap.delete(eventType);
      }
      var state = listenerApi.getState();
      var _state$eventSettings = state.eventSettings, throttleDelay = _state$eventSettings.throttleDelay, throttledEvents = _state$eventSettings.throttledEvents;
      var eventListAsString = throttledEvents;
      var isThrottled = eventListAsString === "all" || (eventListAsString === null || eventListAsString === void 0 ? void 0 : eventListAsString.includes(eventType));
      var existingTimeoutId = timeoutIdMap.get(eventType);
      if (existingTimeoutId !== void 0 && (typeof throttleDelay !== "number" || !isThrottled)) {
        clearTimeout(existingTimeoutId);
        timeoutIdMap.delete(eventType);
      }
      var callback = () => {
        var latestAction = latestEventMap.get(eventType);
        try {
          if (!latestAction) {
            return;
          }
          var latestHandler = latestAction.handler, latestEvent = latestAction.reactEvent;
          var currentState = listenerApi.getState();
          var nextState = {
            activeCoordinate: selectActiveTooltipCoordinate(currentState),
            activeDataKey: selectActiveTooltipDataKey(currentState),
            activeIndex: selectActiveTooltipIndex(currentState),
            activeLabel: selectActiveLabel(currentState),
            activeTooltipIndex: selectActiveTooltipIndex(currentState),
            isTooltipActive: selectIsTooltipActive(currentState)
          };
          if (latestHandler) {
            latestHandler(nextState, latestEvent);
          }
        } finally {
          rafIdMap.delete(eventType);
          timeoutIdMap.delete(eventType);
          latestEventMap.delete(eventType);
        }
      };
      if (!isThrottled) {
        callback();
        return;
      }
      if (throttleDelay === "raf") {
        var rafId4 = requestAnimationFrame(callback);
        rafIdMap.set(eventType, rafId4);
      } else if (typeof throttleDelay === "number") {
        if (!timeoutIdMap.has(eventType)) {
          callback();
          var timeoutId4 = setTimeout(callback, throttleDelay);
          timeoutIdMap.set(eventType, timeoutId4);
        }
      } else {
        callback();
      }
    }
  });

  // node_modules/recharts/es6/state/touchEventsMiddleware.js
  init_define_import_meta_env();

  // node_modules/recharts/es6/state/selectors/touchSelectors.js
  init_define_import_meta_env();
  var selectAllTooltipPayloadConfiguration = createSelector([selectTooltipState], (tooltipState) => tooltipState.tooltipItemPayloads);
  var selectTooltipCoordinate = createSelector([selectAllTooltipPayloadConfiguration, (_state, tooltipIndex) => tooltipIndex, (_state, _tooltipIndex, graphicalItemId) => graphicalItemId], (allTooltipConfigurations, tooltipIndex, graphicalItemId) => {
    if (tooltipIndex == null) {
      return void 0;
    }
    var mostRelevantTooltipConfiguration = allTooltipConfigurations.find((tooltipConfiguration) => {
      return tooltipConfiguration.settings.graphicalItemId === graphicalItemId;
    });
    if (mostRelevantTooltipConfiguration == null) {
      return void 0;
    }
    var getPosition = mostRelevantTooltipConfiguration.getPosition;
    if (getPosition == null) {
      return void 0;
    }
    return getPosition(tooltipIndex);
  });

  // node_modules/recharts/es6/state/touchEventsMiddleware.js
  var touchEventAction = createAction("touchMove");
  var touchEventMiddleware = createListenerMiddleware();
  var rafId3 = null;
  var timeoutId3 = null;
  var latestChartPointers = null;
  var latestTouchEvent = null;
  touchEventMiddleware.startListening({
    actionCreator: touchEventAction,
    effect: (action, listenerApi) => {
      var touchEvent = action.payload;
      if (touchEvent.touches == null || touchEvent.touches.length === 0) {
        return;
      }
      latestTouchEvent = createEventProxy(touchEvent);
      var state = listenerApi.getState();
      var _state$eventSettings = state.eventSettings, throttleDelay = _state$eventSettings.throttleDelay, throttledEvents = _state$eventSettings.throttledEvents;
      var isThrottled = throttledEvents === "all" || throttledEvents.includes("touchmove");
      if (rafId3 !== null) {
        cancelAnimationFrame(rafId3);
        rafId3 = null;
      }
      if (timeoutId3 !== null && (typeof throttleDelay !== "number" || !isThrottled)) {
        clearTimeout(timeoutId3);
        timeoutId3 = null;
      }
      latestChartPointers = Array.from(touchEvent.touches).map((touch) => getRelativeCoordinate({
        clientX: touch.clientX,
        clientY: touch.clientY,
        currentTarget: touchEvent.currentTarget
      }));
      var callback = () => {
        if (latestTouchEvent == null) {
          return;
        }
        var currentState = listenerApi.getState();
        var tooltipEventType = selectTooltipEventType(currentState, currentState.tooltip.settings.shared);
        if (tooltipEventType === "axis") {
          var _latestChartPointers;
          var latestTouchPointer = (_latestChartPointers = latestChartPointers) === null || _latestChartPointers === void 0 ? void 0 : _latestChartPointers[0];
          if (latestTouchPointer == null) {
            rafId3 = null;
            timeoutId3 = null;
            return;
          }
          var activeProps = selectActivePropsFromChartPointer(currentState, latestTouchPointer);
          if ((activeProps === null || activeProps === void 0 ? void 0 : activeProps.activeIndex) != null) {
            listenerApi.dispatch(setMouseOverAxisIndex({
              activeIndex: activeProps.activeIndex,
              activeDataKey: void 0,
              activeCoordinate: activeProps.activeCoordinate
            }));
          }
        } else if (tooltipEventType === "item") {
          var _target$getAttribute;
          var touch = latestTouchEvent.touches[0];
          if (document.elementFromPoint == null || touch == null) {
            return;
          }
          var target = document.elementFromPoint(touch.clientX, touch.clientY);
          if (!target || !target.getAttribute) {
            return;
          }
          var itemIndex = target.getAttribute(DATA_ITEM_INDEX_ATTRIBUTE_NAME);
          var graphicalItemId = (_target$getAttribute = target.getAttribute(DATA_ITEM_GRAPHICAL_ITEM_ID_ATTRIBUTE_NAME)) !== null && _target$getAttribute !== void 0 ? _target$getAttribute : void 0;
          var settings = selectAllGraphicalItemsSettings(currentState).find((item) => item.id === graphicalItemId);
          if (itemIndex == null || settings == null || graphicalItemId == null) {
            return;
          }
          var dataKey = settings.dataKey;
          var coordinate = selectTooltipCoordinate(currentState, itemIndex, graphicalItemId);
          listenerApi.dispatch(setActiveMouseOverItemIndex({
            activeDataKey: dataKey,
            activeIndex: itemIndex,
            activeCoordinate: coordinate,
            activeGraphicalItemId: graphicalItemId
          }));
        }
        rafId3 = null;
        timeoutId3 = null;
      };
      if (!isThrottled) {
        callback();
        return;
      }
      if (throttleDelay === "raf") {
        rafId3 = requestAnimationFrame(callback);
      } else if (typeof throttleDelay === "number") {
        if (timeoutId3 === null) {
          callback();
          latestTouchEvent = null;
          timeoutId3 = setTimeout(() => {
            if (latestTouchEvent) {
              callback();
            } else {
              timeoutId3 = null;
              rafId3 = null;
            }
          }, throttleDelay);
        }
      }
    }
  });

  // node_modules/recharts/es6/state/eventSettingsSlice.js
  init_define_import_meta_env();
  var initialEventSettingsState = {
    throttleDelay: "raf",
    throttledEvents: ["mousemove", "touchmove", "pointermove", "scroll", "wheel"]
  };
  var eventSettingsSlice = createSlice({
    name: "eventSettings",
    initialState: initialEventSettingsState,
    reducers: {
      setEventSettings: (state, action) => {
        if (action.payload.throttleDelay != null) {
          state.throttleDelay = action.payload.throttleDelay;
        }
        if (action.payload.throttledEvents != null) {
          state.throttledEvents = castDraft(action.payload.throttledEvents);
        }
      }
    }
  });
  var setEventSettings = eventSettingsSlice.actions.setEventSettings;
  var eventSettingsReducer = eventSettingsSlice.reducer;

  // node_modules/recharts/es6/state/store.js
  var rootReducer = combineReducers({
    brush: brushReducer,
    cartesianAxis: cartesianAxisReducer,
    chartData: chartDataReducer,
    errorBars: errorBarReducer,
    eventSettings: eventSettingsReducer,
    graphicalItems: graphicalItemsReducer,
    layout: chartLayoutReducer,
    legend: legendReducer,
    options: optionsReducer,
    polarAxis: polarAxisReducer,
    polarOptions: polarOptionsReducer,
    referenceElements: referenceElementsReducer,
    renderedTicks: renderedTicksReducer,
    rootProps: rootPropsReducer,
    tooltip: tooltipReducer,
    zIndex: zIndexReducer
  });
  var createRechartsStore = function createRechartsStore2(preloadedState) {
    var chartName = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "Chart";
    return configureStore({
      reducer: rootReducer,
      // redux-toolkit v1 types are unhappy with the preloadedState type. Remove the `as any` when bumping to v2
      preloadedState,
      // @ts-expect-error redux-toolkit v1 types are unhappy with the middleware array. Remove this comment when bumping to v2
      middleware: (getDefaultMiddleware) => {
        var _process$env$NODE_ENV;
        return getDefaultMiddleware({
          serializableCheck: false,
          immutableCheck: !["commonjs", "es6", "production"].includes((_process$env$NODE_ENV = "es6") !== null && _process$env$NODE_ENV !== void 0 ? _process$env$NODE_ENV : "")
        }).concat([mouseClickMiddleware.middleware, mouseMoveMiddleware.middleware, keyboardEventsMiddleware.middleware, externalEventsMiddleware.middleware, touchEventMiddleware.middleware]);
      },
      /*
       * I can't find out how to satisfy typescript here.
       * We return `EnhancerArray<[StoreEnhancer<{}, {}>, StoreEnhancer]>` from this function,
       * but the types say we should return `EnhancerArray<StoreEnhancer<{}, {}>`.
       * Looks like it's badly inferred generics, but it won't allow me to provide the correct type manually either.
       * So let's just ignore the error for now.
       */
      // @ts-expect-error mismatched generics
      enhancers: (getDefaultEnhancers) => {
        var enhancers = getDefaultEnhancers;
        if (typeof getDefaultEnhancers === "function") {
          enhancers = getDefaultEnhancers();
        }
        return enhancers.concat(autoBatchEnhancer({
          type: "raf"
        }));
      },
      devTools: Global.devToolsEnabled && {
        serialize: {
          replacer: reduxDevtoolsJsonStringifyReplacer
        },
        name: "recharts-".concat(chartName)
      }
    });
  };

  // node_modules/recharts/es6/state/RechartsStoreProvider.js
  function RechartsStoreProvider(_ref2) {
    var preloadedState = _ref2.preloadedState, children = _ref2.children, reduxStoreName = _ref2.reduxStoreName;
    var isPanorama = useIsPanorama();
    var storeRef = (0, import_react38.useRef)(null);
    if (isPanorama) {
      return children;
    }
    if (storeRef.current == null) {
      storeRef.current = createRechartsStore(preloadedState, reduxStoreName);
    }
    var nonNullContext = RechartsReduxContext;
    return /* @__PURE__ */ React24.createElement(Provider_default, {
      context: nonNullContext,
      store: storeRef.current
    }, children);
  }

  // node_modules/recharts/es6/state/ReportMainChartProps.js
  init_define_import_meta_env();
  var import_react39 = __toESM(require_react_shim());
  function ReportMainChartPropsImpl(_ref2) {
    var layout = _ref2.layout, margin = _ref2.margin;
    var dispatch = useAppDispatch();
    var isPanorama = useIsPanorama();
    (0, import_react39.useEffect)(() => {
      if (!isPanorama) {
        dispatch(setLayout(layout));
        dispatch(setMargin(margin));
      }
    }, [dispatch, isPanorama, layout, margin]);
    return null;
  }
  var ReportMainChartProps = /* @__PURE__ */ (0, import_react39.memo)(ReportMainChartPropsImpl, propsAreEqual);

  // node_modules/recharts/es6/state/ReportChartProps.js
  init_define_import_meta_env();
  var import_react40 = __toESM(require_react_shim());
  function ReportChartProps(props) {
    var dispatch = useAppDispatch();
    (0, import_react40.useEffect)(() => {
      dispatch(updateOptions(props));
    }, [dispatch, props]);
    return null;
  }

  // node_modules/recharts/es6/state/ReportEventSettings.js
  init_define_import_meta_env();
  var import_react41 = __toESM(require_react_shim());
  var ReportEventSettingsImpl = (props) => {
    var dispatch = useAppDispatch();
    (0, import_react41.useEffect)(() => {
      dispatch(setEventSettings(props));
    }, [dispatch, props]);
    return null;
  };
  var ReportEventSettings = /* @__PURE__ */ (0, import_react41.memo)(ReportEventSettingsImpl, propsAreEqual);

  // node_modules/recharts/es6/chart/CategoricalChart.js
  init_define_import_meta_env();
  var React28 = __toESM(require_react_shim());
  var import_react46 = __toESM(require_react_shim());

  // node_modules/recharts/es6/container/RootSurface.js
  init_define_import_meta_env();
  var React26 = __toESM(require_react_shim());
  var import_react43 = __toESM(require_react_shim());

  // node_modules/recharts/es6/zIndex/ZIndexPortal.js
  init_define_import_meta_env();
  var React25 = __toESM(require_react_shim());
  var import_react42 = __toESM(require_react_shim());
  function ZIndexSvgPortal(_ref2) {
    var zIndex = _ref2.zIndex, isPanorama = _ref2.isPanorama;
    var ref = (0, import_react42.useRef)(null);
    var dispatch = useAppDispatch();
    (0, import_react42.useLayoutEffect)(() => {
      if (ref.current) {
        dispatch(registerZIndexPortalElement({
          zIndex,
          element: ref.current,
          isPanorama
        }));
      }
      return () => {
        dispatch(unregisterZIndexPortalElement({
          zIndex,
          isPanorama
        }));
      };
    }, [dispatch, zIndex, isPanorama]);
    return /* @__PURE__ */ React25.createElement("g", {
      tabIndex: -1,
      ref,
      className: "recharts-zIndex-layer_".concat(zIndex)
    });
  }
  function AllZIndexPortals(_ref2) {
    var children = _ref2.children, isPanorama = _ref2.isPanorama;
    var allRegisteredZIndexes = useAppSelector(selectAllRegisteredZIndexes);
    if (!allRegisteredZIndexes || allRegisteredZIndexes.length === 0) {
      return children;
    }
    var allNegativeZIndexes = allRegisteredZIndexes.filter((zIndex) => zIndex < 0);
    var allPositiveZIndexes = allRegisteredZIndexes.filter((zIndex) => zIndex > 0);
    return /* @__PURE__ */ React25.createElement(React25.Fragment, null, allNegativeZIndexes.map((zIndex) => /* @__PURE__ */ React25.createElement(ZIndexSvgPortal, {
      key: zIndex,
      zIndex,
      isPanorama
    })), children, allPositiveZIndexes.map((zIndex) => /* @__PURE__ */ React25.createElement(ZIndexSvgPortal, {
      key: zIndex,
      zIndex,
      isPanorama
    })));
  }

  // node_modules/recharts/es6/container/RootSurface.js
  var _excluded17 = ["children"];
  function _objectWithoutProperties17(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose17(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose17(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  function _extends13() {
    return _extends13 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends13.apply(null, arguments);
  }
  var FULL_WIDTH_AND_HEIGHT = {
    width: "100%",
    height: "100%",
    /*
     * display: block is necessary here because the default for an SVG is display: inline,
     * which in some browsers (Chrome) adds a little bit of extra space above and below the SVG
     * to make space for the descender of letters like "g" and "y". This throws off the height calculation
     * and causes the container to grow indefinitely on each render with responsive=true.
     * Display: block removes that extra space.
     *
     * Interestingly, Firefox does not have this problem, but it doesn't hurt to add the style anyway.
     */
    display: "block"
  };
  var MainChartSurface = /* @__PURE__ */ (0, import_react43.forwardRef)((props, ref) => {
    var width = useChartWidth();
    var height = useChartHeight();
    var hasAccessibilityLayer = useAccessibilityLayer();
    if (!isPositiveNumber(width) || !isPositiveNumber(height)) {
      return null;
    }
    var children = props.children, otherAttributes = props.otherAttributes, title = props.title, desc = props.desc;
    var tabIndex, role;
    if (otherAttributes != null) {
      if (typeof otherAttributes.tabIndex === "number") {
        tabIndex = otherAttributes.tabIndex;
      } else {
        tabIndex = hasAccessibilityLayer ? 0 : void 0;
      }
      if (typeof otherAttributes.role === "string") {
        role = otherAttributes.role;
      } else {
        role = hasAccessibilityLayer ? "application" : void 0;
      }
    }
    return /* @__PURE__ */ React26.createElement(Surface, _extends13({}, otherAttributes, {
      title,
      desc,
      role,
      tabIndex,
      width,
      height,
      style: FULL_WIDTH_AND_HEIGHT,
      ref
    }), children);
  });
  var BrushPanoramaSurface = (_ref2) => {
    var children = _ref2.children;
    var brushDimensions = useAppSelector(selectBrushDimensions);
    if (!brushDimensions) {
      return null;
    }
    var width = brushDimensions.width, height = brushDimensions.height, y = brushDimensions.y, x = brushDimensions.x;
    return /* @__PURE__ */ React26.createElement(Surface, {
      width,
      height,
      x,
      y
    }, children);
  };
  var RootSurface = /* @__PURE__ */ (0, import_react43.forwardRef)((_ref2, ref) => {
    var children = _ref2.children, rest = _objectWithoutProperties17(_ref2, _excluded17);
    var isPanorama = useIsPanorama();
    if (isPanorama) {
      return /* @__PURE__ */ React26.createElement(BrushPanoramaSurface, null, /* @__PURE__ */ React26.createElement(AllZIndexPortals, {
        isPanorama: true
      }, children));
    }
    return /* @__PURE__ */ React26.createElement(MainChartSurface, _extends13({
      ref
    }, rest), /* @__PURE__ */ React26.createElement(AllZIndexPortals, {
      isPanorama: false
    }, children));
  });

  // node_modules/recharts/es6/chart/RechartsWrapper.js
  init_define_import_meta_env();
  var React27 = __toESM(require_react_shim());
  var import_react45 = __toESM(require_react_shim());

  // node_modules/recharts/es6/util/useReportScale.js
  init_define_import_meta_env();
  var import_react44 = __toESM(require_react_shim());
  function _slicedToArray16(r2, e) {
    return _arrayWithHoles16(r2) || _iterableToArrayLimit16(r2, e) || _unsupportedIterableToArray16(r2, e) || _nonIterableRest16();
  }
  function _nonIterableRest16() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray16(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray16(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray16(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray16(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit16(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles16(r2) {
    if (Array.isArray(r2)) return r2;
  }
  function useReportScale() {
    var dispatch = useAppDispatch();
    var _useState = (0, import_react44.useState)(null), _useState2 = _slicedToArray16(_useState, 2), ref = _useState2[0], setRef = _useState2[1];
    var scale = useAppSelector(selectContainerScale);
    (0, import_react44.useEffect)(() => {
      if (ref == null) {
        return;
      }
      var rect = ref.getBoundingClientRect();
      var newScale = rect.width / ref.offsetWidth;
      if (isWellBehavedNumber(newScale) && newScale !== scale) {
        dispatch(setScale(newScale));
      }
    }, [ref, dispatch, scale]);
    return setRef;
  }

  // node_modules/recharts/es6/chart/RechartsWrapper.js
  function ownKeys25(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread25(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys25(Object(t), true).forEach(function(r3) {
        _defineProperty28(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys25(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty28(e, r2, t) {
    return (r2 = _toPropertyKey28(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey28(t) {
    var i = _toPrimitive28(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive28(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  function _extends14() {
    return _extends14 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends14.apply(null, arguments);
  }
  function _slicedToArray17(r2, e) {
    return _arrayWithHoles17(r2) || _iterableToArrayLimit17(r2, e) || _unsupportedIterableToArray17(r2, e) || _nonIterableRest17();
  }
  function _nonIterableRest17() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray17(r2, a) {
    if (r2) {
      if ("string" == typeof r2) return _arrayLikeToArray17(r2, a);
      var t = {}.toString.call(r2).slice(8, -1);
      return "Object" === t && r2.constructor && (t = r2.constructor.name), "Map" === t || "Set" === t ? Array.from(r2) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray17(r2, a) : void 0;
    }
  }
  function _arrayLikeToArray17(r2, a) {
    (null == a || a > r2.length) && (a = r2.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r2[e];
    return n;
  }
  function _iterableToArrayLimit17(r2, l) {
    var t = null == r2 ? null : "undefined" != typeof Symbol && r2[Symbol.iterator] || r2["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r2)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = false;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r3) {
        o = true, n = r3;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles17(r2) {
    if (Array.isArray(r2)) return r2;
  }
  var EventSynchronizer = () => {
    useSynchronisedEventsFromOtherCharts();
    return null;
  };
  function getNumberOrZero(value) {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string") {
      var parsed = parseFloat(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return 0;
  }
  var ResponsiveDiv = /* @__PURE__ */ (0, import_react45.forwardRef)((props, ref) => {
    var _props$style, _props$style2;
    var observerRef = (0, import_react45.useRef)(null);
    var _useState = (0, import_react45.useState)({
      containerWidth: getNumberOrZero((_props$style = props.style) === null || _props$style === void 0 ? void 0 : _props$style.width),
      containerHeight: getNumberOrZero((_props$style2 = props.style) === null || _props$style2 === void 0 ? void 0 : _props$style2.height)
    }), _useState2 = _slicedToArray17(_useState, 2), sizes = _useState2[0], setSizes = _useState2[1];
    var setContainerSize = (0, import_react45.useCallback)((newWidth, newHeight) => {
      setSizes((prevState) => {
        var roundedWidth = Math.round(newWidth);
        var roundedHeight = Math.round(newHeight);
        if (prevState.containerWidth === roundedWidth && prevState.containerHeight === roundedHeight) {
          return prevState;
        }
        return {
          containerWidth: roundedWidth,
          containerHeight: roundedHeight
        };
      });
    }, []);
    var innerRef = (0, import_react45.useCallback)((node) => {
      if (typeof ref === "function") {
        ref(node);
      }
      if (observerRef.current != null) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (node != null && typeof ResizeObserver !== "undefined") {
        var _node$getBoundingClie = node.getBoundingClientRect(), containerWidth = _node$getBoundingClie.width, containerHeight = _node$getBoundingClie.height;
        setContainerSize(containerWidth, containerHeight);
        var callback = (entries) => {
          var entry = entries[0];
          if (entry == null) {
            return;
          }
          var _entry$contentRect = entry.contentRect, width = _entry$contentRect.width, height = _entry$contentRect.height;
          setContainerSize(width, height);
        };
        var observer = new ResizeObserver(callback);
        observer.observe(node);
        observerRef.current = observer;
      }
    }, [ref, setContainerSize]);
    (0, import_react45.useEffect)(() => {
      return () => {
        var observer = observerRef.current;
        if (observer != null) {
          observer.disconnect();
        }
      };
    }, [setContainerSize]);
    return /* @__PURE__ */ React27.createElement(React27.Fragment, null, /* @__PURE__ */ React27.createElement(ReportChartSize, {
      width: sizes.containerWidth,
      height: sizes.containerHeight
    }), /* @__PURE__ */ React27.createElement("div", _extends14({
      ref: innerRef
    }, props)));
  });
  var ReadSizeOnceDiv = /* @__PURE__ */ (0, import_react45.forwardRef)((props, ref) => {
    var width = props.width, height = props.height;
    var _useState3 = (0, import_react45.useState)({
      containerWidth: getNumberOrZero(width),
      containerHeight: getNumberOrZero(height)
    }), _useState4 = _slicedToArray17(_useState3, 2), sizes = _useState4[0], setSizes = _useState4[1];
    var setContainerSize = (0, import_react45.useCallback)((newWidth, newHeight) => {
      setSizes((prevState) => {
        var roundedWidth = Math.round(newWidth);
        var roundedHeight = Math.round(newHeight);
        if (prevState.containerWidth === roundedWidth && prevState.containerHeight === roundedHeight) {
          return prevState;
        }
        return {
          containerWidth: roundedWidth,
          containerHeight: roundedHeight
        };
      });
    }, []);
    var innerRef = (0, import_react45.useCallback)((node) => {
      if (typeof ref === "function") {
        ref(node);
      }
      if (node != null) {
        var _node$getBoundingClie2 = node.getBoundingClientRect(), containerWidth = _node$getBoundingClie2.width, containerHeight = _node$getBoundingClie2.height;
        setContainerSize(containerWidth, containerHeight);
      }
    }, [ref, setContainerSize]);
    return /* @__PURE__ */ React27.createElement(React27.Fragment, null, /* @__PURE__ */ React27.createElement(ReportChartSize, {
      width: sizes.containerWidth,
      height: sizes.containerHeight
    }), /* @__PURE__ */ React27.createElement("div", _extends14({
      ref: innerRef
    }, props)));
  });
  var StaticDiv = /* @__PURE__ */ (0, import_react45.forwardRef)((props, ref) => {
    var width = props.width, height = props.height;
    return /* @__PURE__ */ React27.createElement(React27.Fragment, null, /* @__PURE__ */ React27.createElement(ReportChartSize, {
      width,
      height
    }), /* @__PURE__ */ React27.createElement("div", _extends14({
      ref
    }, props)));
  });
  var NonResponsiveDiv = /* @__PURE__ */ (0, import_react45.forwardRef)((props, ref) => {
    var width = props.width, height = props.height;
    if (typeof width === "string" || typeof height === "string") {
      return /* @__PURE__ */ React27.createElement(ReadSizeOnceDiv, _extends14({}, props, {
        ref
      }));
    }
    if (typeof width === "number" && typeof height === "number") {
      return /* @__PURE__ */ React27.createElement(StaticDiv, _extends14({}, props, {
        width,
        height,
        ref
      }));
    }
    return /* @__PURE__ */ React27.createElement(React27.Fragment, null, /* @__PURE__ */ React27.createElement(ReportChartSize, {
      width,
      height
    }), /* @__PURE__ */ React27.createElement("div", _extends14({
      ref
    }, props)));
  });
  function getWrapperDivComponent(responsive) {
    return responsive ? ResponsiveDiv : NonResponsiveDiv;
  }
  var RechartsWrapper = /* @__PURE__ */ (0, import_react45.forwardRef)((props, ref) => {
    var children = props.children, className = props.className, heightFromProps = props.height, onClick = props.onClick, onContextMenu = props.onContextMenu, onDoubleClick = props.onDoubleClick, onMouseDown = props.onMouseDown, onMouseEnter = props.onMouseEnter, onMouseLeave = props.onMouseLeave, onMouseMove = props.onMouseMove, onMouseUp = props.onMouseUp, onTouchEnd = props.onTouchEnd, onTouchMove = props.onTouchMove, onTouchStart = props.onTouchStart, style = props.style, widthFromProps = props.width, responsive = props.responsive, _props$dispatchTouchE = props.dispatchTouchEvents, dispatchTouchEvents = _props$dispatchTouchE === void 0 ? true : _props$dispatchTouchE;
    var containerRef = (0, import_react45.useRef)(null);
    var dispatch = useAppDispatch();
    var _useState5 = (0, import_react45.useState)(null), _useState6 = _slicedToArray17(_useState5, 2), tooltipPortal = _useState6[0], setTooltipPortal = _useState6[1];
    var _useState7 = (0, import_react45.useState)(null), _useState8 = _slicedToArray17(_useState7, 2), legendPortal = _useState8[0], setLegendPortal = _useState8[1];
    var setScaleRef = useReportScale();
    var responsiveContainerCalculations = useResponsiveContainerContext();
    var width = (responsiveContainerCalculations === null || responsiveContainerCalculations === void 0 ? void 0 : responsiveContainerCalculations.width) > 0 ? responsiveContainerCalculations.width : widthFromProps;
    var height = (responsiveContainerCalculations === null || responsiveContainerCalculations === void 0 ? void 0 : responsiveContainerCalculations.height) > 0 ? responsiveContainerCalculations.height : heightFromProps;
    var innerRef = (0, import_react45.useCallback)((node) => {
      setScaleRef(node);
      if (typeof ref === "function") {
        ref(node);
      }
      setTooltipPortal(node);
      setLegendPortal(node);
      if (node != null) {
        containerRef.current = node;
      }
    }, [setScaleRef, ref, setTooltipPortal, setLegendPortal]);
    var myOnClick = (0, import_react45.useCallback)((e) => {
      dispatch(mouseClickAction(e));
      dispatch(externalEventAction({
        handler: onClick,
        reactEvent: e
      }));
    }, [dispatch, onClick]);
    var myOnMouseEnter = (0, import_react45.useCallback)((e) => {
      dispatch(mouseMoveAction(e));
      dispatch(externalEventAction({
        handler: onMouseEnter,
        reactEvent: e
      }));
    }, [dispatch, onMouseEnter]);
    var myOnMouseLeave = (0, import_react45.useCallback)((e) => {
      dispatch(mouseLeaveChart());
      dispatch(externalEventAction({
        handler: onMouseLeave,
        reactEvent: e
      }));
    }, [dispatch, onMouseLeave]);
    var myOnMouseMove = (0, import_react45.useCallback)((e) => {
      dispatch(mouseMoveAction(e));
      dispatch(externalEventAction({
        handler: onMouseMove,
        reactEvent: e
      }));
    }, [dispatch, onMouseMove]);
    var onFocus = (0, import_react45.useCallback)(() => {
      dispatch(focusAction());
    }, [dispatch]);
    var onBlur = (0, import_react45.useCallback)(() => {
      dispatch(blurAction());
    }, [dispatch]);
    var onKeyDown = (0, import_react45.useCallback)((e) => {
      dispatch(keyDownAction(e.key));
    }, [dispatch]);
    var myOnContextMenu = (0, import_react45.useCallback)((e) => {
      dispatch(externalEventAction({
        handler: onContextMenu,
        reactEvent: e
      }));
    }, [dispatch, onContextMenu]);
    var myOnDoubleClick = (0, import_react45.useCallback)((e) => {
      dispatch(externalEventAction({
        handler: onDoubleClick,
        reactEvent: e
      }));
    }, [dispatch, onDoubleClick]);
    var myOnMouseDown = (0, import_react45.useCallback)((e) => {
      dispatch(externalEventAction({
        handler: onMouseDown,
        reactEvent: e
      }));
    }, [dispatch, onMouseDown]);
    var myOnMouseUp = (0, import_react45.useCallback)((e) => {
      dispatch(externalEventAction({
        handler: onMouseUp,
        reactEvent: e
      }));
    }, [dispatch, onMouseUp]);
    var myOnTouchStart = (0, import_react45.useCallback)((e) => {
      dispatch(externalEventAction({
        handler: onTouchStart,
        reactEvent: e
      }));
    }, [dispatch, onTouchStart]);
    var myOnTouchMove = (0, import_react45.useCallback)((e) => {
      if (dispatchTouchEvents) {
        dispatch(touchEventAction(e));
      }
      dispatch(externalEventAction({
        handler: onTouchMove,
        reactEvent: e
      }));
    }, [dispatch, dispatchTouchEvents, onTouchMove]);
    var myOnTouchEnd = (0, import_react45.useCallback)((e) => {
      dispatch(externalEventAction({
        handler: onTouchEnd,
        reactEvent: e
      }));
    }, [dispatch, onTouchEnd]);
    var WrapperDiv = getWrapperDivComponent(responsive);
    return /* @__PURE__ */ React27.createElement(TooltipPortalContext.Provider, {
      value: tooltipPortal
    }, /* @__PURE__ */ React27.createElement(LegendPortalContext.Provider, {
      value: legendPortal
    }, /* @__PURE__ */ React27.createElement(WrapperDiv, {
      width: width !== null && width !== void 0 ? width : style === null || style === void 0 ? void 0 : style.width,
      height: height !== null && height !== void 0 ? height : style === null || style === void 0 ? void 0 : style.height,
      className: clsx("recharts-wrapper", className),
      style: _objectSpread25({
        position: "relative",
        cursor: "default",
        width,
        height
      }, style),
      onClick: myOnClick,
      onContextMenu: myOnContextMenu,
      onDoubleClick: myOnDoubleClick,
      onFocus,
      onBlur,
      onKeyDown,
      onMouseDown: myOnMouseDown,
      onMouseEnter: myOnMouseEnter,
      onMouseLeave: myOnMouseLeave,
      onMouseMove: myOnMouseMove,
      onMouseUp: myOnMouseUp,
      onTouchEnd: myOnTouchEnd,
      onTouchMove: myOnTouchMove,
      onTouchStart: myOnTouchStart,
      ref: innerRef
    }, /* @__PURE__ */ React27.createElement(EventSynchronizer, null), children)));
  });

  // node_modules/recharts/es6/chart/CategoricalChart.js
  var _excluded18 = ["width", "height", "responsive", "children", "className", "style", "compact", "title", "desc"];
  function _objectWithoutProperties18(e, t) {
    if (null == e) return {};
    var o, r2, i = _objectWithoutPropertiesLoose18(e, t);
    if (Object.getOwnPropertySymbols) {
      var n = Object.getOwnPropertySymbols(e);
      for (r2 = 0; r2 < n.length; r2++) o = n[r2], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
  }
  function _objectWithoutPropertiesLoose18(r2, e) {
    if (null == r2) return {};
    var t = {};
    for (var n in r2) if ({}.hasOwnProperty.call(r2, n)) {
      if (-1 !== e.indexOf(n)) continue;
      t[n] = r2[n];
    }
    return t;
  }
  var CategoricalChart = /* @__PURE__ */ (0, import_react46.forwardRef)((props, ref) => {
    var width = props.width, height = props.height, responsive = props.responsive, children = props.children, className = props.className, style = props.style, compact = props.compact, title = props.title, desc = props.desc, others = _objectWithoutProperties18(props, _excluded18);
    var attrs = svgPropertiesNoEvents(others);
    if (compact) {
      return /* @__PURE__ */ React28.createElement(React28.Fragment, null, /* @__PURE__ */ React28.createElement(ReportChartSize, {
        width,
        height
      }), /* @__PURE__ */ React28.createElement(RootSurface, {
        otherAttributes: attrs,
        title,
        desc
      }, children));
    }
    return /* @__PURE__ */ React28.createElement(RechartsWrapper, {
      className,
      style,
      width,
      height,
      responsive: responsive !== null && responsive !== void 0 ? responsive : false,
      onClick: props.onClick,
      onMouseLeave: props.onMouseLeave,
      onMouseEnter: props.onMouseEnter,
      onMouseMove: props.onMouseMove,
      onMouseDown: props.onMouseDown,
      onMouseUp: props.onMouseUp,
      onContextMenu: props.onContextMenu,
      onDoubleClick: props.onDoubleClick,
      onTouchStart: props.onTouchStart,
      onTouchMove: props.onTouchMove,
      onTouchEnd: props.onTouchEnd
    }, /* @__PURE__ */ React28.createElement(RootSurface, {
      otherAttributes: attrs,
      title,
      desc,
      ref
    }, /* @__PURE__ */ React28.createElement(ClipPathProvider, null, children)));
  });

  // node_modules/recharts/es6/chart/CartesianChart.js
  function _extends15() {
    return _extends15 = Object.assign ? Object.assign.bind() : function(n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r2 in t) ({}).hasOwnProperty.call(t, r2) && (n[r2] = t[r2]);
      }
      return n;
    }, _extends15.apply(null, arguments);
  }
  function ownKeys26(e, r2) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r2 && (o = o.filter(function(r3) {
        return Object.getOwnPropertyDescriptor(e, r3).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread26(e) {
    for (var r2 = 1; r2 < arguments.length; r2++) {
      var t = null != arguments[r2] ? arguments[r2] : {};
      r2 % 2 ? ownKeys26(Object(t), true).forEach(function(r3) {
        _defineProperty29(e, r3, t[r3]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys26(Object(t)).forEach(function(r3) {
        Object.defineProperty(e, r3, Object.getOwnPropertyDescriptor(t, r3));
      });
    }
    return e;
  }
  function _defineProperty29(e, r2, t) {
    return (r2 = _toPropertyKey29(r2)) in e ? Object.defineProperty(e, r2, { value: t, enumerable: true, configurable: true, writable: true }) : e[r2] = t, e;
  }
  function _toPropertyKey29(t) {
    var i = _toPrimitive29(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive29(t, r2) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r2 || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r2 ? String : Number)(t);
  }
  var defaultMargin = {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5
  };
  var defaultCartesianChartProps = _objectSpread26({
    accessibilityLayer: true,
    barCategoryGap: "10%",
    barGap: 4,
    layout: "horizontal",
    margin: defaultMargin,
    responsive: false,
    reverseStackOrder: false,
    stackOffset: "none",
    syncMethod: "index"
  }, initialEventSettingsState);
  var CartesianChart = /* @__PURE__ */ (0, import_react47.forwardRef)(function CartesianChart2(props, ref) {
    var _categoricalChartProp;
    var rootChartProps = resolveDefaultProps(props.categoricalChartProps, defaultCartesianChartProps);
    var chartName = props.chartName, defaultTooltipEventType = props.defaultTooltipEventType, validateTooltipEventTypes = props.validateTooltipEventTypes, tooltipPayloadSearcher = props.tooltipPayloadSearcher, categoricalChartProps = props.categoricalChartProps;
    var options = {
      chartName,
      defaultTooltipEventType,
      validateTooltipEventTypes,
      tooltipPayloadSearcher,
      eventEmitter: void 0
    };
    return /* @__PURE__ */ React29.createElement(RechartsStoreProvider, {
      preloadedState: {
        options
      },
      reduxStoreName: (_categoricalChartProp = categoricalChartProps.id) !== null && _categoricalChartProp !== void 0 ? _categoricalChartProp : chartName
    }, /* @__PURE__ */ React29.createElement(ChartDataContextProvider, {
      chartData: categoricalChartProps.data
    }), /* @__PURE__ */ React29.createElement(ReportMainChartProps, {
      layout: rootChartProps.layout,
      margin: rootChartProps.margin
    }), /* @__PURE__ */ React29.createElement(ReportEventSettings, {
      throttleDelay: rootChartProps.throttleDelay,
      throttledEvents: rootChartProps.throttledEvents
    }), /* @__PURE__ */ React29.createElement(ReportChartProps, {
      baseValue: rootChartProps.baseValue,
      accessibilityLayer: rootChartProps.accessibilityLayer,
      barCategoryGap: rootChartProps.barCategoryGap,
      maxBarSize: rootChartProps.maxBarSize,
      stackOffset: rootChartProps.stackOffset,
      barGap: rootChartProps.barGap,
      barSize: rootChartProps.barSize,
      syncId: rootChartProps.syncId,
      syncMethod: rootChartProps.syncMethod,
      className: rootChartProps.className,
      reverseStackOrder: rootChartProps.reverseStackOrder
    }), /* @__PURE__ */ React29.createElement(CategoricalChart, _extends15({}, rootChartProps, {
      ref
    })));
  });

  // node_modules/recharts/es6/chart/BarChart.js
  init_define_import_meta_env();
  var React30 = __toESM(require_react_shim());
  var import_react48 = __toESM(require_react_shim());
  var allowedTooltipTypes = ["axis", "item"];
  var BarChart = /* @__PURE__ */ (0, import_react48.forwardRef)((props, ref) => {
    return /* @__PURE__ */ React30.createElement(CartesianChart, {
      chartName: "BarChart",
      defaultTooltipEventType: "axis",
      validateTooltipEventTypes: allowedTooltipTypes,
      tooltipPayloadSearcher: arrayTooltipSearcher,
      categoricalChartProps: props,
      ref
    });
  });

  // .design-sync/previews/ChartTooltip.tsx
  var import_jsx_runtime = __toESM(require_react_shim());
  var config = {
    reach: { label: "Lượt tiếp cận", color: "#f59e0b" }
  };
  var data = [
    { platform: "TikTok", reach: 1240 },
    { platform: "Instagram", reach: 860 },
    { platform: "Facebook", reach: 540 },
    { platform: "YouTube", reach: 320 }
  ];
  var fmt = (v) => `${new Intl.NumberFormat("vi-VN").format(Number(v))}K`;
  function ActiveTooltip() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: 480, height: 280 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.ChartContainer, { config, className: "h-full w-full", style: { width: 480, height: 280 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, { width: 480, height: 280, data, margin: { top: 48 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, { vertical: false }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, { dataKey: "platform", tickLine: false, axisLine: false }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tickLine: false, axisLine: false, width: 36 }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.ChartTooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ds_exports.ChartTooltipContent, { valueFormatter: fmt }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, { dataKey: "reach", fill: "var(--color-reach)", radius: [6, 6, 0, 0], isAnimationActive: false })
    ] }) }) });
  }
  return __toCommonJS(ChartTooltip_exports);
})();
/*! Bundled license information:

use-sync-external-store/cjs/use-sync-external-store-shim.development.js:
  (**
   * @license React
   * use-sync-external-store-shim.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js:
  (**
   * @license React
   * use-sync-external-store-shim/with-selector.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

use-sync-external-store/cjs/use-sync-external-store-with-selector.development.js:
  (**
   * @license React
   * use-sync-external-store-with-selector.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

decimal.js-light/decimal.js:
  (*! decimal.js-light v2.5.1 https://github.com/MikeMcl/decimal.js-light/LICENCE *)
*/
