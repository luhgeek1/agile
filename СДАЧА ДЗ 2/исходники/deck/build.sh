#!/bin/zsh
# Пересобрать PNG, PDF и PPTX после правок deck.html. Запуск: zsh "исходники/deck/build.sh" (из папки «СДАЧА ДЗ 2»)
set -e
D="${0:A:h}"; OUT="${D:h:h}"
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
U=$(python3 -c "import pathlib,sys;print(pathlib.Path(sys.argv[1]).as_uri())" "$D/deck.html")
mkdir -p "$D/png"
for n in 1 2; do
  "$CH" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1.5 --window-size=1920,1080 \
    --virtual-time-budget=4000 --screenshot="$D/png/slide-$n.png" "$U?s=$n" >/dev/null 2>&1
done
cp "$D/png/slide-1.png" "$OUT/01_Выбор_подхода_Kanban.png"
cp "$D/png/slide-2.png" "$OUT/02_Kick-off_команды.png"
"$CH" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=5000 \
  --print-to-pdf="$OUT/Презентация_ДЗ3_Kanban_Kick-off.pdf" "$U" >/dev/null 2>&1
T="${TMPDIR:-/tmp}/pptxgen_env"; mkdir -p "$T"
[ -d "$T/node_modules/pptxgenjs" ] || (cd "$T" && npm i pptxgenjs --silent >/dev/null 2>&1)
NODE_PATH="$T/node_modules" node "$D/build_pptx.js" "$OUT/Презентация_ДЗ3_Kanban_Kick-off.pptx"
echo "готово"
