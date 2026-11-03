// Shared by review/index.html and render.py: renderCard(post, frame) fills frame with the card.
const IDENTITY = { name: 'Frontend Master', handle: 'allahabadi.dev', avatar: 'card/avatar.jpg' };
const FS_MAX = 6.6, FS_MIN = 3.2; // cqw; 3.2cqw = 35px at 1080, the smallest readable size in the feed
const CODE_WIDTH = 78, MONO_EM = 0.61, CODE_MIN = 3.2; // usable pre width in cqw, monospace advance per em
const PANEL_CODE_WIDTH = 74; // panels add their own padding inside the card
const MAX_HEIGHT = 125; // cqw: 4:5, the tallest image LinkedIn shows uncropped in the feed

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// "[[word]]" marks the one accent-coloured phrase on a card.
function rich(cls, text) {
  const e = el('div', cls);
  text.split(/\[\[|\]\]/).forEach((part, i) => {
    if (part) e.append(i % 2 ? el('span', 'accent', part) : document.createTextNode(part));
  });
  return e;
}

function avatar() {
  const img = el('img', 'avatar');
  img.alt = '';
  img.src = IDENTITY.avatar;
  img.onerror = () => img.replaceWith(el('div', 'avatar', 'FM'));
  return img;
}

// Font size that keeps the longest code line on one line, or null when it would drop below CODE_MIN.
function codeMax(code, width) {
  const longest = Math.max(...code.split('\n').map((l) => l.length));
  const size = width / (longest * MONO_EM);
  return size < CODE_MIN ? null : size;
}

function panel(p) {
  const box = el('div', `panel ${p.tone || ''}`);
  const bar = el('div', 'bar');
  bar.append(el('span', 'dots'), el('span', 'label', p.label), el('span', 'file', p.file || ''));
  const pre = el('pre');
  const hl = new Set(p.hl || []);
  p.code.split('\n').forEach((line, i) => pre.append(el('span', hl.has(i + 1) ? 'ln hl' : 'ln', line || ' ')));
  box.append(bar, pre);
  return box;
}

// Returns true when text and code fit within MAX_HEIGHT at or above their minimum sizes.
function renderCard(post, frame) {
  const theme = post.theme || (post.slot === 'pm' ? 'dark' : '');
  const card = el('div', `card ${theme}`);
  if (post.card.panels) {
    const size = Math.min(...post.card.panels.map((p) => codeMax(p.code, PANEL_CODE_WIDTH) ?? 0));
    if (!size) return false;
    card.style.setProperty('--code-max', `${size}cqw`);
    card.append(rich('title', post.card.title));
    post.card.panels.forEach((p) => card.append(panel(p)));
    if (post.card.note) card.append(rich('note', post.card.note));
    card.append(el('div', 'mark', `${IDENTITY.name} · ${IDENTITY.handle}`));
  } else {
    const who = el('div', 'who');
    const names = el('div');
    names.append(el('div', 'name', IDENTITY.name), el('div', 'handle', IDENTITY.handle));
    who.append(avatar(), names);
    card.append(who, rich('text', post.card.text));
    if (post.card.code) {
      // Size code by its longest line so lines never wrap; it only shrinks further with the text.
      const size = codeMax(post.card.code, CODE_WIDTH);
      if (!size) return false; // a code line is too long to stay readable
      const pre = el('pre', null, post.card.code);
      pre.style.setProperty('--code-max', `${size}cqw`);
      card.append(pre);
    }
  }
  frame.replaceChildren(card);

  const maxPx = (frame.clientWidth * MAX_HEIGHT) / 100;
  let fs = FS_MAX;
  card.style.setProperty('--fs', `${fs}cqw`);
  while (card.offsetHeight > maxPx && fs > FS_MIN) {
    fs = Math.round((fs - 0.1) * 10) / 10;
    card.style.setProperty('--fs', `${fs}cqw`);
  }
  return card.offsetHeight <= maxPx;
}
