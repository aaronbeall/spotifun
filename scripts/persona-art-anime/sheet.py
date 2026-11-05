import sys
from PIL import Image, ImageDraw, ImageFont
out, ids = sys.argv[1], sys.argv[2:]
T, pad, lab = 400, 12, 34
cols = 4; rows = (len(ids) + cols - 1) // cols
W = cols * T + (cols + 1) * pad; H = rows * (T + lab) + (rows + 1) * pad
sheet = Image.new('RGB', (W, H), (10, 8, 18)); d = ImageDraw.Draw(sheet)
f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
for i, n in enumerate(ids):
    x = pad + (i % cols) * (T + pad); y = pad + (i // cols) * (T + lab + pad)
    try: im = Image.open(f'out/{n}.png').convert('RGB').resize((T, T), Image.LANCZOS)
    except Exception: continue
    sheet.paste(im, (x, y)); d.text((x + 6, y + T + 7), n.replace('-', ' ').title(), fill=(235, 230, 245), font=f)
sheet.save(out)
