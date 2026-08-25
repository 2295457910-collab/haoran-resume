/* ============================================================
   rng.js — 确定性伪随机数发生器
   为什么不用 Math.random()？
   因为每个模型的 K 线图要"每次刷新都长得一样"，否则教学图
   会跳动。mulberry32 是一个轻量、足够均匀的种子化 PRNG，
   给定相同 seed 永远产出相同序列 → 图形稳定可复现。
   ============================================================ */
(function (global) {
  "use strict";

  // mulberry32：返回一个函数 () => [0,1)
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 基于字符串生成一个稳定的整数种子
  function hashSeed(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // range(min, max) 均匀分布
  function range(rng, min, max) {
    return min + (max - min) * rng();
  }

  // 整数 [min, max]
  function int(rng, min, max) {
    return Math.floor(range(rng, min, max + 1));
  }

  // 高斯近似（中心极限定理：两个均匀之和）
  function gauss(rng, mean, sd) {
    var u = rng() + rng();
    return mean + sd * (u - 1);
  }

  global.RNG = {
    create: function (seedStr) {
      var r = mulberry32(hashSeed(seedStr));
      return {
        next: r,
        range: function (a, b) { return range(r, a, b); },
        int: function (a, b) { return int(r, a, b); },
        gauss: function (m, s) { return gauss(r, m, s); },
        pick: function (arr) { return arr[int(r, 0, arr.length - 1)]; }
      };
    }
  };
})(window);
