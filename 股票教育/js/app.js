/* ============================================================
   app.js — 目录/详情渲染、搜索、分类筛选、hash 路由、深浅色
   ============================================================ */
(function () {
  "use strict";

  const { CATEGORIES, MODELS, byId } = window.STOCK;
  const GEN = window.CANDLE_GEN;

  // 缓存：每个模型的 chart 数据（确定性，同一 id 永远一样）
  const chartCache = {};
  function chartOf(model) {
    if (chartCache[model.id]) return chartCache[model.id];
    const fn = GEN[model.gen];
    if (!fn) return null;
    const cm = fn(model.id); // 用 id 作 seed
    chartCache[model.id] = cm;
    return cm;
  }

  /* ---------- 主题 ---------- */
  function initTheme() {
    const saved = localStorage.getItem("spl-theme");
    const sysDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (sysDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("theme-toggle");
    btn.addEventListener("click", function () {
      const cur = document.documentElement.getAttribute("data-theme");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("spl-theme", next);
      // 重新渲染当前视图的图表(颜色变量已变，需重画 band/overlay)
      rerender();
    });
  }

  /* ---------- 状态 ---------- */
  let state = { q: "", cat: "all" };

  /* ---------- 分类筛选条 ---------- */
  function renderFilters() {
    const bar = document.getElementById("filter-bar");
    const allCat = { key: "all", label: "全部", color: "var(--text-2)",
      hint: "共 85 个模型。可按上方分类查看，也可在搜索框输入名称（如：杯柄、锤子线、缠论、MACD）。" };
    const cats = [allCat].concat(CATEGORIES);
    bar.innerHTML = "";
    cats.forEach(c => {
      const b = document.createElement("button");
      b.className = "chip" + (state.cat === c.key ? " active" : "");
      b.innerHTML = `<span class="dot" style="--c:${c.color}"></span>${c.label}`;
      b.title = c.hint || "";
      b.setAttribute("aria-label", c.label + " 分类");
      b.addEventListener("click", () => { state.cat = c.key; renderFilters(); renderCatalog(); });
      bar.appendChild(b);
    });
    // 选中分类的解释（手机无悬停时也能看到）
    const active = cats.find(c => c.key === state.cat) || allCat;
    const hint = document.getElementById("filter-hint");
    if (hint) hint.innerHTML = active.key === "all"
      ? `共 <b>${MODELS.length}</b> 个模型。点上面任一分类查看，或在搜索框输入名称。`
      : `当前：<b>${active.label}</b> · ${active.hint}`;
  }

  /* ---------- 统计 ---------- */
  function renderStats() {
    const el = document.getElementById("stats");
    const counts = {};
    MODELS.forEach(m => counts[m.cat] = (counts[m.cat] || 0) + 1);
    const catLabel = k => (CATEGORIES.find(c => c.key === k) || {}).label || k;
    el.innerHTML = `<div class="stat"><b>${MODELS.length}</b>个模型</div>` +
      Object.keys(counts).map(k => `<div class="stat"><b>${counts[k]}</b>${catLabel(k)}</div>`).join("");
    document.getElementById("model-count").textContent = MODELS.length;
  }

  /* ---------- 目录卡片 ---------- */
  function renderCatalog() {
    const grid = document.getElementById("card-grid");
    const empty = document.getElementById("empty-state");
    const q = state.q.trim().toLowerCase();
    const list = MODELS.filter(m => {
      if (state.cat !== "all" && m.cat !== state.cat) return false;
      if (!q) return true;
      return (m.name + " " + (m.alias || "") + " " + m.one + " " + (m.gen || "")).toLowerCase().indexOf(q) >= 0;
    });
    grid.innerHTML = "";
    if (!list.length) { empty.hidden = false; return; }
    empty.hidden = true;
    list.forEach((m, i) => {
      const cat = CATEGORIES.find(c => c.key === m.cat) || {};
      const idx = MODELS.indexOf(m) + 1;
      const card = document.createElement("a");
      card.className = "card";
      card.href = "#/model/" + m.id;
      card.innerHTML =
        `<div class="card-chart" id="cc-${m.id}"></div>` +
        `<div class="card-body">` +
          `<h3 class="card-title"><span class="idx">No.${String(idx).padStart(2, "0")}</span>${m.name}</h3>` +
          `<p class="card-desc">${m.one}</p>` +
          `<div class="card-meta"><span class="tag" style="--c:${cat.color}">${cat.label}</span>` +
          `<span class="card-link">查看详解 →</span></div>` +
        `</div>`;
      grid.appendChild(card);
    });
    // 渲染缩略图(在 DOM 插入后)
    list.forEach(m => {
      const el = document.getElementById("cc-" + m.id);
      if (el) Chart.render(el, chartOf(m), { compact: true, title: m.name });
    });
  }

  /* ---------- 教学章节生成器（通用框架，按模型填充） ---------- */
  // 模型上下文：偏多/偏空/待确认 + 正确位置 + 止损位提示 + 易混淆提示
  function modelContext(model, bt) {
    const c = model.cat;
    const long = bt && bt.dir > 0, short = bt && bt.dir < 0;
    let bias, pos, stopHint, confuseHint, trendPos;
    if (c === "reversal") {
      if (long) { bias = "偏多·看涨"; pos = "大跌后的低位、恐慌见底处"; trendPos = "一段明显下跌之后"; stopHint = "形态最低点（头部/双底低点）下方一点"; confuseHint = "未突破颈线/未确认前不要左侧抄底——可能是假底（如假双底变真跌破）。"; }
      else { bias = "偏空·看跌"; pos = "大涨后的高位、放量滞涨处"; trendPos = "一段明显上涨之后"; stopHint = "形态最高点（头部/双顶高点）上方一点"; confuseHint = "未跌破颈线前不要左侧做空——可能是假双顶（详见'案例回测'旁的'假双顶'模型）。"; }
    } else if (c === "continuation") {
      bias = short ? "偏空·顺势做空" : "偏多·顺势做多";
      pos = short ? "主跌途中休整区" : "主升途中休整区";
      trendPos = short ? "已有下跌趋势的中途" : "已有上涨趋势的中途";
      stopHint = short ? "旗面/箱体上沿上方" : "旗面/箱体下沿下方";
      confuseHint = "旗形 vs 楔形：旗面倾斜方向与旗杆<b>相反</b>为旗形、<b>收敛</b>为楔形，两者突破方向常相反，别搞混。";
    } else if (c === "single" || c === "two" || c === "three") {
      if (long) { bias = "偏多·看涨"; pos = "下跌末段/底部"; trendPos = "一段下跌之后"; stopHint = "该组合最低点下方"; confuseHint = "同形不同位、含义相反：锤子线=底、上吊线=顶；务必先看'它在涨势还是跌势中出现'。"; }
      else if (short) { bias = "偏空·看跌"; pos = "上涨末段/顶部"; trendPos = "一段上涨之后"; stopHint = "该组合最高点上方"; confuseHint = "同形不同位、含义相反：如倒锤子=底、流星=顶，区分只看'出现位置'。"; }
      else { bias = "待方向确认"; pos = "转折临界点"; trendPos = "一段趋势之后"; stopHint = "组合影线外侧"; confuseHint = "十字星/孕线本身<b>不代表方向</b>，需次日K线确认，勿提前重仓。"; }
    } else if (c === "gap") {
      bias = short ? "偏空·顺势" : "偏多·顺势";
      pos = "趋势启动/中段/末段（视缺口类型）"; trendPos = "趋势的不同阶段";
      stopHint = "缺口外沿（被回补即失效）";
      confuseHint = "突破缺口<b>不回补</b>=真突破；衰竭缺口<b>很快回补</b>=反转。'回不回补'是区分关键。";
    } else {
      bias = short ? "体系做空" : "体系做多";
      pos = "体系定义的信号触发点"; trendPos = "体系规则触发时";
      stopHint = "体系规则的反向退出位";
      confuseHint = "体系类<b>重规则、轻主观</b>：信号触发即执行、失效即止损，不要'这次不一样'。";
    }
    return { bias: bias, pos: pos, stopHint: stopHint, confuseHint: confuseHint, trendPos: trendPos };
  }
  function frameworkHtml(m, ctx, cat) {
    return `<p>判断任何一只股票的未来趋势，要按"从大到小"三层依次看，缺一不可——<b>同一形态出现在不同位置，含义可能完全相反</b>：</p>` +
      `<ol>` +
      `<li><b>大势（大盘/板块）</b>：先看大盘是多头、空头还是震荡。"顺势轻飘飘、逆势一场空"——大盘走熊时，个股形态再完美、成功率也大打折扣。本模型属<b>${cat.label}</b>，方向倾向<b>${ctx.bias}</b>。</li>` +
      `<li><b>个股趋势</b>：该股本身处于上升、下降还是横盘？<b>${m.name}</b>只有在"${ctx.trendPos}"出现才有意义——位置错了，形态就废。</li>` +
      `<li><b>形态位置</b>：本形态的正确出现位置是<b>${ctx.pos}</b>。把底反形态用在高点、或把顶反形态用在低点，是最常见也最致命的误判。</li>` +
      `</ol>` +
      `<div class="callout buy"><b>记住</b>：判断趋势不是"按图索骥"背形状，而是"<b>位置 + 量能 + 方向</b>"三者合一才成立。下面所有章节都在落实这三件事。</div>`;
  }
  function stepListHtml(m) {
    const looks = m.looks || [];
    if (!looks.length) return "<p>—</p>";
    return `<p>在实盘K线图上按这个顺序逐条核对，<b>全部满足</b>才算该形态成立：</p><ol>${looks.map(x => `<li>${x}</li>`).join("")}</ol>`;
  }
  function volCheckHtml(m) {
    return volHtml(m.vol) +
      `<div class="callout"><b>量价三检查</b>（量是形态的"确认章"，缺量不成立）：</div>` +
      `<ul>` +
      `<li><b>形成期</b>：量能是否与形态阶段匹配（缩量整理 / 放量突破各有其时，见上方该形态要点）。</li>` +
      `<li><b>转折/突破处</b>：关键转折或突破当日<b>必须放量</b>（常放大50%以上），无量突破多为假突破。</li>` +
      `<li><b>回踩/回测处</b>：突破后回踩颈线/支撑应<b>缩量</b>企稳、再放量上攻=健康；若放量跌破=危险。</li>` +
      `</ul>`;
  }
  function targetHtml(m, bt, ctx) {
    if (!bt) return `<p>本形态为预警/待确认信号，方向未定，不附目标位测算。先按"分步辨认"确认方向，再参考相关方向已定的形态。</p>`;
    const R = Math.abs(bt.entry - bt.stopP);
    const dir = bt.dir > 0 ? "做多" : "做空";
    const tgt = bt.dir > 0 ? `目标价 = 买点 + H（或 买点 + R×${bt.rr}）` : `目标价 = 卖点 − H（或 卖点 − R×${bt.rr}）`;
    return `<p>${dir}前先算清两件事：到哪止盈、错了在哪认错——<b>进场前就算，不要进场后再找理由</b>。</p>` +
      `<div class="rules-grid">` +
      `<div class="rule"><h4><span class="badge buy">盈</span>目标位（两法取小更稳）</h4><p>① <b>形态高度量度法</b>：量出形态最高到最低的"高度 H"，从突破点起算同等幅度 H 为目标。<br>② <b>R倍法</b>：风险 R=买点−止损；${tgt}。<br>套用本形态的买/卖点：¥${fmtP(bt.entry)}，止损 ¥${fmtP(bt.stopP)}，R≈${fmtP(R)}，按 ${bt.rr}:1 测算目标位约 <b>¥${fmtP(bt.target)}</b>。<br><small>注：目标位是"按规则的前瞻测算"，非承诺收益。</small></p></div>` +
      `<div class="rule"><h4><span class="badge stop">损</span>止损位</h4><p>放在<b>${ctx.stopHint}</b>，一旦被有效跌破/涨破即认错离场，不扛单、不补仓。<br>单笔亏损建议 ≤ 总资金 <b>2%</b>，据此反推仓位（仓位 = 风险额 ÷ 单股止损额）。</p></div>` +
      `</div>`;
  }
  function multiTfHtml() {
    return `<p>只看一个周期容易被"骗线"。用<b>三级共振</b>确认：</p>` +
      `<ul>` +
      `<li><b>周线看大势</b>：多头/空头排列决定大方向；周线相悖的信号，轻仓或放弃。</li>` +
      `<li><b>日线找形态与买卖点</b>：本模型的辨认清单与买卖点在日线确认。</li>` +
      `<li><b>60分/30分找精确进场</b>：在更小周期等次级确认，能<b>缩小止损、放大盈亏比</b>。</li>` +
      `</ul>` +
      `<p>三级同向 = 高胜率；只有日线信号而周线相悖 = 轻仓试探或放弃，不可重仓。</p>`;
  }
  function confuseHtml(m, ctx) {
    const rels = (m.related || []).map(rid => { const r = byId(rid); return r ? `<a href="#/model/${r.id}">${r.name}</a>` : ""; }).join("");
    return `<p>${ctx.confuseHint}</p>` +
      (rels ? `<div class="callout"><b>形态相近、最易混的模型</b>（点进去逐个对比，建立'区分感'）：</div><div class="related">${rels}</div>` : "");
  }
  function failResponseHtml(m) {
    const fails = (m.fail || []).map(x => `<li>${x}</li>`).join("");
    return `<p>出现下列任一信号，形态即告失效，应<b>不进场或立刻离场</b>：</p><ul>${fails}</ul>` +
      `<div class="callout stop"><b>失效后三步应对</b>：</div>` +
      `<ul>` +
      `<li><b>立刻离场</b>：不抱"等等看"幻想，按预案止损，保住本金才有下一单。</li>` +
      `<li><b>反向观察</b>：假突破常是真反向的起点（如假双顶变真突破向上），留意反向机会。</li>` +
      `<li><b>重置等待</b>：回到"分步辨认"清单，等下一个清晰、确认过的形态再动手，不勉强交易。</li>` +
      `</ul>`;
  }
  function checklistHtml(m, ctx) {
    return `<p>动手前逐条打勾，<b>全绿再进场</b>——任何一条不过就放弃或仅轻仓试探：</p>` +
      `<ul class="checklist">` +
      `<li>☐ 大势是否支持本形态方向（${ctx.bias}）？</li>` +
      `<li>☐ 个股是否在<b>正确位置</b>（${ctx.pos}）出现？</li>` +
      `<li>☐ "分步辨认"清单是否全部满足？</li>` +
      `<li>☐ 关键突破/转折是否<b>放量</b>确认？</li>` +
      `<li>☐ 目标位与止损是否已算清，盈亏比 ≥ <b>2:1</b>？</li>` +
      `<li>☐ 是否多周期共振（周/日/小级别同向）？</li>` +
      `<li>☐ 单笔风险是否 ≤ 总资金 <b>2%</b>？</li>` +
      `<li>☐ 失效信号是否清楚（出现即止损）？</li>` +
      `</ul>`;
  }

  /* ---------- 详情页 ---------- */
  function renderDetail(id) {
    const m = byId(id);
    const view = document.getElementById("detail-view");
    const content = document.getElementById("detail-content");
    if (!m) { location.hash = "#/"; return; }
    const cat = CATEGORIES.find(c => c.key === m.cat) || {};
    const cm = chartOf(m);
    const bt = signalFor(m);
    const ctx = modelContext(m, bt);

    // overlay legend
    const overlays = (cm && cm.overlays) || [];
    const overlayLegend = overlays.filter(o => o.label).map(o => `<i style="--cc:${o.color || 'var(--cat-two)'}">${o.label}</i>`).join("");

    content.innerHTML =
      `<div class="d-head">` +
        `<h2 class="d-title">${m.name} <span class="tag" style="--c:${cat.color}">${cat.label}</span></h2>` +
        `<p class="d-sub">${m.alias || ""}</p>` +
        `<p class="d-source">来源：${m.src} · 方向倾向：${ctx.bias}</p>` +
      `</div>` +
      `<div class="lead"><b>一句话：</b>${m.one}</div>` +
      section(1, "趋势判断三段论（先建框架）", frameworkHtml(m, ctx, cat)) +
      `<div class="chart-wrap">` +
        `<div class="cw-head"><h3>${m.name} · 形态图解</h3>` +
          `<div class="legend">` +
            `<i class="legend-up" style="--cc:var(--up)">阳(涨)</i>` +
            `<i class="legend-down" style="--cc:var(--down)">阴(跌)</i>` +
            `<i style="--cc:var(--ann)">▲买点</i>` +
            `<i style="--cc:var(--ann-risk)">▼止损/风险</i>` +
            overlayLegend +
          `</div>` +
        `</div>` +
        `<div id="big-chart"></div>` +
      `</div>` +
      section(2, "分步辨认清单", stepListHtml(m)) +
      section(3, "成交量与量价配合", volCheckHtml(m)) +
      section(4, "形成机理", `<p>${m.mech}</p>`) +
      section(5, "买卖规则", `<div class="rules-grid">` +
        `<div class="rule"><h4><span class="badge buy">买</span>买入</h4><p>${m.buy}</p></div>` +
        `<div class="rule"><h4><span class="badge stop">损</span>止损</h4><p>${m.stop}</p></div>` +
        `</div>`) +
      section(6, "目标位与止损测算", targetHtml(m, bt, ctx)) +
      section(7, "多周期共振确认", multiTfHtml()) +
      section(8, "易混淆形态与区分", confuseHtml(m, ctx)) +
      section(9, "失效信号与失效后应对", failResponseHtml(m)) +
      section(10, "常见误区", `<ul>${(m.pitfall || []).map(x => `<li>${x}</li>`).join("")}</ul>`) +
      section(11, "实战自检表（买前过一遍）", checklistHtml(m, ctx)) +
      `<div class="disclaimer">⚠️ 仅为教学示例，K 线与成交量为模型示意、非真实行情；任何形态在历史中有效不代表未来成立，不构成投资建议。本章教的是判断框架，实盘需结合大势、基本面与风控综合决策。</div>`;

    view.hidden = false;
    document.getElementById("catalog-view").hidden = true;
    window.scrollTo(0, 0);

    const el = document.getElementById("big-chart");
    if (el && cm) Chart.render(el, cm, { interactive: true, title: m.name });
  }

  function section(num, title, inner) {
    return `<section class="section"><h2><span class="num">${num}</span>${title}</h2><div>${inner}</div></section>`;
  }
  function volHtml(vol) {
    if (!vol) return "<p>—</p>";
    if (typeof vol === "string") return `<p>${vol}</p>`;
    return `<ul>${vol.map(x => `<li>${x}</li>`).join("")}</ul>`;
  }

  /* ---------- 案例回测（教学示意） ----------
     从模型自己的买点/卖点出发，按该类典型盈亏比推演到目标位，
     给出"买点买入→目标位离场"的示意收益。明确标注：非真实个股。 */
  const BT = {
    reversal:    { s: 0.08, r: 2.2 },
    continuation:{ s: 0.07, r: 2.5 },
    single:      { s: 0.05, r: 1.8 },
    two:         { s: 0.05, r: 1.8 },
    three:       { s: 0.06, r: 2.0 },
    gap:         { s: 0.05, r: 2.0 },
    system:      { s: 0.10, r: 3.0 }
  };
  function fmtP(n) { return Number(n).toFixed(2); }
  // 信号数学（只算买/卖点、止损、目标位，不生成假走势/假收益）
  function signalFor(model) {
    const cm = chartOf(model);
    const ann = (cm && cm.ann) || [];
    const find = k => ann.find(a => a.t === "point" && a.kind === k);
    const buy = find("buy"), stop = find("stop");
    const p = BT[model.cat] || BT.continuation;
    let dir, entry, stopP, target;
    if (buy) { dir = 1; entry = buy.p; stopP = entry * (1 - p.s); target = entry + (entry - stopP) * p.r; }
    else if (stop) { dir = -1; entry = stop.p; stopP = entry * (1 + p.s); target = entry - (stopP - entry) * p.r; }
    else return null; // 预警/待确认形态
    return { entry: entry, stopP: stopP, target: target, dir: dir, rr: p.r };
  }

  function showCatalog() {
    document.getElementById("detail-view").hidden = true;
    document.getElementById("catalog-view").hidden = false;
  }

  /* ---------- 路由 ---------- */
  function router() {
    const h = location.hash || "";
    const pm = h.match(/^#\/practice(?:\/.*)?$/);
    const m = h.match(/^#\/model\/(.+)$/);
    // 进入模拟投资
    if (pm) {
      document.getElementById("catalog-view").hidden = true;
      document.getElementById("detail-view").hidden = true;
      if (window.Practice) Practice.activate();
      return;
    }
    // 离开模拟投资
    if (!document.getElementById("practice-view").hidden && window.Practice) Practice.deactivate();
    document.getElementById("practice-view").hidden = true;
    if (m) renderDetail(m[1]);
    else showCatalog();
  }

  function rerender() {
    // 主题切换后重画当前视图图表
    if (!document.getElementById("detail-view").hidden) {
      const h = location.hash || "";
      const mm = h.match(/^#\/model\/(.+)$/);
      if (mm) {
        const id = mm[1];
        const model = byId(id);
        const el = document.getElementById("big-chart");
        if (el && model) Chart.render(el, chartOf(model), { interactive: true, title: model.name });
      }
    } else {
      // 目录缩略图重画
      MODELS.forEach(mo => {
        const el = document.getElementById("cc-" + mo.id);
        if (el) Chart.render(el, chartOf(mo), { compact: true, title: mo.name });
      });
    }
  }

  /* ---------- 事件 ---------- */
  function init() {
    initTheme();
    renderFilters();
    renderStats();
    renderCatalog();

    document.getElementById("search-input").addEventListener("input", function (e) {
      state.q = e.target.value; renderCatalog();
    });
    document.getElementById("back-btn").addEventListener("click", function () { location.hash = "#/"; });
    if (window.Practice) Practice.init();
    window.addEventListener("hashchange", router);
    router();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
