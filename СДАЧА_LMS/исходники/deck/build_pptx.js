// Собирает .pptx из отрендеренных слайдов (как устроен исходный шаблон: 1 слайд = 1 картинка на весь экран).
// Запуск: NODE_PATH=<папка с pptxgenjs>/node_modules node build_pptx.js
const path = require("path");
const pptxgen = require("pptxgenjs");

const notes = [
  "Impact Map. Goal: семьи продолжают регулярно практиковать «Коплю–Трачу–Помогаю» после первого знакомства с «Умной копилкой». Акторы: ребёнок 6–10 лет, родитель, НЦФГ и волонтёры. У каждого — 2 изменения поведения с метрикой; идеи привязаны к конкретному изменению. AR и AI — опционально/гипотеза.",
  "OKR. Objective: превратить «Умную копилку» из разового знакомства в семейную привычку. KR1 → Impact 1.1–1.2, KR2 → 1.1, KR3 → 2.1. X из Y фиксируем после согласования размера пилота с НЦФГ; baseline пока нет.",
];

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "НЦФГ · Коплю–Трачу–Помогаю · Impact Map и OKR";
notes.forEach((n, i) => {
  const s = pres.addSlide();
  s.addImage({ path: path.join(__dirname, "png", `slide-${i + 1}.png`), x: 0, y: 0, w: 13.333, h: 7.5, altText: n });
  s.addNotes(n);
});
pres.writeFile({ fileName: process.argv[2] }).then(f => console.log("written", f));
