/* ============================================================
   game.js — 模拟投资：看图决策练习
   流程：decide(显示 setup[0..k] + 买/卖/不交易) → revealed(揭全图+正解+计分) → 下一题
   无尽模式：题库刷完自动洗牌续杯；"结束并查看战绩"随时可点。
   行情由模型化生成，非真实个股。
   ============================================================ */
(function (global) {
  "use strict";

  const ACT_LABEL = { buy: "买入", sell: "卖出", hold: "不交易" };

  const state = {
    deck: [], idx: 0,
    phase: "idle", // idle | decide | revealed | ended
    cur: null,
    score: { answered: 0, correct: 0, wrong: 0, missed: 0, points: 0 },
    history: [], // {cat, pick, correct, pts, trap}
    wrongByCat: {},
    round: 0
  };

  function $(id) { return document.getElementById(id); }

  function resetScore() {
    state.score = { answered: 0, correct: 0, wrong: 0, missed: 0, points: 0 };
    state.history = [];
    state.wrongByCat = {};
    state.round = 0;
  }

  function activate() {
    const view = $("practice-view");
    if (!view) return;
    view.hidden = false;
    $("catalog-view").hidden = true;
    $("detail-view").hidden = true;
    if (state.phase === "idle" || state.phase === "ended") start();
    window.scrollTo(0, 0);
  }
  function deactivate() { /* 离开时保留进度，不重置 */ }

  function start() {
    resetScore();
    state.deck = global.SCENARIOS.deck();
    state.idx = 0;
    $("prac-end").hidden = true;
    $("prac-stage").hidden = false;
    nextQuestion();
  }

  function nextQuestion() {
    if (state.idx >= state.deck.length) {
      // 题库刷完 → 自动洗牌续杯（无尽）
      state.deck = state.deck.concat(global.SCENARIOS.deck());
      flashNotice("已刷完一轮，题库已重新洗牌，继续！");
    }
    state.cur = state.deck[state.idx];
    state.phase = "decide";
    state.round++;
    renderDecide();
    updateScoreBadge();
  }

  function renderDecide() {
    const c = state.cur;
    const setup = c.candles.slice(0, c.k + 1);
    $("prac-stage").innerHTML =
      `<div class="chart-wrap"><div class="cw-head"><h3>观察这段走势 · 最后一根即"此刻"</h3></div><div id="prac-chart"></div></div>` +
      `<div class="prac-prompt">第 <b>${state.round}</b> 题 / 共 ${global.SCENARIOS.count} 题库随机出题 · 仅凭已显示的K线，<b>此刻你会？</b></div>` +
      `<div class="prac-actions">` +
        `<button class="act act-buy" data-act="buy"><span class="act-ico">▲</span>买入<span class="act-hint">看多</span></button>` +
        `<button class="act act-sell" data-act="sell"><span class="act-ico">▼</span>卖出<span class="act-hint">看空</span></button>` +
        `<button class="act act-hold" data-act="hold"><span class="act-ico">—</span>不交易<span class="act-hint">观望</span></button>` +
      `</div>` +
      `<button class="prac-skip" id="prac-skip">不确定？跳过这题 →</button>`;
    const el = $("prac-chart");
    if (el) global.Chart.render(el, { candles: setup, ann: [{ t: "zone", i0: Math.max(0, c.k), i1: c.k, label: "此刻" }], overlays: [] }, { interactive: false, title: "决策走势" });
  }

  function pick(action) {
    if (state.phase !== "decide") return;
    const c = state.cur;
    const correct = c.correct;
    let pts, verdict, cls;
    if (action === correct) { pts = 10; verdict = "✓ 判断正确"; cls = "ok"; state.score.correct++; }
    else if (action === "hold" && correct !== "hold") { pts = 0; verdict = "○ 未操作 · 错过机会但不亏"; cls = "miss"; state.score.missed++; }
    else if (action !== "hold" && correct === "hold") { pts = -5; verdict = "✕ 贸然操作 · 掉进陷阱/形态未确认"; cls = "bad"; state.score.wrong++; }
    else { pts = -5; verdict = "✕ 方向相反"; cls = "bad"; state.score.wrong++; }
    state.score.answered++;
    state.score.points += pts;
    state.history.push({ cat: c.cat, pick: action, correct: correct, pts: pts, trap: c.trap, modelName: c.modelName });
    if (pts < 0) state.wrongByCat[c.cat] = (state.wrongByCat[c.cat] || 0) + 1;
    state.phase = "revealed";
    renderReveal(action, pts, verdict, cls);
    updateScoreBadge();
  }

  function renderReveal(action, pts, verdict, cls) {
    const c = state.cur;
    const last = c.candles.length - 1;
    const ann = [];
    if (c.k + 1 <= last) ann.push({ t: "zone", i0: c.k + 1, i1: last, label: "后续走势" });
    ann.push({ t: "point", i: c.k, p: c.candles[c.k].c, label: "决策点", kind: "buy" });
    $("prac-stage").innerHTML =
      `<div class="chart-wrap"><div class="cw-head"><h3>揭晓 · 完整走势</h3>` +
        `<div class="legend"><i style="--cc:var(--ann-zone)">后续走势</i><i style="--cc:var(--ann)">决策点</i></div></div>` +
        `<div id="prac-chart"></div></div>` +
      `<div class="prac-result ${cls}">` +
        `<div class="pr-verdict">${verdict}</div>` +
        `<div class="pr-row">你选：<b>${ACT_LABEL[action]}</b> · 正解：<b>${ACT_LABEL[c.correct]}</b> · 本题 <span class="${pts >= 0 ? "pos" : "neg"}">${pts >= 0 ? "+" : ""}${pts}</span> 分 · 累计 <b>${state.score.points}</b></div>` +
        `<div class="pr-model">${c.trap ? "⚠️ " : ""}形态：<b>${c.modelName}</b> · ${c.variantLabel}${c.cat ? "" : ""}</div>` +
        `<div class="pr-rationale">${c.rationale}</div>` +
        `<div class="pr-actions">` +
          `<button class="act-next" id="prac-next">下一题 →</button>` +
          `<button class="act-end" id="prac-end-btn">结束并查看战绩</button>` +
        `</div>` +
      `</div>`;
    const el = $("prac-chart");
    if (el) global.Chart.render(el, { candles: c.candles, ann: ann, overlays: [] }, { interactive: true, title: c.modelName + " 揭晓" });
  }

  function endGame() {
    state.phase = "ended";
    $("prac-stage").hidden = true;
    const s = state.score;
    const rate = s.answered ? Math.round(s.correct / s.answered * 100) : 0;
    // 易错分类 top3
    const cats = Object.entries(state.wrongByCat).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const catLabel = (k) => (global.STOCK.CATEGORIES.find(c => c.key === k) || {}).label || k;
    const catsHtml = cats.length
      ? `<div class="end-cats"><h3>易错分类（建议回去复习）</h3><div class="related">${cats.map(([k, n]) => `<a href="#/cat/${k}" data-cat="${k}">${catLabel(k)} · 错 ${n}</a>`).join("")}</div></div>`
      : `<div class="end-cats"><h3>分类无误</h3><p>表现稳定，继续保持！</p></div>`;
    $("prac-end").hidden = false;
    $("prac-end").innerHTML =
      `<h2>本次模拟投资战绩</h2>` +
      `<div class="end-stats">` +
        `<div class="es"><b>${s.answered}</b><small>答题</small></div>` +
        `<div class="es"><b>${s.correct}</b><small>正确</small></div>` +
        `<div class="es"><b>${rate}%</b><small>胜率</small></div>` +
        `<div class="es"><b>${s.points}</b><small>积分</small></div>` +
      `</div>` +
      `<div class="end-break"><span>正确 ${s.correct}</span><span>错过(未亏) ${s.missed}</span><span>失误(亏) ${s.wrong}</span></div>` +
      catsHtml +
      `<div class="pr-actions"><button class="act-next" id="prac-restart">再来一轮</button>` +
      `<button class="act-end" id="prac-back-home">返回图书馆</button></div>` +
      `<p class="prac-disclaimer">⚠️ 教学模拟行情，非真实个股；练习的是"看图决策"，不代表实盘胜率。</p>`;
  }

  function updateScoreBadge() {
    const s = state.score;
    if ($("ps-round")) $("ps-round").textContent = state.round;
    if ($("ps-total")) $("ps-total").textContent = s.answered;
    if ($("ps-correct")) $("ps-correct").textContent = s.correct;
    if ($("ps-points")) $("ps-points").textContent = s.points;
    const rate = s.answered ? Math.round(s.correct / s.answered * 100) : 0;
    if ($("ps-rate")) $("ps-rate").textContent = s.answered ? `· 胜率 ${rate}%` : "";
  }

  function flashNotice(msg) {
    const n = $("prac-notice");
    if (!n) return;
    n.textContent = msg;
    n.hidden = false;
    setTimeout(() => { n.hidden = true; }, 2600);
  }

  // 事件代理
  function bind() {
    const stage = $("prac-stage");
    if (!stage) return;
    stage.addEventListener("click", function (e) {
      const act = e.target.closest("[data-act]");
      if (act && state.phase === "decide") { pick(act.getAttribute("data-act")); return; }
      if (e.target.closest("#prac-skip") && state.phase === "decide") { state.idx++; nextQuestion(); return; }
      if (e.target.closest("#prac-next") && state.phase === "revealed") { state.idx++; nextQuestion(); return; }
      if (e.target.closest("#prac-end-btn")) { endGame(); return; }
    });
    const end = $("prac-end");
    if (end) end.addEventListener("click", function (e) {
      if (e.target.closest("#prac-restart")) { start(); return; }
      if (e.target.closest("#prac-back-home")) { location.hash = "#/"; return; }
      const cat = e.target.closest("[data-cat]");
      if (cat) { /* 跳到分类：用图书馆目录并筛选 */ location.hash = "#/"; }
    });
    const home = $("prac-home");
    if (home) home.addEventListener("click", () => { location.hash = "#/"; });
  }

  global.Practice = {
    init: function () { bind(); state.phase = "idle"; },
    activate: activate,
    deactivate: deactivate
  };
})(window);
