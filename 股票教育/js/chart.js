/* ============================================================
   chart.js — SVG K线+成交量渲染器
   renderChart(svgEl, model, opts)
     model: {candles, ann, overlays}
     opts:  { compact?:bool, interactive?:bool, title?, legend?[] }
   红涨(空心)/绿跌(实心)，颜色取自 CSS 变量，深浅色自动适配。
   ============================================================ */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function fmt(n, d) { d = d == null ? 2 : d; return n.toFixed(d); }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function renderChart(svg, model, opts) {
    opts = opts || {};
    const cs = model.candles;
    if (!cs || !cs.length) { svg.innerHTML = ""; return; }

    const W = opts.compact ? 560 : 780;
    const H = opts.compact ? 200 : 430;
    const padL = opts.compact ? 6 : 8;
    const padR = opts.compact ? 6 : 54;
    const padT = opts.compact ? 6 : 12;
    const padB = opts.compact ? 4 : 20;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const gap = opts.compact ? 4 : 8;
    const volH = plotH * (opts.compact ? 0.26 : 0.26);
    const priceH = plotH - volH - gap;
    const volTop = padT + priceH + gap;

    // 价格范围：candles + overlays + ann 点
    let minP = 1e9, maxP = -1e9;
    cs.forEach(c => { minP = Math.min(minP, c.l); maxP = Math.max(maxP, c.h); });
    (model.overlays || []).forEach(o => {
      if (o.pts) o.pts.forEach(p => { minP = Math.min(minP, p.p); maxP = Math.max(maxP, p.p); });
      if (o.upper) o.upper.forEach(p => { minP = Math.min(minP, p.p); maxP = Math.max(maxP, p.p); });
      if (o.lower) o.lower.forEach(p => { minP = Math.min(minP, p.p); maxP = Math.max(maxP, p.p); });
    });
    (model.ann || []).forEach(a => {
      if (a.p != null) { minP = Math.min(minP, a.p); maxP = Math.max(maxP, a.p); }
      if (a.p0 != null) { minP = Math.min(minP, a.p0); maxP = Math.max(maxP, a.p0); }
      if (a.p1 != null) { minP = Math.min(minP, a.p1); maxP = Math.max(maxP, a.p1); }
    });
    let pad = (maxP - minP) * 0.08 || 2;
    minP -= pad; maxP += pad;

    // 成交量范围
    let maxV = 1; cs.forEach(c => { maxV = Math.max(maxV, c.v); });

    const n = cs.length;
    const step = plotW / n;
    const bodyW = Math.max(1.5, step * 0.62);
    const xOf = i => padL + (i + 0.5) * step;
    const yP = p => padT + (1 - (p - minP) / (maxP - minP)) * priceH;
    const yV = v => volTop + (1 - v / maxV) * volH;

    let parts = [];
    parts.push(`<svg class="chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(opts.title || "K线图")}">`);

    // 背景区
    parts.push(`<rect x="${padL}" y="${padT}" width="${plotW}" height="${priceH}" fill="transparent"/>`);

    // 网格 (recessive)
    const gridN = opts.compact ? 0 : 4;
    for (let g = 0; g <= gridN; g++) {
      if (gridN === 0) break;
      const y = padT + (priceH * g) / gridN;
      parts.push(`<line class="grid-line" x1="${padL}" y1="${y.toFixed(1)}" x2="${padL + plotW}" y2="${y.toFixed(1)}"/>`);
    }

    // 价格轴标签 (仅 full)
    if (!opts.compact) {
      for (let g = 0; g <= 4; g++) {
        const p = maxP - ((maxP - minP) * g) / 4;
        const y = padT + (priceH * g) / 4;
        parts.push(`<text class="axis-text" x="${padL + plotW + 4}" y="${(y + 3).toFixed(1)}">${fmt(p)}</text>`);
      }
      // 成交量标签
      parts.push(`<text class="axis-text" x="${padL + plotW + 4}" y="${(volTop + 10).toFixed(1)}">量 ${Math.round(maxV)}</text>`);
    }

    // ---- 叠加指标(在蜡烛之下，先画 band 再 line) ----
    (model.overlays || []).forEach(o => {
      if (o.t === "band" && o.upper && o.lower) {
        let poly = "";
        o.upper.forEach(p => { poly += `${xOf(p.i).toFixed(1)},${yP(p.p).toFixed(1)} `; });
        for (let k = o.lower.length - 1; k >= 0; k--) { const p = o.lower[k]; poly += `${xOf(p.i).toFixed(1)},${yP(p.p).toFixed(1)} `; }
        parts.push(`<polygon points="${poly}" fill="${cssVar("--ann-zone")}" stroke="none"/>`);
        [o.upper, o.lower].forEach(arr => {
          let d = ""; arr.forEach((p, i) => { d += (i ? " L" : "M") + xOf(p.i).toFixed(1) + " " + yP(p.p).toFixed(1); });
          parts.push(`<path d="${d}" fill="none" stroke="${cssVar(o.color ? "--ann" : "--ann")}" stroke-width="1" opacity="0.7" stroke-dasharray="2 2"/>`);
        });
      }
    });
    (model.overlays || []).forEach(o => {
      if (o.t === "line" && o.pts) {
        let d = ""; o.pts.forEach((p, i) => { d += (i ? " L" : "M") + xOf(p.i).toFixed(1) + " " + yP(p.p).toFixed(1); });
        const col = o.color ? themeColor(o.color) : cssVar("--ann");
        parts.push(`<path d="${d}" fill="none" stroke="${col}" stroke-width="${opts.compact ? 1 : 1.5}" opacity="0.95" ${o.dashed ? 'stroke-dasharray="4 3"' : ""}/>`);
      }
    });

    // ---- 标注: zone / h / line (在蜡烛之下) ----
    (model.ann || []).forEach(a => {
      if (a.t === "zone") {
        const x0 = xOf(a.i0) - bodyW * 0.3, x1 = xOf(a.i1) + bodyW * 0.3;
        const y0 = a.p0 != null ? yP(a.p0) : padT;
        const y1 = a.p1 != null ? yP(a.p1) : padT + priceH;
        const h = Math.max(2, y1 - y0);
        parts.push(`<rect class="zone-rect" x="${x0.toFixed(1)}" y="${Math.min(y0, y1).toFixed(1)}" width="${(x1 - x0).toFixed(1)}" height="${h.toFixed(1)}" rx="3"/>`);
        if (!opts.compact && a.label) parts.push(`<text class="ann-label" x="${(x0 + 3).toFixed(1)}" y="${(Math.min(y0, y1) + 11).toFixed(1)}">${esc(a.label)}</text>`);
      } else if (a.t === "h") {
        parts.push(`<line class="hlevel ${a.risk ? "risk" : ""}" x1="${padL}" y1="${yP(a.p).toFixed(1)}" x2="${(padL + plotW).toFixed(1)}" y2="${yP(a.p).toFixed(1)}"/>`);
        if (!opts.compact && a.label) parts.push(`<text class="ann-label ${a.risk ? "ann-label-risk" : ""}" x="${(padL + 4).toFixed(1)}" y="${(yP(a.p) - 4).toFixed(1)}">${esc(a.label)}</text>`);
      } else if (a.t === "line") {
        parts.push(`<line class="trend ${a.dashed ? "dashed" : ""}" x1="${xOf(a.i0).toFixed(1)}" y1="${yP(a.p0).toFixed(1)}" x2="${xOf(a.i1).toFixed(1)}" y2="${yP(a.p1).toFixed(1)}"/>`);
        if (!opts.compact && a.label) parts.push(`<text class="ann-label" x="${(xOf(a.i1) + 4).toFixed(1)}" y="${(yP(a.p1) - 4).toFixed(1)}">${esc(a.label)}</text>`);
      }
    });

    // ---- 成交量柱 ----
    cs.forEach((c, i) => {
      const x = xOf(i), up = c.c >= c.o;
      const y = yV(c.v), h = (volTop + volH) - y;
      parts.push(`<rect class="vol ${up ? "up" : "down"}" x="${(x - bodyW * 0.5).toFixed(1)}" y="${y.toFixed(1)}" width="${bodyW.toFixed(1)}" height="${Math.max(0.5, h).toFixed(1)}" rx="1"/>`);
    });

    // ---- 蜡烛 ----
    cs.forEach((c, i) => {
      const x = xOf(i), up = c.c >= c.o;
      const yo = yP(c.o), yc = yP(c.c), yh = yP(c.h), yl = yP(c.l);
      const top = Math.min(yo, yc), h = Math.max(1, Math.abs(yc - yo));
      const cls = up ? "up" : "down";
      parts.push(`<g class="candle ${cls}" data-i="${i}">`);
      parts.push(`<line class="wick" x1="${x.toFixed(1)}" y1="${yh.toFixed(1)}" x2="${x.toFixed(1)}" y2="${yl.toFixed(1)}" stroke="currentColor" stroke-width="1"/>`);
      if (up) {
        parts.push(`<rect x="${(x - bodyW / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${bodyW.toFixed(1)}" height="${h.toFixed(1)}" fill="var(--up-fill)" stroke="var(--up)" stroke-width="1.2"/>`);
      } else {
        parts.push(`<rect x="${(x - bodyW / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${bodyW.toFixed(1)}" height="${h.toFixed(1)}" fill="var(--down-fill)" stroke="var(--down)" stroke-width="1"/>`);
      }
      parts.push(`</g>`);
    });

    // ---- 标注: point / label (在蜡烛之上) ----
    (model.ann || []).forEach(a => {
      if (a.t === "point") {
        const x = xOf(a.i), y = yP(a.p);
        const risk = a.kind === "stop";
        const tri = risk ? -1 : 1; // buy 三角朝上, stop 朝下
        const s = opts.compact ? 4 : 6;
        const ty = risk ? y + s + 5 : y - s - 2;
        parts.push(`<polygon class="marker ${risk ? "marker-risk" : ""}" points="${x.toFixed(1)},${(risk ? y + s : y - s).toFixed(1)} ${(x - s).toFixed(1)},${(risk ? y : y).toFixed(1)} ${(x + s).toFixed(1)},${(risk ? y : y).toFixed(1)}"/>`);
        if (!opts.compact && a.label) {
          const ly = risk ? y + s + 12 : y - s - 4;
          parts.push(`<text class="ann-label ${risk ? "ann-label-risk" : ""}" x="${(x + s + 2).toFixed(1)}" y="${ly.toFixed(1)}">${esc(a.label)}</text>`);
        }
      } else if (a.t === "label") {
        const x = xOf(a.i), y = yP(a.p);
        const dy = a.dir === "down" ? 11 : -4;
        parts.push(`<text class="ann-label" x="${(x - 10).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="start">${esc(a.text)}</text>`);
      }
    });

    // 成交量分隔线
    parts.push(`<line class="grid-line" x1="${padL}" y1="${volTop.toFixed(1)}" x2="${(padL + plotW).toFixed(1)}" y2="${volTop.toFixed(1)}"/>`);

    // 交互层
    if (opts.interactive) {
      parts.push(`<rect class="hit" x="${padL}" y="${padT}" width="${plotW}" height="${plotH}" fill="transparent" style="cursor:crosshair"/>`);
    }

    parts.push("</svg>");
    svg.innerHTML = parts.join("");
    svg._chart = { cs: cs, xOf: xOf, yP: yP, yV: yV, padL: padL, padT: padT, plotW: plotW, plotH: plotH, W: W, H: H, maxV: maxV };

    if (opts.interactive) attachInteractivity(svg, opts);
  }

  // 把生成器里写的固定 hex 映射成主题 CSS 变量，使叠加线随深浅色切换
  function themeColor(c) {
    const m = {
      "#e34948": "var(--up)", "#e66767": "var(--up)",
      "#008300": "var(--down)",
      "#eda100": "var(--cat-single)", "#c98500": "var(--cat-single)",
      "#2a78d6": "var(--cat-reversal)", "#3987e5": "var(--cat-reversal)",
      "#4a3aa7": "var(--cat-two)", "#9085e9": "var(--cat-two)",
      "#1baf7a": "var(--cat-continue)", "#eb6834": "var(--cat-three)", "#e87ba4": "var(--cat-gap)"
    };
    return m[c] || c;
  }

  function attachInteractivity(container, opts) {
    const wrap = container.closest(".chart-wrap");
    const svgEl = container.querySelector("svg");
    let tt = wrap ? wrap.querySelector(".tt") : null;
    if (wrap && !tt) {
      tt = document.createElement("div");
      tt.className = "tt"; tt.style.display = "none";
      wrap.appendChild(tt);
    }
    const hit = container.querySelector(".hit");
    if (!hit || !svgEl) return;
    const data = container._chart;

    // 十字光标（垂直线）
    const ch = document.createElementNS("http://www.w3.org/2000/svg", "line");
    ch.setAttribute("class", "crosshair");
    ch.setAttribute("y1", data.padT);
    ch.setAttribute("y2", data.padT + data.plotH);
    ch.setAttribute("x1", "-10");
    ch.setAttribute("x2", "-10");
    svgEl.appendChild(ch);

    function onMove(e) {
      const rect = container.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * data.W;
      const i = Math.round((px - data.padL) / (data.plotW / data.cs.length) - 0.5);
      const idx = clamp(i, 0, data.cs.length - 1);
      const c = data.cs[idx];
      const up = c.c >= c.o;
      ch.setAttribute("x1", data.xOf(idx));
      ch.setAttribute("x2", data.xOf(idx));
      if (tt) {
        tt.innerHTML =
          `<b>#${idx + 1}</b> <span class="${up ? "u" : "d"}">${up ? "阳▲" : "阴▼"}</span><br>` +
          `开 ${fmt(c.o)} 收 ${fmt(c.c)}<br>` +
          `高 ${fmt(c.h)} 低 ${fmt(c.l)}<br>` +
          `量 ${Math.round(c.v)}`;
        const xPx = (e.clientX - rect.left);
        tt.style.display = "block";
        tt.style.left = clamp(xPx - 10, 6, rect.width - 150) + "px";
        tt.style.top = clamp(e.clientY - rect.top - 70, 6, rect.height - 60) + "px";
      }
    }
    function onLeave() {
      if (tt) tt.style.display = "none";
      ch.setAttribute("x1", "-10"); ch.setAttribute("x2", "-10");
    }
    hit.addEventListener("mousemove", onMove);
    hit.addEventListener("mouseleave", onLeave);
  }

  global.Chart = { render: renderChart };
})(window);
