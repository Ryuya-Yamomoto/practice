/*
少数・整数対応、画面に入ったらとにかくカウントアップするもの。
pでもdivでもspanでも何でも良い

.intersect-count(data-count="42.5") 0
.intersect-count(data-count="100") 0

カンマいる場合（値段等） 1,000表記
span.count.intersect-count(data-count="1977", data-comma="true") 0

*/
export default class IntersectCount {
  constructor() {
    const strongElements = document.querySelectorAll('.intersect-count') as NodeListOf<HTMLElement>;
    if (strongElements.length > 0) {
      new CountUpOnIntersect(Array.from(strongElements));
    }
  }
}

class CountUpOnIntersect {
  private observer: IntersectionObserver | null = null;
  constructor(private targets: HTMLElement[]) {
    this.observer = new IntersectionObserver(this.handleIntersect, {
      threshold: 1,
    });

    this.targets.forEach((target) => {
      target.textContent = '0';
      this.observer?.observe(target);
    });
  }

  private countUp = (target: HTMLElement, targetCount: number, digitLength: number, decimalLength: number): void => {
    let currentCount = 0;
    const interval = 30;
    const step = targetCount / 50;

    const timer = setInterval(() => {
      currentCount += step;
      if (currentCount >= targetCount) {
        currentCount = targetCount;
        clearInterval(timer);
      }
      const needsCount = target.dataset.comma ? true : false;
      target.textContent = this.formatNumber(currentCount, digitLength, decimalLength, needsCount);
    }, interval);
  };

  private formatNumber = (number: number, digitLength: number, decimalLength: number, needsCount: boolean = false): string => {
    const [integerPart, decimalPart] = number.toFixed(decimalLength).split('.');
    const formattedInteger = this.addCommas(integerPart, needsCount).padStart(digitLength, '0');
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  private addCommas = (numStr: string, needsCount: boolean): string => {
    if (needsCount) return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    else return numStr;
  };

  private handleIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver): void => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLElement;
        const targetCount = parseFloat(target.dataset.count || '0');
        const targetCountStr = target.dataset.count || '0';
        const digitLength = targetCountStr.split('.')[0].length;
        const decimalLength = targetCountStr.split('.')[1]?.length || 0;

        this.countUp(target, targetCount, digitLength, decimalLength);
        observer.unobserve(target);
      }
    });
  };
}
