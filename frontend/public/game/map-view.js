const labels = ['Коплю', 'Трачу', 'Помогаю'];
const tones = ['save', 'spend', 'help'];

function currentRoute(routes, target) {
  return routes.findIndex(route => route.stories.some(story => story.id === target));
}

export function routePanel(route, count, total, icon, park) {
  const placements = route.stories.length === 2 ? ['one', 'three'] : ['one', 'two', 'three'];
  return `<section id="route-map" class="map-panel" aria-label="Карта: ${route.title}">
    ${park()}
    <div class="map-topline">${icon('leaf')} Твой маршрут</div>
    <div class="map-chip">${count} из ${total} открытий</div>
    <div class="map-stops">
      ${route.stories.map((story, index) => {
        const done = story.id < count;
        const locked = story.id > count;
        const category = story.category ?? story.id;
        return `<button class="landmark ${placements[index]} ${tones[category]} ${done ? 'done' : locked ? 'locked' : ''}"
          data-mission="${story.id}" ${story.id === count ? 'aria-current="step"' : ''}
          aria-label="${story.id + 1}. ${story.title}${done ? ', пройдено' : locked ? ', пока закрыто' : ''}">
          <span class="num" aria-hidden="true">${done ? '✓' : locked ? icon('lock') : story.id + 1}</span>
          <span><small>${labels[category]}</small><strong>${story.title}</strong></span>
        </button>`;
      }).join('')}
    </div>
    <div class="map-bottom"><span>${icon('leaf')} Иди в своём темпе</span>
      <span>Истории открываются по очереди</span></div>
  </section>`;
}

export function mapView({ missions, routes, state, selectedRoute, icon, park, jar }) {
  const count = state.completed.length;
  const total = missions.length;
  const complete = count === total;
  const active = state.active?.phase !== 'result' ? state.active : null;
  const target = active?.id ?? Math.min(count, total - 1);
  const story = missions[target];
  const routeIndex = selectedRoute ?? currentRoute(routes, target);

  return `<div class="intro"><div><div class="eyebrow">${icon('sun')} Играем и учимся вместе</div>
    <h1>Парк маленьких открытий</h1><p>Копи на мечту, выбирай покупки и помогай другим.</p></div>
    <span class="session-pill">${icon('clock')} ${total} историй · по 3–5 минут</span></div>
    ${complete ? `<div class="journey-complete"><div><strong>Все истории пройдены!</strong>
      <p>Можно повторить любимую историю или обсудить открытия со взрослым.</p></div>
      <button class="secondary" data-nav="parents">Мои открытия →</button></div>` : ''}
    <div class="route-picker">
      <label for="route-select">Участок парка</label>
      <select id="route-select" aria-controls="route-map">
        ${routes.map((route, index) => {
          const first = route.stories[0].id + 1;
          const last = route.stories.at(-1).id + 1;
          return `<option value="${index}" ${index === routeIndex ? 'selected' : ''}>${first}–${last} · ${route.title}</option>`;
        }).join('')}
      </select>
    </div>
    <div class="map-layout">
      ${routePanel(routes[routeIndex], count, total, icon, park)}
      <aside class="guide-card">${jar('save', 'guide-art')}
        <div class="tiny">${complete && !active ? 'Твои открытия' : `История ${target + 1} из ${total}`}</div>
        <h2>${complete && !active ? 'Весь парк открыт' : story.title}</h2>
        <p>${active ? 'Мы сохранили твой выбор. Продолжим с того же места?' : complete
          ? 'Выбери любую историю на карте и посмотри, что изменится, если решить иначе.' : story.intro}</p>
        ${complete && !active ? '' : `<button class="primary full" data-action="${active ? 'resume' : 'start'}"
          data-id="${target}">${active ? 'Продолжить' : count ? 'Начать историю' : 'Начать приключение'} ${icon('arrow')}</button>`}
        <div class="journey-progress">
          <progress value="${count}" max="${total}" aria-label="Пройдено историй"></progress>
          <span>${count} из ${total} пройдено</span>
        </div>
      </aside>
    </div>`;
}
