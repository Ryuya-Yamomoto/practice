import gsap from 'gsap';
import { ScrollTrigger, ScrollToPlugin } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default class Gsap01 {
  private scrollContainer: HTMLElement | null = document.getElementById('scrollContainer');
  private pinContent: HTMLElement | null = document.getElementById('pinContent');

  private block01: HTMLElement | null = document.getElementById('block-01');
  private block02: HTMLElement | null = document.getElementById('block-02');

  private section01: HTMLElement | null = document.getElementById('section-01');
  private section02: HTMLElement | null = document.getElementById('section-02');

  constructor() {
    this.init();
  }

  init = () => {
    if (!(this.scrollContainer && this.pinContent && this.block01 && this.block02 && this.section01 && this.section02)) return;

    // clip-path circle 起点の座標を算出 ============================
    const point = document.getElementById('point') as HTMLElement;
    if (point) point.remove();

    const target = this.section01.querySelector('#clipPathTarget') as HTMLElement;

    if (target) {
      const point = document.createElement('span');
      point.id = 'point';
      point.style.position = 'absolute';
      point.style.top = '50%';
      point.style.left = '50%';
      point.style.width = '1px';
      point.style.height = '1px';
      point.style.backgroundColor = 'transparent';
      target.appendChild(point);

      // pointとsection01の座標距離を算出
      const pointRect = point.getBoundingClientRect();
      const section01Rect = this.section01.getBoundingClientRect();

      // 距離を計算
      const distanceX = pointRect.left - section01Rect.left;
      const distanceY = pointRect.top - section01Rect.top;

      // section02のカスタムプロパティに値を代入
      this.section02.style.setProperty('--circle-x', `${distanceX}`);
      this.section02.style.setProperty('--circle-y', `${distanceY}`);

      // スクロール 処理 ============================
      const scrollTriggerOptions: ScrollTrigger.StaticVars = {
        trigger: this.scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        pin: this.pinContent,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      };

      // section02 テキストをspanで区切る
      const section02Text = this.section02.querySelector('p');
      if (section02Text) {
        const textContent = section02Text.textContent || '';
        const wrappedText = textContent
          .split('')
          .map((char) => `<span class="char" style="display:inline-block">${char}</span>`)
          .join('');
        section02Text.innerHTML = wrappedText;
      }

      // ScrollTrigger生成
      ScrollTrigger.create(scrollTriggerOptions);

      // タイムラインの生成
      // block01 ============================
      const block01ScrollAmount = 2000;
      this.block01.style.height = `${block01ScrollAmount}px`; // スクロール量を確保
      const section01Heading = this.section01.querySelector('.heading');
      const section01Txt = this.section01.querySelector('.txt');
      const clipPathTarget = section01Heading?.querySelector('#clipPathTarget');
      const tlBlock01 = gsap.timeline({
        scrollTrigger: {
          trigger: this.block01,
          start: 'top top',
          end: `+=${block01ScrollAmount}`,
          scrub: 0.5,
          anticipatePin: 1,
        },
      });
      tlBlock01.to(section01Heading, { duration: 300, autoAlpha: 1, ease: 'power2.out' });
      tlBlock01.to(section01Txt, { duration: 300, autoAlpha: 1, ease: 'power2.out' }, '-=200');
      if (clipPathTarget) {
        tlBlock01.to(clipPathTarget, { duration: 300, scale: 0, rotate: -180, ease: 'power2.out' }, '-=50');
      }

      // block02 ============================
      const block2ScrollAmount = 8000;
      this.block02.style.height = `${block2ScrollAmount}px`; // スクロール量を確保
      const section02P = this.section02.querySelector('p');
      const section02Chars = Array.from(section02P?.querySelectorAll('.char') || []);
      const tlBlock02 = gsap.timeline({
        scrollTrigger: {
          trigger: this.block02,
          start: 'top top',
          end: `+=${block2ScrollAmount}`,
          scrub: 0.5,
          anticipatePin: 1,
        },
      });
      tlBlock02
        .to(this.section02, {
          '--circle-size': 120,
          duration: 1000,
        })
        .to(
          section02P,
          {
            duration: 500,
            x: '-50%',
            ease: 'power2.out',
          },
          '<',
        );
      [...section02Chars].reverse().forEach((char, _) => {
        tlBlock02.to(char, { duration: 100, autoAlpha: 0, x: 100, filter: `blur(20px)`, ease: 'power2.out' }, '-=90');
      });

      // タイムライン全体を8000に合わせるためのダミー
      tlBlock02.to({}, { duration: 200 });
    }
  };
}
