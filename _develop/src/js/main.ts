import DeviceWatcher from './utils/logic/device-watcher';
import ScrollController from './utils/logic/scroll-controller';

new DeviceWatcher();
new ScrollController();

const normalizePathname = (pathname) => {
  if (pathname.endsWith('/index.html')) {
    return pathname.replace('/index.html', '/');
  }
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
};

const getComponent = async () => {
  const normalizedPath = normalizePathname(window.location.pathname);
  /*
    To avoid confusion, Unique JS names are better. [Under the esBuild environment]

    [bad]
      /index.ts
      /news/index.ts

    [good]
      /index.ts
      /news/news-index.ts
  */
  if (normalizedPath === '/practice/') {
    const module = await import('./pages/index/index');
    new module.default();
  }
  if (normalizedPath === '/engineer/yamamoto/practice/cover_flow/') {
    const module = await import('./pages/cover_flow/index');
    new module.default();
  }
  if (normalizedPath === '/engineer/yamamoto/practice/d3/') {
    const module = await import('./pages/d3/index');
    new module.default();
  }
  if (normalizedPath === '/engineer/yamamoto/practice/gsap01/') {
    const module = await import('./pages/gsap01/index');
    new module.default();
  }
  if (normalizedPath === '/engineer/yamamoto/practice/mock/') {
    const module = await import('./pages/mock/index');
    new module.default();
  }
};

export default class Main {
  constructor() {
    /*
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
        window.scrollTo(0,0);
      };
    */

    getComponent();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Main();
});
