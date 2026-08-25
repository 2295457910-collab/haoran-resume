/* ============================================================
   candles.js — 形态生成器
   每个 GEN.<name>(seedStr) => { candles, ann, overlays }
   - candles: [{o,h,l,c,v}] 价格统一在 ~100 附近，渲染时自适应缩放
   - ann: 标注数组 {t:'zone'|'point'|'line'|'h'|'label', ...}
   - overlays: 叠加指标线 {t:'line'|'band', pts, color, dashed}
   生成器是确定性的（seed 决定），同一模型每次刷新图形一致。
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- 基础工具 ---------- */
  const B = 100;          // 基准价
  const V = { dry: 14, quiet: 26, normal: 55, active: 95, hot: 150, climax: 210 };

  function bar(o, h, l, c, v) { return { o: o, h: h, l: l, c: c, v: v }; }

  // 由 specs 构建 candles；spec 可省略 o/h/l/v 自动推导
  // spec: {c, o?, h?, l?, v?, gap?, gapDir?}
  function build(seedStr, specs) {
    const rng = RNG.create(seedStr);
    const out = [];
    let prevC = null;
    for (let i = 0; i < specs.length; i++) {
      const s = specs[i];
      const c = s.c;
      let o;
      if (s.o != null) o = s.o;
      else if (prevC == null) o = c - 0.4;
      else if (s.gap) o = prevC + (s.gapDir > 0 ? prevC * 0.035 : -prevC * 0.035);
      else o = prevC;
      const top = Math.max(o, c), bot = Math.min(o, c);
      const h = s.h != null ? s.h : top + rng.range(0.18, 0.55);
      const l = s.l != null ? s.l : bot - rng.range(0.18, 0.55);
      const v = s.v != null ? s.v : V.normal;
      out.push(bar(o, h, l, c, v));
      prevC = c;
    }
    return out;
  }

  // 插值：waypoints=[{p,v,k}] 从上一节点插 k 根到本节点(含本节点)；返回 specs(只设 c,v)
  function interp(waypoints, rng, jitter) {
    jitter = jitter == null ? 0.25 : jitter;
    const specs = [];
    let prev = waypoints[0];
    specs.push({ c: prev.p, v: prev.v });
    for (let w = 1; w < waypoints.length; w++) {
      const cur = waypoints[w];
      const k = cur.k || 1;
      for (let s = 1; s <= k; s++) {
        const f = s / k;
        let c = prev.p + (cur.p - prev.p) * f;
        let v = prev.v + (cur.v - prev.v) * f;
        c += rng.gauss(0, jitter);
        v = Math.max(8, v + rng.gauss(0, jitter * 30));
        specs.push({ c: c, v: v });
      }
      prev = cur;
    }
    return specs;
  }

  function argmax(cs, key) { key = key || "h"; let bi = 0, bv = -1e9; cs.forEach((c, i) => { if (c[key] > bv) { bv = c[key]; bi = i; } }); return bi; }
  function argmin(cs, key) { key = key || "l"; let bi = 0, bv = 1e9; cs.forEach((c, i) => { if (c[key] < bv) { bv = c[key]; bi = i; } }); return bi; }

  // 移动平均 overlay
  function ma(cs, period, key) {
    key = key || "c";
    const pts = [];
    for (let i = 0; i < cs.length; i++) {
      if (i < period - 1) continue;
      let s = 0;
      for (let j = 0; j < period; j++) s += cs[i - j][key];
      pts.push({ i: i, p: s / period });
    }
    return pts;
  }

  /* ---------- 标注工厂 ---------- */
  const P = (i, p, label, kind) => ({ t: "point", i: i, p: p, label: label, kind: kind || "buy" });
  const H = (p, label, risk) => ({ t: "h", p: p, label: label, risk: !!risk });
  const LINE = (i0, p0, i1, p1, label, dashed) => ({ t: "line", i0: i0, p0: p0, i1: i1, p1: p1, label: label, dashed: dashed });
  const ZONE = (i0, i1, label, p0, p1) => ({ t: "zone", i0: i0, i1: i1, label: label, p0: p0, p1: p1 });
  const LBL = (i, p, text, dir) => ({ t: "label", i: i, p: p, text: text, dir: dir || "up" });
  const OL = (pts, color, dashed, label) => ({ t: "line", pts: pts, color: color, dashed: !!dashed, label: label });
  const BAND = (upper, lower, color, label) => ({ t: "band", upper: upper, lower: lower, color: color, label: label });

  /* ========================================================
     反转顶部
     ======================================================== */
  const GEN = {};

  GEN.head_shoulders_top = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 88, v: V.normal, k: 3 }, { p: 104, v: V.hot, k: 3 },   // 左肩
      { p: 96, v: V.active, k: 3 },                                  // 颈线回落
      { p: 110, v: V.climax, k: 3 }, { p: 98, v: V.active, k: 3 }, // 头部
      { p: 104, v: V.quiet, k: 2 },                                  // 右肩起
      { p: 90, v: V.climax, k: 4 }                                   // 跌破颈线
    ], r, 0.3));
    const neck = 97;
    return {
      candles: cs, seed: seed,
      ann: [
        LINE(2, 104, 14, 104, "左肩/右肩高点"), LBL(2, 105.5, "左肩", "up"),
        LBL(8, 111.5, "头部", "up"), LBL(17, 105.5, "右肩", "up"),
        H(neck, "颈线 97"), P(19, neck, "跌破颈线：做空/止损", "stop")
      ]
    };
  };

  GEN.double_top = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 86, v: V.normal, k: 3 }, { p: 106, v: V.hot, k: 3 },   // A峰
      { p: 94, v: V.active, k: 4 },                                  // 回落
      { p: 106, v: V.hot, k: 3 },                                    // B峰(≈A)
      { p: 88, v: V.climax, k: 4 }                                   // 跌破颈线
    ], r, 0.3));
    const neck = 94;
    return { candles: cs, seed: seed, ann: [LBL(5, 108, "A 峰", "up"), LBL(14, 108, "B 峰", "up"), H(neck, "颈线/回调低 94"), P(17, neck, "跌破颈线", "stop")] };
  };

  GEN.triple_top = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 86, v: V.normal, k: 2 }, { p: 106, v: V.hot, k: 3 }, { p: 96, v: V.active, k: 3 },
      { p: 106, v: V.hot, k: 3 }, { p: 96, v: V.active, k: 3 },
      { p: 106, v: V.hot, k: 3 }, { p: 86, v: V.climax, k: 4 }
    ], r, 0.25));
    return { candles: cs, seed: seed, ann: [LBL(4, 108, "①", "up"), LBL(10, 108, "②", "up"), LBL(16, 108, "③", "up"), H(96, "支撑 96"), P(20, 96, "跌破支撑", "stop")] };
  };

  GEN.rounded_top = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 88, v: V.normal, k: 4 }, { p: 98, v: V.normal, k: 4 }, { p: 104, v: V.quiet, k: 5 },
      { p: 100, v: V.quiet, k: 4 }, { p: 92, v: V.active, k: 4 }, { p: 84, v: V.hot, k: 4 }
    ], r, 0.2));
    const top = argmax(cs);
    return { candles: cs, seed: seed, ann: [LBL(top, 105.5, "圆弧顶", "up"), LINE(0, 88, cs.length - 1, 84, "缓慢派发", true)] };
  };

  GEN.v_top = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 80, v: V.active, k: 3 }, { p: 96, v: V.hot, k: 3 }, { p: 110, v: V.climax, k: 2 },
      { p: 104, v: V.hot, k: 1 }, { p: 90, v: V.climax, k: 3 }, { p: 82, v: V.hot, k: 3 }
    ], r, 0.35));
    const top = argmax(cs);
    return { candles: cs, seed: seed, ann: [LBL(top, 112, "尖顶反转", "up"), P(top, 110, "放量滞涨/见顶", "stop")] };
  };

  GEN.diamond_top = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 92, v: V.normal, k: 2 }, { p: 102, v: V.active, k: 2 }, { p: 96, v: V.active, k: 2 },
      { p: 108, v: V.hot, k: 2 }, { p: 92, v: V.hot, k: 2 },      // 扩散
      { p: 102, v: V.active, k: 2 }, { p: 96, v: V.active, k: 2 }, // 收敛
      { p: 84, v: V.climax, k: 3 }                                  // 跌破
    ], r, 0.3));
    return { candles: cs, seed: seed, ann: [LINE(2, 102, 6, 108, "扩散"), LINE(6, 108, 10, 92, "扩散"), LINE(10, 92, 14, 84, "跌破", true), ZONE(2, 13, "菱形"), LBL(6, 110, "扩散顶", "up")] };
  };

  GEN.island_top = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, [
      { c: 92, v: V.normal, gap: true, gapDir: 1 }, { c: 96, v: V.active }, { c: 104, v: V.hot }, { c: 108, v: V.hot },
      { c: 110, v: V.hot, gap: true, gapDir: 1 }, { c: 110, v: V.quiet }, { c: 109, v: V.quiet }, { c: 108, v: V.quiet }, // 岛
      { c: 100, v: V.climax, gap: true, gapDir: -1 }, { c: 94, v: V.hot }, { c: 88, v: V.hot }
    ]);
    return { candles: cs, seed: seed, ann: [ZONE(4, 7, "缺口岛"), H(108, "岛区间"), LBL(8, 102, "跳空下跌", "down"), P(8, 100, "反转确立", "stop")] };
  };

  /* ========================================================
     反转底部
     ======================================================== */
  GEN.head_shoulders_bottom = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 112, v: V.normal, k: 3 }, { p: 96, v: V.hot, k: 3 },   // 左肩底
      { p: 104, v: V.active, k: 3 }, { p: 90, v: V.climax, k: 3 },// 头部底
      { p: 102, v: V.active, k: 3 }, { p: 96, v: V.hot, k: 3 },  // 右肩底
      { p: 112, v: V.climax, k: 4 }                                 // 突破颈线
    ], r, 0.3));
    const neck = 104;
    return { candles: cs, seed: seed, ann: [LBL(5, 89, "头", "down"), LBL(2, 95, "左肩", "down"), LBL(17, 95, "右肩", "down"), H(neck, "颈线 104"), P(23, neck, "放量突破颈线", "buy")] };
  };

  GEN.double_bottom = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 114, v: V.normal, k: 3 }, { p: 94, v: V.hot, k: 3 },   // A底
      { p: 106, v: V.active, k: 4 }, { p: 94, v: V.hot, k: 3 },   // B底(≈A)
      { p: 116, v: V.climax, k: 4 }                                 // 突破颈线
    ], r, 0.3));
    const neck = 106;
    return { candles: cs, seed: seed, ann: [LBL(5, 92.5, "A 底", "down"), LBL(14, 92.5, "B 底", "down"), H(neck, "颈线 106"), P(17, neck, "突破颈线", "buy")] };
  };

  GEN.triple_bottom = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 114, v: V.normal, k: 2 }, { p: 94, v: V.hot, k: 3 }, { p: 104, v: V.active, k: 3 },
      { p: 94, v: V.hot, k: 3 }, { p: 104, v: V.active, k: 3 },
      { p: 94, v: V.hot, k: 3 }, { p: 116, v: V.climax, k: 4 }
    ], r, 0.25));
    return { candles: cs, seed: seed, ann: [LBL(4, 92.5, "①", "down"), LBL(10, 92.5, "②", "down"), LBL(16, 92.5, "③", "down"), H(104, "颈线"), P(20, 104, "突破", "buy")] };
  };

  GEN.rounded_bottom = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 112, v: V.normal, k: 4 }, { p: 102, v: V.normal, k: 4 }, { p: 96, v: V.quiet, k: 5 },
      { p: 100, v: V.quiet, k: 4 }, { p: 108, v: V.active, k: 4 }, { p: 116, v: V.hot, k: 4 }
    ], r, 0.2));
    const bot = argmin(cs);
    return { candles: cs, seed: seed, ann: [LBL(bot, 94.5, "圆弧底", "down"), LINE(0, 112, cs.length - 1, 116, "缓慢收集", true)] };
  };

  GEN.v_bottom = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 120, v: V.active, k: 3 }, { p: 104, v: V.hot, k: 3 }, { p: 90, v: V.climax, k: 2 },
      { p: 96, v: V.hot, k: 1 }, { p: 110, v: V.climax, k: 3 }, { p: 118, v: V.hot, k: 3 }
    ], r, 0.35));
    const bot = argmin(cs);
    return { candles: cs, seed: seed, ann: [LBL(bot, 88.5, "V 形底", "down"), P(bot, 90, "恐慌见底/抢反弹", "buy")] };
  };

  GEN.island_bottom = function (seed) {
    const cs = build(seed, [
      { c: 108, v: V.normal, gap: true, gapDir: -1 }, { c: 104, v: V.active }, { c: 96, v: V.hot }, { c: 92, v: V.hot },
      { c: 90, v: V.hot, gap: true, gapDir: -1 }, { c: 90, v: V.quiet }, { c: 91, v: V.quiet }, { c: 92, v: V.quiet },
      { c: 100, v: V.climax, gap: true, gapDir: 1 }, { c: 106, v: V.hot }, { c: 112, v: V.hot }
    ]);
    return { candles: cs, seed: seed, ann: [ZONE(4, 7, "缺口岛"), H(90, "岛区间"), LBL(8, 98, "跳空上涨", "up"), P(8, 100, "反转确立", "buy")] };
  };

  /* ========================================================
     持续形态
     ======================================================== */
  GEN.ascending_triangle = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 96, v: V.normal, k: 2 }, { p: 104, v: V.hot, k: 2 }, { p: 99, v: V.active, k: 2 },
      { p: 104, v: V.hot, k: 1 }, { p: 100, v: V.active, k: 2 }, { p: 104, v: V.hot, k: 1 },
      { p: 102, v: V.active, k: 2 }, { p: 112, v: V.climax, k: 4 }
    ], r, 0.2));
    return { candles: cs, seed: seed, ann: [H(104, "水平阻力 104"), LINE(0, 96, 12, 102, "上升支撑线"), P(13, 104, "放量突破阻力", "buy")] };
  };

  GEN.descending_triangle = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 108, v: V.normal, k: 2 }, { p: 100, v: V.hot, k: 2 }, { p: 106, v: V.active, k: 2 },
      { p: 100, v: V.hot, k: 1 }, { p: 104, v: V.active, k: 2 }, { p: 100, v: V.hot, k: 1 },
      { p: 103, v: V.active, k: 2 }, { p: 92, v: V.climax, k: 4 }
    ], r, 0.2));
    return { candles: cs, seed: seed, ann: [H(100, "水平支撑 100"), LINE(0, 108, 12, 103, "下降阻力线"), P(13, 100, "跌破支撑", "stop")] };
  };

  GEN.symmetric_triangle = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 92, v: V.normal, k: 2 }, { p: 108, v: V.hot, k: 2 }, { p: 97, v: V.active, k: 2 },
      { p: 106, v: V.hot, k: 2 }, { p: 99, v: V.active, k: 2 }, { p: 104, v: V.hot, k: 2 },
      { p: 101, v: V.quiet, k: 1 }, { p: 112, v: V.climax, k: 3 }
    ], r, 0.18));
    return { candles: cs, seed: seed, ann: [LINE(2, 108, 8, 106, "下降阻力"), LINE(2, 97, 10, 99, "上升支撑"), P(13, 104, "方向选择(上)", "buy")] };
  };

  GEN.broadening = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 102, v: V.normal, k: 2 }, { p: 106, v: V.active, k: 2 }, { p: 100, v: V.active, k: 2 },
      { p: 110, v: V.hot, k: 2 }, { p: 98, v: V.hot, k: 2 }, { p: 112, v: V.climax, k: 2 },
      { p: 96, v: V.climax, k: 2 }
    ], r, 0.3));
    return { candles: cs, seed: seed, ann: [LINE(0, 102, 12, 112, "上轨"), LINE(0, 102, 12, 96, "下轨"), LBL(6, 113, "扩散/喇叭", "up")] };
  };

  GEN.bull_flag = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 90, v: V.normal, k: 2 }, { p: 108, v: V.climax, k: 3 }, // 旗杆
      { p: 105, v: V.quiet, k: 1 }, { p: 102, v: V.quiet, k: 1 }, { p: 104, v: V.quiet, k: 1 }, { p: 101, v: V.quiet, k: 1 }, // 旗面(小幅下行)
      { p: 116, v: V.hot, k: 4 }                                    // 突破
    ], r, 0.25));
    return { candles: cs, seed: seed, ann: [LINE(4, 108, 9, 101, "旗面"), LBL(3, 109.5, "旗杆", "up"), P(10, 105, "突破回踩", "buy")] };
  };

  GEN.bear_flag = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 112, v: V.normal, k: 2 }, { p: 94, v: V.climax, k: 3 },
      { p: 97, v: V.quiet, k: 1 }, { p: 100, v: V.quiet, k: 1 }, { p: 98, v: V.quiet, k: 1 }, { p: 101, v: V.quiet, k: 1 },
      { p: 86, v: V.hot, k: 4 }
    ], r, 0.25));
    return { candles: cs, seed: seed, ann: [LINE(4, 94, 9, 101, "旗面"), LBL(3, 92.5, "旗杆", "down"), P(10, 97, "跌破做空", "stop")] };
  };

  GEN.bull_pennant = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 90, v: V.normal, k: 2 }, { p: 108, v: V.climax, k: 3 },
      { p: 105, v: V.quiet, k: 1 }, { p: 103, v: V.quiet, k: 1 }, { p: 106, v: V.quiet, k: 1 }, { p: 104, v: V.quiet, k: 1 }, { p: 105, v: V.dry, k: 1 },
      { p: 116, v: V.hot, k: 4 }
    ], r, 0.2));
    return { candles: cs, seed: seed, ann: [LINE(4, 105, 9, 106, "三角"), LINE(4, 105, 9, 104, "三角"), LBL(3, 109.5, "旗杆", "up"), P(10, 106, "突破", "buy")] };
  };

  GEN.bear_pennant = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 112, v: V.normal, k: 2 }, { p: 94, v: V.climax, k: 3 },
      { p: 97, v: V.quiet, k: 1 }, { p: 99, v: V.quiet, k: 1 }, { p: 96, v: V.quiet, k: 1 }, { p: 98, v: V.quiet, k: 1 }, { p: 97, v: V.dry, k: 1 },
      { p: 86, v: V.hot, k: 4 }
    ], r, 0.2));
    return { candles: cs, seed: seed, ann: [LINE(4, 97, 9, 96, "三角"), LINE(4, 97, 9, 99, "三角"), LBL(3, 92.5, "旗杆", "down"), P(10, 96, "跌破", "stop")] };
  };

  GEN.rising_wedge = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 90, v: V.normal, k: 2 }, { p: 96, v: V.active, k: 2 }, { p: 92, v: V.active, k: 2 },
      { p: 100, v: V.hot, k: 2 }, { p: 96, v: V.active, k: 2 }, { p: 104, v: V.hot, k: 2 }, { p: 102, v: V.hot, k: 1 },
      { p: 92, v: V.climax, k: 3 }
    ], r, 0.22));
    return { candles: cs, seed: seed, ann: [LINE(0, 90, 12, 102, "下轨↑"), LINE(2, 96, 12, 104, "上轨↑"), LBL(6, 105.5, "上升楔形", "up"), P(14, 100, "跌破下轨", "stop")] };
  };

  GEN.falling_wedge = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 110, v: V.normal, k: 2 }, { p: 104, v: V.active, k: 2 }, { p: 108, v: V.active, k: 2 },
      { p: 100, v: V.hot, k: 2 }, { p: 104, v: V.active, k: 2 }, { p: 96, v: V.hot, k: 2 }, { p: 98, v: V.hot, k: 1 },
      { p: 108, v: V.climax, k: 3 }
    ], r, 0.22));
    return { candles: cs, seed: seed, ann: [LINE(0, 110, 12, 98, "上轨↓"), LINE(2, 104, 12, 96, "下轨↓"), LBL(6, 94.5, "下降楔形", "down"), P(14, 100, "突破上轨", "buy")] };
  };

  GEN.rectangle_box = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 96, v: V.normal, k: 2 }, { p: 104, v: V.hot, k: 2 }, { p: 99, v: V.quiet, k: 2 }, { p: 96, v: V.active, k: 2 },
      { p: 100, v: V.quiet, k: 2 }, { p: 104, v: V.hot, k: 2 }, { p: 98, v: V.quiet, k: 2 }, { p: 96, v: V.active, k: 2 },
      { p: 112, v: V.climax, k: 3 }
    ], r, 0.3));
    return { candles: cs, seed: seed, ann: [H(104, "阻力 104"), H(96, "支撑 96", true), ZONE(1, 15, "箱体"), P(16, 104, "突破阻力", "buy")] };
  };

  GEN.cup_handle = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 96, v: V.normal, k: 2 }, { p: 104, v: V.hot, k: 2 },     // 左沿高点
      { p: 96, v: V.active, k: 3 }, { p: 90, v: V.quiet, k: 3 }, { p: 96, v: V.active, k: 3 }, // 杯底U形
      { p: 104, v: V.hot, k: 2 },                                    // 右沿
      { p: 100, v: V.quiet, k: 2 }, { p: 102, v: V.quiet, k: 2 },   // 柄(浅回撤)
      { p: 112, v: V.climax, k: 3 }                                   // 突破
    ], r, 0.22));
    return { candles: cs, seed: seed, ann: [ZONE(2, 12, "杯"), ZONE(13, 16, "柄"), H(104, "杯沿高点 104"), P(17, 104, "放量突破杯沿", "buy")] };
  };

  GEN.flat_base = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 96, v: V.normal, k: 2 }, { p: 102, v: V.active, k: 2 },
      { p: 100, v: V.dry, k: 2 }, { p: 101, v: V.dry, k: 2 }, { p: 100, v: V.dry, k: 2 }, { p: 101, v: V.dry, k: 2 },
      { p: 110, v: V.climax, k: 4 }
    ], r, 0.12));
    return { candles: cs, seed: seed, ann: [ZONE(3, 10, "窄幅横盘(量缩)"), H(102, "平台高点 102"), P(11, 102, "放量突破", "buy")] };
  };

  GEN.high_tight_flag = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 90, v: V.normal, k: 2 }, { p: 110, v: V.climax, k: 2 }, { p: 120, v: V.climax, k: 2 }, // 杆:涨幅~33%
      { p: 116, v: V.quiet, k: 2 }, { p: 118, v: V.quiet, k: 2 }, { p: 116, v: V.quiet, k: 2 }, // 窄幅横盘
      { p: 132, v: V.hot, k: 4 }
    ], r, 0.25));
    return { candles: cs, seed: seed, ann: [LBL(3, 122, "旗杆(+33%)", "up"), LINE(4, 116, 9, 116, "极窄旗面"), P(10, 118, "突破续攻", "buy")] };
  };

  /* ========================================================
     缺口
     ======================================================== */
  GEN.breakaway_gap = function (seed) {
    const cs = build(seed, [
      { c: 96, v: V.quiet }, { c: 98, v: V.quiet }, { c: 99, v: V.dry }, { c: 98, v: V.quiet }, // 盘整
      { c: 104, v: V.hot, gap: true, gapDir: 1 }, { c: 108, v: V.hot }, { c: 110, v: V.active }, { c: 112, v: V.active }
    ]);
    return { candles: cs, seed: seed, ann: [ZONE(0, 3, "整理区"), LBL(4, 103, "突破缺口", "up"), H(99.5, "缺口上沿(不回补)")] };
  };

  GEN.runaway_gap = function (seed) {
    const cs = build(seed, [
      { c: 96, v: V.active }, { c: 100, v: V.hot }, { c: 104, v: V.hot },
      { c: 108, v: V.hot, gap: true, gapDir: 1 }, { c: 110, v: V.active }, { c: 112, v: V.active }, { c: 114, v: V.active }
    ]);
    return { candles: cs, seed: seed, ann: [LBL(3, 107, "中继缺口", "up"), H(104.5, "缺口(测量位≈起点+缺口幅度)")] };
  };

  GEN.exhaustion_gap = function (seed) {
    const cs = build(seed, [
      { c: 100, v: V.hot }, { c: 106, v: V.climax }, { c: 110, v: V.climax, gap: true, gapDir: 1 },
      { c: 106, v: V.hot }, { c: 100, v: V.hot }, { c: 94, v: V.climax }
    ]);
    return { candles: cs, seed: seed, ann: [LBL(2, 111, "衰竭缺口", "up"), LBL(3, 108, "见顶回落", "down"), P(3, 106, "回补缺口=反转", "stop")] };
  };

  /* ========================================================
     单根蜡烛
     ======================================================== */
  // 通用上下文：一段趋势(末根恰好收于 100) + 末根为指定形态 pat={o,c,h,l,v}
  // 严格几何：h>=max(o,c), l<=min(o,c)
  function singleCandle(seed, trendDir, pat) {
    const rng = RNG.create(seed);
    const pre = [];
    const target = 100;
    let p = trendDir > 0 ? target - 9 : target + 9;
    for (let i = 0; i < 4; i++) {
      p += trendDir * rng.range(1.4, 2.2);
      const o = p - trendDir * rng.range(0.5, 1.0);
      pre.push({ o: o, c: p, h: Math.max(o, p) + rng.range(0.2, 0.5), l: Math.min(o, p) - rng.range(0.2, 0.5), v: V.active });
    }
    const o5 = target - trendDir * rng.range(0.6, 1.3);
    pre.push({ o: o5, c: target, h: Math.max(o5, target) + rng.range(0.2, 0.5), l: Math.min(o5, target) - rng.range(0.2, 0.5), v: V.active });
    const last = Object.assign({ v: V.hot }, pat);
    if (last.o == null) last.o = target;
    return build(seed, pre.concat([last]));
  }

  GEN.hammer = function (seed) {
    const cs = singleCandle(seed, -1, { o: 99.2, c: 99.6, h: 99.8, l: 95.0 });
    return { candles: cs, seed: seed, ann: [LBL(5, 100.3, "锤子线", "up"), P(5, 95.1, "见底反弹", "buy")] };
  };
  GEN.hanging_man = function (seed) {
    const cs = singleCandle(seed, 1, { o: 100.8, c: 100.4, h: 101.0, l: 96.0 });
    return { candles: cs, seed: seed, ann: [LBL(5, 101.3, "上吊线", "down"), P(5, 96.1, "见顶回落", "stop")] };
  };
  GEN.inverted_hammer = function (seed) {
    const cs = singleCandle(seed, -1, { o: 99.5, c: 99.8, h: 104.0, l: 99.3 });
    return { candles: cs, seed: seed, ann: [LBL(5, 104.3, "倒锤子", "up"), P(5, 99.4, "待次日确认", "watch")] };
  };
  GEN.shooting_star = function (seed) {
    const cs = singleCandle(seed, 1, { o: 100.5, c: 100.2, h: 104.4, l: 100.0 });
    return { candles: cs, seed: seed, ann: [LBL(5, 104.7, "流星线", "down"), P(5, 100.1, "见顶", "stop")] };
  };
  GEN.doji = function (seed) {
    const cs = singleCandle(seed, 1, { o: 100, c: 100, h: 102.2, l: 97.8 });
    return { candles: cs, seed: seed, ann: [LBL(5, 102.7, "十字星", "up"), P(5, 100, "多空均衡/变盘", "watch")] };
  };
  GEN.long_legged_doji = function (seed) {
    const cs = singleCandle(seed, 1, { o: 100, c: 100, h: 104.2, l: 95.8 });
    return { candles: cs, seed: seed, ann: [LBL(5, 104.7, "长腿十字", "up"), P(5, 100, "剧烈分歧", "watch")] };
  };
  GEN.gravestone_doji = function (seed) {
    const cs = singleCandle(seed, 1, { o: 100, c: 100, h: 104.2, l: 99.8 });
    return { candles: cs, seed: seed, ann: [LBL(5, 104.7, "墓碑十字", "up"), P(5, 100, "顶部反转", "stop")] };
  };
  GEN.dragonfly_doji = function (seed) {
    const cs = singleCandle(seed, -1, { o: 100, c: 100, h: 100.2, l: 95.8 });
    return { candles: cs, seed: seed, ann: [LBL(5, 100.7, "蜻蜓十字", "up"), P(5, 95.9, "底部反转", "buy")] };
  };
  GEN.spinning_top = function (seed) {
    const cs = singleCandle(seed, 1, { o: 99, c: 101, h: 103.2, l: 96.8 });
    return { candles: cs, seed: seed, ann: [LBL(5, 103.7, "陀螺线", "up"), P(5, 100, "犹豫/变盘", "watch")] };
  };
  GEN.marubozu_bull = function (seed) {
    const cs = singleCandle(seed, -1, { o: 95, c: 102, h: 102, l: 95 });
    return { candles: cs, seed: seed, ann: [LBL(5, 102.7, "光头光脚阳", "up"), P(5, 102, "强势启动", "buy")] };
  };
  GEN.marubozu_bear = function (seed) {
    const cs = singleCandle(seed, 1, { o: 102, c: 95, h: 102, l: 95 });
    return { candles: cs, seed: seed, ann: [LBL(5, 94.3, "光头光脚阴", "down"), P(5, 95, "强势下跌", "stop")] };
  };
  GEN.belt_hold_bull = function (seed) {
    const cs = singleCandle(seed, -1, { o: 94, c: 100, h: 100.2, l: 94 });
    return { candles: cs, seed: seed, ann: [LBL(5, 100.7, "看涨捉腰带", "up"), P(5, 100, "反转启动", "buy")] };
  };
  GEN.belt_hold_bear = function (seed) {
    const cs = singleCandle(seed, 1, { o: 106, c: 100, h: 106, l: 99.8 });
    return { candles: cs, seed: seed, ann: [LBL(5, 99.3, "看跌捉腰带", "down"), P(5, 100, "反转下跌", "stop")] };
  };

  /* ========================================================
     双蜡烛
     ======================================================== */
  // trendDir 趋势进到 base=100；oOfs/cOfs 为相对 100 的偏移；h/l 为影线长度
  function twoCandle(seed, trendDir, firstSpec, secondSpec) {
    const rng = RNG.create(seed);
    const pre = [];
    const target = 100;
    let p = trendDir > 0 ? target - 8 : target + 8;
    for (let i = 0; i < 3; i++) {
      p += trendDir * rng.range(1.4, 2.2);
      const o = p - trendDir * rng.range(0.5, 1.0);
      pre.push({ o: o, c: p, h: Math.max(o, p) + rng.range(0.2, 0.5), l: Math.min(o, p) - rng.range(0.2, 0.5), v: V.active });
    }
    const o4 = target - trendDir * rng.range(0.6, 1.2);
    pre.push({ o: o4, c: target, h: Math.max(o4, target) + rng.range(0.2, 0.5), l: Math.min(o4, target) - rng.range(0.2, 0.5), v: V.active });
    const base = target;
    const mk = function (s) { const o = base + s.oOfs, c = base + s.cOfs; return { o: o, c: c, h: Math.max(o, c) + (s.h || 0.5), l: Math.min(o, c) - (s.l || 0.5), v: V.hot }; };
    return build(seed, pre.concat([mk(firstSpec), mk(secondSpec)]));
  }

  GEN.bull_engulfing = function (seed) {
    const cs = twoCandle(seed, -1, { oOfs: 0, cOfs: -2.2, h: 0.5, l: 0.5 }, { oOfs: -2.6, cOfs: 2.5, h: 0.6, l: 0.6 });
    return { candles: cs, seed: seed, ann: [LBL(5, 97.4, "小阴", "down"), LBL(6, 103, "大阳吞没", "up"), P(6, 102.5, "反转买点", "buy")] };
  };
  GEN.bear_engulfing = function (seed) {
    const cs = twoCandle(seed, 1, { oOfs: 0, cOfs: 2.2, h: 0.5, l: 0.5 }, { oOfs: 2.6, cOfs: -2.5, h: 0.6, l: 0.6 });
    return { candles: cs, seed: seed, ann: [LBL(5, 102.6, "小阳", "up"), LBL(6, 97, "大阴吞没", "down"), P(6, 97.5, "反转卖点", "stop")] };
  };
  GEN.piercing = function (seed) {
    const cs = twoCandle(seed, -1, { oOfs: 0, cOfs: -3, h: 0.5, l: 0.5 }, { oOfs: -3.9, cOfs: -0.5, h: 0.6, l: 0.6 });
    return { candles: cs, seed: seed, ann: [LBL(5, 96.3, "长阴", "down"), LBL(6, 99.8, "刺透中点", "up"), H(98.5, "前阴中点"), P(6, 99.3, "买点", "buy")] };
  };
  GEN.dark_cloud_cover = function (seed) {
    const cs = twoCandle(seed, 1, { oOfs: 0, cOfs: 3, h: 0.5, l: 0.5 }, { oOfs: 3.9, cOfs: 0.5, h: 0.6, l: 0.6 });
    return { candles: cs, seed: seed, ann: [LBL(5, 103.7, "长阳", "up"), LBL(6, 100.2, "乌云盖顶", "down"), H(101.5, "前阳中点"), P(6, 100.7, "卖点", "stop")] };
  };
  GEN.harami_bull = function (seed) {
    const cs = twoCandle(seed, -1, { oOfs: 0, cOfs: -4, h: 0.5, l: 0.5 }, { oOfs: -3, cOfs: -2, h: 0.4, l: 0.4 });
    return { candles: cs, seed: seed, ann: [LBL(5, 95.3, "长阴", "down"), LBL(6, 98.2, "小阳孕出", "up"), ZONE(5, 6, "孕线"), P(6, 98, "动能衰减/待确认", "watch")] };
  };
  GEN.harami_bear = function (seed) {
    const cs = twoCandle(seed, 1, { oOfs: 0, cOfs: 4, h: 0.5, l: 0.5 }, { oOfs: 3, cOfs: 2, h: 0.4, l: 0.4 });
    return { candles: cs, seed: seed, ann: [LBL(5, 104.7, "长阳", "up"), LBL(6, 101.8, "小阴孕出", "down"), ZONE(5, 6, "孕线"), P(6, 102, "动能衰减", "watch")] };
  };
  GEN.doji_harami = function (seed) {
    const cs = twoCandle(seed, 1, { oOfs: 0, cOfs: 4, h: 0.5, l: 0.5 }, { oOfs: 2, cOfs: 2, h: 0.3, l: 0.3 });
    return { candles: cs, seed: seed, ann: [LBL(5, 104.7, "长阳", "up"), LBL(6, 102.3, "十字孕线", "up"), P(6, 102, "重要变盘", "watch")] };
  };
  GEN.counterattack_bull = function (seed) {
    const cs = twoCandle(seed, -1, { oOfs: 0, cOfs: -4, h: 0.5, l: 0.5 }, { oOfs: -5, cOfs: -4, h: 0.6, l: 0.6 });
    return { candles: cs, seed: seed, ann: [LBL(5, 95.3, "长阴", "down"), LBL(6, 95.5, "看涨反击", "up"), H(96, "同收于前收"), P(6, 96, "反弹", "buy")] };
  };
  GEN.counterattack_bear = function (seed) {
    const cs = twoCandle(seed, 1, { oOfs: 0, cOfs: 4, h: 0.5, l: 0.5 }, { oOfs: 5, cOfs: 4, h: 0.6, l: 0.6 });
    return { candles: cs, seed: seed, ann: [LBL(5, 104.7, "长阳", "up"), LBL(6, 104.5, "看跌反击", "down"), P(6, 104, "回落", "stop")] };
  };
  GEN.homing_pigeon = function (seed) {
    const cs = twoCandle(seed, -1, { oOfs: 0, cOfs: -4, h: 0.5, l: 0.5 }, { oOfs: -0.5, cOfs: -2, h: 0.4, l: 0.4 });
    return { candles: cs, seed: seed, ann: [LBL(5, 95.3, "大阴", "down"), LBL(6, 98.5, "小阴孕出", "down"), ZONE(5, 6, "双阴孕"), P(6, 98.5, "抛压减弱", "watch")] };
  };
  GEN.separating_bull = function (seed) {
    const rng = RNG.create(seed);
    const pre = [];
    let p = 92;
    for (let i = 0; i < 3; i++) { p += rng.range(0.8, 1.6); const o = p - rng.range(0.5, 1); pre.push({ o: o, c: p, h: Math.max(o, p) + 0.4, l: Math.min(o, p) - 0.4, v: V.active }); }
    const o4 = 100 - rng.range(0.6, 1.2);
    pre.push({ o: o4, c: 100, h: Math.max(o4, 100) + 0.4, l: Math.min(o4, 100) - 0.4, v: V.active });
    const cs = build(seed, pre.concat([
      { o: 100, c: 102, h: 102.4, l: 99.8, v: V.hot },
      { o: 102.3, c: 104, h: 104.4, l: 102.1, v: V.hot }
    ]));
    return { candles: cs, seed: seed, ann: [LBL(4, 102.5, "阳线①", "up"), LBL(5, 104.5, "跳空阳线②", "up"), P(5, 104, "续涨", "buy")] };
  };

  /* ========================================================
     三蜡烛
     ======================================================== */
  // trendDir 趋势进到 base=100；oOfs/cOfs 相对 100；h/l 影线长度
  function threeCandle(seed, trendDir, s1, s2, s3) {
    const rng = RNG.create(seed);
    const pre = [];
    const target = 100;
    let p = trendDir > 0 ? target - 7 : target + 7;
    for (let i = 0; i < 2; i++) {
      p += trendDir * rng.range(1.6, 2.6);
      const o = p - trendDir * rng.range(0.5, 1.0);
      pre.push({ o: o, c: p, h: Math.max(o, p) + rng.range(0.2, 0.5), l: Math.min(o, p) - rng.range(0.2, 0.5), v: V.active });
    }
    const o3 = target - trendDir * rng.range(0.6, 1.2);
    pre.push({ o: o3, c: target, h: Math.max(o3, target) + rng.range(0.2, 0.5), l: Math.min(o3, target) - rng.range(0.2, 0.5), v: V.active });
    const base = target;
    const mk = function (s) { const o = base + s.oOfs, c = base + s.cOfs; return { o: o, c: c, h: Math.max(o, c) + (s.h || 0.5), l: Math.min(o, c) - (s.l || 0.5), v: V.hot }; };
    return build(seed, pre.concat([mk(s1), mk(s2), mk(s3)]));
  }

  GEN.morning_star = function (seed) {
    const cs = threeCandle(seed, -1, { oOfs: 0, cOfs: -4 }, { oOfs: -4.4, cOfs: -4.6, h: 0.3, l: 0.3 }, { oOfs: -3.8, cOfs: 1, h: 0.6, l: 0.6 });
    return { candles: cs, seed: seed, ann: [LBL(3, 95.5, "长阴", "down"), LBL(4, 95.3, "十字(星)", "up"), LBL(5, 102, "大阳", "up"), H(98, "收复第一根中点"), P(5, 101, "买点", "buy")] };
  };
  GEN.evening_star = function (seed) {
    const cs = threeCandle(seed, 1, { oOfs: 0, cOfs: 4 }, { oOfs: 4.4, cOfs: 4.6, h: 0.3, l: 0.3 }, { oOfs: 3.8, cOfs: -1, h: 0.6, l: 0.6 });
    return { candles: cs, seed: seed, ann: [LBL(3, 104.5, "长阳", "up"), LBL(4, 104.7, "十字(星)", "up"), LBL(5, 98, "大阴", "down"), H(102, "跌回第一根中点"), P(5, 99, "卖点", "stop")] };
  };
  GEN.three_white_soldiers = function (seed) {
    const cs = threeCandle(seed, -1, { oOfs: -3.5, cOfs: -1, h: 0.6, l: 0.5 }, { oOfs: -1.2, cOfs: 1.5, h: 0.6, l: 0.5 }, { oOfs: 1.3, cOfs: 4, h: 0.6, l: 0.5 });
    return { candles: cs, seed: seed, ann: [LBL(3, 96.5, "阳①", "up"), LBL(4, 98.8, "阳②", "up"), LBL(5, 101.5, "阳③", "up"), P(5, 100.5, "推升/慎防滞涨", "buy")] };
  };
  GEN.three_black_crows = function (seed) {
    const cs = threeCandle(seed, 1, { oOfs: 3.5, cOfs: 1, h: 0.5, l: 0.6 }, { oOfs: 1.2, cOfs: -1.5, h: 0.5, l: 0.6 }, { oOfs: -1.3, cOfs: -4, h: 0.5, l: 0.6 });
    return { candles: cs, seed: seed, ann: [LBL(3, 103.5, "阴①", "down"), LBL(4, 101.2, "阴②", "down"), LBL(5, 98.5, "阴③", "down"), P(5, 99.5, "推低", "stop")] };
  };
  GEN.three_inside_up = function (seed) {
    const cs = threeCandle(seed, -1, { oOfs: 0, cOfs: -4 }, { oOfs: -3.5, cOfs: -2, h: 0.4, l: 0.4 }, { oOfs: -2.2, cOfs: 1.5, h: 0.6, l: 0.6 });
    return { candles: cs, seed: seed, ann: [LBL(3, 95.5, "长阴", "down"), LBL(4, 98, "孕小阳", "up"), LBL(5, 101.5, "确认阳", "up"), P(5, 101, "买点", "buy")] };
  };
  GEN.three_inside_down = function (seed) {
    const cs = threeCandle(seed, 1, { oOfs: 0, cOfs: 4 }, { oOfs: 3.5, cOfs: 2, h: 0.4, l: 0.4 }, { oOfs: 2.2, cOfs: -1.5, h: 0.6, l: 0.6 });
    return { candles: cs, seed: seed, ann: [LBL(3, 104.5, "长阳", "up"), LBL(4, 102, "孕小阴", "down"), LBL(5, 98.5, "确认阴", "down"), P(5, 99, "卖点", "stop")] };
  };
  GEN.three_outside_up = function (seed) {
    const cs = threeCandle(seed, -1, { oOfs: 0, cOfs: -2.2 }, { oOfs: -2.6, cOfs: 2.5, h: 0.6, l: 0.6 }, { oOfs: 2.3, cOfs: 5, h: 0.6, l: 0.6 });
    return { candles: cs, seed: seed, ann: [LBL(3, 97.3, "小阴", "down"), LBL(4, 102.5, "吞没阳", "up"), LBL(5, 105.2, "确认阳", "up"), P(5, 104, "买点", "buy")] };
  };
  GEN.three_outside_down = function (seed) {
    const cs = threeCandle(seed, 1, { oOfs: 0, cOfs: 2.2 }, { oOfs: 2.6, cOfs: -2.5, h: 0.6, l: 0.6 }, { oOfs: -2.3, cOfs: -5, h: 0.6, l: 0.6 });
    return { candles: cs, seed: seed, ann: [LBL(3, 102.7, "小阳", "up"), LBL(4, 97.5, "吞没阴", "down"), LBL(5, 94.8, "确认阴", "down"), P(5, 96, "卖点", "stop")] };
  };
  GEN.rising_three_methods = function (seed) {
    const rng = RNG.create(seed);
    const pre = []; let p = 92;
    for (let i = 0; i < 1; i++) { p += rng.range(1.2, 2); pre.push({ o: p - 1, c: p, h: p + 0.4, l: p - 1, v: V.active }); }
    const base = pre[0].c;
    const big1 = { o: base, c: base + 6, h: base + 6.3, l: base - 0.2, v: V.hot };
    const smalls = [];
    let q = base + 6;
    for (let i = 0; i < 3; i++) { q -= rng.range(0.4, 0.9); smalls.push({ o: q + 0.5, c: q, h: q + 0.7, l: q - 0.1, v: V.quiet }); }
    const lastLow = smalls[2].c;
    const big2 = { o: lastLow, c: base + 8, h: base + 8.3, l: lastLow - 0.3, v: V.hot };
    const cs = build(seed, pre.concat([big1], smalls, [big2]));
    return { candles: cs, seed: seed, ann: [LBL(1, base + 6.5, "大阳", "up"), ZONE(2, 4, "三小回落不出新低"), LBL(5, base + 8.5, "续攻大阳", "up"), P(5, base + 8, "买点", "buy")] };
  };
  GEN.falling_three_methods = function (seed) {
    const rng = RNG.create(seed);
    const pre = []; let p = 108;
    for (let i = 0; i < 1; i++) { p -= rng.range(1.2, 2); pre.push({ o: p + 1, c: p, h: p + 1, l: p - 0.4, v: V.active }); }
    const base = pre[0].c;
    const big1 = { o: base, c: base - 6, h: base + 0.2, l: base - 6.3, v: V.hot };
    const smalls = []; let q = base - 6;
    for (let i = 0; i < 3; i++) { q += rng.range(0.4, 0.9); smalls.push({ o: q - 0.5, c: q, h: q + 0.1, l: q - 0.7, v: V.quiet }); }
    const lastHigh = smalls[2].c;
    const big2 = { o: lastHigh, c: base - 8, h: lastHigh + 0.3, l: base - 8.3, v: V.hot };
    const cs = build(seed, pre.concat([big1], smalls, [big2]));
    return { candles: cs, seed: seed, ann: [LBL(1, base - 6.5, "大阴", "down"), ZONE(2, 4, "三小反弹不出新高"), LBL(5, base - 8.5, "续跌大阴", "down"), P(5, base - 8, "卖点", "stop")] };
  };
  GEN.abandoned_baby_bull = function (seed) {
    const rng = RNG.create(seed);
    const pre = []; let p = 109;
    for (let i = 0; i < 2; i++) { p -= rng.range(1.4, 2.2); const o = p + rng.range(0.5, 1); pre.push({ o: o, c: p, h: Math.max(o, p) + 0.4, l: Math.min(o, p) - 0.4, v: V.active }); }
    pre[1].c = 104; pre[1].o = 104 + rng.range(0.5, 1); pre[1].h = Math.max(pre[1].o, 104) + 0.4; pre[1].l = Math.min(pre[1].o, 104) - 0.4;
    const cs = build(seed, pre.concat([
      { o: 104, c: 99, h: 104.2, l: 98.7, v: V.hot },
      { o: 98.4, c: 98.4, h: 98.7, l: 98.1, v: V.hot },
      { o: 101, c: 106, h: 106.3, l: 100.8, v: V.hot }
    ]));
    return { candles: cs, seed: seed, ann: [LBL(2, 99.4, "长阴", "down"), LBL(3, 98.2, "跳空十字", "up"), LBL(4, 106.5, "跳空大阳", "up"), ZONE(2, 4, "岛"), P(4, 105, "强反转买点", "buy")] };
  };
  GEN.abandoned_baby_bear = function (seed) {
    const rng = RNG.create(seed);
    const pre = []; let p = 91;
    for (let i = 0; i < 2; i++) { p += rng.range(1.4, 2.2); const o = p - rng.range(0.5, 1); pre.push({ o: o, c: p, h: Math.max(o, p) + 0.4, l: Math.min(o, p) - 0.4, v: V.active }); }
    pre[1].c = 96; pre[1].o = 96 - rng.range(0.5, 1); pre[1].h = Math.max(pre[1].o, 96) + 0.4; pre[1].l = Math.min(pre[1].o, 96) - 0.4;
    const cs = build(seed, pre.concat([
      { o: 96, c: 101, h: 101.3, l: 95.8, v: V.hot },
      { o: 101.6, c: 101.6, h: 101.9, l: 101.3, v: V.hot },
      { o: 99, c: 94, h: 99.2, l: 93.8, v: V.hot }
    ]));
    return { candles: cs, seed: seed, ann: [LBL(2, 100.6, "长阳", "up"), LBL(3, 101.8, "跳空十字", "up"), LBL(4, 93.5, "跳空大阴", "down"), ZONE(2, 4, "岛"), P(4, 95, "强反转卖点", "stop")] };
  };
  GEN.upside_gap_two_crows = function (seed) {
    const cs = threeCandle(seed, 1, { oOfs: 0, cOfs: 4 }, { oOfs: 4.8, cOfs: 3, h: 0.5, l: 0.5 }, { oOfs: 5.2, cOfs: 2.5, h: 0.5, l: 0.5 });
    return { candles: cs, seed: seed, ann: [LBL(3, 105, "长阳", "up"), LBL(4, 105.5, "跳空小阴①", "down"), LBL(5, 102, "吞没阴②", "down"), P(5, 102, "反转卖点", "stop")] };
  };

  /* ========================================================
     体系 / 指标
     ======================================================== */
  GEN.livermore_pivotal = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 96, v: V.quiet, k: 4 }, { p: 100, v: V.normal, k: 3 }, { p: 98, v: V.quiet, k: 3 }, // 整理
      { p: 104, v: V.climax, k: 2 }, { p: 110, v: V.hot, k: 3 }, { p: 116, v: V.hot, k: 3 }   // 突破关键点
    ], r, 0.22));
    return { candles: cs, seed: seed, ann: [H(101, "利弗莫尔关键点"), ZONE(0, 9, "最小阻力线待选"), P(10, 101, "突破关键点=顺势买", "buy"), LBL(11, 113, "快速验证=有效", "up")] };
  };

  GEN.wyckoff_accumulation = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 110, v: V.normal, k: 2 }, { p: 92, v: V.hot, k: 3 },   // PS/SC
      { p: 100, v: V.active, k: 3 },                                // AR
      { p: 95, v: V.quiet, k: 3 }, { p: 89, v: V.climax, k: 2 },   // ST/Spring(击穿)
      { p: 96, v: V.active, k: 2 }, { p: 99, v: V.normal, k: 3 },  // 测试/LPS
      { p: 110, v: V.climax, k: 4 }                                  // SOS/_markup
    ], r, 0.25));
    return { candles: cs, seed: seed, ann: [ZONE(0, 4, "抛售高潮SC"), ZONE(8, 9, "Spring弹簧"), H(95, "支撑"), LBL(9, 88, "假跌破吸筹", "down"), P(14, 100, "LPS加仓点", "buy"), LBL(17, 112, "主升", "up")] };
  };

  GEN.wyckoff_distribution = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 90, v: V.normal, k: 2 }, { p: 108, v: V.hot, k: 3 },   // BC
      { p: 100, v: V.active, k: 3 },                                // AR
      { p: 105, v: V.quiet, k: 3 }, { p: 111, v: V.climax, k: 2 },// UT 上冲
      { p: 104, v: V.active, k: 2 }, { p: 101, v: V.normal, k: 3 },
      { p: 90, v: V.climax, k: 4 }                                  // LPS/派发完成
    ], r, 0.25));
    return { candles: cs, seed: seed, ann: [ZONE(0, 4, "购买高潮BC"), ZONE(8, 9, "UT上冲"), H(105, "阻力"), LBL(9, 112, "假突破派发", "up"), P(14, 100, "LPS做空点", "stop"), LBL(17, 88, "主跌", "down")] };
  };

  GEN.elliott_wave = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 92, v: V.normal, k: 2 }, { p: 100, v: V.hot, k: 2 },   // 1
      { p: 96, v: V.active, k: 2 },                                // 2
      { p: 110, v: V.climax, k: 3 }, { p: 104, v: V.hot, k: 2 },  // 3(最长)
      { p: 112, v: V.climax, k: 2 },                               // 5顶
      { p: 100, v: V.hot, k: 3 }, { p: 106, v: V.active, k: 2 },  // A
      { p: 95, v: V.hot, k: 3 }                                    // C
    ], r, 0.25));
    return { candles: cs, seed: seed, ann: [LBL(2, 101, "1", "up"), LBL(4, 95, "2", "down"), LBL(7, 111, "3", "up"), LBL(9, 113, "5", "up"), LINE(11, 112, 14, 100, "A"), LINE(16, 106, 19, 95, "C")] };
  };

  GEN.chanlun = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 92, v: V.normal, k: 2 }, { p: 104, v: V.hot, k: 3 }, { p: 98, v: V.active, k: 3 },
      { p: 106, v: V.hot, k: 3 }, { p: 100, v: V.active, k: 3 },  // 第一段趋势+进入中枢
      { p: 112, v: V.climax, k: 3 }, { p: 114, v: V.climax, k: 2 }, { p: 110, v: V.hot, k: 2 }, // 离开+顶背驰
      { p: 104, v: V.hot, k: 3 }
    ], r, 0.2));
    return {
      candles: cs, seed: seed,
      ann: [
        ZONE(5, 10, "中枢(重叠区间)", 98, 106),
        P(10, 106, "一买:中枢上沿", "buy"), P(12, 114, "二买:回踩不进中枢", "buy"),
        LBL(13, 116, "顶背驰", "up"), P(14, 112, "一卖:背驰", "stop")
      ]
    };
  };

  GEN.granville_ma = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 92, v: V.normal, k: 3 }, { p: 96, v: V.active, k: 3 }, { p: 104, v: V.hot, k: 3 }, // 跌→穿MA(1)
      { p: 100, v: V.active, k: 2 }, { p: 108, v: V.hot, k: 3 }, { p: 112, v: V.climax, k: 3 }, // 远离MA(2)
      { p: 106, v: V.hot, k: 3 }, { p: 116, v: V.climax, k: 3 }                                  // 回靠再上(4)
    ], r, 0.22));
    const ma200 = ma(cs, 8);
    return {
      candles: cs, seed: seed, overlays: [OL(ma200, "#4a3aa7", false, "MA200")],
      ann: [LBL(5, 97, "①金叉突破", "up"), LBL(9, 110, "②远离乖离", "up"), LBL(12, 105, "③回踩不破", "up"), LBL(17, 113, "④再加速", "up")]
    };
  };

  GEN.ma_bullish_alignment = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 92, v: V.normal, k: 3 }, { p: 100, v: V.active, k: 4 }, { p: 106, v: V.hot, k: 4 }, { p: 112, v: V.climax, k: 4 }
    ], r, 0.18));
    const m5 = ma(cs, 5), m10 = ma(cs, 10), m20 = ma(cs, 20);
    return {
      candles: cs, seed: seed,
      overlays: [OL(m5, "#e34948", false, "MA5"), OL(m10, "#eda100", false, "MA10"), OL(m20, "#2a78d6", false, "MA20")],
      ann: [LBL(10, 113, "价>短>中>长", "up"), P(11, 106, "回踩短均线=买点", "buy")]
    };
  };

  GEN.ma_bearish_alignment = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 112, v: V.normal, k: 3 }, { p: 104, v: V.active, k: 4 }, { p: 98, v: V.hot, k: 4 }, { p: 92, v: V.climax, k: 4 }
    ], r, 0.18));
    const m5 = ma(cs, 5), m10 = ma(cs, 10), m20 = ma(cs, 20);
    return {
      candles: cs, seed: seed,
      overlays: [OL(m5, "#008300", false, "MA5"), OL(m10, "#eda100", false, "MA10"), OL(m20, "#2a78d6", false, "MA20")],
      ann: [LBL(10, 91, "价<短<中<长", "down"), P(11, 98, "反抽短均线=卖点", "stop")]
    };
  };

  GEN.macd_golden_cross = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 100, v: V.normal, k: 3 }, { p: 94, v: V.active, k: 3 }, { p: 96, v: V.normal, k: 3 },
      { p: 100, v: V.active, k: 3 }, { p: 106, v: V.hot, k: 3 }, { p: 110, v: V.climax, k: 3 }
    ], r, 0.2));
    const f = ma(cs, 5), s = ma(cs, 12);
    const crossI = 8;
    return {
      candles: cs, seed: seed,
      overlays: [OL(f, "#e34948", false, "快线"), OL(s, "#2a78d6", false, "慢线")],
      ann: [LBL(crossI, 97, "金叉", "up"), P(crossI, 96, "金叉买点", "buy"), LBL(14, 111, "金叉后红柱放大", "up")]
    };
  };

  GEN.macd_death_cross = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 100, v: V.normal, k: 3 }, { p: 106, v: V.active, k: 3 }, { p: 104, v: V.normal, k: 3 },
      { p: 100, v: V.active, k: 3 }, { p: 94, v: V.hot, k: 3 }, { p: 90, v: V.climax, k: 3 }
    ], r, 0.2));
    const f = ma(cs, 5), s = ma(cs, 12);
    return {
      candles: cs, seed: seed,
      overlays: [OL(f, "#008300", false, "快线"), OL(s, "#2a78d6", false, "慢线")],
      ann: [LBL(8, 103, "死叉", "down"), P(8, 104, "死叉卖点", "stop"), LBL(14, 89, "绿柱放大", "down")]
    };
  };

  GEN.bollinger_squeeze = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 100, v: V.normal, k: 2 }, { p: 101, v: V.dry, k: 3 }, { p: 100, v: V.dry, k: 3 }, { p: 99, v: V.dry, k: 2 }, // 收口
      { p: 108, v: V.hot, k: 2 }, { p: 112, v: V.climax, k: 3 }, { p: 116, v: V.climax, k: 3 } // 开口突破
    ], r, 0.18));
    const m = ma(cs, 10);
    const upper = m.map(p => ({ i: p.i, p: p.p + 2.5 })), lower = m.map(p => ({ i: p.i, p: p.p - 2.5 }));
    const upperWide = m.map(p => ({ i: p.i, p: p.p + 6 })), lowerWide = m.map(p => ({ i: p.i, p: p.p - 6 }));
    // 收口期窄、突破后宽：分两段拼接
    const up = [], lo = [];
    m.forEach(p => { const f = p.i < 9 ? 2.5 : 6; up.push({ i: p.i, p: p.p + f }); lo.push({ i: p.i, p: p.p - f }); });
    return {
      candles: cs, seed: seed,
      overlays: [OL(m, "#4a3aa7", true, "中轨"), BAND(up, lo, "#2a78d6", "上下轨")],
      ann: [ZONE(2, 8, "收口(波动收敛)"), P(9, 101, "开口突破=买点", "buy"), LBL(13, 117, "扩张追趋势", "up")]
    };
  };

  GEN.donchian_turtle = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 100, v: V.normal, k: 2 }, { p: 96, v: V.active, k: 2 }, { p: 104, v: V.hot, k: 2 }, { p: 98, v: V.active, k: 2 },
      { p: 102, v: V.normal, k: 2 }, { p: 96, v: V.active, k: 2 }, { p: 100, v: V.quiet, k: 2 }, { p: 98, v: V.quiet, k: 2 },
      { p: 106, v: V.hot, k: 2 }, { p: 110, v: V.hot, k: 2 }, { p: 104, v: V.active, k: 2 }, { p: 108, v: V.active, k: 2 }
    ], r, 0.2));
    // 20日高低通道
    const up = [], lo = [];
    for (let i = 0; i < cs.length; i++) {
      const w = Math.min(8, i + 1);
      let hi = -1e9, lo0 = 1e9;
      for (let j = Math.max(0, i - w + 1); j <= i; j++) { hi = Math.max(hi, cs[j].h); lo0 = Math.min(lo0, cs[j].l); }
      up.push({ i: i, p: hi }); lo.push({ i: i, p: lo0 });
    }
    const hi20 = up[up.length - 5].p;
    return {
      candles: cs, seed: seed,
      overlays: [BAND(up, lo, "#2a78d6", "20日通道")],
      ann: [H(hi20, "20日新高"), P(8, hi20, "突破20日高=系统买点", "buy"), LBL(10, 111, "持有到跌破10日低", "up")]
    };
  };

  GEN.gann_angles = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 90, v: V.normal, k: 2 }, { p: 96, v: V.active, k: 2 }, { p: 100, v: V.hot, k: 2 },
      { p: 106, v: V.hot, k: 2 }, { p: 104, v: V.active, k: 2 }, { p: 110, v: V.hot, k: 2 }
    ], r, 0.25));
    return {
      candles: cs, seed: seed,
      ann: [
        LINE(0, 90, 9, 108, "1×1 主角度(45°)"),
        LINE(0, 90, 9, 117, "2×1"),
        LINE(0, 90, 9, 102, "1×2"),
        P(5, 100, "回踩1×1=买点", "buy")
      ]
    };
  };

  GEN.obv_divergence = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 100, v: V.normal, k: 2 }, { p: 108, v: V.hot, k: 3 }, { p: 104, v: V.active, k: 2 },
      { p: 112, v: V.normal, k: 3 }, { p: 116, v: V.quiet, k: 3 }  // 价创新高但量递减
    ], r, 0.22));
    // OBV 叠加(上升放缓)
    const obv = [];
    let cum = 0; const base = cs[0].c;
    cs.forEach((c, i) => { cum += (c.c - (i ? cs[i - 1].c : base)) * c.v / 10; obv.push({ i: i, p: base + cum }); });
    return {
      candles: cs, seed: seed,
      overlays: [OL(obv, "#4a3aa7", true, "OBV")],
      ann: [LBL(7, 113, "价创新高", "up"), LBL(11, 117, "量能不配合", "up"), P(12, 116, "顶背离=警示", "stop")]
    };
  };

  GEN.volume_price_spring = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 100, v: V.normal, k: 2 }, { p: 96, v: V.active, k: 2 }, { p: 90, v: V.climax, k: 2 }, // 放量下杀(洗)
      { p: 96, v: V.active, k: 2 }, { p: 104, v: V.hot, k: 2 }, { p: 110, v: V.climax, k: 3 }   // 量价齐升
    ], r, 0.25));
    return { candles: cs, seed: seed, ann: [ZONE(2, 3, "放量洗盘"), LBL(3, 89, "恐慌底", "down"), P(4, 90, "缩量企稳=买点", "buy"), LBL(7, 111, "量价齐升", "up")] };
  };

  GEN.rounding_breakout = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 100, v: V.quiet, k: 4 }, { p: 99, v: V.dry, k: 4 }, { p: 100, v: V.dry, k: 4 }, { p: 99, v: V.dry, k: 4 }, // 潜伏底
      { p: 104, v: V.hot, k: 2 }, { p: 110, v: V.climax, k: 3 }, { p: 116, v: V.climax, k: 3 } // 放量突破
    ], r, 0.15));
    return { candles: cs, seed: seed, ann: [ZONE(0, 15, "潜伏底(长横+缩量)"), H(101, "平台颈线"), P(16, 101, "放量突破=买点", "buy")] };
  };

  GEN.wyckoff_no_demand = function (seed) {
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 100, v: V.normal, k: 2 }, { p: 108, v: V.climax, k: 2 }, // 上冲到阻力
      { p: 110, v: V.quiet, k: 3 }, { p: 109, v: V.dry, k: 3 },     // 缩量上推(无需求)
      { p: 102, v: V.hot, k: 3 }, { p: 96, v: V.climax, k: 3 }       // 失败回落
    ], r, 0.22));
    return { candles: cs, seed: seed, ann: [H(110, "阻力"), LBL(6, 110.5, "缩量假突破", "up"), ZONE(4, 8, "无需求上推"), P(9, 108, "跌破=做空", "stop")] };
  };

  GEN.trap_double_top_fail = function (seed) {
    // 双顶但未跌破颈线即反弹(假双顶) — 教学：未确认前不是双顶
    const r = RNG.create(seed);
    const cs = build(seed, interp([
      { p: 92, v: V.normal, k: 2 }, { p: 104, v: V.hot, k: 2 }, { p: 98, v: V.active, k: 3 },
      { p: 104, v: V.hot, k: 2 }, { p: 100, v: V.active, k: 2 }, { p: 104, v: V.hot, k: 2 }, { p: 110, v: V.climax, k: 3 }
    ], r, 0.25));
    return { candles: cs, seed: seed, ann: [LBL(2, 105.5, "疑似A峰", "up"), LBL(6, 105.5, "疑似B峰", "up"), H(98, "颈线(未跌破)"), LBL(11, 111, "突破上行=假双顶", "up")] };
  };

  /* ---------- 导出 ---------- */
  global.CANDLE_GEN = GEN;
})(window);
