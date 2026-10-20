// .pptx из отрендеренных слайдов (1 слайд = 1 картинка на весь экран, как в шаблоне).
const path = require("path");
const pptxgen = require("pptxgenjs");
const notes = [
  "Выбор подхода: Kanban. 1) Требования НЦФГ ещё уточняются — новые вводные сразу поднимаем в приоритете, без ожидания конца спринта. 2) Ответы НКО приходят не мгновенно — задача уходит в Blocked, команда берёт следующую. 3) Исследование, дизайн и разработка идут в разном темпе — доска показывает, где застряло. 4) Небольшой команде нужен лёгкий процесс — вместо жёстких спринтов визуальный поток, WIP ≤ 2 и три коротких синка, этого достаточно, чтобы держать работу прозрачной. Доска: Backlog → To Do → In Progress → Review → Done, Blocked.",
  "Kick-off. Роли: Степан — Product Lead, Fullstack, UI/UX (frontend и интеграция с API, основной контакт с НЦФГ); Арслан — Kanban Flow / Project Manager; Борис — Backend Lead (весь backend и API); София — UX Research / Analyst; Кирилл — QA / Testing Lead. Календарь на 3 недели: Пн — Weekly Planning (15–20 мин), Ср — Short Sync (10–15 мин), Пт — Review + Retro (20–30 мин), связь с НЦФГ — по необходимости: основной контакт Степан, София подключается к интервью и исследованиям.",
];
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "НЦФГ · Коплю–Трачу–Помогаю · ДЗ 3 · Kanban и Kick-off";
notes.forEach((n, i) => {
  const s = pres.addSlide();
  s.addImage({ path: path.join(__dirname, "png", `slide-${i + 1}.png`), x: 0, y: 0, w: 13.333, h: 7.5, altText: n });
  s.addNotes(n);
});
pres.writeFile({ fileName: process.argv[2] }).then(f => console.log("written", f));
