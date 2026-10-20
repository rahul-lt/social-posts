// Shared helpers for LinkedIn-style animated story scenes. The page defines render(t), t in [0, 1].
const NS = 'http://www.w3.org/2000/svg', S = document.getElementById('s');
const INK = '#1d1d2b';
const C = { blue: '#6f8fd0', navy: '#3d5aa8', orange: '#f28c5a', teal: '#7fd6cb', mustard: '#e8b04a', coral: '#e65a5a', soft: '#b9d4f2' };
const el = (tag, attrs, parent = S) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
const g = (attrs, parent = S) => el('g', attrs, parent);
// Outlined limb: a dark stroke under a lighter one.
const limb = (d, fill = '#fff', parent = S) => [26, 18].map((w, i) => el('path', { d, fill: 'none', stroke: i ? fill : INK, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent));
// Flat colour fill offset behind a clean outline.
const offsetShape = (tag, attrs, fill, parent = S, dx = 12, dy = 10) => {
  el(tag, { ...attrs, fill, transform: `translate(${dx} ${dy})` }, parent);
  return el(tag, { ...attrs, fill: 'none', class: 'o' }, parent);
};

// Confetti-dash backdrop above a floor band at y = 640.
function backdrop() {
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 150; i++) {
    const x = rnd() * 960, y = rnd() * 600, a = rnd() * Math.PI;
    el('line', { x1: x, y1: y, x2: x + 14 * Math.cos(a), y2: y + 14 * Math.sin(a), stroke: '#cfd8ea', 'stroke-width': 3, 'stroke-linecap': 'round' });
  }
  el('rect', { x: 0, y: 640, width: 960, height: 230, fill: '#c3cde0' });
  el('line', { x1: 0, y1: 640, x2: 960, y2: 640, stroke: '#8f9bb8', 'stroke-width': 3 });
}
