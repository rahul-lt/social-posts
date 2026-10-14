// Shared by review/index.html and render.py: renderCard(post, frame) fills frame with the card.
const IDENTITY = { name: 'Frontend Master', handle: 'allahabadi.dev', avatar: 'card/avatar.jpg' };
const FS_MAX = 6.6, FS_MIN = 3.2; // cqw; 3.2cqw = 35px at 1080, the smallest readable size in the feed
const CODE_WIDTH = 78, MONO_EM = 0.61, CODE_MIN = 3.2; // usable pre width in cqw, monospace advance per em
const MAX_HEIGHT = 125; // cqw: 4:5, the tallest image LinkedIn shows uncropped in the feed

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function avatar() {
  const img = el('img', 'avatar');
  img.alt = '';
  img.src = IDENTITY.avatar;
  img.onerror = () => img.replaceWith(el('div', 'avatar', 'FM'));
  return img;
}

// Returns true when text and code fit within MAX_HEIGHT at or above their minimum sizes.
function renderCard(post, frame) {
  const card = el('div', `card ${post.slot === 'pm' ? 'dark' : ''}`);
  const who = el('div', 'who');
  const names = el('div');
  names.append(el('div', 'name', IDENTITY.name), el('div', 'handle', IDENTITY.handle));
  who.append(avatar(), names);
  card.append(who, el('div', 'text', post.card.text));
  if (post.card.code) {
    // Size code by its longest line so lines never wrap; it only shrinks further with the text.
    const longest = Math.max(...post.card.code.split('\n').map((l) => l.length));
    const pre = el('pre', null, post.card.code);
    const codeMax = CODE_WIDTH / (longest * MONO_EM);
    if (codeMax < CODE_MIN) return false; // a code line is too long to stay readable
    pre.style.setProperty('--code-max', `${codeMax}cqw`);
    card.append(pre);
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
