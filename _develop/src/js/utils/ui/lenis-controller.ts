/*
Do you like smooth scrolling? See lenis-controller.ts
It is closer to native behavior than gsap, so it is better if only for smooth scrolling.


npm install lenis --save-dev
import LenisController from './utils/ui/lenis-controller';
new LenisController();
*/

//@ts-ignore
import Lenis from 'lenis';

export default class LenisController {
  private lenis: Lenis;
  constructor(private hasFixedHeader: boolean = false) {
    const styleSetting: string = `
      <style>
        html.lenis, html.lenis body {
          height: auto;
        }

        .lenis.lenis-smooth {
          scroll-behavior: auto !important;
        }

        .lenis.lenis-smooth [data-lenis-prevent] {
          overscroll-behavior: contain;
        }

        .lenis.lenis-stopped {
          overflow: hidden;
        }

        .lenis.lenis-scrolling iframe {
          pointer-events: none;
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styleSetting);

    this.lenis = new Lenis({
      smoothWheel: true,
    });
    requestAnimationFrame(this.raf);

    const anchorLink: HTMLElement[] = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));

    for (const elem of anchorLink) {
      elem.addEventListener('click', (e: MouseEvent) => {
        const target = e.target as HTMLAnchorElement | null;
        if (target) this.scrollTo(target.getAttribute('href')!);
      });
    }
    if (location.hash) this.scrollTo(location.hash);
  }

  private scrollTo = (target: string): void => {
    const offset: number = this.hasFixedHeader ? Number(document.querySelector('header')?.offsetHeight) * -1 : 0;
    this.lenis.scrollTo(target, { offset });
  };

  private raf = (time: number): void => {
    this.lenis.raf(time);
    requestAnimationFrame(this.raf);
  };
}
