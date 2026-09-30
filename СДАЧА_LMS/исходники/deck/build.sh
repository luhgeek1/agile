#!/bin/zsh
# Пересобрать всё после правок deck.html: PNG слайдов, PDF, PPTX и два скриншота для LMS.
# Запуск: zsh исходники/deck/build.sh   (из папки СДАЧА_LMS)
set -e
D="${0:A:h}"; OUT="$D/../.."
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p "$D/png"
for n in 1 2; do
  "$CH" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1.5 --window-size=1920,1080 \
    --virtual-time-budget=4000 --screenshot="$D/png/slide-$n.png" "file://$D/deck.html?s=$n" >/dev/null 2>&1
done
cp "$D/png/slide-1.png" "$OUT/01_Impact_Map.png"
cp "$D/png/slide-2.png" "$OUT/02_OKR_slide.png"
"$CH" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=5000 \
  --print-to-pdf="$OUT/Презентация_НЦФГ_Impact_Map_OKR.pdf" "file://$D/deck.html" >/dev/null 2>&1
# pptxgenjs ставим во временную папку, чтобы не засорять сдачу
T="${TMPDIR:-/tmp}/pptxgen_env"; mkdir -p "$T"
[ -d "$T/node_modules/pptxgenjs" ] || (cd "$T" && npm i pptxgenjs --silent >/dev/null 2>&1)
NODE_PATH="$T/node_modules" node "$D/build_pptx.js" "$OUT/Презентация_НЦФГ_Impact_Map_OKR.pptx"
echo "готово"
