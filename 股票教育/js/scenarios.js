/* ============================================================
   scenarios.js — 模拟投资题库（85 模型 × 4 变体 = 340 题）
   每题 = { id, modelId, modelName, cat, variant, candles(全图),
           k(决策点, 0基, decide 阶段显示 [0..k]),
           correct('buy'|'sell'|'hold'), bias, rationale, trap }
   变体：
     A 标准·成功 —— 正解=方向(buy/sell)，后续沿该方向延续
     B 失败·陷阱 —— 正解=不交易，后续反向(假突破/形态失败)
     C 过早·未确认 —— 正解=不交易，决策点在信号前一根
     D 异种·成功 —— 同 A 但另一随机种子
   ⚠️ 行情由模型化生成，非真实个股历史K线；用于练习"看图决策"。
   ============================================================ */
(function (global) {
  "use strict";

  // 续走 M 根：dir +1=涨/-1=跌/0=横；success=false 则反向(陷阱)
  function continueCandles(lastClose, dir, seed, bars, success) {
    const eff = success ? dir : -dir;
    const rng = RNG.create(seed);
    const out = [];
    let p = lastClose;
    const drift = Math.max(0.5, lastClose * 0.012); // 每根约1.2%漂移
    for (let i = 0; i < bars; i++) {
      let close = p + eff * drift * (0.5 + 0.9 * (i + 1) / bars) + rng.gauss(0, Math.max(0.2, lastClose * 0.006));
      if (i === Math.floor(bars * 0.4)) close -= eff * drift * 1.6; // 中途回踩/反弹
      const o = p;
      const top = Math.max(o, close), bot = Math.min(o, close);
      out.push({
        o: o, c: close,
        h: top + rng.range(0.18, 0.55), l: bot - rng.range(0.18, 0.55),
        v: Math.max(20, 55 + rng.range(-10, 35) + (i > bars - 3 ? 30 : 0))
      });
      p = close;
    }
    return out;
  }

  function genScenario(modelId, variant) {
    const m = global.STOCK.byId(modelId);
    if (!m || !global.CANDLE_GEN[m.gen]) return null;
    const baseSeed = variant === "D" ? modelId + "-alt2" : modelId;
    const base = global.CANDLE_GEN[m.gen](baseSeed);
    let candles = (base.candles || []).slice();
    const ann = base.ann || [];

    // 找信号点与方向
    let sig = ann.find(a => a.t === "point" && a.kind === "buy");
    let bias = "hold", sigK = candles.length - 1;
    if (sig) { bias = "buy"; sigK = sig.i; }
    else { sig = ann.find(a => a.t === "point" && a.kind === "stop"); if (sig) { bias = "sell"; sigK = sig.i; } }
    // 信号点钳制在蜡烛范围内（个别生成器的标注 i 可能等于长度）
    sigK = Math.max(0, Math.min(sigK, candles.length - 1));
    const dirNum = bias === "buy" ? 1 : (bias === "sell" ? -1 : 0);
    const lastClose = candles[sigK] ? candles[sigK].c : candles[candles.length - 1].c;
    const M = 10;
    let correct, k, trap = false, rationale, variantLabel;

    if (bias === "hold") {
      // 预警/待确认形态：正解恒为"不交易"
      correct = "hold"; k = sigK;
      if (variant === "B") {
        candles = candles.concat(continueCandles(lastClose, 1, modelId + "-B", M, false));
        trap = true; variantLabel = "陷阱·贸然操作会亏";
        rationale = "这是预警信号（如十字星、孕线），方向未定、单独不足以交易——后续走势反复，贸然操作易两面挨耳光，正解为<b>不交易、等次日确认</b>。";
      } else if (variant === "C") {
        k = Math.max(0, sigK - 1); variantLabel = "过早·形态未完成";
        rationale = "此刻形态尚未完成/确认，正解为<b>不交易</b>，等信号最终确立再动手。";
      } else {
        const seed = (variant === "D" ? modelId + "-alt2-cont" : modelId + "-A");
        candles = candles.concat(continueCandles(lastClose, 0, seed, M, true));
        variantLabel = "标准·待确认";
        rationale = "预警信号需次日K线确认方向，此刻正解为<b>不交易</b>。";
      }
    } else {
      // 方向性形态
      if (variant === "A" || variant === "D") {
        const seed = (variant === "D" ? modelId + "-alt2-cont" : modelId + "-A");
        candles = candles.concat(continueCandles(candles[sigK].c, dirNum, seed, M, true));
        correct = bias; k = sigK; variantLabel = "标准·成功";
        rationale = "<b>" + m.name + "</b>：" + m.one + "。正解为<b>" + (bias === "buy" ? "买入" : "卖出") + "</b>（" + (bias === "buy" ? m.buy : m.stop) + "）。";
      } else if (variant === "B") {
        candles = candles.slice(0, sigK + 1).concat(continueCandles(candles[sigK].c, dirNum, modelId + "-B", M, false));
        correct = "hold"; k = sigK; trap = true; variantLabel = "陷阱·失败/假突破";
        rationale = "<b>陷阱变体</b>：" + m.name + " 形态看似成立，但随后<b>反向失败</b>（假突破/形态未确认）。未带量确认贸然操作会亏损，正解为<b>不交易</b>或等确认——这题教你「形态会失败，止损与确认比形态本身更重要」。";
      } else { // C: 过早
        candles = candles.concat(continueCandles(candles[sigK].c, dirNum, modelId + "-C", M, true));
        correct = "hold"; k = Math.max(0, sigK - 1); variantLabel = "过早·信号未确认";
        rationale = "决策点在<b>信号确认前一根</b>，形态尚未最终成立。若此刻进场=抢跑，正解为<b>不交易、等次日确认</b>再动手（耐心也是交易能力）。";
      }
    }
    return {
      id: modelId + "-" + variant, modelId: modelId, modelName: m.name, cat: m.cat,
      variant: variant, variantLabel: variantLabel,
      candles: candles, k: k, correct: correct, bias: bias,
      rationale: rationale, trap: trap
    };
  }

  // 预生成 340 题
  const VARIANTS = ["A", "B", "C", "D"];
  const ALL = [];
  global.STOCK.MODELS.forEach(function (m) {
    VARIANTS.forEach(function (v) {
      const s = genScenario(m.id, v);
      if (s) ALL.push(s);
    });
  });

  // Fisher–Yates 洗牌（无 Math.random 的种子化版本也行，这里用 Math.random 做每局随机）
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  global.SCENARIOS = {
    all: ALL,
    count: ALL.length,
    deck: function () { return shuffle(ALL.slice()); }
  };
})(window);
