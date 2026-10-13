import asyncio, os, sys, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1400, "height": 1000})
        await pg.goto("file://" + os.path.abspath(os.environ.get("PAGE","index.html")))
        await pg.wait_for_function("document.fonts.status === 'loaded'"); await pg.wait_for_timeout(800)
        res = await pg.evaluate("""() => [...document.querySelectorAll('section.opt')].flatMap(sec =>
          [...sec.querySelectorAll('.s')].map(s => ({opt: sec.id, n: s.dataset.name, over: s.scrollHeight - s.clientHeight,
            wide: [...s.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible').length}))
          .filter(r => r.over > 0 || r.wide))""")
        count = await pg.evaluate("document.querySelectorAll('.s').length")
        if not count: sys.exit("no slides rendered (page error?)")
        print(f"{count} slides,", json.dumps(res) if res else "no overflow")
        # full-size shots of option A + one slide per other option, for a visual check
        os.makedirs("shots", exist_ok=True)
        for opt in sys.argv[1:]:
            for el in await pg.query_selector_all(f"#opt{opt} .s"):
                n = await el.get_attribute("data-name")
                await pg.evaluate("(e) => { e.style.transform = 'none'; e.parentElement.style.width='1080px'; e.parentElement.style.height='1350px'; }", el)
                await el.screenshot(path=f"shots/{opt}{n}.png")
        await b.close()
asyncio.run(main())
