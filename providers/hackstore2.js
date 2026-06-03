var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod2) => function __require() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
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
var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/utils/goodstream.js
var require_goodstream = __commonJS({
  "src/utils/goodstream.js"(exports2, module2) {
    var COMMON_UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";
    function getOrigin(url) {
      const match = url.match(/^(https?:\/\/[^\/]+)/i);
      return match ? match[1] : "";
    }
    async function resolve2(embedUrl) {
      try {
        console.log(`[GoodStream] Resolviendo: ${embedUrl}`);
        const origin = getOrigin(embedUrl) || "https://goodstream.one";
        const response = await fetch(embedUrl, {
          headers: {
            "User-Agent": COMMON_UA2,
            "Referer": origin + "/",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
          },
          redirect: "follow"
        });
        if (!response.ok) {
          console.log(`[GoodStream] HTTP ${response.status}`);
          return null;
        }
        const html = await response.text();
        const fileMatch = html.match(/file:\s*"([^"]+)"/);
        if (!fileMatch) {
          console.log('[GoodStream] No se encontr\xF3 patr\xF3n file:"..."');
          return null;
        }
        const videoUrl = fileMatch[1];
        const headers = { Referer: embedUrl, Origin: "https://goodstream.one", "User-Agent": COMMON_UA2 };
        console.log(`[GoodStream] URL encontrada: ${videoUrl.substring(0, 80)}...`);
        return {
          url: videoUrl,
          quality: "HD",
          headers
        };
      } catch (error) {
        console.log(`[GoodStream] Error: ${error.message}`);
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/vimeos.js
var require_vimeos = __commonJS({
  "src/utils/vimeos.js"(exports2, module2) {
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";
    function unpackJS(payload, radix, symtab) {
      const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".substring(0, radix);
      const unbase = (str) => {
        let result = 0;
        for (let i = 0; i < str.length; i++)
          result = result * radix + chars.indexOf(str[i]);
        return result;
      };
      return payload.replace(/\b(\w+)\b/g, (m) => {
        const idx = unbase(m);
        return idx >= 0 && idx < symtab.length && symtab[idx] ? symtab[idx] : m;
      });
    }
    async function k(url) {
      try {
        console.log(`[Vimeos] Resolviendo: ${url}`);
        const res = await fetch(url, {
          headers: { "User-Agent": UA, Referer: "https://vimeos.net/" },
          redirect: "follow"
        });
        if (!res.ok)
          return null;
        const html = await res.text();
        const packMatch = html.match(/eval\(function\(p,a,c,k,e,[dr]\)\{[\s\S]+?\}\('([\s\S]+?)',\s*(\d+),\s*\d+,\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (!packMatch)
          return null;
        const unpacked = unpackJS(packMatch[1], parseInt(packMatch[2]), packMatch[3].split("|"));
        const fileMatch = unpacked.match(/file\s*:\s*["']([^"']+)["']/i);
        if (!fileMatch)
          return null;
        const streamUrl = fileMatch[1];
        console.log(`[Vimeos] URL: ${streamUrl.substring(0, 80)}...`);
        const headers = { "User-Agent": UA, Referer: "https://vimeos.net/" };
        return { url: streamUrl, quality: "HD", headers };
      } catch (err) {
        console.log(`[Vimeos] Error: ${err.message}`);
        return null;
      }
    }
    module2.exports = { resolve: k };
  }
});

// src/utils/common.js
var require_common = __commonJS({
  "src/utils/common.js"(exports2, module2) {
    var G = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    function X(e, t) {
      return e >= 3840 || t >= 2160 ? "4K" : e >= 1920 || t >= 1080 ? "1080p" : e >= 1280 || t >= 720 ? "720p" : e >= 854 || t >= 480 ? "480p" : "360p";
    }
    async function g(e, t = {}) {
      try {
        let response = await fetch(e, { headers: { "User-Agent": G, ...t }, redirect: "follow" });
        let i = await response.text();
        if (!i.includes("#EXT-X-STREAM-INF")) {
          let c = e.match(/[_-](\d{3,4})p/);
          return c ? `${c[1]}p` : "1080p";
        }
        let s = 0, r = 0, u = i.split(`
`);
        for (let c of u) {
          let o = c.match(/RESOLUTION=(\d+)x(\d+)/);
          if (o) {
            let l = parseInt(o[1]), f = parseInt(o[2]);
            f > r && (r = f, s = l);
          }
        }
        return r > 0 ? X(s, r) : "1080p";
      } catch (a) {
        return "1080p";
      }
    }
    module2.exports = { g };
  }
});

// src/utils/hlswish.js
var require_hlswish = __commonJS({
  "src/utils/hlswish.js"(exports2, module2) {
    var { g } = require_common();
    var w = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    function Z(e, t, n) {
      let a = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", i = (s) => {
        let r = 0;
        for (let u = 0; u < s.length; u++) {
          let c = a.indexOf(s[u]);
          if (c === -1)
            return NaN;
          r = r * t + c;
        }
        return r;
      };
      return e.replace(/\b([0-9a-zA-Z]+)\b/g, (s) => {
        let r = i(s);
        return isNaN(r) || r >= n.length ? s : n[r] && n[r] !== "" ? n[r] : s;
      });
    }
    function Y(e, t) {
      let n = e.match(/\{[^{}]*"hls[234]"\s*:\s*"([^"]+)"[^{}]*\}/);
      if (n)
        try {
          let i = n[0].replace(/(\w+)\s*:/g, '"$1":'), s = JSON.parse(i), r = s.hls4 || s.hls3 || s.hls2;
          if (r)
            return r.startsWith("/") ? t + r : r;
        } catch (i) {
          let s = n[0].match(/"hls[234]"\s*:\s*"([^"]+\.m3u8[^"]*)"/);
          if (s) {
            let r = s[1];
            return r.startsWith("/") ? t + r : r;
          }
        }
      let a = e.match(/["']([^"']{30,}\.m3u8[^"']*)['"]/i);
      if (a) {
        let i = a[1];
        return i.startsWith("/") ? t + i : i;
      }
      return null;
    }
    var ee = { "hglink.to": "vibuxer.com", "streamwish.to": "playnixes.com" };
    async function x(e) {
      try {
        let n = e;
        for (let [o, l] of Object.entries(ee))
          if (n.includes(o)) {
            n = n.replace(o, l);
            break;
          }
        let a = (n.match(/^(https?:\/\/[^/]+)/) || [])[1] || "https://hlswish.com";
        console.log(`[HLSWish] Resolviendo: ${e}`);
        let i = await fetch(n, { headers: { "User-Agent": w, Referer: "https://embed69.org/", Origin: "https://embed69.org", Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" }, redirect: "follow" });
        if (!i.ok)
          throw new Error(`HTTP ${i.status}`);
        let s = await i.text(), r = s.match(/file\s*:\s*["']([^"']+)["']/i);
        if (r) {
          let o = r[1];
          if (o.startsWith("/") && (o = a + o), o.includes("vibuxer.com/stream/")) {
            try {
              let f = (await fetch(o, { headers: { "User-Agent": w, Referer: a + "/" }, redirect: "follow" })).url;
              if (f && f.includes(".m3u8"))
                o = f;
            } catch (l) {
            }
          }
          return { url: o, quality: "1080p", headers: { "User-Agent": w, Referer: a + "/" } };
        }
        let u = s.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[^}]+\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
        if (u) {
          let o = Z(u[1], parseInt(u[2]), u[4].split("|")), l = Y(o, a);
          if (l)
            return { url: l, quality: "1080p", headers: { "User-Agent": w, Referer: a + "/" } };
        }
        let c = s.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
        return c ? { url: c[0], quality: "1080p", headers: { "User-Agent": w, Referer: a + "/" } } : null;
      } catch (n) {
        return console.log(`[HLSWish] Error: ${n.message}`), null;
      }
    }
    module2.exports = { resolve: x };
  }
});

// src/utils/voe.js
var require_voe = __commonJS({
  "src/utils/voe.js"(exports2, module2) {
    function O(e) {
      try {
        return typeof atob != "undefined" ? atob(e) : Buffer.from(e, "base64").toString("utf8");
      } catch (t) {
        return null;
      }
    }
    function J(e, t) {
      try {
        let a = t.replace(/^\[|\]$/g, "").split("','").map((o) => o.replace(/^'+|'+$/g, "")).map((o) => o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), i = "";
        for (let o of e) {
          let l = o.charCodeAt(0);
          l > 64 && l < 91 ? l = (l - 52) % 26 + 65 : l > 96 && l < 123 && (l = (l - 84) % 26 + 97), i += String.fromCharCode(l);
        }
        for (let o of a)
          i = i.replace(new RegExp(o, "g"), "_");
        i = i.split("_").join("");
        let s = O(i);
        if (!s)
          return null;
        let r = "";
        for (let o = 0; o < s.length; o++)
          r += String.fromCharCode((s.charCodeAt(o) - 3 + 256) % 256);
        let u = r.split("").reverse().join(""), c = O(u);
        return c ? JSON.parse(c) : null;
      } catch (n) {
        return console.log("[VOE] voeDecode error:", n.message), null;
      }
    }
    var Q = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    async function E(e, t = {}) {
      return await fetch(e, { method: "GET", headers: { "User-Agent": Q, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", ...t }, redirect: "follow" });
    }
    var { g } = require_common();
    async function N(e) {
      try {
        console.log(`[VOE] Resolviendo: ${e}`);
        let t = await E(e, { Referer: e });
        if (!t.ok)
          throw new Error(`HTTP ${t.status}`);
        let n = await t.text();
        if (/permanentToken/i.test(n)) {
          let c = n.match(/window\.location\.href\s*=\s*'([^']+)'/i);
          if (c) {
            let o = await E(c[1], { Referer: e });
            if (o.ok)
              n = await o.text();
          }
        }
        let a = n.match(/json">\s*\[\s*['"]([^'"]+)['"]\s*\]\s*<\/script>\s*<script[^>]*src=['"]([^'"]+)['"]/i);
        if (a) {
          let c = a[1], o = a[2].startsWith("http") ? a[2] : new URL(a[2], e).href;
          let l = await E(o, { Referer: e }), f = l.ok ? await l.text() : "", h = f.match(/(\[(?:'[^']{1,10}'[\s,]*){4,12}\])/i) || f.match(/(\[(?:"[^"]{1,10}"[,\s]*){4,12}\])/i);
          if (h) {
            let d = J(c, h[1]);
            if (d && (d.source || d.direct_access_url)) {
              let m = d.source || d.direct_access_url, $ = await g(m, { Referer: e });
              return { url: m, quality: $, headers: { Referer: e } };
            }
          }
        }
        let i = /(?:mp4|hls)'\s*:\s*'([^']+)'/gi, s = /(?:mp4|hls)"\s*:\s*"([^"]+)"/gi, r = [], u;
        while ((u = i.exec(n)) !== null)
          r.push(u);
        while ((u = s.exec(n)) !== null)
          r.push(u);
        for (let c of r) {
          let o = c[1];
          if (!o)
            continue;
          let l = o;
          if (l.startsWith("aHR0"))
            try {
              l = atob(l);
            } catch (f) {
            }
          return { url: l, quality: await g(l, { Referer: e }), headers: { Referer: e } };
        }
        return null;
      } catch (t) {
        return null;
      }
    }
    module2.exports = { resolve: N, decode: J };
  }
});

// node_modules/@noble/ciphers/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
function abool(b) {
  if (typeof b !== "boolean")
    throw new TypeError(`boolean expected, not ${b}`);
}
function anumber(n) {
  if (typeof n !== "number")
    throw new TypeError("number expected, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new RangeError("positive integer expected, got " + n);
}
function abytes(value, length, title = "") {
  const bytes = isBytes(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    const message = prefix + "expected Uint8Array" + ofLen + ", got " + got;
    if (!bytes)
      throw new TypeError(message);
    throw new RangeError(message);
  }
  return value;
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance, onlyAligned = false) {
  abytes(out, void 0, "output");
  const min = instance.outputLen;
  if (out.length < min) {
    throw new RangeError("digestInto() expects output buffer of length at least " + min);
  }
  if (onlyAligned && !isAligned32(out))
    throw new Error("invalid output, must be aligned");
}
function u8(arr) {
  return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function overlapBytes(a, b) {
  if (!a.byteLength || !b.byteLength)
    return false;
  return a.buffer === b.buffer && // best we can do, may fail with an obscure Proxy
  a.byteOffset < b.byteOffset + b.byteLength && // a starts before b end
  b.byteOffset < a.byteOffset + a.byteLength;
}
function complexOverlapBytes(input, output) {
  if (overlapBytes(input, output) && input.byteOffset < output.byteOffset)
    throw new Error("complex overlap of input and output is not supported");
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
function equalBytes(a, b) {
  if (a.length !== b.length)
    return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++)
    diff |= a[i] ^ b[i];
  return diff === 0;
}
function wrapMacConstructor(keyLen, macCons, fromMsg) {
  const mac = macCons;
  const getArgs = fromMsg || (() => []);
  const macC = (msg, key) => mac(key, ...getArgs(msg)).update(msg).digest();
  const tmp = mac(new Uint8Array(keyLen), ...getArgs(new Uint8Array(0)));
  macC.outputLen = tmp.outputLen;
  macC.blockLen = tmp.blockLen;
  macC.create = (key, ...args) => mac(key, ...args);
  return macC;
}
function getOutput(expectedLength, out, onlyAligned = true) {
  if (out === void 0)
    return new Uint8Array(expectedLength);
  abytes(out, void 0, "output");
  if (out.length !== expectedLength)
    throw new Error('"output" expected Uint8Array of length ' + expectedLength + ", got: " + out.length);
  if (onlyAligned && !isAligned32(out))
    throw new Error("invalid output, must be aligned");
  return out;
}
function u64Lengths(dataLength, aadLength, isLE2) {
  anumber(dataLength);
  anumber(aadLength);
  abool(isLE2);
  const num = new Uint8Array(16);
  const view = createView(num);
  view.setBigUint64(0, BigInt(aadLength), isLE2);
  view.setBigUint64(8, BigInt(dataLength), isLE2);
  return num;
}
function isAligned32(bytes) {
  return bytes.byteOffset % 4 === 0;
}
function copyBytes(bytes) {
  return Uint8Array.from(abytes(bytes));
}
var isLE, byteSwap, swap8IfBE, byteSwap32, swap32IfBE, wrapCipher;
var init_utils = __esm({
  "node_modules/@noble/ciphers/utils.js"() {
    isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
    byteSwap = (word) => word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
    swap8IfBE = isLE ? (n) => n : (n) => byteSwap(n) >>> 0;
    byteSwap32 = (arr) => {
      for (let i = 0; i < arr.length; i++)
        arr[i] = byteSwap(arr[i]);
      return arr;
    };
    swap32IfBE = isLE ? (u) => u : byteSwap32;
    wrapCipher = /* @__NO_SIDE_EFFECTS__ */ (params, constructor) => {
      function wrappedCipher(key, ...args) {
        abytes(key, void 0, "key");
        if (params.nonceLength !== void 0) {
          const nonce = args[0];
          abytes(nonce, params.varSizeNonce ? void 0 : params.nonceLength, "nonce");
        }
        const tagl = params.tagLength;
        if (tagl && args[1] !== void 0)
          abytes(args[1], void 0, "AAD");
        const cipher = constructor(key, ...args);
        const checkOutput = (fnLength, output) => {
          if (output !== void 0) {
            if (fnLength !== 2)
              throw new Error("cipher output not supported");
            abytes(output, void 0, "output");
          }
        };
        let called = false;
        const wrCipher = {
          encrypt(data, output) {
            if (called)
              throw new Error("cannot encrypt() twice with same key + nonce");
            called = true;
            abytes(data);
            checkOutput(cipher.encrypt.length, output);
            return cipher.encrypt(data, output);
          },
          decrypt(data, output) {
            abytes(data);
            if (tagl && data.length < tagl)
              throw new Error('"ciphertext" expected length bigger than tagLength=' + tagl);
            checkOutput(cipher.decrypt.length, output);
            return cipher.decrypt(data, output);
          }
        };
        return wrCipher;
      }
      Object.assign(wrappedCipher, params);
      return wrappedCipher;
    };
  }
});

// node_modules/@noble/ciphers/_polyval.js
function _toGHASHKey(k) {
  k.reverse();
  const hiBit = k[15] & 1;
  let carry = 0;
  for (let i = 0; i < k.length; i++) {
    const t = k[i];
    k[i] = t >>> 1 | carry;
    carry = (t & 1) << 7;
  }
  k[0] ^= -hiBit & 225;
  return k;
}
var BLOCK_SIZE, ZEROS16, ZEROS32, POLY, mul2, swapLE, swap8IfLE, estimateWindow, GHASH, Polyval, ghash, polyval;
var init_polyval = __esm({
  "node_modules/@noble/ciphers/_polyval.js"() {
    init_utils();
    BLOCK_SIZE = 16;
    ZEROS16 = /* @__PURE__ */ new Uint8Array(16);
    ZEROS32 = /* @__PURE__ */ u32(ZEROS16);
    POLY = 225;
    mul2 = (s0, s1, s2, s3) => {
      const hiBit = s3 & 1;
      return {
        s3: s2 << 31 | s3 >>> 1,
        s2: s1 << 31 | s2 >>> 1,
        s1: s0 << 31 | s1 >>> 1,
        // NIST SP 800-38D §6.3 applies `V >> 1` and XORs R on carry. In this
        // 4x32-bit split, R = 0xe1 || 0^120 lives in the top byte of s0.
        s0: s0 >>> 1 ^ POLY << 24 & -(hiBit & 1)
        // reduce % poly
      };
    };
    swapLE = (n) => (n >>> 0 & 255) << 24 | (n >>> 8 & 255) << 16 | (n >>> 16 & 255) << 8 | n >>> 24 & 255 | 0;
    swap8IfLE = (n) => swap8IfBE(swapLE(n));
    estimateWindow = (bytes) => {
      if (bytes > 64 * 1024)
        return 8;
      if (bytes > 1024)
        return 4;
      return 2;
    };
    GHASH = class {
      // We select bits per window adaptively based on expectedLength
      constructor(key, expectedLength) {
        __publicField(this, "blockLen", BLOCK_SIZE);
        __publicField(this, "outputLen", BLOCK_SIZE);
        __publicField(this, "s0", 0);
        __publicField(this, "s1", 0);
        __publicField(this, "s2", 0);
        __publicField(this, "s3", 0);
        __publicField(this, "finished", false);
        __publicField(this, "destroyed", false);
        __publicField(this, "t");
        __publicField(this, "W");
        __publicField(this, "windowSize");
        abytes(key, 16, "key");
        key = copyBytes(key);
        const kView = createView(key);
        let k0 = kView.getUint32(0, false);
        let k1 = kView.getUint32(4, false);
        let k2 = kView.getUint32(8, false);
        let k3 = kView.getUint32(12, false);
        const doubles = [];
        for (let i = 0; i < 128; i++) {
          doubles.push({ s0: swapLE(k0), s1: swapLE(k1), s2: swapLE(k2), s3: swapLE(k3) });
          ({ s0: k0, s1: k1, s2: k2, s3: k3 } = mul2(k0, k1, k2, k3));
        }
        const W = estimateWindow(expectedLength || 1024);
        if (![1, 2, 4, 8].includes(W))
          throw new Error("ghash: invalid window size, expected 2, 4 or 8");
        this.W = W;
        const bits = 128;
        const windows = bits / W;
        const windowSize = this.windowSize = 2 ** W;
        const items = [];
        for (let w = 0; w < windows; w++) {
          for (let byte = 0; byte < windowSize; byte++) {
            let s0 = 0, s1 = 0, s2 = 0, s3 = 0;
            for (let j = 0; j < W; j++) {
              const bit = byte >>> W - j - 1 & 1;
              if (!bit)
                continue;
              const { s0: d0, s1: d1, s2: d2, s3: d3 } = doubles[W * w + j];
              s0 ^= d0, s1 ^= d1, s2 ^= d2, s3 ^= d3;
            }
            items.push({ s0, s1, s2, s3 });
          }
        }
        this.t = items;
      }
      _updateBlock(s0, s1, s2, s3) {
        s0 ^= this.s0, s1 ^= this.s1, s2 ^= this.s2, s3 ^= this.s3;
        const { W, t, windowSize } = this;
        let o0 = 0, o1 = 0, o2 = 0, o3 = 0;
        const mask = (1 << W) - 1;
        let w = 0;
        for (const num of [s0, s1, s2, s3]) {
          for (let bytePos = 0; bytePos < 4; bytePos++) {
            const byte = num >>> 8 * bytePos & 255;
            for (let bitPos = 8 / W - 1; bitPos >= 0; bitPos--) {
              const bit = byte >>> W * bitPos & mask;
              const { s0: e0, s1: e1, s2: e2, s3: e3 } = t[w * windowSize + bit];
              o0 ^= e0, o1 ^= e1, o2 ^= e2, o3 ^= e3;
              w += 1;
            }
          }
        }
        this.s0 = o0;
        this.s1 = o1;
        this.s2 = o2;
        this.s3 = o3;
      }
      update(data) {
        aexists(this);
        abytes(data);
        data = copyBytes(data);
        const b32 = u32(data);
        const blocks = Math.floor(data.length / BLOCK_SIZE);
        const left = data.length % BLOCK_SIZE;
        for (let i = 0; i < blocks; i++) {
          this._updateBlock(swap8IfBE(b32[i * 4 + 0]), swap8IfBE(b32[i * 4 + 1]), swap8IfBE(b32[i * 4 + 2]), swap8IfBE(b32[i * 4 + 3]));
        }
        if (left) {
          ZEROS16.set(data.subarray(blocks * BLOCK_SIZE));
          this._updateBlock(swap8IfBE(ZEROS32[0]), swap8IfBE(ZEROS32[1]), swap8IfBE(ZEROS32[2]), swap8IfBE(ZEROS32[3]));
          clean(ZEROS32);
        }
        return this;
      }
      destroy() {
        this.destroyed = true;
        const { t } = this;
        for (const elm of t) {
          elm.s0 = 0, elm.s1 = 0, elm.s2 = 0, elm.s3 = 0;
        }
      }
      digestInto(out) {
        aexists(this);
        aoutput(out, this, true);
        this.finished = true;
        const { s0, s1, s2, s3 } = this;
        const o32 = u32(out);
        o32[0] = s0;
        o32[1] = s1;
        o32[2] = s2;
        o32[3] = s3;
        swap32IfBE(o32);
      }
      digest() {
        const res = new Uint8Array(BLOCK_SIZE);
        this.digestInto(res);
        this.destroy();
        return res;
      }
    };
    Polyval = class extends GHASH {
      constructor(key, expectedLength) {
        abytes(key);
        const ghKey = _toGHASHKey(copyBytes(key));
        super(ghKey, expectedLength);
        clean(ghKey);
      }
      update(data) {
        aexists(this);
        abytes(data);
        data = copyBytes(data);
        const b32 = u32(data);
        const left = data.length % BLOCK_SIZE;
        const blocks = Math.floor(data.length / BLOCK_SIZE);
        for (let i = 0; i < blocks; i++) {
          this._updateBlock(swap8IfLE(b32[i * 4 + 3]), swap8IfLE(b32[i * 4 + 2]), swap8IfLE(b32[i * 4 + 1]), swap8IfLE(b32[i * 4 + 0]));
        }
        if (left) {
          ZEROS16.set(data.subarray(blocks * BLOCK_SIZE));
          this._updateBlock(swap8IfLE(ZEROS32[3]), swap8IfLE(ZEROS32[2]), swap8IfLE(ZEROS32[1]), swap8IfLE(ZEROS32[0]));
          clean(ZEROS32);
        }
        return this;
      }
      digestInto(out) {
        aexists(this);
        aoutput(out, this, true);
        this.finished = true;
        const view = out.subarray(0, this.outputLen);
        const { s0, s1, s2, s3 } = this;
        const o32 = u32(view);
        o32[0] = s0;
        o32[1] = s1;
        o32[2] = s2;
        o32[3] = s3;
        swap32IfBE(o32);
        view.reverse();
      }
    };
    ghash = /* @__PURE__ */ wrapMacConstructor(16, (key, expectedLength) => new GHASH(key, expectedLength), (msg) => [msg.length]);
    polyval = /* @__PURE__ */ wrapMacConstructor(16, (key, expectedLength) => new Polyval(key, expectedLength), (msg) => [msg.length]);
  }
});

// node_modules/@noble/ciphers/aes.js
var aes_exports = {};
__export(aes_exports, {
  __TESTS: () => __TESTS,
  aeskw: () => aeskw,
  aeskwp: () => aeskwp,
  aessiv: () => aessiv2,
  cbc: () => cbc,
  cfb: () => cfb,
  cmac: () => cmac,
  ctr: () => ctr,
  ecb: () => ecb,
  gcm: () => gcm,
  gcmsiv: () => gcmsiv,
  rngAesCtrDrbg128: () => rngAesCtrDrbg128,
  rngAesCtrDrbg256: () => rngAesCtrDrbg256,
  siv: () => siv,
  unsafe: () => unsafe
});
function validateKeyLength(key) {
  if (![16, 24, 32].includes(key.length))
    throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + key.length);
}
function mul22(n) {
  return n << 1 ^ POLY2 & -(n >> 7);
}
function mul(a, b) {
  let res = 0;
  for (; b > 0; b >>= 1) {
    res ^= a & -(b & 1);
    a = mul22(a);
  }
  return res;
}
function genTtable(sbox2, fn) {
  if (sbox2.length !== 256)
    throw new Error("Wrong sbox length");
  const T0 = new Uint32Array(256).map((_, j) => fn(sbox2[j]));
  const T1 = T0.map(rotl32_8);
  const T2 = T1.map(rotl32_8);
  const T3 = T2.map(rotl32_8);
  const T01 = new Uint32Array(256 * 256);
  const T23 = new Uint32Array(256 * 256);
  const sbox22 = new Uint16Array(256 * 256);
  for (let i = 0; i < 256; i++) {
    for (let j = 0; j < 256; j++) {
      const idx = i * 256 + j;
      T01[idx] = T0[i] ^ T1[j];
      T23[idx] = T2[i] ^ T3[j];
      sbox22[idx] = sbox2[i] << 8 | sbox2[j];
    }
  }
  return { sbox: sbox2, sbox2: sbox22, T0, T1, T2, T3, T01, T23 };
}
function expandKeyLE(key) {
  abytes(key);
  const len = key.length;
  validateKeyLength(key);
  const { sbox2 } = tableEncoding;
  const toClean = [];
  if (!isLE || !isAligned32(key))
    toClean.push(key = copyBytes(key));
  const k32 = swap32IfBE(u32(key));
  const Nk = k32.length;
  const subByte = (n) => applySbox(sbox2, n, n, n, n);
  const xk = new Uint32Array(len + 28);
  xk.set(k32);
  for (let i = Nk; i < xk.length; i++) {
    let t = xk[i - 1];
    if (i % Nk === 0)
      t = subByte(rotr32_8(t)) ^ xPowers[i / Nk - 1];
    else if (Nk > 6 && i % Nk === 4)
      t = subByte(t);
    xk[i] = xk[i - Nk] ^ t;
  }
  clean(...toClean);
  return xk;
}
function expandKeyDecLE(key) {
  const encKey = expandKeyLE(key);
  const xk = encKey.slice();
  const Nk = encKey.length;
  const { sbox2 } = tableEncoding;
  const { T0, T1, T2, T3 } = tableDecoding;
  for (let i = 0; i < Nk; i += 4) {
    for (let j = 0; j < 4; j++)
      xk[i + j] = encKey[Nk - i - 4 + j];
  }
  clean(encKey);
  for (let i = 4; i < Nk - 4; i++) {
    const x = xk[i];
    const w = applySbox(sbox2, x, x, x, x);
    xk[i] = T0[w & 255] ^ T1[w >>> 8 & 255] ^ T2[w >>> 16 & 255] ^ T3[w >>> 24];
  }
  return xk;
}
function apply0123(T01, T23, s0, s1, s2, s3) {
  return T01[s0 << 8 & 65280 | s1 >>> 8 & 255] ^ T23[s2 >>> 8 & 65280 | s3 >>> 24 & 255];
}
function applySbox(sbox2, s0, s1, s2, s3) {
  return sbox2[s0 & 255 | s1 & 65280] | sbox2[s2 >>> 16 & 255 | s3 >>> 16 & 65280] << 16;
}
function encrypt(xk, s0, s1, s2, s3) {
  const { sbox2, T01, T23 } = tableEncoding;
  let k = 0;
  s0 ^= xk[k++], s1 ^= xk[k++], s2 ^= xk[k++], s3 ^= xk[k++];
  const rounds = xk.length / 4 - 2;
  for (let i = 0; i < rounds; i++) {
    const t02 = xk[k++] ^ apply0123(T01, T23, s0, s1, s2, s3);
    const t12 = xk[k++] ^ apply0123(T01, T23, s1, s2, s3, s0);
    const t22 = xk[k++] ^ apply0123(T01, T23, s2, s3, s0, s1);
    const t32 = xk[k++] ^ apply0123(T01, T23, s3, s0, s1, s2);
    s0 = t02, s1 = t12, s2 = t22, s3 = t32;
  }
  const t0 = xk[k++] ^ applySbox(sbox2, s0, s1, s2, s3);
  const t1 = xk[k++] ^ applySbox(sbox2, s1, s2, s3, s0);
  const t2 = xk[k++] ^ applySbox(sbox2, s2, s3, s0, s1);
  const t3 = xk[k++] ^ applySbox(sbox2, s3, s0, s1, s2);
  return { s0: t0, s1: t1, s2: t2, s3: t3 };
}
function decrypt(xk, s0, s1, s2, s3) {
  const { sbox2, T01, T23 } = tableDecoding;
  let k = 0;
  s0 ^= xk[k++], s1 ^= xk[k++], s2 ^= xk[k++], s3 ^= xk[k++];
  const rounds = xk.length / 4 - 2;
  for (let i = 0; i < rounds; i++) {
    const t02 = xk[k++] ^ apply0123(T01, T23, s0, s3, s2, s1);
    const t12 = xk[k++] ^ apply0123(T01, T23, s1, s0, s3, s2);
    const t22 = xk[k++] ^ apply0123(T01, T23, s2, s1, s0, s3);
    const t32 = xk[k++] ^ apply0123(T01, T23, s3, s2, s1, s0);
    s0 = t02, s1 = t12, s2 = t22, s3 = t32;
  }
  const t0 = xk[k++] ^ applySbox(sbox2, s0, s3, s2, s1);
  const t1 = xk[k++] ^ applySbox(sbox2, s1, s0, s3, s2);
  const t2 = xk[k++] ^ applySbox(sbox2, s2, s1, s0, s3);
  const t3 = xk[k++] ^ applySbox(sbox2, s3, s2, s1, s0);
  return { s0: t0, s1: t1, s2: t2, s3: t3 };
}
function ctrCounter(xk, nonce, src, dst) {
  abytes(nonce, BLOCK_SIZE2, "nonce");
  abytes(src);
  const srcLen = src.length;
  dst = getOutput(srcLen, dst);
  complexOverlapBytes(src, dst);
  const ctr2 = nonce;
  const c32 = u32(ctr2);
  const src32 = u32(src);
  const dst32 = u32(dst);
  let { s0, s1, s2, s3 } = encrypt(xk, swap8IfBE(c32[0]), swap8IfBE(c32[1]), swap8IfBE(c32[2]), swap8IfBE(c32[3]));
  for (let i = 0; i + 4 <= src32.length; i += 4) {
    dst32[i + 0] = src32[i + 0] ^ swap8IfBE(s0);
    dst32[i + 1] = src32[i + 1] ^ swap8IfBE(s1);
    dst32[i + 2] = src32[i + 2] ^ swap8IfBE(s2);
    dst32[i + 3] = src32[i + 3] ^ swap8IfBE(s3);
    incBytes(ctr2, false, 1);
    ({ s0, s1, s2, s3 } = encrypt(xk, swap8IfBE(c32[0]), swap8IfBE(c32[1]), swap8IfBE(c32[2]), swap8IfBE(c32[3])));
  }
  const start = BLOCK_SIZE2 * Math.floor(src32.length / BLOCK_SIZE32);
  if (start < srcLen) {
    const b32 = new Uint32Array([s0, s1, s2, s3]);
    swap32IfBE(b32);
    const buf = u8(b32);
    for (let i = start, pos = 0; i < srcLen; i++, pos++)
      dst[i] = src[i] ^ buf[pos];
    clean(b32);
  }
  return dst;
}
function ctr32(xk, isLE2, nonce, src, dst) {
  abytes(nonce, BLOCK_SIZE2, "nonce");
  abytes(src);
  dst = getOutput(src.length, dst);
  const ctr2 = nonce;
  const c32 = u32(ctr2);
  const view = createView(ctr2);
  const src32 = u32(src);
  const dst32 = u32(dst);
  const ctrPos = isLE2 ? 0 : 12;
  const srcLen = src.length;
  let ctrNum = view.getUint32(ctrPos, isLE2);
  let { s0, s1, s2, s3 } = encrypt(xk, swap8IfBE(c32[0]), swap8IfBE(c32[1]), swap8IfBE(c32[2]), swap8IfBE(c32[3]));
  for (let i = 0; i + 4 <= src32.length; i += 4) {
    dst32[i + 0] = src32[i + 0] ^ swap8IfBE(s0);
    dst32[i + 1] = src32[i + 1] ^ swap8IfBE(s1);
    dst32[i + 2] = src32[i + 2] ^ swap8IfBE(s2);
    dst32[i + 3] = src32[i + 3] ^ swap8IfBE(s3);
    ctrNum = ctrNum + 1 >>> 0;
    view.setUint32(ctrPos, ctrNum, isLE2);
    ({ s0, s1, s2, s3 } = encrypt(xk, swap8IfBE(c32[0]), swap8IfBE(c32[1]), swap8IfBE(c32[2]), swap8IfBE(c32[3])));
  }
  const start = BLOCK_SIZE2 * Math.floor(src32.length / BLOCK_SIZE32);
  if (start < srcLen) {
    const b32 = new Uint32Array([s0, s1, s2, s3]);
    swap32IfBE(b32);
    const buf = u8(b32);
    for (let i = start, pos = 0; i < srcLen; i++, pos++)
      dst[i] = src[i] ^ buf[pos];
    clean(b32);
  }
  return dst;
}
function validateBlockDecrypt(data) {
  abytes(data);
  if (data.length % BLOCK_SIZE2 !== 0) {
    throw new Error("aes-(cbc/ecb).decrypt ciphertext should consist of blocks with size " + BLOCK_SIZE2);
  }
}
function validateBlockEncrypt(plaintext, pkcs5, dst) {
  abytes(plaintext);
  let outLen = plaintext.length;
  const remaining = outLen % BLOCK_SIZE2;
  if (!pkcs5 && remaining !== 0)
    throw new Error("aec/(cbc-ecb): unpadded plaintext with disabled padding");
  if (pkcs5) {
    let left = BLOCK_SIZE2 - remaining;
    if (!left)
      left = BLOCK_SIZE2;
    outLen = outLen + left;
  }
  dst = getOutput(outLen, dst);
  complexOverlapBytes(plaintext, dst);
  if (!isLE || !isAligned32(plaintext))
    plaintext = copyBytes(plaintext);
  const b = u32(plaintext);
  swap32IfBE(b);
  const o = u32(dst);
  return { b, o, out: dst };
}
function validatePKCS(data, pkcs5) {
  if (!pkcs5)
    return data;
  const len = data.length;
  if (len === 0)
    throw new Error("aes/pkcs7: empty ciphertext not allowed");
  const lastByte = data[len - 1];
  let valid = 1;
  valid &= lastByte - 1 >>> 31 ^ 1;
  valid &= 16 - lastByte >>> 31 ^ 1;
  for (let i = 0; i < 16; i++) {
    const shouldCheck = i - lastByte >>> 31;
    const eq = (data[len - 1 - i] ^ lastByte) === 0 ? 1 : 0;
    valid &= eq | shouldCheck ^ 1;
  }
  if (!valid)
    throw new Error("aes/pkcs7: wrong padding");
  return data.subarray(0, len - lastByte);
}
function padPCKS(left) {
  const tmp = new Uint8Array(16);
  const tmp32 = u32(tmp);
  tmp.set(left);
  const paddingByte = BLOCK_SIZE2 - left.length;
  for (let i = BLOCK_SIZE2 - paddingByte; i < BLOCK_SIZE2; i++)
    tmp[i] = paddingByte;
  return tmp32;
}
function computeTag(fn, isLE2, key, data, AAD) {
  const aadLength = AAD ? AAD.length : 0;
  const h = fn.create(key, data.length + aadLength);
  if (AAD)
    h.update(AAD);
  const num = u64Lengths(8 * data.length, 8 * aadLength, isLE2);
  h.update(data);
  h.update(num);
  const res = h.digest();
  clean(num);
  return res;
}
function isBytes32(a) {
  return a instanceof Uint32Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint32Array";
}
function encryptBlock(xk, block) {
  abytes(block, 16, "block");
  if (!isBytes32(xk))
    throw new Error("_encryptBlock accepts result of expandKeyLE");
  const b32 = u32(block);
  swap32IfBE(b32);
  let { s0, s1, s2, s3 } = encrypt(xk, b32[0], b32[1], b32[2], b32[3]);
  b32[0] = s0, b32[1] = s1, b32[2] = s2, b32[3] = s3;
  swap32IfBE(b32);
  return block;
}
function decryptBlock(xk, block) {
  abytes(block, 16, "block");
  if (!isBytes32(xk))
    throw new Error("_decryptBlock accepts result of expandKeyLE");
  const b32 = u32(block);
  swap32IfBE(b32);
  let { s0, s1, s2, s3 } = decrypt(xk, b32[0], b32[1], b32[2], b32[3]);
  b32[0] = s0, b32[1] = s1, b32[2] = s2, b32[3] = s3;
  swap32IfBE(b32);
  return block;
}
function dbl(block) {
  let carry = 0;
  for (let i = BLOCK_SIZE2 - 1; i >= 0; i--) {
    const newCarry = (block[i] & 128) >>> 7;
    block[i] = block[i] << 1 | carry;
    carry = newCarry;
  }
  if (carry) {
    block[BLOCK_SIZE2 - 1] ^= 135;
  }
  return block;
}
function xorBlock(a, b) {
  if (a.length !== b.length)
    throw new Error("xorBlock: blocks must have same length");
  for (let i = 0; i < a.length; i++) {
    a[i] = a[i] ^ b[i];
  }
  return a;
}
function xorend(a, b) {
  if (b.length > a.length) {
    throw new Error("xorend: len(B) must be less than or equal to len(A)");
  }
  const offset = a.length - b.length;
  for (let i = 0; i < b.length; i++) {
    a[offset + i] = a[offset + i] ^ b[i];
  }
  return a;
}
function s2v(key, strings) {
  validateKeyLength(key);
  const len = strings.length;
  if (len > 127) {
    throw new Error("s2v: number of input strings must be less than or equal to 127");
  }
  if (len === 0)
    return cmac(ONE_BLOCK, key);
  let d = cmac(EMPTY_BLOCK, key);
  for (let i = 0; i < len - 1; i++) {
    dbl(d);
    const cmacResult = cmac(strings[i], key);
    xorBlock(d, cmacResult);
    clean(cmacResult);
  }
  const s_n = strings[len - 1];
  abytes(s_n);
  let t;
  if (s_n.byteLength >= BLOCK_SIZE2) {
    t = xorend(Uint8Array.from(s_n), d);
  } else {
    const paddedSn = new Uint8Array(BLOCK_SIZE2);
    paddedSn.set(s_n);
    paddedSn[s_n.length] = 128;
    t = xorBlock(dbl(d), paddedSn);
    clean(paddedSn);
  }
  const result = cmac(t, key);
  clean(d, t);
  return result;
}
var BLOCK_SIZE2, BLOCK_SIZE32, EMPTY_BLOCK, ONE_BLOCK, POLY2, incBytes, sbox, invSbox, rotr32_8, rotl32_8, tableEncoding, tableDecoding, xPowers, ctr, ecb, cbc, cfb, gcm, limit, gcmsiv, AESW, AESKW_IV, aeskw, AESKWP_IV, aeskwp, _AesCtrDRBG, createAesDrbg, rngAesCtrDrbg128, rngAesCtrDrbg256, _CMAC, cmac, siv, aessiv2, unsafe, __TESTS;
var init_aes = __esm({
  "node_modules/@noble/ciphers/aes.js"() {
    init_polyval();
    init_utils();
    BLOCK_SIZE2 = 16;
    BLOCK_SIZE32 = 4;
    EMPTY_BLOCK = /* @__PURE__ */ new Uint8Array(BLOCK_SIZE2);
    ONE_BLOCK = /* @__PURE__ */ Uint8Array.from([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1
    ]);
    POLY2 = 283;
    incBytes = (data, isLE2, carry = 1) => {
      if (!Number.isSafeInteger(carry) || carry > 4294967040)
        throw new Error("incBytes: wrong carry " + carry);
      abytes(data);
      for (let i = 0; i < data.length; i++) {
        const pos = !isLE2 ? data.length - 1 - i : i;
        carry = carry + (data[pos] & 255) | 0;
        data[pos] = carry & 255;
        carry >>>= 8;
      }
    };
    sbox = /* @__PURE__ */ (() => {
      const t = new Uint8Array(256);
      for (let i = 0, x = 1; i < 256; i++, x ^= mul22(x))
        t[i] = x;
      const box = new Uint8Array(256);
      box[0] = 99;
      for (let i = 0; i < 255; i++) {
        let x = t[255 - i];
        x |= x << 8;
        box[t[i]] = (x ^ x >> 4 ^ x >> 5 ^ x >> 6 ^ x >> 7 ^ 99) & 255;
      }
      clean(t);
      return box;
    })();
    invSbox = /* @__PURE__ */ sbox.map((_, j) => sbox.indexOf(j));
    rotr32_8 = (n) => n << 24 | n >>> 8;
    rotl32_8 = (n) => n << 8 | n >>> 24;
    tableEncoding = /* @__PURE__ */ genTtable(sbox, (s) => mul(s, 3) << 24 | s << 16 | s << 8 | mul(s, 2));
    tableDecoding = /* @__PURE__ */ genTtable(invSbox, (s) => mul(s, 11) << 24 | mul(s, 13) << 16 | mul(s, 9) << 8 | mul(s, 14));
    xPowers = /* @__PURE__ */ (() => {
      const p = new Uint8Array(16);
      for (let i = 0, x = 1; i < 16; i++, x = mul22(x))
        p[i] = x;
      return p;
    })();
    ctr = /* @__PURE__ */ wrapCipher({ blockSize: 16, nonceLength: 16 }, function aesctr(key, nonce) {
      function processCtr(buf, dst) {
        abytes(buf);
        if (dst !== void 0) {
          abytes(dst);
          if (!isAligned32(dst))
            throw new Error("unaligned destination");
        }
        const xk = expandKeyLE(key);
        const n = copyBytes(nonce);
        const toClean = [xk, n];
        if (!isAligned32(buf))
          toClean.push(buf = copyBytes(buf));
        const out = ctrCounter(xk, n, buf, dst);
        clean(...toClean);
        return out;
      }
      return {
        encrypt: (plaintext, dst) => processCtr(plaintext, dst),
        decrypt: (ciphertext, dst) => processCtr(ciphertext, dst)
      };
    });
    ecb = /* @__PURE__ */ wrapCipher({ blockSize: 16 }, function aesecb(key, opts = {}) {
      const pkcs5 = !opts.disablePadding;
      return {
        encrypt(plaintext, dst) {
          const { b, o, out: _out } = validateBlockEncrypt(plaintext, pkcs5, dst);
          const xk = expandKeyLE(key);
          let i = 0;
          for (; i + 4 <= b.length; ) {
            const { s0, s1, s2, s3 } = encrypt(xk, b[i + 0], b[i + 1], b[i + 2], b[i + 3]);
            o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
          }
          if (pkcs5) {
            const tmp32 = padPCKS(plaintext.subarray(i * 4));
            swap32IfBE(tmp32);
            const { s0, s1, s2, s3 } = encrypt(xk, tmp32[0], tmp32[1], tmp32[2], tmp32[3]);
            o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
          }
          swap32IfBE(o);
          clean(xk);
          return _out;
        },
        decrypt(ciphertext, dst) {
          validateBlockDecrypt(ciphertext);
          const xk = expandKeyDecLE(key);
          dst = getOutput(ciphertext.length, dst);
          const toClean = [xk];
          complexOverlapBytes(ciphertext, dst);
          if (!isLE || !isAligned32(ciphertext))
            toClean.push(ciphertext = copyBytes(ciphertext));
          const b = u32(ciphertext);
          const o = u32(dst);
          swap32IfBE(b);
          for (let i = 0; i + 4 <= b.length; ) {
            const { s0, s1, s2, s3 } = decrypt(xk, b[i + 0], b[i + 1], b[i + 2], b[i + 3]);
            o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
          }
          swap32IfBE(o);
          clean(...toClean);
          return validatePKCS(dst, pkcs5);
        }
      };
    });
    cbc = /* @__PURE__ */ wrapCipher({ blockSize: 16, nonceLength: 16 }, function aescbc(key, iv, opts = {}) {
      const pkcs5 = !opts.disablePadding;
      return {
        encrypt(plaintext, dst) {
          const xk = expandKeyLE(key);
          const { b, o, out: _out } = validateBlockEncrypt(plaintext, pkcs5, dst);
          let _iv = iv;
          const toClean = [xk];
          if (!isLE || !isAligned32(_iv))
            toClean.push(_iv = copyBytes(_iv));
          const n32 = u32(_iv);
          swap32IfBE(n32);
          let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
          let i = 0;
          for (; i + 4 <= b.length; ) {
            s0 ^= b[i + 0], s1 ^= b[i + 1], s2 ^= b[i + 2], s3 ^= b[i + 3];
            ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
            o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
          }
          if (pkcs5) {
            const tmp32 = padPCKS(plaintext.subarray(i * 4));
            swap32IfBE(tmp32);
            s0 ^= tmp32[0], s1 ^= tmp32[1], s2 ^= tmp32[2], s3 ^= tmp32[3];
            ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
            o[i++] = s0, o[i++] = s1, o[i++] = s2, o[i++] = s3;
          }
          swap32IfBE(o);
          clean(...toClean);
          return _out;
        },
        decrypt(ciphertext, dst) {
          validateBlockDecrypt(ciphertext);
          const xk = expandKeyDecLE(key);
          let _iv = iv;
          const toClean = [xk];
          if (!isLE || !isAligned32(_iv))
            toClean.push(_iv = copyBytes(_iv));
          const n32 = u32(_iv);
          swap32IfBE(n32);
          dst = getOutput(ciphertext.length, dst);
          complexOverlapBytes(ciphertext, dst);
          if (!isLE || !isAligned32(ciphertext))
            toClean.push(ciphertext = copyBytes(ciphertext));
          const b = u32(ciphertext);
          const o = u32(dst);
          swap32IfBE(b);
          let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
          for (let i = 0; i + 4 <= b.length; ) {
            const ps0 = s0, ps1 = s1, ps2 = s2, ps3 = s3;
            s0 = b[i + 0], s1 = b[i + 1], s2 = b[i + 2], s3 = b[i + 3];
            const { s0: o0, s1: o1, s2: o2, s3: o3 } = decrypt(xk, s0, s1, s2, s3);
            o[i++] = o0 ^ ps0, o[i++] = o1 ^ ps1, o[i++] = o2 ^ ps2, o[i++] = o3 ^ ps3;
          }
          swap32IfBE(o);
          clean(...toClean);
          return validatePKCS(dst, pkcs5);
        }
      };
    });
    cfb = /* @__PURE__ */ wrapCipher({ blockSize: 16, nonceLength: 16 }, function aescfb(key, iv) {
      function processCfb(src, isEncrypt, dst) {
        abytes(src);
        const srcLen = src.length;
        dst = getOutput(srcLen, dst);
        if (overlapBytes(src, dst))
          throw new Error("overlapping src and dst not supported.");
        const xk = expandKeyLE(key);
        let _iv = iv;
        const toClean = [xk];
        if (!isLE || !isAligned32(_iv))
          toClean.push(_iv = copyBytes(_iv));
        if (!isLE || !isAligned32(src))
          toClean.push(src = copyBytes(src));
        const src32 = u32(src);
        const dst32 = u32(dst);
        const next32 = isEncrypt ? dst32 : src32;
        const n32 = u32(_iv);
        swap32IfBE(src32);
        swap32IfBE(n32);
        let s0 = n32[0], s1 = n32[1], s2 = n32[2], s3 = n32[3];
        for (let i = 0; i + 4 <= src32.length; ) {
          const { s0: e0, s1: e1, s2: e2, s3: e3 } = encrypt(xk, s0, s1, s2, s3);
          dst32[i + 0] = src32[i + 0] ^ e0;
          dst32[i + 1] = src32[i + 1] ^ e1;
          dst32[i + 2] = src32[i + 2] ^ e2;
          dst32[i + 3] = src32[i + 3] ^ e3;
          s0 = next32[i++], s1 = next32[i++], s2 = next32[i++], s3 = next32[i++];
        }
        const start = BLOCK_SIZE2 * Math.floor(src32.length / BLOCK_SIZE32);
        if (start < srcLen) {
          ({ s0, s1, s2, s3 } = encrypt(xk, s0, s1, s2, s3));
          const tmp = new Uint32Array([s0, s1, s2, s3]);
          swap32IfBE(tmp);
          const buf = u8(tmp);
          for (let i = start, pos = 0; i < srcLen; i++, pos++)
            dst[i] = src[i] ^ buf[pos];
          clean(buf);
        }
        swap32IfBE(dst32);
        clean(...toClean);
        return dst;
      }
      return {
        encrypt: (plaintext, dst) => processCfb(plaintext, true, dst),
        decrypt: (ciphertext, dst) => processCfb(ciphertext, false, dst)
      };
    });
    gcm = /* @__PURE__ */ wrapCipher({ blockSize: 16, nonceLength: 12, tagLength: 16, varSizeNonce: true }, function aesgcm(key, nonce, AAD) {
      if (nonce.length < 8)
        throw new Error("aes/gcm: invalid nonce length");
      const tagLength = 16;
      function _computeTag(authKey, tagMask, data) {
        const tag = computeTag(ghash, false, authKey, data, AAD);
        for (let i = 0; i < tagMask.length; i++)
          tag[i] ^= tagMask[i];
        return tag;
      }
      function deriveKeys() {
        const xk = expandKeyLE(key);
        const authKey = EMPTY_BLOCK.slice();
        const counter = EMPTY_BLOCK.slice();
        ctr32(xk, false, counter, counter, authKey);
        if (nonce.length === 12) {
          counter.set(nonce);
        } else {
          const nonceLen = EMPTY_BLOCK.slice();
          const view = createView(nonceLen);
          view.setBigUint64(8, BigInt(nonce.length * 8), false);
          const g = ghash.create(authKey).update(nonce).update(nonceLen);
          g.digestInto(counter);
          g.destroy();
        }
        const tagMask = ctr32(xk, false, counter, EMPTY_BLOCK);
        return { xk, authKey, counter, tagMask };
      }
      return {
        encrypt(plaintext) {
          const { xk, authKey, counter, tagMask } = deriveKeys();
          const out = new Uint8Array(plaintext.length + tagLength);
          const toClean = [xk, authKey, counter, tagMask];
          if (!isAligned32(plaintext))
            toClean.push(plaintext = copyBytes(plaintext));
          ctr32(xk, false, counter, plaintext, out.subarray(0, plaintext.length));
          const tag = _computeTag(authKey, tagMask, out.subarray(0, out.length - tagLength));
          toClean.push(tag);
          out.set(tag, plaintext.length);
          clean(...toClean);
          return out;
        },
        decrypt(ciphertext) {
          const { xk, authKey, counter, tagMask } = deriveKeys();
          const toClean = [xk, authKey, tagMask, counter];
          if (!isAligned32(ciphertext))
            toClean.push(ciphertext = copyBytes(ciphertext));
          const data = ciphertext.subarray(0, -tagLength);
          const passedTag = ciphertext.subarray(-tagLength);
          const tag = _computeTag(authKey, tagMask, data);
          toClean.push(tag);
          if (!equalBytes(tag, passedTag)) {
            clean(...toClean);
            throw new Error("aes/gcm: invalid ghash tag");
          }
          const out = ctr32(xk, false, counter, data);
          clean(...toClean);
          return out;
        }
      };
    });
    limit = (name, min, max) => (value) => {
      if (!Number.isSafeInteger(value) || min > value || value > max) {
        const minmax = "[" + min + ".." + max + "]";
        throw new Error("" + name + ": expected value in range " + minmax + ", got " + value);
      }
    };
    gcmsiv = /* @__PURE__ */ wrapCipher({ blockSize: 16, nonceLength: 12, tagLength: 16, varSizeNonce: true }, function aessiv(key, nonce, AAD) {
      const tagLength = 16;
      const AAD_LIMIT = limit("AAD", 0, 2 ** 36);
      const PLAIN_LIMIT = limit("plaintext", 0, 2 ** 36);
      const NONCE_LIMIT = limit("nonce", 12, 12);
      const CIPHER_LIMIT = limit("ciphertext", 16, 2 ** 36 + 16);
      abytes(key);
      validateKeyLength(key);
      NONCE_LIMIT(nonce.length);
      if (AAD !== void 0)
        AAD_LIMIT(AAD.length);
      function deriveKeys() {
        const xk = expandKeyLE(key);
        const encKey = new Uint8Array(key.length);
        const authKey = new Uint8Array(16);
        const toClean = [xk, encKey];
        let _nonce = nonce;
        if (!isLE || !isAligned32(_nonce))
          toClean.push(_nonce = copyBytes(_nonce));
        const n32 = u32(_nonce);
        swap32IfBE(n32);
        let s0 = 0, s1 = n32[0], s2 = n32[1], s3 = n32[2];
        let counter = 0;
        for (const derivedKey of [authKey, encKey].map(u32)) {
          const d32 = u32(derivedKey);
          for (let i = 0; i < d32.length; i += 2) {
            const { s0: o0, s1: o1 } = encrypt(xk, s0, s1, s2, s3);
            d32[i + 0] = o0;
            d32[i + 1] = o1;
            s0 = ++counter;
          }
          swap32IfBE(d32);
        }
        const res = { authKey, encKey: expandKeyLE(encKey) };
        clean(...toClean);
        return res;
      }
      function _computeTag(encKey, authKey, data) {
        const tag = computeTag(polyval, true, authKey, data, AAD);
        for (let i = 0; i < 12; i++)
          tag[i] ^= nonce[i];
        tag[15] &= 127;
        const t32 = u32(tag);
        swap32IfBE(t32);
        let s0 = t32[0], s1 = t32[1], s2 = t32[2], s3 = t32[3];
        ({ s0, s1, s2, s3 } = encrypt(encKey, s0, s1, s2, s3));
        t32[0] = s0, t32[1] = s1, t32[2] = s2, t32[3] = s3;
        swap32IfBE(t32);
        return tag;
      }
      function processSiv(encKey, tag, input) {
        let block = copyBytes(tag);
        block[15] |= 128;
        const res = ctr32(encKey, true, block, input);
        clean(block);
        return res;
      }
      return {
        encrypt(plaintext) {
          PLAIN_LIMIT(plaintext.length);
          const { encKey, authKey } = deriveKeys();
          const tag = _computeTag(encKey, authKey, plaintext);
          const toClean = [encKey, authKey, tag];
          if (!isAligned32(plaintext))
            toClean.push(plaintext = copyBytes(plaintext));
          const out = new Uint8Array(plaintext.length + tagLength);
          out.set(tag, plaintext.length);
          out.set(processSiv(encKey, tag, plaintext));
          clean(...toClean);
          return out;
        },
        decrypt(ciphertext) {
          CIPHER_LIMIT(ciphertext.length);
          const tag = ciphertext.subarray(-tagLength);
          const { encKey, authKey } = deriveKeys();
          const toClean = [encKey, authKey];
          if (!isAligned32(ciphertext))
            toClean.push(ciphertext = copyBytes(ciphertext));
          const plaintext = processSiv(encKey, tag, ciphertext.subarray(0, -tagLength));
          const expectedTag = _computeTag(encKey, authKey, plaintext);
          toClean.push(expectedTag);
          if (!equalBytes(tag, expectedTag)) {
            clean(...toClean);
            throw new Error("invalid polyval tag");
          }
          clean(...toClean);
          return plaintext;
        }
      };
    });
    AESW = {
      /*
      High-level pseudocode:
      ```
      A: u64 = IV
      out = []
      for (let i=0, ctr = 0; i<6; i++) {
        for (const chunk of chunks(plaintext, 8)) {
          A ^= swapEndianess(ctr++)
          [A, res] = chunks(encrypt(A || chunk), 8);
          out ||= res
        }
      }
      out = A || out
      ```
      Decrypt is the same, but reversed.
      */
      encrypt(kek, out) {
        if (out.length >= 2 ** 32)
          throw new Error("plaintext should be less than 4gb");
        const xk = expandKeyLE(kek);
        if (out.length === 16)
          encryptBlock(xk, out);
        else {
          const o32 = u32(out);
          swap32IfBE(o32);
          let a0 = o32[0], a1 = o32[1];
          for (let j = 0, ctr2 = 1; j < 6; j++) {
            for (let pos = 2; pos < o32.length; pos += 2, ctr2++) {
              const { s0, s1, s2, s3 } = encrypt(xk, a0, a1, o32[pos], o32[pos + 1]);
              a0 = s0, a1 = s1 ^ byteSwap(ctr2), o32[pos] = s2, o32[pos + 1] = s3;
            }
          }
          o32[0] = a0, o32[1] = a1;
          swap32IfBE(o32);
        }
        xk.fill(0);
      },
      decrypt(kek, out) {
        if (out.length - 8 >= 2 ** 32)
          throw new Error("ciphertext should be less than 4gb");
        const xk = expandKeyDecLE(kek);
        const chunks = out.length / 8 - 1;
        if (chunks === 1)
          decryptBlock(xk, out);
        else {
          const o32 = u32(out);
          swap32IfBE(o32);
          let a0 = o32[0], a1 = o32[1];
          for (let j = 0, ctr2 = chunks * 6; j < 6; j++) {
            for (let pos = chunks * 2; pos >= 1; pos -= 2, ctr2--) {
              a1 ^= byteSwap(ctr2);
              const { s0, s1, s2, s3 } = decrypt(xk, a0, a1, o32[pos], o32[pos + 1]);
              a0 = s0, a1 = s1, o32[pos] = s2, o32[pos + 1] = s3;
            }
          }
          o32[0] = a0, o32[1] = a1;
          swap32IfBE(o32);
        }
        xk.fill(0);
      }
    };
    AESKW_IV = /* @__PURE__ */ new Uint8Array(8).fill(166);
    aeskw = /* @__PURE__ */ wrapCipher({ blockSize: 8 }, (kek) => ({
      encrypt(plaintext) {
        if (!plaintext.length || plaintext.length % 8 !== 0)
          throw new Error("invalid plaintext length");
        if (plaintext.length === 8)
          throw new Error("8-byte keys not allowed in AESKW, use AESKWP instead");
        const out = concatBytes(AESKW_IV, plaintext);
        AESW.encrypt(kek, out);
        return out;
      },
      decrypt(ciphertext) {
        if (ciphertext.length % 8 !== 0 || ciphertext.length < 3 * 8)
          throw new Error("invalid ciphertext length");
        const out = copyBytes(ciphertext);
        AESW.decrypt(kek, out);
        if (!equalBytes(out.subarray(0, 8), AESKW_IV))
          throw new Error("integrity check failed");
        out.subarray(0, 8).fill(0);
        return out.subarray(8);
      }
    }));
    AESKWP_IV = 2790873510;
    aeskwp = /* @__PURE__ */ wrapCipher({ blockSize: 8 }, (kek) => ({
      encrypt(plaintext) {
        if (!plaintext.length)
          throw new Error("invalid plaintext length");
        const padded = Math.ceil(plaintext.length / 8) * 8;
        const out = new Uint8Array(8 + padded);
        out.set(plaintext, 8);
        const out32 = u32(out);
        out32[0] = swap8IfBE(AESKWP_IV);
        out32[1] = swap8IfBE(byteSwap(plaintext.length));
        AESW.encrypt(kek, out);
        return out;
      },
      decrypt(ciphertext) {
        if (ciphertext.length < 16)
          throw new Error("invalid ciphertext length");
        const out = copyBytes(ciphertext);
        const o32 = u32(out);
        AESW.decrypt(kek, out);
        const len = byteSwap(swap8IfBE(o32[1])) >>> 0;
        const padded = Math.ceil(len / 8) * 8;
        if (swap8IfBE(o32[0]) !== AESKWP_IV || out.length - 8 !== padded)
          throw new Error("integrity check failed");
        for (let i = len; i < padded; i++)
          if (out[8 + i] !== 0)
            throw new Error("integrity check failed");
        out.subarray(0, 8).fill(0);
        return out.subarray(8, 8 + len);
      }
    }));
    _AesCtrDRBG = class {
      constructor(keyLen, seed, personalization) {
        __publicField(this, "blockLen");
        __publicField(this, "key");
        __publicField(this, "nonce");
        __publicField(this, "state");
        __publicField(this, "reseedCnt");
        this.blockLen = ctr.blockSize;
        const keyLenBytes = keyLen / 8;
        const nonceLen = 16;
        this.state = new Uint8Array(keyLenBytes + nonceLen);
        this.key = this.state.subarray(0, keyLenBytes);
        this.nonce = this.state.subarray(keyLenBytes, keyLenBytes + nonceLen);
        this.reseedCnt = 1;
        incBytes(this.nonce, false, 1);
        this.addEntropy(seed, personalization);
      }
      update(data) {
        ctr(this.key, this.nonce).encrypt(new Uint8Array(this.state.length), this.state);
        if (data) {
          abytes(data);
          for (let i = 0; i < data.length; i++)
            this.state[i] ^= data[i];
        }
        incBytes(this.nonce, false, 1);
      }
      // Optional `info` is additional input XORed into the reseed block and is
      // limited to the internal state width.
      addEntropy(seed, info) {
        abytes(seed, this.state.length, "seed");
        const _seed = seed.slice();
        if (info) {
          abytes(info);
          if (info.length > _seed.length)
            throw new Error("info length is too big");
          for (let i = 0; i < info.length; i++)
            _seed[i] ^= info[i];
        }
        this.update(_seed);
        _seed.fill(0);
        this.reseedCnt = 1;
      }
      // Optional `info` is additional input for the pre/post-update steps; bytes
      // SP 800-90A Rev. 1 CTR_DRBG without a derivation function limits
      // additional_input to seedlen, which is exactly this internal state width.
      randomBytes(len, info) {
        anumber(len);
        if (len > 2 ** 16)
          throw new Error("requested output is too big");
        if (this.reseedCnt > 2 ** 48)
          throw new Error("entropy exhausted");
        if (info) {
          abytes(info);
          if (info.length > this.state.length)
            throw new Error("info length is too big");
          this.update(info);
        }
        const res = new Uint8Array(len);
        ctr(this.key, this.nonce).encrypt(res, res);
        incBytes(this.nonce, false, Math.ceil(len / this.blockLen));
        this.update(info);
        this.reseedCnt++;
        return res;
      }
      // Zeroes the current state and resets the counter, but does not make the
      // instance unusable: later calls continue from the zeroed state.
      clean() {
        this.state.fill(0);
        this.reseedCnt = 0;
      }
    };
    createAesDrbg = (keyLen) => {
      return (seed, personalization = void 0) => new _AesCtrDRBG(keyLen, seed, personalization);
    };
    rngAesCtrDrbg128 = /* @__PURE__ */ createAesDrbg(128);
    rngAesCtrDrbg256 = /* @__PURE__ */ createAesDrbg(256);
    _CMAC = class {
      constructor(key) {
        __publicField(this, "blockLen", BLOCK_SIZE2);
        __publicField(this, "outputLen", BLOCK_SIZE2);
        // CMAC can only decide between `K1` and `K2` once the true final block is known,
        // so updates process older blocks eagerly but keep one pending block buffered.
        __publicField(this, "buffer");
        __publicField(this, "pos");
        __publicField(this, "finished");
        __publicField(this, "destroyed");
        __publicField(this, "k1");
        __publicField(this, "k2");
        __publicField(this, "x");
        __publicField(this, "xk");
        abytes(key);
        validateKeyLength(key);
        this.xk = expandKeyLE(key);
        this.buffer = new Uint8Array(BLOCK_SIZE2);
        this.pos = 0;
        this.finished = false;
        this.destroyed = false;
        this.x = new Uint8Array(BLOCK_SIZE2);
        const L = new Uint8Array(BLOCK_SIZE2);
        encryptBlock(this.xk, L);
        this.k1 = dbl(L);
        this.k2 = dbl(new Uint8Array(this.k1));
      }
      process(data) {
        xorBlock(this.x, data);
        encryptBlock(this.xk, this.x);
      }
      update(data) {
        if (this.destroyed)
          throw new Error("Hash instance has been destroyed");
        if (this.finished)
          throw new Error("Hash#digest() has already been called");
        abytes(data);
        let pos = 0;
        if (this.pos) {
          const take = Math.min(BLOCK_SIZE2 - this.pos, data.length);
          this.buffer.set(data.subarray(0, take), this.pos);
          this.pos += take;
          pos = take;
          if (this.pos === BLOCK_SIZE2 && pos < data.length) {
            this.process(this.buffer);
            this.pos = 0;
          }
        }
        while (pos + BLOCK_SIZE2 < data.length) {
          this.process(data.subarray(pos, pos + BLOCK_SIZE2));
          pos += BLOCK_SIZE2;
        }
        if (pos < data.length) {
          this.buffer.set(data.subarray(pos), 0);
          this.pos = data.length - pos;
        }
        return this;
      }
      // See {@link https://www.rfc-editor.org/rfc/rfc4493.html#section-2.4 | RFC 4493 Section 2.4}.
      digestInto(out) {
        if (this.destroyed)
          throw new Error("Hash instance has been destroyed");
        if (this.finished)
          throw new Error("Hash#digest() has already been called");
        aoutput(out, this, true);
        this.finished = true;
        const view = out.subarray(0, this.outputLen);
        let last = new Uint8Array(BLOCK_SIZE2);
        if (this.pos === BLOCK_SIZE2) {
          last.set(this.buffer);
          xorBlock(last, this.k1);
        } else {
          last.set(this.buffer.subarray(0, this.pos));
          last[this.pos] = 128;
          xorBlock(last, this.k2);
        }
        view.set(this.x);
        xorBlock(view, last);
        encryptBlock(this.xk, view);
        clean(last);
      }
      digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
      }
      destroy() {
        const { buffer, destroyed, x, xk, k1, k2 } = this;
        if (destroyed)
          return;
        this.destroyed = true;
        clean(buffer, x, xk, k1, k2);
      }
    };
    cmac = /* @__PURE__ */ wrapMacConstructor(16, (key) => new _CMAC(key));
    siv = () => {
      throw new Error('"siv" from v1 is now "gcmsiv"');
    };
    aessiv2 = /* @__PURE__ */ wrapCipher({ blockSize: 16, tagLength: 16 }, function aessiv3(key, ...AAD) {
      const PLAIN_LIMIT = limit("plaintext", 0, 2 ** 132);
      const CIPHER_LIMIT = limit("ciphertext", 16, 2 ** 132 + 16);
      if (AAD.length > 126) {
        throw new Error('"AAD" number of elements must be less than or equal to 126');
      }
      AAD.forEach((aad) => abytes(aad));
      abytes(key);
      if (![32, 48, 64].includes(key.length))
        throw new Error('"aes key" expected Uint8Array of length 32/48/64, got length=' + key.length);
      const k1 = key.subarray(0, key.length / 2);
      const k2 = key.subarray(key.length / 2);
      return {
        // {@link https://datatracker.ietf.org/doc/html/rfc5297.html#section-2.6 | RFC 5297 Section 2.6}
        encrypt(plaintext) {
          PLAIN_LIMIT(plaintext.length);
          const v = s2v(k1, [...AAD, plaintext]);
          const q = Uint8Array.from(v);
          q[8] &= 127;
          q[12] &= 127;
          const c = ctr(k2, q).encrypt(plaintext);
          return concatBytes(v, c);
        },
        // {@link https://datatracker.ietf.org/doc/html/rfc5297.html#section-2.7 | RFC 5297 Section 2.7}
        decrypt(ciphertext) {
          CIPHER_LIMIT(ciphertext.length);
          const v = ciphertext.subarray(0, BLOCK_SIZE2);
          const c = ciphertext.subarray(BLOCK_SIZE2);
          const q = Uint8Array.from(v);
          q[8] &= 127;
          q[12] &= 127;
          const p = ctr(k2, q).decrypt(c);
          const t = s2v(k1, [...AAD, p]);
          if (equalBytes(t, v)) {
            return p;
          } else {
            throw new Error("invalid siv tag");
          }
        }
      };
    });
    unsafe = /* @__PURE__ */ Object.freeze({
      expandKeyLE,
      expandKeyDecLE,
      encrypt,
      decrypt,
      encryptBlock,
      decryptBlock,
      ctrCounter,
      ctr32,
      dbl,
      xorBlock,
      xorend,
      s2v
    });
    __TESTS = /* @__PURE__ */ Object.freeze({
      incBytes
    });
  }
});

// node_modules/@noble/hashes/utils.js
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
function anumber2(n, title = "") {
  if (typeof n !== "number") {
    const prefix = title && `"${title}" `;
    throw new TypeError(`${prefix}expected number, got ${typeof n}`);
  }
  if (!Number.isSafeInteger(n) || n < 0) {
    const prefix = title && `"${title}" `;
    throw new RangeError(`${prefix}expected integer >= 0, got ${n}`);
  }
}
function abytes2(value, length, title = "") {
  const bytes = isBytes2(value);
  const len = value?.length;
  const needsLen = length !== void 0;
  if (!bytes || needsLen && len !== length) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value}`;
    const message = prefix + "expected Uint8Array" + ofLen + ", got " + got;
    if (!bytes)
      throw new TypeError(message);
    throw new RangeError(message);
  }
  return value;
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new TypeError("Hash must wrapped by utils.createHasher");
  anumber2(h.outputLen);
  anumber2(h.blockLen);
  if (h.outputLen < 1)
    throw new Error('"outputLen" must be >= 1');
  if (h.blockLen < 1)
    throw new Error('"blockLen" must be >= 1');
}
function aexists2(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput2(out, instance) {
  abytes2(out, void 0, "digestInto() output");
  const min = instance.outputLen;
  if (out.length < min) {
    throw new RangeError('"digestInto() output" expected to be of length >=' + min);
  }
}
function clean2(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView2(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function bytesToHex(bytes) {
  abytes2(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]];
  }
  return hex;
}
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new TypeError("hex string expected, got " + typeof hex);
  if (hasHexBuiltin) {
    try {
      return Uint8Array.fromHex(hex);
    } catch (error) {
      if (error instanceof SyntaxError)
        throw new RangeError(error.message);
      throw error;
    }
  }
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new RangeError("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new RangeError('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new TypeError("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function concatBytes2(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes2(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
function createHasher(hashCons, info = {}) {
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.canXOF = tmp.canXOF;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
function randomBytes(bytesLength = 32) {
  anumber2(bytesLength, "bytesLength");
  const cr = typeof globalThis === "object" ? globalThis.crypto : null;
  if (typeof cr?.getRandomValues !== "function")
    throw new Error("crypto.getRandomValues must be defined");
  if (bytesLength > 65536)
    throw new RangeError(`"bytesLength" expected <= 65536, got ${bytesLength}`);
  return cr.getRandomValues(new Uint8Array(bytesLength));
}
var hasHexBuiltin, hexes, asciis, oidNist;
var init_utils2 = __esm({
  "node_modules/@noble/hashes/utils.js"() {
    hasHexBuiltin = /* @__PURE__ */ (() => (
      // @ts-ignore
      typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
    ))();
    hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
    asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
    oidNist = (suffix) => ({
      // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
      // Larger suffix values would need base-128 OID encoding and a different length byte.
      oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
    });
  }
});

// node_modules/@noble/hashes/_md.js
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD, SHA256_IV, SHA224_IV, SHA384_IV, SHA512_IV;
var init_md = __esm({
  "node_modules/@noble/hashes/_md.js"() {
    init_utils2();
    HashMD = class {
      constructor(blockLen, outputLen, padOffset, isLE2) {
        __publicField(this, "blockLen");
        __publicField(this, "outputLen");
        __publicField(this, "canXOF", false);
        __publicField(this, "padOffset");
        __publicField(this, "isLE");
        // For partial updates less than block size
        __publicField(this, "buffer");
        __publicField(this, "view");
        __publicField(this, "finished", false);
        __publicField(this, "length", 0);
        __publicField(this, "pos", 0);
        __publicField(this, "destroyed", false);
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE2;
        this.buffer = new Uint8Array(blockLen);
        this.view = createView2(this.buffer);
      }
      update(data) {
        aexists2(this);
        abytes2(data);
        const { view, buffer, blockLen } = this;
        const len = data.length;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          if (take === blockLen) {
            const dataView = createView2(data);
            for (; blockLen <= len - pos; pos += blockLen)
              this.process(dataView, pos);
            continue;
          }
          buffer.set(data.subarray(pos, pos + take), this.pos);
          this.pos += take;
          pos += take;
          if (this.pos === blockLen) {
            this.process(view, 0);
            this.pos = 0;
          }
        }
        this.length += data.length;
        this.roundClean();
        return this;
      }
      digestInto(out) {
        aexists2(this);
        aoutput2(out, this);
        this.finished = true;
        const { buffer, view, blockLen, isLE: isLE2 } = this;
        let { pos } = this;
        buffer[pos++] = 128;
        clean2(this.buffer.subarray(pos));
        if (this.padOffset > blockLen - pos) {
          this.process(view, 0);
          pos = 0;
        }
        for (let i = pos; i < blockLen; i++)
          buffer[i] = 0;
        view.setBigUint64(blockLen - 8, BigInt(this.length * 8), isLE2);
        this.process(view, 0);
        const oview = createView2(out);
        const len = this.outputLen;
        if (len % 4)
          throw new Error("_sha2: outputLen must be aligned to 32bit");
        const outLen = len / 4;
        const state = this.get();
        if (outLen > state.length)
          throw new Error("_sha2: outputLen bigger than state");
        for (let i = 0; i < outLen; i++)
          oview.setUint32(4 * i, state[i], isLE2);
      }
      digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
      }
      _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer, length, finished, destroyed, pos } = this;
        to.destroyed = destroyed;
        to.finished = finished;
        to.length = length;
        to.pos = pos;
        if (length % blockLen)
          to.buffer.set(buffer);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
    };
    SHA256_IV = /* @__PURE__ */ Uint32Array.from([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
    SHA224_IV = /* @__PURE__ */ Uint32Array.from([
      3238371032,
      914150663,
      812702999,
      4144912697,
      4290775857,
      1750603025,
      1694076839,
      3204075428
    ]);
    SHA384_IV = /* @__PURE__ */ Uint32Array.from([
      3418070365,
      3238371032,
      1654270250,
      914150663,
      2438529370,
      812702999,
      355462360,
      4144912697,
      1731405415,
      4290775857,
      2394180231,
      1750603025,
      3675008525,
      1694076839,
      1203062813,
      3204075428
    ]);
    SHA512_IV = /* @__PURE__ */ Uint32Array.from([
      1779033703,
      4089235720,
      3144134277,
      2227873595,
      1013904242,
      4271175723,
      2773480762,
      1595750129,
      1359893119,
      2917565137,
      2600822924,
      725511199,
      528734635,
      4215389547,
      1541459225,
      327033209
    ]);
  }
});

// node_modules/@noble/hashes/_u64.js
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
var U32_MASK64, _32n, shrSH, shrSL, rotrSH, rotrSL, rotrBH, rotrBL, add3L, add3H, add4L, add4H, add5L, add5H;
var init_u64 = __esm({
  "node_modules/@noble/hashes/_u64.js"() {
    U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
    _32n = /* @__PURE__ */ BigInt(32);
    shrSH = (h, _l, s) => h >>> s;
    shrSL = (h, l, s) => h << 32 - s | l >>> s;
    rotrSH = (h, l, s) => h >>> s | l << 32 - s;
    rotrSL = (h, l, s) => h << 32 - s | l >>> s;
    rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
    rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
    add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
    add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
    add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
    add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
    add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
    add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
  }
});

// node_modules/@noble/hashes/sha2.js
var sha2_exports = {};
__export(sha2_exports, {
  _SHA224: () => _SHA224,
  _SHA256: () => _SHA256,
  _SHA384: () => _SHA384,
  _SHA512: () => _SHA512,
  _SHA512_224: () => _SHA512_224,
  _SHA512_256: () => _SHA512_256,
  sha224: () => sha224,
  sha256: () => sha256,
  sha384: () => sha384,
  sha512: () => sha512,
  sha512_224: () => sha512_224,
  sha512_256: () => sha512_256
});
var SHA256_K, SHA256_W, SHA2_32B, _SHA256, _SHA224, K512, SHA512_Kh, SHA512_Kl, SHA512_W_H, SHA512_W_L, SHA2_64B, _SHA512, _SHA384, T224_IV, T256_IV, _SHA512_224, _SHA512_256, sha256, sha224, sha512, sha384, sha512_256, sha512_224;
var init_sha2 = __esm({
  "node_modules/@noble/hashes/sha2.js"() {
    init_md();
    init_u64();
    init_utils2();
    SHA256_K = /* @__PURE__ */ Uint32Array.from([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    SHA256_W = /* @__PURE__ */ new Uint32Array(64);
    SHA2_32B = class extends HashMD {
      constructor(outputLen) {
        super(64, outputLen, 8, false);
      }
      get() {
        const { A, B, C, D, E, F, G, H } = this;
        return [A, B, C, D, E, F, G, H];
      }
      // prettier-ignore
      set(A, B, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4)
          SHA256_W[i] = view.getUint32(offset, false);
        for (let i = 16; i < 64; i++) {
          const W15 = SHA256_W[i - 15];
          const W2 = SHA256_W[i - 2];
          const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
          const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
          SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
        }
        let { A, B, C, D, E, F, G, H } = this;
        for (let i = 0; i < 64; i++) {
          const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
          const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
          const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
          const T2 = sigma0 + Maj(A, B, C) | 0;
          H = G;
          G = F;
          F = E;
          E = D + T1 | 0;
          D = C;
          C = B;
          B = A;
          A = T1 + T2 | 0;
        }
        A = A + this.A | 0;
        B = B + this.B | 0;
        C = C + this.C | 0;
        D = D + this.D | 0;
        E = E + this.E | 0;
        F = F + this.F | 0;
        G = G + this.G | 0;
        H = H + this.H | 0;
        this.set(A, B, C, D, E, F, G, H);
      }
      roundClean() {
        clean2(SHA256_W);
      }
      destroy() {
        this.destroyed = true;
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        clean2(this.buffer);
      }
    };
    _SHA256 = class extends SHA2_32B {
      constructor() {
        super(32);
        // We cannot use array here since array allows indexing by variable
        // which means optimizer/compiler cannot use registers.
        __publicField(this, "A", SHA256_IV[0] | 0);
        __publicField(this, "B", SHA256_IV[1] | 0);
        __publicField(this, "C", SHA256_IV[2] | 0);
        __publicField(this, "D", SHA256_IV[3] | 0);
        __publicField(this, "E", SHA256_IV[4] | 0);
        __publicField(this, "F", SHA256_IV[5] | 0);
        __publicField(this, "G", SHA256_IV[6] | 0);
        __publicField(this, "H", SHA256_IV[7] | 0);
      }
    };
    _SHA224 = class extends SHA2_32B {
      constructor() {
        super(28);
        __publicField(this, "A", SHA224_IV[0] | 0);
        __publicField(this, "B", SHA224_IV[1] | 0);
        __publicField(this, "C", SHA224_IV[2] | 0);
        __publicField(this, "D", SHA224_IV[3] | 0);
        __publicField(this, "E", SHA224_IV[4] | 0);
        __publicField(this, "F", SHA224_IV[5] | 0);
        __publicField(this, "G", SHA224_IV[6] | 0);
        __publicField(this, "H", SHA224_IV[7] | 0);
      }
    };
    K512 = /* @__PURE__ */ (() => split([
      "0x428a2f98d728ae22",
      "0x7137449123ef65cd",
      "0xb5c0fbcfec4d3b2f",
      "0xe9b5dba58189dbbc",
      "0x3956c25bf348b538",
      "0x59f111f1b605d019",
      "0x923f82a4af194f9b",
      "0xab1c5ed5da6d8118",
      "0xd807aa98a3030242",
      "0x12835b0145706fbe",
      "0x243185be4ee4b28c",
      "0x550c7dc3d5ffb4e2",
      "0x72be5d74f27b896f",
      "0x80deb1fe3b1696b1",
      "0x9bdc06a725c71235",
      "0xc19bf174cf692694",
      "0xe49b69c19ef14ad2",
      "0xefbe4786384f25e3",
      "0x0fc19dc68b8cd5b5",
      "0x240ca1cc77ac9c65",
      "0x2de92c6f592b0275",
      "0x4a7484aa6ea6e483",
      "0x5cb0a9dcbd41fbd4",
      "0x76f988da831153b5",
      "0x983e5152ee66dfab",
      "0xa831c66d2db43210",
      "0xb00327c898fb213f",
      "0xbf597fc7beef0ee4",
      "0xc6e00bf33da88fc2",
      "0xd5a79147930aa725",
      "0x06ca6351e003826f",
      "0x142929670a0e6e70",
      "0x27b70a8546d22ffc",
      "0x2e1b21385c26c926",
      "0x4d2c6dfc5ac42aed",
      "0x53380d139d95b3df",
      "0x650a73548baf63de",
      "0x766a0abb3c77b2a8",
      "0x81c2c92e47edaee6",
      "0x92722c851482353b",
      "0xa2bfe8a14cf10364",
      "0xa81a664bbc423001",
      "0xc24b8b70d0f89791",
      "0xc76c51a30654be30",
      "0xd192e819d6ef5218",
      "0xd69906245565a910",
      "0xf40e35855771202a",
      "0x106aa07032bbd1b8",
      "0x19a4c116b8d2d0c8",
      "0x1e376c085141ab53",
      "0x2748774cdf8eeb99",
      "0x34b0bcb5e19b48a8",
      "0x391c0cb3c5c95a63",
      "0x4ed8aa4ae3418acb",
      "0x5b9cca4f7763e373",
      "0x682e6ff3d6b2b8a3",
      "0x748f82ee5defb2fc",
      "0x78a5636f43172f60",
      "0x84c87814a1f0ab72",
      "0x8cc702081a6439ec",
      "0x90befffa23631e28",
      "0xa4506cebde82bde9",
      "0xbef9a3f7b2c67915",
      "0xc67178f2e372532b",
      "0xca273eceea26619c",
      "0xd186b8c721c0c207",
      "0xeada7dd6cde0eb1e",
      "0xf57d4f7fee6ed178",
      "0x06f067aa72176fba",
      "0x0a637dc5a2c898a6",
      "0x113f9804bef90dae",
      "0x1b710b35131c471b",
      "0x28db77f523047d84",
      "0x32caab7b40c72493",
      "0x3c9ebe0a15c9bebc",
      "0x431d67c49c100d4c",
      "0x4cc5d4becb3e42b6",
      "0x597f299cfc657e2a",
      "0x5fcb6fab3ad6faec",
      "0x6c44198c4a475817"
    ].map((n) => BigInt(n))))();
    SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
    SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
    SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
    SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
    SHA2_64B = class extends HashMD {
      constructor(outputLen) {
        super(128, outputLen, 16, false);
      }
      // prettier-ignore
      get() {
        const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
      }
      // prettier-ignore
      set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
        this.Ah = Ah | 0;
        this.Al = Al | 0;
        this.Bh = Bh | 0;
        this.Bl = Bl | 0;
        this.Ch = Ch | 0;
        this.Cl = Cl | 0;
        this.Dh = Dh | 0;
        this.Dl = Dl | 0;
        this.Eh = Eh | 0;
        this.El = El | 0;
        this.Fh = Fh | 0;
        this.Fl = Fl | 0;
        this.Gh = Gh | 0;
        this.Gl = Gl | 0;
        this.Hh = Hh | 0;
        this.Hl = Hl | 0;
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4) {
          SHA512_W_H[i] = view.getUint32(offset);
          SHA512_W_L[i] = view.getUint32(offset += 4);
        }
        for (let i = 16; i < 80; i++) {
          const W15h = SHA512_W_H[i - 15] | 0;
          const W15l = SHA512_W_L[i - 15] | 0;
          const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
          const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
          const W2h = SHA512_W_H[i - 2] | 0;
          const W2l = SHA512_W_L[i - 2] | 0;
          const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
          const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
          const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
          const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
          SHA512_W_H[i] = SUMh | 0;
          SHA512_W_L[i] = SUMl | 0;
        }
        let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        for (let i = 0; i < 80; i++) {
          const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
          const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
          const CHIh = Eh & Fh ^ ~Eh & Gh;
          const CHIl = El & Fl ^ ~El & Gl;
          const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
          const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
          const T1l = T1ll | 0;
          const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
          const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
          const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
          const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
          Hh = Gh | 0;
          Hl = Gl | 0;
          Gh = Fh | 0;
          Gl = Fl | 0;
          Fh = Eh | 0;
          Fl = El | 0;
          ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
          Dh = Ch | 0;
          Dl = Cl | 0;
          Ch = Bh | 0;
          Cl = Bl | 0;
          Bh = Ah | 0;
          Bl = Al | 0;
          const All = add3L(T1l, sigma0l, MAJl);
          Ah = add3H(All, T1h, sigma0h, MAJh);
          Al = All | 0;
        }
        ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
        ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
        ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
        ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
        ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
        ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
        ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
        ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
        this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
      }
      roundClean() {
        clean2(SHA512_W_H, SHA512_W_L);
      }
      destroy() {
        this.destroyed = true;
        clean2(this.buffer);
        this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
    };
    _SHA512 = class extends SHA2_64B {
      constructor() {
        super(64);
        __publicField(this, "Ah", SHA512_IV[0] | 0);
        __publicField(this, "Al", SHA512_IV[1] | 0);
        __publicField(this, "Bh", SHA512_IV[2] | 0);
        __publicField(this, "Bl", SHA512_IV[3] | 0);
        __publicField(this, "Ch", SHA512_IV[4] | 0);
        __publicField(this, "Cl", SHA512_IV[5] | 0);
        __publicField(this, "Dh", SHA512_IV[6] | 0);
        __publicField(this, "Dl", SHA512_IV[7] | 0);
        __publicField(this, "Eh", SHA512_IV[8] | 0);
        __publicField(this, "El", SHA512_IV[9] | 0);
        __publicField(this, "Fh", SHA512_IV[10] | 0);
        __publicField(this, "Fl", SHA512_IV[11] | 0);
        __publicField(this, "Gh", SHA512_IV[12] | 0);
        __publicField(this, "Gl", SHA512_IV[13] | 0);
        __publicField(this, "Hh", SHA512_IV[14] | 0);
        __publicField(this, "Hl", SHA512_IV[15] | 0);
      }
    };
    _SHA384 = class extends SHA2_64B {
      constructor() {
        super(48);
        __publicField(this, "Ah", SHA384_IV[0] | 0);
        __publicField(this, "Al", SHA384_IV[1] | 0);
        __publicField(this, "Bh", SHA384_IV[2] | 0);
        __publicField(this, "Bl", SHA384_IV[3] | 0);
        __publicField(this, "Ch", SHA384_IV[4] | 0);
        __publicField(this, "Cl", SHA384_IV[5] | 0);
        __publicField(this, "Dh", SHA384_IV[6] | 0);
        __publicField(this, "Dl", SHA384_IV[7] | 0);
        __publicField(this, "Eh", SHA384_IV[8] | 0);
        __publicField(this, "El", SHA384_IV[9] | 0);
        __publicField(this, "Fh", SHA384_IV[10] | 0);
        __publicField(this, "Fl", SHA384_IV[11] | 0);
        __publicField(this, "Gh", SHA384_IV[12] | 0);
        __publicField(this, "Gl", SHA384_IV[13] | 0);
        __publicField(this, "Hh", SHA384_IV[14] | 0);
        __publicField(this, "Hl", SHA384_IV[15] | 0);
      }
    };
    T224_IV = /* @__PURE__ */ Uint32Array.from([
      2352822216,
      424955298,
      1944164710,
      2312950998,
      502970286,
      855612546,
      1738396948,
      1479516111,
      258812777,
      2077511080,
      2011393907,
      79989058,
      1067287976,
      1780299464,
      286451373,
      2446758561
    ]);
    T256_IV = /* @__PURE__ */ Uint32Array.from([
      573645204,
      4230739756,
      2673172387,
      3360449730,
      596883563,
      1867755857,
      2520282905,
      1497426621,
      2519219938,
      2827943907,
      3193839141,
      1401305490,
      721525244,
      746961066,
      246885852,
      2177182882
    ]);
    _SHA512_224 = class extends SHA2_64B {
      constructor() {
        super(28);
        __publicField(this, "Ah", T224_IV[0] | 0);
        __publicField(this, "Al", T224_IV[1] | 0);
        __publicField(this, "Bh", T224_IV[2] | 0);
        __publicField(this, "Bl", T224_IV[3] | 0);
        __publicField(this, "Ch", T224_IV[4] | 0);
        __publicField(this, "Cl", T224_IV[5] | 0);
        __publicField(this, "Dh", T224_IV[6] | 0);
        __publicField(this, "Dl", T224_IV[7] | 0);
        __publicField(this, "Eh", T224_IV[8] | 0);
        __publicField(this, "El", T224_IV[9] | 0);
        __publicField(this, "Fh", T224_IV[10] | 0);
        __publicField(this, "Fl", T224_IV[11] | 0);
        __publicField(this, "Gh", T224_IV[12] | 0);
        __publicField(this, "Gl", T224_IV[13] | 0);
        __publicField(this, "Hh", T224_IV[14] | 0);
        __publicField(this, "Hl", T224_IV[15] | 0);
      }
    };
    _SHA512_256 = class extends SHA2_64B {
      constructor() {
        super(32);
        __publicField(this, "Ah", T256_IV[0] | 0);
        __publicField(this, "Al", T256_IV[1] | 0);
        __publicField(this, "Bh", T256_IV[2] | 0);
        __publicField(this, "Bl", T256_IV[3] | 0);
        __publicField(this, "Ch", T256_IV[4] | 0);
        __publicField(this, "Cl", T256_IV[5] | 0);
        __publicField(this, "Dh", T256_IV[6] | 0);
        __publicField(this, "Dl", T256_IV[7] | 0);
        __publicField(this, "Eh", T256_IV[8] | 0);
        __publicField(this, "El", T256_IV[9] | 0);
        __publicField(this, "Fh", T256_IV[10] | 0);
        __publicField(this, "Fl", T256_IV[11] | 0);
        __publicField(this, "Gh", T256_IV[12] | 0);
        __publicField(this, "Gl", T256_IV[13] | 0);
        __publicField(this, "Hh", T256_IV[14] | 0);
        __publicField(this, "Hl", T256_IV[15] | 0);
      }
    };
    sha256 = /* @__PURE__ */ createHasher(
      () => new _SHA256(),
      /* @__PURE__ */ oidNist(1)
    );
    sha224 = /* @__PURE__ */ createHasher(
      () => new _SHA224(),
      /* @__PURE__ */ oidNist(4)
    );
    sha512 = /* @__PURE__ */ createHasher(
      () => new _SHA512(),
      /* @__PURE__ */ oidNist(3)
    );
    sha384 = /* @__PURE__ */ createHasher(
      () => new _SHA384(),
      /* @__PURE__ */ oidNist(2)
    );
    sha512_256 = /* @__PURE__ */ createHasher(
      () => new _SHA512_256(),
      /* @__PURE__ */ oidNist(6)
    );
    sha512_224 = /* @__PURE__ */ createHasher(
      () => new _SHA512_224(),
      /* @__PURE__ */ oidNist(5)
    );
  }
});

// node_modules/@noble/curves/utils.js
function abool2(value, title = "") {
  if (typeof value !== "boolean") {
    const prefix = title && `"${title}" `;
    throw new TypeError(prefix + "expected boolean, got type=" + typeof value);
  }
  return value;
}
function abignumber(n) {
  if (typeof n === "bigint") {
    if (!isPosBig(n))
      throw new RangeError("positive bigint expected, got " + n);
  } else
    anumber3(n);
  return n;
}
function asafenumber(value, title = "") {
  if (typeof value !== "number") {
    const prefix = title && `"${title}" `;
    throw new TypeError(prefix + "expected number, got type=" + typeof value);
  }
  if (!Number.isSafeInteger(value)) {
    const prefix = title && `"${title}" `;
    throw new RangeError(prefix + "expected safe integer, got " + value);
  }
}
function numberToHexUnpadded(num) {
  const hex = abignumber(num).toString(16);
  return hex.length & 1 ? "0" + hex : hex;
}
function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new TypeError("hex string expected, got " + typeof hex);
  return hex === "" ? _0n : BigInt("0x" + hex);
}
function bytesToNumberBE(bytes) {
  return hexToNumber(bytesToHex(bytes));
}
function bytesToNumberLE(bytes) {
  return hexToNumber(bytesToHex(copyBytes2(abytes2(bytes)).reverse()));
}
function numberToBytesBE(n, len) {
  anumber2(len);
  if (len === 0)
    throw new RangeError("zero length");
  n = abignumber(n);
  const hex = n.toString(16);
  if (hex.length > len * 2)
    throw new RangeError("number too large");
  return hexToBytes(hex.padStart(len * 2, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function copyBytes2(bytes) {
  return Uint8Array.from(abytes3(bytes));
}
function asciiToBytes(ascii) {
  if (typeof ascii !== "string")
    throw new TypeError("ascii string expected, got " + typeof ascii);
  return Uint8Array.from(ascii, (c, i) => {
    const charCode = c.charCodeAt(0);
    if (c.length !== 1 || charCode > 127) {
      throw new RangeError(`string contains non-ASCII character "${ascii[i]}" with code ${charCode} at position ${i}`);
    }
    return charCode;
  });
}
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new RangeError("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  if (n < _0n)
    throw new Error("expected non-negative bigint, got " + n);
  let len;
  for (len = 0; n > _0n; n >>= _1n, len += 1)
    ;
  return len;
}
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  anumber2(hashLen, "hashLen");
  anumber2(qByteLen, "qByteLen");
  if (typeof hmacFn !== "function")
    throw new TypeError("hmacFn must be a function");
  const u8n = (len) => new Uint8Array(len);
  const NULL = Uint8Array.of();
  const byte0 = Uint8Array.of(0);
  const byte1 = Uint8Array.of(1);
  const _maxDrbgIters = 1e3;
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i = 0;
  };
  const h = (...msgs) => hmacFn(k, concatBytes3(v, ...msgs));
  const reseed = (seed = NULL) => {
    k = h(byte0, seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(byte1, seed);
    v = h();
  };
  const gen = () => {
    if (i++ >= _maxDrbgIters)
      throw new Error("drbg: tried max amount of iterations");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes3(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = void 0;
    while ((res = pred(gen())) === void 0)
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function validateObject(object, fields = {}, optFields = {}) {
  if (Object.prototype.toString.call(object) !== "[object Object]")
    throw new TypeError("expected valid options object");
  function checkField(fieldName, expectedType, isOpt) {
    if (!isOpt && expectedType !== "function" && !Object.hasOwn(object, fieldName))
      throw new TypeError(`param "${fieldName}" is invalid: expected own property`);
    const val = object[fieldName];
    if (isOpt && val === void 0)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new TypeError(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
  }
  const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
  iter(fields, false);
  iter(optFields, true);
}
var abytes3, anumber3, bytesToHex2, concatBytes3, hexToBytes2, isBytes3, randomBytes2, _0n, _1n, isPosBig, bitMask;
var init_utils3 = __esm({
  "node_modules/@noble/curves/utils.js"() {
    init_utils2();
    abytes3 = (value, length, title) => abytes2(value, length, title);
    anumber3 = anumber2;
    bytesToHex2 = bytesToHex;
    concatBytes3 = (...arrays) => concatBytes2(...arrays);
    hexToBytes2 = (hex) => hexToBytes(hex);
    isBytes3 = isBytes2;
    randomBytes2 = (bytesLength) => randomBytes(bytesLength);
    _0n = /* @__PURE__ */ BigInt(0);
    _1n = /* @__PURE__ */ BigInt(1);
    isPosBig = (n) => typeof n === "bigint" && _0n <= n;
    bitMask = (n) => (_1n << BigInt(n)) - _1n;
  }
});

// node_modules/@noble/curves/abstract/modular.js
function mod(a, b) {
  if (b <= _0n2)
    throw new Error("mod: expected positive modulus, got " + b);
  const result = a % b;
  return result >= _0n2 ? result : b + result;
}
function invert(number, modulo) {
  if (number === _0n2)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n2)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x = _0n2, y = _1n2, u = _1n2, v = _0n2;
  while (a !== _0n2) {
    const q = b / a;
    const r = b - a * q;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n2)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function assertIsSquare(Fp, root, n) {
  const F = Fp;
  if (!F.eql(F.sqr(root), n))
    throw new Error("Cannot find square root");
}
function sqrt3mod4(Fp, n) {
  const F = Fp;
  const p1div4 = (F.ORDER + _1n2) / _4n;
  const root = F.pow(n, p1div4);
  assertIsSquare(F, root, n);
  return root;
}
function sqrt5mod8(Fp, n) {
  const F = Fp;
  const p5div8 = (F.ORDER - _5n) / _8n;
  const n2 = F.mul(n, _2n);
  const v = F.pow(n2, p5div8);
  const nv = F.mul(n, v);
  const i = F.mul(F.mul(nv, _2n), v);
  const root = F.mul(nv, F.sub(i, F.ONE));
  assertIsSquare(F, root, n);
  return root;
}
function sqrt9mod16(P) {
  const Fp_ = Field(P);
  const tn = tonelliShanks(P);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P + _7n) / _16n;
  return (Fp, n) => {
    const F = Fp;
    let tv1 = F.pow(n, c4);
    let tv2 = F.mul(tv1, c1);
    const tv3 = F.mul(tv1, c2);
    const tv4 = F.mul(tv1, c3);
    const e1 = F.eql(F.sqr(tv2), n);
    const e2 = F.eql(F.sqr(tv3), n);
    tv1 = F.cmov(tv1, tv2, e1);
    tv2 = F.cmov(tv4, tv3, e2);
    const e3 = F.eql(F.sqr(tv2), n);
    const root = F.cmov(tv1, tv2, e3);
    assertIsSquare(F, root, n);
    return root;
  };
}
function tonelliShanks(P) {
  if (P < _3n)
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n2;
  let S = 0;
  while (Q % _2n === _0n2) {
    Q /= _2n;
    S++;
  }
  let Z = _2n;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n2) / _2n;
  return function tonelliSlow(Fp, n) {
    const F = Fp;
    if (F.is0(n))
      return n;
    if (FpLegendre(F, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = F.mul(F.ONE, cc);
    let t = F.pow(n, Q);
    let R = F.pow(n, Q1div2);
    while (!F.eql(t, F.ONE)) {
      if (F.is0(t))
        return F.ZERO;
      let i = 1;
      let t_tmp = F.sqr(t);
      while (!F.eql(t_tmp, F.ONE)) {
        i++;
        t_tmp = F.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n2 << BigInt(M - i - 1);
      const b = F.pow(c, exponent);
      M = i;
      c = F.sqr(b);
      t = F.mul(t, c);
      R = F.mul(R, b);
    }
    return R;
  };
}
function FpSqrt(P) {
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  if (P % _16n === _9n)
    return sqrt9mod16(P);
  return tonelliShanks(P);
}
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  validateObject(field, opts);
  asafenumber(field.BYTES, "BYTES");
  asafenumber(field.BITS, "BITS");
  if (field.BYTES < 1 || field.BITS < 1)
    throw new Error("invalid field: expected BYTES/BITS > 0");
  if (field.ORDER <= _1n2)
    throw new Error("invalid field: expected ORDER > 1, got " + field.ORDER);
  return field;
}
function FpPow(Fp, num, power) {
  const F = Fp;
  if (power < _0n2)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n2)
    return F.ONE;
  if (power === _1n2)
    return num;
  let p = F.ONE;
  let d = num;
  while (power > _0n2) {
    if (power & _1n2)
      p = F.mul(p, d);
    d = F.sqr(d);
    power >>= _1n2;
  }
  return p;
}
function FpInvertBatch(Fp, nums, passZero = false) {
  const F = Fp;
  const inverted = new Array(nums.length).fill(passZero ? F.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num, i) => {
    if (F.is0(num))
      return acc;
    inverted[i] = acc;
    return F.mul(acc, num);
  }, F.ONE);
  const invertedAcc = F.inv(multipliedAcc);
  nums.reduceRight((acc, num, i) => {
    if (F.is0(num))
      return acc;
    inverted[i] = F.mul(acc, inverted[i]);
    return F.mul(acc, num);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp, n) {
  const F = Fp;
  const p1mod2 = (F.ORDER - _1n2) / _2n;
  const powered = F.pow(n, p1mod2);
  const yes = F.eql(powered, F.ONE);
  const zero = F.eql(powered, F.ZERO);
  const no = F.eql(powered, F.neg(F.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function FpIsSquare(Fp, n) {
  const l = FpLegendre(Fp, n);
  return l !== -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber3(nBitLength);
  if (n <= _0n2)
    throw new Error("invalid n length: expected positive n, got " + n);
  if (nBitLength !== void 0 && nBitLength < 1)
    throw new Error("invalid n length: expected positive bit length, got " + nBitLength);
  const bits = bitLen(n);
  if (nBitLength !== void 0 && nBitLength < bits)
    throw new Error(`invalid n length: expected bit length (${bits}) >= n.length (${nBitLength})`);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : bits;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
function Field(ORDER, opts = {}) {
  return new _Field(ORDER, opts);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  if (fieldOrder <= _1n2)
    throw new Error("field order must be greater than 1");
  const bitLength = bitLen(fieldOrder - _1n2);
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE2 = false) {
  abytes3(key);
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = Math.max(getMinHashLength(fieldOrder), 16);
  if (len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num = isLE2 ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num, fieldOrder - _1n2) + _1n2;
  return isLE2 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}
var _0n2, _1n2, _2n, _3n, _4n, _5n, _7n, _8n, _9n, _16n, FIELD_FIELDS, FIELD_SQRT, _Field;
var init_modular = __esm({
  "node_modules/@noble/curves/abstract/modular.js"() {
    init_utils3();
    _0n2 = /* @__PURE__ */ BigInt(0);
    _1n2 = /* @__PURE__ */ BigInt(1);
    _2n = /* @__PURE__ */ BigInt(2);
    _3n = /* @__PURE__ */ BigInt(3);
    _4n = /* @__PURE__ */ BigInt(4);
    _5n = /* @__PURE__ */ BigInt(5);
    _7n = /* @__PURE__ */ BigInt(7);
    _8n = /* @__PURE__ */ BigInt(8);
    _9n = /* @__PURE__ */ BigInt(9);
    _16n = /* @__PURE__ */ BigInt(16);
    FIELD_FIELDS = [
      "create",
      "isValid",
      "is0",
      "neg",
      "inv",
      "sqrt",
      "sqr",
      "eql",
      "add",
      "sub",
      "mul",
      "pow",
      "div",
      "addN",
      "subN",
      "mulN",
      "sqrN"
    ];
    FIELD_SQRT = /* @__PURE__ */ new WeakMap();
    _Field = class {
      constructor(ORDER, opts = {}) {
        __publicField(this, "ORDER");
        __publicField(this, "BITS");
        __publicField(this, "BYTES");
        __publicField(this, "isLE");
        __publicField(this, "ZERO", _0n2);
        __publicField(this, "ONE", _1n2);
        __publicField(this, "_lengths");
        __publicField(this, "_mod");
        if (ORDER <= _1n2)
          throw new Error("invalid field: expected ORDER > 1, got " + ORDER);
        let _nbitLength = void 0;
        this.isLE = false;
        if (opts != null && typeof opts === "object") {
          if (typeof opts.BITS === "number")
            _nbitLength = opts.BITS;
          if (typeof opts.sqrt === "function")
            Object.defineProperty(this, "sqrt", { value: opts.sqrt, enumerable: true });
          if (typeof opts.isLE === "boolean")
            this.isLE = opts.isLE;
          if (opts.allowedLengths)
            this._lengths = Object.freeze(opts.allowedLengths.slice());
          if (typeof opts.modFromBytes === "boolean")
            this._mod = opts.modFromBytes;
        }
        const { nBitLength, nByteLength } = nLength(ORDER, _nbitLength);
        if (nByteLength > 2048)
          throw new Error("invalid field: expected ORDER of <= 2048 bytes");
        this.ORDER = ORDER;
        this.BITS = nBitLength;
        this.BYTES = nByteLength;
        Object.freeze(this);
      }
      create(num) {
        return mod(num, this.ORDER);
      }
      isValid(num) {
        if (typeof num !== "bigint")
          throw new TypeError("invalid field element: expected bigint, got " + typeof num);
        return _0n2 <= num && num < this.ORDER;
      }
      is0(num) {
        return num === _0n2;
      }
      // is valid and invertible
      isValidNot0(num) {
        return !this.is0(num) && this.isValid(num);
      }
      isOdd(num) {
        return (num & _1n2) === _1n2;
      }
      neg(num) {
        return mod(-num, this.ORDER);
      }
      eql(lhs, rhs) {
        return lhs === rhs;
      }
      sqr(num) {
        return mod(num * num, this.ORDER);
      }
      add(lhs, rhs) {
        return mod(lhs + rhs, this.ORDER);
      }
      sub(lhs, rhs) {
        return mod(lhs - rhs, this.ORDER);
      }
      mul(lhs, rhs) {
        return mod(lhs * rhs, this.ORDER);
      }
      pow(num, power) {
        return FpPow(this, num, power);
      }
      div(lhs, rhs) {
        return mod(lhs * invert(rhs, this.ORDER), this.ORDER);
      }
      // Same as above, but doesn't normalize
      sqrN(num) {
        return num * num;
      }
      addN(lhs, rhs) {
        return lhs + rhs;
      }
      subN(lhs, rhs) {
        return lhs - rhs;
      }
      mulN(lhs, rhs) {
        return lhs * rhs;
      }
      inv(num) {
        return invert(num, this.ORDER);
      }
      sqrt(num) {
        let sqrt = FIELD_SQRT.get(this);
        if (!sqrt)
          FIELD_SQRT.set(this, sqrt = FpSqrt(this.ORDER));
        return sqrt(this, num);
      }
      toBytes(num) {
        return this.isLE ? numberToBytesLE(num, this.BYTES) : numberToBytesBE(num, this.BYTES);
      }
      fromBytes(bytes, skipValidation = false) {
        abytes3(bytes);
        const { _lengths: allowedLengths, BYTES, isLE: isLE2, ORDER, _mod: modFromBytes } = this;
        if (allowedLengths) {
          if (bytes.length < 1 || !allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
            throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
          }
          const padded = new Uint8Array(BYTES);
          padded.set(bytes, isLE2 ? 0 : padded.length - bytes.length);
          bytes = padded;
        }
        if (bytes.length !== BYTES)
          throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
        let scalar = isLE2 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
        if (modFromBytes)
          scalar = mod(scalar, ORDER);
        if (!skipValidation) {
          if (!this.isValid(scalar))
            throw new Error("invalid field element: outside of range 0..ORDER");
        }
        return scalar;
      }
      // TODO: we don't need it here, move out to separate fn
      invertBatch(lst) {
        return FpInvertBatch(this, lst);
      }
      // We can't move this out because Fp6, Fp12 implement it
      // and it's unclear what to return in there.
      cmov(a, b, condition) {
        abool2(condition, "condition");
        return condition ? b : a;
      }
    };
    Object.freeze(_Field.prototype);
  }
});

// node_modules/@noble/curves/abstract/curve.js
function validatePointCons(Point) {
  const pc = Point;
  if (typeof pc !== "function")
    throw new TypeError("Point must be a constructor");
  validateObject({
    Fp: pc.Fp,
    Fn: pc.Fn,
    fromAffine: pc.fromAffine,
    fromBytes: pc.fromBytes,
    fromHex: pc.fromHex
  }, {
    Fp: "object",
    Fn: "object",
    fromAffine: "function",
    fromBytes: "function",
    fromHex: "function"
  });
  validateField(pc.Fp);
  validateField(pc.Fn);
}
function negateCt(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function normalizeZ(c, points) {
  const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
  return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
}
function validateW(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
function calcWOpts(W, scalarBits) {
  validateW(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets(n, window, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n3;
  }
  const offsetStart = window * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
function validateMSMPoints(points, c) {
  if (!Array.isArray(points))
    throw new Error("array expected");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
function validateMSMScalars(scalars, field) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    if (!field.isValid(s))
      throw new Error("invalid scalar at index " + i);
  });
}
function getW(P) {
  return pointWindowSizes.get(P) || 1;
}
function assert0(n) {
  if (n !== _0n3)
    throw new Error("invalid wNAF");
}
function mulEndoUnsafe(Point, point, k1, k2) {
  let acc = point;
  let p1 = Point.ZERO;
  let p2 = Point.ZERO;
  while (k1 > _0n3 || k2 > _0n3) {
    if (k1 & _1n3)
      p1 = p1.add(acc);
    if (k2 & _1n3)
      p2 = p2.add(acc);
    acc = acc.double();
    k1 >>= _1n3;
    k2 >>= _1n3;
  }
  return { p1, p2 };
}
function pippenger(c, points, scalars) {
  const fieldN = c.Fn;
  validateMSMPoints(points, c);
  validateMSMScalars(scalars, fieldN);
  const plength = points.length;
  const slength = scalars.length;
  if (plength !== slength)
    throw new Error("arrays of points and scalars must have equal length");
  const zero = c.ZERO;
  const wbits = bitLen(BigInt(plength));
  let windowSize = 1;
  if (wbits > 12)
    windowSize = wbits - 3;
  else if (wbits > 4)
    windowSize = wbits - 2;
  else if (wbits > 0)
    windowSize = 2;
  const MASK = bitMask(windowSize);
  const buckets = new Array(Number(MASK) + 1).fill(zero);
  const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
  let sum = zero;
  for (let i = lastBits; i >= 0; i -= windowSize) {
    buckets.fill(zero);
    for (let j = 0; j < slength; j++) {
      const scalar = scalars[j];
      const wbits2 = Number(scalar >> BigInt(i) & MASK);
      buckets[wbits2] = buckets[wbits2].add(points[j]);
    }
    let resI = zero;
    for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
      sumI = sumI.add(buckets[j]);
      resI = resI.add(sumI);
    }
    sum = sum.add(resI);
    if (i !== 0)
      for (let j = 0; j < windowSize; j++)
        sum = sum.double();
  }
  return sum;
}
function createField(order, field, isLE2) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField(field);
    return field;
  } else {
    return Field(order, { isLE: isLE2 });
  }
}
function createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
  if (FpFnLE === void 0)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(typeof val === "bigint" && val > _0n3))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b = type === "weierstrass" ? "b" : "d";
  const params = ["Gx", "Gy", "a", _b];
  for (const p of params) {
    if (!Fp.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp, Fn };
}
function createKeygen(randomSecretKey, getPublicKey) {
  return function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey(secretKey) };
  };
}
var _0n3, _1n3, pointPrecomputes, pointWindowSizes, wNAF;
var init_curve = __esm({
  "node_modules/@noble/curves/abstract/curve.js"() {
    init_utils3();
    init_modular();
    _0n3 = /* @__PURE__ */ BigInt(0);
    _1n3 = /* @__PURE__ */ BigInt(1);
    pointPrecomputes = /* @__PURE__ */ new WeakMap();
    pointWindowSizes = /* @__PURE__ */ new WeakMap();
    wNAF = class {
      // Parametrized with a given Point class (not individual point)
      constructor(Point, bits) {
        __publicField(this, "BASE");
        __publicField(this, "ZERO");
        __publicField(this, "Fn");
        __publicField(this, "bits");
        this.BASE = Point.BASE;
        this.ZERO = Point.ZERO;
        this.Fn = Point.Fn;
        this.bits = bits;
      }
      // non-const time multiplication ladder
      _unsafeLadder(elm, n, p = this.ZERO) {
        let d = elm;
        while (n > _0n3) {
          if (n & _1n3)
            p = p.add(d);
          d = d.double();
          n >>= _1n3;
        }
        return p;
      }
      /**
       * Creates a wNAF precomputation window. Used for caching.
       * Default window size is set by `utils.precompute()` and is equal to 8.
       * Number of precomputed points depends on the curve size:
       * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
       * - 𝑊 is the window size
       * - 𝑛 is the bitlength of the curve order.
       * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
       * @param point - Point instance
       * @param W - window size
       * @returns precomputed point tables flattened to a single array
       */
      precomputeWindow(point, W) {
        const { windows, windowSize } = calcWOpts(W, this.bits);
        const points = [];
        let p = point;
        let base = p;
        for (let window = 0; window < windows; window++) {
          base = p;
          points.push(base);
          for (let i = 1; i < windowSize; i++) {
            base = base.add(p);
            points.push(base);
          }
          p = base.double();
        }
        return points;
      }
      /**
       * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
       * More compact implementation:
       * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
       * @returns real and fake (for const-time) points
       */
      wNAF(W, precomputes, n) {
        if (!this.Fn.isValid(n))
          throw new Error("invalid scalar");
        let p = this.ZERO;
        let f = this.BASE;
        const wo = calcWOpts(W, this.bits);
        for (let window = 0; window < wo.windows; window++) {
          const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window, wo);
          n = nextN;
          if (isZero) {
            f = f.add(negateCt(isNegF, precomputes[offsetF]));
          } else {
            p = p.add(negateCt(isNeg, precomputes[offset]));
          }
        }
        assert0(n);
        return { p, f };
      }
      /**
       * Implements unsafe EC multiplication using precomputed tables
       * and w-ary non-adjacent form.
       * @param acc - accumulator point to add result of multiplication
       * @returns point
       */
      wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
        const wo = calcWOpts(W, this.bits);
        for (let window = 0; window < wo.windows; window++) {
          if (n === _0n3)
            break;
          const { nextN, offset, isZero, isNeg } = calcOffsets(n, window, wo);
          n = nextN;
          if (isZero) {
            continue;
          } else {
            const item = precomputes[offset];
            acc = acc.add(isNeg ? item.negate() : item);
          }
        }
        assert0(n);
        return acc;
      }
      getPrecomputes(W, point, transform) {
        let comp = pointPrecomputes.get(point);
        if (!comp) {
          comp = this.precomputeWindow(point, W);
          if (W !== 1) {
            if (typeof transform === "function")
              comp = transform(comp);
            pointPrecomputes.set(point, comp);
          }
        }
        return comp;
      }
      cached(point, scalar, transform) {
        const W = getW(point);
        return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
      }
      unsafe(point, scalar, transform, prev) {
        const W = getW(point);
        if (W === 1)
          return this._unsafeLadder(point, scalar, prev);
        return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
      }
      // We calculate precomputes for elliptic curve point multiplication
      // using windowed method. This specifies window size and
      // stores precomputed values. Usually only base point would be precomputed.
      createCache(P, W) {
        validateW(W, this.bits);
        pointWindowSizes.set(P, W);
        pointPrecomputes.delete(P);
      }
      hasCache(elm) {
        return getW(elm) !== 1;
      }
    };
  }
});

// node_modules/@noble/curves/abstract/fft.js
function checkU32(n) {
  if (!Number.isSafeInteger(n) || n < 0 || n > 4294967295)
    throw new Error("wrong u32 integer:" + n);
  return n;
}
function nextPowerOfTwo(n) {
  checkU32(n);
  if (n <= 1)
    return 1;
  if (n > 2147483648)
    throw new Error("nextPowerOfTwo overflow: result does not fit u32");
  return 1 << log2(n - 1) + 1 >>> 0;
}
function log2(n) {
  checkU32(n);
  return 31 - Math.clz32(n);
}
function poly(field, roots, create, fft, length) {
  const F = field;
  const _create = create || ((len, elm) => new Array(len).fill(elm ?? F.ZERO));
  const isPoly = (x) => {
    if (Array.isArray(x))
      return true;
    if (!ArrayBuffer.isView(x))
      return false;
    const v = x;
    return typeof v.length === "number" && typeof v.slice === "function" && typeof v[Symbol.iterator] === "function";
  };
  const checkLength = (...lst) => {
    if (!lst.length)
      return 0;
    for (const i of lst)
      if (!isPoly(i))
        throw new Error("poly: not polynomial: " + i);
    const L = lst[0].length;
    for (let i = 1; i < lst.length; i++)
      if (lst[i].length !== L)
        throw new Error(`poly: mismatched lengths ${L} vs ${lst[i].length}`);
    if (length !== void 0 && L !== length)
      throw new Error(`poly: expected fixed length ${length}, got ${L}`);
    return L;
  };
  function findOmegaIndex(x, n, brp = false) {
    const bits = log2(n);
    const omega = brp ? roots.brp(bits) : roots.roots(bits);
    for (let i = 0; i < n; i++)
      if (F.eql(x, omega[i]))
        return i;
    return -1;
  }
  return {
    roots,
    create: _create,
    length,
    extend: (a, len) => {
      checkLength(a);
      const out = _create(len, F.ZERO);
      for (let i = 0; i < Math.min(a.length, len); i++)
        out[i] = a[i];
      return out;
    },
    degree: (a) => {
      checkLength(a);
      for (let i = a.length - 1; i >= 0; i--)
        if (!F.is0(a[i]))
          return i;
      return -1;
    },
    add: (a, b) => {
      const len = checkLength(a, b);
      const out = _create(len);
      for (let i = 0; i < len; i++)
        out[i] = F.add(a[i], b[i]);
      return out;
    },
    sub: (a, b) => {
      const len = checkLength(a, b);
      const out = _create(len);
      for (let i = 0; i < len; i++)
        out[i] = F.sub(a[i], b[i]);
      return out;
    },
    dot: (a, b) => {
      const len = checkLength(a, b);
      const out = _create(len);
      for (let i = 0; i < len; i++)
        out[i] = F.mul(a[i], b[i]);
      return out;
    },
    mul: (a, b) => {
      if (isPoly(b)) {
        const len = checkLength(a, b);
        if (fft) {
          const A = fft.direct(a, false, true);
          const B = fft.direct(b, false, true);
          for (let i = 0; i < A.length; i++)
            A[i] = F.mul(A[i], B[i]);
          return fft.inverse(A, true, false);
        } else {
          const res = _create(len);
          for (let i = 0; i < len; i++) {
            for (let j = 0; j < len; j++) {
              const k = (i + j) % len;
              res[k] = F.add(res[k], F.mul(a[i], b[j]));
            }
          }
          return res;
        }
      } else {
        const out = _create(checkLength(a));
        for (let i = 0; i < out.length; i++)
          out[i] = F.mul(a[i], b);
        return out;
      }
    },
    convolve(a, b) {
      const len = nextPowerOfTwo(a.length + b.length - 1);
      return this.mul(this.extend(a, len), this.extend(b, len));
    },
    shift(p, factor) {
      const out = _create(checkLength(p));
      out[0] = p[0];
      for (let i = 1, power = F.ONE; i < p.length; i++) {
        power = F.mul(power, factor);
        out[i] = F.mul(p[i], power);
      }
      return out;
    },
    clone: (a) => {
      checkLength(a);
      const out = _create(a.length);
      for (let i = 0; i < a.length; i++)
        out[i] = a[i];
      return out;
    },
    eval: (a, basis) => {
      checkLength(a, basis);
      let acc = F.ZERO;
      for (let i = 0; i < a.length; i++)
        acc = F.add(acc, F.mul(a[i], basis[i]));
      return acc;
    },
    monomial: {
      basis: (x, n) => {
        const out = _create(n);
        let pow = F.ONE;
        for (let i = 0; i < n; i++) {
          out[i] = pow;
          pow = F.mul(pow, x);
        }
        return out;
      },
      eval: (a, x) => {
        checkLength(a);
        let acc = F.ZERO;
        for (let i = a.length - 1; i >= 0; i--)
          acc = F.add(F.mul(acc, x), a[i]);
        return acc;
      }
    },
    lagrange: {
      basis: (x, n, brp = false, weights) => {
        const bits = log2(n);
        const cache = weights || (brp ? roots.brp(bits) : roots.roots(bits));
        const out = _create(n);
        const idx = findOmegaIndex(x, n, brp);
        if (idx !== -1) {
          out[idx] = F.ONE;
          return out;
        }
        const tm = F.pow(x, BigInt(n));
        const c = F.mul(F.sub(tm, F.ONE), F.inv(BigInt(n)));
        const denom = _create(n);
        for (let i = 0; i < n; i++)
          denom[i] = F.sub(x, cache[i]);
        const inv = F.invertBatch(denom);
        for (let i = 0; i < n; i++)
          out[i] = F.mul(c, F.mul(cache[i], inv[i]));
        return out;
      },
      eval(a, x, brp = false) {
        checkLength(a);
        const idx = findOmegaIndex(x, a.length, brp);
        if (idx !== -1)
          return a[idx];
        const L = this.basis(x, a.length, brp);
        let acc = F.ZERO;
        for (let i = 0; i < a.length; i++)
          if (!F.is0(a[i]))
            acc = F.add(acc, F.mul(a[i], L[i]));
        return acc;
      }
    },
    vanishing(roots2) {
      checkLength(roots2);
      const out = _create(roots2.length + 1, F.ZERO);
      out[0] = F.ONE;
      for (const r of roots2) {
        const neg = F.neg(r);
        for (let j = out.length - 1; j > 0; j--)
          out[j] = F.add(F.mul(out[j], neg), out[j - 1]);
        out[0] = F.mul(out[0], neg);
      }
      return out;
    }
  };
}
var init_fft = __esm({
  "node_modules/@noble/curves/abstract/fft.js"() {
  }
});

// node_modules/@noble/curves/abstract/hash-to-curve.js
function i2osp(value, length) {
  asafenumber(value);
  asafenumber(length);
  if (length < 0 || length > 4)
    throw new Error("invalid I2OSP length: " + length);
  if (value < 0 || value > 2 ** (8 * length) - 1)
    throw new Error("invalid I2OSP input: " + value);
  const res = Array.from({ length }).fill(0);
  for (let i = length - 1; i >= 0; i--) {
    res[i] = value & 255;
    value >>>= 8;
  }
  return new Uint8Array(res);
}
function strxor(a, b) {
  const arr = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    arr[i] = a[i] ^ b[i];
  }
  return arr;
}
function normDST(DST) {
  if (!isBytes3(DST) && typeof DST !== "string")
    throw new Error("DST must be Uint8Array or ascii string");
  const dst = typeof DST === "string" ? asciiToBytes(DST) : DST;
  if (dst.length === 0)
    throw new Error("DST must be non-empty");
  return dst;
}
function expand_message_xmd(msg, DST, lenInBytes, H) {
  abytes3(msg);
  asafenumber(lenInBytes);
  DST = normDST(DST);
  if (DST.length > 255)
    DST = H(concatBytes3(asciiToBytes("H2C-OVERSIZE-DST-"), DST));
  const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
  const ell = Math.ceil(lenInBytes / b_in_bytes);
  if (lenInBytes > 65535 || ell > 255)
    throw new Error("expand_message_xmd: invalid lenInBytes");
  const DST_prime = concatBytes3(DST, i2osp(DST.length, 1));
  const Z_pad = new Uint8Array(r_in_bytes);
  const l_i_b_str = i2osp(lenInBytes, 2);
  const b = new Array(ell);
  const b_0 = H(concatBytes3(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
  b[0] = H(concatBytes3(b_0, i2osp(1, 1), DST_prime));
  for (let i = 1; i < ell; i++) {
    const args = [strxor(b_0, b[i - 1]), i2osp(i + 1, 1), DST_prime];
    b[i] = H(concatBytes3(...args));
  }
  const pseudo_random_bytes = concatBytes3(...b);
  return pseudo_random_bytes.slice(0, lenInBytes);
}
function expand_message_xof(msg, DST, lenInBytes, k, H) {
  abytes3(msg);
  asafenumber(lenInBytes);
  DST = normDST(DST);
  if (DST.length > 255) {
    const dkLen = Math.ceil(2 * k / 8);
    DST = H.create({ dkLen }).update(asciiToBytes("H2C-OVERSIZE-DST-")).update(DST).digest();
  }
  if (lenInBytes > 65535 || DST.length > 255)
    throw new Error("expand_message_xof: invalid lenInBytes");
  return H.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
}
function hash_to_field(msg, count, options) {
  validateObject(options, {
    p: "bigint",
    m: "number",
    k: "number",
    hash: "function"
  });
  const { p, k, m, hash, expand, DST } = options;
  asafenumber(hash.outputLen, "valid hash");
  abytes3(msg);
  asafenumber(count);
  if (count < 1)
    throw new Error("hash_to_field: expected count >= 1");
  if (m < 1)
    throw new Error("hash_to_field: expected m >= 1");
  const log2p = p.toString(2).length;
  const L = Math.ceil((log2p + k) / 8);
  const len_in_bytes = count * m * L;
  let prb;
  if (expand === "xmd") {
    prb = expand_message_xmd(msg, DST, len_in_bytes, hash);
  } else if (expand === "xof") {
    prb = expand_message_xof(msg, DST, len_in_bytes, k, hash);
  } else if (expand === "_internal_pass") {
    prb = msg;
  } else {
    throw new Error('expand must be "xmd" or "xof"');
  }
  const u = new Array(count);
  for (let i = 0; i < count; i++) {
    const e = new Array(m);
    for (let j = 0; j < m; j++) {
      const elm_offset = L * (j + i * m);
      const tv = prb.subarray(elm_offset, elm_offset + L);
      e[j] = mod(os2ip(tv), p);
    }
    u[i] = e;
  }
  return u;
}
function createHasher2(Point, mapToCurve, defaults) {
  if (typeof mapToCurve !== "function")
    throw new Error("mapToCurve() must be defined");
  const snapshot = (src) => Object.freeze({
    ...src,
    DST: isBytes3(src.DST) ? copyBytes2(src.DST) : src.DST,
    ...src.encodeDST === void 0 ? {} : { encodeDST: isBytes3(src.encodeDST) ? copyBytes2(src.encodeDST) : src.encodeDST }
  });
  const safeDefaults = snapshot(defaults);
  function map(num) {
    return Point.fromAffine(mapToCurve(num));
  }
  function clear(initial) {
    const P = initial.clearCofactor();
    if (P.equals(Point.ZERO))
      return Point.ZERO;
    P.assertValidity();
    return P;
  }
  return Object.freeze({
    get defaults() {
      return snapshot(safeDefaults);
    },
    Point,
    hashToCurve(msg, options) {
      const opts = Object.assign({}, safeDefaults, options);
      const u = hash_to_field(msg, 2, opts);
      const u0 = map(u[0]);
      const u1 = map(u[1]);
      return clear(u0.add(u1));
    },
    encodeToCurve(msg, options) {
      const optsDst = safeDefaults.encodeDST ? { DST: safeDefaults.encodeDST } : {};
      const opts = Object.assign({}, safeDefaults, optsDst, options);
      const u = hash_to_field(msg, 1, opts);
      const u0 = map(u[0]);
      return clear(u0);
    },
    /** See {@link H2CHasher} */
    mapToCurve(scalars) {
      if (safeDefaults.m === 1) {
        if (typeof scalars !== "bigint")
          throw new Error("expected bigint (m=1)");
        return clear(map([scalars]));
      }
      if (!Array.isArray(scalars))
        throw new Error("expected array of bigints");
      for (const i of scalars)
        if (typeof i !== "bigint")
          throw new Error("expected array of bigints");
      return clear(map(scalars));
    },
    // hash_to_scalar can produce 0: https://www.rfc-editor.org/errata/eid8393
    // RFC 9380, draft-irtf-cfrg-bbs-signatures-08. Default scalar DST is the shared generic
    // `HashToScalar-` prefix above unless the caller overrides it per invocation.
    hashToScalar(msg, options) {
      const N = Point.Fn.ORDER;
      const opts = Object.assign({}, safeDefaults, { p: N, m: 1, DST: _DST_scalar }, options);
      return hash_to_field(msg, 1, opts)[0][0];
    }
  });
}
var os2ip, _DST_scalar;
var init_hash_to_curve = __esm({
  "node_modules/@noble/curves/abstract/hash-to-curve.js"() {
    init_utils3();
    init_modular();
    os2ip = bytesToNumberBE;
    _DST_scalar = "HashToScalar-";
  }
});

// node_modules/@noble/curves/abstract/frost.js
function createFROST(opts) {
  validateObject(opts, {
    name: "string",
    hash: "function"
  }, {
    hashToScalar: "function",
    validatePoint: "function",
    parsePublicKey: "function",
    adjustScalar: "function",
    adjustPoint: "function",
    challenge: "function",
    adjustNonces: "function",
    adjustSecret: "function",
    adjustPublic: "function",
    adjustGroupCommitmentShare: "function",
    adjustDKG: "function"
  });
  validatePointCons(opts.Point);
  const { Point } = opts;
  const Fn = opts.Fn === void 0 ? Point.Fn : opts.Fn;
  const hashBytes = opts.hash;
  const hashToScalar = opts.hashToScalar === void 0 ? (msg, opts2 = { DST: new Uint8Array() }) => {
    const t = hashBytes(concatBytes3(opts2.DST, msg));
    return Fn.create(Fn.isLE ? bytesToNumberLE(t) : bytesToNumberBE(t));
  } : opts.hashToScalar;
  const H1Prefix = utf8ToBytes(opts.H1 !== void 0 ? opts.H1 : opts.name + "rho");
  const H2Prefix = utf8ToBytes(opts.H2 !== void 0 ? opts.H2 : opts.name + "chal");
  const H3Prefix = utf8ToBytes(opts.H3 !== void 0 ? opts.H3 : opts.name + "nonce");
  const H4Prefix = utf8ToBytes(opts.H4 !== void 0 ? opts.H4 : opts.name + "msg");
  const H5Prefix = utf8ToBytes(opts.H5 !== void 0 ? opts.H5 : opts.name + "com");
  const HDKGPrefix = utf8ToBytes(opts.HDKG !== void 0 ? opts.HDKG : opts.name + "dkg");
  const HIDPrefix = utf8ToBytes(opts.HID !== void 0 ? opts.HID : opts.name + "id");
  const H1 = (msg) => hashToScalar(msg, { DST: H1Prefix });
  const H2 = (msg) => hashToScalar(msg, { DST: H2Prefix });
  const H3 = (msg) => hashToScalar(msg, { DST: H3Prefix });
  const H4 = (msg) => hashBytes(concatBytes3(H4Prefix, msg));
  const H5 = (msg) => hashBytes(concatBytes3(H5Prefix, msg));
  const HDKG = (msg) => hashToScalar(msg, { DST: HDKGPrefix });
  const HID = (msg) => hashToScalar(msg, { DST: HIDPrefix });
  const randomScalar = (rng = randomBytes2) => {
    const t = mapHashToField(rng(getMinHashLength(Fn.ORDER)), Fn.ORDER, Fn.isLE);
    return Fn.isLE ? bytesToNumberLE(t) : bytesToNumberBE(t);
  };
  const serializePoint = (p) => p.toBytes();
  const parsePoint = (bytes) => {
    const p = Point.fromBytes(bytes);
    if (opts.validatePoint)
      opts.validatePoint(p);
    return p;
  };
  const nonceCommitments = (identifier, nonces) => ({
    identifier,
    hiding: serializePoint(Point.BASE.multiply(Fn.fromBytes(nonces.hiding))),
    binding: serializePoint(Point.BASE.multiply(Fn.fromBytes(nonces.binding)))
  });
  const adjustPoint = opts.adjustPoint === void 0 ? (n) => n : opts.adjustPoint;
  const validateIdentifier = (n) => {
    if (!Fn.isValid(n) || Fn.is0(n))
      throw new Error("Invalid identifier " + n);
    return n;
  };
  const serializeIdentifier = (id) => bytesToHex2(Fn.toBytes(validateIdentifier(id)));
  const parseIdentifier = (id) => {
    const n = validateIdentifier(Fn.fromBytes(hexToBytes2(id)));
    if (serializeIdentifier(n) !== id)
      throw new Error("expected canonical identifier hex");
    return n;
  };
  const Signature = {
    // RFC 9591 Appendix A encodes signatures canonically as
    // SerializeElement(R) || SerializeScalar(z).
    encode: (R, z) => {
      let res = concatBytes3(serializePoint(R), Fn.toBytes(z));
      if (opts.adjustTx)
        res = opts.adjustTx.encode(res);
      return res;
    },
    decode: (sig) => {
      if (opts.adjustTx)
        sig = opts.adjustTx.decode(sig);
      const R = parsePoint(sig.subarray(0, -Fn.BYTES));
      const z = Fn.fromBytes(sig.subarray(-Fn.BYTES));
      return { R, z };
    }
  };
  const genPointScalarPair = (rng = randomBytes2) => {
    let n = randomScalar(rng);
    if (opts.adjustScalar)
      n = opts.adjustScalar(n);
    let p = Point.BASE.multiply(n);
    return { scalar: n, point: p };
  };
  const nrErr = "roots are unavailable in FROST polynomial mode";
  const noRoots = {
    info: { G: Fn.ZERO, oddFactor: Fn.ZERO, powerOfTwo: 0 },
    roots() {
      throw new Error(nrErr);
    },
    brp() {
      throw new Error(nrErr);
    },
    inverse() {
      throw new Error(nrErr);
    },
    omega() {
      throw new Error(nrErr);
    },
    clear() {
    }
  };
  const Poly = poly(Fn, noRoots);
  const msm = (points, scalars) => pippenger(Point, points, scalars);
  const polynomialEvaluate = (x, coeffs) => {
    if (!coeffs.length)
      throw new Error("empty coefficients");
    return Poly.monomial.eval(coeffs, x);
  };
  const deriveInterpolatingValue = (L, xi) => {
    const err = "invalid parameters";
    if (!L.some((x) => Fn.eql(x, xi)))
      throw new Error(err);
    const Lset = new Set(L);
    if (Lset.size !== L.length)
      throw new Error(err);
    if (!Lset.has(xi))
      throw new Error(err);
    let num = Fn.ONE;
    let den = Fn.ONE;
    for (const x of L) {
      if (Fn.eql(x, xi))
        continue;
      num = Fn.mul(num, x);
      den = Fn.mul(den, Fn.sub(x, xi));
    }
    return Fn.div(num, den);
  };
  const evalutateVSS = (identifier, commitment) => {
    const monomial = Poly.monomial.basis(identifier, commitment.length);
    return msm(commitment, monomial);
  };
  const generateSecretPolynomial = (signers, secret, coeffs, rng = randomBytes2) => {
    validateSigners(signers);
    const secretScalar = secret === void 0 ? randomScalar(rng) : Fn.fromBytes(secret);
    if (!coeffs) {
      coeffs = [];
      for (let i = 0; i < signers.min - 1; i++)
        coeffs.push(randomScalar(rng));
    }
    if (coeffs.length !== signers.min - 1)
      throw new Error("wrong coefficients length");
    const coefficients = [secretScalar, ...coeffs];
    const commitment = coefficients.map((i) => Point.BASE.multiply(i));
    return { coefficients, commitment, secret: secretScalar };
  };
  const ProofOfKnowledge = {
    challenge: (id, verKey, R) => HDKG(concatBytes3(Fn.toBytes(id), serializePoint(verKey), serializePoint(R))),
    compute(id, coefficents, commitments, rng = randomBytes2) {
      if (coefficents.length < 1)
        throw new Error("coefficients should have at least one element");
      const { point: R, scalar: k } = genPointScalarPair(rng);
      const verKey = commitments[0];
      const c = this.challenge(id, verKey, R);
      const mu = Fn.add(k, Fn.mul(coefficents[0], c));
      return Signature.encode(R, mu);
    },
    validate(id, commitment, proof) {
      if (commitment.length < 1)
        throw new Error("commitment should have at least one element");
      const { R, z } = Signature.decode(proof);
      const phi = parsePoint(commitment[0]);
      const c = this.challenge(id, phi, R);
      if (!R.equals(Point.BASE.multiply(z).subtract(phi.multiply(c))))
        throw new Error("invalid proof of knowledge");
    }
  };
  const Basic = {
    challenge: (R, PK, msg) => {
      if (opts.challenge)
        return opts.challenge(R, PK, msg);
      return H2(concatBytes3(serializePoint(R), serializePoint(PK), msg));
    },
    sign(msg, sk, rng = randomBytes2) {
      const { point: R, scalar: r } = genPointScalarPair(rng);
      const PK = Point.BASE.multiply(sk);
      const c = this.challenge(R, PK, msg);
      const z = Fn.add(r, Fn.mul(c, sk));
      return [R, z];
    },
    verify(msg, R, z, PK) {
      if (opts.adjustPoint)
        PK = opts.adjustPoint(PK);
      if (opts.adjustPoint)
        R = opts.adjustPoint(R);
      const c = this.challenge(R, PK, msg);
      const zB = Point.BASE.multiply(z);
      const cA = PK.multiply(c);
      let check = zB.subtract(cA).subtract(R);
      if (check.clearCofactor)
        check = check.clearCofactor();
      return Point.ZERO.equals(check);
    }
  };
  const validateSecretShare = (identifier, commitment, signingShare) => {
    if (!Point.BASE.multiply(signingShare).equals(evalutateVSS(identifier, commitment)))
      throw new Error("invalid secret share");
  };
  const Identifier = {
    fromNumber(n) {
      if (!Number.isSafeInteger(n))
        throw new Error("expected safe interger");
      return serializeIdentifier(BigInt(n));
    },
    // Not in spec, but in FROST implementation,
    // seems useful and nice, no need to sync identifiers (would require more interactions)
    derive(s) {
      if (typeof s !== "string")
        throw new Error("wrong identifier string: " + s);
      return serializeIdentifier(HID(utf8ToBytes(s)));
    }
  };
  const generateNonce = (secret, rng = randomBytes2) => H3(concatBytes3(rng(32), Fn.toBytes(secret)));
  const getGroupCommitment = (GPK, commitmentList, msg) => {
    const CL = commitmentList.map((i) => [
      i.identifier,
      parseIdentifier(i.identifier),
      parsePoint(i.hiding),
      parsePoint(i.binding)
    ]);
    CL.sort((a, b) => a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0);
    const Cbytes = [];
    for (const [_, id, hC, bC] of CL)
      Cbytes.push(Fn.toBytes(id), serializePoint(hC), serializePoint(bC));
    const encodedCommitmentHash = H5(concatBytes3(...Cbytes));
    const rhoPrefix = concatBytes3(serializePoint(GPK), H4(msg), encodedCommitmentHash);
    const bindingFactors = {};
    for (const [i, id] of CL) {
      bindingFactors[i] = H1(concatBytes3(rhoPrefix, Fn.toBytes(id)));
    }
    const points = [];
    const scalars = [];
    for (const [i, _, hC, bC] of CL) {
      if (Point.ZERO.equals(hC) || Point.ZERO.equals(bC))
        throw new Error("infinity commitment");
      points.push(hC, bC);
      scalars.push(Fn.ONE, bindingFactors[i]);
    }
    const groupCommitment = msm(points, scalars);
    const identifiers = CL.map((i) => i[1]);
    return { identifiers, groupCommitment, bindingFactors };
  };
  const prepareShare = (PK, commitmentList, msg, identifier) => {
    const GPK = adjustPoint(parsePoint(PK));
    const id = parseIdentifier(identifier);
    const { identifiers, groupCommitment, bindingFactors } = getGroupCommitment(GPK, commitmentList, msg);
    const bindingFactor = bindingFactors[identifier];
    const lambda = deriveInterpolatingValue(identifiers, id);
    const challenge = Basic.challenge(groupCommitment, GPK, msg);
    return { lambda, challenge, bindingFactor, groupCommitment };
  };
  Object.freeze(Identifier);
  const frost = {
    Identifier,
    // DKG is Distributed Key Generation, not Trusted Dealer Key Generation.
    DKG: Object.freeze({
      // NOTE: we allow to pass secret scalar from user side,
      // this way it can be derived, instead of random generation
      round1: (id, signers, secret, rng = randomBytes2) => {
        validateSigners(signers);
        const idNum = parseIdentifier(id);
        const { coefficients, commitment } = generateSecretPolynomial(signers, secret, void 0, rng);
        const proofOfKnowledge = ProofOfKnowledge.compute(idNum, coefficients, commitment, rng);
        const commitmentBytes = commitment.map(serializePoint);
        const round1Public = {
          identifier: serializeIdentifier(idNum),
          commitment: commitmentBytes,
          proofOfKnowledge
        };
        const round1Secret = {
          identifier: idNum,
          coefficients,
          commitment: commitment.map(serializePoint),
          // Copy threshold metadata instead of retaining the caller-owned object by reference.
          signers: { min: signers.min, max: signers.max },
          step: 1
        };
        return { public: round1Public, secret: round1Secret };
      },
      round2: (secret, others) => {
        if (others.length !== secret.signers.max - 1)
          throw new Error("wrong number of round1 packages");
        if (!secret.coefficients || secret.step === 3)
          throw new Error("round3 package used in round2");
        const res = {};
        for (const p of others) {
          if (p.commitment.length !== secret.signers.min)
            throw new Error("wrong number of commitments");
          const id = parseIdentifier(p.identifier);
          if (id === secret.identifier)
            throw new Error("duplicate id=" + serializeIdentifier(id));
          ProofOfKnowledge.validate(id, p.commitment, p.proofOfKnowledge);
          for (const c of p.commitment)
            parsePoint(c);
          if (res[p.identifier])
            throw new Error("Duplicate id=" + id);
          const signingShare = Fn.toBytes(polynomialEvaluate(id, secret.coefficients));
          res[p.identifier] = {
            identifier: serializeIdentifier(secret.identifier),
            signingShare
          };
        }
        secret.step = 2;
        return res;
      },
      round3: (secret, round1, round2) => {
        if (round1.length !== secret.signers.max - 1)
          throw new Error("wrong length of round1 packages");
        if (!secret.coefficients || secret.step !== 2)
          throw new Error("round2 package used in round3");
        if (round2.length !== round1.length)
          throw new Error("wrong length of round2 packages");
        const merged = {};
        for (const r1 of round1) {
          if (!r1.identifier || !r1.commitment)
            throw new Error("wrong round1 share");
          merged[r1.identifier] = { ...r1 };
        }
        for (const r2 of round2) {
          if (!r2.identifier || !r2.signingShare)
            throw new Error("wrong round2 share");
          if (!merged[r2.identifier])
            throw new Error("round1 share for " + r2.identifier + " is missing");
          merged[r2.identifier].signingShare = r2.signingShare;
        }
        if (Object.keys(merged).length !== round1.length)
          throw new Error("mismatch identifiers between rounds");
        let signingShare = Fn.ZERO;
        if (secret.commitment.length !== secret.signers.min)
          throw new Error("wrong commitments length");
        const localCommitment = secret.commitment.map(parsePoint);
        const localShare = polynomialEvaluate(secret.identifier, secret.coefficients);
        validateSecretShare(secret.identifier, localCommitment, localShare);
        const localCommitmentBytes = localCommitment.map(serializePoint);
        const commitments = {
          [serializeIdentifier(secret.identifier)]: localCommitmentBytes
        };
        for (const k in merged) {
          const v = merged[k];
          if (!v.signingShare || !v.commitment)
            throw new Error("mismatch identifiers");
          const id = parseIdentifier(k);
          const signingSharePart = Fn.fromBytes(v.signingShare);
          const commitment = v.commitment.map(parsePoint);
          validateSecretShare(secret.identifier, commitment, signingSharePart);
          signingShare = Fn.add(signingShare, signingSharePart);
          const idSer = serializeIdentifier(id);
          if (commitments[idSer])
            throw new Error("duplicated id=" + idSer);
          commitments[idSer] = v.commitment;
        }
        signingShare = Fn.add(signingShare, localShare);
        const mergedCommitment = new Array(secret.signers.min).fill(Point.ZERO);
        for (const k in commitments) {
          const v = commitments[k];
          if (v.length !== secret.signers.min)
            throw new Error("wrong commitments length");
          for (let i = 0; i < v.length; i++)
            mergedCommitment[i] = mergedCommitment[i].add(parsePoint(v[i]));
        }
        const mergedCommitmentBytes = mergedCommitment.map(serializePoint);
        const verifyingShares = {};
        for (const k in commitments)
          verifyingShares[k] = serializePoint(evalutateVSS(parseIdentifier(k), mergedCommitment));
        let res = {
          public: {
            signers: { min: secret.signers.min, max: secret.signers.max },
            commitments: mergedCommitmentBytes,
            verifyingShares: Object.fromEntries(Object.entries(verifyingShares).map(([k, v]) => [k, v.slice()]))
          },
          secret: {
            identifier: serializeIdentifier(secret.identifier),
            signingShare: Fn.toBytes(signingShare)
          }
        };
        if (opts.adjustDKG)
          res = opts.adjustDKG(res);
        for (let i = 0; i < secret.coefficients.length; i++)
          secret.coefficients[i] -= secret.coefficients[i];
        delete secret.coefficients;
        secret.step = 3;
        return res;
      },
      clean(secret) {
        secret.identifier -= secret.identifier;
        if (secret.coefficients) {
          for (let i = 0; i < secret.coefficients.length; i++)
            secret.coefficients[i] -= secret.coefficients[i];
        }
        secret.step = 3;
      }
    }),
    // Trusted dealer setup
    // Generates keys for all participants
    trustedDealer(signers, identifiers, secret, rng = randomBytes2) {
      validateSigners(signers);
      if (identifiers === void 0) {
        identifiers = [];
        for (let i = 1; i <= signers.max; i++)
          identifiers.push(Identifier.fromNumber(i));
      } else {
        if (!Array.isArray(identifiers) || identifiers.length !== signers.max)
          throw new Error("identifiers should be array of " + signers.max);
      }
      const identifierNums = {};
      for (const id of identifiers) {
        const idNum = parseIdentifier(id);
        if (id in identifierNums)
          throw new Error("duplicated id=" + id);
        identifierNums[id] = idNum;
      }
      const sp = generateSecretPolynomial(signers, secret, void 0, rng);
      const commitmentBytes = sp.commitment.map(serializePoint);
      const secretShares = {};
      const verifyingShares = {};
      for (const id of identifiers) {
        const signingShare = polynomialEvaluate(identifierNums[id], sp.coefficients);
        verifyingShares[id] = serializePoint(Point.BASE.multiply(signingShare));
        secretShares[id] = {
          identifier: id,
          signingShare: Fn.toBytes(signingShare)
        };
      }
      return {
        public: {
          signers: { min: signers.min, max: signers.max },
          commitments: commitmentBytes,
          verifyingShares
        },
        secretShares
      };
    },
    // Validate secret (from trusted dealer or DKG)
    validateSecret(secret, pub) {
      const id = parseIdentifier(secret.identifier);
      const commitment = pub.commitments.map(parsePoint);
      const signingShare = Fn.fromBytes(secret.signingShare);
      validateSecretShare(id, commitment, signingShare);
    },
    // Actual signing
    // Round 1: each participant commit to nonces
    // Nonces kept private, commitments sent to coordinator (or every other participant)
    // NOTE: we don't need the message at this point, which lets a coordinator
    // keep multiple nonce commitments per participant in advance and skip
    // round1 for signing.
    // But then each participant needs to remember generated shares
    commit(secret, rng = randomBytes2) {
      const secretScalar = Fn.fromBytes(secret.signingShare);
      const hiding = generateNonce(secretScalar, rng);
      const binding = generateNonce(secretScalar, rng);
      const nonces = { hiding: Fn.toBytes(hiding), binding: Fn.toBytes(binding) };
      return { nonces, commitments: nonceCommitments(secret.identifier, nonces) };
    },
    // Round2: sign. Each participant creates a signature share from the secret
    // and the selected nonce commitments.
    signShare(secret, pub, nonces, commitmentList, msg) {
      validateCommitmentsNum(pub.signers, commitmentList.length);
      const hidingNonce0 = Fn.fromBytes(nonces.hiding);
      const bindingNonce0 = Fn.fromBytes(nonces.binding);
      if (Fn.is0(hidingNonce0) || Fn.is0(bindingNonce0))
        throw new Error("signing nonces already used");
      const expectedCommitment = {
        identifier: secret.identifier,
        hiding: serializePoint(Point.BASE.multiply(hidingNonce0)),
        binding: serializePoint(Point.BASE.multiply(bindingNonce0))
      };
      const commitment = commitmentList.find((i) => i.identifier === secret.identifier);
      if (!commitment)
        throw new Error("missing signer commitment");
      if (bytesToHex2(commitment.hiding) !== bytesToHex2(expectedCommitment.hiding) || bytesToHex2(commitment.binding) !== bytesToHex2(expectedCommitment.binding))
        throw new Error("incorrect signer commitment");
      if (opts.adjustSecret)
        secret = opts.adjustSecret(secret, pub);
      if (opts.adjustPublic)
        pub = opts.adjustPublic(pub);
      const SK = Fn.fromBytes(secret.signingShare);
      const { lambda, challenge, bindingFactor, groupCommitment } = prepareShare(pub.commitments[0], commitmentList, msg, secret.identifier);
      const N = opts.adjustNonces ? opts.adjustNonces(groupCommitment, nonces) : nonces;
      const hidingNonce = opts.adjustNonces ? Fn.fromBytes(N.hiding) : hidingNonce0;
      const bindingNonce = opts.adjustNonces ? Fn.fromBytes(N.binding) : bindingNonce0;
      const t = Fn.mul(Fn.mul(lambda, SK), challenge);
      const t2 = Fn.mul(bindingNonce, bindingFactor);
      const r = Fn.toBytes(Fn.add(Fn.add(hidingNonce, t2), t));
      nonces.hiding.fill(0);
      nonces.binding.fill(0);
      return r;
    },
    // Each participant (or coordinator) can verify signatures from other participants
    verifyShare(pub, commitmentList, msg, identifier, sigShare) {
      if (opts.adjustPublic)
        pub = opts.adjustPublic(pub);
      const comm = commitmentList.find((i) => i.identifier === identifier);
      if (!comm)
        throw new Error("cannot find identifier commitment");
      const PK = parsePoint(pub.verifyingShares[identifier]);
      const hidingNonceCommitment = parsePoint(comm.hiding);
      const bindingNonceCommitment = parsePoint(comm.binding);
      const { lambda, challenge, bindingFactor, groupCommitment } = prepareShare(pub.commitments[0], commitmentList, msg, identifier);
      let commShare = hidingNonceCommitment.add(bindingNonceCommitment.multiply(bindingFactor));
      if (opts.adjustGroupCommitmentShare)
        commShare = opts.adjustGroupCommitmentShare(groupCommitment, commShare);
      const l = Point.BASE.multiply(Fn.fromBytes(sigShare));
      const r = commShare.add(PK.multiply(Fn.mul(challenge, lambda)));
      return l.equals(r);
    },
    // Aggregate multiple signature shares into groupSignature
    aggregate(pub, commitmentList, msg, sigShares) {
      if (opts.adjustPublic)
        pub = opts.adjustPublic(pub);
      try {
        validateCommitmentsNum(pub.signers, commitmentList.length);
      } catch {
        throw new AggErr("aggregation failed", []);
      }
      const ids = commitmentList.map((i) => i.identifier);
      if (ids.length !== Object.keys(sigShares).length)
        throw new AggErr("aggregation failed", []);
      for (const id of ids) {
        if (!(id in sigShares) || !(id in pub.verifyingShares))
          throw new AggErr("aggregation failed", []);
      }
      const GPK = parsePoint(pub.commitments[0]);
      const { groupCommitment } = getGroupCommitment(GPK, commitmentList, msg);
      let z = Fn.ZERO;
      for (const id of ids)
        z = Fn.add(z, Fn.fromBytes(sigShares[id]));
      if (!Basic.verify(msg, groupCommitment, z, GPK)) {
        const cheaters = [];
        for (const id of ids) {
          if (!this.verifyShare(pub, commitmentList, msg, id, sigShares[id]))
            cheaters.push(id);
        }
        throw new AggErr("aggregation failed", cheaters);
      }
      return Signature.encode(groupCommitment, z);
    },
    // Basic sign/verify using single key
    sign(msg, secretKey) {
      let sk = Fn.fromBytes(secretKey);
      if (opts.adjustScalar)
        sk = opts.adjustScalar(sk);
      const [R, z] = Basic.sign(msg, sk);
      return Signature.encode(R, z);
    },
    verify(sig, msg, publicKey) {
      const PK = opts.parsePublicKey ? opts.parsePublicKey(publicKey) : parsePoint(publicKey);
      const { R, z } = Signature.decode(sig);
      return Basic.verify(msg, R, z, PK);
    },
    // Combine multiple secret shares to restore secret
    combineSecret(shares, signers) {
      validateSigners(signers);
      if (!Array.isArray(shares) || shares.length < signers.min)
        throw new Error("wrong secret shares array");
      const points = [];
      const seen = {};
      for (const s of shares) {
        const idNum = parseIdentifier(s.identifier);
        const id = serializeIdentifier(idNum);
        if (seen[id])
          throw new Error("duplicated id=" + id);
        seen[id] = true;
        points.push([idNum, Fn.fromBytes(s.signingShare)]);
      }
      const xCoords = points.map(([x]) => x);
      let res = Fn.ZERO;
      for (const [x, y] of points)
        res = Fn.add(res, Fn.mul(y, deriveInterpolatingValue(xCoords, x)));
      return Fn.toBytes(res);
    },
    // Utils
    utils: Object.freeze({
      Fn,
      // NOTE: we re-export it here because it may be different from Point.Fn (ed448 is fun!)
      // Test RNG overrides still go through noble's non-zero scalar derivation; this is not a raw
      // "bytes become scalar" escape hatch.
      randomScalar: (rng = randomBytes2) => Fn.toBytes(genPointScalarPair(rng).scalar),
      generateSecretPolynomial: (signers, secret, coeffs, rng) => {
        const res = generateSecretPolynomial(signers, secret, coeffs, rng);
        return { ...res, commitment: res.commitment.map(serializePoint) };
      }
    })
  };
  return Object.freeze(frost);
}
var validateSigners, validateCommitmentsNum, AggErr;
var init_frost = __esm({
  "node_modules/@noble/curves/abstract/frost.js"() {
    init_utils2();
    init_utils3();
    init_curve();
    init_fft();
    init_modular();
    validateSigners = (signers) => {
      if (!Number.isSafeInteger(signers.min) || !Number.isSafeInteger(signers.max))
        throw new Error("Wrong signers info: min=" + signers.min + " max=" + signers.max);
      if (signers.min < 2 || signers.max < 2 || signers.min > signers.max)
        throw new Error("Wrong signers info: min=" + signers.min + " max=" + signers.max);
    };
    validateCommitmentsNum = (signers, len) => {
      if (len < signers.min || len > signers.max)
        throw new Error("Wrong number of commitments=" + len);
    };
    AggErr = class extends Error {
      constructor(msg, cheaters) {
        super(msg);
        // Empty means aggregation failed before per-share verification could attribute a signer.
        __publicField(this, "cheaters");
        this.cheaters = cheaters;
      }
    };
  }
});

// node_modules/@noble/curves/abstract/oprf.js
function createOPRF(opts) {
  validateObject(opts, {
    name: "string",
    hash: "function",
    hashToScalar: "function",
    hashToGroup: "function"
  });
  validatePointCons(opts.Point);
  const { name, Point, hash } = opts;
  const { Fn } = Point;
  const hashToGroup = (msg, ctx) => opts.hashToGroup(msg, {
    DST: concatBytes3(asciiToBytes("HashToGroup-"), ctx)
  });
  const hashToScalarPrefixed = (msg, ctx) => opts.hashToScalar(msg, { DST: concatBytes3(_DST_scalarBytes, ctx) });
  const randomScalar = (rng = randomBytes2) => {
    const t = mapHashToField(rng(getMinHashLength(Fn.ORDER)), Fn.ORDER, Fn.isLE);
    return Fn.isLE ? bytesToNumberLE(t) : bytesToNumberBE(t);
  };
  const msm = (points, scalars) => pippenger(Point, points, scalars);
  const getCtx = (mode) => concatBytes3(asciiToBytes("OPRFV1-"), new Uint8Array([mode]), asciiToBytes("-" + name));
  const ctxOPRF = getCtx(0);
  const ctxVOPRF = getCtx(1);
  const ctxPOPRF = getCtx(2);
  function encode(...args) {
    const res2 = [];
    for (const a of args) {
      if (typeof a === "number")
        res2.push(numberToBytesBE(a, 2));
      else if (typeof a === "string")
        res2.push(asciiToBytes(a));
      else {
        abytes3(a);
        res2.push(numberToBytesBE(a.length, 2), a);
      }
    }
    return concatBytes3(...res2);
  }
  const inputBytes = (title, bytes) => {
    abytes3(bytes, void 0, title);
    if (bytes.length > 65535)
      throw new Error(`"${title}" expected Uint8Array of length <= 65535, got length=${bytes.length}`);
    return bytes;
  };
  const hashInput = (...bytes) => hash(encode(...bytes, "Finalize"));
  function getTranscripts(B, C, D, ctx) {
    const Bm = B.toBytes();
    const seed = hash(encode(Bm, concatBytes3(asciiToBytes("Seed-"), ctx)));
    const res2 = [];
    for (let i = 0; i < C.length; i++) {
      const Ci = C[i].toBytes();
      const Di = D[i].toBytes();
      const di = hashToScalarPrefixed(encode(seed, i, Ci, Di, "Composite"), ctx);
      res2.push(di);
    }
    return res2;
  }
  function computeComposites(B, C, D, ctx) {
    const T = getTranscripts(B, C, D, ctx);
    const M = msm(C, T);
    const Z = msm(D, T);
    return { M, Z };
  }
  function computeCompositesFast(k, B, C, D, ctx) {
    const T = getTranscripts(B, C, D, ctx);
    const M = msm(C, T);
    const Z = M.multiply(k);
    return { M, Z };
  }
  function challengeTranscript(B, M, Z, t2, t3, ctx) {
    const [Bm, a0, a1, a2, a3] = [B, M, Z, t2, t3].map((i) => i.toBytes());
    return hashToScalarPrefixed(encode(Bm, a0, a1, a2, a3, "Challenge"), ctx);
  }
  function generateProof(ctx, k, B, C, D, rng) {
    const { M, Z } = computeCompositesFast(k, B, C, D, ctx);
    const r = randomScalar(rng);
    const t2 = Point.BASE.multiply(r);
    const t3 = M.multiply(r);
    const c = challengeTranscript(B, M, Z, t2, t3, ctx);
    const s = Fn.sub(r, Fn.mul(c, k));
    return concatBytes3(...[c, s].map((i) => Fn.toBytes(i)));
  }
  function verifyProof(ctx, B, C, D, proof) {
    abytes3(proof, 2 * Fn.BYTES);
    const { M, Z } = computeComposites(B, C, D, ctx);
    const [c, s] = [proof.subarray(0, Fn.BYTES), proof.subarray(Fn.BYTES)].map((f) => Fn.fromBytes(f));
    const t2 = Point.BASE.multiply(s).add(B.multiply(c));
    const t3 = M.multiply(s).add(Z.multiply(c));
    const expectedC = challengeTranscript(B, M, Z, t2, t3, ctx);
    if (!Fn.eql(c, expectedC))
      throw new Error("proof verification failed");
  }
  function generateKeyPair() {
    const skS = randomScalar();
    const pkS = Point.BASE.multiply(skS);
    return { secretKey: Fn.toBytes(skS), publicKey: pkS.toBytes() };
  }
  function deriveKeyPair(ctx, seed, info) {
    abytes3(seed, 32, "seed");
    info = inputBytes("keyInfo", info);
    const dst = concatBytes3(asciiToBytes("DeriveKeyPair"), ctx);
    const msg = concatBytes3(seed, encode(info), Uint8Array.of(0));
    for (let counter = 0; counter <= 255; counter++) {
      msg[msg.length - 1] = counter;
      const skS = opts.hashToScalar(msg, { DST: dst });
      if (Fn.is0(skS))
        continue;
      return {
        secretKey: Fn.toBytes(skS),
        publicKey: Point.BASE.multiply(skS).toBytes()
      };
    }
    throw new Error("Cannot derive key");
  }
  const wirePoint = (label, bytes) => {
    const point = Point.fromBytes(bytes);
    if (point.equals(Point.ZERO))
      throw new Error(label + " point at infinity");
    return point;
  };
  function blind(ctx, input, rng = randomBytes2) {
    input = inputBytes("input", input);
    const blind2 = randomScalar(rng);
    const inputPoint = hashToGroup(input, ctx);
    if (inputPoint.equals(Point.ZERO))
      throw new Error("Input point at infinity");
    const blinded = inputPoint.multiply(blind2);
    return { blind: Fn.toBytes(blind2), blinded: blinded.toBytes() };
  }
  function evaluate(ctx, secretKey, input) {
    input = inputBytes("input", input);
    const skS = Fn.fromBytes(secretKey);
    const inputPoint = hashToGroup(input, ctx);
    if (inputPoint.equals(Point.ZERO))
      throw new Error("Input point at infinity");
    const unblinded = inputPoint.multiply(skS).toBytes();
    return hashInput(input, unblinded);
  }
  const oprf = Object.freeze({
    generateKeyPair,
    deriveKeyPair: (seed, keyInfo) => deriveKeyPair(ctxOPRF, seed, keyInfo),
    blind: (input, rng = randomBytes2) => blind(ctxOPRF, input, rng),
    blindEvaluate(secretKey, blindedPoint) {
      const skS = Fn.fromBytes(secretKey);
      const elm = wirePoint("blinded", blindedPoint);
      return elm.multiply(skS).toBytes();
    },
    finalize(input, blindBytes, evaluatedBytes) {
      input = inputBytes("input", input);
      const blind2 = Fn.fromBytes(blindBytes);
      const evalPoint = wirePoint("evaluated", evaluatedBytes);
      const unblinded = evalPoint.multiply(Fn.inv(blind2)).toBytes();
      return hashInput(input, unblinded);
    },
    evaluate: (secretKey, input) => evaluate(ctxOPRF, secretKey, input)
  });
  const voprf = Object.freeze({
    generateKeyPair,
    deriveKeyPair: (seed, keyInfo) => deriveKeyPair(ctxVOPRF, seed, keyInfo),
    blind: (input, rng = randomBytes2) => blind(ctxVOPRF, input, rng),
    blindEvaluateBatch(secretKey, publicKey, blinded, rng = randomBytes2) {
      if (!Array.isArray(blinded))
        throw new Error("expected array");
      const skS = Fn.fromBytes(secretKey);
      const pkS = wirePoint("public key", publicKey);
      const blindedPoints = blinded.map((i) => wirePoint("blinded", i));
      const evaluated = blindedPoints.map((i) => i.multiply(skS));
      const proof = generateProof(ctxVOPRF, skS, pkS, blindedPoints, evaluated, rng);
      return { evaluated: evaluated.map((i) => i.toBytes()), proof };
    },
    blindEvaluate(secretKey, publicKey, blinded, rng = randomBytes2) {
      const res2 = this.blindEvaluateBatch(secretKey, publicKey, [blinded], rng);
      return { evaluated: res2.evaluated[0], proof: res2.proof };
    },
    finalizeBatch(items, publicKey, proof) {
      if (!Array.isArray(items))
        throw new Error("expected array");
      const pkS = wirePoint("public key", publicKey);
      const blindedPoints = items.map((i) => wirePoint("blinded", i.blinded));
      const evalPoints = items.map((i) => wirePoint("evaluated", i.evaluated));
      verifyProof(ctxVOPRF, pkS, blindedPoints, evalPoints, proof);
      return items.map((i) => oprf.finalize(i.input, i.blind, i.evaluated));
    },
    finalize(input, blind2, evaluated, blinded, publicKey, proof) {
      return this.finalizeBatch([{ input, blind: blind2, evaluated, blinded }], publicKey, proof)[0];
    },
    evaluate: (secretKey, input) => evaluate(ctxVOPRF, secretKey, input)
  });
  const poprf = (info) => {
    info = inputBytes("info", info);
    const m = hashToScalarPrefixed(encode("Info", info), ctxPOPRF);
    const T = Point.BASE.multiply(m);
    return Object.freeze({
      generateKeyPair,
      deriveKeyPair: (seed, keyInfo) => deriveKeyPair(ctxPOPRF, seed, keyInfo),
      blind(input, publicKey, rng = randomBytes2) {
        input = inputBytes("input", input);
        const pkS = wirePoint("public key", publicKey);
        const tweakedKey = T.add(pkS);
        if (tweakedKey.equals(Point.ZERO))
          throw new Error("tweakedKey point at infinity");
        const blind2 = randomScalar(rng);
        const inputPoint = hashToGroup(input, ctxPOPRF);
        if (inputPoint.equals(Point.ZERO))
          throw new Error("Input point at infinity");
        const blindedPoint = inputPoint.multiply(blind2);
        return {
          blind: Fn.toBytes(blind2),
          blinded: blindedPoint.toBytes(),
          tweakedKey: tweakedKey.toBytes()
        };
      },
      blindEvaluateBatch(secretKey, blinded, rng = randomBytes2) {
        if (!Array.isArray(blinded))
          throw new Error("expected array");
        const skS = Fn.fromBytes(secretKey);
        const t = Fn.add(skS, m);
        const invT = Fn.inv(t);
        const blindedPoints = blinded.map((i) => wirePoint("blinded", i));
        const evalPoints = blindedPoints.map((i) => i.multiply(invT));
        const tweakedKey = Point.BASE.multiply(t);
        const proof = generateProof(ctxPOPRF, t, tweakedKey, evalPoints, blindedPoints, rng);
        return { evaluated: evalPoints.map((i) => i.toBytes()), proof };
      },
      blindEvaluate(secretKey, blinded, rng = randomBytes2) {
        const res2 = this.blindEvaluateBatch(secretKey, [blinded], rng);
        return { evaluated: res2.evaluated[0], proof: res2.proof };
      },
      finalizeBatch(items, proof, tweakedKey) {
        if (!Array.isArray(items))
          throw new Error("expected array");
        const inputs = items.map((i) => inputBytes("input", i.input));
        const evalPoints = items.map((i) => wirePoint("evaluated", i.evaluated));
        verifyProof(ctxPOPRF, wirePoint("tweakedKey", tweakedKey), evalPoints, items.map((i) => wirePoint("blinded", i.blinded)), proof);
        return items.map((i, j) => {
          const blind2 = Fn.fromBytes(i.blind);
          const point = evalPoints[j].multiply(Fn.inv(blind2)).toBytes();
          return hashInput(inputs[j], info, point);
        });
      },
      finalize(input, blind2, evaluated, blinded, proof, tweakedKey) {
        return this.finalizeBatch([{ input, blind: blind2, evaluated, blinded }], proof, tweakedKey)[0];
      },
      evaluate(secretKey, input) {
        input = inputBytes("input", input);
        const skS = Fn.fromBytes(secretKey);
        const inputPoint = hashToGroup(input, ctxPOPRF);
        if (inputPoint.equals(Point.ZERO))
          throw new Error("Input point at infinity");
        const t = Fn.add(skS, m);
        const invT = Fn.inv(t);
        const unblinded = inputPoint.multiply(invT).toBytes();
        return hashInput(input, info, unblinded);
      }
    });
  };
  const res = { name, oprf, voprf, poprf, __tests: Object.freeze({ Fn }) };
  return Object.freeze(res);
}
var _DST_scalarBytes;
var init_oprf = __esm({
  "node_modules/@noble/curves/abstract/oprf.js"() {
    init_utils3();
    init_curve();
    init_hash_to_curve();
    init_modular();
    _DST_scalarBytes = /* @__PURE__ */ asciiToBytes(_DST_scalar);
  }
});

// node_modules/@noble/hashes/hmac.js
var _HMAC, hmac;
var init_hmac = __esm({
  "node_modules/@noble/hashes/hmac.js"() {
    init_utils2();
    _HMAC = class {
      constructor(hash, key) {
        __publicField(this, "oHash");
        __publicField(this, "iHash");
        __publicField(this, "blockLen");
        __publicField(this, "outputLen");
        __publicField(this, "canXOF", false);
        __publicField(this, "finished", false);
        __publicField(this, "destroyed", false);
        ahash(hash);
        abytes2(key, void 0, "key");
        this.iHash = hash.create();
        if (typeof this.iHash.update !== "function")
          throw new Error("Expected instance of class which extends utils.Hash");
        this.blockLen = this.iHash.blockLen;
        this.outputLen = this.iHash.outputLen;
        const blockLen = this.blockLen;
        const pad = new Uint8Array(blockLen);
        pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
        for (let i = 0; i < pad.length; i++)
          pad[i] ^= 54;
        this.iHash.update(pad);
        this.oHash = hash.create();
        for (let i = 0; i < pad.length; i++)
          pad[i] ^= 54 ^ 92;
        this.oHash.update(pad);
        clean2(pad);
      }
      update(buf) {
        aexists2(this);
        this.iHash.update(buf);
        return this;
      }
      digestInto(out) {
        aexists2(this);
        aoutput2(out, this);
        this.finished = true;
        const buf = out.subarray(0, this.outputLen);
        this.iHash.digestInto(buf);
        this.oHash.update(buf);
        this.oHash.digestInto(buf);
        this.destroy();
      }
      digest() {
        const out = new Uint8Array(this.oHash.outputLen);
        this.digestInto(out);
        return out;
      }
      _cloneInto(to) {
        to || (to = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
        to = to;
        to.finished = finished;
        to.destroyed = destroyed;
        to.blockLen = blockLen;
        to.outputLen = outputLen;
        to.oHash = oHash._cloneInto(to.oHash);
        to.iHash = iHash._cloneInto(to.iHash);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
      destroy() {
        this.destroyed = true;
        this.oHash.destroy();
        this.iHash.destroy();
      }
    };
    hmac = /* @__PURE__ */ (() => {
      const hmac_ = (hash, key, message) => new _HMAC(hash, key).update(message).digest();
      hmac_.create = (hash, key) => new _HMAC(hash, key);
      return hmac_;
    })();
  }
});

// node_modules/@noble/curves/abstract/weierstrass.js
function _splitEndoScalar(k, basis, n) {
  aInRange("scalar", k, _0n4, n);
  const [[a1, b1], [a2, b2]] = basis;
  const c1 = divNearest(b2 * k, n);
  const c2 = divNearest(-b1 * k, n);
  let k1 = k - c1 * a1 - c2 * a2;
  let k2 = -c1 * b1 - c2 * b2;
  const k1neg = k1 < _0n4;
  const k2neg = k2 < _0n4;
  if (k1neg)
    k1 = -k1;
  if (k2neg)
    k2 = -k2;
  const MAX_NUM = bitMask(Math.ceil(bitLen(n) / 2)) + _1n4;
  if (k1 < _0n4 || k1 >= MAX_NUM || k2 < _0n4 || k2 >= MAX_NUM) {
    throw new Error("splitScalar (endomorphism): failed for k");
  }
  return { k1neg, k1, k2neg, k2 };
}
function validateSigFormat(format) {
  if (!["compact", "recovered", "der"].includes(format))
    throw new Error('Signature format must be "compact", "recovered", or "der"');
  return format;
}
function validateSigOpts(opts, def) {
  validateObject(opts);
  const optsn = {};
  for (let optName of Object.keys(def)) {
    optsn[optName] = opts[optName] === void 0 ? def[optName] : opts[optName];
  }
  abool2(optsn.lowS, "lowS");
  abool2(optsn.prehash, "prehash");
  if (optsn.format !== void 0)
    validateSigFormat(optsn.format);
  return optsn;
}
function weierstrass(params, extraOpts = {}) {
  const validated = createCurveFields("weierstrass", params, extraOpts);
  const Fp = validated.Fp;
  const Fn = validated.Fn;
  let CURVE = validated.CURVE;
  const { h: cofactor, n: CURVE_ORDER } = CURVE;
  validateObject(extraOpts, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object"
  });
  const { endo, allowInfinityPoint } = extraOpts;
  if (endo) {
    if (!Fp.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) {
      throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    }
  }
  const lengths = getWLengths(Fp, Fn);
  function assertCompressionIsSupported() {
    if (!Fp.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function pointToBytes(_c, point, isCompressed) {
    if (allowInfinityPoint && point.is0())
      return Uint8Array.of(0);
    const { x, y } = point.toAffine();
    const bx = Fp.toBytes(x);
    abool2(isCompressed, "isCompressed");
    if (isCompressed) {
      assertCompressionIsSupported();
      const hasEvenY = !Fp.isOdd(y);
      return concatBytes3(pprefix(hasEvenY), bx);
    } else {
      return concatBytes3(Uint8Array.of(4), bx, Fp.toBytes(y));
    }
  }
  function pointFromBytes(bytes) {
    abytes3(bytes, void 0, "Point");
    const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
    const length = bytes.length;
    const head = bytes[0];
    const tail = bytes.subarray(1);
    if (allowInfinityPoint && length === 1 && head === 0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (length === comp && (head === 2 || head === 3)) {
      const x = Fp.fromBytes(tail);
      if (!Fp.isValid(x))
        throw new Error("bad point: is not on curve, wrong x");
      const y2 = weierstrassEquation(x);
      let y;
      try {
        y = Fp.sqrt(y2);
      } catch (sqrtError) {
        const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + err);
      }
      assertCompressionIsSupported();
      const evenY = Fp.isOdd(y);
      const evenH = (head & 1) === 1;
      if (evenH !== evenY)
        y = Fp.neg(y);
      return { x, y };
    } else if (length === uncomp && head === 4) {
      const L = Fp.BYTES;
      const x = Fp.fromBytes(tail.subarray(0, L));
      const y = Fp.fromBytes(tail.subarray(L, L * 2));
      if (!isValidXY(x, y))
        throw new Error("bad point: is not on curve");
      return { x, y };
    } else {
      throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
    }
  }
  const encodePoint = extraOpts.toBytes === void 0 ? pointToBytes : extraOpts.toBytes;
  const decodePoint = extraOpts.fromBytes === void 0 ? pointFromBytes : extraOpts.fromBytes;
  function weierstrassEquation(x) {
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
  }
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n2);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function acoord(title, n, banZero = false) {
    if (!Fp.isValid(n) || banZero && Fp.is0(n))
      throw new Error(`bad point coordinate ${title}`);
    return n;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point))
      throw new Error("Weierstrass Point expected");
  }
  function splitEndoScalarN(k) {
    if (!endo || !endo.basises)
      throw new Error("no endo");
    return _splitEndoScalar(k, endo.basises, Fn.ORDER);
  }
  function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
    k2p = new Point(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
    k1p = negateCt(k1neg, k1p);
    k2p = negateCt(k2neg, k2p);
    return k1p.add(k2p);
  }
  const _Point = class _Point {
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(X, Y, Z) {
      __publicField(this, "X");
      __publicField(this, "Y");
      __publicField(this, "Z");
      this.X = acoord("x", X);
      this.Y = acoord("y", Y, true);
      this.Z = acoord("z", Z);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof _Point)
        throw new Error("projective point not allowed");
      if (Fp.is0(x) && Fp.is0(y))
        return _Point.ZERO;
      return new _Point(x, y, Fp.ONE);
    }
    static fromBytes(bytes) {
      const P = _Point.fromAffine(decodePoint(abytes3(bytes, void 0, "point")));
      P.assertValidity();
      return P;
    }
    static fromHex(hex) {
      return _Point.fromBytes(hexToBytes2(hex));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     *
     * @param windowSize
     * @param isLazy - true will defer table computation until the first multiplication
     * @returns
     */
    precompute(windowSize = 8, isLazy = true) {
      wnaf.createCache(this, windowSize);
      if (!isLazy)
        this.multiply(_3n2);
      return this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      const p = this;
      if (p.is0()) {
        if (extraOpts.allowInfinityPoint && Fp.is0(p.X) && Fp.eql(p.Y, Fp.ONE) && Fp.is0(p.Z))
          return;
        throw new Error("bad point: ZERO");
      }
      const { x, y } = p.toAffine();
      if (!Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("bad point: x or y not field elements");
      if (!isValidXY(x, y))
        throw new Error("bad point: equation left != right");
      if (!p.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (!Fp.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !Fp.isOdd(y);
    }
    /** Compare one point to another. */
    equals(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new _Point(this.X, Fp.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n2);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new _Point(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n2);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new _Point(X3, Y3, Z3);
    }
    subtract(other) {
      aprjpoint(other);
      return this.add(other.negate());
    }
    is0() {
      return this.equals(_Point.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar - by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      const { endo: endo2 } = extraOpts;
      if (!Fn.isValidNot0(scalar))
        throw new RangeError("invalid scalar: out of range");
      let point, fake;
      const mul3 = (n) => wnaf.cached(this, n, (p) => normalizeZ(_Point, p));
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
        const { p: k1p, f: k1f } = mul3(k1);
        const { p: k2p, f: k2f } = mul3(k2);
        fake = k1f.add(k2f);
        point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg);
      } else {
        const { p, f } = mul3(scalar);
        point = p;
        fake = f;
      }
      return normalizeZ(_Point, [point, fake])[0];
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(scalar) {
      const { endo: endo2 } = extraOpts;
      const p = this;
      const sc = scalar;
      if (!Fn.isValid(sc))
        throw new RangeError("invalid scalar: out of range");
      if (sc === _0n4 || p.is0())
        return _Point.ZERO;
      if (sc === _1n4)
        return p;
      if (wnaf.hasCache(this))
        return this.multiply(sc);
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
        const { p1, p2 } = mulEndoUnsafe(_Point, p, k1, k2);
        return finishEndo(endo2.beta, p1, p2, k1neg, k2neg);
      } else {
        return wnaf.unsafe(p, sc);
      }
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * (X, Y, Z) ∋ (x=X/Z, y=Y/Z).
     * @param invertedZ - Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(invertedZ) {
      const p = this;
      let iz = invertedZ;
      const { X, Y, Z } = p;
      if (Fp.eql(Z, Fp.ONE))
        return { x: X, y: Y };
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? Fp.ONE : Fp.inv(Z);
      const x = Fp.mul(X, iz);
      const y = Fp.mul(Y, iz);
      const zz = Fp.mul(Z, iz);
      if (is0)
        return { x: Fp.ZERO, y: Fp.ZERO };
      if (!Fp.eql(zz, Fp.ONE))
        throw new Error("invZ was invalid");
      return { x, y };
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      const { isTorsionFree } = extraOpts;
      if (cofactor === _1n4)
        return true;
      if (isTorsionFree)
        return isTorsionFree(_Point, this);
      return wnaf.unsafe(this, CURVE_ORDER).is0();
    }
    clearCofactor() {
      const { clearCofactor } = extraOpts;
      if (cofactor === _1n4)
        return this;
      if (clearCofactor)
        return clearCofactor(_Point, this);
      return this.multiplyUnsafe(cofactor);
    }
    isSmallOrder() {
      if (cofactor === _1n4)
        return this.is0();
      return this.clearCofactor().is0();
    }
    toBytes(isCompressed = true) {
      abool2(isCompressed, "isCompressed");
      this.assertValidity();
      return encodePoint(_Point, this, isCompressed);
    }
    toHex(isCompressed = true) {
      return bytesToHex2(this.toBytes(isCompressed));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  };
  // base / generator point
  __publicField(_Point, "BASE", new _Point(CURVE.Gx, CURVE.Gy, Fp.ONE));
  // zero / infinity / identity point
  __publicField(_Point, "ZERO", new _Point(Fp.ZERO, Fp.ONE, Fp.ZERO));
  // 0, 1, 0
  // math field
  __publicField(_Point, "Fp", Fp);
  // scalar field
  __publicField(_Point, "Fn", Fn);
  let Point = _Point;
  const bits = Fn.BITS;
  const wnaf = new wNAF(Point, extraOpts.endo ? Math.ceil(bits / 2) : bits);
  if (bits >= 8)
    Point.BASE.precompute(8);
  Object.freeze(Point.prototype);
  Object.freeze(Point);
  return Point;
}
function pprefix(hasEvenY) {
  return Uint8Array.of(hasEvenY ? 2 : 3);
}
function SWUFpSqrtRatio(Fp, Z) {
  const F = validateField(Fp);
  const q = F.ORDER;
  let l = _0n4;
  for (let o = q - _1n4; o % _2n2 === _0n4; o /= _2n2)
    l += _1n4;
  const c1 = l;
  const _2n_pow_c1_1 = _2n2 << c1 - _1n4 - _1n4;
  const _2n_pow_c1 = _2n_pow_c1_1 * _2n2;
  const c2 = (q - _1n4) / _2n_pow_c1;
  const c3 = (c2 - _1n4) / _2n2;
  const c4 = _2n_pow_c1 - _1n4;
  const c5 = _2n_pow_c1_1;
  const c6 = F.pow(Z, c2);
  const c7 = F.pow(Z, (c2 + _1n4) / _2n2);
  let sqrtRatio = (u, v) => {
    let tv1 = c6;
    let tv2 = F.pow(v, c4);
    let tv3 = F.sqr(tv2);
    tv3 = F.mul(tv3, v);
    let tv5 = F.mul(u, tv3);
    tv5 = F.pow(tv5, c3);
    tv5 = F.mul(tv5, tv2);
    tv2 = F.mul(tv5, v);
    tv3 = F.mul(tv5, u);
    let tv4 = F.mul(tv3, tv2);
    tv5 = F.pow(tv4, c5);
    let isQR = F.eql(tv5, F.ONE);
    tv2 = F.mul(tv3, c7);
    tv5 = F.mul(tv4, tv1);
    tv3 = F.cmov(tv2, tv3, isQR);
    tv4 = F.cmov(tv5, tv4, isQR);
    for (let i = c1; i > _1n4; i--) {
      let tv52 = i - _2n2;
      tv52 = _2n2 << tv52 - _1n4;
      let tvv5 = F.pow(tv4, tv52);
      const e1 = F.eql(tvv5, F.ONE);
      tv2 = F.mul(tv3, tv1);
      tv1 = F.mul(tv1, tv1);
      tvv5 = F.mul(tv4, tv1);
      tv3 = F.cmov(tv2, tv3, e1);
      tv4 = F.cmov(tvv5, tv4, e1);
    }
    return { isValid: !F.is0(v) && (isQR || F.is0(u)), value: tv3 };
  };
  if (F.ORDER % _4n2 === _3n2) {
    const c12 = (F.ORDER - _3n2) / _4n2;
    const c22 = F.sqrt(F.neg(Z));
    sqrtRatio = (u, v) => {
      let tv1 = F.sqr(v);
      const tv2 = F.mul(u, v);
      tv1 = F.mul(tv1, tv2);
      let y1 = F.pow(tv1, c12);
      y1 = F.mul(y1, tv2);
      const y2 = F.mul(y1, c22);
      const tv3 = F.mul(F.sqr(y1), v);
      const isQR = F.eql(tv3, u);
      let y = F.cmov(y2, y1, isQR);
      return { isValid: !F.is0(v) && isQR, value: y };
    };
  }
  return sqrtRatio;
}
function mapToCurveSimpleSWU(Fp, opts) {
  const F = validateField(Fp);
  const { A, B, Z } = opts;
  if (!F.isValidNot0(A) || !F.isValidNot0(B) || !F.isValid(Z))
    throw new Error("mapToCurveSimpleSWU: invalid opts");
  if (F.eql(Z, F.neg(F.ONE)) || FpIsSquare(F, Z))
    throw new Error("mapToCurveSimpleSWU: invalid opts");
  const x = F.mul(B, F.inv(F.mul(Z, A)));
  const gx = F.add(F.add(F.mul(F.sqr(x), x), F.mul(A, x)), B);
  if (!FpIsSquare(F, gx))
    throw new Error("mapToCurveSimpleSWU: invalid opts");
  const sqrtRatio = SWUFpSqrtRatio(F, Z);
  if (!F.isOdd)
    throw new Error("Field does not have .isOdd()");
  return (u) => {
    let tv1, tv2, tv3, tv4, tv5, tv6, x2, y;
    tv1 = F.sqr(u);
    tv1 = F.mul(tv1, Z);
    tv2 = F.sqr(tv1);
    tv2 = F.add(tv2, tv1);
    tv3 = F.add(tv2, F.ONE);
    tv3 = F.mul(tv3, B);
    tv4 = F.cmov(Z, F.neg(tv2), !F.eql(tv2, F.ZERO));
    tv4 = F.mul(tv4, A);
    tv2 = F.sqr(tv3);
    tv6 = F.sqr(tv4);
    tv5 = F.mul(tv6, A);
    tv2 = F.add(tv2, tv5);
    tv2 = F.mul(tv2, tv3);
    tv6 = F.mul(tv6, tv4);
    tv5 = F.mul(tv6, B);
    tv2 = F.add(tv2, tv5);
    x2 = F.mul(tv1, tv3);
    const { isValid, value } = sqrtRatio(tv2, tv6);
    y = F.mul(tv1, u);
    y = F.mul(y, value);
    x2 = F.cmov(x2, tv3, isValid);
    y = F.cmov(y, value, isValid);
    const e1 = F.isOdd(u) === F.isOdd(y);
    y = F.cmov(F.neg(y), y, e1);
    const tv4_inv = FpInvertBatch(F, [tv4], true)[0];
    x2 = F.mul(x2, tv4_inv);
    return { x: x2, y };
  };
}
function getWLengths(Fp, Fn) {
  return {
    secretKey: Fn.BYTES,
    publicKey: 1 + Fp.BYTES,
    publicKeyUncompressed: 1 + 2 * Fp.BYTES,
    publicKeyHasPrefix: true,
    // Raw compact `(r || s)` signature width; DER and recovered signatures use
    // different lengths outside this helper.
    signature: 2 * Fn.BYTES
  };
}
function ecdh(Point, ecdhOpts = {}) {
  const { Fn } = Point;
  const randomBytes_ = ecdhOpts.randomBytes === void 0 ? randomBytes2 : ecdhOpts.randomBytes;
  const lengths = Object.assign(getWLengths(Point.Fp, Fn), {
    seed: Math.max(getMinHashLength(Fn.ORDER), 16)
  });
  function isValidSecretKey(secretKey) {
    try {
      const num = Fn.fromBytes(secretKey);
      return Fn.isValidNot0(num);
    } catch (error) {
      return false;
    }
  }
  function isValidPublicKey(publicKey, isCompressed) {
    const { publicKey: comp, publicKeyUncompressed } = lengths;
    try {
      const l = publicKey.length;
      if (isCompressed === true && l !== comp)
        return false;
      if (isCompressed === false && l !== publicKeyUncompressed)
        return false;
      return !!Point.fromBytes(publicKey);
    } catch (error) {
      return false;
    }
  }
  function randomSecretKey(seed) {
    seed = seed === void 0 ? randomBytes_(lengths.seed) : seed;
    return mapHashToField(abytes3(seed, lengths.seed, "seed"), Fn.ORDER);
  }
  function getPublicKey(secretKey, isCompressed = true) {
    return Point.BASE.multiply(Fn.fromBytes(secretKey)).toBytes(isCompressed);
  }
  function isProbPub(item) {
    const { secretKey, publicKey, publicKeyUncompressed } = lengths;
    const allowedLengths = Fn._lengths;
    if (!isBytes3(item))
      return void 0;
    const l = abytes3(item, void 0, "key").length;
    const isPub = l === publicKey || l === publicKeyUncompressed;
    const isSec = l === secretKey || !!allowedLengths?.includes(l);
    if (isPub && isSec)
      return void 0;
    return isPub;
  }
  function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
    if (isProbPub(secretKeyA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicKeyB) === false)
      throw new Error("second arg must be public key");
    const s = Fn.fromBytes(secretKeyA);
    const b = Point.fromBytes(publicKeyB);
    return b.multiply(s).toBytes(isCompressed);
  }
  const utils = {
    isValidSecretKey,
    isValidPublicKey,
    randomSecretKey
  };
  const keygen = createKeygen(randomSecretKey, getPublicKey);
  Object.freeze(utils);
  Object.freeze(lengths);
  return Object.freeze({ getPublicKey, getSharedSecret, keygen, Point, utils, lengths });
}
function ecdsa(Point, hash, ecdsaOpts = {}) {
  const hash_ = hash;
  ahash(hash_);
  validateObject(ecdsaOpts, {}, {
    hmac: "function",
    lowS: "boolean",
    randomBytes: "function",
    bits2int: "function",
    bits2int_modN: "function"
  });
  ecdsaOpts = Object.assign({}, ecdsaOpts);
  const randomBytes3 = ecdsaOpts.randomBytes === void 0 ? randomBytes2 : ecdsaOpts.randomBytes;
  const hmac2 = ecdsaOpts.hmac === void 0 ? (key, msg) => hmac(hash_, key, msg) : ecdsaOpts.hmac;
  const { Fp, Fn } = Point;
  const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn;
  const { keygen, getPublicKey, getSharedSecret, utils, lengths } = ecdh(Point, ecdsaOpts);
  const defaultSigOpts = {
    prehash: true,
    lowS: typeof ecdsaOpts.lowS === "boolean" ? ecdsaOpts.lowS : true,
    format: "compact",
    extraEntropy: false
  };
  const hasLargeRecoveryLifts = CURVE_ORDER * _2n2 + _1n4 < Fp.ORDER;
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER >> _1n4;
    return number > HALF;
  }
  function validateRS(title, num) {
    if (!Fn.isValidNot0(num))
      throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
    return num;
  }
  function assertRecoverableCurve() {
    if (hasLargeRecoveryLifts)
      throw new Error('"recovered" sig type is not supported for cofactor >2 curves');
  }
  function validateSigLength(bytes, format) {
    validateSigFormat(format);
    const size = lengths.signature;
    const sizer = format === "compact" ? size : format === "recovered" ? size + 1 : void 0;
    return abytes3(bytes, sizer);
  }
  class Signature {
    constructor(r, s, recovery) {
      __publicField(this, "r");
      __publicField(this, "s");
      __publicField(this, "recovery");
      this.r = validateRS("r", r);
      this.s = validateRS("s", s);
      if (recovery != null) {
        assertRecoverableCurve();
        if (![0, 1, 2, 3].includes(recovery))
          throw new Error("invalid recovery id");
        this.recovery = recovery;
      }
      Object.freeze(this);
    }
    static fromBytes(bytes, format = defaultSigOpts.format) {
      validateSigLength(bytes, format);
      let recid;
      if (format === "der") {
        const { r: r2, s: s2 } = DER.toSig(abytes3(bytes));
        return new Signature(r2, s2);
      }
      if (format === "recovered") {
        recid = bytes[0];
        format = "compact";
        bytes = bytes.subarray(1);
      }
      const L = lengths.signature / 2;
      const r = bytes.subarray(0, L);
      const s = bytes.subarray(L, L * 2);
      return new Signature(Fn.fromBytes(r), Fn.fromBytes(s), recid);
    }
    static fromHex(hex, format) {
      return this.fromBytes(hexToBytes2(hex), format);
    }
    assertRecovery() {
      const { recovery } = this;
      if (recovery == null)
        throw new Error("invalid recovery id: must be present");
      return recovery;
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    // Unlike the top-level helper below, this method expects a digest that has
    // already been hashed to the curve's message representative.
    recoverPublicKey(messageHash) {
      const { r, s } = this;
      const recovery = this.assertRecovery();
      const radj = recovery === 2 || recovery === 3 ? r + CURVE_ORDER : r;
      if (!Fp.isValid(radj))
        throw new Error("invalid recovery id: sig.r+curve.n != R.x");
      const x = Fp.toBytes(radj);
      const R = Point.fromBytes(concatBytes3(pprefix((recovery & 1) === 0), x));
      const ir = Fn.inv(radj);
      const h = bits2int_modN(abytes3(messageHash, void 0, "msgHash"));
      const u1 = Fn.create(-h * ir);
      const u2 = Fn.create(s * ir);
      const Q = Point.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
      if (Q.is0())
        throw new Error("invalid recovery: point at infinify");
      Q.assertValidity();
      return Q;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    toBytes(format = defaultSigOpts.format) {
      validateSigFormat(format);
      if (format === "der")
        return hexToBytes2(DER.hexFromSig(this));
      const { r, s } = this;
      const rb = Fn.toBytes(r);
      const sb = Fn.toBytes(s);
      if (format === "recovered") {
        assertRecoverableCurve();
        return concatBytes3(Uint8Array.of(this.assertRecovery()), rb, sb);
      }
      return concatBytes3(rb, sb);
    }
    toHex(format) {
      return bytesToHex2(this.toBytes(format));
    }
  }
  Object.freeze(Signature.prototype);
  Object.freeze(Signature);
  const bits2int = ecdsaOpts.bits2int === void 0 ? function bits2int_def(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num = bytesToNumberBE(bytes);
    const delta = bytes.length * 8 - fnBits;
    return delta > 0 ? num >> BigInt(delta) : num;
  } : ecdsaOpts.bits2int;
  const bits2int_modN = ecdsaOpts.bits2int_modN === void 0 ? function bits2int_modN_def(bytes) {
    return Fn.create(bits2int(bytes));
  } : ecdsaOpts.bits2int_modN;
  const ORDER_MASK = bitMask(fnBits);
  function int2octets(num) {
    aInRange("num < 2^" + fnBits, num, _0n4, ORDER_MASK);
    return Fn.toBytes(num);
  }
  function validateMsgAndHash(message, prehash) {
    abytes3(message, void 0, "message");
    return prehash ? abytes3(hash_(message), void 0, "prehashed message") : message;
  }
  function prepSig(message, secretKey, opts) {
    const { lowS, prehash, extraEntropy } = validateSigOpts(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    const h1int = bits2int_modN(message);
    const d = Fn.fromBytes(secretKey);
    if (!Fn.isValidNot0(d))
      throw new Error("invalid private key");
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (extraEntropy != null && extraEntropy !== false) {
      const e = extraEntropy === true ? randomBytes3(lengths.secretKey) : extraEntropy;
      seedArgs.push(abytes3(e, void 0, "extraEntropy"));
    }
    const seed = concatBytes3(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!Fn.isValidNot0(k))
        return;
      const ik = Fn.inv(k);
      const q = Point.BASE.multiply(k).toAffine();
      const r = Fn.create(q.x);
      if (r === _0n4)
        return;
      const s = Fn.create(ik * Fn.create(m + r * d));
      if (s === _0n4)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n4);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = Fn.neg(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, hasLargeRecoveryLifts ? void 0 : recovery);
    }
    return { seed, k2sig };
  }
  function sign(message, secretKey, opts = {}) {
    const { seed, k2sig } = prepSig(message, secretKey, opts);
    const drbg = createHmacDrbg(hash_.outputLen, Fn.BYTES, hmac2);
    const sig = drbg(seed, k2sig);
    return sig.toBytes(opts.format);
  }
  function verify(signature, message, publicKey, opts = {}) {
    const { lowS, prehash, format } = validateSigOpts(opts, defaultSigOpts);
    publicKey = abytes3(publicKey, void 0, "publicKey");
    message = validateMsgAndHash(message, prehash);
    if (!isBytes3(signature)) {
      const end = signature instanceof Signature ? ", use sig.toBytes()" : "";
      throw new Error("verify expects Uint8Array signature" + end);
    }
    validateSigLength(signature, format);
    try {
      const sig = Signature.fromBytes(signature, format);
      const P = Point.fromBytes(publicKey);
      if (lowS && sig.hasHighS())
        return false;
      const { r, s } = sig;
      const h = bits2int_modN(message);
      const is = Fn.inv(s);
      const u1 = Fn.create(h * is);
      const u2 = Fn.create(r * is);
      const R = Point.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
      if (R.is0())
        return false;
      const v = Fn.create(R.x);
      return v === r;
    } catch (e) {
      return false;
    }
  }
  function recoverPublicKey(signature, message, opts = {}) {
    const { prehash } = validateSigOpts(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
  }
  return Object.freeze({
    keygen,
    getPublicKey,
    getSharedSecret,
    utils,
    lengths,
    Point,
    sign,
    verify,
    recoverPublicKey,
    Signature,
    hash: hash_
  });
}
var divNearest, DERErr, DER, _0n4, _1n4, _2n2, _3n2, _4n2;
var init_weierstrass = __esm({
  "node_modules/@noble/curves/abstract/weierstrass.js"() {
    init_hmac();
    init_utils2();
    init_utils3();
    init_curve();
    init_modular();
    divNearest = (num, den) => (num + (num >= 0 ? den : -den) / _2n2) / den;
    DERErr = class extends Error {
      constructor(m = "") {
        super(m);
      }
    };
    DER = {
      // asn.1 DER encoding utils
      Err: DERErr,
      // Basic building block is TLV (Tag-Length-Value)
      _tlv: {
        encode: (tag, data) => {
          const { Err: E } = DER;
          asafenumber(tag, "tag");
          if (tag < 0 || tag > 255)
            throw new E("tlv.encode: wrong tag");
          if (typeof data !== "string")
            throw new TypeError('"data" expected string, got type=' + typeof data);
          if (data.length & 1)
            throw new E("tlv.encode: unpadded data");
          const dataLen = data.length / 2;
          const len = numberToHexUnpadded(dataLen);
          if (len.length / 2 & 128)
            throw new E("tlv.encode: long form length too big");
          const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
          const t = numberToHexUnpadded(tag);
          return t + lenLen + len + data;
        },
        // v - value, l - left bytes (unparsed)
        decode(tag, data) {
          const { Err: E } = DER;
          data = abytes3(data, void 0, "DER data");
          let pos = 0;
          if (tag < 0 || tag > 255)
            throw new E("tlv.encode: wrong tag");
          if (data.length < 2 || data[pos++] !== tag)
            throw new E("tlv.decode: wrong tlv");
          const first = data[pos++];
          const isLong = !!(first & 128);
          let length = 0;
          if (!isLong)
            length = first;
          else {
            const lenLen = first & 127;
            if (!lenLen)
              throw new E("tlv.decode(long): indefinite length not supported");
            if (lenLen > 4)
              throw new E("tlv.decode(long): byte length is too big");
            const lengthBytes = data.subarray(pos, pos + lenLen);
            if (lengthBytes.length !== lenLen)
              throw new E("tlv.decode: length bytes not complete");
            if (lengthBytes[0] === 0)
              throw new E("tlv.decode(long): zero leftmost byte");
            for (const b of lengthBytes)
              length = length << 8 | b;
            pos += lenLen;
            if (length < 128)
              throw new E("tlv.decode(long): not minimal encoding");
          }
          const v = data.subarray(pos, pos + length);
          if (v.length !== length)
            throw new E("tlv.decode: wrong value length");
          return { v, l: data.subarray(pos + length) };
        }
      },
      // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
      // since we always use positive integers here. It must always be empty:
      // - add zero byte if exists
      // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
      _int: {
        encode(num) {
          const { Err: E } = DER;
          abignumber(num);
          if (num < _0n4)
            throw new E("integer: negative integers are not allowed");
          let hex = numberToHexUnpadded(num);
          if (Number.parseInt(hex[0], 16) & 8)
            hex = "00" + hex;
          if (hex.length & 1)
            throw new E("unexpected DER parsing assertion: unpadded hex");
          return hex;
        },
        decode(data) {
          const { Err: E } = DER;
          if (data.length < 1)
            throw new E("invalid signature integer: empty");
          if (data[0] & 128)
            throw new E("invalid signature integer: negative");
          if (data.length > 1 && data[0] === 0 && !(data[1] & 128))
            throw new E("invalid signature integer: unnecessary leading zero");
          return bytesToNumberBE(data);
        }
      },
      toSig(bytes) {
        const { Err: E, _int: int, _tlv: tlv } = DER;
        const data = abytes3(bytes, void 0, "signature");
        const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
        if (seqLeftBytes.length)
          throw new E("invalid signature: left bytes after parsing");
        const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
        const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
        if (sLeftBytes.length)
          throw new E("invalid signature: left bytes after parsing");
        return { r: int.decode(rBytes), s: int.decode(sBytes) };
      },
      hexFromSig(sig) {
        const { _tlv: tlv, _int: int } = DER;
        const rs = tlv.encode(2, int.encode(sig.r));
        const ss = tlv.encode(2, int.encode(sig.s));
        const seq = rs + ss;
        return tlv.encode(48, seq);
      }
    };
    Object.freeze(DER._tlv);
    Object.freeze(DER._int);
    Object.freeze(DER);
    _0n4 = /* @__PURE__ */ BigInt(0);
    _1n4 = /* @__PURE__ */ BigInt(1);
    _2n2 = /* @__PURE__ */ BigInt(2);
    _3n2 = /* @__PURE__ */ BigInt(3);
    _4n2 = /* @__PURE__ */ BigInt(4);
  }
});

// node_modules/@noble/curves/nist.js
var nist_exports = {};
__export(nist_exports, {
  p256: () => p256,
  p256_FROST: () => p256_FROST,
  p256_hasher: () => p256_hasher,
  p256_oprf: () => p256_oprf,
  p384: () => p384,
  p384_hasher: () => p384_hasher,
  p384_oprf: () => p384_oprf,
  p521: () => p521,
  p521_hasher: () => p521_hasher,
  p521_oprf: () => p521_oprf
});
function createSWU(Point, opts) {
  let map;
  return (scalars) => (map || (map = mapToCurveSimpleSWU(Point.Fp, opts)))(scalars[0]);
}
var p256_CURVE, p384_CURVE, p521_CURVE, p256_Point, p256, p256_hasher, p256_oprf, p256_FROST, p384_Point, p384, p384_hasher, p384_oprf, p521_Point, p521, p521_hasher, p521_oprf;
var init_nist = __esm({
  "node_modules/@noble/curves/nist.js"() {
    init_sha2();
    init_frost();
    init_hash_to_curve();
    init_oprf();
    init_weierstrass();
    p256_CURVE = /* @__PURE__ */ (() => ({
      p: BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff"),
      n: BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551"),
      h: BigInt(1),
      a: BigInt("0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc"),
      b: BigInt("0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b"),
      Gx: BigInt("0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"),
      Gy: BigInt("0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5")
    }))();
    p384_CURVE = /* @__PURE__ */ (() => ({
      p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000ffffffff"),
      n: BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973"),
      h: BigInt(1),
      a: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffeffffffff0000000000000000fffffffc"),
      b: BigInt("0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef"),
      Gx: BigInt("0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7"),
      Gy: BigInt("0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f")
    }))();
    p521_CURVE = /* @__PURE__ */ (() => ({
      p: BigInt("0x1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
      n: BigInt("0x01fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa51868783bf2f966b7fcc0148f709a5d03bb5c9b8899c47aebb6fb71e91386409"),
      h: BigInt(1),
      a: BigInt("0x1fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc"),
      b: BigInt("0x0051953eb9618e1c9a1f929a21a0b68540eea2da725b99b315f3b8b489918ef109e156193951ec7e937b1652c0bd3bb1bf073573df883d2c34f1ef451fd46b503f00"),
      Gx: BigInt("0x00c6858e06b70404e9cd9e3ecb662395b4429c648139053fb521f828af606b4d3dbaa14b5e77efe75928fe1dc127a2ffa8de3348b3c1856a429bf97e7e31c2e5bd66"),
      Gy: BigInt("0x011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650")
    }))();
    p256_Point = /* @__PURE__ */ weierstrass(p256_CURVE);
    p256 = /* @__PURE__ */ ecdsa(p256_Point, sha256);
    p256_hasher = /* @__PURE__ */ (() => {
      return createHasher2(p256_Point, createSWU(p256_Point, {
        A: p256_CURVE.a,
        B: p256_CURVE.b,
        Z: p256_Point.Fp.create(BigInt("-10"))
      }), {
        DST: "P256_XMD:SHA-256_SSWU_RO_",
        encodeDST: "P256_XMD:SHA-256_SSWU_NU_",
        p: p256_CURVE.p,
        m: 1,
        k: 128,
        expand: "xmd",
        hash: sha256
      });
    })();
    p256_oprf = /* @__PURE__ */ (() => createOPRF({
      name: "P256-SHA256",
      Point: p256_Point,
      hash: sha256,
      hashToGroup: p256_hasher.hashToCurve,
      hashToScalar: p256_hasher.hashToScalar
    }))();
    p256_FROST = /* @__PURE__ */ (() => createFROST({
      name: "FROST-P256-SHA256-v1",
      Point: p256_Point,
      hashToScalar: p256_hasher.hashToScalar,
      hash: sha256
    }))();
    p384_Point = /* @__PURE__ */ weierstrass(p384_CURVE);
    p384 = /* @__PURE__ */ ecdsa(p384_Point, sha384);
    p384_hasher = /* @__PURE__ */ (() => {
      return createHasher2(p384_Point, createSWU(p384_Point, {
        A: p384_CURVE.a,
        B: p384_CURVE.b,
        Z: p384_Point.Fp.create(BigInt("-12"))
      }), {
        DST: "P384_XMD:SHA-384_SSWU_RO_",
        encodeDST: "P384_XMD:SHA-384_SSWU_NU_",
        p: p384_CURVE.p,
        m: 1,
        k: 192,
        expand: "xmd",
        hash: sha384
      });
    })();
    p384_oprf = /* @__PURE__ */ (() => createOPRF({
      name: "P384-SHA384",
      Point: p384_Point,
      hash: sha384,
      hashToGroup: p384_hasher.hashToCurve,
      hashToScalar: p384_hasher.hashToScalar
    }))();
    p521_Point = /* @__PURE__ */ weierstrass(p521_CURVE);
    p521 = /* @__PURE__ */ ecdsa(p521_Point, sha512);
    p521_hasher = /* @__PURE__ */ (() => {
      return createHasher2(p521_Point, createSWU(p521_Point, {
        A: p521_CURVE.a,
        B: p521_CURVE.b,
        Z: p521_Point.Fp.create(BigInt("-4"))
      }), {
        DST: "P521_XMD:SHA-512_SSWU_RO_",
        encodeDST: "P521_XMD:SHA-512_SSWU_NU_",
        p: p521_CURVE.p,
        m: 1,
        k: 256,
        expand: "xmd",
        hash: sha512
      });
    })();
    p521_oprf = /* @__PURE__ */ (() => createOPRF({
      name: "P521-SHA512",
      Point: p521_Point,
      hash: sha512,
      hashToGroup: p521_hasher.hashToCurve,
      hashToScalar: p521_hasher.hashToScalar
      // produces L=98 just like in RFC
    }))();
  }
});

// src/utils/filemoon.js
var require_filemoon = __commonJS({
  "src/utils/filemoon.js"(exports2, module2) {
    var { BASE_UA } = require_common();
    try {
      const { gcm: nobleGcm } = (init_aes(), __toCommonJS(aes_exports));
      globalThis.__gcm = nobleGcm;
      const { sha256: nobleSha256 } = (init_sha2(), __toCommonJS(sha2_exports));
      globalThis.__sha256 = nobleSha256;
      console.log("[FileMoon] Crypto modules OK");
    } catch (e) {
      console.log(`[FileMoon] Crypto load error: ${e.message}`);
      globalThis.__gcm = null;
      globalThis.__sha256 = null;
    }
    function b64uDecode(str) {
      str = str.replace(/-/g, "+").replace(/_/g, "/");
      while (str.length % 4 !== 0)
        str += "=";
      const binary = typeof atob !== "undefined" ? atob(str) : Buffer.from(str, "base64").toString("binary");
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++)
        bytes[i] = binary.charCodeAt(i);
      return bytes;
    }
    function b64uEncode(bytes) {
      let binary = "";
      for (let i = 0; i < bytes.length; i++)
        binary += String.fromCharCode(bytes[i]);
      const b64 = typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");
      return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    }
    function utf8Decode(bytes) {
      let str = "", i = 0;
      while (i < bytes.length) {
        const c = bytes[i];
        if (c < 128) {
          str += String.fromCharCode(c);
          i++;
        } else if (c < 224) {
          str += String.fromCharCode((c & 31) << 6 | bytes[i + 1] & 63);
          i += 2;
        } else {
          str += String.fromCharCode((c & 15) << 12 | (bytes[i + 1] & 63) << 6 | bytes[i + 2] & 63);
          i += 3;
        }
      }
      return str;
    }
    function generateUUID() {
      return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16));
    }
    function derToRaw64(der) {
      const buf = der instanceof Uint8Array ? der : new Uint8Array(der);
      let offset = 2;
      if (buf[1] === 129)
        offset = 3;
      const rLen = buf[offset + 1];
      let r = buf.slice(offset + 2, offset + 2 + rLen);
      offset += 2 + rLen;
      const sLen = buf[offset + 1];
      let s = buf.slice(offset + 2, offset + 2 + sLen);
      while (r.length > 32 && r[0] === 0)
        r = r.slice(1);
      while (s.length > 32 && s[0] === 0)
        s = s.slice(1);
      const raw = new Uint8Array(64);
      raw.set(r, 32 - r.length);
      raw.set(s, 64 - s.length);
      return raw;
    }
    async function postJSON(url, body, headers = {}) {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": BASE_UA, ...headers },
        body: JSON.stringify(body)
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${txt.substring(0, 200)}`);
      }
      return resp.json();
    }
    async function getJSON(url, headers = {}) {
      const resp = await fetch(url, { headers: { "User-Agent": BASE_UA, ...headers } });
      if (!resp.ok)
        throw new Error(`HTTP ${resp.status} en ${url}`);
      return resp.json();
    }
    async function generateAttestation(nonce) {
      function utf8EncodeStr(s) {
        const b = [];
        for (let i = 0; i < s.length; i++) {
          const c = s.charCodeAt(i);
          if (c < 128)
            b.push(c);
          else if (c < 2048)
            b.push(192 | c >> 6, 128 | c & 63);
          else
            b.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
        }
        return new Uint8Array(b);
      }
      const subtle = typeof globalThis !== "undefined" && (globalThis.crypto && globalThis.crypto.subtle || globalThis.webcrypto && globalThis.webcrypto.subtle);
      console.log(`[FileMoon] Attest: crypto=${typeof globalThis.crypto}, subtle=${!!subtle}`);
      if (subtle) {
        try {
          const keyPair = await subtle.generateKey(
            { name: "ECDSA", namedCurve: "P-256" },
            true,
            ["sign", "verify"]
          );
          const nonceBytes = typeof TextEncoder !== "undefined" ? new TextEncoder().encode(nonce) : utf8EncodeStr(nonce);
          const derSig = await subtle.sign({ name: "ECDSA", hash: "SHA-256" }, keyPair.privateKey, nonceBytes);
          const sigBytes = new Uint8Array(derSig);
          const rawSig = sigBytes.length === 64 ? sigBytes : derToRaw64(sigBytes);
          const jwk = await subtle.exportKey("jwk", keyPair.publicKey);
          return {
            signature: b64uEncode(rawSig),
            publicKey: { crv: "P-256", ext: true, key_ops: ["verify"], kty: "EC", x: jwk.x, y: jwk.y }
          };
        } catch (e) {
          console.log(`[FileMoon] WebCrypto failed: ${e.message}, trying noble fallback...`);
        }
      }
      console.log("[FileMoon] Attestation via noble/curves (fallback)");
      try {
        const { p256: p2562 } = (init_nist(), __toCommonJS(nist_exports));
        const privKey = p2562.utils.randomSecretKey();
        const pubRaw = p2562.getPublicKey(privKey, false);
        const x = new Uint8Array(32);
        x.set(pubRaw.slice(1, 33), 32 - 32);
        const y = new Uint8Array(32);
        y.set(pubRaw.slice(33, 65), 32 - 32);
        const nonceBytes = utf8EncodeStr(nonce);
        const rawSig = p2562.sign(nonceBytes, privKey);
        const result = {
          signature: b64uEncode(rawSig),
          publicKey: { crv: "P-256", ext: true, key_ops: ["verify"], kty: "EC", x: b64uEncode(x), y: b64uEncode(y) }
        };
        console.log(`[FileMoon] noble attestation OK (sig=${rawSig.length}B)`);
        return result;
      } catch (e) {
        console.log(`[FileMoon] noble/curves error: ${e.message}`);
        throw e;
      }
    }
    function decryptPlayback(playbackData) {
      console.log(`[FileMoon] decrypt: parts=${playbackData.key_parts.length}, payload=${playbackData.payload.length}B`);
      const iv = b64uDecode(playbackData.iv);
      const payload = b64uDecode(playbackData.payload);
      const allParts = playbackData.key_parts.map((kp) => b64uDecode(kp));
      const sha256Fn = globalThis.__sha256;
      if (!sha256Fn)
        throw new Error("SHA256 not available");
      const keyAttempts = [];
      const shortParts = allParts.filter((p) => p.length === 16);
      if (shortParts.length >= 2) {
        const k = new Uint8Array(32);
        k.set(shortParts[0], 0);
        k.set(shortParts[1], 16);
        keyAttempts.push({ key: k, desc: `short16[0]+[1] (${shortParts[0].length}+${shortParts[1].length}B)` });
      }
      if (allParts.length >= 2) {
        const concat48 = new Uint8Array(allParts[0].length + allParts[1].length);
        concat48.set(allParts[0], 0);
        concat48.set(allParts[1], allParts[0].length);
        const hash = sha256Fn(concat48);
        keyAttempts.push({ key: hash, desc: `SHA256(p[0]+p[1]) (${allParts[0].length}+${allParts[1].length}B)` });
        if (concat48.length === 16 || concat48.length === 24 || concat48.length === 32) {
          keyAttempts.push({ key: concat48, desc: `p[0]+p[1] raw (${concat48.length}B)` });
        }
      }
      if (shortParts.length >= 2) {
        const concat32 = new Uint8Array(32);
        concat32.set(shortParts[0], 0);
        concat32.set(shortParts[1], 16);
        const hash = sha256Fn(concat32);
        keyAttempts.push({ key: hash, desc: `SHA256(short16[0]+[1]) (32B->32B)` });
      }
      if (shortParts.length >= 2) {
        try {
          const h1 = sha256Fn(shortParts[0]);
          const h2 = sha256Fn(shortParts[1]);
          const k = new Uint8Array(64);
          k.set(h1, 0);
          k.set(h2, 32);
          keyAttempts.push({ key: k, desc: `SHA256(s[0])+SHA256(s[1]) (64B)` });
        } catch (e) {
        }
      }
      if (allParts.length > 0) {
        const totalLen = allParts.reduce((s, p) => s + p.length, 0);
        const allConcat = new Uint8Array(totalLen);
        let offset = 0;
        for (const p of allParts) {
          allConcat.set(p, offset);
          offset += p.length;
        }
        const hash = sha256Fn(allConcat);
        keyAttempts.push({ key: hash, desc: `SHA256(all ${allParts.length} parts, ${totalLen}B)` });
      }
      let lastError = null;
      for (const { key, desc } of keyAttempts) {
        try {
          const cipher = globalThis.__gcm(key, iv);
          const decrypted = cipher.decrypt(payload);
          console.log(`[FileMoon] \u2705 key: ${desc}`);
          const json = utf8Decode(decrypted);
          const parsed = JSON.parse(json);
          const sources = parsed.sources || parsed.source;
          if (Array.isArray(sources) && sources.length > 0) {
            return sources[0].url;
          }
          if (typeof sources === "string") {
            return sources;
          }
          throw new Error("No sources in decrypted payload");
        } catch (e) {
          lastError = e;
        }
      }
      console.log(`[FileMoon] All ${keyAttempts.length} key attempts failed`);
      throw lastError || new Error("No key worked");
    }
    var _byseDeviceId = generateUUID();
    async function resolveFileMoon(url) {
      try {
        console.log(`[FileMoon] Resolviendo: ${url}`);
        const matcher = url.match(/\/(e|d)\/([a-zA-Z0-9]+)/);
        if (!matcher)
          throw new Error("No videoId en URL");
        const linkType = matcher[1];
        const videoId = matcher[2];
        const currentDomain = (url.match(/^(https?:\/\/[^/]+)/) || [])[1];
        if (!currentDomain)
          throw new Error("No currentDomain");
        const details = await getJSON(`${currentDomain}/api/videos/${videoId}/embed/details`);
        const embedFrameUrl = details.embed_frame_url;
        if (!embedFrameUrl)
          throw new Error("No embed_frame_url");
        const playbackDomain = (embedFrameUrl.match(/^(https?:\/\/[^/]+)/) || [])[1];
        if (!playbackDomain)
          throw new Error("No playbackDomain");
        const authHeaders = { "Referer": embedFrameUrl, "Origin": playbackDomain };
        const challenge = await postJSON(`${playbackDomain}/api/videos/access/challenge`, {}, authHeaders);
        const challengeId = challenge.challenge_id;
        const nonce = challenge.nonce;
        if (!challengeId || !nonce)
          throw new Error("No challengeId/nonce");
        const viewerId = generateUUID();
        let signature, publicKey;
        try {
          ({ signature, publicKey } = await generateAttestation(nonce));
        } catch (attestErr) {
          console.log(`[FileMoon] attest error: ${attestErr.message}`);
          throw attestErr;
        }
        const attestPayload = {
          viewer_id: viewerId,
          device_id: _byseDeviceId,
          challenge_id: challengeId,
          nonce,
          signature,
          public_key: publicKey,
          client: {
            user_agent: BASE_UA,
            architecture: "x86",
            bitness: "64",
            platform: "Windows",
            platform_version: "10.0.0",
            pixel_ratio: 1,
            screen_width: 1920,
            screen_height: 1080,
            languages: ["en-US"]
          },
          storage: {
            cookie: viewerId,
            local_storage: viewerId,
            indexed_db: `${viewerId}:${_byseDeviceId}`,
            cache_storage: `${viewerId}:${_byseDeviceId}`
          },
          attributes: { entropy: "high" }
        };
        const attest = await postJSON(`${playbackDomain}/api/videos/access/attest`, attestPayload, authHeaders);
        const token = attest.token;
        const confidence = attest.confidence;
        if (!token)
          throw new Error("No attest token");
        const finalViewerId = attest.viewer_id || viewerId;
        if (attest.device_id)
          _byseDeviceId = attest.device_id;
        const playbackResp = await postJSON(
          `${playbackDomain}/api/videos/${videoId}/embed/playback`,
          { fingerprint: { token, viewer_id: finalViewerId, device_id: _byseDeviceId, confidence } },
          { ...authHeaders, "X-Embed-Parent": linkType === "e" ? url : "" }
        );
        if (!playbackResp.playback)
          throw new Error("No playback data");
        const sourceUrl = decryptPlayback(playbackResp.playback);
        return {
          url: sourceUrl,
          quality: "1080p",
          headers: { Referer: embedFrameUrl, "User-Agent": BASE_UA, Origin: playbackDomain }
        };
      } catch (e) {
        console.log(`[FileMoon] Error: ${e.message}`);
        return null;
      }
    }
    module2.exports = { resolveFileMoon };
  }
});

// src/utils/vidhide.js
var require_vidhide = __commonJS({
  "src/utils/vidhide.js"(exports2, module2) {
    async function resolve2(url) {
      try {
        let unpack2 = function(e) {
          let o = e.match(/eval\(function\(p,a,c,k,e,[rd]\)\{.*?\}\s*\('([\s\S]*?)',\s*(\d+),\s*(\d+),\s*'([\s\S]*?)'\.split\('\|'\)/);
          if (!o)
            return null;
          let [, t2, l, s2, c] = o;
          l = parseInt(l);
          s2 = parseInt(s2);
          c = c.split("|");
          let i = (u, r) => {
            let n = "0123456789abcdefghijklmnopqrstuvwxyz", a = "";
            for (; u > 0; ) {
              a = n[u % r] + a;
              u = Math.floor(u / r);
            }
            return a || "0";
          };
          return t2 = t2.replace(/\b\w+\b/g, (u) => {
            let r = parseInt(u, 36);
            return r < c.length && c[r] ? c[r] : i(r, l);
          }), t2;
        };
        var unpack = unpack2;
        const I = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
        console.log(`[VidHide] Resolviendo: ${url}`);
        let t = await fetch(url, {
          method: "GET",
          headers: {
            "User-Agent": I,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            Referer: "https://embed69.org/"
          },
          redirect: "follow"
        });
        if (!t.ok)
          throw new Error(`HTTP ${t.status}`);
        let text = await t.text();
        let s = text.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
        if (!s) {
          console.log("[VidHide] No se encontr\xF3 bloque eval");
          return null;
        }
        let unpacked = unpack2(s[0]);
        if (!unpacked) {
          console.log("[VidHide] No se pudo desempacar");
          return null;
        }
        let hlsMatch = unpacked.match(/"hls4"\s*:\s*"([^"]+)"/) || unpacked.match(/"hls2"\s*:\s*"([^"]+)"/);
        let hlsUrl = hlsMatch ? hlsMatch[1] : null;
        if (!hlsUrl) {
          console.log("[VidHide] No se encontr\xF3 hls4/hls2");
          return null;
        }
        let origin = new URL(url).origin;
        let finalUrl = hlsUrl.startsWith("http") ? hlsUrl : `${origin}${hlsUrl}`;
        console.log(`[VidHide] URL encontrada: ${finalUrl.substring(0, 80)}...`);
        return {
          url: finalUrl,
          quality: "1080p",
          // VidHide suele devolver 1080p o HLS
          headers: { "User-Agent": I, Referer: `${origin}/`, Origin: origin }
        };
      } catch (e) {
        console.log(`[VidHide] Error: ${e.message}`);
        return null;
      }
    }
    module2.exports = { resolve: resolve2 };
  }
});

// src/utils/playmogo.js
var require_playmogo = __commonJS({
  "src/utils/playmogo.js"(exports, module) {
    var exec = null;
    var fs = null;
    var path = null;
    var os = null;
    if (typeof globalThis !== "undefined" && typeof process !== "undefined" && process.versions && process.versions.node) {
      try {
        const req = eval("require");
        exec = req("child_process").exec;
        fs = req("fs");
        path = req("path");
        os = req("os");
      } catch (e) {
      }
    }
    var COMMON_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function curlGetWithCookies(url, referer, cookieFile, extraHeaders = []) {
      return new Promise((resolve2, reject) => {
        let headersStr = extraHeaders.map((h) => `-H "${h}"`).join(" ");
        const cmd = `curl -s -L -w "\\n%{url_effective}" -A "${COMMON_UA}" -H "Referer: ${referer}" -b "${cookieFile}" -c "${cookieFile}" ${headersStr} "${url}"`;
        exec(cmd, { maxBuffer: 1024 * 1024 * 5 }, (err, stdout, stderr) => {
          if (err) {
            reject(err);
          } else {
            const lines = stdout.split("\n");
            const effectiveUrl = lines[lines.length - 1].trim();
            const body = lines.slice(0, lines.length - 1).join("\n");
            resolve2({ body, effectiveUrl });
          }
        });
      });
    }
    async function resolve(url) {
      if (exec && fs && path && os) {
        const cookieFile = path.join(os.tmpdir(), `dood_cookies_${Date.now()}_${Math.floor(Math.random() * 1e3)}.txt`);
        try {
          console.log(`[DoodStream] Resolviendo con curl (PC): ${url}`);
          const { body: html, effectiveUrl } = await curlGetWithCookies(url, "https://cuevana.unbuendato.com/", cookieFile);
          if (!html || html.length < 500) {
            console.log(`[DoodStream] HTML obtenido demasiado corto o vac\xEDo, no se puede resolver`);
            return null;
          }
          const finalUrlObj = new URL(effectiveUrl);
          const finalHost = `${finalUrlObj.protocol}//${finalUrlObj.host}`;
          const md5Regex = /\/pass_md5\/([^/]*)\/([^/']*)/;
          const md5Match = html.match(md5Regex);
          if (!md5Match) {
            console.log(`[DoodStream] No se encontr\xF3 pass_md5 en el HTML de ${effectiveUrl}`);
            return null;
          }
          const expiry = md5Match[1];
          const token = md5Match[2];
          const md5Url = `${finalHost}/pass_md5/${expiry}/${token}`;
          await new Promise((r) => setTimeout(r, 1e3));
          const { body: baseLinkRaw } = await curlGetWithCookies(md5Url, effectiveUrl, cookieFile, [
            "X-Requested-With: XMLHttpRequest",
            "Accept: */*",
            "Accept-Language: es-ES,es;q=0.9"
          ]);
          const baseLink = baseLinkRaw.trim();
          if (!baseLink || baseLink.includes("RELOAD")) {
            console.log(`[DoodStream] pass_md5 fall\xF3. Retorno baseLink: "${baseLink}"`);
            return null;
          }
          const randomChars = "abcdefghijklmnopqrstuvwxyz0123456789";
          let randStr = "";
          for (let i = 0; i < 10; i++) {
            randStr += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
          }
          const directLink = `${baseLink}${randStr}?token=${token}&expiry=${expiry}000`;
          return {
            url: directLink,
            quality: "720p",
            headers: {
              "User-Agent": COMMON_UA,
              "Referer": finalHost + "/"
            }
          };
        } catch (e) {
          console.log(`[DoodStream] Error (PC): ${e.message}`);
          return null;
        } finally {
          try {
            if (fs.existsSync(cookieFile)) {
              fs.unlinkSync(cookieFile);
            }
          } catch (err) {
          }
        }
      } else {
        try {
          console.log(`[DoodStream] Resolviendo con fetch nativo (Celular): ${url}`);
          let embedUrl = url.replace("doply.net", "myvidplay.com");
          const headers = {
            "User-Agent": COMMON_UA,
            "Referer": "https://cuevana.unbuendato.com/"
          };
          const resp = await fetch(embedUrl, { headers, redirect: "follow" });
          if (!resp.ok) {
            console.log(`[DoodStream] Fall\xF3 fetch inicial: HTTP ${resp.status}`);
            return null;
          }
          const html = await resp.text();
          const effectiveUrl = resp.url || embedUrl;
          const finalUrlObj = new URL(effectiveUrl);
          const finalHost = `${finalUrlObj.protocol}//${finalUrlObj.host}`;
          const md5Regex = /\/pass_md5\/([^/]*)\/([^/']*)/;
          const md5Match = html.match(md5Regex);
          if (!md5Match) {
            console.log(`[DoodStream] No se encontr\xF3 pass_md5`);
            return null;
          }
          const expiry = md5Match[1];
          const token = md5Match[2];
          const md5Url = `${finalHost}/pass_md5/${expiry}/${token}`;
          const md5Resp = await fetch(md5Url, {
            headers: {
              "User-Agent": COMMON_UA,
              "Referer": effectiveUrl,
              "X-Requested-With": "XMLHttpRequest"
            }
          });
          if (!md5Resp.ok) {
            console.log(`[DoodStream] Fall\xF3 petici\xF3n pass_md5: HTTP ${md5Resp.status}`);
            return null;
          }
          const baseLink = (await md5Resp.text()).trim();
          if (!baseLink || baseLink.includes("RELOAD")) {
            console.log(`[DoodStream] Respuesta de pass_md5 inv\xE1lida en celular`);
            return null;
          }
          const randomChars = "abcdefghijklmnopqrstuvwxyz0123456789";
          let randStr = "";
          for (let i = 0; i < 10; i++) {
            randStr += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
          }
          const directLink = `${baseLink}${randStr}?token=${token}&expiry=${expiry}000`;
          return {
            url: directLink,
            quality: "720p",
            headers: {
              "User-Agent": COMMON_UA,
              "Referer": finalHost + "/"
            }
          };
        } catch (e) {
          console.log(`[DoodStream] Error (Celular): ${e.message}`);
          return null;
        }
      }
    }
    module.exports = { resolve };
  }
});

// src/utils/index.js
var require_utils = __commonJS({
  "src/utils/index.js"(exports2, module2) {
    var goodstream = require_goodstream();
    var vimeos = require_vimeos();
    var hlswish = require_hlswish();
    var voe = require_voe();
    var filemoon = require_filemoon();
    var vidhide = require_vidhide();
    var playmogo = require_playmogo();
    var SERVER_RESOLVERS2 = {
      "goodstream.one": goodstream.resolve,
      "goodstream": goodstream.resolve,
      "gs.one": goodstream.resolve,
      "hlswish.com": hlswish.resolve,
      "streamwish.com": hlswish.resolve,
      "streamwish.to": hlswish.resolve,
      "strwish.com": hlswish.resolve,
      "hlswish": hlswish.resolve,
      "streamwish": hlswish.resolve,
      "hglink": hlswish.resolve,
      "hglamioz": hlswish.resolve,
      "filelions": hlswish.resolve,
      "wishembed": hlswish.resolve,
      "wishfast": hlswish.resolve,
      "hanerix": hlswish.resolve,
      "playnixes": hlswish.resolve,
      "voe.sx": voe.resolve,
      "voe.to": voe.resolve,
      "voe.tel": voe.resolve,
      "voex.sx": voe.resolve,
      "voe-sx": voe.resolve,
      "marissashare": voe.resolve,
      "cloudwindow": voe.resolve,
      "vimeos.net": vimeos.resolve,
      "vimeos": vimeos.resolve,
      "filemoon.sx": filemoon.resolveFileMoon,
      "filemoon.to": filemoon.resolveFileMoon,
      "filemoon.lat": filemoon.resolveFileMoon,
      "filemoon.live": filemoon.resolveFileMoon,
      "filemoon.online": filemoon.resolveFileMoon,
      "filemoon.me": filemoon.resolveFileMoon,
      "fmoon.top": filemoon.resolveFileMoon,
      "filemoon": filemoon.resolveFileMoon,
      "moonalu": filemoon.resolveFileMoon,
      "moonembed": filemoon.resolveFileMoon,
      "bysedikamoum": filemoon.resolveFileMoon,
      "bysejikuar": filemoon.resolveFileMoon,
      "r66nv9ed": filemoon.resolveFileMoon,
      "398fitus": filemoon.resolveFileMoon,
      "vidhide.com": vidhide.resolve,
      "vidhidepro.com": vidhide.resolve,
      "vidhidepre.com": vidhide.resolve,
      "vidhidevip.com": vidhide.resolve,
      "dintezuvio.com": vidhide.resolve,
      "minochinos.com": vidhide.resolve,
      "filelions.to": vidhide.resolve,
      "filelions.com": vidhide.resolve,
      "vidhide": vidhide.resolve,
      "playmogo.com": playmogo.resolve,
      "playmogo": playmogo.resolve,
      "doodstream.com": playmogo.resolve,
      "doodstream": playmogo.resolve,
      "myvidplay.com": playmogo.resolve,
      "myvidplay": playmogo.resolve,
      "doply.net": playmogo.resolve,
      "vide0.net": playmogo.resolve,
      "doods.pro": playmogo.resolve,
      "doods": playmogo.resolve,
      "dsvplay.com": playmogo.resolve,
      "dsvplay": playmogo.resolve,
      "d0000d.com": playmogo.resolve,
      "d0000d": playmogo.resolve,
      "d000d.com": playmogo.resolve,
      "d000d": playmogo.resolve,
      "dooood.com": playmogo.resolve,
      "dooood": playmogo.resolve,
      "dood.wf": playmogo.resolve,
      "dood.cx": playmogo.resolve,
      "dood.sh": playmogo.resolve,
      "dood.watch": playmogo.resolve,
      "dood.pm": playmogo.resolve,
      "dood.to": playmogo.resolve,
      "dood.so": playmogo.resolve,
      "dood.ws": playmogo.resolve,
      "dood.yt": playmogo.resolve,
      "dood.li": playmogo.resolve,
      "ds2play.com": playmogo.resolve,
      "ds2play": playmogo.resolve,
      "ds2video.com": playmogo.resolve,
      "ds2video": playmogo.resolve
    };
    var SERVER_NAMES2 = {
      goodstream: "GoodStream",
      hlswish: "StreamWish",
      streamwish: "StreamWish",
      voe: "VOE",
      vimeos: "Vimeos",
      filemoon: "FileMoon",
      vidhide: "VidHide",
      playmogo: "DoodStream",
      myvidplay: "DoodStream",
      doodstream: "DoodStream",
      doods: "DoodStream",
      dsvplay: "DoodStream",
      d0000d: "DoodStream",
      d000d: "DoodStream",
      dooood: "DoodStream",
      ds2play: "DoodStream",
      ds2video: "DoodStream"
    };
    module2.exports = { SERVER_RESOLVERS: SERVER_RESOLVERS2, SERVER_NAMES: SERVER_NAMES2 };
  }
});

// src/hackstore2.js
var { SERVER_RESOLVERS, SERVER_NAMES } = require_utils();
var BASE_URL = "https://hackstore.mx";
var TMDB_API_KEY = "439c478a771f35c05022f9feabcca01c";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "es-MX,es;q=0.9,en;q=0.8"
};
function getResolver(url) {
  if (!url || !url.startsWith("http"))
    return null;
  for (const domain in SERVER_RESOLVERS) {
    if (url.includes(domain)) {
      return SERVER_RESOLVERS[domain];
    }
  }
  return null;
}
function normalizeSlug(title) {
  if (!title)
    return "";
  return title.toLowerCase().replace(/[áàäâ]/g, "a").replace(/[éèëê]/g, "e").replace(/[íìïî]/g, "i").replace(/[óòöô]/g, "o").replace(/[úùüû]/g, "u").replace(/ñ/g, "n").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
async function getTmdbInfo(tmdbId, mediaType) {
  const cleanId = String(tmdbId).split(":")[0];
  const type = mediaType === "movie" ? "movie" : "tv";
  try {
    const resp = await fetch(`https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY}`, {
      headers: { "Accept": "application/json" }
    });
    if (!resp.ok)
      return null;
    const data = await resp.json();
    const title = data.name || data.title;
    const date = data.release_date || data.first_air_date || "";
    const year = date.split("-")[0];
    return { title, year };
  } catch (e) {
    return null;
  }
}
async function getTmdbAliases(tmdbId, mediaType) {
  const cleanId = String(tmdbId).split(":")[0];
  const type = mediaType === "movie" ? "movie" : "tv";
  const titles = /* @__PURE__ */ new Set();
  try {
    const [enResp, esResp, altResp] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY}&language=en-US`),
      fetch(`https://api.themoviedb.org/3/${type}/${cleanId}?api_key=${TMDB_API_KEY}&language=es-MX`),
      fetch(`https://api.themoviedb.org/3/${type}/${cleanId}/alternative_titles?api_key=${TMDB_API_KEY}`)
    ]);
    if (enResp.ok) {
      const en = await enResp.json();
      titles.add(en.title || en.name || "");
    }
    if (esResp.ok) {
      const es = await esResp.json();
      titles.add(es.title || es.name || "");
    }
    if (altResp.ok) {
      const alt = await altResp.json();
      const altTitles = alt.titles || alt.results || [];
      altTitles.forEach((item) => {
        if (item.title)
          titles.add(item.title);
      });
    }
  } catch (e) {
  }
  return Array.from(titles).filter(Boolean);
}
function getServerName(url) {
  if (!url)
    return null;
  for (const key in SERVER_NAMES) {
    if (url.includes(key))
      return SERVER_NAMES[key];
  }
  return null;
}
async function getStreams(tmdbId, mediaType, season, episode) {
  const startTime = Date.now();
  console.log(`[HackStore] Buscando: TMDB ${tmdbId} (${mediaType})${season ? ` S${season}E${episode}` : ""}`);
  try {
    const rawId = String(tmdbId).split(":")[0];
    const isMovie = mediaType === "movie";
    const postType = isMovie ? "movies" : "tvshows";
    const [info, aliases] = await Promise.all([
      getTmdbInfo(rawId, mediaType),
      getTmdbAliases(rawId, mediaType)
    ]);
    const year = info?.year || "";
    const baseTitles = /* @__PURE__ */ new Set();
    if (info?.title)
      baseTitles.add(info.title);
    if (aliases)
      aliases.forEach((a) => baseTitles.add(a));
    const slugsToTry = [];
    for (const t of baseTitles) {
      const sl = normalizeSlug(t);
      if (!sl)
        continue;
      if (year)
        slugsToTry.push(`${sl}-${year}`);
      slugsToTry.push(sl);
    }
    const uniqueSlugs = [...new Set(slugsToTry)].slice(0, 6);
    let targetId = null;
    const idResults = await Promise.all(uniqueSlugs.map(async (slug) => {
      try {
        const resp = await fetch(`${BASE_URL}/wp-api/v1/single/${postType}?slug=${slug}&postType=${postType}`, {
          headers: HEADERS
        });
        if (!resp.ok)
          return null;
        const res = await resp.json();
        if (res?.data?._id)
          return { slug, id: res.data._id };
      } catch (e) {
      }
      return null;
    }));
    const match = idResults.find((r) => r !== null);
    if (match)
      targetId = match.id;
    if (!targetId) {
      console.log("[HackStore] No se encontr\xF3 en HackStore");
      return [];
    }
    if (postType === "tvshows") {
      try {
        const epResp = await fetch(`${BASE_URL}/wp-api/v1/single/episodes/list?_id=${targetId}&season=${season}&page=1&postsPerPage=200`, {
          headers: HEADERS
        });
        if (epResp.ok) {
          const epRes = await epResp.json();
          if (epRes?.data?.posts) {
            const epObj = epRes.data.posts.find((p) => p.season_number == season && p.episode_number == episode);
            if (epObj?._id)
              targetId = epObj._id;
            else
              return [];
          } else
            return [];
        } else
          return [];
      } catch (e) {
        return [];
      }
    }
    let playerData = [];
    try {
      const playerResp = await fetch(`${BASE_URL}/wp-api/v1/player?postId=${targetId}`, {
        headers: HEADERS
      });
      if (playerResp.ok) {
        const playerResponse = await playerResp.json();
        if (playerResponse?.data?.embeds) {
          playerData = playerResponse.data.embeds.slice(0, 15);
        }
      }
    } catch (e) {
    }
    if (playerData.length === 0)
      return [];
    const allStreams = [];
    const results = {};
    await Promise.all(playerData.map(async (p) => {
      const lang = (p.lang || "Latino").toLowerCase();
      if (lang.includes("sub") || lang.includes("vose") || lang.includes("eng") || lang.includes("espana"))
        return;
      const rawUrl = p.url;
      if (!rawUrl || rawUrl.includes("la.movie"))
        return;
      const resolver = getResolver(rawUrl);
      if (!resolver)
        return;
      try {
        const r = await resolver(rawUrl);
        if (r && r.url) {
          const serverName = r.serverName || getServerName(rawUrl) || p.server || "Online";
          const dedupKey = serverName.toLowerCase().replace(/\s+/g, "");
          if (!results[dedupKey]) {
            results[dedupKey] = { ...r, lang: "Latino", servername: serverName };
            console.log(`[HackStore] + ${serverName} (${r.quality || "HD"})`);
          }
        }
      } catch (e) {
      }
    }));
    for (const item of Object.values(results)) {
      const qualityLabel = item.quality || "HD";
      const serverLabel = SERVER_NAMES[item.servername.toLowerCase()] || item.servername;
      allStreams.push({
        name: `HackStore \xB0 ${qualityLabel}`,
        title: `Latino \xB0 ${serverLabel}`,
        description: `Latino \xB0 ${serverLabel}`,
        language: serverLabel,
        provider: serverLabel,
        quality: "Latino",
        url: item.url,
        headers: item.headers || {}
      });
    }
    const elapsed = ((Date.now() - startTime) / 1e3).toFixed(2);
    console.log(`[HackStore] \u2713 ${allStreams.length} streams en ${elapsed}s`);
    return allStreams;
  } catch (error) {
    console.error(`[HackStore] Error:`, error.message);
    return [];
  }
}
module.exports = { getStreams };
/*! Bundled license information:

@noble/ciphers/utils.js:
  (*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) *)

@noble/curves/utils.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/modular.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/curve.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/oprf.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/abstract/weierstrass.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/nist.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
