"""Render nugget cards to out/<id>/card.png (2160px square) + out/<id>/caption.txt.
Usage: python3 nuggets/render.py [id ...]   (no ids = every post in posts.json)
Exits 1 if any card text does not fit at the minimum font size."""
import asyncio, json, os, sys
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")

async def main():
    posts = json.load(open(os.path.join(HERE, "posts.json")))
    ids = sys.argv[1:]
    posts = [p for p in posts if not ids or p["id"] in ids]
    if ids and len(posts) != len(ids):
        sys.exit(f"unknown ids: {set(ids) - {p['id'] for p in posts}}")
    failed = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        pg = await b.new_page(viewport={"width": 1080, "height": 1080}, device_scale_factor=2)
        await pg.goto("file://" + os.path.join(HERE, "render.html"))
        for p in posts:
            fits = await pg.evaluate(
                "async (p) => { const f = document.getElementById('f'); const ok = renderCard(p, f);"
                " await Promise.all([...f.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));"
                " return ok && renderCard(p, f); }", p)
            if not fits:
                failed.append(p["id"]); continue
            d = os.path.join(OUT, p["id"]); os.makedirs(d, exist_ok=True)
            await (await pg.query_selector("#f")).screenshot(path=os.path.join(d, "card.png"))
            open(os.path.join(d, "caption.txt"), "w").write(p["caption"] + "\n")
        await b.close()
    if failed:
        sys.exit(f"GATE FAILED: text too long for the card: {', '.join(failed)}")
    print(f"done. {len(posts)} cards in {OUT}")

asyncio.run(main())
