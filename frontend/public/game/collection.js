import { practiceProgress, situations } from './practice-state.js';

const badges = [
  { title: 'Хранитель мечты', art: 'kite', category: 'save', rule: 'Пройди историю «Мечта взлетает».', lesson: 'У мечты есть цена и свой план накоплений.' },
  { title: 'Вдумчивый покупатель', art: 'basket', category: 'spend', rule: 'Пройди историю «Пикник без лишнего».', lesson: 'Список и бюджет помогают выбирать покупки.' },
  { title: 'Друг добрых дел', art: 'plant', category: 'help', rule: 'Пройди историю «Добро по силам».', lesson: 'Время и внимание помогают не меньше денег.' },
  { title: 'Исследователь парка', icon: 'leaf', category: 'save', rule: 'Сделай открытия во всех трёх историях.', lesson: 'Ты попробовал копить, выбирать и помогать.' },
  { title: 'Знаток трёх отсеков', icon: 'star', category: 'help', rule: 'Разберись во всех шести ситуациях в тренировке.', lesson: 'Ты умеешь находить решения в разных ситуациях.' },
];

function earned(index, completed) {
  if (index < 3) return completed.some(run => run.id === index);
  return index === 3 ? completed.length === 3 : practiceProgress().mastered.length === situations.length;
}

export function collectionView(completed, icon, art) {
  const count = badges.filter((_, index) => earned(index, completed)).length;
  const practice = practiceProgress();
  return `<section class="passport" aria-labelledby="passport-title">
    <div class="passport-heading"><div><h2 id="passport-title">Твоя коллекция открытий</h2>
      <p>Каждый значок — то, в чём ты разобрался. Нажми и узнай, как его получить.</p></div>
      <strong class="passport-count">${count}<span> из ${badges.length}</span></strong></div>
    <div class="badge-shelf">${badges.map((badge, index) => {
      const unlocked = earned(index, completed);
      return `<button class="discovery-badge ${badge.category} ${unlocked ? 'earned' : 'waiting'}"
        data-badge="${index}" aria-label="${badge.title}: ${unlocked ? 'получен' : 'как получить'}">
        <span class="badge-art">${badge.art ? art(badge.art) : icon(badge.icon)}</span>
        <strong>${badge.title}</strong><span class="badge-status">${icon(unlocked ? 'check' : 'lock')}
          ${unlocked ? 'Открытие с тобой' : 'Ещё впереди'}</span></button>`;
    }).join('')}</div>
    <p class="passport-note">Без сроков и сравнения с другими. Значки не исчезают за пропуски и не превращаются в деньги.</p>
    <div class="practice-invitation"><span class="habit-icon help">${icon('star')}</span>
      <div><h3>А как поступишь ты?</h3><p>Шесть коротких ситуаций о монетках и заботе.
        Уже знакомо: ${practice.mastered.length} из ${situations.length}.</p></div>
      <button class="primary" data-nav="practice">${practice.cursor > 0 && practice.cursor < situations.length ? 'Продолжить тренировку' : 'В мастерскую'} ${icon('arrow')}</button></div>
  </section>`;
}

export function badgeDetails(index, completed, openModal, icon) {
  const badge = badges[index];
  if (!badge) return;
  const unlocked = earned(index, completed);
  openModal(badge.title, `<div class="earned-seal">${icon(unlocked ? 'check' : 'lock')}</div>
    <p><strong>${unlocked ? 'Значок уже в твоей коллекции!' : 'Твоё следующее открытие'}</strong></p>
    <p>${unlocked ? badge.lesson : badge.rule}</p>
    <p>Можно идти в своём темпе. Ошибки помогают учиться.</p>
    <button class="primary full" data-action="close">Понятно</button>`);
}

export function earnedTitle(id) { return badges[id]?.title ?? ''; }
