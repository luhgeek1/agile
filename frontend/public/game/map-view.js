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

export function mapView({ missions, routes, state, selectedRoute, icon, park, mascot }) {
  const count = state.completed.length;
  const total = missions.length;
  const complete = count === total;
  const active = state.active?.phase !== 'result' ? state.active : null;
  const target = active?.id ?? Math.min(count, total - 1);
  const story = missions[target];
  const routeIndex = selectedRoute ?? currentRoute(routes, target);

  return `<section class="play-intro" aria-labelledby="park-title">
    <div class="play-intro-copy">
      <h1 id="park-title">Парк маленьких открытий</h1>
      <p class="play-progress">${count} из ${total} историй пройдено</p>
      ${complete && !active
        ? '<button class="primary" data-nav="collection">Мои значки</button>'
        : `<p class="play-story">${story.title}</p>
          <button class="primary" data-action="${active ? 'resume' : 'start'}" data-id="${target}">
            ${active ? 'Продолжить' : 'Начать игру'} ${icon('arrow')}
          </button>`}
    </div>
    <div class="play-intro-art" aria-hidden="true">
      ${park()}
      ${mascot('save')}
    </div>
  </section>
  <div class="play-extra">
    <button class="secondary" data-nav="practice">Тренировка</button>
    ${complete && !active ? '' : '<button class="secondary" data-nav="collection">Мои значки</button>'}
  </div>
  <details class="play-disclosure" ${selectedRoute !== null ? 'open' : ''}>
    <summary>Все истории</summary>
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
    ${routePanel(routes[routeIndex], count, total, icon, park)}
  </details>`;
}
