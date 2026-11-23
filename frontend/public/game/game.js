'use strict';
import { practiceView, handlePractice } from './practice-view.js';
import { practiceProgress, resetPractice, situations } from './practice-state.js';
import { collectionView, badgeDetails, earnedTitle } from './collection.js';
import { mapView, routePanel } from './map-view.js';
import { plans } from './stories/plans.js';
import { market } from './stories/market.js';
import { neighbors } from './stories/neighbors.js';
import { pond } from './stories/pond.js';
import { exchange } from './stories/exchange.js';
import { festival } from './stories/festival.js';
const STORAGE_KEY = 'kopilka-park-v1';
const names = ['Коплю', 'Трачу', 'Помогаю'];
const cats = ['save', 'spend', 'help'];
const firstStories = [
  {id:0,from:1,options:[
      ['Мороженое',20,'','ice','Небольшая радость сейчас'],
      ['Наклейки',40,'','star','Украшение для твоих вещей'],
      ['Обойдусь без покупки',0,'','kite','Сохраню монеты на другой раз'],
    ],result:'У мечты появился план',title:'Мечта взлетает',place:'Мастерская воздушных змеев',topic:'Копим на мечту',budget:100,initial:60,goal:120,art:'kite',
    intro:'Змей стоит 120 монет. Ты уже накопил 60.',
    aside:'Отложенные монеты приближают мечту. Можно оставить часть на покупки и помощь — решение за тобой.',
    eventTitle:'Заглянем в киоск?',eventText:'Выбери покупку или оставь монеты на потом.',
    question:'Что произойдёт с накоплениями, если взять 20 монет из «Коплю» на другую покупку?',
    answers:['В «Коплю» станет на 20 монет меньше.','Ничего: накопления не изменятся.','Мечта сразу станет дешевле.'],correct:0,
    explanation:'Если взять 20 монет из «Коплю», на мечту останется на 20 меньше.',
    family:'Придумайте вместе небольшую цель. Сколько она стоит? Сколько уже есть? Обсудите, какую часть следующих карманных денег ребёнок хочет отложить.',
    talk:'Почему ты выбрал именно такое распределение? Что изменится, если отложить на 10 монет больше?'
  },
  {id:1,from:1,items:[
      {name:'Фрукты',needed:true,desc:'Чтобы перекусить',price:30,icon:'fruit'},
      {name:'Вода',needed:true,desc:'Чтобы утолить жажду',price:20,icon:'water'},
      {name:'Вертушка',desc:'Поиграть на ветру',price:50,icon:'toy'},
    ],result:'У каждой покупки есть цена',title:'Пикник без лишнего',place:'Лавка у большой поляны',topic:'Выбираем покупки',budget:80,initial:0,goal:50,art:'basket',
    intro:'На пикник нужны фрукты и вода.',
    aside:'Фрукты и вода обойдутся в 50 монет. Сначала план, потом покупки. Необязательно тратить всё, что есть.',
    eventTitle:'Что положим в корзину?',eventText:'Положи в корзину фрукты и воду. Хватит ли монет на вертушку?',
    question:'Монет не хватает на всё. Что поможет собрать нужное для пикника?',
    answers:['Купить самое яркое, а потом посмотреть на остаток.','Сначала посчитать стоимость нужных покупок.','Положить в корзину всё — денег станет больше.'],correct:1,
    explanation:'Сначала посчитай, сколько стоят нужные покупки.',
    family:'Перед небольшой покупкой составьте список из двух нужных вещей и одной желаемой. Посчитайте стоимость и обсудите, что помещается в бюджет.',
    talk:'Какие покупки были нужны именно для пикника? Было ли трудно отказаться от вертушки?'
  },
  {id:2,from:2,options:[
      ['Куплю семена',30,'','plant','Из отсека «Помогаю»'],
      ['Помогу полить цветы',0,'','water','Вместе со взрослым'],
      ['Нарисую табличку для клумбы',0,'','star','Помогу своим временем и умением'],
    ],result:'Помогать можно по-разному',title:'Добро по силам',place:'Сад добрых дел',topic:'Помогаем по-разному',budget:60,initial:0,goal:30,art:'plant',
    intro:'Соседи сажают цветы. Им пригодится твоя помощь.',
    aside:'Помощь бывает разной: деньгами, временем, заботой. Выбери посильный способ — здесь нет соревнования, кто отдаст больше.',
    eventTitle:'Как помочь саду?',eventText:'Выбери, чем хочешь помочь.',
    question:'У друга нет свободных денег. Может ли он помочь саду?',
    answers:['Нет, помощь всегда стоит денег.','Да, но только если отдаст все накопления.','Да: например, полить цветы вместе со взрослым.'],correct:2,
    explanation:'Можно помочь делом. Например, полить цветы.',
    family:'Выберите одно небольшое доброе дело на неделю. Например, вместе полить растения или помочь знакомому. Денежная помощь не обязательна.',
    talk:'Какой способ помощи тебе ближе? Что можно сделать без денег и с кем это безопасно обсудить?'
  }
];
const routes = [{ title: 'Первые открытия', stories: firstStories }, plans, market, neighbors, pond, exchange, festival];
const missions = routes.flatMap(route => route.stories);
let selectedRoute = null;

const icons = {
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',back:'<path d="M19 12H5m6-6-6 6 6 6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',leaf:'<path d="M20 4c-10-2-17 3-15 10 2 7 12 6 15-10Z"/><path d="m5 20 9-10"/>',
  heart:'<path d="M20 5c-3-3-7-1-8 2-1-3-5-5-8-2-6 6 8 15 8 15S26 11 20 5Z"/>',
  bag:'<path d="M5 7h14l2 14H3L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2m-7 6 2 2 4-4"/>',
  coin:'<circle cx="12" cy="12" r="9"/><path d="M10 17V7h4a3 3 0 0 1 0 6H8m0 2h7"/>',
  check:'<path d="m5 12 4 4L19 6"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  water:'<path d="M9 3h6v4l3 4v9H6v-9l3-4V3Zm0 0h6M6 14h12"/>',
  fruit:'<path d="M12 8c-8-6-12 5-6 11 3 3 5 0 6 0s3 3 6 0c6-6 2-17-6-11Z"/><path d="M12 8V3m0 2c4-4 7-2 7-2s-2 4-7 2"/>',
  toy:'<path d="M12 12v10m0-10L5 3l-3 9h10Zm0 0L21 5l-9-3v10Zm0 0 7 9 3-9H12Z"/>',
  ice:'<path d="m7 11 5 11 5-11H7Z"/><path d="M6 11a3 3 0 0 1-1-5 7 7 0 0 1 14 0 3 3 0 0 1-1 5Z"/>',
  star:'<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/>',
  plant:'<path d="M12 22V9m0 5C1 14 3 4 3 4s10-1 9 10Zm0-4C12 1 22 2 22 2s1 9-10 8Z"/>',
  hand:'<path d="M3 14h5l3-3h7c2 0 2 3 0 3h-5m-5 0 5 4 7-3c3-1 4 1 2 3l-8 4-9-5H3V14Z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/>'
};
function icon(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.star}</svg>`}
function art(type,cls=''){
 const common='stroke-linecap="round" stroke-linejoin="round"';
 const body={
 kite:`<path d="M93 106c32 21-33 26-8 44s39 4 32 22" fill="none" stroke="#9b7f58" stroke-width="3"/><path d="m55 57 45-42 47 45-47 58Z" fill="#bfe8df" stroke="#337b78" stroke-width="2.5"/><path d="m100 15 47 45h-47Z" fill="#f1b2c7"/><path d="m55 57 45 61V59Z" fill="#f6d477"/><path d="M100 15v103M55 57l92 3" stroke="#fff8e7" stroke-width="3"/><path d="m78 128 13 3-10 11m28 12 13-4-4 13" fill="#dd7b9c"/><path d="m42 28 4 4m106 83 7 2m-2-75 5-4" stroke="#b8c69b" stroke-width="3"/>`,
 basket:`<path d="M48 80h108l-11 65H59Z" fill="#deb378"/><path d="M64 81c0-63 77-63 77 0" fill="none" stroke="#a27a4e" stroke-width="8"/><path d="M66 94h74M64 110h80M64 126h80M79 85v52m22-52v52m22-52v52" stroke="#efcf99" stroke-width="3"/><circle cx="82" cy="69" r="20" fill="#dd7790"/><path d="M81 50v-9m0 4c9-10 18-3 18-3s-8 10-18 3" stroke="#5e9469" stroke-width="3" fill="#a4c789"/><rect x="109" y="50" width="22" height="42" rx="7" fill="#a2d8d6"/><path d="M116 50V39h9v11" fill="#77b9be"/><path d="M113 70h14" stroke="#e6f4ec" stroke-width="10"/>`,
 plant:`<ellipse cx="100" cy="153" rx="59" ry="9" fill="#d6dfc6"/><path d="M69 105h63l-9 44H78Z" fill="#dd9f7a"/><rect x="64" y="98" width="73" height="14" rx="6" fill="#efbd98"/><path d="M100 100V43" stroke="#4b8e6c" stroke-width="5"/><path d="M99 78C58 83 54 52 54 52s42-8 45 26Z" fill="#7eaf87"/><path d="M101 61c35 4 45-28 45-28s-38-7-45 28Z" fill="#a2c69a"/><path d="m81 52 2-9m41 52 7 4m-67 20-8 3" stroke="#d9b453" stroke-width="3"/><path d="M96 127q5 6 10 0" stroke="#976d53" stroke-width="2.5" fill="none"/><circle cx="87" cy="120" r="2.5" fill="#976d53"/><circle cx="114" cy="120" r="2.5" fill="#976d53"/>`
 };
 return `<svg class="${cls}" viewBox="0 0 200 180" fill="none" ${common} aria-hidden="true">${body[type]||body.kite}</svg>`;
}
function mascot(category='save',className=''){
  return `<img class="mascot ${className}" src="/brand/${category}.webp" alt="">`;
}
function tree(x,y,s=1,color='#91b69b'){return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="40" rx="27" ry="8" fill="#789b7920"/><path d="M0 10v30" stroke="#a38c6c" stroke-width="6" stroke-linecap="round"/><path d="M0-49c-25 0-36 18-29 33-16 18-1 40 21 34 15 16 44 2 38-19C44-20 21-51 0-49Z" fill="${color}"/><path d="M0-17V14m-13-17L0 7m14-19L0 0" stroke="#698d73" stroke-width="2" opacity=".45"/></g>`}
function park(){return `<svg class="park" viewBox="0 0 820 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="820" height="480" fill="#edf2e4"/><path d="M-30 115C89 32 135 122 212 74S349 16 441 56s171-4 222-2 140-6 191 35v-110H-20Z" fill="#e3ebd9"/><path d="M-15 344C55 326 134 400 232 368s177 54 266 3 213 2 323-66v190H-15Z" fill="#dfead6"/><path d="M111 382C65 269 213 327 253 237s85-57 132-48 166-34 155 62 69 108 168 103" stroke="#d6cba5" stroke-width="58" fill="none" stroke-linecap="round"/><path d="M111 382C65 269 213 327 253 237s85-57 132-48 166-34 155 62 69 108 168 103" stroke="#fff8df" stroke-width="46" fill="none" stroke-linecap="round"/><path d="M129 337c16-19 43-22 68-43m95-95c19-15 42-13 62-11m187 99c2 22 18 41 33 51" stroke="#dfd2ae" stroke-width="3" stroke-dasharray="3 10" fill="none" stroke-linecap="round"/><ellipse cx="664" cy="167" rx="102" ry="47" fill="#c2dfd8"/><ellipse cx="664" cy="165" rx="82" ry="31" fill="#b2d6d0"/><path d="M625 154h30m18 20h34m-61 8h20" stroke="#e9f5e9" stroke-width="3" stroke-linecap="round"/><g transform="translate(670 143)"><ellipse cx="0" cy="9" rx="12" ry="5" fill="#f7e4a6"/><path d="M-5 7V0c0-10 12-10 12-3v6l7 1-7 4" fill="#f7e4a6"/><circle cx="3" cy="-3" r="1.5" fill="#5c6b4e"/></g>${tree(62,110,1.04)}${tree(111,79,.7,'#abc393')}${tree(756,90,.85)}${tree(784,314,1.1,'#93b39b')}${tree(47,379,.85)}${tree(347,362,.8,'#abc393')}${tree(586,76,.6,'#abc393')}${tree(469,91,.63)}<g transform="translate(151 174)"><ellipse cy="74" rx="61" ry="11" fill="#96ad8220"/><path d="M-45 15h90v57h-90Z" fill="#f6e9c9"/><path d="M-55 16 0-22 55 16Z" fill="#80ada3"/><path d="M-45 19h90" stroke="#5f9186" stroke-width="4"/><path d="M-13 72V32h26v40" fill="#b89e7c"/><rect x="-36" y="30" width="16" height="20" rx="2" fill="#b8d8cd"/><rect x="21" y="30" width="16" height="20" rx="2" fill="#b8d8cd"/><path d="M-33 40h11m6-8v15m43-8h10" stroke="#e8f1de" stroke-width="2"/><path d="m8-22 11-48 14 12-19 20" stroke="#8a9c7f" stroke-width="1.5" fill="#e7b4c4"/><path d="m19-70 14 12-19 20" fill="#efd27e"/></g><g transform="translate(407 100)"><ellipse cy="39" rx="66" ry="9" fill="#96ad8220"/><rect x="-50" y="-8" width="100" height="50" rx="4" fill="#edcf9b"/><path d="M-58-8h116l-9-28h-98Z" fill="#f2b6c6"/><path d="M-34-36v28m23-28v28m23-28v28m23-28v28" stroke="#fff0e8" stroke-width="14"/><path d="M-58-8q12 15 23 0 12 15 23 0 12 15 23 0 12 15 23 0 12 15 24 0" fill="#e39bb1"/><rect x="-41" y="10" width="82" height="18" rx="4" fill="#fff7e1"/><circle cx="-24" cy="17" r="8" fill="#b1c38e"/><circle cx="-10" cy="17" r="8" fill="#d58e88"/><circle cx="6" cy="17" r="8" fill="#e8bd66"/><path d="M-47 42v7m94-7v7" stroke="#9d8561" stroke-width="4"/></g><g transform="translate(677 288)"><path d="M-50-9h90v49h-90Z" fill="#c5b38a"/><path d="M-56-11h102" stroke="#a6936d" stroke-width="6" stroke-linecap="round"/><path d="M-30 30V-6m24 36V-6m24 36V-6" stroke="#e8d4a6" stroke-width="13"/><path d="M-27-8v-24m21 24v-38m25 38v-24" stroke="#79a07d" stroke-width="3"/><g fill="#dc9daf"><circle cx="-27" cy="-36" r="10"/><circle cx="-5" cy="-50" r="11"/></g><circle cx="20" cy="-36" r="10" fill="#edcc78"/><g fill="#fff0ad"><circle cx="-27" cy="-36" r="4"/><circle cx="-5" cy="-50" r="4"/></g><circle cx="20" cy="-36" r="4" fill="#b18d3e"/></g><g transform="translate(389 280)"><path d="M-32 0h64v8h-64Zm-24 15h48v7h-48Z" fill="#c6a77a"/><path d="M-24 8v17M24 8v17M-17 22v23m34-23v23" stroke="#a9926d" stroke-width="4"/><path d="M-17 27h34" stroke="#a9926d" stroke-width="3"/></g><g fill="#b9cda5"><ellipse cx="213" cy="111" rx="24" ry="13"/><ellipse cx="249" cy="406" rx="36" ry="13"/><ellipse cx="529" cy="393" rx="31" ry="16"/><ellipse cx="728" cy="423" rx="37" ry="13"/></g><g fill="#dfb4bf"><circle cx="226" cy="105" r="4"/><circle cx="246" cy="399" r="4"/><circle cx="518" cy="388" r="4"/></g><g stroke="#93ae83" stroke-width="2" stroke-linecap="round"><path d="m72 240 3-7 3 7m232-133 3-7 3 7m217 48 3-7 3 7m-40 213 3-7 3 7M97 438l3-7 3 7m641-205 3-7 3 7"/></g><g transform="translate(309 64) rotate(10)"><path d="M0 0q7-10 12 0Q4 3 0 0m12 0q7-8 10-2" stroke="#7f9582" stroke-width="2" fill="none"/></g><g transform="translate(567 197)"><path d="M0 0v26m-11-18h22" stroke="#ad9470" stroke-width="3"/><path d="M-17-4h30l8 7-8 7h-30Z" fill="#f5db9c"/></g></svg>`}
let storageAvailable=true;
let state={version:1,completed:[],active:null};
function validRun(a) {
 if (!a || !Number.isInteger(a.id) || !missions[a.id]) return false;
 if (!['allocate','event','quiz','result'].includes(a.phase)) return false;
 if (!Array.isArray(a.alloc) || a.alloc.length !== 3 ||
     !a.alloc.every(n => Number.isInteger(n) && n >= 0 && n % 10 === 0)) return false;
 const total = a.alloc.reduce((sum, n) => sum + n, 0);
 if (total > missions[a.id].budget || (a.phase !== 'allocate' && total !== missions[a.id].budget)) return false;
 if (!Array.isArray(a.items) || !a.items.every(n => Number.isInteger(n) && !!missions[a.id].items?.[n]) ||
     new Set(a.items).size !== a.items.length) return false;
 if (a.choice !== null && !(Number.isInteger(a.choice) && missions[a.id].options?.[a.choice])) return false;
 if (typeof a.confirmed !== 'boolean' || typeof a.quizPassed !== 'boolean') return false;
 if (a.confirmed && !canResolve(a)) return false;
 if (a.phase === 'allocate' && (a.confirmed || a.quizPassed)) return false;
 if (['quiz','result'].includes(a.phase) && !a.confirmed) return false;
 if (a.quizPassed && !['quiz','result'].includes(a.phase)) return false;
 return a.phase !== 'result' || (a.quizPassed && typeof a.finishedAt === 'string' &&
   Number.isFinite(Date.parse(a.finishedAt)));
}
try{const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(raw&&raw.version===1&&Array.isArray(raw.completed)&&raw.completed.length<=missions.length&&raw.completed.every((r,i)=>r.id===i&&validRun(r)&&r.phase==='result'&&r.quizPassed)&&(!raw.active||validRun(raw.active)&&raw.active.id<=raw.completed.length)){state=raw;}}catch{storageAvailable=false;}
const screens = ['practice', 'collection', 'parents', 'game'];
let page = screens.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'map';
let parentAccess;
if (page === 'game' && !state.active) page = 'map';
const main=document.querySelector('main');
const modal=document.querySelector('#modal');
const storageNotice = document.createElement('p');
storageNotice.className = 'storage-note';
storageNotice.textContent = 'После закрытия страницы игра может начаться заново.';
let sceneElement = document.createElement('div');
main.append(storageNotice, sceneElement);
let modalTrigger = null;
let renderedScene;
modal.addEventListener('close', () => {
 (modalTrigger?.isConnected ? modalTrigger : main).focus({ preventScroll: true });
});
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{storageAvailable=false;}}
function announce(t){document.querySelector('#announce').textContent=t;}
function focusMain(){main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
function render(focus=true){
 if (focus && location.hash !== `#${page}`) history.pushState(null, '', `#${page}`);
 const view = page === 'practice' ? practiceView(icon)
   : page === 'collection' ? `<button class="back" data-nav="map">${icon('back')} В парк</button>${collectionView(state.completed, missions.length, icon, art)}`
   : page === 'parents' ? parentView()
   : page === 'game' ? gameView()
   : mapView({ missions, routes, state, selectedRoute, icon, park, mascot });
 const scene = page === 'game'
   ? `game:${state.active.id}:${state.active.phase}:${state.active.confirmed}`
   : page === 'practice' ? `practice:${practiceProgress().cursor}` : page;
 if (scene !== renderedScene) {
   const next = document.createElement('div');
   next.className = 'game-scene game-scene-enter';
   sceneElement.replaceWith(next);
   sceneElement = next;
   renderedScene = scene;
 }
 storageNotice.hidden = storageAvailable;
 sceneElement.innerHTML = view;
 const title = page === 'game' ? missions[state.active.id].title
   : page === 'parents' ? 'Родителям' : page === 'practice' ? 'Мастерская решений'
   : page === 'collection' ? 'Мои значки' : 'Парк маленьких открытий';
 document.title = `${title} · Коплю — Трачу — Помогаю`;
 if (focus) focusMain();
}
async function hasParentAccess() {
  try {
    const response = await fetch('/api/demo/parent', { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    return response.ok && (await response.json()).unlocked === true;
  } catch {
    return false;
  }
}
async function checkParentAccess() {
  parentAccess = undefined;
  render(false);
  parentAccess = await hasParentAccess();
  if (page === 'parents') render(false);
}
main.addEventListener('change', event => {
 if (event.target.id !== 'route-select') return;
 const index = Number(event.target.value);
 if (!routes[index]) return;
 selectedRoute = index;
 main.querySelector('#route-map').outerHTML = routePanel(routes[index], state.completed.length, missions.length, icon, park);
 announce(routes[index].title);
});
function start(id){if(!Number.isInteger(id)||id<0||id>Math.min(state.completed.length,missions.length-1))return;
 if(state.active&&state.active.id===id){selectedRoute=null;page='game';render();return;}
 if(state.active&&state.active.phase!=='result'){openModal('Начать другую историю?',`<p>Незавершённые решения в истории «${missions[state.active.id].title}» будут заменены. Пройденные истории сохранятся.</p><div class="dialog-actions"><button class="secondary" data-action="close">Остаться</button><button class="primary" data-action="replace" data-id="${id}">Начать другую</button></div>`);return;}
 newRun(id);
}
function newRun(id){selectedRoute=null;state.active={id,phase:'allocate',alloc:[0,0,0],items:[],choice:null,confirmed:false,quizPassed:false};persist();page='game';render();}
function current(){return state.active;}
function selectionCost(a) {
 const m=missions[a.id];
 return m.items ? a.items.reduce((sum,index)=>sum+m.items[index].price,0) : m.options[a.choice]?.[1] ?? 0;
}
function spent(a){return a.confirmed ? selectionCost(a) : 0;}
function allocatedBalance(a,index){
 return a.alloc[index]+(index===0?(missions[a.id].initial??0):0);
}
function balance(a,index){
 return allocatedBalance(a,index)-(index===missions[a.id].from?spent(a):0);
}
function hasSelection(a){
 return missions[a.id].items ? a.items.length>0 : a.choice!==null;
}
function canResolve(a){
 return hasSelection(a) && selectionCost(a)<=allocatedBalance(a,missions[a.id].from);
}
function chosen(a){
 const m=missions[a.id];
 return m.items ? a.items.map(i=>m.items[i].name) : m.options[a.choice][0];
}
function gameView() {
  const a = current();
  const m = missions[a.id];
  if (a.phase === 'result') return resultView(a);
  const step = ['allocate', 'event', 'quiz'].indexOf(a.phase);
  const title = [m.title, m.eventTitle, m.question][step];
  return `<div class="story-screen">
    <div class="game-head">
      <button class="back" data-nav="map">${icon('back')} В парк</button>
      <span class="story-step">Шаг ${step + 1} из 3</span>
    </div>
    <div class="game-title"><p class="story-number">История ${a.id + 1} из ${missions.length}</p><h1>${title}</h1></div>
    <section class="game-board" aria-label="Ход игры">
      ${[allocationView, eventView, quizView][step](a)}
    </section>
  </div>`;
}

function readyPlan(m) {
  if (m.plan) return [...m.plan];
  const cost = m.items
    ? m.items.filter(item => item.needed).reduce((sum, item) => sum + item.price, 0)
    : Math.max(...m.options.map(option => option[1]));
  const plan = [0, 0, 0];
  plan[m.from] = Math.min(m.budget, Math.max(0, Math.ceil((cost - (m.from === 0 ? m.initial ?? 0 : 0)) / 10) * 10));
  plan[m.from === 0 ? 1 : 0] = m.budget - plan[m.from];
  return plan;
}

function allocationView(a) {
  const m = missions[a.id];
  const remaining = m.budget - a.alloc.reduce((sum, coins) => sum + coins, 0);
  const plan = readyPlan(m);
  return `<div class="plan-intro">${art(m.art, 'scene-art')}<div><p>${m.intro}</p>
    <p class="plan-bank">Есть ещё ${m.budget} монет</p></div></div>
    <ul class="plan-pockets" aria-label="Готовый план">
      ${names.map((name, index) => `<li class="${cats[index]}"><span>${name}</span><strong>${plan[index]}</strong></li>`).join('')}
    </ul>
    <button class="primary" data-action="ready-plan">Играть с этим планом ${icon('arrow')}</button>
    <details class="play-disclosure manual-plan" ${a.alloc.some(Boolean) ? 'open' : ''}>
      <summary>Разложить монеты самому</summary>
      <p>Осталось монет <output id="remaining" aria-label="Осталось распределить">${remaining}</output>. Кнопки + и − меняют сумму на 10.</p>
      <div class="jars">${cats.map((category, index) => `<section class="jar-card ${category}">
        <h2>${names[index]}</h2><div class="counter">
          <button data-adjust="${index}" data-delta="-10" aria-label="Вернуть 10 монет из ${names[index]}" ${a.alloc[index] === 0 ? 'disabled' : ''}>−</button>
          <output id="alloc-${index}" aria-label="Положено в ${names[index]}">${a.alloc[index]}</output>
          <button data-adjust="${index}" data-delta="10" aria-label="Положить 10 монет в ${names[index]}" ${remaining === 0 ? 'disabled' : ''}>+</button>
        </div></section>`).join('')}</div>
      <button class="primary" data-action="allocation-next" ${remaining ? 'disabled' : ''}>План готов ${icon('arrow')}</button>
    </details>`;
}

function updateAllocation(index, delta) {
  const a = current();
  if (!a || a.phase !== 'allocate') return;
  const remaining = missions[a.id].budget - a.alloc.reduce((sum, coins) => sum + coins, 0);
  if (a.alloc[index] + delta < 0 || delta > remaining) return;
  a.alloc[index] += delta;
  persist();
  const next = remaining - delta;
  main.querySelector('#remaining').textContent = next;
  main.querySelector(`#alloc-${index}`).textContent = a.alloc[index];
  main.querySelectorAll('[data-adjust]').forEach(button => {
    button.disabled = Number(button.dataset.delta) > 0 ? next === 0 : a.alloc[Number(button.dataset.adjust)] === 0;
  });
  main.querySelector('[data-action="allocation-next"]').disabled = next !== 0;
  announce(`${names[index]}: ${a.alloc[index]}. Осталось монет: ${next}.`);
}

function eventView(a) {
  const m = missions[a.id];
  if (a.confirmed) {
    return `<div id="event-feedback" class="feedback event-result">${eventFeedback(a)}</div>
      <div class="action-row"><button class="primary" data-action="to-quiz">Дальше ${icon('arrow')}</button></div>`;
  }
  const content = m.items
    ? `<div class="shop-grid">${m.items.map((item, index) => `<button class="shop-item ${a.items.includes(index) ? 'selected' : ''}"
        data-item="${index}" aria-pressed="${a.items.includes(index)}">${icon(item.icon)}<strong>${item.name}</strong>
        <span class="price">${item.price} монет</span><span class="item-toggle">${a.items.includes(index) ? '✓ В корзине' : '+ В корзину'}</span></button>`).join('')}</div>
      <p class="receipt">В корзине: <strong>${selectionCost(a)} монет</strong></p>`
    : `<div class="choice-list">${m.options.map(([label, price, , image = m.art], index) => `<button
        class="choice ${a.choice === index ? 'selected' : ''}" data-choice="${index}" aria-pressed="${a.choice === index}">
        <span class="choice-art">${image === 'kite' ? art('kite') : icon(image)}</span><strong>${label}</strong><span class="price">${price} монет</span>
      </button>`).join('')}</div>`;
  return `<p class="event-prompt">${m.eventText}</p>
    <p class="event-budget"><span class="balance ${cats[m.from]}">${names[m.from]}: ${allocatedBalance(a, m.from)} монет</span></p>
    ${content}<div id="event-feedback" class="feedback error" role="status"></div>
    <div class="action-row">
      <button class="primary" data-action="confirm-event" ${!hasSelection(a) ? 'disabled' : ''}>Проверить выбор ${icon('arrow')}</button>
      <button class="text-button" data-action="replan">Изменить план</button>
    </div>`;
}
function eventFeedback(a){
 const m=missions[a.id];
 if(a.id>2){
  if(m.items){
   const missing=m.items.filter((item,index)=>item.needed&&!a.items.includes(index));
   const lesson=missing.length
     ? `В списке ещё есть: ${missing.map(item=>item.name.toLowerCase()).join(', ')}. ${m.aside}`
     : m.shopSuccess;
   return `<strong>${missing.length?'Сверим покупки со списком':'В корзине всё нужное'}</strong>${lesson} Осталось монет: ${balance(a,m.from)}.`;
  }
  return `<strong>${m.options[a.choice][0]}</strong>${m.options[a.choice][2]} В «${names[m.from]}» осталось монет: ${balance(a,m.from)}.`;
 }
 if (a.id === 0) {
  const saved = balance(a, 0);
  const lesson = saved >= 120
   ? '<strong>На воздушного змея хватает!</strong>'
   : `<strong>До змея осталось ${120 - saved} монет.</strong>`;
  return lesson + `В «Коплю» ${saved} монет. В «Трачу» осталось ${balance(a, 1)}.`;
 }
 if (a.id === 1) {
  const missing = m.items.filter((item, index) => item.needed && !a.items.includes(index));
  const lesson = missing.length
    ? `Для пикника ещё нужны: ${missing.map(item => item.name.toLowerCase()).join(', ')}.`
    : 'Для пикника всё готово!';
  return `<strong>${lesson}</strong>В «Трачу» осталось ${balance(a, 1)} монет.`;
 }
 return a.choice === 0
  ? '<strong>Семена куплены!</strong> Соседи смогут посадить цветы.'
  : '<strong>Ты помог саду!</strong> Соседям пригодилось твоё время.';
}
function quizView(a) {
  const m = missions[a.id];
  return `<div class="quiz-options">${m.answers.map((answer, index) => `<button
    class="quiz-option ${a.quizPassed && index === m.correct ? 'correct' : ''}"
    data-answer="${index}" ${a.quizPassed ? 'disabled' : ''}>${answer}</button>`).join('')}</div>
    <div id="quiz-feedback" class="feedback" role="status">${a.quizPassed ? '<strong>Верно!</strong>' + m.explanation : ''}</div>
    <div class="action-row"><button class="primary" data-action="finish" ${a.quizPassed ? '' : 'disabled'}>Закончить историю ${icon('arrow')}</button></div>`;
}

function resultView(a) {
  const m = missions[a.id];
  const title = earnedTitle(a.id, missions.length);
  const next = a.id + 1;
  return `<div class="story-screen"><button class="back" data-nav="map">${icon('back')} В парк</button>
    <section class="result">${art(m.art, 'big-art')}
      ${title ? `<p class="badge">Значок · ${title}</p>` : ''}
      <h1>${m.result}</h1><p>${m.explanation}</p>
      <div class="action-row">
        <button class="primary" ${next < missions.length ? `data-action="next-mission" data-id="${next}"` : 'data-nav="collection"'}>
          ${next < missions.length ? 'Следующая история' : 'Мои значки'} ${icon('arrow')}
        </button>
        <button class="secondary" data-action="replay" data-id="${a.id}">Сыграть ещё раз</button>
      </div>
      <details class="play-disclosure family-task"><summary>Попробовать дома</summary>
        <p>${m.family}</p><a class="back" href="/app/activities">К заданиям ${icon('arrow')}</a>
      </details>
    </section></div>`;
}
function parentView() {
  if (parentAccess === undefined) return '<p role="status">Проверяем доступ…</p>';
  if (!parentAccess) {
    return `<section class="parent-card story-screen"><h1>Прогресс в игре</h1>
      <p>Войдите в родительский режим, чтобы посмотреть результаты.</p>
      <p><a class="primary" href="/app/parent">Войти</a></p></section>`;
  }
  return `<div class="parent-page">
    <a class="back" href="/app/parent">${icon('back')} В родительский кабинет</a>
    <div class="intro"><h1>Прогресс в игре</h1></div>
    <section class="parent-card"><h2>Истории</h2>
      <p>Пройдено ${state.completed.length} из ${missions.length} историй.</p>
      ${state.completed.map(run => {
        const m = missions[run.id];
        const choice = m.items ? `Корзина: ${chosen(run).join(', ')}.` : `Выбор: ${chosen(run)}.`;
        return `<details class="history-row"><summary>${m.title}</summary>
          <p>${choice}</p><p>${m.talk}</p></details>`;
      }).join('')}
      <button class="secondary report-export" data-action="export">Скачать результаты</button>
    </section>
    <div class="danger-zone"><p>Прогресс игры хранится в этом браузере.</p>
      <button class="secondary" data-action="reset">Сбросить прогресс</button></div>
  </div>`;
}
function openModal(title,body){document.querySelector('#modal-content').innerHTML=`<h2 id="modal-title">${title}</h2>${body}`;modal.showModal();}
function showHelp() {
  openModal('Как играть?', `<p>Выбери план для монет. Затем реши, что сделать, и ответь на вопрос.</p>
    <p>Можно вернуться позже. Игровые монеты остаются в парке.</p>
    <button class="primary full" data-action="close">Понятно</button>`);
}
document.addEventListener('click',async e=>{
 const link = e.target.closest('.game-global-nav a, .header .brand');
 if (link && page === 'parents' && parentAccess) {
  e.preventDefault();
  modalTrigger = link;
  try {
   const response = await fetch('/api/demo/parent', { method: 'DELETE', signal: AbortSignal.timeout(8000) });
   if (response.ok || response.status === 401) {
    location.assign(link.href);
    return;
   }
  } catch {
   // Display a retryable message in the open report.
  }
  openModal('Кабинет пока открыт', '<p>Не удалось закрыть сессию. Попробуйте ещё раз.</p><button class="primary" data-action="close">Понятно</button>');
  return;
 }
 const b=e.target.closest('button');if(!b)return;
 if (!modal.open) modalTrigger = b;
 if(b.dataset.badge !== undefined){badgeDetails(Number(b.dataset.badge),state.completed,missions.length,openModal,icon);return;}
 if(b.dataset.practice || b.dataset.practiceAnswer !== undefined){handlePractice(b,render,announce);return;}
 if(b.classList.contains('close-modal')){modal.close();return;}
 if(b.dataset.nav){if(b.dataset.nav==='help'){showHelp();return;}page=b.dataset.nav;render();if(page==='parents')void checkParentAccess();return;}
 if(b.dataset.mission!==undefined){const id=Number(b.dataset.mission);if(id>state.completed.length){openModal('Сначала — предыдущее открытие',`<p>Пройди историю «${missions[id-1].title}», и это место откроется.</p><button class="primary full" data-action="close">Хорошо</button>`);return;}start(id);return;}
 if(b.dataset.adjust!==undefined){updateAllocation(Number(b.dataset.adjust),Number(b.dataset.delta));return;}
 const a=current();
 if(b.dataset.choice!==undefined&&a&&a.phase==='event'&&!a.confirmed){a.choice=Number(b.dataset.choice);persist();render(false);document.querySelector(`[data-choice="${a.choice}"]`).focus();return;}
 if(b.dataset.item!==undefined&&a&&a.phase==='event'&&!a.confirmed){const id=Number(b.dataset.item);a.items=a.items.includes(id)?a.items.filter(n=>n!==id):[...a.items,id];persist();render(false);document.querySelector(`[data-item="${id}"]`).focus();return;}
 if(b.dataset.answer!==undefined&&a&&a.phase==='quiz'&&!a.quizPassed){const n=Number(b.dataset.answer),m=missions[a.id];if(n===m.correct){a.quizPassed=true;persist();render(false);document.querySelector('[data-action="finish"]').focus();announce('Верно! '+m.explanation);}else{document.querySelectorAll('[data-answer]').forEach(x=>x.classList.remove('incorrect'));b.classList.add('incorrect');const f=document.querySelector('#quiz-feedback');f.className='feedback error';f.innerHTML='<strong>Попробуй ещё раз</strong>'+m.explanation;}return;}
 const action=b.dataset.action;if(!action)return;
 if(action==='close'){modal.close();return;}
 if(action==='start'){start(Number(b.dataset.id));return;}
 if(action==='resume'){selectedRoute=null;page='game';render();return;}
 if(action==='replace'){modal.close();newRun(Number(b.dataset.id));return;}
 if (['reset', 'confirm-reset', 'export'].includes(action)) {
  if (page !== 'parents' || !parentAccess) return;
  parentAccess = await hasParentAccess();
  if (page !== 'parents') return;
  if (!parentAccess) {
   if (modal.open) modal.close();
   render(false);
   return;
  }
 }
 if(action==='reset'){openModal('Сбросить прогресс?',`<p>Истории, тренировка и значки будут удалены из этого браузера. Записи семьи в копилке сохранятся. Это действие нельзя отменить.</p><div class="dialog-actions"><button class="secondary" data-action="close">Сохранить прогресс</button><button class="primary" data-action="confirm-reset">Сбросить</button></div>`);return;}
 if(action==='confirm-reset'){selectedRoute=null;state={version:1,completed:[],active:null};resetPractice();persist();modal.close();render();return;}
 if(action==='export'){const report={game:'Парк маленьких открытий',version:2,practice:{...practiceProgress(),topics:practiceProgress().mastered.map(id=>situations[id].title)},exportedAt:new Date().toISOString(),note:'Результаты игры не являются оценкой финансовой грамотности.',stories:state.completed.map(run=>({title:missions[run.id].title,allocated:Object.fromEntries(names.map((n,i)=>[n,run.alloc[i]])),remaining:Object.fromEntries(names.map((n,i)=>[n,balance(run,i)])),choice:chosen(run),finishedAt:run.finishedAt}))};const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='moi-otkrytiya.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
 if(!a)return;
 if(action==='ready-plan'&&a.phase==='allocate'){a.alloc=readyPlan(missions[a.id]);a.phase='event';persist();render();}
 else if(action==='allocation-next'&&a.phase==='allocate'&&a.alloc.reduce((s,n)=>s+n,0)===missions[a.id].budget){a.phase='event';persist();render();}
 else if(action==='replan'&&a.phase==='event'&&!a.confirmed){a.phase='allocate';a.choice=null;a.items=[];persist();render();}
 else if(action==='confirm-event'&&a.phase==='event'&&!a.confirmed){if(!canResolve(a)){
 const m=missions[a.id];
 const f=document.querySelector('#event-feedback');
 f.innerHTML=`<strong>На этот выбор не хватает монет</strong>Есть ${balance(a,m.from)} монет, а нужно ${selectionCost(a)}.`;
 announce(f.textContent);
 return;
}a.confirmed=true;persist();render(false);document.querySelector('[data-action="to-quiz"]').focus();announce('Решение сохранено. '+document.querySelector('#event-feedback').textContent);}
 else if(action==='to-quiz'&&a.phase==='event'&&a.confirmed){a.phase='quiz';persist();render();}
 else if(action==='finish'&&a.phase==='quiz'&&a.quizPassed){a.phase='result';a.finishedAt=new Date().toISOString();state.completed[a.id]=structuredClone(a);persist();render();}
 else if(action==='replay'&&a.phase==='result'){newRun(Number(b.dataset.id));}
 else if(action==='next-mission'&&a.phase==='result'){newRun(Number(b.dataset.id));}
});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});
window.addEventListener('popstate', () => {
 page = screens.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'map';
 if (page === 'game' && !state.active) page = 'map';
 if (modal.open) modal.close();
 if (page === 'parents') void checkParentAccess();
 else render(false);
 focusMain();
});
if (page === 'parents') void checkParentAccess();
else render(false);
window.addEventListener('pageshow', event => {
  if (event.persisted && page === 'parents') void checkParentAccess();
});
window.render_game_to_text = () => JSON.stringify({
 page, totalStories: missions.length, selectedRoute: page === 'map' ? main.querySelector('#route-select').value : null,
 active: state.active, completed: state.completed.map(run => run.id), practice: practiceProgress(),
 balances: state.active ? cats.map((_, index) => balance(state.active, index)) : [],
 storageAvailable, coordinates: 'DOM interface; origin top-left, x right, y down',
});
// Turn-based game: time never changes a decision or a balance.
window.advanceTime = () => Promise.resolve();
