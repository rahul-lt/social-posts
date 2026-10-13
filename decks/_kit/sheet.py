import sys, glob
from PIL import Image
fs = sorted(glob.glob('out/*.png'))
ims = [Image.open(f).resize((540, 675), Image.LANCZOS) for f in fs]
cols = min(3, len(ims)); rows = (len(ims) + cols - 1) // cols
sh = Image.new('RGB', (cols * 550, rows * 685), 'white')
for i, im in enumerate(ims): sh.paste(im, ((i % cols) * 550, (i // cols) * 685))
sh.save(sys.argv[1])
