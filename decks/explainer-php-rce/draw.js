// allahabadi-carousel doodle kit + geometry gate. Needs rough.js loaded first.
// Usage in a deck:  figure('cover', (d, svg) => { svg.setAttribute('viewBox','0 0 1000 400'); d.browser(...); });
//                   <div class="fig" data-fig="cover"></div>
const NS = 'http://www.w3.org/2000/svg';
const ROUGH = {roughness: .45, bowing: .3, sw: 2.2};
const FIGS = {};
function figure(name, fn) { FIGS[name] = fn; }

function makeDraw(svg) {
  const cs = getComputedStyle(svg);
  const col = k => cs.getPropertyValue('--' + k).trim();
  const rc = rough.svg(svg); let seed = 7;
  const o = (x = {}) => ({roughness: ROUGH.roughness, bowing: ROUGH.bowing, strokeWidth: x.sw || ROUGH.sw,
    stroke: col(x.stroke || 'ink'), fill: x.fill ? col(x.fill) : undefined, fillStyle: 'solid', seed: seed++, strokeLineDash: x.dash});
  const add = el => (svg.appendChild(el), el);
  const d = {
    rect: (x, y, w, h, s) => add(rc.rectangle(x, y, w, h, o(s))),
    line: (x1, y1, x2, y2, s) => add(rc.line(x1, y1, x2, y2, o(s))),
    circle: (x, y, r, s) => add(rc.circle(x, y, r * 2, o(s))),
    ellipse: (x, y, w, h, s) => add(rc.ellipse(x, y, w, h, o(s))),
    path: (p, s) => add(rc.path(p, o(s))),
    arrow(x1, y1, x2, y2, s = {}) {
      d.line(x1, y1, x2, y2, s); const a = Math.atan2(y2 - y1, x2 - x1), L = 20;
      d.line(x2, y2, x2 - L * Math.cos(a - .5), y2 - L * Math.sin(a - .5), s);
      d.line(x2, y2, x2 - L * Math.cos(a + .5), y2 - L * Math.sin(a + .5), s);
    },
    // text in viewBox units; the gate checks it renders >= 26px
    text(x, y, t, s = {}) {
      const e = document.createElementNS(NS, 'text');
      e.setAttribute('x', x); e.setAttribute('y', y); e.setAttribute('text-anchor', s.anchor || 'start');
      e.setAttribute('class', s.mono ? 'tm' : 'tb'); e.setAttribute('font-size', s.size || 30);
      e.setAttribute('font-weight', s.weight || 600); e.setAttribute('fill', col(s.color || 'ink')); e.textContent = t; return add(e);
    },
    browser(x, y, w, h, label) {
      d.rect(x, y, w, h); d.line(x, y + 42, x + w, y + 42);
      [0, 1, 2].forEach(i => d.circle(x + 24 + i * 26, y + 21, 7, {sw: 2}));
      if (label) d.text(x + w / 2, y + h / 2 + 34, label, {anchor: 'middle', weight: 700});
    },
    server(x, y, w, label) {
      [0, 1, 2].forEach(i => { d.rect(x, y + i * 60, w, 48); d.circle(x + 24, y + 24 + i * 60, 6, {fill: 'ink', sw: 1}); });
      if (label) d.text(x + w / 2, y + 3 * 60 + 30, label, {anchor: 'middle', weight: 700});
    },
    file(x, y, w, h, s = {}) {
      d.path(`M${x} ${y} L${x + w - 26} ${y} L${x + w} ${y + 26} L${x + w} ${y + h} L${x} ${y + h} Z`, s);
      d.line(x + w - 26, y, x + w - 26, y + 26, {sw: 2}); d.line(x + w - 26, y + 26, x + w, y + 26, {sw: 2});
    },
    chip(x, y, w, t, s = {}, h = 56) { d.rect(x, y, w, h, s); d.text(x + w / 2, y + h / 2 + 10, t, {anchor: 'middle', mono: true, size: 28, weight: 600}); },
    cross(x, y, r) { d.line(x - r, y - r, x + r, y + r, {sw: 4}); d.line(x + r, y - r, x - r, y + r, {sw: 4}); },
    // Request-flow diagram. steps: {sep:'LABEL'} | {m:'>'|'<', t:'message', c:'a2', bold} | {box:'what happens', fill:'a1'|'a2soft', cross}
    seq(steps, left = 'browser', right = 'server') {
      const bx = 110, sx = 890, start = 46; let y = 62;
      d.chip(bx - 95, 0, 190, left, {fill: 'paper'}, 46); d.chip(sx - 90, 0, 180, right, {fill: 'paper'}, 46);
      for (const st of steps) {
        if (st.sep) { d.text(bx + 30, y + 28, st.sep, {mono: true, size: 28, weight: 700}); y += 42; continue; }
        if (st.box) {
          const w = st.box.length * 16.8 + 44;
          d.rect(bx + 26, y + 4, w, 48, {fill: st.fill, sw: 2});
          d.text(bx + 26 + w / 2, y + 38, st.box, {anchor: 'middle', size: 28, weight: 700});
          if (st.cross) d.cross(bx + 26 + w + 30, y + 28, 16);
          y += 60; continue;
        }
        const ltr = st.m === '>';
        d.text((bx + sx) / 2, y + 24, st.t, {anchor: 'middle', mono: true, size: 28, weight: st.bold ? 700 : 500});
        d.arrow(ltr ? bx + 10 : sx - 10, y + 40, ltr ? sx - 10 : bx + 10, y + 40, {stroke: st.c || 'ink', sw: st.c ? 4.5 : 2.6});
        y += 62;
      }
      d.line(bx, start, bx, y, {dash: [10, 10], sw: 2}); d.line(sx, start, sx, y, {dash: [10, 10], sw: 2});
      svg.setAttribute('viewBox', `0 0 1000 ${y + 6}`);
    },
  };
  return d;
}

// ---- gate: every problem lands in window.__qa; render.py fails the build on any entry ----
window.__qa = [];
function gate() {
  const qa = (s, m) => window.__qa.push(`${s.dataset.name}: ${m}`);
  document.querySelectorAll('.s').forEach(s => {
    const sr = s.getBoundingClientRect();
    if (s.scrollHeight > s.clientHeight + 1) qa(s, `content ${s.scrollHeight - s.clientHeight}px taller than the slide`);
    s.querySelectorAll('*').forEach(el => {
      if (el.closest('svg')) return;
      const own = [...el.childNodes].some(c => c.nodeType === 3 && c.textContent.trim());
      if (!own) return;
      const fs = parseFloat(getComputedStyle(el).fontSize), min = el.closest('.brand') ? 22 : 26;
      if (fs < min - .1) qa(s, `font ${fs}px < ${min}: "${el.textContent.trim().slice(0, 30)}"`);
      const r = el.getBoundingClientRect();
      if (r.right > sr.right - 40 || r.bottom > sr.bottom - 30) qa(s, `text near/over the edge: "${el.textContent.trim().slice(0, 30)}"`);
    });
    s.querySelectorAll('.fig svg').forEach(svg => {
      const k = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
      svg.querySelectorAll('text').forEach(t => {
        const px = parseFloat(t.getAttribute('font-size')) * k;
        if (px < 25.5) qa(s, `diagram text renders at ${px.toFixed(1)}px < 26: "${t.textContent.slice(0, 30)}"`);
        const tr = t.getBoundingClientRect(), fr = svg.getBoundingClientRect();
        if (tr.left < fr.left - 4 || tr.right > fr.right + 4) qa(s, `diagram text outside the figure: "${t.textContent.slice(0, 30)}"`);
      });
      // the figure must not run into the next block
      const next = svg.closest('.fig').nextElementSibling, fb = svg.getBoundingClientRect();
      if (next && fb.bottom > next.getBoundingClientRect().top + 2) qa(s, 'diagram overlaps the block below it');
    });
  });
}

// draw every figure, then run the gate once fonts are in
document.fonts.ready.then(() => {
  document.querySelectorAll('[data-fig]').forEach(fig => {
    const svg = document.createElementNS(NS, 'svg'); fig.appendChild(svg);
    if (!FIGS[fig.dataset.fig]) return window.__qa.push(`missing figure "${fig.dataset.fig}"`);
    FIGS[fig.dataset.fig](makeDraw(svg), svg);
  });
  const total = document.querySelectorAll('.s').length;
  document.querySelectorAll('.s').forEach((s, i) => {
    s.dataset.name = String(i + 1).padStart(2, '0');
    const b = s.querySelector('.brand'); if (b) b.textContent = `allahabadi.dev · ${s.dataset.name}/${String(total).padStart(2, '0')}`;
  });
  gate(); window.__done = true;
});
