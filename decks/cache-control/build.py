import html, re, os
KIT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_kit")
HANDLE = "@allahabadi.dev"
def esc(s): return html.escape(s, quote=False)

def hl(code, api=()):
    out = []
    for line in code.split("\n"):
        m = re.search(r"//.*$", line)
        body, com = (line[:m.start()], line[m.start():]) if m else (line, "")
        pat = r"('[^']*'|\"[^\"]*\")"
        if api: pat += r"|(" + "|".join(re.escape(a) for a in api) + r")"
        seg, last = [], 0
        for mm in re.finditer(pat, body):
            seg.append(esc(body[last:mm.start()]))
            seg.append(f'<span class="{"s" if mm.group(1) else "a"}">{esc(mm.group(0))}</span>'); last = mm.end()
        seg.append(esc(body[last:]))
        if com: seg.append(f'<span class="c">{esc(com)}</span>')
        out.append("".join(seg))
    return "\n".join(out)

def blk(t, k="grey", flex=1):
    return f'<div class="blk {k}" style="flex:{flex}" data-box><span class="t">{t}</span></div>'
def visit(name, *blocks):
    """One request in time: lane label + what happens, left to right."""
    return f'<div class="lane"><div class="lane-name">{name}</div><div class="track" data-box>{"".join(blk(*b) for b in blocks)}</div></div>'
def note(t, bad=False): return f'<div class="note{" bad" if bad else ""}">{t}</div>'

UNITS = [
  dict(t="no-cache", lead="It does cache. It just asks the server first.",
       myth_api="no-cache = do not cache?", fact_api="Cache-Control: no-cache",
       myth=lambda: visit("VISIT 1", ("download 20 KB", "bad")) + visit("VISIT 2", ("download 20 KB again", "bad"))
            + note("No copy kept, so every visit pays in full.", True),
       fact=lambda: visit("VISIT 1", ("download 20 KB", "good"), ("copy saved", "lime"))
            + visit("VISIT 2", ("asks: changed?", "good"), ("304, no body", "lime"))
            + note("Unchanged? The copy is reused."),
       myth_v="Nothing is stored. Ever.", fact_v="Stored, then checked with the server before each reuse.",
       api=("no-cache", "ETag", "If-None-Match", "304 Not Modified"),
       code='// index.html response\nCache-Control: no-cache\nETag: "v42"\n// next visit the browser asks:\nIf-None-Match: "v42"\n// server answers: 304 Not Modified, no body',
       use="HTML pages", short="always fresh, cheap 304 check"),
  dict(t="no-store", lead="Nothing is saved. Every visit starts from zero.",
       myth_api="no-store = no-cache?", fact_api="Cache-Control: no-store",
       myth=lambda: visit("VISIT 1", ("download 20 KB", "bad"), ("copy saved", "bad"))
            + visit("VISIT 2", ("asks: changed?", "bad"), ("304, reuse copy", "bad"))
            + note("People expect the cheap 304 check here.", True),
       fact=lambda: visit("VISIT 1", ("download 20 KB", "good"), ("no copy kept", "ghost"))
            + visit("VISIT 2", ("download 20 KB again", "good"), ("no copy kept", "ghost"))
            + note("No saved copy, so nothing to check against."),
       myth_v="It checks first, like no-cache.", fact_v="No copy anywhere. Full download on every visit.",
       api=("no-store",),
       code="// account page with a bank balance\nCache-Control: no-store\n// browser and proxies keep no copy\n// next visit: full download again",
       use="private data", short="bank balance, one-time codes"),
  dict(t="max-age=60", lead="Reuse it for 60 seconds without asking.",
       myth_api="a 60 second timer?", fact_api="Cache-Control: max-age=60",
       myth=lambda: visit("AT 60 s", ("page reloads itself", "bad")) + visit("AT 120 s", ("page reloads itself", "bad"))
            + note("Nothing reloads by itself. It only sets how long a copy stays fresh.", True),
       fact=lambda: visit("AT 0 s", ("download 20 KB", "good"), ("copy saved", "lime"))
            + visit("AT 30 s", ("from cache", "good"), ("0 requests", "lime"))
            + visit("AT 75 s (stale)", ("asks: changed?", "good"), ("304 or new file", "lime")),
       myth_v="The page reloads every 60 seconds.", fact_v="Fresh for 60 s. After that, it checks again.",
       api=("max-age=60",),
       code="// GET /api/products response\nCache-Control: max-age=60\n// 0 to 60 s: served from cache, no request\n// after 60 s: stale, browser checks again",
       use="lists that can be 1 min old", short="product list, avatars, feeds"),
]
TOTAL = len(UNITS) + 3

def foot(p): return f'<div class="foot"><span>{HANDLE}</span><span>{p:02d} / {TOTAL:02d}</span></div>'

def unit(i, u):
    p = i + 2
    return f'''<section class="slide inner" data-name="{p:02d}_{re.sub('[^a-z0-9]+','_',u['t'])}">
  <div class="grid"></div>
  <div class="eyebrow" data-box>VALUE {i+1:02d} / {len(UNITS)}</div>
  <h2 class="title fit-title"><code class="hdr">{esc(u['t'])}</code></h2>
  <p class="lead">{esc(u['lead'])}</p>
  <div class="versus">
    <div class="panel old" data-box><div class="tag" data-box>✗ PEOPLE THINK</div><div class="api">{esc(u['myth_api'])}</div>
      <div class="viz" data-box>{u['myth']()}</div><div class="verdict" data-box><b>MYTH</b>{esc(u['myth_v'])}</div></div>
    <div class="panel new" data-box><div class="tag" data-box>✓ WHAT IT DOES</div><div class="api">{esc(u['fact_api'])}</div>
      <div class="viz" data-box>{u['fact']()}</div><div class="verdict" data-box><b>FACT</b>{esc(u['fact_v'])}</div></div>
  </div>
  <div class="how"><div class="howlbl">THE HEADERS</div><pre class="code fit-code" data-box>{hl(u['code'], u['api'])}</pre></div>
  {foot(p)}
</section>'''

COMPARE = [
  ("Keeps a copy?", [("yes", "good"), ("no", "bad"), ("yes", "good")]),
  ("Visit 2 calls the server?", [("yes, asks first", "lime"), ("yes, full download", "bad"), ("no, for 60 s", "good")]),
  ("Bytes on visit 2", [("tiny 304", "good"), ("all 20 KB", "bad"), ("nothing", "good")]),
  ("Use it for", [("HTML pages", "grey"), ("private data", "grey"), ("API lists", "grey")]),
]
def compare():
    p = len(UNITS) + 2
    head = '<div class="cmp-h"></div>' + "".join(f'<div class="cmp-h" data-box><code>{esc(u["t"])}</code></div>' for u in UNITS)
    rows = "".join(f'<div class="cmp-q" data-box>{esc(q)}</div>' + "".join(blk(t, k) for t, k in cells) for q, cells in COMPARE)
    return f'''<section class="slide inner" data-name="{p:02d}_side_by_side"><div class="grid"></div>
  <div class="eyebrow" data-box>SIDE BY SIDE</div><h2 class="title fit-title">Same file. Second visit.</h2>
  <p class="lead">What each value does when you come back.</p>
  <div class="cmp">{head}{rows}</div>{foot(p)}</section>'''

RECAP = [("no-cache", "HTML pages: always fresh, cheap check"), ("no-store", "bank balance, one-time codes"),
         ("max-age=60", "product list that can be 1 min old"), ("max-age=31536000", "hashed files like app.3f9a1c.js, + immutable")]
def recap():
    rows = "".join(f'<div class="rrow"><b>{i+1:02d}</b><div class="rbody"><div class="rnew" data-box>{esc(n)}</div><div class="rold">{esc(o)}</div></div></div>' for i, (n, o) in enumerate(RECAP))
    return f'''<section class="slide inner recap" data-name="{TOTAL:02d}_recap"><div class="grid"></div>
  <div class="eyebrow" data-box>RECAP: SAVE THIS</div><h2 class="title">Pick one per response.</h2>
  <p class="lead">Send this header, for this kind of response.</p><div class="rlist">{rows}</div>{foot(TOTAL)}</section>'''

COVER_ART = """<svg class="art" viewBox="0 0 660 640" xmlns="http://www.w3.org/2000/svg">
 <defs><marker id="ah" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#fff"/></marker></defs>
 <rect x="38" y="38" width="600" height="580" rx="48" fill="#111"/>
 <rect x="20" y="20" width="600" height="580" rx="48" fill="#fff" stroke="#111" stroke-width="6"/>
 <rect x="50" y="50" width="540" height="520" rx="30" fill="#111"/>
 <circle cx="92" cy="94" r="13" fill="#ff5c8a"/><circle cx="132" cy="94" r="13" fill="#ffd84d"/><circle cx="172" cy="94" r="13" fill="#d4ff3a"/>
 <text x="210" y="104" font-family="IBM Plex Mono" font-weight="700" font-size="30" fill="#fff">response headers</text>
 <line x1="50" y1="135" x2="590" y2="135" stroke="#3a3a3a" stroke-width="4"/>
 <!-- browser -->
 <rect x="74" y="172" width="136" height="104" rx="14" fill="#d4ff3a" stroke="#fff" stroke-width="4"/>
 <rect x="74" y="172" width="136" height="26" rx="10" fill="#111" stroke="#fff" stroke-width="4"/>
 <rect x="92" y="214" width="100" height="14" rx="7" fill="#111"/><rect x="92" y="240" width="64" height="14" rx="7" fill="#111"/>
 <text x="142" y="314" text-anchor="middle" font-family="IBM Plex Mono" font-weight="700" font-size="28" fill="#fff">browser</text>
 <!-- cache -->
 <rect x="252" y="172" width="136" height="104" rx="14" fill="#ffd84d" stroke="#fff" stroke-width="4"/>
 <line x1="252" y1="224" x2="388" y2="224" stroke="#111" stroke-width="5"/>
 <rect x="300" y="190" width="40" height="18" rx="6" fill="#111"/><rect x="300" y="242" width="40" height="18" rx="6" fill="#111"/>
 <text x="320" y="314" text-anchor="middle" font-family="IBM Plex Mono" font-weight="700" font-size="28" fill="#fff">cache</text>
 <!-- server -->
 <rect x="430" y="172" width="136" height="30" rx="8" fill="#ff5c8a" stroke="#fff" stroke-width="4"/>
 <rect x="430" y="209" width="136" height="30" rx="8" fill="#ff5c8a" stroke="#fff" stroke-width="4"/>
 <rect x="430" y="246" width="136" height="30" rx="8" fill="#ff5c8a" stroke="#fff" stroke-width="4"/>
 <circle cx="450" cy="187" r="5" fill="#111"/><circle cx="450" cy="224" r="5" fill="#111"/><circle cx="450" cy="261" r="5" fill="#111"/>
 <text x="498" y="314" text-anchor="middle" font-family="IBM Plex Mono" font-weight="700" font-size="28" fill="#fff">server</text>
 <line x1="214" y1="224" x2="240" y2="224" stroke="#fff" stroke-width="5" marker-end="url(#ah)"/>
 <line x1="392" y1="224" x2="418" y2="224" stroke="#fff" stroke-width="5" marker-end="url(#ah)"/>
 <!-- header values -->
 <text x="80" y="390" font-family="IBM Plex Mono" font-weight="700" font-size="30" fill="#d2d2d2">Cache-Control:</text>
 <rect x="74" y="414" width="232" height="62" rx="31" fill="#ff5c8a" stroke="#fff" stroke-width="4"/>
 <text x="190" y="456" text-anchor="middle" font-family="IBM Plex Mono" font-weight="700" font-size="30" fill="#111">no-cache</text>
 <rect x="334" y="414" width="232" height="62" rx="31" fill="#fff" stroke="#fff" stroke-width="4"/>
 <text x="450" y="456" text-anchor="middle" font-family="IBM Plex Mono" font-weight="700" font-size="30" fill="#111">no-store</text>
 <rect x="170" y="492" width="300" height="62" rx="31" fill="#d4ff3a" stroke="#fff" stroke-width="4"/>
 <text x="320" y="534" text-anchor="middle" font-family="IBM Plex Mono" font-weight="700" font-size="30" fill="#111">max-age=60</text>
 <circle cx="606" cy="46" r="44" fill="#d4ff3a" stroke="#111" stroke-width="6"/>
 <path d="M584 47 l16 16 l28 -32" fill="none" stroke="#111" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>"""
COVER_LINES = ["3 CACHE", "CONTROL", "VALUES."]
COVER_STICKERS = [("no-cache", "var(--pink)"), ("no-store", "#fff"), ("max-age=60", "var(--lime)"), ("304 Not Modified", "var(--yel)")]
COVER_MORE = "+ when to use each"
COVER_CTA = "NO-CACHE DOES NOT MEAN NO CACHE"

def cover():
    HI = ' class="hi"'
    ttl = "".join(f'<span{HI if i == len(COVER_LINES) - 1 else ""}>{esc(l)}</span>' for i, l in enumerate(COVER_LINES))
    rots, xs = [-4, 3, -3, 4], [24, 44, 24, 44]
    stk = "".join(f'<div class="stk" style="left:{xs[i]}px;top:{640 + i*118}px;background:{bg};transform:rotate({rots[i]}deg)"><code>{esc(t)}</code></div>' for i, (t, bg) in enumerate(COVER_STICKERS))
    stk += f'<div class="stk dark" style="left:24px;top:{640 + len(COVER_STICKERS)*118}px;transform:rotate(-2deg)">{esc(COVER_MORE)}</div>'
    return f'''<section class="slide cover" data-name="01_cover"><div class="grid"></div>
  {COVER_ART}<div class="ttl">{ttl}</div>{stk}<div class="cta" data-box>{esc(COVER_CTA)}</div></section>'''

EXTRA = """
.title .hdr{font:700 1em/1.02 "IBM Plex Mono",monospace;letter-spacing:-3px}
.lane{display:flex;flex-direction:column;gap:4px}
.lane-name{font:800 28px/1.3 "Manrope";letter-spacing:.03em}
.track{display:flex;gap:8px;padding:8px;border:4px solid var(--ink);border-radius:14px;height:98px;background:var(--well)}
.cmp{flex:1;display:grid;grid-template-columns:300px repeat(3,1fr);grid-auto-rows:auto;gap:12px;align-content:space-evenly}
.cmp-h{font:700 32px/1.3 "IBM Plex Mono",monospace;text-align:center;background:var(--ink);color:#fff;border-radius:14px;padding:10px 4px}
.cmp-h:first-child{background:none}
.cmp-q{font:800 30px/1.2 "Manrope";display:flex;align-items:center}
.cmp .blk{min-height:150px;border:4px solid var(--ink);font-size:30px}
.rlist{gap:18px;justify-content:stretch;padding:0 8px 8px 0}
.rrow{flex:1;display:grid;grid-template-columns:80px 1fr;align-items:center;background:#fff;border:5px solid var(--ink);border-radius:26px;box-shadow:8px 8px 0 var(--ink);padding:16px 22px}
.rrow:last-child{border-bottom:5px solid var(--ink)}
.rrow b{font:400 44px/1.3 "Archivo Black"}
.rbody{display:flex;flex-direction:column;gap:14px;align-items:flex-start}
.rnew{font-size:34px;padding:12px 24px}
.rold{font:800 34px/1.2 "Manrope"}
.cmp{grid-template-columns:330px repeat(3,1fr)}
"""

page = f'''<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Manrope:wght@600;700;800&family=IBM+Plex+Mono:wght@500;600;700&display=swap">
<style>{open(os.path.join(KIT, "theme.css")).read()}{EXTRA}</style></head><body>
{cover()}{"".join(unit(i, u) for i, u in enumerate(UNITS))}{compare()}{recap()}
<script>{open(os.path.join(KIT, "fit.js")).read()}</script></body></html>'''
open("deck.html", "w").write(page)
print("deck.html written,", TOTAL, "slides")
