import { situations, practiceProgress, answerSituation, nextSituation, restartPractice } from './practice-state.js';

export function practiceView(icon) {
  const { cursor, round, storageAvailable } = practiceProgress();
  const situation = situations[cursor];
  const notice = storageAvailable ? '' : '<p class="storage-note" role="status">Тренировка работает, но браузер не разрешает сохранять её прогресс.</p>';
  const back = `<button class="back" data-nav="map">${icon('back')} В парк</button>`;
  if (!situation) return `${back}${notice}<section class="result practice-result">
    <span class="earned-seal">${icon('star')}</span><div class="badge">ЗНАЧОК В КОЛЛЕКЦИИ</div>
    <h1>Знаток трёх отсеков</h1>
    <p>Ты решил все шесть задач.</p>
    <div class="action-row"><button class="secondary" data-practice="restart">Потренироваться ещё</button>
      <a class="primary" href="/app/activities">Выбрать настоящее дело ${icon('arrow')}</a></div>
  </section>`;
  const answered = round.includes(cursor);
  return `<div class="story-screen">${back}${notice}<div class="game-title"><h1>Мастерская решений</h1></div>
    <section class="game-board practice-board" aria-label="Ситуация">
      <div class="practice-position">Ситуация ${cursor + 1} из ${situations.length}</div>
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
      <div class="action-row">
        <button class="primary" data-practice="next" ${answered ? '' : 'disabled'}>
          ${cursor === situations.length - 1 ? 'Получить значок' : 'Следующая ситуация'} ${icon('arrow')}</button></div>
    </section></div>`;
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
