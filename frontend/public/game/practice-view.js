import { situations, practiceProgress, answerSituation, nextSituation, restartPractice } from './practice-state.js';

export function practiceView(icon) {
  const { cursor, round, mastered, storageAvailable } = practiceProgress();
  const situation = situations[cursor];
  const notice = storageAvailable ? '' : '<p class="storage-note" role="status">Тренировка работает, но браузер не разрешает сохранять её прогресс.</p>';
  const back = `<button class="back" data-nav="map">${icon('back')} Карта приключений</button>`;
  if (!situation) return `${back}${notice}<section class="result practice-result">
    <span class="earned-seal">${icon('star')}</span><div class="badge">ЗНАЧОК В КОЛЛЕКЦИИ</div>
    <h1>Знаток трёх отсеков</h1>
    <p>Ты разобрался в шести ситуациях: как копить, выбирать покупки и помогать.
    Теперь попробуй одно маленькое дело вместе со взрослым.</p>
    <div class="family-task"><strong>Из игры — в жизнь</strong>
      <p>Пересчитайте монетки в настоящей копилке. Совпадают ли они с вашими записями?</p></div>
    <div class="action-row"><button class="secondary" data-practice="restart">Потренироваться ещё</button>
      <a class="primary" href="/app/activities">Выбрать настоящее дело ${icon('arrow')}</a></div>
    <p class="micro">Значок остаётся с тобой. Повторы не добавляют наград или денег.</p>
  </section>`;
  const answered = round.includes(cursor);
  return `${back}${notice}<div class="game-title"><div class="eyebrow">Тренировка · без спешки</div>
    <h1>Мастерская решений</h1><p>Выбери ответ и узнай, почему он подходит.</p></div>
    <div class="practice-layout"><section class="game-board practice-board" aria-label="Жизненная ситуация">
      <div class="practice-position"><span>Ситуация ${cursor + 1} из ${situations.length}</span>
        <span>Разобрались: ${round.length} из ${situations.length}</span></div>
      <div class="meter" role="progressbar" aria-label="Прогресс тренировки"
        aria-valuemin="0" aria-valuemax="6" aria-valuenow="${round.length}">
        <span style="width:${round.length / situations.length * 100}%"></span></div>
      <div class="situation-illustration ${situation.category}">${icon(situation.icon)}</div>
      <h2>${situation.title}</h2><p class="situation-prompt">${situation.prompt}</p>
      <div class="quiz-options">${situation.options.map((option, index) => `
        <button class="quiz-option ${answered && index === situation.correct ? 'correct' : ''}"
          data-practice-answer="${index}" ${answered ? 'disabled' : ''}>
          <span>${answered && index === situation.correct ? '✓' : index + 1}</span>${option}</button>`).join('')}</div>
      <div class="feedback" id="practice-feedback" role="status" tabindex="-1">${answered ?
        `<strong>Открытие с тобой!</strong>${situation.explanation}` : ''}</div>
      <div class="action-row"><p class="action-hint">Можно ошибаться и пробовать снова. Значки не исчезнут.</p>
        <button class="primary" data-practice="next" ${answered ? '' : 'disabled'}>
          ${cursor === situations.length - 1 ? 'Получить значок' : 'Следующая ситуация'} ${icon('arrow')}</button></div>
    </section><aside class="side-note practice-guide"><h2>Маленький шаг дома</h2>
      <p>${situation.home}</p><div class="small-note">${icon('info')}
      Это учебные ситуации. Настоящие деньги в копилке не меняются.</div>
      <p>Уже знакомо: ${mastered.length} из ${situations.length} ситуаций.</p>
    </aside></div>`;
}

export function handlePractice(button, render, announce) {
  if (button.dataset.practiceAnswer !== undefined) {
    const answer = Number(button.dataset.practiceAnswer);
    const result = answerSituation(answer);
    if (result === null) return;
    if (result) {
      render(false);
      document.querySelector('[data-practice="next"]').focus();
      announce('Открытие с тобой! ' + situations[practiceProgress().cursor].explanation);
    } else {
      const feedback = document.querySelector('#practice-feedback');
      feedback.innerHTML = '<strong>Давай разберёмся вместе</strong>' + situations[practiceProgress().cursor].explanation;
      document.querySelectorAll('[data-practice-answer]').forEach(option => option.classList.remove('incorrect'));
      button.classList.add('incorrect');
    }
  } else if (button.dataset.practice === 'next') {
    nextSituation();
    render();
  } else if (button.dataset.practice === 'restart') {
    restartPractice();
    render();
  }
}
