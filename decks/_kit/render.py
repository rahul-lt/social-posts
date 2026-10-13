# Run from a deck folder: python3 ../_kit/render.py  -> renders ./deck.html into ./out/
import asyncio, os, sys
from playwright.async_api import async_playwright
HERE = os.getcwd(); OUT = os.path.join(HERE, "out"); ONLY = set(sys.argv[1:])
async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1080, "height": 1350}, device_scale_factor=2)
        await pg.goto("file://" + os.path.join(HERE, "deck.html"))
        await pg.wait_for_function("window.__done === true", timeout=30000)
        await pg.wait_for_timeout(300)
        qa = await pg.evaluate("window.__qa")
        for s in await pg.query_selector_all(".slide"):
            name = await s.get_attribute("data-name")
            if ONLY and name[:2] not in ONLY: continue
            await s.screenshot(path=os.path.join(OUT, name + ".png"))
        await b.close()
    if qa:
        print("GATE FAILED:"); [print(" -", q) for q in qa]; sys.exit(1)
    print("done. gate clean.")
asyncio.run(main())
