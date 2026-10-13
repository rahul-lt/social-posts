window.__qa = [];
function qa(slide, msg){ window.__qa.push((slide.dataset.name||slide.id) + ": " + msg); }
function fitAll(){
  document.querySelectorAll('.fit-title').forEach(function(el){
    var s = 84; el.style.fontSize = s + 'px';
    while (s > 56 && (el.scrollWidth > el.clientWidth + 1 || el.offsetHeight > s * 1.02 * 2 + 4)) { s -= 2; el.style.fontSize = s + 'px'; }
  });
  document.querySelectorAll('.fit-code').forEach(function(el){
    var s = 30; el.style.fontSize = s + 'px';
    while (s > 26 && el.scrollWidth > el.clientWidth + 1) { s -= 1; el.style.fontSize = s + 'px'; }
  });
}
function gate(){
  document.querySelectorAll('.slide').forEach(function(slide){
    var sr = slide.getBoundingClientRect(), M = 16, cover = slide.classList.contains('cover');
    slide.querySelectorAll('[data-box]').forEach(function(b){
      if (b.scrollWidth > b.clientWidth + 1) qa(slide, 'horizontal spill in .' + b.className.split(' ').join('.') + ' "' + b.textContent.trim().slice(0,40) + '"');
      if (b.scrollHeight > b.clientHeight + 1) qa(slide, 'vertical spill in .' + b.className.split(' ').join('.') + ' "' + b.textContent.trim().slice(0,40) + '"');
    });
    var walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT), n;
    while ((n = walker.nextNode())) {
      if (!n.textContent.trim()) continue;
      if (n.parentElement.closest('svg')) continue;
      var r = document.createRange(); r.selectNodeContents(n);
      var rr = r.getBoundingClientRect(); if (!rr.width) continue;
      var box = n.parentElement.closest('[data-box]');
      if (box) { var br = box.getBoundingClientRect();
        if (rr.left < br.left - 1 || rr.right > br.right + 1 || rr.top < br.top - 1 || rr.bottom > br.bottom + 1)
          qa(slide, 'text outside its box: "' + n.textContent.trim().slice(0,40) + '"'); }
      if (!cover && (rr.left < sr.left + M - 1 || rr.right > sr.right - M + 1 || rr.bottom > sr.bottom - M + 1 || rr.top < sr.top + M - 1))
        qa(slide, 'text in the 16px margin: "' + n.textContent.trim().slice(0,40) + '"');
    }
    slide.querySelectorAll('*').forEach(function(el){
      if (el.closest('svg')) return;
      var hasText = Array.prototype.some.call(el.childNodes, function(c){ return c.nodeType === 3 && c.textContent.trim(); });
      if (!hasText) return;
      var fs = parseFloat(getComputedStyle(el).fontSize);
      var min = el.closest('.foot') ? 24 : 26;
      if (fs < min - 0.1) qa(slide, 'font ' + fs + 'px < ' + min + ': "' + el.textContent.trim().slice(0,30) + '"');
    });
    if (cover) slide.querySelectorAll('.ttl span, .stk, .cta').forEach(function(el){
      var r = el.getBoundingClientRect();
      if (r.left < sr.left + M - 1 || r.right > sr.right - M + 1) qa(slide, 'cover element crosses the 16px margin: "' + el.textContent.trim().slice(0,30) + '"');
    });
    if (!cover && slide.scrollHeight > slide.clientHeight + 1) qa(slide, 'slide content taller than canvas');
  });
}
document.fonts.ready.then(function(){ fitAll(); gate(); window.__done = true; });
