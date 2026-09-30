#!/bin/zsh
# Перерисовать PNG, PDF и .pptx после правок в HTML. Запуск: zsh исходники/render.sh (из папки СДАЧА_LMS)
set -e
cd "${0:A:h}/.."
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=2400,2200 \
  --virtual-time-budget=3000 --screenshot="$PWD/_raw_map.png" "file://$PWD/исходники/impact_map.html" 2>/dev/null
python3 -c "
from PIL import Image, ImageChops
im=Image.open('_raw_map.png').convert('RGB')
b=ImageChops.difference(im,Image.new('RGB',im.size,(255,255,255))).getbbox()
im.crop((0,0,im.width,min(im.height,b[3]+45))).save('01_Impact_Map.png')"
rm _raw_map.png
"$CH" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1920,1080 \
  --virtual-time-budget=2000 --screenshot="$PWD/02_OKR_slide.png" "file://$PWD/исходники/okr_slide.html" 2>/dev/null
"$CH" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=4000 \
  --print-to-pdf="$PWD/Презентация_Impact_Map_OKR.pdf" "file://$PWD/исходники/presentation.html" 2>/dev/null
# .pptx: нужен pptxgenjs (npm i pptxgenjs во временной папке)
node исходники/build_pptx.js || echo "pptxgenjs не установлен — PNG обновлены, .pptx нет"
