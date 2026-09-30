// Собирает OKR_и_Impact_Map.pptx: слайд 1 — OKR (редактируемый текст), слайд 2 — Impact Map (картинка).
// Запуск из папки СДАЧА_LMS: node исходники/build_pptx.js
const path = require("path");
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"
pres.title = "OKR и Impact Map · НЦФГ «Коплю–Трачу–Помогаю»";

const C = {
  ink: "1B1F24", muted: "5A6270",
  goalBg: "FFE2BF", goalBd: "E07B12", goalLbl: "A85A0C",
  krBg: "F4F7FB", krBd: "D5DCE6", green: "2A8F4A",
};
const F = "Arial";

// ---------- Слайд 1: OKR ----------
const s1 = pres.addSlide();
s1.background = { color: "FFFFFF" };

s1.addText("НЦФГ · «КОПЛЮ–ТРАЧУ–ПОМОГАЮ»", {
  x: 0.6, y: 0.4, w: 12, h: 0.3, margin: 0, fontFace: F, fontSize: 12, bold: true,
  color: C.goalBd, charSpacing: 2, isTextBox: true,
});
s1.addText("OKR: от копилки-подарка к семейной привычке", {
  x: 0.6, y: 0.72, w: 12.1, h: 0.7, margin: 0, fontFace: F, fontSize: 34, bold: true,
  color: C.ink, isTextBox: true,
});
s1.addText("Цифровое продолжение «Умной копилки» · дети 6–10 лет и родители", {
  x: 0.6, y: 1.42, w: 12.1, h: 0.35, margin: 0, fontFace: F, fontSize: 15, color: C.muted, isTextBox: true,
});

// Objective
s1.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 0.6, y: 1.95, w: 12.13, h: 1.35, rectRadius: 0.12,
  fill: { color: C.goalBg }, line: { color: C.goalBd, width: 2 },
});
s1.addText("OBJECTIVE", {
  x: 0.85, y: 1.95, w: 1.5, h: 1.35, margin: 0, valign: "middle", fontFace: F, fontSize: 12,
  bold: true, color: C.goalLbl, charSpacing: 2, isTextBox: true,
});
s1.addText([
  { text: "Превратить «Умную копилку» из разового знакомства в семейную " },
  { text: "привычку", options: { bold: true } },
  { text: ": ребёнок продолжает осознанно копить, тратить и помогать, а родитель уверенно его поддерживает" },
], {
  x: 2.45, y: 2.05, w: 10.05, h: 1.15, margin: 0, valign: "middle", fontFace: F, fontSize: 19,
  color: C.ink, isTextBox: true,
});

// KR cards
const krs = [
  {
    id: "KR1",
    text: [
      { text: "детей пилота с первого раза " },
      { text: "без подсказок", options: { bold: true } },
      { text: " проходят сценарий «распределил → отметил → увидел прогресс к цели»" },
    ],
    how: "юзабилити-тест прототипа с детьми",
    link: "1.1–1.2", who: "ребёнок",
  },
  {
    id: "KR2",
    text: [
      { text: "семей пилота отмечают распределение денег по трём секциям минимум " },
      { text: "3 недели из 4", options: { bold: true } },
    ],
    how: "отметки в трекере за 4 недели пилота",
    link: "1.1", who: "регулярность = Goal",
  },
  {
    id: "KR3",
    text: [
      { text: "родителей оценивают на " },
      { text: "4–5 из 5", options: { bold: true } },
      { text: ": «вижу прогресс ребёнка и знаю, о чём с ним поговорить на этой неделе»" },
    ],
    how: "короткий опрос родителей после пилота",
    link: "2.1", who: "родитель",
  },
];

const cardW = 3.87, gap = 0.26, cardY = 3.55, cardH = 3.3;
krs.forEach((kr, i) => {
  const x = 0.6 + i * (cardW + gap);
  s1.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y: cardY, w: cardW, h: cardH, rectRadius: 0.12,
    fill: { color: C.krBg }, line: { color: C.krBd, width: 1.25 },
  });
  s1.addText([
    { text: kr.id + "  ", options: { fontSize: 14, bold: true, color: C.muted } },
    { text: "≥ X из Y", options: { fontSize: 28, bold: true, color: C.green } },
  ], { x: x + 0.25, y: cardY + 0.2, w: cardW - 0.5, h: 0.55, margin: 0, valign: "middle", fontFace: F, isTextBox: true });
  s1.addText(kr.text, {
    x: x + 0.25, y: cardY + 0.82, w: cardW - 0.5, h: 1.3, margin: 0, valign: "top",
    fontFace: F, fontSize: 14.5, color: C.ink, isTextBox: true,
  });
  s1.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: x + 0.22, y: cardY + 2.2, w: cardW - 0.44, h: 0.62, rectRadius: 0.08,
    fill: { color: "FFFFFF" }, line: { color: C.krBd, width: 0.75 },
  });
  s1.addText([
    { text: "КАК ИЗМЕРИМ", options: { fontSize: 9, bold: true, color: C.muted, charSpacing: 1, breakLine: true } },
    { text: kr.how, options: { fontSize: 12, color: C.ink } },
  ], { x: x + 0.36, y: cardY + 2.24, w: cardW - 0.7, h: 0.54, margin: 0, valign: "middle", fontFace: F, isTextBox: true });
  s1.addText([
    { text: "↳ Impact ", options: { color: C.muted } },
    { text: kr.link, options: { color: C.green, bold: true } },
    { text: " · " + kr.who, options: { color: C.muted } },
  ], { x: x + 0.25, y: cardY + 2.9, w: cardW - 0.5, h: 0.3, margin: 0, fontFace: F, fontSize: 11.5, isTextBox: true });
});

s1.addText("Y (размер пилота) и срок пилота согласуем с НЦФГ. Baseline регулярности пока нет, поэтому измеряем результат пилота, а не «было → стало».", {
  x: 0.6, y: 6.98, w: 12.1, h: 0.3, margin: 0, fontFace: F, fontSize: 10.5, color: C.muted, isTextBox: true,
});
s1.addNotes("Objective продолжает Goal из Impact Map. KR1 → Impact 1.1–1.2 (ребёнок), KR2 → Impact 1.1 (регулярность), KR3 → Impact 2.1 (родитель). X из Y фиксируем после согласования размера пилота с НЦФГ.");

// ---------- Слайд 2: Impact Map ----------
const s2 = pres.addSlide();
s2.background = { color: "FFFFFF" };
// PNG 2400x1536 → ширина 12.13", высота 7.76" не влезает; вписываем по высоте 6.9"
const imgH = 6.9, imgW = imgH * 2400 / 1536;
s2.addImage({
  path: path.join(__dirname, "..", "01_Impact_Map.png"),
  x: (13.333 - imgW) / 2, y: (7.5 - imgH) / 2, w: imgW, h: imgH,
  altText: "Impact Map: цель → акторы (ребёнок, родитель, НЦФГ) → изменения поведения → идеи",
});
s2.addNotes("Impact Map: Goal → Actors → Impacts → Ideas. Пунктир (AR, AI) — опциональные идеи, не ядро.");

pres.writeFile({ fileName: path.join(__dirname, "..", "OKR_и_Impact_Map.pptx") })
  .then(f => console.log("written", f));
