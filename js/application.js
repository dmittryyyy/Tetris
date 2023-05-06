import { Application } from 'stimulus';

// import your controllers
import {
  TetrisController,
  BasementFactController,
} from './controllers';

// connection your controllers
const application = Application.start();
application.register('tetris', TetrisController);
application.register('facts', BasementFactController);

document.addEventListener('turbo:click', () => {
  document.body.classList.add('turbolinks--loading');
});

const addOverlay = (body) => body.classList.add('turbolinks--loading');

document.addEventListener('turbo:before-render', (event) => addOverlay(event.detail.newBody));
window.addEventListener('popstate', () => addOverlay(document.body));

document.addEventListener('turbo:render', () => {
  window.requestAnimationFrame(() => document.body.classList.remove('turbolinks--loading'));
});
