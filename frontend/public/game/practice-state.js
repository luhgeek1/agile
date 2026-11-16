export const situations = [
  {
    title: 'Монетка для мечты', category: 'save', icon: 'star',
    prompt: 'Ты решил отложить 10 монет на самокат. В какой отсек они отправятся?',
    options: ['Коплю', 'Трачу', 'Помогаю'], correct: 0,
    explanation: '«Коплю» хранит деньги на твою цель. Даже маленькая сумма — шаг к мечте.',
    home: 'Найди свою цель в копилке и посмотри, сколько до неё осталось.',
  },
  {
    title: 'Покупка по плану', category: 'spend', icon: 'bag',
    prompt: 'Вы со взрослым запланировали купить карандаши. Из какого отсека запишешь эту покупку?',
    options: ['Коплю', 'Трачу', 'Помогаю'], correct: 1,
    explanation: 'Запланированные покупки — это «Трачу». Сначала проверь цену и сколько есть в отсеке.',
    home: 'Перед следующей покупкой назови её цену и свой бюджет.',
  },
  {
    title: 'Корм для приюта', category: 'help', icon: 'heart',
    prompt: 'Вместе со взрослым ты решил купить корм для приюта. Какой отсек подходит для этого плана?',
    options: ['Коплю', 'Трачу', 'Помогаю'], correct: 2,
    explanation: 'Для выбранного доброго дела есть «Помогаю». Размер помощи вы решаете вместе; помогать деньгами необязательно.',
    home: 'Придумайте ещё один способ помочь без денег.',
  },
  {
    title: 'Хватит ли на всё?', category: 'spend', icon: 'fruit',
    prompt: 'В «Трачу» 40 монет. Яблоко стоит 20, сок — 30. Хватит на обе покупки?',
    options: ['Да, останется 10', 'Не хватит 10', 'Хватит ровно'], correct: 1,
    explanation: '20 + 30 = 50. Есть 40, значит, не хватает 10. Можно выбрать одну покупку или пересмотреть план.',
    home: 'Посчитай со взрослым стоимость двух вещей до покупки.',
  },
  {
    title: 'Мечта стала ближе', category: 'save', icon: 'coin',
    prompt: 'Книга стоит 100 монет. В «Коплю» было 60, ты добавил ещё 10. Сколько осталось накопить?',
    options: ['40 монет', '10 монет', '30 монет'], correct: 2,
    explanation: 'Теперь есть 60 + 10 = 70. До 100 осталось 30. Прогресс меняется от записанных действий, а не от побед в игре.',
    home: 'Если положил настоящие монетки, запиши это действие в копилке.',
  },
  {
    title: 'Добро без покупки', category: 'help', icon: 'plant',
    prompt: 'Свободных денег сейчас нет, а ты хочешь помочь. Что можно сделать?',
    options: ['Полить растение со взрослым', 'Обязательно отдать все накопления', 'Подождать: без денег помочь нельзя'], correct: 0,
    explanation: 'Время и забота тоже важны. Не нужно отдавать все накопления, чтобы сделать доброе дело.',
    home: 'Выбери небольшое доброе дело, которое тебе по силам.',
  },
];

const key = 'kopilka-practice-v1';
const fresh = () => ({ cursor: 0, round: [], mastered: [] });
let progress = fresh();
let storageAvailable = true;
function validIds(ids) {
  return Array.isArray(ids) && ids.length <= situations.length &&
    ids.every(id => Number.isInteger(id) && id >= 0 && id < situations.length) &&
    new Set(ids).size === ids.length;
}
try {
  const saved = JSON.parse(localStorage.getItem(key) || 'null');
  if (saved && Number.isInteger(saved.cursor) && saved.cursor >= 0 &&
      saved.cursor <= situations.length && validIds(saved.round) && validIds(saved.mastered) &&
      saved.round.every((id, index) => id === index && saved.mastered.includes(id)) &&
      saved.round.length >= saved.cursor && saved.round.length <= saved.cursor + 1) progress = saved;
} catch { storageAvailable = false; }

function persist() {
  try { localStorage.setItem(key, JSON.stringify(progress)); }
  catch { storageAvailable = false; }
}
export function practiceProgress() {
  return { ...progress, round: [...progress.round], mastered: [...progress.mastered], storageAvailable };
}
export function answerSituation(answer) {
  const { cursor, round, mastered } = progress;
  if (!situations[cursor] || round.includes(cursor)) return null;
  if (answer !== situations[cursor].correct) return false;
  round.push(cursor);
  if (!mastered.includes(cursor)) mastered.push(cursor);
  persist();
  return true;
}
export function nextSituation() {
  if (progress.round.includes(progress.cursor)) progress.cursor++;
  persist();
}
export function restartPractice() {
  progress = { ...fresh(), mastered: progress.mastered };
  persist();
}
export function resetPractice() {
  progress = fresh();
  persist();
}
